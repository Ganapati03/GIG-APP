// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://gig-backend-5bw1.onrender.com';

/**
 * API Client with automatic cookie handling
 */
class ApiClient {
  constructor(baseURL = API_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important: Include cookies
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient();

// Auth API
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  getMe: () => api.get('/api/auth/me'),
};

// Gig API
export const gigAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/api/gigs${query ? `?${query}` : ''}`);
  },
  getById: (id) => api.get(`/api/gigs/${id}`),
  create: (data) => api.post('/api/gigs', data),
  getMyPosted: () => api.get('/api/gigs/my/posted'),
  delete: (id) => api.delete(`/api/gigs/${id}`),
};

// Bid API
export const bidAPI = {
  create: (data) => api.post('/api/bids', data),
  getForGig: (gigId) => api.get(`/api/bids/${gigId}`),
  getMyBids: () => api.get('/api/bids/my/submitted'),
  hire: (bidId) => api.patch(`/api/bids/${bidId}/hire`),
};

// Chatbot API
export const chatbotAPI = {
  chat: (data) => api.post('/api/chatbot', data),
  suggestBid: (data) => api.post('/api/chatbot/suggest-bid', data),
  analyzeGig: (data) => api.post('/api/chatbot/analyze-gig', data),
};

// Message API
export const messageAPI = {
  startConversation: (data) => api.post('/api/messages/conversations', data),
  getConversations: () => api.get('/api/messages/conversations'),
  getMessages: (conversationId) => api.get(`/api/messages/${conversationId}`),
  sendMessage: (data) => api.post('/api/messages', data),
};
