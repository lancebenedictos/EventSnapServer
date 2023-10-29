const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Organizer = require("../models/Organizer");

router.post("/register", async (req, res) => {
  const emailCheck = await Organizer.findOne({ email: req.body.email });
  console.log(req.body);
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

  res
    .status(200)
    .cookie("token", token, { httpOnly: true })
    .json({ data: { organizer } });
});

router.post("/login", async (req, res) => {
  const emailCheck = await Organizer.findOne({ email: req.body.email });
  if (!emailCheck)
    return res.status(400).json({ message: "Incorrect email or password" });

  const validPassword = await bcrypt.compare(
    req.body.password,
    emailCheck.password
  );

  if (!validPassword)
    return res.status(400).json({ message: "Incorrect email or password" });
  const token = jwt.sign({ _id: emailCheck._id }, process.env.JWT_SECRET);

  return res
    .status(200)
    .cookie("token", token, { httpOnly: true })
    .json({ data: { organizer: emailCheck } });
});

module.exports = router;
