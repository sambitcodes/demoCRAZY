import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Overview from './pages/Overview'
import Sentiment from './pages/Sentiment'
import Simulations from './pages/Simulations'
import Historical from './pages/Historical'
import Analytics from './pages/Analytics'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/simulations" element={<Simulations />} />
          <Route path="/sentiment" element={<Sentiment />} />
          <Route path="/historical" element={<Historical />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
