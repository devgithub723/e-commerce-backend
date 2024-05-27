const mongoose = require('mongoose')
const BrandSchema = new mongoose.Schema({
    label: {type: String, required: true, unique: true},
    value: {type: String, required: true, unique: true}, 
})
const virtual = BrandSchema.virtual('id')
virtual.get(function(){
  return this._id
})
BrandSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (responce, ret) {delete ret._id}
})
exports.Brand = mongoose.model('Brand', BrandSchema)