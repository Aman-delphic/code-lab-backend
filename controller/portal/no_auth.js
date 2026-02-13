const admin = require("../../model/admin");


var jwt = require('jsonwebtoken');
var fs = require('fs');
var path = require("path");
require('dotenv/config');
const private_key  = fs.readFileSync(path.join(__dirname,'../../keys/private.key'), 'utf8');

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
        const obj = new admin(input);
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


function signup(req,res)
{
    var req_body=req.body;

    admin.findOne({email:req_body.email})
    .then((data1)=>{
        if(data1 == null)
        {   
            if(req_body.type == "GENERAL" || req_body.type == "ROOT")
            {
                create_user({
                    email: req_body.email,
                    first_name: req_body.first_name,
                    last_name: req_body.last_name,
                    password: req_body.password,
                    type: req_body.type
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
                res.status(400).json({
                    message: "Invalid admin type"
                })
            }
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

function login(req,res)
{
    var req_body = req.body;

    admin.findOne({email:req_body.email})
    .then((data1)=>{
        if(data1 == null)
        {
            res.status(400).json({
                message:"Email is not registered"
            })
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
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}


module.exports = {
    signup, login
}