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
  console.log('TABLE API RAW RESPONSE:', data)
  // Try common shapes first, then fall back to first array value inside the object.

  // Special case: { TABLE_DATA: { data: [ [..6 cols..], ... ] } }
  if (Array.isArray(data?.TABLE_DATA?.data)) {
    const rows = data.TABLE_DATA.data
    return rows.map((row, index) => {
      // row is an array like [id, name, city, salary, ...]
      return {
        id: row[0] ?? index,
        name: row[1],
        city: row[2],
        salary: row[3],
        _raw: row,
      }
    })
  }

  if (Array.isArray(data?.TABLE_DATA)) return data.TABLE_DATA
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.rows)) return data.rows
  if (Array.isArray(data?.employees)) return data.employees

  if (data && typeof data === 'object') {
    for (const value of Object.values(data)) {
      if (Array.isArray(value)) return value
    }
  }

  return []
}