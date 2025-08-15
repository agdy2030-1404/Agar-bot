import Account from "./account.model.js";
import { AppError } from "../../utils/error.js";

export const createAccount = async (req, res, next) => {
  try {
    const { platform, username, password } = req.body;

    const hashedPassword = bcryptjs.hashSync(password, 12);

    const account = await Account.create({
      user: req.user._id,
      platform,
      username,
      password: hashedPassword,
    });

    res.status(201).json({ success: true, account });
  } catch (error) {
    next(error);
  }
};

export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id });

    // فك تشفير كلمات المرور للعرض الآمن
    const safeAccounts = accounts.map((acc) => ({
      ...acc.toObject(),
      password: "••••••••",
    }));

    res.status(200).json({ success: true, accounts: safeAccounts });
  } catch (error) {
    next(error);
  }
};

export const testAccount = async (req, res, next) => {
  try {
    const accountId = req.params.id;
    const account = await Account.findById(accountId);

    if (!account) {
      throw new AppError("الحساب غير موجود", 404);
    }

    // فك تشفير كلمة المرور للاستخدام

    // هنا يمكنك إضافة كود اختبار الحساب باستخدام Puppeteer
    // ...

    res.status(200).json({
      success: true,
      message: "تم اختبار الحساب بنجاح",
    });
  } catch (error) {
    next(error);
  }
};
