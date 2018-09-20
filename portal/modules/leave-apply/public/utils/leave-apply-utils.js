/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/18.
 */
var EventEmitter = require('events');
//申请列表滚动条参数
exports.APPLY_LIST_LAYOUT_CONSTANTS = {
    TOP_DELTA: 64,
    BOTTOM_DELTA: 50
};
exports.getApplyTopicText = (obj) => {
    if (obj.topic === 'customer_visit') {
        return Intl.get('leave.apply.add.leave.apply', '出差申请');
    }
};
//暴露一个emitter，做自定义事件
exports.emitter = new EventEmitter();