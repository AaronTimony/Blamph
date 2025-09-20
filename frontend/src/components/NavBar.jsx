import {Link} from "react-router-dom"
import "../css/NavBar.css"
import {useAuthContext} from "../contexts/AuthContext"
import {useState, useEffect, useRef} from "react"
import API_BASE_URL from "../config"
import {ProfileDropdown} from "../components/profileDropdown"

function NavBar() {
  const {loading, user, logout} = useAuthContext();
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)
  const handleLogout = () => {
    if (window.confirm('Are you sure you wish to log out?')) {
      logout().then(() => {
        window.location.href = "/Decks";
      });
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };

  }, [showDropdown]);

  if (loading) return;

  return (
    <nav>
      <div className="NavBar">
        <Link to="/Review">Blamph</Link>
        <div className="centre-of-navbar">
          <Link to="/SearchWord">Search</Link>
          <Link to="/Create">Create Deck</Link>
          <Link to="/Decks">Decks</Link>
          {user && <Link to="/myDecks">My Decks</Link>}
        </div>
        {user ? (
          <div className="profile-dropdown" ref={dropdownRef}>
            <Link to="#" onClick={(e) => {
              e.preventDefault();
              setShowDropdown(!showDropdown);
            }} className="profile-picture-link">
              {!loading && user.username ? (
              <img src={`${API_BASE_URL}/api/v1/auth/profile_picture/${user.username}`} alt={user.username} className="profile-picture-image"/>
              ) : (
              <div className="pfp-loading"> Loading... </div>
              )}
            </Link>
            {showDropdown && <ProfileDropdown setShowDropdown={setShowDropdown}/>}
          </div>
        ) : (
            <div className="logged-out-navbar">
              <Link to="/Login">Login</Link>
              <Link to="/Register">Register</Link>
            </div>
          )}
      </div>
    </nav>
  )
}


export default NavBar
