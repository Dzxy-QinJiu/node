const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
require("../../css/apply-user-form.scss");
import {Form, Input, Radio, InputNumber, Icon, message, Checkbox, Tabs, Tooltip} from "antd";
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const RightPanelSubmit = require("../../../../../components/rightPanel").RightPanelSubmit;
const RightPanelCancel = require("../../../../../components/rightPanel").RightPanelCancel;
import UserTimeRangeField from '../../../../../components/user_manage_components/user-time-rangefield';
import ValidateMixin from "../../../../../mixins/ValidateMixin";
const DefaultUserLogoTitle = require("../../../../../components/default-user-logo-title");
const AlertTimer = require("../../../../../components/alert-timer");
const Spinner = require("../../../../../components/spinner");
const history = require("../../../../../public/sources/history");
const UserApplyAction = require("../../action/user-apply-actions");
import DateSelectorPicker from '../../../../../components/date-selector/utils';
import {OVER_DRAFT_TYPES} from 'PUB_DIR/sources/utils/consts';

const ApplyUserForm = React.createClass({
    mixins: [ValidateMixin, UserTimeRangeField],

    getInitialState: function () {
        const formData = this.buildFormData(this.props);

        return {
            formData: formData,
            appFormData: formData.products[0],
            isLoading: false,
            setAllChecked: true//是否设置到所有应用上
        };
    },

    componentWillReceiveProps: function (nextProps) {
        this.buildFormData(nextProps);
    },

    buildFormData: function (props) {
        const timeObj = DateSelectorPicker.getHalfAMonthTime();
        const begin_date = DateSelectorPicker.getMilliseconds(timeObj.start_time);
        const end_date = DateSelectorPicker.getMilliseconds(timeObj.end_time);
        const users = _.pluck(props.users, "user");
        let formData = {
            user_ids: _.pluck(users, "user_id"),
            user_names: _.pluck(users, "user_name"),
            customer_id: props.customerId,
            remark: "",
            tag: Intl.get("common.trial.official", "正式用户"),
        };
        let num = _.isArray(users) ? users.length : 1;
        //构造应用数据
        formData.products = props.apps.map(app => {
            return {
                client_id: app.client_id,
                number: num,
                begin_date: begin_date,
                end_date: end_date,
                range: "0.5m",
                over_draft: 1//默认到期停用
            };
        });

        if (this.state) {
            this.state.formData = formData;
            this.state.appFormData = formData.products[0] || {};
        } else {
            return formData;
        }
    },

    onAppChange: function (id) {
        if (id === this.state.appFormData.client_id) return;
        const appFormData = _.find(this.state.formData.products, app => app.client_id === id);
        this.setState({appFormData: appFormData});
    },

    onUserTypeChange: function (e) {
        let formData = this.state.formData;
        formData.tag = e.target.value;
        if (formData.tag === Intl.get("common.trial.official", "正式用户")) {
           formData.products = formData.products.map(app => {
               app.over_draft = OVER_DRAFT_TYPES.STOP_USE;//默认到期停用
               return app;
           });
        } else if (formData.tag === Intl.get("common.trial.user", "试用用户")) {
            formData.products = formData.products.map(app => {
                app.over_draft = OVER_DRAFT_TYPES.UN_CHANGED;//默认到期不变
                return app;
            });
        }
        this.setState(this.state);
    },

    onRemarkChange: function (e) {
        this.state.formData.remark = e.target.value;
        this.setState(this.state);
    },

    onTimeChange: function (begin_date, end_date, range) {
        this.state.appFormData.begin_date = parseInt(begin_date);
        this.state.appFormData.end_date = parseInt(end_date);
        this.state.appFormData.range = range;
        this.setState(this.state);
    },

    onOverDraftChange: function (e) {
        this.state.appFormData.over_draft = parseInt(e.target.value);
        this.setState(this.state);
    },

    handleSubmit: function (cb) {
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
                        return {
                            client_id: app.client_id,
                            number: app.num,
                            begin_date: appFormData.begin_date,
                            end_date: appFormData.end_date,
                            over_draft: appFormData.over_draft
                        };
                    });
                } else {
                    submitData.products.forEach(app => delete app.range);
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
                        message.success( Intl.get("user.apply.success", "申请成功"));
                        this.handleCancel();
                    }
                    else {
                        message.error( Intl.get("common.apply.failed", "申请失败"));
                    }
                    if (_.isFunction(cb)) cb();
                });
            }
        });
    },

    handleCancel: function () {
        this.props.cancelApply();
    },
    //是否应用到所有应用上的设置
    toggleCheckbox: function () {
        this.setState({setAllChecked: !this.state.setAllChecked});
    },
    renderTabToolTip(app_name) {
        return (
            <Tooltip title={app_name} placement="right">
                {<div className="app_name_tooltip">{app_name}</div>}
            </Tooltip>
        );
    },
    render: function () {
        const formData = this.state.formData;
        const appFormData = this.state.appFormData;
        const timePickerConfig = {
            isCustomSetting: true,
            appId: "applyUser",
        };

        return (
            <div className="full_size wrap_padding apply_user_form_wrap">
                <div className="apply_user_form" ref="scrollWrap">
                    <Form horizontal>
                        <Validation ref="validation" onValidate={this.handleValidate}>
                            <FormItem
                                label={Intl.get("user.selected.user", "已选用户")}
                                labelCol={{span: 4}}
                                wrapperCol={{span: 14}}
                            >
                                {this.state.formData.user_names.map(name => {
                                    return (
                                        <p className="user-name-item">{name}</p>
                                    );
                                })}
                            </FormItem>
                            <FormItem
                                label={Intl.get("user.apply.type", "申请类型")}
                                labelCol={{span: 4}}
                                wrapperCol={{span: 14}}
                            >
                                <RadioGroup onChange={this.onUserTypeChange}
                                            value={formData.tag}>
                                    <Radio key="1" value={Intl.get("common.trial.user", "试用用户")}><ReactIntl.FormattedMessage id="common.trial.user" defaultMessage="试用用户" /></Radio>
                                    <Radio key="0" value={Intl.get("common.trial.official", "正式用户")}><ReactIntl.FormattedMessage id="user.signed.user" defaultMessage="签约用户" /></Radio>
                                </RadioGroup>
                            </FormItem>
                            <FormItem
                                label={Intl.get("common.remark", "备注")}
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
                            <Tabs tabPosition="left" onChange={this.onAppChange}
                                  prefixCls="antd-vertical-tabs">
                                {this.props.apps.map(app => {
                                    let disabled = this.state.setAllChecked && app.client_id != appFormData.client_id;
                                    return (<TabPane key={app.client_id}
                                                     tab={this.renderTabToolTip(app.client_name)}
                                                     disabled={disabled}>
                                        <div className="set-all-check-box col-24">
                                            <Checkbox checked={this.state.setAllChecked}
                                                      onChange={this.toggleCheckbox}/>
                                                <span className="checkbox-title"
                                                      onClick={this.toggleCheckbox}><ReactIntl.FormattedMessage id="user.all.app.set" defaultMessage="设置到所有应用上" /></span>
                                            <span className="checkbox-notice">
                                               (<ReactIntl.FormattedMessage id="user.set.single.app" defaultMessage="注：若想设置单个应用，请取消此项的勾选" />)
                                            </span>
                                        </div>
                                        <div className="app-tab-pane col-24">
                                            <FormItem
                                                label={Intl.get("user.open.cycle", "开通周期")}
                                                labelCol={{span: 4}}
                                                wrapperCol={{span: 20}}
                                            >
                                                {this.renderUserTimeRangeBlock(timePickerConfig)}
                                            </FormItem>
                                            <FormItem
                                                label={Intl.get("user.expire.select", "到期可选")}
                                                labelCol={{span: 4}}
                                                wrapperCol={{span: 20}}
                                            >
                                                <RadioGroup onChange={this.onOverDraftChange}
                                                            value={appFormData.over_draft.toString()}>
                                                    <Radio key="1" value="1"><ReactIntl.FormattedMessage id="user.status.stop" defaultMessage="停用" /></Radio>
                                                    <Radio key="2" value="2"><ReactIntl.FormattedMessage id="user.status.degrade" defaultMessage="降级" /></Radio>
                                                    <Radio key="0" value="0"><ReactIntl.FormattedMessage id="user.status.immutability" defaultMessage="不变" /></Radio>
                                                </RadioGroup>
                                            </FormItem>
                                        </div>
                                    </TabPane>)
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
    }
});

module.exports = ApplyUserForm;
