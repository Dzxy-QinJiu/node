/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/18.
 */
var applyBusinessDetailStore = require('../store/apply-business-detail-store');
var ApplyViewDetailActions = require('../action/apply-view-detail-action');
var LeaveApplyUtils = require('../utils/leave-apply-utils');
var Spinner = require('CMP_DIR/spinner');
import Trace from 'LIB_DIR/trace';
import {Alert, Icon, Input, Row, Col, Button, Modal} from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
require('../css/business-apply-detail.less');
import userData from 'PUB_DIR/sources/user-data';
class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            ...applyBusinessDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(applyBusinessDetailStore.getState());
    };

    componentDidMount() {
        applyBusinessDetailStore.listen(this.onStoreChange);
        if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem);
        }
    }

    componentWillReceiveProps(nextProps) {
        var thisPropsId = this.props.detailItem.id;
        var nextPropsId = nextProps.detailItem.id;
        if (thisPropsId && nextPropsId && nextPropsId !== thisPropsId) {
            this.getBusinessApplyDetailData(nextProps.detailItem);
        }
    }

    componentWillUnmount() {
        applyBusinessDetailStore.unlisten(this.onStoreChange);
    }

    getApplyListDivHeight() {
        var height = $(window).height() - LeaveApplyUtils.APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA - LeaveApplyUtils.APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
        return height;
    }

    retryFetchDetail = (e) => {
        Trace.traceEvent(e, '点击了重试');
        if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem);
        }
    };

    getBusinessApplyDetailData(detailItem) {
        setTimeout(() => {
            ApplyViewDetailActions.setInitialData(detailItem);
            ApplyViewDetailActions.getBusinessApplyDetailById({id: detailItem.id});
            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (detailItem.status === 'pass' || detailItem.state === 'reject') {
                ApplyViewDetailActions.setApplyComment(detailItem.approve_details);
            } else if (detailItem.id) {
                ApplyViewDetailActions.getBusinessApplyCommentList({id: detailItem.id});
            }
        });
    }

    //重新获取回复列表
    refreshReplyList = (e) => {
        Trace.traceEvent(e, '点击了重新获取');
        var detailItem = this.props.detailItem;
        if (detailItem.status === 'pass' || detailItem.state === 'reject') {
            ApplyViewDetailActions.setApplyComment(detailItem.approve_details);
        } else if (detailItem.id) {
            ApplyViewDetailActions.getBusinessApplyCommentList({id: detailItem.id});
        }
    };

    renderApplyDetailLoading() {
        if (this.state.detailInfoObj.loadingResult === 'loading') {
            return (<div className="app_user_manage_detail app_user_manage_detail_loading">
                <Spinner/></div>);
        }
        return null;
    }

    renderApplyDetailError() {
        if (this.state.detailInfoObj.loadingResult === 'error') {
            var retry = (
                <span>
                    {this.state.detailInfoObj.errorMsg}，<a href="javascript:void(0)"
                        onClick={this.retryFetchDetail}>
                        {Intl.get('common.retry', '重试')}
                    </a>
                </span>
            );
            return (
                <div className="app_user_manage_detail app_user_manage_detail_error">
                    <Alert
                        message={retry}
                        type="error"
                        showIcon={true}
                    />
                </div>
            );
        }
        return null;
    }

    renderApplyDetailNodata() {
        if (this.props.showNoData) {
            return (
                <div className="app_user_manage_detail app_user_manage_detail_error">
                    <Alert
                        message={Intl.get('common.no.data', '暂无数据')}
                        type="info"
                        showIcon={true}
                    />
                </div>
            );
        }
        return null;
    }

    //显示客户详情
    showCustomerDetail(customerId) {
        // ApplyViewDetailActions.showCustomerDetail(customerId);
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightPanel
            }
        });
    }

    closeRightPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });
    };

    renderDetailCustomerBlock(detailInfo) {
        return (
            <div className="apply-detail-customer apply-detail-info">
                <div className="customer-icon-block">
                    <span className="iconfont icon-customer"/>
                </div>
                <div className="customer-info-block apply-info-block">
                    <div className="apply-info-content">
                        <div className="customer-name">
                            <a href="javascript:void(0)"
                                onClick={this.showCustomerDetail.bind(this, _.get(detailInfo, 'detail.customer_id'))}
                                data-tracename="查看客户详情"
                                title={Intl.get('call.record.customer.title', '点击可查看客户详情')}
                            >
                                {_.get(detailInfo, 'detail.customer_name')}
                                <span className="iconfont icon-arrow-right"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>);
    }

    renderBusinessApplyDetail(detailInfo) {
        var detail = detailInfo.detail || {};
        var applicant = detailInfo.applicant || {};
        var beginDate = moment(detail.begin_time).format(oplateConsts.DATE_FORMAT);
        var endDate = moment(detail.end_time).format(oplateConsts.DATE_FORMAT);
        var isOneDay = beginDate === endDate;
        return (
            <div className="apply-detail-customer apply-detail-info">
                <div className="leave-detail-icon-block">
                    <span className="iconfont icon-leave icon-leave_apply-ico"/>
                </div>
                <div className="leave-detail-block apply-info-block">
                    <div className="apply-info-content">
                        <div className="apply-info-label">
                            <span className="user-info-label">
                                {Intl.get('leave.apply.for.application', '出差人员')}:
                            </span>
                            <span className="user-info-text">
                                {applicant.user_name}
                            </span>
                        </div>
                        <div className="apply-info-label">
                            <span className="user-info-label">
                                {Intl.get('leave.apply.for.leave.time', '出差时间')}:
                            </span>
                            <span className="user-info-text">
                                {isOneDay ? beginDate : (beginDate + ' - ' + endDate)}
                            </span>
                        </div>
                        <div className="apply-info-label">
                            <span className="user-info-label">
                                {Intl.get('leave.apply.for.city.address', '出差地点')}:
                            </span>
                            <span className="user-info-text">
                                {detail.milestone}
                            </span>
                        </div>
                        <div className="apply-info-label">
                            <span className="user-info-label">
                                {Intl.get('leave.apply.add.leave.reason', '出差事由')}:
                            </span>
                            <span className="user-info-text">
                                {detail.reason}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
            return (<Alert message={message} type="error" showIcon={true}/> );
        }
        let replyList = replyListInfo.list;
        if (_.isArray(replyList) && replyList.length) {
            return (
                <ul>
                    {replyList.map((replyItem, index) => {
                        return (
                            <li key={index} className="apply-info-label">
                                <span className="user-info-label">{replyItem.user_name}:</span>
                                <span className="user-info-text">{replyItem.comment}</span>
                                <span className="user-info-label reply-date-text">{
                                    moment(replyItem.comment_time).format(oplateConsts.DATE_TIME_FORMAT)}</span>
                            </li>);
                    })}
                </ul>);
        } else {
            return null;
        }
    }

    //添加一条回复
    addReply = (e) => {
        Trace.traceEvent(e, '点击回复按钮');
        //如果ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        //构造提交数据
        var submitData = {
            id: this.props.detailItem.id,
            comment: $.trim(this.state.replyFormInfo.comment),
        };
        if (!submitData.comment) {
            ApplyViewDetailActions.showReplyCommentEmptyError();
            return;
        }
        //提交数据
        ApplyViewDetailActions.addBusinessApplyComments(submitData);
    };
    //备注 输入框改变时候触发
    commentInputChange = (event) => {
        //如果添加回复的ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        var val = $.trim(event.target.value);
        ApplyViewDetailActions.setApplyFormDataComment(val);
        if (val) {
            ApplyViewDetailActions.hideReplyCommentEmptyError();
        }
    };
    //渲染回复表单loading,success,error
    renderReplyFormResult() {
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
    }

    getNoSecondTimeStr(time) {
        return time ? moment(time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT) : '';
    }

    getApplyResultDscr(detailInfoObj) {
        let resultDscr = '';
        switch (detailInfoObj.status) {
            case 'pass':
                resultDscr = Intl.get('user.apply.detail.pass', '通过申请');
                break;
            case 'reject':
                resultDscr = Intl.get('user.apply.detail.reject', '驳回申请');
                break;
        }
        return resultDscr;
    }

    viewApprovalResult = (e) => {
        Trace.traceEvent(e, '查看审批结果');
        this.getBusinessApplyDetailData(this.props.detailItem);
    };

    renderApplyFormResult = () => {
        if (this.state.applyResult.submitResult === 'loading' || true) {
            return (
                <Modal
                    container={this}
                    show={true}
                    aria-labelledby="contained-modal-title"
                >
                    <Modal.Body>
                        <div className="approval_loading">
                            <Spinner/>
                            <p>
                                {Intl.get('user.apply.detail.submit.sending', '审批中...')}
                            </p>
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
                        <p>
                            {Intl.get('user.apply.detail.submit.success', '审批成功')}
                        </p>
                        <Button type="ghost" onClick={this.viewApprovalResult}>
                            {Intl.get('user.apply.detail.show.content', '查看审批结果')}
                        </Button>
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
                            onClick={this.reSendApproval}>
                            {Intl.get('common.retry', '重试')}
                        </Button>
                        <Button type="ghost" className="cancel_send"
                            onClick={this.cancelSendApproval}>
                            {Intl.get('common.cancel', '取消')}
                        </Button>
                    </div>
                </div>
            );
        }
        return null;
    };

    //重新发送
    reSendApproval = (e) => {
        Trace.traceEvent(e, '点击重试按钮');
        this.submitApprovalForm();
    };

    //取消发送
    cancelSendApproval = (e) => {
        Trace.traceEvent(e, '点击取消按钮');
        ApplyViewDetailActions.cancelSendApproval();
    };

    submitApprovalForm = (approval) => {
        if (approval === 'pass') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击通过按钮');
        } else if (approval === 'reject') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击驳回按钮');
        }
        var selectedDetailItem = this.state.selectedDetailItem;
        ApplyViewDetailActions.approveApplyPassOrReject(selectedDetailItem.id, {agree: approval});
    };
    //渲染详情底部区域
    renderDetailBottom() {
        var selectedDetailItem = this.state.selectedDetailItem;
        var detailInfoObj = this.state.detailInfoObj.info;
        var showBackoutApply = detailInfoObj.presenter_id === userData.getUserData().user_id;
        //todo  true作为测试
        //是否显示通过驳回
        var isRealmAdmin = userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) ||
            userData.hasRole(userData.ROLE_CONSTANS.REALM_OWNER) ||
            userData.hasRole(userData.ROLE_CONSTANS.OPLATE_REALM_ADMIN) ||
            userData.hasRole(userData.ROLE_CONSTANS.OPLATE_REALM_OWNER) || true;
        //是否审批
        let isConsumed = selectedDetailItem.status === 'pass' || selectedDetailItem.status === 'reject';
        return (
            <div className="approval_block">
                <Row className="approval_person clearfix">
                    <Col span={10}>
                        <span className="approval-info-label">
                            {this.getNoSecondTimeStr(selectedDetailItem.create_time)}
                        </span>
                        <span className="approval-info-label">
                            {_.get(selectedDetailItem, 'applicant.user_name')}
                            {Intl.get('crm.109', '申请')}
                        </span>
                    </Col>
                    <Col span={14}>
                        {isConsumed ? (
                            <div className="pull-right">
                                <span className="approval-info-label">
                                    {this.getNoSecondTimeStr(selectedDetailItem.update_time)}
                                </span>
                                <span className="approval-info-label">
                                    {_.last(_.get(selectedDetailItem, 'approve_details')).user_name || ''}
                                    {this.getApplyResultDscr(selectedDetailItem)}
                                </span>
                            </div>) : (
                            <div className="pull-right">
                                {isRealmAdmin ? (
                                    <Button type="primary" className="btn-primary-sure" size="small"
                                        onClick={this.submitApprovalForm.bind(this, 'pass')}>
                                        {Intl.get('user.apply.detail.button.pass', '通过')}
                                    </Button>) : null}
                                {isRealmAdmin ? (
                                    <Button type="primary" className="btn-primary-sure" size="small"
                                        onClick={this.submitApprovalForm.bind(this, 'reject')}>
                                        {Intl.get('common.apply.reject', '驳回')}
                                    </Button>) : null}
                            </div>)}
                    </Col>
                </Row>
            </div>);
    }

    //渲染申请单详情
    renderApplyDetailInfo() {
        var detailInfo = this.state.detailInfoObj.info;
        //如果没有详情数据，不渲染
        if (this.state.detailInfoObj.loadingResult || _.isEmpty(this.state.detailInfoObj)) {
            return;
        }
        //是否启用滚动条
        let GeminiScrollbarEnabled = false;
        //详情高度
        let applyDetailHeight = this.getApplyListDivHeight();
        let selectedDetailItem = this.state.selectedDetailItem;
        return (
            <div>
                <div className="apply-detail-title">
                    <span className="apply-type-tip">
                        {LeaveApplyUtils.getApplyTopicText(selectedDetailItem)}
                    </span>
                    {selectedDetailItem.order_id ? (
                        <span className="order-id">
                            {Intl.get('crm.147', '订单号')}：{selectedDetailItem.order_id}
                        </span>) : null}
                </div>
                <div className="apply-detail-content" style={{height: applyDetailHeight}} ref="geminiWrap">
                    <GeminiScrollbar ref="gemini">
                        {this.renderDetailCustomerBlock(detailInfo)}
                        {/*渲染请假详情*/}
                        {this.renderBusinessApplyDetail(detailInfo)}
                        {/*detailInfo.comment ? (<div className="apply-detail-common apply-detail-info">
                         <div className="common-icon-block">
                         <span className="iconfont icon-common"/>
                         </div>
                         {this.renderComment()}
                         </div>) : null*/}
                        <div className="apply-detail-reply-list apply-detail-info">
                            <div className="reply-icon-block">
                                <span className="iconfont icon-apply-message-tip"/>
                            </div>
                            <div className="reply-info-block apply-info-block">
                                <div className="reply-list-container apply-info-content">
                                    {this.renderReplyList()}
                                    {/*已经通过和驳回的申请，不能再添加回复了*/}
                                    {selectedDetailItem.status === 'pass' || selectedDetailItem.status === 'reject' ? null :
                                        <Input addonAfter={(
                                            <a onClick={this.addReply}>{Intl.get('user.apply.reply.button', '回复')}</a>)}
                                        value={this.state.replyFormInfo.comment}
                                        onChange={this.commentInputChange}
                                        placeholder={Intl.get('user.apply.reply.no.content', '请填写回复内容')}/>}


                                    {this.renderReplyFormResult()}
                                </div>
                            </div>
                        </div>
                    </GeminiScrollbar>

                </div>
                {this.renderDetailBottom()}
            </div>
        );
    }

    render() {
        //如果获取左侧列表失败了，则显示空
        if (this.props.showNoData) {
            return null;
        }
        return (
            <div className='col-md-8 leave_manage_apply_detail_wrap' data-tracename="出差审批详情界面">
                {this.renderApplyDetailLoading()}
                {this.renderApplyDetailError()}
                {this.renderApplyDetailNodata()}
                {this.renderApplyDetailInfo()}
                {this.renderApplyFormResult()}
                {/*this.renderBackoutApply()*/}
                {/*该客户下的用户列表*/}
                {
                    this.state.isShowCustomerUserListPanel ?
                        <RightPanel
                            className="customer-user-list-panel"
                            showFlag={this.state.isShowCustomerUserListPanel}
                        >
                            <AppUserManage
                                customer_id={customerOfCurUser.id}
                                hideCustomerUserList={this.closeCustomerUserListPanel}
                                customer_name={customerOfCurUser.name}
                            />
                        </RightPanel> : null
                }

            </div>

        );
    }
}
ApplyViewDetail.defaultProps = {
    detailItem: {},
    showNoData: false,

};
ApplyViewDetail.propTypes = {
    detailItem: PropTypes.string,
    showNoData: PropTypes.boolean
};
module.exports = ApplyViewDetail;