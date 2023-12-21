const express = require("express");
const passport = require("passport");

const router = express.Router();
const { createCoupon, deleteCoupon, activationCoupon, getCoupon, getAllCoupon, createNotification, SignIn, getAllUser, unBlockUserIP, getUser, blockUserIP, getAllNotification, removeRoleUser, getNotification, refreshToken, logoutUser, updateNotification, updateRoleUser, updateUser, blockUser, unBlockUser, deleteNotification, deleteUser } = require("../controllers/userCtrl.js");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware.js");

// POST
router.post("/add/notification", authMiddleware, createNotification);
router.post("/add/coupon", createCoupon);
router.post("/active/coupon", authMiddleware, activationCoupon);

// GET
router.get("/auth/", passport.authenticate('steam', { session: false }));
router.get("/auth/return/", passport.authenticate('steam', { failureRedirect: '/error', session: false }), SignIn);
router.get("/all", getAllUser);
router.get("/detail", getUser);
router.get("/all/notifications", getAllNotification);
router.get("/refresh", refreshToken);
router.get("/logout", logoutUser);
router.get("/all/coupons", getAllCoupon);
router.get("/coupon", getCoupon);
router.get("/notification/:id", getNotification);

// PUT
router.put("/unblock-user/ip/:id", unBlockUserIP);
router.put("/block-user/ip/:id", blockUserIP);
router.put("/remove/role/:id", removeRoleUser);
router.put("/edit/role/:id", updateRoleUser);
router.put("/edit-notification/:id", updateNotification);
router.put("/block-user/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock-user/:id", authMiddleware, isAdmin, unBlockUser);

// DELETE
router.delete("/delete/coupon", deleteCoupon);
router.delete("/delete/notification/:id", deleteNotification);
router.delete("/delete/:id", deleteUser);

module.exports = router;