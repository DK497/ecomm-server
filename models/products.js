//mongoose schema and model
const mongoose=require('mongoose'); 

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    descr: {
        type: String,
        default:''
    },
    richDesc: {
        type: String,
        default:''
    },
    image: {
        type: String,
        default:''
    },
    images:[{
        type:String

    }],
    brand: {
        type: String,
        default:''
    },
    price: {
        type: Number,
        default:0
    },
    category: {//connected to different schema
        type: mongoose.Schema.Types.ObjectId,
        ref:'Category'
    },
    countInStock: {
        type: Number,
        required: true,
        min:0,
        max:255
    },
    rating: {
        type: Number,
        default:0
    },
    numReviews: {
        type: Number,
        default:0
    },
    isFeatured: {
        type: Boolean,
        default:false
    },
    dateCreated: {
        type: Date,
        default:Date.now
    }
});
// creating virtual parameter
productSchema.virtual('id').get(function () {
    return this._id.toHexString();
});
// sending some value to frontend so enable virtuals
productSchema.set('toJSON', {
    virtuals: true,
});


// const Product=mongoose.model('Product',productSchema);
exports.Product=mongoose.model('Product',productSchema);