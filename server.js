const express = require("express");
const dotenv = require("dotenv");
const logger = require("./middleware/logger");
const path = require("path");
const morgan = require("morgan");
const connectDB = require("./config/db");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const geocoder = require("./utils/geocoder");
const cookieParser = require("cookie-parser");
const fileupload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const session= require('express-session');
const redisClient = require('./utils/redis');

const hpp = require('hpp');
dotenv.config({ path: "./config/config.env" });

// Connect to the database
connectDB();

// Route Files
const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const users = require("./routes/users");
const reviews = require("./routes/reviews");
const app = express();

// redis 




// Body Parser
app.use(express.json());

// Cookie middleware
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Set rate limit per user

const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
});
app.use(limiter);
// Hpp preventing the duplication of HTTP parameters
app.use(hpp());
// Enable Cors

app.use(cors());

// Prevent XSS attacks
app.use(xss());



// File Uploading
app.use(fileupload());
app.use(express.static(path.join(__dirname, "public")));

// Routers
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  )
);

// handel unhandeled promise rejection
process.on("unhandledRejection", (err, Promise) => {
  console.log(`Error: ${err.message}`);

  // close server & exist process
  server.close(() => process.exit(1));
});
