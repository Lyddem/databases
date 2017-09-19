var db = require('../db/db.js');

var getFilter = function(query) {
  let resQuery = '';
  if (query.where ) {
    const filters = JSON.parse(query.where).$or.map(con => `(${Object.keys(con)[0]} = '${con[Object.keys(con)[0]]}')`);
    resQuery += 'WHERE ' + filters.join(' OR ');
  }
  resQuery += ' ORDER BY createdAt DESC';
  return resQuery;
};

module.exports = {
  messages: {
    get: function (req, res) {
      let queryArgs = [];
      let max = Math.floor(req.query.maxResults);
      let limit = (!isNaN(max) && max < 200) ? max : 100;
      queryArgs.push(limit);
      let filter = getFilter(req.query);

      db.query(`SELECT m.text, u.username as username, r.roomname as roomname, m.created_at as createdAt, m.updated_at as updatedAt
                FROM Messages m
                INNER JOIN Users u on m.user_id = u.id
                INNER JOIN Rooms r on m.room_id = r.id
                ${filter} LIMIT ?`, queryArgs, (err, rows) => {
        if (err) {
          console.log(err);
        } else {
          res.status(200).json({results: rows});
        }
      });
    },

    post: function (msg, resp) {
      try {
        db.query('INSERT IGNORE INTO Users(username) VALUES(?)', [msg.username], (err, res) => {
          if (err) {
            throw err;
          } else {
            db.query('INSERT IGNORE INTO Rooms(roomname) VALUES(?)', [msg.roomname], (err, res) => {
              if (err) {
                throw err;
              } else {
                db.query(`INSERT INTO Messages(text, user_id, room_id) VALUES(?, (SELECT id FROM Users WHERE username = ?),
                (SELECT id FROM Rooms WHERE roomname = ?))`, [msg.text, msg.username, msg.roomname], (err, res) => {
                    if (err) {
                      throw err;
                    } else {
                      resp.status(201).send('message created');
                    }
                  });
              }
            });
          }
        });
      } catch (e) {
        resp.status(500).send('Server error!');
        console.log(e);
      }
    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    get: function () {
      db.query('select * from users', (err, rows) => {
        if (err) {
          console.log(err);
        } else {
          res.status(200).json(rows);
        }
      });
    },
    post: function (body, resp) {
      try {
        db.query('INSERT IGNORE INTO Users(username) VALUES(?)', [body.username], (err, res) => {
          if (err) {
            throw err;
          } else {
            resp.status(201).send('user created');
          }
        });
      } catch (e) {
        resp.status(500).send('Server error');
        console.log(err);
      }
    }
  }
};
