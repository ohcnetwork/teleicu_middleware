const jwt = require("jsonwebtoken");

// TEMP USER
const _tempUser = [
  {
    id: 1,
    email: "admin@tele_icu.com",
    password: "12345678",
  },
];

const verifyUser = (email, password) => {
  const user = _tempUser.find((u) => u.email === email);

  if (user?.password === password) return user;

  return undefined;
};

// AUTH MIDDLEWARE
const authUser = (req, res, next) => {
  try {
    if (
      !req.headers?.authorization ||
      !String(req.headers?.authorization).startsWith("Bearer ")
    )
      return res.status(401).json({ message: "Unauthorized User!" });

    const token = String(req.headers?.authorization).slice(7);

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = userId;

    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized User!" });
  }
};

// LOGIN CONTROLLER
const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Invalid Credentials" });

  const user = verifyUser(email, password);
  if (!user) return res.status(400).json({ message: "Invalid Credentials" });

  const token = jwt.sign(user, process.env.JWT_SECRET);

  return res.status(200).json({ token, user });
};

module.exports = { authUser, loginController };
