var express = require('express');
var rest = require('restler');
var parser = require('xml2json');

var app = express();

var soap = {
  url : 'http://193.239.192.237:8040/services/getDeparturesRealTime',

  xml : function (stopId, lineId) {
    lineId = (typeof lineId !== 'undefined') ? '<LineId>' + lineId + '</LineId>LineId>' : '';
    return '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ser="http://www.talend.org/service/"><soapenv:Header/><soapenv:Body><ser:getDeparturesRealTimeRequest><Key>kGjGDgCWCUijXyExmQVvQ</Key><API>1</API><StopID>' + stopId + '</StopID>' + lineId + '</ser:getDeparturesRealTimeRequest></soapenv:Body></soapenv:Envelope>';
  },

  unwrap : function (xml) {
    return JSON.parse(parser.toJson(xml))["soap:Envelope"]["soap:Body"]["tns:getDeparturesResponse"]["Departure"]
  }
};

soap.call = function (stopId, callback, lineId) {
  rest.post(soap.url, {data: soap.xml(stopId, lineId)}).on('complete', function (raw) {
    callback(soap.unwrap(raw));
  });
};

soap.filter =

app.get('/realtime/:stop/:line?', function (req, resp) {
  soap.call(req.params.stop, function (json) {
    resp.json(json);
  }, req.params.line);
});

var port = process.env.PORT || 9000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

