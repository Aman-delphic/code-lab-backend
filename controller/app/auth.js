const user = require("../../model/user");
const store = require("../../model/store");
const deal = require("../../model/deal");

var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require("path");
require('dotenv/config');
var common = require("../../common")
var syncLoop = require('sync-loop');
const otp_buffer = require("../../model/otp_buffer");
const subscription = require( "../../model/subscription" );



function fetch_profile(req,res)
{
    user.findOne({_id:req.middleware.user_id})
    .then((data1)=>{
        res.status(200).json({message:"Success", profile:{
            email: data1.email,
            email_verified: data1.email_verified,
            phone_number: data1.phone_number,
            country_code: data1.country_code,
            phone_number_verified: data1.phone_number_verified,
            first_name: data1.first_name,
            last_name: data1.last_name,
            country: data1.country,
            profile_image: data1.profile_image,
            notifications: data1.notifications
        }});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function update_profile(req,res)
{
    var req_body = req.body;
    user.findOneAndUpdate({_id:req.middleware.user_id}, {$set:{first_name: req_body.first_name, last_name: req_body.last_name, country:req_body.country}})
    .then((data1)=>{
        res.status(200).json({
            message:"Success"
        });
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function fetch_referral_details(req,res)
{
    user.findOne({_id:req.middleware.user_id})
    .then((data1)=>{
        if(data1 == null)
        {
            res.status(404).json({
                message:"User Not Found"
            })
        }
        else
        {
            res.status(200).json({
                message:"Success",
                referral_details:{
                    referral_code: data1.referral_code,
                    referral_points: data1.referral_points,
                    referral_link: process.env.REFERRAL_LINK + data1.referral_code
                }
            })
        }
        
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function update_notifications(req,res)
{
    var req_body = req.body;

    user.findOneAndUpdate({_id:req.middleware.user_id}, {$set:{notifications: req_body.notifications}})
    .then((data1)=>{
        res.status(200).json({
            message:"Success"
        });
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function update_device_token(req,res)
{
    var req_body = req.body;

    user.findOneAndUpdate({_id:req.middleware.user_id}, {$set:{device_token: req_body.device_token}})
    .then((data1)=>{
        res.status(200).json({
            message:"Success"
        });
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function send_email_otp(req,res)
{
    const req_body = req.body;
   
    user.findOne({email:req_body.email},function(err1,data1){
        if(err1)
        {
            res.json({
                status: 500,
                message: "Server Error"
            });
        }
        else if(data1==null)
        {
            res.json({
                status: 400,
                message: "Entered Email is not Registered"
            });
        }
        else
        {
            
                common.generate_otp().
                then((otp)=>{
                    common.send_otp_email(req_body.email,otp).
                    then(()=>
                    {
                        otp_buffer.findOneAndDelete({secret_id:data1._id},function (err2,data2){
                        
                            if(err2)
                            {
                                res.json({
                                    status: 500,
                                    message: "Server Error"
                                });
                            }
                            else
                            {
                                const obj = new otp_buffer({
                                    secret_id: data1._id,
                                    otp: otp,
                                    created_time: new Date()
                                });         
                                obj.save(function(err3,data3){
                                    if(err3)
                                    {
                                        res.json({
                                            status: 500,
                                            message: "Server Error"
                                        });
                                    }
                                    else
                                    {
                                        res.json({
                                            status: 200,
                                            message: "OTP Sent for Email Verification",
                                            session_id: data3._id
                                        });
                                    }
                                })
                            }
                        })
                    })
                }
                )

            
        }
        }
    );
}

function otp_verification_email(req,res)
{
    var req_body = req.body;
    otp_buffer.findOne({_id:req_body.session_id},function(err1,data1){
        if(err1)
        {
            res.json({
                status: 500,
                message: "Server Error"
            });
        }
        else if(data1 == null)
        {
            res.json({
                status: 400,
                message: "Session Expired, Please Retry"
            });
        }
        else
        {
            if(data1.otp == req_body.otp)
            {
            user.findOneAndUpdate({_id:data1.secret_id},{ email_verified:true}, function(err2,data2){
              
                    if(err2)
                    {
                        res.json({
                            status: 500,
                            message: "Server Error"
                        });
                    }
                    else 
                    {
                        res.json({
                            status: 200,
                            message: "Account Verify Successful"
                        });
                    }
            });
            }
            else{
                res.json({
                    status: 400,
                    message: "OTP is Wrong."
                });
            }
        }
    });
}



function delete_user(req,res)
{   
    user.findOneAndDelete({_id:req.middleware.user_id}, function(err2,data2){          
        if(err2)
        {
            res.json({                
                status: 500,
                message: "Server Error"
            });
        }            
        else 
        {
            res.json({
                status: 200,
                message: "Account Deleted Successfully"
            });
        }
    });
}

const subscribe_store = async(req, res) => {
    try {
        const {  storeId, subscribed } = req.body;
    
        const userExists = await user.findById(req.middleware.user_id);
        const storeExists = await store.findById(storeId);
    
        if (!userExists || !storeExists) {
          return res.status(404).json({ error: 'User or store not found' });
        }
        const existingSubscription = await subscription.findOne({ user: req.middleware.user_id, store: storeId });
    
        if (existingSubscription) {
         
          existingSubscription.subscribed = subscribed;
          await existingSubscription.save();
          return res.json({"data":existingSubscription,"message":"Store subscription updated successfully","success":true});
        } else {
          // Create a new subscription
          const newSubscription = new subscription({
            user: req.middleware.user_id,
            store: storeId,
            subscribed: subscribed,
          });
    
          await newSubscription.save();
          return res.json({"data":newSubscription,"message":"Store subscription updated successfully","success":true});
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}
const get_subscribed_store = async (req, res) => {
    try {
      const userId = req.params.userId;
  
    
      const userExists = await user.findById(req.middleware.user_id);
  
      if (!userExists) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      
      const subscriptions = await subscription.find({ user: req.middleware.user_id, subscribed: true }).populate('store')||[];
  
     
      const subscribedStores = subscriptions.map(subscription => ({
        storeId: subscription.store._id,
        storeName: subscription.store.name,
        storeLogo: subscription.store.logo,
      }));
      console.log(subscriptions);
      return res.status(200).json({"data":subscriptions,"message":"sent successfully","success":true});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
module.exports = {
    fetch_profile, update_profile, fetch_referral_details, update_notifications, delete_user, update_device_token,send_email_otp,otp_verification_email,subscribe_store, get_subscribed_store
}