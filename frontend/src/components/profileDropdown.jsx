import {Link} from "react-router-dom"
import {useAuthContext} from "../contexts/AuthContext"
import "../css/profiledropdown.css"
import cog from "../icons/cog.svg"
import profile from "../icons/profile.svg"
import logoutIcon from "../icons/logout.svg"

export function ProfileDropdown(setShowDropdown) {
  const {user, logout} = useAuthContext();

  const handleLogout = async () => {
    if (window.confirm('Are you sure you wish to log out?')) {
      try {
        await logout()
        window.location.href = "/Decks"
      } catch(error) {
        console.error("Logout failed:", error);
      }
    }
  };

 return (
    <div className="profile-dropdown-menu">
      <ul>
        <li>
          <Link to={`/Profile/${user.username}`} onClick={() => setShowDropdown(false)}>
            <img src={profile} alt={"profile"} className="profile-icon" /> Profile
          </Link>
        </li>
        <li>
          <Link to={`/Settings/${user.username}`} onClick={() => setShowDropdown(false)}>
            <img src={cog} alt={"settings"} className="cog-icon" /> Settings 
          </Link>
        </li>
        <li>
          <button onClick={() => {
          handleLogout();
          setShowDropdown(false);
          }}>
            <img src={logoutIcon} alt={"settings"} className="logout-icon" /> Logout 
          </button>
        </li>
      </ul>
    </div>
  )
}
