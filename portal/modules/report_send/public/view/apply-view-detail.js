/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var ReportSendApplyDetailStore = require('../store/report-send-apply-detail-store');
var ReportSendApplyDetailAction = require('../action/report-send-apply-detail-action');
var ReportSendApplyAction = require('../action/report-send-apply-action');
import Trace from 'LIB_DIR/trace';
import {Alert, Icon, Input, Row, Col, Button, Steps,Upload,message} from 'antd';
const Step = Steps.Step;
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
require('../css/report-send-apply-detail.less');
import ApplyDetailRemarks from 'CMP_DIR/apply-components/apply-detail-remarks';
import ApplyDetailInfo from 'CMP_DIR/apply-components/apply-detail-info';
import ApplyDetailStatus from 'CMP_DIR/apply-components/apply-detail-status';
import ApplyApproveStatus from 'CMP_DIR/apply-components/apply-approve-status';
import ApplyDetailBottom from 'CMP_DIR/apply-components/apply-detail-bottom';
import {APPLY_LIST_LAYOUT_CONSTANTS,APPLY_STATUS} from 'PUB_DIR/sources/utils/consts';
import {getApplyTopicText, getApplyResultDscr,getApplyStatusTimeLineDesc, getFilterReplyList,handleDiffTypeApply,getReportSendApplyStatusTimeLineDesc,formatUsersmanList} from 'PUB_DIR/sources/utils/common-method-util';
import {REPORT_TYPE,TOP_NAV_HEIGHT} from 'PUB_DIR/sources/utils/consts';
let userData = require('PUB_DIR/sources/user-data');
import ModalDialog from 'CMP_DIR/ModalDialog';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import UploadAndDeleteFile from 'CMP_DIR/apply-components/upload-and-delete-file';
import AlertTimer from 'CMP_DIR/alert-timer';
import {seperateFilesDiffType, hasApprovedReportAndDocumentApply} from 'PUB_DIR/sources/utils/common-data-util';
const salesmanAjax = require('MOD_DIR/common/public/ajax/salesman');
import {getAllUserList} from 'PUB_DIR/sources/utils/common-data-util';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {APPLY_APPROVE_TYPES,REFRESH_APPLY_RANGE} from 'PUB_DIR/sources/utils/consts';
var timeoutFunc;//定时方法
var notificationEmitter = require('PUB_DIR/sources/utils/emitters').notificationEmitter;

class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            showBackoutConfirmType: '',//操作的确认框类型
            clickConfirmBtn: false,//为了防止点击确认按钮后，立刻打开查看详情，详情属性中没有approver_ids这个数组,所以在点击确认申请后加上这样的标识
            usersManList: [],//成员列表
            ...ReportSendApplyDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(ReportSendApplyDetailStore.getState());
    };

    componentDidMount() {
        ReportSendApplyDetailStore.listen(this.onStoreChange);
        if (_.get(this.props,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                ReportSendApplyDetailAction.setDetailInfoObjAfterAdd(this.props.detailItem);
                ReportSendApplyDetailAction.getNextCandidate({id: _.get(this, 'props.detailItem.id','')});
            });
        }else if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem);
        }
        this.getAllUserList();
    }
    getAllUserList = () => {
        getAllUserList(data => {
            this.setState({
                usersManList: data
            });
        });
    };
    onSelectApplyNextCandidate = (updateUser) => {
        ReportSendApplyDetailAction.setNextCandidateIds(updateUser);
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
                    notFoundContent={dataList.length ? Intl.get('common.no.member','暂无成员') : Intl.get('apply.no.relate.user','无相关成员')}
                    dataList={dataList}
                />
            </div>
        );
    };
    addNewApplyCandidate = (transferCandidateId) => {
        var submitObj = {
            id: _.get(this, 'state.detailInfoObj.info.id',''),
            user_ids: [transferCandidateId]
        };
        var hasApprovePrivilege = _.get(this,'state.detailInfoObj.info.showApproveBtn',false);
        //如果操作转出的人是这条审批的待审批者，需要在这个操作人的待审批列表中删除这条申请
        if (hasApprovePrivilege){
            submitObj.user_ids_delete = [userData.getUserData().user_id];
        }
        ReportSendApplyDetailAction.transferNextCandidate(submitObj,(flag) => {
            //关闭下拉框
            if (flag){
                if(_.isFunction(_.get(this, 'addNextCandidate.handleCancel'))){
                    this.addNextCandidate.handleCancel();
                }
                //转出成功后，如果左边选中的是待审批的列表，在待审批列表中把这条记录删掉
                if (this.props.applyListType === 'ongoing'){
                    ReportSendApplyAction.afterTransferApplySuccess(submitObj.id);
                }else{
                    message.success(Intl.get('apply.approve.transfer.success','转出申请成功'));
                }
                if (hasApprovePrivilege){
                    //上面待审批的数字也需要减一
                    if (Oplate && Oplate.unread) {
                        Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEREPORTSEND] -= 1;
                        if (timeoutFunc) {
                            clearTimeout(timeoutFunc);
                        }
                        timeoutFunc = setTimeout(function() {
                            //触发展示的组件待审批数的刷新
                            notificationEmitter.emit(notificationEmitter.SHOW_UNHANDLE_APPLY_APPROVE_COUNT);
                        }, REFRESH_APPLY_RANGE);
                    }
                }
            }else{
                message.error(Intl.get('apply.approve.transfer.failed','转出申请失败'));
            }
        });
    };
    clearNextCandidateIds = () => {
        ReportSendApplyDetailAction.setNextCandidateIds('');
    };
    renderAddApplyNextCandidate = () => {
        var addNextCandidateId = _.get(this.state, 'detailInfoObj.info.nextCandidateId','');
        return (
            <div className="pull-right">
                <AntcDropdown
                    ref={AssignSales => this.addNextCandidate = AssignSales}
                    content={<Button
                        data-tracename="点击转出申请按钮"
                        className='assign-btn btn-primary-sure' type="primary" size="small">{Intl.get('crm.qualified.roll.out', '转出')}</Button>}
                    overlayTitle={Intl.get('apply.will.approve.apply.item','待审批人')}
                    okTitle={Intl.get('common.confirm', '确认')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    overlayContent={this.renderTransferCandidateBlock()}
                    handleSubmit={this.addNewApplyCandidate.bind(this, addNextCandidateId)}//分配销售的时候直接分配，不需要再展示模态框
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
        ReportSendApplyDetailAction.cancelApplyApprove(backoutObj);
    };

    componentWillReceiveProps(nextProps) {
        var thisPropsId = this.props.detailItem.id;
        var nextPropsId = nextProps.detailItem.id;
        if (_.get(nextProps,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                ReportSendApplyDetailAction.setDetailInfoObjAfterAdd(nextProps.detailItem);
                ReportSendApplyDetailAction.getNextCandidate({id: _.get(nextProps, 'detailItem.id','')});
            });
        }else if (thisPropsId && nextPropsId && nextPropsId !== thisPropsId) {
            this.getBusinessApplyDetailData(nextProps.detailItem);
            this.setState({
                showBackoutConfirmType: '',
                clickConfirmBtn: false
            });
        }
    }

    componentWillUnmount() {
        this.setState({
            clickConfirmBtn: false
        });
        ReportSendApplyDetailStore.unlisten(this.onStoreChange);
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
            ReportSendApplyDetailAction.setInitialData(detailItem);
            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (detailItem.status === 'pass' || detailItem.status === 'reject') {
                ReportSendApplyDetailAction.getApplyCommentList({id: detailItem.id});
                ReportSendApplyDetailAction.getApplyDetailById({id: detailItem.id}, detailItem.status);
            } else if (detailItem.id) {
                ReportSendApplyDetailAction.getApplyDetailById({id: detailItem.id});
                ReportSendApplyDetailAction.getApplyCommentList({id: detailItem.id});
                //根据申请的id获取申请的状态
                ReportSendApplyDetailAction.getApplyStatusById({id: detailItem.id});
                ReportSendApplyDetailAction.getNextCandidate({id: detailItem.id});
            }
        });
    }

    //重新获取回复列表
    refreshReplyList = (e) => {
        Trace.traceEvent(e, '点击了重新获取');
        var detailItem = this.props.detailItem;
        if (detailItem.status === 'pass' || detailItem.state === 'reject') {
            ReportSendApplyDetailAction.setApplyComment(detailItem.approve_details);
        } else if (detailItem.id) {
            ReportSendApplyDetailAction.getApplyCommentList({id: detailItem.id});
        }
    };
    //重新获取申请的状态
    refreshApplyStatusList = (e) => {
        var detailItem = this.props.detailItem;
        ReportSendApplyDetailAction.getApplyStatusById({id: detailItem.id});
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
        var expect_submit_time
            = moment(detail.expect_submit_time).format(oplateConsts.DATE_TIME_WITHOUT_SECOND_FORMAT);
        var targetObj = _.find(REPORT_TYPE, (item) => {
            return item.value === detail.report_type;
        });
        var reportType = '';
        if (targetObj) {
            reportType = targetObj.name;
        }
        var showApplyInfo = [
            {
                label: Intl.get('common.type', '类型'),
                text: reportType
            },
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
            },
            {
                label: Intl.get('apply.approve.expect.submit.time','期望提交时间'),
                text: expect_submit_time
            }, {
                label: Intl.get('common.remark', '备注'),
                text: detail.remarks
            }];
        return (
            <ApplyDetailInfo
                iconClass='icon-leave-apply'
                showApplyInfo={showApplyInfo}
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
            ReportSendApplyDetailAction.showReplyCommentEmptyError();
            return;
        }
        //提交数据
        ReportSendApplyDetailAction.addApplyComments(submitData);
    };
    //备注 输入框改变时候触发
    commentInputChange = (event) => {
        //如果添加回复的ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        var val = _.trim(event.target.value);
        ReportSendApplyDetailAction.setApplyFormDataComment(val);
        if (val) {
            ReportSendApplyDetailAction.hideReplyCommentEmptyError();
        }
    };

    viewApprovalResult = (e) => {
        Trace.traceEvent(e, '查看审批结果');
        if (this.state.showBackoutConfirmType === 'reject'){
            //设置这条审批不再展示通过和驳回的按钮
            ReportSendApplyDetailAction.hideApprovalBtns();
        }else if (this.state.showBackoutConfirmType === 'pass'){
            this.setState({
                clickConfirmBtn: true
            });
        }
        this.setState({
            showBackoutConfirmType: ''
        });
        this.getBusinessApplyDetailData(this.props.detailItem);

    };

    //取消发送
    cancelSendApproval = (e) => {
        this.setState({
            showBackoutConfirmType: ''
        });
        Trace.traceEvent(e, '点击取消按钮');
        ReportSendApplyDetailAction.cancelSendApproval();
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
    confirmFinishApply = () => {
        var detailInfoObj = this.state.detailInfoObj.info;
        //这个地方需要传一个数组
        var fileIds = [];
        var fileArrs = _.get(detailInfoObj,'detail.file_upload_logs',[]);
        fileArrs = seperateFilesDiffType(fileArrs).approverUploadFiles;
        _.forEach(fileArrs,(item) => {
            fileIds.push(item.id);
        });
        if (!fileIds.length){
            return;
        }
        ReportSendApplyDetailAction.approveApplyPassOrReject({id: detailInfoObj.id, agree: 'pass',report_ids: fileIds},() => {
            detailInfoObj.showApproveBtn = false;
            detailInfoObj.status = 'pass';
            var replyList = _.get(this.state,'replyListInfo.list');
            replyList.push({comment_time: moment().valueOf(),
                nick_name: userData.getUserData().nick_name,
                status: 'pass'
            });
            detailInfoObj.approve_details = replyList;
            ReportSendApplyDetailAction.setDetailInfo(detailInfoObj);
        });
    };
    renderConfirmFinish = () => {
        var isLoading = this.state.applyResult.submitResult === 'loading';
        var resultErrMsg = _.get(this,'state.applyResult.errorMsg','');
        var onHide = function() {
            ReportSendApplyDetailAction.cancelSendApproval();
        };
        return (
            <Button type='primary' className='pull-right' onClick={this.confirmFinishApply} disabled={isLoading}>
                {Intl.get('apply.approve.confirm.finish','确认完成')}
                {isLoading ? <Icon type="loading"/> : resultErrMsg ? <AlertTimer time={90000} message={resultErrMsg} type="error" onHide={onHide} showIcon/> : null}
            </Button>
        );
    };
    //渲染详情底部区域
    renderDetailBottom() {
        var detailInfoObj = this.state.detailInfoObj.info;
        //是否审批
        let isConsumed = detailInfoObj.status === 'pass' || detailInfoObj.status === 'reject';
        var userName = _.last(_.get(detailInfoObj, 'approve_details')) ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name : '' : '';
        var approvalDes = getApplyResultDscr(detailInfoObj);
        var renderAssigenedContext = null,passText = '',showApproveBtn = detailInfoObj.showApproveBtn;
        if (detailInfoObj.status === 'ongoing' && showApproveBtn){
            //approver_ids的数组长度是2的时候  或者 clickConfirmBtn 是true 是表示已经确认过 待确认申请
            var hasApprovedApply = hasApprovedReportAndDocumentApply(_.get(detailInfoObj,'approver_ids',[]));
            if (hasApprovedApply || this.state.clickConfirmBtn){
                //approverUpload存在表示已经上传过文件 已经上传文件了
                var upLoadFileArrs = _.get(detailInfoObj,'detail.file_upload_logs',[]);
                var approverUpload = seperateFilesDiffType(upLoadFileArrs).approverUploadFiles;
                if (approverUpload.length){
                    renderAssigenedContext = this.renderConfirmFinish;
                    showApproveBtn = true;
                }else{
                    //还没有上传文件
                    showApproveBtn = false;
                }
            }else if (!hasApprovedApply){
                passText = Intl.get('apply.approve.confirm.apply','确认申请');
                showApproveBtn = true;
            }
        }
        var addApplyNextCandidate = null;
        //如果是管理员或者是待我审批的申请，我都可以把申请进行转出
        if ((userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || detailInfoObj.showApproveBtn) && detailInfoObj.status === 'ongoing'){
            addApplyNextCandidate = this.renderAddApplyNextCandidate;
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
                passText ={passText}
                addApplyNextCandidate={addApplyNextCandidate}
            />);
    }
    renderApplyApproveSteps =() => {
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
                var descrpt = getReportSendApplyStatusTimeLineDesc(replyItem.status);
                if (replyItem.status === 'reject'){
                    stepStatus = 'error';
                    currentLength--;
                }
                if (index + 1 === currentLength && applicantList.status === 'pass'){
                    descrpt = Intl.get('apply.approver.confirm.task.done','确认任务完成');
                }
                stepArr.push({
                    title: (replyItem.nick_name || userData.getUserData().nick_name || '') + descrpt,
                    description: moment(replyItem.comment_time).format(oplateConsts.DATE_TIME_FORMAT)
                });
            });
        }
        //如果下一个节点是直接主管审核
        if (applicantList.status === 'ongoing') {
            var candidate = this.state.candidateList,candidateName = '';
            if (_.isArray(candidate) && candidate.length === 1){
                candidateName = _.get(candidate,'[0].nick_name');
            }
            var stepTip = '',file_upload_logs = _.get(applicantList,'detail.file_upload_logs',[]);
            file_upload_logs = seperateFilesDiffType(file_upload_logs).approverUploadFiles;
            var hasConfirmApproved = hasApprovedReportAndDocumentApply(_.get(applicantList,'approver_ids',[]));
            if (hasConfirmApproved){
                stepTip = Intl.get('apply.approve.wait.upload','待{uploader}上传',{'uploader': candidateName});
            }else{
                stepTip = Intl.get('apply.approve.wait.confirm','待{confirmer}确认任务完成',{'confirmer': candidateName});
            }
            stepArr.push({
                title: stepTip,
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
        ReportSendApplyDetailAction.approveApplyPassOrReject({id: detailInfoObj.id, agree: confirmType});
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
    //添加成功或者失败后修改state中的值
    setUpdateFiles = (updateLists) => {
        ReportSendApplyDetailAction.setUpdateFilesLists(updateLists);
    };
    renderUploadAndDownloadInfo = () => {
        var detailInfoObj = this.state.detailInfoObj.info;
        var hasApproved = hasApprovedReportAndDocumentApply(_.get(detailInfoObj,'approver_ids',[]));
        //销售可以继续添加或者删除上传的文件
        var salesUploadAndDeletePrivilege = false;
        let user_id = userData.getUserData().user_id;
        if (_.get(detailInfoObj,'applicant.user_id') === user_id && detailInfoObj.status === 'ongoing' && !hasApproved){
            salesUploadAndDeletePrivilege = true;
        }

        //管理员可以继续添加或者删除上传的文件
        var approverUploadAndDeletePrivilege = false;
        if (detailInfoObj.status === 'ongoing' && hasApproved && detailInfoObj.showApproveBtn){
            approverUploadAndDeletePrivilege = true;
        }
        return (
            <UploadAndDeleteFile
                detailInfoObj={detailInfoObj}
                setUpdateFiles={this.setUpdateFiles}
                fileList={_.get(detailInfoObj,'detail.file_upload_logs')}
                salesUploadAndDeletePrivilege={salesUploadAndDeletePrivilege}
                approverUploadAndDeletePrivilege={approverUploadAndDeletePrivilege}
                selectType={REPORT_TYPE}
            />
        );
    };
    renderUploadAndDownload = (detailInfo) => {
        // 驳回的时候也会有这个属性，所以再加上status的判断
        //如果是销售添加的申请，并且还没有确认审核之前是可以添加的
        var salesAddPrivilege = _.get(detailInfo,'applicant.user_id') === userData.getUserData().user_id && !detailInfo.approver_ids && detailInfo.status === 'ongoing';
        var managerAddPrivilege = (hasApprovedReportAndDocumentApply(detailInfo.approver_ids) && detailInfo.status === 'ongoing') || this.state.clickConfirmBtn || _.get(detailInfo,'detail.file_upload_logs',[]).length;//管理员在确认通过审核后或者在点击了确认按钮也可以展示添加区域
        if (managerAddPrivilege || salesAddPrivilege){
            var showApplyInfo = [{
                label: '',
                renderText: this.renderUploadAndDownloadInfo,
            }];
            return (
                <ApplyDetailInfo
                    iconClass='icon-apply-status'
                    showApplyInfo={showApplyInfo}
                />
            );
        }else{
            return null;
        }

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
                        {this.renderApplyStatus()}
                        <ApplyDetailRemarks
                            detailInfo={detailInfo}
                            replyListInfo={this.state.replyListInfo}
                            replyFormInfo={this.state.replyFormInfo}
                            refreshReplyList={this.refreshReplyList}
                            addReply={this.addReply}
                            commentInputChange={this.commentInputChange}
                            isReportOrDocument={true}
                        />
                        {this.renderUploadAndDownload(detailInfo)}
                    </GeminiScrollbar>
                </div>
                {this.renderDetailBottom()}
                {this.renderCancelApplyApprove()}
            </div>
        );
    }
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
        />;
    }

    render() {
        //如果获取左侧列表失败了，则显示空
        if (this.props.showNoData) {
            return null;
        }
        var divHeight = $(window).height() - TOP_NAV_HEIGHT;
        return (
            <div className='col-md-8 leave_manage_apply_detail_wrap' style={{'height': divHeight}} data-tracename="舆情报送审批详情界面">
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
    applyListType: ''
};
ApplyViewDetail.propTypes = {
    detailItem: PropTypes.object,
    applyListType: PropTypes.string,
    showNoData: PropTypes.boolean
};
module.exports = ApplyViewDetail;