/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/18.
 */
var applyBusinessDetailStore = require('../store/apply-business-detail-store');
var ApplyViewDetailActions = require('../action/apply-view-detail-action');
var BusinessApplyActions = require('../action/business-apply-action');
import Trace from 'LIB_DIR/trace';
import {Alert, Icon, Input, Row, Col, Button,Steps,message,DatePicker,Select} from 'antd';
const Step = Steps.Step;
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
require('../css/business-apply-detail.less');
import ApplyDetailRemarks from 'CMP_DIR/apply-components/apply-detail-remarks';
import ApplyDetailInfo from 'CMP_DIR/apply-components/apply-detail-info';
import ApplyDetailCustomer from 'CMP_DIR/apply-components/apply-detail-customer';
import ApplyDetailStatus from 'CMP_DIR/apply-components/apply-detail-status';
import ApplyApproveStatus from 'CMP_DIR/apply-components/apply-approve-status';
import ApplyDetailBottom from 'CMP_DIR/apply-components/apply-detail-bottom';
import {APPLY_LIST_LAYOUT_CONSTANTS,TOP_NAV_HEIGHT} from 'PUB_DIR/sources/utils/consts';
import {getApplyTopicText,getApplyResultDscr,getApplyStatusTimeLineDesc,getFilterReplyList,handleDiffTypeApply,formatUsersmanList,updateUnapprovedCount} from 'PUB_DIR/sources/utils/common-method-util';
import {handleTimeRange, getAllUserList} from 'PUB_DIR/sources/utils/common-data-util';
let userData = require('PUB_DIR/sources/user-data');
import ModalDialog from 'CMP_DIR/ModalDialog';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {APPLY_APPROVE_TYPES, APPLY_FINISH_STATUS,LEAVE_TIME_RANGE} from 'PUB_DIR/sources/utils/consts';
import {disabledDate, calculateSelectType} from 'PUB_DIR/sources/utils/common-method-util';
class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            showBackoutConfirmType: '',//操作的确认框类型
            usersManList: [],//成员列表
            customerUpdate: {id: '',index: ''},//修改拜访时间的客户
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
                ApplyViewDetailActions.setDetailInfoObjAfterAdd(this.props.detailItem);
                this.getNextCandidate(_.get(this, 'props.detailItem.id',''));
            });
        }else if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem, this.props.applyData);
        }
        this.getAllUserList();
    }
    getAllUserList = () => {
        getAllUserList().then(data => {
            this.setState({
                usersManList: data
            });
        });
    };
    onSelectApplyNextCandidate = (updateUser) => {
        ApplyViewDetailActions.setNextCandidateIds(updateUser);
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
        var hasApprovePrivilege = _.get(this,'state.detailInfoObj.info.showApproveBtn',false);
        var candidateList = _.filter(this.state.candidateList,item => item.user_id !== transferCandidateId);
        var deleteUserIds = _.map(candidateList,'user_id');
        //转出操作后，把之前的待审批人都去掉，这条申请只留转出的那个人审批
        submitObj.user_ids_delete = deleteUserIds;
        var memberId = userData.getUserData().user_id;
        ApplyViewDetailActions.transferNextCandidate(submitObj,(flag) => {
            //关闭下拉框
            if (flag){
                if(_.isFunction(_.get(this, 'addNextCandidate.handleCancel'))){
                    this.addNextCandidate.handleCancel();
                }
                //转出成功后，如果左边选中的是待审批的列表，在待审批列表中把这条记录删掉
                if (this.props.applyListType === 'ongoing'){
                    BusinessApplyActions.afterTransferApplySuccess(submitObj.id);
                }else{
                    message.success(Intl.get('apply.approve.transfer.success','转出申请成功'));
                }
                //将待我审批的申请转审后
                if (hasApprovePrivilege){
                    //待审批数字减一
                    var count = Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT] - 1;
                    updateUnapprovedCount(APPLY_APPROVE_TYPES.UNHANDLECUSTOMERVISIT,'SHOW_UNHANDLE_APPLY_APPROVE_COUNT',count);
                    //隐藏通过、驳回按钮
                    ApplyViewDetailActions.showOrHideApprovalBtns(false);
                }else if (memberId === transferCandidateId){
                    //将非待我审批的申请转给我审批后，展示出通过驳回按钮,不需要再手动加一，因为后端会有推送，这里如果加一就会使数量多一个
                    ApplyViewDetailActions.showOrHideApprovalBtns(true);
                }
                //转审成功后，把下一节点的审批人改成转审之后的人
                ApplyViewDetailActions.setNextCandidate([{nick_name: addNextCandidateName,user_id: transferCandidateId}]);

            }else{
                message.error(Intl.get('apply.approve.transfer.failed','转出申请失败'));
            }
        });
    };
    clearNextCandidateIds = () => {
        ApplyViewDetailActions.setNextCandidateIds('');
        ApplyViewDetailActions.setNextCandidateName('');
    };
    setSelectContent=(nextCandidateName) => {
        ApplyViewDetailActions.setNextCandidateName(nextCandidateName);
    };
    renderAddApplyNextCandidate = () => {
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
    };

    componentWillReceiveProps(nextProps) {
        var thisPropsId = this.props.detailItem.id;
        var nextPropsId = nextProps.detailItem.id;
        if (_.get(nextProps,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                ApplyViewDetailActions.setDetailInfoObjAfterAdd(nextProps.detailItem);
                this.getNextCandidate(_.get(nextProps, 'detailItem.id',''));
            });
        }else if (thisPropsId && nextPropsId && nextPropsId !== thisPropsId) {
            //关闭右侧详情
            phoneMsgEmitter.emit(phoneMsgEmitter.CLOSE_PHONE_PANEL);
            this.getBusinessApplyDetailData(nextProps.detailItem);
            this.setState({
                showBackoutConfirmType: '',
                customerUpdate: {id: '',index: ''}
            });
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
    getNextCandidate(applyId){
        ApplyViewDetailActions.getNextCandidate({id: applyId},(result) => {
            var memberId = userData.getUserData().user_id;
            var target = _.find(result,detailItem => detailItem.user_id === memberId);
            if (target){
                ApplyViewDetailActions.showOrHideApprovalBtns(true);
            }
        });
    }
    getBusinessApplyDetailData(detailItem, applyData) {
        setTimeout(() => {
            ApplyViewDetailActions.setInitialData(detailItem);
            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (APPLY_FINISH_STATUS.includes(detailItem.status)) {
                ApplyViewDetailActions.getBusinessApplyCommentList({id: detailItem.id});
                ApplyViewDetailActions.getBusinessApplyDetailById({id: detailItem.id}, detailItem.status, applyData);
                this.getNextCandidate(detailItem.id);
            } else if (detailItem.id) {
                ApplyViewDetailActions.getBusinessApplyDetailById({id: detailItem.id});
                ApplyViewDetailActions.getBusinessApplyCommentList({id: detailItem.id});
                //根据申请的id获取申请的状态
                ApplyViewDetailActions.getApplyTaskNode({id: detailItem.id});
                this.getNextCandidate(detailItem.id);
            }
        });
    }

    //重新获取回复列表
    refreshReplyList = (e) => {
        Trace.traceEvent(e, '点击了重新获取');
        var detailItem = this.props.detailItem;
        if (APPLY_FINISH_STATUS.includes(detailItem.status)) {
            ApplyViewDetailActions.setApplyComment(detailItem.approve_details);
        } else if (detailItem.id) {
            ApplyViewDetailActions.getBusinessApplyCommentList({id: detailItem.id});
            this.getNextCandidate(detailItem.id);
        }
    };


    //显示客户详情
    showCustomerDetail = (customerId) => {
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel
            }
        });
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });
    };
    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    renderDetailApplyBlock(detailInfo) {
        var detail = detailInfo.detail || {};
        var applicant = detailInfo.applicant || {};
        var customers = _.get(detail, 'customers', []);
        //展示客户的地址，只展示到县区就可以，不用展示到街道
        var customersAdds = [];
        _.forEach(detail.customers, (item) => {
            if (!_.isEmpty(item)){
                var showAddr = _.get(item,'province','') + _.get(item,'city','');
                customersAdds.push(showAddr);
            }
        });
        //去掉数组中的重复元素
        customersAdds = _.uniq(customersAdds);
        var leaveRange = handleTimeRange(_.get(detail, 'apply_time[0].start',''),_.get(detail, 'apply_time[0].end',''));
        if (_.get(detail,'days')){
            leaveRange += ' ' + Intl.get('apply.approve.total.days','共{X}天',{X: _.get(detail,'days')});
        }
        if (!leaveRange){
            var begin_time = moment(detail.begin_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
            var end_time = moment(detail.end_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
        }

        var showApplyInfo = [{
            label: Intl.get('common.login.time', '时间'),
            text: leaveRange ? leaveRange : (begin_time + ' - ' + end_time)
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
    handleEditVisit = (customerId,index) => {
        this.setState({
            customerUpdate: {id: customerId,index: index},
            beforeEditDetailInfoObj: _.cloneDeep(this.state.detailInfoObj)
        });
    };
    transferAmAndPm = (type) => {
        if (!type){
            return '';
        }
        return type === Intl.get('apply.approve.leave.am', '上午') ? 'AM' : 'PM';
    };
    onBeginTimeCustomerChange = (value) => {
        var updateCustomers = this.getEditCustomers();
        if (updateCustomers){
            if (value){
                var start = _.get(updateCustomers,'visit_time.start');
                var updateStart = moment(value).format(oplateConsts.DATE_FORMAT) + '_' + start.split('_')[1];
                updateCustomers.visit_time.start = updateStart;
            }else{
                updateCustomers.visit_time.start = '';
            }
        }
        this.setState({
            detailInfoObj: this.state.detailInfoObj
        });
    };
    getEditCustomers = () => {
        var updateCustomerId = _.get(this,'state.customerUpdate.id');
        var updateCustomerIndex = _.get(this,'state.customerUpdate.index');
        var updateCustomers = _.find(_.get(this, 'state.detailInfoObj.info.detail.customers',[]),(item,index) => {return item.id === updateCustomerId && index === updateCustomerIndex;});
        return updateCustomers;
    };
    onEndTimeCustomerChange = (value) => {
        var updateCustomers = this.getEditCustomers();
        if (updateCustomers){
            if (value){
                var end = _.get(updateCustomers,'visit_time.end');
                var updateEnd = moment(value).format(oplateConsts.DATE_FORMAT) + '_' + end.split('_')[1];
                updateCustomers.visit_time.end = updateEnd;
            }else{
                updateCustomers.visit_time.end = '';
            }
        }
        this.setState({
            detailInfoObj: this.state.detailInfoObj
        });
    };
    handleChangeEndType = (value) => {
        var updateCustomers = this.getEditCustomers();
        if (updateCustomers){
            var end = _.get(updateCustomers,'visit_time.end');
            var updateEnd = end.split('_')[0] + '_' + value;
            updateCustomers.visit_time.end = updateEnd;
        }
        this.setState({
            detailInfoObj: this.state.detailInfoObj
        });
    };
    handleChangeStartType = (value) => {
        var updateCustomers = this.getEditCustomers();
        if (updateCustomers){
            var start = _.get(updateCustomers,'visit_time.start');
            var updateStart = start.split('_')[0] + '_' + value;
            updateCustomers.visit_time.start = updateStart;
        }
        this.setState({
            detailInfoObj: this.state.detailInfoObj
        });
    };

    renderEditVisitRange = (record) => {
        var visitObj = record.visit_time;
        var visit_start_time = '',visit_start_type = '',visit_end_time = '',visit_end_type = '';
        if (visitObj){
            var rangeObj = this.calculateStartAndEndRange(visitObj);
            visit_start_time = rangeObj.visit_start_time;
            visit_start_type = rangeObj.visit_start_type;
            visit_end_time = rangeObj.visit_end_time;
            visit_end_type = rangeObj.visit_end_type;
        }
        var applyTime = _.get(this,'state.detailInfoObj.info.detail.apply_time[0]');
        var applyObj = this.calculateStartAndEndRange(applyTime);
        var start = _.get(applyTime, 'start'),end = _.get(applyTime, 'end');
        var initialStartTime = moment(_.get(start.split('_'),'[0]')).valueOf();
        var initialEndTime = moment(_.get(end.split('_'),'[0]')).valueOf();
        var initialRangeObj = {initial_visit_start_time: applyObj.visit_start_time,
            initial_visit_start_type: this.transferAmAndPm(applyObj.visit_start_type),
            initial_visit_end_time: applyObj.visit_end_time,
            initial_visit_end_type: this.transferAmAndPm(applyObj.visit_end_type)};
        var start_type_select = calculateSelectType(visit_start_time, initialRangeObj);
        var end_type_select = calculateSelectType(visit_end_time, initialRangeObj);
        var startValue = this.transferAmAndPm(visit_start_type);
        var endValue = this.transferAmAndPm(visit_end_type);
        return (
            <div>
                <DatePicker
                    onChange={this.onBeginTimeCustomerChange}
                    value={visit_start_time ? moment(visit_start_time) : ''}
                    disabledDate={disabledDate.bind(this, initialStartTime, initialEndTime)}
                />
                <Select
                    onChange={this.handleChangeStartType}
                    value={startValue}
                >
                    {_.isArray(start_type_select) && start_type_select.length ?
                        start_type_select.map((item, idx) => {

                            return (<Option key={idx} value={item.value}>{item.name}</Option>);
                        }) : null
                    }
                </Select>
                <DatePicker
                    onChange={this.onEndTimeCustomerChange}
                    value={visit_end_time ? moment(visit_end_time) : ''}
                    disabledDate={disabledDate.bind(this, initialStartTime, initialEndTime)}
                />
                <Select
                    onChange={this.handleChangeEndType}
                    value={endValue}
                >
                    {_.isArray(end_type_select) && end_type_select.length ?
                        end_type_select.map((item, idx) => {
                            return (<Option key={idx} value={item.value}>{item.name}</Option>);
                        }) : null
                    }
                </Select>
                <span>
                    {this.state.isEditting ? <Icon type="loading"/> : <span>
                        <span className="iconfont icon-choose" onClick={this.saveChangeCustomerVisistRange.bind(this, record)}></span>
                        <span className="iconfont icon-close" onClick={this.cancelChangeCustomerVisitRange}></span>
                    </span>}

                </span>
            </div>
        );
    };
    saveChangeCustomerVisistRange = () => {
        var applyObj = _.get(this, 'state.detailInfoObj.info', {});
        var submitObj = {
            applyId: _.get(applyObj, 'id'),
            customers: _.get(applyObj, 'detail.customers')
        };
        _.forEach(submitObj.customers,(item) => {
            if(!_.get(item, 'visit_time.start') || !_.get(item, 'visit_time.end')){
                delete item.visit_time;
            }
        });
        this.setState({isEditting: true});
        $.ajax({
            url: '/rest/update/customer/visit/range',
            type: 'put',
            dataType: 'json',
            data: submitObj,
            success: (result) => {
                this.setState({
                    isEditting: false,
                    customerUpdate: {id: '',index: ''}
                });
            },
            error: (xhr) => {
                this.setState({
                    isEditting: false,
                });
                message.error(xhr.responseJSON || Intl.get('common.edit.failed', '修改失败'));
            }
        });

    };
    cancelChangeCustomerVisitRange = () => {
        this.setState({
            customerUpdate: {id: '',index: ''},
            detailInfoObj: this.state.beforeEditDetailInfoObj,
            beforeEditDetailInfoObj: {},
        });
    };
    calculateStartAndEndRange = (visit_time) => {
        var start = _.get(visit_time, 'start');
        var end = _.get(visit_time, 'end');
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
    renderShowVisitRange = (record,index) => {
        var visit_start_time = '', visit_start_type = '', visit_end_time = '', visit_end_type = '';
        if (record.visit_time) {
            var rangeObj = this.calculateStartAndEndRange(record.visit_time);
            visit_start_time = rangeObj.visit_start_time;
            visit_start_type = rangeObj.visit_start_type;
            visit_end_time = rangeObj.visit_end_time;
            visit_end_type = rangeObj.visit_end_type;
        }
        var editPriviliege = userData.getUserData().user_id === _.get(this, 'state.detailInfoObj.info.applicant.user_id');
        return (
            <span>{visit_start_time}{visit_start_type}{Intl.get('common.time.connector', '至')}{visit_end_time}{visit_end_type}
                {editPriviliege ? <i className="iconfont icon-update" onClick={this.handleEditVisit.bind(this, record.id, index)}></i> : null}
            </span>
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
                className: 'apply-customer-name apply-detail-th',
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
            },{
                title: Intl.get('bussiness.trip.time.range', '拜访时间'),
                className: 'apply-customer-visit-range apply-detail-th',
                render: function(text, record, index) {

                    var isEditCustomer = _.get(_this, 'state.customerUpdate.id') === record.id && _.get(_this, 'state.customerUpdate.index') === index;
                    return (
                        <span>
                            {record.visit_time ?
                                <span>
                                    {isEditCustomer ? _this.renderEditVisitRange(record) : _this.renderShowVisitRange(record,index)}

                                </span> : null}
                        </span>
                    );
                }

            }, {
                title: Intl.get('common.remark', '备注'),
                dataIndex: 'remarks',
                className: 'apply-remarks apply-detail-th'
            }];
        return (
            <ApplyDetailCustomer
                bordered={true}
                columns={columns}
                dataSource={customersArr}
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
        this.setState({
            showBackoutConfirmType: ''
        });
        this.getBusinessApplyDetailData(this.props.detailItem);
        //设置这条审批不再展示通过和驳回的按钮
        ApplyViewDetailActions.hideApprovalBtns();
    };

    //取消发送
    cancelSendApproval = (e) => {
        this.setState({
            showBackoutConfirmType: ''
        });
        Trace.traceEvent(e, '点击取消按钮');
        ApplyViewDetailActions.cancelSendApproval();
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
    //渲染详情底部区域
    renderDetailBottom() {
        var detailInfoObj = this.state.detailInfoObj.info;
        //是否审批
        let isConsumed = APPLY_FINISH_STATUS.includes(detailInfoObj.status);
        var userName = _.last(_.get(detailInfoObj, 'approve_details')) ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name : '' : '';
        var approvalDes = getApplyResultDscr(detailInfoObj);
        var addApplyNextCandidate = null;
        if ((userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || detailInfoObj.showApproveBtn || this.state.isLeader) && detailInfoObj.status === 'ongoing'){
            addApplyNextCandidate = this.renderAddApplyNextCandidate;
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
                addApplyNextCandidate={addApplyNextCandidate}
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
        }else if(applicantList.status === 'cancel'){
            stepArr.push({
                title: Intl.get('user.apply.backout', '已撤销'),
                description: moment(_.get(applicantList, 'update_time')).format(oplateConsts.DATE_TIME_FORMAT)
            });
        }
        //如果下一个节点是直接主管审核
        var candidate = this.state.candidateList,candidateName = '';
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
        var detailInfoObj = this.state.detailInfoObj.info;
        ApplyViewDetailActions.approveApplyPassOrReject({id: detailInfoObj.id, agree: confirmType});
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
    // 隐藏确认模态框
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
        ApplyViewDetailActions.cancelApplyApprove(backoutObj);
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
                            isUnreadDetail={this.props.isUnreadDetail}
                        />
                    </GeminiScrollbar>

                </div>
                {this.renderCancelApplyApprove()}
            </div>
        );
    }
    renderApplyApproveStatus(){
        var showLoading = false,approveSuccess = false, approveError = false,applyResultErrorMsg = '',approveSuccessTip = '',showAfterApproveTip = '',
            confirmType = this.state.showBackoutConfirmType,resultType = {};
        if (confirmType === 'cancel'){
            approveSuccessTip = Intl.get('user.apply.detail.backout.success', '撤销成功');
            showAfterApproveTip = Intl.get('apply.show.cancel.result','查看撤销结果');
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
        var divHeight = $(window).height() - TOP_NAV_HEIGHT;
        return (
            <div className='col-md-8 business_apply_detail_wrap' style={{'height': divHeight}} data-tracename="出差审批详情界面">
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
    applyListType: '',
    isUnreadDetail: false,
    applyData: {},

};
ApplyViewDetail.propTypes = {
    detailItem: PropTypes.string,
    showNoData: PropTypes.bool,
    applyListType: PropTypes.string,
    isUnreadDetail: PropTypes.bool,
    applyData: PropTypes.object,
};
module.exports = ApplyViewDetail;