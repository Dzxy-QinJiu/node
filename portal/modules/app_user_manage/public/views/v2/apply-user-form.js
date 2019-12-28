var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
require('../../css/apply-user-form.less');
import {Form, Input, Radio,message, Checkbox, Tabs, Tooltip} from 'antd';
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
import UserTimeRangeField from '../../../../../components/user_manage_components/user-time-rangefield';
import ValidateMixin from '../../../../../mixins/ValidateMixin';
const Spinner = require('../../../../../components/spinner');
const history = require('../../../../../public/sources/history');
const UserApplyAction = require('../../action/user-apply-actions');
import DateSelectorPicker from '../../../../../components/date-selector/utils';
import {OVER_DRAFT_TYPES} from 'PUB_DIR/sources/utils/consts';
import commonAppAjax from 'MOD_DIR/common/public/ajax/app';
const dayTime = 24 * 60 * 60 * 1000;
const ApplyUserForm = createReactClass({
    displayName: 'ApplyUserForm',
    mixins: [ValidateMixin, UserTimeRangeField],
    propTypes: {
        apps: PropTypes.array,
        emailData: PropTypes.obj,
        cancelApply: PropTypes.func,
        appList: PropTypes.array,
    },

    getInitialState: function() {
        const formData = this.buildFormData(this.props);

        return {
            formData: formData,
            appFormData: formData.products[0],
            appDefaultConfigList: [],//应用默认配置列表
            isLoading: false,
            setAllChecked: false//是否设置到所有应用上（默认：否）
        };
    },

    componentWillReceiveProps: function(nextProps) {
        const formData = this.buildFormData(nextProps);
        this.setState({
            formData,
            appFormData: formData.products[0] || {}
        });
        let oldAppIds = _.map(this.props.apps, 'client_id');
        let newAppIds = _.map(nextProps.apps, 'client_id');
        //获取newAppIds中，不存在于oldAppIds中的应用id
        let diffAppIds = _.difference(newAppIds, oldAppIds);
        //获取新增的应用的默认配置
        this.getAppsDefaultConfig(diffAppIds);
    },

    buildFormData: function(props) {
        const users = _.map(props.users, 'user');
        let formData = {
            user_ids: _.map(users, 'user_id'),
            user_names: _.map(users, 'user_name'),
            customer_id: props.customerId,
            remark: '',
            tag: Intl.get('common.trial.official', '正式用户'),
        };
        let num = _.isArray(users) ? users.length : 1;
        //获取的应用默认配置列表
        let appDefaultConfigList = this.state ? this.state.appDefaultConfigList : [];
        //构造应用数据
        formData.products = props.apps.map(app => {
            //没有取到应用默认配置时的默认值
            let appData = {
                client_id: app.client_id,
                number: num
            };
            return this.getAppConfig(appData, appDefaultConfigList, formData.tag, true);
        });
        return formData;
    },

    componentDidMount: function() {
        //获取各应用的默认设置
        this.getAppsDefaultConfig(_.map(this.props.apps, 'client_id'));
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
                        appFormData: formData.products[0],
                        appDefaultConfigList: appDefaultConfigList
                    });
                }
            });
        }
    },

    onAppChange: function(id) {
        if (id === this.state.appFormData.client_id) return;
        const appFormData = _.find(this.state.formData.products, app => app.client_id === id);
        this.setState({appFormData: appFormData});
    },

    /* 获取应用的配置, app：应用，appDefaultConfigList：各应用的默认配置列表，
     * userType:申请的用户类型（正式用户/试用用户）,resetDefault:是否需要重设默认值
     */
    getAppConfig: function(app, appDefaultConfigList, userType, needSetDefault) {
        //找到该应用对应用户类型的配置信息
        let defaultConfig = _.find(appDefaultConfigList, data => data.client_id === app.client_id && userType === data.user_type);
        let begin_date = DateSelectorPicker.getMilliseconds(moment().format(oplateConsts.DATE_FORMAT));
        // 查找该应用的应用列表是否有多终端信息
        let appTerminals = _.find(this.props.appList, data => data.client_id === app.client_id && !_.isEmpty(data.terminals));
        if (appTerminals) {
            app.terminals = appTerminals.terminals;
        }
        if (defaultConfig) {
            //应用默认设置中的开通周期、到期可选项
            app.begin_date = begin_date;
            app.end_date = begin_date + defaultConfig.valid_period;
            app.range = DateSelectorPicker.getDateRange(defaultConfig.valid_period);
            app.over_draft = defaultConfig.over_draft;
        } else if (needSetDefault) {
            // 切换试用用户和正式用户的单选按钮时，如果各应用默认配置中没有该应用该类型的默认配置时，
            // 需要默认设置，试用->到期不变，正式：到期停用, 开通周期：半个月
            app.begin_date = begin_date;
            app.end_date = begin_date + 15 * dayTime;
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

    onRemarkChange: function(e) {
        let formData = this.state.formData;
        formData.remark = e.target.value;
        this.setState({formData});
    },

    onTimeChange: function(begin_date, end_date, range) {
        let appFormData = this.state.appFormData;
        appFormData.begin_date = parseInt(begin_date);
        appFormData.end_date = parseInt(end_date);
        appFormData.range = range;
        this.setState({appFormData});
    },

    onOverDraftChange: function(e) {
        let appFormData = this.state.appFormData;
        appFormData.over_draft = parseInt(e.target.value);
        this.setState({appFormData});
    },

    handleSubmit: function(cb) {
        if (this.state.isLoading) {
            //正在申请，不可重复申请
            return;
        }
        const validation = this.refs.validation;
        validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                this.setState({isLoading: true});
                let submitData = JSON.parse(JSON.stringify(this.state.formData));
                //是否将当前设置，应用到所有应用上
                if (this.state.setAllChecked) {
                    let appFormData = this.state.appFormData;
                    submitData.products = submitData.products.map(app => {
                        let appConfigInfo = {
                            client_id: app.client_id,
                            number: app.num,
                            begin_date: appFormData.begin_date,
                            end_date: appFormData.end_date,
                            over_draft: appFormData.over_draft,
                        };
                        if (!_.isEmpty(appFormData.terminals)) {
                            appConfigInfo.terminals = _.map(appFormData.terminals, 'id');
                        }
                        return appConfigInfo;
                    });
                } else {
                    submitData.products.forEach(app => {
                        let terminals = app.terminals;
                        if ( !_.isEmpty(terminals)) {
                            app.terminals = _.map(terminals, 'id');
                        }
                        delete app.range;
                    });
                }
                submitData.user_ids = JSON.stringify(submitData.user_ids);
                submitData.user_names = JSON.stringify(submitData.user_names);
                submitData.products = JSON.stringify(submitData.products);
                //看从emailData中传过来的有数据，就放到submitData中 email_customer_names email_user_names
                if (_.isObject(this.props.emailData)) {
                    _.extend(submitData, this.props.emailData);
                }
                //添加应用名
                if (_.isArray(this.props.apps)) {
                    var client_names = _.map(this.props.apps, (obj) => obj.client_name);
                    submitData.email_app_names = client_names.join('、');
                }
                UserApplyAction.applyUser(submitData, result => {
                    this.setState({isLoading: false});
                    if (result === true) {
                        message.success(Intl.get('user.apply.success', '申请成功'));
                        this.handleCancel();
                    }
                    else {
                        message.error(result || Intl.get('common.apply.failed', '申请失败'));
                    }
                    if (_.isFunction(cb)) cb();
                });
            }
        });
    },

    handleCancel: function() {
        this.props.cancelApply();
    },

    //是否应用到所有应用上的设置
    toggleCheckbox: function() {
        this.setState({setAllChecked: !this.state.setAllChecked});
    },

    renderTabToolTip(app_name) {
        return (
            <Tooltip title={app_name} placement="right">
                {<div className="app_name_tooltip">{app_name}</div>}
            </Tooltip>
        );
    },

    // 选择多终端类型
    onSelectTerminalChange(selectedApp, app, checkedValue) {
        let appFormData = _.find(this.state.formData.products, item => item.client_id === app.client_id);
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
        this.setState(this.state);
    },

    render: function() {
        const formData = this.state.formData;
        const appFormData = this.state.appFormData;
        const timePickerConfig = {
            isCustomSetting: true,
            appId: 'applyUser',
        };
        let isShowSetAllCheck = true;
        let selectedApps = _.get(this.state.formData, 'products', []);
        // 所选应用包括多终端信息或只开通一个产品时，不显示设置到所有应用上的内容
        if (!_.isEmpty(selectedApps)) {
            if (selectedApps.length === 1) {
                isShowSetAllCheck = false;
            } else {
                if (_.find(selectedApps, item => item.terminals)) {
                    isShowSetAllCheck = false;
                }
            }
        }
        return (
            <div className="full_size wrap_padding apply_user_form_wrap">
                <div className="apply_user_form" ref="scrollWrap">
                    <Form layout='horizontal'>
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <FormItem
                                label={Intl.get('user.selected.user', '已选用户')}
                                labelCol={{span: 4}}
                                wrapperCol={{span: 14}}
                            >
                                {this.state.formData.user_names.map((name, index) => {
                                    return (
                                        <p className="user-name-item" key={index}>{name}</p>
                                    );
                                })}
                            </FormItem>
                            <FormItem
                                label={Intl.get('user.apply.type', '申请类型')}
                                labelCol={{span: 4}}
                                wrapperCol={{span: 14}}
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
                            </FormItem>
                            <FormItem
                                label={Intl.get('common.remark', '备注')}
                                labelCol={{span: 4}}
                                wrapperCol={{span: 14}}
                            >
                                <Input onChange={this.onRemarkChange}
                                    value={this.state.formData.remark}
                                    type="textarea"
                                />
                            </FormItem>
                        </Validation>
                        <div className="app-user-info ant-form-item">
                            <Tabs
                                tabPosition="left"
                                onChange={this.onAppChange}
                                prefixCls="antd-vertical-tabs"
                            >
                                {this.props.apps.map(app => {
                                    let disabled = this.state.setAllChecked && app.client_id !== appFormData.client_id;
                                    let terminalsOptions = _.map(app.terminals, 'name');
                                    let checkedTerminals = [];
                                    if (!_.isEmpty(appFormData.terminals)) {
                                        checkedTerminals = _.map(appFormData.terminals, 'name');
                                    }
                                    return (<TabPane key={app.client_id}
                                        tab={this.renderTabToolTip(app.client_name)}
                                        disabled={disabled}>
                                        {
                                            isShowSetAllCheck ? (
                                                <div className="set-all-check-box col-24">
                                                    <Checkbox checked={this.state.setAllChecked}
                                                        onChange={this.toggleCheckbox}/>
                                                    <span className="checkbox-title" onClick={this.toggleCheckbox}>
                                                        {Intl.get('user.all.app.set', '设置到所有应用上')}
                                                    </span>
                                                    {/*<span className="checkbox-notice">*/}
                                                    {/*({Intl.get("user.set.single.app", "注：若想设置单个应用，请取消此项的勾选")})*/}
                                                    {/*</span>*/}
                                                </div>
                                            ) : null
                                        }
                                        <div className="app-tab-pane col-24">
                                            <FormItem
                                                label={Intl.get('user.open.cycle', '开通周期')}
                                                labelCol={{span: 5}}
                                                wrapperCol={{span: 19}}
                                            >
                                                {this.renderUserTimeRangeBlock(timePickerConfig, appFormData)}
                                            </FormItem>
                                            <FormItem
                                                label={Intl.get('user.expire.select', '到期可选')}
                                                labelCol={{span: 5}}
                                                wrapperCol={{span: 19}}
                                            >
                                                <RadioGroup onChange={this.onOverDraftChange}
                                                    value={appFormData.over_draft.toString()}>
                                                    <Radio key="1" value="1"><ReactIntl.FormattedMessage
                                                        id="user.status.stop" defaultMessage="停用"/></Radio>
                                                    <Radio key="2" value="2"><ReactIntl.FormattedMessage
                                                        id="user.status.degrade" defaultMessage="降级"/></Radio>
                                                    <Radio key="0" value="0"><ReactIntl.FormattedMessage
                                                        id="user.status.immutability" defaultMessage="不变"/></Radio>
                                                </RadioGroup>
                                            </FormItem>
                                            {
                                                _.isEmpty(app.terminals) ? null : (
                                                    <FormItem
                                                        label={Intl.get('common.terminals.type', '终端类型')}
                                                        labelCol={{span: 5}}
                                                        wrapperCol={{span: 19}}
                                                    >
                                                        <CheckboxGroup
                                                            options={terminalsOptions}
                                                            onChange={this.onSelectTerminalChange.bind(this, appFormData, app)}
                                                            value={checkedTerminals}
                                                        />
                                                    </FormItem>
                                                )
                                            }
                                        </div>
                                    </TabPane>);
                                })}
                            </Tabs>
                            {
                                this.state.isLoading ?
                                    (<Spinner className="isloading"/>) :
                                    (null)
                            }

                        </div>
                    </Form>
                </div>
            </div>
        );
    },
});

module.exports = ApplyUserForm;

