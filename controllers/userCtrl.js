const User = require("../models/userModel.js");
const Notification = require("../models/notificationModels.js");
const validateMongoDbId = require("../utils/validateMongoDbId.js");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const ip = require('ip');
const { generateToken } = require("../config/jwtToken.js");
const { generateRefreshToken } = require("../config/refreshToken.js");
const { broadcastNotification } = require("../socket/socketHandler.js");

const BLACKLIST = [process.env.BLACKLIST];

// create notification real-time
const createNotification = asyncHandler(async (req, res) => {
     const id = req.user;
     const { title, description } = req.body;

     try {

          const notification = await Notification.create({
               title,
               description,
               userId: id,
          }); 

          const updateUser = await User.findByIdAndUpdate(id, {
               $push: { notifications: notification._id },
          }, { new: true });

          broadcastNotification(notification);

          res.json(notification);

     } catch (error) {
          throw new Error(error);
     };
});

// create a user with steam
const SignIn = asyncHandler(async (req, res) => {
     const steamUser = req.user;

     try {

          let user = await User.findOne({ _id: steamUser.id });

          if (!user) {
               user = await User.create({
                    _id: steamUser.id,
                    steamUsername:steamUser.displayName,
                    avatar: steamUser.photos[2].value,
                    token: generateToken(steamUser.id),
               });
          } else {

               const refreshToken = await generateRefreshToken(steamUser.id);
               const updateUser = await User.findByIdAndUpdate(steamUser.id, {
                    refreshToken: refreshToken,
               }, { new: true });

               res.cookie("refreshToken", refreshToken, {
                    httpOnly: true,
                    maxAge: 72 * 60 * 60 * 1000,
               })

               user.avatar = steamUser.photos[2].value;
               user.steamUsername = steamUser.displayName;

               user = await user.save();

          };

          res.redirect("/");

     } catch (error) {
          throw new Error(error);
     };
});

// user logout 
const logoutUser = asyncHandler(async (req, res) => {
     const cookie = req.cookies;
     if (!cookie) throw new Error("no refresh token in cookies");

     const refreshToken = cookie.refreshToken;
     const user = await User.findOne({ refreshToken });

     if (!user) {
          res.clearCookie("refreshToken", {
               httpOnly: true,
               secure: true,
          });

          return res.sendStatus(204);
     }

     await User.findOneAndUpdate({ refreshToken: refreshToken }, {
          refreshToken: "",
     });

     res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: true,
     });

     return res.sendStatus(204);
});

// refresh token a user
const refreshToken = asyncHandler(async (req, res) => {
     const cookie = req.cookies;
     if (!cookie) throw new Error("no refresh token in cookies");

     const refreshToken = cookie.refreshToken;
     const user = await User.findOne({ refreshToken });

     if (!user) throw new Error("no refresh token present in db or not matched");

     jwt.verify(refreshToken, process.env.SECRET, (err, decoded) => {
          if (err || user._id !== decoded.id) {
               throw new Error("there is something wrong with refresh token");
          };
     });

     const accessToken = generateRefreshToken(user?._id);
     res.json({ accessToken });
});

// get all a user
const getAllUser = asyncHandler(async (req, res) => {
     try {

          const queryObj = { ...req.query };
          const excludeFields = ["page", "sort", "limit", "fields"];

          excludeFields.forEach((el) => delete queryObj[el]);

          let queryStr = JSON.stringify(queryObj);
          queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

          let query = User.find(JSON.parse(queryStr));

          if (req.query.sort) {
               const sortBy = req.query.sort.split(",").join(" ");
               query = query.sort(sortBy);
          } else {
               query = query.sort("-createdAt");
          };

          if (req.query.fields) {
               const fields = req.query.fields.split(",").join(" ");
               query = query.select(fields);
          } else {
               query = query.select("-__v");
          };

          const page = req.query.page;
          const limit = req.query.limit;
          const skip = (page - 1) * limit;

          query = query.skip(skip).limit(limit);

          if (req.query.page) {
               const userCount = await User.countDocuments();
               if (skip >= userCount) throw new Error("this page does not exists");
          };

          const user = await query;
          res.json(user);

     } catch (error) {
          throw new Error(error);
     };
});

// get a user
const getUser = asyncHandler(async (req, res) => {
     const { id } = req.params;
     validateMongoDbId(id);

     try {

          const findUser = await User.findById(id);
          if (!findUser) throw new Error("User not found");

          res.json(findUser);

     } catch (error) {
          throw new Error(error);
     };
});

// get all a notification
const getAllNotification = asyncHandler(async (req, res) => {
     try {

          const queryObj = { ...req.query };
          const excludeFields = ["page", "sort", "limit", "fields"];

          excludeFields.forEach((el) => delete queryObj[el]);

          let queryStr = JSON.stringify(queryObj);
          queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

          let query = User.find(JSON.parse(queryStr));

          if (req.query.sort) {
               const sortBy = req.query.sort.split(",").join(" ");
               query = query.sort(sortBy);
          } else {
               query = query.sort("-createdAt");
          };

          if (req.query.fields) {
               const fields = req.query.fields.split(",").join(" ");
               query = query.select(fields);
          } else {
               query = query.select("-__v");
          };

          const page = req.query.page;
          const limit = req.query.limit;
          const skip = (page - 1) * limit;

          query = query.skip(skip).limit(limit);

          if (req.query.page) {
               const userCount = await User.countDocuments();
               if (skip >= userCount) throw new Error("this page does not exists");
          };

          const user = await query;
          res.json(user);

     } catch (error) {
          throw new Error(error);
     };
});

// get a notification
const getNotification = asyncHandler(async (req, res) => {
     const { id } = req.params;

     try {

          const findNotification = await Notification.findById(id).populate("userId");;
          if (!findNotification) throw new Error("Notification not found");

          res.json(findNotification);

     } catch (error) {
          throw new Error(error);
     };
});

// block a user
const blockUser = asyncHandler(async (req, res) => {
     const { id } = req.params;
     validateMongoDbId(id);

     try {

          const block = await User.findByIdAndUpdate(id, {
               isBlocked: true,
          }, { new: true });

          res.json(block);

     } catch (error) {
          throw new Error(error);
     };
});

const blockBlacklistedIP = asyncHandler(async (req, res, next) => {
     const userIP = req.ip || req.connection.remoteAddress;

     try {

          if (ip.isV4Format(userIP) || ip.isV6Format(userIP)) {
               if (BLACKLIST.indexOf(userIP) !== -1) {
                    throw new Error("IP is blacklisted");
               } else {
                    next()
               };
          } else {
               throw new Error("Invalid IP address format");
          };

     } catch (error) {
          throw new Error(error);
     }
})

// block a user IP address
const blockUserIP = asyncHandler(async (req, res) => {
     const { id } = req.params;
     const userIP = req.ip || req.connection.remoteAddress;

     try {

          if (ip.isV4Format(userIP) || ip.isV6Format(userIP)) {
               const user = await User.findByIdAndUpdate(id, {
                    ipAddress: userIP,
                    isBlocked: true,
               }, { new: true });
       
               res.json(user);
          } else {
               res.status(400).json({ error: "Invalid IP address format" });
          };

     } catch (error) {
          throw new Error(error);
     };
});

// unblock a user
const unBlockUser = asyncHandler(async (req, res) => {
     const { id } = req.params;
     validateMongoDbId(id);

     try {

          const block = await User.findByIdAndUpdate(id, {
               isBlocked: false,
          }, { new: true });

          res.json(block);

     } catch (error) {
          throw new Error(error);
     };
});

// role a user
const updateRoleUser = asyncHandler(async (req, res) => {
     const { id } = req.params;
     const { role } = req.body;

     try {

          const user = await User.findByIdAndUpdate(id, { role }, { new: true });
          if (!user) throw new Error("User not found");

          res.json(user);

     } catch (error) {
          throw new Error(error);
     };
});

// remove a role 
const removeRoleUser = asyncHandler(async (req, res) => {
     const { id } = req.params;

     try {

          const user = await User.findByIdAndUpdate(id, {
               role: "user"
          }, { new: true });

          if (!user) throw new Error("User not found");

          res.json(user);

     } catch (error) {
          throw new Error(error);
     };
});

// update a notification
const updateNotification = asyncHandler(async (req, res) => {
     const { id } = req.params;

     try {

          const updateNotification = await Notification.findByIdAndUpdate(id, {
               title: req?.body?.title,
               description: req?.body?.description,
          }, { new: true });

          broadcastNotification(updateNotification);

          res.json(updateNotification);

     } catch (error) {
          throw new Error(error);
     };
});

// delete a user
const deleteUser = asyncHandler(async (req, res) => {
     const { id } = req.params;
     validateMongoDbId(id);

     try {

          const deleteUser = await User.findByIdAndDelete(id);
          if (!deleteUser) throw new Error("User not found");

          res.json(deleteUser);

     } catch (error) {
          throw new Error(error);
     };
});

// delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
     const { id } = req.params;

     try {

          const deleteNotification = await Notification.findByIdAndDelete(id);
          if (!deleteNotification) throw new Error("Notification not found");

          res.json(deleteNotification);

     } catch (error) {
          throw new Error(error);
     };
});

module.exports = { 
     createNotification,
     SignIn, 
     getAllUser, 
     getUser, 
     getNotification,
     getAllNotification,
     logoutUser,
     refreshToken,
     updateNotification,
     updateRoleUser,
     removeRoleUser,
     blockUser, 
     blockUserIP,
     unBlockUser, 
     deleteUser,
     deleteNotification,
};