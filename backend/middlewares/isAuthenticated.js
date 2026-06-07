const jwt = require("jsonwebtoken");
const { EMPLOYEE_ROLES } = require("../constants/employeeRoles");

const isAuthenticated = (req, res, next) => {
  const SECRETE_KEY = process.env.SECRET_KEY;
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Authorization token is required" });
    }
    jwt.verify(token, SECRETE_KEY, (err, user) => {
      if (err) {
        res.status(401).json(err);
      } else {
        req.user = user;
        next();
      }
    });
  } catch (err) {
    return res.status(401).json(err);
  }
};

const requireManager = (req, res, next) => {
  if (req.user?.role !== EMPLOYEE_ROLES.MANAGER) {
    return res.status(403).json({ message: "Manager access required" });
  }
  next();
};

module.exports = {
  isAuthenticated,
  requireManager,
};
