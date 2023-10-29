const jwt = require("jwt");
const Organizer = require("../models/Organizer");
exports.authenticate = function (req, res, next) {
  const { token } = req.cookies;

  if (!token) return res.status(401).json({ message: "Please login" });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);

    const user = Organizer.findById(data._id);
    req.user = user;
    next();
  } catch (err) {
    if (!token) return res.status(401).json({ message: "Please login" });
  }
};
