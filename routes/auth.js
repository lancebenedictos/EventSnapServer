const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Organizer = require("../models/Organizer");
const { authenticate } = require("../middleware/auth");

router.post("/signup", async (req, res) => {
  const emailCheck = await Organizer.findOne({ email: req.body.email });

  if (emailCheck)
    return res.status(400).json({ message: "Email already exists" });

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const organizer = await Organizer.create({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    password: hashedPassword,
    email: req.body.email,
  });
  const token = jwt.sign({ _id: organizer._id }, process.env.JWT_SECRET);
  organizer.password = null;
  res
    .status(200)
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({ organizer });
});

router.get("/logout", async (req, res) => {
  return res.clearCookie("token").status(200).json({ organizer: null });
});

router.post("/login", async (req, res) => {
  const emailCheck = await Organizer.findOne(
    { email: req.body.email },
    "+password"
  );

  if (!emailCheck)
    return res.status(400).json({ message: "Incorrect email or password" });

  const validPassword = bcrypt.compareSync(
    req.body.password,
    emailCheck.password
  );

  if (!validPassword)
    return res.status(400).json({ message: "Incorrect email or password" });
  const token = jwt.sign({ _id: emailCheck._id }, process.env.JWT_SECRET);

  return res
    .status(200)
    .cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
    .json({ organizer: emailCheck });
});

router.get("/check", async (req, res) => {
  const { token } = req.cookies;

  if (!token) return res.json({ organizer: null });

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Organizer.findById(data._id);
    user.password = null;

    res.status(200).json({ organizer: user });
  } catch (err) {
    if (!token) return res.json({ organizer: null });
  }
});
module.exports = router;
