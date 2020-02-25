/**
 * Created by hzl on 2019/3/5.
 */
import MemberApplyDetailStore from '../store/member-apply-detail-store';
import MemberApplyDetailAction from '../action/member-apply-detail-action';
import MemberApplyActions from '../action/member-apply-action';
import Trace from 'LIB_DIR/trace';
import {Form, Input, Button, Steps,message, Checkbox} from 'antd';
const Step = Steps.Step;
const FormItem = Form.Item;
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/member-apply-detail.less');
import ApplyDetailRemarks from 'CMP_DIR/apply-components/apply-detail-remarks';
import ApplyDetailInfo from 'CMP_DIR/apply-components/apply-detail-info';
import ApplyDetailStatus from 'CMP_DIR/apply-components/apply-detail-status';
import ApplyApproveStatus from 'CMP_DIR/apply-components/apply-approve-status';
import ApplyDetailBottom from 'CMP_DIR/apply-components/apply-detail-bottom';
import {APPLY_LIST_LAYOUT_CONSTANTS,APPLY_STATUS} from 'PUB_DIR/sources/utils/consts';
import {
    getApplyTopicText,
    getApplyResultDscr,
    getApplyStatusTimeLineDesc,
    getFilterReplyList,
    handleDiffTypeApply,
    formatUsersmanList,
    updateUnapprovedCount,
    timeShowFormat
} from 'PUB_DIR/sources/utils/common-method-util';
import {handleTimeRange} from 'PUB_DIR/sources/utils/common-data-util';
import {TOP_NAV_HEIGHT} from 'PUB_DIR/sources/utils/consts';
let userData = require('PUB_DIR/sources/user-data');
import ModalDialog from 'CMP_DIR/ModalDialog';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {getAllUserList} from 'PUB_DIR/sources/utils/common-data-util';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {APPLY_APPROVE_TYPES,REFRESH_APPLY_RANGE,APPLY_FINISH_STATUS} from 'PUB_DIR/sources/utils/consts';
import {nameLengthRule, nameRegex, emailRegex} from 'PUB_DIR/sources/utils/validate-util';
import PasswordSetting from 'CMP_DIR/password-setting';
const formItemLayout = {
    labelCol: {span: 3},
    wrapperCol: {span: 16}
};

class ApplyViewDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showBackoutConfirmType: '',//操作的确认框类型
            usersManList: [],//成员列表
            ...MemberApplyDetailStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(MemberApplyDetailStore.getState());
    };

    componentDidMount() {
        MemberApplyDetailStore.listen(this.onStoreChange);
        if (_.get(this.props,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                MemberApplyDetailAction.setDetailInfoObjAfterAdd(this.props.detailItem);
                this.getNextCandidate(_.get(this, 'props.detailItem.id',''));
            });
        }else if (this.props.detailItem.id) {
            this.getBusinessApplyDetailData(this.props.detailItem);
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
        MemberApplyDetailAction.setNextCandidateIds(updateUser);
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
        MemberApplyDetailAction.transferNextCandidate(submitObj,(flag) => {
            //关闭下拉框
            if (flag){
                if(_.isFunction(_.get(this, 'addNextCandidate.handleCancel'))){
                    this.addNextCandidate.handleCancel();
                }
                //转出成功后，如果左边选中的是待审批的列表，在待审批列表中把这条记录删掉
                if (this.props.selectedApplyStatus === 'ongoing'){
                    MemberApplyActions.afterTransferApplySuccess(submitObj.id);
                }else{
                    message.success(Intl.get('apply.approve.transfer.success','转出申请成功'));
                }
                //将待我审批的申请转审后
                if (hasApprovePrivilege){
                    //待审批数字减一
                    var count = Oplate.unread[APPLY_APPROVE_TYPES.UNHANDLEPERSONALLEAVE] - 1;
                    updateUnapprovedCount(APPLY_APPROVE_TYPES.UNHANDLEPERSONALLEAVE,'SHOW_UNHANDLE_APPLY_APPROVE_COUNT',count);
                    //隐藏通过、驳回按钮
                    MemberApplyDetailAction.showOrHideApprovalBtns(false);
                }else if (memberId === transferCandidateId){
                    //将非待我审批的申请转给我审批后，展示出通过驳回按钮,不需要再手动加一，因为后端会有推送，这里如果加一就会使数量多一个
                    MemberApplyDetailAction.showOrHideApprovalBtns(true);
                }
                //转审成功后，把下一节点的审批人改成转审之后的人
                MemberApplyDetailAction.setNextCandidate([{nick_name: addNextCandidateName,user_id: transferCandidateId}]);

            }else{
                message.error(Intl.get('apply.approve.transfer.failed','转出申请失败'));
            }
        });
    };
    clearNextCandidateIds = () => {
        MemberApplyDetailAction.setNextCandidateIds('');
        MemberApplyDetailAction.setNextCandidateName('');
    };
    setSelectContent =(nextCandidateName) => {
        MemberApplyDetailAction.setNextCandidateName(nextCandidateName);
    };
    renderAddApplyNextCandidate = () => {
        var addNextCandidateId = _.get(this.state, 'detailInfoObj.info.nextCandidateId','');
        var addNextCandidateName = _.get(this.state, 'detailInfoObj.info.nextCandidateName','');
        return (
            <div className="pull-right">
                <AntcDropdown
                    datatraceContainer='成员申请转审按钮'
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
        MemberApplyDetailAction.cancelApplyApprove(backoutObj);
    };

    componentWillReceiveProps(nextProps) {
        var thisPropsId = this.props.detailItem.id;
        var nextPropsId = nextProps.detailItem.id;
        if (_.get(nextProps,'detailItem.afterAddReplySuccess')){
            setTimeout(() => {
                MemberApplyDetailAction.setDetailInfoObjAfterAdd(nextProps.detailItem);
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
        MemberApplyDetailStore.unlisten(this.onStoreChange);
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
        MemberApplyDetailAction.getNextCandidate({id: applyId},(result) => {
            var memberId = userData.getUserData().user_id;
            var target = _.find(result,detailItem => detailItem.user_id === memberId);
            if (target){
                MemberApplyDetailAction.showOrHideApprovalBtns(true);
            }
        });
    }
    getBusinessApplyDetailData(detailItem) {
        setTimeout(() => {
            MemberApplyDetailAction.setInitialData(detailItem);
            //如果申请的状态是已通过或者是已驳回的时候，就不用发请求获取回复列表，直接用详情中的回复列表
            //其他状态需要发请求请求回复列表
            if (_.includes(APPLY_FINISH_STATUS, detailItem.status)) {
                MemberApplyDetailAction.getMemberApplyCommentList({id: detailItem.id});
                MemberApplyDetailAction.getMemberApplyDetailById({id: detailItem.id}, detailItem.status);
                //如果是在界面上改变审批的状态是已通过，最好也查一下下一节点的审批人
                this.getNextCandidate(detailItem.id);
            } else if (detailItem.id) {
                MemberApplyDetailAction.getMemberApplyDetailById({id: detailItem.id});
                MemberApplyDetailAction.getMemberApplyCommentList({id: detailItem.id});
                //根据申请的id获取申请的状态
                MemberApplyDetailAction.getApplyTaskNode({id: detailItem.id});
                this.getNextCandidate(detailItem.id);
            }
        });
    }

    //重新获取回复列表
    refreshReplyList = (e) => {
        Trace.traceEvent(e, '点击了重新获取');
        var detailItem = this.props.detailItem;
        if (_.includes(APPLY_FINISH_STATUS, detailItem.status)) {
            MemberApplyDetailAction.setApplyComment(detailItem.approve_details);
        } else if (detailItem.id) {
            MemberApplyDetailAction.getMemberApplyCommentList({id: detailItem.id});
        }
    };

    //验证姓名唯一性
    checkOnlyName = () => {
        let nickname = _.trim(this.props.form.getFieldValue('nickname'));
        if (this.props.form.getFieldError('nickname')) {
            MemberApplyDetailAction.setCheckNameErrorFlag(true);
        } else if (nickname && nameRegex.test(nickname)) {
            MemberApplyDetailAction.setCheckNameErrorFlag(false);
            MemberApplyDetailAction.checkOnlyName(nickname);
        }
    };

    //姓名唯一性验证的展示
    renderNameMsg = () => {
        if (this.state.nameExist) {
            return (
                <div className='invite-member-check'>
                    {Intl.get('common.name.is.existed', '姓名已存在！')}
                </div>);
        } else if (this.state.nameError) {
            return (
                <div className='invite-member-check'>
                    {Intl.get('common.name.is.unique', '姓名唯一性校验出错！')}
                </div>);
        } else {
            return '';
        }
    };
    // 鼠标移入输入框后，姓名提示信息置空
    resetNameFlags = () => {
        MemberApplyDetailAction.resetNameFlags();
    };
    // 渲染申请成员的姓名
    renderNameContent = (nickname) => {
        const {getFieldDecorator} = this.props.form;
        return (
            <Form layout='horizontal' className='form' autoComplete='off'>
                <div className='invite-member-name'>
                    <FormItem
                        label={Intl.get('common.name', '姓名')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('nickname', {
                            initialValue: nickname,
                            rules: [{
                                required: true,
                                message: nameLengthRule
                            }]
                        })(
                            <Input
                                name='nickname'
                                id='nickname'
                                type='text'
                                placeholder={Intl.get('crm.90', '请输入姓名')}
                                className={this.state.nameExist || this.state.nameError ? 'input-red-border' : ''}
                                onBlur={this.checkOnlyName}
                                onFocus={this.resetNameFlags}
                            />
                        )}
                    </FormItem>
                    {this.renderNameMsg()}
                </div>
            </Form>
        );
    };
    //邮箱唯一性验证
    checkOnlyEmail = () => {
        let email = _.trim(this.props.form.getFieldValue('email'));
        if (this.props.form.getFieldError('email')) {
            MemberApplyDetailAction.setCheckEmailErrorFlag(true);
        } else if (email && emailRegex.test(email)) {
            MemberApplyDetailAction.setCheckEmailErrorFlag(false);
            //所有者的邮箱唯一性验证
            MemberApplyDetailAction.checkOnlyEmail(email);
        }

    };
    // 鼠标移入输入框后，邮箱提示信息置空
    resetEmailFlags = () => {
        MemberApplyDetailAction.resetEmailFlags();
    };

    //邮箱唯一性验证的展示
    renderEmailMsg = () => {
        if (this.state.emailExist) {
            return (
                <div className='invite-member-check'>
                    {Intl.get('common.email.is.used', '邮箱已被使用！')}
                </div>);
        } else if (this.state.emailError) {
            return (
                <div className='invite-member-check'>
                    {Intl.get('common.email.validate.error', '邮箱校验失败！')}
                </div>);
        } else {
            return '';
        }
    };
    // 渲染申请成员的邮箱
    renderEmailContent = (email) => {
        const {getFieldDecorator} = this.props.form;
        return (
            <Form layout='horizontal' className='form' autoComplete='off'>
                <div className='invite-member-email'>
                    <FormItem
                        label={Intl.get('common.email', '邮箱')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('email', {
                            initialValue: email,
                            rules: [{
                                required: true,
                                type: 'email',
                                message: Intl.get('common.correct.email', '请输入正确的邮箱')
                            }]
                        })(
                            <Input
                                name='email'
                                id='email'
                                type='text'
                                placeholder={Intl.get('member.email.extra.tip', '邮箱会作为登录时的用户名使用')}
                                className={this.state.emailExist || this.state.emailError ? 'input-red-border' : ''}
                                onBlur={this.checkOnlyEmail}
                                onFocus={this.resetEmailFlags}
                            />
                        )}
                    </FormItem>
                    {this.renderEmailMsg()}
                </div>
            </Form>
        );
    };
    // 检查是否自动生成密码
    checkAutoGeneration = (checked) => {
        MemberApplyDetailAction.checkAutoGeneration(checked);
    };
    // 处理手动输入密码
    handleInputPassword = (value) => {
        let passWord = _.trim(value);
        if (passWord) {
            MemberApplyDetailAction.handleInputPassword(passWord);
        }
    };

    // 渲染自动生成密码项
    renderAutoGenerationPsd = () => {
        return (
            <div className='auto-generation-password'>
                <Checkbox
                    checked={this.state.autoGenerationPsd}
                    onChange={this.checkAutoGeneration}
                />
                <span>{Intl.get('member.apply.detail.auto.generation.password', '自动生成密码')}</span>
            </div>
        );
    };
    // 渲染手动输入密码框
    renderInputPassword = () => {
        return (
            <div className='input-password'>
                <Input
                    placeholder={Intl.get('common.input.password', '请输入密码')}
                    type='password'
                    value={this.state.password}
                    onChange={this.handleInputPassword}
                />
            </div>
        );
    };

    // 渲染申请成员的密码
    renderPasswordContent = () => {
        return (
            <PasswordSetting
                onCheckboxChange={this.checkAutoGeneration}
                onInputPasswordChange={this.handleInputPassword}
                checkStatus={this.state.autoGenerationPsd}
            />

        );
    };
    renderDetailApplyBlock(detailInfo) {
        var detail = detailInfo.detail || {};
        // 审批人，才可以修改姓名和邮箱，其他只展示姓名和邮箱
        var isApprovePrivilege = _.get(detailInfo, 'showApproveBtn', false);
        var nickname = _.get(detail, 'nickname', '');
        var email = _.get(detail, 'email', '');
        var teamId = _.get(detail, 'team.group_id', '');
        var showApplyInfo = [
            { label: isApprovePrivilege ? '' : Intl.get('common.name', '姓名'),
                text: isApprovePrivilege ? this.renderNameContent(nickname) : nickname
            },{
                label: isApprovePrivilege ? '' : Intl.get('common.email', '邮箱'),
                text: isApprovePrivilege ? this.renderEmailContent(email) : email
            }, {
                text: isApprovePrivilege ? this.renderPasswordContent() : ''
            },{
                label: teamId ? Intl.get('common.belong.team', '所属团队') : '',
                text: _.get(detail, 'team.group_name', '')
            }, {
                label: Intl.get('common.role', '角色'),
                text: _.get(detail, 'role.role_name', '')
            }];
        return (
            <ApplyDetailInfo
                iconClass='icon-invite-member'
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
            MemberApplyDetailAction.showReplyCommentEmptyError();
            return;
        }
        //提交数据
        MemberApplyDetailAction.addMemberApplyComments(submitData);
    };
    //备注 输入框改变时候触发
    commentInputChange = (event) => {
        //如果添加回复的ajax没有执行完，则不提交
        if (this.state.replyFormInfo.result === 'loading') {
            return;
        }
        var val = _.trim(event.target.value);
        MemberApplyDetailAction.setApplyFormDataComment(val);
        if (val) {
            MemberApplyDetailAction.hideReplyCommentEmptyError();
        }
    };

    viewApprovalResult = (e) => {
        Trace.traceEvent(e, '查看审批结果');
        this.setState({
            showBackoutConfirmType: ''
        });
        this.getBusinessApplyDetailData(this.props.detailItem);
        //设置这条审批不再展示通过和驳回的按钮
        MemberApplyDetailAction.hideApprovalBtns();
    };

    //取消发送
    cancelSendApproval = (e) => {
        this.setState({
            showBackoutConfirmType: ''
        });
        Trace.traceEvent(e, '点击取消按钮');
        MemberApplyDetailAction.cancelSendApproval();
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
        let isConsumed = _.includes(APPLY_FINISH_STATUS, detailInfoObj.status);
        var userName = _.last(_.get(detailInfoObj, 'approve_details')) ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name ? _.last(_.get(detailInfoObj, 'approve_details')).nick_name : '' : '';
        var approvalDes = getApplyResultDscr(detailInfoObj);
        var renderAssigenedContext = null;
        var addApplyNextCandidate = null;
        //如果是管理员或者是待我审批的申请，我都可以把申请进行转出
        if ((userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || detailInfoObj.showApproveBtn) && detailInfoObj.status === 'ongoing'){
            addApplyNextCandidate = this.renderAddApplyNextCandidate;
        }
        // 校验姓名、邮箱出错时，通过按钮禁用
        let validateFlag = this.state.emailExist || this.state.emailError || 
            this.state.nameExist || this.state.nameError ||
            this.state.checkNameError || this.state.checkEmailError;
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
                disabled={validateFlag}
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
                var descrpt = getApplyStatusTimeLineDesc(replyItem.status);
                if (replyItem.status === 'reject'){
                    stepStatus = 'error';
                    currentLength--;
                }
                stepArr.push({
                    title: (replyItem.nick_name || userData.getUserData().nick_name || '') + descrpt,
                    description: timeShowFormat(replyItem.comment_time, oplateConsts.DATE_TIME_FORMAT)
                });
            });
        }
        //如果下一个节点是直接主管审核
        if (applicantList.status === 'ongoing') {
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
        // 提交的数据
        var submitData = {
            id: detailInfoObj.id,
            agree: confirmType,
            memberinvite_approve_param: {}
        };
        let changeMemberInfo = {};
        this.props.form.validateFields( (err, values) => {
            let nickname = _.get(values, 'nickname'); // 修改后的姓名
            let email = _.get(values, 'email'); // 修改后的邮箱
            if (nickname) {
                changeMemberInfo.nickname = _.trim(nickname); // 姓名信息
            }
            if (email) {
                changeMemberInfo.email = _.trim(email);// 邮箱信息
            }
        } );
        if (this.state.password) {
            changeMemberInfo.password = this.state.password; // 手动输入的密码
        }
        // 判断是否修改了姓名、邮箱、密码，若是修改了，需要把修改的数据传到后端
        if ( Object.keys(changeMemberInfo).length) {
            submitData.memberinvite_approve_param = changeMemberInfo;
        }
        MemberApplyDetailAction.approveMemberApplyPassOrReject(submitData);
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
        var divHeight = $(window).height() - TOP_NAV_HEIGHT;
        return (
            <div className='col-md-8 member-apply-detail-wrap' style={{'height': divHeight}} data-tracename="成员审批详情界面">
                <ApplyDetailStatus
                    showLoading={this.state.detailInfoObj.loadingResult === 'loading'}
                    showErrTip={this.state.detailInfoObj.loadingResult === 'error'}
                    errMsg={this.state.detailInfoObj.errorMsg}
                    retryFetchDetail={this.retryFetchDetail}
                    showNoData={this.props.showNoData}
                />
                {this.renderApplyDetailInfo()}
                {this.renderApplyApproveStatus()}
            </div>

        );
    }
}
ApplyViewDetail.defaultProps = {
    detailItem: {},
    showNoData: false,
    selectedApplyStatus: '',
    form: {}

};
ApplyViewDetail.propTypes = {
    detailItem: PropTypes.string,
    showNoData: PropTypes.bool,
    selectedApplyStatus: PropTypes.string,
    form: PropTypes.form,
};

export default Form.create()(ApplyViewDetail);
