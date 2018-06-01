/**
 * 客户分析
 * Created by wangliping on 2016/11/24.
 */
import { AntcAnalysis } from "antc";
var GeminiScrollbar = require("../../../../components/react-gemini-scrollbar");
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
var getDataAuthType = require('../../../../components/privilege/checker').getDataAuthType;
var OplateCustomerAnalysisAction = require("../../../oplate_customer_analysis/public/action/oplate-customer-analysis.action");
var OplateCustomerAnalysisStore = require("../../../oplate_customer_analysis/public/store/oplate-customer-analysis.store");
var CompositeLine = require("../../../oplate_customer_analysis/public/views/composite-line");
var BarChart = require("../../../oplate_customer_analysis/public/views/bar");
var ReverseBarChart = require("../../../oplate_customer_analysis/public/views/reverse_bar");
var SingleLineChart = require("../../../oplate_customer_analysis/public/views/single_line");
var FunnelChart = require("../../../oplate_customer_analysis/public/views/funnel");
var emitter = require("../../../oplate_customer_analysis/public/utils/emitter");
let userData = require("../../../../public/sources/user-data");
var DATE_FORMAT = oplateConsts.DATE_FORMAT;
var legend = [{ name: Intl.get("sales.home.new.add", "新增"), key: "total" }];
var constantUtil = require("../util/constant");
//这个时间是比动画执行时间稍长一点的时间，在动画执行完成后再渲染滚动条组件
var delayConstant = constantUtil.DELAY.TIMERANG;
import Analysis from "CMP_DIR/analysis";
import { processCustomerStageChartData, processOrderStageChartData } from "CMP_DIR/analysis/utils";
import { AntcHorizontalStageChart, AntcTable } from "antc";
import { Button, Spin, Alert } from "antd";
const Spinner = require("CMP_DIR/spinner");
var NoMoreDataTip = require("CMP_DIR/no_more_data_tip");
import CustomerStageTable from "./customer-stage-table";
const DEFAULT_TABLE_PAGESIZE = 10;
import {phoneMsgEmitter} from "PUB_DIR/sources/utils/emitters";
import rightPanelUtil from "CMP_DIR/rightPanel";
const RightPanel = rightPanelUtil.RightPanel;
var AppUserManage = require("MOD_DIR/app_user_manage/public");
var CrmAction = require("MOD_DIR/crm/public/action/crm-actions");
import NewTrailCustomerTable from './new-trail-and-aign-customer';
const Emitters = require("PUB_DIR/sources/utils/emitters");
const dateSelectorEmitter = Emitters.dateSelectorEmitter;
const appSelectorEmitter = Emitters.appSelectorEmitter;
const teamTreeEmitter = Emitters.teamTreeEmitter;
//客户分析
var CustomerAnalysis = React.createClass({
    getStateData: function() {
        let stateData = OplateCustomerAnalysisStore.getState();
        return {
            ...stateData,
            timeType: this.props.timeType,
            startTime: this.props.startTime,
            endTime: this.props.endTime,
            originSalesTeamTree: this.props.originSalesTeamTree,
            updateScrollBar: false
        };
    },
    onStateChange: function() {
        this.setState(this.getStateData());
    },
    getInitialState: function() {
        let stateData = this.getStateData();
        return stateData;
    },
    componentWillMount() {
        teamTreeEmitter.on(teamTreeEmitter.SELECT_TEAM, this.onTeamChange);
        teamTreeEmitter.on(teamTreeEmitter.SELECT_MEMBER, this.onMemberChange);
    },    
    componentWillReceiveProps: function(nextProps) {
        let timeObj = {
            timeType: nextProps.timeType,
            startTime: nextProps.startTime,
            endTime: nextProps.endTime,
            originSalesTeamTree: nextProps.originSalesTeamTree
        };
        const timeChanged = (this.props.startTime != nextProps.startTime) || (this.props.endTime != nextProps.endTime);
        this.setState(timeObj, () => {
            if (timeChanged) {
                setTimeout(() => {
                    this.getTransferCustomers({ isFirst: true });
                    this.getStageChangeCustomers();
                    this.getCustomerStageAnalysis();
                });
            }
        });
        if (nextProps.updateScrollBar) {
            this.setState({
                updateScrollBar: true
            }, () => {
                setTimeout(() => {
                    this.setState({
                        updateScrollBar: false
                    });
                }, delayConstant);
            });
        }
    },
    onTeamChange(team_id, allSubTeamIds) {
        let teamId = team_id;
        if (allSubTeamIds && allSubTeamIds.length > 0) {
            teamId = allSubTeamIds.join(",");
        }        
        OplateCustomerAnalysisAction.teamChange(teamId);
        setTimeout(() => this.getCustomerStageAnalysis({
            team_id
        }));
    },
    onMemberChange(member_id) {
        OplateCustomerAnalysisAction.memberChange(member_id);
        setTimeout(() => this.getCustomerStageAnalysis({
            member_id
        }));
    },
    getDataType: function() {
        if (hasPrivilege("GET_TEAM_LIST_ALL")) {
            return "all";
        } else if (hasPrivilege("GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS")) {
            return "self";
        } else {
            return "";
        }
    },
    getStageChangeCustomerList: function(data) {
        const { isFirst } = data;
        const paramObj = {
            params: {
                sort_field: this.state.stageChangedCustomerList.sorter.field,
                order: this.state.stageChangedCustomerList.sorter.order,
                page_size: DEFAULT_TABLE_PAGESIZE,
            },
            ...data
        };
        const lastId = this.state.stageChangedCustomerList.lastId;
        if (lastId && !isFirst) {
            paramObj.queryObj = {
                id: lastId
            };
        }
        if (isFirst) {
            this.state.stageChangedCustomerList.lastId = "";
            this.state.stageChangedCustomerList.listenScrollBottom = true;
            this.setState({ stageChangedCustomerList: this.state.stageChangedCustomerList }, () => {
                OplateCustomerAnalysisAction.getStageChangeCustomerList(paramObj);
            });
        } else {
            OplateCustomerAnalysisAction.getStageChangeCustomerList(paramObj);
        }
    },
    //获取客户阶段变更数据
    getStageChangeCustomers: function() {
        let params = {
            rang_params: [
                {
                    "from": this.state.startTime,
                    "to": this.state.endTime,
                    "name": "time",
                    "type": "time"
                }
            ],
        };
        OplateCustomerAnalysisAction.getStageChangeCustomers(params);
    },
    //获取不同阶段客户数
    getCustomerStageAnalysis: function(params) {
        let teamId = this.state.currentTeamId;
        if (teamId && teamId.includes(",")) {
            teamId = teamId.split(",")[0];//此接口需要的teamid为最上级的团队id
        }
        let paramsObj = {
            ...params,
            starttime: this.state.startTime,
            endtime: this.state.endTime,
            app_id: "all",
            team_id: teamId
        };
        OplateCustomerAnalysisAction.getCustomerStageAnalysis(paramsObj);
    },
    getChartData: function() {
        const queryParams = {
            starttime: this.state.startTime,
            endtime: this.state.endTime,
            urltype: 'v2',
            dataType: this.getDataType()
        };
        //客户属性，对应各具体统计图，如行业、地域等
        let customerPropertys = ["zone", "industry", "stage"];
        if (this.props.currShowSalesman) {
            //查看当前选择销售的统计数据
            queryParams.member_id = this.props.currShowSalesman.userId;
        } else if (this.props.currShowSalesTeam) {
            //查看当前选择销售团队内所有下级团队/成员的统计数据
            queryParams.team_id = this.props.currShowSalesTeam.group_id;
            //团队统计
            customerPropertys.push("team");
        } else if (!userData.hasRole(userData.ROLE_CONSTANS.SALES)) {//普通销售不展示团队信息
            //首次进来时，如果不是销售就获取下级团队/团队成员的统计数据
            customerPropertys.push("team");
        }
        //选择天时，不展示趋势图
        if (this.state.timeType != "day") {
            customerPropertys.unshift("trend");
        }
        //获取各统计图数据
        customerPropertys.forEach(customerProperty => {
            let customerType = 'added';
            //销售阶段展示总数
            if (customerProperty == "stage") {
                customerType = "total";
            }
            const reqData = _.extend({}, queryParams, {
                customerType: customerType,
                customerProperty: customerProperty
            });
            setTimeout(() => {
                OplateCustomerAnalysisAction.getAnalysisData(reqData);
            });
        });
    },
    //缩放延时，避免页面卡顿
    resizeTimeout: null,
    //窗口缩放时候的处理函数
    windowResize: function() {
        clearTimeout(this.resizeTimeout);
        //窗口缩放的时候，调用setState，重新走render逻辑渲染
        this.resizeTimeout = setTimeout(() => this.setState(this.getStateData()), 300);
    },
    componentDidMount: function() {
        OplateCustomerAnalysisStore.listen(this.onStateChange);
        OplateCustomerAnalysisAction.getSalesStageList();
        this.getChartData();
        setTimeout(() => {
            this.getStageChangeCustomers();
            this.getTransferCustomers({ isFirst: true });
            this.getCustomerStageAnalysis();
        });

        //绑定window的resize，进行缩放处理
        $(window).on('resize', this.windowResize);
        $(".statistic-data-analysis .thumb").hide();
    },
    //切换展示客户阶段统计
    toggleCusStageMetic: function() {
        OplateCustomerAnalysisAction.toggleStageCustomerList();
    },
    componentWillUnmount: function() {
        OplateCustomerAnalysisStore.unlisten(this.onStateChange);
        //$('body').css('overflow', 'visible');
        //组件销毁时，清除缩放的延时
        clearTimeout(this.resizeTimeout);
        //解除window上绑定的resize函数
        $(window).off('resize', this.windowResize);
        teamTreeEmitter.removeListener(teamTreeEmitter.SELECT_TEAM, this.onTeamChange);
        teamTreeEmitter.removeListener(teamTreeEmitter.SELECT_MEMBER, this.onMemberChange);
    },
    /**
     * 参数说明，ant-design的table组件
     * @param pagination   分页参数，当前不需要使用分页
     * @param filters      过滤器参数，当前不需要使用过滤器
     * @param sorter       排序参数，当前需要使用sorter
     *                      {field : 'xxx' //排序字段 , order : 'descend'/'ascend' //排序顺序}
     */
    onTransferSortChange(pagination, filters, sorter) {
        this.state.transferCustomers.sorter = sorter;
        this.state.transferCustomers.lastId = "";
        this.setState({
            transferCustomers: this.state.transferCustomers
        }, () => {
            this.getTransferCustomers({ isFirst: true });
        });

    },
    //获取转出客户统计数据
    getTransferCustomers: function({ isFirst = false }) {
        let params = {
            isFirst,
            sort_field: this.state.transferCustomers.sorter.field,
            order: this.state.transferCustomers.sorter.order,
            page_size: DEFAULT_TABLE_PAGESIZE,
            query: {},
            rang_params: [
                {
                    "from": this.state.startTime,
                    "to": this.state.endTime,
                    "name": "time",
                    "type": "time"
                }
            ],
        };
        const lastId = this.state.transferCustomers.lastId;
        if (lastId && !isFirst) {
            params.query.id = lastId;
        }
        if (isFirst) {
            this.state.transferCustomers.lastId = "";
            this.state.transferCustomers.listenScrollBottom = true;
            this.setState({ transferCustomers: this.state.transferCustomers }, () => {
                OplateCustomerAnalysisAction.getTransferCustomers(params);
            });
        } else {
            OplateCustomerAnalysisAction.getTransferCustomers(params);
        }
    },
    //趋势统计
    getCustomerChart: function() {
        if (this.state.isComposite) {
            //所有应用的新增趋势统计
            var list = _.isArray(this.state.trendAnalysis.data) ?
                this.state.trendAnalysis.data : [];
            return (
                <CompositeLine
                    width={this.chartWidth}
                    list={list}
                    title={Intl.get("customer.analysis.add.customer", "新增客户")}
                    height={214}
                    resultType={this.state.trendAnalysis.resultType}
                />
            );
        } else {
            //某个应用下的新增趋势统计
            return (
                <SingleLineChart
                    width={this.chartWidth}
                    list={this.state.trendAnalysis.data}
                    title={Intl.get("customer.analysis.add.customer", "新增客户")}
                    legend={[{
                        name: Intl.get("user.analysis.formal", "正式"),
                        key: "formal"
                    }, { name: Intl.get("common.trial", "试用"), key: "trial" }]}
                    resultType={this.state.trendAnalysis.resultType}
                />
            );
        }
    },
    getStartDateText: function() {
        if (this.state.startTime) {
            return moment(new Date(+this.state.startTime)).format(DATE_FORMAT);
        } else {
            return "";
        }
    },
    //获取结束日期文字
    getEndDateText: function() {
        if (!this.state.endTime) {
            return moment().format(DATE_FORMAT);
        }
        return moment(new Date(+this.state.endTime)).format(DATE_FORMAT);
    },
    //地域统计
    getZoneChart: function() {
        var startDate = this.getStartDateText();
        var endDate = this.getEndDateText();
        return (
            <BarChart
                width={this.chartWidth}
                list={this.state.zoneAnalysis.data}
                title={Intl.get("user.analysis.address", "地域统计")}
                legend={legend}
                startDate={startDate}
                endDate={endDate}
                showLabel={true}
                resultType={this.state.zoneAnalysis.resultType}
            />
        );
    },
    //获取通过点击统计图中的柱子跳转到用户列表时需传的参数
    getJumpProps: function() {
        let analysis_filter_field = "sales_id", currShowSalesTeam = this.props.currShowSalesTeam;
        //当前展示的是下级团队还是团队内所有成员
        if (currShowSalesTeam) {
            if (_.isArray(currShowSalesTeam.child_groups) && currShowSalesTeam.child_groups.length) {
                //查看当前选择销售团队内所有下级团队新增用户的统计数据
                analysis_filter_field = "team_ids";
            }
        } else if (!userData.hasRole(userData.ROLE_CONSTANS.SALES)) {
            let originSalesTeamTree = this.state.originSalesTeamTree;
            if (_.isArray(originSalesTeamTree.child_groups) && originSalesTeamTree.child_groups.length) {
                //首次进来时，如果不是销售就获取下级团队新增用户的统计数据
                analysis_filter_field = "team_ids";
            }
        }
        return {
            url: "/crm",
            query: {
                app_id: "",
                analysis_filter_field: analysis_filter_field
            }
        };
    },
    //团队统计
    getTeamChart: function() {
        var startDate = this.getStartDateText();
        var endDate = this.getEndDateText();
        let list = this.state.teamAnalysis.data;
        let resultType = this.state.teamAnalysis.resultType;
        //getJumpProps={this.getJumpProps}
        //getSaleIdByName={this.props.getSaleIdByName}
        return (
            <BarChart
                width={this.chartWidth}
                list={list}
                title={Intl.get("user.analysis.team", "团队统计")}
                legend={legend}
                startDate={startDate}
                endDate={endDate}
                showLabel={true}
                resultType={resultType}
            />
        );
    },
    //活跃客户数的统计
    getActiveCustomerChart: function() {
        var startDate = this.getStartDateText();
        var endDate = this.getEndDateText();
        var legend = [{ name: Intl.get("sales.home.new.add", "新增"), key: "count" }];
        return (
            <BarChart
                width={this.chartWidth}
                list={this.state.activeCustomerAnalysis.data}
                title={Intl.get("user.analysis.active.customer", "活跃客户")}
                legend={legend}
                startDate={startDate}
                endDate={endDate}
                getJumpProps={this.getJumpProps}
                getSaleIdByName={this.props.getSaleIdByName}
                showLabel={true}
                resultType={this.state.activeCustomerAnalysis.resultType}
            />
        );
    },

    getIndustryChart: function() {
        var startDate = this.getStartDateText();
        var endDate = this.getEndDateText();
        return (
            <ReverseBarChart
                list={this.state.industryAnalysis.data}
                title={Intl.get("user.analysis.industry", "行业统计")}
                width={this.chartWidth}
                height={214}
                startDate={startDate}
                endDate={endDate}
                legend={legend}
                showLabel={true}
                resultType={this.state.industryAnalysis.resultType}
            />
        );
    },
    //获取客户阶段统计图
    getCustomerStageChart: function() {
        return (
            React.createElement(Analysis, {
                handler: "getCustomerStageAnalysis",
                type: getDataAuthType().toLowerCase(),
                chartType: "funnel",
                appId: "all",
                isGetDataOnMount: true,
                processData: processCustomerStageChartData,
                valueField: "showValue",
                height: 260,
                minSize: "5%",
                startTime: "0",//接口参数变了，startTime固定为0
                endTime: this.state.endTime,
            })
        );
    },
    getStageChart: function() {
        const stageData = this.state.stageAnalysis.data;

        const chartData = processOrderStageChartData(this.state.salesStageList, stageData);

        return (
            <AntcHorizontalStageChart
                chartData={chartData}
                width={this.chartWidth}
                resultType={this.state.stageAnalysis.resultType}
            />
        );
    },
    //处理阶段点击的回调 
    handleStageNumClick: function(item, type) {
        this.setState({
            selectedCustomerStage: {
                type,
                time: item.time,
                nickname: item.memberName
            }
        });
        this.getStageChangeCustomerList({
            isFirst: true,
            query: {
                label: type,
                nickname: item.memberName
            },
            rang_params: [{
                "from": moment(item.time).startOf('day').valueOf(),
                "to": moment(item.time).endOf('day').valueOf(),
                "name": "time",
                "type": "time"
            }]
        });
        this.toggleCusStageMetic();
    },
    onStageSortChange(pagination, filters, sorter) {
        this.getStageChangeCustomers(sorter.order);
    },
    renderCustomerStage: function() {
        const handleNum = num => {
            if (num && num > 0) {
                return "+" + num;
            }
        };
        const columns = [
            {
                title: Intl.get("crm.146", "日期"),
                dataIndex: 'time',
                key: 'time',
                width: 100
            }, {
                title: Intl.get("sales.stage.message", "信息"),
                dataIndex: "map.信息",
                key: "info",
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, item, "信息")}>{handleNum(text)}</span>
                    );
                }
            }, {
                title: Intl.get("sales.stage.intention", "意向"),
                dataIndex: "map.意向",
                key: "intention",
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, item, "意向")}>{handleNum(text)}</span>
                    );
                }
            }, {
                title: Intl.get("common.trial", "试用"),
                dataIndex: "map.试用",
                key: "trial",
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, item, "试用")}>{handleNum(text)}</span>
                    );
                }
            }, {
                title: Intl.get("common.trial.qualified", "试用合格"),
                dataIndex: "map.试用合格",
                key: "trial.qualified",
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, item, "试用合格")}>{handleNum(text)}</span>
                    );
                }
            }, {
                title: Intl.get("common.trial.unqualified", "试用不合格"),
                dataIndex: "map.试用不合格",
                key: "unqualified",
                width: 100,
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, item, "试用不合格")}>{handleNum(text)}</span>
                    );
                }
            }, {
                title: Intl.get("sales.stage.signed", "签约"),
                dataIndex: "map.签约",
                key: "signed",
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, item, "签约")}>{handleNum(text)}</span>
                    );
                }
            }, {
                title: Intl.get("sales.stage.lost", "流失"),
                dataIndex: "map.流失",
                key: "map.流失",
                render: (text, item, index) => {
                    return (
                        <span className="customer-stage-number"
                            onClick={this.handleStageNumClick.bind(this, item, "流失")}>{handleNum(text)}</span>
                    );
                }
            }, {
                title: Intl.get("sales.home.sales", "销售"),
                dataIndex: "memberName",
                key: "memberName"
            }, {
                title: Intl.get("common.belong.team", "所属团队"),
                dataIndex: "salesTeam",
                key: "salesTeam",
                width: 80
            }
        ];
        const loading = this.state.customerStage.loading;
        const renderErr = () => {
            if (this.state.customerStage.errorMsg) {
                return (
                    <div className="alert-container">
                        <Alert
                            message={this.state.customerStage.errorMsg}
                            type="error"
                            showIcon
                        />
                    </div>
                );
            }
        };
        const renderSpiner = () => {
            if (loading) {
                return (
                    <Spinner />
                );
            }
        };
        const hideTable = this.state.customerStage.errorMsg || loading;
        return (
            <div
                className="chart-holder stage-change-customer-container scrollbar-container"
                data-tracename="客户阶段变更统计"
                style={{ maxHeight: (this.state.customerStage.data.length == 0) ? "initial" : "540px" }}
            >
                <GeminiScrollbar>
                    <div className="title">
                        {Intl.get("crm.sales.customerStage", "客户阶段变更统计")}
                    </div>
                    {renderErr()}
                    {renderSpiner()}
                    <div className={hideTable ? "hide" : ""}>
                        <AntcTable
                            util={{ zoomInSortArea: true }}
                            dataSource={this.state.customerStage.data}
                            pagination={false}
                            columns={columns}
                            onChange={this.onStageSortChange.bind(this)}
                        />
                    </div>
                </GeminiScrollbar>
                <RightPanel
                    className="customer-stage-table-wrapper"
                    showFlag={this.state.isShowCustomerStageTable}
                >
                    {this.state.isShowCustomerStageTable ?
                        <CustomerStageTable
                            params={this.state.selectedCustomerStage}
                            result={this.state.stageChangedCustomerList}
                            onClose={this.toggleCusStageMetic}
                            handleScrollBottom={this.getStageChangeCustomerList.bind(this)}
                            showNoMoreData={!this.state.stageChangedCustomerList.loading &&
                                !this.state.stageChangedCustomerList.listenScrollBottom &&
                                this.state.stageChangedCustomerList.lastId &&
                                !this.state.stageChangedCustomerList.data.length >= DEFAULT_TABLE_PAGESIZE
                            }
                        /> : null}
                </RightPanel>
            </div >
        );


    },
    changeCurrentTab: function(tabName, event) {
        OplateCustomerAnalysisAction.changeCurrentTab(tabName);
        this.getChartData();
    },
    //客户详情面板相关方法
    ShowCustomerUserListPanel: function(data) {
        this.setState({
            isShowCustomerUserListPanel: true,
            CustomerInfoOfCurrUser: data.customerObj
        });
    },
    closeCustomerUserListPanel: function() {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    },
    hideRightPanel: function() {
        this.setState({
            showRightPanel: false
        });
    },
    renderTransferedCustomerTable: function() {
        const handleCustomerClick = (item, index) => {
            this.setState({
                showRightPanel: true,
                selectedCustomerId: item.customer_id,
                selectedCustomerIndex: index
            });
            //触发打开带拨打电话状态的客户详情面板
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                customer_params: {
                    currentId: item.customer_id,
                    ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                    hideRightPanel: this.hideRightPanel
                }
            });
        };
        const getRowKey = function(record, index) {
            return index;
        };
        //处理选中行的样式
        const handleRowClassName = (record, index) => {
            if ((index == this.state.selectedCustomerIndex) && this.state.showRightPanel) {
                return "current_row";
            }
            else {
                return "";
            }
        };
        const columns = [
            {
                title: Intl.get("common.login.time", "时间"),
                dataIndex: "time",
                key: 'time',
                sorter: true
            }, {
                title: Intl.get("crm.41", "客户名"),
                dataIndex: "customer_name",
                key: 'customer_name',
                className: "customer-name",
                sorter: true,
                render: function(text, item, index) {
                    return (
                        <span className="transfer-customer-cell"
                            onClick={handleCustomerClick.bind(this, item, index)}>{text}</span>
                    );
                }
            }, {
                title: Intl.get("crm.customer.transfer.sales", "销售代表"),
                dataIndex: "old_member_nick_name",
                key: 'old_member_nick_name',
                sorter: true
            }, {
                title: Intl.get("crm.customer.transfer.manager", "客户经理"),
                dataIndex: "new_member_nick_name",
                key: 'new_member_nick_name',
                sorter: true
            }, {
                title: Intl.get("user.sales.team", "销售团队"),
                dataIndex: "sales_team",
                key: 'sales_team',
            }

        ];
        const loadingFirst = this.state.transferCustomers.loading && !this.state.transferCustomers.lastId;
        const loadingNotFirst = this.state.transferCustomers.loading && this.state.transferCustomers.lastId;
        const renderLoadMore = () => {
            if (loadingFirst || (!this.state.transferCustomers.data || this.state.transferCustomers.data.length == 0)) {
                return null;
            } else {
                return (
                    <Button
                        onClick={this.getTransferCustomers.bind(this)}
                        loading={loadingNotFirst}
                        disabled={loadingNotFirst}
                    >
                        {Intl.get("common.load.more", "加载更多")}
                    </Button>
                );
            }
        };
        const renderErr = () => {
            if (this.state.transferCustomers.errorMsg) {
                return (
                    <div className="alert-container">
                        <Alert
                            message={this.state.transferCustomers.errorMsg}
                            type="error"
                            showIcon
                        />
                    </div>
                );
            }
        };
        const renderSpiner = () => {
            if (loadingFirst) {
                return (
                    <Spinner />
                );
            }
        };
        const hideTable = this.state.transferCustomers.errorMsg || loadingFirst;
        //是否展示没有更多数据:加载完毕&&存在数据(lastId)&&监听下拉加载&&数据长度大于一页
        const showNoMoreDataTip = !this.state.transferCustomers.loading &&
            this.state.transferCustomers.lastId &&
            !this.state.transferCustomers.listenScrollBottom &&
            this.state.transferCustomers.data.length >= DEFAULT_TABLE_PAGESIZE;
        //展示加载更多:不是首次加载&&监听下拉加载
        const showLoadingMore = !loadingFirst && this.state.transferCustomers.listenScrollBottom;
        return (
            <div
                className="chart-holder transfer-customer-container scrollbar-container"
                data-tracename="转出客户统计"
                style={{ maxHeight: (loadingFirst || this.state.transferCustomers.data.length == 0) ? "initial" : "540px" }}
            >
                <GeminiScrollbar>
                    <div className="title">
                        {Intl.get("user.analysis.moveoutCustomer", "转出客户统计")}
                    </div>
                    {renderErr()}
                    {renderSpiner()}
                    <div className={hideTable ? "hide" : ""}>
                        <AntcTable
                            rowKey={getRowKey}
                            rowClassName={handleRowClassName}
                            util={{ zoomInSortArea: true }}
                            columns={columns}
                            pagination={false}
                            onChange={this.onTransferSortChange.bind(this)}
                            dataSource={this.state.transferCustomers.data}
                            loading={loadingFirst}
                        />
                        <div className="load-more-container">
                            {showLoadingMore ? renderLoadMore() : null}
                            {<NoMoreDataTip
                                fontSize="12"
                                show={() => showNoMoreDataTip}
                            />}
                        </div>
                    </div>
                </GeminiScrollbar>
            </div>


        );

    },
    //数字转百分比
    numToPercent(num) {
        return (num * 100).toFixed(2) + "%";
    },
    //获取有效客户图表
    getEffectiveCustomerChart() {
        const charts = [{
            title: Intl.get("effective.customer.statistics", "有效客户统计"),
            url: "/rest/analysis/customer/v2/all/customer/active_rate",
            chartType: "table",
            layout: {
                sm: 24,
            },
            dataField: "list",
            option: {
                pagination: false,
                scroll: {y: 170},
                columns: [
                    {
                        title: Intl.get("user.user.team", "团队"),
                        dataIndex: "name",
                    },
                    {
                        title: Intl.get("effective.customer.number": "有效客户数"),
                        dataIndex: "valid",
                    },
                    {
                        title: Intl.get("active.customer.number": "活跃客户数"),
                        dataIndex: "active",
                    },
                    {
                        title: Intl.get("effective.customer.activity.rate": "有效客户活跃率"),
                        dataIndex: "active_rate",
                        render: text => {
                            return <span>{this.numToPercent(text)}</span>;
                        }
                    },
                ],
            },
            processOption: (option, chartProps) => {
            },
        }];

        const emitters = [
            {
                instance: dateSelectorEmitter,
                event: dateSelectorEmitter.SELECT_DATE,
                callbackArgs: [{
                    name: "start_time",
                }, {
                    name: "end_time",
                }],
            },
            {
                instance: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_TEAM,
                callbackArgs: [{
                    name: "team_ids",
                }],
            },
        ];

        const conditions = [
            {
                name: "start_time",
                value: this.props.startTime,
            },
            {
                name: "end_time",
                value: this.props.endTime,
            },
            {
                name: "interval",
                value: "day",
            },
            {
                name: "team_ids",
                value: "",
            },
        ];

        return (
            <AntcAnalysis
                charts={charts}
                emitters={emitters}
                conditions={conditions}
                cardContainer={false}
                isGetDataOnMount={true}
                style={{padding: 0}}
            />
        );
    },
    //获取近一月活跃客户趋势图
    getLastMonthActiveCustomerChart() {
        const charts = [{
            title: Intl.get("active.customer.trends.last.month": "近一月活跃客户趋势"),
            url: "/rest/analysis/customer/v2/all/customer/active_rate",
            ajaxInstanceFlag: "lastMonthActiveCustomerTrend",
            layout: {
                sm: 24,
            },
            chartType: "line",
            processOption: (option, chartProps) => {
                let activeCustomerData = [];
                let effectiveCustomerData = [];
                let categoryData = [];
                const data = chartProps.data && chartProps.data.total;

                _.each(data, dataItem => {
                    activeCustomerData.push({
                        name: dataItem.date_str,
                        value: dataItem.active,
                        active_rate: dataItem.active_rate,
                    });

                    effectiveCustomerData.push({
                        name: dataItem.date_str,
                        value: dataItem.valid,
                    });

                    categoryData.push(dataItem.date_str.substr(5));
                });

                option.series = [{
                    type: "line",
                    data: activeCustomerData,
                }, {
                    type: "line",
                    data: effectiveCustomerData,
                }];

                option.xAxis[0].data = categoryData;
                option.grid.right = 0;
                option.tooltip.formatter = params => {
                    const dateStr = params[0].name;
                    const activeNum = params[0].value;
                    const activeRate = this.numToPercent(params[0].data.active_rate);
                    const effectiveNum = params[1].value;

                    return `
                        ${dateStr}<br>
                        ${Intl.get("effective.customer.number": "有效客户数")}: ${effectiveNum}<br>
                        ${Intl.get("active.customer.number": "活跃客户数")}: ${activeNum}<br>
                        ${Intl.get("effective.customer.activity.rate": "有效客户活跃率")}: ${activeRate}
                    `;
                };
            },
        }];

        const emitters = [
            {
                instance: teamTreeEmitter,
                event: teamTreeEmitter.SELECT_TEAM,
                callbackArgs: [{
                    name: "team_ids",
                }],
            },
        ];

        const conditions = [
            {
                name: "start_time",
                value: moment().subtract(1, "months").valueOf(),
            },
            {
                name: "end_time",
                value: moment().valueOf(),
            },
            {
                name: "team_ids",
                value: "",
            },
            {
                name: "interval",
                value: "day",
            },
        ];

        return (
            <AntcAnalysis
                charts={charts}
                emitters={emitters}
                conditions={conditions}
                cardContainer={false}
                isGetDataOnMount={true}
                style={{padding: 0}}
            />
        );
    },
    renderChartContent: function() {
        //销售不展示团队的数据统计
        let hideTeamChart = userData.hasRole(userData.ROLE_CONSTANS.SALES) || this.props.currShowSalesman;
        return (
            <div className="chart_list">
                <div className="analysis_chart col-md-6 col-sm-12"
                    data-title="有效客户统计">
                    <div className="chart-holder" data-tracename="有效客户统计">
                        <div className="title">
                            {Intl.get("effective.customer.statistics", "有效客户统计")}
                        </div>
                        {this.getEffectiveCustomerChart()}
                    </div>
                </div>
                <div className="analysis_chart col-md-6 col-sm-12"
                    data-title="有效客户统计">
                    <div className="chart-holder" data-tracename="有效客户统计">
                        <div className="title">
                            {Intl.get("active.customer.trends.last.month": "近一月活跃客户趋势")}
                        </div>
                        {this.getLastMonthActiveCustomerChart()}
                    </div>
                </div>
                {this.state.timeType != "day" ? (
                    <div className="analysis_chart col-md-6 col-sm-12"
                        data-title={Intl.get("customer.analysis.add.trend", "新增趋势")}>
                        <div className="chart-holder" ref="chartWidthDom" data-tracename="新增趋势统计">
                            <div className="title"><ReactIntl.FormattedMessage
                                id="customer.analysis.add.trend" defaultMessage="新增趋势" /></div>
                            {this.getCustomerChart()}
                        </div>
                    </div>) : null}
                <div className="analysis_chart col-md-6 col-sm-12"
                    data-title={Intl.get("oplate_customer_analysis.customer.stage", "客户阶段统计")}>
                    <div className="chart-holder" data-tracename="客户阶段统计">
                        <div className="title">
                            <ReactIntl.FormattedMessage id="oplate_customer_analysis.customer.stage"
                                defaultMessage="客户阶段统计" />
                        </div>
                        {this.getCustomerStageChart()}
                    </div>
                </div>
                <div className="analysis_chart col-md-6 col-sm-12"
                    data-title={Intl.get("oplate_customer_analysis.11", "订单阶段统计")}>
                    <div className="chart-holder" data-tracename="订单阶段统计">
                        <div className="title">
                            <ReactIntl.FormattedMessage id="oplate_customer_analysis.11" defaultMessage="订单阶段统计" />
                        </div>
                        {this.getStageChart()}
                    </div>
                </div>
                <div className="analysis_chart col-md-6 col-sm-12"
                    data-title={Intl.get("user.analysis.location.add", "地域-新增")}>
                    <div className="chart-holder">
                        <div className="title"><ReactIntl.FormattedMessage id="user.analysis.location.add"
                            defaultMessage="地域-新增" /></div>
                        {this.getZoneChart()}
                    </div>
                </div>
                <div className="analysis_chart col-md-6 col-sm-12"
                    data-title={Intl.get("user.analysis.industry.add", "行业-新增")}>
                    <div className="chart-holder" data-tracename="行业-新增统计">
                        <div className="title"><ReactIntl.FormattedMessage id="user.analysis.industry.add"
                            defaultMessage="行业-新增" /></div>
                        {this.getIndustryChart()}
                    </div>
                </div>
                {hideTeamChart ? null : (
                    <div className="analysis_chart col-md-6 col-sm-12"
                        data-title={Intl.get("user.analysis.team.add", "团队-新增")}>
                        <div className="chart-holder" data-tracename="团队-新增统计">
                            <div className="title"><ReactIntl.FormattedMessage id="user.analysis.team.add"
                                defaultMessage="团队-新增" />
                            </div>
                            {this.getTeamChart()}
                        </div>
                    </div>
                )}
                {
                    //hideTeamChart ? null : (
                    //<div className="analysis_chart col-md-6 col-sm-12"
                    //     data-title={Intl.get("user.analysis.active.customer","活跃客户")+"-"+Intl.get("sales.home.new.add", "新增")}>
                    //    <div className="chart-holder">
                    //        <div
                    //            className="title">{Intl.get("user.analysis.active.customer", "活跃客户") + "-" + Intl.get("sales.home.new.add", "新增")}</div>
                    //        {this.getActiveCustomerChart()}
                    //    </div>
                    //</div>)
                }
                <div className="analysis_chart  col-sm-12 col-md-6"
                    data-title={Intl.get("crm.sales.newTrailCustomer", "新开客户数统计")}>
                    <NewTrailCustomerTable
                        result={this.state.stageCustomerNum}
                        params={{
                            startTime: this.props.startTime,
                            endTime: this.props.endTime,
                            teamId: this.state.currentTeamId,
                            memberId: this.state.currentMemberId
                        }}
                    />
                </div>
                <div className="analysis_chart col-xl-6 col-lg-12 col-md-12"
                    data-title={Intl.get("user.analysis.moveoutCustomer", "转出客户统计")}>
                    {this.renderTransferedCustomerTable()}
                </div>
                <div className="analysis_chart col-xl-6 col-lg-12 col-md-12"
                    data-title={Intl.get("crm.sales.customerStage", "客户阶段变更统计")}>
                    {this.renderCustomerStage()}
                </div>                
            </div>
        );
    },
    renderContent: function() {

        if (this.state.updateScrollBar) {
            return (
                <div>
                    {this.renderChartContent()}
                </div>
            );
        } else {
            return (
                <GeminiScrollbar enabled={this.props.scrollbarEnabled} ref="scrollbar">
                    {this.renderChartContent()}
                </GeminiScrollbar>
            );
        }
    },
    render: function() {
        let layoutParams = this.props.getChartLayoutParams();
        this.chartWidth = layoutParams.chartWidth;
        //销售不展示团队的数据统计
        let hideTeamChart = userData.hasRole(userData.ROLE_CONSTANS.SALES) || this.props.currShowSalesman;
        return (
            <div className="oplate_customer_analysis">
                <div ref="chart_list" style={{ height: layoutParams.chartListHeight }}>
                    {this.renderContent()}
                </div>
            </div>
        );
    }
});
//返回react对象
module.exports = CustomerAnalysis;
