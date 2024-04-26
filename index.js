const express= require("express")
const app= express();
const mongoose=require("mongoose")
const dotenv=require("dotenv")
const userRoute=require("./routes/user")
const authRoute=require("./routes/auth")
const productRoute=require("./routes/product")
const cartRoute=require("./routes/cart")
const orderRoute=require("./routes/order")
const session = require("express-session");
const passport= require('passport')
const OAuth2Strategy=require('passport-google-oauth2').Strategy;
const User = require('./models/User')

const cookieParser = require("cookie-parser");


const cors=require("cors")
dotenv.config();

// declare global {
//     namespace Express {
//       interface Request {
//         // currentUser might not be defined if it is not logged in
//         session: Express.Session;
//       }
//     }
//   }
//   interface Session extends SessionData {
//     id: string;
//     regenerate(callback: (err: any) => void): void;
//     destroy(callback: (err: any) => void): void;
//     reload(callback: (err: any) => void): void;
//     save(callback: (err: any) => void): void;
//     touch(): void;
//     cookie: SessionCookie;
//   }

//   interface User{
//     username: string;
//     id:string 
//   }
  
  
//   type NewSession=Express.Session & User
  
//   declare global {
//     namespace Express {
//       interface Request {
//         // currentUser might not be defined if it is not logged in
//         session: NewSession;
//       }
//     }
//   }
mongoose.connect(process.env.MONGO_URL).then(()=>console.log("DB Connection")).catch((err)=>{console.log(err)});



const clientid="1086148459049-oesm6qbhed0o8enopvb0fevcgu18q6jn.apps.googleusercontent.com"
const clientsecret= "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"


app.use(cors({
    origin: ['https://kaleidoscopic-cucurucho-34b5c3.netlify.app'], // Replace with your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Enable CORS credentials (cookies, authorization headers)

}));
app.use(express.json());

app.use(session({
    secret: "thisismysecrctekey",
saveUninitialized:true,
cookie: { maxAge: 1000 * 60 * 60 * 24 ,
    sameSite:"none"
   },
resave: true
}))
// app.use(cookieParser());

//setup passport
app.use(passport.initialize());
app.use(passport.session());


passport.use(
    new OAuth2Strategy({
        clientID: clientid,
        clientSecret: clientsecret,
          callbackURL: "/google/callback", // Corrected typo here
          scope: ["profile", "email"]
       },
    async(accessToken,refreshToken,profile,done)=>{
        // console.log(profile)
        try {
            let user=await User.findOne({
                email:profile.emails[0].value
            })

            if(!user){
                 user=new User({
                    username:profile.displayName,
                    email:profile.emails[0].value,
                    signupmode:"google"
                 }) 
                 await user.save();
            }
            return done(null,user)
        } catch (error) {
            return done(error,null)
        }
    }
    )
)

passport.serializeUser((user,done)=>{
    done(null,user);
})
passport.deserializeUser((user,done)=>{
    done(null,user);
})

//initial google  auth login
app.get('/google',passport.authenticate("google",{scope:["profile","email"]}))

app.get("/google/callback",passport.authenticate("google",{successRedirect:`${process.env.BASE_URL}/products`,
failureRedirect:`${process.env.BASE_URL}/login`}))



app.use(express.urlencoded({ extended: true }));
app.use("/api/users",userRoute);
app.use("/api/auth",authRoute);
app.use("/api/product",productRoute);
app.use("/api/cart",cartRoute);
app.use("/api/order",orderRoute);



app.get("/key",(req,res)=>{
   res.status(200).json({key:process.env.RAZORPAY_API_KEY})
})



app.listen(process.env.PORT||5000,()=>{
    console.log("Backend server is running")
     
})

