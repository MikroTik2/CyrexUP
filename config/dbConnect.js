const mongoose = require("mongoose");

const dbConnect = () => {
     try {

          const conn = mongoose.connect(process.env.MONGO_URL);
          console.log("==> DataBase successfully connect.");
          
     } catch (error) {
          console.log("==> DataBase error connect.");
     };
};

module.exports = dbConnect;