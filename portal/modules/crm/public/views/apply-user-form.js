const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
require('../css/apply-user-form.less');
require('../../../../public/css/antd-vertical-tabs.css');
import {Tooltip, Form, Input, Radio, Select, message} from 'antd';
const {TextArea} = Input;
const Option = Select.Option;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;
import UserTimeRangeField from '../../../../components/user_manage_components/user-time-rangefield';
import ValidateMixin from '../../../../mixins/ValidateMixin';
const history = require('../../../../public/sources/history');
const OrderAction = require('../action/order-actions');
import UserNameTextfieldUtil from '../../../../components/user_manage_components/user-name-textfield/util';
import {OVER_DRAFT_TYPES} from 'PUB_DIR/sources/utils/consts';
import commonAppAjax from 'MOD_DIR/common/public/ajax/app';
import contactAjax from '../ajax/contact-ajax';

import DetailCard from 'CMP_DIR/detail-card';
import DateSelectorPicker from 'CMP_DIR/date-selector/utils';
import SquareLogoTag from './components/square-logo-tag';
import ApplyUserAppConfig from './components/apply-user-app-config';
import AppConfigForm from './components/apply-user-app-config/app-config-form';
const UserApplyAction = require('MOD_DIR/app_user_manage/public/action/user-apply-actions');

//顶部tab标题的高度
const LAY_CONSTS = {
    TAB_TITLE_HEIGHT: 80
};
const CONFIG_TYPE = {
    UNIFIED_CONFIG: 'unified_config',//统一配置
    SEPARATE_CONFIG: 'separate_config'//分别配置
};
const ApplyUserForm = React.createClass({
    mixins: [ValidateMixin, UserTimeRangeField],

    getInitialState: function() {
        const formData = this.buildFormData(this.props, this.props.apps);

        return {
            apps: $.extend(true, [], this.props.apps),
            formData: formData,
            appDefaultConfigList: [],//应用默认配置列表
            isLoading: false,
            configType: CONFIG_TYPE.UNIFIED_CONFIG,//配置类型：统一配置、分别配置
            customerContacts: [],//客户的联系人列表(在订单中，申请用户时，联系人中的邮箱作为用户名的选项)
            applyFrom: this.props.applyFrom || 'order'//从哪里打开的申请面板,客户订单、客户的用户列表中
        };
    },

    componentWillReceiveProps: function(nextProps) {
        this.buildFormData(nextProps, nextProps.apps);
        let oldAppIds = _.pluck(this.state.apps, 'client_id');
        let newAppIds = _.pluck(nextProps.apps, 'client_id');
        //获取newAppIds中，不存在于oldAppIds中的应用id
        let diffAppIds = _.difference(newAppIds, oldAppIds);
        //获取新增的应用的默认配置
        this.getAppsDefaultConfig(diffAppIds);
        this.setState({apps: $.extend(true, [], nextProps.apps)});
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
            const users = _.pluck(props.users, 'user');
            formData = {
                customer_id: props.customerId,
                tag: Intl.get('common.trial.user', '试用用户'),
                remark: '',
            };
            if (_.isArray(users) && users.length) {//已有用户开通应用
                num = users.length;
                formData.user_ids = _.pluck(users, 'user_id');
                formData.user_names = _.pluck(users, 'user_name');
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

        if (this.state) {
            this.state.formData = formData;
        } else {
            return formData;
        }
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
            this.getAppsDefaultConfig(_.pluck(appList, 'client_id'));
        }
        //从订单中过来，或者是申请新用户时，需要获取联系人中的邮箱作为用户名的推荐选项
        if (this.props.applyFrom === 'order' || this.isApplyNewUsers()) {
            this.getCustomerContacts();
        }
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
        if (defaultConfig) {
            //应用默认设置中的开通周期、到期可选项
            app.end_date = app.begin_date + defaultConfig.valid_period;
            app.range = DateSelectorPicker.getDateRange(defaultConfig.valid_period);
            app.over_draft = defaultConfig.over_draft;
        } else if (needSetDefault) {
            // 切换试用用户和正式用户的单选按钮时，如果各应用默认配置中没有该应用该类型的默认配置时，
            // 需要默认设置，试用->到期不变，正式：到期停用, 开通周期：半个月
            app.end_date = app.begin_date + 15 * oplateConsts.ONE_DAY_TIME_RANGE;
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
    onNickNameChange: function(e) {
        this.state.formData.nick_name = e.target.value.trim();
        this.setState(this.state);
    },

    onRemarkChange: function(e) {
        this.state.formData.remark = e.target.value.trim();
        this.setState(this.state);
    },

    onUserNameChange: function(e) {
        let userName = e.target.value.trim();
        this.state.formData.user_name = userName;
        let isEmail = userName && userName.indexOf('@') !== -1;
        _.each(this.state.formData.products, appFormData => {
            //用户名是邮箱格式时，只能申请1个用户
            if (isEmail && appFormData.number > 1) {
                appFormData.onlyOneUserTip = true;
            } else {
                appFormData.onlyOneUserTip = false;
            }
        });
        this.setState(this.state);
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

    onOverDraftChange: function(app, e) {
        let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
        if (appFormData) {
            appFormData.over_draft = parseInt(e.target.value);
        }
        this.setState(this.state);
    },

    handleSubmit: function(e) {
        e.preventDefault();
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
                            over_draft: appFormData.over_draft
                        };
                    });
                } else {//分别配置
                    submitData.products.forEach(app => {
                        delete app.range;
                        delete app.onlyOneUserTip;
                    });
                }
                submitData.products = JSON.stringify(submitData.products);
                //添加申请邮件中用的应用名
                if (_.isArray(this.state.apps)) {
                    var client_names = _.map(this.state.apps, (obj) => obj.client_name);
                    submitData.email_app_names = client_names.join('、');
                }

                if (this.state.applyFrom === 'order') {//订单中申请试用、签约用户
                    this.applyUserFromOder(submitData);
                } else if (this.isApplyNewUsers()) {//申请新用户时，没有订单和销售阶段，先随便乱传个字符串（不传接口会报错）
                    submitData.order_id = 'apply_new_users';
                    submitData.sales_opportunity = 'apply_new_users';
                    this.applyUserFromOder(submitData);
                } else {
                    this.applyUserFromUserList(submitData);
                }
            }
        });
    },
    applyUserFromOder: function(submitData) {
        submitData.user_name = $.trim(submitData.user_name);
        //添加申请邮件中用的客户名
        submitData.email_customer_names = this.props.customerName;
        //添加申请邮件中用的用户名
        submitData.email_user_names = submitData.user_name;
        OrderAction.applyUser(submitData, {}, result => {
            this.setState({isLoading: false});
            if (result === true) {
                message.success(Intl.get('user.apply.success', '申请成功'));
                this.handleCancel();
            } else {
                message.error(result || Intl.get('common.apply.failed', '申请失败'));
            }
        });
    },

    applyUserFromUserList: function(submitData) {
        submitData.user_ids = JSON.stringify(submitData.user_ids);
        submitData.user_names = JSON.stringify(submitData.user_names);
        //看从emailData中传过来的有数据，就放到submitData中 email_customer_names email_user_names
        if (_.isObject(this.props.emailData)) {
            _.extend(submitData, this.props.emailData);
        }
        UserApplyAction.applyUser(submitData, result => {
            this.setState({isLoading: false});
            if (result === true) {
                message.success(Intl.get('user.apply.success', '申请成功'));
                this.handleCancel();
            }
            else {
                message.error(Intl.get('common.apply.failed', '申请失败'));
            }
        });
    },

    handleCancel: function() {
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
        let trimValue = $.trim(value);
        // 校验的信息提示
        UserNameTextfieldUtil.validatorMessageTips(trimValue, callback);
        if (!trimValue) return;
        let obj = {
            customer_id: customer_id,
            user_name: trimValue
        };
        UserNameTextfieldUtil.checkUserExist(rule, obj, callback, number, this.refs.username_block);
    },
    selectEmail: function(value, field) {
        value = $.trim(value);
        if (value) {
            this.state.formData.user_name = value;
            this.setState({formData: this.state.formData});
        }
    },
    renderUserNameInput: function(userName) {
        const placeholder = Intl.get('user.username.write.tip', '请填写用户名');
        let input = (
            <Input
                name="user_name"
                placeholder={placeholder}
                value={userName}
                onChange={this.onUserNameChange}/>
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
        const users = _.pluck(this.props.users, 'user');
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
    },

    renderAppConfigForm: function(appFormData) {
        const timePickerConfig = {
            isCustomSetting: true,
            appId: 'applyUser'
        };
        return (<AppConfigForm appFormData={appFormData}
            needApplyNum={this.state.applyFrom === 'order' || this.isApplyNewUsers()}
            timePickerConfig={timePickerConfig}
            renderUserTimeRangeBlock={this.renderUserTimeRangeBlock}
            onCountChange={this.onCountChange}
            onOverDraftChange={this.onOverDraftChange}/>);
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
        let selectAppIds = _.pluck(this.state.apps, 'client_id');
        return (
            <Form horizontal className="apply-user-form">
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
                            label={Intl.get('user.apply.type', '申请类型')}
                        >
                            <RadioGroup onChange={this.onUserTypeChange}
                                value={formData.tag}>
                                <Radio key="1" value={Intl.get('common.trial.user', '试用用户')}>
                                    {Intl.get('common.trial.user', '试用用户')}
                                </Radio>
                                <Radio key="0" value={Intl.get('common.trial.official', '正式用户')}>
                                    {Intl.get('user.signed.user', '签约用户')}
                                </Radio>
                            </RadioGroup>
                        </FormItem>) : null}
                    <FormItem
                        {...formItemLayout}
                        label={Intl.get('common.app', '应用')}
                        required
                    >
                        {this.state.applyFrom === 'order' ? _.map(this.state.apps, app => {
                            return (<SquareLogoTag name={app ? app.client_name : ''}
                                logo={app ? app.client_logo : ''}/>);
                        }) : (
                            <Select mode="tags" value={selectAppIds}
                                dropdownClassName="apply-user-apps-dropdown"
                                placeholder={Intl.get('user.app.select.please', '请选择应用')}
                                onChange={this.handleChangeApps.bind(this)}>
                                {this.getAppOptions(selectAppIds)}
                            </Select>)}
                    </FormItem>
                    {_.isArray(selectAppIds) && selectAppIds.length ? (
                        <ApplyUserAppConfig apps={this.state.apps}
                            appsFormData={formData.products}
                            configType={this.state.configType}
                            changeConfigType={this.changeConfigType}
                            renderAppConfigForm={this.renderAppConfigForm.bind(this)}
                        />) : null}
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
        );
    },
    handleChangeApps: function(appIds) {
        this.state.apps = _.map(appIds, appId => {
            return _.find(this.props.appList, app => app.client_id === appId);
        });
        //获取的应用默认配置列表
        let appDefaultConfigList = this.state.appDefaultConfigList || [];
        let num = 1;//申请用户的个数
        let formData = this.state.formData || {};
        const users = _.pluck(this.props.users, 'user');
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
        this.setState({apps: this.state.apps, formData: formData});
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
                return (<Option className={className} key={appId} value={appId}>
                    <SquareLogoTag
                        name={app ? app.client_name : ''}
                        logo={app ? app.client_logo : ''}
                    />
                </Option>);
            });
        }
        return [];
    },
    render: function() {
        let title = '';
        if(this.props.userType){
            if(this.props.userType === Intl.get('common.trial.official', '正式用户')){
                title = Intl.get('user.apply.user.official', '申请签约用户');
            }else{
                title = Intl.get('common.apply.user.trial', '申请试用用户');
            }
        }
        return (
            <DetailCard title={title}
                className="apply-user-form-container"
                content={this.renderApplyUserForm()}
                isEdit={true}
                loading={this.state.loading}
                saveErrorMsg={this.state.submitErrorMsg}
                handleSubmit={this.handleSubmit.bind(this)}
                handleCancel={this.handleCancel.bind(this)}
                okBtnText={Intl.get('common.sure', '确定')}
            />);
    }
});

module.exports = ApplyUserForm;
