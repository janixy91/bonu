const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
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

  // Promo Card endpoints
  async createPromoCard(data: {
    businessId: string;
    title: string;
    description?: string;
    type: 'unlimited' | 'limited';
    limit?: number;
    benefitType: string;
    expiresAt?: string;
  }) {
    return this.request<{ message: string; card: any }>('/promo-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPromoCards(businessId: string) {
    return this.request<{
      cards: any[];
      total: number;
      active: number;
      inactive: number;
      soldOut: number;
    }>(`/promo-cards?businessId=${businessId}`);
  }

  async getPromoCard(id: string) {
    return this.request<{
      card: any;
      statistics: {
        totalCodes: number;
        usedCodes: number;
        unusedCodes: number;
        percentageUsed: number;
        remaining: number | null;
        percentageRemaining: number | null;
      };
    }>(`/promo-cards/${id}`);
  }

  async updatePromoCard(id: string, data: {
    title?: string;
    description?: string;
    benefitType?: string;
    expiresAt?: string;
    limit?: number;
  }) {
    return this.request<{ message: string; card: any }>(`/promo-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async togglePromoCardActive(id: string, active: boolean) {
    return this.request<{ message: string; card: any }>(`/promo-cards/${id}/activate`, {
      method: 'PATCH',
      body: JSON.stringify({ active }),
    });
  }

  async addStock(id: string, amount: number) {
    return this.request<{ message: string; card: any }>(`/promo-cards/${id}/add-stock`, {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    });
  }

  async deletePromoCard(id: string) {
    return this.request<{ message: string }>(`/promo-cards/${id}`, {
      method: 'DELETE',
    });
  }

  // Get business info
  async getMyBusiness() {
    return this.request<{ business: any }>('/business-owner/my-business');
  }

  // Generate codes for a promo card
  async generateCodesForCard(data: {
    businessId: string;
    promoCardId: string;
    benefitName: string;
    expirationDate: string;
    count: number;
  }) {
    return this.request<{ message: string; codes: any[] }>('/codes/generate', {
      method: 'POST',
      body: JSON.stringify(data),
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

export const promoCardService = {
  createPromoCard: (data: any) => apiService.createPromoCard(data),
  getPromoCards: (businessId: string) => apiService.getPromoCards(businessId),
  getPromoCard: (id: string) => apiService.getPromoCard(id),
  updatePromoCard: (id: string, data: any) => apiService.updatePromoCard(id, data),
  togglePromoCardActive: (id: string, active: boolean) => apiService.togglePromoCardActive(id, active),
  addStock: (id: string, amount: number) => apiService.addStock(id, amount),
  deletePromoCard: (id: string) => apiService.deletePromoCard(id),
};

export const businessService = {
  getMyBusiness: () => apiService.getMyBusiness(),
};

export const codeService = {
  generateCodesForCard: (data: any) => apiService.generateCodesForCard(data),
};

