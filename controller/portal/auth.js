const store = require("../../model/store");
const deal = require("../../model/deal");
const country = require("../../model/country");
const banner = require("../../model/banner");
const carousel = require("../../model/carousel");
const categories = require("../../model/categories");

var syncLoop = require('sync-loop');
var fs = require('fs');
var path = require("path");
const user = require("../../model/user");

require('dotenv/config');

function create_category(req,res)
{
    var req_body = req.body;

    categories.aggregate([
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
        const obj = categories({
            name: req_body.name,
            name_arabic: req_body.name_arabic,
            index: new_index
        })
        obj.save()
        .then(()=>{
            res.status(200).json({message:"Success"});
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

function update_category(req,res)
{
    var req_body = req.body;

    categories.findOneAndUpdate({_id:req_body.category_id}, {$set:{name: req_body.name, name_arabic: req_body.name_arabic,}})
    .then((data)=>{
        if(data == null)
        {
            res.status(404).json({message:"Category does not exists"});
        }
        else
        {
            res.status(200).json({message:"Success"});
        }
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function delete_category(req,res)
{
    var req_body = req.body;

    categories.findOneAndDelete({_id:req_body.category_id})
    .then((data)=>{
        if(data == null)
        {
            res.status(404).json({message:"Category does not exists"});
        }
        else
        {
            res.status(200).json({message:"Success"});
        }
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function fetch_category(req,res)
{
    categories.find({})
    .then((data)=>{
        res.status(200).json({message:"Success", categories:data});    
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function create_carousel(req,res)
{
    var req_body = req.body;

    carousel.aggregate([
        {$match:{country: req_body.country}},
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
        const obj = carousel({
            header: req_body.header,
            header_arabic: req_body.header_arabic,
            index: new_index,
            country: req_body.country,
            images: req_body.images
        })
        obj.save()
        .then(()=>{
            res.status(200).json({message:"Success"});
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

function delete_carousel(req,res)
{
    var req_body = req.body;

    carousel.findOneAndDelete({_id:req_body.carousel_id})
    .then((data1)=>{
        res.status(200).json({message:"Success"});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}


function update_carousel(req,res)
{
    var req_body = req.body;

    carousel.findOneAndUpdate({_id:req_body.carousel_id}, {$set:{header:req_body.header, header_arabic: req_body.header_arabic, images:req_body.images, country:req_body.country}})
    .then((data1)=>{
        res.status(200).json({message:"Success"});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}


function fetch_carousel(req,res)
{
    carousel.find()
    .sort({index:0})
    .then((data1)=>{
        var carousels = [];
        var numberOfLoop1 = data1.length;

        syncLoop(numberOfLoop1, function(loop1){
            var index1 = loop1.iteration();
            var images = [];

            var numberOfLoop2 = data1[index1].images.length;
            syncLoop(numberOfLoop2, function(loop2){
                var index2 = loop2.iteration();

                store.findOne({_id:data1[index1].images[index2].store})
                .then((data2)=>{
                    images.push({
                        link: data1[index1].images[index2].link,
                        store: data1[index1].images[index2].store,
                        store_name: data2.name
                    });
                    loop2.next();
                })
                .catch((error)=>{
                    res.status(500).json({
                        error:error
                    })
                })
            },function(){
                carousels.push({
                    _id: data1[index1]._id,
                    images: images,
                    header:  data1[index1].header,
                    header_arabic: data1[index1].header_arabic,
                    index:  data1[index1].index
                })
                loop1.next();
            })
        },function(){
            res.status(200).json({message:"Success", carousel:carousels});
        })
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}


function create_banner(req,res)
{
    var req_body = req.body;

    banner.aggregate([
        {$match:{country: req_body.country}},
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
            image: req_body.image,
            country: req_body.country,
            store: req_body.store
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


function fetch_banner(req,res)
{    
    banner.find()
    .sort({index:0})
    .then((data1)=>{
        var numberOfLoop1 = data1.length;
        var banners = [];
        console.log(data1);
        syncLoop(numberOfLoop1, function(loop1){
            var index1 = loop1.iteration();
        
            store.findOne({_id:data1[index1].store})
            .then((data2)=>{
                if(data2 != null)
                {
                    banners.push({
                        _id: data1[index1]._id,
                        image: data1[index1].image,
                        index: data1[index1].index,
                        store: data1[index1].store,
                        store_name: data2.name,
                        country: data1[index1].country
                    });
                    loop1.next();
                }
                else
                {
                    loop1.next();
                }
            })
            .catch((error)=>{
                console.log(error);
                res.status(500).json({
                    error:error
                })
            })
        },function(){
            res.status(200).json({message:"Success", banner:banners});
        })
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({
            error:error
        })
    })
}


function delete_banner(req,res)
{    
    banner.findOneAndDelete({_id:req.query.banner_id})
    .then((data1)=>{
        res.status(200).json({message:"Success"});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function create_store(req,res)
{
    var req_body=req.body;
    /*
    store.aggregate([
        {$match:{country:req_body.country}},
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
    */    
        const obj = new store({
            country: req_body.country,
            name: req_body.name,
            name_arabic: req_body.name_arabic,
            link: req_body.link,
            tags: req_body.tags,
            index: req_body.index,
            logo: req_body.logo
        })
        obj.save()
        .then((data)=>{
            res.status(200).json({
                message: "Success",
                store: data
            });
        })
        .catch((error)=>{
            res.status(500).json({
                error:error
            })
        })
    /*})
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })*/
}

function update_store(req,res)
{
    var req_body=req.body;

    store.findOneAndUpdate({_id:req_body.store_id}, {
        $set:{
            country: req_body.country,
            name: req_body.name,
            name_arabic: req_body.name_arabic,
            link: req_body.link,
            tags: req_body.tags,
            index: req_body.index,
            logo: req_body.logo
        }
    })
    .then((data1)=>{
        res.status(200).json({
            message: "Success"
        });
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function create_deal(req,res)
{
    var req_body=req.body;

    store.findOne({_id:req_body.store})
    .then((data1)=>{
        if(data1 == null)
        {
            res.status(404).json({message:"Store does not exists"});
        }
        else
        {
            /*
            deal.aggregate([
                {$match:{store: req_body.store}},
                {$group:{_id:null, max_index:{$max:"$index"}}}
            ])
            .then((data2)=>{
                var new_index = 1;
                if(data2.length == 0)
                {
                    new_index = 1;
                }
                else
                {
                    new_index = data2[0].max_index + 1;
                }
                */
                const obj = new deal({
                    store: req_body.store,
                    name: req_body.name,
                    name_arabic: req_body.name_arabic,
                    link: req_body.link,
                    tags: req_body.tags,
                    used_times: req_body.used_times,
                    last_used: req_body.last_used,
                    coupon: req_body.coupon,
                    description: req_body.description,
                    description_arabic: req_body.description_arabic,
                    index: req_body.index,
                    image: req_body.image
                })
                obj.save()
                .then((data)=>{
                    res.status(200).json({
                        message:"Success",
                        deal: data
                    });
                })
                .catch((error)=>{
                    res.status(500).json({
                        error:error
                    })
                })
                /*
            })
            .catch((error)=>{
                res.status(500).json({
                    error:error
                })
            })*/
        }
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function update_deal(req,res)
{
    var req_body=req.body;

    deal.findOneAndUpdate({_id:req_body.deal_id}, {
        $set:{
            name: req_body.name,
            name_arabic: req_body.name_arabic,
            link: req_body.link,
            tags: req_body.tags,
            used_times: req_body.used_times,
            last_used: req_body.last_used,
            coupon: req_body.coupon,
            index: req_body.index,
            description: req_body.description,
            description_arabic: req_body.description_arabic,
            image: req_body.image
        }
    })
    .then((data1)=>{
        res.status(200).json({
            message: "Success"
        });
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function fetch_store(req,res)
{
    var req_body=req.query;
    var search = {};

    if(req_body.country == "ALL")
    {
        search = {};
    }
    else
    {
        search = {country: req_body.country};
    }

    store.find(search)
    .then((data1)=>{
        res.status(200).json({message:"Success", store:data1});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function fetch_deal(req,res)
{
    var req_body=req.query;
    
    deal.find({store: req_body.store})
    .then((data1)=>{
        res.status(200).json({message:"Success", deal:data1});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}


function fetch_all_store(req,res)
{
    store.find({})
    .then((data1)=>{
        res.status(200).json({message:"Success", store:data1});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
}

function fetch_all_deal(req,res)
{
    var response = [];
    deal.find({})
    .then((data1)=>{
        syncLoop(data1.length, function(loop1){
            var index1 = loop1.iteration();
            store.findOne({_id:(data1[index1].store).toString()})
            .then((data2)=>{
                response.push({
                    deal:data1[index1],
                    store:data2
                })
                loop1.next();
            })
            .catch((error)=>{
                console.log(error);
                res.status(500).json({
                    error:error
                })
            })
        },function(){
            res.status(200).json({message:"Success", deal:response});
        })
    })
    .catch((error)=>{
        console.log(error);
        res.status(500).json({
            error:error
        })
    })
}

function remove_store(req,res)
{
    var req_body = req.body;

    store.findOneAndDelete({_id: req_body.store})
    .then((data1)=>{
        deal.deleteMany({store: req_body.store})
        .then((data2)=>{
            res.status(200).json({message:"Success"});
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

function remove_country(req,res)
{
    var req_body = req.body;
    var stores = [];

    country.findOneAndDelete({name: req_body.name})
    .then(()=>{
        store.find({country: req_body.name})
        .then((data2)=>{
            syncLoop(data2.length, function(loop1){
                var index1 = loop1.iteration();
                stores.push((data2[index1]._id).toString());
                loop1.next();
            },function(){
                store.deleteMany({country: req_body.name})
                .then((data1)=>{
                    deal.deleteMany({store: stores})
                    .then((data2)=>{
                        res.status(200).json({message:"Success"});
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


function remove_deal(req,res)
{
    var req_body = req.body;

    deal.findOneAndDelete({_id: req_body.deal})
    .then((data2)=>{
        res.status(200).json({message:"Success"});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })        
    })
}

function create_country(req,res)
{
    var req_body = req.body;

    const obj = new country({
        name: req_body.name
    })

    obj.save()
    .then((data)=>{
        res.status(200).json({message:"Success"});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })   
    })
}


function update_country(req,res)
{
    var req_body = req.body;

    res.status(200).json({
        message: "Success"
    });
    /*
    country.findOneAndUpdate({name: req_body.name}, {$set:{name: req_body.new_name}})
    .then((data1)=>{
        res.status(200).json({
            message: "Success"
        });
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })
    })
    */
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


function fetch_users(req,res)
{
    user.find({},{password:0})
    .then((data)=>{
        res.status(200).json({message:"Success", users:data});
    })
    .catch((error)=>{
        res.status(500).json({
            error:error
        })   
    })
}

module.exports = {
    create_store, create_deal, fetch_store, fetch_deal, remove_store, remove_deal, remove_country, create_country, fetch_country, fetch_all_store, fetch_all_deal,
    fetch_users, update_country, update_store, update_deal, delete_banner, fetch_banner, create_carousel, fetch_carousel, update_carousel,
    delete_carousel, create_banner, delete_category, create_category, update_category, fetch_category
}