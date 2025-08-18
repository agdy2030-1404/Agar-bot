const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getStats = async () => {
  try {
    const res = await fetch(`${API_URL}/api/stats`, {
      method: "GET",
      credentials: "include", // لإرسال الكوكيز تلقائيًا
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch stats");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching stats:", error);
    throw error;
  }
};
