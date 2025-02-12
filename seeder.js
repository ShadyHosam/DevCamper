const fs = require('fs');
const mongoose = require('mongoose');
const colors = require('colors');
const dotenv = require('dotenv');


// Load Env Variables

dotenv.config({
    path:'./config/config.env'
});

const Bootcamp = require('./models/bootcamp');
// Connect to the database

 mongoose.connect(process.env.MONGO_URI);


// Read the json files
const bootcamps = JSON.parse(
    fs.readFileSync(`${__dirname}/_data/bootcamps.json`,'utf-8'));

const importData = async ()=>{
    try {
        await Bootcamp.create(bootcamps);
            console.log('Data imported...'.green.inverse);
            process.exit();
    } catch (error) {
        console.log(error);
    }
}

// Delete data

const deleteData = async ()=>{
    try {
            await Bootcamp.deleteMany();
            console.log('Data destroyed..'.red.inverse);
            process.exit();
    } catch (error) {
        console.log(error);
    }
}

if (process.argv[2]==='-i'){
    importData();
}else if (process.argv[2]==='-d')
{
    deleteData();
}