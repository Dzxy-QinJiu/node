/**
 * Created by xiaojinfeng on  2015/12/25 11:04 .
 */
var AlertTimer = require("../../../../components/alert-timer");
var PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
var Button = require("antd").Button;
var ModalDialog = require("../../../../components/ModalDialog");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
import Trace from "LIB_DIR/trace";

function noop() {
}
var roleTitleDivHeight = 80; //50+30每组角色列表标题高度+需要留白高度
var RoleList = React.createClass({
    getDefaultProps: function() {
        return {
            editRole: noop,
            deleteRole: noop,
            setDefaultRole: noop
        };
    },
    getInitialState: function() {
        return {
            setDefaulting: false
        };
    },
    componentWillReceiveProps: function(nextProps) {
        this.setState(nextProps);
    },
    //编辑角色
    editRole: function(role) {
        Trace.traceEvent($(this.getDOMNode()).find(".role-btn-class"),"点击编辑角色按钮");
        this.props.editRole(role);
    },

    //删除角色
    deleteRole: function(role) {
        Trace.traceEvent($(this.getDOMNode()).find(".role-title-div"),"删除角色");
        this.props.deleteRole(role);
    },

    //设置默认角色
    setDefault: function(role) {
        let appId = this.props.appId;
        this.props.setDefaultRole({
            app_id: appId,
            base_role: role.roleId
        });
    },

    //
    delDefault: function() {
        this.props.delDefaultRole(this.props.appId);
    },

    //展示删除时的提示框
    showModalDialog: function(role) {
        this.props.showModalDialog(role);
    },

    //隐藏删除时的提示框
    hideModalDialog: function(role) {
        this.props.hideModalDialog(role);
    },
    hideDelTooltip: function() {
        this.props.clearDelErrorMsg();
    },    
    turnToAuthPanel: function() {
        this.props.setShowRoleAuthType("authority");
    },
    //权限列表
    renderAuthList: function(role) {
        var authListEle = [], permissionGroups = role.permissionGroups, _this = this;
        if (_.isArray(permissionGroups) && permissionGroups.length > 0) {
            permissionGroups.map(function(permissionGroup, j) {
                if (permissionGroup && permissionGroup.permissionList && permissionGroup.permissionList.length > 0) {
                    var hasAuth = _.some(permissionGroup.permissionList, function(permission) {
                        return permission.status;
                    });
                    if (hasAuth) {
                        authListEle.push(<div className="authority-group-name-div" key={j}>
                            <div
                                className="authority-group-name">{permissionGroup.permissionGroupName}</div>
                            {
                                permissionGroup.permissionList.map(function(permission, i) {
                                    if (permission.status) {
                                        return (<div className="role-content-list" key={i}>
                                            <div
                                                className="role-authorityName">{permission.permissionName}</div>

                                        </div>);
                                    } else {
                                        return null;
                                    }
                                })
                            }
                        </div>);
                    }
                }
            });
            if (authListEle.length > 0) {
                return authListEle;
            } else {
                return (
                    <div className="no-permissions-msg">
                        <ReactIntl.FormattedMessage
                            id="role.no.auth.set"
                            defaultMessage={`未设置权限，请先{setting}`}
                            values={{
                                "setting": <a onClick={_this.editRole.bind(_this, role)}
                                    data-tracename ="设置权限"
                                >{Intl.get("role.set.auth", "设置权限")}</a>
                            }}
                        />
                    </div>);
            }
        } else {
            return (<div className="no-permissions-msg">
                <ReactIntl.FormattedMessage
                    id="role.no.auth.add"
                    defaultMessage={`未设置权限，请先{add}`}
                    values={{
                        "add": (_this.props.appId ? ( <a onClick={_this.turnToAuthPanel}
                            data-tracename ="添加权限"
                        >{Intl.get("role.add.auth", "添加权限")}</a>): (
                            <Link to="/backgroundManagement/authority" activeClassName="active">
                                {Intl.get("role.add.auth", "添加权限")}</Link>
                        ))
                    }}
                />
            </div>);
        }
    },

    render: function() {
        var _this = this;
        var role = this.props.role;
        var roleListDivHeight = this.props.roleListDivHeight;
        var modalContent = Intl.get("role.del.role.tip", "确定要删除这个角色吗？");        
        return (
            <div className="role-container-div modal-container" style={{ height: roleListDivHeight }}>
                {
                    role.isDefault == "1" ?
                        <div className="crm-contact-default">
                            <span><ReactIntl.FormattedMessage id="my_app" defaultMessage="默认" /></span>
                        </div> : null
                }
                <div className="role-title-div">
                    <div className="role-title-name">{role.roleName}</div>
                    <div className="role-operation" style={{ width: "175px", marginRight: "11px" }}>
                        {
                            role.isDefault == "0" ?
                                <PrivilegeChecker check={this.props.setDefaultRoleStr}>
                                    <Button type="primary"
                                        className="default-btn-fix" size="small"
                                        onClick={this.setDefault.bind(this, role)}
                                        data-tracename={"将'" + role.roleName + "'设置为默认角色"}>
                                        {Intl.get("role.default.set", "默认")}
                                    </Button>
                                </PrivilegeChecker>
                                :
                                <PrivilegeChecker check={this.props.delDefaultRoleStr}>
                                    <Button type="primary"
                                        className="default-btn-fix" size="small"
                                        onClick={this.delDefault.bind(this, role)}
                                        data-tracename={"将'" + role.roleName + "'移除默认角色"}
                                    >
                                        {Intl.get("role.default.del", "取消默认")}
                                    </Button>
                                </PrivilegeChecker>
                        }


                        <PrivilegeChecker check={this.props.delRoleStr}>
                            <Button className="role-btn-class icon-delete iconfont"
                                onClick={_this.showModalDialog.bind(_this, role)}>
                            </Button>
                        </PrivilegeChecker>
                        <PrivilegeChecker check={this.props.editRoleStr}>
                            <Button className="role-btn-class icon-update iconfont"
                                onClick={_this.editRole.bind(_this, role)} />
                        </PrivilegeChecker>
                    </div>

                </div>
                <div className="role-content" style={{ height: roleListDivHeight - roleTitleDivHeight }}>
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        {this.renderAuthList(role)}
                    </GeminiScrollbar>
                </div>
                <ModalDialog modalContent={modalContent}
                    modalShow={role.modalDialogFlag}
                    container={_this}
                    hideModalDialog={_this.hideModalDialog.bind(_this, role)}
                    delete={_this.deleteRole.bind(_this, role)}
                />
                {
                    _this.props.delRoleErrorMsg ? (<AlertTimer time={2000}
                        message={_this.props.delRoleErrorMsg}
                        type='error' showIcon
                        onHide={this.hideDelTooltip} />) : null
                }
            </div>
        );
    }
});

module.exports = RoleList;