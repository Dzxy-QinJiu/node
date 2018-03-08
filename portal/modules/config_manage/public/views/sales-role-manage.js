require("../css/index.less");
const Spinner = require("CMP_DIR/spinner");
const AlertTimer = require("CMP_DIR/alert-timer");
import Trace from "LIB_DIR/trace";
import {Icon, Alert} from "antd";
import classNames from "classnames";
import {getSalesTeamRoleList} from "../../../common/public/ajax/role";
import {COLOR_LIST} from "PUB_DIR/sources/utils/consts";
const ALERT_TIME = 4000;//错误提示的展示时间：4s
const SalesRoleManage = React.createClass({
    getInitialState: function () {
        return ({
            //角色列表
            salesRoleList: [],
            //点击角色添加按钮的loading效果是否显示
            isAddloading: false,
            //当前正在删除的角色
            DeletingItem: "",
            //正在设置默认的角色
            settingDefaultRole: "",
            //点击刷新按钮的loading效果是否显示
            isRefreshLoading: false,
            //加载失败的提示信息
            getErrMsg: '',
            //添加失败的信息
            addErrMsg: '',
            // 删除角色失败
            deleteErrMsg: '',
        })
    },
    //获取销售角色列表
    getSalesRoleList: function () {
        this.setState({
            isRefreshLoading: true
        });
        getSalesTeamRoleList().sendRequest().success((data) => {
            this.setState({
                salesRoleList: _.isArray(data) ? data : [],
                isRefreshLoading: false
            });
        }).error((xhr) => {
            this.setState({
                isRefreshLoading: false,
                getErrMsg: xhr.responseJSON
            });
        });
    },
    componentWillMount: function () {
        this.getSalesRoleList();
    },
    //点击刷新按钮
    getRefreshInfo: function (e) {
        this.setState({
            isRefreshLoading: true,
            salesRoleList: []
        });
        this.getSalesRoleList();
    },
    //删除销售角色
    handleDeleteItem: function (delId) {
        //当前正在删除的销售角色的id
        this.setState({
            DeletingItem: delId
        });
        $.ajax({
            url: '/rest/sales/role/' + delId,
            type: 'delete',
            dateType: 'json',
            success: (result) => {
                //在数组中删除当前正在删除的销售角色
                this.state.salesRoleList = _.filter(this.state.salesRoleList, (role) => role.id !== delId);
                this.setState({
                    DeletingItem: "",
                    salesRoleList: this.state.salesRoleList
                });
            },
            error: (errorInfo) => {
                this.setState({
                    DeletingItem: "",
                    deleteErrMsg: errorInfo.responseJSON
                });
            }
        });
    },
    //设为默认角色
    setDefautRole: function (role) {
        if (role.is_default) {
            return;
        }
        this.setState({settingDefaultRole: role.id});
        $.ajax({
            url: '/rest/sales/default_role/' + role.id,
            type: 'put',
            dateType: 'json',
            success: (result) => {
                //设置默认的角色
                _.each(this.state.salesRoleList, (item) => {
                    if (item.id === role.id) {
                        item.is_default = true;
                    } else {//去掉原来默认角色的默认属性
                        delete item.is_default;
                    }
                });
                this.setState({salesRoleList: this.state.salesRoleList, settingDefaultRole: ""});
            },
            error: (errorInfo) => {
                this.setState({
                    settingDefaultRole: "",
                    deleteErrMsg: errorInfo.responseJSON
                });
            }
        });
    },
    //增加销售角色
    handleSubmit: function (e) {
        Trace.traceEvent(e, "点击添加销售角色按钮");
        e.preventDefault();
        //输入的销售角色名称去左右空格
        let role = $.trim(this.refs.addSalesRole.value);
        if (!role) {
            return;
        }
        let addRole = {name: role, color: this.getRoleColor()};
        //显示添加的loading效果
        this.setState({
            isAddloading: true
        });
        $.ajax({
            url: '/rest/sales/role',
            type: 'post',
            dateType: 'json',
            data: addRole,
            success: (result) => {
                if (result) {
                    let salesRoleList = this.state.salesRoleList;
                    //数组默认角色后添加输入的销售角色(第一个角色是默认角色)
                    if (salesRoleList.length) {
                        salesRoleList.splice(1, 0, result);
                    } else {
                        salesRoleList = [result];
                    }
                    this.setState({
                        salesRoleList: salesRoleList,
                        isAddloading: false
                    });
                    this.refs.addSalesRole.value = '';
                }
            },
            error: (errorInfo) => {
                this.setState({
                    isAddloading: false,
                    addErrMsg: errorInfo.responseJSON
                });
            }
        });

    },
    //增加销售角色失败
    handleAddRoleFail(){
        var hide = () => {
            this.setState({
                addErrMsg: '',
                isAddloading: false
            });
        };
        return (
            <div className="add-config-fail">
                {this.renderErrorAlert(this.state.addErrMsg, hide)}
            </div>
        );
    },

    renderErrorAlert: function (errorMsg, hide) {
        return (<AlertTimer time={ALERT_TIME} message={errorMsg} type="error" showIcon onHide={hide}/>);
    },

    handleDeleteRoleFail: function () {
        var hide = () => {
            this.setState({
                deleteErrMsg: ''
            });
        };
        return (
            <div className="delete_ip_config_err_tips">
                {this.renderErrorAlert(this.state.deleteErrMsg, hide)}
            </div>
        );
    },
    getRoleColor: function () {
        //角色列表中已存在的颜色列表
        let existColors = _.pluck(this.state.salesRoleList, "color");
        //第一个不在已有角色的颜色列表中的颜色，作为当前添加角色的颜色
        let roleColor = _.find(COLOR_LIST, color => existColors.indexOf(color) === -1);
        return roleColor;
    },
    renderSalesRoleList: function () {
        let salesRoleList = this.state.salesRoleList;
        //正在获取数据的状态渲染
        if (this.state.isRefreshLoading) {
            return <Spinner/>;
        } else if (this.state.getErrMsg) {
            //错误提示
            return <Alert type="error" showIcon message={this.state.getErrMsg}/>;
        } else if (_.isArray(salesRoleList) && salesRoleList.length) {
            //销售角色列表
            return (<ul className="mb-taglist" data-tracename="销售角色管理">
                {salesRoleList.map((item, index) => {
                        let defaultCls = classNames("default-role-descr", {"default-role-checked": item.is_default});
                        let title_tip = item.is_default ? "" : Intl.get("role.set.default", "设为默认角色");
                        return (
                            <li className="mb-tag">
                                <div className="mb-tag-content">
                                    <span className="iconfont icon-team-role sales-role-icon" style={{color: item.color}}/>
                                    <span className="mb-tag-text">{item.name}</span>
                                    <span className={defaultCls} title={title_tip}
                                          onClick={this.setDefautRole.bind(this, item)}
                                          data-tracename="点击设为默认角色按钮">
                                        {Intl.get("role.default.set", "默认")}
                                        {this.state.settingDefaultRole === item.id ? <Icon type="loading"/> : null}
                                    </span>
                                    {item.is_default || this.state.settingDefaultRole == item.id ? null :
                                        <span className="glyphicon glyphicon-remove mb-tag-remove"
                                              onClick={this.handleDeleteItem.bind(this, item.id)}
                                              data-tracename="点击删除某个销售角色按钮"
                                        />}
                                    { this.state.DeletingItem === item.id ? (
                                        <Icon type="loading"/>
                                    ) : null}
                                </div>
                            </li>)
                    }
                )}
            </ul>);
        } else {//没有销售角色时的提示
            return <Alert type="info" showIcon
                          message={Intl.get("config.manage.no.role", "暂无销售角色，请添加！")}/>;
        }
    },
    render: function () {
        return (
            <div className="box" data-tracename="销售角色配置">
                <div className="box-title">
                    {Intl.get("config.manage.sales.role", "销售角色管理")}&nbsp;&nbsp;
                    <span
                        onClick={this.getSalesRoleList.bind(this)}
                        className="refresh"
                        data-tracename="点击获取销售角色刷新按钮"
                    >
                        <Icon type="reload" title={Intl.get("config.manage.reload.role", "重新获取销售角色")}/>
                    </span>
                    {this.state.deleteErrMsg ? this.handleDeleteRoleFail() : null}
                </div>
                <div className="box-body">
                    {this.renderSalesRoleList()}
                </div>
                <div className="box-footer">
                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <input className="mb-input" ref="addSalesRole"/>
                            <button className="btn mb-add-button" type="submit"
                                    disabled={this.state.isAddloading ? "disabled" : ""}>
                                {Intl.get("common.add", "添加")}
                                {this.state.isAddloading ?
                                    <Icon type="loading"/> : null}
                            </button>
                        </div>
                        {this.state.addErrMsg ? this.handleAddRoleFail() : null}
                    </form>
                </div>
            </div>
        );
    }
});

module.exports = SalesRoleManage;
