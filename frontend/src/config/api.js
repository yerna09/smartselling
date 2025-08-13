// Configuración de API centralizada para SmartSelling

// Detectar entorno automáticamente
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// URLs según el entorno (usar variables de entorno si están disponibles)
export const API_URL = process.env.REACT_APP_API_URL || (isDevelopment 
  ? 'http://localhost:5000'
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
      } else {
        // Si no es JSON, posiblemente sea HTML (página de error)
        const textResponse = await response.text()
        if (textResponse.includes('<!DOCTYPE') || textResponse.includes('<html')) {
          errorMessage = `Server returned HTML instead of JSON. Status: ${response.status}`
          console.error('Received HTML response:', textResponse.substring(0, 200) + '...')
        } else {
          errorMessage = textResponse || errorMessage
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
    
    // Mejorar mensajes de error para el usuario
    if (error.message.includes('Failed to fetch')) {
      throw new Error('No se pudo conectar con el servidor. Verifica tu conexión.')
    }
    
    if (error.message.includes('HTML instead of JSON')) {
      throw new Error('El servidor devolvió una página web en lugar de datos. Esto puede indicar un error de configuración.')
    }
    
    throw error
  }
}

console.log('🔧 API Configuration:', {
  Environment: isDevelopment ? 'Development' : 'Production',
  API_URL,
  FRONTEND_URL
})
