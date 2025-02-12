const express=require('express');
const dotenv=require('dotenv');
const logger = require('./middleware/logger')

const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors')
const errorHandler = require('./middleware/error');
const geocoder = require('./utils/geocoder'); 


dotenv.config({path:'./config/config.env'});
const bootcamps = require('./routes/bootcamps');
const app = express();

app.use(express.json());


connectDB();


// Body Parser 

// Dev logging middleware

if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
    

app.use('/api/v1/bootcamps',bootcamps);


app.use(errorHandler);
const PORT = process.env.PORT || 5000;

const server = app.listen(
    PORT,
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);



// handel unhandeled promise rejection
process.on('unhandledRejection' , (err,Promise)=>{
console.log(`Error: ${err.message}`);

// close server & exist process 
server.close(()=>process.exit(1));
});
