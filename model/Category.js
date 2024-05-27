const mongoose = require('mongoose')
const CategorySchema = new mongoose.Schema({
    label: {type: String, required: true, unique: true},
    value: {type: String, required: true}, 
})
const virtual = CategorySchema.virtual('id')
virtual.get(function(){
  return this._id
})
CategorySchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (responce, ret) {delete ret._id}
})
exports.Category = mongoose.model('Category', CategorySchema)