var express = require("express");
const {
  userRegister,
  userLogin,
  checkUserExist
} = require("../services/authentication.service");
var router = express.Router();

router.post("/register", async (req, res, next) => {
  let body = req.body;
  let response = await userRegister(body);
  res.json(response);
});

router.post("/login", async (req, res, next) => {
  let body = req.body;
  let response = await userLogin(body);
  res.json(response);
});

router.get("/user-exist", async (req, res, next) => {
  let params = req.query;
  let response = await checkUserExist(params);
  res.json(response);
});

module.exports = router;
