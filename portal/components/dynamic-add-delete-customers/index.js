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
import {Form, Input,DatePicker, Select} from 'antd';
const FormItem = Form.Item;
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
import {AntcAreaSelection} from 'antc';
import {LEAVE_TIME_RANGE,AM_AND_PM} from 'PUB_DIR/sources/utils/consts';
import {disabledDate} from 'PUB_DIR/sources/utils/common-method-util';

class DynamicAddDelCustomers extends React.Component {
    constructor(props) {
        super(props);
        var timeRange = this.getInitialTimeRange();
        this.state = {
            customers: [{...timeRange,key: 0}]
        };
    }
    getInitialTimeRange = () => {
        var visit_start_time = this.props.initialVisitStartTime || moment().valueOf();
        var visit_start_type = this.props.initial_visit_start_type || AM_AND_PM.AM;
        var visit_end_time = this.props.initialVisitEndTime || moment().valueOf();
        var visit_end_type = this.props.initial_visit_end_type || AM_AND_PM.PM;
        var start_type_select = this.calculateSelectType(visit_start_time);
        var end_type_select = this.calculateSelectType(visit_end_time);
        return {
            visit_start_time: visit_start_time,//拜访开始时间
            visit_end_time: visit_end_time,//拜访结束时间
            visit_start_type: visit_start_type,//拜访开始的类型（上午还是下午）
            visit_end_type: visit_end_type,//拜访结束的类型（上午还是下午）
            start_type_select: start_type_select,//拜访开始类型的下拉选项
            end_type_select: end_type_select,//拜访结束类型的下拉选项
        };
    };
    componentWillReceiveProps(nextProps) {
        var customers = this.state.customers;
        if (nextProps.initialVisitStartTime && nextProps.initialVisitStartTime !== this.props.initialVisitStartTime){
            _.forEach(customers, (customerItem) => {
                customerItem.visit_start_time = nextProps.initialVisitStartTime;
                customerItem.start_type_select = this.calculateSelectType(customerItem.visit_start_time, nextProps);
            });
        }
        if (nextProps.initialVisitEndTime && nextProps.initialVisitEndTime !== this.props.initialVisitEndTime){
            _.forEach(customers, (customerItem) => {
                customerItem.visit_end_time = nextProps.initialVisitEndTime;
                customerItem.end_type_select = this.calculateSelectType(customerItem.visit_end_time, nextProps);
            });
        }
        if (nextProps.initial_visit_start_type && nextProps.initial_visit_start_type !== this.props.initial_visit_start_type){
            _.forEach(customers, (customerItem) => {
                customerItem.visit_start_type = nextProps.initial_visit_start_type;
                customerItem.start_type_select = this.calculateSelectType(customerItem.visit_start_time, nextProps);
                customerItem.end_type_select = this.calculateSelectType(customerItem.visit_end_time, nextProps);
                //如果在结束类型的下拉框选择中找不到结束时候选中的类型，需要收到改成下拉选择中的类型
                if (!_.find(customerItem.end_type_select,item => item.value === customerItem.visit_end_type)){
                    customerItem.visit_end_type = _.get(customerItem.end_type_select,'[0].value');
                    this.setFieldCustomers(_.cloneDeep(customers));
                }
            });
        }
        if (nextProps.initial_visit_end_type && nextProps.initial_visit_end_type !== this.props.initial_visit_end_type){
            _.forEach(customers, (customerItem) => {
                customerItem.visit_end_type = nextProps.initial_visit_end_type;
                customerItem.start_type_select = this.calculateSelectType(customerItem.visit_start_time, nextProps);
                //如果在开始类型的下拉框选择中找不到开始时候选中的类型，需要收到改成下拉选择中的类型
                if (!_.find(customerItem.start_type_select,item => item.value === customerItem.visit_start_type)){
                    customerItem.visit_start_type = _.get(customerItem.start_type_select,'[0].value');
                    this.setFieldCustomers(_.cloneDeep(customers));
                }
                customerItem.end_type_select = this.calculateSelectType(customerItem.visit_end_time, nextProps);

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
        customers.push({...timeRange, key: addCustomerKey});
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
        if (!curCustomer.name && !curCustomer.hideCustomerRequiredTip && this.props.isRequired) {
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
        const {form} = this.props;
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.visit_start_time = startValue ? startValue.valueOf() : '';
                //如果开始时间比结束时间晚，修改结束时间
                if (item.visit_start_time > item.visit_end_time){
                    item.visit_end_time = item.visit_start_time;
                }
                //修改完开始时间也需要看一下开始时间类型的下拉选项是否需要修改
                item.start_type_select = this.calculateSelectType(item.visit_start_time);
                item.end_type_select = this.calculateEndSelectType(item);
                //如果之前选中的上午还是下午的类型（visit_start_type），不在时间类型的下拉选项（start_type_select）中，自动设置visit_end_type为end_type_select里第一个
                if (!_.some(item.start_type_select,typeItem => typeItem.value === item.visit_start_type) && _.get(item.start_type_select,'[0]')){
                    item.visit_start_type = _.get(item.start_type_select,'[0].value');
                    form.setFieldsValue({[`customers[${key}].visit_start_type`]: item.visit_start_type});
                }
                //如果之前选中的上午还是下午的类型（end_type_select），不在时间类型的下拉选项（end_type_select）中，自动设置visit_end_type为end_type_select里第一个
                if (!_.some(item.end_type_select,typeItem => typeItem.value === item.visit_end_type) && _.get(item.end_type_select,'[0]')){
                    item.visit_end_type = _.get(item.end_type_select,'[0].value');
                    form.setFieldsValue({[`customers[${key}].visit_end_type`]: item.visit_end_type});
                }
                return false;
            }
        });
        this.setState({customers});
        //把form中的customers设置为修改后的state上的customers，避免state修改了，页面上没有改掉
        this.setFieldCustomers(_.cloneDeep(customers));
        this.props.handleCustomersChange(customers);
    };
    //修改结束时间
    onVisitEndTimeChange = (key, endValue) => {
        let customers = this.state.customers;
        const {form} = this.props;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.visit_end_time = endValue ? endValue.valueOf() : '';
                //如果开始时间比结束时间晚，修改开始时间
                if (item.visit_start_time > item.visit_end_time){
                    item.visit_start_time = item.visit_end_time;
                }
                //修改完结束时间，看一下结束时间类型的下拉选项是否需要修改
                item.start_type_select = this.calculateSelectType(item.visit_start_time);
                item.end_type_select = this.calculateEndSelectType(item);
                //如果之前选中的上午还是下午的类型（visit_end_type），不在时间类型的下拉选项（end_type_select）中，自动设置visit_end_type为end_type_select里第一个
                if (!_.some(item.end_type_select,typeItem => typeItem.value === item.visit_end_type) && _.get(item.end_type_select,'[0]')){
                    item.visit_end_type = _.get(item.end_type_select,'[0].value');
                    form.setFieldsValue({[`customers[${key}].visit_end_type`]: item.visit_end_type});
                }
                return false;
            }
        });
        this.setState({customers});
        //把form中的customers设置为修改后的state上的customers，避免state修改了，页面上没有改掉
        this.setFieldCustomers(_.cloneDeep(customers));
        this.props.handleCustomersChange(customers);
    };
    calculateEndSelectType = (item) => {
        var selectTypeArr = LEAVE_TIME_RANGE;
        //如果和开始的时间是同一天并且开始的类型是PM
        if (moment(item.visit_start_time).isSame(item.visit_end_time,'day') && item.visit_start_type === AM_AND_PM.PM){
            selectTypeArr = LEAVE_TIME_RANGE.slice(1,2);
        }
        return selectTypeArr;
    }
    setFieldCustomers = (customers) => {
        const {form} = this.props;
        if (_.isArray(customers) && customers.length){
            _.forEach(customers, (item) => {
                delete item.key;
                delete item.start_type_select;
                delete item.end_type_select;
                item.name = item.name || '';
                item.address = item.address || '';
                item.remarks = item.remarks || '';
                item.visit_start_time = moment(item.visit_start_time);
                item.visit_end_time = moment(item.visit_end_time);
            });
        }
        form.setFieldsValue({
            'customers': customers
        });
    };
    handleChangeStartType = (key, value) => {
        const {form} = this.props;
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.visit_start_type = value || '';
                item.end_type_select = this.calculateEndSelectType(item);
                if (!_.some(item.end_type_select,typeItem => typeItem.value === item.visit_end_type) && _.get(item.end_type_select,'[0]')){
                    item.visit_end_type = _.get(item.end_type_select,'[0].value');
                    form.setFieldsValue({[`customers[${key}].visit_end_type`]: item.visit_end_type});
                }
                return false;
            }
        });
        this.setState({customers});
        this.props.handleCustomersChange(customers);
    };
    handleChangeEndType = (key, value) => {
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.visit_end_type = value || '';
                return false;
            }
        });
        this.setState({customers});
        this.props.handleCustomersChange(customers);
    };
    calculateSelectType = (selectTime, nextProps) => {
        var props = nextProps || this.props;
        var selectTypeArr = LEAVE_TIME_RANGE;
        //如果和开始的时间是同一天并且开始的类型是PM
        if (moment(selectTime).isSame(props.initialVisitStartTime, 'day') && props.initial_visit_start_type === AM_AND_PM.PM){
            selectTypeArr = LEAVE_TIME_RANGE.slice(1,2);
        }
        //如果和结束的时间是同一天并且结束的类型是AM
        if (moment(selectTime).isSame(props.initialVisitEndTime, 'day') && props.initial_visit_end_type === AM_AND_PM.AM){
            selectTypeArr = LEAVE_TIME_RANGE.slice(0,1);
        }
        return selectTypeArr;

    };
    renderDiffCustomers(key, index, customer_keys) {
        var _this = this;
        const size = customer_keys.length;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const delContactCls = classNames('iconfont icon-delete handle-btn-item', {
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
        var initialStartTime = this.props.initialVisitStartTime;
        var initialEndTime = this.props.initialVisitEndTime;

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
                    className="form-item-label add-apply-time"
                    label={Intl.get('bussiness.trip.time.range', '拜访时间')}
                    {...formItemLayout}
                >
                    {getFieldDecorator(`customers[${key}].visit_start_time`,{
                        initialValue: moment(curCustomer.visit_start_time) })(
                        <DatePicker
                            onChange={this.onVisitBeginTimeChange.bind(this, key)}
                            value={curCustomer.visit_start_time ? moment(curCustomer.visit_start_time) : moment()}
                            disabledDate={disabledDate.bind(this, initialStartTime, initialEndTime)}
                        />

                    )}
                    {getFieldDecorator(`customers[${key}].visit_start_type`, {initialValue: curCustomer.visit_start_type})(
                        <Select
                            getPopupContainer={() => document.getElementById('leave-apply-form')}
                            onChange={this.handleChangeStartType.bind(this, key)}
                        >
                            {_.isArray(curCustomer.start_type_select) && curCustomer.start_type_select.length ?
                                curCustomer.start_type_select.map((item, idx) => {
                                    return (<Option key={idx} value={item.value}>{item.name}</Option>);
                                }) : null
                            }
                        </Select>
                    )}
                    <span className="apply-range">{Intl.get('common.time.connector', '至')}</span>
                    {getFieldDecorator(`customers[${key}].visit_end_time`,{
                        initialValue: moment(curCustomer.visit_end_time)})(
                        <DatePicker
                            onChange={this.onVisitEndTimeChange.bind(this, key)}
                            value={curCustomer.visit_end_time ? moment(curCustomer.visit_end_time) : moment()}
                            disabledDate={disabledDate.bind(this, initialStartTime, initialEndTime)}
                        />
                    )}
                    {getFieldDecorator(`customers[${key}].visit_end_type`, {initialValue: curCustomer.visit_end_type})(
                        <Select
                            getPopupContainer={() => document.getElementById('leave-apply-form')}
                            onChange={this.handleChangeEndType.bind(this, key)}
                        >
                            {_.isArray(curCustomer.end_type_select) && curCustomer.end_type_select.length ?
                                curCustomer.end_type_select.map((item, idx) => {
                                    return (<Option key={idx} value={item.value}>{item.name}</Option>);
                                }) : null
                            }
                        </Select>
                    )}
                </FormItem>
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
                    {getFieldDecorator(`customers[${key}].address`, {initialValue: curCustomer.address,
                        rules: [{required: this.props.addAddressIsRequired, message: Intl.get('contract.224', '请输入地址')}]
                    })(
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
    initialVisitStartTime: PropTypes.string,
    initialVisitEndTime: PropTypes.string,
    initial_visit_start_type: PropTypes.string,
    initial_visit_end_type: PropTypes.string,
    isRequired: PropTypes.boolean,//是否客户是必填项
    addAddressIsRequired: PropTypes.boolean,//地址是否是必填项

};
DynamicAddDelCustomers.defaultProps = {
    form: {},
    addAssignedCustomer: function() {

    },
    handleCustomersChange: function() {

    },
    initialVisitStartTime: '',
    initialVisitEndTime: '',
    initial_visit_start_type: '',
    initial_visit_end_type: '',
    isRequired: true,
    addAddressIsRequired: false

};
export default Form.create()(DynamicAddDelCustomers);


