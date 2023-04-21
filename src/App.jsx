import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Map from './Map'

function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="App">
      <h1>Test</h1>
    <Map />
      <h1>Test</h1>
    </div>
  )
}

export default App
