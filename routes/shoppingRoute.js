var nconf = require('nconf');

exports.need = function (req, res) {
    res.render('shopping', { page:'shopping', user: req.user });
};

exports.add = function (req, res) {
    res.render('shoppingAdd', { page:'shopping', user: req.user });
};
