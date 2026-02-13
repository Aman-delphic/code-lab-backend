const express = require('express');
const router = express.Router();
require('dotenv/config');
const common = require("../../common");
const controller_auth = require("../../controller/portal/auth");
const multer = require("multer");
const path = require("path");
const store = require("../../model/store");
const deal = require("../../model/deal");
const banner = require("../../model/banner");
const carousel = require('../../model/carousel');

function upload_banner(req,res)
{
    if(req.response.status == 200)
    {
        banner.aggregate([
            {$group:{_id:null, max_index:{$max:"$index"}}}
        ])
        .then((data1)=>{
            var new_index = 1;
            if(data1.length == 0)
            {
                new_index = 1;
            }
            else
            {
                new_index = data1[0].max_index + 1;
            }

            const obj = new banner({
                index: new_index,
                image: process.env.READ_FILE_URL + req.response.image_name
            })
            obj.save()
            .then(()=>{
                res.status(200).json({
                    message:"Success"
                });
            })
            .catch((error)=>{
                res.status(500).json({
                    error:error
                })
            })
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


function upload_carousel(req,res)
{
    var req_body = req.body;
    if(req.response.status == 200)
    {
        carousel.findOne({_id:req_body.carousel_id})
        .then((data1)=>{
            var image = data1.images;
            image.push(process.env.READ_FILE_URL + req.response.image_name);

            carousel.findOneAndUpdate({_id:req_body.carousel_id}, {$set:{images: image}})
            .then((data1)=>{
                if(data1 == null)
                {
                    res.status(404).json({
                        message:"Carousel Id does not exists"
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

function upload_image(req,res)
{
    if(req.response.status == 200)
    {
        res.status(200).json({message:"Success", image_name: process.env.READ_FILE_URL + req.response.image_name});
    }
    else
    {
        res.status(req.response.status).json({
            message:req.response.description
        })
    }
}

function upload_store_logo(req,res)
{
    var req_body = req.body;
    
    if(req.response.status == 200)
    {
        store.findOneAndUpdate({_id:req_body.store_id}, {$set:{logo: process.env.READ_FILE_URL + req.response.image_name}})
        .then((data1)=>{
            if(data1 == null)
            {
                res.status(404).json({
                    message:"Store Id does not exists"
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


function upload_deal_image(req,res)
{
    var req_body = req.body;
    console.log(req_body);
    
    if(req.response.status == 200)
    {
        deal.findOneAndUpdate({_id:req_body.deal_id}, {$set:{image: process.env.READ_FILE_URL + req.response.image_name}})
        .then((data1)=>{
            if(data1 == null)
            {
                res.status(404).json({
                    message:"Deal Id does not exists"
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


router.post('/upload-store-logo', function(req,res,next){
    next();
}, upload_file, upload_store_logo);

router.post('/upload-deal-image', function(req,res,next){
    next();
}, upload_file, upload_deal_image);

router.post('/upload-banner', function(req,res,next){
    next();
}, upload_file, upload_banner);

router.post('/upload-carousel', function(req,res,next){
    next();
}, upload_file, upload_carousel);


router.post("/upload-image", function(req,res,next){
    next();
}, upload_file, upload_image);


router.post("/create-deal", controller_auth.create_deal);
router.post("/create-store", controller_auth.create_store);
router.get("/store", controller_auth.fetch_store);
router.get("/deal", controller_auth.fetch_deal);
router.post("/remove-deal", controller_auth.remove_deal);
router.post("/remove-store", controller_auth.remove_store);
router.post("/remove-country", controller_auth.remove_country);
router.post("/create-country", controller_auth.create_country);
router.get("/country", controller_auth.fetch_country);
router.get("/all/store", controller_auth.fetch_all_store);
router.get("/all/deal", controller_auth.fetch_all_deal);
router.get("/users", controller_auth.fetch_users);
router.post("/update-country", controller_auth.update_country);
router.post("/update-store", controller_auth.update_store);
router.post("/update-deal", controller_auth.update_deal);
router.post("/create-banner", controller_auth.create_banner);
router.get("/banner", controller_auth.fetch_banner);
router.get("/delete/banner", controller_auth.delete_banner);
router.post("/create-carousel", controller_auth.create_carousel);
router.post("/delete-carousel", controller_auth.delete_carousel);
router.post("/update-carousel", controller_auth.update_carousel);
router.get("/carousel", controller_auth.fetch_carousel);

router.post("/category/create", controller_auth.create_category);
router.post("/category/update", controller_auth.update_category);
router.post("/category/delete", controller_auth.delete_category);
router.get("/category/fetch", controller_auth.fetch_category);

module.exports = router;