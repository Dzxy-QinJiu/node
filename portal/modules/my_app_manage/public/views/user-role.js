var RoleStore = require("../../../rolePrivilege_role/public/store/role-store");
var RoleAction = require("../../../rolePrivilege_role/public/action/role-actions");
var RoleListView = require("../../../rolePrivilege_role/public/views/role-list");
var Spinner = require("../../../../components/spinner");
var NoData = require("../../../../components/analysis-nodata");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
function getStateFromStore() {
    var roleState = RoleStore.getState();
    return {
        roleFormShow: roleState.roleFormShow,
        currentRole: roleState.currentRole,
        roleListIsLoading: roleState.roleListIsLoading,
        listTipMsg: roleState.listTipMsg,
        delRoleErrorMsg: roleState.delRoleErrorMsg,
        delRoleId: roleState.delRoleId,
        setDefaulting: roleState.setDefaulting
    };
}

var bootomHeight = 52; //距离底部高度
var TYPE_CONSTANT = "myApp";
var UserRolePage = React.createClass({
    getInitialState: function() {
        return getStateFromStore(this);
    },
    
    onChange: function() {
        var datas = getStateFromStore(this);
        this.setState(datas);
    },
    componentDidMount: function() {
        RoleStore.listen(this.onChange);
        RoleAction.setRoleListLoading(true);
        RoleAction.getRoleList(this.props.curAppId, TYPE_CONSTANT);
    },
    componentWillUnmount: function() {
        $(window).unbind("resize");
        RoleStore.unlisten(this.onChange);
        $("body").css("overflow", "auto");
    },

    events: {
        //修改角色时展示编辑面板
        editRole: function(role) {
            RoleAction.showRoleForm(role);
        },

        //删除角色
        deleteRole: function(role) {
            RoleAction.deleteRole(role, TYPE_CONSTANT);
        },

        //添加角色
        addRole: function() {
            RoleAction.showRoleForm();
        },

        setDefaultRole: function(param) {
            if (this.state.setDefaulting) {
                return;
            }
            this.state.setDefaulting = true;
            RoleAction.setDefaultRole(param);
        },

        delDefaultRole: function(appId) {
            RoleAction.delDefaultRole({ app_id: appId });
        },


        //展示删除角色时的提示框
        showModalDialog: function(role) {
            RoleAction.showModalDialog(role);
        },

        //隐藏删除角色时的提示框
        hideModalDialog: function(role) {
            RoleAction.hideModalDialog(role);
        },

        //清除删除失败的提示内容
        clearDelErrorMsg: function() {
            RoleAction.clearDelErrorMsg();
        }
    },

    render: function() {
        var _this = this;
        var roleList = this.props.roleList || [];
        var height = this.props.divHeight;
        var width = this.props.divWidth;
        var roleListDivHeight = height - bootomHeight;
        var repoListElement = "";
        if (roleList && roleList.length > 0) {
            repoListElement = roleList.map(function(role, i) {
                //给当前要删除的角色列表传入删除角色失败的内容
                var delRoleErrorMsg = (role.roleId == _this.state.delRoleId) ? _this.state.delRoleErrorMsg : "";
                return (
                    <RoleListView
                        key={i}
                        role={role}
                        clearDelErrorMsg={_this.events.clearDelErrorMsg}
                        delRoleErrorMsg={delRoleErrorMsg}
                        editRole={_this.events.editRole}
                        deleteRole={_this.events.deleteRole}
                        setDefaultRole={_this.events.setDefaultRole.bind(_this)}
                        delDefaultRole={_this.events.delDefaultRole}
                        showModalDialog={_this.events.showModalDialog}
                        hideModalDialog={_this.events.hideModalDialog}
                        setShowRoleAuthType={_this.props.setShowRoleAuthType}
                        appId={_this.props.curAppId}
                        roleListDivHeight={roleListDivHeight}
                        delRoleStr="USER_INFO_MYAPP_ROLE_DELETE"
                        editRoleStr="USER_INFO_MYAPP_ROLE_EDIT"
                        setDefaultRoleStr="APPLICATION_BASE_ROLE_MANAGEMENT"
                        delDefaultRoleStr="APPLICATION_BASE_ROLE_MANAGEMENT"
                    />
                );
            });
        }
        return (
            <div className="role-manage-container" data-tracename="角色列表">
                <div className="role-table-block">
                    <div style={{ height: height, width: width }} className="role-container-scroll">
                        {
                            _this.state.roleListIsLoading ? (
                                <Spinner className="isloading" />) : (_this.state.listTipMsg ? (
                                <NoData msg={_this.state.listTipMsg} />) : (
                                <GeminiScrollbar className="geminiScrollbar-div role-geminiScrollbar-div">
                                    <div className="role-container" style={{ height: height }}>
                                        {repoListElement}
                                    </div>
                                </GeminiScrollbar>))
                        }
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = UserRolePage;