import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

// 7-day calendar component
function WeekCalendar({ last7Days }) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const done = last7Days.includes(dateStr)
    days.push({ dateStr, done, label: d.toLocaleDateString('en', { weekday: 'short' }) })
  }

  return (
    <div style={styles.calendar}>
      {days.map(day => (
        <div key={day.dateStr} style={styles.dayWrapper}>
          <div style={{
            ...styles.dayDot,
            background: day.done ? '#22c55e' : '#333'
          }} />
          <span style={styles.dayLabel}>{day.label}</span>
        </div>
      ))}
    </div>
  )
}

function Dashboard() {
  const [habits, setHabits] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const headers = { Authorization: `Bearer ${token}` }

  const fetchHabits = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/habits', { headers })
      setHabits(res.data)
    } catch (err) {
      setError('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

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

  const deleteHabit = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/habits/${id}`, { headers })
      fetchHabits()
    } catch (err) {
      setError('Failed to delete habit')
    }
  }

  const logHabit = async (id) => {
    try {
      await axios.post(`http://localhost:3000/api/habits/${id}/log`, {}, { headers })
      fetchHabits()
    } catch (err) {
      alert('Already marked as done today!')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  // calculate today's completed habits
  const today = new Date().toISOString().split('T')[0]
  const completedToday = habits.filter(h => h.last7Days?.includes(today)).length

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

        {/* Summary bar */}
        <div style={styles.summaryBar}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryNumber}>{completedToday}</span>
            <span style={styles.summaryLabel}>Done today</span>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <span style={styles.summaryNumber}>{habits.length}</span>
            <span style={styles.summaryLabel}>Total habits</span>
          </div>
          <div style={styles.summaryDivider} />
          <div style={styles.summaryItem}>
            <span style={styles.summaryNumber}>
              {habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0}%
            </span>
            <span style={styles.summaryLabel}>Today's rate</span>
          </div>
        </div>

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
            onKeyDown={e => e.key === 'Enter' && createHabit()}
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

          {loading ? (
            <p style={styles.empty}>Loading habits...</p>
          ) : habits.length === 0 ? (
            <p style={styles.empty}>No habits yet. Add your first one above!</p>
          ) : (
            habits.map(habit => {
              const doneToday = habit.last7Days?.includes(today)
              return (
                <div key={habit.id} style={styles.habitCard}>
                  <div style={styles.habitTop}>
                    <div style={styles.habitInfo}>
                      <p style={styles.habitName}>{habit.name}</p>
                      {habit.description && (
                        <p style={styles.habitDesc}>{habit.description}</p>
                      )}
                    </div>
                    <div style={styles.habitActions}>
                      <div style={styles.streakBadge}>
                        🔥 {habit.streak}
                      </div>
                      <button
                        style={{
                          ...styles.doneBtn,
                          background: doneToday ? '#14532d' : '#166534',
                          opacity: doneToday ? 0.7 : 1
                        }}
                        onClick={() => logHabit(habit.id)}
                        disabled={doneToday}
                      >
                        {doneToday ? '✅ Done' : '○ Mark done'}
                      </button>
                      <button
                        style={styles.deleteBtn}
                        onClick={() => deleteHabit(habit.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <WeekCalendar last7Days={habit.last7Days || []} />
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0f0f', color: '#fff' },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '1rem 2rem', borderBottom: '1px solid #222', background: '#1a1a1a'
  },
  logo: { margin: 0, fontSize: '22px' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  username: { color: '#aaa', fontSize: '14px' },
  logoutBtn: {
    padding: '6px 14px', borderRadius: '6px', border: '1px solid #333',
    background: 'transparent', color: '#aaa', cursor: 'pointer', fontSize: '13px'
  },
  content: { maxWidth: '640px', margin: '2rem auto', padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  summaryBar: {
    background: '#1a1a1a', borderRadius: '12px', padding: '1rem 2rem',
    display: 'flex', justifyContent: 'space-around', alignItems: 'center'
  },
  summaryItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  summaryNumber: { fontSize: '28px', fontWeight: 700, color: '#22c55e' },
  summaryLabel: { fontSize: '12px', color: '#aaa' },
  summaryDivider: { width: '1px', height: '40px', background: '#333' },
  card: {
    background: '#1a1a1a', borderRadius: '12px', padding: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '12px'
  },
  cardTitle: { margin: 0, fontSize: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  count: { fontSize: '13px', color: '#aaa', fontWeight: 400 },
  input: {
    padding: '10px 12px', borderRadius: '8px', border: '1px solid #333',
    background: '#2a2a2a', color: '#fff', fontSize: '14px', outline: 'none'
  },
  addBtn: {
    padding: '10px', borderRadius: '8px', border: 'none',
    background: '#22c55e', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
  },
  habitCard: {
    background: '#2a2a2a', borderRadius: '10px', padding: '12px',
    display: 'flex', flexDirection: 'column', gap: '10px'
  },
  habitTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  habitInfo: { flex: 1 },
  habitName: { margin: 0, fontSize: '15px', fontWeight: 500 },
  habitDesc: { margin: '4px 0 0', fontSize: '12px', color: '#aaa' },
  habitActions: { display: 'flex', alignItems: 'center', gap: '8px' },
  streakBadge: {
    fontSize: '13px', fontWeight: 600, color: '#f97316',
    background: '#2a1a0a', padding: '4px 8px', borderRadius: '6px'
  },
  doneBtn: {
    padding: '6px 12px', borderRadius: '6px', border: 'none',
    color: '#fff', cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap'
  },
  deleteBtn: {
    padding: '6px 10px', borderRadius: '6px', border: 'none',
    background: '#7f1d1d', color: '#fff', cursor: 'pointer', fontSize: '13px'
  },
  empty: { color: '#aaa', textAlign: 'center', fontSize: '14px' },
  error: { color: '#ef4444', fontSize: '13px', margin: 0 },
  calendar: { display: 'flex', gap: '6px' },
  dayWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  dayDot: { width: '28px', height: '28px', borderRadius: '6px' },
  dayLabel: { fontSize: '10px', color: '#666' }
}

export default Dashboard