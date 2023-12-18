const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
let userSchema = new mongoose.Schema({
     _id: {
          type: String,
          required: true,
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
     isBlockedIPs: {
          type: [String],
          default: [],
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

     notifications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Notification' }],
     sessions: [{ start: Date, end: Date }],

     token: String,
     refreshToken: String,
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('User', userSchema);