// src/utils/verifyUser.js
import jwt from "jsonwebtoken";
import { errorHandler } from "../utils/error.js";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return next(errorHandler(401, "غير مصرح به"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(errorHandler(403, "توكن غير صالح"));
    }

    req.user = {
      id: decoded.id,
      name: decoded.name, // الآن الاسم موجود
      isAdmin: decoded.isAdmin,
      isHR: decoded.isHR,
      employeeId: decoded.employeeId,
    };

    next();
  });
};
