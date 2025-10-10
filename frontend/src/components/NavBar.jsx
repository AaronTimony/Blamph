import {Link} from "react-router-dom"
import "../css/NavBar.css"
import {useAuthContext} from "../contexts/AuthContext"
import {useState, useEffect, useRef} from "react"
import menubars from "../icons/menu-bars.svg"
import API_BASE_URL from "../config"
import {ProfileDropdown} from "../components/profileDropdown"
import logo from "../images/Site_logo_temp.png"

function NavBar() {
  const {loading, user} = useAuthContext();
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef(null)

  const samePage = (e, path) => {
    if (window.location.pathname === path) {
      e.preventDefault();
      <Link to={path} />
    }
  }

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
        <div className="navbar-left">
          <Link to="/Review" onClick={(e) => samePage(e, "/Review")} className="navbar-image-link">
            <img className="navbar-logo-image" src={logo} alt={"Blamph"} />
          </Link>
        </div>
        <div className="centre-of-navbar">
          {user && <Link to="/Review" onClick = {(e) => samePage(e, "/Review")}>Review</Link>}
          <Link to="/Decks" onClick={(e) => samePage(e, "/Decks")}>Decks</Link>
          {user && <Link to="/myDecks" onClick={(e) => samePage(e, "/myDecks")}>My Decks</Link>}
          {user && <Link to="/Create" onClick={(e) => samePage(e, "/Create")}>Create Deck</Link>}
        </div>
        {user ? (
          <div className="profile-dropdown" ref={dropdownRef}>
            <Link to="#" onClick={(e) => {
              e.preventDefault();
              setShowDropdown(!showDropdown);
            }} className="profile-picture-link">
              <img src={menubars} alt={"Click for more"} className="menu-bars" />
            </Link>
            {showDropdown && <ProfileDropdown setShowDropdown={setShowDropdown}/>}
          </div>
        ) : (
            <div className="logged-out-navbar">
              <Link to="/Login" className="login-link">Login</Link>
              <Link to="/Register" className="registration-link">Register</Link>
            </div>
          )}
      </div>
    </nav>
  )
}


export default NavBar
