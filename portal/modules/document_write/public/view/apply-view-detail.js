/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/28.
 */
var DocumentWriteApplyDetailStore = require('../store/document-write-apply-detail-store');
var DocumentWriteApplyDetailAction = require('../action/document-write-apply-detail-action');
import Trace from 'LIB_DIR/trace';
import {Alert, Icon, Input, Row, Col, Button, Steps,Upload,message} from 'antd';
const Step = Steps.Step;
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
require('../css/document-write-apply-detail.less');
import ApplyDetailRemarks from 'CMP_DIR/apply-components/apply-detail-remarks';
import ApplyDetailInfo from 'CMP_DIR/apply-components/apply-detail-info';
import ApplyDetailStatus from 'CMP_DIR/apply-components/apply-detail-status';
import ApplyApproveStatus from 'CMP_DIR/apply-components/apply-approve-status';
import ApplyDetailBottom from 'CMP_DIR/apply-components/apply-detail-bottom';
import {APPLY_LIST_LAYOUT_CONSTANTS,APPLY_STATUS} from 'PUB_DIR/sources/utils/consts';
import {getApplyTopicText, getApplyResultDscr,getApplyStatusTimeLineDesc, getFilterReplyList,handleDiffTypeApply,getReportSendApplyStatusTimeLineDesc,getDocumentReportTypeText} from 'PUB_DIR/sources/utils/common-method-util';
import {DOCUMENT_TYPE,TOP_NAV_HEIGHT} from 'PUB_DIR/sources/utils/consts';
let userData = require('PUB_DIR/sources/user-data');
import ModalDialog from 'CMP_DIR/ModalDialog';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import UploadAndDeleteFile from 'CMP_DIR/apply-components/upload-and-delete-file';
class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            showBackoutConfirmType: '',//操作的确认框类型
            isUpLoading: false,
            // fileDirId: '',
            // fileReportId: '',
            // fileUploadId: '',//上传文件成功后后端返回的id
            // fileUploadName: '',//上传文件名
            clickConfirmBtn: false,//为了防止点击确认按钮后，立刻打开查看详情，详情属性中没有approver_ids这个数组,所以在点击确认申请后加上这样的标识
            ...DocumentWriteApplyDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(DocumentWriteApplyDetailStore.getState());
    };

    componentDidMount() {
        DocumentWriteApplyDetailStore.listen(this.onStoreChange);
        if (_.get(this.props,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                DocumentWriteApplyDetailAction.setDetailInfoObjAfterAdd(this.props.detailItem);
            });
        }else if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem);
        }
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
        DocumentWriteApplyDetailAction.cancelApplyApprove(backoutObj);
    };

    componentWillReceiveProps(nextProps) {
        var thisPropsId = this.props.detailItem.id;
        var nextPropsId = nextProps.detailItem.id;
        if (_.get(nextProps,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                DocumentWriteApplyDetailAction.setDetailInfoObjAfterAdd(nextProps.detailItem);
            });
        }else if (thisPropsId && nextPropsId && nextPropsId !== thisPropsId) {
            this.getBusinessApplyDetailData(nextProps.detailItem);
            this.setState({
                showBackoutConfirmType: '',
                // fileUploadId: '',
                // fileReportId: '',
                // fileUploadName: '',
                clickConfirmBtn: false
            });
        }
    }

    componentWillUnmount() {
        this.setState({
            clickConfirmBtn: false
        });
        DocumentWriteApplyDetailStore.unlisten(this.onStoreChange);
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
            DocumentWriteApplyDetailAction.setInitialData(detailItem);
            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (detailItem.status === 'pass' || detailItem.status === 'reject') {
                DocumentWriteApplyDetailAction.getApplyCommentList({id: detailItem.id});
                DocumentWriteApplyDetailAction.getApplyDetailById({id: detailItem.id}, detailItem.status);
            } else if (detailItem.id) {
                DocumentWriteApplyDetailAction.getApplyDetailById({id: detailItem.id});
                DocumentWriteApplyDetailAction.getApplyCommentList({id: detailItem.id});
                //根据申请的id获取申请的状态
                DocumentWriteApplyDetailAction.getApplyStatusById({id: detailItem.id});
                DocumentWriteApplyDetailAction.getNextCandidate({id: detailItem.id});
            }
        });
    }

    //重新获取回复列表
    refreshReplyList = (e) => {
        Trace.traceEvent(e, '点击了重新获取');
        var detailItem = this.props.detailItem;
        if (detailItem.status === 'pass' || detailItem.state === 'reject') {
            DocumentWriteApplyDetailAction.setApplyComment(detailItem.approve_details);
        } else if (detailItem.id) {
            DocumentWriteApplyDetailAction.getApplyCommentList({id: detailItem.id});
        }
    };
    //重新获取申请的状态
    refreshApplyStatusList = (e) => {
        var detailItem = this.props.detailItem;
        DocumentWriteApplyDetailAction.getApplyStatusById({id: detailItem.id});
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
        var documentType = getDocumentReportTypeText(DOCUMENT_TYPE,detail.document_type);
        var showApplyInfo = [
            {
                label: Intl.get('common.type', '类型'),
                text: documentType
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
            DocumentWriteApplyDetailAction.showReplyCommentEmptyError();
            return;
        }
        //提交数据
        DocumentWriteApplyDetailAction.addApplyComments(submitData);
    };
    //备注 输入框改变时候触发
    commentInputChange = (event) => {
        //如果添加回复的ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        var val = _.trim(event.target.value);
        DocumentWriteApplyDetailAction.setApplyFormDataComment(val);
        if (val) {
            DocumentWriteApplyDetailAction.hideReplyCommentEmptyError();
        }
    };

    viewApprovalResult = (e) => {
        Trace.traceEvent(e, '查看审批结果');
        if (this.state.showBackoutConfirmType === 'reject'){
            //设置这条审批不再展示通过和驳回的按钮
            DocumentWriteApplyDetailAction.hideApprovalBtns();
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
        DocumentWriteApplyDetailAction.cancelSendApproval();
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
        //todo 这里需要改一下取upload_id的取值,需要用数组
        var fileId = this.state.fileReportId || _.get(detailInfoObj,'detail.upload_id');
        if (!fileId){
            return;
        }
        DocumentWriteApplyDetailAction.approveApplyPassOrReject({id: detailInfoObj.id, agree: 'pass',report_id: fileId},() => {
            detailInfoObj.showApproveBtn = false;
            detailInfoObj.status = 'pass';
            var replyList = _.get(this.state,'replyListInfo.list');
            replyList.unshift({comment_time: moment().valueOf(),
                nick_name: userData.getUserData().nick_name,
                status: 'pass'
            });
            detailInfoObj.approve_details = replyList;
            DocumentWriteApplyDetailAction.setDetailInfo(detailInfoObj);
        });
    };
    renderConfirmFinish = () => {
        var isLoading = this.state.applyResult.submitResult === 'loading';
        return (
            <Button type='primary' className='pull-right' onClick={this.confirmFinishApply} disabled={isLoading}>
                {Intl.get('apply.approve.confirm.finish','确认完成')}
                {isLoading ? <Icon type="loading"/> : null}
                <Icon/>
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
            //所以只有在已确认并且没有上传过文件的时候，设置showApproveBtn为false
            //有approver_ids  或者 clickConfirmBtn 是true 是表示已经确认过 待确认申请
            if (_.isArray(detailInfoObj.approver_ids) || this.state.clickConfirmBtn){
                //有upload_id表示已经上传过文件 已经上传文件了
                if (_.get(detailInfoObj,'detail.file_upload_logs',[]).length){
                    renderAssigenedContext = this.renderConfirmFinish;
                    showApproveBtn = true;
                }else{
                    //还没有上传文件
                    showApproveBtn = false;
                }
            }else if (!_.isArray(detailInfoObj.approver_ids)){
                passText = Intl.get('apply.approve.confirm.apply','确认申请');
                showApproveBtn = true;
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
                passText ={passText}
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
            var stepTip = '';
            if ((_.isArray(applicantList.approver_ids) || this.state.clickConfirmBtn) && !_.get(applicantList,'detail.upload_id')){
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
        DocumentWriteApplyDetailAction.approveApplyPassOrReject({id: detailInfoObj.id, agree: confirmType});
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
    afterUpload = () => {
        this.setState({
            isUpLoading: false,
        });
    };
    // handleChange = (info) => {
    //     this.setState({isUpLoading: true});
    //     const response = info.file.response;
    //     if (info.file.status === 'done') {
    //         Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-reportsend'), '上传文件成功');
    //         if (response) {
    //             //上传成功
    //             this.setState({fileUploadId: response.file_id,fileUploadName: response.file_name,fileDirId: response.file_dir_id,fileReportId: response.id});
    //         } else {
    //             message.error(Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!',{type: Intl.get('apply.approve.document.writing', '文件撰写')}));
    //         }
    //         this.afterUpload();
    //     }else if(info.file.status === 'error'){
    //         message.error(_.isString(response) ? response : Intl.get('clue.manage.failed.import.clue', '导入{type}失败，请重试!',{type: Intl.get('apply.approve.document.writing', '文件撰写')}));
    //         this.afterUpload();
    //     }
    // };
    //删除已经上传的文件
    // handleDeleteFile = (fileDirId,fileId) => {
    //     var submitObj = {
    //         file_dir_id: fileDirId,
    //         file_id: fileId
    //     };
    //     DocumentWriteApplyDetailAction.deleteLoadApplyApproveFile(submitObj);
    // };
    //删除或者添加文件成功后，修改state数据中的值
    setUpdateFiles = (updateLists) => {
        ReportSendApplyDetailAction.setUpdateFilesLists(updateLists);
    };
    renderUploadAndDownloadInfo = () => {
        var detailInfoObj = this.state.detailInfoObj.info;
        return (<UploadAndDeleteFile
            setUpdateFiles={this.setUpdateFiles}
            detailInfoObj={detailInfoObj}
            uploadFileArrs={_.get(detailInfoObj,'detail.file_upload_logs')}

        />);


        // var detailInfoObj = this.state.detailInfoObj.info;
        // var props = {
        //     name: 'reportsend',
        //     action: '/rest/reportsend/upload',
        //     showUploadList: false,
        //     multiple: true,
        //     onChange: this.handleChange,
        //     data: detailInfoObj.id
        // };
        // var fileName = this.state.fileUploadName || _.get(detailInfoObj,'detail.file_name');
        // var fileId = this.state.fileUploadId || _.get(detailInfoObj,'detail.file_id');
        // var fileDirId = this.state.fileDirId || _.get(detailInfoObj,'detail.file_dir_id');
        // const reqData = {
        //     file_dir_id: fileDirId,
        //     file_id: fileId,
        //     file_name: fileName,
        // };
        // return (
        //     <div>
        //         {fileName ? <div className="upload-file-name">
        //             {hasPrivilege('DOCUMENT_DOWNLOAD') ? <a href={'/rest/reportsend/download/' + JSON.stringify(reqData)}>{fileName}</a> : fileName}
        //             {/*todo 有删除权限的可以删除文件*/}
        //             <Icon type="close" onClick={this.handleDeleteFile.bind(this,fileDirId,fileId)}/>
        //         </div> : null}
        //         {detailInfoObj.status === 'ongoing' && hasPrivilege('DOCUMENT_UPLOAD') ?
        //             <Upload {...props} className="import-reportsend" data-tracename="上传文件">
        //                 <Button type='primary' className='download-btn'>
        //                     {fileName ? Intl.get('apply.approve.update.file', '更新文件') : Intl.get('apply.approve.import.file', '上传文件')}
        //                     {this.state.isUpLoading ?
        //                         <Icon type="loading" className="icon-loading"/> : null}</Button>
        //             </Upload>
        //             : null}
        //
        //     </div>
        // );
    };
    renderUploadAndDownload = (detailInfo) => {
        // 驳回的时候也会有这个属性，所以再加上status的判断
        if ((_.isArray(detailInfo.approver_ids) && detailInfo.status !== 'reject') || this.state.clickConfirmBtn){
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
            <div className='col-md-8 leave_manage_apply_detail_wrap' style={{'height': divHeight}} data-tracename="文件撰写审批详情界面">
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

};
ApplyViewDetail.propTypes = {
    detailItem: PropTypes.string,
    showNoData: PropTypes.boolean
};
module.exports = ApplyViewDetail;