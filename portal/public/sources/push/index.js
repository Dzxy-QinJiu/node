import salesmanAjax from 'MOD_DIR/common/public/ajax/salesman';

/**
 * Created by wangliping on 2016/6/22.
 */

require('./index.less');
import {Modal, Icon} from 'antd';
var batch = require('./batch');
var io = require('socket.io-client');
var timeoutFunc;//定时方法
var timeout = 1000;//1秒后修改发送数据
var notificationEmitter = require('../../../public/sources/utils/emitters').notificationEmitter;
var notificationUtil = require('./notification');
var socketEmitter = require('../../../public/sources/utils/emitters').socketEmitter;
var phoneMsgEmitter = require('../../../public/sources/utils/emitters').phoneMsgEmitter;
var phoneEmitter = require('../../../public/sources/utils/emitters').phoneEmitter;
var clueEmitter = require('../../../public/sources/utils/emitters').clueEmitter;
var userDetailEmitter = require('../../../public/sources/utils/emitters').userDetailEmitter;
let ajaxGlobal = require('../jquery.ajax.global');
var hasPrivilege = require('../../../components/privilege/checker').hasPrivilege;
import {
    SYSTEM_NOTICE_TYPE_MAP,
    KETAO_SYSTEM_NOTICE_TYPE_MAP,
    SYSTEM_NOTICE_TYPES,
    APPLY_APPROVE_TYPES,
    DIFF_APPLY_TYPE_UNREAD_REPLY,
    CALL_TYPES,
    CLUE_HIDE_NOTICE_TYPE,
} from '../utils/consts';
import logoSrc from './notification.png';
import userData from '../user-data';
import Trace from 'LIB_DIR/trace';
import {storageUtil} from 'ant-utils';
import {handleCallOutResult} from 'PUB_DIR/sources/utils/common-data-util';
import {
    getClueUnhandledPrivilege,
    getUnhandledClueCountParams,
    isKetaoOrganizaion,
    substractUnapprovedCount
} from 'PUB_DIR/sources/utils/common-method-util';

const session = storageUtil.session;
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
import commonPrivilegeConst from 'MOD_DIR/common/public/privilege-const';
import {getTimeStr} from 'PUB_DIR/sources/utils/common-method-util';
import phoneUtil from '../utils/phone-util';

// 获取弹窗通知的状态
function getNotifyStatus() {
    const websiteConfig = JSON.parse(storageUtil.local.get('websiteConfig'));
    return _.get(websiteConfig, 'is_open_pop_up_notify', true);
}

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
//当前正在拨打的联系人信息，从点击事件emitter出来
var contactNameObj = {};
//socketIo对象
var socketIo;
var hasAddCloseBtn = false;
import history from 'PUB_DIR/sources/history';
import {getWorklistApplyList} from 'PUB_DIR/sources/utils/apply-common-data-utils';

var clueTotalCount = 0;
const CLUE_MAX_NUM = 3;//最多展示线索通知框的个数
//推送过来新的消息后，将未读数加/减一
function updateUnreadByPushMessage(type, isAdd, isAddLists) {
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
        //待我处理的线索，会在后端推送总的待我处理的线索数量及所处理的具体的线索
        if(type === 'unhandleClue' && !_.isEmpty(isAdd)){
            //把待我处理的线索的数量更新一下
            Oplate.unread['unhandleClue'] = _.get(isAdd,'pending_num',0);
        }
        //如果是待我审批的申请
        if (type === 'unhandleApply' && _.isArray(isAddLists) && _.isArray(_.get(Oplate, 'unread.unhandleApplyList'))) {
            Oplate.unread['unhandleApplyList'] = _.concat(Oplate.unread['unhandleApplyList'], isAddLists);
        }
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        //向展示的组件发送数据
        timeoutFunc = setTimeout(function() {
            //刷新未读消息数
            // notificationEmitter.emit(notificationEmitter.UPDATE_NOTIFICATION_UNREAD);
            //刷新线索未处理的数量
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT);
            //刷新审批申请未处理的数量
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT);
        }, timeout);
    }
}
window.closeAllNoty = function() {
    clueTotalCount = 0;
    hasAddCloseBtn = false;
    $('#noty-quene-tip-container').remove();
    $.noty.closeAll();
};
//打开线索列表，同时将新分配的线索加上new的标识
window.openAllClues = function() {
    history.push('/leads', {refreshClueList: true});
};

//是自己提取的线索或者是自己添加的线索
function isExtractOrAddByMe(data) {
    //如果是推荐线索提取的类型或者是线索池提取的类型
    const extractType = _.includes(CLUE_HIDE_NOTICE_TYPE, _.get(data, 'type'));
    //并且是登录人操作的
    const isOperatedByMe = _.get(data, 'operator_id', '') === userData.getUserData().user_id;
    return extractType && isOperatedByMe;
}

//处理线索的数据
function clueUnhandledListener(data) {
    let isOpenPopUpNotify = getNotifyStatus();
    if (_.isObject(data)) {
        if (getClueUnhandledPrivilege()) {
            var clueList = _.get(data, 'clue_list', []);
            updateUnreadByPushMessage('unhandleClue', data);
            notificationEmitter.emit(notificationEmitter.UPDATED_MY_HANDLE_CLUE, data);
        }
        //线索是转入还是转出 IN 转入  OUT 转出
        var clueIn = _.get(data,'number_change_direction') === 'IN';
        if(clueIn){
            notificationEmitter.emit(notificationEmitter.UPDATED_HANDLE_CLUE, data);
            //线索面板刷新提示
            notificationEmitter.emit(notificationEmitter.UPDATE_CLUE, data, isExtractOrAddByMe(data));
        }
        //不是自己提取的线索，且是转入线索的时候才展示右边的弹窗
        if(!isExtractOrAddByMe(data) && clueIn){
            var clueArr = _.get(data, 'clue_list',[]);
            var title = Intl.get('clue.has.distribute.clue','您有新的线索'),tipContent = '';
            if (canPopDesktop()) {
                _.each(clueArr, (clueItem) => {
                    tipContent += _.get(clueItem, 'name','') + '\n';
                });
                //桌面通知的展示
                showDesktopNotification(title, tipContent, true, isOpenPopUpNotify);
            } else {//系统弹出通知
                if (!isOpenPopUpNotify) {
                    return;
                }
                clueTotalCount++;
                var clueHtml = '', titleHtml = '';
                titleHtml += '<p class="clue-title">' + '<span class="title-tip">' + title + '</span>';
                _.each(clueArr, (clueItem) => {
                    clueHtml +=
                        '<p class="clue-item" title=\'' + Intl.get('clue.click.show.clue.detail', '点击查看线索详情') + '\' onclick=\'handleClickClueName(event, ' + JSON.stringify(_.get(clueItem, 'id', '')) + ')\'>' +
                        '<span class=\'clue-item-name\'>' + _.get(clueItem, 'name', '') + '</span>' +
                        '<span class=\'clue-detail\'>' +
                        Intl.get('call.record.show.customer.detail', '查看详情') +
                        '<i class=\'great-than\'>&gt;</i>' +
                        '</span>' +
                        '</p>';
                });
                tipContent = `<div>${clueHtml}</div>`;
                var largerText = 0;
                notificationUtil.showNotification({
                    title: titleHtml,
                    content: tipContent,
                    type: 'clue',
                    closeWith: ['button'],
                    maxVisible: CLUE_MAX_NUM,//最多展示几个线索的提醒
                    callback: { // 关闭的时候
                        onClose: () => {
                            //关闭之后，队列中还有几个未展示的提醒
                            clueTotalCount > 0 && clueTotalCount--;
                            var addtionClueCount = clueTotalCount - CLUE_MAX_NUM;//还未展示的线索提醒的数量
                            if (addtionClueCount === 0) {
                                hasAddCloseBtn = false;
                                $('#noty-quene-tip-container').remove();
                            } else if (addtionClueCount > 0 && hasAddCloseBtn) {
                                var queueNum = $('#queue-num');
                                if (queueNum) {
                                    queueNum.text(addtionClueCount);
                                }
                            }
                        }
                    },
                });

            }
            //如果总共的数量超过3个，就需要展示关闭所有的按钮
            //最好不要用noty的 queue的length来展示，因为如果有其他类型的，这个计数也许不准
            var showNum = clueTotalCount - CLUE_MAX_NUM;
            if (showNum > 0) {
                var ulHtml = $('#noty_topRight_layout_container');
                if (!hasAddCloseBtn) {
                    hasAddCloseBtn = true;
                    ulHtml.before(`<p id="noty-quene-tip-container">
            <span class="iconfont icon-warn-icon"></span>
${Intl.get('clue.show.no.show.tip', '还有{num}个新线索未展示 ', {num: `<span id="queue-num">${showNum}</span>`})}<a href="#" class="handle-btn-item" onclick='openAllClues()'>
${Intl.get('clue.customer.noty.all.list', '查看全部')}</a><a href="#" class="handle-btn-item" onclick='closeAllNoty()'>
${Intl.get('clue.close.all.noty', '关闭全部')}</a></p>`);
                } else {
                    var queueNum = $('#queue-num');
                    if (queueNum) {
                        queueNum.text(showNum);
                    }
                }
            }
        }
    }

}
// /**
//  * 监听弹出消息。
//  * @param data
//  */
function listenOnMessage(data) {
    if (_.isObject(data)) {
        notifyApplyInfo(data);
    }
}

//待我审批的申请推送
function applyApproveUnhandledListener(data) {
    if (_.isObject(data)) {
        var applyList = _.get(data, 'apply_list', []);
        updateUnreadByPushMessage(APPLY_APPROVE_TYPES.UNHANDLEAPPLY, applyList.length, applyList);
        notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_TIP, data);
    }
}
//我的一条待我审批被其他人审批了的推送
function applyApproveApprovedByOtherListener(data) {
    if(_.isArray(data.apply_list)){
        _.each(data.apply_list,item => {
            substractUnapprovedCount(item.id);
        });
    }
}
//处理释放客户的数据
function crmReleaseListener(data) {
    let isOpenPopUpNotify = getNotifyStatus();
    if (_.isObject(data)) {
        var crmReleaseLength = _.get(data, 'customer_ids.length', 0);
        var title = Intl.get('crm.customer.release.customer', '释放客户'),
            tipContent = Intl.get('crm.customer.release.push.tip', '客户{customerName}被{operatorName}释放到了客户池', {
                customerName: _.get(data, 'customer_name', ''),
                operatorName: _.get(data, 'operator_nickname', '')
            });
        if (crmReleaseLength > 1) {
            tipContent = Intl.get('crm.customer.batch.release.push.tip', '{customerName}等{count}个客户被{operatorName}释放到了客户池', {
                customerName: _.get(data, 'customer_name', ''),
                operatorName: _.get(data, 'operator_nickname', ''),
                count: crmReleaseLength
            });
        }
        if (canPopDesktop()) {
            //桌面通知的展示
            showDesktopNotification(title, tipContent, true, isOpenPopUpNotify);
        } else {//系统弹出通知
            if (!isOpenPopUpNotify) {
                return;
            }
            var contentHtml = '';
            var titleHtml = '<p class=\'customer-title\'>' + '<span class=\'title-tip\'>' + title + '</span>';
            contentHtml = `<div class=\'customer-item\'>${tipContent}</div>`;
            notificationUtil.showNotification({
                title: titleHtml,
                type: 'release',
                content: contentHtml,
                closeWith: ['button']
            });
        }
    }
}

//监听系统消息
function listenSystemNotice(notice) {
    let isOpenPopUpNotify = getNotifyStatus();
    if (_.isObject(notice)) {
        systemTipCount++;//系统消息个数加一
        //申请消息列表弹出，有新数据，是否刷新数据的提示
        notificationEmitter.emit(notificationEmitter.SYSTEM_NOTICE_UPDATED, notice);
        let filterType = SYSTEM_NOTICE_TYPE_MAP;
        // 判断是否是客套组织，是客套的话，才会有拨打电话失败和提取线索失败的
        if (isKetaoOrganizaion()) {
            filterType = KETAO_SYSTEM_NOTICE_TYPE_MAP;
        }
        let title = notice.type ? filterType[notice.type] : '';
        let tipContent = notice.customer_name;//xxx（客户）
        //是否是异地登录的类型
        let isOffsetLogin = (notice.type === SYSTEM_NOTICE_TYPES.OFFSITE_LOGIN && notice.content);
        //登录失败
        let isLoginFailed = notice.type === SYSTEM_NOTICE_TYPES.LOGIN_FAILED;
        // 是否事拨打电话失败
        let isCallUpFailed = notice.type === SYSTEM_NOTICE_TYPES.CALL_UP_FAIL;
        // 是否事提取线索失败
        let isPullClueFailed = notice.type === SYSTEM_NOTICE_TYPES.PULL_CLUE_FAIL;

        //异地登录
        if (isOffsetLogin) {
            //在 xxx (地名)
            tipContent += Intl.get('notification.system.on', '在') + notice.content.current_location;
        }
        if (notice.user_name) {
            if (isOffsetLogin) {
                //用账号xxx
                tipContent += Intl.get('notification.system.use.account', '用账号') + notice.user_name;
            } else {
                //的账号xxx
                tipContent = Intl.get('notification.system.who.account', '{who}的账号', {who: tipContent}) + notice.user_name;
            }
            // 提取线索失败
            if (isPullClueFailed) {
                tipContent += Intl.get('notification.extract.clue.failed', '提取线索失败');
            }
        }
        // 登录的应用名称
        if (notice.app_name) {
            //登录了 xxx (应用)
            tipContent += (isLoginFailed ? Intl.get('login.login', '登录') : Intl.get('notification.system.login', '登录了')) + notice.app_name;
        }
        if (isLoginFailed) {
            //密码或验证码错误等的详细错误信息
            tipContent += ' , ' + _.get(notice, 'content.operate_detail', Intl.get('login.username.password.error', '用户名或密码错误'));
        }

        // 拨打电话失败
        if (isCallUpFailed) {
            tipContent += _.get(notice, 'content.operate_detail', Intl.get('notification.call.up.failed', '拨打电话失败'));
        }
        // 提取线索失败
        if (isPullClueFailed) {
            let failedTips = _.get(notice, 'content.operate_detail');
            if (failedTips) {
                tipContent += `，${Intl.get('notification.extract.clue.failed.because', '原因')}：${failedTips}`;
            }
        }
        //标签页不可见时，有桌面通知，并且允许弹出桌面通知时
        if (canPopDesktop()) {
            //停用客户登录的通知不自动关闭
            var isClosedByClick = false;
            if (notice.type === SYSTEM_NOTICE_TYPES.DISABLE_CUSTOMER_LOGIN) {
                isClosedByClick = true;
            }
            //桌面通知的展示
            showDesktopNotification(title, tipContent, isClosedByClick, isOpenPopUpNotify);
        } else {//系统弹出通知
            if (!isOpenPopUpNotify) {
                return;
            }
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
                            if (systemTimeout) {
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
                        tipContent = tipContent + `<p class='notice-system'  onclick='handleClickNoticeStystem(event)'>${Intl.get('notification.system.tip.count', '您有{systemTipCount}条系统消息', {systemTipCount: systemTipCount})}</p>`;
                        notificationUtil.updateText(notify, {
                            content: tipContent,
                        });
                    }
                }, TIMEOUTDELAY.renderTimeDelay);
            }
        }
    }
}

// 点击查看系统通知详情
window.handleClickNoticeStystem = function(event) {
    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.noty-container .noty-content .notice-system'), '打开系统通知');
    notificationEmitter.emit(notificationEmitter.CLICK_SYSTEM_NOTICE, systemTipCount);
    //点击查看详情时要把对应的通知框关掉
    $(event.target).closest('li').remove();
};

//桌面通知的展示
function showDesktopNotification(title, tipContent, isClosedByClick, isOpenPopUpNotify) {
    // 若弹窗通知关闭，则不显示通知
    if (!isOpenPopUpNotify) {
        return;
    }
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
    };
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
    let userNames = replyMessage.user_names || replyMessage.user_name || '';
    if (_.isArray(userNames)) {
        userNames = userNames.join(',');
    }
    return userNames;
}

//获取审批消息提醒中的内容
function getApproveTipContent(data) {
    //审批的消息
    let tipContent = '';
    let approvalPerson = data.operate || '';//谁批复的
    let salesName = data.applicant_name || '';//谁发的申请(销售)
    let customerName = data.customer_name || '';//给哪个客户开通的用户
    let userType = data.user_apply_name || '';//申请用户的类型：正式、试用用户
    let userNames = getUserNames(data);//申请用户的名称
    switch (data.opinion) {
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
        case 'false'://抄送申请
            //xxx给客户 xxx 申请了 正式/试用 用户 xxx，xxx
            tipContent = Intl.get('notification.apply.for.customer', '{producer_name}给客户{customer}申请了{userType}{userBlock}', {
                producer_name: salesName,
                customer: customerName,
                userType: userType,
                userBlock: userNames
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
    const PHONE_STATUS = [CALL_TYPES.ALERT, CALL_TYPES.ANSWERED, CALL_TYPES.phone, CALL_TYPES.curtao_phone, CALL_TYPES.call_back];
    //过滤掉其他状态 只展示ALERT、ANSWERED、 phone、curtao_phone、call_back状态的数据
    if ((hasPrivilege(crmPrivilegeConst.CRM_LIST_CUSTOMERS) || hasPrivilege(crmPrivilegeConst.CUSTOMER_ALL)) && PHONE_STATUS.indexOf(phonemsgObj.type) !== -1) {
        if ([CALL_TYPES.phone, CALL_TYPES.curtao_phone, CALL_TYPES.call_back].indexOf(phonemsgObj.type) !== -1) {
            //通话结束后，可以继续拨打电话了
            Oplate.isCalling = false;
            phoneEmitter.emit(phoneEmitter.CALL_FINISHED);
        }
        //如果原来有线索或者客户打电话的面板，判断一下推过来的数据的callId和原来的是不是一样，如果一样就更新原来的电话状态
        var cluePhonePanelShow = _.get($('#clue_phone_panel_wrap'), 'length');
        if ((cluePhonePanelShow && _.get(phonemsgObj, 'leads[0]')) || (!_.get(phonemsgObj, 'customers[0]') && _.get(phonemsgObj, 'leads[0]'))) {
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
                call_params: {phonemsgObj, contactNameObj, setInitialPhoneObj},
            });
        } else {
            //是否清空存储的联系人的处理
            if (contactNameObj && contactNameObj.contact) {
                //ALERT、ANSERED状态下电话在to上，phone、BYE状态下电话在dst上
                if (phonemsgObj.dst || phonemsgObj.to) {
                    let phone = phonemsgObj.to || phonemsgObj.dst;
                    //当前状态的电话跟存储的联系电话不是同一个电话时，
                    if (!_.includes(phone, contactNameObj.phone) && !_.includes(contactNameObj.phone, phone)) {
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
}

/*
 * 监听客户操作消息的推送*/
function crmOperatorAlertListener(data) {
    if (_.isObject(data)) {
        switch (_.get(data, 'type')) {
            //释放客户后的提醒消息
            case 'release_notice'://单个释放时，通知客户负责人以及所属领导
            case 'batch_release_notice'://批量释放时，通知客户负责人以及所属领导
            case 'need_extract':// 释放客户时给联合跟进人用的，因为不能分辨单个还是批量释放，所以用这一个类型
                crmReleaseListener(data);
                break;
            default:
                break;
        }
    }
}

//申请试用弹窗
function applyUpgradeListener(data) {
    let isOpenPopUpNotify = getNotifyStatus();
    if (_.isObject(data)) {
        const title = Intl.get('versions.apply.try.enterprise', '申请企业试用');
        const lead = _.get(data, 'lead.name', '');
        const user = _.get(data, 'lead.app_user_info[0].name', '');
        const version = _.get(data, 'version_change_info.new_version', '');
        const tipContent = time + ' ，' + Intl.get('common.lead.apply.try', '用户{user}（线索：{lead}）申请试用', {
            user: userLink,
            lead: leadLink
        }) + version;
        if (canPopDesktop()) {
            //桌面通知的展示（只能展示提示内容，无法添加自定义的点击事件）
            let tipContent = time + ' ，' + Intl.get('common.lead.apply.try','用户{user}（线索：{lead}）申请试用',{user, lead}) + version;
            showDesktopNotification(title, tipContent, true, isOpenPopUpNotify);
        } else {
            if (!isOpenPopUpNotify) {
                return;
            }
            // 系统弹窗提示中，添加点击可打开对应详情的事件
            const userLink = '<a href="javascript:void(0)" onclick="handleUserClickCallback(\'' + _.get(data, 'lead.app_user_info[0].id', '') + '\')">' + user + '</a>';
            const leadLink = '<a href="javascript:void(0)" onclick="handleLeadClickCallback(\'' + _.get(data, 'lead.id', '') + '\')">' + lead + '</a>';
            let tipContent = time + ' ，' + Intl.get('common.lead.apply.try','用户{user}（线索：{lead}）申请试用',{user: userLink,lead: leadLink}) + version;
            notificationUtil.showNotification({
                title: title,
                content: tipContent,
                closeWith: ['button']
            });
        }
        clueEmitter.emit(clueEmitter.UPDATE_APPLY_UPGRADE, data);
    }
}

//升级完成弹窗
function applyUpgradeCompleteListener(data) {
    let isOpenPopUpNotify = getNotifyStatus();
    if (_.isObject(data) && _.get(data.version_change_info, 'upgrade_type') === 'trade') {
        const title = Intl.get('payment.personal.upgrade.notice', '个人用户升级');
        const lead = _.get(data, 'lead.name', '');
        const user = _.get(data, 'lead.app_user_info[0].name', '');
        const time = getTimeStr(_.get(data.version_change_info, 'apply_time'), oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
        const tipContent = time + ' ，' + Intl.get('payment.personal.upgrade', '用户{user}（线索{lead}）付费升级为个人正式用户', {
            lead,
            user
        });
        if (canPopDesktop()) {
            //桌面通知的展示
            showDesktopNotification(title, tipContent, true, isOpenPopUpNotify);
        } else {
            if (!isOpenPopUpNotify) {
                return;
            }
            notificationUtil.showNotification({
                title: title,
                content: tipContent,
                closeWith: ['button']
            });
        }
    }
}

//用户名可点击
window.handleUserClickCallback = function(user_id) {
    userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, {
        userId: user_id
    });
};
//线索名可点击
window.handleLeadClickCallback = function(lead_id) {
    phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
        clue_params: {
            currentId: lead_id,
        }
    });
};

//客户名称可点击
window.handleVisitCallback = function(customer_id) {
    phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
        customer_params: {
            currentId: customer_id
        }
    });
};

//监听将销售的拜访结果推送给邮件抄送人
function applyVisitCustomerListener(obj) {
    let isOpenPopUpNotify = getNotifyStatus();
    if (_.isObject(obj)) {
        const title = Intl.get('leave-feedback-title', '出差反馈');
        const nickname = _.get(obj, 'nickname');
        const customer_name = _.get(obj, 'customer_name');
        const remark = _.get(obj, 'remark');
        const customer_id = _.get(obj, 'customer_id');
        const create_time = getTimeStr(_.get(obj, 'create_time'), oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);

        if (canPopDesktop()) {
            //桌面通知的显示
            const content1 = nickname + Intl.get('leave-feedback-visit-consumer', '拜访了') + customer_name;
            const content2 = Intl.get('leave-feedback-visit-record', '拜访记录：') + remark + create_time;
            showDesktopNotification(title, content1 + content2, true, isOpenPopUpNotify);
        } else {
            if (!isOpenPopUpNotify) {
                return;
            }
            const contentHtml = '<p>' + nickname + Intl.get('leave-feedback-visit-consumer', '拜访了') + '<a href="javascript:void(0)" onclick="handleVisitCallback(\'' + customer_id + '\')">' + customer_name + '</a>' + '</p>'
                + '<p>' + Intl.get('leave-feedback-visit-record', '拜访记录：') + remark + '</p><br/>'
                + '<p class=\'visit-customer-callback-to-superior\'>' + create_time + '</p>';
            notificationUtil.showNotification({
                title: title,
                content: contentHtml,
                closeWith: ['button'],
                timeout: 5 * 1000
            });
        }
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
    var showCustomerModal = _.get($('#customer-phone-status-content'), 'length', 0) > 0;
    var showClueModal = _.get($('#clue-phone-status-content'), 'length', 0) > 0;
    if (showCustomerModal) {
        phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_PHONE_PANEL);
    }
    if (showClueModal) {
        phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_CLUE_PANEL);
    }
    var phoneNumber = phoneObj.phoneItem, contactName = phoneObj.contactName;
    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.noty-container .noty-content .phone-item .icon-phone-call-out'), '拨打电话');
    handleCallOutResult({
        contactName: contactName,//联系人姓名
        phoneNumber: phoneNumber//拨打的电话
    });
};
//点击展开线索详情
window.handleClickClueName = (event, clueId) => {
    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.noty-container .noty-content .clue-item .clue-name'), '打开线索详情');
    phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
        clue_params: {
            currentId: clueId
        }
    });
    //点击查看详情时要把对应的通知框关掉
    $(event.target).closest('li').remove();
};

function scheduleAlertListener(scheduleAlertMsg) {
    let isOpenPopUpNotify = getNotifyStatus();
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
    var title = Intl.get('customer.contact.somebody', '联系') + scheduleAlertMsg.topic;
    var tipContent = scheduleAlertMsg.content || '';
    if (canPopDesktop()) {
        tipContent = tipContent + '\n';
        _.each(phoneArr, (phoneItem) => {
            tipContent += phoneItem.customer_name + ' ' + phoneItem.phone;
        });
        //桌面通知的展示
        showDesktopNotification(title, tipContent, true, isOpenPopUpNotify);
    } else {//系统弹出通知
        if (!isOpenPopUpNotify) {
            return;
        }
        var phoneHtml = '';
        _.each(phoneArr, (phoneItem) => {
            var phoneObj = {
                phoneItem: phoneItem.phone,
                contactName: phoneItem.customer_name,
                customerId: phoneItem.customer_id
            };
            phoneHtml += '<p class=\'phone-item\'>' + '<i class=\'iconfont icon-phone-call-out handle-btn-item\' title=\'' + Intl.get('crm.click.call.phone', '点击拨打电话') + '\' onclick=\'handleClickPhone(' + JSON.stringify(phoneObj) + ')\'></i>' + '<span class=\'customer-name\' title=\'' + phoneItem.customer_name + '\'>' + phoneItem.customer_name + '</span>' + ' ' + phoneItem.phone + '</p>';
        });
        tipContent = `<div>${tipContent}<p>${phoneHtml}</p></div>`;
        let type = scheduleAlertMsg.type;
        //注：客户和线索的电联采用不同的标签
        switch (type) {
            case 'calls':
                title = '【' + Intl.get('schedule.phone.connect', '电联') + '】 ' + '<a href="javascript:void(0)" onclick="handleVisitCallback(\'' + scheduleAlertMsg.customer_id + '\')">' + scheduleAlertMsg.topic + '</a>';//客户电联
                break;
            case 'lead':
                title = '【' + Intl.get('schedule.phone.connect', '电联') + '】 ' + '<a href="javascript:void(0)" onclick="handleLeadClickCallback(\'' + scheduleAlertMsg.lead_id + '\')">' + scheduleAlertMsg.topic + '</a>';//线索电联
                break;
            case 'visit':
                if (scheduleAlertMsg.customer_id) {
                    title = '【' + Intl.get('schedule.phone.connect', '拜访') + '】 ' + '<a href="javascript:void(0)" onclick="handleVisitCallback(\'' + scheduleAlertMsg.customer_id + '\')">' + scheduleAlertMsg.topic + '</a>';
                } else if (scheduleAlertMsg.lead_id) {
                    title = '【' + Intl.get('schedule.phone.connect', '拜访') + '】 ' + '<a href="javascript:void(0)" onclick="handleLeadClickCallback(\'' + scheduleAlertMsg.lead_id + '\')">' + scheduleAlertMsg.topic + '</a>';
                } else {
                    title = '【' + Intl.get('common.visit', '拜访') + '】 ' + scheduleAlertMsg.topic;
                }
                break;
            case 'other':
                if (scheduleAlertMsg.customer_id) {
                    title = '【' + Intl.get('schedule.phone.connect', '其他') + '】 ' + '<a href="javascript:void(0)" onclick="handleVisitCallback(\'' + scheduleAlertMsg.customer_id + '\')">' + scheduleAlertMsg.topic + '</a>';
                } else if (scheduleAlertMsg.lead_id) {
                    title = '【' + Intl.get('schedule.phone.connect', '其他') + '】 ' + '<a href="javascript:void(0)" onclick="handleLeadClickCallback(\'' + scheduleAlertMsg.lead_id + '\')">' + scheduleAlertMsg.topic + '</a>';
                } else {
                    title = '【' + Intl.get('common.visit', '其他') + '】 ' + scheduleAlertMsg.topic;
                }
                break;
            default:
                title = scheduleAlertMsg.topic;
        }
        // notificationUtil.showNotiSchedule({title,content: tipContent,type});
        notificationUtil.showNotification({
            title: title,
            content: tipContent,
            type: type,
            closeWith: ['button'],
            ignoreTitleLength: true
        });
    }
}

/*
 *审批的提示 */
function notifyApplyInfo(data) {
    let isOpenPopUpNotify = getNotifyStatus();
    if (_.get(data,'message_type') === APPLY_APPROVE_TYPES.USER_OR_GRANT && _.includes(['apply_user_official', 'apply_user_trial', 'apply_app_official', 'apply_app_trial'] ,data.user_apply_type)) {
        //记录推送的审批通知的数量
        approveTipCount++;
        //标签页不可见时，有桌面通知，且允许弹出桌面通知时
        if (canPopDesktop()) {//桌面通知的展示
            showDesktopNotification(Intl.get('user.apply.approve', '用户申请审批'), getApproveTipContent(data), false, isOpenPopUpNotify);
        } else {//系统弹出通知
            // 弹窗通知关闭的情况下，不需要显示用户审批的弹窗信息
            if (!isOpenPopUpNotify) {
                return;
            }
            let notify = NotificationType['exist'];
            //如果界面上没有提示框，就显示推送的具体内容
            if (!notify) {
                //获取提醒提示框中的内容
                let tipContent = getApproveTipContent(data);
                notify = notificationUtil.showNotification({
                    title: Intl.get('user.apply.approve', '用户申请审批'),
                    content: tipContent,
                    closeWith: ['button'],
                    // timeout: TIMEOUTDELAY.closeTimeDelay,
                    callback: {
                        onClose: function() {
                            delete NotificationType['exist'];
                            approveTipCount = 0;
                            if (approveTimeout) {
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

// /logout退出登录后的处理
function handleLogout() {
    //退出登录后，退出容联电话系统的登录
    phoneUtil.logoutCallClient();
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
        socketIo.off('offline', listenOnOffline);
        socketIo.off('sessionExpired', handleSessionExpired);
        socketIo.off('logoutAccount', handleLogout);
        socketIo.off('batchOperate', batch.batchOperateListener);
        socketIo.off('disconnect', disconnectListener);
        socketIo.off('phonemsg', phoneEventListener);
        socketIo.off('scheduleAlertMsg', scheduleAlertListener);
        socketIo.off('system_notice', listenSystemNotice);
        socketIo.off('apply_unread_reply', applyUnreadReplyListener);
        socketIo.off('cluemsg', clueUnhandledListener);
        socketIo.off('applyApprovemsg', applyApproveUnhandledListener);
        socketIo.off('applyApprovedByOthermsg', applyApproveApprovedByOtherListener);
        socketIo.off('applyVisitCustomerMsg', applyVisitCustomerListener);
        socketIo.off('crm_operator_alert_msg', crmOperatorAlertListener);
        socketIo.off('apply_upgrade', applyUpgradeListener);
        socketIo.off('apply_upgrade_complete', applyUpgradeCompleteListener);
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
        // 当前升级版本的时间监听
        socketIo.on('curUpgradeTime', newUpgradeTime => {
            // 监听到node端推送的最新版本的升级时间，与浏览器中缓存的时间不一致，说明有新的版本升级，需要提示用户手动刷新界面
            if (newUpgradeTime !== +Oplate.curUpgradeTime) {
                //session过期提示的添加
                var $upgradeTip = $('#app >.upgrade-refresh-tip');
                if ($upgradeTip && $upgradeTip.length > 0) {
                    return;
                } else {
                    $('#app').append('<div class="upgrade-refresh-tip"></div>');
                    ReactDOM.render(<span>
                        <Icon type="exclamation-circle" />
                        <ReactIntl.FormattedMessage
                            id="common.upgrade.refresh.tip"
                            defaultMessage="版本已升级，请{refresh}"
                            values={{
                                refresh: <a href='#' onClick={() => {
                                    window.location.reload();
                                }} data-tracename="点击升级刷新提示中的刷新按钮">{Intl.get('common.refresh', '刷新')}</a>
                            }} />
                    </span>, $('#app >.upgrade-refresh-tip')[0]);
                }
            }
        });

        // 获取消息数后添加监听
        getMessageCount(unreadListener);
        //监听node端推送的登录踢出的信息
        socketIo.on('offline', listenOnOffline);
        //监听session过期的消息
        socketIo.on('sessionExpired', handleSessionExpired);
        // 监听退出登录的消息
        socketIo.on('logoutAccount', handleLogout);
        //监听用户批量操作的消息
        socketIo.on('batchOperate', batch.batchOperateListener);
        //监听 disconnect
        socketIo.on('disconnect', disconnectListener);
        //监听拨打电话
        socketIo.on('phonemsg', phoneEventListener);
        //监听日程管理
        socketIo.on('scheduleAlertMsg', scheduleAlertListener);
        //监听客户操作
        socketIo.on('crm_operator_alert_msg', crmOperatorAlertListener);
        //监听销售的拜访反馈，推送给相应的抄送人
        socketIo.on('applyVisitCustomerMsg', applyVisitCustomerListener);
        //监听申请试用
        socketIo.on('apply_upgrade', applyUpgradeListener);
        //监听升级成功
        socketIo.on('apply_upgrade_complete', applyUpgradeCompleteListener);
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

    let user = userData.getUserData();
    var applyShowTabs = _.find(user.routes, item => item.id === 'application_apply_management');
    if (applyShowTabs) {
        //获取未读回复及待我审批的列表
        if (hasPrivilege(commonPrivilegeConst.USERAPPLY_BASE_PERMISSION)) {
            //获取其他类型申请审批未读数，根据type对类型进行区分
            getDiffApplyUnreadReply(callback);
            //获取待我审批的申请列表
            getUnapproveApplyLists(callback);
        }
    }

    //获取线索未处理数的权限（除运营人员外展示）
    if (getClueUnhandledPrivilege()) {
        var data = getUnhandledClueCountParams();
        getClueUnreadNum(data, callback);
    } else {
        //运营人员和普通销售即使没有获取未读数的权限，但是在有分配给他的线索的时候，他也要收到弹窗
        callback('unhandleClue');
    }

}

//添加未读数的监听，包括申请审批，系统消息等
function unreadListener(type) {
    if (socketIo) {
        //如果是未处理的线索，要和审批的区分开，避免会加上两个监听的情况，未读数要在发ajax请求后再进行监听，避免出现监听数据比获取的数据早的情况
        if (type === 'unhandleClue') {
            //监听未处理的线索
            clueTotalCount = 0;
            socketIo.on('cluemsg', clueUnhandledListener);
        } else if (type === 'unread_reply') {
            //申请审批未读回复的监听
            socketIo.on('apply_unread_reply', applyUnreadReplyListener);
        } else if (type === APPLY_APPROVE_TYPES.UNHANDLEAPPLY) {
            //申请审批未读回复的监听
            socketIo.on('applyApprovemsg', applyApproveUnhandledListener);
            socketIo.on('applyApprovedByOthermsg', applyApproveApprovedByOtherListener);
            //获取完未读数后，监听node端推送的弹窗消息
            socketIo.on('applyApprovedFinishmsg', listenOnMessage);
        } else {

            //监听系统消息
            socketIo.on('system_notice', listenSystemNotice);
        }
    }
}

//申请审批未读回复的监听
function applyUnreadReplyListener(unreadReply) {
    const MY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.MY_UNREAD_REPLY;
    const TEAM_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.TEAM_UNREAD_REPLY;
    //将未读回复列表分用户存入sessionStorage（session失效时会自动清空数据）
    let unreadMyReplyList = session.get(MY_UNREAD_REPLY);
    //todo 这里的判断需要修改一下，member_id 推送给的人的id，需要校验的是这条审批的申请人的id，暂时后端还没有加上
    if (unreadMyReplyList && userData.getUserData().user_id === _.get(unreadReply,'applicateId')) {
        unreadMyReplyList = JSON.parse(unreadMyReplyList);
        //已有回复列表，将新得回复加入回复列表中
        if (_.get(unreadMyReplyList, '[0]')) {
            unreadMyReplyList.push(unreadReply);
        } else {//还没有回复列表时，将新回复组成回复列表
            unreadMyReplyList = [unreadReply];
        }
        session.set(MY_UNREAD_REPLY, JSON.stringify(unreadMyReplyList));
        notificationEmitter.emit(notificationEmitter.MY_UNREAD_REPLY, unreadMyReplyList);
    }
    let unreadTeamReplyList = session.get(TEAM_UNREAD_REPLY);
    if (unreadTeamReplyList) {
        unreadTeamReplyList = JSON.parse(unreadTeamReplyList);
        //已有回复列表，将新得回复加入回复列表中
        if (_.get(unreadTeamReplyList, '[0]')) {
            unreadTeamReplyList.push(unreadReply);
        } else {//还没有回复列表时，将新回复组成回复列表
            unreadTeamReplyList = [unreadReply];
        }
        session.set(TEAM_UNREAD_REPLY, JSON.stringify(unreadTeamReplyList));
        notificationEmitter.emit(notificationEmitter.TEAM_UNREAD_REPLY, unreadTeamReplyList);
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
function getClueUnreadNum(data, callback) {
    //pageSize设置为0，只取到数据就行
    var type = 'user';
    if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL)) {
        type = 'manager';
    }
    $.ajax({
        url: '/rest/get/clue/fulltext/100/1/source_time/descend/' + type,
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
//获取待我审批的申请
function getUnapproveApplyLists(callback) {
    getWorklistApplyList().then((data) => {
        var messages = {
            unhandleApply: 0,//待我处理的申请审批的数量
            unhandleApply_list: []
        };
        var value = data.total;
        if (typeof value === 'number' && value > 0) {
            messages['unhandleApply'] = value;
        } else if (typeof value === 'string') {
            var num = parseInt(value);
            if (!isNaN(num) && num > 0) {
                messages[APPLY_APPROVE_TYPES.UNHANDLEAPPLY] = num;
            }
        }
        if (_.isArray(_.get(data, 'list'))) {
            messages['unhandleApplyList'] = _.get(data, 'list');
        }
        //更新全局中存的未处理的线索数
        updateGlobalUnreadStorage(messages);
        if (typeof callback === 'function') {
            callback(APPLY_APPROVE_TYPES.UNHANDLEAPPLY);
        }
    },() => {
        if (typeof callback === 'function') {
            callback(APPLY_APPROVE_TYPES.UNHANDLEAPPLY);
        }
    });
}
function setMessageValue(applyType, data) {
    var messages = {};
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



//存储其他类型申请审批的未读回复列表
function saveTeamApplyUnreadReplyList(data) {
    const DIFF_APPLY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.TEAM_UNREAD_REPLY;
    //将未读回复列表存入sessionStorage（session失效时会自动清空数据）
    session.set(DIFF_APPLY_UNREAD_REPLY, JSON.stringify(data));
    notificationEmitter.emit(notificationEmitter.TEAM_UNREAD_REPLY, data);
}

function saveMyApplyUnreadReplyList(data) {
    const DIFF_APPLY_UNREAD_REPLY = DIFF_APPLY_TYPE_UNREAD_REPLY.MY_UNREAD_REPLY;
    //将未读回复列表存入sessionStorage（session失效时会自动清空数据）
    session.set(DIFF_APPLY_UNREAD_REPLY, JSON.stringify(data));
    notificationEmitter.emit(notificationEmitter.MY_UNREAD_REPLY, data);
}
//获取我申请的未读回复的申请审批列表
function getMyApplicationListWithUnreadReply(callback) {
    $.ajax({
        url: '/rest/apply_list/start/self',
        type: 'get',
        dataType: 'json',
        data: {
            sort_field: 'create_time',//按回复时间倒序排
            order: 'descend',
            page_size: 1000,//需要获取全部的未读回复列表，预估不会超过1000条
            id: '',
            comment_unread: true

        },
        success: data => {
            //将获取的未读回复列表存到session中
            saveMyApplyUnreadReplyList(_.get(data, 'list', []));
            if (typeof callback === 'function') {
                callback('unread_reply');
            }
        },
        error: () => {

        }
    });
}

//获取团队申请包含未读回复的列表
function getTeamApplicationListWithUnreadReply(callback) {
    $.ajax({
        url: '/rest/appuser/apply_list',
        type: 'get',
        dataType: 'json',
        data: {
            sort_field: 'create_time',//按回复时间倒序排
            order: 'descend',
            page_size: 1000,//需要获取全部的未读回复列表，预估不会超过1000条
            id: '',
            comment_unread: true
        },
        success: data => {
            //将获取的未读回复列表存到session中
            saveTeamApplyUnreadReplyList(_.get(data, 'list', []));
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

//获取工作流审批未读审批列表(包含我申请的和团队申请的)
function getDiffApplyUnreadReply(callback) {
    getMyApplicationListWithUnreadReply(callback);
    getTeamApplicationListWithUnreadReply(callback);
}

//更新全局变量里存储的未读数，以便在业务逻辑里使用
function updateGlobalUnreadStorage(unreadObj) {
    if (Oplate && Oplate.unread && unreadObj) {
        for (var key in unreadObj) {
            Oplate.unread[key] = unreadObj[key];
        }
        if (timeoutFunc) {
            clearTimeout(timeoutFunc);
        }
        //向展示的组件发送数据
        timeoutFunc = setTimeout(function() {
            //更新未读消息数
            // notificationEmitter.emit(notificationEmitter.UPDATE_NOTIFICATION_UNREAD);
            //未处理的线索数量刷新展示
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT);
            //刷新审批申请未处理的数量
            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT);
        }, timeout);
    }
}

module.exports.startSocketIo = startSocketIo;
