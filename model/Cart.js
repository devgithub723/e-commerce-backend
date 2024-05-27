const mongoose = require('mongoose')
const {Schema} = require("mongoose")
const cartSchema = new mongoose.Schema({
    quantity: {type: Number,required: true},
    product: {type: Schema.Types.ObjectId, ref:"Product",  required: true},   //type: Schema.Types.ObjectId, ref:"Product",   this allow us to store the refrence of product just link foreign key
    user: {type: Schema.Types.ObjectId, ref:"User",  required: true},
    sizes: {type: Schema.Types.Mixed},
    colors: {type: Schema.Types.Mixed},
})
const virtual = cartSchema.virtual('id')
virtual.get(function(){
  return this._id
})
cartSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (responce, ret) {delete ret._id}
})
exports.Cart = mongoose.model('Cart', cartSchema)