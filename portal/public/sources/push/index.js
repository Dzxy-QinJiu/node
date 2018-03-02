/**
 * Created by wangliping on 2016/6/22.
 */

require('./index.less');
var Modal = require("antd").Modal;
var batch = require("./batch");
var io = require('socket.io-client');
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后修改发送数据
var notificationEmitter = require("../../../public/sources/utils/emitters").notificationEmitter;
var notificationUtil = require("./notification");
var socketEmitter = require("../../../public/sources/utils/emitters").socketEmitter;
var phoneMsgEmitter = require("../../../public/sources/utils/emitters").phoneMsgEmitter;
let ajaxGlobal = require("../jquery.ajax.global");
var hasPrivilege = require("../../../components/privilege/checker").hasPrivilege;
import Translate from '../../intl/i18nTemplate';
import {SYSTEM_NOTICE_TYPE_MAP, SYSTEM_NOTICE_TYPES} from '../utils/consts';
import logoSrc from "./notification.png";
import userData from "../user-data";
import Trace from "LIB_DIR/trace";
const DATE_TIME_WITHOUT_SECOND_FORMAT = oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT;
var NotificationType = {};
var approveTipCount = 0;
const TIMEOUTDELAY = {
    closeTimeDelay: 5000,
    renderTimeDelay: 2000,
    phoneRenderDelay: 2000,
    scheduleCloseTimeDelay: 15000,//日程桌面通知的时间
};
import PhoneAlert from "MOD_DIR/phone-alert/public";
//当前正在拨打的电话及联系人信息，从点击事件emitter出来
var phoneObj = {};
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
                //有新的未处理的申请消息时,只修改待审批数，不用展示
                //申请审批列表弹出，有新数据，是否刷新数据的提示
                notificationEmitter.emit(notificationEmitter.APPLY_UPDATED, data);
                //将待审批数加一（true）
                updateUnreadByPushMessage("approve", true);
                break;
            case "reply":
                //批复类型
                if(!userData.hasRole("realm_manager")){
                    //批复类型的通知，不通知管理员
                    notifyReplyInfo(data);
                }
                notificationEmitter.emit(notificationEmitter.APPLY_UPDATED, data);
                //将审批后的申请消息未读数加一（true）
                updateUnreadByPushMessage("apply", true);
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
//监听系统消息
function listenSystemNotice(notice) {
    if (_.isObject(notice)) {
        //申请消息列表弹出，有新数据，是否刷新数据的提示
        notificationEmitter.emit(notificationEmitter.SYSTEM_NOTICE_UPDATED, notice);
        let title = notice.type ? SYSTEM_NOTICE_TYPE_MAP[notice.type] : "";
        let tipContent = notice.customer_name;//xxx（客户）
        //是否是异地登录的类型
        let isOffsetLogin = (notice.type === SYSTEM_NOTICE_TYPES.OFFSITE_LOGIN && notice.content);
        //异地登录
        if (isOffsetLogin) {
            //在 xxx (地名)
            tipContent += Intl.get("notification.system.on", "在") + notice.content.current_location;
        }
        if (notice.user_name) {
            //用账号xxx
            tipContent += Intl.get("notification.system.use.account", "用账号") + notice.user_name;
        }
        if (notice.app_name) {
            //登录了 xxx (应用)
            tipContent += Intl.get("notification.system.login", "登录了") + notice.app_name;
        }
        //标签页不可见时，有桌面通知，并且允许弹出桌面通知时
        if (canPopDesktop()) {
           //停用客户登录的通知不自动关闭
            var isClosedByClick = false;
            if (notice.type === SYSTEM_NOTICE_TYPES.DISABLE_CUSTOMER_LOGIN){
                isClosedByClick = true;
            }
            //桌面通知的展示
            showDesktopNotification(title, tipContent, isClosedByClick);
        } else {//系统弹出通知
            notificationUtil.showNotification({
                title: title,
                content: tipContent,
                closeWith: ["button"],
                timeout: TIMEOUTDELAY.closeTimeDelay
            });
        }
    }
}
//桌面通知的展示
function showDesktopNotification(title, tipContent, isClosedByClick) {
    let notification = new Notification(title, {
        body: tipContent,
        tag: title,
        icon: logoSrc,
        requireInteraction: isClosedByClick
    });
    notification.onerror = function () {
        notification.close();
    };
    notification.onclick = function () {
        //如果通知消息被点击,通知窗口将被激活
        window.focus();
        notification.close();
    },
        notification.onshow = function () {
            if (!isClosedByClick) {
                setTimeout(function () {
                    notification.close();
                },  TIMEOUTDELAY.closeTimeDelay);
            }
        }
}
// 标签页是否可见（各种浏览器兼容）
function documentIsHidden() {
    return document.hidden || document.mozHidden || document.msHidden
        || document.webkitHidden;
};

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
//获取审批消息提醒中的内容
function getReplyTipContent(data) {
    //审批的消息
    let tipContent = "";
    let approvalPerson = data.approval_person || "";//谁批复的
    let salesName = data.message.sales_name || "";//谁发的申请(销售)
    let customerName = data.message.customer_name || "";//给哪个客户开通的用户
    let userType = data.message.tag || "";//申请用户的类型：正式、试用用户
    let userNames = getUserNames(data.message);//申请用户的名称
    switch (data.approval_state) {
        case "pass"://审批通过
                    // xxx 通过了 xxx(销售) 给客户 xxx 申请的 正式/试用 用户 xxx，xxx
            tipContent = Intl.get("reply.pass.tip.content",
                "{approvalPerson} 通过了 {salesName} 给客户 {customerName} 申请的 {userType} 用户 {userNames}", {
                    approvalPerson: approvalPerson,
                    salesName: salesName,
                    customerName: customerName,
                    userType: userType,
                    userNames: userNames
                });
            break;
        case "reject"://审批驳回
            //xxx 驳回了 xxx(销售) 给客户 xxx 申请的 正式/试用 用户 xxx，xxx
            tipContent = Intl.get("reply.reject.tip.content",
                "{approvalPerson} 驳回了 {salesName} 给客户 {customerName} 申请的 {userType} 用户 {userNames}", {
                    approvalPerson: approvalPerson,
                    salesName: salesName,
                    customerName: customerName,
                    userType: userType,
                    userNames: userNames
                });
            break;
        case "cancel"://撤销申请
            //xxx撤销了 给客户 xxx 申请的 正式/试用 用户 xxx，xxx
            //只能销售自己撤销自己的申请，所以撤销时，不需要再加销售名称
            tipContent = Intl.get("reply.cancel.tip.content",
                "{approvalPerson} 撤销了给客户 {customerName} 申请的 {userType} 用户 {userNames}", {
                    approvalPerson: approvalPerson,
                    customerName: customerName,
                    userType: userType,
                    userNames: userNames
                });
            break;
    }
    return tipContent;
}
function listPhoneNum(data) {
    if (data) {
        phoneObj = data;
    }
}
// phoneObj 是包含所拨打的电话号码和客户信息的对象
function setInitialPhoneObj() {
    phoneObj = {};
}
/*
 * 监听拨打电话消息的推送*/
function phoneEventListener(phonemsgObj) {
    //为了避免busy事件在两个不同的通话中错乱的问题，过滤掉推送过来的busy状态
    if (hasPrivilege("CRM_LIST_CUSTOMERS") && phonemsgObj.type !== "BUSY") {
        ReactDOM.render(
            <Translate Template={<PhoneAlert phonemsgObj={phonemsgObj} phoneObj={phoneObj}
                                             setInitialPhoneObj={setInitialPhoneObj}/>}></Translate>,
            document.getElementById('phone-alert-modal')
        );
    }

}

//可否弹出桌面通知
function canPopDesktop() {
    //标签页不可见时，有桌面通知，并且允许弹出桌面通知时
    return documentIsHidden() && window.Notification && Notification.permission === 'granted';
}

function scheduleAlertListener(scheduleAlertMsg) {
    var title = Intl.get("customer.contact.somebody", "联系") + scheduleAlertMsg.customer_name;
    var tipContent = scheduleAlertMsg.content || "";
    if (canPopDesktop()) {
        //桌面通知的展示
        showDesktopNotification(title, tipContent, true);
    } else {//系统弹出通知
        notificationUtil.showNotification({
            title: title,
            content: tipContent,
            closeWith: ["button"],
            timeout: TIMEOUTDELAY.scheduleCloseTimeDelay
        });
    }
}
/*
 *审批的提示 */
function notifyReplyInfo(data) {
    if (_.isObject(data.message)) {
        //记录推送的审批通知的数量
        approveTipCount++;
        //标签页不可见时，有桌面通知，且允许弹出桌面通知时
        if (canPopDesktop()) {//桌面通知的展示
            showDesktopNotification(Intl.get("user.apply.approve", "用户申请审批"), getReplyTipContent(data));
        } else {//系统弹出通知
            let notify = NotificationType['exist'];
            //如果界面上没有提示框，就显示推送的具体内容
            if (!notify) {
                //获取提醒提示框中的内容
                let tipContent = getReplyTipContent(data);
                notify = notificationUtil.showNotification({
                    title: Intl.get("user.apply.approve", "用户申请审批"),
                    content: tipContent,
                    closeWith: ["button"],
                    timeout: TIMEOUTDELAY.closeTimeDelay,
                    callback: {
                        onClose: function () {
                            delete NotificationType['exist'];
                            approveTipCount = 0;
                        }
                    }
                });
                NotificationType['exist'] = notify;
            } else {
                setTimeout(() => {
                    //如果页面上存在提示框，只显示有多少条消息
                    let tipContent = '';
                    if (approveTipCount > 0) {
                        tipContent = tipContent + `<p>${Intl.get("user.apply.approve.count", "有{approveCount}条审批消息", {approveCount: approveTipCount})}</p>`;
                    }
                    notificationUtil.updateText(notify, {
                        content: tipContent,
                    });
                }, TIMEOUTDELAY.renderTimeDelay)
            }
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
        socketIo.off('phonemsg', phoneEventListener);
        socketIo.off('scheduleAlertMsg', scheduleAlertListener);
        socketIo.off('system_notice', listenSystemNotice);
        phoneMsgEmitter.removeListener(phoneMsgEmitter.SEND_PHONE_NUMBER, listPhoneNum);
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
            if (userData.hasRole("salesmanager")) {
                //只获取未读数，舆情秘书不展示待审批的申请
                type = "unread";
            } else {
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
            }
            //获取消息未读数
            getNotificationUnread({type: type}, () => {
                //获取完未读数后，监听node端推送的弹窗消息
                socketIo.on('mes', listenOnMessage);
                //监听系统消息
                socketIo.on('system_notice', listenSystemNotice);
            });
        } else {
            //获取完未读数后，监听node端推送的弹窗消息
            socketIo.on('mes', listenOnMessage);
            //监听系统消息
            socketIo.on('system_notice', listenSystemNotice);
        }
        //监听node端推送的登录踢出的信息
        socketIo.on('offline', listenOnOffline);
        //监听session过期的消息
        socketIo.on('sessionExpired', handleSessionExpired);
        //监听用户批量操作的消息
        socketIo.on('batchOperate', batch.batchOperateListener);
        //监听 disconnect
        socketIo.on('disconnect', disconnectListener);
        //监听拨打电话
        socketIo.on('phonemsg', phoneEventListener);
        //监听日程管理
        socketIo.on('scheduleAlertMsg', scheduleAlertListener);
        //监听后端消息
        phoneMsgEmitter.on(phoneMsgEmitter.SEND_PHONE_NUMBER, listPhoneNum);
        //如果接受到主动断开的方法，调用socket的断开
        socketEmitter.on(socketEmitter.DISCONNECT, socketEmitterListener);
        // 判断是否已启用桌面通知
        notificationCheckPermission();
    });
}
// 判断是否已启用桌面通知
function notificationCheckPermission() {
    if (window.Notification) {
        // Notification.permission granted 允许弹窗 default 默认状态需要通过主动事件触发
        // denied 禁止弹窗 需要在浏览器设置中修改设置
        if (Notification.permission !== 'granted') {
            // 如果用户设置启用桌面通知，浏览器没有启用，则提示用户是否启用桌面通知。
            Notification.requestPermission();
        }
    }
}
//获取未读数
function getNotificationUnread(queryObj, callback) {
    $.ajax({
        url: '/rest/notification/unread_num',
        type: 'get',
        dataType: 'json',
        timeout: 10 * 1000,
        data: queryObj,
        success: data => {
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
        error: () => {
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