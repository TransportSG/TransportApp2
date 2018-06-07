window.addEventListener('load', () => {
    idb.open('bookmarks', 1, db => {
        let store = db.createObjectStore('bus-stops', {
            keyPath: 'id'
        });
    });

    getAllBookmarks(bookmarks => {
        $.ajax({
            url: '/render-bookmarks?bus-stops=' + bookmarks.toString()
        }, data => {
            $('div#content').innerHTML = data;
        });
    });
});

function getAllBookmarks(cb) {
    idb.open('bookmarks', 1).then(db => {
        var tx = db.transaction(['bus-stops'], 'readonly');
        var store = tx.objectStore('bus-stops');
        store.getAll().then(busStops => {
            cb(busStops.filter(busStop => {
                return busStop.data.bookmarked;
            }).map(busStop => busStop.id));
        });
    });
}
