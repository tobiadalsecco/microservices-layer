
var zmq = require('zmq');
 
function Sub(port){

  this.sock = zmq.socket('sub');
  this.sock.connect('tcp://127.0.0.1:' + port);

  this.subscriptions = {};

  var subs = this.subscriptions;

  this.sock.on('message', function(topic, message) {
    var _topic = topic.toString();

    if(subs[_topic]){
      subs[_topic]( JSON.parse(message.toString()) );
    }
  });
  
}

Sub.prototype.on = function(topic, callback){
  this.subscriptions[topic] = callback;
  this.sock.subscribe(topic);
}

module.exports = Sub;