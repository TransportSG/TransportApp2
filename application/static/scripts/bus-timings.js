let bookmark = false;
let currentBusStop = location.pathname.split('/').slice(-1)[0];

window.addEventListener('load', () => {
    $('#bookmark-status').addEventListener('click', () => {
        bookmark = !bookmark;
        if (bookmark) $('#bookmark-status').src = '/static/images/bookmark-filled.svg';
        else $('#bookmark-status').src = '/static/images/bookmark-empty.svg';

        setBookmarked(bookmark);
    });

    idb.open('bookmarks', 1, db => {
        let store = db.createObjectStore('bus-stops', {
            keyPath: 'id'
        });
    });

    isBookmarked(bookmarked => {
        bookmark = bookmarked;

        if (bookmark) $('#bookmark-status').src = '/static/images/bookmark-filled.svg';
        else $('#bookmark-status').src = '/static/images/bookmark-empty.svg';
    });
});

function setBookmarked(state) {
    idb.open('bookmarks', 1).then(function(db) {
        var tx = db.transaction(['bus-stops'], 'readwrite');
        var store = tx.objectStore('bus-stops');
        store.put({id: currentBusStop, data: {bookmarked: state}});
        return tx.complete;
    });
}

function isBookmarked(cb) {
    idb.open('bookmarks', 1).then(function(db) {
        var tx = db.transaction(['bus-stops'], 'readonly');
        var store = tx.objectStore('bus-stops');

        store.get(currentBusStop).then(state => {
            if (state)
                cb(state.data.bookmarked);
            else
                cb(false);
        });
    });
}
//
// if (navigator.storage && navigator.storage.persist) {
//   navigator.storage.persist().then(function(persistent) {
//     if (persistent)
//       console.log("Storage will not be cleared except by explicit user action");
//     else
//       console.log("Storage may be cleared by the UA under storage pressure.");
//   });
// }
