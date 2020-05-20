/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/23.
 */

import {DatePicker,Form} from 'antd';
const FormItem = Form.Item;

class InputContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: ''
        };
    }
    validatorInput = (rule, value, callback) => {
        if (_.isFunction(_.get(this.props, 'validator'))){
            this.props.validator(rule, value, callback);
        }else{
            callback();
        }
    }
    render = () => {
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

        const {getFieldDecorator} = this.props.form;
        return (
            <FormItem
                label={isTemplate ? '' : _.get(formItem, 'title')}
                id={_.get(formItem, 'formItemKey')}
                {...formItemLayout}
            >
                {
                    getFieldDecorator(_.get(formItem, 'formItemKey') + '.date_time', {
                        initialValue: '',
                        rules: [{
                            required: _.get(formItem, 'is_required'),
                            message: _.get(formItem, 'is_required_errmsg')
                        }, {validator: this.validatorInput}]
                    })(
                        <DatePicker {...this.props}/>
                    )}
            </FormItem>
        );
    }
}

InputContent.defaultProps = {
    select_arr: [],
    type: '',
    placeholder: '',
    component_type: '',
    labelKey: '',
};

InputContent.propTypes = {
    select_arr: PropTypes.array,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    component_type: PropTypes.string,
    labelKey: PropTypes.string,
    form: PropTypes.object,
    validator: PropTypes.func
};
export default InputContent;
