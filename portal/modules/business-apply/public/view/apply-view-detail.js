/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/18.
 */
var applyBusinessDetailStore = require('../store/apply-business-detail-store');
var ApplyViewDetailActions = require('../action/apply-view-detail-action');
import Trace from 'LIB_DIR/trace';
import {Alert, Icon, Input, Row, Col, Button,Steps} from 'antd';
const Step = Steps.Step;
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
require('../css/business-apply-detail.less');
import ApplyDetailRemarks from 'CMP_DIR/apply-detail-remarks';
import ApplyDetailInfo from 'CMP_DIR/apply-detail-info';
import ApplyDetailCustomer from 'CMP_DIR/apply-detail-customer';
import ApplyDetailStatus from 'CMP_DIR/apply-detail-status';
import ApplyApproveStatus from 'CMP_DIR/apply-approve-status';
import ApplyDetailBottom from 'CMP_DIR/apply-detail-bottom';
import ApplyDetailBlock from 'CMP_DIR/apply-detail-block';
import {APPLY_LIST_LAYOUT_CONSTANTS,APPLY_STATUS} from 'PUB_DIR/sources/utils/consts';
import {getApplyTopicText,getApplyResultDscr,getApplyStatusTimeLineDesc,getFilterReplyList} from 'PUB_DIR/sources/utils/common-method-util';
let userData = require('PUB_DIR/sources/user-data');
import ModalDialog from 'CMP_DIR/ModalDialog';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            showBackoutConfirm: false,
            ...applyBusinessDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(applyBusinessDetailStore.getState());
    };

    componentDidMount() {
        applyBusinessDetailStore.listen(this.onStoreChange);
        if (_.get(this.props,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                ApplyViewDetailActions.setDetailInfoObj(this.props.detailItem);
            });
        }else if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem);
        }
    }

    componentWillReceiveProps(nextProps) {
        var thisPropsId = this.props.detailItem.id;
        var nextPropsId = nextProps.detailItem.id;
        if (_.get(nextProps,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                ApplyViewDetailActions.setDetailInfoObj(nextProps.detailItem);
            });
        }else if (thisPropsId && nextPropsId && nextPropsId !== thisPropsId) {
            this.getBusinessApplyDetailData(nextProps.detailItem);
        }
    }

    componentWillUnmount() {
        applyBusinessDetailStore.unlisten(this.onStoreChange);
    }

    getApplyListDivHeight() {
        var height = $(window).height() - APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA - APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
        return height;
    }

    retryFetchDetail = (e) => {
        Trace.traceEvent(e, '点击了重试');
        if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem);
        }
    };
    //审批状态
    renderApplyStatus = () => {
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
    };

    getBusinessApplyDetailData(detailItem) {
        setTimeout(() => {
            ApplyViewDetailActions.setInitialData(detailItem);
            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (detailItem.status === 'pass' || detailItem.status === 'reject') {
                ApplyViewDetailActions.getBusinessApplyCommentList({id: detailItem.id});
                ApplyViewDetailActions.getBusinessApplyDetailById({id: detailItem.id}, detailItem.status);
            } else if (detailItem.id) {
                ApplyViewDetailActions.getBusinessApplyDetailById({id: detailItem.id});
                ApplyViewDetailActions.getBusinessApplyCommentList({id: detailItem.id});
                //根据申请的id获取申请的状态
                ApplyViewDetailActions.getApplyStatusById({id: detailItem.id});

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
    //重新获取申请的状态
    refreshApplyStatusList = (e) => {
        var detailItem = this.props.detailItem;
        ApplyViewDetailActions.getApplyStatusById({id: detailItem.id});
    };

    //显示客户详情
    showCustomerDetail(customerId) {
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

    renderDetailApplyBlock(detailInfo) {
        var detail = detailInfo.detail || {};
        var applicant = detailInfo.applicant || {};
        var beginDate = moment(detail.begin_time).format(oplateConsts.DATE_FORMAT);
        var endDate = moment(detail.end_time).format(oplateConsts.DATE_FORMAT);
        var isOneDay = beginDate === endDate;
        var customers = _.get(detail, 'customers[0]', {});
        //展示客户的地址，只展示到县区就可以，不用展示到街道
        var customersAdds = [];
        _.forEach(detail.customers, (item) => {
            if (!_.isEmpty(item)){
                customersAdds.push('' + _.get(customers,'province','') + _.get(customers,'city','') + _.get(customers,'county',''));

            }
        });
        //去掉数组中的重复元素
        customersAdds = _.uniq(customersAdds);
        var showApplyInfo = [{
            label: Intl.get('common.login.time', '时间'),
            text: isOneDay ? beginDate : (beginDate + ' - ' + endDate)
        }, {
            label: Intl.get('user.info.login.address', '地点'),
            text: customersAdds.join('，')
        }, {
            label: Intl.get('leave.apply.for.application', '人员'),
            text: applicant.nick_name,
        }];
        return (
            <ApplyDetailInfo
                iconClass='icon-business-trip'
                showApplyInfo={showApplyInfo}
            />
        );
    }

    renderBusinessCustomerDetail(detailInfo) {
        var detail = detailInfo.detail || {};
        var customersArr = _.get(detailInfo, 'detail.customers');
        var _this = this;
        var columns = [
            {
                title: Intl.get('call.record.customer', '客户'),
                dataIndex: 'name',
                className: 'apply-customer-name',
                render: function(text, record, index) {
                    return (
                        <a href="javascript:void(0)"
                            onClick={_this.showCustomerDetail.bind(this, record.id)}
                            data-tracename="查看客户详情"
                            title={Intl.get('call.record.customer.title', '点击可查看客户详情')}
                        >
                            {text}
                        </a>
                    );
                }
            }, {
                title: Intl.get('common.remark', '备注'),
                dataIndex: 'remarks',
                className: 'apply-remarks'
            }];
        return (
            <ApplyDetailCustomer
                columns={columns}
                data={customersArr}
            />
        );
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
            comment: _.trim(this.state.replyFormInfo.comment),
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
        var val = _.trim(event.target.value);
        ApplyViewDetailActions.setApplyFormDataComment(val);
        if (val) {
            ApplyViewDetailActions.hideReplyCommentEmptyError();
        }
    };

    viewApprovalResult = (e) => {
        Trace.traceEvent(e, '查看审批结果');
        this.getBusinessApplyDetailData(this.props.detailItem);
        //设置这条审批不再展示通过和驳回的按钮
        ApplyViewDetailActions.hideApprovalBtns();
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
        // var selectedDetailItem = this.state.selectedDetailItem;
        var detailInfoObj = this.state.detailInfoObj.info;
        ApplyViewDetailActions.approveApplyPassOrReject({id: detailInfoObj.id, agree: approval});
    };
    //渲染详情底部区域
    renderDetailBottom() {
        var detailInfoObj = this.state.detailInfoObj.info;
        //是否审批
        let isConsumed = detailInfoObj.status === 'pass' || detailInfoObj.status === 'reject';
        var userName = _.last(_.get(detailInfoObj, 'approve_details')) ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name : '' : '';
        var approvalDes = getApplyResultDscr(detailInfoObj);
        let showCancelBtn = detailInfoObj.showCancelBtn;
        let renderAssigenedContext = null;
        if (hasPrivilege('GET_MY_WORKFLOW_LIST') && showCancelBtn ){
            // 在没有通过申请前，可以撤销自己的申请
            renderAssigenedContext = this.renderCancelApplyApproveBtn;
        }
        return (
            <ApplyDetailBottom
                create_time={detailInfoObj.create_time}
                applicantText={_.get(detailInfoObj, 'applicant.nick_name','') + Intl.get('crm.109', '申请')}
                isConsumed={isConsumed}
                update_time={detailInfoObj.update_time}
                approvalText={userName + approvalDes}
                showApproveBtn={detailInfoObj.showApproveBtn || showCancelBtn}
                submitApprovalForm={this.submitApprovalForm}
                renderAssigenedContext={renderAssigenedContext}
            />
        );
    }

    renderApplyApproveSteps = () => {
        var stepStatus = '';
        var applicantList = _.get(this.state, 'detailInfoObj.info');
        var replyList = getFilterReplyList(this.state);
        var applicateName = _.get(applicantList, 'applicant.nick_name') || '';
        var applicateTime = moment(_.get(applicantList, 'create_time')).format(oplateConsts.DATE_TIME_FORMAT);
        var stepArr = [{
            title: applicateName + Intl.get('user.apply.submit.list', '提交申请'),
            description: applicateTime
        }];
        var currentLength = 0;
        //过滤掉手动添加的回复
        currentLength = replyList.length;
        if (currentLength) {
            _.forEach(replyList, (replyItem, index) => {
                var descrpt = getApplyStatusTimeLineDesc(replyItem.status);
                if (replyItem.status === 'reject') {
                    stepStatus = 'error';
                    currentLength--;
                }
                stepArr.push({
                    title: (replyItem.nick_name || userData.getUserData().nick_name || '') + descrpt,
                    description: moment(replyItem.comment_time).format(oplateConsts.DATE_TIME_FORMAT)
                });
            });
        }
        //如果下一个节点是直接主管审核
        if (applicantList.status === 'ongoing') {
            stepArr.push({
                title: Intl.get('user.apply.false', '待审批'),
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
    };
    renderCancelApplyApproveBtn = () => {
        return (
            <div className="pull-right">
                {this.state.backApplyResult.loading ?
                    <Icon type="loading"/> :
                    <Button type="primary" className="btn-primary-sure" size="small"
                        onClick={this.saleConfirmBackoutApply}>
                        {Intl.get('user.apply.detail.backout', '撤销申请')}
                    </Button>}
            </div>
        );
    };
    renderCancelApplyApprove = () => {
        if (this.state.showBackoutConfirm){
            return (
                <ModalDialog
                    modalShow={this.state.showBackoutConfirm}
                    container={this}
                    hideModalDialog={this.hideBackoutModal}
                    modalContent={Intl.get('user.apply.detail.modal.content', '是否撤销此申请？')}
                    delete={this.cancelApplyApprove}
                    showResultLoading={this.state.backApplyResult.loading}
                    okText={Intl.get('user.apply.detail.modal.ok', '撤销')}
                    delayClose={true}
                />
            );
        }else{
            return null;
        }
    };
    // 确认撤销申请
    saleConfirmBackoutApply = (e) => {
        Trace.traceEvent(e, '点击撤销申请按钮');
        this.setState({
            showBackoutConfirm: true
        });
    };
    // 隐藏撤销申请的模态框
    hideBackoutModal = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-cancel'), '点击取消按钮');
        this.setState({
            showBackoutConfirm: false
        });
    };
    // 撤销申请
    cancelApplyApprove = (e) => {
        e.stopPropagation();
        Trace.traceEvent(e, '点击撤销按钮');
        let backoutObj = {
            id: this.props.detailItem.id,
        };
        ApplyViewDetailActions.cancelApplyApprove(backoutObj,() => {
            this.setState({
                showBackoutConfirm: false
            });
        });
    };

    //渲染申请单详情
    renderApplyDetailInfo() {
        var detailInfo = this.state.detailInfoObj.info;
        //如果没有详情数据，不渲染
        if (this.state.detailInfoObj.loadingResult || _.isEmpty(this.state.detailInfoObj)) {
            return;
        }
        //详情高度
        let applyDetailHeight = this.getApplyListDivHeight();
        return (
            <div>
                <div className="apply-detail-title">
                    <span className="apply-type-tip">
                        {getApplyTopicText(detailInfo)}
                    </span>
                </div>
                <div className="apply-detail-content" style={{height: applyDetailHeight}} ref="geminiWrap">
                    <GeminiScrollbar ref="gemini">
                        {this.renderDetailApplyBlock(detailInfo)}
                        {/*渲染客户详情*/}
                        {_.isArray(_.get(detailInfo, 'detail.customers')) ? this.renderBusinessCustomerDetail(detailInfo) : null}
                        {this.renderApplyStatus()}
                        <ApplyDetailRemarks
                            detailInfo={detailInfo}
                            replyListInfo={this.state.replyListInfo}
                            replyFormInfo={this.state.replyFormInfo}
                            refreshReplyList={this.refreshReplyList}
                            addReply={this.addReply}
                            commentInputChange={this.commentInputChange}
                        />
                    </GeminiScrollbar>

                </div>
                {this.renderDetailBottom()}
                {this.renderCancelApplyApprove()}
            </div>
        );
    }

    render() {
        //如果获取左侧列表失败了，则显示空
        if (this.props.showNoData) {
            return null;
        }
        return (
            <div className='col-md-8 business_apply_detail_wrap' data-tracename="出差审批详情界面">
                <ApplyDetailStatus
                    showLoading={this.state.detailInfoObj.loadingResult === 'loading'}
                    showErrTip={this.state.detailInfoObj.loadingResult === 'error'}
                    errMsg={this.state.detailInfoObj.errorMsg}
                    retryFetchDetail={this.retryFetchDetail}
                    showNoData={this.props.showNoData}
                />
                {this.renderApplyDetailInfo()}
                <ApplyApproveStatus
                    showLoading={this.state.applyResult.submitResult === 'loading'}
                    approveSuccess={this.state.applyResult.submitResult === 'success'}
                    viewApprovalResult={this.viewApprovalResult}
                    approveError={this.state.applyResult.submitResult === 'error'}
                    applyResultErrorMsg={this.state.applyResult.errorMsg}
                    reSendApproval={this.reSendApproval}
                    cancelSendApproval={this.cancelSendApproval}
                    container={this}
                />
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