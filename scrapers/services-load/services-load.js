const DatabaseConnectionManager = require('../../database/DatabaseConnectionManager');
const request = require('request');
const JSDOM = require('jsdom').JSDOM;

const parser = require('./parser');

DatabaseConnectionManager.init();

var rootURL = 'https://www.transitlink.com.sg/eservice/eguide/service_idx.php';
var queryURL = 'https://www.transitlink.com.sg/eservice/eguide/service_route.php?service=';

request.get(rootURL, (err, resp, body) => {
    var dom = new JSDOM(body);
    var document = dom.window.document;

    var serviceSelectors = Array.from(document.getElementsByTagName('select'));
    serviceSelectors = serviceSelectors.map(option => {
        var children = Array.from(option.children).slice(1);
        return children.map(e => e.textContent);
    }).reduce((a, b) => a.concat(b), []);

    console.log(serviceSelectors);
    serviceSelectors.forEach(service => doQueryForService(service));
});

function doQueryForService(service) {
    request.get(queryURL + service, (err, resp, body) => {
        var dom = new JSDOM(body);
        var document = dom.window.document;

        var parsed = parser.parseDocument(document);
    });
}
