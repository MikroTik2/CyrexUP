const Support = require("../models/supportModel.js");
const asyncHandler = require("express-async-handler");
const { broadcastSupportUpdate, broadcastChatMessage } = require("../socket/socketHandler.js");

const userSupport = asyncHandler(async (req, res) => {
     const id = req.user;
     
     try {

          const existingSupportTicket = await Support.findOne({ 'responsesUser.userId': id });

          if (existingSupportTicket) {
               existingSupportTicket.responsesUser.push({
                    userId: id,
                    message: req?.body?.message,
               });

               const updatedSupportTicket = await existingSupportTicket.save();

               res.json(updatedSupportTicket);
          } else {

               const supportTicket = await Support.create({
                    responsesUser: [{
                         userId: id,
                         message: req?.body?.message,
                    }],
               });

               res.json(supportTicket);
          };

     } catch (error) {
          throw new Error(error);
     };
});

const adminSupport = asyncHandler(async (req, res) => {
     const id = req.user;
     const { supportId } = req.params;

     try {

          const existingSupportTicket = await Support.findById(supportId);

          if (existingSupportTicket) {
               existingSupportTicket.responsesAdmin.push({
                    adminId: id,
                    message: req?.body?.message,
               });
      
               const updatedSupportTicket = await existingSupportTicket.save();

               res.json(updatedSupportTicket);
          };

     } catch (error) {
          throw new Error(error);
     };
});

const getAllSupport = asyncHandler(async (req, res) => {
     try {

          const fas = await Support.find().populate("userId");
          res.json(fas);

     } catch (error) {
          throw new Error(error);
     };
});

const deleteSupport = asyncHandler(async (req, res) => {
     try {

          const deleteS = await Support.findByIdAndDelete(id);
          res.json(deleteS);

     } catch (error) {
          throw new Error(error);
     };
});

module.exports = { userSupport, adminSupport, getAllSupport, deleteSupport };