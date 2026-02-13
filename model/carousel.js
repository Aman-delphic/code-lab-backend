const mongoose = require('mongoose');
const carousel  = mongoose.Schema({
    images: {type:Array},
    header: {type:String},
    header_arabic: {type:String},
    country: {type:String},
    index: {type:Number, default:1}
});
module.exports = mongoose.model("carousel",carousel);