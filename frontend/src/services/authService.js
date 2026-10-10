const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const authService = {
  /**
   * Register a new farmer account
   */
  register: async ({ name, phone, password, state, district, landSize, preferredLanguage }) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, password, state, district, landSize, preferredLanguage }),
    });
    return handleResponse(res);
  },

  /**
   * Login with phone + password
   */
  login: async ({ phone, password }) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password }),
    });
    return handleResponse(res);
  },

  /**
   * Fetch current logged-in user (validates token)
   */
  getMe: async (token) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  /**
   * Get user profile
   */
  getProfile: async (token) => {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData, token) => {
    const res = await fetch(`${API_URL}/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });
    return handleResponse(res);
  },
};
