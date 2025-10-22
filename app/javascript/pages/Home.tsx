import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Home() {
  const [health, setHealth] = useState<string>('Checking...')

  useEffect(() => {
    // Example API call to Rails backend
    fetch('/up')
      .then(response => response.text())
      .then(data => setHealth('Rails API is running!'))
      .catch(() => setHealth('Rails API connection failed'))
  }, [])

  return (
    <div className="home">
      <header className="home-header">
        <h1>Welcome to React + Rails</h1>
        <p>Your React SPA with Vite and TypeScript is running!</p>

        <div className="info-card">
          <h2>Tech Stack</h2>
          <ul>
            <li>React 18 with TypeScript</li>
            <li>Rails 8.0.3 API</li>
            <li>Vite for fast builds</li>
            <li>React Router v6</li>
            <li>PostgreSQL database</li>
          </ul>
        </div>

        <div className="info-card">
          <h2>API Health Check</h2>
          <p className="health-status">{health}</p>
        </div>

        <div className="info-card">
          <h2>Demo Pages</h2>
          <ul>
            <li><Link to="/properties">Property Search</Link> - Browse vacation rentals</li>
          </ul>
        </div>

        <div className="info-card">
          <h2>Next Steps</h2>
          <ul>
            <li>Create API endpoints in <code>app/controllers/api/</code></li>
            <li>Add new pages in <code>app/javascript/pages/</code></li>
            <li>Build components in <code>app/javascript/components/</code></li>
            <li>Update routes in <code>app/javascript/App.tsx</code></li>
          </ul>
        </div>
      </header>
    </div>
  )
}

export default Home
