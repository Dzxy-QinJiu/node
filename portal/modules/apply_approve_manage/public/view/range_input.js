/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/15.
 */
import React, {useState} from 'react';
import {Form, Input, Select} from 'antd';

const FormItem = Form.Item;

const {Option} = Select;


class RangeInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    checkRangeInput = (rule, value,callback) => {
        if (_.isFunction(_.get(this.props, 'validator'))){
            this.props.validator(rule, value, callback);
        }else{
            callback();
        }

    };
    render = () => {
        var selectArr = this.props.default_value;
        const {getFieldDecorator} = this.props.form;
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
        var formItem = this.props;
        var isTemplate = _.get(formItem, 'componentTemple');
        if (isTemplate) {
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
            <FormItem
                label={isTemplate ? '' : _.get(formItem, 'title')}
                id={_.get(formItem, 'formItemKey')}
                {...formItemLayout}
                className="range-input-container"
            >
                {
                    getFieldDecorator(_.get(formItem, 'formItemKey'), {
                        initialValue: '',
                        rules: [{
                            required: _.get(formItem, 'is_required'),
                            message: _.get(formItem, 'is_required_errmsg')
                        }, {validator: this.checkRangeInput}]
                    })(
                        <span>
                            <Input type='number' min={1} placeholder={this.props.placeholder} onChange={this.props.onChangeInput}/>
                            <Select onChange={this.props.onChangeSelect} defaultValue={_.get(selectArr, '[0].value')}>
                                {_.map(selectArr, (item, index) => {
                                    if (_.isString(item)) {
                                        item = JSON.parse(item);
                                    }
                                    return (<Option key={index} value={item.value}>{item.label}</Option>);
                                })}
                            </Select>
                        </span>
                    )}
            </FormItem>
        );
    };
}

RangeInput.defaultProps = {
    placeholder: '',
    default_value: [],
    onChangeSelect: function() {

    },
    onChangeInput: function() {

    }
};

RangeInput.propTypes = {
    placeholder: PropTypes.string,
    'default_value': PropTypes.array,
    onChangeSelect: PropTypes.func,
    onChangeInput: PropTypes.func,
    form: PropTypes.object,
};
export default RangeInput;
