import {Icon, Alert, Select} from 'antd';
let Option = Select.Option;
let hasPrivilege = require("../../../../../components/privilege/checker").hasPrivilege;
let userData = require("../../../../../public/sources/user-data");
let CrmBasicAjax = require("../../ajax/index");
import batchChangeAjax from '../../ajax/batch-change-ajax';
import Trace from "LIB_DIR/trace";

var SalesSelectField = React.createClass({
    getDefaultProps: function () {
        return {
            list: [],
            onChange: function () {
            },
            onModifySuccess: function () {
            }
        };
    },
    getSalesTeamList: function (userId, salesManList) {
        let salesTeamList = [];
        if (userData.isSalesManager()) {
            //销售领导、域管理员角色时，客户所属销售团队的修改
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
        }
        return salesTeamList;
    },
    getInitialState: function () {
        return {
            list: [],//下拉列表中的数据
            displayType: "text",
            isLoadingList: true,//正在获取下拉列表中的数据
            disabled: this.props.disabled,
            isMerge: this.props.isMerge,
            customerId: this.props.customerId,
            userName: this.props.userName,
            userId: this.props.userId,
            salesTeam: this.props.salesTeam,
            salesTeamId: this.props.salesTeamId,
            salesManList: [],
            salesTeamList: [],
            loading: false,
            submitErrorMsg: ''
        };
    },
    componentDidMount: function () {
        // 普通销售(多角色时：非销售领导、域管理员)获取其团队里的成员列表
        if (this.isSales()) {
            this.getSalesTeamMembers();
        } else {//销售领导、域管理员角色时，客户所属销售下拉列表的数据获取
            this.getSalesManList();
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
                disabled: nextProps.disabled,
                list: [],//下拉列表中的数据
                displayType: "text",
                isLoadingList: true,//正在获取下拉列表中的数据
                loading: false,
                submitErrorMsg: ''
            });
        }
    },

    //是否是普通销售(多角色时：非销售领导、域管理员)的判断
    isSales: function () {
        return userData.hasRole("sales") && !userData.isSalesManager()
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
    //更新销售人员
    handleSalesManChange: function (userId) {
        this.state.userId = userId;
        if (this.isSales()) {
            Trace.traceEvent(this.getDOMNode(), "修改销售人员");
            //普通销售，只修改销售人员
            const salesman = _.find(this.state.salesManList, item => item.userId === userId);
            this.state.userName = salesman ? salesman.nickName : "";
        } else {
            Trace.traceEvent(this.getDOMNode(), "修改销售人员及其团队");
            //销售领导、域管理员，修改销售人员时，将其对应的所属团队及其相关团队列表一起修改
            const salesman = _.find(this.state.salesManList, item => item.user_info && item.user_info.user_id === userId);
            if (salesman) {
                this.state.userName = salesman.user_info ? salesman.user_info.nick_name : "";
                if (_.isArray(salesman.user_groups) && salesman.user_groups.length) {
                    let teamList = salesman.user_groups.map(team => {
                        return {
                            group_id: team.group_id,
                            group_name: team.group_name
                        }
                    });
                    this.state.salesTeamList = teamList;
                    if (teamList[0]) {
                        this.state.salesTeam = teamList[0].group_name;
                        this.state.salesTeamId = teamList[0].group_id;
                    }
                }
            }
        }
        this.setState(this.state);
    },

    changeDisplayType: function (type) {
        if (type === 'text') {
            Trace.traceEvent(this.getDOMNode(), "取消对销售人员/团队的修改");

            this.setState({
                loading: false,
                displayType: type,
                userName: this.props.userName,
                userId: this.props.userId,
                salesTeam: this.props.salesTeam,
                salesTeamId: this.props.salesTeamId,
                salesTeamList: this.getSalesTeamList(this.props.userId, this.state.salesManList),
                submitErrorMsg: ''
            });
        } else {
            Trace.traceEvent(this.getDOMNode(), "点击设置销售按钮");
            this.setState({
                displayType: type
            });
        }
    },
    handleSubmit: function () {
        if (this.state.loading) return;
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
            this.setState({
                loading: false,
                displayType: 'text',
                submitErrorMsg: ''
            });
        } else {
            this.setState({loading: true});
            CrmBasicAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    this.setState({
                        loading: false,
                        displayType: 'text',
                        submitErrorMsg: ''
                    });
                    //更新列表中的客户地域
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg => {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get("crm.172", "修改客户所属销售失败")
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

    render: function () {
        //销售人员与销售团队下拉列表的填充内容
        let salesmanOptions = [];
        if (this.isSales()) {
            //普通销售(多角色时：非销售领导、域管理员),展示所属销售所在团队的成员列表
            salesmanOptions = this.state.salesManList.map(function (salesman) {
                return (<Option value={salesman.userId}
                                key={salesman.userId}>{salesman.nickName}</Option>);
            });
        } else {
            //销售领导、域管理员,展示其所有（子）团队的成员列表
            salesmanOptions = this.state.salesManList.map(function (salesman) {
                return (<Option value={salesman.user_info.user_id}
                                key={salesman.user_info.user_id}>{salesman.user_info.nick_name}</Option>);
            });
        }
        let salesTeamOptions = this.state.salesTeamList.map(function (sales_team) {
            return (<Option value={sales_team.group_id} key={sales_team.group_id}>{sales_team.group_name}</Option>);
        });
        let buttonBlock = this.state.loading ? (
            <Icon type="loading"/>
        ) : (
            <div>
                <i title={Intl.get("common.save", "保存")} className="inline-block iconfont icon-choose"
                   onClick={this.handleSubmit}/>
                <i title={Intl.get("common.cancel", "取消")} className="inline-block iconfont icon-close"
                   onClick={this.changeDisplayType.bind(this, "text")}/>
            </div>
        );
        return (<div className="crm-basic-sales-content client-info-content">
            <div className=" block-split-line"></div>
            <dl className="dl-horizontal crm-basic-item detail_item crm-basic-sales">
                <dt><ReactIntl.FormattedMessage id="user.salesman" defaultMessage="销售人员"/></dt>
                <dd>
                    {this.state.displayType === 'text' ? (
                        <div className="basic-sales-field">
                            <span>{this.state.userName}</span>

                            {!this.state.disabled ? (
                                <i className="iconfont icon-update" title={Intl.get("crm.173", "设置销售")}
                                   onClick={this.changeDisplayType.bind(this, "edit")}/>) : null}
                        </div>
                    ) : (
                        <div className="basic-sales-edit-field">
                            <Select
                                placeholder={Intl.get("crm.17", "请选择销售人员")}
                                showSearch
                                onChange={this.handleSalesManChange}
                                value={this.state.userId}
                                optionFilterProp="children"
                                notFoundContent={salesmanOptions.length ? Intl.get("crm.30", "无相关销售") : Intl.get("crm.29", "暂无销售") }
                            >
                                {salesmanOptions}
                            </Select>
                            <div className="buttons">
                                {buttonBlock}
                            </div>
                            {this.state.submitErrorMsg ? (
                                <div className="has-error">
                                    <span className="ant-form-explain">{this.state.submitErrorMsg}</span>
                                </div>) : null
                            }
                        </div>
                    )}
                </dd>
            </dl>
            <dl className="dl-horizontal crm-basic-item detail_item crm-basic-sales-team">
                <dt><ReactIntl.FormattedMessage id="user.sales.team" defaultMessage="销售团队"/></dt>
                <dd>
                    {this.state.displayType === 'text' ? (
                        <div className="basic-sales-field">
                            <span>{this.state.salesTeam}</span>
                        </div>
                    ) : (
                        <div className="basic-sales-edit-field">
                            <Select placeholder={Intl.get("crm.31", "请选择销售团队")} name="sales_team-select"
                                    value={this.state.salesTeamId}
                                    onChange={this.handleTeamChange}
                            >
                                {salesTeamOptions}
                            </Select>
                        </div>
                    )}


                </dd>
            </dl>
        </div>);
    }
});

module.exports = SalesSelectField;
