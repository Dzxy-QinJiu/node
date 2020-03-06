var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
require('../css/apply-user-form.less');
require('../../../../public/css/antd-vertical-tabs.css');
import {Form, Input, Radio, Select, DatePicker,Checkbox} from 'antd';
const {TextArea} = Input;
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import UserTimeRangeField from '../../../../components/user_manage_components/user-time-rangefield';
import ValidateMixin from '../../../../mixins/ValidateMixin';
const OrderAction = require('../action/order-actions');
import UserNameTextfieldUtil from 'CMP_DIR/user_manage_components/user-name-textfield/util';
import {OVER_DRAFT_TYPES} from 'PUB_DIR/sources/utils/consts';
import commonAppAjax from 'MOD_DIR/common/public/ajax/app';
import contactAjax from '../ajax/contact-ajax';
import DetailCard from 'CMP_DIR/detail-card';
import DateSelectorPicker from 'CMP_DIR/date-selector/utils';
import SquareLogoTag from 'CMP_DIR/square-logo-tag';
import ApplyUserAppConfig from 'CMP_DIR/apply-user-app-config';
import AppConfigForm from 'CMP_DIR/apply-user-app-config/app-config-form';
const UserApplyAction = require('MOD_DIR/app_user_manage/public/action/user-apply-actions');
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import {INTEGRATE_TYPES, CONFIG_TYPE} from 'PUB_DIR/sources/utils/consts';
import {getConfigAppType} from 'PUB_DIR/sources/utils/common-method-util';
import { getApplyActiveEmailTip ,TAB_KEYS} from '../utils/crm-util';
import contactUtil from '../utils/contact-util';

const ApplyUserForm = createReactClass({
    displayName: 'ApplyUserForm',
    mixins: [ValidateMixin, UserTimeRangeField],
    propTypes: {
        apps: PropTypes.array,
        applyFrom: PropTypes.string,
        maxHeight: PropTypes.number,
        users: PropTypes.array,
        customerName: PropTypes.string,
        emailData: PropTypes.obj,
        cancelApply: PropTypes.func,
        afterAddApplySuccess: PropTypes.func,
        appList: PropTypes.array,
        userType: PropTypes.string,
        customerId: PropTypes.string,
    },
    getDefaultProps() {
        return {
            apps: [],
            applyFrom: '',
            users: [],
            customerName: '',
            emailData: {},
            cancelApply: function() {

            },
            appList: [],
            userType: '',
            afterAddApplySuccess: function() {}
        };
    },
    getInitialState: function() {
        const formData = this.buildFormData(this.props, this.getInitialApps(this.props));
        return {
            apps: this.getInitialApps(this.props,true),
            formData: formData,
            appDefaultConfigList: [],//应用默认配置列表
            isLoading: false,
            configType: CONFIG_TYPE.UNIFIED_CONFIG,//配置类型：统一配置、分别配置
            customerContacts: [],//客户的联系人列表(在订单中，申请用户时，联系人中的邮箱作为用户名的选项)
            applyFrom: this.props.applyFrom || 'order',//从哪里打开的申请面板,客户订单、客户的用户列表中
            maxHeight: this.props.maxHeight,//form表单的最大高度限制
            formHeight: 215,//form表单初始高度
            isOplateUser: true,
            applyErrorMsg: '',//申请失败的错误提示
            defContactChecked: false,//是否选中使用默认联系人进行申请
            uemUserTypes: [],// uem 用户类型列表
        };
    },
    getInitialApps: function(props,flag) {
        var apps = flag ? $.extend(true, [], props.apps) : props.apps;
        if (_.get(apps, '[0]')){
            return apps;
        }else{
            if (_.get(props, 'appList.length') === 1){
                apps.push(_.get(props, 'appList[0]'));
                return apps;
            }else{
                return apps;
            }
        }
    },
    getIntegrateConfig(){
        commonDataUtil.getIntegrationConfig().then(resultObj => {
            let isOplateUser = _.get(resultObj, 'type') === INTEGRATE_TYPES.OPLATE;
            let formData = this.state.formData;
            let uemUserTypes = this.state.uemUserTypes;
            //从客户详情中申请用户时，用户类型默认值的设置（只有oplate用户申请时，需要默认值为试用用户）
            if (this.props.applyFrom !== 'order') {
                formData.tag = isOplateUser ? Intl.get('common.trial.user', '试用用户') : '';
            }
            if(!isOplateUser) {
                commonAppAjax.getUserCondition().then( (list) => {
                    uemUserTypes = _.filter(list, item => {
                        return item.key === 'user_type' && _.get(item.values,'[0]');
                    });
                },() => {
                    uemUserTypes = [];
                });
            }
            this.setState({isOplateUser,formData,uemUserTypes});
        });
    },

    componentWillReceiveProps: function(nextProps) {
        if (_.get(nextProps, 'customerId') !== this.props.customerId) {
            let formData = this.buildFormData(nextProps, this.getInitialApps(nextProps));
            let oldAppIds = _.map(this.state.apps, 'client_id');
            let newAppIds = _.map(nextProps.apps, 'client_id');
            //获取newAppIds中，不存在于oldAppIds中的应用id
            let diffAppIds = _.difference(newAppIds, oldAppIds);
            //获取新增的应用的默认配置
            this.getAppsDefaultConfig(diffAppIds);
            this.setState({apps: this.getInitialApps(nextProps, true), maxHeight: nextProps.maxHeight, formData});
        }
    },

    buildFormData: function(props, apps) {
        //获取的应用默认配置列表
        let appDefaultConfigList = this.state ? this.state.appDefaultConfigList : [];
        let num = 1;//申请用户的个数
        let formData = {};
        //从订单中申请的
        if (props.applyFrom === 'order') {
            const order = props.order;
            formData = {
                customer_id: order.customer_id,
                order_id: order.id,
                sales_opportunity: order.sale_stages,
                user_name: '',
                nick_name: props.customerName,
                tag: props.userType,
                remark: ''
            };
        } else {//从客户详情的用户列表中申请的
            const users = _.map(props.users, 'user');
            formData = {
                customer_id: props.customerId,
                //从客户详情中申请用户时，只有oplate用户申请时，需要默认值为试用用户（uem不需要设置）
                tag: _.get(this.state, 'isOplateUser') ? Intl.get('common.trial.user', '试用用户') : '',
                remark: '',
                selectAppIds: []//用来验证是否选择应用的属性
            };
            if (_.isArray(users) && users.length) {//已有用户开通应用
                num = users.length;
                formData.user_ids = _.map(users, 'user_id');
                formData.user_names = _.map(users, 'user_name');
            } else {//开通新用户
                formData.user_name = '';
                formData.nick_name = props.customerName;
            }
        }
        //构造应用数据
        formData.products = apps.map(app => {
            //没有取到应用默认配置时的默认值
            let appData = {
                client_id: app.client_id,
                number: num,
            };
            return this.getAppConfig(appData, appDefaultConfigList, formData.tag, true);
        });
        return formData;
    },

    isApplyNewUsers: function() {
        let selectUsers = this.props.users;
        //从用户列表中过来的，没有选择的用户时，说明是申请新用户
        return this.state.applyFrom === 'crmUserList' && !(_.isArray(selectUsers) && selectUsers.length);
    },

    componentDidMount: function() {
        let appList = this.props.apps;
        if (_.isArray(appList) && appList.length) {
            //获取各应用的默认设置
            this.getAppsDefaultConfig(_.map(appList, 'client_id'));
        }
        //从订单中过来，或者是申请新用户时，需要获取联系人中的邮箱作为用户名的推荐选项
        if (this.props.applyFrom === 'order' || this.isApplyNewUsers()) {
            this.getCustomerContacts();
        }
        this.getIntegrateConfig();
    },

    //获取客户联系人列表
    getCustomerContacts: function() {
        let customerId = this.state.formData ? this.state.formData.customer_id : '';
        if (!customerId) return;
        contactAjax.getContactList(customerId).then((data) => {
            let contactList = data && _.isArray(data.result) ? data.result : [];
            this.setState({
                customerContacts: contactList
            });
        }, (errorMsg) => {
            this.setState({
                customerContacts: []
            });
        });
    },

    //获取各应用的默认设置
    getAppsDefaultConfig: function(appIds) {
        if (_.isArray(appIds) && appIds.length) {
            //获取各应用的默认设置(不需要角色和权限信息)
            commonAppAjax.getAppsDefaultConfigAjax().sendRequest({
                client_id: appIds.join(','),
                with_addition: false
            }).success((dataList) => {
                if (_.isArray(dataList) && dataList.length) {
                    //去重取并集
                    let appDefaultConfigList = _.union(this.state.appDefaultConfigList, dataList);
                    let formData = this.state.formData;
                    formData.products = formData.products.map(app => {
                        return this.getAppConfig(app, appDefaultConfigList, formData.tag);
                    });

                    this.setState({
                        formData: formData,
                        appDefaultConfigList: appDefaultConfigList
                    });
                }
            });
        }
    },

    /* 获取应用的配置, app：应用，appDefaultConfigList：各应用的默认配置列表，
     * userType:申请的用户类型（正式用户/试用用户）,resetDefault:是否需要重设默认值
     */
    getAppConfig: function(app, appDefaultConfigList, userType, needSetDefault) {
        //找到该应用对应用户类型的配置信息
        let defaultConfig = _.find(appDefaultConfigList, data => data.client_id === app.client_id && userType === data.user_type);
        app.begin_date = DateSelectorPicker.getMilliseconds(moment().format(oplateConsts.DATE_FORMAT));
        // 查找该应用的应用列表是否有多终端信息
        let appTerminals = _.find(this.props.appList, data => data.client_id === app.client_id && !_.isEmpty(data.terminals));
        if (appTerminals) {
            app.terminals = appTerminals.terminals;
        }
        if (defaultConfig) {
            //应用默认设置中的开通周期、到期可选项
            app.end_date = app.begin_date + defaultConfig.valid_period;
            app.range = DateSelectorPicker.getDateRange(defaultConfig.valid_period);
            app.over_draft = defaultConfig.over_draft;
        } else if (needSetDefault) {
            // 切换试用用户和正式用户的单选按钮时，如果各应用默认配置中没有该应用该类型的默认配置时，
            // 需要默认设置，试用->到期不变，正式：到期停用, 开通周期：半个月
            app.end_date = moment(app.begin_date + (15 - 1) * oplateConsts.ONE_DAY_TIME_RANGE).endOf('day').valueOf();
            app.range = '0.5m';
            app.over_draft = userType === Intl.get('common.trial.official', '正式用户') ? OVER_DRAFT_TYPES.STOP_USE : OVER_DRAFT_TYPES.UN_CHANGED;
        }
        return app;
    },

    onUserTypeChange: function(e) {
        let formData = this.state.formData;
        formData.tag = e.target.value;
        formData.products = formData.products.map(app => {
            return this.getAppConfig(app, this.state.appDefaultConfigList, formData.tag, true);
        });
        this.setState({formData: formData});
    },
    onSelectTypeChange: function(value) {
        value = _.trim(value);
        if (value){
            let formData = this.state.formData;
            formData.tag = value;
            formData.products = formData.products.map(app => {
                return this.getAppConfig(app, this.state.appDefaultConfigList, formData.tag, true);
            });
            this.setState({formData: formData});
        }
    },

    onNickNameChange: function(e) {
        this.setNickName(_.trim(e.target.value));
    },
    setNickName: function(nickName) {
        let formData = this.state.formData;
        formData.nick_name = _.trim(nickName);
        this.setState({formData});
    },

    onRemarkChange: function(e) {
        let formData = this.state.formData;
        formData.remark = _.trim(e.target.value);
        this.setState({formData});
    },

    onUserNameChange: function(e) {
        this.setFormDataUserName(_.trim(e.target.value));
    },
    setFormDataUserName: function(userName) {
        var userName = _.trim(userName);
        let formData = this.state.formData;
        formData.user_name = userName;
        let isEmail = userName && userName.indexOf('@') !== -1;
        _.each(formData.products, appFormData => {
            //用户名是邮箱格式时，只能申请1个用户
            if (isEmail && appFormData.number > 1) {
                appFormData.onlyOneUserTip = true;
            } else {
                appFormData.onlyOneUserTip = false;
            }
        });
        this.setState({formData});
    },

    onCountChange: function(app, v) {
        let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
        if (appFormData) {
            appFormData.number = v;
            let userName = this.state.formData.user_name;
            if (userName && userName.indexOf('@') !== -1 && v > 1) {
                //用户名是邮箱格式时，只能申请1个用户
                appFormData.onlyOneUserTip = true;
            } else {
                appFormData.onlyOneUserTip = false;
            }
            //修改申请用户个数后，需要重新验证用户名是否存在
            this.refs.validation.forceValidate(['user_name']);
        }
        this.setState(this.state);
    },

    onTimeChange: function(begin_date, end_date, range, app) {
        let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
        if (appFormData) {
            appFormData.begin_date = parseInt(begin_date);
            appFormData.end_date = parseInt(end_date);
            appFormData.range = range;
            this.setState(this.state);
        }
    },
    // 设置不可选时间的范围
    setDisabledDate(current) {
        return current && current.valueOf() < Date.now();
    },
    // 将到期时间设置为截止时间（具体到xx年xx月xx日）
    onChangeEndTime(app,value) {
        let timestamp = value && value.valueOf() || '';
        let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
        if (appFormData) {
            appFormData.end_date = parseInt(timestamp);
            this.setState(this.state);
        }
    },
    renderUserEndTimeBlock: function(config, app) {
        return (
            <DatePicker placeholder={Intl.get('my.app.change.expire.time.placeholder', '请选择到期时间')}
                onChange={this.onChangeEndTime.bind(this,app)}
                disabledDate={this.setDisabledDate}
                defaultValue={moment()}
                allowClear={false}
                showToday={false}
            />
        );
    },

    onOverDraftChange: function(app, e) {
        let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
        if (appFormData) {
            appFormData.over_draft = parseInt(e.target.value);
        }
        this.setState(this.state);
    },

    handleSubmit: function(e) {
        e.preventDefault();
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击确定按钮');

        if (this.state.isLoading) {
            //正在申请，不可重复申请
            return;
        }
        const validation = this.refs.validation;
        validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                let submitData = JSON.parse(JSON.stringify(this.state.formData));
                let hasOnlyOneUserTip = _.find(submitData.products, item => item.onlyOneUserTip);
                //有只能申请一个的验证提示时，没有通过验证，不能提交（用户名是邮箱格式时，只能开通一个用户）
                if (hasOnlyOneUserTip) return;
                this.setState({isLoading: true});
                //统一配置
                if (this.state.configType === CONFIG_TYPE.UNIFIED_CONFIG) {
                    let appFormData = _.isArray(submitData.products) && submitData.products[0] ? submitData.products[0] : {};
                    submitData.products = _.map(submitData.products, app => {
                        return {
                            client_id: app.client_id,
                            number: this.state.applyFrom === 'order' || this.isApplyNewUsers() ? appFormData.number : app.num,
                            begin_date: appFormData.begin_date,
                            end_date: appFormData.end_date,
                            over_draft: appFormData.over_draft,
                            terminals: _.map(appFormData.terminals, 'id'),
                        };
                    });
                } else {//分别配置
                    submitData.products.forEach(app => {
                        let terminals = app.terminals;
                        if ( !_.isEmpty(terminals)) {
                            app.terminals = _.map(terminals, 'id');
                        }
                        delete app.range;
                        delete app.onlyOneUserTip;
                    });
                }
                if (_.isEmpty(submitData.products.terminals)) {
                    delete submitData.products.terminals;
                }
                submitData.products = JSON.stringify(submitData.products);
                if (this.state.applyFrom === 'order') {//订单中申请试用、签约用户
                    this.applyUserFromOder(submitData);
                } else if (this.isApplyNewUsers()) {//todo 申请新用户时，没有订单和销售阶段，先随便乱传个字符串（不传接口会报错）
                    delete submitData.selectAppIds;//去掉用于验证的数据
                    //如果是uem类型的，应用的信息只给后端传应用id，应用名和到期时间就可以
                    if (!this.state.isOplateUser){
                        var products = JSON.parse(submitData.products);
                        if (_.isArray(products) && products.length){
                            _.forEach(products,(item) => {
                                delete item.number;
                                delete item.begin_date;
                                delete item.over_draft;
                            });
                            submitData.products = JSON.stringify(products);
                        }
                    }
                    submitData.users_or_grants = JSON.parse(submitData.products);
                    delete submitData.products;
                    submitData.user_type = submitData.tag;
                    delete submitData.tag;
                    _.forEach(submitData.users_or_grants,item => {
                        if(!_.get(item,'terminals.length')){
                            item.terminals = null;
                        }
                    });
                    this.applyUserFromOder(submitData);
                } else {
                    delete submitData.selectAppIds;//去掉用于验证的数据
                    this.applyUserFromUserList(submitData);
                }
            }
        });
    },

    applyUserFromOder: function(submitData) {
        submitData.user_name = _.trim(submitData.user_name);
        OrderAction.applyUser(submitData, {}, result => {
            if (_.get(result,'id')) {
                this.setState({
                    isLoading: false,
                    applyErrorMsg: ''
                });
                this.props.afterAddApplySuccess(submitData);
                this.handleCancel();
            } else {
                this.setState({
                    isLoading: false,
                    applyErrorMsg: result || Intl.get('common.apply.failed', '申请失败'),
                });
            }
        });
    },
    calcDescartes: function(array,submitData) {
        if (array.length < 2) return array[0] || [];
        return [].reduce.call(array, function(col, set) {
            var res = [];
            col.forEach(function(c) {
                set.forEach(function(s) {
                    res.push({
                        'user_id': c,
                        'tags': [submitData.tag],
                        ...s});
                });
            });
            return res;
        });
    },
    applyUserFromUserList: function(submitData) {
        submitData.user_names = JSON.stringify(submitData.user_names);
        var newSubmitObj = {
            customer_id: submitData.customer_id,
            remark: submitData.remark
        };
        delete submitData.customer_id;
        //users_or_grants 是跟据user_ids 和 原来参数中的 products 做笛卡尔积后获取的总数量
        newSubmitObj['users_or_grants'] = this.calcDescartes([submitData.user_ids,JSON.parse(submitData.products)],submitData);
        UserApplyAction.applyUser(newSubmitObj, result => {
            this.setState({isLoading: false});
            if (_.get(result,'id')) {
                this.setState({
                    isLoading: false,
                    applyErrorMsg: ''
                });
                this.handleCancel();
            } else {
                this.setState({
                    isLoading: false,
                    applyErrorMsg: result || Intl.get('common.apply.failed', '申请失败'),
                });
            }
        });
    },

    handleCancel: function() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击取消按钮');
        this.props.cancelApply();
    },

    //获取申请用户的个数
    getApplyUserCount(){
        let appFormData = _.isArray(this.state.formData.products) ? this.state.formData.products[0] : {};
        //TODO 获取验证时所需的开通个数
        return appFormData ? appFormData.number : 1;
    },

    checkUserExist(rule, value, callback) {
        let customer_id = this.state.formData.customer_id;
        let number = this.getApplyUserCount();
        let trimValue = _.trim(value);
        // 校验的信息提示
        UserNameTextfieldUtil.validatorMessageTips(trimValue, callback, () => {
            if (!trimValue) return;
            let obj = {
                customer_id: customer_id,
                user_name: trimValue
            };
            UserNameTextfieldUtil.checkUserExist(rule, obj, callback, number, this.refs.username_block);
        });
    },

    selectEmail: function(value, field) {
        value = _.trim(value);
        if (value) {
            let formData = this.state.formData;
            formData.user_name = value;
            this.setState({formData});
        }
    },

    renderUserNameInput: function(userName) {
        const placeholder = Intl.get('user.username.write.tip', '请填写用户名');
        let input = (
            <Input
                name="user_name"
                placeholder={placeholder}
                value={userName}
                onChange={this.onUserNameChange}
                autocomplete="off"
                autoFocus/>
        );
        let customerContacts = this.state.customerContacts;
        let emailList = [];//联系人的邮箱列表
        if (customerContacts.length) {
            _.each(customerContacts, contact => {
                if (_.isArray(contact.email) && contact.email.length) {
                    _.each(contact.email, email => {
                        if (email.indexOf(userName) !== -1) {
                            emailList.push(email);
                        }
                    });
                }
            });
        }
        if (emailList.length) {
            return (
                <Select combobox
                    name="user_name"
                    placeholder={placeholder}
                    filterOption={false}
                    onChange={this.selectEmail}
                    value={userName}
                    dropdownMatchSelectWidth={false}
                >
                    {emailList.map((email, i) => {
                        return (<Option key={i} value={email}>{email}</Option>);
                    })}
                </Select>
            );
        } else {
            return input;
        }
    },

    changeConfigType: function(configType) {
        //获取的应用默认配置列表
        let appDefaultConfigList = this.state.appDefaultConfigList || [];
        let num = 1;//申请用户的个数
        let formData = this.state.formData;
        const users = _.map(this.props.users, 'user');
        if (_.isArray(users) && users.length) {//已有用户开通应用
            num = users.length;
        }
        //构造应用数据
        formData.products = _.map(this.state.apps, app => {
            //没有取到应用默认配置时的默认值
            let appData = {
                client_id: app.client_id,
                number: num,
            };
            return this.getAppConfig(appData, appDefaultConfigList, formData.tag, true);
        });
        this.setState({configType, formData});
        this.setFormHeight();
    },

    // 选择多终端类型
    onSelectTerminalChange(selectedApp, app, checkedValue) {
        let formData = this.state.formData;
        let appFormData = _.find(formData.products, item => item.client_id === app.client_id);
        if (appFormData) {
            let terminals = [];
            if (!_.isEmpty(checkedValue)) {
                _.each(checkedValue, checked => {
                    if (checked) {
                        let selectedTerminals = _.find(selectedApp.terminals, item => item.name === checked);
                        terminals.push(selectedTerminals);
                    }
                });
                appFormData.terminals = terminals;
            } else {
                appFormData.terminals = [];
            }
        }
        this.setState(formData);
    },

    renderAppConfigForm: function(appFormData, app) {
        const timePickerConfig = {
            isCustomSetting: true,
            appId: 'applyUser'
        };
        var isOplateUser = this.state.isOplateUser;
        return (<AppConfigForm
            selectedApp={app}
            appFormData={appFormData}
            needApplyNum={(this.state.applyFrom === 'order' || this.isApplyNewUsers()) && isOplateUser}
            timePickerConfig={timePickerConfig}
            renderUserTimeRangeBlock={isOplateUser ? this.renderUserTimeRangeBlock : this.renderUserEndTimeBlock}
            onCountChange={this.onCountChange}
            onOverDraftChange={this.onOverDraftChange}
            needEndTimeOnly={!isOplateUser}
            hideExpiredSelect={!isOplateUser}
            isShowTerminals={!_.isEmpty(app.terminals)}
            onSelectTerminalChange={this.onSelectTerminalChange}
        />);
    },

    //从订单中申请用户或申请新用户时，用户名和昵称输入框的渲染
    renderUserNamesInputs: function(formData, formItemLayout) {
        return (
            <div>
                <div className="user-name-textfield-block" ref="username_block">
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get('common.username', '用户名')}
                        validateStatus={this.getValidateStatus('user_name')}
                        help={this.getHelpMessage('user_name')}
                        required
                    >
                        <Validator rules={[{validator: this.checkUserExist}]}>
                            {this.renderUserNameInput(formData.user_name)}
                        </Validator>
                    </FormItem>
                </div>
                <FormItem
                    {...formItemLayout}
                    label={Intl.get('common.nickname', '昵称')}
                    validateStatus={this.getValidateStatus('nick_name')}
                    help={this.getHelpMessage('nick_name')}
                    required
                >
                    <Validator rules={[{
                        required: true,
                        message: Intl.get('user.nickname.write.tip', '请填写昵称')
                    }]}>
                        <Input
                            name="nick_name"
                            placeholder={Intl.get('user.nickname.write.tip', '请填写昵称')}
                            value={formData.nick_name}
                            onChange={this.onNickNameChange}/>
                    </Validator>
                </FormItem>
            </div>);
    },
    handleDefContactChange: function(e) {
        var checked = e.target.checked,isOplateUser = this.state.isOplateUser;
        this.setState({
            defContactChecked: checked
        },() => {
            //如果是uem申请，并且已经选中了checkbox。
            if (!isOplateUser && checked){
                let customerContacts = this.state.customerContacts;
                let targetObj = _.find(customerContacts,contact => contact.def_contancts === 'true');
                if (targetObj){
                    var userName = '',nickName = '';
                    if (_.isArray(targetObj.phone) && _.get(targetObj, 'phone.length')) {
                        userName = _.get(targetObj, 'phone[0]');
                    }else if (_.isArray(targetObj.email) && _.get(targetObj, 'email.length')) {
                        userName = _.get(targetObj,'email[0]');
                    }else if (_.isArray(targetObj.qq) && _.get(targetObj,'qq.length')){
                        userName = _.get(targetObj,'qq[0]');
                    }
                    nickName = _.get(targetObj,'name');
                    this.setFormDataUserName(userName);
                    this.setNickName(nickName);
                }
            }
        });

    },
    hasDefaultContact: function() {
        let customerContacts = this.state.customerContacts;
        return _.some(customerContacts, contact => contact.def_contancts === 'true');
    },
    handleActiveContact: function() {
        contactUtil.emitter.emit('changeActiveTab', TAB_KEYS.CONTACT_TAB);
    },
    renderCheckDefaultContact: function() {
        let hasDefault = this.hasDefaultContact();
        let isChecked = this.state.defContactChecked;
        return (
            <div className="check-contact-container">
                <Checkbox checked={isChecked} onChange={this.handleDefContactChange}>
                    {Intl.get('crm.user.use.default.contact', '使用默认联系人申请')}
                </Checkbox>
                {!hasDefault && isChecked ? <a onClick={this.handleActiveContact}>{Intl.get('crm.click.set.def.contact', '请先设置默认联系人')}</a> : null}
            </div>
        );
    },
    renderUemUserType: function() {
        var UserTypeList = _.get(this.state.uemUserTypes,'[0]') ? this.state.uemUserTypes : [Intl.get('common.trial.user', '试用用户'), Intl.get('user.signed.user', '签约用户')];
        /*_.each(this.state.uemUserTypes, item => {
            // 去重取并集
            UserTypeList = _.union(UserTypeList, item.values);
        });*/
        var formData = this.state.formData;
        return (
            <Select combobox
                name="tag"
                placeholder={Intl.get('crm.input.your.apply.user.type', '请输入或选择您申请的用户类型')}
                filterOption={false}
                onChange={this.onSelectTypeChange}
                value={_.get(formData, 'tag', '')}
                dropdownMatchSelectWidth={false}
            >
                {UserTypeList.map((userType, i) => {
                    return (<Option key={i} value={userType}>{userType}</Option>);
                })}
            </Select>
        );
    },

    /**
     * 申请表单的渲染
     * 1、从订单中申请试用、签约用户时，
     *    1）用户名、昵称需要自己输入（用户名推荐用联系人中的邮箱）
     *    2）申请类型，已根据订单的阶段确定，成交之前的阶段申请的是‘试用用户’，成交及以后的阶段申请的是‘签约用户’
     *    3）应用只展示不可选，用订单中的应用
     *
     * 2、从用户列表中，申请新用户时，
     *    1）用户名、昵称需要自己输入（用户名推荐用联系人中的邮箱）
     *    2）申请类型，需要自己选申请的是‘试用用户’还是‘签约用户’
     *    3）应用从所有的应用列表中自己选择
     *
     * 3、从用户列表中，选择已有用户开通新应用时，
     *    1）用户名、昵称，用选择的已有用户的，只展示用户名即可
     *    2）申请类型，需要自己选申请的是‘试用用户’还是‘签约用户’
     *    3）应用从所有的应用列表中自己选择
     */
    renderApplyUserForm: function() {
        const formData = this.state.formData;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        };
        let selectAppIds = _.map(this.state.apps, 'client_id');
        var isOplateUser = this.state.isOplateUser;

        return (
            <div
                className="apply-user-form-wrap"
                style={{maxHeight: this.state.maxHeight, height: this.state.formHeight}}
            >
                <GeminiScrollbar className="srollbar-out-card-style">
                    <Form layout='horizontal' className="apply-user-form" id="crm-apply-user-form">
                        {isOplateUser ? null : this.renderCheckDefaultContact()}
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            {this.state.applyFrom === 'order' || this.isApplyNewUsers() ?
                                this.renderUserNamesInputs(formData, formItemLayout) : (
                                    <FormItem
                                        {...formItemLayout}
                                        label={Intl.get('user.selected.user', '已选用户')}
                                    >
                                        {_.map(formData.user_names, name => {
                                            return (<p className="user-name-item">{name}</p>);
                                        })}
                                    </FormItem>
                                )}
                            {this.state.applyFrom !== 'order' ? (
                                <FormItem
                                    {...formItemLayout}
                                    label={Intl.get('common.type', '类型')}
                                    validateStatus={this.getValidateStatus('tag')}
                                    help={this.getHelpMessage('tag')}
                                    required
                                >
                                    <Validator rules={[{
                                        required: true,
                                        message: isOplateUser ?
                                            Intl.get('crm.apply.user.type.select.placeholder', '请选择用户类型') :
                                            Intl.get('crm.apply.user.type.placeholder', '请输入用户类型'),
                                    }]}>
                                        {isOplateUser ? <RadioGroup onChange={this.onUserTypeChange}
                                            name="tag" value={formData.tag}>
                                            <Radio key="1" value={Intl.get('common.trial.user', '试用用户')}>
                                                {Intl.get('common.trial.user', '试用用户')}
                                            </Radio>
                                            <Radio key="0" value={Intl.get('common.trial.official', '正式用户')}>
                                                {Intl.get('user.signed.user', '签约用户')}
                                            </Radio>
                                        </RadioGroup> : this.renderUemUserType()}
                                    </Validator>
                                </FormItem>) : null}
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('common.product','产品')}
                                validateStatus={this.getValidateStatus('selectAppIds')}
                                help={this.getHelpMessage('selectAppIds')}
                                required
                            >
                                <Validator rules={[{
                                    required: true,
                                    message: Intl.get('user.product.select.please','请选择产品'),
                                    type: 'array'
                                }]}>
                                    <Select
                                        mode="tags"
                                        value={selectAppIds}
                                        name='selectAppIds'
                                        dropdownClassName="apply-user-apps-dropdown"
                                        placeholder={Intl.get('user.product.select.please','请选择产品')}
                                        onChange={this.handleChangeApps.bind(this)}>
                                        {this.getAppOptions(selectAppIds)}
                                    </Select>
                                </Validator>
                            </FormItem>
                            {_.isArray(selectAppIds) && selectAppIds.length ? (
                                <ApplyUserAppConfig
                                    apps={this.state.apps}
                                    appsFormData={formData.products}
                                    configType={this.state.configType}
                                    changeConfigType={this.changeConfigType}
                                    renderAppConfigForm={this.renderAppConfigForm.bind(this)}
                                />
                            ) : null}
                            <FormItem
                                {...formItemLayout}
                                label={Intl.get('common.remark', '备注')}
                            >
                                <TextArea
                                    placeholder={Intl.get('user.remark.write.tip', '请填写备注')}
                                    value={formData.remark}
                                    autosize={{minRows: 2, maxRows: 6}}
                                    onChange={this.onRemarkChange}/>
                            </FormItem>
                        </Validation>
                    </Form>
                </GeminiScrollbar>
            </div>
        );
    },

    handleChangeApps: function(appIds) {
        let apps = [];
        _.each(appIds, appId => {
            let selectApp = _.find(this.props.appList, app => app.client_id === appId);
            if (selectApp) {
                apps.push(selectApp);
            }
        });
        // 若所选应用包括多终端类型，则直接显示分别配置界面
        let configType = getConfigAppType(appIds, apps);

        //获取的应用默认配置列表
        let appDefaultConfigList = this.state.appDefaultConfigList || [];
        let num = 1;//申请用户的个数
        let formData = this.state.formData || {};
        const users = _.map(this.props.users, 'user');
        if (_.isArray(users) && users.length) {//已有用户开通应用
            num = users.length;
        }
        //过滤掉删除的应用
        formData.products = _.filter(formData.products, app => _.indexOf(appIds, app.client_id) !== -1);
        //新增应用的id列表
        let newAddAppIds = [];
        _.each(appIds, id => {
            let appData = _.find(formData.products, item => item.client_id === id);
            if (!appData) {
                newAddAppIds.push(id);
            }
        });
        //添加新增的应用
        if (_.isArray(newAddAppIds) && newAddAppIds.length) {
            //构造新增应用数据
            _.each(newAddAppIds, appId => {
                //没有取到应用默认配置时的默认值
                let appData = {
                    client_id: appId,
                    number: num,
                };
                formData.products.push(this.getAppConfig(appData, appDefaultConfigList, formData.tag, true));
            });
            this.getAppsDefaultConfig(newAddAppIds);
        }
        formData.selectAppIds = appIds;
        this.setState({apps, formData, configType});
        this.setFormHeight();
    },

    setFormHeight: function() {
        setTimeout(() => {
            let formHeight = this.state.formHeight;
            if($('#crm-apply-user-form').size()){
                formHeight = $('#crm-apply-user-form').height();
            }
            this.setState({formHeight});
        });
    },

    getAppOptions: function(selectAppIds) {
        let appList = this.props.appList;
        if (_.isArray(appList) && appList.length) {
            return _.map(appList, app => {
                let appId = app ? app.client_id : '';
                var className = '';
                //下拉选项中，过滤掉已选的应用
                if (_.isArray(selectAppIds) && selectAppIds.length && selectAppIds.indexOf(appId) !== -1) {
                    className = 'app-options-selected';
                }
                return (
                    <Option
                        className={className}
                        key={appId}
                        value={appId}
                        title={app.client_name}
                    >
                        <SquareLogoTag
                            name={_.get(app, 'client_name', '')}
                            logo={_.get(app, 'client_logo', '')}
                        />
                    </Option>
                );
            });
        }
        return [];
    },

    render() {
        let title = '';
        if (this.props.userType) {
            if (this.props.userType === Intl.get('common.trial.official', '正式用户')) {
                title = Intl.get('user.apply.user.official', '申请签约用户');
            } else {
                title = Intl.get('common.apply.user.trial', '申请试用用户');
            }
        }
        return (
            <DetailCard
                title={title}
                className="crm-apply-user-form-container"
                content={this.renderApplyUserForm()}
                isEdit={true}
                loading={this.state.loading}
                saveErrorMsg={getApplyActiveEmailTip(this.state.applyErrorMsg)}
                handleSubmit={this.handleSubmit.bind(this)}
                handleCancel={this.handleCancel.bind(this)}
                okBtnText={Intl.get('common.sure', '确定')}
            />);
    },
});

module.exports = ApplyUserForm;

