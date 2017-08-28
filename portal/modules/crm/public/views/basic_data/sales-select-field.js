import {Icon, Alert, Select} from 'antd';
let Option = Select.Option;
let hasPrivilege = require("../../../../../components/privilege/checker").hasPrivilege;
let AreaSelection = require("../../../../../components/AreaSelection");
let BatchChangeStore = require("../../store/batch-change-store");
let BatchChangeActions = require("../../action/batch-change-actions");
let userData = require("../../../../../public/sources/user-data");
let CrmBasicAjax = require("../../ajax/index");
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
    getInitialState: function () {
        const salesManList = BatchChangeStore.getState().salesManList;

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
            salesManList: salesManList.length? salesManList : [],
            salesTeamList: [{group_id: this.props.salesTeamId, group_name: this.props.salesTeam}],
            loading: false,
            submitErrorMsg: ''
        };
    },
    onStoreChange: function () {
        this.setState({salesManList: BatchChangeStore.getState().salesManList});
    },
    componentDidMount: function () {
        BatchChangeStore.listen(this.onStoreChange);
        BatchChangeActions.getSalesManList();
    },
    componentWillUnmount: function () {
        BatchChangeStore.unlisten(this.onStoreChange);
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.customerId != this.state.customerId) {
            //切换客户时，重新设置state数据
            let stateData = this.getInitialState();
            stateData.isMerge = nextProps.isMerge;
            stateData.customerId = nextProps.customerId;
            stateData.userName = nextProps.userName;
            stateData.userId = nextProps.userId;
            stateData.salesTeam = nextProps.salesTeam;
            stateData.salesTeamId = nextProps.salesTeamId;
            stateData.salesTeamList = [{group_id: nextProps.salesTeamId, group_name: nextProps.salesTeam}];
            stateData.disabled = nextProps.disabled;
            this.setState(stateData);
        }
    },
    //是否是普通销售(多角色时：非销售领导、域管理员)的判断
    isSales: function () {
        return userData.hasRole("sales") && !userData.isSalesManager()
    },
    //更新销售人员
    handleSalesManChange: function (userId, nickName) {
        if (this.isSales()) {
            Trace.traceEvent(this.getDOMNode(),"修改销售人员");
            //普通销售，只修改销售人员
            this.state.userId = userId;
            this.state.userName = nickName;
        } else {
            Trace.traceEvent(this.getDOMNode(),"修改销售人员及其团队");
            //销售领导、域管理员，修改销售人员时，将其对应的所属团队及其相关团队列表一起修改
            BatchChangeActions.setSalesMan({sales_id: userId, sales_name: nickName});
            this.state.userId = BatchChangeStore.getState().salesman_id;
            this.state.userName = BatchChangeStore.getState().salesman_nick_name;
            this.state.salesTeamList = BatchChangeStore.getState().sales_team_list;
            this.state.salesTeamId = BatchChangeStore.getState().sales_team_id;
            this.state.salesTeam = BatchChangeStore.getState().sales_team;
        }
        this.setState(this.state);
    },

    changeDisplayType: function (type) {
        if (type === 'text') {
            Trace.traceEvent(this.getDOMNode(),"取消对销售人员/团队的修改");
            this.setState({
                loading: false,
                displayType: type,
                userName: this.props.userName,
                userId: this.props.userId,
                salesTeam: this.props.salesTeam,
                salesTeamId: this.props.salesTeamId,
                salesTeamList: [{group_id: this.props.salesTeamId, group_name: this.props.salesTeam}],
                submitErrorMsg: ''
            });
        } else {
            Trace.traceEvent(this.getDOMNode(),"点击设置销售按钮");
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
        Trace.traceEvent(this.getDOMNode(),"保存对销售人员/团队的修改");
        if (this.props.isMerge) {
            this.props.updateMergeCustomer(submitData);
        } else {
            this.setState({loading: true});
            CrmBasicAjax.updateCustomer(submitData).then(result=> {
                if (result) {
                    this.setState({
                        loading: false,
                        displayType: 'text',
                        submitErrorMsg: ''
                    });
                    //更新列表中的客户地域
                    this.props.modifySuccess(submitData);
                }
            }, errorMsg=> {
                this.setState({
                    loading: false,
                    submitErrorMsg: errorMsg || Intl.get("crm.172", "修改客户所属销售失败")
                });
            });
        }
    },
    //更新团队
    handleTeamChange: function (value, text) {
        BatchChangeActions.changeSalesTeam({
            sales_team_name: text,
            sales_team_id: value
        });
        this.state.salesTeamId = BatchChangeStore.getState().sales_team_id;
        this.state.salesTeam = BatchChangeStore.getState().sales_team;
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
                <i title={Intl.get("common.save", "保存")} className="inline-block iconfont icon-choose" onClick={this.handleSubmit}/>
                <i title={Intl.get("common.cancel", "取消")} className="inline-block iconfont icon-close"
                   onClick={this.changeDisplayType.bind(this,"text")}/>
            </div>
        );
        return (<div className="crm-basic-sales-content client-info-content">
            <div className=" block-split-line"></div>
            <dl className="dl-horizontal crm-basic-item detail_item crm-basic-sales">
                <dt><ReactIntl.FormattedMessage id="user.salesman" defaultMessage="销售人员" /></dt>
                <dd>
                    {this.state.displayType === 'text' ? (
                        <div className="basic-sales-field">
                            <span>{this.state.userName}</span>
                            {hasPrivilege("CUSTOMER_UPDATE_SALES") ? (
                                <i className="iconfont icon-update" title={Intl.get("crm.173", "设置销售")}
                                   onClick={this.changeDisplayType.bind(this , "edit")}/>) : null}
                        </div>
                    ) : (
                        <div className="basic-sales-edit-field">
                            <Select
                                placeholder={Intl.get("crm.17", "请选择销售人员")}
                                showSearch
                                onChange={this.handleSalesManChange}
                                value={this.state.userId}
                                optionFilterProp="children"
                                notFoundContent={salesmanOptions.length ? Intl.get("crm.30", "无相关销售"):Intl.get("crm.29", "暂无销售") }
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
                <dt><ReactIntl.FormattedMessage id="user.sales.team" defaultMessage="销售团队" /></dt>
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
