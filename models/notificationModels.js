const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
let notificationSchema = new mongoose.Schema({
     title:{
          type:String,
          required:true,
     },
     description:{
          type:String,
          required:true,
     },
     userId:{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User', 
          required: true
     },
}, { timestamps: true });

//Export the model
module.exports = mongoose.model('Notification', notificationSchema);