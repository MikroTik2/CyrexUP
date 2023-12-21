const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
let couponSchema = new mongoose.Schema({
     name: {
          type: String,
          required: true,
          unique: true,
     },

     amount: {
          type: Number,
          required: true,
     },

     activations: {
          type: Number,
          default: 0,
     },
});

//Export the model
module.exports = mongoose.model('Coupon', couponSchema);