require("./index.less");
var Spinner = require("../../spinner");
var Ajax = require("./ajax");
var appAjaxTrans = require('../../../modules/common/public/ajax/app');
var Alert = require("antd").Alert;
var Icon = require("antd").Icon;
var history = require("../../../public/sources/history");
var userData = require("../../../public/sources/user-data");
var classNames = require("classnames");
var Tabs = require("antd").Tabs;
var TabPane = Tabs.TabPane;
var Tooltip = require("antd").Tooltip;
var myAppEmitter = require("../../../public/sources/utils/emitters").myAppEmitter;
//常量
var CONSTANTS = {
    LOADING : "loading",
    SUCCESS : "success",
    ERROR : "error",
    RELOAD: "reload",
    INFO : "info",
    TOOLTIP_TITLE : Intl.get("user.select.role.include.auth", "选中的角色中已包含此权限"),
    TOOLTIP_PLACEMENT : "top",
    ROLE_ERROR_MSG : Intl.get("user.curr.app.get.role.failed", "当前应用获取角色数据失败"),
    PERMISSION_ERROR_MSG : Intl.get("user.curr.app.get.auth.failed", "当前应用获取权限数据失败"),
    ROLE_PERMISSION_ERROR_MSG : Intl.get("user.curr.app.get.role.auth.failed", "当前应用获取角色、权限数据失败"),
    NO_ROLE_PERMISSION_DATA : Intl.get("user.curr.app.no.role.auth.data", "当前应用没有角色和权限数据"),
    NO_ROLE_DATA : Intl.get("user.curr.app.no.role", "当前应用没有角色数据"),
    NO_PERMISSION_DATA : Intl.get("user.curr.app.no.auth", "当前应用没有权限数据"),
    CONTACT_APP_ADMIN : Intl.get("user.contact.app.manager", "请联系应用管理员"),
    RELOAD_TITLE : Intl.get("common.get.again", "重新获取")
};

/**
 * 应用，角色，权限选择
 * 针对某一个应用，提供角色和权限的选择
 *
 * <AppRolePermission
 *   //应用id
 *   app_id="app_id_1"
 *   selectedRoles=["role_id_1","role_id_2"]
 *   selectedPermissions=["permission_id_1","permission_id_2"]
 *   //选择了角色、应用的时候，回调这个方法，把角色、权限传递出去
 *   onRolesPermissionSelect={function(roles , permissions) {console.log(roles,permissions);}}
 * />
 *
 */

var AppRolePermission = React.createClass({
    getDefaultProps : function() {
        return {
            className : '',
            app_id : '',
            selectedRoles : [],
            selectedPermissions : [],
            onRolesPermissionSelect : function() {},
            updateScrollBar : function() {}
        };
    },
    getRolesPermissionsByAjax : function(app_id) {
        this.getRolesByAjax(app_id);
        this.getPermissionsByAjax(app_id);
    },
    isMyApp : function() {
        return _.any(this.state.myApps , (app) => app.app_id === this.props.app_id);
    },
    getMyApps : function() {
        //获取我的应用列表
        appAjaxTrans.getOwnerAppListAjax().sendRequest().success((list) => {
            this.setState({myApps : list});
        }).error(() => {
            this.setState({myApps : []});
        }).timeout(() => {
            this.setState({myApps : []});
        });
    },
    getRolesByAjax : function(app_id) {
        this.setState({
            ajaxRolesResult : CONSTANTS.LOADING,
            ajaxRolesList : [],
            ajaxRolesErrorMsg : ""
        });
        Ajax.getRoleList(app_id).then((ajaxRolesList)=>{
            //计算selectedRolesAlreadyContainedPermissionIds
            var selectedRolesAlreadyContainedPermissionIds = _.chain(this.state.selectedRolesList).map((roleId) => {
                var findedRole = _.find(ajaxRolesList , (role) => role.role_id === roleId);
                return findedRole ? findedRole.permission_ids : [];
            }).flatten().value();
            //计算selectedPermissionList
            var selectedPermissionList = _.filter(this.state.selectedPermissionList , (permission_id) => selectedRolesAlreadyContainedPermissionIds.indexOf(permission_id) < 0);
            this.setState({
                selectedPermissionList : selectedPermissionList,
                selectedRolesAlreadyContainedPermissionIds : selectedRolesAlreadyContainedPermissionIds,
                ajaxRolesResult : CONSTANTS.SUCCESS,
                ajaxRolesList : ajaxRolesList,
                ajaxRolesErrorMsg : ""
            });
        },(ajaxRolesErrorMsg)=>{
            this.setState({
                ajaxRolesResult : CONSTANTS.ERROR,
                ajaxRolesList : [],
                ajaxRolesErrorMsg : ajaxRolesErrorMsg || CONSTANTS.ROLE_ERROR_MSG
            });
        });
    },
    getPermissionsByAjax : function(app_id) {
        this.setState({
            ajaxPermissionResult : CONSTANTS.LOADING,
            ajaxPermissionList : [],
            ajaxPermissionErrorMsg : ""
        });
        Ajax.getPermissionMap(app_id).then((ajaxPermissionList)=>{
            //计算defaultActivePermissionTabKey
            //默认选中的tab key，以便让用户能够看到第一个选中的权限
            var selectedPermissionList = this.state.selectedPermissionList;
            var defaultActivePermissionTabKey = _.findIndex(ajaxPermissionList , function(permissionGroup,i) {
                return _.find(permissionGroup.permission_list , function(permission) {
                    return selectedPermissionList.indexOf(permission.permission_id) >= 0;
                });
            });
            if(defaultActivePermissionTabKey === -1) {
                defaultActivePermissionTabKey = 0;
            }
            this.setState({
                defaultActivePermissionTabKey : defaultActivePermissionTabKey + '',
                ajaxPermissionResult : CONSTANTS.SUCCESS,
                ajaxPermissionList : ajaxPermissionList,
                ajaxPermissionErrorMsg : ""
            });
        },(ajaxPermissionErrorMsg)=>{
            this.setState({
                ajaxPermissionResult : CONSTANTS.ERROR,
                ajaxPermissionList : [],
                ajaxPermissionErrorMsg : ajaxPermissionErrorMsg || CONSTANTS.PERMISSION_ERROR_MSG
            });
        });
    },
    componentDidMount : function() {
        var app_id = this.props.app_id;
        if(this.props.app_id) {
            this.getRolesPermissionsByAjax(app_id);
        }
        if(userData.hasRole(userData.ROLE_CONSTANS.APP_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.APP_OWNER)) {
            this.getMyApps();
        }
    },
    componentDidUpdate : function() {
        this.props.updateScrollBar();
    },
    componentWillReceiveProps : function(nextProps) {
        var app_id = nextProps.app_id;
        //应用id变化，更新
        if(this.props.app_id !== app_id) {
            this.getRolesPermissionsByAjax(app_id);
            var state = this.getStateByProps(nextProps);
            this.setState(state);
        }
    },
    //根据props产生state
    getStateByProps : function(props) {
        var selectedRoles = _.isArray(props.selectedRoles) ? props.selectedRoles : [];
        var selectedPermissions = _.isArray(props.selectedPermissions) ? props.selectedPermissions : [];
        return {
            //ajax角色获取状态   loading success error
            ajaxRolesResult : CONSTANTS.LOADING,
            //ajax获取的角色数组
            ajaxRolesList : [],
            //ajax获取的角色，如果有错误的话，错误信息
            ajaxRolesErrorMsg : '',
            //用户选中的角色数组
            selectedRolesList : selectedRoles.slice(),
            //ajax权限获取状态   loading success error
            ajaxPermissionResult : CONSTANTS.LOADING,
            //ajax获取的权限数组
            ajaxPermissionList : [],
            //ajax获取的权限，如果有错误的话，错误信息
            ajaxPermissionErrorMsg : '',
            //用户选中的权限数组
            selectedPermissionList : selectedPermissions.slice(),
            //默认选中的权限tab页的key，当做修改操作时，默认展示第一个选中了的权限tab
            defaultActivePermissionTabKey : '0',
            //是否显示权限区域，默认权限区域是收起的
            showPermissionBlock : false,
            //我的应用列表
            myApps : [],
            //选中的角色已经包含的权限id数组
            selectedRolesAlreadyContainedPermissionIds : []
        };
    },

    getInitialState : function() {
        return this.getStateByProps(this.props);
    },
    goAddRole : function() {
        var locationPath = location.pathname;
        if(locationPath === '/myApp') {
            myAppEmitter.emit(myAppEmitter.GO_TO_ADD_ROLE , this.props.app_id);
        } else {
            var type = 'role';
            var app_id = this.props.app_id;
            history.pushState({type : type,appId : app_id} , '/myApp' ,{});
        }

    },
    goAddPermission : function() {
        var locationPath = location.pathname;
        if(locationPath === '/myApp') {
            myAppEmitter.emit(myAppEmitter.GO_TO_ADD_PERMISSION , this.props.app_id);
        } else {
            var type = 'authority';
            var app_id = this.props.app_id;
            history.pushState({type : type,appId : app_id} , '/myApp' ,{});
        }
    },
    renderRolePermissionView : function() {
        var state = this.state;
        //如果两个请求都在loading，只显示一个Loading
        if(state.ajaxRolesResult === CONSTANTS.LOADING && state.ajaxPermissionResult === CONSTANTS.LOADING) {
            return <Spinner />;
        }
        //权限角色，都获取失败，提示
        if(state.ajaxRolesResult === CONSTANTS.ERROR && state.ajaxPermissionResult === CONSTANTS.ERROR) {
            return <div className="no-data">
                <Alert message={CONSTANTS.ROLE_PERMISSION_ERROR_MSG} showIcon type="error"/>
                <Icon type={CONSTANTS.RELOAD} title={CONSTANTS.RELOAD_TITLE} onClick={this.getRolesPermissionsByAjax.bind(this , this.props.app_id)}/>
            </div>
        }
        //权限角色，都没数据，提示
        if(state.ajaxRolesResult === CONSTANTS.SUCCESS &&
                state.ajaxRolesList.length === 0 &&
                state.ajaxPermissionResult === CONSTANTS.SUCCESS &&
                state.ajaxPermissionList.length === 0
        ){
            var noDataTip = this.isMyApp() ?
                (<span>{CONSTANTS.NO_ROLE_PERMISSION_DATA}，<ReactIntl.FormattedMessage id="common.yesno" defaultMessage="是否" /> <a href="javascript:void(0)" onClick={this.goAddRole}><ReactIntl.FormattedMessage id="user.batch.set.role" defaultMessage="设置角色" /></a> ?</span>) :
                (<span>{CONSTANTS.NO_ROLE_PERMISSION_DATA}，{CONSTANTS.CONTACT_APP_ADMIN}</span>);

            return <div className="no-data">
                <Alert message={noDataTip} showIcon type="info"/>
                <Icon type={CONSTANTS.RELOAD} title={CONSTANTS.RELOAD_TITLE} onClick={this.getRolesPermissionsByAjax.bind(this , this.props.app_id)}/>
            </div>;
        }
        return <div>
            <div className="app-role-permission-role">
                <h3>
                    <span><ReactIntl.FormattedMessage id="user.batch.role.set" defaultMessage="角色设置" /></span>
                    {
                        state.ajaxRolesList.length ? <Icon type={CONSTANTS.RELOAD} title={CONSTANTS.RELOAD_TITLE} onClick={this.getRolesByAjax.bind(this , this.props.app_id)}/>:null
                    }
                </h3>
                <div className="app-property-content app-property-roles">
                    {this.renderRoleView()}
                </div>
            </div>
            <div className="app-role-permission-permission" style={{display:state.showPermissionBlock ? 'block' : 'none'}}>
                <h3>
                    <span><ReactIntl.FormattedMessage id="user.batch.auth.set" defaultMessage="权限设置" /></span>
                    {
                        state.ajaxPermissionList.length ? <Icon type={CONSTANTS.RELOAD} title={CONSTANTS.RELOAD_TITLE} onClick={this.getPermissionsByAjax.bind(this , this.props.app_id)}/> : null
                    }
                </h3>
                <div className="app-property-content app-property-permissions">
                    {this.renderPermissionView()}
                </div>
            </div>
        </div>;
    },
    togglePermissionBlock : function() {
        this.setState({
            showPermissionBlock : !this.state.showPermissionBlock
        });
    },
    toggleSelectedRole : function(roleInfo) {
        var state = this.state;
        var roleId = roleInfo.role_id;
        var selectedRolesList = state.selectedRolesList;
        if(selectedRolesList.indexOf(roleId) >= 0) {
            state.selectedRolesList = _.filter(selectedRolesList, (id) => {
                return id != roleId;
            });
        } else {
            selectedRolesList.push(roleId);
            //角色对应的权限信息
            var selectedPermissionList = state.selectedPermissionList;
            var permissionIds = roleInfo.permission_ids;
            state.selectedPermissionList = _.filter(selectedPermissionList , (id) => permissionIds.indexOf(id) < 0);
        }

        state.selectedRolesAlreadyContainedPermissionIds = _.chain(state.selectedRolesList).map((roleId) => {
            var findedRole = _.find(state.ajaxRolesList , (role) => role.role_id === roleId);
            return findedRole ? findedRole.permission_ids : [];
        }).flatten().value();

        this.setState({
            selectedRolesList : state.selectedRolesList,
            selectedPermissionList : state.selectedPermissionList,
            selectedRolesAlreadyContainedPermissionIds : state.selectedRolesAlreadyContainedPermissionIds
        });
        this.props.onRolesPermissionSelect(state.selectedRolesList , state.selectedPermissionList);
    },
    renderRoleView : function() {
        var state = this.state;
        if(state.ajaxRolesResult === CONSTANTS.LOADING) {
            return <Spinner />;
        }
        if(state.ajaxRolesResult === CONSTANTS.ERROR) {
            return <div className="no-data">
                <Alert message={this.state.ajaxRolesErrorMsg} showIcon type={CONSTANTS.ERROR}/>
                <Icon type={CONSTANTS.RELOAD} title={CONSTANTS.RELOAD_TITLE} onClick={this.getRolesByAjax.bind(this , this.props.app_id)}/>
            </div>
        }
        if(state.ajaxRolesResult === CONSTANTS.SUCCESS && state.ajaxRolesList.length === 0) {
            var noDataTip = this.isMyApp() ?
                (<span>{CONSTANTS.NO_ROLE_DATA}，是否 <a href="javascript:void(0)" onClick={this.goAddRole}><ReactIntl.FormattedMessage id="user.batch.set.role" defaultMessage="设置角色" /></a> ?</span>) :
                (<span>{CONSTANTS.NO_ROLE_DATA}，{CONSTANTS.CONTACT_APP_ADMIN}</span>);
            return <div className="no-data">
                <Alert message={noDataTip} showIcon type={CONSTANTS.INFO}/>
                <Icon type={CONSTANTS.RELOAD} title={CONSTANTS.RELOAD_TITLE} onClick={this.getRolesByAjax.bind(this , this.props.app_id)}/>
            </div>
        }
        //选中的角色
        var selectedRolesList = state.selectedRolesList;
        //展开、收起 class名
        var advanceRoleClass = classNames({
            iconfont : true,
            'icon-up-twoline' : state.showPermissionBlock,
            'icon-down-twoline' : !state.showPermissionBlock
        });
        return <div className="app-role-permission-list">
            {state.ajaxRolesList.map((roleInfo) =>{
                const cls = classNames({
                    "rounded_item" : true,
                    "selected" : selectedRolesList.indexOf(roleInfo.role_id) >= 0
                });
                return (
                    <div key={roleInfo.role_id} className={cls} onClick={this.toggleSelectedRole.bind(this,roleInfo)}>{roleInfo.role_name}</div>
                );
            })}
            {
                // state.ajaxPermissionList.length > 0 ? (<span className={advanceRoleClass} title={Intl.get("user.config.auth", "配置权限")} onClick={this.togglePermissionBlock}></span>) : null
            }
        </div>;
    },
    toggleSelectedPermission : function(permission) {
        var state = this.state;
        var permissionId = permission.permission_id;
        if(state.selectedRolesAlreadyContainedPermissionIds.indexOf(permissionId) >= 0) {
            return;
        }
        var selectedPermissionList = state.selectedPermissionList;
        if(selectedPermissionList.indexOf(permissionId) >= 0) {
            state.selectedPermissionList = _.filter(selectedPermissionList , (id) => id != permissionId);
        } else {
            selectedPermissionList.push(permissionId);
        }
        this.setState({
            selectedPermissionList : state.selectedPermissionList
        });
        this.props.onRolesPermissionSelect(state.selectedRolesList , state.selectedPermissionList);
    },
    renderPermissionView : function() {
        var state = this.state;
        if(state.ajaxPermissionResult === CONSTANTS.LOADING) {
            return <Spinner />;
        }
        if(state.ajaxPermissionResult === CONSTANTS.ERROR) {
            return <div className="no-data">
                <Alert message={this.state.ajaxPermissionErrorMsg} showIcon type={CONSTANTS.ERROR}/>
                <Icon type={CONSTANTS.RELOAD} title={CONSTANTS.RELOAD_TITLE} onClick={this.getPermissionsByAjax.bind(this , this.props.app_id)}/>
            </div>
        }
        if(state.ajaxPermissionResult === CONSTANTS.SUCCESS && state.ajaxPermissionList.length === 0) {
            var noDataTip = this.isMyApp() ?
                (<span>{CONSTANTS.NO_PERMISSION_DATA}，<ReactIntl.FormattedMessage id="common.yesno" defaultMessage="是否" /> <a href="javascript:void(0)" onClick={this.goAddPermission}><ReactIntl.FormattedMessage id="user.batch.set.auth" defaultMessage="设置权限" /></a> ?</span>) :
                (<span>{CONSTANTS.NO_PERMISSION_DATA}，{CONSTANTS.CONTACT_APP_ADMIN}</span>);
            return <div className="no-data">
                <Alert message={noDataTip} showIcon type={CONSTANTS.INFO}/>
                <Icon type={CONSTANTS.RELOAD} title={CONSTANTS.RELOAD_TITLE} onClick={this.getPermissionsByAjax.bind(this , this.props.app_id)}/>
            </div>
        }
        var selectedPermissionList = state.selectedPermissionList;
        var selectedRolesAlreadyContainedPermissionIds = state.selectedRolesAlreadyContainedPermissionIds;
        return (
            <Tabs defaultActiveKey={state.defaultActivePermissionTabKey}>
                {
                    state.ajaxPermissionList.map((permissionGroup,i)=>{
                        return (
                            <TabPane tab={permissionGroup.permission_group_name} key={i}>
                                <div className="app-role-permission-list">
                                    {permissionGroup.permission_list.map((permission)=>{
                                        var permission_id = permission.permission_id;
                                        var unselectable = selectedRolesAlreadyContainedPermissionIds.indexOf(permission_id) >= 0;
                                        const cls = classNames({
                                            rounded_item : true,
                                            selected : selectedPermissionList.indexOf(permission_id) >= 0,
                                            'unselectable-item' : unselectable
                                        });
                                        const content = <div key={permission.permission_id} className={cls} onClick={this.toggleSelectedPermission.bind(this,permission)}>{permission.permission_name}</div>;
                                        return unselectable ? (
                                            <Tooltip  title={CONSTANTS.TOOLTIP_TITLE} placement={CONSTANTS.TOOLTIP_PLACEMENT} key={permission.permission_id + "_tip"}>
                                                {content}
                                            </Tooltip>
                                        ) : content;
                                    })}
                                </div>
                            </TabPane>
                        );
                    })
                }
            </Tabs>
        );
    },
    render : function() {
        return (
            <div className={classNames("app-role-permission" , this.props.className)}>
                {this.renderRolePermissionView()}
            </div>
        );
    }
});

module.exports = AppRolePermission;