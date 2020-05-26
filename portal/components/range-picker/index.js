/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/15.
 */
import React, {useState} from 'react';
import {DatePicker, Form, Input} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;

const FormItem = Form.Item;



class RangePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkTimeErrMsg: ''
        };
    }
    onBeginTimeChange = () => {
       this.props.onBeginTimeChange();
    };
    render = () => {
        return (
            <div className='range-picker-wrap'>
                <DatePicker
                    disabledDate={this.props.disabledDate}
                    showTime={{format: this.props.format }}
                    type='time'
                    format={this.props.format}
                    onChange={this.onBeginTimeChange}
                    value={timeRange.startTime}
                />
                <DatePicker
                    disabledDate={this.props.disabledDate}
                    showTime={{format: this.props.format}}
                    type='time'
                    format={this.props.format}
                    onChange={this.props.onEndTimeChange}
                    value={timeRange.endTime}
                />
                {this.state.checkTimeErrMsg ? <span>{this.state.checkTimeErrMsg}</span> : null}
            </div>
        );
    };
}

RangePicker.defaultProps = {

};

RangePicker.propTypes = {

};
export default RangePicker;
