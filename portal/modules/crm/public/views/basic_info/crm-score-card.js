/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/6.
 */
import Trace from 'LIB_DIR/trace';
import DetailCard from 'CMP_DIR/detail-card';
import { AntcDatePicker as DatePicker } from 'antc';
import classNames from 'classnames';
import crmAjax from '../../ajax';
import crmAction from '../../action/crm-actions';
import {AntcChart} from 'antc';
import {Tag,Popover, Icon} from 'antd';
import history from 'PUB_DIR/sources/history';
const userData = require('PUB_DIR/sources/user-data');
const QUALIFIED_USER_SIZE = 200;//客户的所有合格用户默认先用200个
const QUALIFY_LABEL = 1; //合格的用户

class CrmScoreCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isExpandDetail: false,//是否展开客户分数详情
            isLoadingUser: false, //是否正在获取合格用户
            loadUserErrorMsg: '',//获取合格用户的错误提示
            qualifiedUserList: [],//合格的用户
            isLoadingHistoryScore: false, //是否正在获取历史分数
            getHistoryScoreErrorMsg: '',//获取合格用户的错误提示
            historyScoreList: [],//分数的历史趋势
            customerScore: this.props.customerScore,//客户分数
            customerId: this.props.customerId,
            customerUserSize: this.props.customerUserSize,//该客户共有多少个用户
            startTime: moment().startOf('year').valueOf(),//默认展示今年的历史趋势
            endTime: moment().valueOf(),
            timeType: 'year'//时间类型
        };
    }

    componentDidMount() {
        this.getHistoryScoreList();
        this.getQualifiedUserList();
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.customerId !== nextProps.customerId) {
            this.setState({
                customerScore: nextProps.customerScore,
                customerUserSize: nextProps.customerUserSize,
                customerId: nextProps.customerId
            });
            setTimeout(() => {
                this.getHistoryScoreList();
                this.getQualifiedUserList();
            });
        }
    }

    //获取分数趋势数据
    getHistoryScoreList() {
        if (!this.state.customerId) return;
        this.setState({isLoadingHistoryScore: true});
        crmAjax.getHistoryScoreList({
            customer_id: this.state.customerId,
            start_time: this.state.startTime,
            end_time: this.state.endTime,
        }).then(result => {
            let scoreObjList = _.get(result, '[0]') ? result : [];
            let historyScoreList = [];
            //年的数据(数据超过一个月的数据时)，按月展示
            if (this.state.timeType === 'year') {
                //最后一个数据是某年最后一天的数据或今年今天的分数
                let lastData = _.get(scoreObjList, '[0]', {});
                historyScoreList.push({
                    name: moment(lastData.time).format(oplateConsts.DATE_FORMAT),
                    value: lastData.score || 0
                });
                let lastDataTime = moment(lastData.time);
                //最后一个点的时间所在月份
                let lastDataMonth = lastDataTime.month() + 1;
                for (let i = 1; i < lastDataMonth; i++) {
                    let lastTime = _.cloneDeep(lastDataTime);
                    //上i个月的最后一天的开始时间
                    let curMonthTime = lastTime.subtract(i, 'months').endOf('month').startOf('day').valueOf();
                    let curMonthData = _.find(scoreObjList, item => item.time === curMonthTime);
                    historyScoreList.push({
                        name: moment(curMonthTime).format(oplateConsts.DATE_FORMAT),
                        value: _.get(curMonthData, 'score', 0)
                    });
                }
            } else {
                historyScoreList = _.map(scoreObjList, item => {
                    return {name: moment(item.time).format(oplateConsts.DATE_FORMAT), value: item.score};
                });
            }
            //后端传过来的数据是按时间倒序排的，所以需要把数据正过来
            _.reverse(historyScoreList);
            this.setState({historyScoreList, isLoadingHistoryScore: false, getHistoryScoreErrorMsg: ''});
        }, errorMsg => {
            this.setState({historyScoreList: [], isLoadingHistoryScore: false, getHistoryScoreErrorMsg: errorMsg});
        });
    }

    //获取合格的用户列表
    getQualifiedUserList() {
        if (!this.state.customerUserSize || !this.state.customerId) return;
        this.setState({isLoadingUser: true});
        crmAjax.getCrmUserList({
            customer_id: this.state.customerId,
            page_size: this.state.customerUserSize,
            id: '',
            qualify_label: QUALIFY_LABEL
        }).then(result => {
            let userList = _.get(result, 'data[0]') ? result.data : [];
            let qualifiedUserList = _.map(userList, item => {
                return {
                    user_id: _.get(item, 'user.user_id', ''),
                    nick_name: _.get(item, 'user.nick_name', ''),
                    user_name: _.get(item, 'user.user_name', '')
                };
            });
            this.setState({qualifiedUserList, isLoadingUser: false, loadUserErrorMsg: ''});
        }, errorMsg => {
            this.setState({qualifiedUserList: [], isLoadingUser: false, loadUserErrorMsg: errorMsg});
        });
    }

    toggleScoreDetail(e) {
        Trace.traceEvent(e, this.state.isExpandDetail ? '收起客户分数详情' : '展开客户分数详情');
        //展开历史分数时，重置时间并重新获取数据
        if (!this.state.isExpandDetail) {
            this.setState({
                isExpandDetail: !this.state.isExpandDetail,
                timeType: 'year',
                startTime: moment().startOf('year').valueOf(),//默认展示今年的历史趋势
                endTime: moment().valueOf()
            }, () => {
                this.getHistoryScoreList();
            });
        } else {//收起历史分数
            this.setState({isExpandDetail: !this.state.isExpandDetail});
        }
    }

    onSelectDate(startTime, endTime, range) {
        startTime = _.isString(startTime) ? parseInt(startTime) : startTime;
        endTime = _.isString(endTime) ? parseInt(endTime) : endTime;
        if (!startTime) {
            startTime = moment('2010-01-01 00:00:00').valueOf();
        }
        if (!endTime) {
            endTime = moment().endOf('day').valueOf();
        }
        this.setState({startTime, endTime, timeType: range});
        setTimeout(() => this.getHistoryScoreList());
    }
    //时间类型修改
    onTimeRangeChange = (startTime, endTime, timeRange) => {
        this.setState({timeType: timeRange});
    }

    showUserDetail(userId) {
        this.props.showUserDetail(userId);
    }
    //客户分数解释内容
    scoreExplain = () => {
        //判断是不是管理员
        if(userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)){
            return(<div className="handle-btn-item"
                onClick={() => {history.push('/settings/automation');}}>
                {Intl.get('user.login.score.explain.mananer', '设置分数规则？')}
            </div>);
        }else{
            return (Intl.get('user.login.score.explain.other', '按客户评分规则生成的分数，了解详情请联系管理员'));
        }
    }
    
    renderScoreDetail() {
        const chartOption = {
            grid: {
                top: 20,
                left: 30,
                right: 20
            },
            tooltip: {
                formatter: (params) => {
                    const data = params[0].data;
                    return [
                        `${data.name}`,
                        `${Intl.get('crm.score.text', '{score}分', {score: data.value})}`
                    ].join('<br />');
                }
            }
        };
        const dateWrapCls = classNames('date-selector-wrap btn-item', {
            'select-custom-range-style': this.state.timeType === 'custom'
        });
        return (
            <div className="crm-score-detail-wrap">
                <div className="crm-qualified-user-blcok">
                    <div className="crm-account-label crm-score-label">{Intl.get('crm.qualify.account', '合格账号')}:</div>
                    <div className="crm-account-text">
                        {
                            _.get(this.state, 'qualifiedUserList[0]') ? _.map(this.state.qualifiedUserList, user => {
                                return (<Tag onClick={this.showUserDetail.bind(this, user.user_id)}><span
                                    className="iconfont icon-active-user-ico"/>{user.user_name}</Tag>);
                            }) : (<span className="no-qualify-account-tip">
                                {Intl.get('crm.no.qualify.account', '暂无合格账号')}
                            </span>)
                        }
                    </div>
                </div>
                <div className="crm-history-score-block">
                    <div className="crm-score-label">{Intl.get('crm.score.history.title', '历史分数')}</div>
                    <div className={dateWrapCls}>
                        <DatePicker
                            disableDateAfterToday={true}
                            range={this.state.timeType}
                            onRadioChange={this.onTimeRangeChange}
                            onSelect={this.onSelectDate.bind(this)}>
                            <DatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                            <DatePicker.Option value="month">
                                {Intl.get('common.time.unit.month', '月')}
                            </DatePicker.Option>
                            <DatePicker.Option value="year">{Intl.get('common.time.unit.year', '年')}</DatePicker.Option>
                            <DatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                        </DatePicker>
                    </div>
                    <AntcChart
                        resultType={this.state.isLoadingHistoryScore ? 'loading' : ''}
                        data={this.state.historyScoreList}
                        chartType="line"
                        option={chartOption}
                    />
                </div>
            </div>);
    }

    renderScoreTitle() {
        const customerScore = this.state.customerScore;
        const expandIconCls = classNames('iconfont', {
            'icon-down-twoline handle-btn-item': !this.state.isExpandDetail,
            'icon-up-twoline handle-btn-item': this.state.isExpandDetail,
        });
        const expandIconTip = this.state.isExpandDetail ? Intl.get('crm.basic.detail.hide', '收起详情') : Intl.get('crm.basic.detail.show', '展开详情');
        return (
            <div className="crm-score-title">
                <span className="crm-score-label">{Intl.get('crm.score.label', '客户评分')}:</span>
                <span className="crm-score-label crm-score-text">
                    {customerScore || customerScore === 0 ? <span>
                        {Intl.get('crm.score.text', '{score}分', {score: customerScore})}
                        <Popover 
                            content={this.scoreExplain()}
                            trigger='click'
                            placement="right">
                            <Icon type="question-circle-o"></Icon>
                        </Popover>
                    </span> : ''}
                </span>
                <span className={expandIconCls} title={ expandIconTip}
                    onClick={this.toggleScoreDetail.bind(this)}/>
            </div>);
    }

    render() {
        if (this.state.isExpandDetail) {
            return (<DetailCard className="crm-score-card-container" title={this.renderScoreTitle()}
                content={this.renderScoreDetail()}/>);
        } else {
            return (<DetailCard className="crm-score-card-container" content={this.renderScoreTitle()}/>);
        }
    }
}
CrmScoreCard.propTypes = {
    customerScore: PropTypes.number,
    customerId: PropTypes.string,
    customerUserSize: PropTypes.number,
    showUserDetail: PropTypes.func,
};
export default CrmScoreCard;