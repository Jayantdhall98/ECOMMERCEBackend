const { strict } = require("assert")
const mongoose=require("mongoose")

const UserSchema=new mongoose.Schema(

{
    username:{
        type:String,
        required:true,
       
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
       
        
    },
    usertype:{
        type:String,
        default:"user",

    },
    signupmode:{
        type:String,
       default:"site"

    },
    emailsign:{
        type:String
      

    },
    emailverified:{
        type:Boolean,
        
    

    },
    
},{timestamps:true});


module.exports=mongoose.model("User",UserSchema);