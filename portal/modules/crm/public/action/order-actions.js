import ajax from "../../common/ajax";
import crmAjax from "../ajax/index";
const routes = require("../../common/route");
var appAjaxTrans = require("../../../common/public/ajax/app");

function OrderActions() {
    this.generateActions(
        "getMergeOrderList",
        "showForm",
        "hideForm",
        "onChangeUserCheckBox",
        "onChangeAppCheckBox",
        "onChangeApplyType",
        "setCrmUsersLoading",
        "setPageNum",
        "afterDelOrder",
        "afterEditOrder",
        "afterAddOrder",
        "setOrderListLoading"
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
            }, (errorMsg) => {
                this.dispatch(errorMsg);
                if (cb) cb(errorMsg);
            });
        };
    });

    this.getAppList = function () {
        appAjaxTrans.getGrantApplicationListAjax().sendRequest().success(list => {
            list = list.map(function (app) {
                return {
                    client_id: app.app_id,
                    client_name: app.app_name,
                    client_logo: app.app_logo
                };
            });

            this.dispatch(list);
        }).error(errorMsg => {
            this.dispatch(errorMsg.responseJSON);
        }).timeout(errorMsg => {
            this.dispatch(errorMsg.responseJSON);
        });
    };
    //获取客户下的用户列表
    this.getCrmUserList = function (reqData) {
        crmAjax.getCrmUserList(reqData).then((userData) => {
            this.dispatch({errorMsg: "", result: userData});
        }, (errorMsg) => {
            this.dispatch({errorMsg: errorMsg});
        });
    };
}

module.exports = alt.createActions(OrderActions);
