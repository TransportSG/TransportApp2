const Router = require('./Router');

class IndexRouter extends Router {

    static index(req, res) {
        res.render('');
    }

}

module.exports = IndexRouter;
