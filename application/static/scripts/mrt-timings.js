window.addEventListener('load', () => {
    $('#mrt-stations').on('change', () => {
        var currentStation = $(`#mrt-stations option:nth-child(${$('#mrt-stations').selectedIndex + 1})`).textContent;
        location = '/mrt/timings/' + currentStation;
    });
});
