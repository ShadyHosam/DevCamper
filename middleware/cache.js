const client = require("../utils/redis");
const Bootcamp = require('../models/Bootcamp');
const advancedResults = require('./advancedResults');
const cacheBootcamps = async(req,res,next)=>{

        try{
            // check if the bootcamp data is in the redis cache..
            client.get('bootcamps',async(err,data)=>{
                if(err){
                    console.log(`there is an error in redis ${err}`);
                    return next(err);
                }
                if(data){
                    // if asked data is already cached and exist!
                    return res.status(200).json({
                        success:true,
                        data:JSON.parse(data),
                    });

                }
                else{
                    // no data in redis , so get it from the database
                    next();
                }
            });
        }catch(error){
            next(error);
        }       

};

// this middleware to cache data into redis 

const cacheBootcampsData = async(req,res,next)=>{
    try{
            const bootcamps = await Bootcamp.find();

                // cache the data in redis for 1 hour 
    
                    client.setEx('bootcamps',3600,JSON.stringify(res.advancedResults));
                    next();
                }catch(error){
        next(error);
    }
};
module.exports = {
    cacheBootcamps,
    cacheBootcampsData
};