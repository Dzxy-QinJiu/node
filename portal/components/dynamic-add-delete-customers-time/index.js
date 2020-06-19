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
import {Form, Input, TimePicker, Popover} from 'antd';
const FormItem = Form.Item;
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
import {AntcAreaSelection, AntcSelect} from 'antc';
const Option = AntcSelect.Option;
import {disabledHour,getTimeWithSecondZero,disabledMinute,checkCustomerTotalLeaveTime,
    changeNumberToChinese} from 'PUB_DIR/sources/utils/common-method-util';

class DynamicAddDelCustomers extends React.Component {
    constructor(props) {
        super(props);
        var timeRange = this.getInitialTimeRange();
        this.state = {
            initialVisitStartTime: this.props.initialVisitStartTime,
            initialVisitEndTime: this.props.initialVisitEndTime,
            customers: [{...timeRange,key: 0}]
        };
    }
    getInitialTimeRange = () => {
        var visit_start_time = this.props.initialVisitStartTime || moment().valueOf();
        var visit_end_time = this.props.initialVisitEndTime || moment().valueOf();
        return {
            visit_start_time: visit_start_time,//拜访开始时间
            visit_end_time: visit_end_time,//拜访结束时间
        };
    };
    componentWillReceiveProps(nextProps) {
        var customers = this.state.customers;
        if (nextProps.while_date && nextProps.while_date !== this.props.while_date){
            _.forEach(customers, (customerItem) => {//如果父组件中修改了日期，这里需要把时间改成外部日期下的时间
                //注意不能把 moment(nextProps.while_date).startOf('day') 抽取出变量来，否则计算的时间有问题
                let customerStartTime = customerItem.visit_start_time;
                let customerEndTime = customerItem.visit_end_time;
                customerItem.visit_start_time = moment(nextProps.while_date).startOf('day').add(moment(customerStartTime).hour(),'hour').add(moment(customerStartTime).minute(),'minutes').valueOf();
                customerItem.visit_end_time = moment(nextProps.while_date).startOf('day').add(moment(customerEndTime).hour(),'hour').add(moment(customerEndTime).minute(),'minutes').valueOf();
            });
        }
        this.setState({
            customers: customers
        });
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
                item.visit_start_time = startValue ? getTimeWithSecondZero(startValue) : '';
                //如果开始时间比结束时间晚，修改结束时间
                if (item.visit_start_time > item.visit_end_time){
                    item.visit_end_time = item.visit_start_time;
                }
                return false;
            }
        });
        this.setState({customers});
        //把form中的customers设置为修改后的state上的customers，避免state修改了，页面上没有改掉
        this.setFieldCustomers(_.cloneDeep(customers));
        this.props.handleCustomersChange(customers);
    };
    checkItemStartAndEndTime = (item) => {
        const {form} = this.props;
        var initialStartTime = this.state.initialVisitStartTime;
        var initialEndTime = this.state.initialVisitEndTime;
        //如果开始时间早于总的开始时间或者晚于总结束时间
        if(item.visit_start_time < initialStartTime ){
            item.visit_start_time = initialStartTime;
        }else if(item.visit_start_time > initialEndTime){
            item.visit_start_time = initialEndTime;
        }
        //如果开始时间早于总的开始时间或者晚于总结束时间
        if(item.visit_end_time < initialStartTime ){
            item.visit_end_time = initialStartTime;
        }else if(item.visit_end_time > initialEndTime){
            item.visit_end_time = initialEndTime;
        }
        form.setFieldsValue({[`customers[${item.key}].visit_start_time`]: item.visit_start_time});
        form.setFieldsValue({[`customers[${item.key}].visit_end_time`]: item.visit_end_time});
    };
    //修改结束时间
    onVisitEndTimeChange = (key, endValue) => {
        let customers = this.state.customers;
        _.each(customers, (item, index) => {
            if (item.key === key) {
                item.visit_end_time = endValue ? getTimeWithSecondZero(endValue) : '';
                //如果开始时间比结束时间晚，修改开始时间
                if (item.visit_start_time > item.visit_end_time){
                    item.visit_start_time = item.visit_end_time;
                }
                return false;
            }
        });
        this.setState({customers});
        //把form中的customers设置为修改后的state上的customers，避免state修改了，页面上没有改掉
        this.setFieldCustomers(_.cloneDeep(customers));
        this.props.handleCustomersChange(customers);
    };
    setFieldCustomers = (customers) => {
        const {form} = this.props;
        if (_.isArray(customers) && customers.length){
            _.forEach(customers, (item) => {
                delete item.key;
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

    renderDiffCustomers(key, index, customer_keys) {
        var _this = this;
        const size = customer_keys.length;
        const {getFieldDecorator, getFieldValue} = this.props.form;
        const delContactCls = classNames('iconfont icon-delete handle-btn-item', {
            'disabled': index === 0 && size === 1
        });
        const labelSm = '4',wrapSm = '19';
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: labelSm},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: wrapSm},
            },
        };
        let customers = this.state.customers;
        let curCustomer = _.find(customers, (item) => {return item.key === key;}) || {};

        return (
            <div className="contact-wrap" key={key}>
                <div className='contact-title'>
                    <span className='positin-number'>{Intl.get('business.while.position.num', '地点{num}',{num: changeNumberToChinese(index + 1)})}</span>
                    <i className={delContactCls} onClick={this.handleDelCustomer.bind(this, key, index, size)}/>
                </div>
                <div className="contact-content">
                    <FormItem
                        className="form-item-label add-apply-time"
                        label={Intl.get('common.login.time', '时间')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator(`customers[${key}].visit_start_time`,{
                            initialValue: moment(curCustomer.visit_start_time),
                            rules: [{required: true, message: Intl.get('common.login.time.require.msg', '请输入时间')}]
                        })(
                            <TimePicker
                                allowClear={false}
                                showTime={{format: oplateConsts.HOUR_MUNITE_FORMAT}}
                                type='time'
                                format={oplateConsts.HOUR_MUNITE_FORMAT}
                                onChange={this.onVisitBeginTimeChange.bind(this, key)}
                                value={curCustomer.visit_start_time ? moment(curCustomer.visit_start_time) : moment()}
                            />

                        )}
                        <span className="apply-range">{Intl.get('common.time.connector', '至')}</span>
                        {getFieldDecorator(`customers[${key}].visit_end_time`,{
                            initialValue: moment(curCustomer.visit_end_time)})(
                            <TimePicker
                                allowClear={false}
                                showTime={{format: oplateConsts.HOUR_MUNITE_FORMAT }}
                                type='time'
                                format={oplateConsts.HOUR_MUNITE_FORMAT}
                                onChange={this.onVisitEndTimeChange.bind(this, key)}
                                value={curCustomer.visit_end_time ? moment(curCustomer.visit_end_time) : moment()}
                            />
                        )}
                    </FormItem>
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
                                displayText=''
                                displayType='edit'
                                id=''
                                noJumpToCrm={true}
                                customer_name=''
                                customer_id=''
                                addAssignedCustomer={this.props.addAssignedCustomer}
                                noDataTip={Intl.get('clue.has.no.data', '暂无')}
                                hideButtonBlock={true}
                                customerChoosen={this.customerChoosen.bind(this, key, index)}
                                required={true}
                                hideCustomerRequiredTip={this.hideCustomerRequiredTip.bind(this, key, index)}
                            />
                        )}
                    </FormItem>
                    <AntcAreaSelection labelCol={labelSm} wrapperCol={wrapSm} width="100%"
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
                            rules: [{required: true, message: Intl.get('contract.224', '请输入地址')}]
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
        const {initialVisitStartTime, initialVisitEndTime,customers} = this.state;
        //点击添加客户的时候，要算一下已有客户的外出时长是否和总的外出时长的时间相等了，如果相等，就不可以再添加客户了，让他修改外出时长后再添加客户
        // const canAddCustomer = checkCustomerTotalLeaveTime(initialVisitStartTime,initialVisitEndTime,customers,true);
        var wrapCls = `add-delete-customers-time ${this.props.className}`;
        return (
            <div className={wrapCls}>
                <div className="customer-warp">
                    {_.map(customer_keys, (key, index) => {
                        return this.renderDiffCustomers(key, index, customer_keys);
                    })}
                </div>
                {/*{_.get(canAddCustomer,'errTip') ?*/}
                {/*    <div className="add-customer">*/}
                {/*        <Popover*/}
                {/*            placement="topLeft"*/}
                {/*            overlayClassName="client-invalid-popover"*/}
                {/*            content={canAddCustomer.errTip}*/}
                {/*            trigger="click"*/}
                {/*        >{Intl.get('crm.3', '添加客户')}*/}
                {/*        </Popover></div> :*/}
                <div className="add-customer"
                    onClick={this.handleAddCustomer}>{Intl.get('crm.3', '添加客户')}</div>
                {/*}*/}
            </div>);
    }
}
DynamicAddDelCustomers.propTypes = {
    form: PropTypes.object,
    addAssignedCustomer: PropTypes.func,
    handleCustomersChange: PropTypes.func,
    initialVisitStartTime: PropTypes.string,
    initialVisitEndTime: PropTypes.string,
    isRequired: PropTypes.boolean,//是否客户是必填项
    className: PropTypes.string,
    while_date: PropTypes.string,

};
DynamicAddDelCustomers.defaultProps = {
    form: {},
    addAssignedCustomer: function() {

    },
    handleCustomersChange: function() {

    },
    initialVisitStartTime: '',
    initialVisitEndTime: '',
    isRequired: true,
    while_date: '',

};
export default Form.create()(DynamicAddDelCustomers);


