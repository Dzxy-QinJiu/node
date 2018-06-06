import ApplyViewDetailActions from '../action/apply-view-detail-actions';

class ApplyViewDetailStore {
    constructor(){
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
            loadingResult: 'loading',
            //获取的详情信息
            info: {},
            //错误信息
            errorMsg: ''
        };
        //审批之后数据存储
        this.applyResult = {
            //提交状态  "" loading error success
            submitType: '',
            //错误信息
            errorMsg: ''
        };
        //是否显示右侧面板
        this.showRightPanel = false;
        //右侧面板显示用户详情的userId
        this.rightPanelUserId = '';
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
            delayTimeUnit: 'days',
            // 到期时间(选择到期时间)
            end_date: moment().add('days',1).valueOf(),
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
    }
    //获取应用列表
    getApps(result) {
        if(result.error) {
            this.app_list = [];
        } else {
            this.app_list = result.list;
        }
    }

    //获取延期的显示时间
    getDelayDisplayTime(delay) {
        var YEAR_MILLIS = 365 * 24 * 60 * 60 * 1000;
        var MONTH_MILLIS = 30 * 24 * 60 * 60 * 1000;
        var WEEK_MILLIS = 7 * 24 * 60 * 60 * 1000;
        var DAY_MILLIS = 24 * 60 * 60 * 1000;
        var years = Math.floor(delay / YEAR_MILLIS);
        var left_millis = delay - years * YEAR_MILLIS;
        var months = Math.floor(left_millis / MONTH_MILLIS);
        left_millis = left_millis - months * MONTH_MILLIS;
        var weeks = Math.floor(left_millis / WEEK_MILLIS);
        left_millis = left_millis - weeks * WEEK_MILLIS;
        var days = Math.floor(left_millis / DAY_MILLIS);
        if(years != 0 && months == 0 && weeks == 0 && days == 0){
            this.formData.delayTimeNumber = years;
            this.formData.delayTimeUnit = 'years';
        }else if(years == 0 && months != 0 && weeks == 0 && days == 0){
            this.formData.delayTimeNumber = months;
            this.formData.delayTimeUnit = 'months';
        }else if(years == 0 && months == 0 && weeks != 0 && days == 0){
            this.formData.delayTimeNumber = weeks;
            this.formData.delayTimeUnit = 'weeks';
        }else if(years == 0 && months == 0 && weeks == 0 && days != 0){
            this.formData.delayTimeNumber = days;
            this.formData.delayTimeUnit = 'days';
        }else{
            this.formData.delayTimeNumber = 365 * years + 30 * months + 7 * weeks + days;
            this.formData.delayTimeUnit = 'days';
        }
    }
    
    //获取审批详情
    getApplyDetail(obj) {
        //没有角色的时候，显示模态框，重置
        this.rolesNotSettingModalDialog = {
            show: false,
            appNames: [],
            continueSubmit: false
        };
        if(obj.error) {
            this.detailInfoObj.loadingResult = 'error';
            this.detailInfoObj.info = {};
            this.detailInfoObj.errorMsg = obj.errorMsg;
        } else {
            this.detailInfoObj.loadingResult = '';
            const info = obj.detail;
            _.each(info.apps || [] , (app) => {
                app.app_id = app.client_id;
                app.app_name = app.client_name;
            });
            this.detailInfoObj.info = info;
            this.detailInfoObj.info = obj.detail;
            this.detailInfoObj.errorMsg = '';
            this.createAppsSetting();
            if(_.isArray(this.detailInfoObj.info.user_names)) {
                this.formData.user_name = this.detailInfoObj.info.user_names[0];
            }
            if(_.isArray(this.detailInfoObj.info.nick_names)) {
                this.formData.nick_name = this.detailInfoObj.info.nick_names[0];
            }
            let delayTime = 0;
            if(this.detailInfoObj.info.type == 'apply_grant_delay'){
                if (this.detailInfoObj.info.delayTime) { // 同步修改时间
                    delayTime = this.detailInfoObj.info.delayTime;
                    this.formData.delay_time = delayTime;
                    this.getDelayDisplayTime(delayTime);
                } else { // 到期时间，点开修改同步到自定义
                    this.formData.delayTimeUnit = 'custom';
                    this.formData.end_date = this.detailInfoObj.info.end_date;
                }
            }
        }
    }
    //生成应用的单独配置
    createAppsSetting() {
        //申请的应用列表
        const apps = this.detailInfoObj.info.apps;
        _.each(apps , (appInfo) => {
            const app_id = appInfo.app_id;
            const tags = appInfo.tags || [];

            let start_time = appInfo.begin_date || 0,
                end_time = appInfo.end_date || 0,
                range;

            if(appInfo.end_date === '0' || appInfo.end_date === 0) {
                range = 'forever';
            } else {
                var startMoment = moment(new Date(+start_time));
                var endMoment = moment(new Date(+end_time));
                startMoment.hours(0).minutes(0).seconds(0).milliseconds(0);
                endMoment.hours(0).minutes(0).seconds(0).milliseconds(0);
                var rangeDiffMonth = endMoment.diff(startMoment , 'months') + '';
                if(['1','6','12'].indexOf(rangeDiffMonth) >= 0 && startMoment.format('D') === endMoment.format('D')) {
                    range = rangeDiffMonth + 'm';
                } else {
                    //判断天数，是7天(一周)还是15天(半个月)
                    var rangeDiffDays = endMoment.diff(startMoment , 'days') + '';
                    if(rangeDiffDays === '7') {
                        range = '1w';
                    } else if(rangeDiffDays === '15'){
                        range = '0.5m';
                    } else {
                        range = 'custom';
                    }
                }
            }
            this.appsSetting[app_id] = {
                //开通个数
                number: 'number' in appInfo ? appInfo.number : 1,
                //到期停用
                over_draft: 'over_draft' in appInfo ? appInfo.over_draft + '' : '1',
                //时间
                time: {
                    start_time: start_time,
                    end_time: end_time,
                    range: range
                },
                //角色
                roles: appInfo.roles || [],
                //权限
                permissions: appInfo.permissions || []
            };
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
        if(this.selectedDetailItem.isConsumed == 'true') {
            this.detailBottomDisplayType = 'formtext';
        } else {
            this.detailBottomDisplayType = 'btn';
        }
    }
    //提交审批
    submitApply(obj) {
        if(obj.loading) {
            this.applyResult.submitResult = 'loading';
            this.applyResult.errorMsg = '';
        } else if(obj.error) {
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
    toggleApplyExpanded(bool) {
        this.applyIsExpanded = bool;
    }
    //设置用户名是否为编辑状态
    setUserNameEdit(type) {
        this.isUserEdit = type;
    }
    //保存用户名
    saveUserName(name) {
        if (name != this.detailInfoObj.info.user_names[0]) {
            this.detailInfoObj.info.user_names[0] = name;
            this.isChangeUserName = true;
        }
        
    }
    cancelUserName() {
        this.formData.user_name = this.detailInfoObj.info.user_names[0];
    }
    //显示用户详情右侧面板
    showUserDetail(userId) {
        //是否显示右侧面板
        this.showRightPanel = true;
        //右侧面板显示用户详情的userId
        this.rightPanelUserId = userId;
        //客户id为空
        this.rightPanelCustomerId = '';
        // 应用appId为空
        this.rightPanelAppConfig = '';
    }
    //显示客户详情右侧面板
    showCustomerDetail(customerId) {
        //是否显示右侧面板
        this.showRightPanel = true;
        //右侧面板显示用户详情的customerId
        this.rightPanelCustomerId = customerId;
        //用户id为空
        this.rightPanelUserId = '';
        // 应用appId为空
        this.rightPanelAppConfig = '';
    }
    // 显示应用没有默认的权限和角色的右侧面板
    showAppConfigPanel(app){
        //是否显示右侧面板
        this.showRightPanel = true;
        this.rightPanelAppConfig = app;
        //右侧面板显示用户详情的customerId为空
        this.rightPanelCustomerId = '';
        //用户id为空
        this.rightPanelUserId = '';
    }
    // 应用配置取消保存
    handleCancel(){
        this.showRightPanel = false;
        this.rightPanelAppConfig = '';
        this.addUserTypeConfigInfoShow = false;
    }
    // 应用配置保存成功时
    handleSaveAppConfig(){
        this.showRightPanel = false;
        this.rightPanelAppConfig = '';
        this.addUserTypeConfigInfoShow = false;
    }
    showAppConfigRightPanle(){
        this.addUserTypeConfigInfoShow = true;
    }
    //关闭右侧面板
    closeRightPanel() {
        //是否显示右侧面板
        this.showRightPanel = false;
        //右侧面板显示用户详情的userId
        this.rightPanelUserId = '';
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
        if (this.formData.delayTimeUnit != 'custom') {
            this.formData.delay_time = delay;
            this.formData.end_date = moment().add('days',1).valueOf();
        } else {
            this.formData.end_date = delay;
            this.formData.delay_time = '';
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
            this.formData.end_date = moment().add('days',1).valueOf();
            this.getDelayDisplayTime(delayTime);
        } else {
            this.formData.delayTimeUnit = 'custom';
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
        if(resultObj.loading) {
            replyListInfo.result = 'loading';
            replyListInfo.list = [];
            replyListInfo.errorMsg = '';
        } else if(resultObj.error) {
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
        if(this.replyFormInfo.result === 'success') {
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
        if(resultObj.loading) {
            replyFormInfo.result = 'loading';
            replyFormInfo.errorMsg = '';
        } else if(resultObj.error) {
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
        if(this.replyFormInfo.result === 'success') {
            //回复表单重置
            this.replyFormInfo = {
                result: '',
                errorMsg: ''
            };
        }
    }
    //获取成员信息，使用其中的logo属性
    getUserLogo(userInfo) {
        //获取到reply列表
        var list = this.replyListInfo.list;
        //已经获取的用户id
        var target_user_id = userInfo.user_id;
        //遍历reply列表，找到user_id与获取user_id相同的，赋予user_logo
        _.each(list , (reply) => {
            if(reply.user_id === target_user_id) {
                reply.user_logo = userInfo.user_logo;
            }
        });
    }
    
    //设置角色的模态框是显示还是隐藏
    setRolesNotSettingModalDialog({show,appNames}) {
        this.rolesNotSettingModalDialog.show = show;
        this.rolesNotSettingModalDialog.appNames = appNames;
    }
    //没有设置角色，但是仍然提交
    rolesNotSettingContinueSubmit() {
        this.rolesNotSettingModalDialog.continueSubmit = true;
        this.rolesNotSettingModalDialog.show = false;
        this.rolesNotSettingModalDialog.appNames = [];
    }
}

//使用alt导出store
export default alt.createStore(ApplyViewDetailStore , 'ApplyViewDetailStoreV2');