var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 新版审批详情界面
 */
require('../css/apply-detail.less');
import DefaultApplyViewDetailStore from '../store/apply-view-detail-store';
import {AntcTable} from 'antc';
// import ApplyViewDetailActions from '../action/apply-view-detail-actions';
import DefaultApplyViewDetailActions from '../action/apply-view-detail-actions';
import UserApplyAction from '../action/user-apply-actions';
import AppUserUtil from '../util/app-user-util';
import Spinner from '../../../../components/spinner';
import userData from '../../../../public/sources/user-data';
import GeminiScrollbar from '../../../../components/react-gemini-scrollbar';
import AppProperty from '../../../../components/user_manage_components/app-property-setting';
import {Alert, Tooltip, Form, Button, Input, InputNumber, Select, Icon, message, DatePicker, Row, Col,Steps, Tag} from 'antd';
const Step = Steps.Step;
const Option = Select.Option;
import FieldMixin from '../../../../components/antd-form-fieldmixin';
import UserNameTextField from '../../../../components/user_manage_components/user-name-textfield/apply-input-index';
import UserNameTextfieldUtil from '../../../../components/user_manage_components/user-name-textfield/util';
import crmUtil from 'MOD_DIR/crm/public/utils/crm-util';
const FormItem = Form.Item;
import classNames from 'classnames';
import {hasPrivilege, PrivilegeChecker} from '../../../../components/privilege/checker';
/*在审批界面显示用户的右侧面板开始*/
require('../css/main.less');
import {phoneMsgEmitter, userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from '../../../../components/rightPanel';
import {getPassStrenth, PassStrengthBar, passwordRegex} from 'CMP_DIR/password-strength-bar';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import {APPLY_TYPES, userTypeList, TOP_NAV_HEIGHT} from 'PUB_DIR/sources/utils/consts';
import ModalDialog from 'CMP_DIR/ModalDialog';
import ApplyApproveStatus from 'CMP_DIR/apply-components/apply-approve-status';
import PasswordSetting from 'CMP_DIR/password-setting';
/*在审批界面显示用户的右侧面板结束*/
//默认头像图片
var DefaultHeadIconImage = require('../../../common/public/image/default-head-icon.png');
// 应用的默认配置
var UserTypeConfigForm = require('./user-type-config-form');
import Trace from 'LIB_DIR/trace';
var moment = require('moment');
import {handleDiffTypeApply,getUserApplyFilterReplyList,getApplyStatusTimeLineDesc,formatUsersmanList,updateUnapprovedCount, isFinalTask, isApprovedByManager} from 'PUB_DIR/sources/utils/common-method-util';
import ApplyDetailInfo from 'CMP_DIR/apply-components/apply-detail-info';
import ApplyHistory from 'CMP_DIR/apply-components/apply-history';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {getAllUserList,getNotSalesRoleUserList} from 'PUB_DIR/sources/utils/common-data-util';
import CustomerLabel from 'CMP_DIR/customer_label';
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
    //uem用户申请
    APPLY_USER: 'apply_user',
    //uem已有用户开通应用
    APPLY_APP: 'app_app',
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

const APPLY_LIST_WIDTH = 421;
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import commonPrivilegeConst from 'MOD_DIR/common/public/privilege-const';
const ApplyViewDetail = createReactClass({
    propTypes: {
        detailItem: PropTypes.object,
        applyData: PropTypes.object,
        showNoData: PropTypes.bool,
        isUnreadDetail: PropTypes.bool,
        applyListType: PropTypes.object,
        isHomeMyWork: PropTypes.bool,
        afterApprovedFunc: PropTypes.func,
        handleOpenApplyDetail: PropTypes.func,
    },
    displayName: 'ApplyViewDetail',
    mixins: [FieldMixin, UserNameTextField],

    hasApprovalPrivilege() {
        return hasPrivilege(commonPrivilegeConst.USER_APPLY_APPROVE);
    },

    getDefaultProps() {
        return {
            showNoData: false,
            detailItem: {},
            isUnreadDetail: false,//是否有未读回复
            isHomeMyWork: false,//是否是首页我的工作中打开的详情
            afterApprovedFunc: function() {//审批完后的外部处理方法
            },
            handleOpenApplyDetail: function() {
                
            }
        };
    },

    getInitialState() {
        var ApplyViewDetailStore = this.getApplyViewDetailStore();
        return {
            appConfig: appConfig,
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            showBackoutConfirmType: '',//操作的确认框类型
            isOplateUser: false,
            usersManList: [],//成员列表
            userManNotSalesList: [],//不包含销售的成员列表
            checkStatus: true, //自动生成密码radio是否选中
            passwordValue: '',//试用或者签约用户申请的明文密码
            showWariningTip: false,//是否展示密码的提示信息
            curEditExpireDateAppIdr: '',//正在展示修改到期时间的应用id
            updateDelayTime: '',//修改后的到期时间
            isHomeMyWork: this.props.isHomeMyWork,
            ...ApplyViewDetailStore.getState()
        };
    },

    onStoreChange() {
        var ApplyViewDetailStore = this.getApplyViewDetailStore();
        this.setState(ApplyViewDetailStore.getState());
    },
    getApplyViewDetailStore(){
        if(!_.isEmpty(this.props.ApplyViewDetailStore)){
            return this.props.ApplyViewDetailStore;
        }else{
            return DefaultApplyViewDetailStore;
        }

    },
    getApplyViewDetailAction(){
        if(!_.isEmpty(this.props.ApplyViewDetailAction)){
            return this.props.ApplyViewDetailAction;
        }else{
            return DefaultApplyViewDetailActions;
        }
    },

    getApplyDetail(detailItem, applyData) {
        setTimeout(() => {
            var ApplyViewDetailActions = this.getApplyViewDetailAction();
            ApplyViewDetailActions.showDetailLoading(detailItem);
            //1代表已通过，2代表已驳回，3 代表已撤销
            var approval_state = '';
            if (['1','2','3'].includes(_.get(detailItem,'approval_state'))){
                approval_state = _.get(detailItem,'approval_state');
            }
            ApplyViewDetailActions.getApplyDetail(detailItem.id, applyData, approval_state);
            ApplyViewDetailActions.getNextCandidate({id: detailItem.id});
            //获取该审批所在节点的位置
            ApplyViewDetailActions.getApplyTaskNode({id: detailItem.id});
            //获取回复列表
            if (hasPrivilege(commonPrivilegeConst.USERAPPLY_BASE_PERMISSION)) {
                ApplyViewDetailActions.getReplyList(detailItem.id);
            }
        });
    },
    getAllUserList(){
        getAllUserList().then(data => {
            this.setState({
                usersManList: data
            });
        });
    },
    getNotSalesRoleUserList(){
        getNotSalesRoleUserList().then(data => {
            this.setState({
                userManNotSalesList: data
            });
        });
    },
    componentDidMount() {
        if (!_.isEmpty(this.props.ApplyViewDetailStore)){
            AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.GET_HISTORICAL_APPLY_DETAIL_CUSTOMERID, this.getHistoryApplyListByCustomerId);
        }else{
            AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.GET_APPLY_DETAIL_CUSTOMERID, this.getHistoryApplyListByCustomerId);
        }
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        var ApplyViewDetailStore = this.getApplyViewDetailStore();
        ApplyViewDetailStore.listen(this.onStoreChange);
        var applyId = this.props.detailItem.id;
        if (applyId) {
            setTimeout(() => {
                this.getApplyDetail(this.props.detailItem, this.props.applyData);
                ApplyViewDetailActions.setBottomDisplayType();
            });
        }
        // 关闭用户详情面板
        userDetailEmitter.on(userDetailEmitter.USER_DETAIL_CLOSE_RIGHT_PANEL, this.closeRightPanel);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.REPLY_LIST_SCROLL_TO_BOTTOM, this.replyListScrollToBottom);

        this.getIntegrateConfig();
        this.getAllUserList();
        this.getNotSalesRoleUserList();
    },

    componentWillUnmount() {
        var ApplyViewDetailStore = this.getApplyViewDetailStore();
        ApplyViewDetailStore.unlisten(this.onStoreChange);
        // 关闭用户详情面板
        userDetailEmitter.removeListener(userDetailEmitter.USER_DETAIL_CLOSE_RIGHT_PANEL, this.closeRightPanel);

        if (!_.isEmpty(this.props.ApplyViewDetailStore)){
            AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.GET_HISTORICAL_APPLY_DETAIL_CUSTOMERID, this.getHistoryApplyListByCustomerId);
        }else{
            AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.GET_APPLY_DETAIL_CUSTOMERID, this.getHistoryApplyListByCustomerId);
        }

        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.REPLY_LIST_SCROLL_TO_BOTTOM, this.replyListScrollToBottom);


    },

    closeRightPanel() {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.closeRightPanel();
    },
    getHistoryApplyListByCustomerId(apply){
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        if(!_.isEmpty(apply)){
            ApplyViewDetailActions.getHistoryApplyListsByCustomerId(apply);
        }else{
            ApplyViewDetailActions.setHistoryApplyStatus();
        }
    },

    componentWillReceiveProps(nextProps) {
        if (nextProps.detailItem.id && !_.isEqual(nextProps.detailItem, this.props.detailItem)) {
            this.appsSetting = {};
            if (nextProps.detailItem.id !== _.get(this, 'props.detailItem.id')) {
                this.setState({
                    showBackoutConfirmType: '',
                    curEditExpireDateAppIdr: '',
                    updateDelayTime: ''
                });
            }
            if ((!this.state.applyResult.submitResult && !this.state.backApplyResult.submitResult) || nextProps.detailItem.id !== this.props.detailItem.id) {
                this.getApplyDetail(nextProps.detailItem);
                //关闭右侧详情
                phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_PHONE_PANEL);
                //触发关闭用户详情面板
                userDetailEmitter.emit(userDetailEmitter.CLOSE_USER_DETAIL);
            }
        }
        this.setState({
            isHomeMyWork: nextProps.isHomeMyWork
        });
    },

    getApplyListDivHeight: function() {
        if (!this.props.isHomeMyWork && $(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        let height = $(window).height() - AppUserUtil.APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
        //不是首页我的工作中打开的申请详情（申请列表中），高度需要-头部导航的高度
        if (!this.props.isHomeMyWork) {
            height -= AppUserUtil.APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA;
        }
        return height;
    },

    renderApplyDetailLoading() {
        if (this.state.detailInfoObj.loading) {
            var height = this.getApplyListDivHeight();
            if (height !== 'auto') {
                height += 60;
            }
            return (<div className="app_user_manage_detail app_user_manage_detail_loading" style={{height: height}}>
                <Spinner/></div>);
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
        //不是首页打开的申请详情时（申请审批列表），需要进行高度自适应的处理
        if (!this.props.isHomeMyWork && $(window).width() < Oplate.layout['screen-md']) {
            return 'auto';
        }
        let height = $(window).height() -
            AppUserUtil.APPLY_DETAIL_LAYOUT_CONSTANTS_FORM.TOP_DELTA -
            AppUserUtil.APPLY_DETAIL_LAYOUT_CONSTANTS_FORM.BOTTOM_DELTA;
        //不是首页打开的申请详情时（申请审批列表），需要减去头部导航的高度
        if (!this.props.isHomeMyWork){
            height -= AppUserUtil.APPLY_DETAIL_LAYOUT_CONSTANTS_FORM.TOP_DELTA;
        }
        return height;
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
        var applyId = _.get(this, 'props.detailItem.id');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        if (applyId) {
            ApplyViewDetailActions.getReplyList(applyId);
            //获取该审批所在节点的位置
            ApplyViewDetailActions.getNextCandidate({id: applyId});
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
        let replyList = _.cloneDeep(replyListInfo.list);
        if (_.isArray(replyList) && replyList.length) {
            //过滤掉点击通过，驳回或撤销按钮后的回复消息
            replyList = _.filter(replyList, item => !_.get(item,'approve_status'));
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
    //审批状态
    renderApplyStatus: function() {
        var showApplyInfo = [{
            label: Intl.get('leave.apply.application.status', '审批状态'),
            renderText: this.renderApplyApproveSteps,
        }];
        return (
            <ApplyDetailInfo
                iconClass='icon-apply-status'
                textCls='show-time-line'
                showApplyInfo={showApplyInfo}
            />
        );
    },
    renderApplyApproveSteps: function() {
        var stepStatus = '';
        var applicantList = _.get(this.state, 'detailInfoObj.info');
        var replyList = getUserApplyFilterReplyList(this.state);
        var applicateName = _.get(applicantList, 'presenter') || '';
        var applicateTime = moment(_.get(applicantList, 'time')).format(oplateConsts.DATE_TIME_FORMAT);
        var stepArr = [{
            title: applicateName + Intl.get('user.apply.submit.list', '提交申请'),
            description: applicateTime
        }];
        var currentLength = 0;
        //过滤掉手动添加的回复
        currentLength = replyList.length;
        if (currentLength) {
            _.forEach(replyList, (replyItem, index) => {
                var descrpt = getApplyStatusTimeLineDesc(replyItem.approve_status);
                if (['reject'].includes(replyItem.approve_status)){
                    stepStatus = 'error';
                    currentLength--;
                }
                stepArr.push({
                    title: (replyItem.nick_name || userData.getUserData().nick_name || '') + descrpt,
                    description: moment(replyItem.comment_time).format(oplateConsts.DATE_TIME_FORMAT)
                });
            });
        }
        var candidate = this.state.candidateList,candidateName = '';
        //如果下一个节点是直接主管审核
        if (_.get(candidate,'[0]')) {
            if (candidate.length === 1){
                candidateName = _.get(candidate,'[0].nick_name');
            }
            stepArr.push({
                title: Intl.get('apply.approve.worklist','待{applyer}审批',{'applyer': candidateName}),
                description: ''
            });
        }
        return (
            <Steps current={currentLength + 1} status={stepStatus}>
                {_.map(stepArr, (stepItem) => {
                    return (
                        <Step title={stepItem.title} description={stepItem.description}/>
                    );
                })}
            </Steps>
        );
    },
    renderSameCustomerHistoricalApply(){
        return (
            <ApplyHistory
                sameHistoryApplyLists={this.state.sameHistoryApplyLists}
                handleOpenApplyDetail={this.props.handleOpenApplyDetail}
            />
        );
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
                    {this.renderDetailBottom()}
                </div>
                <div className="apply-detail-content" style={{height: applyDetailHeight}} ref="geminiWrap">
                    <PrivilegeChecker check='USER_APPLY_APPROVE'>
                        {this.notShowRoleAndPrivilegeSettingBtn(detailInfo) ? null : this.renderDetailForm(detailInfo)}
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
                            {this.renderApplyStatus()}
                            <div className="apply-detail-reply-list apply-detail-info">
                                <div className="reply-icon-block">
                                    <span className="iconfont icon-apply-message-tip"/>
                                </div>
                                <div className="reply-info-block apply-info-block">
                                    <div className="reply-list-container apply-info-content">
                                        {this.props.isUnreadDetail ? this.renderRefreshReplyTip() : null}
                                        {hasPrivilege(commonPrivilegeConst.USERAPPLY_BASE_PERMISSION) ? this.renderReplyList() : null}
                                        {hasPrivilege(commonPrivilegeConst.USERAPPLY_BASE_PERMISSION) ? (
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
                            {hasPrivilege(commonPrivilegeConst.USERAPPLY_BASE_PERMISSION) ? this.renderSameCustomerHistoricalApply() : null}
                        </GeminiScrollbar>
                    )}
                </div>
            </div>
        );
    },

    renderDetailCustomerBlock: function(detailInfo) {
        var tagsArray = [];
        if (_.isArray(detailInfo.immutable_labels) && detailInfo.immutable_labels.length) {
            //下面加上了回访时间，上面就不展示 已回访 那个标签了
            tagsArray = _.filter(detailInfo.immutable_labels, item => item !== Intl.get('common.has.callback', '已回访'));
        }
        var tags = tagsArray.map((tag, index) => {
            return (<Tag key={index}>{tag}</Tag>);
        });

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
                                <CustomerLabel label={detailInfo.customer_label} />
                                {tags.length ?
                                    <span className="customer-list-tags">
                                        {tags}
                                    </span>
                                    : null}
                                <span className="iconfont icon-arrow-right handle-btn-item"/>
                            </a>
                        </div>
                        {detailInfo.last_call_back_time ? (
                            <div className="apply-info-label">
                                <span className="user-info-label">
                                    {Intl.get('common.callback.time', '回访时间')}:
                                </span>
                                {moment(detailInfo.last_call_back_time).format(oplateConsts.DATE_FORMAT)}
                            </div>) : null}
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

    toggleApplyExpanded(flag, user_id) {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.toggleApplyExpanded({flag, user_id});
    },
    getIntegrateConfig(){
        commonDataUtil.getIntegrationConfig().then(resultObj => {
            let isOplateUser = _.get(resultObj, 'type') === INTEGRATE_TYPES.OPLATE;
            this.setState({isOplateUser: isOplateUser,checkStatus: isOplateUser});
        });
    },

    renderDetailOperateBtn(user_id) {
        if (this.notShowIcon()) {
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
                <div className="btn-icon-role-auth" onClick={this.toggleApplyExpanded.bind(this, true, user_id)}
                    data-tracename="点击申请详情中的配置按钮">
                    <span className="iconfont icon-role-auth-config"></span>
                </div>
            </Tooltip>
        );
    },

    //是否是已有用户开通试用
    //或是否是已有用户开通正式
    //uem已有用户开通应用
    isExistUserApply: function() {
        var detailInfoObj = this.state.detailInfoObj.info || {};
        if (_.contains([CONSTANTS.EXIST_APPLY_TRIAL, CONSTANTS.EXIST_APPLY_FORMAL, CONSTANTS.APPLY_APP], detailInfo.type)) {
            return true;
        }
        return false;
    },

    //将用户名设置为编辑状态
    editUserName(e) {
        Trace.traceEvent(e, '点击修改用户名');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.setUserNameEdit(true);
        setTimeout(() => {
            this.refs.validation.validate(function() {
            });
        });
    },

    renderEditUserName() {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
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
            var ApplyViewDetailActions = this.getApplyViewDetailAction();
            ApplyViewDetailActions.saveUserName(formData.user_name);
            ApplyViewDetailActions.setUserNameEdit(false);
        });
    },

    userNameCancel(e) {
        Trace.traceEvent(e, '取消修改用户名');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
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
            {!this.showPassWordPrivilege() ? <span>{info.user_names[0]}</span>
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
    onCheckboxChange: function(checkStatus) {
        this.setState({
            checkStatus: checkStatus,
            showWariningTip: false
        },() => {
            if (checkStatus){
                this.onInputPasswordChange('');
            }
        });
    },
    onInputPasswordChange: function(value) {
        var showWariningTip = !value;
        //自动生成密码时，不输入密码也不需要提示
        if (!value && this.state.checkStatus){
            showWariningTip = false;
        }
        this.setState({
            passwordValue: value,
            showWariningTip: showWariningTip
        });

    },
    //展示手动设置密码的权限
    showPassWordPrivilege: function() {
        //有修改权限 && 是待审批状态的申请 && 能展示通过驳回按钮 && 该审批位于最后一个节点
        return this.hasApprovalPrivilege() && this.isUnApproved() && (_.get(this, 'state.detailInfoObj.info.showApproveBtn') || this.props.isHomeMyWork) && isFinalTask(this.state.applyNode);
    },
    notShowIcon(){
        return !this.isUnApproved() || !hasPrivilege('USER_APPLY_APPROVE') || !this.state.isOplateUser || !isFinalTask(this.state.applyNode) || !(_.get(this, 'state.detailInfoObj.info.showApproveBtn') || this.props.isHomeMyWork);
    },
    //选择了手动设置密码时，未输入密码，不能通过
    settingPasswordManuWithNoValue: function() {
        //用户申请的类型[uem用户申请、签约新用户申请、试用新用户申请]
        let applyUserTypes = [CONSTANTS.APPLY_USER, CONSTANTS.APPLY_USER_OFFICIAL, CONSTANTS.APPLY_USER_TRIAL];
        //用户申请，不是自动生成密码（即：手动设置密码）时，并且没有输入密码
        return applyUserTypes.indexOf(_.get(this.state, 'detailInfoObj.info.type')) !== -1
            && !_.get(this, 'state.checkStatus', true) && !_.get(this, 'state.passwordValue', '');
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
                    let passwordSetting = this.showPassWordPrivilege() ? (<PasswordSetting
                        onCheckboxChange={this.onCheckboxChange}
                        onInputPasswordChange={this.onInputPasswordChange}
                        checkStatus={this.state.isOplateUser}
                        showWariningTip={this.state.showWariningTip}
                        warningText= {Intl.get('apply.not.setting.password', '请手动输入密码！')}
                    />) : null;
                    let nickNameEle = (
                        <div className="apply-info-label">
                            <div className="user-info-label edit-name-label">
                                {Intl.get('common.nickname', '昵称')}:
                            </div>
                            <span
                                className="user-info-text edit-name-wrap">{this.renderNickNameBlock(detailInfo)}</span>
                        </div>);
                    return [userNameEle, passwordSetting ,nickNameEle];
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
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.setNickNameEdit(true);
    },

    nickNameSure(e) {
        Trace.traceEvent(e, '保存修改昵称');
        const formData = this.state.formData;
        if (formData.nick_name !== '') {
            var ApplyViewDetailActions = this.getApplyViewDetailAction();
            ApplyViewDetailActions.saveNickName(formData.nick_name);
            ApplyViewDetailActions.setNickNameEdit(false);
        }
    },

    nickNameCancel(e) {
        Trace.traceEvent(e, '取消修改昵称');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.cancelNickName();
        ApplyViewDetailActions.setNickNameEdit(false);
    },

    //渲染昵称区域，文字状态，修改状态
    renderNickNameBlock(info) {
        if (!this.isUnApproved()) {
            return <span>{info.nick_names[0]}</span>;
        }
        return <div>
            {!this.showPassWordPrivilege() ? <span>{info.nick_names[0]}</span>
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
    handleShowDatePicker: function(appId) {
        this.setState({
            curEditExpireDateAppIdr: appId
        });
    },
    saveExpiredTime: function(app, custom_setting) {
        //如果有特殊配置，需要更改的是
        if (custom_setting){
            custom_setting.time.end_time = this.state.updateDelayTime;
        }else{
            app.end_date = this.state.updateDelayTime;
        }
        this.setState({curEditExpireDateAppIdr: ''});
    },
    cancelExpiredTime: function() {
        this.setState({
            curEditExpireDateAppIdr: ''
        });
    },
    onChangeExpiredTime: function(date) {
        this.setState({
            updateDelayTime: moment(date).valueOf()
        });
    },

    //渲染开通周期
    renderApplyTime(app, custom_setting, isDelay) {
        let displayStartTime = '', displayEndTime = '', displayText = '',updateTime = '';
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
            var appId = app.app_id;
            if (this.state.curEditExpireDateAppIdr === appId) {
                return <div>
                    <DatePicker
                        format={oplateConsts.DATE_FORMAT}
                        onChange={this.onChangeExpiredTime}
                        defaultValue={displayEndTime ? moment(displayEndTime, oplateConsts.DATE_FORMAT) : ''}
                    />
                    <span className="save-buttons">
                        <span className="iconfont icon-choose" onClick={this.saveExpiredTime.bind(this, app, custom_setting)}></span>
                        <span className="iconfont icon-close" onClick={this.cancelExpiredTime}></span>
                    </span>
                </div>;
            } else {

                return <span>
                    {displayEndTime + ' ' + Intl.get('apply.delay.endTime', '到期')}
                    {this.showEditDateIcon() ?
                        <i className="iconfont icon-update" onClick={this.handleShowDatePicker.bind(this, appId)}></i> : null}
                </span>;
            }
        }
        return displayText;
    },
    showEditDateIcon: function(){
        //是否是uem的用户
        var isUem = !this.state.isOplateUser;
        return isUem && _.get(this, 'state.detailInfoObj.info.type') === CONSTANTS.APPLY_USER && this.showPassWordPrivilege();
    },

    // 应用app的配置面板
    showAppConfigPanel(app, userType) {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
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
    renderMultiAppDelayTable(user) {
        let columns = [
            {
                title: Intl.get('common.product','产品'),
                dataIndex: 'client_name',
                className: 'apply-detail-th'
            }, {
                title: Intl.get('user.time.end', '到期时间'),
                dataIndex: 'start_time',
                className: 'apply-detail-th',
                render: (text, app, index) => {
                    //如果有应用的特殊配置，使用特殊配置
                    //没有特殊配置，使用申请单的配置
                    const custom_setting = this.appsSetting[`${app.app_id}&&${app.user_id}`];
                    return (
                        <span className="desp_time time-bar">
                            {this.renderApplyTime(app, custom_setting, true)}
                        </span>);
                }
            }, {
                title: Intl.get('user.user.type', '用户类型'),
                dataIndex: 'user_type',
                className: 'apply-detail-th',
                render: (text, app, index) => {
                    let userType = app.user_type;//此处是后端穿过来的用户类型（正式用户、试用用户、training）
                    if (userType) {
                        let type = _.find(userTypeList, type => type.value === userType);
                        if (type) {
                            userType = type.name;//此处转换为界面上展示的用户类型（签约用户、试用用户、培训）
                        }
                    }
                    return (<span>{userType}</span>);
                }
            }];
        //角色的展示
        if (hasPrivilege(commonPrivilegeConst.BASE_QUERY_PERMISSION_APPLICATION)) {//待审状态，并且有获取应用角色的权限
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
        return (<AntcTable dataSource={user.apps}
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
    getTableColunms() {
        const appsSetting = this.appsSetting;
        const isExistUserApply = this.isExistUserApply();
        const isOplateUser = this.state.isOplateUser;
        let columns = [
            {
                title: Intl.get('common.product','产品'),
                dataIndex: 'client_name',
                className: 'apply-detail-th'
            }];
        //数量
        if (!isExistUserApply && isOplateUser) {
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
            title: isOplateUser ? Intl.get('user.apply.detail.table.time', '周期') : Intl.get('user.time.end', '到期时间'),
            dataIndex: 'start_time',
            className: 'apply-detail-th',
            render: (text, app, index) => {
                //如果有应用的特殊配置，使用特殊配置
                //没有特殊配置，使用申请单的配置
                const custom_setting = appsSetting[app.app_id];
                return (
                    <span className="desp_time time-bar">
                        {this.renderApplyTime(app, custom_setting,!isOplateUser)}
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
        //如果是uem的，就不需要展示角色和权限了
        if (this.state.isOplateUser){
            columns.push({
                title: Intl.get('user.apply.detail.table.role', '角色'),
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
        }
        return (<AntcTable dataSource={detailInfo.apps}
            bordered={true}
            pagination={false}
            columns={columns}/>);
    },

    //渲染每个应用设置区域
    renderDetailForm(detailInfo) {
        let selectedApps = $.extend(true, [], detailInfo.apps), appsSetting = this.state.appsSetting;
        // 只展示当前用户的应用配置项
        if (this.state.curShowConfigUserId) {
            selectedApps = _.filter(selectedApps, app => app.user_id === this.state.curShowConfigUserId);
        }
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
            appsSetting: appsSetting,
            showUserNumber: true,
            showIsTwoFactor: false,
            //是否是多用户的应用设置，多用户时，应用配置项中的key组成：app_id&&user_id(多用户延期时)
            isMultiUser: detailInfo.type === APPLY_TYPES.DELAY,
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
                <AppProperty {...appComponentProps}
                    isOplateUser={this.state.isOplateUser}
                />
            </div>
        );
    },

    appsSetting: {},

    //当应用选择器数据改变的时候，保存到变量中，提交时使用
    onAppPropertyChange(appsSetting) {
        _.each(appsSetting, (value, key) => {
            this.appsSetting[key] = value;
        });
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
                            {this.state.isOplateUser ? <span>{detailInfo.account_type === '1' ? Intl.get('common.official', '签约') : Intl.get('common.trial', '试用')}</span> : <span>{detailInfo.tag}</span>}

                        </span>
                    </div>
                    <div className="col-12 apply_detail_apps">
                        <div className="apply_detail_operate clearfix">
                            {this.renderDetailOperateBtn()}
                        </div>
                        {/** 不显示角色和权限的情况：
                         detailInfo.approval_state === '0' &&  !hasPrivilege("BASE_QUERY_PERMISSION_APPLICATION") 销售人员待审批的情况
                         detailInfo.approval_state === '2'表示是已驳回的应用，
                         detailInfo.approval_state === '3'表示是已撤销的应用，
                         */}
                        {detailInfo.approval_state === '0' && !hasPrivilege(commonPrivilegeConst.BASE_QUERY_PERMISSION_APPLICATION) ||
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
        let users = this.getDetailInfoUserCount(detailInfo);
        var userCount = _.get(users,'length');
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    {this.renderApplyUserNames(detailInfo)}
                    {this.renderApplyAppNames(detailInfo)}
                    <div className="apply-info-label">
                        <span className="user-info-label">{Intl.get('common.app.status', '开通状态')}:</span>
                        <span className="user-info-text">
                            {detailInfo.status === '1' ? Intl.get('common.enabled', '启用') : Intl.get('common.stop', '停用')}
                        </span>
                    </div>
                    {userCount ? <div className="apply-info-label">
                        <span className="user-info-label">{this.renderApplyUserCount()}:</span>
                        <span className="user-info-text">
                            {userCount}
                        </span>
                    </div> : null}

                </div>
            </div>
        );
    },
    //新版申请展示
    //销售渲染申请开通状态
    renderMultiAppDetailChangeStatus: function(detailInfo) {
        //把apps数据根据user_id重组
        let users = this.getDetailInfoUserCount(detailInfo);
        var userCount = _.get(users,'length');
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    <div className="apply-info-label">
                        <span className="user-info-label">{Intl.get('common.app.status', '开通状态')}:</span>
                        <span className="user-info-text">
                            {detailInfo.status === 1 ? Intl.get('common.enabled', '启用') : Intl.get('common.stop', '停用')}
                        </span>
                    </div>
                    {userCount ? <div className="apply-info-label">
                        <span className="user-info-label">{this.renderApplyUserCount()}:</span>
                        <span className="user-info-text">
                            {userCount}
                        </span>
                    </div> : null}
                    {_.map(users, (user, idx) => (
                        <div key={idx} className="user-item-container">
                            {this.renderApplyDetailSingleUserName(user)}
                            <div className="col-12 apply_detail_apps">
                                {
                                    this.renderOtherStatusTable(user)
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
        var userCount = _.get(detailInfo,'user_names.length');
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    {this.renderApplyUserNames(detailInfo)}
                    {userCount ? <div className="apply-info-label">
                        <span className="user-info-label">{this.renderApplyUserCount()}:</span>
                        <span className="user-info-text">
                            {userCount}
                        </span>
                    </div> : null}
                    {
                        selectedDetailItem.isConsumed === 'true' || !this.showPassWordPrivilege() ? null : (
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
        //把apps数据根据user_id重组
        let users = this.getDetailInfoUserCount(detailInfo);
        var userCount = _.get(users,'length');
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    {userCount ? <div className="apply-info-label">
                        <span className="user-info-label">{this.renderApplyUserCount()}:</span>
                        <span className="user-info-text">
                            {userCount}
                        </span>
                    </div> : null}
                    {_.map(users, (user, idx) => (
                        <div key={idx} className="user-item-container">
                            {this.renderApplyDetailSingleUserName(user)}
                            <div className="col-12 apply_detail_apps">
                                {
                                    this.renderOtherStatusTable(user)
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    },
    //禁用、其他类型的表格渲染
    renderOtherStatusTable: function(user) {
        let columns = [
            {
                title: Intl.get('common.product','产品'),
                dataIndex: 'client_name',
                className: 'apply-detail-th'
            }];
        return (<AntcTable dataSource={user.apps}
            bordered={true}
            pagination={false}
            columns={columns}/>);
    },
    renderApplyAppNames: function(detailInfo) {
        return (<div className="apply-info-label">
            <span className="user-info-label">{Intl.get('common.product','产品')}:</span>
            <span className="user-info-text">
                {detailInfo.app_name || ''}
            </span>
        </div>);
    },
    //旧版申请展示
    //渲染用户延期
    renderDetailDelayTime: function(detailInfo) {
        let users = this.getDetailInfoUserCount(detailInfo);
        var userCount = _.get(users,'length');
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    {this.renderApplyUserNames(detailInfo)}
                    {this.renderApplyAppNames(detailInfo)}
                    <div className="apply-info-label delay-time-wrap">
                        <div className="user-info-label">{this.renderApplyDelayName()}:</div>
                        <span className="user-info-text">
                            {this.state.isModifyDelayTime ? null : this.renderApplyDelayModifyTime()}
                            {this.showPassWordPrivilege() ? this.renderModifyDelayTime() : null}
                        </span>
                    </div>
                    {userCount ? <div>
                        <div className="user-info-label">{this.renderApplyUserCount()}:</div>
                        <span className="user-info-text">
                            {userCount}
                        </span>
                    </div> : null}
                </div>
            </div>
        );
    },
    renderApplyUserCount: function() {
        return Intl.get('crm.158', '用户数');
    },
    //延期申请的类型不展示配置按钮的判断
    showConfigOfDelayApply: function(detailInfo) {
        return _.get(detailInfo, 'changedUserType');
    },
    //获取user
    getDetailInfoUserCount: function(detailInfo) {
        return _.uniqBy(detailInfo.apps, 'user_id').map(app => {
            const item = _.pick(app, 'user_id', 'user_name', 'nickname');
            return {
                ...item,
                apps: _.filter(detailInfo.apps, x => x.user_id === item.user_id)
            };
        });
    },
    //新版申请展示
    //渲染用户延期
    renderMultiAppDetailDelayTime: function(detailInfo) {
        var isRealmAdmin = userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) ||
            userData.hasRole(userData.ROLE_CONSTANS.REALM_OWNER);
        //是否是待审批
        const isUnApproved = this.isUnApproved();
        //把apps数据根据user_id重组
        let users = this.getDetailInfoUserCount(detailInfo);
        //修改后的用户类型，如果没有说明未修改用户类型，不用设置角色、权限
        let changedUserType = this.showConfigOfDelayApply(detailInfo);
        var userCount = _.get(users,'length');
        return (
            <div className="user-info-block apply-info-block">
                <div className="apply-info-content">
                    <div className="apply-info-label delay-time-wrap">
                        <div className="user-info-label label-fix">{this.renderApplyDelayName()}:</div>
                        <span className="user-info-text edit-fix">
                            {this.state.isModifyDelayTime ? null : this.renderApplyDelayModifyTime()}
                            {this.showPassWordPrivilege() ? this.renderModifyDelayTime() : null}
                        </span>
                        {userCount ? <div>
                            <div className="user-info-label label-fix">{this.renderApplyUserCount()}:</div>
                            <span className="user-info-text edit-fix">
                                {userCount}
                            </span>
                        </div> : null}
                    </div>
                    {
                        _.map(users, (user, idx) => {
                            return (
                                <div className="col-12 apply_detail_apps delay_detail_apps" key={idx}>
                                    {changedUserType ? (
                                        <div className="apply_detail_operate clearfix">
                                            {this.renderDetailOperateBtn(user.user_id)}
                                        </div>
                                    ) : null}
                                    {this.renderApplyDetailSingleUserName(user)}
                                    {this.renderMultiAppDelayTable(user)}
                                </div>);
                        })
                    }
                </div>
            </div>
        );
    },

    //显示用户详情
    showUserDetail: function(userId) {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.showUserDetail(userId);
        //触发打开用户详情面板
        userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, {userId: userId});
    },

    //延期时间数字修改
    delayTimeNumberModify: function(value) {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.delayTimeNumberModify(value);
    },

    //延期时间单位改变
    delayTimeUnitModify: function(unit) {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.delayTimeUnitModify(unit);
    },

    //将延迟时间设置为修改状态
    setDelayTimeModify(e) {
        Trace.traceEvent(e, '点击修改延期时间');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.setDelayTimeModify(true);
    },

    //保存修改的延迟时间
    saveModifyDelayTime(e) {
        Trace.traceEvent(e, '保存修改延期时间');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        if (this.state.formData.delayTimeUnit === SELECT_CUSTOM_TIME_TYPE) {
            ApplyViewDetailActions.saveModifyDelayTime(this.state.formData.end_date);
        } else {
            ApplyViewDetailActions.saveModifyDelayTime(this.getDelayTimeMillis());
        }

    },

    cancelModifyDelayTime(e) {
        Trace.traceEvent(e, '取消修改延期时间');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
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
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
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
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
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
        if (detailInfo.type === APPLY_TYPES.APPLY_PWD_CHANGE) {
            return this.renderDetailChangePassword(detailInfo);
        } else if (detailInfo.type === APPLY_TYPES.APPLY_STH_ELSE) {
            return this.renderDetailChangeOther(detailInfo);
        }
        //旧版申请展示
        else if (detailInfo.type === APPLY_TYPES.APPLY_GRANT_DELAY) {
            return this.renderDetailDelayTime(detailInfo);
        } else if (detailInfo.type === APPLY_TYPES.APPLY_GRANT_STATUS_CHANGE) {
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
    notShowRoleAndPrivilegeSettingBtn(detailInfo){
        //不展示配置按钮的情况
        if ([APPLY_TYPES.APPLY_PWD_CHANGE,APPLY_TYPES.APPLY_STH_ELSE,APPLY_TYPES.APPLY_GRANT_DELAY,APPLY_TYPES.APPLY_GRANT_STATUS_CHANGE,APPLY_TYPES.DISABLE].includes(detailInfo.type)){
            return true;
        }else if([APPLY_TYPES.DELAY].includes(detailInfo.type)){
            //延期申请类型不加配置按钮的情况
            return !this.showConfigOfDelayApply(detailInfo) || this.notShowIcon();
        }else{
            return this.notShowIcon();
        }
    },

    //添加一条回复
    addReply: function(e) {
        Trace.traceEvent(e, '点击回复按钮');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        //如果ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        //构造提交数据
        var submitData = {
            apply_id: this.props.detailItem.id,
            comment: _.trim(this.state.formData.comment),
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
        var val = _.trim(event.target.value);
        if (val) {
            var ApplyViewDetailActions = this.getApplyViewDetailAction();
            ApplyViewDetailActions.hideReplyCommentEmptyError();
        }
    },

    // 隐藏撤销申请的模态框
    hideBackoutModal: function() {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-cancel'), '点击取消按钮');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.setRolesNotSettingModalDialog({
            show: false,
            appNames: []
        });
        this.setState({
            showBackoutConfirmType: ''
        });
    },

    // 撤销申请
    saleBackoutApply(e) {
        e.stopPropagation();
        Trace.traceEvent(e, '点击撤销按钮');
        let backoutObj = {
            apply_id: this.props.detailItem.id,
            remark: _.trim(this.state.formData.comment),
            notice_url: getApplyDetailUrl(this.state.detailInfoObj.info)
        };
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.saleBackoutApply(backoutObj);
    },
    renderCancelApplyApprove() {
        var confirmType = this.state.showBackoutConfirmType, modalContent = '', deleteFunction = function() {

            }, okText = '',cancelText = '', modalShow = false, resultType = {};
        if (confirmType) {
            //不同类型的操作，展示的描述和后续操作也不一样
            if (confirmType === '1' || confirmType === '2') {
                deleteFunction = this.submitApprovalForm.bind(this, confirmType);
                modalContent = Intl.get('apply.approve.modal.text.pass', '是否通过此申请');
                okText = Intl.get('user.apply.detail.button.pass', '通过');
                if (confirmType === '2') {
                    modalContent = Intl.get('apply.approve.modal.text.reject', '是否驳回此申请');
                    okText = Intl.get('common.apply.reject', '驳回');
                }
                //如果之前没有设置过角色，要加上设置角色的提示
                if (_.get(this, 'state.rolesNotSettingModalDialog.show',false)){
                    modalContent = this.state.rolesNotSettingModalDialog.appNames.join('、') + Intl.get('user.apply.detail.role.modal.content', '中，没有为用户分配角色，是否继续');
                    okText = Intl.get('user.apply.detail.role.modal.continue', '继续');
                    cancelText = Intl.get('user.apply.detail.role.modal.cancel', '我再改改');
                    deleteFunction = this.continueSubmit;
                }
                resultType = this.state.applyResult;
            } else if (confirmType === '3') {
                modalContent = Intl.get('user.apply.detail.modal.content', '是否撤销此申请？');
                deleteFunction = this.saleBackoutApply;
                okText = Intl.get('user.apply.detail.modal.ok', '撤销');
                resultType = this.state.backApplyResult;
            }
            modalShow = confirmType && resultType.submitResult === '';
            return (
                <ModalDialog
                    modalShow={modalShow}
                    container={this}
                    hideModalDialog={this.hideBackoutModal}
                    modalContent={modalContent}
                    delete={deleteFunction}
                    okText={okText}
                    cancelText={cancelText}
                    delayClose={true}
                />
            );
        } else {
            return null;
        }
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
    clickApprovalFormBtn(approval) {
        if (approval === '1') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击通过按钮');
        } else if (approval === '2') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击驳回按钮');
        } else if (approval === '3') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击撤销申请按钮');
        }
        //用户申请时，选择了手动设置密码时，未输入密码，不能通过
        if (this.showPassWordPrivilege() && this.settingPasswordManuWithNoValue() && approval === '1'){
            this.setState({
                showWariningTip: true
            });
            return;
        }
        this.showConfirmModal(approval);
    },

    showConfirmModal(approval) {
        this.setState({
            showBackoutConfirmType: approval
        });
    },
    renderApplyApproveStatus() {
        var showLoading = false, approveSuccess = false, approveError = false, applyResultErrorMsg = '',approveSuccessTip = '',showAfterApproveTip = '',
            confirmType = this.state.showBackoutConfirmType, resultType = {};
        if (confirmType === '3') {
            resultType = this.state.backApplyResult;
            approveSuccessTip = Intl.get('user.apply.detail.backout.success', '撤销成功');
            showAfterApproveTip = Intl.get('apply.show.cancel.result','查看撤销结果');
        } else if (confirmType === '1' || confirmType === '2') {
            resultType = this.state.applyResult;
        } else {
            return;
        }
        showLoading = resultType.submitResult === 'loading';
        approveSuccess = resultType.submitResult === 'success';
        approveError = resultType.submitResult === 'error';
        applyResultErrorMsg = resultType.errorMsg;
        var typeObj = handleDiffTypeApply(this);
        return <ApplyApproveStatus
            showLoading={showLoading}
            approveSuccess={approveSuccess}
            viewApprovalResult={this.viewApprovalResult}
            approveError={approveError}
            applyResultErrorMsg={applyResultErrorMsg}
            reSendApproval={this.continueSubmit}
            cancelSendApproval={this.cancelSendApproval.bind(this, confirmType)}
            container={this}
            approveSuccessTip={approveSuccessTip}
            showAfterApproveTip={showAfterApproveTip}
        />;

    },
    renderTransferCandidateBlock(){
        var usersManList = this.state.usersManList;
        //如果不是uem类型，并且该节点的审批人类型是管理员，那么要转审的列表中就不能包含销售角色
        var isUem = !this.state.isOplateUser, applyNode = this.state.applyNode;
        if (!isUem && isApprovedByManager(applyNode)){
            usersManList = this.state.userManNotSalesList;
        }
        var onChangeFunction = this.onSelectApplyNextCandidate;
        var defaultValue = _.get(this.state, 'detailInfoObj.info.nextCandidateId', '');

        //销售领导、域管理员,展示其所有（子）团队的成员列表
        let dataList = formatUsersmanList(usersManList);
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={defaultValue}
                    onChange={onChangeFunction}
                    getSelectContent={this.setSelectContent}
                    notFoundContent={dataList.length ? Intl.get('common.no.member', '暂无成员') : Intl.get('apply.no.relate.user', '无相关成员')}
                    dataList={dataList}
                />
            </div>
        );
    },
    addNewApplyCandidate(transferCandidateId,addNextCandidateName){
        var submitObj = {
            id: _.get(this, 'state.detailInfoObj.info.id', ''),
            user_ids: [transferCandidateId]
        };
        //是否展示审批按钮（首页我的工作中的申请都展示审批按钮）
        var isShowApproveBtn = _.get(this, 'state.detailInfoObj.info.showApproveBtn', false) || this.props.isHomeMyWork;
        var candidateList = _.filter(this.state.candidateList,item => item.user_id !== transferCandidateId);
        var deleteUserIds = _.map(candidateList,'user_id');
        //转出操作后，把之前的待审批人都去掉，这条申请只留转出的那个人审批
        submitObj.user_ids_delete = deleteUserIds;
        var memberId = userData.getUserData().user_id;
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.transferNextCandidate(submitObj, (flag) => {
            //关闭下拉框
            if (flag) {
                if (_.isFunction(_.get(this, 'addNextCandidate.handleCancel'))) {
                    this.addNextCandidate.handleCancel();
                }
                //转出成功后，如果左边选中的是待审批的列表，在待审批列表中把这条记录删掉
                if (this.props.applyListType === 'false') {
                    UserApplyAction.afterTransferApplySuccess(submitObj.id);
                } else {
                    message.success(Intl.get('apply.approve.transfer.success', '转出申请成功'));
                }
                //将待我审批的申请转审后
                if (isShowApproveBtn){
                    //待审批数字减一
                    var count = Oplate.unread.approve - 1;
                    updateUnapprovedCount('approve','SHOW_UNHANDLE_APPLY_COUNT',count);
                    //隐藏通过、驳回按钮
                    ApplyViewDetailActions.showOrHideApprovalBtns(false);
                    //调用父组件的方法进行转成完成后的其他处理
                    if (_.isFunction(this.props.afterApprovedFunc)) {
                        this.props.afterApprovedFunc();
                    }
                }else if (memberId === transferCandidateId ){
                    var count = Oplate.unread.approve + 1;
                    updateUnapprovedCount('approve','SHOW_UNHANDLE_APPLY_COUNT',count);
                    //将非待我审批的申请转给我审批后，展示出通过驳回按钮,不需要再手动加一，因为后端会有推送，这里如果加一就会使数量多一个
                    ApplyViewDetailActions.showOrHideApprovalBtns(true);
                }

                //转审成功后，把下一节点的审批人改成转审之后的人
                ApplyViewDetailActions.setNextCandidate([{nick_name: addNextCandidateName,user_id: transferCandidateId}]);
            } else {
                message.error(Intl.get('apply.approve.transfer.failed', '转出申请失败'));
            }
        });
    },
    onSelectApplyNextCandidate(updateUser){
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.setNextCandidateIds(updateUser);
    },
    setSelectContent(nextCandidateName){
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.setNextCandidateName(nextCandidateName);
    },
    clearNextCandidateIds(){
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.setNextCandidateIds('');
        ApplyViewDetailActions.setNextCandidateName('');
    },
    renderAddApplyNextCandidate(){
        var addNextCandidateId = _.get(this.state, 'detailInfoObj.info.nextCandidateId','');
        var addNextCandidateName = _.get(this.state, 'detailInfoObj.info.nextCandidateName','');
        return (
            <div className="pull-right">
                <AntcDropdown
                    ref={AssignSales => this.addNextCandidate = AssignSales}
                    content={<Button
                        data-tracename="点击转出申请按钮"
                        className='assign-btn btn-primary-sure' type="primary" size="small">{Intl.get('apply.view.transfer.candidate','转审')}</Button>}
                    overlayTitle={Intl.get('apply.will.approve.apply.item','待审批人')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    overlayContent={this.renderTransferCandidateBlock()}
                    handleSubmit={this.addNewApplyCandidate.bind(this, addNextCandidateId,addNextCandidateName)}//分配销售的时候直接分配，不需要再展示模态框
                    unSelectDataTip={addNextCandidateId ? '' : Intl.get('apply.will.select.transfer.approver','请选择要转给的待审批人')}
                    clearSelectData={this.clearNextCandidateIds}
                    btnAtTop={false}
                    isSaving={this.state.transferStatusInfo.result === 'loading'}
                    isDisabled={!addNextCandidateId}
                />
            </div>
        );
    },

    //渲染详情底部区域
    renderDetailBottom() {
        var selectedDetailItem = this.props.detailItem;
        var detailInfoObj = this.state.detailInfoObj.info;
        var showBackoutApply = detailInfoObj.presenter_id === userData.getUserData().user_id;
        //是否显示通过驳回(主页我的工作中打开的详情，我的工作中打开的我都可以进行审批)
        var isShowApproveBtn = detailInfoObj.showApproveBtn || this.props.isHomeMyWork;
        //是否审批
        let isConsumed = !this.isUnApproved();

        return (
            <div className="approval_block pull-right">
                <Row className="approval_person clearfix">
                    <Col>
                        {isConsumed ? null : (<div className="pull-right">
                            {hasPrivilege(commonPrivilegeConst.USERAPPLY_BASE_PERMISSION) && showBackoutApply ?
                                <Button type="primary" className="btn-primary-sure" size="small"
                                    onClick={this.clickApprovalFormBtn.bind(this, '3')}>
                                    {Intl.get('user.apply.detail.backout', '撤销申请')}
                                </Button>
                                : null}
                            {isShowApproveBtn ? (
                                <Button type="primary" className="btn-primary-sure" size="small"
                                    onClick={this.clickApprovalFormBtn.bind(this, '1')}>
                                    {Intl.get('user.apply.detail.button.pass', '通过')}
                                </Button>) : null}
                            {isShowApproveBtn ? (
                                <Button type="primary" className="btn-primary-sure" size="small"
                                    onClick={this.clickApprovalFormBtn.bind(this, '2')}>
                                    {Intl.get('common.apply.reject', '驳回')}
                                </Button>) : null}
                            {/*如果是管理员或者我是待审批人或者我是待审批人的上级领导，我都可以把申请进行转出*/}
                            {(isShowApproveBtn || userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || this.state.isLeader) && detailInfoObj.approval_state === '0' ? this.renderAddApplyNextCandidate() : null}
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
            user_name: _.trim(this.state.detailInfoObj.info.user_names[0]),
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
    //获取多用户申请延期时，审批参数
    getMultiDelaySubmitData(obj) {
        const apps = _.get(this.state.detailInfoObj, 'info.apps');
        //修改的用户类型，如果存在，说明修改过用户类型，需要把角色权限传过去，如果不存在，未修改用户类型，不需要把用户类型、角色、权限传过去
        let changedUserType = _.get(this.state.detailInfoObj, 'info.changedUserType');
        if (apps.length > 0) {
            obj.data = JSON.stringify(
                apps.map(x => {
                    let item = _.pick(x, 'client_id', 'client_name', 'user_id',
                        'user_name', 'nickname', 'begin_date', 'over_draft');
                    //如果修改了用户类型，需要把修改后的用户类型传过去
                    if (changedUserType) {
                        item.user_type = changedUserType;
                    }
                    //延期时间为：自定义的到期时间时
                    if (_.get(this.state, 'formData.delayTimeUnit') === 'custom') {
                        item.end_date = _.get(this.state, 'formData.end_date');
                    } else {//延期时间为：延期 n天、周、月等时
                        item.delay = _.get(this.state, 'formData.delay_time');
                        item.end_date = moment(x.end_date).subtract(x.delay, 'ms').add(item.delay, 'ms').valueOf();
                    }
                    let appConfig = this.appsSetting[`${item.client_id}&&${item.user_id}`];
                    //角色、权限，如果修改了用户类型，需要传设置的角色、权限
                    if (appConfig && changedUserType) {
                        item.roles = _.map(appConfig.roles, roleId => {
                            return {role_id: roleId};
                        });
                        item.permissions = _.map(appConfig.permissions, permissionId => {
                            return {permission_id: permissionId};
                        });
                    }
                    return item;
                })
            );
        }
        return obj;
    },

    submitApprovalForm(approval) {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
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
            //准备提交的数据
            let obj = {};
            //多用户延期、禁用
            if (detailInfo.type === APPLY_TYPES.DELAY || detailInfo.type === APPLY_TYPES.DISABLE) {
                //准备提交的数据（多用户禁用的情况下审批时只需要传message_id、approval）
                obj = {
                    approval_state: approval_state + '',
                    message_id: this.props.detailItem.id
                };
                //多用户申请延期时，需要提交的数据处理
                if (detailInfo.type === APPLY_TYPES.DELAY) {
                    obj = this.getMultiDelaySubmitData(obj);
                }
            } else {
                //左侧选中的申请单
                var selectedDetailItem = this.props.detailItem;
                //要提交的应用配置
                var products = [];
                //是否是uem的用户
                var isUem = !this.state.isOplateUser;
                //是否是已有用户申请
                var isExistUserApply = this.isExistUserApply();
                let applyMaxNumber = this.getApplyMaxUserNumber();
                let changeMaxNumber = this.getChangeMaxUserNumber();
                //选中的应用，添加到提交参数中
                if (isUem){
                    products = _.get(this,'state.detailInfoObj.info.apps');
                }else{
                    _.each(this.appsSetting, function(app_config, app_id) {
                        //app_id含有&&时，是多应用申请时的产品配置信息，不做处理，避免出现多种未知应用
                        if (app_id.indexOf('&&') === -1) {
                            //当前应用配置
                            var appObj = {
                                //应用id
                                client_id: app_id,
                                //角色
                                roles: app_config.roles,
                                //权限
                                permissions: app_config.permissions,
                                //到期停用
                                over_draft: _.get(app_config, 'over_draft.value'),
                                //开始时间
                                begin_date: _.get(app_config, 'time.start_time'),
                                //结束时间
                                end_date: _.get(app_config, 'time.end_time'),
                            };
                            //已有用户申请没法指定个数
                            if (!isExistUserApply) {
                                appObj.number = _.get(app_config, 'number.value');
                            }
                            products.push(appObj);
                        }
                    });
                }
                var appList = detailInfo.apps;
                //如果是开通用户，需要先检查是否有角色设置，如果没有角色设置，给出一个警告
                //如果已经有这个警告了，就是继续提交的逻辑，就跳过此判断
                if (
                    approval === '1' && !this.state.rolesNotSettingModalDialog.continueSubmit &&
                    (detailInfo.type === CONSTANTS.APPLY_USER_OFFICIAL ||
                        detailInfo.type === CONSTANTS.APPLY_USER_TRIAL ||
                        detailInfo.type === CONSTANTS.EXIST_APPLY_FORMAL ||
                        detailInfo.type === CONSTANTS.EXIST_APPLY_TRIAL) && !isUem
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
                obj = {
                    approval: approval_state + '',
                    comment: this.state.formData.comment,
                    message_id: this.props.detailItem.id,
                    products: JSON.stringify(products),
                    //审批类型
                    type: detailInfo.type,
                    //从邮件转到界面的链接地址
                    notice_url: getApplyDetailUrl(this.state.detailInfoObj.info),
                };
                //如果手动设置了密码
                if (!this.state.checkStatus && this.state.passwordValue){
                    obj.passwordObvious = this.state.passwordValue;
                }
                // 延期时间(需要修改到期时间的字段)
                if (detailInfo.type === 'apply_grant_delay') {
                    if (this.state.formData.delayTimeUnit === SELECT_CUSTOM_TIME_TYPE) {
                        obj.end_date = this.state.formData.end_date;
                    } else {
                        obj.delay_time = this.state.formData.delay_time;
                    }
                }
                //修改密码
                if (detailInfo.type === 'apply_pwd_change') {
                    obj.password = AppUserUtil.encryptPassword(this.state.formData.apply_detail_password);
                }
                //如果是已有用户选择开通，则不提交user_name和number
                if (!isExistUserApply) {
                    obj.user_name = _.trim(this.state.formData.user_name);
                    obj.nick_name = this.state.formData.nick_name;
                }
            }
            ApplyViewDetailActions.submitApply(obj, detailInfo.type, () => {
                //调用父组件的方法进行审批完成后的其他处理
                if (_.isFunction(this.props.afterApprovedFunc)) {
                    this.props.afterApprovedFunc();
                }
            });
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
        this.setState({
            showBackoutConfirmType: ''
        });
        this.getApplyDetail(this.props.detailItem);
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        //设置这条审批不再展示通过和驳回的按钮
        ApplyViewDetailActions.hideApprovalBtns();
    },

    //继续提交
    continueSubmit(e) {
        Trace.traceEvent(e, '点击了继续');
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.rolesNotSettingContinueSubmit();
        setTimeout(() => {
            this.submitApprovalForm(this.state.showBackoutConfirmType);
        });
    },

    //取消发送
    cancelSendApproval(e) {
        Trace.traceEvent(e, '点击取消按钮');
        this.setState({
            showBackoutConfirmType: ''
        });
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.cancelSendApproval();
    },

    // 申请应用的配置界面
    showAppConfigRightPanle() {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.showAppConfigRightPanle();
    },

    // 应用配置取消保存
    handleCancel() {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.handleCancel();
    },

    // 应用配置保存成功时
    handleSaveAppConfig(appId) {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
        ApplyViewDetailActions.handleSaveAppConfig();
        this.getApplyDetail(this.props.detailItem);
        //this.getAppConfigExtra( appId ,appConfig.user_type);
    },

    // 假设没有默认配置，默认配置成功
    getAppConfigExtra(client_id, user_type) {
        var ApplyViewDetailActions = this.getApplyViewDetailAction();
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
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
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
            'app_user_manage_apply_detail_wrap': true
        });
        let customerOfCurUser = this.state.customerOfCurUser;
        let detailWrapWidth = this.props.isHomeMyWork ? '100%' : $('.user_apply_page').width() - APPLY_LIST_WIDTH;
        let divHeight = $(window).height();
        //不是首页我的工作中打开的申请详情（申请列表中），高度需要-头部导航的高度
        if (!this.props.isHomeMyWork) {
            divHeight -= TOP_NAV_HEIGHT;
        }
        return (
            <div className={cls} data-tracename="审批详情界面" style={{'width': detailWrapWidth, 'height': divHeight}}>
                {this.renderApplyDetailLoading()}
                {this.renderApplyDetailError()}
                {this.renderApplyDetailNodata()}
                {
                    !this.state.detailInfoObj.loading ?
                        this.renderApplyDetailInfo() : null
                }
                {this.renderApplyApproveStatus()}
                {this.renderCancelApplyApprove()}
                {this.state.showRightPanel ?
                    <RightPanel
                        className="apply_detail_rightpanel app_user_manage_rightpanel white-space-nowrap right-panel detail-v3-panel"
                        showFlag={this.state.showRightPanel}>
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

