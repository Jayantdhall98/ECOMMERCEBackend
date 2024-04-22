const { strict } = require("assert")
const mongoose=require("mongoose");



const PaymentSchema=new mongoose.Schema(

{
    razorpay_order_id:{
        type:String,
        required:true,
    
    },
    razorpay_payment_id:{
        type:String,
        required:true,
    
    },
    razorpay_signature:{
        type:String,
        required:true,
    
    },
    userid:{
        type:String,
        required:true,
    
    },
    username:{
        type:String,
        required:true,
    
    },
    
    
    
    
},{timestamps:true});


module.exports=mongoose.model("Payment",PaymentSchema);