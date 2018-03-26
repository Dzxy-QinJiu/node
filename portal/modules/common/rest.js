const querystring = require("querystring");
const restLogger = require("../../lib/utils/logger").getLogger('rest');
var restUtil = require("ant-auth-request").restUtil(restLogger);
const routes = require("./route");
const _ = require("underscore");

routes.forEach(route => {
    exports[route.handler] = function (req, res) {
        const queryStr = querystring.stringify(req.query);
        let url = queryStr? route.path + "?" + queryStr : route.path;

        if(!_.isEmpty(req.params)) {
            url = url.replace(/\:([a-zA-Z_\-0-9]+)/g,function($0,$1) {
                let param = req.params[$1];
                if (param.indexOf("=") > -1) param = param.replace(/=/g, "/");
                if (param.indexOf("_null") > -1) param = "";
                return param;
            });
        }

        let data = req.body.reqData? JSON.parse(req.body.reqData) : null;
        let method = route.method;

        if (method === "delete") method = "del";

        let options = {
            url: url,
            req: req,
            res: res
        };

        if (req.query.timeout) options.timeout = req.query.timeout;

        restUtil.authRest[method](
            options,
            data
        )
            .on("success", result => {
                res.json(result);
            })
            .on("error", codeMessage => {
                res.json(codeMessage);
            });
    };
});

