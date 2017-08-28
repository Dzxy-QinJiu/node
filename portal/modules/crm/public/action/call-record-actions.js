import ajax from "../../common/ajax";
const routes = require("../../common/route");

function CallRecordActions() {
    const _this = this;
    this.generateActions(
        'resetState'
    );
    _.filter(routes , (route) => {
        return ["getRecordGraph","getRecordList"].indexOf(route.handler) >= 0;
    }).forEach(route => {
        _this[route.handler] = function (args, cb) {
            const _this2 = this;
            const arg = {
                url: route.path,
                type: route.method,
                data: args.reqData,
                params : args.params
            };
            this.dispatch({
                loading : true,
                error : false
            });
            ajax(arg).then(function (result) {
                var dispatchObj = {
                    loading : false,
                    error : false,
                    result : result
                };
                _this2.dispatch(dispatchObj);
                if (cb) cb(dispatchObj);
            },function(errorMsg) {
                var dispatchObj = {
                    loading : false,
                    error : true,
                    errorMsg : errorMsg
                };
                _this2.dispatch(dispatchObj);
                if(cb) cb(dispatchObj);
            });
        };
    });
}

module.exports = alt.createActions(CallRecordActions);
