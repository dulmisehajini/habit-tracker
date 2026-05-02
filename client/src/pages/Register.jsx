import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    setLoading(true)
    try {
      const res = await axios.post('http://localhost:3000/api/auth/register', { username, email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">🔥</h1>
          <h2 className="text-2xl font-semibold text-white">HabitFlow</h2>
          <p className="text-zinc-400 text-sm mt-1">Create your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <input
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors"
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-lg px-4 py-3 text-sm outline-none focus:border-green-500 transition-colors"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
          />
          <button
            className="w-full bg-green-500 hover:bg-green-400 text-white font-semibold rounded-lg py-3 mt-2 transition-colors disabled:opacity-50"
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <p className="text-center text-zinc-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-400 hover:text-green-300">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register