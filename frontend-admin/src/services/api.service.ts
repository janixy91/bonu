const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
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
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
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
  togglePromoCardActive: (cardId: string, active: boolean) => apiService.togglePromoCardActive(cardId, active),
};

export const businessOwnerService = {
  getMyBusiness: () => apiService.getMyBusiness(),
  updateMyBusiness: (data: any) => apiService.updateMyBusiness(data),
};

export const codeService = {
  generateCodes: (data: any) => apiService.generateCodes(data),
  getBusinessCodes: (businessId: string) => apiService.getBusinessCodes(businessId),
};

