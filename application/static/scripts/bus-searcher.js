let checkboxes = {};

function loadBuses() {
    if (!$('#input').value.trim()) return;

    $.ajax({
        url: '/adv-bus-search-kittyclub-r0gue',
        method: 'POST',
        data: {
            query: $('#input').value
        }
    }, response => {
        if (response.error) {
            response = '';
        }
        $('#results').innerHTML = response;

        document.querySelectorAll('.busStopHideCheckbox').forEach(checkbox => {
            if (checkboxes[checkbox.id]) {
                checkbox.checked = checkboxes[checkbox.id];
            }

            checkbox.on('change', e => {
                checkboxes[checkbox.id] = e.target.checked;
            })
        });
    });
}

function load() {
    var timer = 0;

    $('#input').on('input', () => {
           clearTimeout(timer);
           timer = setTimeout(loadBuses, 750);
       });

    setInterval(loadBuses, 5000);
}

var t = setInterval(() => {
    if ('$' in window) {
        clearInterval(t);
        load();
    }
});
