require('../css/user-batch-change.less');
var createReactClass = require('create-react-class');
import GeminiScrollBar from 'CMP_DIR//react-gemini-scrollbar';
//app选择器，能选择权限
var AppSelector = require('../../../../components/app-selector/app-selector');
var AppRolePermission = require('../../../../components/user_manage_components/app-role-permission');
var passwdStrengthFile = require('CMP_DIR/password-strength-bar');
var AppUserUtil = require('../util/app-user-util');
var AppUserStore = require('../store/app-user-store');
var BatchChangeUserActions = require('../action/batch-change-user');
import BatchChangeUserStore from '../store/batch-change-user';
import DateSelector from '../../../../components/date-selector';
var crypto = require('crypto');
import { Tabs, Form, Input, InputNumber, Select, DatePicker, Radio, Icon, Alert, Button, Col, Row} from 'antd';
const TabPane = Tabs.TabPane;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
var AlertTimer = require('../../../../components/alert-timer');
var AutosizeTextarea = require('../../../../components/autosize-textarea');
var language = require('../../../../public/language/getLanguage');
import { APPLY_TYPES, TIMERANGEUNIT } from 'PUB_DIR/sources/utils/consts';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
import userData from 'PUB_DIR/sources/user-data';
import userManagePrivilege from '../privilege-const';
import {isSalesRole, isCustomDelayType, getDelayTimeUnit} from 'PUB_DIR/sources/utils/common-method-util';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import commonPrivilegeConst from 'MOD_DIR/common/public/privilege-const';
import BatchAddAppUser from 'CMP_DIR/user_manage_components/user-add-app';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import DetailCard from 'CMP_DIR/detail-card';
import {USER_TYPE_VALUE_MAP, USER_TYPE_TEXT_MAP} from 'PUB_DIR/sources/utils/consts';
import { checkPassword, checkConfirmPassword } from 'PUB_DIR/sources/utils/validate-util';
import { PassStrengthBar } from 'CMP_DIR/password-strength-bar';
var LAYOUT_CONSTANTS = $.extend({} , AppUserUtil.LAYOUT_CONSTANTS);//右侧面板常量
LAYOUT_CONSTANTS.BOTTOM_DELTA = 82;
LAYOUT_CONSTANTS.SELECT_USER_TIPS = 20;

var labelCol = {span: 4};
var wrapperCol = {span: 11};

var CustomerSuggest = require('./customer_suggest/customer_suggest');
const USER_DETAIL_ADD_APP_CUSTOMER_SELECT_WRAP = 'user-detail-add-app-customer-suggest-wrap';
const TAB_KEYS = {
    GRANT_APP: 'grant_application',// 开通产品
    CHANGE_PASSWORD: 'change_password',// 修改密码
    GRANT_TYPE: 'grant_type', // 开通类型
    STATUS: 'grant_status',// 开通状态
    PERIOD: 'grant_period',// 开通周期
    CUSTOMER: 'grant_customer', // 所属客户
    ROLES: 'grant_roles',// 权限设置
    DELAY: 'grant_delay',// 批量延期
};

var BatchChangUser = createReactClass({
    displayName: 'BatchChangUser',
    propTypes: {
        initialUser: PropTypes.object,
        appList: PropTypes.array,
        closeRightPanel: PropTypes.func,
        form: PropTypes.object,
    },
    getDefaultProps: function() {
        return {
            //初始用户
            initialUser: {}
        };
    },

    closeRightPanel() {
        this.props.closeRightPanel();
        BatchChangeUserActions.resetState();
    },

    md5(value) {
        let md5Hash = crypto.createHash('md5');
        md5Hash.update(value);
        return md5Hash.digest('hex');
    },

    handleSubmit(e) {
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
        //只有销售批量申请权限时
        var isSales = isSalesRole() && hasPrivilege(commonPrivilegeConst.USER_APPLY_APPROVE);
        //真正提交逻辑
        function submit() {
            //申请修改密码
            if(_this.hasSalesChangePasswordBlock()) {
                result.remark = _this.state.formData.remark.passwordRemark;
                result.customer_id = _.get(userList,'[0].customer.customer_id','');
            }
            //添加申请延期块
            if(_this.state.multipleSubType === 'grant_delay') {
                //向data中添加delay字段
                if (isCustomDelayType(formData.delayTimeRange)) {
                    result.end_date = formData.delayDeadlineTime;
                } else {
                    result.delay_time = getDelayTimeUnit(formData.delayTimeRange, formData.delayTimeNumber);
                }

                //向data中添加备注
                result.remark = _.get(_this.state, 'formData.remark.delayRemark', '');
                //到期是否停用
                result.over_draft = formData.over_draft;
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
            // 修改密码
            if(_this.hasChangePassword()) {
                const password = _this.props.form.getFieldValue('password');
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
            BatchChangeUserActions.submitAddApp({
                data: result,
                selectedAppId: selectedAppId,
                subType: _this.state.multipleSubType,
                isSales: isSales,
                extra: extra
            });
        }
        //开通类型、开通状态、开通周期、批量延期需要选择应用
        if((
            //批量延期
            (this.hasDelayTimeBlock() ||
            //批量修改开通类型
            this.hasApplyTypeBlock() ||
            //批量修改开通状态
            this.hasApplyStatusBlock() ||
            //批量修改开通周期
            this.hasApplyTimeBlock() || //销售修改开通状态
            this.hasSalesApplyStatusBlock())
            //不是开通产品
        ) && !this.hasApplyAppBlock()) {
            selectedAppId = JSON.stringify(this.state.formData.batchSelectedApps);
            //如果没有选择应用，则提示错误
            if(!this.state.formData.batchSelectedApps.length) {
                var appNotSelected = this.getBatchAppJsonList();
                if(!appNotSelected.length) {
                    BatchChangeUserActions.setBatchSelectedAppError( Intl.get('user.select.user.tip', '请在用户列表中选择用户'));
                } else {
                    BatchChangeUserActions.setBatchSelectedAppError( Intl.get('user.product.select.please','请选择产品'));
                }
                return;
            }
        }
        // 权限设置，需要选择角色
        if(this.hasRolesBlock()) {
            selectedAppId = this.state.formData.rolePermissionApp;
            if(!selectedAppId) {
                BatchChangeUserActions.setRolePermissionSelectedAppError(true);
                return;
            }
        }
        //开通产品需要选择应用
        if(this.hasApplyAppBlock()) {
            var selected_apps = formData.selected_apps || [];
            if(!selected_apps.length) {
                BatchChangeUserActions.showAppError();
                return;
            }
        }
        //所属客户需要选择客户
        if(this.hasCustomerBlock()) {
            if(!formData.choosen_customer.id) {
                BatchChangeUserActions.showCustomerError();
                return;
            }
        }
        //修改密码要验证表单再提交
        if(this.hasChangePassword()) {
            this.props.form.validateFields((error, values) => {
                if(error) return;
                submit();
            });
        } else if (this.hasDelayTimeBlock()) {//批量延期
            if (isSales) {//销售，延期申请
                this.delayApply();
            } else {//管理员的批量处理
                submit();
            }
        } else if (this.hasSalesApplyStatusBlock()) {//销售，修改开通状态的申请
            this.editStatusApply();
        } else {
            submit();
        }
    },
    //获取选择的用户及其应用相关的数据(多个应用)
    getSelectedUserMultiAppData() {
        let batchSelectedApps = this.state.formData.batchSelectedApps;
        //选中的用户
        let selectedUsers = this.props.initialUser;
        //获取选择的用户及其应用相关的数据(多个应用)
        let appArr = [];
        _.each(selectedUsers, user => {
            _.each(user.apps, app => {
                if (_.indexOf(batchSelectedApps, app.app_id) !== -1) {
                    appArr.push(({
                        client_id: app.app_id,
                        user_id: user.user.user_id,
                        user_name: user.user.user_name,
                        nickname: user.user.nick_name,
                        client_name: app.app_name,
                        end_date: app.end_time,
                        begin_date: app.start_time,
                    }));
                }
            });
        });
        return appArr;
    },

    //销售延期申请
    delayApply() {
        let formData = this.state.formData || {};

        let submitObj = {
            apply_type: APPLY_TYPES.DELAY,
            customer_id: this.getCustomerId(),
            remark: _.get(formData, 'remark.delayRemark', '')
        };
        let delayObj = {
            over_draft: Number(formData.over_draft),//到期是否停用
        };
        //向data中添加delay字段
        if (isCustomDelayType(formData.delayTimeRange)) {
            delayObj.end_date = formData.delayDeadlineTime;
        } else {
            delayObj.delay_time = getDelayTimeUnit(formData.delayTimeRange, formData.delayTimeNumber);
        }
        //选中的用户
        //获取选择的用户及其应用相关的数据(多个应用)
        let appArr = _.map(this.getSelectedUserMultiAppData(), app => {
            if(delayObj.delay_time){
                delete app.end_date;
                delete app.begin_date;
            }
            return {
                ...app,
                ...delayObj,

            };
        });
        submitObj.users_or_grants = appArr;
        BatchChangeUserActions.applyDelayMultiApp({
            // usePromise: true,
            data: submitObj
        });
    },
    getCustomerId() {
        var userList = this.props.initialUser;
        return _.get(userList,'[0].customer.customer_id','');
    },
    //销售修改开通状态的申请
    editStatusApply(){
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击确定按钮(申请修改开通状态)');
        let formData = this.state.formData || {};
        const users_or_grants = _.map(this.getSelectedUserMultiAppData(), x => {
            delete x.end_date;
            delete x.begin_date;
            return {
                ...x,
                status: formData.user_status
            };
        });
        const submitObj = {
            apply_type: APPLY_TYPES.DISABLE,
            remark: this.state.formData.remark.statusRemark,
            customer_id: this.getCustomerId(),
            users_or_grants
        };

        this.setState({ isApplying: true });
        //调用申请修改开通状态
        BatchChangeUserActions.applyDelayMultiApp({
            usePromise: true,
            data: submitObj
        });
    },

    addApp: function(app) {
        BatchChangeUserActions.addApp(app);
    },

    removeApp: function(app) {
        BatchChangeUserActions.removeApp(app);
    },

    customRadioValueChange(field, event) {
        let value = _.get(event, 'target.value');
        BatchChangeUserActions.customRadioValueChange({field, value});
    },

    end_time_disable_date: function(current) {
        return (current && current.getTime() < moment(this.state.formData.start_time).toDate().getTime());
    },

    start_time_disable_date: function(current) {
        return current && current.getTime() > moment(this.state.formData.end_time).toDate().getTime();
    },

    radioValueChange(field, event) {
        var value = event.target.value;
        BatchChangeUserActions.radioValueChange({field, value});
    },

    onWindowResize: function() {
        this.setState({});
    },

    //选中的行变了之后，检查已经选中的批量应用列表，
    checkSelectedBatchAppList: function(currentRows) {
        if(currentRows.length) {
            BatchChangeUserActions.setBatchSelectedAppError(false);
        } else {
            BatchChangeUserActions.setBatchSelectedAppError( Intl.get('user.select.user.tip', '请在用户列表中选择用户'));
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
            BatchChangeUserActions.batchAppChange(newSelectedAppIdList);
        }
    },

    componentDidMount: function() {
        BatchChangeUserStore.listen(this.onStoreChange);
        BatchChangeUserActions.getApps();
        $(window).on('resize' , this.onWindowResize);
        if (isSalesRole()) {
            this.batchTabChange('grant_delay');
        }
        AppUserUtil.emitter.on(AppUserUtil.EMITTER_CONSTANTS.SELECTED_USER_ROW_CHANGE , this.checkSelectedBatchAppList);
        //能够选择的批量应用
        var batchAppsToSelect = this.getBatchAppJsonList();
        //当界面显示出来之后，设置默认选中的应用列表
        BatchChangeUserActions.setDefaultBatchSelectedApps(batchAppsToSelect);

    },

    componentWillUnmount: function() {
        BatchChangeUserStore.unlisten(this.onStoreChange);
        $(window).off('resize' , this.onWindowResize);
        AppUserUtil.emitter.removeListener(AppUserUtil.EMITTER_CONSTANTS.SELECTED_USER_ROW_CHANGE , this.checkSelectedBatchAppList);
    },

    getInitialState: function() {
        return BatchChangeUserStore.getState();
    },

    onStoreChange: function() {
        this.setState(BatchChangeUserStore.getState());
    },

    renderIndicator: function() {
        if(this.state.submitResult === 'loading') {
            return (
                <Icon type="loading" />
            );
        }
        var hide = function() {
            BatchChangeUserActions.hideSubmitTip();
        };
        if(this.state.submitResult === 'success') {
            return (
                <AlertTimer
                    time={3000}
                    message={Intl.get('user.operate.success', '操作成功')}
                    type="success"
                    showIcon
                    onHide={hide}
                />
            );
        }
        if(this.state.submitResult === 'error') {
            return (
                <AlertTimer
                    time={3000}
                    message={this.state.submitErrorMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
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

    batchTabChange(key) {
        BatchChangeUserActions.changeMultipleSubType(key);
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
        // 管理员角色判断
        let isAdmin = userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN);
        if(isAdmin) {
            return 6;
        } else {
            return 14;
        }
    },

    selectedAppChange: function(selected_apps) {
        BatchChangeUserActions.setSelectedApps(selected_apps);

    },

    onScrollBarHeightChange: function() {
        if(this.refs.gemini) {
            this.refs.gemini.update();
        }
    },

    //验证密码
    checkPass: function(rule, value, callback) {
        let { getFieldValue, validateFields } = this.props.form;
        let rePassWord = getFieldValue('repassword');
        checkPassword(this, value, callback, rePassWord, () => {
            // 如果密码验证通过后，需要强制刷新下确认密码的验证，以防密码不一致的提示没有去掉
            validateFields(['repassword'], {force: true});
        });
    },
    
    //验证确认密码
    checkPass2(rule, value, callback) {
        let { getFieldValue, validateFields } = this.props.form;
        let password = getFieldValue('password');
        checkConfirmPassword(value, callback, password, () => {
            // 密码存在时，如果确认密码验证通过后，需要强制刷新下密码的验证，以防密码不一致的提示没有去掉
            validateFields(['password'], {force: true});
        });
    },

    //渲染修改密码
    renderChangePassword() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        return (
            <Form layout='horizontal' className="user-info-edit-pwd-form" autoComplete="off">
                <FormItem
                    label={Intl.get('common.password', '密码')}
                    {...formItemLayout}
                >
                    {getFieldDecorator('password', {
                        rules: [{
                            validator: this.checkPass
                        }],
                    })(
                        <Input
                            name="password"
                            type="password"
                            autoComplete="off"
                            placeholder={Intl.get('common.password.compose.rule', '6-18位数字、字母、符号的组合')}
                        />
                    )}
                </FormItem>
                {/* 由于有正在抽取样式的分支，以免冲突样式暂时先放js文件中 */}
                <Row style={{margin: '-10px 0 6px 0'}}>
                    <Col span="5"/>
                    <Col span="18">
                        {this.state.passBarShow ?
                            (<PassStrengthBar passStrength={this.state.passStrength}/>) : null}
                    </Col>
                </Row>
                <FormItem
                    label={Intl.get('common.confirm.password', '确认密码')}
                    {...formItemLayout}
                >
                    {getFieldDecorator('repassword', {
                        rules: [{
                            validator: this.checkPass2
                        }],
                    })(
                        <Input
                            name="repassword"
                            type="password"
                            placeholder={Intl.get('login.please_enter_new_password', '确认新密码')}
                            data-tracename="确认新密码"/>
                    )}
                </FormItem>
            </Form>
        );
    },

    //渲染开通类型
    renderApplyType: function() {
        var formData = this.state.formData;
        return (
            <div>
                {this.renderMultiAppSelectBlock()}
                { !Oplate.hideSomeItem &&
                <FormItem
                    label={Intl.get('user.batch.open.type', '开通类型')}
                    labelCol={labelCol}
                    wrapperCol={{span: ((language.lan() === 'es' || language.lan() === 'en') ? 18 : 20)}}
                >
                    <Radio.Group
                        value={formData.user_type}
                        onChange={this.customRadioValueChange.bind(this, 'user_type')}
                    >
                        {
                            _.map(USER_TYPE_VALUE_MAP, (value, key) => {
                                return (<Radio.Button value={value}>{USER_TYPE_TEXT_MAP[key]}</Radio.Button>);
                            })
                        }
                    </Radio.Group>
                </FormItem>}
            </div>
        );
    },

    delayTimeChange: function(value) {
        BatchChangeUserActions.delayTimeChange(value);
    },

    dateChange: function(start_time,end_time,range) {
        BatchChangeUserActions.timeChange({start_time,end_time,range});
    },

    //渲染开通时间
    renderApplyTime() {
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
                        getEndTimeTip={function(date){return Intl.get('user.open.cycle.date.tip','将在{date}的23:59:59到期',{'date': date});}}
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
    renderApplyStatus() {
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
                    wrapperCol={{span: 20}}
                >
                    <AutosizeTextarea
                        onChange={this.remarkChange.bind(this , 'passwordRemark')}
                        value={this.state.formData.remark.passwordRemark}
                        autoSize={true}
                        autoFocus={true}
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
                    <RadioGroup
                        onChange={this.radioValueChange.bind(this , 'user_status')}
                        value={formData.user_status}
                    >
                        <Radio key="1" value="1">
                            {Intl.get('common.app.status.open', '开启')}
                        </Radio>
                        <Radio key="0" value="0">
                            {Intl.get('common.app.status.close', '关闭')}
                        </Radio>
                    </RadioGroup>
                </FormItem>
                <FormItem
                    label={Intl.get('common.remark', '备注')}
                    labelCol={labelCol}
                    wrapperCol={{span: 13}}
                >
                    <AutosizeTextarea
                        autoSize={true}
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
        BatchChangeUserActions.onCustomerChoosen(resultObj);
        if(resultObj.customer.id) {
            BatchChangeUserActions.hideCustomerError();
        }
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
        BatchChangeUserActions.remarkChange({
            field: field,
            value: event.target.value
        });
    },

    //延期时间范围改变
    delayTimeRangeChange: function(value,text) {
        BatchChangeUserActions.delayTimeRangeChange(value);
    },

    //延期时间数字改变
    delayTimeNumberChange: function(value) {
        BatchChangeUserActions.delayTimeNumberChange(value);
    },

    // 将延期时间设置为截止时间（具体到xx年xx月xx日）
    setDelayDeadlineTime(value) {
        let timestamp = value && value.endOf('day').valueOf() || '';
        BatchChangeUserActions.setDelayDeadlineTime(timestamp);
    },

    // 设置不可选时间的范围
    disabledDate(current){
        return current && current.valueOf() < Date.now();
    },

    getBatchAppJsonList: function() {
        var userRowList = AppUserStore.getState().selectedUserRows;
        var userApps = _.chain(userRowList).map('apps').union().flatten().uniqBy((app) => app.app_id).map((app) => {
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
        BatchChangeUserActions.batchAppChange(values);
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
                notFoundContent={!batchApps.length ? Intl.get('user.no.product','暂无产品') : Intl.get('user.no.related.product','无相关产品')}
                searchPlaceholder={Intl.get('user.product.select.please','请选择产品')}
                filterOption={(input, option) => ignoreCase(input, option)}
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
                    label={Intl.get('common.product','产品')}
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
    renderDelayTime() {
        var isSales = isSalesRole();
        var divWidth = (language.lan() === 'zh') ? '80px' : '74px';
        let label = '';
        var customDelay = isCustomDelayType(this.state.formData.delayTimeRange);
        if (customDelay) {
            label = Intl.get('user.time.end', '到期时间');
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
                        {customDelay ? (
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
                                style={{width: '80px',height: '32px'}}
                                min={1}
                                max={10000}
                            />
                        )}

                        <Select
                            value={this.state.formData.delayTimeRange}
                            style={{width: divWidth,height: '32px'}}
                            onChange={this.delayTimeRangeChange}
                        >
                            <Option value={TIMERANGEUNIT.DAY}><ReactIntl.FormattedMessage id="common.time.unit.day" defaultMessage="天" /></Option>
                            <Option value={TIMERANGEUNIT.WEEK}><ReactIntl.FormattedMessage id="common.time.unit.week" defaultMessage="周" /></Option>
                            <Option value={TIMERANGEUNIT.MONTH}><ReactIntl.FormattedMessage id="common.time.unit.month" defaultMessage="月" /></Option>
                            <Option value={TIMERANGEUNIT.YEAR}><ReactIntl.FormattedMessage id="common.time.unit.year" defaultMessage="年" /></Option>
                            <Option value={TIMERANGEUNIT.CUSTOM}><ReactIntl.FormattedMessage id="user.time.custom" defaultMessage="自定义" /></Option>
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

    renderCustomer() {
        return (
            <div id={USER_DETAIL_ADD_APP_CUSTOMER_SELECT_WRAP}>
                <FormItem
                    label={Intl.get('common.belong.customer', '所属客户')}
                    labelCol={labelCol}
                    wrapperCol={{span: 20}}
                >
                    <CustomerSuggest
                        show_error={this.state.show_customer_error}
                        onCustomerChoosen={this.onCustomerChoosen}
                        customerSuggestWrapId={USER_DETAIL_ADD_APP_CUSTOMER_SELECT_WRAP}
                    />
                </FormItem>
            </div>
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

    renderRolesBlock() {
        var selectedApp = this.state.formData.rolePermissionApp;
        var options = this.getBatchAppOptions();
        return (
            <div className="addapp_minor_items batch-role-permission">
                <FormItem
                    label={Intl.get('common.product','产品')}
                    labelCol={labelCol}
                    wrapperCol={{span: 20}}
                >
                    <Select
                        dropdownMatchSelectWidth={false}
                        placeholder={Intl.get('user.product.select.please','请选择产品')}
                        value={selectedApp}
                        optionFilterProp="children"
                        notFoundContent={!options.length ? Intl.get('user.no.product','暂无产品') : Intl.get('user.no.related.product','无相关产品')}
                        onChange={BatchChangeUserActions.rolePermissionAppChange}
                    >
                        {options}
                    </Select>
                    {
                        this.state.roleSelectedAppError ?
                            <div className="batch-role-permission-apps">
                                <Alert message={Intl.get('user.product.select.please','请选择产品')} showIcon type="error"/>
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

    rolesPermissionsChange: function(roles,permissions, rolesInfo){
        BatchChangeUserActions.rolesPermissionsChange({roles,permissions,rolesInfo});
    },

    // 渲染开通产品
    renderAddApp(height) {
        return (
            <BatchAddAppUser
                appList={this.props.appList}
                initialUser={this.props.initialUser}
                height={height}
                handleSubmitData={this.handleSubmitData.bind(this)}
            />
        );
    },

    handleSubmitData(submitData) {
        //调用action进行更新
        BatchChangeUserActions.submitAddApp({
            data: submitData,
            subType: 'grant_application'
        });
    },

    renderContent() {
        const fixedHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DELTA -
                LAYOUT_CONSTANTS.SELECT_USER_TIPS - LAYOUT_CONSTANTS.BOTTOM_DELTA;
        const selectUserCount = AppUserStore.getState().selectUserCount;
        // 管理员角色判断
        const isAdmin = userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN);
        // 销售角色判断
        const isSales = isSalesRole();
        let tabPaneList = [];
        if (isAdmin) {
            if (hasPrivilege(userManagePrivilege.CRM_USER_ANALYSIS_ALL_ROLE_QUERY)) {
                tabPaneList.push(
                    <TabPane tab={Intl.get('user.batch.app.open', '开通产品')} key={TAB_KEYS.GRANT_APP}>
                        {
                            this.state.multipleSubType === TAB_KEYS.GRANT_APP ? (
                                <DetailCard
                                    content={this.renderAddApp(fixedHeight - 90)}
                                />
                            ) : null
                        }
                    </TabPane>
                );
                tabPaneList.push(
                    <TabPane tab={Intl.get('common.edit.password', '修改密码')} key={TAB_KEYS.CHANGE_PASSWORD}>
                        {
                            this.state.multipleSubType === TAB_KEYS.CHANGE_PASSWORD ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderChangePassword()}
                                    </GeminiScrollBar>}
                                />

                            ) : null
                        }
                    </TabPane>
                );
                tabPaneList.push(
                    <TabPane tab={Intl.get('common.type', '类型')} key={TAB_KEYS.GRANT_TYPE}>
                        {
                            this.state.multipleSubType === TAB_KEYS.GRANT_TYPE ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderApplyType()}
                                    </GeminiScrollBar>}
                                />
                            ) : null
                        }
                    </TabPane>
                );
                tabPaneList.push(
                    <TabPane tab={Intl.get('common.status', '状态')} key={TAB_KEYS.STATUS}>
                        {
                            this.state.multipleSubType === TAB_KEYS.STATUS ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderApplyStatus()}
                                    </GeminiScrollBar>}
                                />
                            ) : null
                        }
                    </TabPane>
                );
                tabPaneList.push(
                    <TabPane tab={Intl.get('user.apply.detail.table.time', '周期')} key={TAB_KEYS.PERIOD}>
                        {
                            this.state.multipleSubType === TAB_KEYS.PERIOD ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderApplyTime()}
                                    </GeminiScrollBar>}
                                />
                            ) : null
                        }
                    </TabPane>
                );
                tabPaneList.push(
                    <TabPane tab={Intl.get('common.belong.customer', '所属客户')} key={TAB_KEYS.CUSTOMER}>
                        {
                            this.state.multipleSubType === TAB_KEYS.CUSTOMER ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderCustomer()}
                                    </GeminiScrollBar>}
                                />
                            ) : null
                        }
                    </TabPane>
                );
                tabPaneList.push(
                    <TabPane tab={Intl.get('common.app.auth', '权限')} key={TAB_KEYS.ROLES}>
                        {
                            this.state.multipleSubType === TAB_KEYS.ROLES ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderRolesBlock()}
                                    </GeminiScrollBar>}
                                />
                            ) : null
                        }
                    </TabPane>
                );
                tabPaneList.push(
                    <TabPane
                        tab={Intl.get('crm.user.delay', '延期')}
                        key={TAB_KEYS.DELAY}
                    >
                        {
                            this.state.multipleSubType === TAB_KEYS.DELAY ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderDelayTime()}
                                    </GeminiScrollBar>}
                                />
                            ) : null
                        }
                    </TabPane>
                );
            }
        } else if (isSales) {
            if (hasPrivilege(commonPrivilegeConst.USER_APPLY_APPROVE)) {
                tabPaneList.push(
                    <TabPane
                        tab={Intl.get('user.batch.apply.delay', '申请延期')}
                        key={TAB_KEYS.DELAY}
                    >
                        {
                            this.state.multipleSubType === TAB_KEYS.DELAY ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderDelayTime()}
                                    </GeminiScrollBar>}
                                />
                            ) : null
                        }
                    </TabPane>
                );
                tabPaneList.push(
                    <TabPane tab={Intl.get('common.app.status', '开通状态')} key='sales_grant_status'>
                        {
                            this.state.multipleSubType === 'sales_grant_status' ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderApplyStatus()}
                                    </GeminiScrollBar>}
                                />
                            ) : null
                        }
                    </TabPane>
                );
                tabPaneList.push(
                    <TabPane tab={Intl.get('common.edit.password', '修改密码')} key='sales_change_password'>
                        {
                            this.state.multipleSubType === 'sales_change_password' ? (
                                <DetailCard
                                    content={<GeminiScrollBar
                                        style={{height: fixedHeight - 90}}
                                        ref="gemini"
                                    >
                                        {this.renderSalesChangePassword()}
                                    </GeminiScrollBar>}
                                />

                            ) : null
                        }
                    </TabPane>
                );
            }}

        return (
            <div className="user-batch-change-content-wrap">
                <div className="selected-number">
                    <ReactIntl.FormattedMessage
                        id="user.batch.selected.num"
                        defaultMessage={'已选择{num}个用户'}
                        values={{'num': <span className="the-number">{selectUserCount}</span>}}
                    />
                </div>
                <div className="batch-change-content" style={{height: fixedHeight}}>
                    <Tabs
                        activeKey={this.state.multipleSubType}
                        onChange={this.batchTabChange}
                    >
                        {tabPaneList}
                    </Tabs>
                </div>
                <div className="clearfix batch-change-btns">
                    <p className="pull-left">
                        {Intl.get('user.operator','操作人')}:
                        {this.state.accountHolder}
                    </p>
                    <div className="indicator">
                        {
                            this.renderIndicator()
                        }
                    </div>
                    <div className="pull-right" data-tracename="批量变更">
                        <Button onClick={this.closeRightPanel} data-tracename="点击取消按钮">
                            {Intl.get('common.cancel', '取消')}
                        </Button>
                        {
                            this.state.multipleSubType === 'grant_application' ? null : (
                                <Button
                                    onClick={this.handleSubmit}
                                    type="primary"
                                    data-tracename="点击确定按钮"
                                >
                                    {Intl.get('common.sure', '确定')}
                                </Button>
                            )
                        }
                    </div>
                </div>
            </div>
        );
    },

    render() {
        return (
            <RightPanelModal
                className="user-batch-change-wrap"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.closeRightPanel}
                title={Intl.get('user.batch.change', '批量变更')}
                content={this.renderContent()}
                dataTracename='用户管理-批量变更'
            />
        );
    }
});

module.exports = Form.create()(BatchChangUser);