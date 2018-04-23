var ThirdAppService = require("../service/third_app_detail.service");
var extend = require("extend");
var _ = require("underscore");
const serviceHandler = function (service) {
    return function (req, res) {
        service(req, res).on("success", function (data) {
            res.json(data);
        }).on("error", function (codeMessage) {
            res.status(500).json(codeMessage && codeMessage.message);
        });
    };
};

_.each(ThirdAppService, function (value, key) {
    if (key != "getAppConfigList") {
        exports[key] = serviceHandler(value);
    }
});

// 获取用户绑定的第三方平台列表
exports.getAppConfigList = (req, res) => {
    ThirdAppService.getAppConfigList(req, res, req.params.user_id).on("success", (data) => {
        res.json(data);
    }).on("error", (codeMessage) => {
        res.status(500).json(codeMessage && codeMessage.message);
    });
};

