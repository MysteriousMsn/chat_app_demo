const mongoose = require('mongoose');

const mongoConnect = async ()=> {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/realtime_chat_app');
    console.log('MongoDb connected');
  } catch (error) {
    console.log(error);
  }

}
module.exports = mongoConnect;