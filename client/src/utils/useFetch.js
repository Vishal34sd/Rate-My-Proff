import { useCallback, useEffect, useRef, useState } from 'react'
import axios from 'axios'

import { getToken } from './auth'

function buildAuthHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : undefined
}

/**
 * Simple GET hook for fetching JSON data.
 *
 * @param {string|null} url
 * @param {{ enabled?: boolean, initialData?: any, withAuth?: boolean }} options
 */
export default function useFetch(url, options = {}) {
  const { enabled = true, initialData = null, withAuth = true } = options

  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(Boolean(enabled && url))
  const [error, setError] = useState('')

  const requestSeq = useRef(0)
  const controllerRef = useRef(null)

  const run = useCallback(async () => {
    if (!enabled || !url) return

    const seq = ++requestSeq.current
    if (controllerRef.current) {
      controllerRef.current.abort()
    }
    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    setError('')

    try {
      const res = await axios.get(url, {
        signal: controller.signal,
        headers: withAuth ? buildAuthHeaders() : undefined,
      })

      if (requestSeq.current !== seq) return
      setData(res.data)
    } catch (err) {
      // Ignore abort/cancel
      const name = err?.name
      const code = err?.code
      if (name === 'CanceledError' || code === 'ERR_CANCELED') return

      if (requestSeq.current !== seq) return
      setError(err?.response?.data?.message || err?.message || 'Request failed.')
    } finally {
      if (requestSeq.current === seq) setLoading(false)
    }
  }, [enabled, url, withAuth])

  useEffect(() => {
    run()

    return () => {
      if (controllerRef.current) controllerRef.current.abort()
    }
  }, [run])

  const refetch = useCallback(() => {
    run()
  }, [run])

  return { data, loading, error, refetch, setData }
}
