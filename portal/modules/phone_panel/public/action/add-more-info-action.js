/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/12.
 */
var phoneAlertAjax = require("../ajax/phone-alert-ajax");
function AddMoreInfoAction() {
    this.generateActions(
        'resetState'
    );
    this.getAppList = function() {
        this.dispatch({ loading: true, error: false});
        phoneAlertAjax.getAppLists().then((data) => {
            this.dispatch({ loading: false, error: false, lists: data});
        }, (errMsg) => {
            this.dispatch({loading: false, error: true, errMsg: errMsg});
        });
    };
    this.addAppFeedback = function(submitObj, cb) {
        phoneAlertAjax.addAppFeedback(submitObj).then((data)=>{
            cb(data);
        },(errorMsg)=>{
            cb( errorMsg || Intl.get("call.record.failed.add.app.feedback","添加产品反馈内容失败"));
        });
    };
}
module.exports = alt.createActions(AddMoreInfoAction);