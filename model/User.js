const mongoose = require('mongoose')
const { Schema } = require('mongoose')
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: Buffer, required: true },
  role: { type: String, required: true, default: 'user' },
  addresses: { type: [Schema.Types.Mixed] },
  name: { type: String },
  salt: Buffer,
  resetPasswordToken: { type: String, default: '' }
},
  { timestamps: true })
const virtual = userSchema.virtual('id')
virtual.get(function () {
  return this._id
})
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (responce, ret) { delete ret._id }
})
exports.User = mongoose.model('User', userSchema)