window.addEventListener('load', () => {

    if ('geolocation' in navigator) {
        let geo = navigator.geolocation;
        const watchID = geo.watchPosition(pos => {
            console.log(pos.coords);
            $.ajax({
                url: '/nearby/geo?lat=' + pos.coords.latitude + '&long=' + pos.coords.longitude
            }, data => {
                $('div.content').innerHTML = data;
            });
        }, err => {
            console.log('failed to get position');
        });
    } else {

    }

});
