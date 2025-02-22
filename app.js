require("dotenv").config();
require("express-async-errors");

//security packages
const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");
const rateLimiter = require("express-rate-limit");

const express = require("express");
const app = express();

//connect DB
const connectDB = require("./db/connect");
const authenticateUser = require("./middleware/authentication");

//routers
const authRouter = require("./routes/auth");
const projectsRouter = require("./routes/projects");

//error handlers
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

//security packages
app.set("trust proxy", 1); // used when app is behind a reverse proxy
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, //15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);

app.use(express.json());

app.use(express.static("public"));

app.use(helmet());
app.use(cors());
app.use(xss());

//routes
app.use("/auth", authRouter);
app.use("/projects", authenticateUser, projectsRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
