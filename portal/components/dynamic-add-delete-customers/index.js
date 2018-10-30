/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/30.
 */
var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/8/15.
 * 动态增删联系人的组件
 */
require('./index.less');
import PropTypes from 'prop-types';
import {emailRegex, qqRegex} from 'PUB_DIR/sources/utils/validate-util';
import PhoneInput from 'CMP_DIR/phone-input';
import classNames from 'classnames';
import {Form, Input, Icon} from 'antd';
const FormItem = Form.Item;
const CONTACT_WAY_PLACEHOLDER = {
    'phone': Intl.get('clue.add.phone.num', '电话号码'),
    'email': Intl.get('clue.add.email.addr', '邮箱地址'),
    'qq': Intl.get('clue.add.qq.num', 'QQ号码'),
    'weChat': Intl.get('clue.add.wechat.num', '微信号码')
};
// 联系方式的label
const CONTACT_WAY_LABEL = {
    phone: Intl.get('common.phone', '电话'),
    qq: 'QQ',
    email: Intl.get('common.email', '邮箱'),
    weChat: Intl.get('crm.58', '微信')
};
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
import {AntcAreaSelection} from 'antc';

class DynamicAddDelCustomers extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customers: [{key: 0}]
        };
    }
    // 删除客户
    handleDelCustomer = (key, index, size) => {
        if (index === 0 && size === 1) return;
        const {form} = this.props;
        let customer_keys = form.getFieldValue('customer_keys');
        // 过滤调要删除客户的key
        customer_keys = _.filter(customer_keys, (item, index) => item !== key);
        form.setFieldsValue({'customer_keys': customer_keys});
        let customers = this.state.customers;
        customers = _.filter(customers, (customer, index) => customer.key !== key);
        this.setState({customers});
        this.props.handleCustomersChange(customers);
    };

    // 添加客户
    handleAddCustomer = () => {
        const {form} = this.props;
        let customer_keys = form.getFieldValue('customer_keys');
        // 客户key数组中最后一个客户的key
        let lastCustomerKey = _.get(customer_keys, `[${customer_keys.length - 1}]`, 0);
        // 新加客户的key
        let addCustomerKey = lastCustomerKey + 1;
        customer_keys.push(addCustomerKey);
        form.setFieldsValue({'customer_keys': customer_keys});
        let customers = this.state.customers;
        customers.push({key: addCustomerKey});
        this.setState({customers});
        this.props.handleCustomersChange(customers);
    };
    customerChoosen = (key, index, selectedCustomer) => {
        const {form} = this.props;
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.name = selectedCustomer.name;
                item.id = selectedCustomer.id;
                item.province = selectedCustomer.province;
                item.city = selectedCustomer.city;
                item.county = selectedCustomer.county;
                item.address = selectedCustomer.address;
                return false;
            }
        });
        this.setState({customers});
        this.props.handleCustomersChange(customers);
        form.validateFields([`customers[${key}].name`], {force: true});
    };
    //更新地址
    updateLocation = (key, addressObj) => {
        const {form} = this.props;
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.province = addressObj.provName || '';
                item.city = addressObj.cityName || '';
                item.county = addressObj.countyName || '';
                return false;
            }
        });
        this.setState({customers});
        this.props.handleCustomersChange(customers);
        // Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('form div .ant-form-item'), '选择地址');
    };
    checkCustomerName = (key, rule, value, callback,) => {
        let customers = this.state.customers;
        let curCustomer = _.find(customers, (item) => {return item.key === key;}) || {};
        if (!curCustomer.name && !curCustomer.hideCustomerRequiredTip) {
            callback(new Error(Intl.get('leave.apply.select.customer', '请先选择客户')));
        } else {
            callback();
        }
    };
    //搜索不到客户的时候，隐藏掉客户必填的错误信息提示
    hideCustomerRequiredTip = (key, index, flag) => {
        const {form} = this.props;
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.hideCustomerRequiredTip = flag;
                return false;
            }
        });
        this.setState({customers});
        this.props.handleCustomersChange(customers);
        form.validateFields([`customers[${key}].name`], {force: true});
    };
    setSelectedAddr = (key, e) => {
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.address = e.target.value;
                return false;
            }
        });
        this.setState({customers});
        this.props.handleCustomersChange(customers);
    };
    setSelectedremarks = (key, e) => {
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.remarks = e.target.value;
                return false;
            }
        });
        this.setState({customers});
        this.props.handleCustomersChange(customers);
    };

    renderDiffCustomers(key, index, customer_keys) {
        var _this = this;
        const size = customer_keys.length;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const delContactCls = classNames('iconfont icon-delete', {
            'disabled': index === 0 && size === 1
        });
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 5},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 18},
            },
        };
        let customers = this.state.customers;
        let curCustomer = _.find(customers, (item) => {return item.key === key;}) || {};
        return (
            <div className="contact-wrap" key={key}>
                <FormItem
                    className="form-item-label customer-name customer-name-item"
                    label={Intl.get('call.record.customer', '客户')}
                    {...formItemLayout}
                >
                    {getFieldDecorator(`customers[${key}].name`, {
                        rules: [{validator: _this.checkCustomerName.bind(this, key)}],
                    })(
                        <CustomerSuggest
                            field={`customers[${key}].name`}
                            hasEditPrivilege={true}
                            displayText={''}
                            displayType={'edit'}
                            id={''}
                            noJumpToCrm={true}
                            customer_name={''}
                            customer_id={''}
                            addAssignedCustomer={this.props.addAssignedCustomer}
                            noDataTip={Intl.get('clue.has.no.data', '暂无')}
                            hideButtonBlock={true}
                            customerChoosen={this.customerChoosen.bind(this, key, index)}
                            required={true}
                            hideCustomerRequiredTip={this.hideCustomerRequiredTip.bind(this, key, index)}
                        />
                    )}
                    <i className={delContactCls} onClick={this.handleDelCustomer.bind(this, key, index, size)}/>
                </FormItem>
                <AntcAreaSelection labelCol="5" wrapperCol="18" width="100%"
                    colon={false}
                    label={Intl.get('crm.96', '地域')}
                    placeholder={Intl.get('crm.address.placeholder', '请选择地域')}
                    provName={curCustomer.province}
                    cityName={curCustomer.city}
                    countyName={curCustomer.county}
                    updateLocation={this.updateLocation.bind(this, key)}
                    areaTabsContainerId={curCustomer.key}
                />
                <FormItem
                    className="form-item-label"
                    label={Intl.get('common.address', '地址')}
                    {...formItemLayout}
                >
                    {getFieldDecorator(`customers[${key}].address`,{initialValue: curCustomer.address })(
                        <Input
                            placeholder={Intl.get('crm.detail.address.placeholder', '请输入详细地址')}
                            onChange={this.setSelectedAddr.bind(this, key)}
                            value={curCustomer.address}
                        />
                    )}
                </FormItem>
                <FormItem
                    className="form-item-label"
                    label={Intl.get('common.remark', '备注')}
                    {...formItemLayout}
                >
                    {getFieldDecorator(`customers[${key}].remarks`)(
                        <Input
                            type="textarea" rows="3"
                            placeholder={Intl.get('leave.apply.fill.leave.reason', '请填写出差事由')}
                            onChange={this.setSelectedremarks.bind(this, key)}
                            value={curCustomer.remarks}
                        />
                    )}
                </FormItem>
            </div>
        );
    }

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        // 控制联系方式增减的key
        getFieldDecorator('customer_keys', {
            initialValue: [0]
        });
        const customer_keys = getFieldValue('customer_keys');
        return (
            <div className="contact-way-container">
                {_.map(customer_keys, (key, index) => {
                    return this.renderDiffCustomers(key, index, customer_keys);
                })}
                <div className="add-contact"
                    onClick={this.handleAddCustomer}>{Intl.get('crm.3', '添加客户')}</div>
            </div>);
    }
}
DynamicAddDelCustomers.propTypes = {
    form: PropTypes.object,
    addAssignedCustomer: PropTypes.func,
    handleCustomersChange: PropTypes.func,
    
};
DynamicAddDelCustomers.defaultProps = {
    form: {},
    addAssignedCustomer: function() {
        
    },
    handleCustomersChange: function() {
        
    }
};
export default Form.create()(DynamicAddDelCustomers);


