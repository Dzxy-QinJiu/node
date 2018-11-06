/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/29.
 */
var EventEmitter = require('events');
//暴露一个emitter，做自定义事件
exports.emitter = new EventEmitter();
export const REALM_REMARK = {
    EEFUNG: 'BusinessOpportunitiesforSale1',//销售机会，蚁坊域的流程标识
    CIVIW: 'BusinessOpportunitiesforSale2'//销售机会，识微域的流程标识
};