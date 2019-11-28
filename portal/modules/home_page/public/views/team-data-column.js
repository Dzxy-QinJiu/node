/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import '../css/my-data-column.less';
import {Progress, Tooltip, Select} from 'antd';
const Option = Select.Option;
import ColumnItem from './column-item';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import myDataAjax from '../ajax';
import {getClueFulltext} from 'MOD_DIR/clue_customer/public/ajax/clue-customer-ajax';
import DetailCard from 'CMP_DIR/detail-card';
import Spinner from 'CMP_DIR/spinner';
import userData from 'PUB_DIR/sources/user-data';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {
    getTodayTimeStamp,
    getThisWeekTimeStamp,
    getLastWeekTimeStamp,
    getThisMonthTimeStamp,
    getThisQuarterTimeStamp,
    getThisYearTimeStamp
} from 'PUB_DIR/sources/utils/time-stamp-util';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import classNames from 'classnames';
import {contractChart} from 'ant-chart-collection';
import {isOpenCash, checkVersionAndType} from 'PUB_DIR/sources/utils/common-method-util';
import { AntcAnalysis } from 'antc';
import { getColumnHeight } from 'MOD_DIR/home_page/public/views/common-util';
import { getMaxLimitExtractClueCount } from 'PUB_DIR/sources/utils/common-data-util';
import Trace from 'LIB_DIR/trace';
const performance = {
    image_1: require('../images/performance_1.png'),
    image_2: require('../images/performance_2.png'),
    image_3: require('../images/performance_3.png')
};
const DATE_TYPE_KEYS = {
    TODAY: 'today',
    YESTERDAY: 'yesterday',
    CURRENT_WEEK: 'week',
    LAST_WEEK: 'lastWeek',
    THIS_MONTH: 'this_month',
    THIS_QUARTER: 'this_quarter',
    NEARLY_THREE_MONTH: 'nearly_three_month',
    THIS_YEAR: 'this_year'
};
const DATE_TYPE_MAP = [
    {
        name: Intl.get('user.time.today', '今天'),
        value: DATE_TYPE_KEYS.TODAY
    },
    {
        name: Intl.get('user.time.yesterday', '昨天'),
        value: DATE_TYPE_KEYS.YESTERDAY
    },
    {
        name: Intl.get('common.current.week', '本周'),
        value: DATE_TYPE_KEYS.CURRENT_WEEK
    },
    {
        name: Intl.get('user.time.prev.week', '上周'),
        value: DATE_TYPE_KEYS.LAST_WEEK
    },
];

//业绩时间筛选
const PERFORMANCE_DATE_TYPE = [
    {
        name: Intl.get('common.this.month', '本月'),
        value: DATE_TYPE_KEYS.THIS_MONTH
    },
    {
        name: Intl.get('common.current.quarter', '本季度'),
        value: DATE_TYPE_KEYS.THIS_QUARTER
    },
    {
        name: Intl.get('clue.customer.this.year', '今年'),
        value: DATE_TYPE_KEYS.THIS_YEAR
    }
];

const TABLE_CONSTS = {
    TABLE_MIN_WIDTH: 650,
    COLUMN_WIDTH_150: 150,
    COLUMN_WIDTH_100: 100,
    LOAD_SIZE: 10000,
};

const LAYOUT_CONSTANTS = {
    MY_DATA_TITLE_HEIGHT: 45, //顶部（我的数据）标题的高度
    EXPIRE_TITLE_HEIGHT: 45, //到期合同的title高度
    MARGIN_BOTTOM: 12, //card-container的margin-bottom:4px
    EXPIRE_PADDING: 24, //到期合同card的padding
    TABLE_TH_HEIGHT: 46, //table的表头高度
    PAGINATION_DISTANCE: 44, // 分页器的高度
};

let tableHeight = 0;

const PAGE_SIZE = 20;

class TeamDataColumn extends React.Component {
    constructor(props) {
        super(props);
        let type = this.getDefaultCallTimeType();
        this.state = {
            //业绩排名数据
            performanceData: {},
            //呼出总时长
            callTimeData: [],
            //本周联系客户总数
            contactCustomerCount: 0,
            //本周联系线索总数
            contactClueCount: 0,
            // 当前选择的时间类型
            currentDateType: type,
            callTimeLoading: false,
            callTimeErrMsg: '',
            curExpireContractDateType: DATE_TYPE_KEYS.NEARLY_THREE_MONTH,
            expireContracts: {},
            isShowExpireContractPanel: false,
            //本组织提取线索总量
            extractCluesTotal: 0,
            //提取线索条数（正式用户（显示本月提取数），测试用户（显示今天提取数））
            extractCluesCount: 0,
            //当前业绩选择的时间类型（默认本月）
            currentPerforManceDateType: DATE_TYPE_KEYS.THIS_MONTH,
            performanceLoading: false,
            maxLimitExtractNumber: 0,//能提取线索的最大数量
        };
    }

    componentDidMount() {
        //开通了营收中心，才获取业绩排名数据
        if(isOpenCash()){
            this.getPerformanceData();
        }
        this.getCallTimeData();
        this.getContactCustomerCount();
        this.getContactClueCount();
        this.getMaxLimitCount();
        this.getExtractCluesCount();
        this.getExpireContractData();
        this.changeTableHeight();
        $(window).on('resize', e => this.changeTableHeight());
    }

    componentWillUnmount() {
        $(window).off('resize', this.changeTableHeight);
        tableHeight = 0;
    }

    componentDidUpdate() {
        this.changeTableHeight();
    }

    changeTableHeight = () => {
        tableHeight = $(window).height()
            - LAYOUT_CONSTANTS.MY_DATA_TITLE_HEIGHT
            - LAYOUT_CONSTANTS.EXPIRE_TITLE_HEIGHT
            - LAYOUT_CONSTANTS.MARGIN_BOTTOM
            - LAYOUT_CONSTANTS.EXPIRE_PADDING
            - LAYOUT_CONSTANTS.TABLE_TH_HEIGHT;
    };

    getContactCustomerCount() {
        let params = {
            rang_params: [{
                from: TimeUtil.getStartTime('week'),
                to: TimeUtil.getEndTime('week'),
                name: 'last_contact_time',
                type: 'time'
            }]
        };
        myDataAjax.getContactCustomerCount(params).then((data) => {
            this.setState({contactCustomerCount: _.get(data, 'total')});
        }, (errorMsg) => {

        });
    }

    getContactClueCount() {
        let rangeParams = [{
            from: TimeUtil.getStartTime('week'),
            to: TimeUtil.getEndTime('week'),
            name: 'last_contact_time',
            type: 'time'
        }];
        let queryObj = {
            queryParam: {
                rangeParams
            },
            bodyParam: {
                query: {
                    status: ''
                },
                rang_params: rangeParams
            },
            pageNum: 1,
            pageSize: 1,
        };
        getClueFulltext(queryObj).then((result) => {
            this.setState({ contactClueCount: _.get(result, 'total', 0) });
        });
    }

    getExpireContractData() {
        let currentDateType = this.state.curExpireContractDateType;
        let queryObj = {
            sort_order: 'asc',
            load_size: TABLE_CONSTS.LOAD_SIZE
        };
        if (currentDateType === DATE_TYPE_KEYS.THIS_MONTH) {//本月
            queryObj.starttime = getThisMonthTimeStamp().start_time;
            queryObj.endtime = getThisMonthTimeStamp().end_time;
        }else if(currentDateType === DATE_TYPE_KEYS.THIS_QUARTER) {//本季度
            queryObj.starttime = getThisQuarterTimeStamp().start_time;
            queryObj.endtime = getThisQuarterTimeStamp().end_time;
        }else {//近三个月
            queryObj.starttime = moment().valueOf();
            queryObj.endtime = moment().add(3, 'months').valueOf();
        }
        myDataAjax.getExpireContractData(queryObj).then((result) => {
            this.setState({expireContracts: result});
        });
    }

    getExtractCluesCount() {
        let queryObj = {
            startTime: '',
            endTime: ''
        };
        // 获取本组织已提取线索数，不传是获取全部的
        this.getExtractCluesData(queryObj).then((result) => {
            this.setState({
                extractCluesTotal: result,
            });
        });
    }

    getMaxLimitCount() {
        getMaxLimitExtractClueCount().then((data) => {
            this.setState({
                maxLimitExtractNumber: data.maxCount,
                extractCluesCount: data.hasExtractedCount
            });
        });
    }

    getDefaultCallTimeType() {
        let type = DATE_TYPE_KEYS.TODAY;
        //销售
        if (this.isSalesRole()) {
            //普通销售
            if (userData.getUserData().isCommonSales) {
                type = DATE_TYPE_KEYS.TODAY;
            } else {//销售总监、主管
                //昨天
                type = DATE_TYPE_KEYS.YESTERDAY;
            }
        } else {//管理员、运营
            //本周
            type = DATE_TYPE_KEYS.CURRENT_WEEK;
        }
        return type;
    }

    //获取提取线索数量
    getExtractCluesData = (queryObj) => {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: '/rest/recommend/clue/count',
                dataType: 'json',
                type: 'get',
                data: {
                    timeStart: queryObj.startTime,
                    timeEnd: queryObj.endTime,
                },
                success: (data) => {
                    var count = _.get(data,'total', 0);
                    resolve(count);
                },
                error: (errorInfo) => {
                    reject(errorInfo);
                }
            });
        });
    };

    getCallTimeObj() {
        let curDateObj = _.find(DATE_TYPE_MAP, date => date.value === this.state.currentDateType);
        let callTimeObj = {
            startTime: 0,
            endTime: moment().valueOf(),
            callTimeDescr: curDateObj.name,
            type: curDateObj.value
        };

        switch (this.state.currentDateType) {
            case DATE_TYPE_KEYS.TODAY://今天
                callTimeObj.startTime = getTodayTimeStamp().start_time;
                break;
            case DATE_TYPE_KEYS.YESTERDAY://昨天
                callTimeObj.startTime = getTodayTimeStamp().start_time - oplateConsts.ONE_DAY_TIME_RANGE;
                callTimeObj.endTime = getTodayTimeStamp().end_time - oplateConsts.ONE_DAY_TIME_RANGE;
                break;
            case DATE_TYPE_KEYS.CURRENT_WEEK://本周
                callTimeObj.startTime = getThisWeekTimeStamp().start_time;
                break;
            case DATE_TYPE_KEYS.LAST_WEEK://上一周
                callTimeObj.startTime = getLastWeekTimeStamp().start_time;
                callTimeObj.endTime = getLastWeekTimeStamp().end_time;
                break;
            default:
                callTimeObj.startTime = getTodayTimeStamp().start_time;
                break;
        }
        return callTimeObj;
    }

    handleDateChange = (value) => {
        this.setState({currentDateType: value}, () => {
            this.getCallTimeData();
        });
    };

    //获取呼出总时长的统计
    getCallTimeData() {
        let timeObj = this.getCallTimeObj();
        let phoneParams = {
            start_time: timeObj.startTime,
            end_time: timeObj.endTime,
            device_type: 'all'
        };
        this.setState({callTimeLoading: true, callTimeErrMsg: ''});
        myDataAjax.getCallTimeData(phoneParams).then((data) => {
            this.setState({
                callTimeData: data,
                callTimeLoading: false
            });
        }, (errorMsg) => {
            this.setState({
                callTimeLoading: false,
                callTimeErrMsg: errorMsg,
                callTimeData: []
            });
        });
    }

    getPerformanceData() {
        let queryParams = {};
        let dateType = this.state.currentPerforManceDateType;
        if(dateType === DATE_TYPE_KEYS.THIS_MONTH) {//本月
            queryParams = getThisMonthTimeStamp();
        }else if(dateType === DATE_TYPE_KEYS.THIS_QUARTER) {//本季度
            queryParams = getThisQuarterTimeStamp();
        }else if(dateType === DATE_TYPE_KEYS.THIS_YEAR) {//本年
            queryParams = getThisYearTimeStamp();
        }
        this.setState({performanceLoading: true});
        myDataAjax.getContractPerformance(queryParams).then((data) => {
            this.setState({performanceData: data, performanceLoading: false});
        }, (errorMsg) => {
            this.setState({performanceData: {}, performanceLoading: false});
        });
    }

    //是否是销售角色，不是管理员和运营就是销售
    isSalesRole() {
        return !userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) && !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    }

    handlePerformanceDateChange = (value) => {
        let time = '';
        if(value === DATE_TYPE_KEYS.THIS_MONTH){
            time = '本月';
        }else if(value === DATE_TYPE_KEYS.THIS_QUARTER) {
            time = '本季度';
        }else {
            time = '今年';
        }
        Trace.traceEvent(ReactDOM.findDOMNode(this),'点击' + time + '业绩按钮');
        this.setState({currentPerforManceDateType: value}, () => {
            this.getPerformanceData();
        });
    };

    renderPerformanceData() {
        const performanceData = this.state.performanceData;
        const isSales = this.isSalesRole();
        const topPerformance = [];
        let totalData = _.sumBy(performanceData.top, 'performance');
        _.each(_.get(performanceData, 'top', []), (item, index) => {
            if (index <= 2) {
                let performanceAmount = _.get(performanceData, `top[${index}].performance`);
                performanceAmount = performanceAmount ? performanceAmount.toFixed(2) : performanceAmount;
                topPerformance.push(
                    <div key={index} className="performance-data-item">
                        <span className="performance-data-left">
                            <img className="performance-image" src={performance[`image_${item.order}`]}/>
                        </span>
                        <span className="performance-data-left contact-data">
                            {Intl.get('contract.159', '{num}元', {num: performanceAmount})}
                        </span>
                        <span className="performance-data-right">{_.get(performanceData, `top[${index}].name`)}</span>
                    </div>);
            } else {
                return false;
            }
        });
        //当前业绩占总数的百分比
        let curPerformance = _.get(performanceData, 'own.performance', 0);
        let percent = totalData ? (curPerformance / totalData) * 100 : 0;
        const performanceOptions = _.map(PERFORMANCE_DATE_TYPE, date => (
            <Option key={date.value} value={date.value}>{date.name}</Option>
        ));
        const cls = classNames('my-data-preformance-card', {
            'has-loading': this.state.performanceLoading
        });
        let dateType = this.state.currentPerforManceDateType;
        let time = '';
        if(dateType === DATE_TYPE_KEYS.THIS_MONTH){
            time = Intl.get('common.this.month', '本月');
        }else if(dateType === DATE_TYPE_KEYS.THIS_QUARTER) {
            time = Intl.get('common.current.quarter', '本季度');
        }else {
            time = Intl.get('clue.customer.this.year', '今年');
        }
        let performanceAmount = _.get(performanceData, 'own.performance');
        performanceAmount = performanceAmount ? performanceAmount.toFixed(2) : performanceAmount;
        const performanceContent = (
            <div>
                <div className='my-data-title'>
                    <div className="select-wrapper">
                        <span>{Intl.get('home.page.performance.at.time', '{time}业绩',{time: time})}</span>
                        <Select
                            value={this.state.currentPerforManceDateType}
                            onChange={this.handlePerformanceDateChange}
                            className="performance-select"
                        >
                            {performanceOptions}
                        </Select>
                    </div>
                </div>
                {this.state.performanceLoading ? <Spinner/> : (
                    <div>
                        <div className='my-contact-performance my-data-title-data'>
                            <span
                                className="performance-data-left"> {Intl.get('contract.159', '{num}元', {num: performanceAmount})}</span>
                            {isSales ? (
                                <span
                                    className="performance-data-right">{Intl.get('home.page.performance.num', '第{n}名', {n: _.get(performanceData, 'own.order')})}</span>) : null}
                        </div>
                        {isSales ? (
                            <div className='my-data-performance-chart'>
                                <span className='my-performance-percent' style={{width: percent + '%'}}/>
                            </div>) : null}
                        {isSales ? (<div className="my-data-detail-list">{topPerformance}</div>) : null}
                    </div>
                )}
            </div>);
        return (<DetailCard content={performanceContent}
            className={cls}/>);
    }

    renderCallTime() {
        let callTimeData = this.state.callTimeData || [];
        callTimeData = callTimeData.sort((a, b) => {
            return b.totalTime - a.totalTime;
        });
        const firstTotalTime = _.get(callTimeData, '[0].totalTime', 0);
        let totalTime = _.sumBy(callTimeData, 'totalTime');
        let time = TimeUtil.secondsToHourMinuteSecond(totalTime || 0);
        let timeObj = this.getCallTimeObj();
        //只展示前三条数据
        callTimeData = _.filter(callTimeData, (item, index) => index <= 2);
        const callTimeOptions = _.map(DATE_TYPE_MAP, date => (
            <Option key={date.value} value={date.value}>{date.name}</Option>
        ));
        const cls = classNames('my-data-call-time-card', {
            'has-loading': this.state.callTimeLoading
        });

        const callTimeContent = (
            <div>
                <div className='my-data-title'>
                    <div className="select-wrapper">
                        <span>{Intl.get('home.page.callout.time', '呼出总时长')}</span>
                        <Select
                            value={this.state.currentDateType}
                            onChange={this.handleDateChange}
                            className="call-time-select"
                        >
                            {callTimeOptions}
                        </Select>
                    </div>
                </div>
                {
                    this.state.callTimeLoading ? <Spinner/> : (
                        <div>
                            <div className='call-time-total my-data-title-data'>
                                {time.timeDescr !== '0' ? (
                                    <span className="add-data-style phone-total-time phone-total-data">
                                        {time.hours > 0 ? <span className='num'>{time.hours}<span
                                            className="total-data-desc">{Intl.get('user.time.hour', '小时')} </span></span> : null}
                                        {time.minutes > 0 ?
                                            <span className='num'>{time.minutes}<span
                                                className="total-data-desc">{Intl.get('user.time.minute', '分')} </span></span> : null}
                                        {time.second > 0 ? <span className='num'>{time.second}<span
                                            className="total-data-desc">{Intl.get('user.time.second', '秒')} </span></span> : null}
                                        {time.timeDescr === 0 ? time.timeDescr : null}
                                    </span>
                                ) : (
                                    <span className="add-data-style phone-total-time phone-total-data">
                                        <span className='num'> 0 {Intl.get('user.time.second', '秒')}</span>
                                    </span>)}
                            </div>
                            <div className='call-time-list my-data-detail-list'>
                                {_.map(callTimeData, (item, index) => {
                                    //第一名是100%
                                    let percent = 100;
                                    //其他名次占第一名的百分比
                                    if (index !== 0) {
                                        percent = firstTotalTime ? (item.totalTime / firstTotalTime) * 100 : 0;
                                    }
                                    let timeObj = TimeUtil.secondsToHourMinuteSecond(item.totalTime || 0);
                                    return (
                                        <div className="call-time-item">
                                            <span className='call-time-name'
                                                title={_.get(item, 'salesName', '')}>{_.get(item, 'salesName', '')}</span>
                                            <span className='progress-bar-wrap'>
                                                <Tooltip title={timeObj.timeDescr} placement="left">
                                                    <Progress size='small' percent={percent} showInfo={false}
                                                        strokeColor={{
                                                            from: '#d3eafd',
                                                            to: '#a7d5fa'
                                                        }}
                                                        status='normal'/>
                                                </Tooltip>
                                            </span>
                                        </div>);
                                })}
                            </div>
                        </div>
                    )
                }
            </div>);
        return (<DetailCard content={callTimeContent}
            className={cls}/>);
    }

    renderContactCustomers() {
        const contactCustomersContent = (
            <div>
                <div className='my-data-title'>{Intl.get('home.page.contacts.customers.week', '本周已联系客户总数')}</div>
                <div className='contact-customer-count my-data-title-data'>
                    {Intl.get('sales.home.count', '{count}个', {count: this.state.contactCustomerCount})}
                </div>
            </div>);
        return (<DetailCard content={contactCustomersContent}
            className='my-data-contact-customers-card'/>);
    }

    //本周已联系线索总数
    renderContactClues() {
        const contactClueContent = (
            <div>
                <div className='my-data-title'>{Intl.get('home.page.contacts.clues.week', '本周已联系客户总数')}</div>
                <div className='contact-clue-count my-data-title-data'>
                    {Intl.get('sales.home.count', '{count}个', {count: this.state.contactClueCount})}
                </div>
            </div>);
        return (
            <DetailCard
                content={contactClueContent}
                className='my-data-contact-clues-card'
            />
        );
    }

    //近三月到期合同统计
    renderExpireContracts() {
        const expireContractsContent = (
            <div>
                <div className='my-data-title'>{Intl.get('home.page.expire.contract.at.time', '{time}即将到期合同统计', {
                    time: Intl.get('clue.customer.last.three.month', '近三个月')
                })}</div>
                <div className='expire-contract-count my-data-title-data'>
                    <a className='see-expire-contract-btn' title={Intl.get('call.record.show.customer.detail', '查看详情')} onClick={this.setExpireContractPanel.bind(this,true)}>{Intl.get('sales.home.count', '{count}个', {count: _.get(this.state.expireContracts, 'total', 0)})}</a>
                </div>
            </div>);
        return (
            <DetailCard
                content={expireContractsContent}
                className='my-data-expire-contract-card'
            />
        );
    }

    setExpireContractPanel = (flag) => {
        this.setState({ isShowExpireContractPanel: flag });
    };

    // 到期合同（可选本月，本季度，近三个月）
    renderExpireContractsPanel() {
        // 开通营收中心后才能显示
        if (isOpenCash()) {
            let chart = contractChart.getContractExpireRemindChart();

            //表格列
            const columns = _.get(chart, 'option.columns');

            // 设置table最大宽度
            chart.option.scroll = {x: TABLE_CONSTS.TABLE_MIN_WIDTH, y: tableHeight};

            // 设置每页显示条数
            chart.option.pagination = { pageSize: PAGE_SIZE };

            //负责人列索引
            const endTimeColumnIndex = _.findIndex(columns, column => column.dataIndex === 'end_time');

            _.each(columns, column => {
                if(column.dataIndex === 'customer_name') {
                    column.width = TABLE_CONSTS.COLUMN_WIDTH_150;
                }else {
                    column.width = TABLE_CONSTS.COLUMN_WIDTH_100;
                }
            });

            //需要加两列毛利 回款额
            if (endTimeColumnIndex !== -1) {
                columns.splice(endTimeColumnIndex, 0, {
                    title: Intl.get('contract.109', '毛利'),
                    dataIndex: 'gross_profit',
                    width: TABLE_CONSTS.COLUMN_WIDTH_100,
                }, {
                    title: Intl.get('contract.28', '回款额'),
                    dataIndex: 'total_gross_profit',
                    width: TABLE_CONSTS.COLUMN_WIDTH_100,
                });
            }

            // 构建我们自己需要的chart
            const newChart = {
                url: '',
                // 添加类型选择框
                /*cardContainer: {
                    selectors: [{
                        options: [{
                            name: Intl.get('clue.customer.this.month', '本月'),
                            value: DATE_TYPE_KEYS.THIS_MONTH,
                        },{
                            name: Intl.get('clue.customer.this.quarter', '本季度'),
                            value: DATE_TYPE_KEYS.THIS_QUARTER,
                        },{
                            name: Intl.get('clue.customer.last.three.month', '近三个月'),
                            value: DATE_TYPE_KEYS.NEARLY_THREE_MONTH,
                        }],
                        activeOption: DATE_TYPE_KEYS.NEARLY_THREE_MONTH,
                        conditionName: 'date_type',
                    }],
                },
                conditions: _.concat(_.get(chart,'conditions', []), [{
                    name: 'date_type',
                    value: DATE_TYPE_KEYS.NEARLY_THREE_MONTH,
                }]),*/
                argCallback: arg => {
                    arg.query.load_size = TABLE_CONSTS.LOAD_SIZE;

                    let date_type = arg.query.date_type;

                    if (date_type === DATE_TYPE_KEYS.THIS_MONTH) {//本月
                        arg.query.starttime = getThisMonthTimeStamp().start_time;
                        arg.query.endtime = getThisMonthTimeStamp().end_time;
                    }else if(date_type === DATE_TYPE_KEYS.THIS_QUARTER) {//本季度
                        arg.query.starttime = getThisQuarterTimeStamp().start_time;
                        arg.query.endtime = getThisQuarterTimeStamp().end_time;
                    }else {//近三个月
                        arg.query.starttime = moment().valueOf();
                        arg.query.endtime = moment().add(3, 'months').valueOf();
                    }
                    delete arg.query.date_type;
                },
                noExportCsv: true,
                processData: (data, chart) => {
                    const total = _.get(data, 'total', 0);
                    if(total > PAGE_SIZE) {//默认每页显示20条，但小于20条时，不显示分页
                        chart.option.scroll.y = tableHeight - LAYOUT_CONSTANTS.PAGINATION_DISTANCE;
                    }else { chart.option.pagination = false; }
                    chart.title = Intl.get('home.page.expire.contract.at.time', '{time}即将到期合同统计', {
                        time: Intl.get('clue.customer.last.three.month', '近三个月')
                    }) + `(${Intl.get('sales.home.total.count', '共{count}个', {count: total})})`;

                    data = _.get(data, 'expired_contracts', []);

                    let processedData = [];

                    _.each(data, item => {
                        let processedDataItem = {
                            contract_amount: item.contract_amount,
                            gross_profit: item.gross_profit,
                            total_gross_profit: item.total_gross_profit,
                            end_time: moment(item.end_time).format(oplateConsts.DATE_FORMAT),
                            customer_name: '',
                            user_name: '',
                        };

                        const buyer = item.buyer;
                        //所属客户
                        const customers = item.customers || [];
                        //客户数
                        const customerNum = customers.length;

                        _.each(customers, (customer, index) => {
                            let customerName = _.get(customer,'customer_name','');
                            let userName = _.get(customer,'customer_sales_name','');

                            if (index !== customerNum - 1) {
                                const suffix = ', ';
                                customerName += suffix;
                                userName += suffix;
                            } else {

                                //如果所属客户不止一个，则在最后一个客户后面显示甲方
                                if (buyer && customerNum > 1) {
                                    customerName += '（' + Intl.get('contract.4', '甲方') + '：' + buyer + '）';
                                }
                            }

                            processedDataItem.customer_name += customerName;
                            processedDataItem.user_name += userName;
                        });

                        processedData.push(processedDataItem);
                    });

                    return processedData;
                },
                data: this.state.expireContracts,
                resultType: '',
            };

            // 合并chart
            chart = {...chart, ...newChart};

            const charts = [chart];

            return (
                <div className="contract-expire-wrapper">
                    <AntcAnalysis
                        charts={charts}
                        forceUpdate
                        isGetDataOnMount={true}
                    />
                </div>
            );
        } else {
            return null;
        }
    }

    //组织提取线索量统计
    renderExtractCluesPanel() {
        let residueExtractCluesCount = this.state.maxLimitExtractNumber - this.state.extractCluesCount;
        residueExtractCluesCount = residueExtractCluesCount > 0 ? residueExtractCluesCount : 0;
        const extractClueContent = (
            <div>
                <div className='my-data-title'>{Intl.get('home.page.extract.clues.statistical', '提取线索量统计')}</div>
                <div className="extract-clue-wrap">
                    <div className='extract-clue-data'>
                        {checkVersionAndType().formal ?
                            Intl.get('home.page.extract.clues.on.months', '本月已提取{extractedCount}条线索，还可提取{canCount}条线索',{extractedCount: this.state.extractCluesCount, canCount: residueExtractCluesCount})
                            : Intl.get('home.page.extract.clues.on.today', '今天已提取{extractedCount}条线索，还可提取{canCount}条线索',{extractedCount: this.state.extractCluesCount, canCount: residueExtractCluesCount})}
                    </div>
                    <div className='extract-clue-data'>
                        {Intl.get('home.page.extract.clues.get.counts', '共提取{count}条线索', {count: this.state.extractCluesTotal})}
                    </div>
                </div>
            </div>);
        return (
            <DetailCard
                content={extractClueContent}
                className='my-data-extract-clues-card'
            />
        );
    }

    renderTeamDataContent() {
        return (
            <div className='my-data-content' style={{height: getColumnHeight()}} data-tracename="我的数据">
                <GeminiScrollbar>
                    {isOpenCash() ? this.renderPerformanceData() : null}
                    {this.renderCallTime()}
                    {this.renderContactCustomers()}
                    {this.renderContactClues()}
                    {this.renderExtractCluesPanel()}
                    {isOpenCash() ? this.renderExpireContracts() : null}
                </GeminiScrollbar>
                {
                    this.state.isShowExpireContractPanel ? (
                        <RightPanelModal
                            width={1000}
                            className=""
                            isShowMadal
                            isShowCloseBtn
                            onClosePanel={this.setExpireContractPanel.bind(this, false)}
                            content={this.renderExpireContractsPanel()}
                        />
                    ) : null
                }
            </div>);
    }

    render() {
        return (
            <ColumnItem contianerClass='team-data-wrap'
                title={Intl.get('home.page.my.data', '我的数据')}
                content={this.renderTeamDataContent()}
            />);
    }
}
export default TeamDataColumn;