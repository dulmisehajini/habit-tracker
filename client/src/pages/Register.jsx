import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleRegister = async () => {
    try {
      const res = await axios.post('http://localhost:3000/api/auth/register', {
        username,
        email,
        password
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>🔥 HabitFlow</h1>
        <h2 style={styles.subtitle}>Create your account</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          style={styles.input}
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          style={styles.input}
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button style={styles.button} onClick={handleRegister}>
          Create Account
        </button>
        <p style={styles.link}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0f0f0f',
  },
  card: {
    background: '#1a1a1a',
    padding: '2rem',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  title: {
    color: '#fff',
    textAlign: 'center',
    margin: 0,
    fontSize: '28px',
  },
  subtitle: {
    color: '#aaa',
    textAlign: 'center',
    margin: 0,
    fontSize: '16px',
    fontWeight: 400,
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #333',
    background: '#2a2a2a',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#22c55e',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '8px',
  },
  error: {
    color: '#ef4444',
    fontSize: '13px',
    textAlign: 'center',
    margin: 0,
  },
  link: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: '13px',
  }
}

export default Register