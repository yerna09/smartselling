// Configuración de API centralizada para SmartSelling

// Detectar entorno automáticamente
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// URLs según el entorno (usar variables de entorno si están disponibles)
export const API_URL = process.env.REACT_APP_API_URL || (isDevelopment 
  ? 'http://localhost:8000'
  : 'https://api-test.smartselling.com.ar')

export const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || (isDevelopment
  ? 'http://localhost:3000'
  : 'https://test.smartselling.com.ar')

// Configuración para fetch requests
export const API_CONFIG = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include', // Para enviar cookies automáticamente
  mode: 'cors' // Explícitamente permitir CORS
}

// Helper para hacer requests con configuración por defecto
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`
  
  const config = {
    ...API_CONFIG,
    ...options,
    headers: {
      ...API_CONFIG.headers,
      ...options.headers
    }
  }
  
  try {
    const response = await fetch(url, config)
    
    // Manejar diferentes tipos de errores HTTP
    if (!response.ok) {
      const contentType = response.headers.get('content-type')
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          // Si no se puede parsear el JSON, usar el mensaje por defecto
        }
      }
      
      throw new Error(errorMessage)
    }
    
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    }
    
    return response
  } catch (error) {
    console.error(`API request failed for ${url}:`, error)
    throw error
  }
}

console.log('🔧 API Configuration:', {
  Environment: isDevelopment ? 'Development' : 'Production',
  API_URL,
  FRONTEND_URL
})
