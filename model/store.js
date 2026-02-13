const mongoose = require('mongoose');
const store = mongoose.Schema({
    country: {type:String},
    name: {type:String},
    name_arabic: {type:String},
    logo: {type:String},
    link: {type:String},
    tags: {type:Array},
    index: {type:Number, default:1},
});
module.exports = mongoose.model("store",store);