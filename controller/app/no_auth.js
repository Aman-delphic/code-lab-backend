const user = require("../../model/user");
const store = require("../../model/store");
const deal = require("../../model/deal");
const country = require("../../model/country");
const banner = require("../../model/banner");
const common = require("../../common");

var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require("path");
require('dotenv/config');
const private_key  = fs.readFileSync(path.join(__dirname,'../../keys/private.key'), 'utf8');
var syncLoop = require('sync-loop');
const referral_storage = require("../../model/referral_storage");
const categories = require("../../model/categories");

const carousel = require("../../model/carousel");

var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = sgMail.setApiKey(process.env.SENDGRID_API);

var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

sendSmtpEmail = {
    to: [{
        email: 'parasgulati150@gmail.com',
        name: 'John Doe'
    }],
    templateId: 59,
    params: {
        name: 'John', 
        surname: 'Doe'
    },
    headers: {
        'X-Mailin-custom': 'custom_header_1:custom_value_1|custom_header_2:custom_value_2'
    }
};

async function generate_token(user_id)
{
    return new Promise((resolve,reject)=>{
        
        var payload={ 
            user_id:user_id
        }

        var sign_options = {
            issuer:  process.env.ISSUER,
            subject: process.env.SUBJECT,
            audience:  process.env.AUDIENCE,
            expiresIn:  process.env.EXPIRESIN,
            algorithm: process.env.ALGORITHM
        };
    
        jwt.sign(payload, private_key, sign_options,function(err,token){
            if(err)
                reject({status:403, response:{error:"Failed generating token"}});
            else
                resolve(token);
        });       
    })
}



async function create_user(input)
{
    return new Promise((resolve,reject)=>{
        const obj = new user(input);
        obj.save()
        .then((data2)=>{
            generate_token(data2._id)
            .then((token)=>{
                resolve({
                    status:200,
                    response:{
                        token: token,
                        user_id: data2._id
                    }
                })
            })
            .catch((error)=>{
                reject({
                    status:500,
                    response:{error:error}
                })
            })
        })
        .catch((error)=>{
            reject({
                status:500,
                response:{error:error}
            })
        })
    })
}

async function assign_referrer(ip)
{
    return new Promise((resolve,reject)=>{
        referral_storage.findOneAndDelete({ip:ip})
        .then((data1)=>{
            if(data1 == null)
            {
                resolve({
                    user_id: null
                });
            }
            else
            {
                user.findOneAndUpdate({referral_code: data1.referral_code}, {$inc:{referral_points:parseInt(process.env.REFERRAL_POINT)}})
                .then((data2)=>{
                    resolve({
                        user_id: (data2._id).toString()
                    });
                })
                .catch((error)=>{
                    console.log(error);
                    reject(error);
                })
            }
        })
        .catch((error)=>{
            console.log(error);
            reject(error);
        })
    })
}

function signup(req,res)
{
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    var req_body=req.body;

    console.log("The signp request",req_body);

    if(req_body.email != null)
    {
        user.findOne({email:req_body.email})
        .then((data1)=>{
            if(data1 == null)
            {   
                assign_referrer(ip)
                .then((refer_obj)=>{
                    common.generate_referral_code()
                    .then((referral_code)=>{

                        if(req_body.thirdparty == "GOOGLE" || req_body.thirdparty == "APPLE")
                        {
                            create_user({
                                country_code: null,
                                phone_number: null,
                                email: req_body.email,
                                email_verified: true,
                                phone_number_verified: false,
                                thirdparty_verificaton: true,
                                thirdparty: req_body.thirdparty,
                                referrer: refer_obj.user_id,
                                referral_code: referral_code,
                                referral_points: 0,
                                first_name: req_body.first_name,
                                last_name: req_body.last_name,
                                password: null,
                                country: req_body.country
                            })
                            .then((data)=>{
                                res.status(200).json(data.response);
                            })
                            .catch((error)=>{
                                res.status(error.status).json(error.response);
                            })
                        }
                        else
                        {
                            create_user({
                                country_code: null,
                                phone_number: null,
                                email: req_body.email,
                                email_verified: false,
                                phone_number_verified: false,
                                thirdparty_verificaton: false,
                                thirdparty: null,
                                referrer: refer_obj.user_id,
                                referral_code: referral_code,
                                referral_points: 0,
                                first_name: req_body.first_name,
                                last_name: req_body.last_name,
                                password: req_body.password,
                                country: req_body.country
                            })
                            .then((data)=>{
                                res.status(200).json(data.response);
                            })
                            .catch((error)=>{
                                res.status(error.status).json(error.response);
                            })
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
                res.status(400).json({
                    message: "Email already registered"
                })
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
        if(req_body.country_code == null || req_body.phone_number == null)
        {
            res.status(400).json({
                message: "Email and Phone Number both cannot be null"
            })
        }   
        else
        {
            user.findOne({country_code:req_body.country_code, phone_number:req_body.phone_number})
            .then((data1)=>{
                if(data1 == null)
                {   
                    assign_referrer(ip)
                    .then((refer_obj)=>{
                        common.generate_referral_code()
                        .then((referral_code)=>{
                            create_user({
                                country_code: req_body.country_code,
                                phone_number: req_body.phone_number,
                                email: null,
                                email_verified: false,
                                phone_number_verified: true,
                                referrer: refer_obj.user_id,
                                referral_code: referral_code,
                                referral_points: 0,
                                first_name: req_body.first_name,
                                last_name: req_body.last_name,
                                password: null,
                                country: req_body.country
                            })
                            .then((data)=>{
                                res.status(200).json(data.response);
                            })
                            .catch((error)=>{
                                console.log(error);
                                res.status(error.status).json(error.response);
                            })
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
                    res.status(400).json({
                        message: "Phone Number already registered"
                    })
                }
            })
            .catch((error)=>{
                res.status(500).json({
                    error:error
                })
            })
        }
    }
}


function login(req,res)
{
    var req_body = req.body;

    if(req_body.email != null)
    {
        user.findOne({email:req_body.email})
        .then((data1)=>{
            if(data1 == null)
            {
                res.status(400).json({
                    message:"Email is not registered"
                })
            }
            else
            {
                if(req_body.thirdparty == "GOOGLE" || req_body.thirdparty == "APPLE")
                {
                    if(data1.thirdparty !=null){
                        generate_token(data1._id)
                        .then((token)=>{
                            res.status(200).json({
                                token:token,
                                user_id: data1._id
                            })
                        })
                        .catch((error)=>{
                            res.status(error.status).json(error.response);
                        })
                    }else{
                        res.status(400).json({
                            message:"Please login with email and password."
                        })
                    }
                  
                }
                else
                {
                    if(data1.password == req_body.password)
                    {
                        generate_token(data1._id)
                        .then((token)=>{
                            res.status(200).json({
                                token:token,
                                user_id: data1._id
                            })
                        })
                        .catch((error)=>{
                            res.status(error.status).json(error.response);
                        })
                    }
                    else
                    {
                        res.status(400).json({
                            message:"Entered password is incorrect"
                        })
                    }
                }
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
        if(req_body.country_code == null || req_body.phone_number == null)
        {
            res.status(400).json({
                message: "Email and Phone Number both cannot be null"
            })
        }   
        else
        {
            user.findOne({country_code:req_body.country_code, phone_number:req_body.phone_number})
            .then((data1)=>{
                if(data1 == null)
                {
                    res.status(400).json({
                        message:"Phone Number is not registered"
                    })
                }
                else
                {
                    generate_token(data1._id)
                    .then((token)=>{
                        res.status(200).json({
                            token:token,
                            user_id: data1._id
                        })
                    })
                    .catch((error)=>{
                        res.status(error.status).json(error.response);
                    })
                }
            })
            .catch((error)=>{
                res.status(500).json({
                    error:error
                })
            })
        }
    }    
}


function fetch_home(req,res)
{
    var search = {country: req.query.country};
    var temp_store_ids = [];

    store.find(search)
    .sort({index:0})
    .limit(parseInt(process.env.DEFAULT_PAGE_SIZE))
    .then((data1)=>{
        var stores_view_all = true;

        store.countDocuments(search)
        .then((count_stores)=>{
            if(count_stores > parseInt(process.env.DEFAULT_PAGE_SIZE))
            {
                stores_view_all = true;
            }
            else
            {
                stores_view_all = false;
            }
            var numberOfLoop = data1.length;

            syncLoop(numberOfLoop, function(loop1){
                var index1 = loop1.iteration();
                temp_store_ids.push((data1[index1]._id).toString());
                loop1.next();
            },function(){
    
                deal.find({store:{$in:temp_store_ids}})
                .sort({index:0})
                .limit(parseInt(process.env.DEFAULT_PAGE_SIZE))
                .then((data2)=>{
    
                    deal.countDocuments({store:{$in:temp_store_ids}})
                    .then((count_deals)=>{
                        if(count_deals > parseInt(process.env.DEFAULT_PAGE_SIZE))
                        {
                            res.status(200).json({message:"Success", stores:data1, stores_view_all:stores_view_all, deals:data2, deals_view_all:true});
                        }
                        else
                        {
                            res.status(200).json({message:"Success", stores:data1, stores_view_all:stores_view_all, deals:data2, deals_view_all:false});
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
            })

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

function fetch_banner(req,res)
{    
    banner.find({country:req.query.country})
    .sort({index:0})
    .then((data1)=>{
        res.status(200).json({message:"Success", banner:data1});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}


function fetch_brands(req,res)
{
    var req_body=req.query;
    var search = {country: req_body.country};

    if(req.query.view_all = true)
    {
        store.find(search)
        .sort({index:0})
        .then((data1)=>{ 
            res.status(200).json({message:"Success", brands:data1, stores_view_all:false});            
        })
        .catch((error)=>{
            res.status(500).json({
                error:error
            })
        })
    }
    else
    {
        store.find(search)
        .sort({index:0})
        .limit(parseInt(process.env.DEFAULT_PAGE_SIZE))
        .then((data1)=>{ 
            store.countDocuments(search)
            .then((count_stores)=>{
                if(count_stores > parseInt(process.env.DEFAULT_PAGE_SIZE))
                {
                    res.status(200).json({message:"Success", brands:data1, stores_view_all:true});
                }
                else
                {
                    res.status(200).json({message:"Success", brands:data1, stores_view_all:false});
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
}

function fetch_deals(req,res)
{
    var search = {country: req.query.country};
    var temp_store_ids = [];

    if(req.query.view_all = true)
    {
        store.find(search)
        .then((data1)=>{
            var numberOfLoop = data1.length;
    
            syncLoop(numberOfLoop, function(loop1){
                var index1 = loop1.iteration();
                temp_store_ids.push((data1[index1]._id).toString());
                loop1.next();
            },function(){
                deal.find({store:{$in:temp_store_ids}})
                .sort({index:0})
                .then((data2)=>{
                    res.status(200).json({message:"Success", deals:data2, deals_view_all:false});
                })
                .catch((error)=>{
                    res.status(500).json({
                        error:error
                    })
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
        store.find(search)
        .sort({index:0})
        .limit(parseInt(process.env.DEFAULT_PAGE_SIZE))
        .then((data1)=>{

            var numberOfLoop = data1.length;
            syncLoop(numberOfLoop, function(loop1){
                var index1 = loop1.iteration();
                temp_store_ids.push((data1[index1]._id).toString());                
                loop1.next();
                },function(){
                    deal.find({store:{$in:temp_store_ids}})
                    .sort({index:0})
                    .limit(parseInt(process.env.DEFAULT_PAGE_SIZE))
                    .then((data2)=>{
        
                        deal.countDocuments({store:{$in:temp_store_ids}})
                        .then((count_deals)=>{
                            if(count_deals > parseInt(process.env.DEFAULT_PAGE_SIZE))
                            {
                                res.status(200).json({message:"Success", deals:data2, deals_view_all:true});
                            }
                            else
                            {
                                res.status(200).json({message:"Success", deals:data2, deals_view_all:false});
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
            })
        })
        .catch((error)=>{
            res.status(500).json({
                error:error
            })
        })
    }
}

function fetch_file(req,res)
{
    res.sendFile(path.join(__dirname + process.env.READ_STORAGE_PATH + "/" + req.params.file));
}


function fetch_country(req,res)
{
    country.find({},{name:1, _id:0})
    .then((data)=>{
        res.status(200).json({message:"Success", countries:data});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })   
    })
}


function fetch_store_deals(req,res)
{
    var req_body=req.query;
    
    if(req.query.view_all = true)
    {
        deal.find({store: req_body.store})
        .sort({index:0})
        .then((data1)=>{
            res.status(200).json({message:"Success", deal:data1, deals_view_all:false});
        })
        .catch((error)=>{
            res.status(500).json({
                error:error
            })
        })
    }
    else
    {
        deal.find({store: req_body.store})
        .sort({index:0})
        .limit(parseInt(process.env.DEFAULT_PAGE_SIZE))
        .then((data1)=>{

            deal.countDocuments({store: req_body.store})
            .then((count_deals)=>{
                if(count_deals > parseInt(process.env.DEFAULT_PAGE_SIZE))
                {
                    res.status(200).json({message:"Success", deal:data1, deals_view_all:true});
                }
                else
                {
                    res.status(200).json({message:"Success", deal:data1, deals_view_all:false});
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
}

function referral_link_clicked(req,res)
{
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log(req.get('User-Agent'));

    user.findOne({referral_code:req.params.referral_code})
    .then((data1)=>{
        if(data1 == null)
        {
            if(req.get('User-Agent') == "iPad" || req.get('User-Agent') == "iPhone" || req.get('User-Agent') == "iPod")
                res.redirect(process.env.APPSTORE_LINK);
            else
                res.redirect(process.env.PLAYSTORE_LINK);
        }
        else
        {
            const obj = referral_storage({
                referral_code: req.params.referral_code,
                ip: ip,
                created_at: new Date()
            })
            obj.save()
            .then(()=>{
                if(req.get('User-Agent') == "iPad" || req.get('User-Agent') == "iPhone" || req.get('User-Agent') == "iPod")
                    res.redirect(process.env.APPSTORE_LINK);
                else
                    res.redirect(process.env.PLAYSTORE_LINK);
            })
            .catch((error)=>{
                console.log(error);
                res.status(500).json({
                    error:error
                })
            })
        }
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({
            error:error
        })
    })
}

function fetch_categories(req,res)
{
    categories.find()
    .sort({index:0})
    .then((data)=>{
        var result = [];
        syncLoop(data.length, function(loop1){
            var index1 = loop1.iteration();
            result.push({name: data[index1].name, name_arabic: data[index1].name_arabic});
            loop1.next();
        },function(){
            res.status(200).json({categories:result});
        })
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}


function fetch_carousel(req,res)
{
    carousel.find({country:req.query.country})
    .sort({index:0})
    .then((data1)=>{
        res.status(200).json({message:"Success", carousel:data1});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}


/*

async function send_otp()
{
    return new Promise((resolve,reject)=>{
      
        apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
            console.log('API called successfully. Returned data: ' + data);
            console.log(data);
            resolve();

        }, function(error) {
            console.error(error);
            reject();
        });
        
   
    })
}

function test(req,res)
{
    send_otp()
    .then(()=>{
        res.status(200).json({message:"Success"});
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({
            error:error
        })
    })
}
*/

function contect_us(req,res){
    var req_body = req.body;
    var obj = 
         "Name: " +req_body.name + "<br>"+"Email:"+ req_body.email+ "<br>"+ "Mobile:"+ req_body.mobile +"<br>"+"Title:" + req_body.title + "<br>"+     "Message:"+ req_body.message;
    
   common.send_email(process.env.SEND_GRID_FROM_EMAIL,req_body.title,obj).then((data)=>{
        res.status(200).json({
            message: "Success",
            store: data
        });

    })
    .catch((error)=>{
        console.log(error)
        res.status(500).json({
            error:error
        })
    })
}




module.exports = {
    signup, login, fetch_home, fetch_brands, fetch_deals, fetch_file, fetch_country, fetch_banner, fetch_store_deals,
    referral_link_clicked, fetch_categories, fetch_carousel, contect_us//, test
}