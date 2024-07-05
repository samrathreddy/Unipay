// paymentRoute.js
const express = require('express');
const { checkout, paymentVerification } = require('../controllers/paymentcontroller.js');

const router = express.Router();

router.route("/checkout").post(checkout);
router.route("/paymentverification").post(paymentVerification);

module.exports = router;
