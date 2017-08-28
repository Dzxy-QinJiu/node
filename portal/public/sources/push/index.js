/**
 * Created by wangliping on 2016/6/22.
 */

require('./index.scss');
var Modal = require("antd").Modal;
var batch = require("./batch");
var io = require('socket.io-client');
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后修改发送数据
var notificationEmitter = require("../../../public/sources/utils/emitters").notificationEmitter;
var notificationUtil = require("./notification");
var socketEmitter = require("../../../public/sources/utils/emitters").socketEmitter;
let ajaxGlobal = require("../jquery.ajax.global");
var hasPrivilege = require("../../../components/privilege/checker").hasPrivilege;
var NotificationType = {};
var applyTipCount = 0;
var approveTipCount = 0;
const TIMEOUTDELAY = {
    closeTimeDelay : 5000,
    renderTimeDelay :　2000
};

//socketIo对象
var socketIo;
//推送过来新的消息后，将未读数加/减一
function updateUnreadByPushMessage(type, isAdd) {
    //将未读数加一
    if (Oplate && Oplate.unread) {
        if (Oplate.unread[type]) {
            if (isAdd) {
                Oplate.unread[type] += 1;
            } else {
                Oplate.unread[type] -= 1;
            }
        } else {
            Oplate.unread[type] = isAdd ? 1 : 0;
        }
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        //向展示的组件发送数据
        timeoutFunc = setTimeout(function () {
            //待审批数的刷新展示
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT);
            //刷新未读消息数
            notificationEmitter.emit(notificationEmitter.UPDATE_NOTIFICATION_UNREAD);
        }, timeout);
    }
}
/**
 * 监听弹出消息。
 * @param data
 */
function listenOnMessage(data) {
    if (_.isObject(data)) {
        switch (data.message_type) {
            case "apply":
                //未处理的申请消息
                notifyInfo(data);
                //申请消息列表弹出，有新数据，是否刷新数据的提示
                notificationEmitter.emit(notificationEmitter.APPLY_UPDATED, data);
                //将申请消息的未读数加一（true）
                updateUnreadByPushMessage("apply", true);
                //将待审批数加一（true）
                updateUnreadByPushMessage("approve", true);
                break;
            case "reply":
                //批复类型
                notifyInfo(data);
                notificationEmitter.emit(notificationEmitter.APPLY_UPDATED, data);
                //待审批数减一
                updateUnreadByPushMessage("approve", false);
                break;
            case "repay":
                //回款类型
                //notifyRepayInfo(data);
                break;
            case "customer":
                //客户提醒(包含用户过期提醒)
                notifyCustomerInfo(data);
                //将客户提醒的未读数加一
                updateUnreadByPushMessage("customer", true);
                break;
            case "system":
                //系统通知
                //notifySystemInfo(data);
                break;
        }
    }
}
//获取申请用户的名称
function getUserNames(message) {
    let userNames = "";
    if (message.user_name) {
        userNames = message.user_name;
    } else if (message.user_names) {
        userNames = JSON.parse(message.user_names);
        if (_.isArray(userNames)) {
            userNames = userNames.join(',');
        }
    }
    return userNames;
}
//获取提醒中的内容
function getTipContent(data) {
    var tipContent = "";
    //申请的消息
    //xxx(销售) 给客户 xxx 申请了 正式/试用 用户 xxx,xxx
    if (data.approval_state == "false"){
        let salesName = data.message.sales_name || "";//谁发的申请(销售)
        let customerName = data.message.customer_name || "";//给哪个客户开通的用户
        let userType = data.message.tag || "";//申请用户的类型：正式、试用用户
        let userNames = getUserNames(data.message);//申请用户的名称
        tipContent = salesName + " 给客户 " + customerName
            + " 申请了 " + userType + " " + userNames;
    }else {
        //审批的消息
        tipContent = data.approval_person || "";//谁批复的
        //审批通过
        if (data.approval_state == "pass") {
            //xxx 通过了 xxx(销售) 给客户 xxx 申请的 正式/试用 用户 xxx，xxx
            tipContent += " 通过了 ";
        } else if (data.approval_state == "reject") {//审批驳回
            //xxx 驳回了 xxx(销售) 给客户 xxx 申请的 正式/试用 用户 xxx，xxx
            tipContent += " 驳回了 ";
        } else if (data.approval_state == "cancel") {//撤销
            //xxx撤销了 给客户 xxx 申请的 正式/试用 用户 xxx，xxx
            tipContent += " 撤销了";
        }
        let salesName = data.message.sales_name || "";//谁发的申请(销售)
        let customerName = data.message.customer_name || "";//给哪个客户开通的用户
        let userType = data.message.tag || "";//申请用户的类型：正式、试用用户
        let userNames = getUserNames(data.message);//申请用户的名称
        if (data.approval_state !== "cancel") {//只能销售自己撤销自己的申请，所以撤销时，不需要再加销售名称
            tipContent += salesName;
        }
        tipContent += " 给客户 " + customerName
            + " 申请的 " + userType + " " + userNames;
    }
    return tipContent;
}
/*
*申请和审批的提示 */
function notifyInfo(data) {
    if(_.isObject(data.message)){
        var notify = NotificationType['exist'];
        //记录不同推送的种类的数量
        if (data.approval_state == "false"){
            applyTipCount++;
        }else{
            approveTipCount++;
        }
        //如果界面上没有提示框，就显示推送的具体内容
        if (!notify){
            //根据不同类型，获得不同的标题
            var title = "";
            if (data.approval_state == "false"){
                title = data.topic;
            }else{
                title = "用户申请审批";
            }
            //根据不同类型，获取提醒提示框中的内容
            var tipContent = getTipContent(data);
            notify =  notificationUtil.showNotification({
                title: title,
                content: tipContent,
                closeWith: ["button"],
                timeout: TIMEOUTDELAY.closeTimeDelay,
                callback:{
                    onClose: function () {
                        delete NotificationType['exist'];
                        approveTipCount=0;
                        applyTipCount=0;

                    }
                }
            });
            NotificationType['exist'] = notify;
        }else{
            setTimeout(()=>{
                //如果页面上存在提示框，只显示有多少条消息
                var tipContent = '';
                //只有大于0条才显示
                if (applyTipCount>0){
                    tipContent = `<p>有${applyTipCount}条申请消息</p>`;
                }
                if (approveTipCount>0){
                    tipContent = tipContent +`<p>有${approveTipCount}条审批消息</p>`;
                }
                notificationUtil.updateText(notify,{
                    content: tipContent,
                });
            },TIMEOUTDELAY.renderTimeDelay)
        }
    }
}
/**
 *回款提醒
 */
function notifyRepayInfo(data) {
    notificationUtil.showNotification({
        title: "回款提醒",
        content: data.topic,
        closeWith: ["button"],
        timeout: 5 * 1000
    });
}
/**
 *客户提醒
 */
function notifyCustomerInfo(data) {
    notificationUtil.showNotification({
        title: "客户提醒",
        content: data.topic,
        closeWith: ["button"],
        timeout: 5 * 1000
    });
}
/**
 *系统通知
 */
function notifySystemInfo(data) {
    notificationUtil.showNotification({
        title: "系统通知",
        content: data.topic,
        closeWith: ["button"],
        timeout: 5 * 1000
    });
}

/**
 * 监听node端推送的登录踢出的信息
 * @param userObj
 */
function listenOnOffline(userObj) {
    var tipMsg = getReloginTooltip(userObj);
    Modal.error({
        wrapClassName: 'socket-io',
        content: tipMsg,
        okText: '重新登录',
        onOk: function () {
            window.location.href = '/logout';
        }
    });
    setTimeout(function () {
        //设置提示框的样式
        var $modal = $("body >.ant-modal-container");
        if ($modal && $modal.length > 0) {
            $modal.addClass("offline-modal-container");
        }
    }, 100);
    //解除 session失效提示的 事件绑定
    $(document).off("ajaxError");
}

/**
 * 获取重新登录的提示
 * @userObj 最新登录用户的信息
 */
function getReloginTooltip(userObj) {
    var tipMsg = ``;
    if (userObj.country == "局域网") {
        //局域网内登录时，提示ip
        tipMsg = `您的账号在局域网内IP为${userObj.ip}的机器上登录，如非本人操作，建议您尽快修改密码！`;
    } else if (userObj.country == "IANA" || !(userObj.country || userObj.province || userObj.city)) {
        tipMsg = `您的账号在另一地点登录，如非本人操作，建议您尽快修改密码！`;
    } else {
        tipMsg = `您的账号在${userObj.country || ``} ${userObj.province || ``}${userObj.city || ``}登录，如非本人操作，建议您尽快修改密码！`;
    }
    return tipMsg;
}

//session过期后的处理
function handleSessionExpired() {
    ajaxGlobal.handleSessionExpired();
}
//断开连接时，移出Emitter监听器
function socketEmitterListener() {
    console.log('socketEmitter removeListener ');
    if (socketIo) {
        socketIo.disconnect();
    }
}
//socketio断开连接处理器
function disconnectListener() {
    console.log('user disconnected');
    if (socketIo) {
        //取消监听
        socketIo.off('mes', listenOnMessage);
        socketIo.off('offline', listenOnOffline);
        socketIo.off('sessionExpired', handleSessionExpired);
        socketIo.off('batchOperate', batch.batchOperateListener);
        socketIo.off('disconnect', disconnectListener);
        socketEmitter.removeListener(socketEmitter.DISCONNECT, socketEmitterListener);
    }
}
/**
 *启动socketio
 */
function startSocketIo() {
    var transportType = window.WebSocket ? 'websocket' : 'polling';
    socketIo = io({forceNew: true, transports: [transportType]});
    //监听 connect
    socketIo.on('connect', function () {
        //待审批数、及未读数的权限
        if (hasPrivilege("NOTIFICATION_APPLYFOR_LIST") || hasPrivilege("APP_USER_APPLY_LIST")) {
            let type = "";
            if (hasPrivilege("NOTIFICATION_APPLYFOR_LIST") && hasPrivilege("APP_USER_APPLY_LIST")) {
                //获取未读数和未审批数
                type = "all";
            } else if (hasPrivilege("APP_USER_APPLY_LIST")) {
                //只获取待审批数
                type = "unapproved";
            } else if (hasPrivilege("NOTIFICATION_APPLYFOR_LIST")) {
                //只获取未读数
                type = "unread";
            }
            //获取消息未读数
            getNotificationUnread({type: type}, () => {
                //获取完未读数后，监听node端推送的弹窗消息
                socketIo.on('mes', listenOnMessage);
            });
        } else {
            //获取完未读数后，监听node端推送的弹窗消息
            socketIo.on('mes', listenOnMessage);
        }
        //监听node端推送的登录踢出的信息
        socketIo.on('offline', listenOnOffline);
        //监听session过期的消息
        socketIo.on('sessionExpired', handleSessionExpired);
        //监听用户批量操作的消息
        socketIo.on('batchOperate', batch.batchOperateListener);
        //监听 disconnect
        socketIo.on('disconnect', disconnectListener);
        //如果接受到主动断开的方法，调用socket的断开
        socketEmitter.on(socketEmitter.DISCONNECT, socketEmitterListener);
    });
}

//获取未读数
function getNotificationUnread(queryObj, callback) {
    $.ajax({
        url: '/rest/notification/unread_num',
        type: 'get',
        dataType: 'json',
        timeout: 10 * 1000,
        data: queryObj,
        success: data=> {
            var messages = {};
            _.each(['apply', 'customer', 'system', 'approve'], function (key) {
                var value = data[key];
                if (typeof value === 'number' && value > 0) {
                    messages[key] = value;
                } else if (typeof value === 'string') {
                    var num = parseInt(value);
                    if (!isNaN(num) && num > 0) {
                        messages[key] = num;
                    } else {
                        messages[key] = 0;
                    }
                } else {
                    messages[key] = 0;
                }
            });
            //更新全局变量里存储的未读数，以便在业务逻辑里使用
            updateGlobalUnreadStorage(messages);
            if (callback) {
                callback();
            }
        },
        error: ()=> {
            if (callback) {
                callback();
            }
        }
    });
}
//更新全局变量里存储的未读数，以便在业务逻辑里使用
function updateGlobalUnreadStorage(message) {
    if (Oplate && Oplate.unread && message) {
        for (var key in Oplate.unread) {
            Oplate.unread[key] = message[key] || 0;
        }
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        //向展示的组件发送数据
        timeoutFunc = setTimeout(function () {
            //更新未读消息数
            notificationEmitter.emit(notificationEmitter.UPDATE_NOTIFICATION_UNREAD);
            //待审批数的刷新展示
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT);
        }, timeout);
    }
}
module.exports.startSocketIo = startSocketIo;