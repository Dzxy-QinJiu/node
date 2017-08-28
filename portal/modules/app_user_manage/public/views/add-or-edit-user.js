var Tabs = require("antd").Tabs;
var TabPane = Tabs.TabPane;
var AppUserUtil = require("../util/app-user-util");
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var CustomRadioGroup = require("../../../../components/custom_radio_group");
var RightPanelSubmit = require("../../../../components/rightPanel").RightPanelSubmit;
var RightPanelCancel = require("../../../../components/rightPanel").RightPanelCancel;
var RightPanelClose = require("../../../../components/rightPanel").RightPanelClose;
var Form = require("antd").Form;
var FormItem = Form.Item;
var Input = require("antd").Input;
var Validation = require("antd").Validation;
var Validator = Validation.Validator;
import FieldMixin from "../../../../components/antd-form-fieldmixin";
var Radio = require("antd").Radio;
var RadioGroup = Radio.Group;
import { DatePicker } from "antd";

import AppUserFormStore from "../store/app-user-form-store";
import AppUserFormActions from "../action/app-user-form-actions";
var AppUserActions = require("../action/app-user-actions");

var InputNumber = require("antd").InputNumber;
var Select = require("antd").Select;
var Option = Select.Option;
var AppSelector = require("../../../../components/app-selector/app-selector");
var AppPermission = require("../../../../components/app-selector/app-permission");
var AlertTimer = require("../../../../components/alert-timer");
var Icon = require("antd").Icon;
var classNames = require("classnames");
var Link = require("react-router").Link;
var CustomerSuggest = require("./customer_suggest/customer_suggest");

//右侧面板常量
var LAYOUT_CONSTANTS = $.extend({}, AppUserUtil.LAYOUT_CONSTANTS);
LAYOUT_CONSTANTS.BOTTOM_DELTA = 82;

var AddOrEditUser = React.createClass({
    mixins: [FieldMixin],
    getInitialState: function () {
        return AppUserFormStore.getState();
    },
    onStoreChange: function () {
        this.setState(AppUserFormStore.getState());
    },
    reLayout: function () {
        this.setState({});
    },
    componentDidMount: function () {
        $(window).on("resize", this.reLayout);
        AppUserFormStore.listen(this.onStoreChange);
        AppUserFormActions.getApps();
    },
    componentWillUnmount: function () {
        $(window).off("resize", this.reLayout);
        AppUserFormStore.unlisten(this.onStoreChange);
    },
    radioValueChange: function (field, event) {
        var value = event.target.value;
        AppUserFormActions.radioValueChange({field, value});
    },
    customRadioValueChange: function (field, value) {
        AppUserFormActions.customRadioValueChange({field, value});
    },
    timeChange: function (field, date) {
        AppUserFormActions.timeChange({field, date});
    },
    end_time_disable_date: function (current) {
        return (current && current.getTime() < moment(AppUserFormStore.getState().formData.start_time).toDate().getTime());
    },
    start_time_disable_date: function (current) {
        return current && current.getTime() > moment(AppUserFormStore.getState().formData.end_time).toDate().getTime();
    },
    handleCancel: function () {
        AppUserFormActions.resetState();
        AppUserActions.closeRightPanel();
    },
    getSubmitData : function() {
        var formData = this.state.formData || {};
        //开户账号
        var userName = formData.user_name || '';
        //开户产品，key是产品id，value为产品名
        var products = {};
        formData.selected_apps.forEach(function(item) {
            products[item.app_id] = {
                roles : item.roles,
                permissions : item.permissions
            };
        });
        products = JSON.stringify(products);
        var customer = formData.customer_id;
        //开户类型
        var userType = formData.user_type;
        //开通套数
        var number = formData.count_number + '';
        //开通时间
        var startTime = formData.start_time;
        //到期时间
        var endTime = formData.end_time;
        //永久的话，开通时间、到期时间为空
        if(formData.range === 'forever') {
            startTime = '';
            endTime = '';
        }
        //到期是否停用
        var overDraft = formData.over_draft;
        //账号状态
        var status = formData.user_status;

        //销售团队id
        var sales_team_id = formData.sales_team.id;
        //销售id
        var sales_id = formData.sales.id;

        //返回结果
        var result = {
            sales_team : sales_team_id,
            sales : sales_id,
            user_name : userName,
            products : products,
            customer : customer,
            user_type : userType,
            number:number,
            start_time : startTime,
            end_time : endTime,
            over_draft : overDraft,
            status : status
        };
        return result;
    },
    handleSubmit: function (e) {
        e.preventDefault();
        var validation = this.refs.validation;
        var _this = this;
        validation.validate(function(valid) {
            var hasError = false;
            if(!valid) {
                hasError = true;
            }
            //没有选中的应用，报错
            var selected_apps = _this.state.formData.selected_apps || [];
            if(!selected_apps.length) {
                AppUserFormActions.showAppError();
                hasError = true;
            }
            var $search_input = _this.getCustomerSearchInput();
            var search_input_val = $search_input[0] && $search_input.val();
            var selected_customer = _this.state.formData.customer_id;
            if(search_input_val && !selected_customer) {
                AppUserFormActions.showCustomerError();
                hasError = true;
            } else {
                AppUserFormActions.hideCustomerError();
            }
            if(hasError) {
                GeminiScrollbar.scrollTo(_this.refs.scrollWrap , 0);
                return;
            }
            var submitData = _this.getSubmitData();
            AppUserFormActions.addAppUser(submitData);
        });
    },
    selectedAppChange: function (selected_apps) {
        AppUserFormActions.setSelectedApps(selected_apps);
    },
    onScrollBarHeightChange : function() {
        if(this.refs.gemini) {
            this.refs.gemini.update();
        }
    },
    renderIndicator : function() {
        if(this.state.submitResult === 'loading') {
            return (
                <Icon type="loading" />
            );
        }
        var hide = function() {
            AppUserFormActions.hideSubmitTip();
        };
        if(this.state.submitResult === 'success') {
            return (
                <AlertTimer time={3000} message={Intl.get("user.user.add.success", "添加成功")} type="success" showIcon onHide={hide}/>
            );
        }
        if(this.state.submitResult === 'error') {
            return (
                <AlertTimer time={3000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide}/>
            );
        }
        return null;
    },
    closeRightPanel : function() {
        AppUserActions.closeRightPanel();
        AppUserFormActions.resetState();
    },
    getCustomerSearchInput : function() {
        var $search_input = $(".ant-select-search__field",this.refs.customer_searchbox);
        return $search_input;
    },
    //当选中客户时
    onCustomerChoosen : function(resultObj) {
        AppUserFormActions.customerChoosen(resultObj);
    },
    //渲染客户区域
    renderCustomerBlock : function() {
        return (
            <div ref="customer_searchbox">
                <CustomerSuggest
                    required={false}
                    show_error={this.state.show_customer_error}
                    onCustomerChoosen={this.onCustomerChoosen}
                    hideCustomerError={AppUserFormActions.hideCustomerError}
                />
            </div>
        );
    },
    resetCustomer : function() {
        AppUserFormActions.resetCustomer();
    },
    render: function () {

        var fixedHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DELTA - LAYOUT_CONSTANTS.BOTTOM_DELTA;
        var status = this.state.status;
        var formData = this.state.formData;
        var app_selector_id = _.uniqueId("app_selector");

        return (
            <div className="full_size wrap_padding">
                <RightPanelClose onClick={this.closeRightPanel}/>
                <Tabs defaultActiveKey="form">
                    <TabPane tab={Intl.get("user.user.add", "添加用户")} key="form">
                        <div className="user_manage_userform" style={{height:fixedHeight}} ref="scrollWrap">
                            <GeminiScrollbar ref="gemini">
                                <Form horizontal>
                                    <Validation ref="validation" onValidate={this.handleValidate}>
                                        <FormItem
                                            label={Intl.get("user.open.account", "开户账号")}
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 13}}
                                            validateStatus={this.renderValidateStyle('user_name')}
                                            help={status.user_name.isValidating ? Intl.get("common.is.validiting", "正在校验中..") : (status.user_name.errors && status.user_name.errors.join(','))}
                                        >
                                            <Validator rules={[{required: true,message: Intl.get("user.username.write.tip", "请填写用户名")}]}>
                                                <Input name="user_name"
                                                       placeholder={Intl.get("user.username.write.tip", "请填写用户名")}
                                                       value={formData.user_name}
                                                       onChange={this.setField.bind(this, 'user_name')}/>
                                            </Validator>
                                        </FormItem>
                                        <FormItem
                                            label={Intl.get("user.open.customer", "开户客户")}
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 13}}
                                        >
                                            {this.renderCustomerBlock()}
                                        </FormItem>
                                        {
                                            this.state.formData.sales_team.name ?
                                                (
                                                    <div className="ant-form-item">
                                                        <label className="col-5"><ReactIntl.FormattedMessage id="user.sales.team" defaultMessage="销售团队" /></label>
                                                        <div className="col-13 txt">
                                                            {this.state.formData.sales_team.name}
                                                        </div>
                                                    </div>
                                                ) : null
                                        }
                                        {
                                            this.state.formData.sales.name ?
                                                (
                                                    <div className="ant-form-item">
                                                        <label className="col-5"><ReactIntl.FormattedMessage id="user.salesman" defaultMessage="销售人员" /></label>
                                                        <div className="col-13 txt">
                                                            {this.state.formData.sales.name}
                                                        </div>
                                                    </div>
                                                ) : null
                                        }
                                        <FormItem
                                            label={Intl.get("user.batch.app.open", "开通产品")}
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 19}}
                                        >
                                            <div ref="app_selector_wrap" className={this.state.show_app_error ? 'permission-required' : ''}>
                                                    <AppSelector
                                                        size={60}
                                                        totalApps={this.state.app_list}
                                                        selectedApps={formData.selected_apps}
                                                        onChange={this.selectedAppChange}
                                                        container={this.refs.app_selector_wrap}
                                                        uniqueId={app_selector_id}
                                                        onHeightChange={this.onScrollBarHeightChange}
                                                    />
                                                {
                                                    this.state.show_app_error && !formData.selected_apps.length ?
                                                        (
                                                            <div className="has-error"><span className="ant-form-explain"><ReactIntl.FormattedMessage id="user.app.select.please" defaultMessage="请选择应用" /></span></div>
                                                        ):
                                                        null
                                                }
                                            </div>
                                        </FormItem>
                                        <div className="ant-form-item">
                                            <div className="col-24">
                                                <div className="app_permission_wrap">
                                                    <AppPermission
                                                        uniqueId={app_selector_id}
                                                        onChange={this.selectedAppChange}
                                                        onHeightChange={this.onScrollBarHeightChange}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <FormItem
                                            label={Intl.get("user.account.type", "开户类型")}
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 19}}
                                        >
                                            <CustomRadioGroup
                                                options={[{name:Intl.get("user.analysis.formal", "正式"),value:"1"},
                                                      {name:Intl.get("common.trial", "试用"),value:"0"}]}
                                                value={formData.user_type}
                                                marginRight={14}
                                                onChange={this.customRadioValueChange.bind(this,'user_type')}
                                            />
                                        </FormItem>
                                        <FormItem
                                            label={Intl.get("user.open.assets", "开通套数")}
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 13}}
                                        >
                                            <InputNumber name="count_number"
                                                         value={formData.count_number}
                                                         min={1}
                                                         max={20}
                                                         onChange={this.setField.bind(this, 'count_number')}/>
                                        </FormItem>
                                        <FormItem
                                            label={Intl.get("user.open.cycle", "开通周期")}
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 19}}
                                        >
                                            <CustomRadioGroup
                                                options={[{name:Intl.get("user.time.one.month", "1个月"),value:"1"},
                                                      {name:Intl.get("user.time.six.month", "6个月"),value:"6"},
                                                      {name:Intl.get("user.time.twelve.month", "12个月"),value:"12"},
                                                      {name:Intl.get("common.time.forever", "永久"),value:"forever"},
                                                      {name:Intl.get("user.time.custom", "自定义"),value:"custom"}]}
                                                value={formData.range}
                                                marginRight={12}
                                                onChange={this.customRadioValueChange.bind(this,'range')}
                                            />
                                        </FormItem>
                                        <FormItem
                                            label={Intl.get("user.time.start", "开通时间")}
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 13}}
                                        >
                                            <div className={formData.range !== 'forever' ? 'customdate' : ''}>
                                                {
                                                    formData.range !== 'forever' ?
                                                        (
                                                            <DatePicker
                                                                value={formData.start_time}
                                                                onChange={this.timeChange.bind(this , 'start_time')}
                                                                disabledDate={formData.range === 'custom'?this.start_time_disable_date:null}
                                                            />
                                                        ) :
                                                        (<Input value={formData.start_time} readOnly='readOnly'/>)
                                                }
                                                <i className="iconfont icon-arrow-down"></i>
                                            </div>
                                        </FormItem>
                                        <FormItem
                                            label={Intl.get("user.time.end", "到期时间")}
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 13}}
                                        >
                                            <div className={formData.range !== 'forever' ? 'customdate' : ''}>
                                                {
                                                    formData.range !== 'forever' ?
                                                        (
                                                            <DatePicker
                                                                value={formData.end_time}
                                                                onChange={this.timeChange.bind(this,'end_time')}
                                                                disabledDate={formData.range === 'custom'?this.end_time_disable_date:null}
                                                            />
                                                        ) :
                                                        (<Input value={formData.end_time} readOnly='readOnly'/>)
                                                }
                                                <i className="iconfont icon-arrow-down"></i>
                                            </div>
                                        </FormItem>
                                        <FormItem
                                            label={Intl.get("user.expire.select", "到期可选")}
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 19}}
                                        >
                                            <RadioGroup onChange={this.radioValueChange.bind(this , 'over_draft')}
                                                        value={formData.over_draft}>
                                                <Radio key="1" value="1"><ReactIntl.FormattedMessage id="user.status.stop" defaultMessage="停用" /></Radio>
                                                <Radio key="2" value="2"><ReactIntl.FormattedMessage id="user.status.degrade" defaultMessage="降级" /></Radio>
                                                <Radio key="0" value="0"><ReactIntl.FormattedMessage id="user.status.immutability" defaultMessage="不变" /></Radio>
                                            </RadioGroup>
                                        </FormItem>
                                        <FormItem
                                            label="账号状态"
                                            labelCol={{span: 5}}
                                            wrapperCol={{span: 19}}
                                        >
                                            <RadioGroup onChange={this.radioValueChange.bind(this , 'user_status')}
                                                        value={formData.user_status}>
                                                <Radio key="1" value="1"><ReactIntl.FormattedMessage id="common.app.status.open" defaultMessage="开启" /></Radio>
                                                <Radio key="0" value="0"><ReactIntl.FormattedMessage id="common.app.status.close" defaultMessage="关闭" /></Radio>
                                            </RadioGroup>
                                        </FormItem>
                                    </Validation>
                                    <div className="clearfix form_btns">
                                        <p className="pull-left">
                                            {Intl.get("user.batch.opener","开户人")}:{this.state.accountHolder}
                                        </p>
                                        <div className="indicator">
                                            {
                                                this.renderIndicator()
                                            }
                                        </div>
                                        <div className="pull-right">
                                            <RightPanelCancel onClick={this.handleCancel}>
                                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                            </RightPanelCancel>
                                            <RightPanelSubmit onClick={this.handleSubmit}>
                                                <ReactIntl.FormattedMessage id="common.sure" defaultMessage="确定" />
                                            </RightPanelSubmit>
                                        </div>
                                    </div>
                                </Form>
                            </GeminiScrollbar>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
});

module.exports = AddOrEditUser;