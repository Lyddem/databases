var {db, Users, Messages, Rooms} = require('../db/seqDb.js');

module.exports = {
  messages: {
    get: function (req, res) {
      Messages.sync()
        .then(() => Messages.findAll({
          attributes: ['id', 'text', 'createdAt', 'updatedAt'],
          include: [{model: Users, attributes: ['username']},
            {model: Rooms, attributes: ['roomname'],
              where: {$or: (req.query.where ? JSON.parse(req.query.where).$or : true)}}], //where: {roomname: 'lobby'}
          order: [['createdAt', 'DESC']],
        }))
        .then((messages) => {
          messages = messages.map(msg => {
            return {id: msg.id, text: msg.text, username: msg.User.dataValues.username,
              roomname: msg.Room.dataValues.roomname, createdAt: msg.createdAt, updatedAt: msg.updatedAt};
          });
          res.status(200).json({results: messages});
        });
    },

    post: function (msg, resp) {

    }
  },

  users: {
    // Ditto as above.
    get: function () {

    },
    post: function (body, resp) {

    }
  }
};
