var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 新版审批详情界面
 */
require('../css/apply-detail.less');
import ApplyViewDetailStore from '../store/apply-view-detail-store';
import {AntcTable} from 'antc';
import ApplyViewDetailActions from '../action/apply-view-detail-actions';
import AppUserUtil from '../util/app-user-util';
import Spinner from '../../../../components/spinner';
import userData from '../../../../public/sources/user-data';
import GeminiScrollbar from '../../../../components/react-gemini-scrollbar';
import AppProperty from '../../../../components/user_manage_components/app-property-setting';
import {Modal} from 'react-bootstrap';
import {Alert, Tooltip, Form, Button, Input, InputNumber, Select, Icon, message, DatePicker, Row, Col} from 'antd';
const Option = Select.Option;
import FieldMixin from '../../../../components/antd-form-fieldmixin';
import UserNameTextField from '../../../../components/user_manage_components/user-name-textfield/apply-input-index';
import UserNameTextfieldUtil from '../../../../components/user_manage_components/user-name-textfield/util';
const FormItem = Form.Item;
import {Table} from 'react-bootstrap';
import classNames from 'classnames';
import {hasPrivilege, PrivilegeChecker} from '../../../../components/privilege/checker';
/*在审批界面显示用户的右侧面板开始*/
require('../css/main.less');
import UserDetail from '../../../app_user_manage/public/views/user-detail';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from '../../../../components/rightPanel';
import {getPassStrenth, PassStrengthBar, passwordRegex} from 'CMP_DIR/password-strength-bar';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import {APPLY_TYPES} from 'PUB_DIR/sources/utils/consts';

/*在审批界面显示用户的右侧面板结束*/
//默认头像图片
var DefaultHeadIconImage = require('../../../common/public/image/default-head-icon.png');
//成功提示
var AlertTimer = require('../../../../components/alert-timer');
//用户信息
var UserData = require('../../../../public/sources/user-data');

// 应用的默认配置
var UserTypeConfigForm = require('./user-type-config-form');
var BootstrapButton = require('react-bootstrap').Button;
import Trace from 'LIB_DIR/trace';
var moment = require('moment');

//表单默认配置
var appConfig = {
    //默认没id，用id区分增加和修改类型，有id是修改，没id是增加
    id: '',
    //到期停用 0 否 1 是`
    over_draft: 1,
    //多人登录
    mutilogin: 0,
    //是否是二步认证
    is_two_factor: 0,
    //用户类型
    user_type: '',
    //范围
    range: '0.5m',
    //配置名称
    config_name: '',
    //默认已选中的角色列表
    roles: [],
    //默认已选中的权限列表
    permissions: [],
    //默认开通周期毫秒数 半个月
    valid_period: 1209600000
};

//常量定义
var CONSTANTS = {
    //申请正式用户
    APPLY_USER_OFFICIAL: 'apply_user_official',
    //申请试用用户
    APPLY_USER_TRIAL: 'apply_user_trial',
    //已有用户开通试用
    EXIST_APPLY_TRIAL: 'apply_app_trial',
    //已有用户开通正式
    EXIST_APPLY_FORMAL: 'apply_app_official',
    // 待审批的状态
    APPLY_STATUS: 0,
    // 详单的高度（当底部有批注内容时）
    DETAIL_CONTAIN_COMMENT_HEIGHT: 80,
    // 详单的高度（当底部无批注内容时）
    DETAIL_NO_COMMENT_HEIGHT: 55
};
const SELECT_CUSTOM_TIME_TYPE = 'custom';
//获取查看申请详情的路径,回复,审批，驳回中需要添加
function getApplyDetailUrl(detailInfo) {
    //申请id
    var applyId = detailInfo && detailInfo.id;
    var basePath = window.location.origin + window.location.pathname;
    //跳转到具体申请详情的链接url
    return basePath + (applyId ? '?id=' + applyId : '');
}
//获取延期时间
function getDelayDisplayTime(delay) {
    //年毫秒数
    var YEAR_MILLIS = 365 * 24 * 60 * 60 * 1000;
    //月毫秒数
    var MONTH_MILLIS = 30 * 24 * 60 * 60 * 1000;
    //周毫秒数
    var WEEK_MILLIS = 7 * 24 * 60 * 60 * 1000;
    //天毫秒数
    var DAY_MILLIS = 24 * 60 * 60 * 1000;
    //计算年
    var years = Math.floor(delay / YEAR_MILLIS);
    var left_millis = delay - years * YEAR_MILLIS;
    //计算月
    var months = Math.floor(left_millis / MONTH_MILLIS);
    left_millis = left_millis - months * MONTH_MILLIS;
    //计算周
    var weeks = Math.floor(left_millis / WEEK_MILLIS);
    left_millis = left_millis - weeks * WEEK_MILLIS;
    //计算天
    var days = Math.floor(left_millis / DAY_MILLIS);
    //按情况显示
    return `${years ? years + Intl.get('common.time.unit.year', '年') : ''}
            ${months ? months + Intl.get('user.apply.detail.delay.month.show', '个月') : ''}
            ${weeks ? weeks + Intl.get('common.time.unit.week', '周') : ''}
            ${days ? days + Intl.get('common.time.unit.day', '天') : ''}`;
}

//根据申请type判断是否 是延期或禁用的申请(一个用户对应多个应用)
// const isMultiAppApply = item => {
//     let flag = false;
//     _.each(APPLY_TYPES, (value) => {
//         if (_.get(item, 'message.type') === value) {
//             flag = true;
//             return false;
//         }
//     });
//     return flag;
// };

const ApplyViewDetail = createReactClass({
    propTypes: {
        detailItem: PropTypes.object,
        applyData: PropTypes.object,
        showNoData: PropTypes.bool,
        isUnreadDetail: PropTypes.bool,
    },
    displayName: 'ApplyViewDetail',
    mixins: [FieldMixin, UserNameTextField],

    hasApprovalPrivilege() {
        return hasPrivilege('USER_PWD_CHANGE_APPROVAL');
    },

    getDefaultProps() {
        return {
            showNoData: false,
            showBackoutConfirm: false,
            detailItem: {},
            isUnreadDetail: false//是否有未读回复
        };
    },

    getInitialState() {
        return {
            appConfig: appConfig,
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            ...ApplyViewDetailStore.getState()
        };
    },

    onStoreChange() {
        this.setState(ApplyViewDetailStore.getState());
    },

    getApplyDetail(detailItem, applyData) {
        setTimeout(() => {
            ApplyViewDetailActions.showDetailLoading(detailItem);
            ApplyViewDetailActions.getApplyDetail(detailItem.id, applyData);
            //获取回复列表
            if (hasPrivilege('GET_APPLY_COMMENTS')) {
                ApplyViewDetailActions.getReplyList(detailItem.id);
            }
        });
    },

    componentDidMount() {
        ApplyViewDetailStore.listen(this.onStoreChange);
        if (this.props.detailItem.id) {
            setTimeout(() => {
                this.getApplyDetail(this.props.detailItem, this.props.applyData);
                ApplyViewDetailActions.setBottomDisplayType();

            });
        }
        emitter.on('user_detail_close_right_panel', this.closeRightPanel);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.REPLY_LIST_SCROLL_TO_BOTTOM, this.replyListScrollToBottom);
    },

    componentWillUnmount() {
        emitter.removeListener('user_detail_close_right_panel', this.closeRightPanel);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.REPLY_LIST_SCROLL_TO_BOTTOM, this.replyListScrollToBottom);
    },

    closeRightPanel() {
        ApplyViewDetailActions.closeRightPanel();
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.detailItem.id && !_.isEqual(nextProps.detailItem, this.props.detailItem)) {
            this.appsSetting = {};
            if (!this.state.applyResult.submitResult || nextProps.detailItem.id !== this.props.detailItem.id) {
                this.getApplyDetail(nextProps.detailItem);
            }
        }
    },

    getApplyListDivHeight: function() {
        if ($(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        var height = $(window).height() - AppUserUtil.APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA - AppUserUtil.APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
        return height;
    },

    renderApplyDetailLoading() {
        if (this.state.detailInfoObj.loading) {
            var height = this.getApplyListDivHeight();
            if (height !== 'auto') {
                height += 60;
            }
            return (<div className="app_user_manage_detail app_user_manage_detail_loading" style={{height: height}}>
                <Spinner /></div>);
        }
        return null;
    },

    retryFetchDetail(e) {
        Trace.traceEvent(e, '点击了重试');
        this.getApplyDetail(this.props.detailItem);
    },

    renderApplyDetailError() {
        if (!this.state.detailInfoObj.loading && this.state.detailInfoObj.errorMsg) {
            var height = this.getApplyListDivHeight();
            if (height !== 'auto') {
                height += 60;
            }
            var retry = (
                <span>
                    {this.state.detailInfoObj.errorMsg}，<a href="javascript:void(0)"
                        onClick={this.retryFetchDetail}><ReactIntl.FormattedMessage
                            id="common.retry" defaultMessage="重试"/></a>
                </span>
            );
            return (
                <div className="app_user_manage_detail app_user_manage_detail_error" style={{height: height}}>
                    <Alert
                        message={retry}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }
        return null;
    },

    renderApplyDetailNodata() {
        if (this.props.showNoData) {
            var height = this.getApplyListDivHeight();
            if (height !== 'auto') {
                height += 60;
            }
            return (
                <div className="app_user_manage_detail app_user_manage_detail_error" style={{height: height}}>
                    <Alert
                        message={Intl.get('common.no.data', '暂无数据')}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        }
        return null;
    },

    //获取详情高度
    getApplyDetailHeight() {
        if ($(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        return $(window).height() -
            AppUserUtil.APPLY_DETAIL_LAYOUT_CONSTANTS_FORM.TOP_DELTA -
            AppUserUtil.APPLY_DETAIL_LAYOUT_CONSTANTS_FORM.BOTTOM_DELTA;
    },

    //回复列表滚动到最后
    replyListScrollToBottom() {
        //等待react异步渲染完成
        setTimeout(() => {
            //找到滚动条所在的div
            var scrollDomDiv = $(this.refs.geminiWrap).find('.gm-scroll-view');
            //获取滚动条所在div的高度(如果获取不到，滚动到10000px的位置)
            var scrollHeight = scrollDomDiv[0] ? scrollDomDiv[0].scrollHeight : 10000;
            //滚动到滚动条底部
            GeminiScrollbar.scrollTo(this.refs.geminiWrap, scrollHeight);
        });
    },

    //重新获取回复列表
    refreshReplyList(e) {
        Trace.traceEvent(e, '点击了重新获取');
        if (this.props.detailItem.id) {
            ApplyViewDetailActions.getReplyList(this.props.detailItem.id);
        }
    },

    //用户头像加载失败的时候，使用默认头像进行显示
    userLogoOnError: function(event) {
        //添加次数判断，避免死循环
        event.target.failCount = event.target.failCount || 0;
        event.target.failCount++;
        //图片加载出错，小于3次的时候，使用默认图片展示
        if (event.target.failCount < 3) {
            event.target.src = DefaultHeadIconImage;
        }
    },

    //渲染回复列表
    renderReplyList() {
        let replyListInfo = this.state.replyListInfo;
        if (replyListInfo.result === 'loading') {
            return (
                <div className="reply-loading-wrap">
                    <Icon type="loading"/>
                    <span className="reply-loading-text">
                        {Intl.get('user.apply.reply.loading', '正在努力加载回复列表 ......')}
                    </span>
                </div>);
        }
        if (replyListInfo.result === 'error') {
            var message = (
                <span>{replyListInfo.errorMsg}，<Icon type="reload" onClick={this.refreshReplyList}
                    title={Intl.get('common.get.again', '重新获取')}/></span>);
            return (<Alert message={message} type="error" showIcon={true}/>);
        }
        let replyList = replyListInfo.list;
        if (_.isArray(replyList) && replyList.length) {
            {/*<Icon type="reload" onClick={this.refreshReplyList} className="pull-right"*/
            }
            {/*title={Intl.get("common.get.again", "重新获取")}/>*/
            }
            return (
                <ul>
                    {replyList.map((replyItem, index) => {
                        return (
                            <li key={index} className="apply-info-label">
                                <span className="user-info-label">{replyItem.user_name}:</span>
                                <span className="user-info-text">{replyItem.message}</span>
                                <span className="user-info-label reply-date-text">{replyItem.date}</span>
                            </li>);
                    })}
                </ul>);
        } else {
            return null;
        }
    },

    //渲染刷新回复列表的提示
    renderRefreshReplyTip: function() {
        return (<span className="refresh-reply-data-tip">
            <ReactIntl.FormattedMessage
                id="user.apply.refresh.reply.tip"
                defaultMessage={'有新回复，点此{refreshTip}'}
                values={{
                    'refreshTip': <a
                        onClick={this.refreshReplyList}>{Intl.get('common.refresh', '刷新')}</a>
                }}
            />
        </span>);
    },

    //渲染申请单详情
    renderApplyDetailInfo() {
        var detailInfo = this.state.detailInfoObj.info;
        //如果没有详情数据，不渲染
        if (this.state.detailInfoObj.loading || _.isEmpty(this.state.detailInfoObj)) {
            return;
        }
        //是否启用滚动条
        let GeminiScrollbarEnabled = false;
        //详情高度
        let applyDetailHeight = 'auto';
        //判断是否屏蔽窗口的滚动条
        if ($(window).width() >= Oplate.layout['screen-md']) {
            //计算详情高度
            applyDetailHeight = this.getApplyDetailHeight();
            // approval_state：0待审批，1通过 2驳回 3撤销，当是0时，保持高度不变，非0时，要增加回复框
            // if (detailInfo.approval_state !== CONSTANTS.APPLY_STATUS) {
            //     if (detailInfo.approval_comment) {
            //         applyDetailHeight -= CONSTANTS.DETAIL_CONTAIN_COMMENT_HEIGHT;
            //     } else {
            //         applyDetailHeight -= CONSTANTS.DETAIL_NO_COMMENT_HEIGHT;
            //     }
            //
            // }
            //启用滚动条
            GeminiScrollbarEnabled = true;
        }
        if (this.state.applyIsExpanded) {
            GeminiScrollbarEnabled = false;
        }
        let selectedDetailItem = this.state.selectedDetailItem;
        return (
            <div>
                <div className="apply-detail-title">
                    <span className="apply-type-tip">
                        {this.props.detailItem.topic || Intl.get('user.apply.id', '账号申请')}
                    </span>
                    {selectedDetailItem.order_id ? (
                        <span className="order-id">
                            {Intl.get('crm.147', '订单号')}：{selectedDetailItem.order_id}
                        </span>) : null}
                </div>
                <div className="apply-detail-content" style={{height: applyDetailHeight}} ref="geminiWrap">
                    <PrivilegeChecker check='APP_USER_APPLY_APPROVAL'>
                        {this.renderDetailForm(detailInfo)}
                    </PrivilegeChecker>
                    {this.state.applyIsExpanded ? null : (
                        <GeminiScrollbar enabled={GeminiScrollbarEnabled} ref="gemini">
                            {this.renderDetailCustomerBlock(detailInfo)}
                            <div className="apply-detail-user apply-detail-info">
                                <div className="user-icon-block">
                                    <span className="iconfont icon-user"/>
                                </div>
                                {this.renderDetailCenter(detailInfo)}
                            </div>
                            {detailInfo.comment ? (<div className="apply-detail-common apply-detail-info">
                                <div className="common-icon-block">
                                    <span className="iconfont icon-common"/>
                                </div>
                                {this.renderComment()}
                            </div>) : null}
                            <div className="apply-detail-reply-list apply-detail-info">
                                <div className="reply-icon-block">
                                    <span className="iconfont icon-apply-message-tip"/>
                                </div>
                                <div className="reply-info-block apply-info-block">
                                    <div className="reply-list-container apply-info-content">
                                        {this.props.isUnreadDetail ? this.renderRefreshReplyTip() : null}
                                        {hasPrivilege('GET_APPLY_COMMENTS') ? this.renderReplyList() : null}
                                        {hasPrivilege('CREATE_APPLY_COMMENT') ? (
                                            <Input addonAfter={(
                                                <a onClick={this.addReply}>{Intl.get('user.apply.reply.button', '回复')}</a>)}
                                            value={this.state.formData.comment}
                                            onChange={this.commentInputChange}
                                            placeholder={Intl.get('user.apply.reply.no.content', '请填写回复内容')}/>
                                        ) : null}
                                        {this.renderReplyFormResult()}
                                    </div>
                                </div>
                            </div>
                        </GeminiScrollbar>
                    )}
                </div>
                {this.renderDetailBottom()}
            </div>
        );
    },

    renderDetailCustomerBlock: function(detailInfo) {
        return (
            <div className="apply-detail-customer apply-detail-info">
                <div className="customer-icon-block">
                    <span className="iconfont icon-customer"/>
                </div>
                <div className="customer-info-block apply-info-block">
                    <div className="apply-info-content">
                        <div className="customer-name">
                            <a href="javascript:void(0)"
                                onClick={this.showCustomerDetail.bind(this, detailInfo.customer_id)}
                                data-tracename="查看客户详情"
                                title={Intl.get('call.record.customer.title', '点击可查看客户详情')}
                            >
                                {detailInfo.customer_name}
                                <span className="iconfont icon-arrow-right"/>
                            </a>
                        </div>
                        {detailInfo.last_contact_time ? (
                            <div className="apply-info-label">
                                <span className="user-info-label">
                                    {Intl.get('user.apply.last.follow.date', '最新跟进日期')}:
                                </span>
                                {moment(detailInfo.last_contact_time).format(oplateConsts.DATE_FORMAT)}
                            </div>) : null}
                        <div className="apply-info-label">
                            <span className="user-info-label">
                                {Intl.get('common.belong.sales', '所属销售')}:
                            </span>
                            {detailInfo.sales_name || ''} - {detailInfo.sales_team_name || ''}
                        </div>
                    </div>
                </div>
            </div>);
    },

    toggleApplyExpanded(bool) {
        ApplyViewDetailActions.toggleApplyExpanded(bool);
    },

    renderDetailOperateBtn() {
        if (!this.isUnApproved() || !hasPrivilege('APP_USER_APPLY_APPROVAL')) {
            return null;
        }
        if (this.state.applyIsExpanded) {
            return (
                <Tooltip title={Intl.get('user.apply.detail.expanded.title', '返回缩略内容')}>
                    <div className="btn-icon-return" onClick={this.toggleApplyExpanded.bind(this, false)}>
                        <span className="iconfont icon-return" data-tracename="查看应用详细内容"></span>
                    </div>
                </Tooltip>
            );
        }
        return (
            <Tooltip title={Intl.get('user.apply.detail.show.role.auth.title', '查看详细内容')}>
                <div className="btn-icon-role-auth" onClick={this.toggleApplyExpanded.bind(this, true)}
                    data-tracename="点击返回按钮">
                    <span className="iconfont icon-role-auth-config"></span>
                </div>
            </Tooltip>
        );
    },

    //是否是已有用户开通试用
    //或是否是已有用户开通正式
    isExistUserApply: function() {
        var detailInfoObj = this.state.detailInfoObj.info || {};
        if (
            detailInfoObj.type === CONSTANTS.EXIST_APPLY_TRIAL ||
            detailInfoObj.type === CONSTANTS.EXIST_APPLY_FORMAL
        ) {
            return true;
        }
        return false;
    },

    //将用户名设置为编辑状态
    editUserName(e) {
        Trace.traceEvent(e, '点击修改用户名');
        ApplyViewDetailActions.setUserNameEdit(true);
        setTimeout(() => {
            this.refs.validation.validate(function() {
            });
        });
    },

    renderEditUserName() {
        ApplyViewDetailActions.setUserNameEdit(true);
    },

    userNameSure(e) {
        Trace.traceEvent(e, '保存修改用户名');
        const validation = this.refs.validation;
        const formData = this.state.formData;
        validation.validate((valid) => {
            if (!valid) {
                return;
            }
            ApplyViewDetailActions.saveUserName(formData.user_name);
            ApplyViewDetailActions.setUserNameEdit(false);
        });
    },

    userNameCancel(e) {
        Trace.traceEvent(e, '取消修改用户名');
        ApplyViewDetailActions.cancelUserName();
        ApplyViewDetailActions.setUserNameEdit(false);
    },

    //渲染用户名区域，文字状态，修改状态
    renderUserNameBlock(info) {
        if (!this.isUnApproved()) {
            return <span>{info.user_names[0]}</span>;
        }
        let maxUserNumber = this.getChangeMaxUserNumber();
        return (<div>
            {!this.hasApprovalPrivilege() ? <span>{info.user_names[0]}</span>
                : (this.state.isUserEdit ? (
                    <div className="user-name-wrap">
                        <Form>
                            <Validation ref="validation" onValidate={this.handleValidate}>
                                {this.renderUserNameTextField({existCheck: true, number: maxUserNumber})}
                            </Validation>
                        </Form>
                        <div className="save-buttons">
                            <span className="iconfont icon-choose" onClick={this.userNameSure}></span>
                            <span className="iconfont icon-close" onClick={this.userNameCancel}></span>
                        </div>
                    </div>
                ) : (
                    <div>
                        <span>{info.user_names[0]}</span>
                        <Tooltip title={Intl.get('user.apply.detail.change.username.title', '修改用户名')}>
                            <span className="iconfont icon-update" onClick={this.editUserName.bind(this)}></span>
                        </Tooltip>
                    </div>)
                )}
        </div>);
    },

    //渲染用户名
    renderApplyDetailUserNames(detailInfo) {
        //已有用戶
        if (this.isExistUserApply()) {
            return this.renderApplyUserNames(detailInfo);
        } else {
            //新用戶申请，审批通过增加id字段后
            if (_.isArray(detailInfo.user_ids) && detailInfo.user_ids.length) {
                return (
                    <div className="apply-info-label">
                        <span className="user-info-label">{Intl.get('crm.detail.user', '用户')}:</span>
                        <span className="user-info-text">
                            {
                                detailInfo.user_ids.map((id, idx) => {
                                    return (
                                        <span key={idx}>
                                            <a href="javascript:void(0)"
                                                onClick={this.showUserDetail.bind(this, id)}
                                                data-tracename="查看用户详情">{detailInfo.user_names[idx]}</a>
                                            <span className="user-nick-name">
                                                {_.isArray(detailInfo.nick_names) && detailInfo.nick_names[idx] ? `(${detailInfo.nick_names[idx]})` : null}
                                                {idx !== detailInfo.user_names.length - 1 ? ',  ' : null}
                                            </span>
                                        </span>);
                                })
                            }
                        </span>
                    </div>);
            } else {
                if (detailInfo.user_names && detailInfo.user_names.length === 1) {
                    let userNameEle = (
                        <div className="apply-info-label">
                            <div className="user-info-label edit-name-label">
                                {Intl.get('crm.detail.user', '用户')}:
                            </div>
                            <span
                                className="user-info-text edit-name-wrap">{this.renderUserNameBlock(detailInfo)}</span>
                        </div>);
                    let nickNameEle = (
                        <div className="apply-info-label">
                            <div className="user-info-label edit-name-label">
                                {Intl.get('common.nickname', '昵称')}:
                            </div>
                            <span
                                className="user-info-text edit-name-wrap">{this.renderNickNameBlock(detailInfo)}</span>
                        </div>);
                    return [userNameEle, nickNameEle];
                } else {
                    return (
                        <div className="apply-info-label">
                            <span className="user-info-label">{Intl.get('crm.detail.user', '用户')}:</span>
                            <span className="user-info-text">
                                {_.first(detailInfo.user_names)}
                                <span className="user-nick-name">
                                    ({_.first(detailInfo.nick_names)})
                                </span>
                                ～ {_.last(detailInfo.user_names)}
                                <span className="user-nick-name">
                                    ({_.last(detailInfo.nick_names)})
                                </span>
                            </span>
                        </div>);
                }
            }
        }
    },

    //将昵称设置为编辑状态
    editNickName(e) {
        Trace.traceEvent(e, '点击修改昵称');
        ApplyViewDetailActions.setNickNameEdit(true);
    },

    nickNameSure(e) {
        Trace.traceEvent(e, '保存修改昵称');
        const formData = this.state.formData;
        if (formData.nick_name !== '') {
            ApplyViewDetailActions.saveNickName(formData.nick_name);
            ApplyViewDetailActions.setNickNameEdit(false);
        }
    },

    nickNameCancel(e) {
        Trace.traceEvent(e, '取消修改昵称');
        ApplyViewDetailActions.cancelNickName();
        ApplyViewDetailActions.setNickNameEdit(false);
    },

    //渲染昵称区域，文字状态，修改状态
    renderNickNameBlock(info) {
        if (!this.isUnApproved()) {
            return <span>{info.nick_names[0]}</span>;
        }
        return <div>
            {!this.hasApprovalPrivilege() ? <span>{info.nick_names[0]}</span>
                : (this.state.isNickNameEdit ?
                    (<div className="user-name-wrap">
                        <Form layout='horizontal'>
                            <Validation ref="validation" onValidate={this.handleValidate}>
                                {this.renderNickNameTextField({existCheck: true})}
                            </Validation>
                        </Form>
                        <div className="save-buttons">
                            <span className="iconfont icon-choose" onClick={this.nickNameSure}></span>
                            <span className="iconfont icon-close" onClick={this.nickNameCancel}></span>
                        </div>
                    </div>
                    ) : (
                        <div>
                            <span>{info.nick_names[0]}</span>
                            <Tooltip title={Intl.get('user.apply.detail.change.nickname.title', '修改昵称')}>
                                <span className="iconfont icon-update" onClick={this.editNickName}></span>
                            </Tooltip>
                        </div>
                    )
                )}
        </div>;
    },

    //渲染开通周期
    renderApplyTime(app, custom_setting, isDelay) {
        let displayStartTime = '', displayEndTime = '', displayText = '';
        const UNKNOWN = Intl.get('common.unknown', '未知');
        const FOREVER = Intl.get('common.time.forever', '永久');
        const CONNECTOR = Intl.get('common.time.connector', '至');
        //如果有特殊设置
        if (custom_setting) {
            const start_time = moment(new Date(+custom_setting.time.start_time)).format(oplateConsts.DATE_FORMAT);
            const end_time = moment(new Date(+custom_setting.time.end_time)).format(oplateConsts.DATE_FORMAT);

            if (custom_setting.time.start_time === '0') {
                displayStartTime = '-';
            } else if (start_time === 'Invalid date') {
                displayStartTime = UNKNOWN;
            } else {
                displayStartTime = start_time;
            }
            if (custom_setting.time.end_time === '0') {
                displayEndTime = '-';
            } else if (end_time === 'Invalid date') {
                displayEndTime = UNKNOWN;
            } else {
                displayEndTime = end_time;
            }
            if (displayStartTime === '-' && displayEndTime === '-') {
                displayText = FOREVER;
            } else if (displayStartTime === UNKNOWN && displayEndTime === UNKNOWN) {
                displayText = UNKNOWN;
            } else {
                displayText = displayStartTime + CONNECTOR + displayEndTime;
            }
        } else {
            //如果没有特殊配置
            const start_time = moment(new Date(+app.begin_date)).format(oplateConsts.DATE_FORMAT);
            const end_time = moment(new Date(+app.end_date)).format(oplateConsts.DATE_FORMAT);

            if (app.start_time === '0') {
                displayStartTime = '-';
            } else if (start_time === 'Invalid date') {
                displayStartTime = UNKNOWN;
            } else {
                displayStartTime = start_time;
            }
            if (app.end_time === '0') {
                displayEndTime = '-';
            } else if (end_time === 'Invalid date') {
                displayEndTime = UNKNOWN;
            } else {
                displayEndTime = end_time;
            }
            if (displayStartTime === '-' && displayEndTime === '-') {
                displayText = FOREVER;
            } else if (displayStartTime === UNKNOWN && displayEndTime === UNKNOWN) {
                displayText = UNKNOWN;
            } else {
                displayText = displayStartTime + CONNECTOR + displayEndTime;
            }
        }
        if (isDelay) {
            return displayEndTime + ' ' + Intl.get('apply.delay.endTime', '到期');
        }
        return displayText;
    },

    // 应用app的配置面板
    showAppConfigPanel(app, userType) {
        ApplyViewDetailActions.showAppConfigPanel(app);
        appConfig.user_type = (userType === '1' ? Intl.get('common.trial.official', '正式用户') : Intl.get('common.trial.user', '试用用户'));
        appConfig.config_name = (userType === '1' ? Intl.get('common.trial.official', '正式用户') : Intl.get('common.trial.user', '试用用户'));
        var appDefaultInfo = this.state.appDefaultInfo;
        let appId = _.map(appDefaultInfo, 'client_id');
        let index = _.indexOf(appId, app.app_id);
        if (index !== -1 && appDefaultInfo[index].id !== '') {
            appConfig.id = appDefaultInfo[index].id;
        }
        this.setState({
            appConfig: appConfig
        });
    },

    // 渲染备注
    renderComment() {
        const detailInfo = this.state.detailInfoObj.info;
        if (detailInfo.comment) {
            return (
                <div className="common-info-block apply-info-block">
                    <div className="apply-info-content">
                        <div className="apply-info-label">
                            <span className="user-info-label">{Intl.get('common.remark', '备注')}:</span>
                            <span className="user-info-text">{detailInfo.comment}</span>
                        </div>
                    </div>
                </div>);
        } else {
            return null;
        }
    },
    //渲染延期多应用的table
    renderMultiAppDelayTable(detailInfo){
        let columns = [
            {
                title: Intl.get('common.app', '应用'),
                dataIndex: 'client_name',
                className: 'apply-detail-th'
            }, {
                title: Intl.get('user.time.end', '到期时间'),
                dataIndex: 'start_time',
                className: 'apply-detail-th',
                render: (text, app, index) => {
                    return (
                        <span className="desp_time time-bar">
                            {this.renderApplyTime(app, null, true)}
                        </span>);
                }
            }];
        //角色的展示
        if (hasPrivilege('GET_APP_EXTRA_GRANTS')) {//待审状态，并且有获取应用角色的权限
            columns.push({
                title: Intl.get('user.apply.detail.table.role', '角色'),
                dataIndex: 'rolesNames',
                className: 'apply-detail-th',
                render: (text, app, index) => {
                    let rolesNames = app.rolesNames;
                    if (_.get(rolesNames, '[0]')) {
                        return rolesNames.map((item) => {
                            return (
                                <div key={item}>{item}</div>
                            );
                        });
                    }
                }
            });
        }
        return (<AntcTable dataSource={detailInfo.apps}
            bordered={true}
            pagination={false}
            columns={columns}/>);
    },


    renderAppTable() {
        const detailInfo = this.state.detailInfoObj.info;

        return (<AntcTable dataSource={detailInfo.apps}
            bordered={true}
            pagination={false}
            columns={this.getTableColunms()}/>);


    },
    // 渲染应用的名称、数量和周期
    renderMultiAppTable(detailInfo, isDelay) {
        const appsSetting = this.appsSetting;
        return (
            <ul className="applist-container">
                {
                    detailInfo.apps && detailInfo.apps.map((app) => {
                        //如果有应用的特殊配置，使用特殊配置
                        //没有特殊配置，使用申请单的配置
                        const custom_setting = appsSetting[app.app_id];
                        return (
                            <li key={app.app_id}>
                                <span className='apply-app-name'>{app.client_name}</span>
                                <span className="desp_time time-bar">
                                    {isDelay ? this.renderApplyTime(app, null, true) : null}
                                </span>
                            </li>
                        );
                    })
                }
            </ul>
        );
    },
    getTableColunms(){
        const appsSetting = this.appsSetting;
        const isExistUserApply = this.isExistUserApply();
        let columns = [
            {
                title: Intl.get('common.app', '应用'),
                dataIndex: 'client_name',
                className: 'apply-detail-th'
            }];
        //数量
        if (isExistUserApply) {
            columns.push({
                title: Intl.get('common.app.count', '数量'),
                dataIndex: 'number',
                className: 'apply-detail-th',
                render: (text, app, index) => {
                    //获取开通个数
                    const custom_setting = appsSetting[app.app_id];
                    //数字
                    let number;
                    if (custom_setting) {
                        number = custom_setting.number && custom_setting.number.value;
                    } else {
                        number = app.number || 1;
                    }
                    return (
                        <span>{number}</span>
                    );
                }
            });
        }
        columns.push({
            title: Intl.get('user.apply.detail.table.time','周期'),
            dataIndex: 'start_time',
            className: 'apply-detail-th',
            render: (text, app, index) => {
                //如果有应用的特殊配置，使用特殊配置
                //没有特殊配置，使用申请单的配置
                const custom_setting = appsSetting[app.app_id];
                return (
                    <span className="desp_time time-bar">
                        {this.renderApplyTime(app, custom_setting)}
                    </span>);
            }
        });
        return columns;
    },
    // 渲染应用的名称、数量、周期、角色和权限
    renderAppTableRolePermission() {
        const detailInfo = this.state.detailInfoObj.info;
        // 判断是否显示权限项
        let permissionNameIndex = 'false';
        let appsLen = (detailInfo.apps && detailInfo.apps.length) || 0;
        for (let i = 0; i < appsLen; i++) {
            permissionNameIndex = _.has(detailInfo.apps[i], 'permissionsNames') && detailInfo.apps[i].permissionsNames.length > 0;
            if (permissionNameIndex) {
                break;
            }
        }
        const appsSetting = this.appsSetting;
        let columns = this.getTableColunms();
        //角色、权限
        columns.push({
            title: Intl.get('user.apply.detail.table.role','角色'),
            dataIndex: 'roleNames',
            className: 'apply-detail-th',
            render: (text, app, index) => {
                let rolesNames = app.rolesNames;
                if (_.get(rolesNames, '[0]')) {
                    return rolesNames.map((item) => {
                        return (
                            <div key={item}>{item}</div>
                        );
                    });
                }
            }
        });
        if (permissionNameIndex) {
            columns.push({
                title: Intl.get('common.app.auth', '权限'),
                dataIndex: 'permissionsNames',
                className: 'apply-detail-th',
                render: (text, app, index) => {
                    const custom_setting = appsSetting[app.app_id];
                    let permissionsNames = 'permissionsNames' in app ? app.permissionsNames : [];
                    if (typeof permissionsNames === 'string') {
                        permissionsNames = [app.permissionsNames];
                    }
                    return permissionsNames.map((item) => {
                        return (
                            <div key={item}>{item}</div>
                        );
                    });
                }
            });
        }
        return (<AntcTable dataSource={detailInfo.apps}
            bordered={true}
            pagination={false}
            columns={columns}/>);
    },

    //渲染每个应用设置区域
    renderDetailForm(detailInfo) {
        const selectedApps = detailInfo.apps;
        let height = this.getApplyDetailHeight();
        if (height !== 'auto') {
            height = height - AppUserUtil.APPLY_DETAIL_LAYOUT_CONSTANTS_FORM.ORDER_DIV_HEIGHT - AppUserUtil.APPLY_DETAIL_LAYOUT_CONSTANTS_FORM.OPERATION_BTN_HEIGHT;
        }
        if (!this.isUnApproved()) {
            return null;
        }
        //为每个应用特殊配置的组件
        var appComponentProps = {
            showMultiLogin: false,
            selectedApps: selectedApps,
            height: height,
            appsSetting: this.state.appsSetting,
            showUserNumber: true,
            showIsTwoFactor: false,
            onAppPropertyChange: this.onAppPropertyChange
        };
        //已有用户申请，不显示开通个数
        if (this.isExistUserApply()) {
            appComponentProps.showUserNumber = false;
        }

        return (
            <div className="apply_custom_setting_wrap"
                style={{display: this.state.applyIsExpanded ? 'block' : 'none'}}>
                <div className="apply_detail_operate clearfix">
                    {this.renderDetailOperateBtn()}
                </div>
                <AppProperty {...appComponentProps} />
            </div>
        );
    },

    appsSetting: {},

    //当应用选择器数据改变的时候，保存到变量中，提交时使用
    onAppPropertyChange(appsSetting) {
        this.appsSetting = appsSetting;
    },

    //渲染用户申请
    renderApplyUser: function(detailInfo) {
        if (this.state.applyIsExpanded) {
            return null;
        }
        // 判断是否显示权限项
        let permissionNameIndex = 'false';
        let appsLen = (detailInfo.apps && detailInfo.apps.length) || 0;
        for (let i = 0; i < appsLen; i++) {
            permissionNameIndex = _.has(detailInfo.apps[i], 'permissionsNames') && detailInfo.apps[i].permissionsNames.length > 0;
            if (permissionNameIndex) {
                break;
            }
        }
        return (
            <div className="user-info-block apply-user-detail-block apply-info-block">
                <div className="apply-info-content">
                    {this.renderApplyDetailUserNames(detailInfo)}
                    <div className="apply-info-label clearfix">
                        <span className="user-info-label">{Intl.get('common.type', '类型')}:</span>
                        <span className="user-info-text">
                            {detailInfo.account_type === '1' ? Intl.get('common.official', '签约') : Intl.get('common.trial', '试用')}
                        </span>
                    </div>
                    <div className="col-12 apply_detail_apps">
                        <div className="apply_detail_operate clearfix">
                            {this.renderDetailOperateBtn()}
                        </div>
                        {/** 不显示角色和权限的情况：
                         detailInfo.approval_state === '0' &&  !hasPrivilege("GET_APP_EXTRA_GRANTS") 销售人员待审批的情况
                         detailInfo.approval_state === '2'表示是已驳回的应用，
                         detailInfo.approval_state === '3'表示是已撤销的应用，
                         */}
                        {detailInfo.approval_state === '0' && !hasPrivilege('GET_APP_EXTRA_GRANTS') ||
                        detailInfo.approval_state === '2' ||
                        detailInfo.approval_state === '3' ?
                            this.renderAppTable() : this.renderAppTableRolePermission()
                        }
                    </div>
                </div>
            </div>);
    },
    //旧版申请展示
    //销售渲染申请开通状态
    renderDetailChangeStatus: function(detailInfo) {
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    {this.renderApplyUserNames(detailInfo)}
                    {this.renderApplyAppNames(detailInfo)}
                    <div className="apply-info-label">
                        <span className="user-info-label">{Intl.get('common.app.status', '开通状态')}:</span>
                        <span className="user-info-text">
                            {detailInfo.status === '1' ? Intl.get('common.app.status.open', '开启') : Intl.get('common.app.status.close', '关闭')}
                        </span>
                    </div>
                </div>
            </div>
        );
    },
    //新版申请展示
    //销售渲染申请开通状态
    renderMultiAppDetailChangeStatus: function(detailInfo) {
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    <div className="apply-info-label">
                        <span className="user-info-label">{Intl.get('common.app.status', '开通状态')}:</span>
                        <span className="user-info-text">
                            {detailInfo.status === 1 ? Intl.get('common.app.status.open', '开启') : Intl.get('common.app.status.close', '关闭')}
                        </span>
                    </div>
                    {
                        detailInfo.users && detailInfo.users.map((user, idx) => (
                            <div key={idx} className="user-item-container">
                                {this.renderApplyDetailSingleUserName(user)}
                                <div className="col-12 apply_detail_apps">
                                    {
                                        this.renderMultiAppTable(user)
                                    }
                                </div>
                            </div>
                        ))
                    }

                </div>
            </div>
        );
    },

    //渲染销售申请修改密码
    renderDetailChangePassword: function(detailInfo) {
        let selectedDetailItem = this.state.selectedDetailItem;
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    {this.renderApplyUserNames(detailInfo)}
                    {
                        selectedDetailItem.isConsumed === 'true' || !this.hasApprovalPrivilege() ? null : (
                            <Form layout='horizontal'>
                                <Validation ref="validation" onValidate={this.handleValidate}>
                                    <div className="apply-info-label">
                                        <div className="user-info-label password-label">
                                            {Intl.get('common.password', '密码')}:
                                        </div>
                                        {this.renderPasswordBlock()}
                                    </div>
                                    <div className="apply-repassword-container">
                                        {this.renderConfirmPasswordBlock()}
                                    </div>
                                </Validation>
                            </Form>
                        )
                    }
                </div>
            </div>
        );
    },

    renderApplyUserNames: function(detailInfo) {
        let user_ids = detailInfo.user_ids;
        return (
            <div className="apply-info-label">
                <span className="user-info-label">{Intl.get('crm.detail.user', '用户')}:</span>
                <span className="user-info-text">
                    {_.isArray(detailInfo.user_names) && detailInfo.user_names.length ?
                        detailInfo.user_names.map((item, idx) => {
                            return (
                                <span key={idx}>
                                    <a href="javascript:void(0)"
                                        onClick={this.showUserDetail.bind(this, user_ids[idx])}
                                        data-tracename="查看用户详情">{item}</a>
                                    <span className="user-nick-name">
                                        {_.isArray(detailInfo.nick_names) && detailInfo.nick_names[idx] ? `(${detailInfo.nick_names[idx]})` : null}
                                        {idx !== detailInfo.user_names.length - 1 ? ', ' : null}
                                    </span>
                                </span>);
                        }) : null
                    }
                </span>
            </div>);
    },

    //渲染销售申请修改其他信息
    renderDetailChangeOther: function(detailInfo) {
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    {this.renderApplyUserNames(detailInfo)}
                </div>
            </div>
        );
    },

    renderApplyAppNames: function(detailInfo) {
        return (<div className="apply-info-label">
            <span className="user-info-label">{Intl.get('common.app', '应用')}:</span>
            <span className="user-info-text">
                {detailInfo.app_name || ''}
            </span>
        </div>);
    },
    //旧版申请展示
    //渲染用户延期
    renderDetailDelayTime: function(detailInfo) {
        var isRealmAdmin = userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) ||
            userData.hasRole(userData.ROLE_CONSTANS.REALM_OWNER) ||
            userData.hasRole(userData.ROLE_CONSTANS.OPLATE_REALM_ADMIN) ||
            userData.hasRole(userData.ROLE_CONSTANS.OPLATE_REALM_OWNER);
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    {this.renderApplyUserNames(detailInfo)}
                    {this.renderApplyAppNames(detailInfo)}
                    <div className="apply-info-label delay-time-wrap">
                        <div className="user-info-label">{this.renderApplyDelayName()}:</div>
                        <span className="user-info-text">
                            {this.state.isModifyDelayTime ? null : this.renderApplyDelayModifyTime()}
                            {isRealmAdmin ? this.renderModifyDelayTime() : null}
                        </span>
                    </div>
                </div>
            </div>
        );
    },
    //新版申请展示
    //渲染用户延期
    renderMultiAppDetailDelayTime: function(detailInfo) {
        var isRealmAdmin = userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) ||
            userData.hasRole(userData.ROLE_CONSTANS.REALM_OWNER) ||
            userData.hasRole(userData.ROLE_CONSTANS.OPLATE_REALM_ADMIN) ||
            userData.hasRole(userData.ROLE_CONSTANS.OPLATE_REALM_OWNER);
        //是否是待审批
        const isUnApproved = this.isUnApproved();
        let user_type = _.get(detailInfo, 'apps[0].user_type');
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    <div className="apply-info-label delay-time-wrap">
                        <div className="user-info-label label-fix">{this.renderApplyDelayName()}:</div>
                        <span className="user-info-text edit-fix">
                            {this.state.isModifyDelayTime ? null : this.renderApplyDelayModifyTime()}
                            {isRealmAdmin && isUnApproved ? this.renderModifyDelayTime() : null}
                        </span>
                    </div>
                    {user_type ? (
                        <div className="apply-info-label delay-time-wrap">
                            <div className="user-info-label label-fix">{Intl.get('user.user.type', '用户类型')}:</div>
                            <span className="user-info-text edit-fix">
                                {user_type === '正式用户' ? Intl.get('user.signed.user', '签约用户') : Intl.get('common.trial.user', '试用用户')}
                            </span>
                        </div>
                    ) : null}
                    {
                        detailInfo.users && detailInfo.users.map((user, idx) => {
                            return (
                                <div className="col-12 apply_detail_apps delay_detail_apps" key={idx}>
                                    <div className="apply_detail_operate clearfix">
                                        {this.renderDetailOperateBtn()}
                                    </div>
                                    {this.renderApplyDetailSingleUserName(user)}
                                    {this.renderMultiAppDelayTable(detailInfo)}
                                </div>);
                        })
                    }
                </div>
            </div>
        );
    },

    //显示用户详情
    showUserDetail: function(userId) {
        ApplyViewDetailActions.showUserDetail(userId);
    },

    //延期时间数字修改
    delayTimeNumberModify: function(value) {
        ApplyViewDetailActions.delayTimeNumberModify(value);
    },

    //延期时间单位改变
    delayTimeUnitModify: function(unit) {
        ApplyViewDetailActions.delayTimeUnitModify(unit);
    },

    //将延迟时间设置为修改状态
    setDelayTimeModify(e) {
        Trace.traceEvent(e, '点击修改延期时间');
        ApplyViewDetailActions.setDelayTimeModify(true);
    },

    //保存修改的延迟时间
    saveModifyDelayTime(e) {
        Trace.traceEvent(e, '保存修改延期时间');
        if (this.state.formData.delayTimeUnit === SELECT_CUSTOM_TIME_TYPE) {
            ApplyViewDetailActions.saveModifyDelayTime(this.state.formData.end_date);
        } else {
            ApplyViewDetailActions.saveModifyDelayTime(this.getDelayTimeMillis());
        }

    },

    cancelModifyDelayTime(e) {
        Trace.traceEvent(e, '取消修改延期时间');
        ApplyViewDetailActions.cancelModifyDelayTime();
    },

    // 获取修改后的时间
    getDelayTimeMillis: function() {
        //延期周期
        var delayTimeUnit = this.state.formData.delayTimeUnit;
        var delayTimeNumber = this.state.formData.delayTimeNumber;
        var millis = moment.duration(+delayTimeNumber, delayTimeUnit).valueOf();
        return millis;
    },

    // 将延期时间设置为截止时间（具体到xx年xx月xx日）
    setDelayDeadlineTime(value) {
        let timestamp = value && value.valueOf() || '';
        ApplyViewDetailActions.setDelayDeadlineTime(timestamp);
    },

    // 设置不可选时间的范围
    disabledDate(current) {
        return current && current.valueOf() < Date.now();
    },
    //是否是待审批
    isUnApproved() {
        return ['false', '0'].includes(_.get(this.state, 'detailInfoObj.info.approval_state'));
    },
    renderModifyDelayTime() {
        if (!this.isUnApproved()) {
            return;
        }
        return this.state.isModifyDelayTime ? (
            <div className="modify-delay-time-style">
                {this.state.formData.delayTimeUnit === SELECT_CUSTOM_TIME_TYPE ? (
                    <DatePicker placeholder="请选择到期时间"
                        onChange={this.setDelayDeadlineTime}
                        disabledDate={this.disabledDate}
                        defaultValue={moment(+this.state.formData.end_date)}
                        allowClear={false}
                        showToday={false}
                    />
                ) : (
                    <InputNumber
                        value={this.state.formData.delayTimeNumber}
                        onChange={this.delayTimeNumberModify}
                        min={1}
                    />
                )}

                <Select
                    value={this.state.formData.delayTimeUnit}
                    onChange={this.delayTimeUnitModify}
                    className="select-modify-unit"
                >
                    <Option value="days"><ReactIntl.FormattedMessage id="common.time.unit.day"
                        defaultMessage="天"/></Option>
                    <Option value="weeks"><ReactIntl.FormattedMessage id="common.time.unit.week"
                        defaultMessage="周"/></Option>
                    <Option value="months"><ReactIntl.FormattedMessage id="common.time.unit.month" defaultMessage="月"/></Option>
                    <Option value="years"><ReactIntl.FormattedMessage id="common.time.unit.year"
                        defaultMessage="年"/></Option>
                    <Option value="custom"><ReactIntl.FormattedMessage id="user.time.custom"
                        defaultMessage="自定义"/></Option>
                </Select>
                <span style={{'marginLeft': '10px'}} className="iconfont icon-choose"
                    onClick={this.saveModifyDelayTime}></span>
                <span style={{'marginLeft': '10px'}} className="iconfont icon-close"
                    onClick={this.cancelModifyDelayTime}></span>
            </div>
        ) : (
            <Tooltip title={Intl.get('user.apply.detail.change.delay.time', '修改延期时间')}>
                <span className="iconfont icon-update" onClick={this.setDelayTimeModify}></span>
            </Tooltip>
        );
    },

    //显示客户详情
    showCustomerDetail: function(customerId) {
        ApplyViewDetailActions.showCustomerDetail(customerId);
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightPanel
            }
        });
    },

    //密码的验证
    checkPassword: function(rule, value, callback) {
        if (value && value.match(passwordRegex)) {
            var passStrength = getPassStrenth(value);
            this.setState({
                passStrength: passStrength
            });
            if (this.state.formData.confirmPassword) {
                this.refs.validation.forceValidate(['confirmPassword']);
            }
            callback();
        } else {
            this.setState({
                passStrength: {
                    passBarShow: false,
                    passStrength: 'L'
                }
            });
            callback(Intl.get('common.password.validate.rule', '请输入6-18位数字、字母、符号组成的密码'));
        }
    },

    //渲染密码区域
    renderPasswordBlock: function() {
        var status = this.state.status;
        var formData = this.state.formData;
        return (
            <div className="apply-change-password-style">
                <FormItem
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                    validateStatus={this.renderValidateStyle('apply_detail_password')}
                    help={status.apply_detail_password.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.apply_detail_password.errors && status.apply_detail_password.errors.join(','))}
                >
                    <Validator
                        rules={[{validator: this.checkPassword}]}>
                        <Input
                            id="apply_detail_password"
                            name="apply_detail_password"
                            type="password"
                            placeholder={Intl.get('common.password.compose.rule', '6-18位字符(由数字，字母，符号组成)')}
                            value={formData.apply_detail_password}
                            autoComplete="off"
                        />
                    </Validator>
                </FormItem>
                {
                    this.state.passStrength.passBarShow ? (
                        <PassStrengthBar passStrength={this.state.passStrength.passStrength}/>) : null
                }
            </div>
        );

    },

    //渲染确认密码
    renderConfirmPasswordBlock: function() {
        var status = this.state.status;
        var formData = this.state.formData;
        return (<div className="apply-change-password-style">
            <FormItem
                labelCol={{span: 0}}
                wrapperCol={{span: 24}}
                validateStatus={this.renderValidateStyle('confirmPassword')}
                help={status.confirmPassword.errors ? status.confirmPassword.errors.join(',') : null}
            >
                <Validator rules={[{
                    required: true,
                    whitespace: true,
                    message: Intl.get('common.password.unequal', '两次输入密码不一致！')
                }, {validator: this.checkConfirmPassword}]}
                >
                    <Input
                        name="confirmPassword"
                        type="password"
                        autoComplete="off"
                        value={formData.confirmPassword}
                        placeholder={Intl.get('common.input.confirm.password', '请输入确认密码')}
                        maxLength={18}
                    />
                </Validator>
            </FormItem>
        </div>);
    },

    //确认密码验证
    checkConfirmPassword: function(rule, value, callback) {
        if (value && value !== this.state.formData.apply_detail_password) {
            callback(Intl.get('common.password.unequal', '两次输入密码不一致！'));
        } else {
            callback();
        }
    },

    //延期，修改应用状态，修改密码，渲染“所属客户”
    //如果只有一个客户，这里才渲染，多个客户的情况，node端不返回前端数据（没有customer_name和customer_id）
    //早期的数据只有customer_name（只显示名字）
    //后期的数据有customer_id（有customer_id时，能点击查看详情）
    renderDelayStatusPwdCustomerBlock() {
        var detailInfo = this.state.detailInfoObj.info;
        if (detailInfo.customer_name) {
            if (!detailInfo.customer_id) {
                return <dl className="dl-horizontal detail_item">
                    <dt><ReactIntl.FormattedMessage id="common.belong.customer" defaultMessage="所属客户"/></dt>
                    <dd>{detailInfo.customer_name}</dd>
                </dl>;
            } else {
                return <dl className="dl-horizontal detail_item">
                    <dt><ReactIntl.FormattedMessage id="common.belong.customer" defaultMessage="所属客户"/></dt>
                    <dd><a href="javascript:void(0)"
                        onClick={this.showCustomerDetail.bind(this, detailInfo.customer_id)}
                        data-tracename="查看客户详情">{detailInfo.customer_name}</a>
                    </dd>
                </dl>;
            }
        }
        return null;
    },

    // 渲染延期时间前的标题
    renderApplyDelayName() {
        let delayName = '';
        if (this.state.formData.delayTimeUnit === SELECT_CUSTOM_TIME_TYPE) {
            delayName = Intl.get('user.time.end', '到期时间');
        } else {
            delayName = Intl.get('common.delay.time', '延期时间');
        }
        return delayName;
    },

    renderApplyDelayModifyTime() {
        let delayTime;
        if (this.state.formData.delayTimeUnit === SELECT_CUSTOM_TIME_TYPE) {
            delayTime = moment(new Date(+this.state.formData.end_date)).format(oplateConsts.DATE_FORMAT);
        } else {
            delayTime = getDelayDisplayTime(this.getDelayTimeMillis());
        }
        return delayTime;
    },

    //渲染详情内容区域
    renderDetailCenter(detailInfo) {
        if (detailInfo.type === 'apply_pwd_change') {
            return this.renderDetailChangePassword(detailInfo);
        } else if (detailInfo.type === 'apply_sth_else') {
            return this.renderDetailChangeOther(detailInfo);
        }
        //旧版申请展示 
        else if (detailInfo.type === 'apply_grant_delay') {
            return this.renderDetailDelayTime(detailInfo);
        } else if (detailInfo.type === 'apply_grant_status_change') {
            return this.renderDetailChangeStatus(detailInfo);
        }
        //新版申请展示
        else if (detailInfo.type === APPLY_TYPES.DELAY) {
            return this.renderMultiAppDetailDelayTime(detailInfo);
        } else if (detailInfo.type === APPLY_TYPES.DISABLE) {
            return this.renderMultiAppDetailChangeStatus(detailInfo);
        } else {
            return this.renderApplyUser(detailInfo);
        }
    },

    //添加一条回复
    addReply: function(e) {
        Trace.traceEvent(e, '点击回复按钮');
        //如果ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        //构造提交数据
        var submitData = {
            apply_id: this.props.detailItem.id,
            comment: $.trim(this.state.formData.comment),
            notice_url: getApplyDetailUrl(this.state.detailInfoObj.info)
        };
        if (!submitData.comment) {
            ApplyViewDetailActions.showReplyCommentEmptyError();
            return;
        }
        //提交数据
        ApplyViewDetailActions.addReply(submitData);
    },

    //渲染回复表单loading,success,error
    renderReplyFormResult: function() {
        var replyFormInfo = this.state.replyFormInfo;
        if (replyFormInfo.result === 'loading') {
            return <Icon type="loading"/>;
        }
        if (replyFormInfo.result === 'error') {
            return <Alert
                message={replyFormInfo.errorMsg}
                type="error"
                showIcon={true}
            />;
        }
        return null;
    },

    //备注 输入框改变时候触发
    commentInputChange(event) {
        //如果添加回复的ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        this.setField('comment', event);
        var val = $.trim(event.target.value);
        if (val) {
            ApplyViewDetailActions.hideReplyCommentEmptyError();
        }
    },

    // 确认撤销申请
    saleConfirmBackoutApply(e) {
        const state = this.state;
        Trace.traceEvent(e, '点击撤销申请按钮');
        state.showBackoutConfirm = true;
        this.setState(state);
    },

    // 隐藏撤销申请的模态框
    hideBackoutModal: function() {
        const state = this.state;
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-cancel'), '点击取消按钮');
        state.showBackoutConfirm = false;
        this.setState(state);
    },

    // 撤销申请
    saleBackoutApply(e) {
        e.stopPropagation();
        Trace.traceEvent(e, '点击撤销按钮');
        const state = this.state;
        state.showBackoutConfirm = false;
        this.setState(state);
        let backoutObj = {
            apply_id: this.props.detailItem.id,
            remark: $.trim(this.state.formData.comment),
            notice_url: getApplyDetailUrl(this.state.detailInfoObj.info)
        };
        ApplyViewDetailActions.saleBackoutApply(backoutObj);
    },

    // 撤销申请的模态框
    renderBackoutApply() {
        return (
            <Modal
                show={this.state.showBackoutConfirm}
                onHide={this.hideBackoutModal}
                container={this}
                aria-labelledby="contained-modal-title"
                className="backout-apply"
            >
                <Modal.Header closeButton>
                    <Modal.Title />
                </Modal.Header>
                <Modal.Body>
                    <p><ReactIntl.FormattedMessage id="user.apply.detail.modal.content" defaultMessage="是否撤销此申请？"/></p>
                </Modal.Body>
                <Modal.Footer>
                    {
                        this.state.backApplyResult.loading ?
                            <Icon type="loading"/> :
                            <BootstrapButton className="btn-ok"
                                onClick={this.saleBackoutApply}><ReactIntl.FormattedMessage
                                    id="user.apply.detail.modal.ok" defaultMessage="撤销"/></BootstrapButton>
                    }
                    <BootstrapButton className="btn-cancel" onClick={this.hideBackoutModal}><ReactIntl.FormattedMessage
                        id="common.cancel" defaultMessage="取消"/></BootstrapButton>
                </Modal.Footer>
            </Modal>
        );
    },

    getApplyResultDscr(detailInfoObj) {
        let resultDscr = '';
        switch (this.props.detailItem.approval_state) {
            case '1':
                resultDscr = Intl.get('user.apply.detail.pass', '通过申请');
                break;
            case '2':
                resultDscr = Intl.get('user.apply.detail.reject', '驳回申请');
                break;
            case '3':
                resultDscr = Intl.get('user.apply.detail.backout', '撤销申请');
                break;
        }
        return resultDscr;
    },

    getNoSecondTimeStr(time) {
        return time ? moment(time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT) : '';
    },

    //渲染详情底部区域
    renderDetailBottom() {
        var selectedDetailItem = this.props.detailItem;
        var detailInfoObj = this.state.detailInfoObj.info;
        var showBackoutApply = detailInfoObj.presenter_id === userData.getUserData().user_id;
        //是否显示通过驳回
        var isRealmAdmin = userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) ||
            userData.hasRole(userData.ROLE_CONSTANS.REALM_OWNER) ||
            userData.hasRole(userData.ROLE_CONSTANS.OPLATE_REALM_ADMIN) ||
            userData.hasRole(userData.ROLE_CONSTANS.OPLATE_REALM_OWNER);
        //是否审批
        let isConsumed = !this.isUnApproved();
        return (
            <div className="approval_block">
                <Row className="approval_person clearfix">
                    <Col span={10}>
                        <span className="approval-info-label">
                            {this.getNoSecondTimeStr(selectedDetailItem.time)}
                        </span>
                        <span className="approval-info-label">
                            {selectedDetailItem.presenter || ''}
                            {Intl.get('crm.109', '申请')}
                        </span>
                    </Col>
                    <Col span={14}>
                        {isConsumed ? (
                            <div className="pull-right">
                                <span className="approval-info-label">
                                    {this.getNoSecondTimeStr(selectedDetailItem.approval_time)}
                                </span>
                                <span className="approval-info-label">
                                    {detailInfoObj.approval_person || ''}
                                    {this.getApplyResultDscr(detailInfoObj)}
                                </span>
                            </div>) : (<div className="pull-right">
                            {hasPrivilege('APPLY_CANCEL') && showBackoutApply ?
                                this.state.backApplyResult.loading ?
                                    <Icon type="loading"/> :
                                    <Button type="primary" className="btn-primary-sure" size="small"
                                        onClick={this.saleConfirmBackoutApply}>
                                        {Intl.get('user.apply.detail.backout', '撤销申请')}
                                    </Button>
                                : null}
                            {isRealmAdmin ? (
                                <Button type="primary" className="btn-primary-sure" size="small"
                                    onClick={this.submitApprovalForm.bind(this, '1')}>
                                    {Intl.get('user.apply.detail.button.pass', '通过')}
                                </Button>) : null}
                            {isRealmAdmin ? (
                                <Button type="primary" className="btn-primary-sure" size="small"
                                    onClick={this.submitApprovalForm.bind(this, '2')}>
                                    {Intl.get('common.apply.reject', '驳回')}
                                </Button>) : null}
                        </div>)}
                    </Col>
                </Row>
            </div>);
    },

    // 用户名重名时
    renderDuplicationName(errorMsg) {
        this.toggleApplyExpanded(false);
        this.renderEditUserName();
        message.warn(errorMsg || Intl.get('user.apply.valid.user.name', '用户名已存在，请重新命名该用户！'), 3);
    },

    // 用户名没有更改，只改用户数量为1时，需要发送用户名的校验
    checkUserName() {
        let obj = {
            user_name: $.trim(this.state.detailInfoObj.info.user_names[0]),
            customer_id: this.state.detailInfoObj.info.customer_id
        };
        let userInfoData = [], errMsg = '';
        // 同步请求，得到结果后，进行判断是否重名
        $.ajax({
            url: '/rest/apply/user_name/valid',
            dataType: 'json',
            type: 'get',
            async: false,
            data: obj,
            success: (data) => {
                userInfoData = data;
            },
            error: (errorMsg) => {
                errMsg = errorMsg.responseJSON;
            }
        });
        if (errMsg) {
            return errMsg;
        } else {
            return userInfoData.length;
        }
    },

    submitApprovalForm(approval) {
        const state = this.state;
        if (approval === '1') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击通过按钮');
        } else if (approval === '2') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击驳回按钮');
        }
        const realSubmit = () => {
            //详情信息
            var detailInfo = this.state.detailInfoObj.info;
            //获取用户选择的审批状态
            var approval_state = (approval || this.approval_state_selected) + '';
            //保存以备重试时使用
            this.approval_state_selected = approval_state;
            //左侧选中的申请单
            var selectedDetailItem = this.props.detailItem;
            //要提交的应用配置
            var products = [];
            //是否是已有用户申请
            var isExistUserApply = this.isExistUserApply();
            let applyMaxNumber = this.getApplyMaxUserNumber();
            let changeMaxNumber = this.getChangeMaxUserNumber();
            //选中的应用，添加到提交参数中
            _.each(this.appsSetting, function(app_config, app_id) {
                //当前应用配置
                var appObj = {
                    //应用id
                    client_id: app_id,
                    //角色
                    roles: app_config.roles,
                    //权限
                    permissions: app_config.permissions,
                    //到期停用
                    over_draft: app_config.over_draft.value,
                    //开始时间
                    begin_date: app_config.time.start_time,
                    //结束时间
                    end_date: app_config.time.end_time,
                };
                //已有用户申请没法指定个数
                if (!isExistUserApply) {
                    appObj.number = app_config.number.value;
                }
                products.push(appObj);
            });
            var appList = detailInfo.apps;
            //如果是开通用户，需要先检查是否有角色设置，如果没有角色设置，给出一个警告
            //如果已经有这个警告了，就是继续提交的逻辑，就跳过此判断
            if (
                approval === '1' && !this.state.rolesNotSettingModalDialog.continueSubmit &&
                (detailInfo.type === CONSTANTS.APPLY_USER_OFFICIAL ||
                detailInfo.type === CONSTANTS.APPLY_USER_TRIAL ||
                detailInfo.type === CONSTANTS.EXIST_APPLY_FORMAL ||
                detailInfo.type === CONSTANTS.EXIST_APPLY_TRIAL)
            ) {
                //遍历每个应用，找到没有设置角色的应用
                var rolesNotSetAppNames = _.chain(products).filter((obj) => {
                    return obj.roles.length === 0;
                }).map('client_id').map((app_id) => {
                    var appInfo = _.find(appList, (appObj) => appObj.app_id === app_id);
                    return appInfo && appInfo.app_name || '';
                }).filter((appName) => appName !== '').value();
                //当数组大于0的时候，才需要提示模态框
                if (rolesNotSetAppNames.length) {
                    ApplyViewDetailActions.setRolesNotSettingModalDialog({
                        show: true,
                        appNames: rolesNotSetAppNames
                    });
                    return;
                }
            }

            // 点击通过时，当用户数量大于1，并且改为用户数量为1时
            if (approval !== '2' && applyMaxNumber > changeMaxNumber && changeMaxNumber === 1) {
                if (this.state.isChangeUserName) { // 更改用户名时，校验
                    if (UserNameTextfieldUtil.userInfo.length) { // 同一客户下，用户名重名时
                        this.renderDuplicationName();
                        return;
                    }
                } else { // 没有更改用户名时（之前没有触发校验，此处需要先通过接口校验用户名是否存在）
                    let checkUserData = this.checkUserName();
                    if (_.isNumber(checkUserData) && checkUserData > 0) {
                        //用户名已存在的提示
                        this.renderDuplicationName();
                        return;
                    } else if (_.isString(checkUserData)) {
                        //用户名校验接口报错的提示
                        this.renderDuplicationName(checkUserData);
                        return;
                    }
                }
            }


            //准备提交数据
            var obj = {
                approval: approval_state + '',
                comment: this.state.formData.comment,
                message_id: this.props.detailItem.id,
                products: JSON.stringify(products),
                //审批类型
                type: detailInfo.type,
                //从邮件转到界面的链接地址
                notice_url: getApplyDetailUrl(this.state.detailInfoObj.info),
            };
            // 延期时间(需要修改到期时间的字段)
            if (detailInfo.type === 'apply_grant_delay') {
                if (this.state.formData.delayTimeUnit === SELECT_CUSTOM_TIME_TYPE) {
                    obj.end_date = this.state.formData.end_date;
                } else {
                    obj.delay_time = this.state.formData.delay_time;
                }
            }
            if (_.get(this.props.detailItem, 'message.type') === APPLY_TYPES.DELAY) {
                const apps = _.get(this.state.detailInfoObj, 'info.apps');
                if (apps.length > 0) {
                    obj.data = JSON.stringify(
                        apps.map(x => {
                            const item = {
                                ...x
                            };
                            if (_.get(this.state, 'formData.delayTimeUnit') === 'custom') {
                                item.end_date = _.get(this.state, 'formData.end_date');
                                delete item.delay;
                            }
                            else {
                                item.delay = _.get(this.state, 'formData.delay_time');
                                item.end_date = moment(x.end_date).subtract(x.delay, 'ms').add(item.delay, 'ms').valueOf();
                            }
                            let appConfig = this.appsSetting[item.client_id];
                            //角色、权限
                            if(appConfig){
                                item.roles = _.map(appConfig.roles, roleId => {
                                    return {role_id: roleId};
                                });
                                item.permissions = _.map(appConfig.permissions, permissionId => {
                                    return {permission_id: permissionId};
                                });
                            }
                            delete item.app_id;
                            delete item.app_name;
                            return item;
                        })
                    );
                }
            }

            //修改密码
            if (detailInfo.type === 'apply_pwd_change') {
                obj.password = AppUserUtil.encryptPassword(this.state.formData.apply_detail_password);
            }
            //如果是已有用户选择开通，则不提交user_name和number
            if (!isExistUserApply) {
                obj.user_name = $.trim(this.state.formData.user_name);
                obj.nick_name = this.state.formData.nick_name;
            }
            ApplyViewDetailActions.submitApply(obj);
        };
        var validation = this.refs.validation;
        if (!validation) {
            realSubmit();
        } else if (approval === '2') {
            //当点击驳回按钮时，不用对输入的密码进行校验
            //如果之前密码验证有错误提示，先将错误提示去掉
            state.status.apply_detail_password = {};
            state.status.confirmPassword = {};
            this.setState({status: state.status});
            realSubmit();
        } else {
            validation.validate((valid) => {
                if (!valid) {
                    return;
                }
                realSubmit();
            });
        }
    },

    viewApprovalResult(e) {
        Trace.traceEvent(e, '查看审批结果');
        this.getApplyDetail(this.props.detailItem);
    },

    //我再改改
    cancelShowRolesModal(e) {
        Trace.traceEvent(e, '点击了我再改改');
        ApplyViewDetailActions.setRolesNotSettingModalDialog({
            show: false,
            appNames: []
        });
        return;
    },

    //继续提交
    continueSubmit(e) {
        Trace.traceEvent(e, '点击了继续');
        ApplyViewDetailActions.rolesNotSettingContinueSubmit();
        setTimeout(() => {
            this.submitApprovalForm();
        });
    },

    renderApplyFormResult() {
        //如果没有进行角色设置，显示角色设置的模态框
        if (this.state.rolesNotSettingModalDialog.show) {
            return <Modal
                container={this}
                show={true}
                aria-labelledby="contained-modal-title"
            >
                <Modal.Body>
                    <div className="approval-confirm-tip">
                        <p>
                            {this.state.rolesNotSettingModalDialog.appNames.join('、')}
                            <ReactIntl.FormattedMessage id="user.apply.detail.role.modal.content"
                                defaultMessage="中，没有为用户分配角色，是否继续"/>
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button type="primary" className="roles-notset-btn-continue"
                        onClick={this.continueSubmit}><ReactIntl.FormattedMessage
                            id="user.apply.detail.role.modal.continue" defaultMessage="继续"/></Button>
                    <Button type="ghost" onClick={this.cancelShowRolesModal}><ReactIntl.FormattedMessage
                        id="user.apply.detail.role.modal.cancel" defaultMessage="我再改改"/></Button>
                </Modal.Footer>
            </Modal>;
        }
        if (this.state.applyResult.submitResult === 'loading') {
            return (
                <Modal
                    container={this}
                    show={true}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Body>
                        <div className="approval_loading">
                            <Spinner />
                            <p><ReactIntl.FormattedMessage id="user.apply.detail.submit.sending"
                                defaultMessage="审批中..."/></p>
                        </div>
                    </Modal.Body>
                </Modal>
            );
        }
        if (this.state.applyResult.submitResult === 'success') {
            return (
                <div className="approval_result">
                    <div className="approval_result_wrap">
                        <div className="bgimg"></div>
                        <p><ReactIntl.FormattedMessage id="user.apply.detail.submit.success" defaultMessage="审批成功"/></p>
                        <Button type="ghost" onClick={this.viewApprovalResult}><ReactIntl.FormattedMessage
                            id="user.apply.detail.show.content" defaultMessage="查看审批结果"/></Button>
                    </div>
                </div>
            );
        }
        if (this.state.applyResult.submitResult === 'error') {
            return (
                <div className="approval_result">
                    <div className="approval_result_wrap">
                        <div className="bgimg error"></div>
                        <p>{this.state.applyResult.errorMsg}</p>
                        <Button type="ghost" className="re_send"
                            onClick={this.reSendApproval}><ReactIntl.FormattedMessage id="common.retry"
                                defaultMessage="重试"/></Button>
                        <Button type="ghost" className="cancel_send"
                            onClick={this.cancelSendApproval}><ReactIntl.FormattedMessage id="common.cancel"
                                defaultMessage="取消"/></Button>
                    </div>
                </div>
            );
        }
        return null;
    },

    //重新发送
    reSendApproval(e) {
        Trace.traceEvent(e, '点击重试按钮');
        this.submitApprovalForm();
    },

    //取消发送
    cancelSendApproval(e) {
        Trace.traceEvent(e, '点击取消按钮');
        ApplyViewDetailActions.cancelSendApproval();
    },

    // 申请应用的配置界面
    showAppConfigRightPanle() {
        ApplyViewDetailActions.showAppConfigRightPanle();
    },

    // 应用配置取消保存
    handleCancel() {
        ApplyViewDetailActions.handleCancel();
    },

    // 应用配置保存成功时
    handleSaveAppConfig(appId) {
        ApplyViewDetailActions.handleSaveAppConfig();
        this.getApplyDetail(this.props.detailItem);
        //this.getAppConfigExtra( appId ,appConfig.user_type);
    },

    // 假设没有默认配置，默认配置成功
    getAppConfigExtra(client_id, user_type) {
        ApplyViewDetailActions.getApplyAppDefaultInfo({client_id, user_type});
    },

    // 获取申请时用户数的最大值
    getApplyMaxUserNumber() {
        const detailInfoApps = this.state.detailInfoObj.info.apps;
        return _.max(_.map(detailInfoApps, 'number'));
    },

    ShowCustomerUserListPanel(data) {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    },

    closeCustomerUserListPanel() {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    },

    // 获取更改或是没有更改的用户数最大值
    getChangeMaxUserNumber() {
        let userNumber = [];
        _.each(this.appsSetting, (custom_setting) => {
            if (custom_setting.number && custom_setting.number.value) {
                userNumber.push(custom_setting.number.value);
            }
        });
        return _.max(userNumber);
    },
    renderApplyDetailSingleUserName(userItem) {
        return (
            <div className="username-container">
                <span
                    className="username"
                    onClick={this.showUserDetail.bind(this, userItem.user_id)}
                    data-tracename="查看用户详情">
                    {userItem.user_name}
                </span>
                {
                    userItem.nickname ?
                        <span className="nickname">({userItem.nickname})</span> : null
                }
            </div>
        );
    },
    render() {
        //如果获取左侧列表失败了，则显示空
        if (this.props.showNoData) {
            return null;
        }
        //已有用户申请添加一个特殊的class
        var is_exist_user = this.isExistUserApply();

        var cls = classNames({
            'is_exist_user': is_exist_user,
            'col-md-8': true,
            'app_user_manage_apply_detail_wrap': true
        });
        let customerOfCurUser = this.state.customerOfCurUser;
        return (
            <div className={cls} data-tracename="审批详情界面">
                {this.renderApplyDetailLoading()}
                {this.renderApplyDetailError()}
                {this.renderApplyDetailNodata()}
                {
                    !this.state.detailInfoObj.loading ?
                        this.renderApplyDetailInfo() : null
                }
                {this.renderApplyFormResult()}
                {this.renderBackoutApply()}
                {this.state.showRightPanel && this.state.rightPanelUserId ?
                    <RightPanel
                        className="apply_detail_rightpanel app_user_manage_rightpanel white-space-nowrap right-panel detail-v3-panel"
                        showFlag={this.state.showRightPanel}>
                        {
                            this.state.rightPanelUserId ? <UserDetail
                                userId={this.state.rightPanelUserId}
                            /> : null
                        }
                        {
                            this.state.rightPanelAppConfig ?
                                <UserTypeConfigForm
                                    togglePageChange={this.showAppConfigRightPanle}
                                    addUserTypeConfigInfoShow={true}
                                    appId={this.state.rightPanelAppConfig.app_id}
                                    appName={this.state.rightPanelAppConfig.app_name}
                                    item={this.state.appConfig}
                                    handleCancel={this.handleCancel}
                                    handleSaveAppConfig={this.handleSaveAppConfig}
                                /> : null
                        }
                    </RightPanel> : null}
                {/*该客户下的用户列表*/}
                {
                    this.state.isShowCustomerUserListPanel ?
                        <RightPanel
                            className="customer-user-list-panel"
                            showFlag={this.state.isShowCustomerUserListPanel}
                        >
                            {this.state.isShowCustomerUserListPanel ?
                                <AppUserManage
                                    customer_id={customerOfCurUser.id}
                                    hideCustomerUserList={this.closeCustomerUserListPanel}
                                    customer_name={customerOfCurUser.name}
                                /> : null
                            }
                        </RightPanel> : null
                }

            </div>

        );
    },
});
export default ApplyViewDetail;

