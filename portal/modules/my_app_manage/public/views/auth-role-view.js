/**
 * Created by wangliping on 2016/8/12.
 */

var language = require("../../../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("../../../rolePrivilege_authority/public/css/authority-es_VE.less");
    require("../../../rolePrivilege_role/public/css/role-es_VE.less");
}else if (language.lan() == "zh"){
    require("../../../rolePrivilege_authority/public/css/authority-zh_CN.less");
    require("../../../rolePrivilege_role/public/css/role-zh_CN.less");
}
var Tabs = require("antd").Tabs;
var TabPane = Tabs.TabPane;
var Button = require("antd").Button;
var rightPanelUtil = require("../../../../components/rightPanel/index");
var RightPanel = rightPanelUtil.RightPanel;
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RoleForm = require("../../../rolePrivilege_role/public/views/role-form");
var AuthorityForm = require("../../../rolePrivilege_authority/public/views/authority-form");
var UserInfoRole = require("./user-role");
var UserInfoAuthority = require("./user-authority");
var RoleStore = require("../../../rolePrivilege_role/public/store/role-store");
var AuthorityStore = require("../../../rolePrivilege_authority/public/store/authority-store");
var RoleAction = require("../../../rolePrivilege_role/public/action/role-actions");
var AuthorityAction = require("../../../rolePrivilege_authority/public/action/authority-actions");
var ImportFile = require("./upload-file");
import Trace from "LIB_DIR/trace";
import { Upload, Icon, message } from "antd";

var topHeight = 64;//顶部导航的高度
var paddingBottom = 30;//距离底部高度
var TYPE_CONSTANT = "myApp";
var AuthRoleView = React.createClass({
    getInitialState: function () {
        var appRoleState = RoleStore.getState();
        var authorityState = AuthorityStore.getState();
        return {
            ...appRoleState,
            ...authorityState,
            userInfoContainerHeight: this.userInfoContainerHeightFnc(),
            userInfoContainerWidth: this.userInfoContainerWidthFnc(),
            uploadFileRightPanelShow : false
        };
    },
    onChange: function () {
        this.setState(this.getInitialState());
    },

    componentDidMount: function () {
        $(window).on("resize", this.resizeWindow);
        RoleStore.listen(this.onChange);
        AuthorityStore.listen(this.onChange);
    },
    componentWillUnmount: function () {
        $(window).off("resize", this.resizeWindow);
        RoleStore.unlisten(this.onChange);
        AuthorityStore.unlisten(this.onChange);
    },
    resizeWindow: function () {
        this.setState({
            userInfoContainerHeight: this.userInfoContainerHeightFnc(),
            userInfoContainerWidth: this.userInfoContainerWidthFnc()
        });
    },
    userInfoContainerHeightFnc: function () {
        var height = $("body").height() - topHeight - paddingBottom;
        return height;
    },

    userInfoContainerWidthFnc: function () {
        var width = $("body").width() - 90 - 75;
        return width;
    },

    
    events: {
        handleChangeTabPane: function (key) {
            this.props.setShowRoleAuthType(key);
            if (key == "authority") {
                Trace.traceEvent($(this.getDOMNode()).find(".authority-formItem-group"),"权限列表");
                AuthorityAction.setAuthListLoading(true);
                AuthorityAction.getAuthorityList(this.props.curAppId, TYPE_CONSTANT);
            } else if (key == "role") {
                Trace.traceEvent($(this.getDOMNode()).find(".role-manage-container"),"角色列表");
                RoleAction.setRoleListLoading(true);
                RoleAction.getRoleList(this.props.curAppId, TYPE_CONSTANT);
            }
        },

        //添加角色
        addRole: function (e) {
            e.stopPropagation();
            Trace.traceEvent(e,"添加角色");
            RoleAction.showRoleForm();
        },

        showAddAuthorityGroupForm: function (e) {
            e.stopPropagation();
            Trace.traceEvent(e,"点击添加权限组");
            AuthorityAction.showAuthorityForm("", "addAuthorityGroup");
        },

        //隐藏编辑面板
        hideRoleForm: function () {
            RoleAction.hideRoleForm();
        },

        hideAuthorityForm: function () {
            AuthorityAction.hideAuthorityForm();
        },

        hideAuthorityInfoFnc: function (authority) {
            AuthorityAction.hideAuthorityInfoFnc(authority);
        },

        editAuthority: function (authority) {
            AuthorityAction.editAuthority(authority, TYPE_CONSTANT);
        },

        showAuthorityInfo: function (authority) {
            AuthorityAction.showAuthorityForm(authority);
            AuthorityAction.showAuthorityInfoFnc(authority);
        }
    },

    showUploadFile : function(e){
        {this.props.showRoleAuthType == "role" ? Trace.traceEvent($(this.getDOMNode()).find(".upload-role"),"导入角色") :
            Trace.traceEvent($(this.getDOMNode()).find(".upload-authority"),"导入权限")}
        this.setState({
            uploadFileRightPanelShow : true
        });
    },

    closeUploadFile : function (e) {
        Trace.traceEvent(e,"关闭上传界面");
        this.setState({
            uploadFileRightPanelShow : false
        });
    },

    render: function () {
        var height = this.state.userInfoContainerHeight;
        var width = this.state.userInfoContainerWidth;
        var isShowRoleButton =  _.isArray(RoleStore.getState().roleList) &&
                                    RoleStore.getState().roleList.length > 0 ;
        var isShowAuthorityButton = _.isArray(AuthorityStore.getState().authorityGroupList) &&
                                    AuthorityStore.getState().authorityGroupList.length > 0;
        return (
            <div className="user-authority-container-div" data-tracename="角色列表和权限列表">
                <div className="custom-top-menu-add-btn" >
                    {
                        this.props.showRoleAuthType == "role" ? (
                            <div className="my-app-manage-role-style" data-tracename="角色列表">
                                <Button type="ghost" className="upload-role" onClick={this.showUploadFile}>
                                    {Intl.get("role.import.role", "导入角色")}
                                </Button>

                                {isShowRoleButton  ?
                                    <a
                                        href={"/rest/my_app/export_role/" +this.props.curAppId }
                                        className="download-role"
                                        data-tracename="导出角色"
                                    >
                                        {Intl.get("role.export.role", "导出角色")}
                                    </a>  : null
                                }

                                <Button type="ghost" className="role-add-btn custom-top-add-btn"
                                        onClick={this.events.addRole}>{Intl.get("role.add.role", "添加角色")}</Button>
                            </div>
                        )
                             : (
                            <div className="my-app-manage-authority-style" data-tracename="权限列表">
                                <Button type="ghost" className="upload-authority" onClick={this.showUploadFile}>
                                    {Intl.get("authority.import.auth", "导入权限")}
                                </Button>
                                {isShowAuthorityButton  ?
                                    <a
                                        href={"/rest/my_app/export_authority/" + this.props.curAppId }
                                        className="download-authority"
                                    >
                                        {Intl.get("authority.export.auth", "导出权限")}
                                    </a>  :  null
                                }

                                <Button type="ghost" className="authority-add-btn custom-top-add-btn"
                                        onClick={this.events.showAddAuthorityGroupForm}>{Intl.get("authority.add.group", "添加权限组")}</Button>
                            </div>
                        )

                    }

                </div>
                <RightPanelClose onClick={this.props.closeAuthRolePanel}/>
                <RoleForm
                    cancelRoleForm={this.events.hideRoleForm}
                    role={this.state.currentRole}
                    permissionGroups={this.state.permissionGroups}
                    formType={this.state.formType}
                    roleFormShow={this.state.roleFormShow}
                    appId={this.props.curAppId}
                    setShowRoleAuthType={this.props.setShowRoleAuthType}
                >
                </RoleForm>


                <ImportFile
                    showFlag={this.state.uploadFileRightPanelShow}
                    closeUploadFile={this.closeUploadFile}
                    showRoleAuthType = {this.props.showRoleAuthType}
                />

                <RightPanel showFlag={this.state.authorityFormShow}>
                    <AuthorityForm
                        showAuthorityInfo={this.events.showAuthorityInfo}
                        showAuthorityInfoFlag={this.state.showAuthorityInfoFlag}
                        isEditAuthority={this.state.isEditAuthority}
                        isAddAuthorityGroup={this.state.isAddAuthorityGroup}
                        cancelAuthorityForm={this.events.hideAuthorityForm}
                        editAuthority={this.events.editAuthority}
                        authorityGroupInfo={this.state.authorityGroupInfo}
                        authority={this.state.authorityInfo}
                        appId={this.props.curAppId}
                    >
                    </AuthorityForm>
                </RightPanel>
                <Tabs onChange={this.events.handleChangeTabPane.bind(this)} activeKey={this.props.showRoleAuthType}>
                    <TabPane tab={Intl.get("role.role.list", "角色列表")} key="role">
                        <UserInfoRole
                            setShowRoleAuthType={this.props.setShowRoleAuthType}
                            roleList={this.state.roleList}
                            divHeight={height}
                            divWidth={width}
                            curAppId={this.props.curAppId}
                        >
                        </UserInfoRole>
                    </TabPane>
                    <TabPane tab={Intl.get("authority.auth.list", "权限列表")} key="authority">
                        <UserInfoAuthority
                            divHeight={height}
                            divWidth={width}
                            curAppId={this.props.curAppId}
                        >
                        </UserInfoAuthority>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
});

module.exports = AuthRoleView;