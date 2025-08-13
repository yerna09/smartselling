import React, { createContext, useState, useEffect } from 'react'
import { API_URL, apiRequest } from '../config/api'

// Crear el contexto
export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking auth status at:', `${API_URL}/profile`);
      
      const response = await fetch(`${API_URL}/profile`, {
        credentials: 'include'
      })

      console.log('📡 Auth check response status:', response.status);

      if (response.ok) {
        const userData = await response.json()
        console.log('✅ User authenticated:', userData);
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        console.log('❌ User not authenticated');
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error('🚨 Error checking auth status:', error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      console.log('🔐 Attempting login at:', `${API_URL}/login`);
      
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      console.log('📡 Login response status:', response.status);

      if (response.ok) {
        const userData = await response.json()
        console.log('✅ Login successful:', userData);
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        const error = await response.json()
        console.error('❌ Login failed:', error);
        throw new Error(error.message || 'Error de autenticación')
      }
    } catch (error) {
      console.error('🚨 Login error:', error)
      throw new Error(error.message || 'Error de conexión')
    }
  }

  const logout = async () => {
    try {
      await apiRequest('/logout', {
        method: 'POST'
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
    }
  }

  const register = async (username, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
        setIsAuthenticated(true)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, message: error.message }
      }
    } catch (error) {
      console.error('Register error:', error)
      return { success: false, message: 'Error de conexión' }
    }
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    register,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
