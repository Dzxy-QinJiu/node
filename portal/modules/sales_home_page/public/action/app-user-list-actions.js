/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/7.
 */
var salesHomeAjax = require("../ajax/sales-home-ajax");
var appAjaxTrans = require("../../../common/public/ajax/app");
function AppUserListActions() {
    this.generateActions(
        'setInitState',//设置初始化数据
        'onChangeUserCheckBox',
        'onChangeAppCheckBox',
        'onChangeApplyType'
    );
    //获取客户下的用户列表
    this.getCrmUserList = function (reqData) {
        this.dispatch({loading: true, error: false});
        salesHomeAjax.getCrmUserList(reqData).then((result) => {
            this.dispatch({loading: false, error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errorMsg });
        });
    };
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
}
module.exports = alt.createActions(AppUserListActions);