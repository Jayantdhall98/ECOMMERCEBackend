const router=require("express").Router();

const Cart = require("../models/Cart");
const Product = require("../models/Product");



//Add to cart 
router.post("/addcart",async (req,res)=>{
    const newCart= new Cart({
        userid:req.session.userid||req.user._id,
        productId:req.body.productId,
        quantity:req.body.quantity
    })
    const savedCart = await newCart.save();
    res.send(savedCart)
})


//Get to cart

// router.get("/cartproducts/:userid",async(req,res)=>{
    
//   const mycartitems=await Cart.find({userid:req.params.userid})
      
      
//        res.send(mycartitems)
// })

// Route to fetch cart data for a specific user
router.get('/cartproducts', async (req, res) => {
  try {
    const userid = req.session.userid || (req.user ? req.user._id : undefined);
    
    // Fetch cart items for the user from the Cart collection
    const cartItems = await Cart.find({ userid });

    // Iterate over each cart item and fetch product information from the Product collection
    const promises = cartItems.map(async (cartItem) => {
      const productId = cartItem.productId;
      const productData = await Product.findById(productId); // Exclude quantity field
     
      return {
        ProductId:productData._id,
        title: productData.title,
        desc: productData.desc,
        img: productData.img,
        categories: productData.categories,
        size: productData.size,
        color: productData.color,
        price: productData.price,
        quantity: cartItem.quantity
      };
    });

    // Wait for all promises to resolve and send the combined data as response
    const combinedData = await Promise.all(promises);
    res.json(combinedData);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});









//delt cart item 
router.delete("/deltcartitem/:productId",async(req,res)=>{

   try{

     
     const deleteditem=await Cart.findOneAndDelete({productId:req.params.productId,
    
      userid:req.session.userid||req.user._id
    })
    res.send(deleteditem)
    
  }catch(err){
    res.send(err)
  }
    
})




module.exports=router
