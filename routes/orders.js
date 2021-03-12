const {Order} = require('../models/order');
const express = require('express');
const { OrderItem } = require('../models/order-item');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const orderList = await Order.find().populate('user','name').sort('dateOrdered');

    if(!orderList) {
        res.status(500).json({success: false})
    } 
    res.send(orderList);
})

router.get(`/:oid`, async (req, res) =>{
    const order = await Order.findById(req.params.oid)
    .populate('user','name')
    .populate({
        path:'orderItems',populate:
         {path:'product',populate:'category'}
        });

    if(!order) {
        res.status(500).json({success: false})
    } 
    res.send(order);
})

router.post(`/`,async (req,res)=>{ 
const orderItemIds=Promise.all(req.body.orderItems.map(async i=>{
    let newOrderItem=new OrderItem({
        quantity:i.quantity,
        product:i.product
    })
    newOrderItem= await newOrderItem.save()
    //  returns item which was saved
   
    return newOrderItem._id;//returning a promise
}))

const orderItemIdsresolved= await orderItemIds;
// console.log(orderItemIdsresolved);
// to ensure price is coming from backend

const totalPrices= await Promise.all(orderItemIdsresolved.map(async id=>{
    const oitem=await OrderItem.findById(id).populate('product','price');
    const totalPrice=oitem.product.price*oitem.quantity
    return totalPrice
}))

const finalPrice=totalPrices.reduce((a,b)=>a+b,0);


    let newO=new Order({
        orderItems: orderItemIdsresolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: finalPrice,
        user: req.body.user,
    })
    // saving the info in db save() returns a promise
    newO=await newO.save();
    if(!newO){  
        return res.status(404).send('Order cannot be created');
    }
     
    res.status(200).send(newO);
     })


router.put('/:id',async (req, res)=> {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status
            },
            { new: true}
        )
    
        if(!order)
        return res.status(400).send('the order cannot be update!')
    
        res.send(order);
    })
    
    
router.delete('/:oid',async (req,res)=>{
        try { const order= await Order.findByIdAndRemove(req.params.oid);

         if(!order){
          return res.status(404).json({success:false,message:'order deletion failed'})
         }
        // a promise when accessing from DB
        await order.orderItems.map(async i=>{
           orderids=await OrderItem.findByIdAndDelete(i)
           if(!orderids){
            return res.status(404).json({success:false,message:'order id deletion failed'})
           }
        })
        res.status(200).json({success:true,message:'order deleted succesfully'})
         }
         catch (err){
             return res.status(500).json({success:false,error:err,message:"error in server"}) 
      
      
         }
  })
    
router.get('/get/totalsales', async (req, res)=> {
        const totalSales= await Order.aggregate([
            { $group: { _id: null , totalsales : { $sum : '$finalPrice'}}}
        ])
    
        if(!totalSales) {
            return res.status(400).send('The order sales cannot be generated')
        }
    
        res.send({totalsales: totalSales.pop().totalsales})
    })
    
router.get(`/get/count`, async (req, res) =>{
        const orderCount = await Order.countDocuments((count) => count)
    
        if(!orderCount) {
            res.status(500).json({success: false})
        } 
        res.send({
            orderCount: orderCount
        });
    })
    
router.get(`/get/userorders/:userid`, async (req, res) =>{
        const userOrderList = await Order.find({user: req.params.userid}).populate({ 
            path: 'orderItems', populate: {
                path : 'product', populate: 'category'} 
            }).sort({'dateOrdered': -1});
    
        if(!userOrderList) {
            res.status(500).json({success: false})
        } 
        res.send(userOrderList);
    })
    

module.exports =router;