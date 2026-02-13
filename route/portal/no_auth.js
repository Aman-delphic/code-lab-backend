const express = require('express');
const router = express.Router();
require('dotenv/config');

const controller_no_auth = require("../../controller/portal/no_auth");


router.post("/signup", controller_no_auth.signup);
router.post("/login", controller_no_auth.login);

module.exports = router;