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
import classNames from 'classnames';
import {Form, Input,DatePicker} from 'antd';
const FormItem = Form.Item;
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
import {AntcAreaSelection} from 'antc';

class DynamicAddDelCustomers extends React.Component {
    constructor(props) {
        super(props);
        var timeRange = this.getInitialTimeRange();
        this.state = {
            customers: [{key: 0, visit_start_time: timeRange.startTime,visit_end_time: timeRange.endTime}]
        };
    }
    getInitialTimeRange = () => {
        var startTime = this.props.initial_visit_start_time || moment().valueOf();
        var endTime = this.props.initial_visit_end_time || moment().valueOf();
        return {
            startTime: startTime,
            endTime: endTime
        };
    };
    componentWillReceiveProps(nextProps) {
        if (nextProps.initial_visit_start_time && nextProps.initial_visit_start_time !== this.props.initial_visit_start_time){
            _.forEach(this.state.customers, (customerItem) => {
                customerItem.visit_start_time = nextProps.initial_visit_start_time;
            });
        }
        if (nextProps.initial_visit_end_time && nextProps.initial_visit_end_time !== this.props.initial_visit_end_time){
            _.forEach(this.state.customers, (customerItem) => {
                customerItem.visit_end_time = nextProps.initial_visit_end_time;
            });
        }
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
        let timeRange = this.getInitialTimeRange();
        customers.push({key: addCustomerKey,visit_start_time: timeRange.startTime,visit_end_time: timeRange.endTime});
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
    onVisitBeginTimeChange = (key, startValue) => {
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.visit_start_time = startValue ? startValue.valueOf() : '';
                return false;
            }
        });
        this.setState({customers});
        this.props.handleCustomersChange(customers);
    };
    onVisitEndTimeChange = (key, endValue) => {
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.visit_end_time = endValue ? endValue.valueOf() : '';
                return false;
            }
        });
        this.setState({customers});
        this.props.handleCustomersChange(customers);
    };
    disabledStartDate = (key,startValue) => {
        if (!startValue) {
            return false;
        }
        return startValue.valueOf() < moment(this.props.initial_visit_start_time).startOf('day').valueOf() || startValue.valueOf() > moment(this.props.initial_visit_end_time).endOf('day').valueOf();
    };
    disabledEndDate = (key,endValue) => {

        if (!endValue) {
            return false;
        }
        return (endValue.valueOf() < moment(this.props.initial_visit_start_time).startOf('day').valueOf() || endValue.valueOf() > moment(this.props.initial_visit_end_time).endOf('day').valueOf());
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
                sm: {span: 17},
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
                <FormItem
                    className="form-item-label visit-end-time"
                    label={Intl.get('bussiness.trip.time.range', '拜访时间')}
                    {...formItemLayout}
                >
                    {getFieldDecorator(`customers[${key}].visit_start_time`,{
                        initialValue: moment(curCustomer.visit_start_time) })(
                        <DatePicker
                            disabledDate={this.disabledStartDate.bind(this, key)}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={curCustomer.visit_start_time ? moment(curCustomer.visit_start_time) : moment()}
                            placeholder={Intl.get('leave.apply.fill.in.start.time','请填写开始时间')}
                            onChange={this.onVisitBeginTimeChange.bind(this, key)}
                            // onOpenChange={this.handleStartOpenChange}
                        />

                    )}
                    {getFieldDecorator(`customers[${key}].visit_end_time`,{
                        initialValue: moment(curCustomer.visit_end_time) })(
                        <DatePicker
                            disabledDate={this.disabledEndDate.bind(this,key)}
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={curCustomer.visit_end_time ? moment(curCustomer.visit_end_time) : moment()}
                            placeholder={Intl.get('leave.apply.fill.in.end.time', '请填写结束时间')}
                            onChange={this.onVisitEndTimeChange.bind(this, key)}
                            // open={endOpen}
                            // onOpenChange={this.handleEndOpenChange}
                        />
                    )}
                </FormItem>
                {_.get(this, 'state.customers.length') === 1 ?
                    <div>
                        <AntcAreaSelection labelCol="5" wrapperCol="17" width="100%"
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
                    </div>
                    : null}
                <FormItem
                    className="form-item-label"
                    label={Intl.get('common.remark', '备注')}
                    {...formItemLayout}
                >
                    {getFieldDecorator(`customers[${key}].remarks`)(
                        <Input
                            type="textarea" rows="3"
                            placeholder={Intl.get('leave.apply.fill.leave.reason', '请填写预期目标')}
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
                <div className="customer-warp">
                    {_.map(customer_keys, (key, index) => {
                        return this.renderDiffCustomers(key, index, customer_keys);
                    })}
                </div>
                <div className="add-customer"
                    onClick={this.handleAddCustomer}>{Intl.get('crm.3', '添加客户')}</div>
            </div>);
    }
}
DynamicAddDelCustomers.propTypes = {
    form: PropTypes.object,
    addAssignedCustomer: PropTypes.func,
    handleCustomersChange: PropTypes.func,
    initial_visit_start_time: PropTypes.string,
    initial_visit_end_time: PropTypes.string,
};
DynamicAddDelCustomers.defaultProps = {
    form: {},
    addAssignedCustomer: function() {
        
    },
    handleCustomersChange: function() {
        
    },
    initial_visit_start_time: '',
    initial_visit_end_time: '',

};
export default Form.create()(DynamicAddDelCustomers);


