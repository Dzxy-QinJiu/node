const differentVersionService = require('../service/different-version-service');

exports.getAllVersions = function(req, res) {
    differentVersionService.getAllVersions(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};
exports.getVersionFunctionsById = function(req, res) {
    differentVersionService.getVersionFunctionsById(req, res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};