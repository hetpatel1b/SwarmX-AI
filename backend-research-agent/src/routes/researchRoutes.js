const express = require("express");
const { createResearch } = require("../controllers/researchController");

const router = express.Router();

router.post("/", createResearch);

module.exports = router;
