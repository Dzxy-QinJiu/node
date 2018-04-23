/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/2/15.
 */
// 查看
require("../css/user-type-config.less");
import {Button, Icon} from 'antd';
var _ = require("underscore");
var Alert = require("antd").Alert;
var getRoleLists = require("./getRoleLists");
var rightPanelUtil = require("../../../../components/rightPanel");
var RightPanelClose = rightPanelUtil.RightPanelClose;
var RightPanelReturn = rightPanelUtil.RightPanelReturn;
var RightPanelEdit = rightPanelUtil.RightPanelEdit;
var Spinner = require("../../../../components/spinner");
var PrivilegeChecker = require("../../../../components/privilege/checker").PrivilegeChecker;
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
import Trace from "LIB_DIR/trace";
//高度常量
var LAYOUT_CONSTANTS = {
    RIGHT_PANEL_PADDING_TOP: 60,
    RIGHT_PANEL_PADDING_BOTTOM: 0
};

var UserTypeConfigList = React.createClass({
    getDefaultProps: function () {
        return {
            appId: "",
            showData: [],
            appName: ""
        };
    },
    getInitialState: function () {
        return {
            appId: this.props.appId,
            UserTypeConfigList: [],
            //首次加载
            firstloading: true,
            errMsg: '',
            //没有数据时，页面展示的空数据
            showData: [
                {user_type: '试用用户', id: ''},
                {user_type: '正式用户', id: ''},
                {user_type: 'special', id: ''},
                {user_type: 'training', id: ''},
                {user_type: 'internal', id: ''}
            ]
        };
    },
    componentWillReceiveProps: function (nextProps) {
        var _this = this;
        var appId = nextProps.appId;
        if (appId != _this.state.appId) {
            _this.props.appId = appId;
            _this.setState({
                appId: appId,
                showData: [
                    {user_type: '试用用户', id: ''},
                    {user_type: '正式用户', id: ''},
                    {user_type: 'special', id: ''},
                    {user_type: 'training', id: ''},
                    {user_type: 'internal', id: ''}
                ],
                firstloading: true
            }, ()=> {
                _this.getRoleList();
            });
        }
    },
    componentWillMount: function () {
        this.getRoleList();
    },
    //获取权限和角色列表
    getRoleList: function () {
        var _this = this;
        var roleMap = {};
        var permissionMap = {};
        var appId = this.props.appId;
        getRoleLists.getRoleList(appId).then(function (roleList) {
            //角色的map数据类型，为获取角色的名字做准备
            roleMap = _.indexBy(roleList, 'role_id');
            getRoleLists.getPermissionMap(appId).then(function (permissionList) {
                //权限的map数据类型，为获取权限的名字做准备
                permissionMap = _.chain(permissionList).pluck('permission_list').flatten().indexBy('permission_id').value();
                _this.getInitialData(roleMap, permissionMap);
            });
        });
    },
    //获取初始数据
    getInitialData: function (roleMap, permissionMap) {
        var _this = this;
        var page_size = 1000;
        $.ajax({
            url: '/rest/usertypeconfig',
            type: 'get',
            dateType: 'json',
            data: {
                page_size: page_size,
                client_id: _this.props.appId
            },
            success: function (Msg) {
                _this.handlegetData(Msg, roleMap, permissionMap);

            },
            error: function (errorMsg) {
                _this.setState({
                    firstloading: false,
                    errMsg: errorMsg.responseText
                });
            }
        });
    },
    //msg对初始数据进行处理，合并加入真实数据，真实数据有id
    handlegetData: function (Msg, roleMap, permissionMap) {
        var _this = this;
        //页面展示数据map类型
        var showDataByUserType = _.indexBy(_this.state.showData, 'user_type');
        //真实数据
        var dataLists = [];
        //对后端返回的数据进行初步处理;去除上一个版本测试时创建的一些没用数据，加上角色权限的名称和开通周期属性
        Msg.forEach(function (item) {
            if (_.indexOf(['试用用户', '正式用户', 'special', 'training', 'internal'], item.config_name) > -1) {
                item.rolesNames = [];
                item.permissionsNames = [];
                if (item.roles.length > 0) {
                    item.roles.forEach(function (role) {
                        item.rolesNames.push(roleMap[role] && roleMap[role].role_name || '');
                    });
                }
                if (item.permissions.length > 0) {
                    item.permissions.forEach(function (permission) {
                        item.permissionsNames.push(permissionMap[permission] && permissionMap[permission].permission_name || '');
                    });
                }
                item.range = _this.getRange(item);
                dataLists.push(item);
            }
        });
        dataLists.forEach(function (item) {
            showDataByUserType[item.config_name] = item;
        });
        _this.setState({
            showData: _.values(showDataByUserType),
            firstloading: false
        });

    },
    //点击编辑按钮，页面跳转+在form表单中展示当前item的信息
    handleEditUserTypeConfig: function (item) {
        this.props.togglePageChange(true);
        this.props.handleEdit(item);
    },
    //获取信息失败后点击重试的处理
    retry: function () {
        this.setState({
            firstloading: true
        });
        this.getRoleList();
    },
    handleErrResult: function () {
        var _this = this;
        var errMsg = <span>{_this.state.errMsg}<a onClick={_this.retry}
                                                  style={{marginLeft:"20px",marginTop:"20px"}}>请重试</a></span>;
        return (
            <div>
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon
                />
            </div>

        );
    },
    //获取到的毫秒数转化成前端展示的开通周期范围，default是为了解决上一个版本的测试数据
    getRange: function (item) {
        var range = '';
        var mills = item.valid_period;
        switch (mills) {
            case 24 * 60 * 60 * 1000 * 7:
                range = '1w';
                break;
            case 24 * 60 * 60 * 1000 * 15:
                range = '0.5m';
                break;
            case 24 * 60 * 60 * 1000 * 30:
                range = '1m';
                break;
            case 24 * 60 * 60 * 1000 * 30 * 6:
                range = '6m';
                break;
            case 24 * 60 * 60 * 1000 * 30 * 12:
                range = '12m';
                break;
            case 0:
                range = 'forever';
                break;
            default:
                range = mills / (1000 * 60 * 60 * 24) + '天';
        }
        return range;

    },
    //展示用户配置信息列表
    showUserTypeConfigList: function () {
        var _this = this;
        //展示数据
        var list = _this.state.showData;
        return (list.map((item)=> {
                var listId = item.id;
                //有配置信息的类型
                if (listId != '') {
                    return (
                        <div className="usertypeconfig-item">
                            <div className="usertypeconfig-content">
                                <div className="content-item">
                                    <PrivilegeChecker check="UPDATE_APP_EXTRA_GRANT">
                                        <RightPanelEdit
                                            onClick={_this.handleEditUserTypeConfig.bind(this, item)}
                                        />
                                    </PrivilegeChecker>
                                    <div className="addbtn-tip">
                                        {item.user_type == '试用用户' && '试用'}
                                        {item.user_type == '正式用户' && '签约'}
                                        {item.user_type == 'special' && '赠送'}
                                        {item.user_type == 'training' && '培训'}
                                        {item.user_type == 'internal' && '员工'}
                                    </div>
                                </div>
                                <div className="content-item">
                                    <div className="item-lable">
                                        开通周期：
                                    </div>
                                    <div className="item-content">
                                        {item.range == '1w' && '1周'}
                                        {item.range == '0.5m' && '半个月'}
                                        {item.range == '1m' && '1个月'}
                                        {item.range == '6m' && '6个月'}
                                        {item.range == '12m' && '12个月'}
                                        {item.range == 'forever' && '永久'}
                                    </div>
                                </div>
                                <div className="content-item">
                                    <div className="item-lable">
                                        {Intl.get("user.expire.status", "到期状态")}：
                                    </div>
                                    <div className="item-content">
                                        {item.over_draft == 0 && Intl.get("user.status.immutability", "不变")}
                                        {item.over_draft == 1 && Intl.get("user.status.stop", "停用")}
                                        {item.over_draft == 2 && Intl.get("user.status.degrade", "降级")}
                                    </div>
                                </div>
                                <div className="content-item">
                                    <div className="item-lable">
                                        多人登录：
                                    </div>
                                    <div className="item-content">
                                        {item.mutilogin == 0 && "关闭"}
                                        {item.mutilogin == 1 && "开启"}
                                    </div>
                                </div>
                                <div className="content-item">
                                    <div className="item-lable">
                                        角色设置：
                                    </div>
                                    <div className="item-content">
                                        {item.rolesNames.length > 0 ? item.rolesNames.join('、') : ''}
                                    </div>
                                </div>
                                <div className="content-item">
                                    <div className="item-lable">
                                        权限设置：
                                    </div>
                                    <div className="item-content">
                                        {item.permissionsNames.length > 0 ? item.permissionsNames.join('、') : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                } else {
                    //还没配置的信息的类型
                    return (
                        <div className="usertypeconfig-item">
                            <div className="usertypeconfig-content">
                                <div className="content-item">
                                    <div className="icon-update circle-button iconfont" title="配置"
                                         onClick={_this.handleEditUserTypeConfig.bind(this, item)}></div>
                                    <div className="item-title">
                                        请为<span className="addbtn-tip">&nbsp;&nbsp;
                                        {item.user_type == '试用用户' && '试用'}
                                        {item.user_type == '正式用户' && '签约'}
                                        {item.user_type == 'special' && '赠送'}
                                        {item.user_type == 'training' && '培训'}
                                        {item.user_type == 'internal' && '员工'}
										</span>
                                        &nbsp;&nbsp;用户设置默认角色、权限等信息
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                }
            })
        );
    },
    closeRightPanel(e) {
        Trace.traceEvent(e,"关闭用户类型界面");
        this.props.closeRightPanel(e);
    },
    returnInfoPanel(e) {
        Trace.traceEvent(e,"返回到应用详情界面");
        this.props.returnInfoPanel();
    },
    render: function () {
        var divHeight = $(window).height()
                - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP
                - LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM
            ;
        return (
            <div className="usertypeconfig-content-list ">
                <div className="topcontainer">
                    <RightPanelClose onClick={this.closeRightPanel}/>
                    <RightPanelReturn onClick={this.returnInfoPanel}/>
                    <span className="appTitle">{this.props.appName}</span>
                </div>
                <div >
                <GeminiScrollbar ref="scrollbar" style={{height: divHeight}}
                >
                {this.state.firstloading
                    ? <Spinner/>
                    : (this.state.errMsg != '' ? this.handleErrResult() : this.showUserTypeConfigList())
                }
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
});

module.exports = UserTypeConfigList;
