/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/7/20.
 */
let _ = require('lodash');
//申请、审批、批复、客户提醒等类型的消息数据类型
exports.applyMessageToFrontend = function(messageObj) {
    return {
        message_type: messageObj.message_type,//申请、审批、批复、客户提醒等类型
        //各类型对应的消息内容
        message: {
            sales_name: _.get(messageObj, 'message.sales_name', ''),//谁发的申请（销售）
            customer_name: _.get(messageObj, 'message.customer_name', ''),//给哪个客户开通的用户
            tag: _.get(messageObj, 'message.tag', ''),//申请用户的类型：正式、试用用户
            user_name: _.get(messageObj, 'message.user_name', ''),//申请的用户名（多个用户时是用户名组成的数组json）
        },
        approval_state: messageObj.approval_state,//审批类型（pass:通过、reject:驳回、cancel:撤销）
        approval_person: messageObj.approval_person,//谁批复的
        topic: messageObj.topic, //客户提醒的内容
    };
};