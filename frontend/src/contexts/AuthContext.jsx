import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'

// Configurar axios
const API_BASE = import.meta.env.VITE_API_URL || 'https://api-test.smartselling.com.ar'

axios.defaults.baseURL = API_BASE
axios.defaults.withCredentials = true

// Estado inicial
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  mlAccounts: []
}

// Acciones
const authActions = {
  SET_LOADING: 'SET_LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_ML_ACCOUNTS: 'SET_ML_ACCOUNTS',
  ADD_ML_ACCOUNT: 'ADD_ML_ACCOUNT',
  UPDATE_ML_ACCOUNT: 'UPDATE_ML_ACCOUNT',
  REMOVE_ML_ACCOUNT: 'REMOVE_ML_ACCOUNT'
}

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case authActions.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case authActions.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false
      }
    
    case authActions.LOGOUT:
      return {
        ...initialState,
        loading: false
      }
    
    case authActions.SET_ML_ACCOUNTS:
      return {
        ...state,
        mlAccounts: action.payload
      }
    
    case authActions.ADD_ML_ACCOUNT:
      return {
        ...state,
        mlAccounts: [...state.mlAccounts, action.payload]
      }
    
    case authActions.UPDATE_ML_ACCOUNT:
      return {
        ...state,
        mlAccounts: state.mlAccounts.map(account =>
          account.id === action.payload.id ? action.payload : account
        )
      }
    
    case authActions.REMOVE_ML_ACCOUNT:
      return {
        ...state,
        mlAccounts: state.mlAccounts.filter(account => account.id !== action.payload)
      }
    
    default:
      return state
  }
}

// Contexto
const AuthContext = createContext()

// Provider
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Verificar autenticación al cargar
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('/profile')
      
      if (response.data) {
        dispatch({
          type: authActions.LOGIN_SUCCESS,
          payload: { user: response.data }
        })
        
        // Cargar cuentas ML
        await loadMLAccounts()
      }
    } catch (error) {
      dispatch({ type: authActions.SET_LOADING, payload: false })
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post('/login', { username, password })
      
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: response.data }
      })
      
      await loadMLAccounts()
      toast.success('Inicio de sesión exitoso')
      
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error en el inicio de sesión'
      toast.error(message)
      throw error
    }
  }

  const register = async (username, password) => {
    try {
      const response = await axios.post('/register', { username, password })
      
      dispatch({
        type: authActions.LOGIN_SUCCESS,
        payload: { user: response.data }
      })
      
      toast.success('Registro exitoso')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error en el registro'
      toast.error(message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await axios.post('/logout')
    } catch (error) {
      console.log('Error al cerrar sesión:', error)
    } finally {
      dispatch({ type: authActions.LOGOUT })
      Cookies.remove('token')
      toast.success('Sesión cerrada')
    }
  }

  const loadMLAccounts = async () => {
    try {
      const response = await axios.get('/ml-accounts')
      dispatch({
        type: authActions.SET_ML_ACCOUNTS,
        payload: response.data.accounts || []
      })
    } catch (error) {
      console.error('Error cargando cuentas ML:', error)
    }
  }

  const addMLAccount = async () => {
    try {
      const response = await axios.get('/mercadolibre/auth')
      
      if (response.data.auth_url) {
        // Redirigir a ML OAuth
        window.location.href = response.data.auth_url
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al conectar con Mercado Libre'
      toast.error(message)
    }
  }

  const updateMLAccount = async (accountId, updates) => {
    try {
      const response = await axios.put(`/ml-accounts/${accountId}`, updates)
      
      dispatch({
        type: authActions.UPDATE_ML_ACCOUNT,
        payload: response.data
      })
      
      toast.success('Cuenta actualizada')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar cuenta'
      toast.error(message)
      throw error
    }
  }

  const removeMLAccount = async (accountId) => {
    try {
      await axios.delete(`/ml-accounts/${accountId}`)
      
      dispatch({
        type: authActions.REMOVE_ML_ACCOUNT,
        payload: accountId
      })
      
      toast.success('Cuenta desvinculada')
    } catch (error) {
      const message = error.response?.data?.message || 'Error al desvincular cuenta'
      toast.error(message)
    }
  }

  const refreshAccountMetrics = async (accountId = null) => {
    try {
      const url = accountId ? `/ml-accounts/${accountId}/refresh-metrics` : '/ml-accounts/refresh-all-metrics'
      const response = await axios.post(url)
      
      // Recargar cuentas para obtener métricas actualizadas
      await loadMLAccounts()
      
      toast.success('Métricas actualizadas')
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar métricas'
      toast.error(message)
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    loadMLAccounts,
    addMLAccount,
    updateMLAccount,
    removeMLAccount,
    refreshAccountMetrics
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado
export function useAuth() {
  const context = useContext(AuthContext)
  
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  
  return context
}

export default AuthContext
