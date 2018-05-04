const querystring = require("querystring");
const restLogger = require("../../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
const routes = require("./route");
const _ = require("underscore");

routes.forEach(route => {
    exports[route.handler] = function (req, res) {
        const queryStr = querystring.stringify(req.query);
        let url = queryStr? route.path + "?" + queryStr : route.path;
        if(!_.isEmpty(req.params)) {
            url = url.replace(/\:([a-z_\-0-9]+)/g,function($0,$1) {
                return req.params[$1];
            });
        }
        const data = req.body.reqData? JSON.parse(req.body.reqData) : null;
        let method = route.method;
        if (method === "delete") method = "del";

        restUtil.authRest[method](
            {
                url: url,
                req: req,
                res: res
            },
            data
        )
        .on("success", result => {
            res.status(200).json(result);
        })
        .on("error", codeMessage => {
            res.status(500).json(codeMessage && codeMessage.message);
        });
    };
});

