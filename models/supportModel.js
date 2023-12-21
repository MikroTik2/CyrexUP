const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
let supportSchema = new mongoose.Schema({

     status: {
          type: String,
          enum: ['open', 'closed', 'pending'],
          default: 'open',
     },

     responsesUser: [{
          userId: {
               type: String,
               ref: "User",
          },

          message: String,

          timestamp: {
               type: Date,
               default: Date.now(),
          },
     }],

     responsesAdmin: [{

          adminId: {
               type: String,
               ref: "User",
          },

          message: String,

          timestamp: {
               type: Date,
               default: Date.now(),
          },
     }],
});

//Export the model
module.exports = mongoose.model('Support', supportSchema);