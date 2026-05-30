import React, { useState, useEffect } from "react"
import api from "../../services/api"
import Spinner from "../Spinner/Spinner"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", role: "" })
  const [userCerts, setUserCerts] = useState([])
  const [certsLoading, setCertsLoading] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/users?search=${encodeURIComponent(search)}`)
      setUsers(res.data.data || [])
    } catch (err) {
      console.error("Failed to fetch users", err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const viewUser = async (id) => {
    try {
      const res = await api.get(`/users/${id}`)
      setSelectedUser(res.data.data)
      setEditingId(null)
    } catch (err) {
      alert("Failed to load user")
    }
  }

  const fetchUserCerts = async (userId) => {
    try {
      setCertsLoading(true)
      setUserCerts([])
      const res = await api.get(`/certificates?userId=${userId}`)
      setUserCerts(res.data.data || [])
    } catch (err) {
      alert('Failed to load certificates')
    } finally {
      setCertsLoading(false)
    }
  }

  const startEdit = (u) => {
    setEditingId(u._id)
    setEditForm({ name: u.name || "", role: u.role || "student" })
    setSelectedUser(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: "", role: "" })
  }

  const submitEdit = async (id) => {
    try {
      if (!editForm.name || editForm.name.trim().length === 0) return alert("Full name is required")
      await api.put(`/users/${id}`, { name: editForm.name.trim(), role: editForm.role })
      await fetchUsers()
      alert("User updated")
      cancelEdit()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user")
    }
  }

  const toggleActive = async (u) => {
    try {
      if (u.isActive) {
        if (!window.confirm(`Deactivate user ${u.email}?`)) return
        await api.delete(`/users/${u._id}`)
        alert("User deactivated")
      } else {
        if (!window.confirm(`Reactivate user ${u.email}?`)) return
        await api.patch(`/users/${u._id}/active`, { active: true })
        alert("User reactivated")
      }
      await fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user state")
    }
  }

  return (
    <div className="mt-4">
      <div className="mb-3 flex gap-2">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email" className="flex-1 border rounded p-2" />
        <button onClick={fetchUsers} className="px-3 py-2 bg-gray-200 rounded">Refresh</button>
      </div>

      <div className="bg-white border rounded shadow-sm overflow-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-4 text-center"><div className="flex items-center justify-center"><Spinner size={12} /></div></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="p-4">No users</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className="border-t">

                <td className="p-2">
                  {editingId === u._id ? (
                    <input className="border rounded p-1 w-56" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                  ) : (
                    <div className="font-medium">{u.name}</div>
                  )}
                </td>

                <td className="p-2 text-sm text-gray-600">{u.email}</td>
                <td className="p-2">
                  {editingId === u._id ? (
                    <select className="border rounded p-1" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}>
                      <option value="student">student</option>
                      <option value="instructor">instructor</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    <span className="capitalize">{u.role}</span>
                  )}
                </td>
                <td className="p-2">
                  {u.isActive ? <span className="text-green-600">Active</span> : <span className="text-red-600">Inactive</span>}
                </td>
                <td className="p-2">
                  {editingId === u._id ? (
                    <div className="flex gap-2">
                      <button onClick={() => submitEdit(u._id)} className="px-2 py-1 bg-blue-600 text-white rounded">Save</button>
                      <button onClick={cancelEdit} className="px-2 py-1 bg-gray-200 rounded">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => viewUser(u._id)} className="px-2 py-1 bg-gray-100 rounded">View</button>
                      <button onClick={() => startEdit(u)} className="px-2 py-1 bg-yellow-100 rounded">Edit</button>
                      <button onClick={() => toggleActive(u)} className={`px-2 py-1 rounded ${u.isActive ? 'bg-red-100' : 'bg-green-100'}`}>{u.isActive ? 'Deactivate' : 'Reactivate'}</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="mt-4 bg-white rounded shadow p-4">
          <h3 className="text-lg font-semibold">User Details</h3>
          <div className="mt-2">
            <div><strong>Name:</strong> {selectedUser.name}</div>
            <div><strong>Email:</strong> {selectedUser.email}</div>
            <div><strong>Role:</strong> {selectedUser.role}</div>
            <div><strong>Active:</strong> {selectedUser.isActive ? 'Yes' : 'No'}</div>
            <div><strong>Created:</strong> {new Date(selectedUser.createdAt).toLocaleString()}</div>
            <div className="mt-2 flex gap-2">
              <button onClick={() => { setSelectedUser(null) }} className="px-3 py-1 bg-gray-200 rounded">Close</button>
              <button onClick={() => fetchUserCerts(selectedUser._id)} className="px-3 py-1 bg-blue-600 text-white rounded">View Certificates</button>
            </div>

            {certsLoading ? (
              <div className="mt-2">Loading certificates...</div>
            ) : userCerts && userCerts.length > 0 ? (
              <div className="mt-4 border-t pt-3">
                <h4 className="font-semibold mb-2">Certificates</h4>
                <ul className="space-y-2">
                  {userCerts.map(c => (
                    <li key={c._id} className="p-2 border rounded flex items-center justify-between">
                      <div>
                        <div className="font-medium">{c.course ? c.course.title : 'Course'}</div>
                        <div className="text-sm text-gray-600">{c.filename} {c.certificateId ? (<span className="ml-2 text-xs text-gray-700">ID: <code>{c.certificateId}</code></span>) : null}</div>
                      </div>
                      <div>
                        <a href={c.downloadUrl} className="px-3 py-1 bg-green-600 text-white rounded" target="_blank" rel="noreferrer">Download</a>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
