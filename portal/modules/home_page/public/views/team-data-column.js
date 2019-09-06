/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/6/12.
 */
import '../css/my-data-column.less';
import {Progress, Tooltip, Select} from 'antd';
const Option = Select.Option;
import ColumnItem from './column-item';
import myDataAjax from '../ajax';
import DetailCard from 'CMP_DIR/detail-card';
import Spinner from 'CMP_DIR/spinner';
import userData from 'PUB_DIR/sources/user-data';
import {getTodayTimeStamp, getThisWeekTimeStamp, getLastWeekTimeStamp} from 'PUB_DIR/sources/utils/time-stamp-util';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import classNames from 'classnames';

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
            // 当前选择的时间类型
            currentDateType: type,
            callTimeLoading: false,
            callTimeErrMsg: '',
        };
    }

    componentDidMount() {
        this.getPerformanceData();
        this.getCallTimeData();
        this.getContactCustomerCount();
    }

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
        myDataAjax.getContractPerformance().then((data) => {
            this.setState({performanceData: data});
        }, (errorMsg) => {

        });
    }

    //是否是销售角色，不是管理员和运营就是销售
    isSalesRole() {
        return !userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) && !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    }

    renderPerformanceData() {
        const performanceData = this.state.performanceData;
        const isSales = this.isSalesRole();
        const topPerformance = [];
        let totalData = _.sumBy(performanceData.top, 'performance');
        _.each(_.get(performanceData, 'top', []), (item, index) => {
            if (index <= 2) {
                topPerformance.push(
                    <div key={index} className="performance-data-item">
                        <span className="performance-data-left">
                            <img className="performance-image" src={performance[`image_${item.order}`]}/>
                        </span>
                        <span className="performance-data-left contact-data">
                            {Intl.get('contract.159', '{num}元', {num: _.get(performanceData, `top[${index}].performance`)})}
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
        const performanceContent = (
            <div>
                <div className='my-data-title'>本月业绩</div>
                <div className='my-contact-performance my-data-title-data'>
                    <span
                        className="performance-data-left"> {Intl.get('contract.159', '{num}元', {num: _.get(performanceData, 'own.performance')})}</span>
                    {isSales ? (
                        <span
                            className="performance-data-right">{Intl.get('home.page.performance.num', '第{n}名', {n: _.get(performanceData, 'own.order')})}</span>) : null}
                </div>
                {isSales ? (
                    <div className='my-data-performance-chart'>
                        <span className='my-performance-percent' style={{width: percent + '%'}}/>
                    </div>) : null}
                {isSales ? (<div className="my-data-detail-list">{topPerformance}</div>) : null}
            </div>);
        return (<DetailCard content={performanceContent}
            className='my-data-preformance-card'/>);
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
                    <div className="call-time-select-wrapper">
                        <Select
                            value={this.state.currentDateType}
                            onChange={this.handleDateChange}
                        >
                            {callTimeOptions}
                        </Select>
                        <span>{Intl.get('home.page.callout.time', '呼出总时长')}</span>
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

    renderTeamDataContent() {
        return (
            <div data-tracename="我的数据">
                {this.renderPerformanceData()}
                {this.renderCallTime()}
                {this.renderContactCustomers()}
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