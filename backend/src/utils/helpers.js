export const formatZodError = (error) => {
  return error.errors.map((err) => ({
    field: err.path.join("."), // e.g., "email"
    message: err.message, // e.g., "Invalid email"
  }));
};
