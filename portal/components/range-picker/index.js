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
            let startDateValue = moment(getTimeWithSecondZero(date)).startOf('day').valueOf();
            if(timeRange.endTime){
                timeRange.startTime = startDateValue;
                this.validateStartAndEndTime((errMsg) => {
                    if(errMsg){
                        this.setState({
                            checkTimeErrMsg: errMsg
                        });
                    }else{
                        this.props.changeRangePicker(timeRange);
                    }
                });
            }
        }else{
            this.props.changeRangePicker();
        }
    };
    onEndTimeChange = (date) => {
        let timeRange = this.state.timeRange;
        if(date){
            let endDateValue = moment(getTimeWithSecondZero(date)).endOf('day').valueOf();
            if(timeRange.startTime || timeRange.startTime === clueStartTime){
                timeRange.endTime = endDateValue;
                this.validateStartAndEndTime((errMsg) => {
                    if(errMsg){
                        this.setState({
                            checkTimeErrMsg: errMsg
                        });
                    }else{
                        this.setState({
                            checkTimeErrMsg: ''
                        },() => {
                            this.props.changeRangePicker(timeRange);
                        });
                    }
                });
            }
        }else{
            this.setState({
                checkTimeErrMsg: ''
            },() => {
                this.props.changeRangePicker();
            });
        }
    };
    clearAllTimeRange = () => {
        this.setState({
            checkTimeErrMsg: ''
        },() => {
            this.props.changeRangePicker();
        });
    };
    render = () => {
        let {timeRange} = this.state;
        let startTime = timeRange.startTime;
        let endTime = timeRange.endTime;
        var rangeObj = startTime !== clueStartTime ? {startTime: moment(startTime),endTime: moment(endTime)} : {startTime: '',endTime: this.props.timeType !== 'all' ? moment(endTime) :''};
        var hasErr = this.state.checkTimeErrMsg;
        var cls = classNames('range-picker-wrap',{
           'has-error': hasErr
        });
        return (
            <div className={cls}>
                <span className="consult-time">{Intl.get('common.login.time', '时间')}
                    {rangeObj.startTime || rangeObj.endTime ? <span className='clear-time' onClick={this.clearAllTimeRange}>
                        {Intl.get('lead.filter.clear.time.range', '清空')}
                    </span> : null}
                </span>
                <div>
                    <DatePicker
                        allowClear={false}
                        disabledDate={this.props.disabledDate}
                        onChange={this.onBeginTimeChange}
                        value={rangeObj.startTime}
                    />
                    <span className='date-connect'>
                        <span className='split-line'>—</span>
                    </span>
                    <DatePicker
                        allowClear={false}
                        disabledDate={this.props.disabledDate}
                        onChange={this.onEndTimeChange}
                        value={rangeObj.endTime}
                    />
                    {hasErr ? <span className='err-tip'>{this.state.checkTimeErrMsg}</span> : null}
                </div>
            </div>
        );
    };
}

RangePicker.defaultProps = {
    disabledDate: function () {
    },
    format: '',
    changeRangePicker: function () {
    },
    timeRange: {startTime: '',endTime: ''},
    timeType: ''

};

RangePicker.propTypes = {
    disabledDate: PropTypes.func,
    format: PropTypes.string,
    changeRangePicker: PropTypes.func,
    timeRange: PropTypes.object,
    timeType: ''

};
export default RangePicker;
