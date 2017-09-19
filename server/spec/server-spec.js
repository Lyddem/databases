/* You'll need to have MySQL running and your Node server running
 * for these tests to pass. */

var mysql = require('mysql');
var request = require('request'); // You might need to npm install the request module!
var expect = require('chai').expect;

describe('Persistent Node Chat Server', function() {
  var dbConnection;

  beforeEach(function(done) {
    dbConnection = mysql.createConnection({
      user: 'root',
      password: '',
      database: 'chat'
    });
    dbConnection.connect();

    /* Empty the db table before each test so that multiple tests
     * (or repeated runs of the tests) won't screw each other up: */
    dbConnection.query('truncate ' + 'Messages', done);
  });

  afterEach(function() {
    dbConnection.end();
  });

  it('Should insert posted messages to the DB', function(done) {
    // Post the user to the chat server.
    request({
      method: 'POST',
      uri: 'http://127.0.0.1:3000/classes/users',
      json: { username: 'Valjean' }
    }, function () {
      // Post a message to the node chat server:
      request({
        method: 'POST',
        uri: 'http://127.0.0.1:3000/classes/messages',
        json: {
          username: 'Valjean',
          text: 'In mercy\'s name, three days is all I need.',
          roomname: 'Hello'
        }
      }, function () {
        // Now if we look in the database, we should find the
        // posted message there.

        // TODO: You might have to change this test to get all the data from
        // your message table, since this is schema-dependent.
        var queryString = 'SELECT * FROM Messages';
        var queryArgs = [];

        dbConnection.query(queryString, queryArgs, function(err, results) {
          // Should have one result:
          expect(results.length).to.equal(1);

          // TODO: If you don't have a column named text, change this test.
          expect(results[0].text).to.equal('In mercy\'s name, three days is all I need.');

          done();
        });
      });
    });
  });

  it('Should output all messages from the DB', function(done) {
    // Let's insert a message into the db
    var queryString = 'SELECT * FROM Messages';
    var queryArgs = [];
    request({
      method: 'POST', uri: 'http://127.0.0.1:3000/classes/messages',
      json: { username: 'Javert', text: 'Men like you can never change!', roomname: 'Hello'}}, () => {
      dbConnection.query(queryString, queryArgs, function(err) {
        if (err) { throw err; }
        // Now query the Node chat server and see if it returns
        // the message we just inserted:
        request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
          var messageLog = JSON.parse(body).results;
          expect(messageLog[0].text).to.equal('Men like you can never change!');
          expect(messageLog[0].roomname).to.equal('Hello');
          done();
        });
      });
    });
  });

  it('Should return messages in -createdAt order', function(done) {
    // Let's insert a message into the db
    var queryString = 'SELECT * FROM Messages';
    var queryArgs = [];
    request({
      method: 'POST', uri: 'http://127.0.0.1:3000/classes/messages',
      json: { username: 'Javert', text: 'Men like you can never change!', roomname: 'Hello'}}, () => {
      setTimeout(() => {
        request({
          method: 'POST', uri: 'http://127.0.0.1:3000/classes/messages',
          json: { username: 'Valjean', text: 'Wait! look behind you!', roomname: 'Hello'}}, () => {
          request('http://127.0.0.1:3000/classes/messages', function(error, response, body) {
            var messageLog = JSON.parse(body).results;
            expect(Date.parse(messageLog[0].createdAt)).to.be.above(Date.parse(messageLog[1].createdAt));
            done();
          });
        });
      }, 1000);
    });
  });

  it('Should support room filters', function(done) {
    // Let's insert a message into the db
    var queryString = 'SELECT * FROM Messages';
    var queryArgs = [];
    request({
      method: 'POST', uri: 'http://127.0.0.1:3000/classes/messages',
      json: { username: 'Javert', text: 'Men like you can never change!', roomname: 'lobby'}}, () => {
      setTimeout(() => {
        request({
          method: 'POST', uri: 'http://127.0.0.1:3000/classes/messages',
          json: { username: 'Valjean', text: 'Wait! look behind you!', roomname: 'france'}}, () => {
          request('http://127.0.0.1:3000/classes/messages?where=%7B%22$or%22:%5B%7B%22roomname%22:%22lobby%22%7D%5D%7D&order=-createdAt',
            function(error, response, body) {
              var messageLog = JSON.parse(body).results;
              expect(messageLog.length).to.equal(1);
              expect(messageLog[0].roomname).to.equal('lobby');
              done();
            });
        });
      }, 1000);
    });
  });
});
