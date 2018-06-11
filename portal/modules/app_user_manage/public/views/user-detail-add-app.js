const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
var RightPanelClose = require('../../../../components/rightPanel').RightPanelClose;
var RightPanelCancel = require('../../../../components/rightPanel').RightPanelCancel;
var RightPanelSubmit = require('../../../../components/rightPanel').RightPanelSubmit;
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
//app选择器，能选择权限
var AppSelector = require('../../../../components/app-selector/app-selector');
var AppRolePermission = require('../../../../components/user_manage_components/app-role-permission');
var passwdStrengthFile = require('../../../../components/password-strength-bar');
var PasswdStrengthBar = passwdStrengthFile.PassStrengthBar;

var AppUserUtil = require('../util/app-user-util');
var AppUserAction = require('../action/app-user-actions');
var AppUserStore = require('../store/app-user-store');
var AppUserDetailAction = require('../action/app-user-detail-actions');
var AppUserPanelSwitchAction = require('../action/app-user-panelswitch-actions');
var UserDetailAddAppAction = require('../action/user-detail-add-app-actions');
import UserDetailAddAppStore from '../store/user-detail-add-app-store';

var CustomRadioGroup = require('../../../../components/custom_radio_group');
import DateSelector from '../../../../components/date-selector';
var crypto = require('crypto');
var Tabs = require('antd').Tabs;
var TabPane = Tabs.TabPane;
var Form = require('antd').Form;
var FormItem = Form.Item;
var Input = require('antd').Input;
var InputNumber = require('antd').InputNumber;
var Select = require('antd').Select;
var Option = Select.Option;
import { DatePicker } from 'antd';
import FieldMixin from '../../../../components/antd-form-fieldmixin';
var Radio = require('antd').Radio;
var RadioGroup = Radio.Group;
var AlertTimer = require('../../../../components/alert-timer');
var Icon = require('antd').Icon;
var Alert = require('antd').Alert;
var privilegeChecker = require('../../../../components/privilege/checker');
var AutosizeTextarea = require('../../../../components/autosize-textarea');
var language = require('../../../../public/language/getLanguage');

var LAYOUT_CONSTANTS = $.extend({} , AppUserUtil.LAYOUT_CONSTANTS);//右侧面板常量
LAYOUT_CONSTANTS.BOTTOM_DELTA = 82;

var labelCol = {span: 4};
var wrapperCol = {span: 11};

var CustomerSuggest = require('./customer_suggest/customer_suggest');
const SELECT_CUSTOM_TIME_TYPE = 'custom';

var UserDetailAddApp = React.createClass({
    getDefaultProps: function() {
        return {
            //初始用户
            initialUser: {}
        };
    },
    closeRightPanel: function() {
        AppUserDetailAction.dismiss();
        AppUserPanelSwitchAction.resetState();
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
        AppUserAction.closeRightPanel();
        UserDetailAddAppAction.resetState();
    },
    md5: function(value) {
        var md5Hash = crypto.createHash('md5');
        md5Hash.update(value);
        return md5Hash.digest('hex');
    },
    getDelayTimeMillis: function() {
        //延期周期
        var delayTimeRange = this.state.formData.delayTimeRange;
        var delayTimeNumber = this.state.formData.delayTimeNumber;
        var millis = moment.duration(+delayTimeNumber , delayTimeRange).valueOf();
        return millis;
    },
    handleSubmit: function(e) {
        e.preventDefault();
        var formData = this.state.formData || {};
        var batchSelectedApps = this.state.formData.batchSelectedApps;
        var _this = this;
        var result = {};
        var userList = this.props.initialUser;
        var userIds = userList.map(function(obj) {
            return obj.user.user_id;
        });
        result.user_ids = userIds;
        //额外信息，批量操作推送过来之后，更新界面使用的数据
        var extra = {};
        var selectedAppId = '';
        var isSales = privilegeChecker.hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.SALES);
        //真正提交逻辑
        function submit() {
            //申请修改密码
            if(_this.hasSalesChangePasswordBlock()) {
                result.remark = _this.state.formData.remark.passwordRemark;
            }
            //销售申请修改应用状态
            if(_this.hasSalesApplyStatusBlock()) {
                result.status = formData.user_status;
                result.remark = formData.remark.statusRemark;
            }
            //添加申请延期块
            if(_this.state.multipleSubType === 'grant_delay') {
                //向data中添加delay字段
                if (formData.delayTimeRange === SELECT_CUSTOM_TIME_TYPE) {
                    result.end_date = formData.delayDeadlineTime;
                } else {
                    let delayMillis = _this.getDelayTimeMillis();
                    result.delay = delayMillis;
                }

                //向data中添加备注
                result.remark = _this.state.formData.remark.delayRemark;
                //到期是否停用
                result.over_draft = formData.over_draft;
                //销售的要构造发邮件数据
                if(isSales){
                    //申请审批的，需要传入用户名，客户，应用名，发邮件时候使用
                    //向后端传递email_customer_names,email_app_names,email_user_names，发邮件使用
                    var appUserList = AppUserStore.getState().appUserList;
                    //选中的用户
                    var selectedUsers = _.filter(appUserList , (obj) => {
                        return userIds.indexOf(obj.user.user_id) >= 0;
                    });
                    //客户名 用户名
                    var email_customer_names = [],
                        email_user_names = [];
                    _.each(selectedUsers , (obj) => {
                        var customer_name = obj.customer.customer_name;
                        email_customer_names.push(customer_name);
                        var user_name = obj.user.user_name;
                        email_user_names.push(user_name);
                    });
                    //添加应用名
                    var email_app_names = [];
                    var appList = AppUserStore.getState().appList;
                    //批量遍历应用，添加应用名
                    _.each(batchSelectedApps , (app_id) => {
                        var targetApp = _.find(appList , (item) => app_id === item.app_id);
                        email_app_names.push(
                            targetApp ? targetApp.app_name : ''
                        );
                    });
                    //添加邮箱使用的字段
                    result.email_customer_names = email_customer_names.join('、');
                    result.email_app_names = email_app_names.join('、');
                    result.email_user_names = email_user_names.join('、');
                }
            }
            //添加应用块
            if(_this.hasApplyAppBlock()) {
                //开户产品，key是产品id，value为产品名
                var products = {};
                //添加权限和角色
                formData.selected_apps.forEach(function(item) {
                    products[item.app_id] = {
                        roles: item.roles,
                        permissions: item.permissions
                    };
                });
                products = JSON.stringify(products);
                result.products = products;
            }
            //开通类型块
            if(_this.hasApplyTypeBlock()) {
                //开户类型
                var userType = formData.user_type;
                if (Oplate.hideSomeItem) {
                    userType = '正式用户';
                }
                result.user_type = userType;
            }
            if(_this.hasApplyTimeBlock()) {
                //开通时间
                var startTime = formData.start_time;
                //到期时间
                var endTime = formData.end_time;
                result.start_time = startTime;
                result.end_time = endTime;
            }
            if(_this.hasApplyStatusBlock()) {
                //到期是否停用
                var overDraft = formData.over_draft;
                //账号状态
                var status = formData.user_status;
                result.over_draft = overDraft;
                result.status = status;
            }
            if(_this.hasChangePassword()) {
                var password = formData.password;
                result.password = _this.md5(password);
            }
            if(_this.hasCustomerBlock()) {
                result.customer_id = formData.choosen_customer.id;
                var origin_customer_ids = userList.map(function(item) {
                    var customer_id = (item && item.customer && item.customer.customer_id) || '';
                    return customer_id;
                });
                result.origin_customer_ids = JSON.stringify(origin_customer_ids);
                //额外信息中保存 “客户名”、“销售名”
                extra.customer_name = formData.choosen_customer.name;
                extra.sales_name = formData.choosen_customer_sales.name;
                extra.sales_id = formData.choosen_customer_sales.id;
            }
            //修改角色、权限
            if(_this.hasRolesBlock()) {
                result.roles = JSON.stringify(formData.roles);
                result.permissions = JSON.stringify(formData.permissions);
            }
            //调用action进行更新
            UserDetailAddAppAction.submitAddApp({
                data: result,
                selectedAppId: selectedAppId,
                subType: _this.state.multipleSubType,
                isSales: privilegeChecker.hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.SALES),
                extra: extra
            });
        }
        //开通类型、开通状态、开通周期、批量延期需要选择应用
        if((
            //批量延期
            this.hasDelayTimeBlock() ||
            //批量修改开通类型
            this.hasApplyTypeBlock() ||
            //批量修改开通状态
            this.hasApplyStatusBlock() ||
            //批量修改开通周期
            this.hasApplyTimeBlock() ||
            //销售修改开通状态
            this.hasSalesApplyStatusBlock()
            //不是开通产品
        ) && !this.hasApplyAppBlock()) {
            selectedAppId = JSON.stringify(this.state.formData.batchSelectedApps);
            //如果没有选择应用，则提示错误
            if(!this.state.formData.batchSelectedApps.length) {
                var appNotSelected = this.getBatchAppJsonList();
                if(!appNotSelected.length) {
                    UserDetailAddAppAction.setBatchSelectedAppError( Intl.get('user.select.user.tip', '请在用户列表中选择用户'));
                } else {
                    UserDetailAddAppAction.setBatchSelectedAppError( Intl.get('user.app.select.please', '请选择应用'));
                }
                return;
            }
        }
        // 权限设置，需要选择角色
        if(this.hasRolesBlock()) {
            selectedAppId = this.state.formData.rolePermissionApp;
            if(!selectedAppId) {
                UserDetailAddAppAction.setRolePermissionSelectedAppError(true);
                return;
            }
            // 没有选择角色，则提示错误
            if(!this.state.formData.roles.length) {
                UserDetailAddAppAction.batchChangePermissionNoSelectRoleError(Intl.get('user.role.select.tip', '至少选择一个角色'));
                return;
            } else {
                UserDetailAddAppAction.batchChangePermissionNoSelectRoleError('');
            }
        }
        //开通产品需要选择应用
        if(this.hasApplyAppBlock()) {
            var selected_apps = formData.selected_apps || [];
            if(!selected_apps.length) {
                UserDetailAddAppAction.showAppError();
                return;
            }
        }
        //所属客户需要选择客户
        if(this.hasCustomerBlock()) {
            if(!formData.choosen_customer.id) {
                UserDetailAddAppAction.showCustomerError();
                return;
            }
        }
        //修改密码要验证表单再提交
        if(this.hasChangePassword()) {
            var validation = this.refs.validation;
            validation.validate(function(valid) {
                if (!valid) {
                    return;
                }
                submit();
            });
        } else {
            submit();
        }
    },
    cancel: function() {
        UserDetailAddAppAction.resetState();
        AppUserAction.closeRightPanel();
    },
    addApp: function(app) {
        UserDetailAddAppAction.addApp(app);
    },
    removeApp: function(app) {
        UserDetailAddAppAction.removeApp(app);
    },
    customRadioValueChange: function(field, value) {
        UserDetailAddAppAction.customRadioValueChange({field, value});
    },
    end_time_disable_date: function(current) {
        return (current && current.getTime() < moment(this.state.formData.start_time).toDate().getTime());
    },
    start_time_disable_date: function(current) {
        return current && current.getTime() > moment(this.state.formData.end_time).toDate().getTime();
    },
    radioValueChange: function(field, event) {
        var value = event.target.value;
        UserDetailAddAppAction.radioValueChange({field, value});
    },
    onWindowResize: function() {
        this.setState({});
    },
    //选中的行变了之后，检查已经选中的批量应用列表，
    checkSelectedBatchAppList: function(currentRows) {
        if(currentRows.length) {
            UserDetailAddAppAction.setBatchSelectedAppError(false);
        } else {
            UserDetailAddAppAction.setBatchSelectedAppError( Intl.get('user.select.user.tip', '请在用户列表中选择用户'));
        }
        //当前能够选中的应用列表
        var currentAppIdList = _.map(this.getBatchAppJsonList() , 'app_id');
        //已经选中的应用列表
        var selectedAppIdList = this.state.formData.batchSelectedApps;
        //查看是否需要移除一部分不能选择的数据
        var newSelectedAppIdList = _.filter(selectedAppIdList , (appId) => {
            return currentAppIdList.indexOf(appId) >= 0;
        });
        //如果过滤完了之后，发现应用变了，则使用新的数据
        if(newSelectedAppIdList.join(',') !== selectedAppIdList.join(',')) {
            UserDetailAddAppAction.batchAppChange(newSelectedAppIdList);
        }
    },
    componentDidMount: function() {
        UserDetailAddAppStore.listen(this.onStoreChange);
        UserDetailAddAppAction.getApps();
        $(window).on('resize' , this.onWindowResize);
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.SELECTED_USER_ROW_CHANGE , this.checkSelectedBatchAppList);
        //能够选择的批量应用
        var batchAppsToSelect = this.getBatchAppJsonList();
        //当界面显示出来之后，设置默认选中的应用列表
        UserDetailAddAppAction.setDefaultBatchSelectedApps(batchAppsToSelect);

    },
    componentWillUnmount: function() {
        UserDetailAddAppStore.unlisten(this.onStoreChange);
        $(window).off('resize' , this.onWindowResize);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.SELECTED_USER_ROW_CHANGE , this.checkSelectedBatchAppList);
    },
    mixins: [FieldMixin],
    getInitialState: function() {
        return UserDetailAddAppStore.getState();
    },
    onStoreChange: function() {
        this.setState(UserDetailAddAppStore.getState());
    },
    renderIndicator: function() {
        if(this.state.submitResult === 'loading') {
            return (
                <Icon type="loading" />
            );
        }
        var hide = function() {
            UserDetailAddAppAction.hideSubmitTip();
        };
        if(this.state.submitResult === 'success') {
            return (
                <AlertTimer time={3000} message={Intl.get('user.operate.success', '操作成功')} type="success" showIcon onHide={hide}/>
            );
        }
        if(this.state.submitResult === 'error') {
            return (
                <AlertTimer time={3000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide}/>
            );
        }
        return null;
    },
    getAppNotSelected: function(full_list , selected_list) {
        full_list = full_list || [];
        selected_list = selected_list || [];

        var selected_map = _.groupBy(selected_list , 'app_id');

        var result = _.filter(full_list , function(app) {
            if(!selected_map[app.app_id]) {
                return true;
            }
        });

        return result;
    },
    batchTabChange: function(selectedTab) {
        UserDetailAddAppAction.changeMultipleSubType(selectedTab);
    },
    //grant_application
    //grant_type
    //grant_status
    //grant_period
    //是否添加应用
    hasApplyAppBlock: function() {
        if(this.state.multipleSubType === 'grant_application') {
            return true;
        } else {
            return false;
        }
    },
    //是否有修改密码
    hasChangePassword: function() {
        if(this.state.multipleSubType === 'change_password') {
            return true;
        } else {
            return false;
        }
    },
    //是否有开通类型
    hasApplyTypeBlock: function() {
        if(this.state.multipleSubType === 'grant_application' || this.state.multipleSubType === 'grant_type') {
            return true;
        } else {
            return false;
        }
    },
    //是否有开通周期
    hasApplyTimeBlock: function() {
        if(this.state.multipleSubType === 'grant_application' || this.state.multipleSubType === 'grant_period') {
            return true;
        } else {
            return false;
        }
    },
    //是否有开通状态
    hasApplyStatusBlock: function() {
        if(this.state.multipleSubType === 'grant_application' || this.state.multipleSubType === 'grant_status') {
            return true;
        } else {
            return false;
        }
    },
    //是否有销售申请开通状态
    hasSalesApplyStatusBlock: function() {
        if(this.state.multipleSubType === 'sales_grant_status') {
            return true;
        } else {
            return false;
        }
    },
    //是否有销售申请修改密码
    hasSalesChangePasswordBlock: function() {
        if(this.state.multipleSubType === 'sales_change_password') {
            return true;
        } else {
            return false;
        }
    },
    //获取tab的padding
    getTabPadding: function() {
        if(privilegeChecker.hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.ADMIN)) {
            return 6;
        } else {
            return 14;
        }
    },
    //渲染批量操作的tab
    renderTabForBatch: function() {
        var hasPrivilege = privilegeChecker.hasPrivilege;
        var selectUserCount = AppUserStore.getState().selectUserCount;
        var subType = this.state.multipleSubType;
        var options = [];
        var isAdmin = hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.ADMIN);
        //针对管理员做判断
        if(isAdmin) {
            //批量开通、修改应用
            if(hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.BATCH_GRANT_APPLICATION)) {
                options.push({name: Intl.get('user.batch.app.open', '开通产品'),value: 'grant_application'});
            }
            //批量修改密码
            if(hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.BATCH_UPDATE_USER_PASSWORD)) {
                options.push({name: Intl.get('common.edit.password', '修改密码'),value: 'change_password'});
            }
            //批量修改类型
            if(hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.BATCH_UPDATE_GRANT_TYPE)) {
                options.push({name: Intl.get('user.batch.open.type', '开通类型'),value: 'grant_type'});
            }
            //批量修改开通状态
            if(hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.BATCH_UPDATE_GRANT_STATUS)) {
                options.push({name: Intl.get('common.app.status', '开通状态'),value: 'grant_status'});
            }
            //批量修改开通时间
            if(hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.BATCH_UPDATE_GRANT_PERIOD)) {
                options.push({name: Intl.get('user.open.cycle', '开通周期'),value: 'grant_period'});
            }
            //批量修改用户所属客户
            if(hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.BATCH_UPDATE_USER_CUSTOMER)) {
                options.push({name: Intl.get('common.belong.customer', '所属客户'),value: 'grant_customer'});
            }
            //批量修改角色、权限
            if(hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.BATCH_UPDATE_GRANT_ROLES)) {
                options.push({name: Intl.get('user.batch.auth.set', '权限设置'),value: 'grant_roles'});
            }
        }

        if(this.hasDelayTimeTab()) {
            if(isAdmin) {
                if(hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.BATCH_UPDATE_GRANT_DELAY)) {
                    options.push({name: Intl.get('user.batch.delay', '批量延期') , value: 'grant_delay'});
                }
            } else {
                options.push({name: Intl.get('user.batch.apply.delay', '申请延期') , value: 'grant_delay'});
            }
        }
        if(!isAdmin) {
            options.push({name: Intl.get('common.app.status', '开通状态'),value: 'sales_grant_status'});
            options.push({name: Intl.get('common.edit.password', '修改密码'),value: 'sales_change_password'});
        }
        return (
            <div className="user-batch-operator-style">
                <div className="selected-number">
                    <ReactIntl.FormattedMessage
                        id="user.batch.selected.num"
                        defaultMessage={'已选择{num}个用户'}
                        values={{'num': <span className="the-number">{selectUserCount}</span>}}
                    />
                </div>
                <dl className="dl-horizontal">
                    <dt><ReactIntl.FormattedMessage id="user.batch.change.type" defaultMessage="变更类型" /></dt>
                    <dd className="batch-update-tabs">
                        <CustomRadioGroup
                            options={options}
                            value={subType}
                            marginRight={4}
                            padding={this.getTabPadding()}
                            onChange={this.batchTabChange}
                        />
                    </dd>
                </dl>
            </div>
        );
    },
    selectedAppChange: function(selected_apps) {
        UserDetailAddAppAction.setSelectedApps(selected_apps);

    },
    onScrollBarHeightChange: function() {
        if(this.refs.gemini) {
            this.refs.gemini.update();
        }
    },
    renderAppsBlock: function(belong) {
        if(!this.hasApplyAppBlock()) {
            return null;
        }
        var appNotSelected = this.state.app_list;
        var formData = this.state.formData;
        var app_selector_id = _.uniqueId('app_selector');
        return (
            <div className="ant-form-item">
                <label className="col-4"><ReactIntl.FormattedMessage id="common.add.app" defaultMessage="添加应用" /></label>
                <div className="col-20">
                    <div ref="app_selector_wrap" data-ref="app_selector_wrap" className={this.state.show_app_error ? 'app_selector_wrap permission-required' : 'app_selector_wrap'}>
                        <AppSelector
                            size={60}
                            totalApps={appNotSelected}
                            selectedApps={formData.selected_apps}
                            onChange={this.selectedAppChange}
                            container={this.refs.app_selector_wrap}
                            showPermission={true}
                            uniqueId={app_selector_id}
                            onHeightChange={this.onScrollBarHeightChange}
                        />
                        {
                            this.state.show_app_error && !formData.selected_apps.length ?
                                (
                                    <div className="has-error"><span className="ant-form-explain"><ReactIntl.FormattedMessage id="user.app.select.please" defaultMessage="请选择应用" /></span></div>
                                ) :
                                null
                        }
                    </div>
                </div>
            </div>
        );
    },

    //检验密码
    checkPass: function(rule, value, callback) {
        if (value && value.match(passwdStrengthFile.passwordRegex)) {
            //获取密码强度及是否展示
            var passStrengthObj = passwdStrengthFile.getPassStrenth(value);
            this.setState({
                passBarShow: passStrengthObj.passBarShow,
                passStrength: passStrengthObj.passStrength
            });
            if (this.state.formData.password) {
                this.refs.validation.forceValidate(['repassword']);
            }
            callback();
        } else {
            this.setState({
                passBarShow: false,
                passStrength: 'L'
            });
            callback(Intl.get('common.password.validate.rule', '请输入6-18位数字、字母、符号组成的密码'));
        }
    },
    checkPass2: function(rule, value, callback) {
        if (value && value !== this.state.formData.password) {
            callback( Intl.get('common.password.unequal', '两次输入密码不一致！'));
        } else {
            callback();
        }
    },
    //渲染修改密码
    renderChangePassword: function() {
        if(!this.hasChangePassword()) {
            return null;
        }
        var formData = this.state.formData;
        var status = this.state.status;
        return (
            <div>
                <input type="password" name="password" style={{display: 'none'}}/>
                <FormItem
                    label={Intl.get('common.password', '密码')}
                    id="password1"
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                    validateStatus={this.renderValidateStyle('password')}
                    hasFeedback
                    help={status.password.errors ? status.password.errors.join(',') : null}
                >
                    <Validator
                        rules={[{validator: this.checkPass}]}
                    >
                        <Input
                            name="password"
                            id="password1"
                            type="password"
                            autoComplete="off"
                            value={formData.password}
                            placeholder={Intl.get('common.password.compose.rule', '6-18位字符(由数字，字母，符号组成)')}
                        />
                    </Validator>
                </FormItem>
                {
                    this.state.passBarShow ?
                        (
                            <div className="clearfix pass-strength-wrap">
                                <div className="col-4">&nbsp;</div>
                                <div className="col-20">
                                    <PasswdStrengthBar passStrength={this.state.passStrength}/>
                                </div>
                            </div>
                        ) :
                        null
                }
                <FormItem
                    label={Intl.get('common.confirm.password', '确认密码')}
                    id="password2"
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                    validateStatus={this.renderValidateStyle('repassword')}
                    hasFeedback
                    help={status.repassword.errors ? status.repassword.errors.join(',') : null}
                >
                    <Validator
                        rules={[
                            {required: true,whitespace: true,message: Intl.get('common.password.unequal', '两次输入密码不一致！')},
                            {validator: this.checkPass2}
                        ]}
                    >
                        <Input
                            name="repassword"
                            id="password2"
                            type="password"
                            autoComplete="off"
                            value={formData.repassword}
                            placeholder={Intl.get('common.input.confirm.password', '请输入确认密码')}
                            maxLength={18}
                        />
                    </Validator>
                </FormItem>
            </div>
        );
    },
    //渲染开通类型
    renderApplyType: function() {
        if(!this.hasApplyTypeBlock()) {
            return null;
        }
        var formData = this.state.formData;
        var options = _.map(AppUserUtil.USER_TYPE_VALUE_MAP , (value,KEY) => {
            return {
                name: AppUserUtil.USER_TYPE_TEXT_MAP[KEY],
                value: value
            };
        });
        return (
            <div>
                {this.renderMultiAppSelectBlock()}
                { !Oplate.hideSomeItem &&
                <FormItem
                    label={Intl.get('user.batch.open.type', '开通类型')}
                    labelCol={labelCol}
                    wrapperCol={{span: ((language.lan() === 'es' || language.lan() === 'en') ? 18 : 16)}}
                >
                    <CustomRadioGroup
                        options={options}
                        value={formData.user_type}
                        marginRight={14}
                        onChange={this.customRadioValueChange.bind(this,'user_type')}
                    />
                </FormItem>}
            </div>

        );
    },
    delayTimeChange: function(value) {
        UserDetailAddAppAction.delayTimeChange(value);
    },
    dateChange: function(start_time,end_time,range) {
        UserDetailAddAppAction.timeChange({start_time,end_time,range});
    },
    //渲染开通时间
    renderApplyTime: function() {
        if(!this.hasApplyTimeBlock()) {
            return null;
        }
        var formData = this.state.formData;
        return (
            <div>
                {this.renderMultiAppSelectBlock()}
                <FormItem
                    label={Intl.get('user.open.cycle', '开通周期')}
                    labelCol={labelCol}
                    wrapperCol={{span: 20}}
                >
                    <DateSelector
                        disableDateBeforeRange={true}
                        disableDateBeforeToday={true}
                        endTimeEndOfDay={false}
                        getEndTimeTip={function(date){return Intl.get('user.open.cycle.date.tip','将在{date}的0点到期',{'date': date});}}
                        range={formData.range}
                        onSelect={this.dateChange}>
                        <DateSelector.Option value="1w"><ReactIntl.FormattedMessage id="user.time.one.week" defaultMessage="1周" /></DateSelector.Option>
                        <DateSelector.Option value="0.5m"><ReactIntl.FormattedMessage id="user.time.half.month" defaultMessage="半个月" /></DateSelector.Option>
                        <DateSelector.Option value="1m"><ReactIntl.FormattedMessage id="user.time.one.month" defaultMessage="1个月" /></DateSelector.Option>
                        <DateSelector.Option value="6m"><ReactIntl.FormattedMessage id="user.time.six.month" defaultMessage="6个月" /></DateSelector.Option>
                        <DateSelector.Option value="12m"><ReactIntl.FormattedMessage id="user.time.twelve.month" defaultMessage="12个月" /></DateSelector.Option>
                        <DateSelector.Option value="forever"><ReactIntl.FormattedMessage id="common.time.forever" defaultMessage="永久" /></DateSelector.Option>
                        <DateSelector.Option value="custom"><ReactIntl.FormattedMessage id="user.time.custom" defaultMessage="自定义" /></DateSelector.Option>
                    </DateSelector>
                </FormItem>
            </div>
        );
    },
    //渲染开通状态
    renderApplyStatus: function() {
        if(!this.hasApplyStatusBlock()) {
            return null;
        }
        var formData = this.state.formData;
        return (
            <div>
                {this.renderMultiAppSelectBlock()}
                <FormItem
                    label={Intl.get('user.expire.select', '到期可选')}
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                >
                    <RadioGroup onChange={this.radioValueChange.bind(this , 'over_draft')}
                        value={formData.over_draft}>
                        <Radio key="1" value="1"><ReactIntl.FormattedMessage id="user.status.stop" defaultMessage="停用" /></Radio>
                        <Radio key="2" value="2"><ReactIntl.FormattedMessage id="user.status.degrade" defaultMessage="降级" /></Radio>
                        <Radio key="0" value="0"><ReactIntl.FormattedMessage id="user.status.immutability" defaultMessage="不变" /></Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem
                    label={Intl.get('common.app.status', '开通状态')}
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                >
                    <RadioGroup onChange={this.radioValueChange.bind(this , 'user_status')}
                        value={formData.user_status}>
                        <Radio key="1" value="1"><ReactIntl.FormattedMessage id="common.app.status.open" defaultMessage="开启" /></Radio>
                        <Radio key="0" value="0"><ReactIntl.FormattedMessage id="common.app.status.close" defaultMessage="关闭" /></Radio>
                    </RadioGroup>
                </FormItem>
            </div>
        );
    },
    //销售申请重置密码
    renderSalesChangePassword: function() {
        if(!this.hasSalesChangePasswordBlock()) {
            return null;
        }
        var formData = this.state.formData;
        return (
            <div>
                <FormItem
                    label={Intl.get('common.remark', '备注')}
                    labelCol={labelCol}
                    wrapperCol={{span: 13}}
                >
                    <AutosizeTextarea
                        rows="5"
                        onChange={this.remarkChange.bind(this , 'passwordRemark')}
                        value={this.state.formData.remark.passwordRemark}
                    />
                </FormItem>
            </div>
        );
    },
    //销售申请启用、停用
    renderSalesApplyStatus: function() {
        if(!this.hasSalesApplyStatusBlock()) {
            return null;
        }
        var formData = this.state.formData;
        return (
            <div>
                {this.renderMultiAppSelectBlock()}
                <FormItem
                    label={Intl.get('common.app.status', '开通状态')}
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                >
                    <RadioGroup onChange={this.radioValueChange.bind(this , 'user_status')}
                        value={formData.user_status}>
                        <Radio key="1" value="1"><ReactIntl.FormattedMessage id="common.app.status.open" defaultMessage="开启" /></Radio>
                        <Radio key="0" value="0"><ReactIntl.FormattedMessage id="common.app.status.close" defaultMessage="关闭" /></Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem
                    label={Intl.get('common.remark', '备注')}
                    labelCol={labelCol}
                    wrapperCol={{span: 13}}
                >
                    <AutosizeTextarea
                        rows="5"
                        onChange={this.remarkChange.bind(this , 'statusRemark')}
                        value={this.state.formData.remark.statusRemark}
                    />
                </FormItem>
            </div>
        );
    },
    hasCustomerBlock: function() {
        if(this.state.multipleSubType === 'grant_customer') {
            return true;
        } else {
            return false;
        }
    },
    onCustomerChoosen: function(resultObj) {
        UserDetailAddAppAction.onCustomerChoosen(resultObj);
        if(resultObj.customer.id) {
            UserDetailAddAppAction.hideCustomerError();
        }
    },
    //是否有申请延期的tab
    hasDelayTimeTab: function() {
        return privilegeChecker.hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.SALES) || privilegeChecker.hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.ADMIN);
    },
    //是否当前在申请延期/批量延期的tab下面
    hasDelayTimeBlock: function() {
        if(this.state.multipleSubType === 'grant_delay') {
            return true;
        } else {
            return false;
        }
    },
    //备注信息修改
    remarkChange: function(field,event) {
        UserDetailAddAppAction.remarkChange({
            field: field,
            value: event.target.value
        });
    },
    //延期时间范围改变
    delayTimeRangeChange: function(value,text) {
        UserDetailAddAppAction.delayTimeRangeChange(value);
    },
    //延期时间数字改变
    delayTimeNumberChange: function(value) {
        UserDetailAddAppAction.delayTimeNumberChange(value);
    },
    // 将延期时间设置为截止时间（具体到xx年xx月xx日）
    setDelayDeadlineTime(value) {
        let timestamp = value && value.valueOf() || '';
        UserDetailAddAppAction.setDelayDeadlineTime(timestamp);
    },
    // 设置不可选时间的范围
    disabledDate(current){
        return current && current.valueOf() < Date.now();
    },

    getBatchAppJsonList: function() {
        var userRowList = AppUserStore.getState().selectedUserRows;
        var userApps = _.chain(userRowList).pluck('apps').union().flatten().uniq((app) => app.app_id).map((app) => {
            return {app_id: app.app_id , app_name: app.app_name};
        }).value();
        return userApps;
    },
    //获取应用选项
    getBatchAppOptions: function() {
        var appList = this.getBatchAppJsonList();
        return _.map(appList , (app) => {
            return <Option key={app.app_id} value={app.app_id}>{app.app_name}</Option>;
        });
    },
    //批量应用改变
    batchAppChange: function(values) {
        UserDetailAddAppAction.batchAppChange(values);
    },
    renderBatchApps: function() {
        var batchApps = this.getBatchAppOptions();
        return (
            <Select
                multiple
                value={this.state.formData.batchSelectedApps}
                onChange={this.batchAppChange}
                ref="batchAppSelect"
                optionFilterProp="children"
                notFoundContent={!batchApps.length ? Intl.get('user.no.app', '暂无应用') : Intl.get('user.no.related.app', '无相关应用')}
                searchPlaceholder={Intl.get('user.app.select.please', '请选择应用')}
            >
                {batchApps}
            </Select>
        );
    },
    //渲染批量选择应用区域
    renderMultiAppSelectBlock: function() {
        if(this.state.multipleSubType === 'grant_application') {
            return null;
        }
        return (
            <div className="batch_app_select">
                <FormItem
                    label={Intl.get('common.app', '应用')}
                    labelCol={labelCol}
                    wrapperCol={{span: 20}}
                >
                    {this.renderBatchApps()}
                    {
                        this.state.batchSelectedAppError ? (
                            <div>
                                <Alert message={this.state.batchSelectedAppError} showIcon type="error"/>
                            </div>
                        ) : null
                    }
                </FormItem>
            </div>);
    },

    //申请延期
    renderDelayTime: function() {
        if(!this.hasDelayTimeBlock()) {
            return null;
        }
        var isSales = privilegeChecker.hasPrivilege(AppUserUtil.BATCH_PRIVILEGE.SALES);
        var divWidth = (language.lan() === 'zh') ? '80px' : '74px';
        let label = '';
        if (this.state.formData.delayTimeRange === SELECT_CUSTOM_TIME_TYPE) {
            label = Intl.get(' user.time.end', '到期时间');
        } else {
            label = Intl.get('common.delay.time', '延期时间');
        }
        return (
            <div>
                {this.renderMultiAppSelectBlock()}
                <div className="delay_time_form">
                    <FormItem
                        label={label}
                        labelCol={labelCol}
                        wrapperCol={{span: 20}}
                    >
                        {this.state.formData.delayTimeRange === SELECT_CUSTOM_TIME_TYPE ? (
                            <DatePicker placeholder={Intl.get('my.app.change.expire.time.placeholder', '请选择到期时间')}
                                onChange={this.setDelayDeadlineTime}
                                disabledDate={this.disabledDate}
                                defaultValue={moment(this.state.formData.delayDeadlineTime)}
                                allowClear={false}
                                showToday={false}
                            />
                        ) : (
                            <InputNumber
                                value={this.state.formData.delayTimeNumber}
                                onChange={this.delayTimeNumberChange}
                                style={{width: '80px',height: '30px'}}
                                min={1}
                                max={10000}
                            />
                        )}

                        <Select
                            value={this.state.formData.delayTimeRange}
                            style={{width: divWidth}}
                            onChange={this.delayTimeRangeChange}
                        >
                            <Option value="days"><ReactIntl.FormattedMessage id="common.time.unit.day" defaultMessage="天" /></Option>
                            <Option value="weeks"><ReactIntl.FormattedMessage id="common.time.unit.week" defaultMessage="周" /></Option>
                            <Option value="months"><ReactIntl.FormattedMessage id="common.time.unit.month" defaultMessage="月" /></Option>
                            <Option value="years"><ReactIntl.FormattedMessage id="common.time.unit.year" defaultMessage="年" /></Option>
                            <Option value="custom"><ReactIntl.FormattedMessage id="user.time.custom" defaultMessage="自定义" /></Option>
                        </Select>
                    </FormItem>
                </div>
                <FormItem
                    label={Intl.get('user.expire.select', '到期可选')}
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                >
                    <RadioGroup onChange={this.radioValueChange.bind(this , 'over_draft')}
                        value={this.state.formData.over_draft}>
                        <Radio key="1" value="1"><ReactIntl.FormattedMessage id="user.status.stop" defaultMessage="停用" /></Radio>
                        <Radio key="2" value="2"><ReactIntl.FormattedMessage id="user.status.degrade" defaultMessage="降级" /></Radio>
                        <Radio key="0" value="0"><ReactIntl.FormattedMessage id="user.status.immutability" defaultMessage="不变" /></Radio>
                    </RadioGroup>
                </FormItem>
                {/*申请延期要填备注，批量延期不需要填备注*/}
                {
                    isSales ? (
                        <FormItem
                            label={Intl.get('common.remark', '备注')}
                            labelCol={labelCol}
                            wrapperCol={{span: 13}}
                        >
                            <AutosizeTextarea
                                rows="5"
                                onChange={this.remarkChange.bind(this,'delayRemark')}
                                value={this.state.formData.remark.delayRemark}
                            />
                        </FormItem>
                    ) : null
                }
            </div>
        );
    },
    renderCustomer: function() {
        if(!this.hasCustomerBlock()) {
            return null;
        }
        return (
            <FormItem
                label={Intl.get('common.belong.customer', '所属客户')}
                labelCol={labelCol}
                wrapperCol={wrapperCol}
            >
                <CustomerSuggest
                    show_error={this.state.show_customer_error}
                    onCustomerChoosen={this.onCustomerChoosen}
                />
            </FormItem>
        );
    },
    hasRolesBlock: function() {
        if(this.state.multipleSubType === 'grant_roles') {
            return true;
        } else {
            return false;
        }
    },
    updateScrollBar: function() {
        this.refs.gemini && this.refs.gemini.update();
    },
    renderRolesBlock: function() {
        if(!this.hasRolesBlock()) {
            return null;
        }
        var selectedApp = this.state.formData.rolePermissionApp;
        var options = this.getBatchAppOptions();
        return (
            <div className="addapp_minor_items batch-role-permission">
                <FormItem
                    label={Intl.get('common.app', '应用')}
                    labelCol={labelCol}
                    wrapperCol={{span: 20}}
                >
                    <Select
                        placeholder={Intl.get('user.app.select.please', '请选择应用')}
                        value={selectedApp}
                        optionFilterProp="children"
                        notFoundContent={!options.length ? Intl.get('user.no.app', '暂无应用') : Intl.get('user.no.related.app', '无相关应用')}
                        onChange={UserDetailAddAppAction.rolePermissionAppChange}
                    >
                        {options}
                    </Select>
                    {
                        this.state.roleSelectedAppError ?
                            <div className="batch-role-permission-apps">
                                <Alert message={Intl.get('user.app.select.please', '请选择应用')} showIcon type="error"/>
                            </div> : null
                    }
                </FormItem>
                {
                    selectedApp ? <FormItem
                        label=""
                        labelCol={{span: 0}}
                        wrapperCol={{span: 24}}
                    >
                        <AppRolePermission
                            className="grant_roles"
                            app_id={selectedApp}
                            selectedRoles={this.state.formData.roles}
                            selectedPermissions={this.state.formData.permissions}
                            onRolesPermissionSelect={this.rolesPermissionsChange}
                            updateScrollBar={this.updateScrollBar}
                        />
                        {
                            this.state.batchSelectRoleError && !this.state.formData.roles.length ? (
                                <div className="batch-select-no-role">
                                    <Alert message={this.state.batchSelectRoleError} showIcon type="error"/>
                                </div>
                            ) : null
                        }
                    </FormItem> : null
                }
            </div>
        );
    },
    rolesPermissionsChange: function(roles,permissions){
        UserDetailAddAppAction.rolesPermissionsChange({roles,permissions});
    },
    render: function() {

        var fixedHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DELTA - LAYOUT_CONSTANTS.BOTTOM_DELTA;

        return (
            <div style={{height: '100%'}}>
                <RightPanelClose onClick={this.closeRightPanel}/>
                <div className="user-detail-add-app">
                    <Form horizontal action="javascript:void(0)">
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <Tabs defaultActiveKey="addapp">
                                <TabPane tab={Intl.get('user.batch.change', '批量变更')} key="addapp">
                                    <div className="user_manage_user_detail_addapp" style={{height: fixedHeight}}>
                                        <GeminiScrollbar ref="gemini">
                                            <div className="addapp_major_items">
                                                {
                                                    this.renderTabForBatch()
                                                }
                                            </div>
                                            <div className="addapp_minor_items" style={{display: this.state.multipleSubType === 'grant_roles' ? 'none' : 'block'}}>
                                                {
                                                    this.renderAppsBlock('inner')
                                                }
                                                {
                                                    this.renderChangePassword()
                                                }
                                                {
                                                    this.renderApplyType()
                                                }
                                                {
                                                    this.renderApplyTime()
                                                }
                                                {
                                                    this.renderApplyStatus()
                                                }
                                                {
                                                    this.renderCustomer()
                                                }
                                                {
                                                    this.renderDelayTime()
                                                }
                                                {
                                                    this.renderSalesApplyStatus()
                                                }
                                                {
                                                    this.renderSalesChangePassword()
                                                }
                                            </div>
                                            {
                                                this.renderRolesBlock()
                                            }
                                        </GeminiScrollbar>
                                    </div>
                                </TabPane>
                            </Tabs>
                            <div className="clearfix form_btns">
                                <p className="pull-left">
                                    {Intl.get('user.operator','操作人')}:
                                    {this.state.accountHolder}
                                </p>
                                <div className="indicator">
                                    {
                                        this.renderIndicator()
                                    }
                                </div>
                                <div className="pull-right">
                                    <RightPanelCancel onClick={this.cancel}>
                                        <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                    </RightPanelCancel>
                                    <RightPanelSubmit onClick={this.handleSubmit}>
                                        <ReactIntl.FormattedMessage id="common.sure" defaultMessage="确定" />
                                    </RightPanelSubmit>
                                </div>
                            </div>
                        </Validation>
                    </Form>
                </div>
            </div>
        );
    }
});

module.exports = UserDetailAddApp;
