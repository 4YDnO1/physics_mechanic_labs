import { useEffect, useState } from 'react'

const PREFIX = 'physics-mechanic-labs:v1:'
const alwaysValid = () => true

function readStored(key, fallback, isValid) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    if (raw === null) return fallback
    const value = JSON.parse(raw)
    return isValid(value) ? value : fallback
  } catch {
    return fallback
  }
}

export function usePersistentState(key, initialValue, isValid = alwaysValid) {
  const [value, setValue] = useState(() => {
    const fallback = typeof initialValue === 'function' ? initialValue() : initialValue
    return readStored(key, fallback, isValid)
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    } catch {
      return
    }
  }, [key, value])

  return [value, setValue]
}

export function useLabState(labKey, versions = [], options = {}) {
  const { indexed = false } = options
  const [rows, setRows] = usePersistentState(`${labKey}:rows`, [], Array.isArray)
  const [version, setVersion] = usePersistentState(
    `${labKey}:version`,
    versions[0]?.key ?? null,
    (v) => (versions.length ? versions.some((item) => item.key === v) : v === null),
  )

  const addRow = (row) => setRows((prev) => [...prev, indexed ? { ...row, i: prev.length + 1 } : row])
  const clearRows = () => setRows([])
  const changeVersion = (v) => {
    if (v === version) return
    clearRows()
    setVersion(v)
  }

  return { rows, version, addRow, clearRows, changeVersion }
}
