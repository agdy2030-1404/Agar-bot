const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getActivities = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_URL}/api/activities?${query}`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch activities');
  return response.json();
};

export const getRecentActivities = async () => {
  const response = await fetch(`${API_URL}/api/activities/recent`, {
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Failed to fetch recent activities');
  return response.json();
};

