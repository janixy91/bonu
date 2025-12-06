const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
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

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
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
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      const httpError: any = new Error(error.error || `HTTP error! status: ${response.status}`);
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

