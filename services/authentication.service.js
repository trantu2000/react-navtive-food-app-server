const MongoDB = require("./mongodb.service");

const { mongoConfig, tokenSecret } = require("../config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { query } = require("express");
const config = require("../config");

const userRegister = async (user) => {
  try {
    if (!user?.username || !user?.email || !user?.password)
      return { status: false, message: "Vui lòng điền thông tin vào chỗ trống" };
    const passwordHash = await bcrypt.hash(user?.password, 10);
    let userObject = {
      username: user?.username,
      email: user?.email,
      password: passwordHash,
    };
    let savedUser = await MongoDB.db
      .collection(mongoConfig.collections.USERS)
      .insertOne(userObject);
    if (savedUser?.acknowledged && savedUser.insertedId) {
      let token = jwt.sign(
        { username: userObject?.username, email: userObject?.email },
        tokenSecret,
        { expiresIn: "24h" }
      );
      return {
        status: true,
        message: "USer registered successfully",
        data: token,
      };
    } else {
      return {
        status: false,
        message: "User registered failed",
      };
    }
  } catch (error) {
    let errorMessage = "User registered failed";
    error?.code === 11000 && error?.keyPattern?.username
      ? (errorMessage = "Tên người dùng đã tồn tại")
      : null;
    error?.code === 11000 && error?.keyPattern?.email
      ? (errorMessage = "Email đã tồn tại")
      : null;
    return {
      status: false,
      message: errorMessage,
      error: error?.toString(),
    };
  }
};

const userLogin = async (user) => {
  try {
    if (!user?.username || !user?.password)
      return { status: false, message: "Vui lòng điền thông tin vào chỗ trống" };
    let userObject = await MongoDB.db
      .collection(mongoConfig.collections.USERS)
      .findOne({ username: user?.username });
    if (userObject) {
      let isPasswordVerified = await bcrypt.compare(
        user?.password,
        userObject?.password
      );
      if (isPasswordVerified) {
        let token = jwt.sign(
          {
            username: userObject?.username,
            email: userObject?.email,
          },
          tokenSecret,
          { expiresIn: "24h" }
        );
        return {
          status: true,
          message: "User login successful",
          data: token,
        };
      } else {
        return {
          status: false,
          message: "Mật khẩu không đúng",
        };
      }
    } else {
      return {
        status: false,
        message: "Không tìm thấy tên người dùng",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      status: false,
      message: "User login failed",
      error: error?.toString(),
    };
  }
};

const checkUserExist = async (query) => {
  let message = {
    email: "Email đã tồn tại!",
    username: "Tên người đã tồn tại",
  };
  try {
    let queryType = Object.keys(query)[0];
    let userObject = await MongoDB.db
      .collection(mongoConfig.collections.USERS)
      .findOne(query);
    return !userObject
      ? { status: true, message: `This ${queryType} is not taken` }
      : { status: false, message: message[queryType] };
  } catch (error) {}
};

const tokenVerification = async (req, res, next) => {
  console.log(
    `authentication.service | tokenVerification | ${req?.originalUrl}`
  );
  try {
    if (
      req?.originalUrl.includes("/login") ||
      req?.originalUrl.includes("/user-exist") ||
      req?.originalUrl.includes("/register") ||
      req?.originalUrl.includes("/refresh-token")
    )
      return next();
    let token = req?.headers["authorization"];
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token?.length);
      jwt.verify(token, config.tokenSecret, (error, decoded) => {
        if (error) {
          res.status(401).json({
            status: false,
            message: error?.name ? error?.name : "Invalid Token",
            error: `Invalid token | ${error?.message}`,
          });
        } else {
          req["username"] = decoded?.username;
          next();
        }
      });
    } else {
      res.status(401).json({
        status: false,
        message: "Token is missing",
        error: "Token is missing",
      });
    }
  } catch (error) {
    res.status(401).json({
      status: false,
      message: error?.message ? error?.message : "Authentication failed",
      error: `Authentication failed | ${error?.message}`,
    });
  }
};

const tokenRefresh = async (req, res) => {
  console.log(`authentication.service | tokenRefresh | ${req?.originalUrl}`);
  try {
    let token = req?.headers["authorization"];
    if (token && token.startsWith("Bearer ")) {
      token = token.slice(7, token?.length);
      jwt.verify(
        token,
        config.tokenSecret,
        { ignoreExpiration: true },
        async (error, decoded) => {
          if (error) {
            res.status(401).json({
              status: false,
              message: error?.name ? error?.name : "Invalid Token",
              error: `Invalid token | ${error?.message}`,
            });
          } else {
            if (decoded?.username && decoded?.email) {
              let newToken = jwt.sign(
                { username: decoded?.username, email: decoded?.email },
                tokenSecret,
                { expiresIn: "24h" }
              );
              res.json({
                status: true,
                message: "Token refresh successful",
                data: newToken,
              });
            } else {
              res.status(401).json({
                status: false,
                message: error?.name ? error?.name : "Invalid Token",
                error: `Invalid token | ${error?.message}`,
              });
            }
          }
        }
      );
    } else {
      res.status(401).json({
        status: false,
        message: error?.name ? error?.name : "Token missing",
        error: `Token missing | ${error?.message}`,
      });
    }
  } catch (error) {
    res.status(401).json({
      status: false,
      message: error?.name ? error?.name : "Token refresh failed",
      error: `Token refresh failed | ${error?.message}`,
    });
  }
};

module.exports = {
  userRegister,
  userLogin,
  checkUserExist,
  tokenVerification,
  tokenRefresh,
};
