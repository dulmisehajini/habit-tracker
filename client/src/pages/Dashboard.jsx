import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function Dashboard() {
  const [habits, setHabits] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))

  const headers = { Authorization: `Bearer ${token}` }

  // fetch all habits
  const fetchHabits = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/habits', { headers })
      setHabits(res.data)
    } catch (err) {
      setError('Failed to load habits')
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  // create habit
  const createHabit = async () => {
    if (!name) return
    try {
      await axios.post('http://localhost:3000/api/habits', { name, description }, { headers })
      setName('')
      setDescription('')
      fetchHabits()
    } catch (err) {
      setError('Failed to create habit')
    }
  }

  // delete habit
  const deleteHabit = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/habits/${id}`, { headers })
      fetchHabits()
    } catch (err) {
      setError('Failed to delete habit')
    }
  }

  // mark habit as done today
  const logHabit = async (id) => {
    try {
      await axios.post(`http://localhost:3000/api/habits/${id}/log`, {}, { headers })
      alert('Habit marked as done today! 🔥')
    } catch (err) {
      alert('Already marked as done today!')
    }
  }

  // logout
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>🔥 HabitFlow</h1>
        <div style={styles.headerRight}>
          <span style={styles.username}>👋 {user?.username}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      <div style={styles.content}>
        {/* Create habit form */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Add a new habit</h2>
          {error && <p style={styles.error}>{error}</p>}
          <input
            style={styles.input}
            type="text"
            placeholder="Habit name (e.g. Drink water)"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            style={styles.input}
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
          <button style={styles.addBtn} onClick={createHabit}>
            + Add Habit
          </button>
        </div>

        {/* Habits list */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            Your habits
            <span style={styles.count}>{habits.length} total</span>
          </h2>
          {habits.length === 0 ? (
            <p style={styles.empty}>No habits yet. Add your first one above!</p>
          ) : (
            habits.map(habit => (
              <div key={habit.id} style={styles.habitCard}>
                <div style={styles.habitInfo}>
                  <p style={styles.habitName}>{habit.name}</p>
                  {habit.description && (
                    <p style={styles.habitDesc}>{habit.description}</p>
                  )}
                </div>
                <div style={styles.habitActions}>
                  <button
                    style={styles.doneBtn}
                    onClick={() => logHabit(habit.id)}
                  >
                    ✅ Done
                  </button>
                  <button
                    style={styles.deleteBtn}
                    onClick={() => deleteHabit(habit.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f0f0f',
    color: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    borderBottom: '1px solid #222',
    background: '#1a1a1a',
  },
  logo: {
    margin: 0,
    fontSize: '22px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  username: {
    color: '#aaa',
    fontSize: '14px',
  },
  logoutBtn: {
    padding: '6px 14px',
    borderRadius: '6px',
    border: '1px solid #333',
    background: 'transparent',
    color: '#aaa',
    cursor: 'pointer',
    fontSize: '13px',
  },
  content: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '0 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  card: {
    background: '#1a1a1a',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  cardTitle: {
    margin: 0,
    fontSize: '18px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  count: {
    fontSize: '13px',
    color: '#aaa',
    fontWeight: 400,
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#2a2a2a',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  addBtn: {
    padding: '10px',
    borderRadius: '8px',
    border: 'none',
    background: '#22c55e',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  habitCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '8px',
    background: '#2a2a2a',
    gap: '12px',
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 500,
  },
  habitDesc: {
    margin: '4px 0 0',
    fontSize: '12px',
    color: '#aaa',
  },
  habitActions: {
    display: 'flex',
    gap: '8px',
  },
  doneBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: '#166534',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  deleteBtn: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: 'none',
    background: '#7f1d1d',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
  },
  empty: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: '14px',
  },
  error: {
    color: '#ef4444',
    fontSize: '13px',
    margin: 0,
  }
}

export default Dashboard