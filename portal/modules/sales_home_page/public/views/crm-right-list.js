/**
 * 客户、用户、电话、合同统计总数
 * Created by wangliping on 2016/11/14.
 */
import { Breadcrumb, Icon } from 'antd';
import Trace from "LIB_DIR/trace";
var SearchInput = require("../../../../components/searchInput");
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var OplateCustomerAnalysisAction = require("../../../oplate_customer_analysis/public/action/oplate-customer-analysis.action");
let userData = require("../../../../public/sources/user-data");
let SalesHomeAction = require("../action/sales-home-actions");
let constantUtil = require("../util/constant");
let showTypeConstant = constantUtil.SHOW_TYPE_CONSTANT;//当前展示的类型常量（销售团队列表、团队成员列表、销售的待办事宜）
let _ = require('underscore');

var delayConstant = constantUtil.DELAY.TIMERANG;

let CrmRightList = React.createClass({
    getInitialState: function () {
        return {
            searchInputShow: false,
            searchValue: "",
            updateScrollBar:false
        }
    },
    componentWillReceiveProps:function (nextProps) {
        if (nextProps.updateScrollBar){
            this.setState({
                updateScrollBar:true
            },()=>{
                setTimeout(()=>{
                    this.setState({
                        updateScrollBar:false
                    })
                },delayConstant)
            })
        }
    },
    //渲染等待效果、暂无数据的提示
    renderTooltip: function (resultType, errorMsg) {
        if (resultType == "loading") {
            return (<Icon type="loading" />);
        } else if (resultType == "error" || resultType == "noData") {
            return (<div className="no-data-tip">{errorMsg || Intl.get("sales.home.get.data.failed", "获取数据失败")}</div>)
        }
    },
    //点击查看当前团队的数据
    selectSalesTeam: function (e,team) {
        OplateCustomerAnalysisAction.resetChartData("loading");
        SalesHomeAction.selectSalesTeam(team);
        //刷新左侧的统计、分析数据
        setTimeout(() => {
            this.props.refreshDataByChangeSales();
        });
        this.hideSearchInput();        
        Trace.traceEvent(e,"点击查看'" + team.group_name + "'团队的数据");
    },
    //点击查看当前成员的数据
    selectSalesman: function (e,user) {
        OplateCustomerAnalysisAction.resetChartData("loading");
        SalesHomeAction.selectSalesman(user);
        //刷新左侧的统计、分析数据
        setTimeout(() => this.props.refreshDataByChangeSales());
        this.hideSearchInput();
        Trace.traceEvent(e,"点击查看'" + user.nickName + "销售人员的数据");
    },
    //通过面包屑返回到销售团队列表
    returnSalesTeamList: function (e,team) {
        OplateCustomerAnalysisAction.resetChartData("loading");
        SalesHomeAction.returnSalesTeamList(team.group_id);
        //刷新左侧的统计、分析数据
        setTimeout(() => this.props.refreshDataByChangeSales());
        this.hideSearchInput();
        Trace.traceEvent(e,"返回'" + team.group_name + "'团队的数据");
    },
    //通过面包屑返回到销售成员列表
    returnSalesMemberList: function (e) {
        OplateCustomerAnalysisAction.resetChartData("loading");
        SalesHomeAction.returnSalesMemberList();
        //刷新左侧的统计、分析数据
        setTimeout(() => this.props.refreshDataByChangeSales());
        Trace.traceEvent(e,"返回销售成员列表")
    },
    //获取销售的标题
    getSalesmanTitle: function () {
        let salesTitle = "", originTeamTree = this.props.originSalesTeamTree;
        if (this.props.currShowSalesman) {
            //通过点击销售团队成员列表中的成员跳到其用户提醒时
            let currShowTeam = this.props.currShowSalesTeam;
            if (currShowTeam) {
                //从销售团队列表一级级进入
                let titleItem = [];
                //遍历添加所有的上级团队
                this.addTitleItem(originTeamTree, titleItem);
                salesTitle = (<Breadcrumb>
                    {titleItem}
                    <Breadcrumb.Item><a
                        onClick={ e => this.returnSalesMemberList(e) }>{currShowTeam.group_name}</a></Breadcrumb.Item>
                    <Breadcrumb.Item>{this.props.currShowSalesman.nickName}</Breadcrumb.Item>
                </Breadcrumb>);
            } else {
                //销售团队成员列表
                var itemList = [];
                itemList.push(<Breadcrumb.Item><a
                    onClick={ e => this.returnSalesMemberList(e) }>{originTeamTree.group_name}</a></Breadcrumb.Item>);
                itemList.push(<Breadcrumb.Item>{this.props.currShowSalesman.nickName}</Breadcrumb.Item>);
                salesTitle = (<Breadcrumb>{itemList}</Breadcrumb>);
            }
        } else {
            salesTitle = userData.getUserData().nick_name;
        }
        return salesTitle
    },
    //加入其上级团队
    addTitleItem: function (team, titleItem) {
        //该团队是当前展示列表的上级团队
        if (team.isCurrShowListParent && team.group_id !== this.props.currShowSalesTeam.group_id) {
            titleItem.push(<Breadcrumb.Item>
                <a onClick={ e => this.returnSalesTeamList(e, team) }>{team.group_name}</a>
            </Breadcrumb.Item>);
            if (_.isArray(team.child_groups) && team.child_groups.length > 0) {
                _.some(team.child_groups, team => {
                    if (team.isCurrShowListParent) {
                        this.addTitleItem(team, titleItem);
                        return true;
                    }
                });
            }
        }
    },

    //获取销售团队/成员列表的标题
    getSalesListTitle: function () {
        let salesTitle = "", originTeamTree = this.props.originSalesTeamTree;
        if (this.props.currShowSalesTeam) {
            //通过点击销售团队列表中的销售团队转到其团队/成员列表时
            let titleItem = [];
            //遍历添加所有的上级团队
            this.addTitleItem(originTeamTree, titleItem);
            salesTitle = (<Breadcrumb>
                {titleItem}
                <Breadcrumb.Item>{this.props.currShowSalesTeam.group_name}</Breadcrumb.Item>
            </Breadcrumb>);
        } else {
            //首次展示就是销售团队的团队/成员列表
            salesTitle = originTeamTree.group_name;
        }
        return salesTitle;
    },
    //获取销售团队的成员列表
    getSalesMemberList: function () {
        let salesListLi = [];
        let salesTeamMembersObj = this.props.salesTeamMembersObj;
        if (salesTeamMembersObj.resultType) {
            //等待效果及错误提示
            salesListLi = this.renderTooltip(salesTeamMembersObj.resultType, salesTeamMembersObj.errorMsg);
        } else {
            let salesTeamMemberList = salesTeamMembersObj.data;
            if (_.isArray(salesTeamMemberList) && salesTeamMemberList.length > 0) {
                //对团队列表进行排序，启用的放在前面，停用的放在后面
                salesTeamMemberList = _.sortBy(salesTeamMemberList, (item)=>{ return -item.status});
                salesTeamMemberList.map((salesman, i) => {
                    if (salesman.nickName.indexOf(this.state.searchValue) != -1) {
                        let name = salesman.nickName, color = this.getBgColor(i);
                        if (salesman.status == 0) {
                            //停用状态
                            name += " ( " + Intl.get("common.stop", "停用") + " ) ";
                        }
                        salesListLi.push(<li key={salesman.userId} className={salesman.status == 0 ? "user-stop-li" : ""}
                            onClick={ e => this.selectSalesman(e, salesman)} >
                            <span className="sales-item-icon" style={{ backgroundColor: color }} />{name}
                        </li>);
                    }
                });
            } else {
                //无数据的提示
                salesListLi = this.renderTooltip("noData", Intl.get("sales.home.no.sales", "暂无销售成员"));
            }
        }
        return salesListLi;
    },
    //获取销售团队列表
    getSalesTeamList: function () {
        let salesListLi = [], salesTeamList = this.props.salesTeamListObj.data;
        if (_.isArray(salesTeamList) && salesTeamList.length > 0) {
            salesTeamList.map((salesTeam, i) => {
                let teamMemberCount = this.getTeamMemberCount(salesTeam, 0);
                if (salesTeam.group_name.indexOf(this.state.searchValue) != -1) {
                    let color = this.getBgColor(i);
                    salesListLi.push(<li key={salesTeam.group_id} onClick={e => this.selectSalesTeam(e, salesTeam)}>
                        <span className="sales-item-icon"
                            style={{ backgroundColor: color }} />{salesTeam.group_name}({teamMemberCount}人)
                    </li>);
                }
            });
        } else {
            //无数据的提示
            salesListLi = this.renderTooltip("noData", Intl.get("sales.home.no.team", "暂无销售团队"));
        }
        return salesListLi;
    },
    //获取销售团队内的成员个数
    getTeamMemberCount: function (salesTeam, teamMemberCount) {
        if (salesTeam.owner_id) {
            teamMemberCount++;
        }
        if (_.isArray(salesTeam.manager_ids) && salesTeam.manager_ids.length > 0) {
            teamMemberCount += salesTeam.manager_ids.length;
        }
        if (_.isArray(salesTeam.user_ids) && salesTeam.user_ids.length > 0) {
            teamMemberCount += salesTeam.user_ids.length;
        }
        //递归遍历子团队，加上子团队的人数
        if (_.isArray(salesTeam.child_groups) && salesTeam.child_groups.length > 0) {
            salesTeam.child_groups.forEach(team => {
                teamMemberCount = this.getTeamMemberCount(team, teamMemberCount);
            });
        }
        return teamMemberCount;
    },
    searchEvent: function (searchValue) {
        this.setState({
            searchValue: searchValue
        });
    },
    hideSearchInput: function () {
        this.setState({ searchInputShow: false, searchValue: "" });
        //$(".sales-team-top .search-input").val("");
    },
    showSearchInput: function () {
        this.setState({ searchInputShow: true });
    },
    renderListContent: function () {
        let salesTitle = "", salesListLi = [], isShowSearch = true;
        switch (this.props.currShowType) {
            case showTypeConstant.SALESMAN:
                //没有销售团队时，并且是普通销售或者舆情秘书时，展示过期用户提醒
                salesTitle = this.getSalesmanTitle();
                isShowSearch = false;
                //如果是通过点击团队成员列表 显示出来的销售，什么都不展示
                if (this.props.currShowSalesman) {
                    salesListLi = "";
                }
                break;
            case showTypeConstant.SALES_MEMBER_LIST:
                //当前展示的是该销售团队的成员列表
                salesTitle = this.getSalesListTitle();
                salesListLi = this.getSalesMemberList();
                break;
            case showTypeConstant.SALES_TEAM_LIST:
                //当前展示的是销售团队的列表
                salesTitle = this.getSalesListTitle();
                salesListLi = this.getSalesTeamList();
                break;
        }
        let salesListHeight = this.props.getSalesListHeight();
        return (
            <div>
                <div className="sales-team-top">
                    <span className="sales-team-title"> {salesTitle}</span>
                    {isShowSearch ? this.state.searchInputShow ? (
                        <SearchInput searchPlaceHolder={Intl.get("sales.home.filter.tip", "请输入关键字进行过滤")}
                            closeSearchInput={this.hideSearchInput}                            
                            searchEvent={this.searchEvent} />) : (
                            <Icon type="search" className="search-sales-icon" onClick={this.showSearchInput} />)
                        : null}
                </div>
                <ul className="sales-list-container" style={{ height: salesListHeight }}>
                    {this.renderContent(salesListLi)}
                </ul>
            </div>
        );
    },
    renderContent:function (salesListLi) {
        if (this.state.updateScrollBar){
            return (
                <div>
                    {salesListLi}
                </div>
            )
        }else{
            return (
                <GeminiScrollbar enabled={this.props.scrollbarEnabled} ref="scrollbar">
                    {salesListLi}
                </GeminiScrollbar>
            )
        }
    },
    //获取颜色（从echart的颜色列表中循环获取）
    getBgColor: function (i) {
        let colorList = constantUtil.COLOR_LIST, colorIndex = i;
        if (i > colorList.length) {
            colorIndex = i % colorList.length;
        }
        return colorList[colorIndex];
    },

    //设置当前要展示的视图
    setActiveView: function (view) {
        SalesHomeAction.setActiveView(view);
    },

    render: function () {
        let resultType = this.props.salesTeamListObj.resultType, errorMsg = this.props.salesTeamListObj.errorMsg;
        return (
            <div className="crm-sales-team-zone">
                <div className="crm-sales-team-container">
                    {resultType ? (this.renderTooltip(resultType, errorMsg)) : this.renderListContent()}
                </div>
            </div>
        );
    }
});

module.exports = CrmRightList;