var React = require('react');
const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * Created by jinfeng on 2015/12/28.
 */
var Link = require('react-router').Link;
var Form = require('antd').Form;
var Input = require('antd').Input;
var Button = require('antd').Button;
var Checkbox = require('antd').Checkbox;
var FormItem = Form.Item;
var classNames = require('classnames');
var AlertTimer = require('../../../../components/alert-timer');
var Spinner = require('../../../../components/spinner');
var rightPanelUtil = require('../../../../components/rightPanel/index');
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
var RightPanelCancel = rightPanelUtil.RightPanelCancel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var RoleFormStore = require('../store/role-form-store');
var RoleFormAction = require('../action/role-form-actions');
var language = require('../../../../public/language/getLanguage');
import Trace from 'LIB_DIR/trace';
function noop() {
}

var TYPE_CONSTANT = 'myApp';
let CONSTANTS = {
    PADDING_TOP: 26,
    ROLE_NAME_H: 55,
    AUTH_TITLE_H: 30,
    //AUTH_MARGIN_BOTTOM: 15,
    SAVE_BTN_H: 65
};

var RoleForm = React.createClass({
    mixins: [Validation.FieldMixin],
    getDefaultProps: function() {
        return {
            cancelRoleForm: noop,
            role: {
                roleId: '',
                roleName: '',
                permissionGroups: []
            },
            roleFormShow: false
        };
    },
    getFormData: function(props) {
        var formData = $.extend(true, {}, props.role);
        if (props.formType == 'add') {
            formData.permissionGroups = $.extend(true, [], props.permissionGroups);
        }
        return formData;
    },
    getInitialState: function() {
        var stateData = RoleFormStore.getState();
        return {
            status: {
                roleName: {},
                permissionGroups: {}
            },
            formData: this.getFormData(this.props),
            roleFormShow: this.props.roleFormShow,
            allAuthIsShow: true,//展开收起所有权限的标识
            isSaving: stateData.isSaving,//是否正在保存
            saveMsg: stateData.saveMsg//保存失败后的提示信息
        };
    },
    onChange: function() {
        var stateData = RoleFormStore.getState();
        this.setState({
            isSaving: stateData.isSaving,//是否正在保存
            saveMsg: stateData.saveMsg//保存失败后的提示信息
        });
    },
    componentDidMount: function() {
        RoleFormStore.listen(this.onChange);
    },

    componentWillUnmount: function() {
        RoleFormStore.unlisten(this.onChange);
    },

    componentWillReceiveProps: function(nextProps) {
        this.refs.validation.reset();
        var stateData = this.getInitialState();
        stateData.formData = this.getFormData(nextProps);
        stateData.roleFormShow = nextProps.roleFormShow;
        this.setState(stateData);
    },

    componentDidUpdate: function() {
        if (this.state.formData.roleId) {
            this.refs.validation.validate(noop);
        }
    },

    renderValidateStyle: function(item) {
        var formData = this.state.formData;
        var status = this.state.status;

        var classes = classNames({
            'error': status[item].errors,
            'validating': status[item].isValidating,
            'success': formData[item] && !status[item].errors && !status[item].isValidating
        });

        return classes;
    },

    //取消事件
    handleCancel: function(e) {
        e.preventDefault();
        Trace.traceEvent(e,'点击取消保存角色按钮');
        this.props.cancelRoleForm(e);
    },

    //保存角色信息
    handleSubmit: function(e) {
        e.preventDefault();
        Trace.traceEvent(e,'点击保存角色按钮');
        var validation = this.refs.validation;
        var _this = this;
        validation.validate(function(valid) {
            if (!valid) {
                return;
            } else {
                var role = _this.state.formData;
                RoleFormAction.setSavingFlag(true);
                if (_this.props.formType == 'add') {
                    //添加角色
                    if (_this.props.appId) {
                        //我的应用中 添加角色
                        RoleFormAction.addRole(role, _this.props.appId, TYPE_CONSTANT);
                    } else {
                        RoleFormAction.addRole(role);
                    }
                } else {
                    //修改角色
                    if (_this.props.appId) {
                        //修改 我的应用中的 角色
                        RoleFormAction.editRole(role, _this.props.appId, TYPE_CONSTANT);
                    } else {
                        RoleFormAction.editRole(role);
                    }

                }

            }
        });
    },

    //获取当前选中权限
    handleCheckBox: function(event) {
        var curId = event.target.id, checked = event.target.checked;
        if (_.isArray(this.state.formData.permissionGroups) && this.state.formData.permissionGroups.length > 0) {
            this.state.formData.permissionGroups.forEach(
                function(permisssionGroup) {
                    if (_.isArray(permisssionGroup.permissionList) && permisssionGroup.permissionList.length > 0) {
                        permisssionGroup.permissionList.forEach(function(permission) {
                            if (permission.permissionId == curId) {
                                permission.status = checked;
                            }
                        });
                    }
                }
            );
            this.setState({
                formData: this.state.formData
            }
            );
        }
    },
    //全选、取消选中的处理
    handleSelectAllAuthority: function(curPermissionGroupName, flag) {
        if (flag) {
            Trace.traceEvent($(this.getDOMNode()).find('.form-authority-group-name-btn-label'),'选中全部的权限');
        } else {
            Trace.traceEvent($(this.getDOMNode()).find('.form-authority-group-name-btn-label'),'取消选中的权限');
        }
        if (_.isArray(this.state.formData.permissionGroups) && this.state.formData.permissionGroups.length > 0) {
            this.state.formData.permissionGroups.forEach(
                function(permisssionGroup) {
                    if (permisssionGroup.permissionGroupName == curPermissionGroupName) {
                        if (_.isArray(permisssionGroup.permissionList) && permisssionGroup.permissionList.length > 0) {
                            permisssionGroup.permissionList.forEach(function(permission) {
                                permission.status = flag;
                            });
                        }
                    }
                }
            );
            this.setState({
                formData: this.state.formData
            }
            );
        }
    },

    //反选
    reverseSelectAuthority: function(curPermissionGroupName) {
        Trace.traceEvent($(this.getDOMNode()).find('.form-authority-group-name-btn-label'),'反选权限');
        if (_.isArray(this.state.formData.permissionGroups) && this.state.formData.permissionGroups.length > 0) {
            this.state.formData.permissionGroups.forEach(
                function(permisssionGroup) {
                    if (permisssionGroup.permissionGroupName == curPermissionGroupName)
                        if (_.isArray(permisssionGroup.permissionList) && permisssionGroup.permissionList.length > 0) {
                            permisssionGroup.permissionList.forEach(function(permission) {
                                permission.status = !permission.status;
                            });
                        }
                }
            );
            this.setState({
                formData: this.state.formData
            }
            );
        }
    },
    hideSaveTooltip: function() {
        RoleFormAction.clearSaveFlags();
    },
    //转到权限设置面板（我的应用中的处理）
    turnToAuthPanel: function(e) {
        this.handleCancel(e);
        this.props.setShowRoleAuthType('authority');
    },
    //展示收起单个权限组的处理
    toggleAuth: function(curPermissionGroupName) {
        if (_.isArray(this.state.formData.permissionGroups) && this.state.formData.permissionGroups.length > 0) {
            this.state.formData.permissionGroups.forEach(
                function(permisssionGroup) {
                    if (permisssionGroup.permissionGroupName == curPermissionGroupName) {
                        permisssionGroup.isShow = !permisssionGroup.isShow;
                    }
                }
            );
            this.setState({
                formData: this.state.formData
            }
            );
        }
    },
    //展示收起所有权限分组的处理
    toggleAllAuth: function() {
        if (this.state.allAuthIsShow ) {
            Trace.traceEvent($(this.getDOMNode()).find('.form-authority-container'),'全部收起权限');
        } else {
            Trace.traceEvent($(this.getDOMNode()).find('.form-authority-container'),'全部展开权限');
        }

        let allAuthIsShow = !this.state.allAuthIsShow;//展示、收起所有权限分组的切换
        if (_.isArray(this.state.formData.permissionGroups) && this.state.formData.permissionGroups.length > 0) {
            this.state.formData.permissionGroups.forEach(permisssionGroup => {
                permisssionGroup.isShow = allAuthIsShow;
            });
        }
        this.setState({
            formData: this.state.formData,
            allAuthIsShow: allAuthIsShow
        });
    },

    render: function() {
        var _this = this;
        var formData = this.state.formData;
        var status = this.state.status;
        if (!this.state.roleFormShow) {
            //关闭界面时将滚动条置顶
            GeminiScrollbar.scrollTo(this.refs.roleFormScroll, 0);
        }
        var permissionGroups = formData.permissionGroups;
        var hasPermission = _.isArray(permissionGroups) && permissionGroups.length > 0;
        let scrollHeight = $(window).height() - CONSTANTS.PADDING_TOP - CONSTANTS.ROLE_NAME_H - CONSTANTS.AUTH_TITLE_H - CONSTANTS.SAVE_BTN_H;
        return (
            <RightPanel className="white-space-nowrap" showFlag={this.state.roleFormShow} >
                <RightPanelClose onClick={this.handleCancel}/>
                <Form horizontal className="role-form">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <FormItem
                            label={Intl.get('common.role', '角色')}
                            id="edit-roleName"
                            labelCol={{span: 5}}
                            wrapperCol={{span: 18}}
                            validateStatus={this.renderValidateStyle('roleName')}
                            help={status.roleName.isValidating ? Intl.get('common.is.validiting', '正在校验中..') : (status.roleName.errors && status.roleName.errors.join(','))}>
                            <Validator rules={[{required: true, min: 1, max: 20 , message: Intl.get('common.input.character.prompt', '最少1个字符,最多20个字符')}]}>
                                <Input name="roleName" id="edit-roleName" value={formData.roleName}
                                    onChange={this.setField.bind(this, 'roleName')}
                                    placeholder={Intl.get('common.required.tip', '必填项*')}
                                />
                            </Validator>
                        </FormItem>
                        <FormItem
                            label={Intl.get('common.app.auth', '权限')}
                            prefixCls="role-auth-item ant-form"
                            labelCol={{span: 5}}
                            wrapperCol={{span: 18}}
                        >
                            {hasPermission ? (<div className="form-authority-container">
                                <div className="toggle-auth-btns" onClick={this.toggleAllAuth}>{
                                    this.state.allAuthIsShow ?
                                        (
                                            <a ><ReactIntl.FormattedMessage id="role.all.hide" defaultMessage="全部收起" /><span
                                                className="iconfont icon-up-twoline all-auth-toggle-btn"/></a>) :
                                        (<a ><ReactIntl.FormattedMessage id="role.all.show" defaultMessage="全部展开" /><span
                                            className="iconfont icon-down-twoline all-auth-toggle-btn"/></a>)
                                }
                                </div>
                                <div className="right-form-scroll-div" ref="roleFormScroll"
                                    style={{height: scrollHeight}} data-tracename ="选择权限">
                                    <GeminiScrollbar className="geminiScrollbar-vertical">
                                        {permissionGroups.map(function(permissionGroup, j) {
                                            return (
                                                <div className="form-authority-group-div" key={j}>
                                                    <div
                                                        className="form-authority-group-name-div">
                                                        <div
                                                            className="form-authority-group-name"
                                                            onClick={_this.toggleAuth.bind(_this, permissionGroup.permissionGroupName)}>
                                                            {permissionGroup.permissionGroupName}
                                                        </div>
                                                        <div className="form-authority-group-name-btn" >
                                                            <Button type="ghost"
                                                                className="form-authority-group-name-btn-label"
                                                                onClick={_this.handleSelectAllAuthority.bind(_this, permissionGroup.permissionGroupName, true)}
                                                            >
                                                                <ReactIntl.FormattedMessage id="authority.all.select" defaultMessage="全选" />
                                                            </Button>
                                                            <Button type="ghost"
                                                                className="form-authority-group-name-btn-label"
                                                                onClick={_this.reverseSelectAuthority.bind(_this, permissionGroup.permissionGroupName)}
                                                            >
                                                                <ReactIntl.FormattedMessage id="authority.invert.select" defaultMessage="反选" />
                                                            </Button>
                                                            <Button type="ghost"
                                                                className="form-authority-group-name-btn-label"
                                                                onClick={_this.handleSelectAllAuthority.bind(_this, permissionGroup.permissionGroupName, false)}
                                                            >
                                                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {permissionGroup.isShow ? (permissionGroup.permissionList.map(function(permission, i) {
                                                        return (<label className="edit-role-content-label" key={i}>
                                                            <Checkbox id={permission.permissionId}
                                                                className="ant-checkbox-vertical edit-role-checkbox"
                                                                checked={permission.status}
                                                                onChange={_this.handleCheckBox}/>
                                                            <span
                                                                className="permission-item">{permission.permissionName}</span>
                                                        </label> );
                                                    })) : null}
                                                </div>);
                                        })}
                                    </GeminiScrollbar>
                                </div>
                            </div>) : (<div className="no-permissions-msg">
                                <ReactIntl.FormattedMessage
                                    id="role.no.set.auth.add"
                                    defaultMessage={'暂无权限,请先{add}'}
                                    values={{
                                        'add': (_this.props.appId ? ( <a onClick={_this.turnToAuthPanel}>{Intl.get('role.add.auth', '添加权限')}</a>) : (
                                            <Link to="/backgroundManagement/authority" activeClassName="active">
                                                {Intl.get('role.add.auth', '添加权限')}</Link>
                                        ))
                                    }}
                                />
                            </div>)

                            }
                        </FormItem>
                        {hasPermission ? ( <FormItem
                            wrapperCol={{span: 23}}>
                            {this.state.saveMsg ? (
                                <div className="indicator">
                                    <AlertTimer time={3000}
                                        message={this.state.saveMsg}
                                        type="error" showIcon
                                        onHide={this.hideSaveTooltip}/>
                                </div>) : null
                            }
                            <RightPanelCancel onClick={this.handleCancel}>
                                <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                            </RightPanelCancel>
                            <RightPanelSubmit onClick={this.handleSubmit}>
                                <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" />
                            </RightPanelSubmit>
                        </FormItem>) : null}
                    </Validation>
                </Form>
                {this.state.isSaving ? (<div className="right-pannel-block">
                    <Spinner className="right-panel-saving"/>
                </div>) : null}
            </RightPanel>
        );
    }
});

module.exports = RoleForm;

