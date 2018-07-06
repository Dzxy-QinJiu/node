/**
 * 用户分析
 * Created by wangliping on 2016/11/23.
 */
import { AntcAnalysis } from 'antc';
var GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
var OplateUserAnalysisAction = require('../../../oplate_user_analysis/public/action/oplate-user-analysis.action');
var OplateUserAnalysisStore = require('../../../oplate_user_analysis/public/store/oplate-user-analysis.store');
var CompositeLine = require('../../../oplate_user_analysis/public/views/composite-line');
var BarChart = require('../../../oplate_user_analysis/public/views/bar');
var ReverseBarChart = require('../../../oplate_user_analysis/public/views/reverse_bar');
var SingleLineChart = require('../../../oplate_user_analysis/public/views/single_line');
var emitter = require('../../../oplate_user_analysis/public/utils/emitter');
let userData = require('../../../../public/sources/user-data');
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
var DATE_FORMAT = oplateConsts.DATE_FORMAT;
let chartLegend = [{name: Intl.get('common.official', '签约'), key: 'formal'},
    {name: Intl.get('common.trial', '试用'), key: 'trial'},
    {name: Intl.get('user.type.presented', '赠送'), key: 'special'},
    {name: Intl.get('user.type.train', '培训'), key: 'training'},
    {name: Intl.get('user.type.employee', '员工'), key: 'internal'},
    {name: Intl.get('user.unknown', '未知'), key: 'unknown'}];
const CHART_HEIGHT = 214;
const LEGEND_RIGHT = 20;
var constantUtil = require('../util/constant');
//这个时间是比动画执行时间稍长一点的时间，在动画执行完成后再渲染滚动条组件
var delayConstant = constantUtil.DELAY.TIMERANG;
//用户分析
var UserAnlyis = React.createClass({
    getStateData: function() {
        let stateData = OplateUserAnalysisStore.getState();
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
        return this.getStateData();
    },
    componentWillReceiveProps: function(nextProps) {
        let timeObj = {
            timeType: nextProps.timeType,
            startTime: nextProps.startTime,
            endTime: nextProps.endTime,
            originSalesTeamTree: nextProps.originSalesTeamTree
        };
        this.setState(timeObj);
        if (nextProps.updateScrollBar){
            this.setState({
                updateScrollBar: true
            },() => {
                setTimeout(() => {
                    this.setState({
                        updateScrollBar: false
                    });
                },delayConstant);
            });
        }
    },
    getDataType: function() {
        if (hasPrivilege('GET_TEAM_LIST_ALL')) {
            return 'all';
        } else if (hasPrivilege('GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS')) {
            return 'self';
        } else {
            return '';
        }
    },
    getChartData: function() {
        var queryParams = {
            starttime: this.state.startTime,
            endtime: this.state.endTime,
            urltype: 'v2',
            dataType: this.getDataType()
        };
        if (this.props.currShowSalesman) {
            //查看当前选择销售的统计数据
            queryParams.member_id = this.props.currShowSalesman.userId;
        } else if (this.props.currShowSalesTeam) {
            queryParams.team_id = this.props.currShowSalesTeam.group_id;
            //查看当前选择销售团队内所有下级团队/成员的团队新增用户的统计数据
            OplateUserAnalysisAction.getAddedTeam(queryParams);
        } else if (!userData.hasRole(userData.ROLE_CONSTANS.SALES)) {
            //首次进来时，如果不是销售就获取下级团队/团队成员新增用户的统计数据
            OplateUserAnalysisAction.getAddedTeam(queryParams);
        }
        //获取总的统计分析数据
        //选择天时，不展示趋势图
        if (this.state.timeType !== 'day') {
            OplateUserAnalysisAction.getAddedSummary(queryParams);
        }
        OplateUserAnalysisAction.getAddedZone(queryParams);
        OplateUserAnalysisAction.getAddedIndustry(queryParams);
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
        OplateUserAnalysisStore.listen(this.onStateChange);
        //绑定window的resize，进行缩放处理
        $(window).on('resize', this.windowResize);
        OplateUserAnalysisAction.changeCurrentTab('total');
        this.getChartData();
        $('.statistic-data-analysis .thumb').hide();
    },
    componentWillUnmount: function() {
        OplateUserAnalysisStore.unlisten(this.onStateChange);
        //$('body').css('overflow', 'visible');
        //组件销毁时，清除缩放的延时
        clearTimeout(this.resizeTimeout);
        //解除window上绑定的resize函数
        $(window).off('resize', this.windowResize);
    },
    getStartDateText: function() {
        if (this.state.startTime) {
            return moment(new Date(+this.state.startTime)).format(DATE_FORMAT);
        } else {
            return '';
        }
    },
    getEndDateText: function() {
        if (!this.state.endTime) {
            return moment().format(DATE_FORMAT);
        }
        return moment(new Date(+this.state.endTime)).format(DATE_FORMAT);
    },

    //获取通过点击统计图中的柱子跳转到用户列表时需传的参数
    getJumpProps: function() {
        let analysis_filter_field = 'sales_id', currShowSalesTeam = this.props.currShowSalesTeam;
        //当前展示的是下级团队还是团队内所有成员
        if (currShowSalesTeam) {
            if (_.isArray(currShowSalesTeam.child_groups) && currShowSalesTeam.child_groups.length) {
                //查看当前选择销售团队内所有下级团队新增用户的统计数据
                analysis_filter_field = 'team_ids';
            }
        } else if (!userData.hasRole(userData.ROLE_CONSTANS.SALES)) {
            let originSalesTeamTree = this.state.originSalesTeamTree;
            if (_.isArray(originSalesTeamTree.child_groups) && originSalesTeamTree.child_groups.length) {
                //首次进来时，如果不是销售就获取下级团队新增用户的统计数据
                analysis_filter_field = 'team_ids';
            }
        }
        return {
            url: '/user/list',
            query: {
                app_id: '',
                analysis_filter_field: analysis_filter_field
            }
        };
    },

    renderChartContent: function() {
        return (
            <div className="chart_list">
                <AntcAnalysis
                    charts={this.getCharts()}
                    emitters={this.props.emitters}
                    conditions={this.props.conditions}
                    isGetDataOnMount={true}
                    style={{marginLeft: -10, marginRight: -5}}
                />
            </div>
        );
    },
    renderContent: function() {
        if(this.state.updateScrollBar){
            return this.renderChartContent();

        }else{
            return (
                <GeminiScrollbar enabled={this.props.scrollbarEnabled} ref="scrollbar">
                    {this.renderChartContent()}
                </GeminiScrollbar>
            );
        }
    },

    //获取图表
    getCharts: function() {
        //从 unknown 到 未知 的映射
        let unknownDataMap = {
            unknown: Intl.get('user.unknown', '未知') 
        };

        //销售不展示团队的数据统计
        const hideTeamChart = userData.hasRole(userData.ROLE_CONSTANS.SALES) || this.props.currShowSalesman;

        return [{
            title: Intl.get('user.analysis.user.add', '用户-新增'),
            chartType: 'line',
            data: this.state.userAnalysis.data,
            resultType: this.state.userAnalysis.resultType,
            option: {
                legend: {
                    type: 'scroll',
                    pageIconSize: 10,
                },
            },
            customOption: {
                multi: true,
                serieNameField: 'app_name',
                serieNameValueMap: {
                    '': Intl.get('oplate.user.analysis.22', '综合'),
                },
            },
            generateCsvData: function(data) {
                let csvData = [];
                let thead = [Intl.get('common.app.name', '应用名称')];
                let subData = data[0] && data[0].data;
                if (!subData) return [];

                thead = thead.concat(_.map(subData, 'name'));
                csvData.push(thead);
                _.each(data, dataItem => {
                    const appName = dataItem.app_name || Intl.get('oplate.user.analysis.22', '综合');
                    let tr = [appName];
                    tr = tr.concat(_.map(dataItem.data, 'value'));
                    csvData.push(tr);
                });
                return csvData;
            },
        }, {
            title: Intl.get('user.analysis.location.add', '地域-新增'),
            chartType: 'bar',
            customOption: {
                stack: true,
                legendData: chartLegend,
            },
            data: this.state.zoneAnalysis.data,
            nameValueMap: unknownDataMap,
            resultType: this.state.zoneAnalysis.resultType,
        }, {
            title: Intl.get('user.analysis.industry.add', '行业-新增'),
            chartType: 'bar',
            customOption: {
                stack: true,
                reverse: true,
                legendData: chartLegend,
            },
            data: this.state.industryAnalysis.data,
            nameValueMap: unknownDataMap,
            resultType: this.state.industryAnalysis.resultType,
        }, {
            title: Intl.get('user.analysis.team.add', '团队-新增'),
            chartType: 'bar',
            customOption: {
                stack: true,
                legendData: chartLegend,
            },
            noShowCondition: {
                callback: () => hideTeamChart,
            },
            data: this.state.teamOrMemberAnalysis.data,
            nameValueMap: unknownDataMap,
            resultType: this.state.teamOrMemberAnalysis.resultType,
        }];
    },

    render: function() {
        let layoutParams = this.props.getChartLayoutParams();
        this.chartWidth = layoutParams.chartWidth;
        return (
            <div className="oplate_user_analysis">
                <div ref="chart_list" style={{height: layoutParams.chartListHeight}}>
                    {this.renderContent()}
                </div>
            </div>
        );
    }
});
//返回react对象
module.exports = UserAnlyis;
