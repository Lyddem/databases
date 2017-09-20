var mongoClient = require('mongodb').MongoClient;
var mongoose = require('mongoose');

var url = 'mongodb://localhost:27017/chat';

mongoose.connect(url);

var db = mongoose.connection;


var messagesSchema = new mongoose.Schema({
  text: String,
  roomId: mongoose.Schema.Types.ObjectId,
  userId: mongoose.Schema.Types.ObjectId,
  createdAt: {type: Date, default: Date.now},
  updatedAt: {type: Date, default: Date.now}
});

var usersSchema = new mongoose.Schema({
  username: {type: String, unique: true }
});

var roomsSchema = new mongoose.Schema({
  roomname: {type: String, unique: true }
});

exports.Messages = Messages = mongoose.model('Messages', messagesSchema);
exports.Users = Users = mongoose.model('Users', usersSchema);
exports.Rooms = Rooms = mongoose.model('Rooms', roomsSchema);
