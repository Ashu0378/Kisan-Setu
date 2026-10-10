const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const cropPlanService = {
  /**
   * Get ML Crop Suitability Recommendations
   */
  getRecommendations: async (soilData) => {
    const res = await fetch(`${API_URL}/crop-plans/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(soilData),
    });
    return handleResponse(res);
  },

  /**
   * Find Nearest Soil Testing Labs / KVKs
   */
  findNearestLab: async (locationData) => {
    const res = await fetch(`${API_URL}/crop-plans/nearest-lab`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(locationData),
    });
    return handleResponse(res);
  },

  /**
   * Save Crop Plan to User Account
   */
  saveCropPlan: async (planData, token) => {
    const res = await fetch(`${API_URL}/crop-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(planData),
    });
    return handleResponse(res);
  },

  /**
   * Get Saved Crop Plans
   */
  getSavedPlans: async (token) => {
    const res = await fetch(`${API_URL}/crop-plans`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return handleResponse(res);
  },
};
