var path = require("path");
var restLogger = require("../../../lib/utils/logger").getLogger('nock');
var RestUtil = require("ant-auth-request").restUtil(restLogger)(restLogger);
var nock = require("nock");
var nockParser = require(path.resolve(portal_root_path, "./lib/utils/nockParser"));

var HomeIndexService = require("../service/destktop-index-service");

exports.init = function() {
    nock(config.nockUrl)
        .persist()
        .get(/\/rest\/base\/v1\/user\/id\/[a-z0-9]+/)
        .query(true)
        .reply(function(uri , requestBody , cb) {
            setTimeout(function() {
                cb(null, [
                    200, {
                        user_logo: 'test',
                        user_name: 'test'
                    } , {}
                ]);
            } , 100);
        });
};