/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/16.
 */
import {Input, Select, Radio, Checkbox, Form} from 'antd';
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
import {formItemLayout, maxFormItemLayout} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';

const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

class SelectOption extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRadioValue: ''
        };
    }

    renderRadioGroup = () => {
        var selectArr = this.props.select_arr;
        return (
            <RadioGroup onChange={this.handleRadioChange}>
                {_.map(selectArr, (item) => {
                    return (<Radio value={item}>{item}</Radio>);
                })}
            </RadioGroup>
        );
    };
    componentWillReceiveProps(nextProps) {
        if(!_.isEqual(nextProps.selectOptionValue,this.props.selectOptionValue) && !nextProps.selectOptionValue){
            var formItem = this.props;
            this.props.form.resetFields([_.get(formItem, 'formItemKey')]);
        }
    }
    handleRadioChange = (e) => {
        this.setState({
            selectedRadioValue: e.target.value
        });
    };
    renderCheckGroup = () => {
        var selectArr = this.props.select_arr;
        return <CheckboxGroup options={selectArr}/>;
    };
    renderOptionGroup = () => {
        var selectArr = this.props.select_arr;
        return (
            <Select
                showSearch
                placeholder={this.props.placeholder}
                filterOption={(input, option) => ignoreCase(input, option)}
                onChange={this.props.handleOptionChange}
                value={this.props.selectOptionValue}
            >
                {_.map(selectArr, (item) => {
                    return <Option value={item.value}>{item.name}</Option>;
                })}
            </Select>
        );
    };
    onSaveAllData = () => {
        if (this.props.type === 'radio') {
            var submitObj = {}, label = this.props.labelKey;
            submitObj[label + ''] = this.state.selectedRadioValue;
            return submitObj;
        }
    };
    validatorInput = (rule, value, callback) => {
        if (_.isFunction(_.get(this.props, 'validator'))) {
            this.props.validator(rule, value, callback);
        } else {
            callback();
        }
    };
    renderComponentContent = () => {
        if (this.props.type === 'radio') {
            return this.renderRadioGroup();
        } else if (this.props.type === 'checkbox') {
            return this.renderCheckGroup();
        } else if (this.props.type === 'option') {
            return this.renderOptionGroup();
        } else {
            return null;
        }
    };

    render = () => {
        var formItemLayout = { labelCol: {
            xs: {span: 24},
            sm: {span: 6},
        },
        wrapperCol: {
            xs: {span: 24},
            sm: {span: 18},
        }};
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
        const {getFieldDecorator} = this.props.form;
        return (
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
                        }, {validator: this.validatorInput}]
                    })(
                        this.renderComponentContent()
                    )}
            </FormItem>
        );
    };
}

SelectOption.defaultProps = {
    select_arr: [],
    type: '',
    placeholder: '',
    component_type: '',
    labelKey: '',
    selectOptionValue: '',
    handleOptionChange: function() {
        
    }
};

SelectOption.propTypes = {
    select_arr: PropTypes.array,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    component_type: PropTypes.string,
    labelKey: PropTypes.string,
    form: PropTypes.object,
    validator: PropTypes.func,
    selectOptionValue: PropTypes.string,
    handleOptionChange: PropTypes.func,
};
export default SelectOption;