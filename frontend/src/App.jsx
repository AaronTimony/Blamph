import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './css/App.css'
import UserProfile from "./pages/UserProfilePage"
import Review from "./pages/Review" 
import NavBar from "./components/NavBar"
import {Routes, Route} from "react-router-dom"
import MyDecks from "./pages/MyDecks"
import Decks from "./pages/Decks"
import {AuthProvider, useAuthContext} from "./contexts/AuthContext"
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register"
import CreateDeck from "./pages/CreateDeck"
import CardReview from "./pages/CardReview"
import DeckDetails from "./pages/deckDetails"
import UserSettings from './pages/Settings'
import AdminPage from "./pages/adminPage"

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
          <Route path="/Review" element={<Review />} />
          <Route path="/" element={<Decks />} />
          <Route path="/decks" element={<Decks />} />
          <Route path="/CardReview" element={<CardReview />} />
          <Route path="/Login" element={<LoginPage />} />
          <Route path="/Register" element={<RegisterPage />} />
          <Route path="/decks/:deck_name/:page" element={<DeckDetails />} /> 
          {user && <Route path={`/myDecks`} element={<MyDecks />} />}
          <Route path="/Create" element={<CreateDeck />} />
          <Route path="/Profile/:username" element={<UserProfile />} />
          <Route path="/Settings/:username" element={<UserSettings />} />
          <Route path="/Admin" element={<AdminPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
