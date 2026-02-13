const mongoose = require('mongoose');
require('dotenv/config');
const otp_buffer = mongoose.Schema({
    secret_id:{type:String},
    otp:{type:String},
    created_time:{type:Date, default:new Date()}
})
otp_buffer.index({created_time: 1},{expireAfterSeconds: Number(process.env.ACCOUNT_OTP_TIMEPERIOD)});
module.exports = mongoose.model("otp_buffer",otp_buffer);