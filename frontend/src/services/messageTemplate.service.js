// services/messageTemplate.service.js
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || "Request failed");
  }
  return res.json();
};

export const getTemplates = async () => {
  const res = await fetch(`${API_URL}/api/templates`, {
    credentials: "include",
  });
  return handleResponse(res);
};

export const createTemplate = async (template) => {
  const res = await fetch(`${API_URL}/api/templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
    credentials: "include",
  });
  return handleResponse(res);
};

export const updateTemplate = async (id, template) => {
  const res = await fetch(`${API_URL}/api/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(template),
    credentials: "include",
  });
  return handleResponse(res);
};

export const deleteTemplateApi = async (id) => {
  const res = await fetch(`${API_URL}/api/templates/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
};

export const searchTemplates = async (query) => {
  const res = await fetch(
    `${API_URL}/api/templates/search?query=${encodeURIComponent(query)}`,
    {
      credentials: "include",
    }
  );
  return handleResponse(res);
};
