import axios from 'axios';
import { mockProducts, mockNotifications } from './mockData';

const baseURL = import.meta.env.VITE_BASE_URL || '';

// Mock response resolver for seamless local frontend development & Vercel demo
const handleMockResponse = (config) => {
  const url = config.url || '';
  const params = config.params || {};

  // Extract query parameters if URL contains them
  let queryParams = { ...params };
  if (url.includes('?')) {
    const searchParams = new URLSearchParams(url.split('?')[1]);
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }
  }

  // Parse body if present
  let bodyData = {};
  if (config.data) {
    try {
      bodyData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      bodyData = {};
    }
  }

  // 1. Auth Login Endpoint
  if (url.includes('/api/v1/auth/login')) {
    const email = bodyData.email || 'user@ruet.ac.bd';
    const isAdmin = email.toLowerCase().includes('admin');

    const mockUser = {
      id: isAdmin ? 'admin-1' : 'user-1',
      name: isAdmin ? 'Admin Brittoo' : 'Ashikul Islam',
      email: email,
      roll: isAdmin ? 'ADMIN' : '1903001',
      role: isAdmin ? 'ADMIN' : 'USER',
      phoneNumber: '+8801712345678',
      isVerified: 'VERIFIED',
      brittooVerified: true,
      emailVerified: true,
      securityScore: 'VERY_HIGH',
    };

    return {
      data: {
        success: true,
        message: 'Login successful',
        token: isAdmin ? 'mock-jwt-admin-token-xyz' : 'mock-jwt-user-token-xyz',
        user: mockUser,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 2. Auth Register Endpoint
  if (url.includes('/api/v1/auth/register')) {
    return {
      data: {
        success: true,
        message: 'Account created successfully! You can now log in.',
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 3. Products endpoint
  if (url.includes('/api/v1/products')) {
    const productId = queryParams.productId || queryParams.id;
    if (productId) {
      const product = mockProducts.find((p) => p.id === productId) || mockProducts[0];
      return {
        data: {
          products: product ? [product] : [mockProducts[0]],
          totalPages: 1,
          total: 1,
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };
    }

    let filtered = [...mockProducts];

    if (queryParams.search) {
      const q = queryParams.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.tags.toLowerCase().includes(q) ||
          p.productDescription.toLowerCase().includes(q)
      );
    }

    if (queryParams.productType) {
      filtered = filtered.filter((p) => p.productType === queryParams.productType);
    }

    if (queryParams.productCondition) {
      filtered = filtered.filter((p) => p.productCondition === queryParams.productCondition);
    }

    if (queryParams.productAge) {
      const ageNum = parseInt(queryParams.productAge, 10);
      if (!isNaN(ageNum)) {
        filtered = filtered.filter((p) => p.productAge <= ageNum);
      }
    }

    if (queryParams.prompt) {
      const promptText = queryParams.prompt.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(promptText) ||
          p.tags.toLowerCase().includes(promptText) ||
          p.productType.toLowerCase().includes(promptText)
      );
      if (filtered.length === 0) {
        filtered = mockProducts.slice(0, 4);
      }
    }

    const page = parseInt(queryParams.page || '1', 10);
    const limit = parseInt(queryParams.limit || '12', 10);
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filtered.slice(startIndex, startIndex + limit);

    return {
      data: {
        products: paginatedProducts,
        totalPages: Math.ceil(filtered.length / limit) || 1,
        total: filtered.length,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 4. User Total Credits endpoint
  if (url.includes('/api/v1/users/total-credits')) {
    return {
      data: {
        success: true,
        data: {
          totalAvailableBcc: 1250,
          totalAvailableRcc: 480,
          lockedBalance: 0,
          requestedForWithdrawal: 0,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 5. User Dashboard Overview
  if (url.includes('/api/v1/user-dashboard/overview') || url.includes('/api/v1/user-dash/')) {
    return {
      data: {
        success: true,
        data: {
          user: {
            id: 'user-1',
            name: 'Ashikul Islam',
            email: 'user@ruet.ac.bd',
            roll: '1903001',
            isVerified: 'VERIFIED',
            brittooVerified: true,
            securityScore: 'VERY_HIGH',
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          },
          stats: {
            totalListings: 4,
            activeRentals: 2,
            totalEarningsBcc: 3450,
            totalWithdrawnRcc: 1200,
          },
          recentActivity: [
            { id: 'act-1', type: 'RENTAL_REQUEST', text: 'Rental request received for Sony A7 IV', date: '2 hours ago' },
            { id: 'act-2', type: 'CREDIT_EARNED', text: 'Earned 450 BCC from item rental', date: 'Yesterday' },
          ],
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 6. Admin Analytics / Overview
  if (url.includes('/api/v1/admin-dash/analytics') || url.includes('/api/v1/admin-dash/')) {
    return {
      data: {
        success: true,
        data: {
          totalUsers: 1420,
          verifiedUsers: 1280,
          totalProducts: 385,
          activeRentals: 84,
          totalTransactionsBDT: 850000,
          monthlyGrowth: 28.5,
          monthlyStats: [
            { month: 'Jan', rentals: 45, volume: 42000 },
            { month: 'Feb', rentals: 68, volume: 61000 },
            { month: 'Mar', rentals: 95, volume: 88000 },
            { month: 'Apr', rentals: 120, volume: 115000 },
            { month: 'May', rentals: 160, volume: 154000 },
            { month: 'Jun', rentals: 210, volume: 198000 },
          ],
          categoryBreakdown: [
            { name: 'Gadgets', value: 38 },
            { name: 'Vehicles', value: 24 },
            { name: 'Electronics', value: 18 },
            { name: 'Books', value: 12 },
            { name: 'Furniture', value: 8 },
          ],
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 7. Notifications endpoint
  if (url.includes('/api/v1/notifications')) {
    return {
      data: {
        success: true,
        data: mockNotifications,
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // 8. Coupons validation endpoint
  if (url.includes('/api/v1/coupons')) {
    return {
      data: {
        success: true,
        data: {
          code: 'BRITTOO20',
          discount: 20,
        },
      },
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  }

  // Default fallback response
  return {
    data: {
      success: true,
      message: 'Mock fallback response',
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
  };
};

const api = axios.create({
  baseURL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  adapter: !baseURL ? async (config) => handleMockResponse(config) : undefined,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Use real response if backend is active, else use mock fallback
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && response.data.includes('<!doctype html')) {
      return handleMockResponse(response.config);
    }
    return response;
  },
  (error) => {
    if (
      !error.response ||
      error.code === 'ERR_NETWORK' ||
      error.code === 'ECONNREFUSED' ||
      error.response.status === 404 ||
      error.response.status === 502 ||
      error.response.status === 503
    ) {
      console.info('Using mock fallback for:', error.config?.url);
      return Promise.resolve(handleMockResponse(error.config || {}));
    }
    return Promise.reject(error);
  }
);

export default api;
