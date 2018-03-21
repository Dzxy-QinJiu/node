/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/14.
 */
var salesHomeAjax = require("../ajax/sales-home-ajax");
function CustomerNoticeMessageActions() {
    this.generateActions(
        'setInitState',//设置初始化数据
    );
}
module.exports = alt.createActions(CustomerNoticeMessageActions);