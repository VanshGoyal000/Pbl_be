const mongoose = require('mongoose');
require('dotenv').config();
async function connectDb(){
try {
    const Instance = await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log('Connected to MongoDB');
} catch (error) {
    console.error("Error while connecting to the mongodb" , error);
    process.exit(1);
}
}
module.exports = {connectDb};