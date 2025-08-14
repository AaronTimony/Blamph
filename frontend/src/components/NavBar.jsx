import {Link} from "react-router-dom"
import "../css/NavBar.css"
import {useAuthContext} from "../contexts/AuthContext"
import {useState, useEffect} from "react"

function NavBar() {
  const {user, logout} = useAuthContext();
  const handleLogout = () => {
    if (window.confirm('Are you sure you wish to log out?')) {
      logout();
    }
  };
  return (
  <nav>
    <div className="NavBar">
      <Link to="/">Blamph</Link>
      <div className="centre-of-navbar">
        <Link to="/Decks">Decks</Link>
          {user ? (
            <div>
              <Link to="/myDecks">My Decks</Link>
              <Link to="#" onClick={(e) =>{
                e.preventDefault();
                handleLogout();
              }}
              >Logout</Link>
            </div>
          ) : (
        <div className="logged-out-navbar">
          <Link to="/Login">Login</Link>
          <Link to="/Register">Register</Link>
        </div>
          )}
      </div>
    </div>
  </nav>
)};

export default NavBar
