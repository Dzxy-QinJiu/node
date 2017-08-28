import ajax from "../../common/ajax";
const routes = require("../../common/route");
var appAjaxTrans = require("../../../common/public/ajax/app");

function OrderActions() {
    this.generateActions(
        "getOrderList",
        "showForm",
        "hideForm"
    );

    routes.forEach(route => {
        this[route.handler] = function (reqData, params, cb) {
            const arg = {
                url: route.path,
                type: route.method,
                params: params,
                data: reqData,
            };
            
            ajax(arg).then(result => {
                this.dispatch(result);
                if (cb) cb(result);
            });
        };
    });

    this.getAppList = function () {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(list => {
            list = list.map(function(app) {
                return {
                    client_id : app.app_id,
                    client_name : app.app_name,
                    client_logo : app.app_logo
                };
            });

            this.dispatch(list);
        }).error(errorMsg => {
            this.Dispatch(errorMsg.responseJSON);
        }).timeout(errorMsg => {
            this.Dispatch(errorMsg.responseJSON);
        });
    };
}

module.exports = alt.createActions(OrderActions);
