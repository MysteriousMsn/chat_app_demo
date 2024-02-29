const ChatMessage = require("../models/ChatMessages")

exports.createChatMessage = async (message, username, room)=>{
    try {
        const chatmessage = new ChatMessage({
            message,
            username,
            room
        })
        return await chatmessage.save();
    } catch (error) {
        console.log(error);
    }
}
exports.getChatMessage = async (room)=>{
    try {
        return await ChatMessage.find({room}).limit(100);
    } catch (error) {
        console.log(error);
    }
}