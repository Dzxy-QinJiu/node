/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var LeaveApplyDetailStore = require('../store/leave-apply-detail-store');
var LeaveApplyDetailAction = require('../action/leave-apply-detail-action');
import Trace from 'LIB_DIR/trace';
import {Alert, Icon, Input, Row, Col, Button} from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
require('../css/sales-opportunity-apply-detail.less');
import ApplyDetailRemarks from 'CMP_DIR/apply-detail-remarks';
import ApplyDetailInfo from 'CMP_DIR/apply-detail-info';
import ApplyDetailCustomer from 'CMP_DIR/apply-detail-customer';
import ApplyDetailStatus from 'CMP_DIR/apply-detail-status';
import ApplyApproveStatus from 'CMP_DIR/apply-approve-status';
import ApplyDetailBottom from 'CMP_DIR/apply-detail-bottom';
import {APPLY_LIST_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {getApplyTopicText, getApplyResultDscr} from 'PUB_DIR/sources/utils/common-method-util';
class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            ...LeaveApplyDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(LeaveApplyDetailStore.getState());
    };

    componentDidMount() {
        LeaveApplyDetailStore.listen(this.onStoreChange);
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
        LeaveApplyDetailStore.unlisten(this.onStoreChange);
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

    getBusinessApplyDetailData(detailItem) {
        setTimeout(() => {
            LeaveApplyDetailAction.setInitialData(detailItem);

            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (detailItem.status === 'pass' || detailItem.status === 'reject') {
                LeaveApplyDetailAction.setApplyComment(detailItem.approve_details);
                LeaveApplyDetailAction.getLeaveApplyDetailById({id: detailItem.id},detailItem.status);
            } else if (detailItem.id) {
                LeaveApplyDetailAction.getLeaveApplyDetailById({id: detailItem.id});
                LeaveApplyDetailAction.getLeaveApplyCommentList({id: detailItem.id});
                //根据申请的id获取申请的状态
                LeaveApplyDetailAction.getLeaveApplyStatusById({id: detailItem.id});
            }
        });
    }

    //重新获取回复列表
    refreshReplyList = (e) => {
        Trace.traceEvent(e, '点击了重新获取');
        var detailItem = this.props.detailItem;
        if (detailItem.status === 'pass' || detailItem.state === 'reject') {
            LeaveApplyDetailAction.setApplyComment(detailItem.approve_details);
        } else if (detailItem.id) {
            LeaveApplyDetailAction.getLeaveApplyCommentList({id: detailItem.id});
        }
    };
    //重新获取申请的状态
    refreshApplyStatusList = (e) => {
        var detailItem = this.props.detailItem;
        LeaveApplyDetailAction.getLeaveApplyStatusById({id: detailItem.id});
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
        var _this = this;
        var detail = detailInfo.detail || {};
        var expectdeal_time = moment(detail.expectdeal_time).format(oplateConsts.DATE_FORMAT);
        var customers = _.get(detail, 'customers[0]', {});
        var applyStatus = this.getApplyStatusText(detailInfo);
        var productArr = [];
        _.forEach(detail.apps,(app) => {
            productArr.push(app.client_name);
        });
        var showApplyInfo = [
            {
                label: Intl.get('call.record.customer', '客户'),
                renderText: function() {
                    return (
                        <a href="javascript:void(0)"
                            onClick={_this.showCustomerDetail.bind(this, _.get(detail, 'customer.id'))}
                        >
                            {_.get(detail, 'customer.name')}
                        </a>
                    );
                }
            }, {
                label: Intl.get('leave.apply.buget.count', '预算'),
                text: detail.budget + Intl.get('contract.82', '元')
            }, {
                label: Intl.get('leave.apply.buy.apps', '产品'),
                text: productArr.join(',')
            }, {
                label: Intl.get('leave.apply.inspect.success.time', '预计成交时间'),
                text: expectdeal_time
            }, {
                label: Intl.get('common.remark', '备注'),
                text: detail.remark
            }, {
                label: Intl.get('leave.apply.application.status', '审批状态'),
                text: applyStatus
            }];
        return (
            <ApplyDetailInfo
                showApplyInfo={showApplyInfo}
            />
        );
    }

    getApplyStatusText = (obj) => {
        if (obj.status === 'pass') {
            return Intl.get('user.apply.pass', '已通过');
        } else if (obj.status === 'reject') {
            return Intl.get('user.apply.reject', '已驳回');
        } else {
            if (this.state.replyStatusInfo.result === 'loading') {
                return (<Icon type="loading"/>);
            } else if (this.state.replyStatusInfo.errorMsg) {
                var message = (
                    <span>{this.state.replyStatusInfo.errorMsg}，<Icon type="reload"
                        onClick={this.refreshApplyStatusList}
                        title={Intl.get('common.get.again', '重新获取')}/></span>);
                return (<Alert message={message} type="error" showIcon={true}/> );
            } else if (_.isArray(this.state.replyStatusInfo.list)) {
                //状态可能会有多个
                return (
                    <span>{Intl.get('leave.apply.detail.wait', '待') + this.state.replyStatusInfo.list.join(',') + Intl.get('contract.10', '审核')}</span>
                );
            }
        }
    };

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
            comment: $.trim(this.state.replyFormInfo.comment),
        };
        if (!submitData.comment) {
            LeaveApplyDetailAction.showReplyCommentEmptyError();
            return;
        }
        //提交数据
        LeaveApplyDetailAction.addLeaveApplyComments(submitData);
    };
    //备注 输入框改变时候触发
    commentInputChange = (event) => {
        //如果添加回复的ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        var val = $.trim(event.target.value);
        LeaveApplyDetailAction.setApplyFormDataComment(val);
        if (val) {
            LeaveApplyDetailAction.hideReplyCommentEmptyError();
        }
    };

    viewApprovalResult = (e) => {
        Trace.traceEvent(e, '查看审批结果');
        this.getBusinessApplyDetailData(this.props.detailItem);
        //设置这条审批不再展示通过和驳回的按钮
        LeaveApplyDetailAction.hideApprovalBtns();
    };

    //重新发送
    reSendApproval = (e) => {
        Trace.traceEvent(e, '点击重试按钮');
        this.submitApprovalForm();
    };

    //取消发送
    cancelSendApproval = (e) => {
        Trace.traceEvent(e, '点击取消按钮');
        LeaveApplyDetailAction.cancelSendApproval();
    };

    submitApprovalForm = (approval) => {
        if (approval === 'pass') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击通过按钮');
        } else if (approval === 'reject') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击驳回按钮');
        }
        var detailInfoObj = this.state.detailInfoObj.info;
        LeaveApplyDetailAction.approveLeaveApplyPassOrReject({
            id: detailInfoObj.id,
            agree: approval
        });
    };
    //渲染详情底部区域
    renderDetailBottom() {
        var detailInfoObj = this.state.detailInfoObj.info;
        //是否审批
        let isConsumed = detailInfoObj.status === 'pass' || detailInfoObj.status === 'reject';
        var userName = _.last(_.get(detailInfoObj, 'approve_details')) ? _.last(_.get(detailInfoObj, 'approve_details')).user_name : '';
        var approvalDes = getApplyResultDscr(detailInfoObj);
        return (
            <ApplyDetailBottom
                create_time={detailInfoObj.create_time}
                applicantText={_.get(detailInfoObj, 'applicant.user_name') + Intl.get('crm.109', '申请')}
                isConsumed={isConsumed}
                update_time={detailInfoObj.update_time}
                approvalText={userName + approvalDes}
                showApproveBtn={detailInfoObj.showApproveBtn}
                submitApprovalForm={this.submitApprovalForm}
            />);
    }

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
                <ApplyDetailStatus
                    showLoading={this.state.detailInfoObj.loadingResult === 'loading'}
                    showErrTip = {this.state.detailInfoObj.loadingResult === 'error'}
                    errMsg={this.state.detailInfoObj.errorMsg}
                    retryFetchDetail={this.retryFetchDetail}
                    showNoData={this.props.showNoData}
                />
                {this.renderApplyDetailInfo()}
                <ApplyApproveStatus
                    showLoading = {this.state.applyResult.submitResult === 'loading'}
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