var {Users, Messages, Rooms} = require('../db/mongoDb.js');

module.exports = {
  messages: {
    get: function (req, res) {
      Messages.find().populate('roomId')
        .populate('userId', 'username', 'Users')
        .exec((err, docs) => {
          if (err) { console.log(err); }
          res.status(200).json({results: docs});
        });
    },

    // Messages.sync()
    //   .then(() => Messages.findAll({
    //     attributes: ['id', 'text', 'createdAt', 'updatedAt'],
    //     include: [{model: Users, attributes: ['username']},
    //       {model: Rooms, attributes: ['roomname'],
    //         where: {$or: (req.query.where ? JSON.parse(req.query.where).$or : true)}}], //where: {roomname: 'lobby'}
    //     order: [['createdAt', 'DESC']],
    //   }))
    //   .then((messages) => {
    //     messages = messages.map(msg => {
    //       return {id: msg.id, text: msg.text, username: msg.User.dataValues.username,
    //         roomname: msg.Room.dataValues.roomname, createdAt: msg.createdAt, updatedAt: msg.updatedAt};
    //     });
    //     res.status(200).json({results: messages});
    //   });

    post: function (msg, resp) {
      // var userId;
      // var roomId;
      // Users.sync()
      //   .then(() => Users.findOrCreate({where: {username: msg.username}}))
      //   .then((user) => {
      //     userId = user[0].id;
      //     return Rooms.findOrCreate({where: {roomname: msg.roomname}});
      //   })
      //   .then((room) => {
      //     roomId = room[0].id;
      //     return Messages.create(
      //       {
      //         text: msg.text,
      //         'user_id': userId,
      //         'room_id': roomId,
      //       });
      //   })
      //   .then(() => {
      //     resp.status(201).send('Message created');
      //   }).catch((err) => resp.status(500).send('Error: ' + err));
    }
  },

  users: {
    get: function (req, res) {
      // Users.sync()
      //   .then(() => Users.findAll())
      //   .then((rows) => resp.status(200).json(rows))
      //   .catch(err => resp.status(500).send('Error: ' + err));
    },
    post: function (body, resp) {
      // Users.sync()
      //   .then(() => Users.findOrCreate({where: {username: req.body.username}}))
      //   .then(() => resp.status(201).send('User created'))
      //   .catch(err => resp.status(500).send('Error: ' + err));
    }
  }
};
