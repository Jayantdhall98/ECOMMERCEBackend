const mongoose=require('mongoose')
const validator=require("validator")



const Userotpschema= new mongoose.Schema({

    email:{
        type:String,
        required:true,
        unique:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Not valid email")
            }
        }
    },
    otp:{
        type:String,
        required:true
    }

},{timestamps:true})


//User otp model 

const userotp=new mongoose.model("userotps",Userotpschema)


module.exports=userotp