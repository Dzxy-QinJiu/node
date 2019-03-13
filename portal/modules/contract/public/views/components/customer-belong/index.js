/** Created by 2019-03-12 15:42 */
// 所属客户可添加多个
import React, { Component } from 'react';
import './index.less';
import { Select, Icon, Form } from 'antd';
const FormItem = Form.Item;
import customerAjax from 'MOD_DIR/common/public/ajax/customer';

let queryCustomerTimeout = null;

class CustomerBelong extends Component {
    constructor(props) {
        super(props);

        let customers = _.cloneDeep(props.customers);
        //所属客户是否是选择的，以数组的形式记录了各个所属客户在输入后是否经过了点击选择的过程
        let belongCustomerIsChoosen = [];
        if (!_.isArray(customers) || !customers.length) {
            customers = [{}];
        } else {
            //编辑已有所属客户时，将选中状态都设为true
            belongCustomerIsChoosen = _.map(customers, customer => true);
        }

        this.state = {
            customers,
            belongCustomerErrMsg: [''],
            queryCustomerList: [],
            customerList: [],
            belongCustomerIsChoosen
        };
    }

    static defaultProps = {
        // 所属客户
        customers: [{}],
    };

    componentWillUnmount() {
        if (queryCustomerTimeout) {
            clearTimeout(queryCustomerTimeout);
        }
    }

    // 过滤重复客户
    getCustomerList(list = []) {
        let {customers, queryCustomerList} = this.state;
        let queryList = list.length > 0 ? list : queryCustomerList;
        // 在这里去掉重复的客户
        const customersIds = _.map(customers, 'customer_id');
        return _.filter(queryList, customer => _.indexOf(customersIds, customer.customer_id) === -1);
    }
    deleteBelongCustomer(index) {
        let { customers, belongCustomerErrMsg, belongCustomerIsChoosen} = this.state;

        customers.splice(index, 1);
        belongCustomerErrMsg.splice(index, 1);
        belongCustomerIsChoosen.splice(index, 1);
        // 在这里去掉重复的客户
        const customerLists = this.getCustomerList();
        // 清除form数据，以免缓存
        this.props.form.resetFields();
        this.setState({
            customers,
            customerList: customerLists,
            belongCustomerErrMsg,
            belongCustomerIsChoosen
        });
    }
    addBelongCustomer = () => {
        let { customers, belongCustomerErrMsg, belongCustomerIsChoosen} = this.state;

        // 在这里去掉重复的客户
        const customerLists = this.getCustomerList();

        customers.push({});
        belongCustomerErrMsg.push('');
        belongCustomerIsChoosen.push(false);
        this.setState({
            customers,
            customerList: customerLists,
            belongCustomerErrMsg,
            belongCustomerIsChoosen
        });
    };
    // 查询客户
    queryCustomer(index, keyword) {
        const fieldName = 'belong_customer' + index;

        let stateObj = {
            customers: this.state.customers,
            belongCustomerIsChoosen: this.state.belongCustomerIsChoosen,
        };

        //更新输入框内容
        stateObj.customers[index].customer_name = keyword;

        //将客户状态设为未选择
        stateObj.belongCustomerIsChoosen[index] = false;

        this.setState(stateObj);

        if (queryCustomerTimeout) {
            clearTimeout(queryCustomerTimeout);
        }

        queryCustomerTimeout = setTimeout(() => {
            customerAjax.getCustomerSuggestListAjax().sendRequest({
                q: keyword
            }).success(list => {
                // 在这里去掉重复的客户
                // 在这里去掉重复的客户
                const customerList = this.getCustomerList(list);

                let newState = {
                    customerList,
                    queryCustomerList: list,
                    belongCustomerErrMsg: _.clone(this.state.belongCustomerErrMsg),
                };

                if (_.isArray(customerList) && customerList.length) {
                    newState.belongCustomerErrMsg[index] = '';
                } else {
                    newState.belongCustomerErrMsg[index] = Intl.get('contract.177', '没有找到符合条件的客户，请更换关键词查询');
                }
                this.setState(newState, () => {
                    this.props.form.validateFields([fieldName], {force: true});
                });
            }).error(() => {
                let newState = {
                    belongCustomerErrMsg: _.clone(this.state.belongCustomerErrMsg),
                };

                newState.belongCustomerErrMsg[index] = Intl.get('errorcode.61', '获取客户列表失败');

                this.setState(newState, () => {
                    this.props.form.validateFields([fieldName], {force: true});
                });
            });
        }, 500);
    }
    // 客户选择触发事件
    onCustomerChoosen(index, value) {
        let { customers, belongCustomerIsChoosen} = this.state;
        const fieldName = 'belong_customer' + index;

        let belongCustomer = customers[index];
        const selectedCustomer = _.find(this.state.customerList, customer => customer.customer_id === value);

        belongCustomer.customer_id = selectedCustomer.customer_id;
        belongCustomer.customer_name = selectedCustomer.customer_name;
        belongCustomer.customer_sales_id = selectedCustomer.sales_id;
        belongCustomer.customer_sales_name = selectedCustomer.sales_name;
        belongCustomer.customer_sales_team_id = selectedCustomer.sales_team_id;
        belongCustomer.customer_sales_team_name = selectedCustomer.sales_team_name;

        customers[index] = belongCustomer;

        // 在这里去掉重复的客户
        const customerLists = this.getCustomerList();

        belongCustomerIsChoosen[index] = true;
        this.setState({
            customers,
            customerList: customerLists,
            belongCustomerIsChoosen
        }, () => {
            //用暂存的表单数据更新一下验证后的表单数据
            //以解决选中了客户时在输入框里显示的是客户id而非客户名的问题
            this.props.form.setFieldsValue({
                [fieldName]: belongCustomer.customer_name
            });
        });
    }
    // 获取客户列表
    getCustomerOptions() {
        return this.state.customerList.map((customer, index) => {
            return <Option key={index} value={customer.customer_id}>{customer.customer_name}</Option>;
        });
    }
    //获取所属客户验证规则
    getBelongCustomerValidateRules(index) {
        return {
            validator: (rule, value, callback) => {
                if (this.state.belongCustomerErrMsg[index]) {
                    callback(this.state.belongCustomerErrMsg[index]);
                } else {
                    if (this.state.belongCustomerIsChoosen[index]) {
                        callback();
                    } else {
                        callback(Intl.get('contract.176', '请选择所属客户'));
                    }
                }
            }
        };
    }
    // 对外提供的验证方法，通过回调函数返回所选客户数据
    validate(cb) {
        this.props.form.validateFields((err,value) => {
            if(err) return false;
            let customers = _.filter(this.state.customers, customer => {
                return !_.isEmpty(customer);
            });
            _.isFunction(cb) && cb(_.cloneDeep(customers));
        });
    }

    render() {
        const customers = this.state.customers;
        let itemSize = _.get(customers, 'length');
        const {getFieldDecorator} = this.props.form;

        return (
            <div className="belong-customer">
                <div className="belong-customer-form clearfix">
                    {customers.map((customer, index) => {
                        const fieldName = 'belong_customer' + index;
                        // 展示删除按钮， customers数组长度不为1时展示
                        const isShowDeleteBtn = itemSize !== 1;
                        return (
                            <FormItem
                                key={index}
                                className='belong-customer-item'

                            >
                                {getFieldDecorator(fieldName, {
                                    initialValue: customer.customer_name,
                                    rules: [this.getBelongCustomerValidateRules(index)],
                                })(
                                    <Select
                                        combobox
                                        filterOption={false}
                                        placeholder={Intl.get('customer.search.by.customer.name', '请输入客户名称搜索')}
                                        onSearch={this.queryCustomer.bind(this, index)}
                                        onSelect={this.onCustomerChoosen.bind(this, index)}
                                    >
                                        {this.getCustomerOptions()}
                                    </Select>
                                )}
                                {isShowDeleteBtn ? (
                                    <div className="circle-button circle-button-minus"
                                        title={Intl.get('common.delete', '删除')}
                                        onClick={this.deleteBelongCustomer.bind(this, index)}>
                                        <Icon type="minus"/>
                                    </div>
                                ) : null}
                            </FormItem>
                        );
                    })}
                    <div className="circle-button circle-button-plus"
                        title={Intl.get('common.add', '添加')}
                        onClick={this.addBelongCustomer}>
                        <Icon type="plus"/>
                    </div>
                </div>
            </div>
        );
    }
}

CustomerBelong.propTypes = {
    form: PropTypes.object,
    customers: PropTypes.array
};

export default Form.create()(CustomerBelong);