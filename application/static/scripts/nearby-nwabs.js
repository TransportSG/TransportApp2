let checkboxes = {};

window.addEventListener('load', () => {

    if ('geolocation' in navigator) {
        let geo = navigator.geolocation;
        const watchID = geo.watchPosition(pos => {
            console.log(pos.coords);
            $.ajax({
                url: '/nearby/nwabs/geo?lat=' + pos.coords.latitude + '&long=' + pos.coords.longitude
            }, data => {
                $('div.content').innerHTML = data;

                document.querySelectorAll('.busStopHideCheckbox').forEach(checkbox => {
                    if (checkboxes[checkbox.id]) {
                        checkbox.checked = checkboxes[checkbox.id];
                    }

                    checkbox.on('change', e => {
                        checkboxes[checkbox.id] = e.target.checked;
                    })
                });
            });
        }, err => {
            $('div.content').innerHTML = err.message;
            console.log('failed to get position');
        });
    }
});
