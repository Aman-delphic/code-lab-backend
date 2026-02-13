const express = require('express');
const router = express.Router();
require('dotenv/config');

const controller_no_auth = require("../../controller/app/no_auth");


router.post("/signup", controller_no_auth.signup);
router.post("/login", controller_no_auth.login);
router.get("/home", controller_no_auth.fetch_home);
router.get("/brand", controller_no_auth.fetch_brands);
router.get("/deals", controller_no_auth.fetch_deals);
router.get("/file/:file", controller_no_auth.fetch_file)
router.get("/country", controller_no_auth.fetch_country);
router.get("/banner", controller_no_auth.fetch_banner);
router.get("/store/deals", controller_no_auth.fetch_store_deals);
router.get("/refer/:referral_code", controller_no_auth.referral_link_clicked)
router.get("/categories", controller_no_auth.fetch_categories);
router.get("/carousel", controller_no_auth.fetch_carousel);
router.post("/contect-us", controller_no_auth.contect_us);
//router.post("/test", controller_no_auth.test);

module.exports = router;