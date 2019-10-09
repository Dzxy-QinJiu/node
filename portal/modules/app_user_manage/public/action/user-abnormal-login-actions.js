/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/8/8.
 */
var userAbnormalLoginAjax = require('../ajax/user-abnormal-login-ajax');
var scrollBarEmitter = require('../../../../public/sources/utils/emitters').scrollBarEmitter;

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
}
module.exports = alt.createActions(UserAbnormalLoginAction);

