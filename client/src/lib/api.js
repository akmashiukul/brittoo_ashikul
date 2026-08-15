import axios from 'axios';
import { mockProducts, mockNotifications } from './mockData';

const baseURL = import.meta.env.VITE_BASE_URL || '';

// Mock response resolver for seamless local frontend development
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

  // 1. Products endpoint
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

  // 2. User Total Credits endpoint
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

  // 3. Notifications endpoint
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

  // 4. Coupons validation endpoint
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
