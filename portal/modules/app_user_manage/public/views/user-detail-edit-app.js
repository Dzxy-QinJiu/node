var RightPanelClose = require("../../../../components/rightPanel").RightPanelClose;
var RightPanelReturn = require("../../../../components/rightPanel").RightPanelReturn;
var RightPanelCancel = require("../../../../components/rightPanel").RightPanelCancel;
var RightPanelSubmit = require("../../../../components/rightPanel").RightPanelSubmit;
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");

var AppUserUtil = require("../util/app-user-util");
var AppUserAction = require("../action/app-user-actions");
var UserDetailEditAppAction = require("../action/user-detail-edit-app-actions");
import UserDetailEditAppStore from "../store/user-detail-edit-app-store";
var AppUserPanelSwitchAction = require("../action/app-user-panelswitch-actions");

var classNames = require("classnames");
var Tabs = require("antd").Tabs;
var TabPane = Tabs.TabPane;
var Icon = require("antd").Icon;
var Form = require("antd").Form;
var FormItem = Form.Item;
var Input = require("antd").Input;
import { DatePicker } from "antd";
var CustomRadioGroup = require("../../../../components/custom_radio_group");
var Radio = require("antd").Radio;
var RadioGroup = Radio.Group;
var AppSelector = require("../../../../components/app-selector/app-selector");
var AppPermission = require("../../../../components/app-selector/app-permission");
var AlertTimer = require("../../../../components/alert-timer");

var LAYOUT_CONSTANTS = $.extend({} , AppUserUtil.LAYOUT_CONSTANTS);//右侧面板常量
LAYOUT_CONSTANTS.BOTTOM_DELTA = 82;

var labelCol = {span: 5};
var wrapperCol = {span: 10};

var UserDetailEditApp = React.createClass({
    app_selector_id : _.uniqueId("app_selector"),
    getDefaultProps : function() {
        return {
            //当前修改的用户
            initialUser : {},
            //当前修改的应用
            appInfo : {}
        };
    },
    closeRightPanel : function() {
        AppUserPanelSwitchAction.resetState();
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
        UserDetailEditAppAction.resetState();
        AppUserAction.closeRightPanel();
    },
    handleSubmit : function(e) {
        e.preventDefault();
        //走批量修改的接口
        var formData = this.state.formData || {};
        var result = {};
        var userList = [this.props.initialUser.user.user_id];
        result.user_ids = JSON.stringify(userList);
        if(this.hasApplyTypeBlock()) {
            //开户类型
            var userType = formData.user_type;
            result.user_type = userType;
            //如果开户类型没值，报错
            if(userType != '0' && userType != '1') {
                UserDetailEditAppAction.showUserTypeError();
                return;
            }
        }
        if(this.hasApplyTimeBlock()) {
            //开通时间
            var startTime = formData.start_time;
            //到期时间
            var endTime = formData.end_time;
            //永久的话，开通时间、到期时间为空
            if(formData.range === 'forever') {
                startTime = '';
                endTime = '';
            }
            result.start_time = startTime;
            result.end_time = endTime;
        }
        if(this.hasApplyStatusBlock()) {
            //到期是否停用
            var overDraft = formData.over_draft;
            //账号状态
            var status = formData.user_status;
            result.over_draft = overDraft;
            result.status = status;
        }

        //添加应用信息
        result.products = {};
        var selected_apps = this.state.formData.selected_apps;
        for(var i = 0, len = selected_apps.length ; i < len ; i++) {
            var appInfo = selected_apps[i];
            result.products[appInfo.app_id] = {
                roles : appInfo.roles,
                permissions : appInfo.permissions
            };
        }
        result.products = JSON.stringify(result.products);
        UserDetailEditAppAction.submitEditApp({
            data : result,
            operation : this.state.subType
        });
    },
    cancel : function() {
        AppUserPanelSwitchAction.resetState();
        //面板向右滑
        AppUserUtil.emitter.emit(AppUserUtil.EMITTER_CONSTANTS.PANEL_SWITCH_RIGHT);
        UserDetailEditAppAction.resetState();
    },
    onWindowResize : function() {
        this.setState({});
    },
    getInitialState : function() {
        return UserDetailEditAppStore.getState();
    },
    componentDidMount: function () {
        $(window).on('resize' , this.onWindowResize);
        UserDetailEditAppStore.listen(this.onStoreChange);
        UserDetailEditAppAction.setEditAppDefaultValue(this.props.appInfo);
    },
    onStoreChange : function() {
        this.setState(UserDetailEditAppStore.getState());
    },
    componentWillUnmount: function () {
        $(window).off('resize' , this.onWindowResize);
        UserDetailEditAppStore.unlisten(this.onStoreChange);
    },
    tabChange : function(type) {
        UserDetailEditAppAction.changeSubType(type);
    },
    customRadioValueChange : function(field,value) {
        UserDetailEditAppAction.hideUserTypeError();
        UserDetailEditAppAction.customRadioValueChange({field, value});
    },
    end_time_disable_date: function (current) {
        return (current && current.getTime() < moment(this.state.formData.start_time).toDate().getTime());
    },
    start_time_disable_date: function (current) {
        return current && current.getTime() > moment(this.state.formData.end_time).toDate().getTime();
    },
    timeChange : function(field,date) {
        UserDetailEditAppAction.timeChange({field, date});
    },
    radioValueChange: function (field, event) {
        var value = event.target.value;
        UserDetailEditAppAction.radioValueChange({field, value});
    },
    renderCustomTab : function() {
        var subType = this.state.subType;
        return (
            <dl className="dl-horizontal">
                <dt><ReactIntl.FormattedMessage id="user.batch.change.type" defaultMessage="变更类型" /></dt>
                <dd className="batch-update-tabs">
                    <CustomRadioGroup
                        options={[
                                  {name:Intl.get("user.app.info.edit", "产品信息修改"),value:"grant_application"},
                                  {name:Intl.get("common.app.status", "开通状态"),value:"grant_status"},
                                  {name:Intl.get("user.open.cycle", "开通周期"),value:"grant_period"},
                                  {name:Intl.get("user.batch.set.auth", "设置权限"), value: "grant_authority"}
                                 ]}
                        value={subType}
                        marginRight={14}
                        onChange={this.tabChange}
                    />
                </dd>
            </dl>
        );
    },
    hasApplyTypeBlock : function() {
        if(this.state.subType === 'grant_application') {
            return true;
        }
        return false;
    },
    //渲染开通类型
    renderApplyType : function() {
        if(!this.hasApplyTypeBlock()) {
            return null;
        }
        var formData = this.state.formData;
        return (
            <div className="clearfix">
                <FormItem
                    label={Intl.get("user.batch.open.type", "开通类型")}
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
                >
                    <CustomRadioGroup
                        options={[{name:"正式",value:"1"},
                                  {name:Intl.get("common.trial", "试用"),value:"0"}]}
                        value={formData.user_type}
                        marginRight={14}
                        onChange={this.customRadioValueChange.bind(this,'user_type')}
                    />
                </FormItem>
                <div className="col-10 col-offset-5" style={{marginTop:'-17px',marginBottom:'17px'}}>
                    {this.state.show_user_type_error ? (<div className="error_form_tip"><ReactIntl.FormattedMessage id="user.open.type.select" defaultMessage="请选择开通类型" /></div>) : null}
                </div>
            </div>
        );
    },
    hasApplyTimeBlock : function() {
        if(
            this.state.subType === 'grant_application' ||
            this.state.subType === 'grant_period'
        ) {
            return true;
        }
        return false;
    },
    //渲染开通时间
    renderApplyTime : function() {
        if(!this.hasApplyTimeBlock()) {
            return null;
        }
        var formData = this.state.formData;
        return (
            <div>
                <FormItem
                    label={Intl.get("user.open.cycle", "开通周期")}
                    labelCol={labelCol}
                    wrapperCol={{span:19}}
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
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
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
                    labelCol={labelCol}
                    wrapperCol={wrapperCol}
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
            </div>
        );
    },
    hasApplyStatusBlock : function() {
        if(
            this.state.subType === 'grant_application' ||
            this.state.subType === 'grant_status'
        ) {
            return true;
        }
        return false;
    },

    renderApplyStatus : function() {
        if(!this.hasApplyStatusBlock()) {
            return;
        }
        var formData = this.state.formData;
        return (
            <div>
                <FormItem
                    label={Intl.get("user.expire.select", "到期可选")}
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
                    label={Intl.get("common.app.status", "开通状态")}
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

    hasApplyAuthorityBlock : function() {
        if(
            this.state.subType === 'grant_application' ||
            this.state.subType === 'grant_authority'
        ) {
            return true;
        }
        return false;
    },

    renderApplyAuthority : function () {
        if(!this.hasApplyAuthorityBlock()) {
            return;
        }
        return (
            <div>
                {this.renderApplyRoles()}
            </div>
        );
    },

    renderIndicator : function() {
        if(this.state.submitResult === 'loading') {
            return (
                <Icon type="loading" />
            );
        }
        var hide = function() {
            UserDetailEditAppAction.hideSubmitTip();
        };
        if(this.state.submitResult === 'success') {
            return (
                <AlertTimer time={3000} message={Intl.get("user.operate.success", "操作成功")} type="success" showIcon onHide={hide}/>
            );
        }
        if(this.state.submitResult === 'error') {
            return (
                <AlertTimer time={3000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide}/>
            );
        }
        return null;
    },
    selectedAppChange : function(selected_apps) {
        UserDetailEditAppAction.setSelectedApps(selected_apps);
    },
    renderApplyRoles : function() {
        //如果在最后一个tab下，并且没有设置角色，则提示一个错误信息
		var notSelectRole = this.state.subType === 'grant_authority' && (!this.state.formData.selected_apps[0].roles || !this.state.formData.selected_apps[0].roles.length);
        return (
            <div>
                {notSelectRole ? (
                    <div className="error_form_tip edit-single-app-roles-error"><ReactIntl.FormattedMessage id="user.role.select.tip" defaultMessage="至少选择一个角色" /></div>
                ) : null}
                <div className="app_permission_wrap">
                    <AppPermission
                        uniqueId={this.app_selector_id}
                        onChange={this.selectedAppChange}
                        onlyEditRoleAndPermission={true}
                        onHeightChange={this.onScrollBarHeightChange}
                    />
                </div>
            </div>

        );
    },
    onScrollBarHeightChange : function() {
        if(this.refs.gemini) {
            this.refs.gemini.update();
        }
    },
    render : function() {
        var fixedHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DELTA - LAYOUT_CONSTANTS.BOTTOM_DELTA;
        var formData = this.state.formData || {};
        return (
            <div style={{height:"100%"}}>
                <RightPanelReturn onClick={this.cancel}/>
                <RightPanelClose onClick={this.closeRightPanel}/>
                <div className="user-detail-edit-app">
                    <Form horizontal>
                        <Tabs defaultActiveKey="editapp">
                            <TabPane tab={this.props.appInfo.app_name} key="editapp">
                                <div className="user_manage_user_detail_editapp" style={{height:fixedHeight}}>
                                    <GeminiScrollbar ref="gemini">
                                        <div className="app_logo">
                                            <div className={this.state.show_app_error ? 'permission-required' : ''}>
                                                <AppSelector
                                                    size={60}
                                                    totalApps={formData.selected_apps}
                                                    selectedApps={formData.selected_apps}
                                                    onChange={this.selectedAppChange}
                                                    uniqueId={this.app_selector_id}
                                                    onlyEditRoleAndPermission={true}
                                                    onHeightChange={this.onScrollBarHeightChange}
                                                />
                                            </div>
                                            <div className="app_status">
                                                {(this.state.formData.user_type + '') === '1' ? '正式':Intl.get("common.trial", "试用")}
                                            </div>
                                        </div>
                                        <div className="app_operation">
                                            <div className="editapp_major_items">
                                                {this.renderCustomTab()}
                                                <dl className="dl-horizontal">
                                                    <dt><ReactIntl.FormattedMessage id="user.change.detail" defaultMessage="变更详情" /></dt>
                                                    <dd>&nbsp;</dd>
                                                </dl>
                                            </div>
                                            <div className="editapp_minor_items">
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
                                                    this.renderApplyAuthority()
                                                }
                                            </div>
                                        </div>
                                    </GeminiScrollbar>
                                </div>
                            </TabPane>
                        </Tabs>
                        <div className="clearfix form_btns">
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
                    </Form>
                </div>
            </div>
        );
    }
});

module.exports = UserDetailEditApp;