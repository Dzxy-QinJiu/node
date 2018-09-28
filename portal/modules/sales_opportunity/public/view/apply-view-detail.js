/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var SalesOpportunityApplyDetailStore = require('../store/sales-opportunity-apply-detail-store');
var SalesOpportunityApplyDetailAction = require('../action/sales-opportunity-apply-detail-action');
var Spinner = require('CMP_DIR/spinner');
import Trace from 'LIB_DIR/trace';
import {Alert, Icon, Input, Row, Col, Button} from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
require('../css/sales-opportunity-apply-detail.less');
import userData from 'PUB_DIR/sources/user-data';
import {Modal} from 'react-bootstrap';
import ApplyDetailRemarks from 'CMP_DIR/apply-detail-remarks';
import ApplyDetailInfo from 'CMP_DIR/apply-detail-info';
import ApplyDetailCustomer from 'CMP_DIR/apply-detail-customer';
import {APPLY_LIST_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {getApplyTopicText} from 'PUB_DIR/sources/utils/common-method-util';
class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            ...SalesOpportunityApplyDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(SalesOpportunityApplyDetailStore.getState());
    };

    componentDidMount() {
        SalesOpportunityApplyDetailStore.listen(this.onStoreChange);
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
        SalesOpportunityApplyDetailStore.unlisten(this.onStoreChange);
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
            SalesOpportunityApplyDetailAction.setInitialData(detailItem);
            SalesOpportunityApplyDetailAction.getSalesOpportunityApplyDetailById({id: detailItem.id});
            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (detailItem.status === 'pass' || detailItem.state === 'reject') {
                SalesOpportunityApplyDetailAction.setApplyComment(detailItem.approve_details);
            } else if (detailItem.id) {
                SalesOpportunityApplyDetailAction.getSalesOpportunityApplyCommentList({id: detailItem.id});
                //根据申请的id获取申请的状态
                SalesOpportunityApplyDetailAction.getSalesOpportunityApplyStatusById({id: detailItem.id});
            }
        });
    }

    //重新获取回复列表
    refreshReplyList = (e) => {
        Trace.traceEvent(e, '点击了重新获取');
        var detailItem = this.props.detailItem;
        if (detailItem.status === 'pass' || detailItem.state === 'reject') {
            SalesOpportunityApplyDetailAction.setApplyComment(detailItem.approve_details);
        } else if (detailItem.id) {
            SalesOpportunityApplyDetailAction.getSalesOpportunityApplyCommentList({id: detailItem.id});
        }
    };
    //重新获取申请的状态
    refreshApplyStatusList = (e) => {
        var detailItem = this.props.detailItem;
        SalesOpportunityApplyDetailAction.getSalesOpportunityApplyStatusById({id: detailItem.id});
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
                text: _.get(detail, 'customer.name'),
            }, {
                label: Intl.get('leave.apply.buget.count', '预算'),
                text: detail.budget
            }, {
                label: Intl.get('leave.apply.buy.apps', '产品'),
                text: productArr.join(',')
            }, {
                label: Intl.get('leave.apply.inspect.success.time', '预计成交时间'),
                text: expectdeal_time
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
                    <span>{Intl.get('leave.apply.detail.wait', '待') + this.state.replyStatusInfo.list.join(',')}</span>
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
            SalesOpportunityApplyDetailAction.showReplyCommentEmptyError();
            return;
        }
        //提交数据
        SalesOpportunityApplyDetailAction.addSalesOpportunityApplyComments(submitData);
    };
    //备注 输入框改变时候触发
    commentInputChange = (event) => {
        //如果添加回复的ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        var val = $.trim(event.target.value);
        SalesOpportunityApplyDetailAction.setApplyFormDataComment(val);
        if (val) {
            SalesOpportunityApplyDetailAction.hideReplyCommentEmptyError();
        }
    };

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
        //设置这条审批不再展示通过和驳回的按钮
        SalesOpportunityApplyDetailAction.hideApprovalBtns();
    };

    renderApplyFormResult = () => {
        if (this.state.applyResult.submitResult === 'loading') {
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
        SalesOpportunityApplyDetailAction.cancelSendApproval();
    };

    submitApprovalForm = (approval) => {
        if (approval === 'pass') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击通过按钮');
        } else if (approval === 'reject') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击驳回按钮');
        }
        // var selectedDetailItem = this.state.selectedDetailItem;
        var detailInfoObj = this.state.detailInfoObj.info;
        SalesOpportunityApplyDetailAction.approveSalesOpportunityApplyPassOrReject({
            id: detailInfoObj.id,
            agree: approval
        });
    };
    //渲染详情底部区域
    renderDetailBottom() {
        // var selectedDetailItem = this.state.selectedDetailItem;
        var detailInfoObj = this.state.detailInfoObj.info;
        var showBackoutApply = detailInfoObj.presenter_id === userData.getUserData().user_id;
        //todo  true作为测试
        //是否显示通过驳回
        var showApproveBtn = detailInfoObj.showApproveBtn;
        //是否审批
        let isConsumed = detailInfoObj.status === 'pass' || detailInfoObj.status === 'reject';
        return (
            <div className="approval_block">
                <Row className="approval_person clearfix">
                    <Col span={10}>
                        <span className="approval-info-label">
                            {this.getNoSecondTimeStr(detailInfoObj.create_time)}
                        </span>
                        <span className="approval-info-label">
                            {_.get(detailInfoObj, 'applicant.user_name')}
                            {Intl.get('crm.109', '申请')}
                        </span>
                    </Col>
                    <Col span={14}>
                        {isConsumed ? (
                            <div className="pull-right">
                                <span className="approval-info-label">
                                    {this.getNoSecondTimeStr(detailInfoObj.update_time)}
                                </span>
                                <span className="approval-info-label">
                                    {_.last(_.get(detailInfoObj, 'approve_details')).user_name || ''}
                                    {this.getApplyResultDscr(detailInfoObj)}
                                </span>
                            </div>) : (
                            detailInfoObj.showApproveBtn ? <div className="pull-right">
                                <Button type="primary" className="btn-primary-sure" size="small"
                                    onClick={this.submitApprovalForm.bind(this, 'pass')}>
                                    {Intl.get('user.apply.detail.button.pass', '通过')}
                                </Button>
                                <Button type="primary" className="btn-primary-sure" size="small"
                                    onClick={this.submitApprovalForm.bind(this, 'reject')}>
                                    {Intl.get('common.apply.reject', '驳回')}
                                </Button>
                            </div> : null
                        )}
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
                            getApplyResultDscr={this.getApplyResultDscr}
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