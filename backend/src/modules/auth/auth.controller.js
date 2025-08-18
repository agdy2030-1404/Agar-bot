// auth.controller.js
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import User from "./auth.model.js";
import { errorHandler } from "../../utils/error.js";

export const register = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, "البريد الإلكتروني مسجل مسبقاً"));
    }

    const hashedPassword = bcryptjs.hashSync(password, 12);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // إنشاء توكن بدون كلمة المرور في الرد
    const token = jwt.sign(
      { id: newUser._id, isAdmin: newUser.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = newUser._doc;

    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None", // حتى يُسمح له بالعمل بين دومينات مختلفة
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 أيام
      })
      .json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const validUser = await User.findOne({ email });
    if (!validUser) {
      return next(errorHandler(404, "المستخدم غير موجود"));
    }

    const validPassword = bcryptjs.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler(401, "بيانات الدخول غير صحيحة"));
    }

    const token = jwt.sign(
      { id: validUser._id, isAdmin: validUser.isAdmin, name: validUser.name },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...userWithoutPassword } = validUser._doc;

    res
      .status(200)
      .cookie("access_token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  res.clearCookie("access_token").status(200).json("تم تسجيل الخروج بنجاح");
};
export const getUnreadNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const unreadCount = user.notifications.filter((n) => !n.read).length;

    res
      .status(200)
      .json({ success: true, unreadCount, notifications: user.notifications });
  } catch (error) {
    next(error);
  }
};

// وضع إشعار كمقروء
export const markNotificationRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { notificationId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "المستخدم غير موجود" });

    const notification = user.notifications.id(notificationId);
    if (!notification)
      return res.status(404).json({ message: "الإشعار غير موجود" });

    notification.read = true;
    await user.save();

    res.status(200).json({ success: true, message: "تم وضع الإشعار كمقروء" });
  } catch (error) {
    next(error);
  }
};
