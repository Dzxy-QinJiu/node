/**
 * 用户分析
 * Created by wangliping on 2016/11/23.
 */
import PropTypes from 'prop-types';
import { AntcAnalysis } from 'antc';
var OplateUserAnalysisAction = require('../../../oplate_user_analysis/public/action/oplate-user-analysis.action');
var OplateUserAnalysisStore = require('../../../oplate_user_analysis/public/store/oplate-user-analysis.store');
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
var constantUtil = require('../util/constant');
import shpPrivilegeConst from '../privilege-const';

//用户分析
class UserAnlyis extends React.Component {
    static propTypes = {
        scrollbarEnabled: PropTypes.bool,
        timeType: PropTypes.string,
        startTime: PropTypes.number,
        endTime: PropTypes.number,
        originSalesTeamTree: PropTypes.object,
        currShowSalesman: PropTypes.object,
        currShowSalesTeam: PropTypes.object,
        currShowType: PropTypes.string,
        emitterConfigList: PropTypes.array,
        conditions: PropTypes.array,
        selectedAppId: PropTypes.string,
        appList: PropTypes.array,
    };

    getStateData = () => {
        let stateData = OplateUserAnalysisStore.getState();
        return {
            ...stateData,
            timeType: this.props.timeType,
            startTime: this.props.startTime,
            endTime: this.props.endTime,
            originSalesTeamTree: this.props.originSalesTeamTree,
            updateScrollBar: false
        };
    };

    onStateChange = () => {
        this.setState(this.getStateData());
    };

    componentWillReceiveProps(nextProps) {
        let timeObj = {
            timeType: nextProps.timeType,
            startTime: nextProps.startTime,
            endTime: nextProps.endTime,
            originSalesTeamTree: nextProps.originSalesTeamTree
        };
        this.setState(timeObj);
    }

    getDataType = () => {
        //todo 待确认
        if (hasPrivilege('GET_TEAM_LIST_ALL')) {
            return 'all';
        } else if (hasPrivilege('GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS')) {
            return 'self';
        } else {
            return '';
        }
    };

    getChartData = () => {
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
    };

    componentDidMount() {
        OplateUserAnalysisStore.listen(this.onStateChange);
        OplateUserAnalysisAction.changeCurrentTab('total');
        this.getChartData();
    }

    componentWillUnmount() {
        OplateUserAnalysisStore.unlisten(this.onStateChange);
    }

    getStartDateText = () => {
        if (this.state.startTime) {
            return moment(new Date(+this.state.startTime)).format(DATE_FORMAT);
        } else {
            return '';
        }
    };

    getEndDateText = () => {
        if (!this.state.endTime) {
            return moment().format(DATE_FORMAT);
        }
        return moment(new Date(+this.state.endTime)).format(DATE_FORMAT);
    };

    //获取通过点击统计图中的柱子跳转到用户列表时需传的参数
    getJumpProps = () => {
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
    };

    renderChartContent = () => {
        return (
            <div className="chart_list">
                <AntcAnalysis
                    charts={this.getCharts()}
                    emitterConfigList={this.props.emitterConfigList}
                    conditions={this.props.conditions}
                    isGetDataOnMount={true}
                    isUseScrollBar={this.props.scrollbarEnabled}
                />
            </div>
        );
    };
    // 获取一段时间开通账号登录情况的权限
    getAccountAuthType = () => {
        let type = 'self';
        if (hasPrivilege(shpPrivilegeConst.USER_ANALYSIS_MANAGER)) {
            type = 'all';
        }
        return type;
    };

    //获取图表
    getCharts = () => {
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
            processCsvData: function(chart) {
                const data = chart.data;
                let csvData = [];
                let thead = [Intl.get('common.product.name','产品名称')];
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
        }, {
            title: Intl.get('user.analysis.account.login.statistics', '开通用户登录统计'),
            url: '/rest/analysis/user/v3/:login_type/login/detail',
            argCallback: (arg) => {
                let query = arg.query;

                if (query) {
                    if (query.starttime && query.endtime) {
                        query.grant_create_begin_date = query.starttime;
                        query.grant_create_end_date = query.endtime;
                    }
                    // 团队参数
                    if (query.team_ids ) {
                        query.sales_team_id = query.team_ids;
                        delete query.team_ids;
                    }
                }
            },
            conditions: [
                {
                    name: 'app_id',
                    value: this.props.selectedAppId,
                },
                {
                    name: 'login_type',
                    value: this.getAccountAuthType(),
                    type: 'params'
                }
            ],
            chartType: 'table',
            option: {
                columns: [
                    {
                        title: Intl.get('sales.home.sales', '销售'),
                        dataIndex: 'member_name',
                        width: '40%',
                    },
                    {
                        title: Intl.get('user.analysis.user.count', '开通用户数'),
                        dataIndex: 'new_users',
                        align: 'right',
                        width: '30%',
                    },
                    {
                        title: Intl.get('user.analysis.account.login.count', '实际登录数'),
                        dataIndex: 'login_user',
                        align: 'right',
                        width: '30%',
                    }
                ],
            },
            cardContainer: {
                selectors: [{
                    optionsCallback: () => {
                        return this.props.appList.map( (item) => {
                            return {
                                name: item.app_name,
                                value: item.app_id
                            };
                        } );
                    },
                    activeOption: this.props.selectedAppId,
                    conditionName: 'app_id',
                }],
            },
        }];
    };

    state = this.getStateData();

    render() {
        return (
            <div className="oplate_user_analysis">
                <div ref="chart_list">
                    {this.renderChartContent()}
                </div>
            </div>
        );
    }
}

//返回react对象
module.exports = UserAnlyis;

