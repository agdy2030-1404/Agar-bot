const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const getDashboardData = async () => {
  try {
    const res = await fetch(`${API_URL}/api/dashboard`, {
      method: "GET",
      credentials: "include", // لإرسال الكوكيز تلقائيًا
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to fetch dashboard data");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};
