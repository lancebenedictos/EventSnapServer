require("dotenv").config();
require("./database/mongo").connectDb();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app = express();
const authRoutes = require("./routes/auth");

app.use(express.json(), cors(), cookieParser());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/api/auth", authRoutes);

app.listen(4000);
