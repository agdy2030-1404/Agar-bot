export const formatZodError = (error) => {
  return error.errors.map((err) => ({
    field: err.path.join("."), // e.g., "email"
    message: err.message, // e.g., "Invalid email"
  }));
};

export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// تأخير التنفيذ
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// تشفير النصوص
export const encrypt = (text) => {
  return Buffer.from(text).toString("base64");
};

// فك التشفير
export const decrypt = (text) => {
  return Buffer.from(text, "base64").toString("utf-8");
};
