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
    const stored = localStorage.getItem('bonu-admin-auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed.state?.token;
        if (token) {
          return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
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
    // With the new JWT system, tokens are long-lived (90 days)
    // If we get a 401/403, the token is invalid or expired
    // Just logout - no refresh token available
    
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
      let errorData;
      let errorMessage = '';
      
      try {
        errorData = await response.json();
        errorMessage = errorData.error || errorData.message || '';
      } catch (e) {
        // If response is not JSON, use status text
        errorMessage = response.statusText || 'Unknown error';
      }
      
      console.error(`[API] Error ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        errorMessage,
        errorData
      });
      
      // Don't try to refresh token for auth endpoints (login, register, etc.)
      const isAuthEndpoint = endpoint.startsWith('/auth/login') || 
                            endpoint.startsWith('/auth/register') ||
                            endpoint.startsWith('/auth/logout');
      
      // Handle 401 Unauthorized or 403 Forbidden with token expiration
      const isTokenExpired = !isAuthEndpoint && (
                            response.status === 401 || 
                            (response.status === 403 && (
                              errorMessage.toLowerCase().includes('token expired') ||
                              errorMessage.toLowerCase().includes('expired') ||
                              errorMessage.toLowerCase().includes('invalid token')
                            )));
      
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

      // For auth endpoints, use the error message from backend
      // For other endpoints, provide more context
      const finalErrorMessage = errorMessage || 
        (response.status === 401 ? 'Credenciales inválidas' : 
         response.status === 403 ? 'No tienes permisos' :
         `Error ${response.status}: ${response.statusText}`);
      
      const httpError: any = new Error(finalErrorMessage);
      httpError.status = response.status;
      throw httpError;
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{
      user: { id: string; email: string; name: string; role: string };
      token: string;
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
      registrations: any[];
      total: number;
    }>(`/pilot/registrations${query}`);
  }

  async approvePilotRegistration(registrationId: string) {
    return this.request<{
      message: string;
      data: {
        user: {
          id: string;
          email: string;
          name: string;
          role: string;
        };
        business: {
          id: string;
          name: string;
          description: string;
        };
        temporaryPassword: string;
        emailSent: boolean;
      };
    }>(`/pilot/registrations/${registrationId}/approve`, {
      method: 'POST',
    });
  }

  // Tap/NFC endpoints (public)
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
  getBusinessCheckIns: (businessId: string, params?: { limit?: number; offset?: number; startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    const query = queryParams.toString();
    return apiService.request<{ checkIns: any[]; total: number; limit: number; offset: number }>(
      `/admin/businesses/${businessId}/checkins${query ? `?${query}` : ''}`
    );
  },
  getBusinessStats: (businessId: string) => 
    apiService.request<{ business: any; stats: any; topCustomers: any[] }>(`/admin/businesses/${businessId}/stats`),
  // Legacy promo card methods - kept for backward compatibility but not used
  createPromoCard: (data: any) => apiService.createPromoCard(data),
  getPromoCard: (cardId: string) => apiService.getPromoCard(cardId),
  updatePromoCard: (cardId: string, data: any) => apiService.updatePromoCard(cardId, data),
  deletePromoCard: (cardId: string) => apiService.deletePromoCard(cardId),
  togglePromoCardActive: (cardId: string, active: boolean) => apiService.togglePromoCardActive(cardId, active),
};

export const businessOwnerService = {
  getMyBusiness: () => apiService.getMyBusiness(),
  updateMyBusiness: (data: any) => apiService.updateMyBusiness(data),
  getBusinessStats: (businessId: string) => 
    apiService.request<{ business: any; stats: any; topCustomers: any[] }>(`/business/${businessId}/stats`),
  // Legacy tarjeta methods - kept for backward compatibility but not used
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
  approvePilotRegistration: (registrationId: string) => 
    apiService.approvePilotRegistration(registrationId),
};

export const tapService = {
  createTapIntent: (barId: string) => apiService.createTapIntent(barId),
};

