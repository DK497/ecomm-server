const express= require('express');
const bp= require('body-parser');
const morgan=require('morgan');
const cors=require('cors');  
const mongoose=require('mongoose'); 
const authjwt=require('./helper/jwt');
const errorHandler=require('./helper/errorhandler');

const app=express();
require('dotenv/config');

const api=process.env.some_url;

app.use(cors());
app.options('*',cors());


//middleware
app.use(bp.json());
app.use(morgan('tiny'));
app.use(authjwt());
app.use('/public/upload',express.static(__dirname+'/public/upload'))
app.use(errorHandler);

app.get('/',(req,res)=>{
res.send('hello api');
});
// Routes
const categoriesRoutes = require('./routes/categories');
const prouter=require('./routes/products');
const usersRoutes = require('./routes/users');
const ordersRoutes = require('./routes/orders');

// enabling routes
app.use(`${api}/products`,prouter)
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

// DB
mongoose.connect(process.env.conn_str,{
    useNewUrlParser:true,useUnifiedTopology:true,
    dbName:'ecdata'
})
.then(()=>console.log('DB ready'))
.catch((err)=>console.log(err))

// development
// app.listen(3000,()=>{
//     console.log(api);
//     console.log('Server is runnin at port 3000');
// });

// Production
var server=app.listen(process.env.PORT||3000,()=>{
    var port =server.address().port;
    console.log(`Express working on port ${port}`)
})