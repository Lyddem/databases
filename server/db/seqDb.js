var Sequelize = require('sequelize');

// Create a database connection and export it from this file.
// You will need to connect with the user "root", no password,
// and to the database "chat".
module.exports.db = db = new Sequelize('chat', 'root', '');

module.exports.Users = Users = db.define('Users', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
  username: {type: Sequelize.STRING, unique: 'username'},
  createdAt: {type: Sequelize.DATE, field: 'created_at'},
  updatedAt: {type: Sequelize.DATE, field: 'updated_at'}
});

module.exports.Rooms = Rooms = db.define('Rooms', {
  id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
  roomname: {type: Sequelize.STRING, unique: 'roomname'},
  createdAt: {type: Sequelize.DATE, field: 'created_at'},
  updatedAt: {type: Sequelize.DATE, field: 'updated_at'}
});

module.exports.Messages = Messages = db.define('Messages', {
  id: {type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
  userId: {type: Sequelize.INTEGER, field: 'user_id'}, // references: {model: Users, key: 'id'}},
  roomId: {type: Sequelize.INTEGER, field: 'room_id'}, // references: {model: Rooms, key: 'id'}},
  text: {type: Sequelize.STRING(500)},
  createdAt: {type: Sequelize.DATE, field: 'created_at'},
  updatedAt: {type: Sequelize.DATE, field: 'updated_at'}
});

Messages.belongsTo(Users, {foreignKey: 'user_id'});
Messages.belongsTo(Rooms, {foreignKey: 'room_id'});

Messages.sync();
Rooms.sync();
Users.sync();
