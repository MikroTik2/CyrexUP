const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
let userSchema = new mongoose.Schema({
     _id: {
          type: String,
          required: true,
     },
     parent_id: {
          type: String,
     },
     steamUsername:{
          type: String,
          required: true,   
     },
     balance:{
          type: Number,
          required: true,
          default: 0
     },
     isBlocked:{
          type:Boolean,
          default: false,
     },
     isBlockedIP: {
          type: String,
     },
     role: {
          type:String,
          enum: ["user", "moderator", "streamer", "youtuber", "admin", "superadmin",],
          default: "user",
     },
     avatar: {
          type: String,
          required: true
     },
     activatedCoupons: {
          type: [String],
          default: [],
     },

     room: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Room',
     },

     notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
     tradeURL: { type: String },

     token: String,
     refreshToken: String,
     
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('User', userSchema);