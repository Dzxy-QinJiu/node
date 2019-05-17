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
            },
        };
    }

    componentDidMount() {
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
        // this.addLabelRequiredCls();
    };
    onBeginTimeChange = (date) => {
        var formData = this.state.formData;
        formData.begin_time = moment(date).valueOf();
        this.setState({
            formData: formData
        },() => {
            if (formData.begin_type && formData.end_type){
                this.calculateTotalLeaveRange();
            }
        });
        this.props.onBeginTimeChange();
    };
    onBeginTypeChange = (value) => {
        var formData = this.state.formData;
        formData.begin_type = value;
        this.setState({
            formData: formData
        },() => {
            if (formData.end_type){
                this.calculateTotalLeaveRange();
            }
        });
        this.props.onBeginTypeChange();
    };
    onEndTimeChange = () => {
        this.props.onEndTimeChange();
    };
    onEndTypeChange = () => {
        this.props.onEndTypeChange();
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
                    <Select
                        defaultValue= {_.get(formData,'begin_type')}
                        onChange={this.onBeginTypeChange}

                    >
                        {_.isArray(LEAVE_TIME_RANGE) && LEAVE_TIME_RANGE.length ?
                            LEAVE_TIME_RANGE.map((item, idx) => {
                                return (<Option key={idx} value={item.value}>{item.name}</Option>);
                            }) : null
                        }
                    </Select>
                </span>
                <span className="end-container">
                    <DatePicker
                        format="YYYY-MM-DD"
                        defaultValue={moment()}
                        onChange={this.onEndTimeChange}
                    />
                    <Select
                        defaultValue= {_.get(formData,'end_type')}
                        onChange={this.onEndTypeChange}

                    >
                        {_.isArray(LEAVE_TIME_RANGE) && LEAVE_TIME_RANGE.length ?
                            LEAVE_TIME_RANGE.map((item, idx) => {
                                return (<Option key={idx} value={item.value}>{item.name}</Option>);
                            }) : null
                        }
                    </Select>
                </span>


            </div>
        );
    }
}

TimePeriod.defaultProps = {
    placeholder: '',
    selectedArr: [],
    onBeginTimeChange: function() {

    },
    onBeginTypeChange: function() {

    },
    onEndTimeChange: function() {

    },
    onEndTypeChange: function() {

    }
};

TimePeriod.propTypes = {
    placeholder: PropTypes.string,
    selectedArr: PropTypes.array,
    onBeginTimeChange: PropTypes.func,
    onBeginTypeChange: PropTypes.func,
    onEndTimeChange: PropTypes.func,
    onEndTypeChange: PropTypes.func,
};
export default TimePeriod;