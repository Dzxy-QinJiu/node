/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/29.
 */
var EventEmitter = require('events');
//暴露一个emitter，做自定义事件
exports.emitter = new EventEmitter();
export const REALM_REMARK = {
    EEFUNG: '36mvh13nka',//蚁坊域的安全域id
    CIVIW: '36duh3ok3i'//销识微域的安全域id
};