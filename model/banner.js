const mongoose = require('mongoose');
const banner = mongoose.Schema({
    image: {type:String},
    store: {type:String},
    country: {type:String},
    index: {type:Number, default:1}
});
module.exports = mongoose.model("banner",banner);