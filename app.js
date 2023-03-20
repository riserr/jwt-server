const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

//import users routes
const usersRouter = require("./routes/users");

const app = express();

//variable for database
const urlDb = "mongodb://localhost:27017/jwt-server";
const port = 9000;

//connect to mongodb
mongoose.connect(urlDb).then(() => {
  app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  });
  app.on("error", () => {
    console.log("Database connection fail");
  });
});

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//call users router
app.use("/users", usersRouter);

module.exports = app;
