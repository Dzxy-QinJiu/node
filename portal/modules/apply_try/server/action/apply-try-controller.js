const applyTryControllerService = require('../service/apply-try-service');

exports.postApplyTry = function(req, res) {
    applyTryControllerService.postApplyTry(req,res)
        .on('success', function(data) {
            res.status(200).json(data);
        }).on('error', function(err) {
            res.status(500).json(err && err.message);
        });
};