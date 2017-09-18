var app = {
  user: '',
  server: 'http://127.0.0.1:3001/classes/messages',
  messages: [],
  rooms: {},
  localRooms: {},
  friends: {},
  refresh: 0,
};

// App initialization
app.init = function() {
  this.user = location.search.substring(location.search.search('username=') + 'username='.length);
  this.rooms['lobby'] = true; // initialize lobby as t chatroom
  this.updateRoomContainer();

  // attach submit handlers to main structural elements
  $('#send').on('submit', (e)=>this.handleSubmit(e));
  $('#new-room').on('submit', (e)=>this.handleRoomSubmit(e));
  $('#new-friend').on('submit', (e)=>this.handleNewFriendSubmit(e));
  $('#message').on('focusin', (e)=>this.handleMessageFocusIn(e));
  $('#message').on('focusout', (e)=>this.handleMessageFocusOut(e));
  // kickoff document with a fetch
  this.renderUsername();
  $(document).ready(()=>this._fetch());
  this.updateFriendsContainer();
  // this.refresh = setInterval(()=>this.fetch(), 8000);
};

//########## Server Interaction ##########//
// Methods for handling submission and fetching from server //
app.handleSubmit = function(event) {
  event.preventDefault();
  const roomIndex = $('#send-room-select').prop('selectedIndex');
  const roomname = $('#send-room-select').val();
  const message = $('#message').val();
  if ( message === '') {
    alert('Please type something before posting');
    return;
  }
  if ( roomIndex === 0) {
    alert('Please select a room before posting');
    return;
  }
  const newMsg = {
    username: this.user,
    roomname: roomname,
    text: message,
  };
  $('#message').val('');
  $('#send-room-select').prop('selectedIndex', 0);
  this.send(newMsg);
};

app.send = function(newMsg) {
  $.ajax({
    url: this.server,
    type: 'POST',
    data: JSON.stringify(newMsg),
    contentType: 'application/json',
    success: (data) => this.fetch(),
    error: (err) => console.log(err),
  });
};

app._fetch = function() {
  if (!_.isEmpty(this.rooms) && !_.some(this.rooms, v=>v)) {
    this.fetchSuccess({});
    $();
    return;
  }
  $.ajax({
    url: this.server + this.getFetchParams(),
    type: 'GET',
    success: (data) => this.fetchSuccess(data),
    error: (err) => console.log(err),
  });
};
// debounced version of fetch method above
app.fetch = _.debounce(function() { this._fetch(); }, 500);

app.fetchSuccess = function(data) {
  console.log(data);
  this.updateMessageContainer(data); // only redraw rooms if they changed
  if (this.updateRoomObject()) { this.updateRoomContainer(); }
};

app.getFetchParams = function() {
  const defaultParams = 'order=-createdAt';
  if (_.isEmpty(this.rooms) || _.every(this.rooms, v=>v)) { return '?' + defaultParams; }
  let roomParams = [];
  _.each(this.rooms, (v, room) => v ? roomParams.push({roomname: room}) : null);
  return encodeURI('?where={"$or":' + JSON.stringify(roomParams) + '}') + '&' + defaultParams;
};
//########## End Server Interaction ##########//

//########## Message Interface ##########//
app.handleMessageFocusIn = function(event) {
  $('#message').animate({height: '78px'}, 600);
};

app.handleMessageFocusOut = function(event) {
  if ($('#message').val() === '') {
    $('#message').animate({height: '38px'}, 600);
  }
};
//########## End Message Interface ##########//

//########## Message Log Display  ##########//
app.updateMessageContainer = function(rspData) {
  this.clearMessages();
  if (_.isEmpty(rspData)) { return; }
  _.each(rspData.results, (msgObj)=>{
    this.messages.push(msgObj);
    this.renderMessage(msgObj);
  });
};

app.renderMessage = function(msgObj) {
  $('#chats').append(this.makeMessageComponent(msgObj));
};

app.makeMessageComponent = function(msgObj) {
  let $messageComp = $(`<div class="ch-message card">
                          <div class="ch-message-header">
                            <div class="ch-message-user username"></div>
                            <div class="ch-message-roomname">
                              <i class="material-icons">weekend</i>
                              <span></span>
                            </div>
                          </div>
                          <div class="ch-message-content"></div>
                          <div class="ch-message-timestamp"></div>
                        </div>`);
  $messageComp.find('.username').text(msgObj.username);
  $messageComp.find('.username').on('click', (e)=>this.toggleFriend(e.target.textContent));
  $messageComp.find('.ch-message-roomname span').text(msgObj.roomname);
  $messageComp.find('.ch-message-timestamp').text($.timeago(msgObj.createdAt));
  $messageComp.find('.ch-message-content').text(msgObj.text);
  if (this.friends[msgObj.username]) { $messageComp.find('.ch-message-header').addClass('ch-message-user-friend'); }
  return $messageComp;
};

app.clearMessages = function() {
  $('#chats').html('');
  this.messages = [];
};
//########## End Message Log Display  ##########//

//########## Rooms Interface and State ##########//
app.handleRoomSubmit = function(event) {
  event.preventDefault();
  const roomname = $('#new-room-name').val();
  this.localRooms[roomname] = true;
  this.rooms[roomname] = true;
  $('#new-room-name').val('');
  this.updateRoomContainer();
};

app.toggleAllRooms = function() {
  const allChecked = _.every(this.rooms, v=>v);
  _.each(this.rooms, (v, room) => this.rooms[room] = !allChecked);
  this.updateRoomContainer();
  this.fetch();
};

app.handleRoomCheckboxChange = function(event, roomname) {
  this.rooms[roomname] = !this.rooms[roomname];
  this.updateRoomContainer();
  this.fetch();
};

// updates the state of the rooms
app.updateRoomObject = function() {
  let newRooms = {};
  let fetchedRooms = {};

  _.each(this.messages, (msgObj)=> {
    fetchedRooms[msgObj.roomname] = true;
  });
  _.each(this.rooms, (v, oldRoom) => {
    if (fetchedRooms[oldRoom] || !v) { newRooms[oldRoom] = v; }
  });
  _.each(this.localRooms, (v, localRoom) => {
    newRooms[localRoom] = this.rooms[localRoom];
  });
  _.each(fetchedRooms, (v, fetchedRoom) => {
    newRooms[fetchedRoom] = true;
  });
  const changed = !_.isEqual(this.rooms, newRooms);
  this.rooms = newRooms;
  return changed;
};
//########## End Rooms Interface and State ##########//

//########## Rooms Interface Display ##########//
app.updateRoomContainer = function() {
  $('.ch-room-list').html('');
  this.renderRoom('Select all', _.every(this.rooms, v=>v), true);
  _.each(this.rooms, (checked, roomname) => this.renderRoom(roomname, checked, false));
  this.updateRoomSelect();
};

app.renderRoom = function(roomname, checked, parent) {
  $('.ch-room-list').append(this.makeRoomComponent(roomname, checked, parent));
};

app.makeRoomComponent = function(roomname, checked, parent = false) {
  let $room = $('<li class="ch-room-list-item list-group-item"><span class="ch-room-list-label"></span><i class="material-icons ch-room-icon"></i></li>');
  if (parent) { $room.addClass('ch-room-list-all'); }
  $room.find('.ch-room-list-label').text(roomname);
  if (checked) {
    $room.addClass('ch-room-checked');
    $room.find('.ch-room-icon').text('check_box');
  } else {
    if (parent && _.some(this.rooms, v=>v)) {
      $room.find('.ch-room-icon').text('indeterminate_check_box');
    } else {
      $room.addClass('ch-room-unchecked');
      $room.find('.ch-room-icon').text('check_box_outline_blank');
    }
  }
  if (parent) {
    $room.on('click', ()=>this.toggleAllRooms());
  } else {
    $room.on('click', (e)=>this.handleRoomCheckboxChange(e, roomname));
  }
  return $room;
};
// handles the room selection feature of the new message interface
app.updateRoomSelect = function() {
  $('#send-room-select').html('');
  this.renderRoomSelect('Select room to post in.');
  _.each(this.rooms, (v, roomname)=>this.renderRoomSelect(roomname));
};

app.renderRoomSelect = function(roomname) {
  $('#send-room-select').append(this.makeRoomSelect(roomname));
};

app.makeRoomSelect = function(roomname) {
  let $roomSelectItem = $('<option></option>');
  $roomSelectItem.text(roomname);
  return $roomSelectItem;
};
//########## End Rooms Interface Display ##########//

//########## Friends Interface ##########//
app.toggleFriend = function(friend) {
  app.friends[friend] = app.friends[friend] ? false : true;
  const $messages = $('.ch-message-user').filter(function() {
    return $(this).text() === friend;
  });
  $messages.parent().toggleClass('ch-message-user-friend');
  this.updateFriendsContainer();
};

app.handleNewFriendSubmit = function(e) {
  e.preventDefault();
  const friendName = $('#new-friend-name').val();
  if ( friendName === '') {
    alert('Your friends must have names...');
    return;
  }
  if (this.friends[friendName]) {
    alert(`You're already following ${friendName}, click them in the friends list to unfollow if you wish.`);
    $('#new-friend-name').val('');
    return;
  }
  this.toggleFriend(friendName);
  $('#new-friend-name').val('');
};
//########## End Friends Interface ##########//

//########## Friends Display ##########//
app.updateFriendsContainer = function() {
  $('#ch-friends-list').html('');
  if (_.isEmpty(this.friends) || _.every(this.friends, (v)=>!v)) {
    $('#ch-friends-list').append('<li class="ch-no-friends list-group-item">You don\'t have any friends yet, try clicking a user or add one below!</li>');
    $('.ch-friends-caption').hide();
    return;
  }
  _.each(this.friends, (v, friend)=>{ v ? this.renderFriendListItem(friend) : null; });
  $('.ch-friends-caption').show();
};

app.renderFriendListItem = function(friend) {
  $('#ch-friends-list').append(this.makeFriendListItem(friend));
};

app.makeFriendListItem = function(friend) {
  let $friend = $('<li class="ch-friend-list-item list-group-item"></li>');
  $friend.text(friend);
  $friend.on('click', (e)=>this.toggleFriend(e.target.textContent));
  return $friend;
};
//########## End Friends Display ##########//

//########## Username Display ##########//
app.renderUsername = function() {
  let $user = $('<li class="ch-user-list-item list-group-item"><span class="ch-username-display"></span><i class="material-icons">mode_edit</i></li>');
  $user.find('.ch-username-display').text(this.user);
  $user.find('.material-icons').on('click', ()=>this.updateUsername());
  $('#username-mount').append($user);
};
//TODO: refactor this to using modals and some persistent data object instead of location.search and prompt
app.updateUsername = function() {
  newSearch = '?username=' + prompt('Enter your new username below:');
  window.location.search = newSearch;
  app.renderUsername();
};
//########## End Username Display ##########//

// kick things off
app.init();
