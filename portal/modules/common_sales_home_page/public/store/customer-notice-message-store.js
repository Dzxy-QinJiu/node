/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/14.
 */
var CustomerNoticeMessageActions = require("../action/customer-notice-message-actions");
function CustomerNoticeMessageStore() {
    this.setInitState();
    this.bindActions(CustomerNoticeMessageActions);
}
//设置初始化数据
CustomerNoticeMessageStore.prototype.setInitState = function () {

};

module.exports = alt.createStore(CustomerNoticeMessageStore, 'CustomerNoticeMessageStore');