function parseServiceData(document) {
    var serviceDataTable = document.getElementsByClassName('eguide-table')[0];

    var serviceInfo = serviceDataTable.querySelectorAll('table')[0];

    var serviceNumber = serviceInfo.querySelector('tr > td');
    var serviceType = 'TRUNK';

    if (serviceNumber.childNodes.length === 3) {
        serviceType = serviceNumber.childNodes[0].textContent;
    }

    var operator = serviceInfo.querySelector('td:nth-child(2)').textContent;

}

exports.parseDocument = (document) => {
    var serviceData = parseServiceData(document);
}
