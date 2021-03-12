const express= require('express');
const router=express.Router();
const {Product}=require('../models/products');
const {Category}=require('../models/category');
const mongoose=require('mongoose')
const multer=require('multer')

const File_Type_Map={
    'image/jpg':'jpg',
    'image/jpeg':'jpeg',
    'image/png':'png',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid=File_Type_Map[file.mimetype]
        let uploadError=new Error('invalid image type');
        if(isValid){
           uploadError=null
        }
      cb(uploadError, 'public/upload')
    //   cb is callback returned with file destination if
    // error occur in storing
    },
    filename: function (req, file, cb) {
        // One way
    //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) 
    //   cb(null, file.fieldname + '-' + uniqueSuffix)
    // 2nd way
    const extension=File_Type_Map[file.mimetype]
    const fileName=file.originalname.split(' ').join('-');
    cb(null,`${fileName}-${Date.now()}.${extension}`)
    }
  })
const uploadOp = multer({ storage: storage })



router.get(`/`,async (req,res)=>{
    // const pro={
    //     id:1,name:'mad'
    // } 
    // res.send(pro)
    // res.send('hello api v1');//not executed

    let filter={}
        // localhost:3000/api/v1/products?categories=2342342,234234
    if(req.query.categories)
    {
        filter={category:req.query.categories.split(',')}
    }

    const plist=await Product.find(filter).populate('category');
    // const plist=await Product.find().select('name image -_id');
    // gives only name and image removing the id
    if(!plist){
        res.status(500).json({success:false})
    }
    res.send(plist);
    });

router.get(`/:pid`,async (req,res)=>{
     
   const prod=await Product.findById(req.params.pid).populate('category');
        if(!prod){
            res.status(500).json({success:false})
        }  
        res.send(prod);
        });
        // name of file field we are uploading from front-end 
router.post(`/`,uploadOp.single('image'), async (req, res) =>{

        const category = await Category.findById(req.body.category);
        // if we are posting product with no category
        if(!category) return res.status(400).send('Invalid Category');

        const file=req.file;
        if(!file) return res.status(400).send('No image in the request');
        const fileName = file.filename
        const basePath=`${req.protocol}://${req.get('host')}/public/upload/`;
        // // "http://localhost:3000/public/upload/

        let product = new Product({ 
            name: req.body.name,
            descr: req.body.descr,
            richDesc: req.body.richDesc,
            image: `${basePath}${fileName}`,
             // "http://localhost:3000/public/upload/image-2323232"
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        })
    
        product = await product.save();
    
        if(!product) 
        return res.status(500).send('The product cannot be created')
    
        res.send(product);
    })
// router.post(`/`,(req,res)=>{ 
//         // const newP=req.body  //gets data from client
//         const newP=new Product({
//             name:req.body.name,
//             image:req.body.image,
//             countInStock:req.body.countInStock
//         })
//         // saving the info in db save() returns a promise
//         newP.save()
//         .then(createdproduct=>res.status(201).json(createdproduct))
//         .catch((err)=>res.status(500).json({
//             error:err,
//             sucess:false
//         }))

//         // res.send(newP)
//         });

router.put('/:id',async (req, res)=> {
    if(!mongoose.isValidObjectId(req.params.id)) {
       return res.status(400).send('Invalid Product Id')
    }
    // while updating category must not be invalid
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid Category')

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
        },
        { new: true}
    )

    if(!product)
    return res.status(500).send('the product cannot be updated!')

    res.send(product);
})

router.delete('/:id', (req, res)=>{
    Product.findByIdAndRemove(req.params.id).then(product =>{
        if(product) {
            return res.status(200).json({success: true, message: 'the product is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "product not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})

router.get(`/get/count`, async (req, res) =>{
    const productCount = await Product.countDocuments((count) => count)

    if(!productCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        productCount: productCount
    });
})

router.get(`/get/featured/:count`, async (req, res) =>{
    const count = req.params.count ? req.params.count : 0
    // +sign makes count numeric
    const products = await Product.find({isFeatured: true}).limit(+count);

    if(!products) {
        res.status(500).json({success: false})
    } 
    res.send(products);
})
// route to upload gallery images
router.put('/gallery-images/:id',uploadOp.array('images',5),async (req, res)=> {
    if(!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id')
     }
    const files=req.files;
    let imagesPath=[];
    const basePath=`${req.protocol}://${req.get('host')}/public/upload/`;
    
    if(files){
      files.map(i=>{
          imagesPath.push(`${basePath}${i.fileName}`)
      })
    }
    
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            
            images: imagesPath
        },
         
        { new: true}
    )

    if(!product)
         { return res.status(500).send('the product cannot be updated!')}

    res.send(product);

})

module.exports=router;