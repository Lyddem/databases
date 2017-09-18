// this handles some scripts to update data on the server 

var hackerApp = {
  server: app.server,
  queryResults: {},
  msgFilter: function() { return true; }
};

hackerApp.geMessages = function() {
  const qurl = app.server + '?order=-createdAt';
  $.ajax({url: qurl, type: 'GET', success: (data)=>queryResults = data.results, error: (err)=>console.log(err)});
};

hackerApp.updateMsg = function(msgObj) {
  $.ajax({
    url: app.server + '/' + msgObj.objectId,
    type: 'PUT',
    data: JSON.stringify(msgObj),
    contentType: 'application/json',
    success: (data)=>console.log(data),
    error: (err)=>console.log(err)});
};

hackerApp.addNoteToAll = function(msgs, note) {
  _.each(msgs, (msg)=>{
    if (this.msgFilter(msg)) {
      msg.text = msg.text + note;
      this.updateMsg(msg);
    }
  });
};

hackerApp.setFilterFunc = function(cb) {
  this.msgFilter = cb;
};

// runs the provided function on provided messages and sends them to the server
hackerApp.updateAll = function(msgs, cb) {
  _.each(msgs, (msg)=>{
    if (this.msgFilter(msg)) {
      msg = cb(msg);
      this.updateMsg(msg);
    }
  });
};

// runs the provided function on one message and sends it to the server
hackerApp.update = function(msg, cb) {
  msg = cb(msg);
  this.updateMsg(msg);
};
