const TABLE_URL = 'https://backend.jotish.in/backend_dev/gettabledata.php'

export async function fetchEmployees() {
  const res = await fetch(TABLE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'test', password: '123456' }),
  })

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`)
  }

  const data = await res.json()
  // pehle console.log se check kar lena actual structure
  return Array.isArray(data) ? data : data?.rows ?? []
}