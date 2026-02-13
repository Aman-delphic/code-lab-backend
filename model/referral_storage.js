const mongoose = require('mongoose');
const referral_storage = mongoose.Schema({
    referral_code:{type:String},
    ip:{type:String},
    created_at:{type:Date, default:new Date()}
});
referral_storage.index({created_at: 1},{expireAfterSeconds: 86400});
module.exports = mongoose.model("referral_storage",referral_storage);