var express = require("express");
const { getOneFoodById, getAllFood } = require("../services/food.service");

var router = express.Router();

router.get("/:foodId", async (req, res) => {
  let foodId = req?.params?.foodId;
  let response = await getOneFoodById(foodId);
  res.json(response);
});

router.get("/", async (req, res) => {
  let response = await getAllFood();
  res.json(response);
});

module.exports = router;
