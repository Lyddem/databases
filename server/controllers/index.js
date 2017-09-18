var models = require('../models');
var db = require('../db');

module.exports = {
  messages: {
    get: function (req, res) {
      models.messages.get(req, res);
    }, // a function which handles a get request for all messages
    post: function (req, res) { // a function which handles posting a message to the database
      console.log('post request received');
      models.messages.post(req.body, res);
    }
  },

  users: {
    // Ditto as above
    get: function (req, res) {
      models.users.get(req, res);
    },
    post: function (req, res) {
      models.messages.post(req.body, res);
    }
  }
};
