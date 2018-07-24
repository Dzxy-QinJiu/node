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
//后端推送的通话数据转换
exports.phoneMsgToFrontend = function(phoneMsg) {
    return {
        id: phoneMsg.id,//通话记录的id,用于保存填写的跟进记录（只有当通话结束后type=phone时，推送过来的数据中才会有id）
        type: phoneMsg.type,//'ALERT', 'ANSWERED', 'phone'/ 'call_back'等通话状态
        customers: phoneMsg.customers,//当前拨打的电话对应的客户{id,name}列表（通常只有一个客户，个别电话会存在一个电话对应多个客户）
        call_type: phoneMsg.call_type,//'IN':呼入，‘OU’:呼出
        extId: phoneMsg.extId,//呼入的电话
        to: phoneMsg.to,//呼出的电话
        dst: phoneMsg.dst,//呼出的电话（个别状态下，没有to需要取dst）
        callid: phoneMsg.callid, //通话id,一个通话中，'ALERT', 'ANSWERED', 'phone'/'call_back'状态的callid相同
        recevied_time: phoneMsg.recevied_time, //通话状态的接收时间，'ALERT', 'ANSWERED', 'phone'/'call_back'状态的接收时间是有序（后面的状态接收时间要在前面状态之后）
        billsec: phoneMsg.billsec //通话时长
    };
};