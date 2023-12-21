const express = require("express");
const router = express.Router();
const { adminSupport, userSupport, getAllSupport, deleteSupport } = require("../controllers/supportCtrl.js");
const { authMiddleware } = require("../middleware/authMiddleware.js");

router.post("/user-chat", authMiddleware, userSupport);
router.post("/admin-chat/:supportId", authMiddleware, adminSupport);

router.get("/all", getAllSupport);

router.delete("/:id", deleteSupport);

module.exports = router;