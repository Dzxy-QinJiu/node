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
        leads: phoneMsg.leads,
        call_type: phoneMsg.call_type,//'IN':呼入，‘OU’:呼出
        extId: phoneMsg.extId,//呼入的电话
        to: phoneMsg.to,//呼出的电话
        dst: phoneMsg.dst,//呼出的电话（个别状态下，没有to需要取dst）
        callid: phoneMsg.callid, //通话id,一个通话中，'ALERT', 'ANSWERED', 'phone'/'call_back'状态的callid相同
        recevied_time: phoneMsg.recevied_time, //通话状态的接收时间，'ALERT', 'ANSWERED', 'phone'/'call_back'状态的接收时间是有序（后面的状态接收时间要在前面状态之后）
        billsec: phoneMsg.billsec, //通话时长
        call_date: phoneMsg.call_date,
        lead_id: phoneMsg.lead_id,
        customer_id: phoneMsg.customer_id
    };
};

//日程提醒数据
exports.scheduleMsgToFrontend = function(scheduleMsg) {
    return {
        contacts: scheduleMsg.contacts,//联系人列表
        customer_name: scheduleMsg.customer_name,//客户名
        content: scheduleMsg.content,//日程内容
        topic: scheduleMsg.topic,
        type: scheduleMsg.type,//日程类型
    };
};

//操作客户提醒数据
exports.crmOperatorMsgToFrontend = function(crmOperatorMsg) {
    return {
        customer_id: crmOperatorMsg.customer_id,//客户id
        operator_id: crmOperatorMsg.operator_id,//操作人id
        member_id: crmOperatorMsg.member_id,//释放客户后通知给谁
        status: crmOperatorMsg.status,//0是未处理 1是已经处理
        customer_ids: crmOperatorMsg.customer_ids,//批量消息团队id
        type: crmOperatorMsg.type,//操作客户的类型如（批量释放：batch_release_notice，单个释放客户：release_notice）
        date: crmOperatorMsg.date,//推送时间
        operator_nickname: crmOperatorMsg.operator_nickname,//操作人昵称
        customer_name: crmOperatorMsg.customer_name,//客户名称
    };
};

//登录踢出数据
exports.offlineMsgToFrontend = function(offlineMsg) {
    return {
        country: offlineMsg.country,//登录地的国家
        ip: offlineMsg.ip,//登录地的ip
        province: offlineMsg.province,//登录地的省
        city: offlineMsg.city,//登录地的市
    };
};

//系统通知的数据
exports.systemMsgToFrontend = function(systemMsg) {
    return {
        type: systemMsg.type,//系统通知的类型，appIllegal：停用登录，concerCustomerLogin：关注客户登录，illegalLocation：异地登录，loginFailed：登录时报密码或验证码错误
        customer_name: systemMsg.customer_name,//客户名
        content: systemMsg.content,//异地登录时，异地登录的信息
        user_name: systemMsg.user_name,//登录的账号
        app_name: systemMsg.app_name,//登录的应用
    };
};
//未读回复的数据
exports.unreadReplyToFrontend = function(unreadReply) {
    return {
        member_id: unreadReply.member_id,//谁的未读回复
        create_time: unreadReply.create_time,//回复时间
        id: unreadReply.id,//回复的id
        apply_id: unreadReply.apply_id,//有未读回复的申请id
        type: unreadReply.type || '',//未读回复的类型
    };
};
//线索数量变化后的数据
exports.clueMsgToFrontend = function(clueMsg) {
    return {
        message_type: 'unhandleClue',//线索的类型
        member_id: clueMsg.user_id,//分配给谁的线索
        clue_list: _.get(clueMsg,'clue_list',[]),//线索id和name的列表
    };
};
//申请审批数量变化后的数据
exports.applyApproveMsgToFrontend = function(applyApproveMsg,memberId) {
    return {
        message_type: applyApproveMsg.topic,//申请审批的类型
        member_id: memberId,//分配给谁的申请审批
    };
};