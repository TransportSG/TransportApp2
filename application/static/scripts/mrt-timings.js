window.addEventListener('load', () => {
    $('#mrt-stations').on('change', () => {
        var currentStation = $(`#mrt-stations option:nth-child(${$('#mrt-stations').selectedIndex + 1})`).textContent;
        if (currentStation === 'Select a station') return;
        location = '/mrt/timings/' + currentStation;
    });
});
