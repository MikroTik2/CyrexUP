const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");

// auth middleware for a user 
const authMiddleware = asyncHandler(async (req, res, next) => {
     let token;

     if (req?.headers?.authorization?.startsWith("Bearer")) {

          token = req.headers.authorization.split(" ")[1];

          try {

               if (token) {

                    const decoded = jwt.verify(token, process.env.SECRET);
                    const user = await User.findById(decoded?.id);

                    req.user = user;
                    next();
               };

          } catch (error) {
               throw new Error("Not authorized token expired, please login again");
          };

     } else {
          throw new Error("there is no token attached to header");
     }
})

// admin
const isAdmin = asyncHandler(async (req, res, next) => {
     const user = req.user;
     const adminUser = await User.findById(user.id);

     if (!["admin", "superadmin"].includes(adminUser.role)) {
          throw new Error("user is not an admin");
     } else {
          next();
     };
});

// streamer
const isSreamer = asyncHandler(async (req, res) => {
     const user = req.user;
     const adminUser = await User.findById(user.id);

     if (!["streamer"].includes(adminUser.role)) {
          throw new Error("user is not an streamer");
     } else {
          next();
     };
})

module.exports = { authMiddleware, isAdmin };