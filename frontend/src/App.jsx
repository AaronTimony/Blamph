import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './css/App.css'
import Home from "./pages/Home"
import NavBar from "./components/NavBar"
import {Routes, Route} from "react-router-dom"
import MyDecks from "./pages/MyDecks"
import Decks from "./pages/Decks"
import {AuthProvider, useAuthContext} from "./contexts/AuthContext"
import LoginForm from "./pages/login"
import RegisterForm from "./pages/register"

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppContent() {
  const {user} = useAuthContext();
  return (
    <>
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/decks" element={<Decks />} />
          <Route path="/Login" element={<LoginForm />} />
          <Route path="/Register" element={<RegisterForm />} />
          {user && <Route path={`/myDecks`} element={<MyDecks />} />}
        </Routes>
      </main>
    </>
  )
}

export default App
