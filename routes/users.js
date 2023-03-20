const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const User = require("../users/model");

//Handling signin post request
const signin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "please provide email and password",
    });
  }

  const result = await User.findOne({ email });
  if (!result || result.password != password) {
    res.status(401).json({
      status: "error",
      message: "invalid credential",
    });
  }

  const token = jwt.sign({ email: result.email }, "jwtSecretKey", {
    expiresIn: "1h",
  });
  return token;
};

//Handling signup post request
const signup = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  if (password != confirmPassword) {
    res.status(400).json({
      status: "error",
      message: "password and confirmPassword must same",
    });
  }

  const result = await User.create({
    name,
    email,
    password,
  });

  delete result._doc.password;

  return result;
};

//Handling get access request
const getAccess = async (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {
      token = authHeader.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({
        status: "error",
        message: "invalid credential",
      });
    }

    const payload = jwt.verify(token, "jwtSecretKey");

    req.user = {
      email: payload.email,
    };

    next();
  } catch (err) {
    next(err);
  }
};

router.post("/signin", async (req, res, next) => {
  try {
    const loginUser = await signin(req, res);
    res.status(200).json({
      status: "success",
      data: { token: loginUser },
    });
  } catch (error) {
    next(error);
  }
});

router.post("/signup", async (req, res, next) => {
  try {
    const newUser = await signup(req, res);
    res.status(200).json({
      status: "success",
      data: newUser,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/access", getAccess, async (req, res, next) => {
  try {
    const result = await User.findOne({ email: req.user.email });
    delete result._doc.password;

    res.status(200).json({
      message: `${result.name} now accessing resources`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
