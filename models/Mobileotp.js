const mongoose = require('mongoose');
const validator = require("validator");

const MobileOTPSchema = new mongoose.Schema({
    mobile: {
        type: Number,
        required: true,
        unique: true,
        
        },
 
    otp: {
        type: String,
        required: true
    }
},{timestamps:true});

const MobileOTP = mongoose.model("MobileOTP", MobileOTPSchema);

module.exports = MobileOTP;
