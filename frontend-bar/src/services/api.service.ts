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

