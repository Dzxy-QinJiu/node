/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/18.
 */
var applyLeaveDetailStore = require('../store/apply-leave-detail-store');
var ApplyViewDetailActions = require('../action/apply-view-detail-action');
var LeaveApplyUtils = require('../utils/leave-apply-utils');
var Spinner = require('CMP_DIR/spinner');
import Trace from 'LIB_DIR/trace';
import {Alert} from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from '../../../../components/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
require('../css/leave-apply-detail.less');
class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            ...applyLeaveDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(applyLeaveDetailStore.getState());
    };

    componentDidMount() {
        applyLeaveDetailStore.listen(this.onStoreChange);
        if (this.props.detailItem.id) {
            this.getLeaveApplyDetailById(this.props.detailItem, this.props.applyData);
        }
    }
    componentWillReceiveProps(nextProps) {
        var thisPropsId = this.props.detailItem.id;
        var nextPropsId = nextProps.detailItem.id;
        if (thisPropsId && nextPropsId && nextPropsId !== thisPropsId) {
            this.getLeaveApplyDetailById(nextProps.detailItem);
        }
    }

    componentWillUnmount() {
        applyLeaveDetailStore.unlisten(this.onStoreChange);
    }

    getApplyListDivHeight() {
        var height = $(window).height() - LeaveApplyUtils.APPLY_LIST_LAYOUT_CONSTANTS.TOP_DELTA - LeaveApplyUtils.APPLY_LIST_LAYOUT_CONSTANTS.BOTTOM_DELTA;
        return height;
    }

    retryFetchDetail = (e) => {
        Trace.traceEvent(e, '点击了重试');
        this.getLeaveApplyDetailById(this.props.detailItem);
    };

    getLeaveApplyDetailById(detailItem, applyData) {

        setTimeout(() => {
            ApplyViewDetailActions.setInitialData(detailItem);
            ApplyViewDetailActions.getLeaveApplyDetailById({id: detailItem.id}, applyData);
            // //获取回复列表
            // if (hasPrivilege('GET_APPLY_COMMENTS')) {
            //     ApplyViewDetailActions.getReplyList(detailItem.id);
            // }
        });
    }

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
                                onClick={this.showCustomerDetail.bind(this, _.get(detailInfo,'detail.customer_id'))}
                                data-tracename="查看客户详情"
                                title={Intl.get('call.record.customer.title', '点击可查看客户详情')}
                            >
                                {_.get(detailInfo,'detail.customer_name')}
                                <span className="iconfont icon-arrow-right"/>
                            </a>
                        </div>
                    </div>
                </div>
            </div>);
    }
    renderLeaveApplyDetail(detailInfo){
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
                                {Intl.get('leave.apply.for.application','出差人员')}:
                            </span>
                            <span className="user-info-text">
                                {applicant.user_name}
                            </span>
                        </div>
                        <div className="apply-info-label">
                            <span className="user-info-label">
                                {Intl.get('leave.apply.for.leave.time','出差时间')}:
                            </span>
                            <span className="user-info-text">
                                {isOneDay ? beginDate : (beginDate + ' - ' + endDate)}
                            </span>
                        </div>
                        <div className="apply-info-label">
                            <span className="user-info-label">
                                {Intl.get('leave.apply.for.city.address','出差地点')}:
                            </span>
                            <span className="user-info-text">
                                {detail.milestone}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                        {this.renderLeaveApplyDetail(detailInfo)}
                        {/*detailInfo.comment ? (<div className="apply-detail-common apply-detail-info">
                         <div className="common-icon-block">
                         <span className="iconfont icon-common"/>
                         </div>
                         {this.renderComment()}
                         </div>) : null*/}
                        {/*<div className="apply-detail-reply-list apply-detail-info">*/}
                        {/*<div className="reply-icon-block">*/}
                        {/*<span className="iconfont icon-apply-message-tip"/>*/}
                        {/*</div>*/}
                        {/*<div className="reply-info-block apply-info-block">*/}
                        {/*<div className="reply-list-container apply-info-content">*/}
                        {/*{this.props.isUnreadDetail ? this.renderRefreshReplyTip() : null}*/}
                        {/*{hasPrivilege('GET_APPLY_COMMENTS') ? this.renderReplyList() : null}*/}
                        {/*{hasPrivilege('CREATE_APPLY_COMMENT') ? (*/}
                        {/*<Input addonAfter={(*/}
                        {/*<a onClick={this.addReply}>{Intl.get('user.apply.reply.button', '回复')}</a>)}*/}
                        {/*value={this.state.formData.comment}*/}
                        {/*onChange={this.commentInputChange}*/}
                        {/*placeholder={Intl.get('user.apply.reply.no.content', '请填写回复内容')}/>*/}
                        {/*) : null}*/}
                        {/*{this.renderReplyFormResult()}*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                    </GeminiScrollbar>

                </div>
                {/*this.renderDetailBottom()*/}
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
                {/*this.renderApplyFormResult()*/}
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
    applyData: {}

};
ApplyViewDetail.propTypes = {
    detailItem: PropTypes.string,
    applyData: PropTypes.object,
    showNoData: PropTypes.boolean
};
module.exports = ApplyViewDetail;