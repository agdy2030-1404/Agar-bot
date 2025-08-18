// services/bot.service.js

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const initializeBot = async () => {
  const response = await fetch(`${API_URL}/api/bot/init`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to initialize bot");
  return response.json();
};

export const updateBotSettings = async (settings) => {
  const response = await fetch(`${API_URL}/api/bot/settings`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) throw new Error("Failed to update bot settings");
  return response.json();
};

export const addReplyTemplate = async (template) => {
  const response = await fetch(`${API_URL}/api/bot/templates`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(template),
  });

  if (!response.ok) throw new Error("Failed to add reply template");
  return response.json();
};

export const getBotStatus = async () => {
  const response = await fetch(`${API_URL}/api/bot/status`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error("Failed to fetch bot status");
  return response.json();
};
