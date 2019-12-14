const differentVersionService = require('../service/different-version-service');

exports.getAllVersions = function(res, req) {
    differentVersionService.getAllVersions(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};