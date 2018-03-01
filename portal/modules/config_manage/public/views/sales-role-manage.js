require("../css/index.less");
const Spinner = require("CMP_DIR/spinner");
const AlertTimer = require("CMP_DIR/alert-timer");
import Trace from "LIB_DIR/trace";
import {Icon, Alert} from "antd";
import classNames from "classnames";
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
        $.ajax({
            url: '/rest/sales/role_list',
            type: 'get',
            dateType: 'json',
            success: (data) => {
                this.setState({
                    salesRoleList: _.isArray(data) ? data : [],
                    isRefreshLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isRefreshLoading: false,
                    getErrMsg: errorMsg.responseJSON
                });
            }
        })

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
                let salesRoleList = this.state.salesRoleList;
                //去掉原来默认角色的默认属性
                if (salesRoleList[0]) {
                    delete salesRoleList[0].is_default;
                }
                //过滤掉设为默认的角色
                salesRoleList = _.filter(salesRoleList, (item) => item.id !== role.id);
                //修改设为默认角色的属性
                role.is_default = true;
                //将默认角色加到角色列表的最前面
                salesRoleList.unshift(role);
                this.setState({salesRoleList: salesRoleList, settingDefaultRole: ""});
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
        let addRole = {name: role};
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
            return (<ul className="mb-taglist">
                {salesRoleList.map((item, index) => {
                        let defaultCls = classNames("default-role-descr", {"default-role-checked": item.is_default});
                        return (
                            <li className="mb-tag">
                                <div className="mb-tag-content">
                                    <span className="mb-tag-text">{item.name}</span>
                                    <span className={defaultCls} title={Intl.get("role.set.default", "设为默认角色")}
                                          onClick={this.setDefautRole.bind(this, item)}>
                                        {Intl.get("role.default.set", "默认")}
                                        {this.state.settingDefaultRole ? <Icon type="loading"/> : null}
                                    </span>
                                    {item.is_default ? null :
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
