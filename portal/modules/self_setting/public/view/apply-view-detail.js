/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var LeaveApplyDetailStore = require('../store/leave-apply-detail-store');
var LeaveApplyDetailAction = require('../action/leave-apply-detail-action');
var LeaveApplyActions = require('../action/leave-apply-action');
import Trace from 'LIB_DIR/trace';
import {Alert, Icon, Input, Row, Col, Button, Steps,message} from 'antd';
const Step = Steps.Step;
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
require('../css/leave-apply-detail.less');
import ApplyDetailRemarks from 'CMP_DIR/apply-components/apply-detail-remarks';
import ApplyDetailInfo from 'CMP_DIR/apply-components/apply-detail-info';
import ApplyDetailCustomer from 'CMP_DIR/apply-components/apply-detail-customer';
import ApplyDetailStatus from 'CMP_DIR/apply-components/apply-detail-status';
import ApplyApproveStatus from 'CMP_DIR/apply-components/apply-approve-status';
import ApplyDetailBottom from 'CMP_DIR/apply-components/apply-detail-bottom';
import {
    getApplyTopicText,
    getApplyResultDscr,
    getApplyStatusTimeLineDesc,
    getFilterReplyList,
    handleDiffTypeApply,
    formatUsersmanList,
    updateUnapprovedCount,
    isCiviwRealm,
    formatSalesmanList,
    timeShowFormat,
} from 'PUB_DIR/sources/utils/common-method-util';
import {handleTimeRange} from 'PUB_DIR/sources/utils/common-data-util';
let userData = require('PUB_DIR/sources/user-data');
import ModalDialog from 'CMP_DIR/ModalDialog';
import {getAllUserList} from 'PUB_DIR/sources/utils/common-data-util';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {APPLY_APPROVE_TYPES,APPLY_FINISH_STATUS,ASSIGN_TYPE,TOP_NAV_HEIGHT,APPLY_LIST_LAYOUT_CONSTANTS,LEAVE_TIME_RANGE} from 'PUB_DIR/sources/utils/consts';
import {ALL_COMPONENTS, SELF_SETTING_FLOW,transferBtnContent} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import classNames from 'classnames';
import salesOpportunityApplyAjax from 'MOD_DIR/sales_opportunity/public/ajax/sales-opportunity-apply-ajax';
class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            showBackoutConfirmType: '',//操作的确认框类型
            salesManList: [],//销售列表
            usersManList: [],//成员列表
            ...LeaveApplyDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(LeaveApplyDetailStore.getState());
    };

    componentDidMount() {
        LeaveApplyDetailStore.listen(this.onStoreChange);
        if (_.get(this.props,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                LeaveApplyDetailAction.setDetailInfoObjAfterAdd(this.props.detailItem);
                this.getNextCandidate(_.get(this, 'props.detailItem.id',''));
            });
        }else if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem, this.props.applyData);
        }
        this.getSalesManList();
        this.getAllUserList();
    }
    getSalesManList = () => {
        salesOpportunityApplyAjax.getSalesManList().then(data => {
            this.setState({
                salesManList: _.filter(data, sales => sales && sales.user_info && sales.user_info.status === 1)
            });
        });
    };
    getAllUserList = () => {
        getAllUserList().then(data => {
            this.setState({
                usersManList: data
            });
        });
    };
    onSelectApplyNextCandidate = (updateUser) => {
        LeaveApplyDetailAction.setNextCandidateIds(updateUser);
    };
    renderTransferCandidateBlock = () => {
        var usersManList = this.state.usersManList;
        //需要选择销售总经理
        var onChangeFunction = this.onSelectApplyNextCandidate;
        var defaultValue = _.get(this.state, 'detailInfoObj.info.nextCandidateId','');
        //列表中只选销售总经理,
        // usersManList = _.filter(usersManList, data => _.get(data, 'user_groups[0].owner_id') === _.get(data, 'user_info.user_id'));

        //销售领导、域管理员,展示其所有（子）团队的成员列表
        let dataList = formatUsersmanList(usersManList);
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={defaultValue}
                    onChange={onChangeFunction}
                    getSelectContent={this.setSelectContent}
                    notFoundContent={dataList.length ? Intl.get('common.no.member','暂无成员') : Intl.get('apply.no.relate.user','无相关成员')}
                    dataList={dataList}
                />
            </div>
        );
    };
    addNewApplyCandidate = (transferCandidateId,addNextCandidateName) => {
        var submitObj = {
            id: _.get(this, 'state.detailInfoObj.info.id',''),
            user_ids: [transferCandidateId]
        };
        var hasApprovePrivilege = _.get(this,'state.detailInfoObj.info.showApproveBtn',false) || this.props.isHomeMyWork;
        var candidateList = _.filter(this.state.candidateList,item => item.user_id !== transferCandidateId);
        var deleteUserIds = _.map(candidateList,'user_id');
        //转出操作后，把之前的待审批人都去掉，这条申请只留转出的那个人审批
        submitObj.user_ids_delete = deleteUserIds;
        var memberId = userData.getUserData().user_id;
        LeaveApplyDetailAction.transferNextCandidate(submitObj,(flag) => {
            //关闭下拉框
            if (flag){
                if(_.isFunction(_.get(this, 'addNextCandidate.handleCancel'))){
                    this.addNextCandidate.handleCancel();
                }
                //转出成功后，如果左边选中的是待审批的列表，在待审批列表中把这条记录删掉
                if (this.props.selectedApplyStatus === 'ongoing'){
                    this.props.afterTransferApplySuccess(submitObj.id);
                }else{
                    message.success(Intl.get('apply.approve.transfer.success','转出申请成功'));
                }
                //将待我审批的申请转审后
                if (hasApprovePrivilege){
                    //待审批数字减一
                    var count = Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEMEVISISTAPPLY] - 1;
                    updateUnapprovedCount(APPLY_APPROVE_TYPES.UNHANDLEMEVISISTAPPLY,'SHOW_UNHANDLE_APPLY_APPROVE_COUNT',count);
                    //隐藏通过、驳回按钮
                    LeaveApplyDetailAction.showOrHideApprovalBtns(false);
                    //调用父组件的方法进行转成完成后的其他处理
                    this.props.afterApprovedFunc();
                }else if (memberId === transferCandidateId){
                    //将非待我审批的申请转给我审批后，展示出通过驳回按钮,不需要再手动加一，因为后端会有推送，这里如果加一就会使数量多一个
                    LeaveApplyDetailAction.showOrHideApprovalBtns(true);
                }
                //转审成功后，把下一节点的审批人改成转审之后的人
                LeaveApplyDetailAction.setNextCandidate([{nick_name: addNextCandidateName,user_id: transferCandidateId}]);

            }else{
                message.error(Intl.get('apply.approve.transfer.failed','转出申请失败'));
            }
        });
    };
    clearNextCandidateIds = () => {
        LeaveApplyDetailAction.setNextCandidateIds('');
        LeaveApplyDetailAction.setNextCandidateName('');
    };
    setSelectContent =(nextCandidateName) => {
        LeaveApplyDetailAction.setNextCandidateName(nextCandidateName);
    };
    renderAddApplyNextCandidate = () => {
        var addNextCandidateId = _.get(this.state, 'detailInfoObj.info.nextCandidateId','');
        var addNextCandidateName = _.get(this.state, 'detailInfoObj.info.nextCandidateName','');
        return (
            <div className="pull-right">
                <AntcDropdown
                    datatraceContainer='域名申请转审按钮'
                    ref={AssignSales => this.addNextCandidate = AssignSales}
                    content={transferBtnContent()}
                    overlayTitle={Intl.get('apply.will.approve.apply.item','待审批人')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    overlayContent={this.renderTransferCandidateBlock()}
                    handleSubmit={this.addNewApplyCandidate.bind(this, addNextCandidateId, addNextCandidateName)}//分配销售的时候直接分配，不需要再展示模态框
                    unSelectDataTip={addNextCandidateId ? '' : Intl.get('apply.will.select.transfer.approver','请选择要转给的待审批人')}
                    clearSelectData={this.clearNextCandidateIds}
                    btnAtTop={false}
                    isSaving={this.state.transferStatusInfo.result === 'loading'}
                    isDisabled={!addNextCandidateId}
                />
            </div>
        );
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
        LeaveApplyDetailAction.cancelApplyApprove(backoutObj);
    };

    componentWillReceiveProps(nextProps) {
        var thisPropsId = this.props.detailItem.id;
        var nextPropsId = nextProps.detailItem.id;
        if (_.get(nextProps,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                LeaveApplyDetailAction.setDetailInfoObjAfterAdd(nextProps.detailItem);
                this.getNextCandidate(_.get(nextProps, 'detailItem.id',''));
            });
        }else if (thisPropsId && nextPropsId && nextPropsId !== thisPropsId) {
            this.getBusinessApplyDetailData(nextProps.detailItem);
            this.setState({
                showBackoutConfirmType: ''
            });
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
    getNextCandidate(applyId){
        LeaveApplyDetailAction.getNextCandidate({id: applyId},(result) => {
            var memberId = userData.getUserData().user_id;
            var target = _.find(result,detailItem => detailItem.user_id === memberId);
            if (target){
                LeaveApplyDetailAction.showOrHideApprovalBtns(true);
            }
        });
    }
    getBusinessApplyDetailData(detailItem, applyData) {
        setTimeout(() => {
            LeaveApplyDetailAction.setInitialData(detailItem);
            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (_.includes(APPLY_FINISH_STATUS, detailItem.status)) {
                LeaveApplyDetailAction.getLeaveApplyCommentList({id: detailItem.id});
                LeaveApplyDetailAction.getLeaveApplyDetailById({id: detailItem.id}, detailItem.status, applyData);
                //如果是在界面上改变审批的状态是已通过，最好也查一下下一节点的审批人
                this.getNextCandidate(detailItem.id);
            } else if (detailItem.id) {
                LeaveApplyDetailAction.getLeaveApplyDetailById({id: detailItem.id});
                LeaveApplyDetailAction.getLeaveApplyCommentList({id: detailItem.id});
                //根据申请的id获取申请的状态
                LeaveApplyDetailAction.getLeaveApplyStatusById({id: detailItem.id});
                //获取该审批所在节点的位置
                LeaveApplyDetailAction.getApplyTaskNode({id: detailItem.id});
                this.getNextCandidate(detailItem.id);
            }
        });
    }

    //重新获取回复列表
    refreshReplyList = (e) => {
        Trace.traceEvent(e, '点击了重新获取');
        var detailItem = this.props.detailItem;
        if (_.includes(APPLY_FINISH_STATUS, detailItem.status)) {
            LeaveApplyDetailAction.setApplyComment(detailItem.approve_details);
        } else if (detailItem.id) {
            LeaveApplyDetailAction.getLeaveApplyCommentList({id: detailItem.id});
            this.getNextCandidate(detailItem.id);
        }
    };



    //显示客户详情
    showCustomerDetail(customerId) {
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel
            }
        });
    }

    closeCustomerUserListPanel = () => {
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
    handleShowCustomerDetail = (customer_id) => {
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customer_id
            }
        });
    }
    calculateStartAndEndRange = (visit_time) => {
        var start = _.get(visit_time, 'begin_time');
        var end = _.get(visit_time, 'end_time');
        var startObj = _.find(LEAVE_TIME_RANGE,item => item.value === _.get(start.split('_'),'[1]')
        );
        var endObj = _.find(LEAVE_TIME_RANGE,item => item.value === _.get(end.split('_'),'[1]')
        );
        return {
            visit_start_time: _.get(start.split('_'),'[0]'),
            visit_start_type: _.get(startObj,'name',''),
            visit_end_time: _.get(end.split('_'),'[0]'),
            visit_end_type: _.get(endObj,'name',''),
        };
    };
    renderShowVisitRange = (item) => {
        var visit_start_time = '', visit_start_type = '', visit_end_time = '', visit_end_type = '';
        var rangeObj = this.calculateStartAndEndRange(item);
        visit_start_time = rangeObj.visit_start_time;
        visit_start_type = rangeObj.visit_start_type;
        visit_end_time = rangeObj.visit_end_time;
        visit_end_type = rangeObj.visit_end_type;

        return (
            <span>{visit_start_time}{visit_start_type}{Intl.get('common.time.connector', '至')}{visit_end_time}{visit_end_type}
            </span>
        );
    };
    renderDetailApplyBlock(detailInfo) {
        //找到流程保存的组件
        var detail = detailInfo.detail || {}, customizForm = [], showApplyInfo = [];
        var applyLists = userData.getUserData().workFlowConfigs;
        var workFlowConfig = _.find(applyLists, item => item.type === SELF_SETTING_FLOW.VISITAPPLY);

        if (workFlowConfig){
            customizForm = workFlowConfig.customiz_form;
            _.forEach(customizForm, item => {
                var showItem = detail[item.key];
                if (showItem){
                    //有几个需要特殊处理的组件展示
                    if (item.component_type === ALL_COMPONENTS.CUSTOMERSEARCH){
                        showApplyInfo.push({
                            label: _.get(item,'title'),
                            text: <a href="javascript:void(0)"
                                onClick={this.handleShowCustomerDetail.bind(this, _.get(showItem,'[0].id'))}
                                data-tracename="查看客户详情"
                                className="customer-name"
                                title={Intl.get('call.record.customer.title', '点击可查看客户详情')}
                            >{_.get(showItem,'[0].name')}</a>
                        });
                    }else if (item.component_type === ALL_COMPONENTS.TIMEPERIOD ){
                        var starttime = '', endtime = '';
                        if (item.selected_value !== '0.5day'){
                            starttime = moment(parseInt(showItem.begin_time)).format(oplateConsts.DATE_FORMAT);
                            endtime = moment(parseInt(showItem.end_time)).format(oplateConsts.DATE_FORMAT);
                        }

                        showApplyInfo.push({
                            label: _.get(item,'title'),
                            text: item.selected_value === '0.5day' ? this.renderShowVisitRange(showItem) : <span>{starttime - endtime}</span>
                        });
                    }else{
                        showApplyInfo.push({
                            label: _.get(item,'title'),
                            text: _.isString(showItem) ? showItem : ''
                        });
                    }
                }
            });
            return (
                <ApplyDetailInfo
                    iconClass='icon-leave-apply'
                    showApplyInfo={showApplyInfo}
                />
            );
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
            comment: _.trim(this.state.replyFormInfo.comment),
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
        var val = _.trim(event.target.value);
        LeaveApplyDetailAction.setApplyFormDataComment(val);
        if (val) {
            LeaveApplyDetailAction.hideReplyCommentEmptyError();
        }
    };

    viewApprovalResult = (e) => {
        Trace.traceEvent(e, '查看审批结果');
        this.setState({
            showBackoutConfirmType: ''
        });
        this.getBusinessApplyDetailData(this.props.detailItem);
        //设置这条审批不再展示通过和驳回的按钮
        LeaveApplyDetailAction.hideApprovalBtns();
    };

    //取消发送
    cancelSendApproval = (e) => {
        this.setState({
            showBackoutConfirmType: ''
        });
        Trace.traceEvent(e, '点击取消按钮');
        LeaveApplyDetailAction.cancelSendApproval();
    };

    submitApprovalForm = (approval) => {
        if (approval === 'pass') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击通过按钮');
        } else if (approval === 'reject') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击驳回按钮');
        }else if (approval === 'cancel'){
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.btn-primary-sure'), '点击撤销申请按钮');
        }
        this.showConfirmModal(approval);
    };
    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        LeaveApplyDetailAction.setSalesMan(salesMan);
    };
    clearSelectSales() {
        LeaveApplyDetailAction.setSalesMan('');
    }
    clearSelectCandidate(){
        LeaveApplyDetailAction.setApplyCandate('');
    }
    onSelectApplySales = (updateUser) => {
        LeaveApplyDetailAction.setApplyCandate(updateUser);
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
        //销售领导、域管理员,展示其所有（子）团队的成员列表
        let dataList = formatSalesmanList(salesManList);
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
            <AntcDropdown
                datatraceContainer='拜访申请分配销售按钮'
                ref={AssignSales => this.assignSales = AssignSales}
                content={<Button
                    className='assign-btn btn-primary-sure' size="small">{Intl.get('clue.customer.distribute', '分配')}</Button>}
                overlayTitle={Intl.get('user.salesman', '销售人员')}
                okTitle={Intl.get('common.confirm', '确认')}
                cancelTitle={Intl.get('common.cancel', '取消')}
                overlayContent={this.renderSalesBlock(ASSIGN_TYPE.COMMON_SALES)}
                handleSubmit={this.passOrRejectApplyApprove.bind(this, 'pass')}//分配销售的时候直接分配，不需要再展示模态框
                unSelectDataTip={assignedSalesUsersIds ? '' : Intl.get('leave.apply.select.assigned.sales','请选择要分配的销售')}
                clearSelectData={this.clearSelectSales}
                btnAtTop={false}
                isSaving={this.state.applyResult.submitResult === 'loading'}
                isDisabled={!assignedSalesUsersIds}
            />
        );

    };
    //分配下一节点的负责人
    renderCandidatedContext = () => {
        var assignedCandidateUserIds = _.get(this.state, 'detailInfoObj.info.assigned_candidate_users','');
        return (
            <AntcDropdown
                datatraceContainer='拜访申请通过申请按钮'
                ref={AssignSales => this.assignSales = AssignSales}
                content={<Button
                    className='assign-candidate-btn btn-primary-sure' size="small"
                    type="primary">{Intl.get('user.apply.detail.button.pass', '通过')}</Button>}
                overlayTitle={Intl.get('user.salesman', '销售人员')}
                okTitle={Intl.get('common.confirm', '确认')}
                cancelTitle={Intl.get('common.cancel', '取消')}
                overlayContent={this.renderSalesBlock(ASSIGN_TYPE.NEXT_CANDIDATED)}
                handleSubmit={this.passOrRejectApplyApprove.bind(this, 'pass')}//直接分配，不需要展示模态框
                unSelectDataTip={assignedCandidateUserIds ? '' : Intl.get('sales.opportunity.assign.department.owner', '请选择要分配的部门主管')}
                clearSelectData={this.clearSelectCandidate}
                btnAtTop={false}
                isSaving={this.state.applyResult.submitResult === 'loading'}
                isDisabled={!assignedCandidateUserIds}
            />

        );
    };
    //渲染详情底部区域
    renderDetailBottom() {
        var detailInfoObj = this.state.detailInfoObj.info;
        //是否审批
        let isConsumed = _.includes(APPLY_FINISH_STATUS, detailInfoObj.status);
        var userName = _.last(_.get(detailInfoObj, 'approve_details')) ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name : '' : '';
        var approvalDes = getApplyResultDscr(detailInfoObj);
        var addApplyNextCandidate = null;
        if ((userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || detailInfoObj.showApproveBtn || this.state.isLeader) && detailInfoObj.status === 'ongoing'){
            addApplyNextCandidate = this.renderAddApplyNextCandidate;
        }
        var showApproveBtn = detailInfoObj.showApproveBtn || this.props.isHomeMyWork;
        var renderAssigenedContext = null;
        //渲染分配的按钮
        if (_.indexOf(_.get(this.state,'applyNode[0].forms',[]), 'distributeSalesToVisit') > -1 && showApproveBtn){
            //分配给普通销售
            renderAssigenedContext = this.renderAssigenedContext;
        }else if(_.indexOf(_.get(this.state,'applyNode[0].forms',[]), 'assignNextNodeApprover') > -1 && showApproveBtn){
            if (isCiviwRealm()){
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
                showApproveBtn={detailInfoObj.showApproveBtn}
                showCancelBtn={detailInfoObj.showCancelBtn}
                submitApprovalForm={this.submitApprovalForm}
                renderAssigenedContext={renderAssigenedContext}
                addApplyNextCandidate={addApplyNextCandidate}
            />);
    }
    renderApplyApproveSteps =() => {
        var stepStatus = '';
        var applicantList = _.get(this.state, 'detailInfoObj.info');
        var replyList = getFilterReplyList(this.state);
        var applicateName = _.get(applicantList, 'applicant.nick_name') || '';
        var applicateTime = moment(_.get(applicantList, 'create_time')).format(oplateConsts.DATE_TIME_FORMAT);

        var descriptionArr = [];
        if(isCiviwRealm()){
            descriptionArr = [Intl.get('user.apply.submit.list', '提交申请'),Intl.get('user.apply.detail.pass', '通过申请'),Intl.get('user.apply.distribute.to.sales','已分配给销售')];
        }else{
            descriptionArr = [Intl.get('user.apply.submit.list', '提交申请'),Intl.get('user.apply.detail.pass', '通过申请'),Intl.get('user.apply.distribute.to','分配给'),Intl.get('user.apply.distribute.to.sales','已分配给销售')];
        }
        //如果是识微域，
        var stepArr = [{
            title: applicateName + descriptionArr[0],
            description: applicateTime
        }];
        var currentLength = 0;
        //过滤掉手动添加的回复
        currentLength = replyList.length;
        if (currentLength) {
            _.forEach(replyList, (replyItem, index) => {
                var descrpt = descriptionArr[index + 1];
                if (index === 1 && !isCiviwRealm()){
                    //下一个节点的执行人
                    descrpt += Intl.get('sales.commission.role.manager', '销售总经理');
                }
                descrpt = getApplyStatusTimeLineDesc(replyItem.status);
                if (replyItem.status === 'reject'){
                    stepStatus = 'error';
                    currentLength--;
                }
                stepArr.push({
                    title: (replyItem.nick_name || replyItem.user_name || userData.getUserData().nick_name || '') + descrpt,
                    description: timeShowFormat(replyItem.comment_time, oplateConsts.DATE_TIME_FORMAT)
                });
            });
        }else if(applicantList.status === 'cancel'){
            stepArr.push({
                title: Intl.get('user.apply.backout', '已撤销'),
                description: moment(_.get(applicantList, 'update_time')).format(oplateConsts.DATE_TIME_FORMAT)
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
    };
    passOrRejectApplyApprove = (confirmType) => {
        var assignedCandidateUserIds = '';//要分配下一节点的负责人的id
        var assignedSalesUsersIds = '';//要分配下一节点的销售的id
        if (confirmType === 'pass'){
            assignedCandidateUserIds = _.get(this.state, 'detailInfoObj.info.assigned_candidate_users','');
            assignedSalesUsersIds = _.get(this.state, 'detailInfoObj.info.user_ids','');
        }
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
        LeaveApplyDetailAction.approveLeaveApplyPassOrReject(submitObj, (flag) => {
            if ((submitObj.assigned_candidate_users || submitObj.user_ids)) {
                if (flag) {
                    this.viewApprovalResult();
                } else {
                    message.error(Intl.get('failed.distribute.apply', '分配失败！'));
                }
            }
            //调用父组件的方法进行审批完成后的其他处理
            if (flag) {
                this.props.afterApprovedFunc();
            }
        });
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
                    {this.renderDetailBottom()}
                </div>
                <div className="apply-detail-content" style={{height: applyDetailHeight}} ref="geminiWrap">
                    <GeminiScrollbar ref="gemini">
                        {this.renderDetailApplyBlock(detailInfo)}
                        {this.renderApplyStatus()}
                        <ApplyDetailRemarks
                            detailInfo={detailInfo}
                            replyListInfo={this.state.replyListInfo}
                            replyFormInfo={this.state.replyFormInfo}
                            refreshReplyList={this.refreshReplyList}
                            addReply={this.addReply}
                            commentInputChange={this.commentInputChange}
                            isUnreadDetail={this.props.isUnreadDetail}
                        />
                    </GeminiScrollbar>

                </div>
                {this.renderCancelApplyApprove()}
            </div>
        );
    }
    renderApplyApproveStatus(){
        var showLoading = false,approveSuccess = false, approveError = false,applyResultErrorMsg = '',showAfterApproveTip = '',approveSuccessTip = '',
            confirmType = this.state.showBackoutConfirmType,resultType = {};
        if (confirmType === 'cancel'){
            resultType = this.state.backApplyResult;
            approveSuccessTip = Intl.get('user.apply.detail.backout.success', '撤销成功');
            showAfterApproveTip = Intl.get('apply.show.cancel.result','查看撤销结果');
        }else if(confirmType === 'pass' || confirmType === 'reject') {
            resultType = this.state.applyResult;
        }else{
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
            reSendApproval={typeObj.deleteFunction}
            cancelSendApproval={this.cancelSendApproval.bind(this, confirmType)}
            container={this}
            approveSuccessTip={approveSuccessTip}
            showAfterApproveTip={showAfterApproveTip}
        />;
    }

    render() {
        //如果获取左侧列表失败了，则显示空
        if (this.props.showNoData) {
            return null;
        }
        let customerOfCurUser = this.state.customerOfCurUser || {};
        const detailWrapCls = classNames('leave_manage_apply_detail_wrap');
        return (
            <div className={detailWrapCls} style={{'width': this.props.width, 'height': this.props.height}} data-tracename="审批详情界面">
                <ApplyDetailStatus
                    showLoading={this.state.detailInfoObj.loadingResult === 'loading'}
                    showErrTip={this.state.detailInfoObj.loadingResult === 'error'}
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
    selectedApplyStatus: '',
    isUnreadDetail: false,
    applyData: {},
    isHomeMyWork: false,//是否是首页我的工作中打开的详情
    afterApprovedFunc: function(){

    },
    width: '100%',
    height: '100%',

};
ApplyViewDetail.propTypes = {
    detailItem: PropTypes.string,
    showNoData: PropTypes.bool,
    selectedApplyStatus: PropTypes.string,
    isUnreadDetail: PropTypes.bool,
    applyData: PropTypes.object,
    isHomeMyWork: PropTypes.bool,
    afterApprovedFunc: PropTypes.func,
    width: PropTypes.string,
    height: PropTypes.string
};
module.exports = ApplyViewDetail;