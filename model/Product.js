const mongoose = require('mongoose')
const {Schema} = require("mongoose")
const productSchema = new mongoose.Schema({
    title: {type: String, required: true, unique: true},
    description: {type: String, required: true}, 
    price: {type: Number, required: true, min: [1, "wrong minimum price"], max: [10000, "wrong maximum price"]},
    discountPercentage: {type: Number, required: true, min: [1, "wrong minimum discount percentage"], max: [99, "wrong maximum discount percentage"]},
    rating: {type: Number, required: true, min: [0, "wrong minimum rating"], max: [5, "wrong maximum rating"], default: 0},
    stock: {type: Number, required: true, min: [0, "wrong minimum stcok"], default: 0},
    brand: {type: String, required: true},
    category: {type: String, required: true},
    thumbnail: {type: String, required: true},
    images: {type: [String], required: true},
    colors: {type: [Schema.Types.Mixed]},
    sizes: {type: [Schema.Types.Mixed]},
    highlights: {type: [String]},
    discountPrice: { type: Number},
    deleted: {type: Boolean, default: false},

})
const virtualId = productSchema.virtual('id')
virtualId.get(function(){
  return this._id
})

// const virtualDiscountPrice = productSchema.virtual('discountPrice')
// virtualDiscountPrice.get(function(){
//   return Math.round(this.price*(1-this.discountPercentage/100))
// })

productSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (responce, ret) {delete ret._id}
})
exports.Product = mongoose.model('Product', productSchema)