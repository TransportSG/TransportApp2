if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/serviceworker.js', {
        scope: '/'
    });
}

function p(t) {
    return [0, 0].concat([...t.toString()]).slice(-2).join('');
}

function formatCurTime() {
    let d = new Date();
    let a = [], b = [];
    let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    a.push(p(d.getUTCHours() + 8));
    a.push(p(d.getUTCMinutes()));
    a.push(p(d.getSeconds()));

    b.push(d.getDate());
    b.push(d.getMonth());
    b.push(d.getUTCFullYear());

    return `${days[d.getDay()]}, ${b.join('/')}, ${a.join(':')}`;
}

window.addEventListener('load', () => {
    $('#time').textContent = formatCurTime();
    setInterval(() => {
        $('#time').textContent = formatCurTime();
    }, 1000);
})
