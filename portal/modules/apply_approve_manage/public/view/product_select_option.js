/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/5/16.
 */
import {Input, Radio, Checkbox, Form} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
import {ignoreCase} from 'LIB_DIR/utils/selectUtil';
import {formItemLayout, maxFormItemLayout} from 'MOD_DIR/apply_approve_manage/public/utils/apply-approve-utils';
import {formatUsersmanDataList} from 'PUB_DIR/sources/utils/common-method-util';
const FormItem = Form.Item;
import {getAllUserList, getProductList} from 'PUB_DIR/sources/utils/common-data-util';
class SelectOption extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRadioValue: '',
            productList: [],
        };
    }
    componentDidMount() {
        getProductList(productList => {
            //有产品时，直接获取用户列表并展示
            if (_.get(productList, '[0]')) {
                this.setState({
                    productList: productList
                });
            }
        });
    }

    validatorInput = (rule, value, callback) => {
        if (_.isFunction(_.get(this.props, 'validator'))) {
            this.props.validator(rule, value, callback);
        } else {
            callback();
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
        let {usersManList} = this.state;
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
                        <AntcSelect
                            showSearch
                            placeholder={this.props.placeholder}
                            filterOption={(input, option) => ignoreCase(input, option)}
                            onChange={this.props.handleOptionChange}
                        >
                            {_.map(this.state.productList, (item) => {
                                return <Option value={item.id}>{item.name}</Option>;
                            })}
                        </AntcSelect>
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
