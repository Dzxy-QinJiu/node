/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/23.
 */

import {Input, Select, Radio, Checkbox, Form} from 'antd';
const RadioGroup = Radio.Group;
const CheckboxGroup = Checkbox.Group;
const FormItem = Form.Item;

class InputContent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: ''
        };
    }

    // onSaveAllData = () => {
    //     var submitObj = {};
    //     submitObj[this.props.labelKey + ''] = this.state.inputValue;
    //     return submitObj;
    // };
    // onChangeInputValue = (e) => {
    //    this.setState({
    //        inputValue: e.target.value
    //    });
    // };
    render = () => {
        const formItemLayout = {
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
        const {getFieldDecorator} = this.props.form;
        return (
            <FormItem
                label={_.get(formItem, 'title')}
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
                        <Input {...this.props}/>
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
};
export default InputContent;