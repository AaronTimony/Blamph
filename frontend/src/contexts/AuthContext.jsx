import {useCallback, createContext, useContext, useState, useEffect} from "react";

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

  const refreshAccessToken = async () => {
    refresh_token = localStorage.getItem("refresh_token")
    if (!refresh_token) {
      throw new Error("No refresh token found")
    }
    try {
      const response = fetch("http://127.0.0.1:8000/api/v1/auth/refresh", {
        method: "POST",
        headers: {"Content-Type" : "application/json"},
        body: JSON.stringify({refresh_token}),
      })

      if (!response.ok) {
        throw new Error("Could not post refresh token")
      }

      const data = await response.json()
      const {access_token, refresh_token : new_refresh_token} = data();

      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", new_refresh_token)
      setToken(access_token)

      return access_token;
    } catch(error) {
      console.error("refresh token failed", error)
      clearAuth();
      return null;
    }
  }

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null)
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
  }, []);

  const apiCall = async (url, options = {}) => {
    let accessToken = localStorage.getItem("access_token");

    const makeRequest = async (token) => {
      return fetch(url, {
        ...options, 
        headers: {
          "Content-Type" : "application/json",
          ...options.headers,
          "Authorization" : `Bearer ${token}`
        }
      });
    };
    let response = makeRequest(accessToken);

      if (response.status === 401) {
        console.log("Token expired, attempting refresh")
        const newAccessToken = await refreshAccessToken();
      }

      if (newAccessToken) {
        makeRequest(newAccessToken)
      } else {
        throw new Error("Authentication failed")
      }
      return response
    }

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem("access_token")
      const refreshToken = localStorage.getItem("refresh_token")

      if (savedToken) {
        const userData = await validateToken(savedToken)
        if (userData) {
          setUser(userData)
          setToken(savedToken)
        } else if (refreshToken) {
            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
              const userData = await validateToken(newAccessToken);
            }
            if (userData) {
              setUser(userData)
              setToken(newAccessToken)
            }
        }
          else {
            clearAuth();
        }
      }
      setLoading(false)
    }
    checkAuth();
  }, [clearAuth])

  const login = async (username, password) => {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      const response = await fetch("http://127.0.0.1:8000/api/v1/auth/login", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("failed to retrieve token")
      }
      const data = await response.json()
      const {access_token, refresh_token, token_type} = data;

      const userData = await validateToken(access_token);
      if (userData) {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
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

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token")
      if (refreshtoken) {
        await fetch("http://127.0.0.1:8000/api/v1/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            refresh_token: refreshToken
          }),

        })
      }
    } catch(error) {
      console.error("server failed logout", error);
    }
    clearAuth();
  }

  
 const value = {
    logout,
    login,
    user,
    token,
    loading,
    apiCall,
    refreshAccessToken
  }
  return <AuthContext.Provider value={value}>
    {children}
  </AuthContext.Provider>
}

export const useAuthContext = () => useContext(AuthContext)

