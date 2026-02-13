const express = require('express');
const router = express.Router();
require('dotenv/config');

const controller_auth = require("../../controller/app/auth");

const common = require("../../common");
const multer = require("multer");
const path = require("path");
const user = require("../../model/user");



function upload_profile_image(req,res)
{    
    console.log(req.middleware);
    console.log(req.response.image_name);
    if(req.response.status == 200)
    {
        user.findOneAndUpdate({_id:req.middleware.user_id}, {$set:{profile_image: process.env.READ_FILE_URL + req.response.image_name}})
        .then((data1)=>{
            if(data1 == null)
            {
                res.status(404).json({
                    message:"User Id does not exists"
                });
            }
            else
            {
                res.status(200).json({
                    message:"Success"
                });
            }
          
        })
        .catch((error)=>{
            res.status(500).json({
                error:error
            })
        })
    }
    else
    {
        res.status(req.response.status).json({
            message:req.response.description
        })
    }
}

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        var storePath = path.join(__dirname, process.env.WRITE_STORAGE_PATH);
        callback(null,storePath);
    },
    filename: (req, file, callback) => {
        let myFile = file.originalname.split(".")
		const fileType = myFile[myFile.length - 1];
  
        common.generate_name()
        .then((name)=>{
            req.response = {
                status:200,
                message:"Success",
                description:"Profile Image Updated Successfully",
                image_name:name+"."+fileType
            }       
            callback(null, name + '.' + fileType );
        })
        .catch((error)=>{
            req.response = {
                status:500,
                message:"Internal Server Error",
                description:"Error while generating name for image",
            }   
            callback(null,"Error");
        })
    }
});
const upload_file = multer({ storage: storage }).single('file');

router.post('/upload-profile-image', function(req,res,next){
    next();
}, upload_file, upload_profile_image);


router.get("/profile", controller_auth.fetch_profile);
router.post("/update-profile", controller_auth.update_profile);
router.get("/referral-details", controller_auth.fetch_referral_details);
router.post("/update-notifications", controller_auth.update_notifications);
router.post("/update-device-token", controller_auth.update_device_token);
router.post("/send-email-otp", controller_auth.send_email_otp);
router.post("/verify-email-otp", controller_auth.otp_verification_email);
router.post("/delete-account", controller_auth.delete_user);
router.post("/subscribe", controller_auth.subscribe_store);
router.get("/subscribed-stores",controller_auth.get_subscribed_store);
module.exports = router;