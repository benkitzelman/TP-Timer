var service = process.env.SERVICE || 'Air';
var path    = process.env.REQUEST || './requestBody.xml'

var url = 'https://apac.copy-webservices.travelport.com/B2BGateway/connect/uAPI/' + service + 'Service';

var https = require('https'),
    request = require('request'),
    fs = require('fs'),
    Tracker = require('./tracker');

var auth = {
  uUser: 'Universal API/uAPI9149006438-eb985bc2',
  uPass: 'wJ%6{d3A9?'
};

var tracker = new Tracker();

var getBody = function() {
  return fs.readFileSync(path, 'ascii');
};

var writeResponse = function(resp) {
  fs.writeFileSync("./lastResponse.xml", resp.body + "\n");
  if(resp.statusCode != 200)
    fs.writeFileSync("./lastError.xml", resp.body + "\n");
};

var requestParamsFor = function(url) {
  return {
    uri:  url,
    body: getBody() + '\n',
    headers: {
      'Content-Type': 'application/soap+xml;charset=UTF-8',
      SOAPAction: '""',
      Authorization: 'Basic ' + new Buffer(auth.uUser + ':' + auth.uPass).toString('base64'),
    },
    agent: new https.Agent({secureProtocol: 'SSLv3_method'}),
    strictSSL: true
  };
};

var postMessageTo = function(url) {
  tracker.start();
  request.post(requestParamsFor(url), function(err, resp) {
    tracker.stop(resp.statusCode == 200);
    tracker.report();
    writeResponse(resp);
    postMessageTo(url);
  });
};


console.log('\n\nTP TIMER =============== \n\nSending ' + path + ' to ' + url + '\n\n');
postMessageTo(url);