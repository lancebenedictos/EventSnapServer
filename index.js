require("dotenv").config();
require("./database/mongo").connectDb();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorHandler");
const app = express();
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events");
const userRoutes = require("./routes/users");
const resourcesRoutes = require("./routes/resources");

app.use(express.json(), cookieParser());
const origin =
  process.env.NODE_ENV === "production"
    ? "https://eventsnap.vercel.app"
    : "http://localhost:5173";
app.use(cors({ origin, credentials: true }));

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resources", resourcesRoutes);

app.use(errorHandler);

app.listen(process.env.PORT || 4000);
