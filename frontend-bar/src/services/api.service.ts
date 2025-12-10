const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private logoutCallback: (() => void) | null = null;

  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('bonu-bar-auth');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        const accessToken = parsed.state?.accessToken;
        if (accessToken) {
          return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          };
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
    return {
      'Content-Type': 'application/json',
    };
  }

  private async handleTokenExpiration(): Promise<boolean> {
    // Try to refresh token first
    const token = localStorage.getItem('bonu-bar-auth');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        const refreshToken = parsed.state?.refreshToken;
        
        if (refreshToken) {
          try {
            // Use direct fetch to avoid recursion
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (refreshResponse.ok) {
              const data = await refreshResponse.json();
              // Update stored token
              const updatedParsed = { ...parsed };
              updatedParsed.state.accessToken = data.accessToken;
              localStorage.setItem('bonu-bar-auth', JSON.stringify(updatedParsed));
              return true; // Token refreshed successfully
            }
          } catch (refreshError) {
            // Refresh failed, proceed to logout
            console.log('Token refresh failed, logging out');
          }
        }
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Logout if refresh failed or no refresh token
    // Clear storage first
    localStorage.removeItem('bonu-bar-auth');
    
    // Call logout callback if available
    if (this.logoutCallback) {
      try {
        this.logoutCallback();
      } catch (e) {
        console.error('Error in logout callback:', e);
      }
    }
    
    // Force redirect to login
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    
    return false;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryOn401: boolean = true
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getAuthHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || '';
      
      // Handle 401 Unauthorized or 403 Forbidden with token expiration
      const isTokenExpired = response.status === 401 || 
                            (response.status === 403 && (
                              errorMessage.toLowerCase().includes('token expired') ||
                              errorMessage.toLowerCase().includes('expired') ||
                              errorMessage.toLowerCase().includes('invalid token')
                            ));
      
      if (isTokenExpired && retryOn401) {
        const refreshed = await this.handleTokenExpiration();
        if (refreshed) {
          // Retry the request with new token
          return this.request<T>(endpoint, options, false);
        }
        // If refresh failed, logout was called, throw error to stop execution
        const error: any = new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        error.status = response.status;
        throw error;
      }

      const httpError: any = new Error(errorMessage || `HTTP error! status: ${response.status}`);
      httpError.status = response.status;
      throw httpError;
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      user: { id: string; email: string; name: string };
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Stamp validation endpoint
  async validateStampCode(code: string) {
    return this.request<{ message: string; card: any }>('/stamps/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }
}

export const apiService = new ApiService();

export const authService = {
  login: (email: string, password: string) => apiService.login(email, password),
};

export const stampService = {
  validateCode: (code: string) => apiService.validateStampCode(code),
};

export const tarjetaService = {
  getTarjetas: () => apiService.request<{ tarjetas: any[] }>('/business-owner/tarjetas'),
  getTarjeta: (id: string) => apiService.request<{ tarjeta: any }>(`/business-owner/tarjetas/${id}`),
  createTarjeta: (data: any) => apiService.request<{ message: string; tarjeta: any }>('/business-owner/tarjetas', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateTarjeta: (id: string, data: any) => apiService.request<{ message: string; tarjeta: any }>(`/business-owner/tarjetas/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  desactivarTarjeta: (id: string) => apiService.request<{ message: string; tarjeta: any }>(`/business-owner/tarjetas/${id}/desactivar`, {
    method: 'PATCH',
  }),
  deleteTarjeta: (id: string) => apiService.request<{ message: string }>(`/business-owner/tarjetas/${id}`, {
    method: 'DELETE',
  }),
};

