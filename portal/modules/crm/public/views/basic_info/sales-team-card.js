import {Icon, Alert, Select} from 'antd';
let Option = Select.Option;
let hasPrivilege = require("../../../../../components/privilege/checker").hasPrivilege;
let userData = require("../../../../../public/sources/user-data");
let CrmBasicAjax = require("../../ajax/index");
import batchChangeAjax from '../../ajax/batch-change-ajax';
import Trace from "LIB_DIR/trace";
import DetailCard from "CMP_DIR/detail-card";
import {DetailEditBtn} from "CMP_DIR/rightPanel";

var SalesTeamCard = React.createClass({
    getDefaultProps: function () {
        return {
            list: [],
            onChange: function () {
            },
            onModifySuccess: function () {
            }
        };
    },

    getInitialState: function () {
        return {
            list: [],//下拉列表中的数据
            displayType: "text",
            isLoadingList: true,//正在获取下拉列表中的数据
            enableEdit: this.props.enableEdit,
            enableTransfer: this.props.enableTransfer,
            isMerge: this.props.isMerge,
            customerId: this.props.customerId,
            userName: this.props.userName,
            userId: this.props.userId,
            salesTeam: this.props.salesTeam,
            salesTeamId: this.props.salesTeamId,
            salesManList: [],
            salesTeamList: [],
            loading: false,
            submitErrorMsg: '',
            salesRole: ""
        };
    },
    componentDidMount: function () {
        //有修改所属销售的权限时
        if (this.state.enableEdit) {
            //获取团队和对应的成员列表（管理员：所有，销售：所在团队及其下级团队和对应的成员列表）
            this.getSalesManList();
        }
        if (!this.props.hideSalesRole) {
            //获取销售对应的角色
            this.getSalesRoleByMemberId(this.state.userId);
        }
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.customerId != this.state.customerId) {
            //切换客户时，重新设置state数据
            this.setState({
                isMerge: nextProps.isMerge,
                customerId: nextProps.customerId,
                userName: nextProps.userName,
                userId: nextProps.userId,
                salesTeam: nextProps.salesTeam,
                salesTeamId: nextProps.salesTeamId,
                salesTeamList: this.getSalesTeamList(nextProps.userId, this.state.salesManList),
                enableEdit: nextProps.enableEdit,
                enableTransfer: nextProps.enableTransfer,
                list: [],//下拉列表中的数据
                displayType: "text",
                isLoadingList: true,//正在获取下拉列表中的数据
                loading: false,
                submitErrorMsg: '',
                salesRole: ""
            });
            if (!nextProps.hideSalesRole) {
                //获取销售对应的角色
                this.getSalesRoleByMemberId(nextProps.userId);
            }
        }
        //由于是否能转出客户的标识需要通过接口获取团队数据后来判断重现赋值，所以如果变了需要重新赋值
        if (this.state.enableTransfer != nextProps.enableTransfer) {
            this.setState({
                enableTransfer: nextProps.enableTransfer
            });
        }
    },
    getSalesTeamList: function (userId, salesManList) {
        let salesTeamList = [];
        _.each(salesManList, (salesMan) => {
            if (salesMan.user_info && salesMan.user_info.user_id === userId) {
                salesMan.user_groups.forEach(function (group) {
                    salesTeamList.push({
                        group_id: group.group_id,
                        group_name: group.group_name
                    });
                });
            }
        });
        return salesTeamList;
    },

    //获取客户所属销售及其团队下拉列表
    getSalesManList: function () {
        batchChangeAjax.getSalesManList().then(list => {
            if (_.isArray(list) && list.length) {
                //过滤掉停用的成员
                list = _.filter(list, sales => sales && sales.user_info && sales.user_info.status == 1);
            } else {
                list = [];
            }
            this.setState({salesManList: list, salesTeamList: this.getSalesTeamList(this.props.userId, list)});
        }, errorMsg => {
            this.setState({salesManList: []});
        });
    },
    getSalesRoleByMemberId: function (memberId) {
        $.ajax({
            url: '/rest/sales/role',
            type: 'get',
            dateType: 'json',
            data: {member_id: memberId},
            success: (data) => {
                if (data && data.teamrole_name) {
                    this.setState({
                        salesRole: data.teamrole_name,
                    });
                }
            },
            error: (errorMsg) => {
                this.setState({
                    salesRole: "",
                });
            }
        });
    },
    // 获取普通销售所在团队里的成员列表
    getSalesTeamMembers: function () {
        let userInfo = userData.getUserData();
        let teamId = userInfo.team_id;
        batchChangeAjax.getSalesTeamMembers(teamId).then(list => {
            if (_.isArray(list) && list.length) {
                //过滤掉停用的成员
                list = _.filter(list, sales => sales && sales.status == 1);
            } else {
                list = [];
            }
            this.setState({
                salesManList: list,
                salesTeamList: [{
                    group_id: teamId,
                    group_name: userInfo.team_name
                }]
            });
        }, errorMsg => {
            this.setState({salesManList: []});
        });
    },
    //获取所属销售及团队的信息，idStr: userId&&teamId
    getSalesTeamParams: function (idStr) {
        let params = {
            userId: "",
            userName: "",
            salesTeamId: "",
            salesTeam: ""
        };
        //销售id和所属团队的id
        let idArray = idStr.split("&&");
        if (_.isArray(idArray) && idArray.length) {
            params.userId = idArray[0];
            params.salesTeamId = idArray[1];
        }
        //销售昵称和所属团队的团队名称
        let salesman = _.find(this.state.salesManList, item => item.user_info && item.user_info.user_id === params.userId);
        if (salesman) {
            params.userName = salesman.user_info ? salesman.user_info.nick_name : "";
            if (_.isArray(salesman.user_groups) && salesman.user_groups.length) {
                let team = _.find(salesman.user_groups, team => team.group_id === params.salesTeamId);
                if (team) {
                    params.salesTeam = team.group_name;
                }
            }
        }
        return params;
    },
    //更新销售人员
    handleSalesManChange: function (idStr) {
        Trace.traceEvent(this.getDOMNode(), "修改销售人员及其团队");
        let params = this.getSalesTeamParams(idStr);
        this.setState(params);
        if (params.userId && !this.props.hideSalesRole) {
            this.getSalesRoleByMemberId(params.userId);
        }
    },

    changeDisplayType: function (type) {
        if (type === 'text') {
            Trace.traceEvent(this.getDOMNode(), "取消对销售人员/团队的修改");
            if (!this.props.hideSalesRole) {
                this.getSalesRoleByMemberId(this.props.userId);
            }
            this.setState({
                loading: false,
                displayType: type,
                userName: this.props.userName,
                userId: this.props.userId,
                salesTeam: this.props.salesTeam,
                salesTeamId: this.props.salesTeamId,
                salesTeamList: this.getSalesTeamList(this.props.userId, this.state.salesManList),
                submitErrorMsg: '',
                salesRole: ""
            });
        } else {
            Trace.traceEvent(this.getDOMNode(), "点击设置销售按钮");
            this.setState({
                displayType: type
            });
        }
    },
    //回到展示状态
    backToDisplay: function () {
        this.setState({
            loading: false,
            displayType: 'text',
            submitErrorMsg: ''
        });
    },
    submitData: function () {
        let submitData = {
            id: this.state.customerId,
            type: "sales",
            user_id: this.state.userId,
            user_name: this.state.userName,
            sales_team_id: this.state.salesTeamId,
            sales_team: this.state.salesTeam
        };
        Trace.traceEvent(this.getDOMNode(), "保存对销售人员/团队的修改");
        if (this.props.isMerge) {
            this.props.updateMergeCustomer(submitData);
            this.backToDisplay();
        } else if (this.state.displayType === "edit") {
            CrmBasicAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    this.backToDisplay();
                    //更新列表中的销售人员
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get("crm.172", "修改客户所属销售失败")
                });
            });
        } else if (this.state.displayType === "transfer") {
            submitData.member_role = this.state.salesRole;
            CrmBasicAjax.transferCustomer(submitData).then(result => {
                if (result) {
                    this.backToDisplay();
                    //更新列表中的销售人员
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get("crm.customer.transfer.failed", "转出客户失败")
                });
            });
        }
    },
    handleSubmit: function () {
        if (this.state.loading) return;
        if (this.state.userId == this.props.userId) {
            //没做修改时，直接回到展示状态
            this.backToDisplay();
            return;
        }
        let submitData = {
            id: this.state.customerId,
            type: "sales",
            user_id: this.state.userId,
            user_name: this.state.userName,
            sales_team_id: this.state.salesTeamId,
            sales_team: this.state.salesTeam
        };
        Trace.traceEvent(this.getDOMNode(), "保存对销售人员/团队的修改");
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(submitData);
            this.backToDisplay();
        } else if (this.state.displayType === "edit") {
            this.setState({loading: true});
            CrmBasicAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    this.backToDisplay();
                    //更新列表中的销售人员
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get("crm.172", "修改客户所属销售失败")
                });
            });
        } else if (this.state.displayType === "transfer") {
            this.setState({loading: true});
            submitData.member_role = this.state.salesRole;
            CrmBasicAjax.transferCustomer(submitData).then(result => {
                if (result) {
                    this.backToDisplay();
                    //更新列表中的销售人员
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get("crm.customer.transfer.failed", "转出客户失败")
                });
            });
        }
    },
    //更新团队
    handleTeamChange: function (value) {
        const team = _.find(this.state.salesTeamList, item => item.group_id === value);
        this.state.salesTeamId = value;
        this.state.salesTeam = team ? team.group_name : "";
        this.setState(this.state);
    },
    renderTitle: function () {
        return (
            <div className="sales-team-show-block">
                <div className="sales-team">
                    <span className="sales-team-label">{Intl.get("common.belong.sales", "所属销售")}:</span>
                    <span className="sales-team-text">
                    {this.state.userName} {this.state.salesTeam ? ` - ${this.state.salesTeam}` : ""}
                </span>
                    {this.state.enableTransfer && !this.state.isMerge ? (
                        <span className="iconfont icon-transfer"
                              title={Intl.get("crm.qualified.roll.out", "转出")}
                              onClick={this.changeDisplayType.bind(this, "transfer")}/>) : null}
                    {this.state.enableEdit ? (<DetailEditBtn title={Intl.get("crm.sales.change", "变更销售")}
                                                             onClick={this.changeDisplayType.bind(this, "edit")}/>) : null}
                </div>
                {this.props.hideSalesRole ? null :
                    <div className="sales-role">
                        <span className="sales-team-label">{Intl.get("crm.detail.sales.role", "销售角色")}:</span>
                        <span className="sales-team-text">
                            {this.state.salesRole}
                        </span>
                    </div>}
            </div>
        );
    },
    renderContent: function () {
        if (this.state.displayType === "text") return null;
        let dataList = [];
        //展示其所在团队的成员列表
        this.state.salesManList.forEach(function (salesman) {
            let teamArray = salesman.user_groups;
            //一个销售属于多个团队的处理（旧数据中存在这种情况）
            if (_.isArray(teamArray) && teamArray.length) {
                //销售与所属团队的组合数据，用来区分哪个团队中的销售
                teamArray.forEach(team => {
                    dataList.push({
                        name: `${salesman.user_info.nick_name} - ${team.group_name}`,
                        value: `${salesman.user_info.user_id}&&${team.group_id}`
                    });
                });
            }
        });
        //销售人员与销售团队下拉列表的填充内容
        let salesmanOptions = dataList.map(function (item) {
            return (<Option value={item.value} key={item.value}>{item.name}</Option>);
        });
        return (
            <div className="sales-team-edit-block">
                    <span className="edit-label">
                        {this.state.displayType === "edit" ? Intl.get("crm.32", "变更") : Intl.get("crm.qualified.roll.out", "转出")}
                    </span>
                <Select
                    placeholder={Intl.get("crm.17", "请选择销售人员")}
                    showSearch
                    onChange={this.handleSalesManChange}
                    value={`${this.state.userId}&&${this.state.salesTeamId}`}
                    optionFilterProp="children"
                    notFoundContent={salesmanOptions.length ? Intl.get("crm.30", "无相关销售") : Intl.get("crm.29", "暂无销售") }
                >
                    {salesmanOptions}
                </Select>
            </div>
        );
    },
    render: function () {
        return (<DetailCard title={this.renderTitle()}
                            content={this.renderContent()}
                            className="sales-team-container"
                            isEdit={this.state.displayType !== "text"}
                            loading={this.state.loading}
                            saveErrorMsg={this.state.submitErrorMsg}
                            handleSubmit={this.handleSubmit.bind(this)}
                            handleCancel={this.changeDisplayType.bind(this, "text")}/>);
    }
});

module.exports = SalesTeamCard;
