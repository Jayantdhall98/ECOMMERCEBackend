const router = require("express").Router();
const dotenv=require("dotenv")

const User = require("../models/User");
const userotp=require("../models/Userotp");
const nodemailer= require("nodemailer");
const axios= require("axios")


dotenv.config();

// email config

// Email config
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "holicshoppo555@gmail.com",
        pass: "pxvf attr dlct unir" 
    }
});


// OTP verification and sending email
router.post("/sendotp", async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: "Please enter your valid email Id." });
    }
    try {
        const OTP = Math.floor(100000 + Math.random() * 900000);
        const existEmail = await userotp.findOne({ email: email });
        if (existEmail) {
            existEmail.otp = OTP;
            await existEmail.save();
        } else {
            await userotp.create({ email, otp: OTP });
        }

        const mailOptions = {
            from: "holicshoppo555@gmail.com",
            to: email,
            subject: "Sending Email for OTP Validation",
            text: `Your OTP: ${OTP}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error sending email:", error);
                return res.status(400).json({ error: "Failed to send email." });
            } else {
                console.log("Email sent:", info.response);
                return res.status(200).json({ message: "Email sent successfully." ,sent:"done"});
            }
        });
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Internal server error." });
    }
});

router.post("/verifyotp",async(req,res)=>{

    const {otp,email}=req.body;
    
    const data= await userotp.find({email:email})
      data.map((a)=>{
       
        if(a.otp===otp){
            return res.status(200).json({verify:"true"})
        }else{
            return res.status(200).json({verify:"false"})
    
        }
      })
})


    const sendVerificationEmail = (email, verificationLink) => {
        // Email options
        const mailOptions = {
          from: "holicshoppo555@gmail.com",
          to: email,
          subject: 'Account Verification',
          html: `<p>Click on the following link to verify your account: <a href="${verificationLink}">${verificationLink}</a></p>`
        };
      
        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending verification email:', error);
          } else {
            console.log('Verification email sent:', info.response);
          }
        });
      };
      

router.post("/sendverficationlink",async(req,res)=>{

    const { email } = req.body;

    const existEmail = await User.findOne({ email: email });
        if (existEmail) {

            const emailsign=existEmail.emailsign;
        
                // Assume your frontend is hosted at http://example.com
                const verificationLink = `${process.env.BASE_URL}/verify/${emailsign}`;
                sendVerificationEmail(email, verificationLink);
        } else {
            res.send("mail not existed or verified")
           console.log("mail not existed or verified")
        }
    })
        

router.post("/verifyaccount", async (req, res) => {
    const { emailsign } = req.body;
  
    try {
      const user = await User.findOneAndUpdate(
        { emailsign },
        { emailverified: true ,
            emailsign:null
         
        },
        { new: true }
      );
  
      if (user) {
        // Remove the emailsign field
        delete user.emailsign;
        
        // Save the updated user
        await user.save();
           
    }}catch (error) {
      console.error("Error verifying account:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


// REGISTER

router.post("/register", async (req, res) => {
    const { username, email, password, usertype } = req.body;

    try {
        // Check if the user already exists
        const existUser = await User.findOne({ email });

        if (existUser) {
            return res.status(400).json({ msg: "User already exists. Please login." });
        }

        // Create a new user
        const newUser = new User({
            username,
            email,
            password,
            usertype,
            emailsign: Array.from({ length: 10 }, () => String.fromCharCode(97 + Math.floor(Math.random() * 26))).join('')

        });

        // Save the new user to the database
        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ error: "Failed to register user." });
    }
});


//for session authenticate
// router.get("/",(req,res)=>{
      
   
//     if(req.session.userid){
//         // console.log("session found" +  req.session.userid)
//         return res.json({value:true, usertype:req.session.usertype})
//     }else{
//         // console.log("session not found" +  req.session.userid)
//         return res.json({value:false,userid:"not authenticated"})
//     }
// })
router.get("/", (req, res) => {
    if (req.user && req.user._id) {
        return res.json({ value: true, usertype: req.user.usertype,username:req.user.username });
    } else if (req.session.userid) {
        return res.json({ value: true, usertype: req.session.usertype,username:req.session.username });
    } else {
        return res.json({ value: false, userid: "not authenticated" });
    }
});
//Destroy session

// router.get("/destroy",async(req,res)=>{
//     req.session.destroy();
// res.send("destroyed")

// })

router.get("/destroy", async (req, res) => {
    try {
        if (req.user) {
            req.session.destroy();// Logout user using Passport
        }
        req.session.destroy(); // Destroy session manually
        res.send("destroyed");
    } catch (err) {
        res.status(500).send(err);
    }
});





//login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email });

        if (!user) {
            throw new Error("User not found");
            res.send({ success: false, message: "user not exist " });
        }

        if (password && user.password === password && user.emailverified === true) {
            console.log("Welcome to the shopping app!!");
            req.session.userid = user._id;
            req.session.usertype = user.usertype;
            req.session.username = user.username;

            let message = { msg: "Welcome " + user.username, usertype: user.usertype };
            res.send(message);
        } else {
            res.send({ success: false, message: "Please check your password or verify your email through the link we've sent to your mailbox" });
        }
    } catch (error) {
        res.status(500).send({ success: false, message: "Internal server error" });
    }
});


// Get all users for our admin 
// router.get("/allusers",async(req,res)=>{
// try{
//       if(req.session.userid && req.session.usertype=="admin"){

//           const allusers= await User.find().select('-password')
//           res.send(allusers)
//         }else{
//             console.log("Normal user can not access it...")
//         }
// }catch(err){
//     res.send(err)
// }

// })
router.get("/allusers", async (req, res) => {
    try {
        if (req.session.userid || req.user?._id) {
            if(req.session.usertype === "admin" || req.user?.usertype === "admin") {
                const allusers = await User.find().select('-password');
                res.send(allusers);
            } else {
                // User ko access nahi hai
                res.status(403).json({ error: "User cannot access this resource." });
            }
        } else {
            // User ko access nahi hai
            res.status(403).json({ error: "User cannot access this resource." });
        }
    } catch (err) {
        // Server error
        res.status(500).json({ error: "Server error." });
    }
});









module.exports = router;