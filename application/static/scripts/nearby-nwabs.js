window.addEventListener('load', () => {

    if ('geolocation' in navigator) {
        let geo = navigator.geolocation;
        const watchID = geo.watchPosition(pos => {
            console.log(pos.coords);
            $.ajax({
                url: '/nearby/nwabs/geo?lat=' + pos.coords.latitude + '&long=' + pos.coords.longitude
            }, data => {
                $('div.content').innerHTML = data;
            });
        }, err => {
            $('div.content').innerHTML = err.message;
            console.log('failed to get position');
        });
    } else {

    }

});
