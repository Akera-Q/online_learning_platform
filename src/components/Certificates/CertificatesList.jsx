import React, { useEffect, useState } from 'react'
import api from '../../services/api'
import Spinner from '../Spinner/Spinner'
import { formatDate } from '../../utils/helpers'

const CertificatesList = () => {
  const [certs, setCerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchCerts = async () => {
    try {
      setLoading(true)
      const res = await api.get('/certificates')
      setCerts(res.data.data || [])
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load certificates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCerts() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return
    try {
      await api.delete(`/certificates/${id}`)
      setCerts(prev => prev.filter(c => c._id !== id))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete certificate')
    }
  }

  if (loading) return <div className="flex items-center justify-center"><Spinner size={12} /></div>
  if (error) return <div className="text-red-600">{error}</div>

  if (!certs.length) return <div className="text-gray-600">No certificates uploaded yet.</div>

  return (
    <div className="space-y-4">
      {certs.map(c => (
        <div key={c._id} className="flex items-center justify-between border rounded p-3">
          <div>
            <div className="font-semibold">{c.course?.title || 'Course'}</div>
            <div className="text-sm text-gray-500">Issued: {formatDate(c.createdAt)}</div>
          </div>
          <div className="flex items-center space-x-3">
            <a href={c.downloadUrl || `/api/certificates/${c._id}/download`} target="_blank" rel="noreferrer" className="text-blue-600 underline">Download</a>
            <button className="text-sm text-red-600" onClick={() => handleDelete(c._id)}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default CertificatesList
