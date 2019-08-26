/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/17.
 */
import {Input, Select, DatePicker} from 'antd';
const Option = Select.Option;
import classNames from 'classnames';
import {DELAY_TIME_RANGE, LEAVE_TIME_RANGE, AM_AND_PM} from 'PUB_DIR/sources/utils/consts';
import {calculateTotalTimeRange, calculateRangeType} from 'PUB_DIR/sources/utils/common-data-util';
require('../style/time_period.less');
require('../style/index.less');
class TimePeriod extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            formData: {
                begin_time: moment().valueOf(),//请假开始时间
                begin_type: '',//请假开始的类型
                end_time: moment().valueOf(),//请假结束时间
                end_type: '',//请假结束的类型
                total_range: '',//总的请假时长
                err_tip: '',//校验出错后的提示
            },
        };
    }

    componentWillMount() {
        var newSetting = calculateRangeType();
        var formData = this.state.formData;
        for (var key in newSetting) {
            formData[key] = newSetting[key];
        }
        this.updateFormData(formData);
    }

    calculateTotalLeaveRange = () => {
        var formData = this.state.formData;
        formData.total_range = calculateTotalTimeRange(formData);
        this.setState({
            formData: formData
        });
    };
    updateFormData = (formData) => {
        this.setState({
            formData: formData
        }, () => {
            this.calculateTotalLeaveRange();
        });
    };

    onBeginTimeChange = (date) => {
        var formData = this.state.formData;
        formData.begin_time = moment(date).valueOf();
        this.setState({
            formData: formData
        }, () => {
            if (this.checkAllTimeExist()) {
                this.validateStartAndEndTime(() => {
                    //必须是正确格式才能计算
                    this.calculateTotalLeaveRange();
                });
            }
        });
        // this.props.onBeginTimeChange();
    };
    checkAllTimeExist =() => {
        const formData = this.state.formData;
        return formData.begin_type && formData.end_type && formData.begin_time && formData.end_time;
    };
    // 验证起始时间是否小于结束时间
    validateStartAndEndTime(callback) {
        const formData = this.state.formData;
        const begin_time = formData.begin_time;
        const endTime = formData.end_time;
        if (this.checkAllTimeExist()) {
            if (moment(endTime).isBefore(begin_time)) {
                formData.err_tip = Intl.get('contract.start.time.greater.than.end.time.warning', '起始时间不能大于结束时间');
            } else if (moment(endTime).isSame(begin_time, 'day') && formData.begin_type === AM_AND_PM.PM && formData.end_type === AM_AND_PM.AM) {
                //是同一天的时候，不能开始时间选下午，结束时间选上午
                formData.err_tip = Intl.get('contract.start.time.greater.than.end.time.warning', '起始时间不能大于结束时间');
            }else{
                callback();
            }

        }
        this.setState({formData});

    }

    onBeginTypeChange = (value) => {
        var formData = this.state.formData;
        formData.begin_type = value;
        this.setState({
            formData: formData
        }, () => {
            if (this.checkAllTimeExist()) {
                this.validateStartAndEndTime(() => {
                    //必须是正确格式才能计算
                    this.calculateTotalLeaveRange();
                });
            }
        });
        this.props.onBeginTypeChange();
    };
    onEndTimeChange = (date) => {
        var formData = this.state.formData;
        formData.end_time = moment(date).valueOf();
        this.setState({
            formData: formData
        }, () => {
            if (this.checkAllTimeExist()) {
                this.validateStartAndEndTime(() => {
                    //必须是正确格式才能计算
                    this.calculateTotalLeaveRange();
                });
            }
        });

    };
    onEndTypeChange = (value) => {
        var formData = this.state.formData;
        formData.end_type = value;
        this.setState({
            formData: formData
        }, () => {
            if (this.checkAllTimeExist()) {
                this.validateStartAndEndTime(() => {
                    //必须是正确格式才能计算
                    this.calculateTotalLeaveRange();
                });
            }
        });
        this.props.onEndTypeChange();
    };
    onSaveAllData = () => {
        var formData = this.state.formData;
        var submitObj = {}, label = this.props.labelKey;
        if (_.get(formData, 'selected_value') === '0.5day'){
            submitObj[label + ''] = {
                starttime: moment(formData.begin_time).format(oplateConsts.DATE_FORMAT) + `_${formData.begin_type}`,
                endtime: moment(formData.end_time).format(oplateConsts.DATE_FORMAT) + `_${formData.end_type}`,
                condition: {'condition': parseInt(formData.total_range)}
            };
        }else{
            submitObj[label + ''] = {
                starttime: moment(formData.begin_time).startOf('day').valueOf(),
                endtime: moment(formData.end_time).endOf('day').valueOf(),
            };
        }

        return submitObj;
    };


    render = () => {
        var formData = this.state.formData;
        return (
            <div className="time-period-container">
                <span className="begin-container">
                    <DatePicker
                        format="YYYY-MM-DD"
                        defaultValue={moment()}
                        onChange={this.onBeginTimeChange}
                    />
                    {_.get(formData, 'selected_value') === '0.5day' ? <Select
                        defaultValue={_.get(formData, 'begin_type')}
                        onChange={this.onBeginTypeChange}

                    >
                        {_.isArray(LEAVE_TIME_RANGE) && LEAVE_TIME_RANGE.length ?
                            LEAVE_TIME_RANGE.map((item, idx) => {
                                return (<Option key={idx} value={item.value}>{item.name}</Option>);
                            }) : null
                        }
                    </Select> : null}

                </span>
                <span className="split-line">
                     ——
                </span>
                <span className="end-container">
                    <DatePicker
                        format="YYYY-MM-DD"
                        defaultValue={moment()}
                        onChange={this.onEndTimeChange}
                    />
                    {_.get(formData, 'selected_value') === '0.5day' ? <Select
                        defaultValue={_.get(formData, 'end_type')}
                        onChange={this.onEndTypeChange}

                    >
                        {_.isArray(LEAVE_TIME_RANGE) && LEAVE_TIME_RANGE.length ?
                            LEAVE_TIME_RANGE.map((item, idx) => {
                                return (<Option key={idx} value={item.value}>{item.name}</Option>);
                            }) : null
                        }
                    </Select> : null}

                </span>
                {/*<span className="total-range-container">*/}
                {/*{_.get(formData, 'total_range') ? Intl.get('apply.approve.total.days', '共{X}天', {X: _.get(formData, 'total_range')}) : null}*/}
                {/*</span>*/}
                {_.get(formData,'err_tip') ? <span>{_.get(formData,'err_tip')}</span> : null}
            </div>
        );
    }
}

TimePeriod.defaultProps = {
    selected_value: '',
    placeholder: '',
    default_value: [],
    onBeginTimeChange: function() {

    },
    onBeginTypeChange: function() {

    },
    onEndTimeChange: function() {

    },
    onEndTypeChange: function() {

    },
    onSaveAllData: function() {

    },
    component_type: '',
    labelKey: ''
};

TimePeriod.propTypes = {
    component_type: PropTypes.string,
    labelKey: PropTypes.string,
    selected_value: PropTypes.string,
    placeholder: PropTypes.string,
    default_value: PropTypes.array,
    onBeginTimeChange: PropTypes.func,
    onBeginTypeChange: PropTypes.func,
    onEndTimeChange: PropTypes.func,
    onEndTypeChange: PropTypes.func,
    onSaveAllData: PropTypes.func,
};
export default TimePeriod;