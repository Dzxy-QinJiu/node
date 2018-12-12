/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var SalesOpportunityApplyDetailStore = require('../store/sales-opportunity-apply-detail-store');
var SalesOpportunityApplyDetailAction = require('../action/sales-opportunity-apply-detail-action');
import salesOpportunityApplyAjax from '../ajax/sales-opportunity-apply-ajax';
import Trace from 'LIB_DIR/trace';
import {Alert, Icon, Input, Row, Col, Button,message, Select, Steps} from 'antd';
const Step = Steps.Step;
const Option = Select.Option;
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
import ApplyDetailBlock from 'CMP_DIR/apply-detail-block';
import ModalDialog from 'CMP_DIR/ModalDialog';
import {APPLY_LIST_LAYOUT_CONSTANTS, APPLY_STATUS} from 'PUB_DIR/sources/utils/consts';
import {getApplyTopicText, getApplyResultDscr,getApplyStatusTimeLineDesc,getFilterReplyList,handleDiffTypeApply} from 'PUB_DIR/sources/utils/common-method-util';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
const ASSIGN_TYPE = {
    NEXT_CANDIDATED: 'nextCandidated',
    COMMON_SALES: 'commonSales'
};
let userData = require('PUB_DIR/sources/user-data');
import {REALM_REMARK} from '../utils/sales-oppotunity-utils';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
//在内存中记录分配下一节点销售领导的id 和 分配给销售的id
//为了避免点击确认模态框后，下拉框收起后把所分配的下一节点的负责人的id清除掉或者是出错后下拉框收起，下一节点的负责人清空
let ASSIGN_IDS = {
    assignedCandidateUsers: '',//下一节点销售领导的id
    //所分配的销售的id,只有在点击确认的时候才会修改这个值
    assignedSalesUsersIds: '',
};

class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            salesManList: [],//销售列表
            showBackoutConfirmType: '',//操作的确认框类型
            ...SalesOpportunityApplyDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(SalesOpportunityApplyDetailStore.getState());
    };
    setInitialIds = () => {
        ASSIGN_IDS.assignedSalesUsersIds = '';
        ASSIGN_IDS.assignedCandidateUsers = '';
    };

    componentDidMount() {
        SalesOpportunityApplyDetailStore.listen(this.onStoreChange);
        if (_.get(this.props,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                SalesOpportunityApplyDetailAction.setDetailInfoObj(this.props.detailItem);
            });
        }else if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem);
        }
        this.getSalesManList();
        this.setInitialIds();
    }
    getSalesManList = () => {
        salesOpportunityApplyAjax.getSalesManList().then(data => {
            this.setState({
                salesManList: _.filter(data, sales => sales && sales.user_info && sales.user_info.status === 1)
            });
        });
    };
    componentWillReceiveProps(nextProps) {
        var thisPropsId = this.props.detailItem.id;
        var nextPropsId = nextProps.detailItem.id;
        if (_.get(nextProps,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                SalesOpportunityApplyDetailAction.setDetailInfoObj(nextProps.detailItem);
            });
        }else if (thisPropsId && nextPropsId && nextPropsId !== thisPropsId) {
            this.getBusinessApplyDetailData(nextProps.detailItem);
            this.setState({
                showBackoutConfirmType: ''
            });
        }
        this.setInitialIds();
    }

    componentWillUnmount() {
        this.setInitialIds();
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
            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (detailItem.status === 'pass' || detailItem.status === 'reject') {
                SalesOpportunityApplyDetailAction.getSalesOpportunityApplyCommentList({id: detailItem.id});
                SalesOpportunityApplyDetailAction.getSalesOpportunityApplyDetailById({id: detailItem.id},detailItem.status);
            } else if (detailItem.id) {
                SalesOpportunityApplyDetailAction.getSalesOpportunityApplyDetailById({id: detailItem.id});
                SalesOpportunityApplyDetailAction.getSalesOpportunityApplyCommentList({id: detailItem.id});
                //根据申请的id获取申请的状态
                SalesOpportunityApplyDetailAction.getSalesOpportunityApplyStatusById({id: detailItem.id});
                SalesOpportunityApplyDetailAction.getNextCandidate({id: detailItem.id});
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
                label: Intl.get('common.product', '产品'),
                text: productArr.join(',')
            }, {
                label: Intl.get('leave.apply.inspect.success.time', '预计成交时间'),
                text: expectdeal_time
            }, {
                label: Intl.get('common.remark', '备注'),
                text: detail.remark
            }];
        return (
            <ApplyDetailInfo
                iconClass='icon-sales-opportunity'
                showApplyInfo={showApplyInfo}
            />
        );
    }
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
        var val = _.trim(event.target.value);
        SalesOpportunityApplyDetailAction.setApplyFormDataComment(val);
        if (val) {
            SalesOpportunityApplyDetailAction.hideReplyCommentEmptyError();
        }
    };

    viewApprovalResult = (e) => {
        Trace.traceEvent(e, '查看审批结果');
        this.setState({
            showBackoutConfirmType: ''
        });
        this.getBusinessApplyDetailData(this.props.detailItem);
        //设置这条审批不再展示通过和驳回的按钮
        SalesOpportunityApplyDetailAction.hideApprovalBtns();
    };

    //重新发送
    reSendApproval = (approval,e) => {
        Trace.traceEvent(e, '点击重试按钮');
        this.submitApprovalForm(approval,true);
    };

    //取消发送
    cancelSendApproval = (e) => {
        this.setState({
            showBackoutConfirmType: ''
        });
        Trace.traceEvent(e, '点击取消按钮');
        SalesOpportunityApplyDetailAction.cancelSendApproval();
    };

    submitApprovalForm = (approval,flag) => {
        //flag 为true的情况，是在出错的情况下再次点击重试发请求，为了避免使用清空掉的值把内存里下一节点的id和所分配的销售的id覆盖掉
        if (approval === 'pass' && !_.isBoolean(flag)){
            ASSIGN_IDS.assignedCandidateUsers = _.get(this.state, 'detailInfoObj.info.assigned_candidate_users','');
            ASSIGN_IDS.assignedSalesUsersIds = _.get(this.state, 'detailInfoObj.info.user_ids','');
        }
        var assignedCandidateUserIds = ASSIGN_IDS.assignedCandidateUsers;
        var readyApply = _.get(this.state,'replyStatusInfo.list[0]','') === APPLY_STATUS.READY_APPLY;
        var assignedSalesUsersIds = ASSIGN_IDS.assignedSalesUsersIds;
        var assigendSalesApply = _.get(this.state,'replyStatusInfo.list[0]','') === APPLY_STATUS.ASSIGN_SALES_APPLY;
        //如果沒有分配负责人，要先分配负责人
        if (!assignedCandidateUserIds && readyApply && approval === 'pass'){
            return;
        }else if (!assignedSalesUsersIds && assigendSalesApply){
            return;
        }else{
            if (approval === 'pass') {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击通过按钮');
            } else if (approval === 'reject') {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击驳回按钮');
            }else if (approval === 'cancel'){
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击撤销申请按钮');
            }
            this.showConfirmModal(approval);
        }
    };

    clearSelectSales() {
        SalesOpportunityApplyDetailAction.setSalesMan('');
    }
    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        SalesOpportunityApplyDetailAction.setSalesMan(salesMan);
    };
    clearSelectCandidate(){
        SalesOpportunityApplyDetailAction.setApplyCandate('');
    }
    onSelectApplySales = (updateUser) => {
        SalesOpportunityApplyDetailAction.setApplyCandate(updateUser);
    };
    getSalesOptions = () => {
        var dataLists = this.state.salesManList;
        return dataLists.map((sales, idx) => {
            return (<Option key={idx}
                value={_.get(sales, 'user_info.user_id')}>
                {_.get(sales, 'user_info.nick_name')} - {_.get(sales, 'user_groups[0].group_name')}</Option>);
        });
    };
    renderSalesBlock = (type) => {
        //type 区分是分配下一节点负责人  还是分配给普通销售
        var onChangeFunction = this.onSalesmanChange;
        var defaultValue = _.get(this.state,'detailInfoObj.info.user_ids');
        var salesManList = this.state.salesManList;
        if(type === ASSIGN_TYPE.NEXT_CANDIDATED){
            //需要选择销售总经理
            onChangeFunction = this.onSelectApplySales;
            defaultValue = _.get(this.state, 'detailInfoObj.info.assigned_candidate_users','');
            //列表中只选销售总经理,
            salesManList = _.filter(salesManList, data => _.get(data, 'user_groups[0].owner_id') === _.get(data, 'user_info.user_id'));
        }
        let dataList = [];
        //销售领导、域管理员,展示其所有（子）团队的成员列表
        _.each(salesManList,(salesman) => {
            let teamArray = salesman.user_groups;
            //一个销售属于多个团队的处理（旧数据中存在这种情况）
            if (_.isArray(teamArray) && teamArray.length) {
                //销售与所属团队的组合数据，用来区分哪个团队中的销售
                teamArray.forEach(team => {
                    dataList.push({
                        name: salesman.user_info.nick_name + '-' + team.group_name,
                        value: salesman.user_info.user_id + '&&' + team.group_id,
                    });
                });
            }
        });

        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={defaultValue}
                    onChange={onChangeFunction}
                    notFoundContent={dataList.length ? Intl.get('crm.29', '暂无销售') : Intl.get('crm.30', '无相关销售')}
                    dataList={dataList}
                />
            </div>
        );
    };
    renderAssigenedContext = () => {
        var assignedSalesUsersIds = _.get(this.state, 'detailInfoObj.info.user_ids','');
        return (
            <div className="pull-right">
                <AntcDropdown
                    ref={AssignSales => this.assignSales = AssignSales}
                    content={<Button
                        data-tracename="点击分配销售按钮"
                        className='assign-btn btn-primary-sure' type="primary" size="small">{Intl.get('clue.customer.distribute', '分配')}</Button>}
                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    overlayContent={this.renderSalesBlock(ASSIGN_TYPE.COMMON_SALES)}
                    handleSubmit={this.submitApprovalForm.bind(this, 'pass')}
                    unSelectDataTip={assignedSalesUsersIds ? '' : Intl.get('leave.apply.select.assigned.sales','请选择要分配的销售')}
                    clearSelectData={this.clearSelectSales}
                    btnAtTop={false}
                    isSaving={this.state.applyResult.submitResult === 'loading'}
                />
            </div>

        );

    };
    //分配下一节点的负责人
    renderCandidatedContext = () => {
        var assignedCandidateUserIds = _.get(this.state, 'detailInfoObj.info.assigned_candidate_users','');
        return (
            <div className="pull-right">
                <AntcDropdown
                    ref={AssignSales => this.assignSales = AssignSales}
                    content={<Button
                        data-tracename="点击分配销售总经理按钮"
                        className='assign-candidate-btn btn-primary-sure' size="small" type="primary">{Intl.get('user.apply.detail.button.pass', '通过')}</Button>}
                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    overlayContent={this.renderSalesBlock(ASSIGN_TYPE.NEXT_CANDIDATED)}
                    handleSubmit={this.submitApprovalForm.bind(this, 'pass')}
                    unSelectDataTip={assignedCandidateUserIds ? '' : Intl.get('sales.opportunity.assign.department.owner','请选择要分配的部门主管')}
                    clearSelectData={this.clearSelectCandidate}
                    btnAtTop={false}
                    isSaving={this.state.applyResult.submitResult === 'loading'}
                />
                <Button type="primary" className="btn-primary-sure" size="small"
                    onClick={this.submitApprovalForm.bind(this, 'reject')}>
                    {Intl.get('common.apply.reject', '驳回')}
                </Button>
            </div>
        );

    };
    // 确认撤销申请
    saleConfirmBackoutApply = (e) => {
        Trace.traceEvent(e, '点击撤销申请按钮');
        this.setState({
            showBackoutConfirm: true
        });
    };
    // 隐藏确认的模态框
    hideBackoutModal = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-cancel'), '点击关闭模态框按钮');
        this.setState({
            showBackoutConfirmType: ''
        });
    };
    // 撤销申请
    cancelApplyApprove = (e) => {
        e.stopPropagation();
        Trace.traceEvent(e, '点击撤销按钮');
        let backoutObj = {
            id: this.props.detailItem.id,
        };
        SalesOpportunityApplyDetailAction.cancelApplyApprove(backoutObj);
    };
    //渲染详情底部区域
    renderDetailBottom() {
        var detailInfoObj = this.state.detailInfoObj.info;
        //是否审批
        let isConsumed = detailInfoObj.status === 'pass' || detailInfoObj.status === 'reject' || detailInfoObj.status === 'cancel';
        var userName = _.last(_.get(detailInfoObj, 'approve_details')) ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name : '' : '';
        var approvalDes = getApplyResultDscr(detailInfoObj);
        var showApproveBtn = detailInfoObj.showApproveBtn;
        var renderAssigenedContext = null;
        //渲染分配的按钮
        if (_.get(this.state,'replyStatusInfo.list[0]','') === APPLY_STATUS.ASSIGN_SALES_APPLY && showApproveBtn){
            //分配给普通销售
            renderAssigenedContext = this.renderAssigenedContext;
        }else if(_.get(this.state,'replyStatusInfo.list[0]','') === APPLY_STATUS.READY_APPLY && detailInfoObj.showApproveBtn){
            var userDetail = userData.getUserData();
            var realmId = _.get(userDetail, 'auth.realm_id');
            var isCiviwRealm = realmId === REALM_REMARK.CIVIW;
            if (isCiviwRealm){
                //如果是识微域，直接点通过就可以，不需要手动选择分配销售总经理
                renderAssigenedContext = null;
            }else{
                //如果是不是识微域,需要选择所分配给的销售总经理
                renderAssigenedContext = this.renderCandidatedContext;
            }
        }
        return (
            <ApplyDetailBottom
                create_time={detailInfoObj.create_time}
                applicantText={_.get(detailInfoObj, 'applicant.nick_name','') + Intl.get('crm.109', '申请')}
                isConsumed={isConsumed}
                update_time={detailInfoObj.update_time}
                approvalText={userName + approvalDes}
                showApproveBtn={showApproveBtn}
                showCancelBtn={detailInfoObj.showCancelBtn}
                submitApprovalForm={this.submitApprovalForm}
                renderAssigenedContext={renderAssigenedContext}
            />);
    }

    passOrRejectApplyApprove = (confirmType) => {
        var assignedCandidateUserIds = ASSIGN_IDS.assignedCandidateUsers;
        var assignedSalesUsersIds = ASSIGN_IDS.assignedSalesUsersIds;
        var detailInfoObj = this.state.detailInfoObj.info;
        var submitObj = {
            id: detailInfoObj.id,
            agree: confirmType
        };
        if (assignedCandidateUserIds && confirmType === 'pass' && _.isArray(assignedCandidateUserIds.split('&&'))){
            var candidateUserIds = assignedCandidateUserIds.split('&&')[0];
            submitObj.assigned_candidate_users = [candidateUserIds];
        }
        if (assignedSalesUsersIds && _.isArray(assignedSalesUsersIds.split('&&'))){
            var salesUserIds = assignedSalesUsersIds.split('&&')[0];
            submitObj.user_ids = [salesUserIds];
        }
        SalesOpportunityApplyDetailAction.approveSalesOpportunityApplyPassOrReject(submitObj);
        //关闭下拉框
        if(_.isFunction(_.get(this, 'assignSales.handleCancel'))){
            this.assignSales.handleCancel();
        }
    };
    renderCancelApplyApprove = () => {
        var confirmType = this.state.showBackoutConfirmType;
        if (confirmType){
            var typeObj = handleDiffTypeApply(this);
            return (
                <ModalDialog
                    modalShow={typeObj.modalShow}
                    container={this}
                    hideModalDialog={this.hideBackoutModal}
                    modalContent={typeObj.modalContent}
                    delete={typeObj.deleteFunction}
                    okText={typeObj.okText}
                    delayClose={true}
                />
            );
        }else{
            return null;
        }
    };
    showConfirmModal = (approval) => {
        this.setState({
            showBackoutConfirmType: approval
        });
    };
    renderApplyApproveStatus(){
        var showLoading = false,approveSuccess = false, approveError = false,applyResultErrorMsg = '',
            confirmType = this.state.showBackoutConfirmType,resultType = {};
        if (confirmType === 'cancel'){
            resultType = this.state.backApplyResult;
        }else if(confirmType === 'pass' || confirmType === 'reject') {
            resultType = this.state.applyResult;
        }else{
            return;
        }
        showLoading = resultType.submitResult === 'loading';
        approveSuccess = resultType.submitResult === 'success';
        approveError = resultType.submitResult === 'error';
        applyResultErrorMsg = resultType.errorMsg;

        return <ApplyApproveStatus
            showLoading={showLoading}
            approveSuccess={approveSuccess}
            viewApprovalResult={this.viewApprovalResult}
            approveError={approveError}
            applyResultErrorMsg={applyResultErrorMsg}
            reSendApproval={this.reSendApproval.bind(this,confirmType)}
            cancelSendApproval={this.cancelSendApproval.bind(this, confirmType)}
            container={this}
        />;
    }

    renderApplyApproveSteps =() => {
        var stepStatus = '';
        var applicantList = _.get(this.state, 'detailInfoObj.info');
        var replyList = getFilterReplyList(this.state);
        var applicateName = _.get(applicantList, 'applicant.nick_name');
        var applicateTime = moment(_.get(applicantList, 'create_time')).format(oplateConsts.DATE_TIME_FORMAT);
        var userDetail = userData.getUserData();
        var realmId = _.get(userDetail, 'auth.realm_id');
        var isCiviwRealm = realmId === REALM_REMARK.CIVIW;
        var descriptionArr = [];
        if(isCiviwRealm){
            descriptionArr = [Intl.get('user.apply.submit.list', '提交申请'),Intl.get('user.apply.detail.pass', '通过申请'),Intl.get('user.apply.distribute.to.sales','已分配给销售')];
        }else{
            descriptionArr = [Intl.get('user.apply.submit.list', '提交申请'),Intl.get('user.apply.detail.pass', '通过申请'),Intl.get('user.apply.distribute.to','分配给'),Intl.get('user.apply.distribute.to.sales','已分配给销售')];
        }
        //如果是识微域，
        var stepArr = [{
            title: applicateName + descriptionArr[0],
            description: applicateTime
        }];
        var currentLength = '0';
        currentLength = replyList.length;
        if (currentLength){
            _.forEach(replyList,(replyItem,index) => {
                var descrpt = descriptionArr[index + 1];
                if (index === 1 && !isCiviwRealm){
                    //下一个节点的执行人
                    descrpt += Intl.get('sales.commission.role.manager', '销售总经理');
                }
                descrpt = getApplyStatusTimeLineDesc(replyItem.status);
                if (replyItem.status === 'reject'){
                    stepStatus = 'error';
                    currentLength--;
                }
                stepArr.push({
                    title: (replyItem.nick_name || userData.getUserData().nick_name) + descrpt,
                    description: moment(replyItem.comment_time).format(oplateConsts.DATE_TIME_FORMAT)
                });
            });
        }

        //如果下一个节点是直接主管审核
        if (applicantList.status === 'ongoing'){
            var candidate = this.state.candidateList,candidateName = '';
            if (_.isArray(candidate) && candidate.length === 1){
                candidateName = _.get(candidate,'[0].nick_name');
            }
            stepArr.push({
                title: Intl.get('apply.approve.worklist','待{applyer}审批',{'applyer': candidateName}),
                description: ''
            });
        }


        return (
            <Steps current={currentLength + 1} status={stepStatus} >
                {_.map(stepArr,(stepItem) => {
                    return (
                        <Step title={stepItem.title} description={stepItem.description}/>
                    );
                })}
            </Steps>
        );
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
            <div className='col-md-8 sales_opportunity_apply_detail_wrap' data-tracename="销售机会审批详情界面">
                <ApplyDetailStatus
                    showLoading={this.state.detailInfoObj.loadingResult === 'loading'}
                    showErrTip = {this.state.detailInfoObj.loadingResult === 'error'}
                    errMsg={this.state.detailInfoObj.errorMsg}
                    retryFetchDetail={this.retryFetchDetail}
                    showNoData={this.props.showNoData}
                />
                {this.renderApplyDetailInfo()}
                {this.renderApplyApproveStatus()}
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
    showNoData: PropTypes.boolean,
};
module.exports = ApplyViewDetail;