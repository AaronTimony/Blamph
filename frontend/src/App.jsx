import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './css/App.css'
import DeckPicker from "./components/deck"
import NewUser from "./components/newUser"

function App() {

  return (
  <>
      <DeckPicker />
      <NewUser />
    </>
  )
}

export default App
