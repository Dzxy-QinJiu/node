/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/5/11.
 */
const userDetailChangeRecordAjax = require('../ajax/user-detail-change-record-ajax');

function UserDetailChangeRecordAction() {
    this.generateActions(
        // 获取用户详情变更记录
        'setApp',
        // 获取用户的app列表
        'getUserApp',
    );
    this.getUserDetailChangeRecord = function(searchObj) {
        this.dispatch({loading: true, error: false});
        userDetailChangeRecordAjax.getUserDetailChangeRecord(searchObj).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    // 根据用户的ID获取应用列表appId和应用的名称
    this.getUserApp = function(userId,callback) {
        var dataObj = {
            app_name: '',//下拉框中显示app的名字
            app_id: '',
            data: [],//当前用户所拥有的app列表
        };
        this.dispatch({loading: true,error: false});
        userDetailChangeRecordAjax.getSingleUserAppList(userId).then((result) => {

            if (_.isArray(result.apps) && result.apps.length >= 1) {
                dataObj.app_name = result.apps[0].app_name;
                dataObj.app_id = result.apps[0].app_id;
                dataObj.data = result.apps;
                callback && callback(dataObj);
            }
            this.dispatch({loading: false,error: false, dataObj: dataObj});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    };
}
module.exports = alt.createActions(UserDetailChangeRecordAction);