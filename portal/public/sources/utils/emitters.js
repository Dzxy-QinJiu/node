/**
 * Copyright (c) 2010-2015 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2015 湖南蚁坊软件有限公司。保留所有权利。
 * Created by liwenjun on 2016/12/26.
 */
var EventEmitter = require('events');
//滚动条emitter
exports.scrollBarEmitter = new EventEmitter();
exports.scrollBarEmitter.STOP_LOADED_DATA = 'stopScrollLoadedData';
exports.scrollBarEmitter.HIDE_BOTTOM_LOADING = 'scrollBar.hideBottomLoading';
//拨打电话emitter
exports.phoneMsgEmitter = new EventEmitter();
//打开拨打电话的面板emitter
exports.phoneMsgEmitter.OPEN_PHONE_PANEL = 'openPhonePanel';
exports.phoneMsgEmitter.SEND_PHONE_NUMBER = 'sendPhoneNumber';
//关闭拨打电话模态框emitter
exports.phoneMsgEmitter.CLOSE_PHONE_MODAL = 'closePhoneModal';
//拨打电话emitter
exports.audioMsgEmitter = new EventEmitter();
//打开播放录音的面板emitter
exports.audioMsgEmitter.OPEN_AUDIO_PANEL = 'openAudioPanel';
//关闭播放录音的面板emitter
exports.audioMsgEmitter.CLOSE_AUDIO_PANEL = 'closeAudioPanel';
//隐藏上报客服电话按钮
exports.audioMsgEmitter.HIDE_REPORT_BTN = 'hideReportBtn';
//日程管理界面emitter
exports.scheduleManagementEmitter = new EventEmitter();
exports.scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_TRUE = 'setUpdateScrollBarTrue';
exports.scheduleManagementEmitter.SET_UPDATE_SCROLL_BAR_FALSE = 'setUpdateScrollBarFalse';
//添加客户成功后emitter
exports.addCustomerEmitter = new EventEmitter();
exports.addCustomerEmitter.SEND_ADD_CUSTOMER = 'sendAddCustomer';
//用户信息emitter
exports.userInfoEmitter = new EventEmitter();
exports.userInfoEmitter.CHANGE_USER_LOGO = 'changeUserInfoLogo';
//添加卡片的emitter
exports.cardEmitter = new EventEmitter();
exports.cardEmitter.ADD_CARD = 'addCard';
//申请消息的emitter
exports.notificationEmitter = new EventEmitter();
exports.notificationEmitter.UPDATE_NOTIFICATION_UNREAD = 'updateNotificationUnread';
exports.notificationEmitter.SHOW_UNHANDLE_APPLY_COUNT = 'showUnhandledApplyCount';

exports.notificationEmitter.APPLY_UPDATED = 'applyUpdated';
exports.notificationEmitter.APPLY_UPDATED_CUSTOMER_VISIT = 'applyUpdatedCustomerVisit';
exports.notificationEmitter.APPLY_UPDATED_SALES_OPPORTUNITY = 'applyUpdatedSalesOpportunity';
exports.notificationEmitter.APPLY_UPDATED_LEAVE = 'applyUpdatedLeave';
exports.notificationEmitter.APPLY_UPDATED_MEMBER_INVITE = 'applyUpdatedMemberInvite';
exports.notificationEmitter.APPLY_UPDATED_REPORT_SEND = 'applyUpdatedReportSend';
exports.notificationEmitter.APPLY_UPDATED_DOCUMENT_WRITE = 'applyUpdatedDocumentWrite';

//未处理的线索数量
exports.notificationEmitter.SHOW_UNHANDLE_CLUE_COUNT = 'showUnhandledClueCount';
//未审批申请的数量
exports.notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT = 'showUnhandledApplyApproveCount';
//展开线索详情
exports.notificationEmitter.SHOW_CLUE_DETAIL = 'showClueDetail';
//申请审批未读回复
exports.notificationEmitter.APPLY_UNREAD_REPLY = 'applyUnreadReply';
//刷新系统消息的emitter
exports.notificationEmitter.SYSTEM_NOTICE_UPDATED = 'systemNoticeUpdated';
//用户批量推送的emitter
exports.batchPushEmitter = new EventEmitter();
//用户管理批量-所属客户
exports.batchPushEmitter.TASK_CUSTOMER_CHANGE = 'batchtask.task_customer_change';
//用户管理批量-创建用户
exports.batchPushEmitter.TASK_USER_CREATE = 'batchtask.task_user_create';
//用户管理批量-开通类型
exports.batchPushEmitter.TASK_GRANT_TYPE = 'batchtask.task_grant_type';
//用户管理批量-开通状态
exports.batchPushEmitter.TASK_GRANT_STATUS = 'batchtask.task_grant_status';
//用户管理批量-开通周期
exports.batchPushEmitter.TASK_GRANT_PERIOD = 'batchtask.task_grant_period';
//用户管理批量-批量延期
exports.batchPushEmitter.TASK_GRANT_DELAY = 'batchtask.task_grant_delay';
//用户管理批量-开通产品
exports.batchPushEmitter.TASK_GRANT_UPDATE = 'batchtask.task_grant_update';
//客户管理批量-变更销售人员
exports.batchPushEmitter.CRM_BATCH_CHANGE_SALES = 'batchtask.crm_batch_change_sales';
//客户管理批量-转出客户
exports.batchPushEmitter.CRM_BATCH_TRANSFER_CUSTOMER = 'batchtask.crm_batch_transfer_customer';
//客户管理批量-变更标签
exports.batchPushEmitter.CRM_BATCH_CHANGE_LABELS = 'batchtask.crm_batch_change_labels';
//客户管理批量-添加标签
exports.batchPushEmitter.CRM_BATCH_ADD_LABELS = 'batchtask.crm_batch_add_labels';
//客户管理批量-移除标签
exports.batchPushEmitter.CRM_BATCH_REMOVE_LABELS = 'batchtask.crm_batch_remove_labels';
//客户管理批量-变更行业
exports.batchPushEmitter.CRM_BATCH_CHANGE_INDUSTRY = 'batchtask.crm_batch_change_industry';
//客户管理批量-变更地域
exports.batchPushEmitter.CRM_BATCH_CHANGE_TERRITORY = 'batchtask.crm_batch_change_address';
//客户管理批量-变更行政级别
exports.batchPushEmitter.CRM_BATCH_CHANGE_LEVEL = 'batchtask.crm_batch_change_level';
//socket的emitter
exports.socketEmitter = new EventEmitter();
//socket的emitter的disconnect
exports.socketEmitter.DISCONNECT = 'socketio.disconnect';
//顶部导航的emitter
exports.topNavEmitter = new EventEmitter();
//顶部导航重新布局
exports.topNavEmitter.RELAYOUT = 'topnav.relayout';
//我的应用的emitter
exports.myAppEmitter = new EventEmitter();
//我的应用-切换视图到添加角色
exports.myAppEmitter.GO_TO_ADD_ROLE = 'myapp.go_to_add_role';
exports.myAppEmitter.GO_TO_ADD_PERMISSION = 'myapp.go_to_add_permission';
// 通话记录的emitter
exports.callReordEmitter = new EventEmitter();
// 通话记录--关闭客户详情
exports.callReordEmitter.CLOSE_RIGHT_PANEL = 'callrecord.close_right_panel';
// 日期选择组件的emitter
const dateSelectorEmitter = new EventEmitter();
dateSelectorEmitter.setMaxListeners(0);
// 日期选择组件--选中日期
dateSelectorEmitter.SELECT_DATE = 'dateselector.select_date';
exports.dateSelectorEmitter = dateSelectorEmitter;
export { dateSelectorEmitter };

// 应用选择组件的emitter
const appSelectorEmitter = new EventEmitter();
appSelectorEmitter.setMaxListeners(0);
// 应用选择组件--选中应用
appSelectorEmitter.SELECT_APP = 'appselector.select_app';
exports.appSelectorEmitter = appSelectorEmitter;
export {appSelectorEmitter };

// 分析tab选择组件的emitter
const analysisTabEmitter = new EventEmitter();
analysisTabEmitter.setMaxListeners(0);
exports.analysisTabEmitter = analysisTabEmitter;
// 分析tab选择组件--选中分析tab
exports.analysisTabEmitter.SELECT_TAB = 'analysis_tab.select_tab';

// 图表点击事件的emitter
const chartClickEmitter = new EventEmitter();
chartClickEmitter.setMaxListeners(0);
exports.chartClickEmitter = chartClickEmitter;
// 图表点击事件--触发点击
exports.chartClickEmitter.CLICK_CHART = 'chartClick.click_chart';

// 团队树组件的emitter
const teamTreeEmitter = new EventEmitter();
teamTreeEmitter.setMaxListeners(0);
// 团队树组件--选中团队
teamTreeEmitter.SELECT_TEAM = 'team_tree.select_team';
// 团队树组件--选中成员
teamTreeEmitter.SELECT_MEMBER = 'team_tree.select_member';
exports.teamTreeEmitter = teamTreeEmitter;
export { teamTreeEmitter };

//session过期的emitter
exports.sessionExpireEmitter = new EventEmitter();
exports.sessionExpireEmitter.SESSION_EXPIRED = 'session_expired';

//合同相关事件
const contractEmitter = new EventEmitter();
contractEmitter.IMPORT_CONTRACT = 'import_contract';
export {contractEmitter};

// 窗口缩放相关事件
const resizeEmitter = new EventEmitter();
resizeEmitter.WINDOW_SIZE_CHANGE = 'window_size_change';
export { resizeEmitter };

// 分析模块客户列表事件
const analysisCustomerListEmitter = new EventEmitter();
analysisCustomerListEmitter.SHOW_CUSTOMER_LIST = 'show_customer_list';
export { analysisCustomerListEmitter };

// 申请成员相关事件
const memberApplyEmitter = new EventEmitter();
export { memberApplyEmitter };
// 列表面板事件
const listPanelEmitter = new EventEmitter();
listPanelEmitter.SHOW = 'show_list_panel';
export { listPanelEmitter };
