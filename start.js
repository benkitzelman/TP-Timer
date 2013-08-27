var service = process.env.SERVICE   || 'Air';
var path    = process.env.REQUEST   || './requestBody.xml'
var creds   = process.env.CRED_FILE || './creds/copy'
var auth    = require(creds)
var url     = process.env.URL || auth.baseUrl + service + 'Service';

var https   = require('https'),
    request = require('request'),
    fs      = require('fs'),
    Tracker = require('./tracker');

var tracker = new Tracker();

var getBody = function() {
  var body = fs.readFileSync(path, 'ascii');
  return body.replace(/(TargetBranch=")[^"]*(")/, "$1" + auth.branchCode + "$2");
};

var writeMessaging = function(reqParams, resp) {
  var dir = './messaging';

  if(!fs.existsSync(dir)) fs.mkdirSync(dir);

  fs.writeFileSync(dir + "/lastRequest.xml",  reqParams.body + "\n");
  fs.writeFileSync(dir + "/lastResponse.xml", resp.body + "\n");
  if(resp.statusCode != 200)
    fs.writeFileSync(dir + "/lastError.xml", resp.body + "\n");
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
  var params = requestParamsFor(url);

  tracker.start();
  request.post(params, function(err, resp) {
    tracker.stop(resp.statusCode == 200);
    tracker.report(path);
    writeMessaging(params, resp);
    postMessageTo(url);
  });
};


console.log('\n\nTP TIMER =============== \n\nSending ' + path + ' to ' + url + '\n\n');
postMessageTo(url);