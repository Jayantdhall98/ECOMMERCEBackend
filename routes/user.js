const router=require("express").Router();
const User = require("../models/User");


// router.put("/updateuser/:id",async(req,res)=>{
//     try{
//         if(req.session.usertype=="admin"){

//             const{...rest}=req.body
//             await User.updateOne({_id:req.params.id}, rest)
//             res.send({success:true,message:"Data updated"})
            
//         }else{

//             console.log("you have no access to update")
//         }
//         }catch(err){
//         res.send(err)
//     }
// })
router.put("/updateuser/:id", async (req, res) => {
    try {
        let userType;
        if (req.session.userid) {
            userType = req.session.usertype;
        } else if (req.user && req.user._id) {
            userType = req.user.usertype;
        }

        if (userType === "admin") {
            const { ...rest } = req.body;
            await User.updateOne({ _id: req.params.id }, rest);
            res.send({ success: true, message: "Data updated" });
        } else {
            console.log("You have no access to update");
            res.status(403).send("You have no access to update");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});





module.exports=router