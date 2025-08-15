import { formatZodError } from "../utils/helpers.js";

export const validateZod = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body); // Validate request body
    next(); // Proceed to the next middleware if validation passes
  } catch (error) {
    // Handle validation errors
    const formattedErrors = formatZodError(error);
    return res.status(400).json({ success: false, errors: formattedErrors }); // Send a response without calling next()
  }
};