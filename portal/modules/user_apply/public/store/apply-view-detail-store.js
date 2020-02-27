import ApplyViewDetailActions from '../action/apply-view-detail-actions';
import { altAsyncUtil } from 'ant-utils';
const { resultHandler } = altAsyncUtil;
import { APPLY_TYPES, TIMERANGEUNIT, WEEKDAYS} from 'PUB_DIR/sources/utils/consts';
import {getDelayDisplayTime} from '../util/app-user-util';
import {checkIfLeader, isCustomDelayType, applyAppConfigTerminal} from 'PUB_DIR/sources/utils/common-method-util';
class ApplyViewDetailStore {
    constructor() {
        this.resetState();
        this.bindActions(ApplyViewDetailActions);
    }
    //重置store的值
    resetState() {
        //选中的审批条目
        this.selectedDetailItem = {};
        //审批的详情数据
        this.detailInfoObj = {
            // "" loading error
            loading: false,
            //获取的详情信息
            info: {},
            //错误信息
            errorMsg: ''
        };
        //审批之后数据存储
        this.applyResult = {
            //提交状态  "" loading error success
            submitResult: '',
            //错误信息
            errorMsg: ''
        };
        //是否显示右侧面板
        this.showRightPanel = false;
        //右侧面板显示客户详情的customerId
        this.rightPanelCustomerId = '';
        // 右侧面板显示应用appId为空
        this.rightPanelAppConfig = '';
        // 配置界面的编辑
        this.addUserTypeConfigInfoShow = false;
        //底部显示类型  btn 按钮   formtext 文字
        this.detailBottomDisplayType = 'btn';
        //应用列表,用来显示app_logo
        this.app_list = [];
        //申请单是否是展开状态 展开状态能看到每个应用的详细配置
        this.applyIsExpanded = false;
        //用户名，昵称，审批备注，延期时间
        this.formData = {
            user_name: '',
            nick_name: '',
            comment: '',
            //延迟时间，默认数字是1
            delayTimeNumber: 1,
            //延期时间的单位，默认是天
            delayTimeUnit: TIMERANGEUNIT.DAY,
            // 到期时间(选择到期时间)
            end_date: moment().endOf('day').valueOf(),
            // 延期时间
            delay_time: '',
            //审批修改密码
            apply_detail_password: '',
            //确认密码
            confirmPassword: ''
        };
        //各个应用的配置
        this.appsSetting = {};
        //用户名是否处在修改状态
        this.isUserEdit = false;
        //表单验证用户名
        this.isNickNameEdit = false;
        //表单验证用户名
        this.isModifyDelayTime = false;
        // 待审批界面上，用户延期申请返回延迟时间显示
        this.returnDelayTimeShow = true;
        //表单验证用户名
        this.status = {
            user_name: {},
            nick_name: {},
            apply_detail_password: {},
            //确认密码
            confirmPassword: {}
        };
        //密码强度
        this.passStrength = {
            passBarShow: false
        };
        //回复列表
        this.replyListInfo = {
            //三种状态,loading,error,''
            result: 'loading',
            //列表数组
            list: [],
            //服务端错误信息
            errorMsg: ''
        };
        //回复表单
        this.replyFormInfo = {
            //三种状态,loading,error,success,''
            result: '',
            //服务端错误信息
            errorMsg: ''
        };
        // 是否显示没有设置角色的弹框(管理员批准的时候，
        // 如果是创建正式、创建试用、已有用户申请开通新应用正式、已有用户申请开通新应用试用，
        // 需要先检查角色，没有设置角色的时候，要显示一个弹框)
        this.rolesNotSettingModalDialog = {
            //模态框是否显示
            show: false,
            //应用名称列表
            appNames: [],
            //是否继续提交
            continueSubmit: false
        };

        // 应用的默认配置信息
        this.appDefaultInfo = [];
        // 应用的角色信息
        this.appRoleInfo = [];
        // 应用的权限信息
        this.appAuthInfo = [];
        // 确定用户名是否更改  没改：false 改了：true
        this.isChangeUserName = false;
        //撤销状态  "" loading error success
        this.backApplyResult = {
            submitResult: '',
            errorMsg: ''
        };
        //(多用户)延期申请审批时，当前要配置角色的用户id
        this.curShowConfigUserId = '';
        //下一节点负责人的列表
        this.candidateList = [];
        //转出申请的状态列表
        this.transferStatusInfo = {
            //三种状态,loading,error,''
            result: '',
            //服务端错误信息
            errorMsg: ''
        };
        this.isLeader = false; //当前账号是否是待审批人的上级领导
        //该审批的所在的节点
        this.applyNode = [];
        //获取相同客户的历史申请
        this.sameHistoryApplyLists = {
            //三种状态,loading,error,success
            result: 'loading',
            //列表数组
            list: [],
            //服务端错误信息
            errorMsg: ''
        };
    }
    //获取应用列表
    getApps(result) {
        if (result.error) {
            this.app_list = [];
        } else {
            this.app_list = result.list;
        }
    }
    setHistoryApplyStatus(){
        this.sameHistoryApplyLists = {
            //三种状态,loading,error,''
            result: '',
            //列表数组
            list: [],
            //服务端错误信息
            errorMsg: ''
        };
    }
    //获取审批详情
    getApplyDetail(obj) {
        //没有角色的时候，显示模态框，重置
        this.rolesNotSettingModalDialog = {
            show: false,
            appNames: [],
            continueSubmit: false
        };

        if (obj.loading) {
            this.detailInfoObj.loading = true;
            this.detailInfoObj.info = {};
            return;
        } else if (obj.error) {
            this.detailInfoObj.loading = false;
            this.detailInfoObj.info = {};
            this.detailInfoObj.errorMsg = obj.errorMsg;
        } else {
            this.detailInfoObj.loading = false;
            const info = obj.detail;
            _.each(info.apps || [], (app) => {
                app.app_id = app.client_id;
                app.app_name = app.client_name;
            });
            this.detailInfoObj.info = info;
            if (obj.approvalState){
                //审批通过或者驳回后立刻查询状态还没有立刻改变
                this.detailInfoObj.info.approval_state
                    = obj.approvalState;
                this.selectedDetailItem.approval_state
                    = obj.approvalState;
            }
            this.detailInfoObj.errorMsg = '';
            const appList = obj.appList;
            this.createAppsSetting(appList);
            //用户的处理
            if (_.indexOf(APPLY_TYPES, info.type) !== -1) {//延期、禁用（多应用）
                if (_.isArray(info.apps)) {
                    this.formData.user_name = _.get(info.apps, '0.user_name');
                    this.formData.nick_name = _.get(info.apps, '0.nickname');
                    //用户类型存在，则需要修改用户类型，不存在则不需要修改，也不用传到审批接口中
                    if (_.get(info.apps, '0.user_type')) {
                        this.formData.user_type = _.get(info.apps, '0.user_type');
                    }
                }
            } else {
                if (_.isArray(this.detailInfoObj.info.user_names)) {
                    this.formData.user_name = this.detailInfoObj.info.user_names[0];
                }
                if (_.isArray(this.detailInfoObj.info.nick_names)) {
                    this.formData.nick_name = this.detailInfoObj.info.nick_names[0];
                }
            }
            //延期的处理
            let delayTime = 0;
            //老数据中，延期的处理
            if (this.detailInfoObj.info.type === 'apply_grant_delay') {
                if (this.detailInfoObj.info.delayTime) { // 同步修改时间
                    delayTime = this.detailInfoObj.info.delayTime;
                    this.formData.delay_time = delayTime;
                    getDelayDisplayTime(delayTime, this.formData);
                } else { // 到期时间，点开修改同步到自定义
                    this.formData.delayTimeUnit = TIMERANGEUNIT.CUSTOM;
                    this.formData.end_date = this.detailInfoObj.info.end_date;
                }
            } else if (this.detailInfoObj.info.type === APPLY_TYPES.DELAY) {//延期（多应用）
                var delay_time = _.get(info.apps, '0.delay_time');
                if (delay_time) { // 同步修改时间
                    info.delayTime = delay_time;
                    this.formData.delay_time = delay_time;
                    getDelayDisplayTime(delay_time, this.formData);
                } else { // 到期时间，点开修改同步到自定义
                    this.formData.delayTimeUnit = TIMERANGEUNIT.CUSTOM;
                    this.formData.end_date = info.apps[0].end_date;
                }
            }
            this.detailInfoObj.info.showApproveBtn = this.selectedDetailItem.showApproveBtn;
            this.detailInfoObj.info.showCancelBtn = this.selectedDetailItem.showCancelBtn;

        }
    }
    hideApprovalBtns() {
        this.selectedDetailItem.showApproveBtn = false;
        this.selectedDetailItem.showCancelBtn = false;
    }
    showOrHideApprovalBtns(flag){
        this.selectedDetailItem.showApproveBtn = flag;
        this.detailInfoObj.info.showApproveBtn = flag;
    }
    saleBackoutApply(resultObj){
        if (resultObj.loading){
            this.backApplyResult.submitResult = 'loading';
            this.backApplyResult.errorMsg = '';
        }else if (resultObj.error){
            this.backApplyResult.submitResult = 'error';
            this.backApplyResult.errorMsg = resultObj.errorMsg;
        }else{
            this.backApplyResult.submitResult = 'success';
            this.backApplyResult.errorMsg = '';
        }
    }
    getHistoryApplyListsByCustomerId(resultObj){
        var sameHistoryApplyLists = this.sameHistoryApplyLists;
        if (resultObj.loading) {
            sameHistoryApplyLists.result = 'loading';
            sameHistoryApplyLists.list = [];
            sameHistoryApplyLists.errorMsg = '';
        } else if (resultObj.error) {
            //出错的情况
            sameHistoryApplyLists.result = 'error';
            sameHistoryApplyLists.list = [];
            sameHistoryApplyLists.errorMsg = resultObj.errorMsg;
        } else {
            //正常情况
            sameHistoryApplyLists.result = '';
            sameHistoryApplyLists.list = _.get(resultObj,'data.list');
            sameHistoryApplyLists.errorMsg = '';
        }
    }

    //生成应用的单独配置
    createAppsSetting(appList) {
        //申请的应用列表
        const apps = _.cloneDeep(this.detailInfoObj.info.apps);
        //申请类型
        let apply_type = _.get(this.detailInfoObj, 'info.type');
        _.each(apps, (appInfo) => {
            const app_id = appInfo.app_id;
            const tags = appInfo.tags || [];
            let start_time = appInfo.begin_date || 0,
                end_time = appInfo.end_date || 0,
                range;

            if (appInfo.end_date === '0' || appInfo.end_date === 0) {
                range = 'forever';
            } else {
                var startMoment = moment(new Date(+start_time));
                var endMoment = moment(new Date(+end_time));
                startMoment.hours(0).minutes(0).seconds(0).milliseconds(0);
                endMoment.hours(0).minutes(0).seconds(0).milliseconds(0);
                var rangeDiffMonth = endMoment.diff(startMoment, 'months') + '';
                if (['1', '6', '12'].indexOf(rangeDiffMonth) >= 0 && startMoment.format('D') === endMoment.format('D')) {
                    range = rangeDiffMonth + 'm';
                } else {
                    //判断天数，是7天(一周)还是15天(半个月)
                    var rangeDiffDays = endMoment.diff(startMoment, 'days') + '';
                    if (rangeDiffDays === '7') {
                        range = '1w';
                    } else if (rangeDiffDays === '15') {
                        range = '0.5m';
                    } else {
                        range = 'custom';
                    }
                }
            }
            let appConfigObj = {
                //开通个数
                number: _.get(appInfo, 'number', 1),
                //到期停用
                over_draft: _.toString( _.get(appInfo, 'over_draft', '1')),
                //时间
                time: {
                    start_time: start_time,
                    end_time: end_time,
                    range: range
                },
                //角色
                roles: appInfo.roles || [],
                //权限
                permissions: appInfo.permissions || [],
            };
            // 申请的多终端信息
            const terminals = _.get(appInfo, 'terminals', []);
            if (!_.isEmpty(terminals)) {
                appConfigObj.terminals = applyAppConfigTerminal(terminals, app_id, appList);
            }
            //延期（多应用)时，需要分用户进行配置
            if(apply_type === APPLY_TYPES.DELAY){
                this.appsSetting[`${app_id}&&${appInfo.user_id}`] = appConfigObj;
            } else {
                this.appsSetting[app_id] = appConfigObj;
            }
        });
    }
    //显示右侧详情加载中
    showDetailLoading(obj) {
        //重置数据
        this.resetState();
        //指定详情条目
        this.selectedDetailItem = obj;
        //设置底部类型
        this.setBottomDisplayType();
        //是否是展开状态
        this.applyIsExpanded = false;
    }
    //计算右侧底部类型
    setBottomDisplayType() {
        if (this.selectedDetailItem.isConsumed === 'true') {
            this.detailBottomDisplayType = 'formtext';
        } else {
            this.detailBottomDisplayType = 'btn';
        }
    }
    //提交审批
    submitApply(obj) {
        if (obj.loading) {
            this.applyResult.submitResult = 'loading';
            this.applyResult.errorMsg = '';
        } else if (obj.error) {
            this.applyResult.submitResult = 'error';
            this.applyResult.errorMsg = obj.errorMsg;
        } else {
            this.rolesNotSettingModalDialog.continueSubmit = false;
            this.rolesNotSettingModalDialog.show = false;
            this.rolesNotSettingModalDialog.appNames = [];

            this.applyResult.submitResult = 'success';
            this.applyResult.errorMsg = '';
        }
    }
    //取消审批
    cancelSendApproval() {
        this.applyResult.submitResult = '';
        this.applyResult.errorMsg = '';
        this.rolesNotSettingModalDialog.continueSubmit = false;
        this.rolesNotSettingModalDialog.show = false;
        this.rolesNotSettingModalDialog.appNames = [];
    }
    //展开、收起
    toggleApplyExpanded({flag, user_id}) {
        this.applyIsExpanded = flag;
        this.curShowConfigUserId = user_id;
    }
    //设置用户名是否为编辑状态
    setUserNameEdit(type) {
        this.isUserEdit = type;
    }
    //保存用户名
    saveUserName(name) {
        if (name !== this.detailInfoObj.info.user_names[0]) {
            this.detailInfoObj.info.user_names[0] = name;
            this.isChangeUserName = true;
        }

    }
    cancelUserName() {
        this.formData.user_name = this.detailInfoObj.info.user_names[0];
    }
    //显示用户详情右侧面板
    showUserDetail(userId) {
        //客户id为空
        this.rightPanelCustomerId = '';
        // 应用appId为空
        this.rightPanelAppConfig = '';
    }
    //显示客户详情右侧面板
    showCustomerDetail(customerId) {
        //右侧面板显示用户详情的customerId
        this.rightPanelCustomerId = customerId;
        // 应用appId为空
        this.rightPanelAppConfig = '';
    }
    // 显示应用没有默认的权限和角色的右侧面板
    showAppConfigPanel(app) {
        //是否显示右侧面板
        this.showRightPanel = true;
        this.rightPanelAppConfig = app;
        //右侧面板显示用户详情的customerId为空
        this.rightPanelCustomerId = '';
    }
    // 应用配置取消保存
    handleCancel() {
        this.showRightPanel = false;
        this.rightPanelAppConfig = '';
        this.addUserTypeConfigInfoShow = false;
    }
    // 应用配置保存成功时
    handleSaveAppConfig() {
        this.showRightPanel = false;
        this.rightPanelAppConfig = '';
        this.addUserTypeConfigInfoShow = false;
    }
    showAppConfigRightPanle() {
        this.addUserTypeConfigInfoShow = true;
    }
    //关闭右侧面板
    closeRightPanel() {
        //是否显示右侧面板
        this.showRightPanel = false;
        //右侧面板显示客户详情的userId
        this.rightPanelCustomerId = '';
    }
    //设置昵称是否为编辑状态
    setNickNameEdit(type) {
        this.isNickNameEdit = type;
    }
    //保存昵称
    saveNickName(name) {
        this.detailInfoObj.info.nick_names[0] = name;
    }
    // 取消昵称的保存
    cancelNickName() {
        this.formData.nick_name = this.detailInfoObj.info.nick_names[0];
    }

    //延期时间是否为修改状态
    setDelayTimeModify(type) {
        this.isModifyDelayTime = type;
        this.returnDelayTimeShow = false;
    }
    //保存修改的延迟时间
    saveModifyDelayTime(delay) {
        this.returnDelayTimeShow = false;
        this.isModifyDelayTime = false;
        if (isCustomDelayType(this.formData.delayTimeUnit) ) {
            this.formData.end_date = delay;
            this.formData.delay_time = '';
        } else {
            this.formData.delay_time = delay;
        }
    }
    // 取消修改的延迟时间
    cancelModifyDelayTime() {
        this.returnDelayTimeShow = false;
        this.isModifyDelayTime = false;
        let delayTime;
        if (this.detailInfoObj.info.delayTime) {
            delayTime = this.detailInfoObj.info.delayTime;
            this.formData.delay_time = delayTime;
            getDelayDisplayTime(delayTime, this.formData);
        } else {
            this.formData.delayTimeUnit = TIMERANGEUNIT.CUSTOM;
            this.formData.end_date = this.detailInfoObj.info.end_date;
            this.formData.delay_time = '';
        }
    }

    //延期时间数字
    delayTimeNumberModify(val) {
        this.formData.delayTimeNumber = val;
    }
    //延期时间单位
    delayTimeUnitModify(unit) {
        this.formData.delayTimeUnit = unit;
    }

    // 将延期时间设置为截止时间（具体到xx年xx月xx日）
    setDelayDeadlineTime(val) {
        this.formData.end_date = val;
    }

    //获取回复列表
    getReplyList(resultObj) {
        //回复列表
        var replyListInfo = this.replyListInfo;
        //result,list,errorMsg
        //loading的情况
        if (resultObj.loading) {
            replyListInfo.result = 'loading';
            replyListInfo.list = [];
            replyListInfo.errorMsg = '';
        } else if (resultObj.error) {
            //出错的情况
            replyListInfo.result = 'error';
            replyListInfo.list = [];
            replyListInfo.errorMsg = resultObj.errorMsg;
        } else {
            //正常情况
            replyListInfo.result = '';
            replyListInfo.list = resultObj.list;
            replyListInfo.errorMsg = '';
        }
    }
    //显示回复输入框为空的错误
    showReplyCommentEmptyError() {
        if (this.replyFormInfo.result === 'success') {
            return;
        }
        this.replyFormInfo.result = 'error';
        this.replyFormInfo.errorMsg = Intl.get('user.apply.reply.no.content', '请填写回复内容');
    }
    //隐藏回复输入框为空的错误
    hideReplyCommentEmptyError() {
        this.replyFormInfo.result = '';
        this.replyFormInfo.errorMsg = '';
    }
    //添加回复状态处理 success error '' success
    addReply(resultObj) {
        //回复表单
        var replyFormInfo = this.replyFormInfo;
        if (resultObj.loading) {
            replyFormInfo.result = 'loading';
            replyFormInfo.errorMsg = '';
        } else if (resultObj.error) {
            replyFormInfo.result = 'error';
            replyFormInfo.errorMsg = resultObj.errorMsg;
        } else {
            replyFormInfo.result = 'success';
            replyFormInfo.errorMsg = '';
            var replyItem = resultObj.reply;
            this.replyListInfo.list.push(replyItem);
            //输入框清空
            this.formData.comment = '';
        }
    }
    //恢复添加回复表单到默认状态
    resetReplyFormResult() {
        if (this.replyFormInfo.result === 'success') {
            //回复表单重置
            this.replyFormInfo = {
                result: '',
                errorMsg: ''
            };
        }
    }

    getNextCandidate(result) {
        if (result.error) {
            this.candidateList = [];
        } else {
            this.candidateList = _.get(result,'list',[]);
            this.isLeader = _.get(result,'isLeader',false);
        }
    }
    getApplyTaskNode(result){
        if (result.error) {
            this.applyNode = [];
        } else {
            this.applyNode = result;
        }
    }
    setNextCandidate(candidateArr){
        this.candidateList = candidateArr;
        checkIfLeader(candidateArr,(isLeader) => {
            this.isLeader = isLeader;
        });
    }
    //设置角色的模态框是显示还是隐藏
    setRolesNotSettingModalDialog({ show, appNames }) {
        this.rolesNotSettingModalDialog.show = show;
        this.rolesNotSettingModalDialog.appNames = appNames;
    }
    //没有设置角色，但是仍然提交
    rolesNotSettingContinueSubmit() {
        this.rolesNotSettingModalDialog.continueSubmit = true;
        this.rolesNotSettingModalDialog.show = false;
        this.rolesNotSettingModalDialog.appNames = [];
    }
    setNextCandidateIds(candidateId){
        this.detailInfoObj.info.nextCandidateId = candidateId;
    }
    setNextCandidateName(candidateName){
        this.detailInfoObj.info.nextCandidateName = candidateName;
    }
    transferNextCandidate(result){
        if (result.loading) {
            this.transferStatusInfo.result = 'loading';
            this.transferStatusInfo.errorMsg = '';
        } else if (result.error) {
            this.transferStatusInfo.result = 'error';
            this.transferStatusInfo.errorMsg = result.errorMsg;
        } else {
            this.transferStatusInfo.result = 'success';
            this.transferStatusInfo.errorMsg = '';
            //如果转出成功，要隐藏审批的按钮
            this.selectedDetailItem.showApproveBtn = false;
            this.detailInfoObj.info.showApproveBtn = false;
        }
    }
}

//使用alt导出store
export default alt.createStore(ApplyViewDetailStore, 'ApplyViewDetailStore');