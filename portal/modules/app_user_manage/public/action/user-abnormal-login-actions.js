/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/8.
 */
var userAbnormalLoginAjax = require('../ajax/user-abnormal-login-ajax');
var userDetailChangeRecordAjax = require('../ajax/user-detail-change-record-ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;
import { userBasicInfoEmitter } from 'PUB_DIR/sources/utils/emitters';

function UserAbnormalLoginAction() {
    this.generateActions(
        'resetState',//重置数据
        'setApp',//设置应用的名称
        'deleteAbnormalLoginInfo' // 删除某条异地登录的信息
    );
    this.getUserAbnormalLogin = function(data) {
        this.dispatch({loading: true, error: false});
        userAbnormalLoginAjax.getUserAbnormalLogin(data).then((data) => {
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
    // 根据用户的ID获取应用列表appId和应用的名称
    this.getUserApp = function(userId,callback) {
        this.dispatch({loading: true,error: false});
        userDetailChangeRecordAjax.getSingleUserAppList(userId).then((result) => {
            // 触发用户的基本信息
            const userInfo = {
                data: _.get(result, 'user'),
                loading: false,
                errorMsg: ''
            };
            userBasicInfoEmitter.emit(userBasicInfoEmitter.GET_USER_BASIC_INFO, userInfo);

            this.dispatch({loading: false,error: false, dataObj: result.apps});
            callback && callback();
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    };

}
module.exports = alt.createActions(UserAbnormalLoginAction);

