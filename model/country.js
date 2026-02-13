const mongoose = require('mongoose');
const country = mongoose.Schema({
    name: {type:String}
});
module.exports = mongoose.model("country",country);