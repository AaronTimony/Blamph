import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './css/App.css'
import Review from "./pages/Review" 
import NavBar from "./components/NavBar"
import {Routes, Route} from "react-router-dom"
import MyDecks from "./pages/MyDecks"
import Decks from "./pages/Decks"
import {AuthProvider, useAuthContext} from "./contexts/AuthContext"
import LoginForm from "./pages/login"
import RegisterForm from "./pages/register"
import CreateDeck from "./pages/CreateDeck"
import SearchWord from "./pages/Search"

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
          <Route path="/" element={<Review />} />
          <Route path="/decks" element={<Decks />} />
          <Route path="/Login" element={<LoginForm />} />
          <Route path="/SearchWord" element={<SearchWord />} />
          <Route path="/Register" element={<RegisterForm />} />
          {user && <Route path={`/myDecks`} element={<MyDecks />} />}
          <Route path="/Create" element={<CreateDeck />} />
        </Routes>
      </main>
    </>
  )
}

export default App
