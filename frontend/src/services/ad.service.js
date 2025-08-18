const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const handleResponse = async (response) => {
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: `HTTP error! status: ${response.status}` };
    }
    throw new Error(errorData.message || "Request failed");
  }
  return response.json();
};

export const getAds = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/api/ads/getAds?${query}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await handleResponse(response);
    return { ads: data.ads, pagination: data.pagination };
  } catch (error) {
    console.error("Fetch ads error:", error);
    throw error;
  }
};

export const renewAd = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/ads/${id}/renew`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Renew ad error:", error);
    throw new Error(error.message || "Failed to renew ad");
  }
};

export const renewAllAds = async () => {
  try {
    const response = await fetch(`${API_URL}/api/ads/renew-all`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    return await handleResponse(response);
  } catch (error) {
    console.error("Renew all ads error:", error);
    throw new Error(error.message || "Failed to renew all ads");
  }
};

export const syncAds = async (platform) => {
  try {
    const response = await fetch(
      `${API_URL}/api/ads/sync?platform=${platform}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return await handleResponse(response);
  } catch (error) {
    console.error("Sync ads error:", error);
    throw new Error(error.message || "Failed to sync ads");
  }
};
