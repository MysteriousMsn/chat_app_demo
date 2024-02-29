const mongoose = require('mongoose');

const ChatMessagesSchema = new mongoose.Schema({
  message: String,
  username: String,
  room: String,
  __createdtime__: { type : Date, default: Date.now },
  });

const ChatMessage = mongoose.model('ChatMessage', ChatMessagesSchema);
module.exports = ChatMessage;