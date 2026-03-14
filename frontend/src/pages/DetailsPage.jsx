import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { fetchEmployees } from '../api/tableApi.js'

const AUDIT_STORAGE_KEY = 'employee-dashboard-audit-image'

export default function DetailsPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState(location.state?.employee || null)
  const [loading, setLoading] = useState(!location.state?.employee)
  const [error, setError] = useState('')

  // camera + capture state
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const photoCanvasRef = useRef(null)
  const signCanvasRef = useRef(null)

  const [cameraOn, setCameraOn] = useState(false)
  const [captured, setCaptured] = useState(false)

  // signature drawing state
  const drawingRef = useRef(false)
  const lastPtRef = useRef({ x: 0, y: 0 })

  // ---- load employee fallback (direct URL hit)
  useEffect(() => {
    if (employee) return

    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const data = await fetchEmployees()
        if (cancelled) return
        let found =
          data.find((row) => String(row.id) === String(id)) ?? null

        // Fallback: if there is no stable id field and we navigated with row index
        if (!found) {
          const numeric = Number(id)
          if (!Number.isNaN(numeric) && numeric >= 0 && numeric < data.length) {
            found = data[numeric]
          }
        }
        if (!found) setError('Employee not found')
        setEmployee(found)
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load employee')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [employee, id])

  // ---- start/stop camera
  async function startCamera() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
      setCameraOn(true)
    } catch (e) {
      setError('Camera permission denied / not available.')
    }
  }

  function stopCamera() {
    const stream = streamRef.current
    if (stream) {
      stream.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setCameraOn(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- canvas sizing helpers
  function ensureCanvasSize() {
    const photo = photoCanvasRef.current
    const sign = signCanvasRef.current
    const video = videoRef.current
    if (!photo || !sign) return

    // If we already captured, keep current size
    if (captured) return

    // Use video actual size if available else fallback
    const w = video?.videoWidth || 640
    const h = video?.videoHeight || 480

    if (photo.width !== w) photo.width = w
    if (photo.height !== h) photo.height = h
    if (sign.width !== w) sign.width = w
    if (sign.height !== h) sign.height = h

    const ctx = sign.getContext('2d')
    if (ctx) {
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.strokeStyle = 'rgba(255,255,255,0.95)'
    }
  }

  // when video metadata loads, size canvases
  function onVideoReady() {
    ensureCanvasSize()
  }

  function capturePhoto() {
    const video = videoRef.current
    const photo = photoCanvasRef.current
    const sign = signCanvasRef.current
    if (!video || !photo || !sign) return

    ensureCanvasSize()

    const ctx = photo.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, photo.width, photo.height)

    // clear signature canvas
    const sctx = sign.getContext('2d')
    if (sctx) {
      sctx.clearRect(0, 0, sign.width, sign.height)
    }

    setCaptured(true)
    stopCamera()
  }

  function clearSignature() {
    const sign = signCanvasRef.current
    if (!sign) return
    const ctx = sign.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, sign.width, sign.height)
  }

  // ---- pointer mapping
  function getPointFromEvent(e) {
    const canvas = signCanvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    // scale to canvas resolution
    const x = ((clientX - rect.left) / rect.width) * canvas.width
    const y = ((clientY - rect.top) / rect.height) * canvas.height
    return { x, y }
  }

  function pointerDown(e) {
    e.preventDefault()
    if (!captured) return
    drawingRef.current = true
    lastPtRef.current = getPointFromEvent(e)
  }

  function pointerMove(e) {
    e.preventDefault()
    if (!captured) return
    if (!drawingRef.current) return

    const canvas = signCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pt = getPointFromEvent(e)
    const last = lastPtRef.current

    ctx.beginPath()
    ctx.moveTo(last.x, last.y)
    ctx.lineTo(pt.x, pt.y)
    ctx.stroke()

    lastPtRef.current = pt
  }

  function pointerUp(e) {
    e.preventDefault()
    drawingRef.current = false
  }

  function mergeAndGoAnalytics() {
    const photo = photoCanvasRef.current
    const sign = signCanvasRef.current
    if (!photo || !sign) return

    const out = document.createElement('canvas')
    out.width = photo.width
    out.height = photo.height
    const octx = out.getContext('2d')
    if (!octx) return

    octx.drawImage(photo, 0, 0)
    octx.drawImage(sign, 0, 0)

    const dataUrl = out.toDataURL('image/png')
    localStorage.setItem(AUDIT_STORAGE_KEY, dataUrl)

    navigate('/analytics', { state: { auditImage: dataUrl, employeeId: id } })
  }

  const employeeSummary = useMemo(() => {
    if (!employee) return null
    return {
      id: employee.id,
      name: employee.name,
      city: employee.city,
      salary: employee.salary,
    }
  }, [employee])

  if (loading) return <div className="text-slate-200">Loading employee details…</div>

  if (error || !employee) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        {error || 'Employee not found for this id.'}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-slate-100">Identity Verification</h1>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-lg shadow-black/30 p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">ID</span>
          <span className="font-mono text-slate-100">{employeeSummary?.id}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Name</span>
          <span className="text-slate-100">{employeeSummary?.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">City</span>
          <span className="text-slate-100">{employeeSummary?.city}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Salary</span>
          <span className="text-slate-100">{employeeSummary?.salary}</span>
        </div>
      </div>

      {error && (
        <div className="text-red-400 text-sm border border-red-500/30 bg-red-950/40 rounded px-3 py-2">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 shadow-lg shadow-black/30 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-100">Camera</h2>
            <p className="text-xs text-slate-400">
              Start camera → capture → sign on the photo.
            </p>
          </div>

          <div className="flex gap-2">
            {!cameraOn && !captured && (
              <button
                className="rounded bg-indigo-600 px-3 py-2 text-sm hover:bg-indigo-500"
                onClick={startCamera}
              >
                Start camera
              </button>
            )}
            {cameraOn && (
              <button
                className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800/80 transition-colors"
                onClick={stopCamera}
              >
                Stop
              </button>
            )}
            {cameraOn && (
              <button
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 active:bg-emerald-700 transition-colors"
                onClick={capturePhoto}
              >
                Capture
              </button>
            )}
            {captured && (
              <button
                className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800/80 transition-colors"
                onClick={() => {
                  setCaptured(false)
                  clearSignature()
                }}
              >
                Retake
              </button>
            )}
          </div>
        </div>

        {!captured && (
          <div className="rounded-lg overflow-hidden border border-slate-800 bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              onLoadedMetadata={onVideoReady}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* When captured: show photo canvas + signature overlay */}
        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black">
          <canvas ref={photoCanvasRef} className={captured ? 'w-full h-auto block' : 'hidden'} />
          <canvas
            ref={signCanvasRef}
            className={captured ? 'absolute inset-0 w-full h-full' : 'hidden'}
            onMouseDown={pointerDown}
            onMouseMove={pointerMove}
            onMouseUp={pointerUp}
            onMouseLeave={pointerUp}
            onTouchStart={pointerDown}
            onTouchMove={pointerMove}
            onTouchEnd={pointerUp}
          />
          {captured && (
            <div className="absolute left-3 bottom-3 text-xs text-slate-200 bg-slate-950/70 border border-slate-700 rounded px-2 py-1">
              Sign here (mouse/touch)
            </div>
          )}
        </div>

        {captured && (
          <div className="flex items-center justify-between gap-3">
            <button
              className="inline-flex items-center justify-center rounded-md border border-slate-600 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800/80 transition-colors"
              onClick={clearSignature}
            >
              Clear signature
            </button>
            <button
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
              onClick={mergeAndGoAnalytics}
            >
              Merge & Continue
            </button>
          </div>
        )}
      </div>
    </div>
  )
}