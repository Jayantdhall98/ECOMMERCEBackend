const { strict } = require("assert")
const mongoose=require("mongoose");



const OrderSchema=new mongoose.Schema(

{
    orderid:{
        type:String,
        required:true,
    
    },
    userid:{
        type:String,
        required:true,
    
    },
    name:{
        type:String,
        required:true,
    
    },
    products:[
        {
            productId:{
                type:String,

            },
            img:{
                type:String,

            },
            title:{
                type:String,

            },
            desc:{
                type:String,

            },
            category:{
                type:String,

            },
            quantity:{
                type:Number,
                default:1,
            }
        }
    ],

    amount:{
        type:Number,
        required:true

    },

    address:{
        type:Object,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    email:{
        type:String,
        required:true
    },
   
    status:{
        type:String,
        default:"Pending"
    },
    
    
    
},{timestamps:true});


module.exports=mongoose.model("Order",OrderSchema);