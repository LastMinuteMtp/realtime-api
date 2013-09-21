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

app.get('/realtime/:stop/:line?', function (req, resp) {
  soap.call(req.params.stop, function (json) {
    resp.json(json);
  }, req.params.line);
});

var port = process.env.PORT || 9000;
app.listen(port, function() {
  console.log("Listening on " + port);
});

/*
Réduire au prochain dans chaque sens
/:stop/:match
 */

var locations = [
  "AIGUELONGUE",
  "CELLENEUVE",
  "GARE SAINT-ROCH",
  "LES BOUISSES",
  // "PAUL FAJON", // <---- Unmatchable.
  "CATALPAS",
  "GARE SAINT-ROCH",
  // "AGROPOLIS", // <---- Unmatchable.
  "SAINT-ELOI",
  "UNIVERSITES",
  "LEON BLUM",
  // "POMPIGNANE - LACS", // <---- Unmatchable.
  // "GAROSUD", // <---- Unmatchable.
  "PLACE DE FRANCE",
  "SAINT-CLEOPHAS",
  "GARE SAINT-ROCH",
  "TOURNEZY",
  "COUBERTIN",
  "H. DEPARTEMENT",
  "EUROMEDECINE",
  "PAS DU LOUP",
  "GARE SAINT-ROCH",
  "H. DEPARTEMENT",
  "LA MARTELLE",
  "LES BOUISSES",
  "CITE DE L'ARME",
  "GARE SAINT-ROCH",
  "APOLLO",
  "GRAMMONT",
  "PLACE DE FRANCE",
  "MOSSON",
  "ODYSSEUM",
  "JACOU",
  "SABINES",
  "SABLASSOU",
  "ST-JEAN DE VEDAS",
  // "BOIRARGUES", // <---- Unmatchable.
  "JUVIGNAC",
  "LATTES CENTRE",
  "MOSSON",
  "PEROLS ETANGS",
  "ALBERT 1er",
  "SAINT-DENIS"
];

var strings = [
  "Mosson - Odysseum",
  "Aiguelongue - Celleneuve",
  "Les Bouisses - Gare Saint-Roch",
  "Catalpas - Gare Saint-Roch",
  "Navette Universités - Saint-Eloi",
  "Les Lacs - Léon Blum",
  "Place de France - Saint-Cléophas",
  "Tournezy - Gare Saint-Roch",
  "Navette Sabines - Fontcouverte",
  "Lattes - Maurin - Sabines", // <---- Hardcore.
  "Coubertin - Hôtel du Département",
  "St-Jean de Védas Centre - Jacou",
  "St Jean de védas (La Lauze - St Hubery)", // <---- Hardcore.
  "ND de Sablassou - Vendargues",
  "St Eloi - Clapiers - Jacou",
  "Occitanie - Montferrier - Prades", // <---- Hardcore.
  "La Valsière - Grabels",
  "Montpellier Mosson - Juvignac",
  "Parc Expo - Pérols",
  "ND de Sablassou - Baillargues - St Brès", // <---- Hardcore.
  "Pérols/Lattes - Juvignac", // <---- Hardcore.
  "ND de Sablassou - Le Crès", // <---- Hardcore.
  "ND de Sablassou - Castries - Beaulieu", // <---- Hardcore.
  "Garcia Lorca - Villeneuve les Maguelone",
  "St Jean Centre - Fabrègues/Saussan",
  "Montpellier Mosson - Cournonsec",
  "Castelnau-le-Lez (M. de Rochet - Aube Rouge/Aires)", // <---- Hardcore.
  "Montaud - Charles de Gaulle",
  "Sablassou - Place de l'Europe",
  "Cournonsec - Pignan - Lavérune - MTP", // <---- Hardcore.
  "Jacou",  // <---- Hardcore.
  "Place Albert 1er - Saint-Denis",
  "Clinique du Parc - Charles de Gaulle",
  "Euromédecine - Pas du Loup",
  "H.Département-Martelle/Bouisses", // <---- Hardcore.
  "Cité de l'Arme - Gare Saint-Roch",
  "Apollo - Grammont"
];

function findMatch(location, list) {
  var found = false;
  var i = 0;
  while (!found && i < list.length) {
    found = compareStops(location, list[i]);
    i++;
  }
  if (found) {
    console.log(location + ' matches ' + list[i - 1]);
  }
  else {
    console.log(location + '                 !!!!!');
  }
}

function compareStops(location, terminus) {
  terminus = filterChain(terminus);
  location = filterChain(location);
  //console.log(location + " | " + terminus);
  var termSplit = terminus.split('  ');
  var leftTerm = termSplit[0];
  var rightTerm = termSplit[termSplit.length - 1];
  //console.log(leftTerm + " | " + rightTerm);
  return leftTerm.indexOf(location) !== -1 || rightTerm.indexOf(location) !== -1;
}

for (var i = 0; i < locations.length; i++) {
  findMatch(locations[i], strings);
}

function filterChain(raw) {
  var filtered = raw.toLowerCase();
  filtered = filtered.replace(/[\.,\/#!$%\^&\*;:{}=\-_`'~()]/g, ' ');
  filtered = filtered.replace(/^(nd|1er|saint|st|h|l|au|aux|avec|ce|ces|dans|de|des|du|elle|en|et|eux|il|je|la|le|les|leur|lui|ma|mais|me|même|mes|moi|mon|ne|nos|notre|st) /gi, '');
  filtered = filtered.trim();
  filtered = filtered.replace(/^(nd|1er|saint|st|h|l|au|aux|avec|ce|ces|dans|de|des|du|elle|en|et|eux|il|je|la|le|les|leur|lui|ma|mais|me|même|mes|moi|mon|ne|nos|notre|st) /gi, '');
  filtered = filtered.trim();
  filtered = filtered.replace(/ (nd|1er|saint|st|h|l|au|aux|avec|ce|ces|dans|de|des|du|elle|en|et|eux|il|je|la|le|les|leur|lui|ma|mais|me|même|mes|moi|mon|ne|nos|notre|st) /gi, ' ');
  filtered = filtered.replace(new RegExp("[àáâãäå]", 'g'),"a");
  filtered = filtered.replace(new RegExp("æ", 'g'),"ae");
  filtered = filtered.replace(new RegExp("ç", 'g'),"c");
  filtered = filtered.replace(new RegExp("[èéêë]", 'g'),"e");
  filtered = filtered.replace(new RegExp("[ìíîï]", 'g'),"i");
  filtered = filtered.replace(new RegExp("ñ", 'g'),"n");
  filtered = filtered.replace(new RegExp("[òóôõö]", 'g'),"o");
  filtered = filtered.replace(new RegExp("œ", 'g'),"oe");
  filtered = filtered.replace(new RegExp("[ùúûü]", 'g'),"u");
  filtered = filtered.replace(new RegExp("[ýÿ]", 'g'),"y");
  filtered = filtered.replace(/(place|centre|1er|etangs)/, '');
  filtered = filtered.trim();
  return filtered;
}
