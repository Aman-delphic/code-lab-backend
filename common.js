const sg_mail = require('@sendgrid/mail');
require('dotenv/config');
const generateUniqueId = require('generate-unique-id');


sg_mail.setApiKey(process.env.SENDGRID_API);


async function send_email(email, subject, message)
{
    return new Promise((resolve,reject)=>{
        const msg = {
            to: process.env.SEND_GRID_TO_EMAIL, 
            from: process.env.SEND_GRID_FROM_EMAIL2,
            subject: subject,
            text: 'Code Lab',
            html: message,
        }
         console.log(msg);
        sg_mail.send(msg)
        .then((data) => {
             console.log(data);
            resolve();
        })
        .catch((error) => {
            console.log(error);
            reject({
                status:500,
                message:"Server Error"
            });
            
        })  
    })
}


async function generate_name()
{
    return new Promise((resolve,reject)=>{
        var temp = generateUniqueId({
            length: 15,
            useLetters: true,
            useNumbers:false
          })
        resolve(temp);
    });
}

async function generate_referral_code()
{
    return new Promise((resolve,reject)=>{
        var temp = generateUniqueId({
            length: 10,
            useLetters: true,
            useNumbers:false
          })
        resolve(temp);
    });
}

async function generate_otp()
{
    return new Promise((resolve,reject)=>{
        resolve(generateUniqueId({
            length: process.env.OTP_LENGTH,
            useLetters: false,
            useNumbers:true
        }));
    })
}

async function send_otp_email(email, otp)
{
    return new Promise((resolve,reject)=>{

        var subject, message;

      
            subject = "OTP (One Time Password) generated for Codatak";
            // message = email_verification_format(otp);
            message = "OTP for <B>Email Verification is</B> "+otp+". <I>This OTP is valid for 10 minutes only.</I>";
       
       
            const msg = {
                to: email, 
                from: process.env.SEND_GRID_FROM_EMAIL,
                subject: subject,
                text: 'Codatak',
                html: message,
            }
            console.log(msg);
            sg_mail.send(msg)
            .then((data) => {
                console.log(data);
                resolve();
            })
            .catch((error) => {
                console.log(error);
                reject({
                    status:500,
                    message:"Server Error"
                });
                
            })  
        
             
    })
}

module.exports = {
    send_email, generate_name, generate_referral_code,send_otp_email,generate_otp
}