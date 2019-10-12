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
    );
    this.getUserDetailChangeRecord = function(searchObj) {
        this.dispatch({loading: true, error: false});
        userDetailChangeRecordAjax.getUserDetailChangeRecord(searchObj).then((data) => {
            this.dispatch({loading: false, error: false, data: data});
        }, (errorMsg) => {
            this.dispatch({loading: false, error: true, errorMsg: errorMsg});
        });
    };
}
module.exports = alt.createActions(UserDetailChangeRecordAction);