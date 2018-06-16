const Router = require('./Router');
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
const exec = require('child_process').exec;

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'images'));
  },
  filename: function (req, file, cb) {
      let name = crypto.randomBytes(12).toString('hex') + file.originalname;
      cb(null, name)
  }
});

function run_tf(file, cb) {
    exec('python3 addons/TensorFlow-py/scripts/label_image.py --image "' + file + '"', (err, stdout, stderr) => {
        cb(stdout);
    });
}

var upload = multer({storage: storage}).single('image');

class BusMatcherRouter extends Router {
    static index(req, res) {
    	res.render('bus-matcher/index.pug');
    }

    static upload(req, res) {
        run_tf(req.file.path, model => {
            res.end(model);
        });
    }
}

module.exports = BusMatcherRouter;
module.exports.uploader = upload;
