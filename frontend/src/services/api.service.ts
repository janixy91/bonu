const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private logoutCallback: (() => void) | null = null;
  private getAuthState: (() => any) | null = null; // Will be set by setAuthStore

  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  setAuthStore(getStateFn: () => any) {
    this.getAuthState = getStateFn;
  }

  private getAuthHeaders(): HeadersInit {
    // Always check localStorage first as it's the most reliable source
    // Zustand persist middleware saves to localStorage, so this should always work
    let accessToken: string | null = null;
    let tokenSource = 'none';
    
    // First, try localStorage (most reliable)
    const token = localStorage.getItem('bonu-auth-storage');
    if (token) {
      try {
        const parsed = JSON.parse(token);
        accessToken = parsed.state?.accessToken;
        if (accessToken && typeof accessToken === 'string' && accessToken.trim().length > 0) {
          tokenSource = 'localStorage';
        }
      } catch (e) {
        console.warn('[API] Error parsing auth storage:', e);
      }
    }

    // Fallback to Zustand store if localStorage doesn't have it
    if (!accessToken && this.getAuthState) {
      try {
        const state = this.getAuthState();
        accessToken = state?.accessToken;
        if (accessToken && typeof accessToken === 'string' && accessToken.trim().length > 0) {
          tokenSource = 'zustand-store';
        }
      } catch (e) {
        console.warn('[API] Error reading from auth store:', e);
      }
    }

    // Log token status for debugging (only if no token found to reduce noise)
    if (!accessToken) {
      console.warn('[API] ⚠️ No token found!', {
        hasLocalStorage: !!token,
        hasGetAuthState: !!this.getAuthState,
        localStorageContent: token ? 'exists' : 'missing'
      });
    }

    // Ensure token is a valid non-empty string
    if (accessToken && typeof accessToken === 'string' && accessToken.trim().length > 0) {
      return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      };
    }

    // No token available
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

    console.log(`[API] ${options.method || 'GET'} ${endpoint}`, {
      url,
      hasAuth: !!headers.Authorization,
      tokenPreview: headers.Authorization ? headers.Authorization.substring(0, 30) + '...' : 'none'
    });

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    console.log(`[API] Response ${endpoint}:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || '';
      
      console.error(`[API] Error ${endpoint}:`, {
        status: response.status,
        error: errorMessage,
        errorData
      });
      
      // Handle 401 Unauthorized or 403 Forbidden with token expiration
      // Only treat as token expiration if error message indicates it
      const isTokenExpired = (response.status === 401 && (
                              errorMessage.toLowerCase().includes('token expired') ||
                              errorMessage.toLowerCase().includes('token inválido') ||
                              errorMessage.toLowerCase().includes('token revocado')
                            )) ||
                            (response.status === 403 && (
                              errorMessage.toLowerCase().includes('token expired') ||
                              errorMessage.toLowerCase().includes('expired') ||
                              errorMessage.toLowerCase().includes('invalid token') ||
                              errorMessage.toLowerCase().includes('token revocado')
                            ));
      
      // For 401 "Token requerido", don't try to refresh - just throw error
      // This might happen if token wasn't sent or isn't ready yet
      if (response.status === 401 && errorMessage.toLowerCase().includes('token requerido')) {
        console.warn('[API] Token not sent in request, not attempting refresh');
        const error: any = new Error(errorMessage || 'No autenticado');
        error.status = response.status;
        throw error;
      }
      
      // Only try to refresh if it's actually a token expiration issue
      if (isTokenExpired && retryOn401) {
        console.warn('[API] Token expired, attempting refresh...');
        // Check if we actually have a token before trying to refresh
        const token = localStorage.getItem('bonu-auth-storage');
        if (!token) {
          console.warn('[API] No token available, cannot refresh');
          // No token available, don't try to refresh or logout
          const error: any = new Error(errorMessage || 'No autenticado');
          error.status = response.status;
          throw error;
        }

        const refreshed = await this.handleTokenExpiration();
        if (refreshed) {
          console.log('[API] Token refreshed, retrying request');
          // Retry the request with new token
          return this.request<T>(endpoint, options, false);
        }
        console.error('[API] Token refresh failed, logout triggered');
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
    const response = await this.request<{
      user: { id: string; email: string; name: string };
      token: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // Transform backend response to match frontend expectations
    return {
      user: response.user,
      accessToken: response.token,
      refreshToken: response.token, // Backend doesn't have refresh tokens, use same token
    };
  }

  async register(email: string, password: string, name: string) {
    const response = await this.request<{
      user: { id: string; email: string; name: string };
      token: string;
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    // Transform backend response to match frontend expectations
    return {
      user: response.user,
      accessToken: response.token,
      refreshToken: response.token, // Backend doesn't have refresh tokens, use same token
    };
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

  async redeemCardReward(cardId: string) {
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

  // Tap/NFC endpoints
  async createTapIntent(barId: string) {
    // Public endpoint, no auth headers needed
    const url = `${API_BASE_URL}/tap?barId=${barId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      const httpError: any = new Error(errorMessage);
      httpError.status = response.status;
      throw httpError;
    }

    return response.json();
  }

  async getTapIntent(tapIntentId: string) {
    // Public endpoint, no auth headers needed
    const url = `${API_BASE_URL}/tap/${tapIntentId}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
      const httpError: any = new Error(errorMessage);
      httpError.status = response.status;
      throw httpError;
    }

    return response.json();
  }

  async addStampFromTap(tapIntentId: string) {
    return this.request<{
      message: string;
      checkIn: {
        id: string;
        points: number;
        bonusReason: string;
        createdAt: string;
      };
      totalPoints: number;
    }>('/stamps/from-tap', {
      method: 'POST',
      body: JSON.stringify({ tapIntentId }),
    });
  }

  // Check-in endpoints
  async createCheckIn(businessId: string, method: 'nfc' | 'code' | 'manual' = 'nfc') {
    return this.request<{
      message: string;
      checkIn: {
        id: string;
        points: number;
        bonusReason: string;
        createdAt: string;
      };
      totalPoints: number;
    }>('/checkin', {
      method: 'POST',
      body: JSON.stringify({ businessId, method }),
    });
  }

  async getCheckInHistory(businessId?: string) {
    const query = businessId ? `?businessId=${businessId}` : '';
    return this.request<{
      checkIns: Array<{
        id: string;
        business: {
          id: string;
          name: string;
          logoUrl: string | null;
        };
        points: number;
        method: string;
        bonusReason: string;
        createdAt: string;
      }>;
    }>(`/checkin/history${query}`);
  }

  // Points endpoints
  async getUserPoints(businessId?: string) {
    const query = businessId ? `?businessId=${businessId}` : '';
    return this.request<{
      points: Array<{
        business: {
          id: string;
          name: string;
          logoUrl: string | null;
        };
        totalPoints: number;
        checkInCount: number;
        lastCheckIn: string | null;
      }>;
    }>(`/points${query}`);
  }

  // Rewards endpoints
  async getRewards(businessId: string) {
    return this.request<{
      rewards: Array<{
        id: string;
        name: string;
        description: string;
        pointsRequired: number;
        maxRedemptions: number | null;
        redemptionCount: number;
        available: boolean;
      }>;
    }>(`/rewards?businessId=${businessId}`);
  }

  async redeemReward(rewardId: string, businessId: string) {
    return this.request<{
      message: string;
      redemption: {
        id: string;
        reward: {
          name: string;
          description: string;
        };
        pointsUsed: number;
        remainingPoints: number;
        createdAt: string;
      };
    }>('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ rewardId, businessId }),
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
  redeemReward: (cardId: string) => apiService.redeemCardReward(cardId),
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

export const tapService = {
  createTapIntent: (barId: string) => apiService.createTapIntent(barId),
  getTapIntent: (tapIntentId: string) => apiService.getTapIntent(tapIntentId),
  addStampFromTap: (tapIntentId: string) => apiService.addStampFromTap(tapIntentId),
};

export const checkinService = {
  createCheckIn: (businessId: string, method?: 'nfc' | 'code' | 'manual') =>
    apiService.createCheckIn(businessId, method),
  getCheckInHistory: (businessId?: string) => apiService.getCheckInHistory(businessId),
};

export const pointsService = {
  getUserPoints: (businessId?: string) => apiService.getUserPoints(businessId),
};

export const rewardService = {
  getRewards: (businessId: string) => apiService.getRewards(businessId),
  redeemReward: (rewardId: string, businessId: string) =>
    apiService.redeemReward(rewardId, businessId),
};

