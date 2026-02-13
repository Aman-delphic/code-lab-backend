const mongoose = require('mongoose');
const deal = mongoose.Schema({
    store:{type:String},
    name: {type:String},
    name_arabic: {type:String},
    image: {type:String},
    description: {type:String},
    description_arabic: {type:String},
    used_times: {type:String},
    last_used: {type:String},
    coupon:{type:String},
    link: {type:String},
    tags: {type:Array},
    index: {type:Number, default:1},
});
module.exports = mongoose.model("deal",deal);