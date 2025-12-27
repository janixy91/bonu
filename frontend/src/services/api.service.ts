const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private logoutCallback: (() => void) | null = null;

  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('bonu-auth-storage');
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
    const token = localStorage.getItem('bonu-auth-storage');
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
              localStorage.setItem('bonu-auth-storage', JSON.stringify(updatedParsed));
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
    localStorage.removeItem('bonu-auth-storage');
    
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

  async register(email: string, password: string, name: string) {
    return this.request<{
      user: { id: string; email: string; name: string };
      accessToken: string;
      refreshToken: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async refresh(refreshToken: string) {
    return this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getMe() {
    return this.request<{ user: { id: string; email: string; name: string; createdAt: string } }>('/auth/me');
  }

  async updateProfile(name: string) {
    return this.request<{
      message: string;
      user: { id: string; email: string; name: string; role: string };
    }>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  // Business endpoints
  async getBusinesses() {
    return this.request<{ businesses: any[] }>('/business');
  }

  async getBusiness(id: string) {
    return this.request<{ business: any }>(`/business/${id}`);
  }


  // Card endpoints
  async getUserCards(userId?: string) {
    // Get current user ID from storage if not provided
    if (!userId) {
      const token = localStorage.getItem('bonu-auth-storage');
      if (token) {
        try {
          const parsed = JSON.parse(token);
          const user = parsed.state?.user;
          if (user?.id) {
            userId = user.id;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    const endpoint = userId ? `/cards/${userId}` : '/cards/me';
    return this.request<{ cards: any[] }>(endpoint);
  }

  async getCard(cardId: string) {
    return this.request<{ card: any }>(`/cards/card/${cardId}`);
  }

  async createCard(businessId: string) {
    return this.request<{ card: any }>('/cards', {
      method: 'POST',
      body: JSON.stringify({ businessId }),
    });
  }

  async addStamp(cardId: string) {
    return this.request<{ card: any }>(`/cards/${cardId}/stamp`, {
      method: 'PATCH',
    });
  }

  async redeemReward(cardId: string) {
    return this.request<{ card: any }>(`/cards/${cardId}/redeem`, {
      method: 'POST',
    });
  }

  // OTP endpoints
  async getCurrentOTP(userId: string) {
    return this.request<{ code: string; validUntil: string }>(`/otp/current/${userId}`);
  }

  // Stamp validation endpoints
  async validateStampCode(code: string) {
    return this.request<{ message: string; card: any }>('/stamps/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // History endpoints
  async getUserHistory(userId?: string) {
    // Get current user ID from storage if not provided
    if (!userId) {
      const token = localStorage.getItem('bonu-auth-storage');
      if (token) {
        try {
          const parsed = JSON.parse(token);
          const user = parsed.state?.user;
          if (user?.id) {
            userId = user.id;
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
    const endpoint = userId ? `/history/${userId}` : '/history/me';
    return this.request<{ history: any[] }>(endpoint);
  }

  // Code redemption endpoints
  async redeemCode(code: string) {
    return this.request<{
      status: string;
      business: string;
      benefit: string;
      used_at: string;
    }>('/codes/redeem', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }
}

export const apiService = new ApiService();

// Export individual services for convenience
export const authService = {
  login: (email: string, password: string) => apiService.login(email, password),
  register: (email: string, password: string, name: string) =>
    apiService.register(email, password, name),
  refresh: (refreshToken: string) => apiService.refresh(refreshToken),
  getMe: () => apiService.getMe(),
  updateProfile: (name: string) => apiService.updateProfile(name),
};

export const businessService = {
  getBusinesses: () => apiService.getBusinesses(),
  getBusiness: (id: string) => apiService.getBusiness(id),
};

export const cardService = {
  getUserCards: (userId?: string) => apiService.getUserCards(userId),
  getCard: (cardId: string) => apiService.getCard(cardId),
  createCard: (businessId: string) => apiService.createCard(businessId),
  addStamp: (cardId: string) => apiService.addStamp(cardId),
  redeemReward: (cardId: string) => apiService.redeemReward(cardId),
};

export const historyService = {
  getUserHistory: (userId?: string) => apiService.getUserHistory(userId),
};

export const otpService = {
  getCurrentOTP: (userId: string) => apiService.getCurrentOTP(userId),
};

export const stampService = {
  validateCode: (code: string) => apiService.validateStampCode(code),
};

export const codeService = {
  redeemCode: (code: string) => apiService.redeemCode(code),
};

export const tarjetaClienteService = {
  getTarjetasDisponibles: () => apiService.request<{ tarjetas: any[] }>('/cliente/tarjetas-disponibles'),
  anadirTarjeta: (id: string) => apiService.request<{ message: string; tarjeta: any }>(`/cliente/tarjetas/${id}/anadir`, {
    method: 'POST',
  }),
  getMisTarjetas: () => apiService.request<{ tarjetas: any[] }>('/cliente/mis-tarjetas'),
  canjearTarjeta: (id: string) => apiService.request<{ message: string; tarjeta: any }>(`/cliente/tarjetas/${id}/canjear`, {
    method: 'PATCH',
  }),
};

