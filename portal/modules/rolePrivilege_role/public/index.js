/**
 * Created by xiaojinfeng on  2015/12/22 16:59 .
 */

var language = require("../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("./scss/role-es_VE.scss");
}else if (language.lan() == "zh"){
    require("./scss/role-zh_CN.scss");
}
var Button = require("antd").Button;
var RoleStore = require("./store/role-store");
var RoleAction = require("./action/role-actions");
var RoleListView = require("./views/role-list");
var RoleForm = require("./views/role-form");
var GeminiScrollbar = require('../../../components/react-gemini-scrollbar');
var PrivilegeChecker = require("../../../components/privilege/checker").PrivilegeChecker;
var TopNav = require("../../../components/top-nav");
var Spinner = require("../../../components/spinner");
var NoData = require("../../../components/analysis-nodata");
function getStateFromStore(_this) {
    var storeData = RoleStore.getState();
    storeData.roleContainerHeight = _this.roleContainerHeightFnc();
    return storeData;
}

var topHeight = 98; // 22 + 76 : 添加按钮高度+顶部导航高度
var bootomHeight = 52; //距离底部高度

var RolePage = React.createClass({
    getInitialState: function () {
        return getStateFromStore(this);
    },

    onChange: function () {
        var datas = getStateFromStore(this);
        this.setState(datas);
    },

    resizeWindow: function () {
        this.setState({
            roleContainerHeight: this.roleContainerHeightFnc()
        });
    },

    componentDidMount: function () {
        $(window).on("resize", this.resizeWindow);
        RoleStore.listen(this.onChange);
        RoleAction.getRoleList();
        RoleAction.getDefaultRole();
    },

    componentWillUnmount: function () {
        $(window).off("resize", this.resizeWindow);
        RoleStore.unlisten(this.onChange);
        $("body").css("overflow", "auto");
    },

    roleContainerHeightFnc: function () {
        return $(window).height() - topHeight;
    },

    events: {
        //展示编辑面板
        showRoleForm: function () {
            RoleAction.showRoleForm();
        },
        //隐藏编辑面板
        hideRoleForm: function () {
            RoleAction.hideRoleForm();
        },

        //修改角色时展示编辑面板
        editRole: function (role) {
            RoleAction.showRoleForm(role);
        },

        //删除角色
        deleteRole: function (role) {
            RoleAction.deleteRole(role);
        },

        //添加角色
        addRole: function () {
            RoleAction.showRoleForm();
        },

        //展示删除角色时的提示框
        showModalDialog: function (role) {
            RoleAction.showModalDialog(role);
        },

        //隐藏删除角色时的提示框
        hideModalDialog: function (role) {
            RoleAction.hideModalDialog(role);
        },

        //清除删除失败的提示内容
        clearDelErrorMsg: function () {
            RoleAction.clearDelErrorMsg();
        }
    },

    render: function () {
        var _this = this;
        var height = this.state.roleContainerHeight;
        var roleListDivHeight = height - bootomHeight;
        var repoListElement = "";
        var roleList = this.state.roleList;
        if (roleList && roleList.length > 0) {
            repoListElement = roleList.map(function (role, i) {
                //给当前要删除的角色列表传入删除角色失败的内容
                var delRoleErrorMsg = (role.roleId == _this.state.delRoleId) ? _this.state.delRoleErrorMsg : "";
                return (
                    <div className="backgroundManagement_role_content">
                        <RoleListView
                            key={i}
                            role={role}
                            editRole={_this.events.editRole}
                            deleteRole={_this.events.deleteRole}
                            showModalDialog={_this.events.showModalDialog}
                            hideModalDialog={_this.events.hideModalDialog}
                            clearDelErrorMsg={_this.events.clearDelErrorMsg}
                            delRoleErrorMsg={delRoleErrorMsg}
                            roleListDivHeight={roleListDivHeight}
                            delRoleStr="ROLEP_RIVILEGE_ROLE_DELETE"
                            editRoleStr="ROLEP_RIVILEGE_ROLE_EDIT"
                        />
                    </div>
                );
            })
        }
        return (
            <div className="backgroundManagement_role_content">
                <div className="role-manage-container">
                    <TopNav>
                        <TopNav.MenuList/>
                        <PrivilegeChecker check="ROLEP_RIVILEGE_ROLE_ADD" className="role-add-div">
                            <Button type="ghost" className="role-add-btn"
                                    onClick={this.events.addRole.bind(this)}><ReactIntl.FormattedMessage id="role.add.role" defaultMessage="添加角色" /></Button>
                        </PrivilegeChecker>
                    </TopNav>
                    <RoleForm
                        cancelRoleForm={this.events.hideRoleForm}
                        role={this.state.currentRole}
                        permissionGroups={this.state.permissionGroups}
                        formType={this.state.formType}
                        roleFormShow={this.state.roleFormShow}>
                        ></RoleForm>
                    {this.state.roleListIsLoading ? (<Spinner className="isloading"/>) : (
                        <div className="role-table-block">
                            {
                                this.state.listTipMsg ? (<NoData msg={this.state.listTipMsg}/>) : (
                                    <div style={{height: height}} className="role-container-scroll">
                                        <GeminiScrollbar className="geminiScrollbar-div role-geminiScrollbar-div">
                                            <div className="role-container" style={{height: height}}>
                                                {repoListElement}
                                            </div>
                                        </GeminiScrollbar>
                                    </div>)
                            }
                        </div>)}
                </div>
            </div>
        );
    }
});

module.exports = RolePage;
