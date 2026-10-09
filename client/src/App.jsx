import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

// React UI/state -> Axios -> Express routes -> Mongoose Student model -> MongoDB.
const API_URL = import.meta.env.VITE_API_URL ||'http://localhost:5000/students'

function getRequestErrorMessage(requestError) {
  return requestError.response?.data?.message || requestError.message || 'The request could not be completed.'
}

async function requestStudents(url, options) {
  try {
    const response = await axios({
      url,
      ...options,
    })
    return response.data
  } catch (requestError) {
    throw new Error(getRequestErrorMessage(requestError), { cause: requestError })
  }
}

function App() {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ name: '', course: '', age: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadStudents = useCallback(async () => {
    try {
      const data = await requestStudents(API_URL, { method: 'GET' })
      setStudents(data)
      setError('')
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isCurrent = true

    requestStudents(API_URL, { method: 'GET' })
      .then((data) => {
        if (isCurrent) {
          setStudents(data)
          setError('')
        }
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError.message)
      })
      .finally(() => {
        if (isCurrent) setLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')

    const student = { ...form, age: Number(form.age) }
    const isEditing = editingId !== null

    try {
      await requestStudents(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? 'PUT' : 'POST',
          data: student,
        },
      )
      setForm({ name: '', course: '', age: '' })
      setEditingId(null)
      await loadStudents()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function startEditing(student) {
    setForm({
      name: student.name,
      course: student.course,
      age: String(student.age),
    })
    setEditingId(student._id)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEditing() {
    setForm({ name: '', course: '', age: '' })
    setEditingId(null)
    setError('')
  }

  async function deleteStudent(id) {
    setError('')

    try {
      await requestStudents(`${API_URL}/${id}`, { method: 'DELETE' })
      await loadStudents()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="page-shell">
      <header className="page-header">
        <h1>Student Management</h1>
      </header>

      <section className="content-grid" aria-label="Student management">
        <form className="panel student-form" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <h2>{editingId ? 'Update Student' : 'Add Student'}</h2>
            </div>
          </div>

          <label htmlFor="student-name">Name</label>
          <input
            id="student-name"
            name="name"
            placeholder="e.g. Juan Dela Cruz"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="student-course">Course</label>
          <input
            id="student-course"
            name="course"
            placeholder="e.g. BSIT"
            value={form.course}
            onChange={handleChange}
            required
          />

          <label htmlFor="student-age">Age</label>
          <input
            id="student-age"
            name="age"
            type="number"
            min="1"
            max="120"
            placeholder="e.g. 20"
            value={form.age}
            onChange={handleChange}
            required
          />

          <div className="form-actions">
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update Student' : 'Add Student'}
            </button>
            {editingId && (
              <button className="text-button" type="button" onClick={cancelEditing}>
                Cancel
              </button>
            )}
          </div>
          {error && <p className="error-message" role="alert">{error}</p>}
        </form>

        <section className="panel students-panel">
          <div className="panel-heading list-heading">
            <div>
              <h2>Students</h2>
            </div>
            <span className="student-count" aria-label={`${students.length} students`}>{students.length}</span>
          </div>

          {loading ? (
            <p className="empty-state">Loading student records…</p>
          ) : students.length === 0 ? (
            <p className="empty-state">No students yet. Add your first student using the form.</p>
          ) : (
            <ul className="student-list">
              {students.map((student) => (
                <li className="student-card" key={student._id}>
                  <div className="student-details">
                    <h3>{student.name}</h3>
                    <p>{student.course} <span>·</span> Age {student.age}</p>
                  </div>
                  <div className="student-actions">
                    <button type="button" className="text-button" onClick={() => startEditing(student)}>
                      Edit
                    </button>
                    <button type="button" className="delete-button" onClick={() => deleteStudent(student._id)}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

export default App;
