// var models = require('../models/dbModel.js');
var models = require('../models/seqModel.js');

module.exports = {
  messages: {
    get: function (req, res) {
      console.log('messages GET request received');
      models.messages.get(req, res);
    }, // a function which handles a get request for all messages
    post: function (req, res) { // a function which handles posting a message to the database
      console.log('messages post request received');
      models.messages.post(req.body, res);
    }
  },

  users: {
    // Ditto as above
    get: function (req, res) {
      console.log('users get request received');
      models.users.get(req, res);
    },
    post: function (req, res) {
      console.log('users post request received');
      models.users.post(req.body, res);
    }
  }
};
