const {Category} = require('../models/category');
const express = require('express');
const router = express.Router();

router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList) {
        res.status(500).json({success: false})
    } 
    res.status(200).send(categoryList);
})
router.get(`/:cid`, async (req,res)=>{
    const category = await Category.findById(req.params.cid);

    if(!category) {
        res.status(500).json({message:'category with givent id was not found',
                               success: false})
    } 
    res.status(200).send(category);

})
router.put(`/:cid`,async (req,res)=>{ 
    // const newP=req.body  //gets data from client
    const category=await Category.findByIdAndUpdate(req.params.cid,
        {name:req.body.name,
        icon:req.body.icon,
        color:req.body.color},{
            new:true
        }
    )
  
    if(!category){
        return res.status(404).send('category cannot be updated');
    }
     
    res.status(200).send(category); 
     });
router.post(`/`,async (req,res)=>{ 
    // const newP=req.body  //gets data from client
    const newC=new Category({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color
    })
    // saving the info in db save() returns a promise
    categ=await newC.save();
    if(!categ){
        return res.status(404).send('Category cannot be created');
    }
     
    res.status(200).send(categ);
     });
router.delete('/:cid',async (req,res)=>{
  try { const categ= await Category.findByIdAndRemove(req.params.cid);
   if(!categ){
    return res.status(404).json({success:false,message:'category deletion failed'})
   }
  res.status(200).json({success:true,message:'category deleted succesfully'})
   }
   catch (err){
       return res.status(400).json({success:false,error:err}) 


   }
     
   

})

module.exports =router;