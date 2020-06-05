/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/15.
 */
import {DatePicker} from 'antd';
import {getTimeWithSecondZero} from 'PUB_DIR/sources/utils/common-method-util';
import {clueStartTime} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
require('./index.less');
import classNames from 'classnames';
class RangePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkTimeErrMsg: '',
            timeRange: _.cloneDeep(this.props.timeRange)
        };
    }
    componentWillReceiveProps(nextProps, nextContext) {
        if(nextProps.timeRange){
            this.setState({
                timeRange: _.cloneDeep(nextProps.timeRange)
            });
        }
    }
    // 验证起始时间是否小于结束时间
    validateStartAndEndTime(callback) {
        var rangeParams = this.state.timeRange;
        const begin_time = rangeParams.startTime;
        const endTime = rangeParams.endTime;
        if (endTime && begin_time) {
            if (moment(endTime).isBefore(begin_time)) {
                callback(Intl.get('contract.start.time.greater.than.end.time.warning', '起始时间不能大于结束时间'));
            } else {
                callback();
            }
        } else {
            callback();
        }
    }

    onBeginTimeChange = (date) => {
        let timeRange = this.state.timeRange;
        if(date){
            let startDateValue = moment(getTimeWithSecondZero(date)).startOf('day');
            if(timeRange.endTime){
                timeRange.startTime = startDateValue;
                this.validateStartAndEndTime((errMsg) => {
                    if(errMsg){
                        this.setState({
                            checkTimeErrMsg: errMsg
                        });
                    }else{
                        this.clearAllTimeRange({startTime: timeRange.startTime.valueOf(),endTime: timeRange.endTime.valueOf()});
                    }
                });
            }else{
                this.clearAllTimeRange({startTime: startDateValue.valueOf(), endTime: moment().endOf('day').valueOf()});
            }
        }else{
            this.clearAllTimeRange();
        }
    };
    onEndTimeChange = (date) => {
        let timeRange = this.state.timeRange;
        if(date){
            let endDateValue = moment(getTimeWithSecondZero(date)).endOf('day');
            if(timeRange.startTime || timeRange.startTime === clueStartTime){
                timeRange.endTime = endDateValue;
                this.validateStartAndEndTime((errMsg) => {
                    if(errMsg){
                        this.setState({
                            checkTimeErrMsg: errMsg
                        });
                    }else{
                        this.clearAllTimeRange({startTime: timeRange.startTime.valueOf(),endTime: timeRange.endTime.valueOf()});
                    }
                });
            }else{
                this.clearAllTimeRange({startTime: clueStartTime, endTime: endDateValue.valueOf()});
            }
        }else{
            this.clearAllTimeRange();
        }
    };
    clearAllTimeRange = (rangeObj) => {
        this.setState({
            checkTimeErrMsg: ''
        },() => {
            this.props.changeRangePicker(rangeObj);
        });
    };
    render = () => {
        let {timeRange} = this.state;
        let startTime = timeRange.startTime;
        let endTime = timeRange.endTime;
        var hasErr = this.state.checkTimeErrMsg;
        var cls = classNames('range-picker-wrap',{
            'has-error': hasErr
        });
        return (
            <div className={cls}>
                <span className="consult-time">{this.props.title || Intl.get('common.login.time', '时间')}
                    {startTime || endTime ? <span className='clear-time' onClick={this.clearAllTimeRange.bind(this,'')}>
                        {Intl.get('lead.filter.clear.time.range', '清空')}
                    </span> : null}
                </span>
                <div>
                    <DatePicker
                        allowClear={false}
                        disabledDate={this.props.disabledDate}
                        onChange={this.onBeginTimeChange}
                        value={startTime ? moment(startTime) : ''}
                    />
                    <span className='date-connect'>
                        <span className='split-line'>—</span>
                    </span>
                    <DatePicker
                        allowClear={false}
                        disabledDate={this.props.disabledDate}
                        onChange={this.onEndTimeChange}
                        value={endTime ? moment(endTime) : ''}
                    />
                    {hasErr ? <span className='err-tip'>{this.state.checkTimeErrMsg}</span> : null}
                </div>
            </div>
        );
    };
}

RangePicker.defaultProps = {
    disabledDate: function() {
    },
    changeRangePicker: function() {
    },
    timeRange: {startTime: '',endTime: ''},
    title: ''

};

RangePicker.propTypes = {
    disabledDate: PropTypes.func,
    changeRangePicker: PropTypes.func,
    timeRange: PropTypes.object,
    title: PropTypes.string

};
export default RangePicker;
