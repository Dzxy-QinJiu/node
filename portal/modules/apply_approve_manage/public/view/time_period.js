/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/17.
 */
import {Input, DatePicker, Form, Row, Col} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const FormItem = Form.Item;
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

    onBeginTimeChange = (key,date) => {
        var formData = this.state.formData;
        formData.begin_time = moment(date).valueOf();
        this.setState({
            formData: formData
        }, () => {
            if (this.props.form.getFieldValue(key)) {
                this.props.form.validateFields([key], {force: true});
            }
        });
        // this.props.onBeginTimeChange();
    };
    checkAllTimeExist = () => {
        const formData = this.state.formData;
        return formData.begin_type && formData.end_type && formData.begin_time && formData.end_time;
    };
    // 验证起始时间是否小于结束时间
    validateStartAndEndTime(timeType) {
        return (rule, value, callback) => {
            // 如果没有值，则没有错误
            if (!value) {
                callback();
                return;
            }
            const formData = this.state.formData;
            const begin_time = formData.begin_time;
            const endTime = formData.end_time;
            const isBeginTime = timeType === 'begin_time' ? true : false;
            if (endTime && begin_time) {
                if (formData.begin_type && formData.end_type){
                    if (moment(endTime).isBefore(begin_time)) {
                        if (isBeginTime) {
                            callback(Intl.get('contract.start.time.greater.than.end.time.warning', '起始时间不能大于结束时间'));
                        } else {
                            callback(Intl.get('contract.end.time.less.than.start.time.warning', '结束时间不能小于起始时间'));
                        }
                    }else if (moment(endTime).isSame(begin_time,'day') && formData.begin_type === AM_AND_PM.PM && formData.end_type === AM_AND_PM.AM){
                        //是同一天的时候，不能开始时间选下午，结束时间选上午
                        callback(Intl.get('contract.start.time.greater.than.end.time.warning', '起始时间不能大于结束时间'));
                    }else{
                        callback();
                    }
                }else{
                    callback();
                }
            } else {
                callback();
            }
        };
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
    onEndTimeChange = (key,date) => {
        var formData = this.state.formData;
        formData.end_time = moment(date).valueOf();
        this.setState({
            formData: formData
        }, () => {
            if (this.props.form.getFieldValue(key)) {
                this.props.form.validateFields([key], {force: true});
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
        if (_.get(formData, 'selected_value') === '0.5day') {
            submitObj[label + ''] = {
                starttime: moment(formData.begin_time).format(oplateConsts.DATE_FORMAT) + `_${formData.begin_type}`,
                endtime: moment(formData.end_time).format(oplateConsts.DATE_FORMAT) + `_${formData.end_type}`,
                condition: {'condition': parseInt(formData.total_range)}
            };
        } else {
            submitObj[label + ''] = {
                starttime: moment(formData.begin_time).startOf('day').valueOf(),
                endtime: moment(formData.end_time).endOf('day').valueOf(),
            };
        }

        return submitObj;
    };
    disabledDate = (current) => {
        //不允许选择大于当前的时刻
        return !this.props.isBeforeTodayAble ? current && current.valueOf() < moment().startOf('day') : null;
    };

    render = () => {
        var formData = this.state.formData;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        var _this = this;
        var formItem = this.props;
        var formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 6},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };
        var isTemplate = _.get(formItem,'componentTemple');
        if (isTemplate){
            formItemLayout = {
                labelCol: {
                    xs: {span: 0},
                    sm: {span: 0},
                },
                wrapperCol: {
                    xs: {span: 24},
                    sm: {span: 24},
                },
            };
        }
        return (
            <div className="time-period-container">
                <FormItem
                    label={isTemplate ? '' : _.get(formItem, 'title')}
                    id={_.get(formItem, 'formItemKey')}
                    {...formItemLayout}
                >
                    {
                        getFieldDecorator(_.get(formItem, 'formItemKey'), {
                            initialValue: '',
                            rules: [{
                                required: _.get(formItem, 'is_required'),
                                message: _.get(formItem, 'is_required_errmsg')
                            }],
                        })(
                            <Row>
                                <Col span={isTemplate ? 8 : 12}>
                                    <FormItem
                                        className="form-item-label add-apply-time"
                                    >
                                        {getFieldDecorator(_.get(formItem, 'formItemKey') + '.begin_time', {
                                            rules: [{
                                                required: true,
                                                message: Intl.get('leave.apply.fill.in.start.time','请填写开始时间')
                                            }, {validator: _this.validateStartAndEndTime('begin_time')}],
                                            initialValue: moment(formData.begin_time)
                                        })(
                                            <DatePicker
                                                format="YYYY-MM-DD"
                                                onChange={this.onBeginTimeChange.bind(this, _.get(formItem, 'formItemKey') + '.begin_time')}
                                                value={formData.begin_time ? moment(formData.begin_time) : moment()}
                                                disabledDate={this.disabledDate}
                                            />
                                        )}
                                        {getFieldDecorator(_.get(formItem, 'formItemKey') + '.begin_type',{
                                            initialValue: 'AM'
                                        })(
                                            _.get(formItem, 'selected_value') === '0.5day' ?
                                                <AntcSelect
                                                    onChange={this.onBeginTypeChange}

                                                >
                                                    {_.isArray(LEAVE_TIME_RANGE) && LEAVE_TIME_RANGE.length ?
                                                        LEAVE_TIME_RANGE.map((leaveItem, idx) => {
                                                            return (<Option key={idx} value={leaveItem.value}>{leaveItem.name}</Option>);
                                                        }) : null
                                                    }
                                                </AntcSelect>
                                                : null

                                        )}
                                    </FormItem>
                                </Col>
                                {isTemplate ? <Col span={2}>
                                    <span className="split-line">
                     ——
                                    </span></Col> : null}

                                <Col span={isTemplate ? 8 : 12}>
                                    <FormItem
                                        className="form-item-label add-apply-time"
                                    >
                                        {getFieldDecorator(_.get(formItem, 'formItemKey') + '.end_time', {
                                            rules: [{
                                                required: true,
                                                message: Intl.get('leave.apply.fill.in.end.time', '请填写结束时间')
                                            }, {validator: _this.validateStartAndEndTime('end_time')}],
                                            initialValue: moment(formData.end_time),
                                            validateTrigger: 'onBlur'
                                        })(
                                            <DatePicker
                                                format="YYYY-MM-DD"
                                                onChange={this.onEndTimeChange.bind(this, _.get(formItem, 'formItemKey') + '.end_time')}
                                                value={formData.end_time ? moment(formData.end_time) : moment()}
                                                disabledDate={this.disabledDate}
                                            />
                                        )}

                                        {getFieldDecorator(_.get(formItem, 'formItemKey') + '.end_type',{initialValue: 'PM'})(
                                            _.get(formItem, 'selected_value') === '0.5day' ?
                                                <AntcSelect
                                                    onChange={this.onEndTypeChange}

                                                >
                                                    {_.isArray(LEAVE_TIME_RANGE) && LEAVE_TIME_RANGE.length ?
                                                        LEAVE_TIME_RANGE.map((leaveItem, idx) => {
                                                            return (<Option key={idx} value={leaveItem.value}>{leaveItem.name}</Option>);
                                                        }) : null
                                                    }
                                                </AntcSelect> : null

                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        )}
                </FormItem>





                {/*<span className="total-range-container">*/}
                {/*{_.get(formData, 'total_range') ? Intl.get('apply.approve.total.days', '共{X}天', {X: _.get(formData, 'total_range')}) : null}*/}
                {/*</span>*/}
                {_.get(formData, 'err_tip') ? <span>{_.get(formData, 'err_tip')}</span> : null}
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
    labelKey: '',
    isBeforeTodayAble: true,
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
    form: PropTypes.object,
    isBeforeTodayAble: PropTypes.bool,//是否可用选中今天之前的时间
};
export default TimePeriod;
