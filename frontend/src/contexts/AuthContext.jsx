import {createContext, useContext, useState, useEffect} from "react";

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const validateToken = async (accessToken) => {
    try{
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/users/me", {
        method: "GET",
        headers: {
          "Content-Type" : "application/json",
          "Authorization" : `Bearer ${accessToken}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to Validate User")
      }
      const data = await response.json();
      return data
    } catch(error) {
      console.error("Token Verification failed", error)
      return null
    } 
  };

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("access_token")
      if (savedToken) {
        const userData = await validateToken(savedToken)
        if (userData) {
          setUser(userData)
          setToken(savedToken)
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('access_token');
        }
      }
      setLoading(false)
    }
    checkAuth();
  }, [])

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/token", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("failed to retrieve token")
      }
      const data = await response.json()
      const {access_token, token_type} = data;

      const userData = await validateToken(access_token);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('access_token', access_token);
        setUser(userData);
        setToken(access_token)
        return {success: true};
      } else {
        return {success: false, error: "Failed to get user data"};
      }
    } catch(error) {
      console.error("Login failed", error);
      return {success: false, error: "Network Error"}
    }
  };

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user');
    localStorage.removeItem('access_token')
  };

  const value = {
    logout,
    login,
    user,
    token,
    loading,
  }
  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)

