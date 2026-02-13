const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

const API = express();
const mongoose = require('./database');
mongoose.Promise = global.Promise;

const route_auth = require("./route/app/auth");
const route_no_auth = require("./route/app/no_auth");
const user = require('./model/user');
const route_portal_auth = require("./route/portal/auth");
const route_portal_no_auth = require("./route/portal/no_auth");
const admin = require('./model/admin');



var fs = require('fs');
var jwt = require('jsonwebtoken');
var path = require("path");
const store = require( './model/store' );
const banner = require( './model/banner' );
const deal = require( './model/deal' );

var public_key  = fs.readFileSync(path.join(__dirname,'./keys/public.key'), 'utf8');



function authenticate(req,res,next)
{
    var header = req.headers;
     
    jwt.verify(header.token, public_key, function(error,data){
        if(error)
            res.status(401).json({message:"Unauthorized"})
        else
        {
          user.findOne({_id: data.user_id})
            .then((data1)=>{
                if(data1 == null)
                {
                  res.status(401).json({message:"Unauthorized"});
                }
                else
                {
                  req.middleware = {user_id: data.user_id, country: data.country};
                  next();
                }
            })
            .catch((error)=>{
              res.status(500).json({
                error:error
              })
            })
        }
    })
}

function authenticate_portal(req,res,next)
{
    var header = req.headers;
    console.log(header);
    jwt.verify(header.token, public_key, function(error,data){
        if(error)
            res.status(401).json({message:"Unauthorized"})
        else
        {
          admin.findOne({_id: data.user_id})
            .then((data1)=>{
                if(data1 == null)
                {
                  res.status(401).json({message:"Unauthorized"});
                }
                else
                {
                  req.middleware = {user_id: data.user_id};
                  next();
                }
            })
            .catch((error)=>{
              res.status(500).json({
                error:error
              })
            })
        }
    })
}
// async function updateOldRecords() {
//   try {
//     // Find all documents where the logo contains the old base URL
//     const oldRecords = await deal.find({ image: { $regex: 'http://54\\.159\\.201\\.11' } });

//     // Update each document with the new base URL
//     for (const record of oldRecords) {
//       record.image = record.image.replace('http://54.159.201.11', 'http://44.211.212.154');
//       await record.save();
//     }

//     console.log('Old records updated successfully.');
//   } catch (error) {
//     console.error('Error updating old records:', error);
//   } finally {
//     // Disconnect from MongoDB after updating records
//     mongoose.disconnect();
//   }
// }

API.options('*', cors());
API.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,DELETE');
  res.setHeader('Access-Control-Allow-Methods','Content-Type','Authorization');
  next(); 
})

API.use(bodyParser.json({limit: "50mb"}));


API.use('/app/no-auth', route_no_auth);
API.use("/app/auth", authenticate, route_auth);

API.use('/portal/no-auth', route_portal_no_auth);
API.use("/portal/auth", authenticate_portal, route_portal_auth);


var port = process.env.PORT;
API.listen(port, function(){

    console.log("Server listening at port "+port);
});