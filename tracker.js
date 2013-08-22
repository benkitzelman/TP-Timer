module.exports = function() {
  this.requests  = [];

  this.start = function() {
    this.currentRequest = {
      sentAt: Date.now()
    };
  };

  this.stop = function(wasSuccessful) {
    this.currentRequest.finishedAt = Date.now();
    this.currentRequest.success    = wasSuccessful;
    this.requests.push(this.currentRequest);
    this.currentRequest = null;
  };

  this.errors = function() {
    var count = 0;
    this.requests.forEach(function(req) {
      if(!req.success) count++;
    });
    return count;
  };

  this.lastRequestTime = function() {
    var lastReq = this.requests[this.requests.length - 1];
    return (lastReq.finishedAt - lastReq.sentAt) / 1000;
  };

  this.totalTime = function () {
    var time = 0;
    this.requests.forEach(function(req){
      time += req.finishedAt - req.sentAt;
    });
    return time / 1000;
  };

  this.avgTime = function() {
    return this.totalTime() / this.requests.length;
  };

  this.report = function(additionalMessage) {
    var msg = additionalMessage || "";
    msg += " - " + this.errors() + " of " + this.requests.length + " have failed ";
    msg += " - Total time (s): " + this.totalTime();
    msg += " - Last Request (s): " + this.lastRequestTime();
    msg += " - Avg time (s): " + this.avgTime();

    console.log(msg);
  };
};