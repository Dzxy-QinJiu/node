/**
 * Created by wangliping on 2016/6/22.
 */

require('./index.less');
var Modal = require('antd').Modal;
var batch = require('./batch');
var io = require('socket.io-client');
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后修改发送数据
var notificationEmitter = require('../../../public/sources/utils/emitters').notificationEmitter;
var notificationUtil = require('./notification');
var socketEmitter = require('../../../public/sources/utils/emitters').socketEmitter;
var phoneMsgEmitter = require('../../../public/sources/utils/emitters').phoneMsgEmitter;
let ajaxGlobal = require('../jquery.ajax.global');
var hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
import {SYSTEM_NOTICE_TYPE_MAP, SYSTEM_NOTICE_TYPES,APPLY_APPROVE_TYPES} from '../utils/consts';
import logoSrc from './notification.png';
import userData from '../user-data';
import Trace from 'LIB_DIR/trace';
import {storageUtil} from 'ant-utils';
import {handleCallOutResult} from 'PUB_DIR/sources/utils/common-data-util';
import {SELECT_TYPE} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {getClueUnhandledPrivilege, getUnhandledClueCountParams} from 'PUB_DIR/sources/utils/common-method-util';
const session = storageUtil.session;
var NotificationType = {};
var approveTipCount = 0;
let systemTipCount = 0;
let systemTimeout = null;//系统消息更新提示的setTimeout
let approveTimeout = null;//审批消息更新提示的setTimeout
const TIMEOUTDELAY = {
    closeTimeDelay: 5000,
    renderTimeDelay: 2000,
    phoneRenderDelay: 2000
};
import crmAjax from 'MOD_DIR/crm/public/ajax/index';
let callNumber = '', getCallNumErrMsg = '';//用户的坐席号
//当前正在拨打的联系人信息，从点击事件emitter出来
var contactNameObj = {};
//socketIo对象
var socketIo;
//推送过来新的消息后，将未读数加/减一
function updateUnreadByPushMessage(type, isAdd) {
    //将未读数加一
    if (Oplate && Oplate.unread) {
        if (Oplate.unread[type]) {
            //分配线索这里，会有批量分配的情况
            var count = _.isNumber(isAdd) ? isAdd : 1;
            if (isAdd) {
                Oplate.unread[type] += count;
            } else {
                Oplate.unread[type] -= count;
            }
        } else {
            Oplate.unread[type] = isAdd ? 1 : 0;
        }
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        //向展示的组件发送数据
        timeoutFunc = setTimeout(function() {
            //待审批数的刷新展示
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT);
            //刷新未读消息数
            // notificationEmitter.emit(notificationEmitter.UPDATE_NOTIFICATION_UNREAD);
            //刷新线索未处理的数量
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT);
            //刷新审批申请未处理的数量
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT);
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
            case 'apply':
                //有新的未处理的申请消息时,只修改待审批数，不用展示
                //申请审批列表弹出，有新数据，是否刷新数据的提示
                notificationEmitter.emit(notificationEmitter.APPLY_UPDATED, data);
                //将待审批数加一（true）
                updateUnreadByPushMessage('approve', true);
                break;
            case 'reply':
                //批复类型
                if (!userData.hasRole('realm_manager')) {
                    //批复类型的通知，不通知管理员
                    notifyReplyInfo(data);
                }
                notificationEmitter.emit(notificationEmitter.APPLY_UPDATED, data);
                //将审批后的申请消息未读数加一（true）
                // updateUnreadByPushMessage('apply', true);
                //待审批数减一
                updateUnreadByPushMessage('approve', false);
                break;
        }
    }
}
//todo 审批推送
//更新申请审批的数量
function applyApproveUnhandledListener(data) {
    if (_.isObject(data)) {
        if (data.message_type.indexOf(APPLY_APPROVE_TYPES.REPORT) !== -1 ){
            updateUnreadByPushMessage(APPLY_APPROVE_TYPES.UNHANDLEREPORTSEND, true);
        }
        switch (data.message_type) {
            case APPLY_APPROVE_TYPES.CUSTOMER_VISIT:
                updateUnreadByPushMessage(APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT, true);
                break;
            case APPLY_APPROVE_TYPES.BUSINESS_OPPORTUNITIES:
                updateUnreadByPushMessage(APPLY_APPROVE_TYPES.UNHANDLEBUSINESSOPPORTUNITIES, true);
                break;
            case APPLY_APPROVE_TYPES.PERSONAL_LEAVE:
                updateUnreadByPushMessage(APPLY_APPROVE_TYPES.UNHANDLEPERSONALLEAVE, true);
                break;
            case APPLY_APPROVE_TYPES.DOCUMENT:
                updateUnreadByPushMessage(APPLY_APPROVE_TYPES.UNHANDLEDOCUMENTWRITE, true);
                break;
        }
    }

}
//处理线索的数据
function clueUnhandledListener(data) {
    if (_.isObject(data)) {
        //只有管理员或者运营人员才处理
        if (getClueUnhandledPrivilege()){
            updateUnreadByPushMessage('unhandleClue', data.clue_list.length);
        }
        var clueArr = _.get(data, 'clue_list');
        var title = Intl.get('clue.has.distribute.clue','您有新的线索'),tipContent = '';
        if (canPopDesktop()) {
            _.each(clueArr, (clueItem) => {
                tipContent += clueItem.name + '\n';
            });
            //桌面通知的展示
            showDesktopNotification(title, tipContent, true);
        } else {//系统弹出通知
            var clueHtml = '',titleHtml = '';
            titleHtml += '<p class=\'clue-title\'>' + '<i class=\'iconfont icon-clue\'></i>' + '<span class=\'title-tip\'>' + title + '</span>';

            _.each(clueArr, (clueItem) => {
                clueHtml += '<p class=\'clue-item\' title=\'' + Intl.get('clue.click.show.clue.detail','点击查看线索详情') + '\' onclick=\'handleClickClueName(event, ' + JSON.stringify(clueItem.id) + ')\'>' + '<span class=\'clue-item-name\'>' + clueItem.name + '</span>' + '<span class=\'clue-detail\'>' + Intl.get('call.record.show.customer.detail', '查看详情') + '<i class=\'great-than\'>&gt;</i>' + '</span>' + '</p>';
            });
            tipContent = `<div>${clueHtml}</div>`;
            notificationUtil.showNotification({
                title: titleHtml,
                content: tipContent,
                closeWith: ['button']
            });
        }
    }
}

//监听系统消息
function listenSystemNotice(notice) {
    if (_.isObject(notice)) {
        systemTipCount++;//系统消息个数加一
        //申请消息列表弹出，有新数据，是否刷新数据的提示
        notificationEmitter.emit(notificationEmitter.SYSTEM_NOTICE_UPDATED, notice);
        let title = notice.type ? SYSTEM_NOTICE_TYPE_MAP[notice.type] : '';
        let tipContent = notice.customer_name;//xxx（客户）
        //是否是异地登录的类型
        let isOffsetLogin = (notice.type === SYSTEM_NOTICE_TYPES.OFFSITE_LOGIN && notice.content);
        //登录失败
        let isLoginFailed = notice.type === SYSTEM_NOTICE_TYPES.LOGIN_FAILED;
        //异地登录
        if (isOffsetLogin) {
            //在 xxx (地名)
            tipContent += Intl.get('notification.system.on', '在') + notice.content.current_location;
        }
        if (notice.user_name) {
            //用账号xxx
            tipContent += Intl.get('notification.system.use.account', '用账号') + notice.user_name;
        }
        if (notice.app_name) {
            //登录了 xxx (应用)
            tipContent += (isLoginFailed ? Intl.get('login.login', '登录') : Intl.get('notification.system.login', '登录了')) + notice.app_name;
        }
        if (isLoginFailed) {
            //密码或验证码错误等的详细错误信息
            tipContent += ' , ' + _.get(notice, 'content.operate_detail', Intl.get('login.username.password.error', '用户名或密码错误'));
        }
        //标签页不可见时，有桌面通知，并且允许弹出桌面通知时
        if (canPopDesktop()) {
            //停用客户登录的通知不自动关闭
            var isClosedByClick = false;
            if (notice.type === SYSTEM_NOTICE_TYPES.DISABLE_CUSTOMER_LOGIN) {
                isClosedByClick = true;
            }
            //桌面通知的展示
            showDesktopNotification(title, tipContent, isClosedByClick);
        } else {//系统弹出通知
            let notify = NotificationType['system'];
            //如果界面上没有提示框，就显示推送的具体内容
            if (!notify) {
                notify = notificationUtil.showNotification({
                    title: title,
                    content: tipContent,
                    closeWith: ['button'],
                    // timeout: TIMEOUTDELAY.closeTimeDelay,
                    callback: {
                        onClose: function() {
                            delete NotificationType['system'];
                            systemTipCount = 0;
                            if(systemTimeout){
                                clearTimeout(systemTimeout);
                            }
                        }
                    }
                });
                NotificationType['system'] = notify;
            } else {
                systemTimeout = setTimeout(() => {
                    //如果页面上存在提示框，只显示有多少条消息
                    let tipContent = '';
                    if (systemTipCount > 0) {
                        tipContent = tipContent + `<p>${Intl.get('notification.system.tip.count', '您有{systemTipCount}条系统消息', {systemTipCount: systemTipCount})}</p>`;
                        notificationUtil.updateText(notify, {
                            content: tipContent,
                        });
                    }
                }, TIMEOUTDELAY.renderTimeDelay);
            }
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
    notification.onerror = function() {
        notification.close();
    };
    notification.onclick = function() {
        //如果通知消息被点击,通知窗口将被激活
        window.focus();
        notification.close();
    },
    notification.onshow = function() {
        if (!isClosedByClick) {
            setTimeout(function() {
                notification.close();
            }, TIMEOUTDELAY.closeTimeDelay);
        }
    };
}
// 标签页是否可见（各种浏览器兼容）
function documentIsHidden() {
    return document.hidden || document.mozHidden || document.msHidden
        || document.webkitHidden;
}

//获取申请用户的名称
function getUserNames(replyMessage) {
    let userNames = '';
    if (replyMessage.user_name) {
        userNames = replyMessage.user_name;
    } else if (replyMessage.user_names) {
        userNames = JSON.parse(replyMessage.user_names);
        if (_.isArray(userNames)) {
            userNames = userNames.join(',');
        }
    }
    return userNames;
}
//获取审批消息提醒中的内容
function getReplyTipContent(data) {
    //审批的消息
    let tipContent = '';
    let approvalPerson = data.approval_person || '';//谁批复的
    let salesName = data.message.sales_name || '';//谁发的申请(销售)
    let customerName = data.message.customer_name || '';//给哪个客户开通的用户
    let userType = data.message.tag || '';//申请用户的类型：正式、试用用户
    let userNames = getUserNames(data.message);//申请用户的名称
    switch (data.approval_state) {
        case 'pass'://审批通过
            // xxx 通过了 xxx(销售) 给客户 xxx 申请的 正式/试用 用户 xxx，xxx
            tipContent = Intl.get('reply.pass.tip.content',
                '{approvalPerson} 通过了 {salesName} 给客户 {customerName} 申请的 {userType} 用户 {userNames}', {
                    approvalPerson: approvalPerson,
                    salesName: salesName,
                    customerName: customerName,
                    userType: userType,
                    userNames: userNames
                });
            break;
        case 'reject'://审批驳回
            //xxx 驳回了 xxx(销售) 给客户 xxx 申请的 正式/试用 用户 xxx，xxx
            tipContent = Intl.get('reply.reject.tip.content',
                '{approvalPerson} 驳回了 {salesName} 给客户 {customerName} 申请的 {userType} 用户 {userNames}', {
                    approvalPerson: approvalPerson,
                    salesName: salesName,
                    customerName: customerName,
                    userType: userType,
                    userNames: userNames
                });
            break;
        case 'cancel'://撤销申请
            //xxx撤销了 给客户 xxx 申请的 正式/试用 用户 xxx，xxx
            //只能销售自己撤销自己的申请，所以撤销时，不需要再加销售名称
            tipContent = Intl.get('reply.cancel.tip.content',
                '{approvalPerson} 撤销了给客户 {customerName} 申请的 {userType} 用户 {userNames}', {
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
        contactNameObj = data;
    }
}
// contactNameObj 是包含所拨打的联系人的信息对象
function setInitialPhoneObj() {
    contactNameObj = {};
}
/*
 * 监听拨打电话消息的推送*/
function phoneEventListener(phonemsgObj) {
    // sendMessage && sendMessage(JSON.stringify(phonemsgObj));
    //为了避免busy事件在两个不同的通话中错乱的问题，过滤掉推送过来的busy状态
    const PHONE_STATUS = ['ALERT', 'ANSWERED', 'phone', 'call_back'];
    //过滤掉其他状态 只展示alert answered  phone状态的数据
    if (hasPrivilege('CRM_LIST_CUSTOMERS') && PHONE_STATUS.indexOf(phonemsgObj.type) !== -1) {
        if (!phonemsgObj.customers) {
            phonemsgObj.customers = [];
        }
        //是否清空存储的联系人的处理
        if (contactNameObj && contactNameObj.contact) {
            //ALERT、ANSERED状态下电话在to上，phone、BYE状态下电话在dst上
            if (phonemsgObj.dst || phonemsgObj.to) {
                let phone = phonemsgObj.to || phonemsgObj.dst;
                //当前状态的电话跟存储的联系电话不是同一个电话时，
                if (!phone.includes(contactNameObj.phone) && !contactNameObj.phone.includes(phone)) {
                    // 清空存储的联系人、电话信息
                    setInitialPhoneObj();
                }
            } else {//dst和to都不存在时，说明不是从客套里打的电话
                // 清空存储的联系人电话信息
                setInitialPhoneObj();
            }
        }
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            call_params: {phonemsgObj, contactNameObj, setInitialPhoneObj}
        });
    }
}

//可否弹出桌面通知
function canPopDesktop() {
    //标签页不可见时，有桌面通知，并且允许弹出桌面通知时
    return documentIsHidden() && window.Notification && Notification.permission === 'granted';
}
//点击拨打电话
window.handleClickPhone = function(phoneObj) {
    //如果原来页面上有模态框，再拨打电话的时候把模态框关闭
    var $modal = $('#phone-status-content');
    if ($modal && $modal.length > 0) {
        phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_PHONE_MODAL);
    }
    var phoneNumber = phoneObj.phoneItem, contactName = phoneObj.contactName;
    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.noty-container .noty-content .phone-item .icon-phone-call-out'), '拨打电话');
    handleCallOutResult({
        errorMsg: getCallNumErrMsg,//获取坐席号失败的错误提示
        callNumber: callNumber,//坐席号
        contactName: contactName,//联系人姓名
        phoneNumber: phoneNumber//拨打的电话
    });
};
//点击展开线索详情
window.handleClickClueName = function(event,clueId) {
    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.noty-container .noty-content .clue-item .clue-name'), '打开线索详情');
    //展示线索详情
    notificationEmitter.emit(notificationEmitter.SHOW_CLUE_DETAIL,{clueId: clueId});
    //点击查看详情时要把对应的通知框关掉
    $(event.target).closest('li').remove();
};

// 获取拨打电话的座机号
function getUserPhoneNumber() {
    let member_id = userData.getUserData().user_id;
    crmAjax.getUserPhoneNumber(member_id).then((result) => {
        if (result.phone_order) {
            callNumber = result.phone_order;
        }
    }, (errMsg) => {
        getCallNumErrMsg = errMsg || Intl.get('crm.get.phone.failed', '获取座机号失败!');
    });
}
function scheduleAlertListener(scheduleAlertMsg) {
    var phoneArr = [];
    if (_.isArray(scheduleAlertMsg.contacts)) {
        _.each(scheduleAlertMsg.contacts, (item) => {
            if (_.isArray(item.phone) && item.phone.length) {
                _.each(item.phone, (phone) => {
                    phoneArr.push({customer_name: item.name, phone: phone, customer_id: item.customer_id});
                });
            }
        });
    }
    var title = Intl.get('customer.contact.somebody', '联系') + scheduleAlertMsg.customer_name;
    var tipContent = scheduleAlertMsg.content || '';
    if (canPopDesktop()) {
        tipContent = tipContent + '\n';
        _.each(phoneArr, (phoneItem) => {
            tipContent += phoneItem.customer_name + ' ' + phoneItem.phone;
        });
        //桌面通知的展示
        showDesktopNotification(title, tipContent, true);
    } else {//系统弹出通知
        var phoneHtml = '';
        //获取用户的坐席号
        getUserPhoneNumber();
        _.each(phoneArr, (phoneItem) => {
            var phoneObj = {
                phoneItem: phoneItem.phone,
                contactName: phoneItem.customer_name,
                customerId: phoneItem.customer_id
            };
            phoneHtml += '<p class=\'phone-item\'>' + '<i class=\'iconfont icon-phone-call-out\' title=\'' + Intl.get('crm.click.call.phone', '点击拨打电话') + '\' onclick=\'handleClickPhone(' + JSON.stringify(phoneObj) + ')\'></i>' + '<span class=\'customer-name\' title=\'' + phoneItem.customer_name + '\'>' + phoneItem.customer_name + '</span>' + ' ' + phoneItem.phone + '</p>';
        });
        tipContent = `<div>${tipContent}<p>${phoneHtml}</p></div>`;
        notificationUtil.showNotification({
            title: title,
            content: tipContent,
            closeWith: ['button']
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
            showDesktopNotification(Intl.get('user.apply.approve', '用户申请审批'), getReplyTipContent(data));
        } else {//系统弹出通知
            let notify = NotificationType['exist'];
            //如果界面上没有提示框，就显示推送的具体内容
            if (!notify) {
                //获取提醒提示框中的内容
                let tipContent = getReplyTipContent(data);
                notify = notificationUtil.showNotification({
                    title: Intl.get('user.apply.approve', '用户申请审批'),
                    content: tipContent,
                    closeWith: ['button'],
                    // timeout: TIMEOUTDELAY.closeTimeDelay,
                    callback: {
                        onClose: function() {
                            delete NotificationType['exist'];
                            approveTipCount = 0;
                            if(approveTimeout){
                                clearTimeout(approveTimeout);
                            }
                        }
                    }
                });
                NotificationType['exist'] = notify;
            } else {
                approveTimeout = setTimeout(() => {
                    //如果页面上存在提示框，只显示有多少条消息
                    let tipContent = '';
                    if (approveTipCount > 0) {
                        tipContent = tipContent + `<p>${Intl.get('user.apply.approve.count', '有{approveCount}条审批消息', {approveCount: approveTipCount})}</p>`;
                        notificationUtil.updateText(notify, {
                            content: tipContent
                        });
                    }
                }, TIMEOUTDELAY.renderTimeDelay);
            }
        }
    }
}
/**
 *回款提醒
 */
function notifyRepayInfo(data) {
    notificationUtil.showNotification({
        title: '回款提醒',
        content: data.topic,
        closeWith: ['button'],
        timeout: 5 * 1000
    });
}
/**
 *客户提醒
 */
function notifyCustomerInfo(data) {
    notificationUtil.showNotification({
        title: '客户提醒',
        content: data.topic,
        closeWith: ['button'],
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
        onOk: function() {
            window.location.href = '/logout';
        }
    });
    setTimeout(function() {
        //设置提示框的样式
        var $modal = $('body >.ant-modal-container');
        if ($modal && $modal.length > 0) {
            $modal.addClass('offline-modal-container');
        }
    }, 100);
    //解除 session失效提示的 事件绑定
    $(document).off('ajaxError');
}

/**
 * 获取重新登录的提示
 * @userObj 最新登录用户的信息
 */
function getReloginTooltip(userObj) {
    var tipMsg = '';
    if (userObj.country === '局域网') {
        //局域网内登录时，提示ip
        tipMsg = `您的账号在局域网内IP为${userObj.ip}的机器上登录，如非本人操作，建议您尽快修改密码！`;
    } else if (userObj.country === 'IANA' || !(userObj.country || userObj.province || userObj.city)) {
        tipMsg = '您的账号在另一地点登录，如非本人操作，建议您尽快修改密码！';
    } else {
        tipMsg = `您的账号在${userObj.country || ''} ${userObj.province || ''}${userObj.city || ''}登录，如非本人操作，建议您尽快修改密码！`;
    }
    return tipMsg;
}

//session过期后的处理
function handleSessionExpired() {
    ajaxGlobal.handleSessionExpired();
}
//断开连接时，移出Emitter监听器
function socketEmitterListener() {
    if (socketIo) {
        socketIo.disconnect();
    }
}
//socketio断开连接处理器
function disconnectListener() {
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
        socketIo.off('apply_unread_reply', applyUnreadReplyListener);
        socketIo.off('cluemsg', clueUnhandledListener);
        socketIo.off('applyApprovemsg', applyApproveUnhandledListener);
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
    socketIo.on('connect', function() {
        // 获取消息数后添加监听
        getMessageCount(unreadListener);
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
/**
 * 获取消息数
 * @param callback 获取消息数后的回调函数
 */
function getMessageCount(callback) {
    //待审批数、及未读数的权限（未读数的除了暂时不需要了所以先注释掉没用的权限判断，以防后期再用先不删）
    // if (hasPrivilege('NOTIFICATION_APPLYFOR_LIST') || hasPrivilege('APP_USER_APPLY_LIST')) {
    //     let type = '';
    //     if (userData.hasRole('salesmanager')) {
    //         //只获取未读数，舆情秘书不展示待审批的申请
    //         type = 'unread';
    //     } else {
    //         if (hasPrivilege('NOTIFICATION_APPLYFOR_LIST') && hasPrivilege('APP_USER_APPLY_LIST')) {
    //             //获取未读数和未审批数
    //             type = 'all';
    //         } else
    //             if (hasPrivilege('APP_USER_APPLY_LIST')) {
    //             //只获取待审批数
    //             type = 'unapproved';
    //         } else if (hasPrivilege('NOTIFICATION_APPLYFOR_LIST')) {
    //             //只获取未读数
    //             type = 'unread';
    //         }
    //     }
    //     //获取消息未读数
    //     getNotificationUnread({type: type}, callback);
    // } else {
    //     typeof callback === 'function' && callback();
    // }
    //获取待审批数
    if(hasPrivilege('APP_USER_APPLY_LIST')){
        getNotificationUnread({type: 'unapproved'}, callback);
    }
    //获取待我审批的申请数
    if (hasPrivilege('GET_MY_WORKFLOW_LIST')){
        getUnapproveBussinessTripApply(callback);//获取出差申请待我审批数量
        getUnapproveSalesOpportunityApply();//获取销售机会待我审批数量
        getUnapproveLeaveApply();//获取请假申请待我审批数量
        getUnapproveReportSendApply();//获取舆情报送和文件审批的待我审批数量
    }
    //获取线索未处理数的权限（除运营人员外展示）
    if (getClueUnhandledPrivilege()){
        var data = getUnhandledClueCountParams();
        getClueUnreadNum(data, callback);
    }else{
        //运营人员和普通销售即使没有获取未读数的权限，但是在有分配给他的线索的时候，他也要收到弹窗
        callback('unhandleClue');
    }
    //获取未读回复列表
    if(hasPrivilege('GET_MEMBER_APPLY_LIST')){
        getUnreadReplyList(callback);
    }
}

//添加未读数的监听，包括申请审批，系统消息等
function unreadListener(type) {
    if (socketIo) {
        //如果是未处理的线索，要和审批的区分开，避免会加上两个监听的情况，未读数要在发ajax请求后再进行监听，避免出现监听数据比获取的数据早的情况
        if (type === 'unhandleClue'){
            //监听未处理的线索
            socketIo.on('cluemsg', clueUnhandledListener);
        } else if (type === 'unread_reply') {
            //申请审批未读回复的监听
            socketIo.on('apply_unread_reply', applyUnreadReplyListener);
        }else if(type === APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT){
            //申请审批未读回复的监听
            socketIo.on('applyApprovemsg', applyApproveUnhandledListener);
        }else {
            //获取完未读数后，监听node端推送的弹窗消息
            socketIo.on('mes', listenOnMessage);
            //监听系统消息
            socketIo.on('system_notice', listenSystemNotice);
        }
    }
}
//申请审批未读回复的监听
function applyUnreadReplyListener(unreadReply) {
    const APPLY_UNREAD_REPLY = 'apply_unread_reply';
    //将未读回复列表分用户存入sessionStorage（session失效时会自动清空数据）
    let unreadReplyList = session.get(APPLY_UNREAD_REPLY);
    if(unreadReplyList){
        unreadReplyList = JSON.parse(unreadReplyList);
        //已有回复列表，将新得回复加入回复列表中
        if (_.get(unreadReplyList, '[0]')) {
            unreadReplyList.push(unreadReply);
            //根据申请id去重
            unreadReplyList = _.uniqBy(unreadReplyList,'apply_id');
        } else {//还没有回复列表时，将新回复组成回复列表
            unreadReplyList = [unreadReply];
        }
        session.set(APPLY_UNREAD_REPLY, JSON.stringify(unreadReplyList));
        notificationEmitter.emit(notificationEmitter.APPLY_UNREAD_REPLY, unreadReplyList);
    }
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
            _.each(['apply', 'customer', 'system', 'approve'], function(key) {
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
            if (typeof callback === 'function') {
                callback();
            }
        },
        error: () => {
            if (typeof callback === 'function') {
                callback();
            }
        }
    });
}
//获取未处理的线索数量
function getClueUnreadNum(data, callback){
    //pageSize设置为0，只取到数据就行
    var type = 'user';
    if (hasPrivilege('CUSTOMERCLUE_QUERY_FULLTEXT_MANAGER')){
        type = 'manager';
    }
    $.ajax({
        url: '/rest/get/clue/fulltext/0/source_time/descend/' + type,
        dataType: 'json',
        type: 'post',
        data: data,
        success: data => {
            var messages = {
                'unhandleClue': 0
            };
            var value = data.total;
            if (typeof value === 'number' && value > 0) {
                messages['unhandleClue'] = value;
            } else if (typeof value === 'string') {
                var num = parseInt(value);
                if (!isNaN(num) && num > 0) {
                    messages['unhandleClue'] = num;
                }
            }
            //更新全局中存的未处理的线索数
            updateGlobalUnreadStorage(messages);
            if (typeof callback === 'function') {
                callback('unhandleClue');
            }
        },
        error: () => {
            if (typeof callback === 'function') {
                callback('unhandleClue');
            }
        }
    });
}
function setMessageValue(applyType,data) {
    var messages = {
    };
    messages[applyType] = 0;
    var value = _.get(data, 'total');
    if (typeof value === 'number' && value > 0) {
        messages[applyType] = value;
    } else if (typeof value === 'string') {
        var num = parseInt(value);
        if (!isNaN(num) && num > 0) {
            messages[applyType] = num;
        }
    }
    //更新全局中存的未处理的线索数
    updateGlobalUnreadStorage(messages);
}
//获取待我审批的出差申请
function getUnapproveBussinessTripApply(callback) {
    $.ajax({
        url: '/rest/get/worklist/business_apply/list',
        dataType: 'json',
        type: 'get',
        success: function(data) {
            setMessageValue(APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT,data);
            if (typeof callback === 'function') {
                callback(APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT);
            }
        },
        error: function(errorMsg) {
            if (typeof callback === 'function') {
                callback(APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT);
            }
        }
    });
}
//获取待我审批的销售机会申请
function getUnapproveSalesOpportunityApply() {
    var queryObj = {type: APPLY_APPROVE_TYPES.BUSINESSOPPORTUNITIES};
    $.ajax({
        url: '/rest/get/worklist/sales_opportunity_apply/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            setMessageValue(APPLY_APPROVE_TYPES.UNHANDLEBUSINESSOPPORTUNITIES,data);
        },
        error: function(errorMsg) {
        }
    });
}
//获取待我审批的请假申请
function getUnapproveLeaveApply() {
    var queryObj = {type: APPLY_APPROVE_TYPES.LEAVE};
    $.ajax({
        url: '/rest/get/worklist/apply_approve/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            setMessageValue(APPLY_APPROVE_TYPES.UNHANDLEPERSONALLEAVE,data);
        },
        error: function(errorMsg) {

        }
    });
}
//获取待我审批的舆情报告和文件撰写申请
function getUnapproveReportSendApply() {
    var queryObj = {type: APPLY_APPROVE_TYPES.OPINIONREPORT};
    $.ajax({
        url: '/rest/get/worklist/apply_approve/list',
        dataType: 'json',
        type: 'get',
        data: queryObj,
        success: function(data) {
            //获取的是两类的待我审批列表需要对数字区分一下
            var reportData = {total: 0},documentData = {total: 0};
            if (_.isArray(data.list) && data.list.length){
                _.forEach(data.list,(item) => {
                    if (item.workflow_type.indexOf(APPLY_APPROVE_TYPES.REPORT) !== -1){
                        reportData.total++;
                    }
                    if (item.workflow_type.indexOf(APPLY_APPROVE_TYPES.DOCUMENT) !== -1){
                        documentData.total++;
                    }
                });
            }
            setMessageValue(APPLY_APPROVE_TYPES.UNHANDLEREPORTSEND,reportData);
            setMessageValue(APPLY_APPROVE_TYPES.UNHANDLEDOCUMENTWRITE,documentData);
        },
        error: function(errorMsg) {

        }
    });
}


//存储获取的未读回复列表
function saveUnreadReplyList(applyUnreadReplyList) {
    const APPLY_UNREAD_REPLY = 'apply_unread_reply';
    //根据申请的id去重
    let unreadReplyList = _.uniqBy(applyUnreadReplyList, 'apply_id');
    //将未读回复列表存入sessionStorage（session失效时会自动清空数据）
    session.set(APPLY_UNREAD_REPLY, JSON.stringify(unreadReplyList));
    notificationEmitter.emit(notificationEmitter.APPLY_UNREAD_REPLY, unreadReplyList);
}
//获取未读回复列表
function getUnreadReplyList(callback) {
    $.ajax({
        url: '/rest/appuser/unread_reply',
        type: 'get',
        dataType: 'json',
        data: {
            sort_field: 'create_time',//按回复时间倒序排
            order: 'descend',
            page_size: 1000,//需要获取全部的未读回复列表，预估不会超过1000条
            id: ''
        },
        success: data => {
            //将获取的未读回复列表存到session中
            saveUnreadReplyList(_.get(data, 'list', []));
            if (typeof callback === 'function') {
                callback('unread_reply');
            }
        },
        error: () => {
            if (typeof callback === 'function') {
                callback('unread_reply');
            }
        }
    });
}
//更新全局变量里存储的未读数，以便在业务逻辑里使用
function updateGlobalUnreadStorage(unreadObj) {
    if (Oplate && Oplate.unread && unreadObj) {
        for (var key in unreadObj){
            Oplate.unread[key] = unreadObj[key];
        }
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        //向展示的组件发送数据
        timeoutFunc = setTimeout(function() {
            //更新未读消息数
            // notificationEmitter.emit(notificationEmitter.UPDATE_NOTIFICATION_UNREAD);
            //待审批数的刷新展示
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT);
            //未处理的线索数量刷新展示
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT);
            //刷新审批申请未处理的数量
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT);
        }, timeout);
    }
}
module.exports.startSocketIo = startSocketIo;
