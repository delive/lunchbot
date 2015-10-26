var mysql = require("mysql");
var config = require("../config.js");

function connectMysql() {
	var con = mysql.createConnection({
	  host: config.mysql.host,
	  user: config.mysql.user,
	  password: config.mysql.password,
	  database: config.mysql.database,
	  multipleStatements: true
});

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    return;
  }
  console.log('Mysql connection established');
});
return con;
}

function handleDisconnect(connection) {
  connection.on('error', function(err) {
    if (!err.fatal) {
      return;
    }

    if (err.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw err;
    }

    console.log('Re-connecting lost connection: ' + err.stack);

    connection = mysql.createConnection(connection.config);
    handleDisconnect(connection);
    connection.connect();
  });
}

function listPlaces(callback) {
		con.query('SELECT * FROM places',function(err,rows){
                  if(err) throw err;
                var list = '```';
                for (var i = 0; i < rows.length; i++) {
                        list += rows[i].name + '\n';
                }

                list += '```';

		callback(list);
                });
}

function addPlace(place, callback) {
	con.query('INSERT INTO places (name) VALUES (?)', place, function(err,res) {
  if(err) throw err;
	callback(res);
});
}

function send(channel, response) {
if (response != null && response != '') {
    channel.send(response);
}
}


var Slack, autoMark, autoReconnect, slack, token;

Slack = require('slack-client');

token = config.slack_token;

autoReconnect = true;

autoMark = true;

slack = new Slack(token, autoReconnect, autoMark);

con = connectMysql();

// node.js will hold a single connection to mysql. this will eventually timeout - just retry after
handleDisconnect(con);

slack.on('message', function(message) {

  var channel, channelError, channelName, errors, response, text, textError, ts, type, typeError, user, userName, split;
  channel = slack.getChannelGroupOrDMByID(message.channel);
  user = slack.getUserByID(message.user);
  response = '';
  type = message.type, ts = message.ts, text = message.text;
  channelName = (channel != null ? channel.is_channel : void 0) ? '#' : '';
  channelName = channelName + (channel ? channel.name : 'UNKNOWN_CHANNEL');

if (channelName != "what-is-lunch" && channelName != "#test-lunch-bot") {
	return;
}


  userName = (user != null ? user.name : void 0) != null ? "@" + user.name : "UNKNOWN_USER";
  
if (type === 'message' && (text != null) && (channel != null)) {

    split = text.split(' ');
var category = split[0];
var cmd = split[1];
var parm1 = split[2];

if (category == "?admin") {
	if (userName != "@john.wright") {
		send(channel, "you can't control me " + userName + "!");
		return;
	}
	if (cmd == "add") {
		var place = '';
		for (var i = 2; i < 10; i++) {
			if (split[i] != null && split[i] != '') {
				if (i > 2) {
					place += ' ';
				}
                        	place += split[i]
			}
                }
		addPlace(place, function(result) {
			send(channel, "Added: " + place);
		});
	}
} 
else if (category == "?lunch") {
	if (cmd == "list") {
		listPlaces(function(result) {
			send(channel, result);
		})
	}
}


  } else {
    typeError = type !== 'message' ? "unexpected type " + type + "." : null;
    textError = text == null ? 'text was undefined.' : null;
    channelError = channel == null ? 'channel was undefined.' : null;
    errors = [typeError, textError, channelError].filter(function(element) {
      return element !== null;
    }).join(' ');
    return console.log("@" + slack.self.name + " could not respond. " + errors);
  }

});

slack.on('error', function(error) {
  return console.error("Error: " + error);
});

slack.login();
