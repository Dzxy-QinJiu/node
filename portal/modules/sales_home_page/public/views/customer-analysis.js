/**
 * 客户分析
 * Created by wangliping on 2016/11/24.
 */
import { AntcAnalysis } from 'antc';
import { contractChart } from 'ant-chart-collection';
import customerCharts from 'MOD_DIR/analysis/public/charts/customer';
import orderCharts from 'MOD_DIR/analysis/public/charts/order';
let history = require('PUB_DIR/sources/history');
var hasPrivilege = require('../../../../components/privilege/checker').hasPrivilege;
var getDataAuthType = require('../../../../components/privilege/checker').getDataAuthType;
var OplateCustomerAnalysisAction = require('../../../oplate_customer_analysis/public/action/oplate-customer-analysis.action');
var OplateCustomerAnalysisStore = require('../../../oplate_customer_analysis/public/store/oplate-customer-analysis.store');
var emitter = require('../../../oplate_customer_analysis/public/utils/emitter');
let userData = require('../../../../public/sources/user-data');
var DATE_FORMAT = oplateConsts.DATE_FORMAT;
var legend = [{ name: Intl.get('sales.home.new.add', '新增'), key: 'total' }];
var constantUtil = require('../util/constant');
//这个时间是比动画执行时间稍长一点的时间，在动画执行完成后再渲染滚动条组件
var delayConstant = constantUtil.DELAY.TIMERANG;
import { processCustomerStageData, processOrderStageData } from 'PUB_DIR/sources/utils/analysis-util';
import { AntcHorizontalStageChart, AntcTable } from 'antc';
import { Button, Spin, Alert } from 'antd';
const Spinner = require('CMP_DIR/spinner');
var NoMoreDataTip = require('CMP_DIR/no_more_data_tip');
import CustomerStageTable from './customer-stage-table';
const DEFAULT_TABLE_PAGESIZE = 10;
const Emitters = require('PUB_DIR/sources/utils/emitters');
const teamTreeEmitter = Emitters.teamTreeEmitter;
const phoneMsgEmitter = Emitters.phoneMsgEmitter;
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
const RightPanelClose = rightPanelUtil.RightPanelClose;
const CrmList = require('MOD_DIR/crm/public/crm-list');
var AppUserManage = require('MOD_DIR/app_user_manage/public');
var CrmAction = require('MOD_DIR/crm/public/action/crm-actions');
const showTypeConstant = constantUtil.SHOW_TYPE_CONSTANT;
import publicPrivilegeConst from 'PUB_DIR/privilege-const';

//客户分析
class CustomerAnalysis extends React.Component {
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
    };
    constructor(props, context) {
        super(props, context);
        let stateData = this.getStateData();
        this.state = stateData;
    }

    getStateData = () => {
        let stateData = OplateCustomerAnalysisStore.getState();
        return {
            ...stateData,
            timeType: this.props.timeType,
            startTime: this.props.startTime,
            endTime: this.props.endTime,
            originSalesTeamTree: this.props.originSalesTeamTree,
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
        };
    };

    onStateChange = () => {
        this.setState(this.getStateData());
    };

    componentWillMount() {
        teamTreeEmitter.on(teamTreeEmitter.SELECT_TEAM, this.onTeamChange);
        teamTreeEmitter.on(teamTreeEmitter.SELECT_MEMBER, this.onMemberChange);
    }

    componentWillReceiveProps(nextProps) {
        let timeObj = {
            timeType: nextProps.timeType,
            startTime: nextProps.startTime,
            endTime: nextProps.endTime,
            originSalesTeamTree: nextProps.originSalesTeamTree
        };
        const timeChanged = (this.props.startTime !== nextProps.startTime) || (this.props.endTime !== nextProps.endTime);
        const thisPropsTeamId = _.get(this.props, 'currShowSalesTeam.group_id');
        const nextPropsTeamId = _.get(nextProps, 'currShowSalesTeam.group_id');
        const thisPropsMemberId = _.get(this.props, 'currShowSalesman.userId');
        const nextPropsMemberId = _.get(nextProps, 'currShowSalesman.userId');
        const teamChanged = thisPropsTeamId !== nextPropsTeamId;
        const memberChanged = thisPropsMemberId !== nextPropsMemberId;

        this.setState(timeObj, () => {
            if (timeChanged) {
                setTimeout(() => {
                    this.getTransferCustomers(true);
                    this.getStageChangeCustomers();
                });
            }

            if (teamChanged) {
                setTimeout(() => {
                    this.getTransferCustomers(true, nextPropsTeamId);
                });
            }

            if (memberChanged) {
                setTimeout(() => {
                    this.getTransferCustomers(true, null, nextPropsMemberId);
                });
            }
        });
    }

    onTeamChange = (team_id, allSubTeamIds) => {
        let teamId = team_id;
        if (allSubTeamIds && allSubTeamIds.length > 0) {
            teamId = allSubTeamIds.join(',');
        }        
        OplateCustomerAnalysisAction.teamChange(teamId);
    };

    onMemberChange = (member_id) => {
        OplateCustomerAnalysisAction.memberChange(member_id);
    };

    getDataType = () => {
        if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_ALL)) {
            return 'all';
        } else if (hasPrivilege(publicPrivilegeConst.GET_TEAM_LIST_MYTEAM_WITH_SUBTEAMS)) {
            return 'self';
        } else {
            return '';
        }
    };

    getStageChangeCustomerList = (data) => {
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
            let stageChangedCustomerList = _.cloneDeep(this.state.stageChangedCustomerList);
            stageChangedCustomerList.lastId = '';
            stageChangedCustomerList.listenScrollBottom = true;
            this.setState({ stageChangedCustomerList: stageChangedCustomerList }, () => {
                OplateCustomerAnalysisAction.getStageChangeCustomerList(paramObj);
            });
        } else {
            OplateCustomerAnalysisAction.getStageChangeCustomerList(paramObj);
        }
    };

    //获取客户阶段变更数据
    getStageChangeCustomers = () => {
        let params = {
            starttime: this.state.startTime,
            endtime: this.state.endTime
        };

        OplateCustomerAnalysisAction.getStageChangeCustomers(params);
    };

    getChartData = () => {
        const queryParams = {
            starttime: this.state.startTime,
            endtime: this.state.endTime,
            urltype: 'v2',
            dataType: this.getDataType()
        };
        //客户属性，对应各具体统计图，如行业、地域等
        let customerPropertys = ['zone', 'industry'];
        if (this.props.currShowSalesman) {
            //查看当前选择销售的统计数据
            queryParams.member_id = this.props.currShowSalesman.userId;
        } else if (this.props.currShowSalesTeam) {
            //查看当前选择销售团队内所有下级团队/成员的统计数据
            queryParams.team_id = this.props.currShowSalesTeam.group_id;
            //团队统计
            customerPropertys.push('team');
        } else if (!userData.hasRole(userData.ROLE_CONSTANS.SALES)) {//普通销售不展示团队信息
            //首次进来时，如果不是销售就获取下级团队/团队成员的统计数据
            customerPropertys.push('team');
        }
        //获取各统计图数据
        customerPropertys.forEach(customerProperty => {
            let customerType = 'added';
            const reqData = _.extend({}, queryParams, {
                customerType: customerType,
                customerProperty: customerProperty
            });
            setTimeout(() => {
                OplateCustomerAnalysisAction.getAnalysisData(reqData);
            });
        });
    };

    componentDidMount() {
        OplateCustomerAnalysisStore.listen(this.onStateChange);
        OplateCustomerAnalysisAction.getSalesStageList();
        this.getChartData();
        setTimeout(() => {
            this.getStageChangeCustomers();
            this.getTransferCustomers(true);
        });
    }

    //切换展示客户阶段统计
    toggleCusStageMetic = () => {
        OplateCustomerAnalysisAction.toggleStageCustomerList();
    };

    componentWillUnmount() {
        OplateCustomerAnalysisStore.unlisten(this.onStateChange);
        //$('body').css('overflow', 'visible');
        //组件销毁时，清除缩放的延时
        clearTimeout(this.resizeTimeout);
        teamTreeEmitter.removeListener(teamTreeEmitter.SELECT_TEAM, this.onTeamChange);
        teamTreeEmitter.removeListener(teamTreeEmitter.SELECT_MEMBER, this.onMemberChange);
    }

    /**
     * 参数说明，ant-design的table组件
     * @param pagination   分页参数，当前不需要使用分页
     * @param filters      过滤器参数，当前不需要使用过滤器
     * @param sorter       排序参数，当前需要使用sorter
     *                      {field : 'xxx' //排序字段 , order : 'descend'/'ascend' //排序顺序}
     */
    onTransferSortChange = (pagination, filters, sorter) => {
        let transferCustomers = _.cloneDeep(this.state.transferCustomers);
        transferCustomers.sorter = sorter;
        transferCustomers.lastId = '';
        this.setState({
            transferCustomers
        }, () => {
            this.getTransferCustomers(true);
        });

    };

    //获取转出客户统计数据
    getTransferCustomers = (isFirst = false, teamId = this.state.currentTeamId, memberId = this.state.currentMemberId) => {
        let paramObj = {
            isFirst,
            params: {
                sort_field: this.state.transferCustomers.sorter.field,
                order: this.state.transferCustomers.sorter.order,
                page_size: DEFAULT_TABLE_PAGESIZE,
                data_type: this.getDataType()
            },
            query: {
                start_time: this.state.startTime,
                end_time: this.state.endTime,
            },
        };

        if (teamId) {
            paramObj.query.team_ids = teamId;
            paramObj.query.statistics_type = 'team';
        }

        if (memberId) {
            paramObj.query.member_ids = memberId;
            paramObj.query.statistics_type = 'user';
        }

        const lastId = this.state.transferCustomers.lastId;

        if (lastId && !isFirst) {
            paramObj.query.id = lastId;
        }

        OplateCustomerAnalysisAction.getTransferCustomers(paramObj);
    };

    getStartDateText = () => {
        if (this.state.startTime) {
            return moment(new Date(+this.state.startTime)).format(DATE_FORMAT);
        } else {
            return '';
        }
    };

    //获取结束日期文字
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
            url: '/crm',
            query: {
                app_id: '',
                analysis_filter_field: analysis_filter_field
            }
        };
    };

    processOrderStageData = (data) => {
        return processOrderStageData(this.state.salesStageList, data);
    };

    //处理阶段点击的回调 
    handleStageNumClick = (item, type) => {
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
                'from': moment(item.time).startOf('day').valueOf(),
                'to': moment(item.time).endOf('day').valueOf(),
                'name': 'time',
                'type': 'time'
            }]
        });
        this.toggleCusStageMetic();
    };

    onStageSortChange = (pagination, filters, sorter) => {
        this.getStageChangeCustomers(sorter.order);
    };

    changeCurrentTab = (tabName, event) => {
        OplateCustomerAnalysisAction.changeCurrentTab(tabName);
        this.getChartData();
    };

    //客户详情面板相关方法
    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });
    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    hideRightPanel = () => {
        this.setState({
            showRightPanel: false
        });
    };

    //数字转百分比
    numToPercent = (num) => {
        return (num * 100).toFixed(2) + '%';
    };

    //处理转出客户点击
    handleTransferedCustomerClick = (item, index) => {
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

    //获取试用合格客户数统计图表
    getTrialQualifiedChart = () => {
        //统计列
        const statisticsColumns = [{
            dataIndex: 'last_month',
            title: Intl.get('user.time.prev.month', '上月'),
            width: '10%',
            render: this.customerNumRender.bind(this, 'last_month_customer_ids'),
        }, {
            dataIndex: 'this_month',
            title: Intl.get('common.this.month', '本月'),
            width: '10%',
            render: this.customerNumRender.bind(this, 'this_month_customer_ids'),
        }, {
            dataIndex: 'this_month_new',
            title: Intl.get('common.this.month.new', '本月新增'),
            width: '10%',
            render: this.customerNumRender.bind(this, 'this_month_new_customer_ids'),
        }, {
            dataIndex: 'this_month_lose',
            title: Intl.get('common.this.month.lose', '本月流失'),
            width: '10%',
            render: this.customerNumRender.bind(this, 'this_month_lose_customer_ids'),
        }, {
            dataIndex: 'this_month_back',
            title: Intl.get('common.this.month.back', '本月回流'),
            width: '10%',
            render: this.customerNumRender.bind(this, 'this_month_back_customer_ids'),
        }, {
            dataIndex: 'this_month_add',
            title: Intl.get('common.this.month.add', '本月比上月净增'),
            width: '15%',
        }, {
            dataIndex: 'highest',
            title: Intl.get('common.history.highest', '历史最高'),
            width: '10%',
            render: (text, record) => {
                return <span title={record.highest_date}>{text}</span>;
            },
        }, {
            dataIndex: 'this_month_add_highest',
            title: Intl.get('common.this.month.add.highest', '本月比历史最高净增'),
            width: '20%',
        }];

        //表格列
        let columns = _.cloneDeep(statisticsColumns);
        columns.unshift({
            title: '团队',
            width: '10%',
            dataIndex: 'team_name',
        });

        let chart = {
            title: '试用合格客户数统计',
            url: '/rest/analysis/customer/v2/statistic/:data_type/customer/qualify',
            argCallback: (arg) => {
                let query = arg.query;

                if (query) {
                    if (_.has(query, 'starttime') && _.has(query, 'endtime')) {
                        query.start_time = query.starttime;
                        query.end_time = query.endtime;
                        delete query.starttime;
                        delete query.endtime;
                    }

                    if (query.member_id) {
                        query.member_ids = query.member_id;

                        if (!query.team_ids) {
                            //根据成员查询的时候，需要把团队id也传过去，这样后端查询效率较高
                            query.team_ids = this.state.currentTeamIdPersisted;
                        }

                        delete query.member_id;
                    }
                }
            },
            layout: {sm: 24},
            processData: data => {
                data = data.list || [];
                _.each(data, dataItem => {
                    _.each(statisticsColumns, column => {
                        const key = column.dataIndex;
                        const customerIds = _.get(dataItem, [key, 'customer_ids']);

                        if (customerIds) {
                            dataItem[key + '_customer_ids'] = customerIds;
                        }

                        const highestDate = _.get(dataItem, [key, 'highest_date']);

                        if (highestDate) {
                            dataItem.highest_date = highestDate;
                        }

                        dataItem[key] = _.get(dataItem, [key, 'total'], 0);
                    });
                });

                return data;
            },
        };

        if (this.props.currShowType === showTypeConstant.SALESMAN) {
            _.extend(chart, {
                chartType: 'bar',
                height: 220,
                processOption: (option, chartProps) => {
                    option.legend = {
                        data: [
                            Intl.get('user.time.prev.month', '上月'),
                            Intl.get('common.this.month', '本月'),
                            Intl.get('common.history', '历史'),
                        ],
                    };

                    //瀑布图的tooltip内容有问题，辅助系列的数据也会显示出来，所以先把tooltip禁掉，等找到解决方案再显示出来
                    _.set(option, 'tooltip.show', false);

                    _.set(option, 'xAxis[0].data', [
                        Intl.get('user.time.prev.month', '上月'),
                        Intl.get('common.this.month.new', '本月新增'),
                        Intl.get('common.this.month.back', '本月回流'),
                        Intl.get('common.this.month.lose', '本月流失'),
                        Intl.get('common.this.month.add', '本月比上月净增'),
                        Intl.get('common.this.month', '本月'),
                        Intl.get('common.this.month.add.highest', '本月比历史最高净增'),
                        Intl.get('common.history.highest', '历史最高'),
                    ]);

                    const serie = {
                        type: 'bar',
                        stack: 'num',
                        label: {
                            show: true,
                            position: 'top',
                        }
                    };

                    //单个销售的数据
                    let data = _.get(chartProps, 'data[0]');
                    //上月个数
                    let lastMonthNum = _.get(data, 'last_month');
                    //本月个数
                    let thisMonthNum = _.get(data, 'this_month');
                    //本月新增
                    let thisMonthNewNum = _.get(data, 'this_month_new');
                    //本月流失
                    let thisMonthLoseNum = _.get(data, 'this_month_lose');
                    //本月回流
                    let thisMonthBackNum = _.get(data, 'this_month_back');
                    //本月比历史最高净增
                    let thisMonthAddHighestNum = _.get(data, 'this_month_add_highest');
                    //本月净增
                    let thisMonthAddNum = _.get(data, 'this_month_add');
                    //历史最高
                    let highestNum = _.get(data, 'highest');

                    //原始数据数组，用于在柱子上显示实际值
                    const dataArr = [lastMonthNum, thisMonthNewNum, thisMonthBackNum, thisMonthLoseNum, thisMonthAddNum, thisMonthNum, thisMonthAddHighestNum, highestNum];

                    //本月新增数据辅助，用于实现阶梯瀑布效果，默认以上月数据为基准
                    let thisMonthNewNumAssist = lastMonthNum;

                    //如果本月新增数为负值
                    if (thisMonthNewNum < 0) {
                        //则本月新增数辅助值为上月个数与本月新增之和，也即上月个数减去本月新增的绝对值
                        thisMonthNewNumAssist = lastMonthNum + thisMonthNewNum;
                        //将本月新增数设为其绝对值，以避免柱子显示在横轴下方
                        thisMonthNewNum = Math.abs(thisMonthNewNum);
                    }

                    //本月回流数辅助值为上月个数与本月新增之和
                    let thisMonthBackNumAssist = lastMonthNum + thisMonthNewNum;

                    //本月流失数辅助值为本月回流数辅助值与本月回流数之和再减去本月流失数
                    let thisMonthLoseNumAssist = thisMonthBackNumAssist + thisMonthBackNum - thisMonthLoseNum;

                    //本月净增数辅助值默认为上月个数
                    let thisMonthAddNumAssist = lastMonthNum;

                    //如果本月净增数为负值
                    if (thisMonthAddNum < 0) {
                        //则本月净增数辅助值为上月个数与本月净增之和，也即上月个数减去本月净增的绝对值
                        thisMonthAddNumAssist = lastMonthNum + thisMonthAddNum;
                        //将本月净增数设为其绝对值，以避免柱子显示在横轴下方
                        thisMonthAddNum = Math.abs(thisMonthAddNum);
                    }

                    //本月比历史最高净增数辅助值默认为历史最高个数
                    let thisMonthAddHighestNumAssist = highestNum;

                    //如果本月比历史最高净增数为负值
                    if (thisMonthAddHighestNum < 0) {
                        //则本月比历史最高净增数辅助值为历史最高个数与本月比历史最高净增之和，也即历史最高个数减去本月比历史最高净增的绝对值
                        thisMonthAddHighestNumAssist = highestNum + thisMonthAddHighestNum;
                        //将本月比历史最高净增数设为其绝对值，以避免柱子显示在横轴下方
                        thisMonthAddHighestNum = Math.abs(thisMonthAddHighestNum);
                    }

                    //辅助系列，会在堆积的柱子中占空间，但不会显示出来，这样就能呈现出阶梯瀑布效果了
                    let serieAssist = _.extend({}, serie, {

                        //通过将系列项的颜色设置为透明来实现系列项的隐藏效果
                        itemStyle: {
                            normal: {
                                barBorderColor: 'rgba(0,0,0,0)',
                                color: 'rgba(0,0,0,0)'
                            },
                            emphasis: {
                                barBorderColor: 'rgba(0,0,0,0)',
                                color: 'rgba(0,0,0,0)'
                            }
                        },
                        data: ['-', thisMonthNewNumAssist, thisMonthBackNumAssist, thisMonthLoseNumAssist, thisMonthAddNumAssist, '-', thisMonthAddHighestNumAssist, '-'],
                    });

                    //上月系列
                    let serieLastMonth = _.extend({}, serie, {
                        name: Intl.get('user.time.prev.month', '上月'),
                        //数据中只有上月个数为实际值，其他的均为空值，在堆积时会用到
                        data: [lastMonthNum, '-', '-', '-', '-', '-', '-', '-'],
                    });

                    //本月系列
                    let serieThisMonth = _.extend({}, serie, {
                        name: Intl.get('common.this.month', '本月'),
                        //数据中只有本月相关数据为实际值，其他的均为空值，在堆积时会用到
                        data: ['-', thisMonthNewNum, thisMonthBackNum, thisMonthLoseNum, thisMonthAddNum, thisMonthNum, thisMonthAddHighestNum, '-'],
                        label: {
                            show: true,
                            position: 'top',
                            //在柱子上显示其原始值
                            formatter: params => {
                                return dataArr[params.dataIndex];
                            },
                        },
                    });

                    //历史系列
                    let serieHistory = _.extend({}, serie, {
                        name: Intl.get('common.history', '历史'),
                        //数据中只有历史最高数为实际值，其他的均为空值，在堆积时会用到
                        data: ['-', '-', '-', '-', '-', '-', '-', highestNum],
                    });

                    option.series = [
                        serieAssist,
                        serieLastMonth,
                        serieThisMonth,
                        serieHistory
                    ];
                },
            });
        } else {
            _.extend(chart, {
                chartType: 'table',
                height: 'auto',
                option: {
                    columns,
                },
                processOption: (option, chartProps) => {
                    //从返回数据里获取一下销售昵称
                    const nickName = _.get(chartProps, 'data[0].nick_name');

                    //若存在销售昵称，说明返回的是销售列表
                    if (nickName) {
                        //找到名称列
                        let nameColumn = _.find(option.columns, column => column.dataIndex === 'team_name');

                        if (nameColumn) {
                            //将名称列的数据索引改为指向昵称字段
                            nameColumn.dataIndex = 'nick_name';
                            //将名称列的标题改为销售
                            nameColumn.title = '销售';
                        }
                    }
                },
            });
        }

        return chart;
    };

    //客户数渲染函数
    customerNumRender = (idsField, text, record) => {
        //把数量转为整数
        const num = parseInt(text);

        if (num === 0) {
            return <span>{num}</span>;
        } else {
            const customerIds = record[idsField] || [];

            if (!_.isArray(customerIds)) {
                return <span>{num}</span>;
            } else {
                let argsObj = {
                    from: 'sales_home',
                    num,
                };

                //当前记录中有客户id列表时，用id列表查询客户详情（如试用合格客户统计中的上月、本月合格客户）
                if (record[idsField]) {
                    const customerIdsStr = customerIds.join(',');

                    _.extend(argsObj, {
                        customerIds: customerIdsStr,
                    });
                //当前记录里没有id列表，但有缓存key时，用缓存key查询客户详情（如有效客户统计中的活跃客户数）
                } else if (record.cache_key) {
                    _.extend(argsObj, {
                        //缓存key，用于查寻有效客户活跃数详细列表
                        cache_key: record.cache_key,
                        //二级缓存key，用于查寻有效客户活跃数详细列表
                        sub_cache_key: idsField === 'active_list' ? record.active_cache_key : record.unactive_cache_key,
                    });
                }

                return <span style={{cursor: 'pointer'}} onClick={this.handleCustomerNumClick.bind(this, argsObj)}>{num}</span>;
            }
        }
    };

    //处理客户数点击事件
    handleCustomerNumClick = argsObj => {
        this.setState({
            isShowCustomerTable: true,
            crmLocationState: argsObj
        });
    };

    //获取图表列表
    getCharts = () => {
        //表格内容高度
        const TABLE_HIGHT = 175;

        //从 unknown 到 未知 的映射
        let unknownDataMap = {
            unknown: Intl.get('user.unknown', '未知') 
        };

        //销售不展示团队的数据统计
        const hideTeamChart = userData.hasRole(userData.ROLE_CONSTANS.SALES) || this.props.currShowSalesman;

        let charts = [{
            title: Intl.get('effective.customer.statistics', '有效客户统计'),
            url: '/rest/analysis/customer/v2/:data_type/customer/active_rate',
            argCallback: (arg) => {
                let query = arg.query;

                if (_.has(query, 'starttime') && _.has(query, 'endtime')) {
                    query.start_time = query.starttime;
                    query.end_time = query.endtime;
                    delete query.starttime;
                    delete query.endtime;
                }

                if (query && query.member_id && !query.team_ids) {
                    //根据成员查询的时候，需要把团队id也传过去
                    query.team_ids = this.state.currentTeamIdPersisted;
                }
            },
            conditions: [
                {
                    name: 'interval',
                    value: 'day',
                },
            ],
            processData: data => {
                //缓存key，用于查寻活跃数详细列表
                const cacheKey = data.cache_key;
                let list = data.list;

                if (cacheKey && list) {
                    //将缓存key加到每一条记录中，方便在点击事件中获取
                    _.each(list, item => {
                        item.cache_key = cacheKey;
                        item.active_rate = this.numToPercent(item.active_rate);
                    });

                    return list;
                } else {
                    return [];
                }
            },
            chartType: 'table',
            option: {
                pagination: false,
                scroll: {y: 170},
                columns: [
                    {
                        title: Intl.get('common.definition', '名称'),
                        dataIndex: 'name',
                        width: 80,
                    },
                    {
                        title: Intl.get('effective.customer.number', '有效客户数'),
                        dataIndex: 'valid',
                    },
                    {
                        title: Intl.get('active.customer.number', '活跃客户数'),
                        dataIndex: 'active',
                        render: this.customerNumRender.bind(this, 'active_list')
                    },
                    {
                        title: Intl.get('inactive.customer.number', '不活跃客户数'),
                        dataIndex: 'unactive',
                        render: this.customerNumRender.bind(this, 'unactive_list')
                    },
                    {
                        title: Intl.get('effective.customer.activity.rate', '有效客户活跃率'),
                        dataIndex: 'active_rate',
                    },
                ],
            },
        }, {
            title: Intl.get('active.customer.trends.last.month', '近一月活跃客户趋势'),
            url: '/rest/analysis/customer/v2/:data_type/customer/active_rate/trend',
            argCallback: (arg) => {
                let query = arg.query;

                if (_.has(query, 'starttime') && _.has(query, 'endtime')) {
                    query.start_time = moment().subtract(1, 'months').valueOf();
                    query.end_time = moment().valueOf();
                    delete query.starttime;
                    delete query.endtime;
                }
            },
            conditions: [
                {
                    name: 'interval',
                    value: 'day',
                },
            ],
            chartType: 'line',
            dataField: 'total',
            processData: data => {
                _.each(data, dataItem => {
                    if (dataItem.date_str) {
                        dataItem.name = dataItem.date_str.substr(5);
                        dataItem.value = dataItem.active;
                    }
                });

                return data;
            },
            option: {
                grid: {
                    right: 0,
                },
                tooltip: {
                    formatter: params => {
                        const dateStr = params[0].name;
                        const activeNum = params[0].value;
                        const activeRate = this.numToPercent(params[0].data.active_rate);
                        const effectiveNum = params[0].data.valid;

                        return `
                            ${dateStr}<br>
                            ${Intl.get('active.customer.number', '活跃客户数')}: ${activeNum}<br>
                            ${Intl.get('effective.customer.activity.rate', '有效客户活跃率')}: ${activeRate}<br>
                            ${Intl.get('effective.customer.number', '有效客户数')}: ${effectiveNum}
                        `;
                    },
                },
            },
        }, {
            title: Intl.get('customer.analysis.add.trend', '新增趋势'),
            url: (() => {
                let url = '/rest/analysis/customer/v2/:auth_type/added/trend';

                if (getDataAuthType().toLowerCase() === 'common') {
                    url = '/rest/analysis/customer/v2/added/trend';
                }

                return url;
            })(),
            chartType: 'line',
            dataField: '[0].data',
            noShowCondition: {
                callback: conditions => {
                    return this.state.timeType === 'day';
                },
            },
        }, 
        //客户阶段统计
        customerCharts.getCustomerStageChart(),
        //订单阶段统计
        orderCharts.getOrderStageChart({
            stageList: this.state.salesStageList
        }),
        {
            title: Intl.get('user.analysis.location.add', '地域-新增'),
            chartType: 'bar',
            customOption: {
                showValue: true,
            },
            data: this.state.zoneAnalysis.data,
            nameValueMap: unknownDataMap,
            resultType: this.state.zoneAnalysis.resultType,
        }, {
            title: Intl.get('user.analysis.industry.add', '行业-新增'),
            chartType: 'bar',
            customOption: {
                reverse: true,
                showValue: true,
            },
            data: this.state.industryAnalysis.data,
            nameValueMap: unknownDataMap,
            resultType: this.state.industryAnalysis.resultType,
        }, {
            title: Intl.get('user.analysis.team.add', '团队-新增'),
            chartType: 'bar',
            customOption: {
                showValue: true,
            },
            noShowCondition: {
                callback: () => hideTeamChart,
            },
            data: this.state.teamAnalysis.data,
            nameValueMap: unknownDataMap,
            resultType: this.state.teamAnalysis.resultType,
        }, {
            title: Intl.get('user.analysis.moveoutCustomer', '转出客户统计'),
            chartType: 'table',
            layout: {
                sm: 24,
            },
            data: this.state.transferCustomers.data,
            resultType: this.state.transferCustomers.loading ? 'loading' : '',
            option: {
                pagination: false,
                dropLoad: {
                    loading: this.state.transferCustomers.loading,
                    handleScrollBottom: this.getTransferCustomers,
                    listenScrollBottom: this.state.transferCustomers.listenScrollBottom && !this.state.transferCustomers.loading,
                    showNoMoreDataTip: this.state.transferCustomers.showNoMoreDataTip,
                    noMoreDataText: Intl.get('noMoreTip.customer', '没有更多客户了')
                },
                columns: [
                    {
                        title: Intl.get('common.login.time', '时间'),
                        dataIndex: 'time',
                        key: 'time',
                        sorter: true,
                        width: 100,
                    }, {
                        title: Intl.get('crm.41', '客户名'),
                        dataIndex: 'customer_name',
                        isSetCsvValueBlank: true,
                        key: 'customer_name',
                        className: 'customer-name',
                        width: 300,
                        render: (text, item, index) => {
                            return (
                                <span className="transfer-customer-cell"
                                    onClick={this.handleTransferedCustomerClick.bind(this, item, index)}>{text}</span>
                            );
                        }
                    }, {
                        title: Intl.get('crm.customer.transfer.sales', '销售代表'),
                        dataIndex: 'old_member_nick_name',
                        key: 'old_member_nick_name',
                        width: 100,
                    }, {
                        title: Intl.get('crm.customer.transfer.manager', '客户经理'),
                        dataIndex: 'new_member_nick_name',
                        key: 'new_member_nick_name',
                        width: 100,
                    }, {
                        title: Intl.get('user.sales.team', '销售团队'),
                        dataIndex: 'sales_team',
                        isSetCsvValueBlank: true,
                        key: 'sales_team',
                        width: 100,
                    }

                ],
            },
        }, {
            title: Intl.get('crm.sales.customerStage', '客户阶段变更统计'),
            chartType: 'table',
            layout: {
                sm: 24,
            },
            data: this.state.customerStage.data,
            processData: data => {
                _.each(data, dataItem => {
                    _.each(dataItem.map, (v, k) => {
                        //数字前显示加号
                        if (v && v > 0) {
                            v = '+' + v;
                        }

                        //将各阶段数据直接放到数据对象下，方便表格渲染时使用
                        dataItem[k] = v;
                    });
                });

                return data;
            },
            resultType: this.state.customerStage.loading ? 'loading' : '',
            option: {
                pagination: false,
                scroll: {y: TABLE_HIGHT},
                columns: [
                    {
                        title: Intl.get('crm.146', '日期'),
                        dataIndex: 'time',
                        key: 'time',
                        width: 100
                    }, {
                        title: Intl.get('sales.stage.message', '信息'),
                        dataIndex: '信息',
                        key: 'info',
                        render: (text, item, index) => {
                            return (
                                <span className="customer-stage-number"
                                    onClick={this.handleStageNumClick.bind(this, item, '信息')}>{text}</span>
                            );
                        }
                    }, {
                        title: Intl.get('sales.stage.intention', '意向'),
                        dataIndex: '意向',
                        key: 'intention',
                        render: (text, item, index) => {
                            return (
                                <span className="customer-stage-number"
                                    onClick={this.handleStageNumClick.bind(this, item, '意向')}>{text}</span>
                            );
                        }
                    }, {
                        title: Intl.get('common.trial', '试用'),
                        dataIndex: '试用',
                        key: 'trial',
                        render: (text, item, index) => {
                            return (
                                <span className="customer-stage-number"
                                    onClick={this.handleStageNumClick.bind(this, item, '试用')}>{text}</span>
                            );
                        }
                    }, {
                        title: Intl.get('common.trial.qualified', '试用合格'),
                        dataIndex: '试用合格',
                        key: 'trial.qualified',
                        render: (text, item, index) => {
                            return (
                                <span className="customer-stage-number"
                                    onClick={this.handleStageNumClick.bind(this, item, '试用合格')}>{text}</span>
                            );
                        }
                    }, {
                        title: Intl.get('common.trial.unqualified', '试用不合格'),
                        dataIndex: '试用不合格',
                        key: 'unqualified',
                        width: 100,
                        render: (text, item, index) => {
                            return (
                                <span className="customer-stage-number"
                                    onClick={this.handleStageNumClick.bind(this, item, '试用不合格')}>{text}</span>
                            );
                        }
                    }, {
                        title: Intl.get('sales.stage.signed', '签约'),
                        dataIndex: '签约',
                        key: 'signed',
                        render: (text, item, index) => {
                            return (
                                <span className="customer-stage-number"
                                    onClick={this.handleStageNumClick.bind(this, item, '签约')}>{text}</span>
                            );
                        }
                    }, {
                        title: Intl.get('sales.stage.lost', '流失'),
                        dataIndex: '流失',
                        key: '流失',
                        render: (text, item, index) => {
                            return (
                                <span className="customer-stage-number"
                                    onClick={this.handleStageNumClick.bind(this, item, '流失')}>{text}</span>
                            );
                        }
                    }, {
                        title: Intl.get('sales.home.sales', '销售'),
                        dataIndex: 'memberName',
                        key: 'memberName'
                    }, {
                        title: Intl.get('common.belong.team', '所属团队'),
                        dataIndex: 'salesTeam',
                        key: 'salesTeam',
                        width: 80
                    }
                ],
            },
        }];

        const trialQualifiedChart = this.getTrialQualifiedChart();
        charts.unshift(trialQualifiedChart);

        const today = moment();
        const startTime = today.valueOf();
        const endTime = today.add(3, 'months').valueOf();

        //近三个月到期合同
        const contractExpireRemindChart = contractChart.getContractExpireRemindChart({
            startTime,
            endTime,
            title: Intl.get('contract.expire.in.next.three.months', '近三个月到期合同')
        });
        charts.unshift(contractExpireRemindChart);

        //最近联系的客户
        const recentContactCustomerChart = customerCharts.getRecentContactCustomerChart();
        charts.push(recentContactCustomerChart);

        return charts;
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

    hideCustomerTable = () => {
        this.setState({
            isShowCustomerTable: false,
            crmLocationState: null,
        });
    };

    render() {
        let customerOfCurUser = this.state.customerOfCurUser || {};
        return (
            <div className="oplate_customer_analysis">
                <div ref="chart_list">
                    {this.renderChartContent()}
                </div>
                <RightPanel
                    className="customer-stage-table-wrapper"
                    showFlag={this.state.isShowCustomerStageTable || this.state.isShowCustomerTable}
                >
                    {this.state.isShowCustomerStageTable ?
                        <CustomerStageTable
                            params={this.state.selectedCustomerStage}
                            result={this.state.stageChangedCustomerList}
                            onClose={this.toggleCusStageMetic}
                            ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}
                            handleScrollBottom={this.getStageChangeCustomerList.bind(this)}
                            showNoMoreData={!this.state.stageChangedCustomerList.loading &&
                                !this.state.stageChangedCustomerList.listenScrollBottom &&
                                this.state.stageChangedCustomerList.lastId &&
                                !this.state.stageChangedCustomerList.data.length >= DEFAULT_TABLE_PAGESIZE
                            }
                        /> : null}

                    {
                        this.state.isShowCustomerTable ?
                            <div className="customer-table-close topNav">
                                <RightPanelClose
                                    title={Intl.get('common.app.status.close', '关闭')}
                                    onClick={this.hideCustomerTable}
                                />
                                <CrmList
                                    location={{ query: '', state: this.state.crmLocationState }}
                                    fromSalesHome={true}
                                />
                            </div> : null
                    }
                </RightPanel>
                {/*该客户下的用户列表*/}
                {this.state.isShowCustomerUserListPanel ? (
                    <RightPanel
                        className="customer-user-list-panel"
                        showFlag={this.state.isShowCustomerUserListPanel}
                    >
                        {this.state.isShowCustomerUserListPanel ?
                            <AppUserManage
                                customer_id={customerOfCurUser.id}
                                hideCustomerUserList={this.closeCustomerUserListPanel}
                                customer_name={customerOfCurUser.name}
                            /> : null
                        }
                    </RightPanel>
                ) : null}
            </div>
        );
    }
}

//返回react对象
module.exports = CustomerAnalysis;

