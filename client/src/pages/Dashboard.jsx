import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

function WeekCalendar({ last7Days }) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const done = last7Days.includes(dateStr)
    days.push({ dateStr, done, label: d.toLocaleDateString('en', { weekday: 'short' }) })
  }

  return (
    <div className="flex gap-2 mt-3">
      {days.map(day => (
        <div key={day.dateStr} className="flex flex-col items-center gap-1">
          <div className={`w-8 h-8 rounded-lg ${day.done ? 'bg-green-500' : 'bg-zinc-700'}`} />
          <span className="text-xs text-zinc-500">{day.label}</span>
        </div>
      ))}
    </div>
  )
}

function Dashboard() {
  const [habits, setHabits] = useState([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user'))
  const headers = { Authorization: `Bearer ${token}` }

  const today = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`

  const fetchHabits = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/habits', { headers })
      setHabits(res.data)
    } catch (err) {
      console.error('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchHabits() }, [])

  const createHabit = async () => {
    if (!name) return
    setAdding(true)
    try {
      await axios.post('http://localhost:3000/api/habits', { name, description }, { headers })
      setName('')
      setDescription('')
      fetchHabits()
    } catch (err) {
      console.error('Failed to create habit')
    } finally {
      setAdding(false)
    }
  }

  const deleteHabit = async (id) => {
    if (!confirm('Delete this habit?')) return
    try {
      await axios.delete(`http://localhost:3000/api/habits/${id}`, { headers })
      fetchHabits()
    } catch (err) {
      console.error('Failed to delete habit')
    }
  }

  const logHabit = async (id) => {
    try {
      await axios.post(`http://localhost:3000/api/habits/${id}/log`, {}, { headers })
      fetchHabits()
    } catch (err) {
      console.error('Already logged today')
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const completedToday = habits.filter(h => h.last7Days?.includes(today)).length
  const completionRate = habits.length > 0 ? Math.round((completedToday / habits.length) * 100) : 0

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">🔥 HabitFlow</h1>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400 text-sm">👋 {user?.username}</span>
            <button
              onClick={logout}
              className="text-sm text-zinc-400 border border-zinc-700 rounded-lg px-3 py-1.5 hover:bg-zinc-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* Summary bar */}
        <div className="bg-zinc-900 rounded-2xl p-6 grid grid-cols-3 divide-x divide-zinc-800">
          <div className="flex flex-col items-center gap-1 px-4">
            <span className="text-3xl font-bold text-green-400">{completedToday}</span>
            <span className="text-xs text-zinc-500">Done today</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4">
            <span className="text-3xl font-bold text-green-400">{habits.length}</span>
            <span className="text-xs text-zinc-500">Total habits</span>
          </div>
          <div className="flex flex-col items-center gap-1 px-4">
            <span className="text-3xl font-bold text-green-400">{completionRate}%</span>
            <span className="text-xs text-zinc-500">Today's rate</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-zinc-800 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        {/* Add habit form */}
        <div className="bg-zinc-900 rounded-2xl p-6">
          <h2 className="text-lg font-medium mb-4">Add a new habit</h2>
          <div className="flex flex-col gap-3">
            <input
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors"
              type="text"
              placeholder="Habit name (e.g. Drink water)"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createHabit()}
            />
            <input
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors"
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <button
              className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg py-3 transition-colors disabled:opacity-50"
              onClick={createHabit}
              disabled={adding}
            >
              {adding ? 'Adding...' : '+ Add Habit'}
            </button>
          </div>
        </div>

        {/* Habits list */}
        <div className="bg-zinc-900 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Your habits</h2>
            <span className="text-sm text-zinc-500">{habits.length} total</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-zinc-500">Loading habits...</div>
          ) : habits.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <p className="text-4xl mb-3">🌱</p>
              <p>No habits yet. Add your first one above!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {habits.map(habit => {
                const doneToday = habit.last7Days?.includes(today)
                return (
                  <div key={habit.id} className="bg-zinc-800 rounded-xl p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-white">{habit.name}</p>
                        {habit.description && (
                          <p className="text-sm text-zinc-400 mt-0.5">{habit.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-semibold text-orange-400 bg-orange-400/10 px-2 py-1 rounded-lg">
                          🔥 {habit.streak}
                        </span>
                        <button
                          onClick={() => logHabit(habit.id)}
                          disabled={doneToday}
                          className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-colors ${
                            doneToday
                              ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-400 text-white cursor-pointer'
                          }`}
                        >
                          {doneToday ? '✅ Done' : '○ Mark done'}
                        </button>
                        <button
                          onClick={() => deleteHabit(habit.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-400/10"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <WeekCalendar last7Days={habit.last7Days || []} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard