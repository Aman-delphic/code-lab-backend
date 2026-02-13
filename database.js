const mongoose = require('mongoose');
require('dotenv/config');

mongoose.connect('mongodb+srv://'+process.env.MONGODB_USER+':'+process.env.MONGODB_PASSWORD+"@"+process.env.MONGODB_CLUSTER+'/'+process.env.MONGODB_DBNAME+'?retryWrites=true&w=majority',{'useUnifiedTopology':true})
.then(()=>{
    console.log('database connected');
})
.catch((error)=>{
    console.log(error);
});
module.exports = mongoose;