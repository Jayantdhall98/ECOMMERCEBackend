// const router = require("express").Router();
// const Razorpay = require("razorpay");
// const Payment=require('../models/Payment_confirm')
// const Order=require('../models/Order')
// const dotenv = require("dotenv");
// const crypto=require("crypto");
// dotenv.config();
// const instance = new Razorpay({
//   key_id: process.env.RAZORPAY_API_KEY,
//   key_secret: process.env.RAZORPAY_API_SECRET,
// });




// router.post("/checkout", async (req, res) => {

// const {name,productId,quantity,address,state,city,pincode,mobile,email,amount}=req.body
    
// // console.log(name,productId,quantity,address,state,city,pincode,email,amount)

//   const options = {
//     amount: Number(amount*100),
   
//     currency: "INR",
//   };
//   // const order= await instance.orders.create(options)
//   const order = await instance.orders.create(options);
  
//   res.status(200).json({
//     success:true,
//     order
//   });

//   await Order.create({
//     orderid:order.id,
//     userid:req.session.userid,
//     name:name,
//     products:[
//       {
//         productId:productId,
//         quantity:quantity
//       }
//     ],
//     amount:order.amount,
//     address:{
//     address:address,
//     state:state,
//     city:city,
//     pincode:pincode
//     },
//     mobile:mobile,
//     email:email
//    })



// });



// router.post("/paymentverification", async (req, res) => {
//   const {razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;
  
// const body=razorpay_order_id + "|" + razorpay_payment_id;


// const expectedSignature=crypto.createHmac('sha256',process.env.RAZORPAY_API_SECRET).update(body.toString()).digest('hex');


// const isAuthentic= expectedSignature===razorpay_signature

// if(isAuthentic){

//   await Payment.create({
//     razorpay_order_id:razorpay_order_id,
//     razorpay_payment_id:razorpay_payment_id,
//     razorpay_signature:razorpay_signature,
//     userid:req.session.userid,
//     username:req.session.username
//   })

//   // Database save





//  res.redirect(`https://ecommercebackend-6zsu.onrender.com/paymentsuccess?reference=${razorpay_payment_id}`);
  
  
// }else{
//   res.status(400).json({
//     success:false
//   });

// }



  
// });


// // router.post("/orderplaced",async(req,res)=>{

// // const order= await Order.create({
// //   orderid:req.body.orderid,
// //   userid:req.session.userid,
// //   name:req.body.name,
// //   products:[
// //     {
// //       productId:req.body.productId,
// //       quantity:req.body.quantity
// //     }
// //   ],
// //   amount:req.body.amount,
// //   address:{
// //   address:req.body.address,
// //   state:req.body.state,
// //   city:req.body.city,
// //   pincode:req.body.pincode
// //   },
// //   mobile:req.body.mobile,
// //   email:req.body.email
// //  })
// //  res.send({
// //   msg:"Order Placed",order
// //  })


// // })



// router.get('/getpaidorders', async (req, res) => {
//   try {
//     // Find all payment records
//     const payments = await Payment.find();

//     // Extract order IDs from payment records
//     const orderIds = payments.map(payment => payment.
//       razorpay_order_id);

//     // Find orders where the order ID exists in the payment records
//     const paidOrders = await Order.find({ orderid: { $in: orderIds } });

//     // Return the paid orders in the response
//     res.status(200).json(paidOrders);
//   } catch (error) {
//     // Handle errors
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while fetching paid orders.' });
//   }
// });






// module.exports = router;



const router = require("express").Router();
const Razorpay = require("razorpay");
const Payment = require('../models/Payment_confirm');
const Order = require('../models/Order');
const Product = require("../models/Product");
const MobileOTP=require("../models/Mobileotp")
const dotenv = require("dotenv");
const crypto = require("crypto");
const twilio=require("twilio")
dotenv.config();

const accountSid="AC0aa918f5b16cdf4ad6782692c6f5aee9"
const authToken="674e9550f1b5d92cdc5247f411c08d65"

const senderNumber="+17274782407"

const client= new twilio(accountSid,authToken)



//mobileotp send and verify 

// router.post("/sendmobileotp",async(req,res)=>{
// const {mobile}=req.body;
// if (!mobile) {
//   return res.status(400).json({ error: "Please enter your valid mobile number." });
// }
// try {
  
//   const OTP=  Math.floor(100000+Math.random()*900000);
//   ;
//   const existmobile = await MobileOTP.findOne({ mobile: mobile });
//         if (existmobile) {
//             existmobile.otp = OTP;
//             await existmobile.save();
//         } else {
//             await MobileOTP.create({ mobile, otp: OTP });
//         }
  
//   client.messages.create({
//     body:`Your OTP is ${OTP}`,
//     from:senderNumber,
//     to:`+916284094363`
//   }).then((message)=>{
//     if(message&&message.sid){
//       res.send({success:true})

//     }else{
//       res.send("enter your valid mobile number" )
//     }
    
//   })
// }


//  catch (error) {
//   res.send(error)
// }
// })
router.post("/sendmobileotp", async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) {
    return res.status(400).json({ error: "Please enter your valid mobile number." });
  }
  try {
    const OTP = Math.floor(100000 + Math.random() * 900000);

    const existmobile = await MobileOTP.findOne({ mobile: mobile });
    if (existmobile) {
      existmobile.otp = OTP;
      await existmobile.save();
    } else {
      await MobileOTP.create({ mobile, otp: OTP });
    }

    client.messages.create({
      body: `Your OTP is ${OTP}`,
      from: senderNumber,
      to: `+916284094363` // Use dynamic 'to' number based on request body
    }).then((message) => {
      if (message && message.sid) {
        res.send({ success: true });
      } else {
        res.status(500).send("Failed to send OTP");
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
});


//verify mobile otp

router.post("/verifymobileotp", async (req, res) => {
  const { mobile, otp } = req.body;

  try {
    const otpDoc = await MobileOTP.findOne({ mobile, otp });

    if (!otpDoc) {
      return res.send({ success: false, message: "Invalid OTP" });
    }

    const timeDiff = calculateTimeDifference(otpDoc);

    if (timeDiff <= 300) {
      res.send({ success: true });
    } else {
      res.send({ success: false, message: "Resend OTP" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: "Internal server error" });
  }
});

function calculateTimeDifference(otpDoc) {
  const currentTime = new Date().getTime();
  const otpTime = otpDoc.updatedAt ? otpDoc.updatedAt.getTime() : otpDoc.createdAt.getTime();
  console.log((currentTime - otpTime) / 1000);
  return (currentTime - otpTime) / 1000;
}



router.post("/clearotp",async(req,res)=>{
 const {mobile}=req.body
     await MobileOTP.findOneAndDelete({mobile})
    res.send({success:true,message:"deleted"})
})
// router.post("/verifymobileotp", async (req, res) => {
//   const { mobile, otp } = req.body;
// console.log(req.body)
//   try {
//     // Retrieve OTP document from the database
//     const otpDoc = await MobileOTP.findOne({ mobile });

//     if (!otpDoc) {
//       return res.status(401).send({ success: false, error: "OTP not found" });
//     }

//     // Check if the OTP is correct
//     if (otpDoc.otp !== otp) {
//       return res.status(401).send({ success: false, error: "Invalid OTP" });
//     }

//     // Check if OTP is within 30-second window
//     const currentTime = new Date();
//     const otpTime = otpDoc.createdAt.getTime(); // Get timestamp from OTP document
//     const timeDiff = (currentTime - otpTime) / 1000; // Convert milliseconds to seconds

//     if (timeDiff > 30) {
//       // If OTP is older than 30 seconds, generate a new OTP
//       const newOTP =   Math.floor(100000+Math.random()*900000);
//       ; // Function to generate a new OTP
//       // Update OTP and timestamp in the database
//       await MobileOTP.updateOne({ mobile }, { otp: newOTP, createdAt: new Date() });
//       // Send the new OTP to the user
//       // You can use your existing code to send the OTP via SMS
//       // For brevity, I'm omitting the SMS sending logic here
//       return res.send({ success: true, message: "New OTP generated and sent" });
//     }

//     // OTP is valid
//     res.send({ success: true, message: "OTP verified successfully" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).send({ success: false, error: "Internal server error" });
//   }
// });








// Initialize Razorpay instance with your API key and secret
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_API_KEY,
  key_secret: process.env.RAZORPAY_API_SECRET,
});

// Route to create a new order
router.post("/checkout", async (req, res) => {
  try {
    // Extract required data from request body
    const { name, productId, quantity, address, state, city, pincode, mobile, email, amount } = req.body;

    // Check if all required data is present
    if (!name || !productId || !quantity || !address || !state || !city || !pincode || !mobile || !email || !amount) {
      return res.status(400).json({ success: false, error: "Missing required data in the request body." });
    }else{

      
      // Create options for the Razorpay order
      const options = {
        amount: Number(amount * 100), // Amount in paisa (e.g., 50000 paisa = ₹500)
        currency: "INR",
      };
      
      // Create an order using Razorpay API
      const order = await instance.orders.create(options);
      
      // Create a new order document with order ID and other details
      await Order.create({
        orderid: order.id,
        userid: req.session.userid||req.user._id,
        name: name,
        products: [{ productId: productId, quantity: quantity }],
        amount: amount,
        address: { address: address, state: state, city: city, pincode: pincode },
        mobile: mobile,
        email: email
      });
      
      // Send success response with order details
      res.status(200).json({ success: true, order });
    }
  } catch (error) {
    // Handle errors during checkout
    console.error("Error during checkout:", error);
    res.status(500).json({ success: false, error: "An error occurred during checkout." });
  }
});

// Route to verify payment and save payment details
router.post("/paymentverification", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Construct the expected signature and verify authenticity
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_API_SECRET).update(body).digest('hex');
    const isAuthentic = expectedSignature === razorpay_signature;

    // If the signature is authentic, save payment details
    if (isAuthentic) {
      await Payment.create({
        razorpay_order_id: razorpay_order_id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        userid: req.session.userid||req.user._id,
        username: req.session.username||req.user.username
      });

      // Redirect to payment success page with reference ID
      return res.redirect(`${process.env.BASE_URL}/paymentsuccess?reference=${razorpay_payment_id}`);
    } else {
      // If signature is not authentic, send error response
      return res.status(400).json({ success: false, error: "Invalid signature." });
    }
  } catch (error) {
    // Handle errors during payment verification
    console.error("Error during payment verification:", error);
    res.status(500).json({ success: false, error: "An error occurred during payment verification." });
  }
});

// Route to fetch paid orders
router.get('/getpaidorders', async (req, res) => {
  try {
    // Find all payment records
    const payments = await Payment.find();

    // Extract order IDs from payment records
    const orderIds = payments.map(payment => payment.razorpay_order_id);

    // Find orders where the order ID exists in the payment records for the current user
    const paidOrders = await Order.find({ orderid: { $in: orderIds } });

    // Map through paidOrders and fetch product data for each product ID
    const updatedPaidOrders = await Promise.all(paidOrders.map(async (order) => {
      // Fetch product data for each product in the order
      const productsData = await Promise.all(order.products.map(async (product) => {
        const productData = await Product.findById(product.productId);
        return {
          productId: productData._id,
          title: productData.title,
          desc: productData.desc,
          img: productData.img,
          categories: productData.categories,
          price: productData.price,
          quantity: product.quantity
        };
      }));
      
      // Update the order object with product details
      order.products = productsData;
      return order;
    }));

    // Return the updated paid orders belonging to the current session user in the response
    res.status(200).json(updatedPaidOrders);
  } catch (error) {
    // Handle errors while fetching paid orders
    console.error("Error while fetching paid orders:", error);
    res.status(500).json({ error: 'An error occurred while fetching paid orders.' });
  }
});


// Route to fetch paid orders
// router.get('/getuserpaidorders', async (req, res) => {
//   try {
//     // Find all payment records
//     const payments = await Payment.find();

//     // Extract order IDs from payment records
//     const orderIds = payments.map(payment => payment.razorpay_order_id);

//     // Find orders where the order ID exists in the payment records
//     const paidOrders = await Order.find({ orderid: { $in: orderIds }, userid: req.session.userid });

   

//     // Return the paid orders belonging to the current session user in the response
//     res.status(200).json(paidOrders);
//   } catch (error) {
//     // Handle errors while fetching paid orders
//     console.error("Error while fetching paid orders:", error);
//     res.status(500).json({ error: 'An error occurred while fetching paid orders.' });
//   }
// });




router.get('/getuserpaidorders', async (req, res) => {
  try {
    // Find all payment records
    const payments = await Payment.find();

    // Extract order IDs from payment records
    const orderIds = payments.map(payment => payment.razorpay_order_id);

    // Check if user ID is available in the session or user object
    const userId = req.session.userid || (req.user && req.user._id);

    if (!userId) {
      // Handle case when neither req.session.userid nor req.user._id is available
      console.error('User ID not found in session or user object');
      return res.status(400).json({ error: 'User ID not found' });
    }

    // Find orders where the order ID exists in the payment records for the current user
    const paidOrders = await Order.find({ orderid: { $in: orderIds }, userid: userId });

    // Map through paidOrders and fetch product data for each product ID
    const updatedPaidOrders = await Promise.all(paidOrders.map(async (order) => {
      // Fetch product data for each product in the order
      const productsData = await Promise.all(order.products.map(async (product) => {
        const productData = await Product.findById(product.productId);
        return {
          productId: productData._id,
          title: productData.title,
          desc: productData.desc,
          img: productData.img,
          categories: productData.categories,
          price: productData.price,
          quantity: product.quantity
        };
      }));
      
      // Update the order object with product details
      order.products = productsData;
      return order;
    }));

    // Return the updated paid orders belonging to the current session user in the response
    res.status(200).json(updatedPaidOrders);
  } catch (error) {
    // Handle errors while fetching paid orders
    console.error("Error while fetching paid orders:", error);
    res.status(500).json({ error: 'An error occurred while fetching paid orders.' });
  }
});






module.exports = router;
