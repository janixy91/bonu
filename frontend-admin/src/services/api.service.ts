// API Base URL configuration
// In production, set VITE_API_URL in Heroku config vars
// Example: heroku config:set VITE_API_URL=https://bonu-backend-4d28f40884c3.herokuapp.com/api
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private logoutCallback: (() => void) | null = null;

  setLogoutCallback(callback: () => void) {
    this.logoutCallback = callback;
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('bonu-admin-auth');
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
    const token = localStorage.getItem('bonu-admin-auth');
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
              localStorage.setItem('bonu-admin-auth', JSON.stringify(updatedParsed));
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
    localStorage.removeItem('bonu-admin-auth');
    
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
      user: { id: string; email: string; name: string; role: string };
      accessToken: string;
      refreshToken: string;
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Admin endpoints
  async getAllBusinesses() {
    return this.request<{ businesses: any[] }>('/admin/businesses');
  }

  async createBusiness(data: {
    name: string;
    description?: string;
    logoUrl?: string;
    ownerEmail: string;
    firstCard: {
      title: string;
      description?: string;
      totalStamps: number;
      rewardText: string;
    };
  }) {
    return this.request<{
      message: string;
      business: any;
      initialCard?: any;
      temporaryPassword?: string;
      ownerEmail: string;
      isNewUser?: boolean;
    }>('/admin/businesses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBusiness(id: string) {
    return this.request<{ business: any; promoCards?: any[] }>(`/admin/businesses/${id}`);
  }

  async updateBusiness(id: string, data: {
    name: string;
    description?: string;
    logoUrl?: string;
  }) {
    return this.request<{ message: string; business: any }>(`/admin/businesses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBusiness(id: string) {
    return this.request<{ message: string }>(`/admin/businesses/${id}`, {
      method: 'DELETE',
    });
  }

  async createPromoCard(data: {
    businessId: string;
    nombre: string;
    descripcion?: string;
    tipo: string;
    limiteTotal?: number | null;
    valorRecompensa: string;
  }) {
    return this.request<{ message: string; promoCard: any }>('/admin/promo-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPromoCard(cardId: string) {
    return this.request<{ promoCard: any }>(`/admin/promo-cards/${cardId}`);
  }

  async updatePromoCard(cardId: string, data: {
    nombre?: string;
    descripcion?: string;
    tipo?: string;
    limiteTotal?: number | null;
    valorRecompensa?: string;
  }) {
    return this.request<{ message: string; promoCard: any }>(`/admin/promo-cards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePromoCard(cardId: string) {
    return this.request<{ message: string }>(`/admin/promo-cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  async togglePromoCardActive(cardId: string, active: boolean) {
    return this.request<{ message: string; promoCard: any }>(`/admin/promo-cards/${cardId}/activate`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  }

  // Business owner endpoints
  async getMyBusiness() {
    return this.request<{ business: any }>('/business-owner/my-business');
  }

  async updateMyBusiness(data: {
    name?: string;
    description?: string;
    logoUrl?: string;
    totalStamps?: number;
    rewardText?: string;
  }) {
    return this.request<{ message: string; business: any }>('/business-owner/my-business', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Code endpoints
  async generateCodes(data: {
    businessId: string;
    benefitName: string;
    expirationDate: string;
    count: number;
  }) {
    return this.request<{
      message: string;
      codes: Array<{
        id: string;
        code: string;
        benefitName: string;
        expirationDate: string;
      }>;
    }>('/codes/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBusinessCodes(businessId: string) {
    return this.request<{
      codes: Array<{
        id: string;
        code: string;
        benefitName: string;
        expirationDate: string;
        used: boolean;
        usedAt: string | null;
        createdAt: string;
      }>;
      total: number;
      used: number;
      unused: number;
    }>(`/codes/business/${businessId}`);
  }

  // Pilot registration endpoint (no auth required)
  async registerPilot(data: {
    businessName: string;
    email: string;
    contactName: string;
    address: string;
  }) {
    return this.request<{
      message: string;
      data: {
        id: string;
        businessName: string;
        email: string;
        contactName: string;
        address: string;
      };
    }>('/pilot/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false); // No retry on 401 for public endpoint
  }

  // Admin: Get pilot registrations
  async getPilotRegistrations(status?: 'pending' | 'approved' | 'rejected') {
    const query = status ? `?status=${status}` : '';
    return this.request<{
      registrations: Array<{
        _id: string;
        businessName: string;
        email: string;
        contactName: string;
        address: string;
        status: string;
        notes?: string;
        createdAt: string;
        updatedAt: string;
      }>;
      total: number;
    }>(`/pilot/registrations${query}`);
  }
}

export const apiService = new ApiService();

export const authService = {
  login: (email: string, password: string) => apiService.login(email, password),
};

export const adminService = {
  getAllBusinesses: () => apiService.getAllBusinesses(),
  createBusiness: (data: any) => apiService.createBusiness(data),
  getBusiness: (id: string) => apiService.getBusiness(id),
  updateBusiness: (id: string, data: any) => apiService.updateBusiness(id, data),
  deleteBusiness: (id: string) => apiService.deleteBusiness(id),
  createPromoCard: (data: any) => apiService.createPromoCard(data),
  getPromoCard: (cardId: string) => apiService.getPromoCard(cardId),
  updatePromoCard: (cardId: string, data: any) => apiService.updatePromoCard(cardId, data),
  deletePromoCard: (cardId: string) => apiService.deletePromoCard(cardId),
  togglePromoCardActive: (cardId: string, active: boolean) => apiService.togglePromoCardActive(cardId, active),
};

export const businessOwnerService = {
  getMyBusiness: () => apiService.getMyBusiness(),
  updateMyBusiness: (data: any) => apiService.updateMyBusiness(data),
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
  deleteTarjeta: (id: string) => apiService.request<{ message: string }>(`/business-owner/tarjetas/${id}`, {
    method: 'DELETE',
  }),
  desactivarTarjeta: (id: string, active?: boolean) => apiService.request<{ message: string; tarjeta: any }>(`/business-owner/tarjetas/${id}/desactivar`, {
    method: 'PATCH',
    body: JSON.stringify(active !== undefined ? { active } : {}),
  }),
};

export const codeService = {
  generateCodes: (data: any) => apiService.generateCodes(data),
  getBusinessCodes: (businessId: string) => apiService.getBusinessCodes(businessId),
};

export const pilotService = {
  registerPilot: (data: {
    businessName: string;
    email: string;
    contactName: string;
    address: string;
  }) => apiService.registerPilot(data),
};

export const adminPilotService = {
  getPilotRegistrations: (status?: 'pending' | 'approved' | 'rejected') => 
    apiService.getPilotRegistrations(status),
};

