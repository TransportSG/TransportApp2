const fs = require('fs');

let date = process.argv[2];

function pad0(t) {
  return [0, 0].concat([...t.toString()]).slice(-2).join('');
}

fs.readFile(__dirname + '/123-' + date + '.txt', (err, data) => {
  if (err) throw err;
  data = data.toString();

  let times = data.split('\n');
  times.filter(Boolean).filter((e, i, a) => {
    return a.indexOf(e) === i;
  }).forEach(time => {
    time = new Date(time);
    console.log(pad0(time.getUTCHours() + 8) + ':' +  pad0(time.getUTCMinutes()));
  });
});
