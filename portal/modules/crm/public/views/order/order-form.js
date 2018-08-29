var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
import {Form, Input, Select, DatePicker} from 'antd';
const FormItem = Form.Item;
const OrderAction = require('../../action/order-actions');
import SearchIconList from '../../../../../components/search-icon-list';
import ValidateMixin from '../../../../../mixins/ValidateMixin';
import Trace from 'LIB_DIR/trace';
import DetailCard from 'CMP_DIR/detail-card';
import {disabledBeforeToday} from 'PUB_DIR/sources/utils/common-method-util';
const OrderForm = createReactClass({
    displayName: 'OrderForm',
    mixins: [ValidateMixin],

    getInitialState: function() {
        return {
            isLoading: false,
            isAppPanelShow: false,
            formData: JSON.parse(JSON.stringify(this.props.order)),
            errorMsg: ''
        };
    },

    handleCancel: function(e) {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '取消添加订单');
        e.preventDefault();
        OrderAction.hideForm();
    },

    handleSubmit: function(e) {
        e.preventDefault();
        const validation = this.refs.validation;
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存订单');
        validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                let reqData = JSON.parse(JSON.stringify(this.state.formData));
                //接口中需要转换成万后的数据
                _.set(reqData,'budget',reqData.budget / 10000);
                delete reqData.isEdit;
                //保存
                reqData.customer_id = this.props.customerId;
                this.setState({isLoading: true});
                OrderAction.addOrder(reqData, {}, (data) => {
                    this.setState({isLoading: false});
                    this.state.isLoading = false;
                    if (data && data.code === 0) {
                        this.state.errorMsg = '';
                        OrderAction.afterAddOrder(data.result);
                        //稍等一会儿再去重新获取数据，以防止更新未完成从而取到的还是旧数据
                        setTimeout(() => {
                            _.isFunction(this.props.refreshCustomerList) && this.props.refreshCustomerList(reqData.customer_id);
                        }, 200);
                    }
                    else {
                        this.state.errorMsg = data || Intl.get('crm.154', '添加失败');
                    }
                    this.setState(this.state);
                });
            }
        });
    },

    onAppsChange: function(selectedApps) {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击选中/取消选中某个应用');
        this.state.formData.apps = _.map(selectedApps, 'client_id');
        this.setState(this.state);
    },

    changeExpectedTime: function(value) {
        let timestamp = value && value.valueOf() || '';
        let formData = this.state.formData;
        formData.predict_finish_time = timestamp;
        this.setState({
            formDate: formData
        });
    },

    handleSelect: function() {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '选择销售阶段');
    },

    renderOrderForm: function() {
        const formData = this.state.formData;
        //添加时，app的添加，修改时不需要展示
        let selectedAppList = [];
        let selectedAppListId = [];
        const appList = this.props.appList;
        let apps = [];
        if (!formData.id) {
            if (formData.apps && formData.apps.length > 0) {
                selectedAppList = this.props.appList.filter(app => {
                    if (formData.apps.indexOf(app.client_id) > -1) {
                        return true;
                    }
                });
                selectedAppListId = _.map(selectedAppList, 'client_id');
            }
            if (appList && appList.length > 0 && formData.apps && formData.apps.length > 0) {
                apps = _.filter(appList, app => {
                    if (formData.apps.indexOf(app.client_id) > -1) return true;
                });
            }
        }
        return (
            <Form horizontal className="order-form" id="order-form">
                <Validation ref="validation" onValidate={this.handleValidate}>
                    <FormItem
                        label={Intl.get('sales.stage.sales.stage', '销售阶段')}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                        validateStatus={this.getValidateStatus('sale_stages')}
                        help={this.getHelpMessage('sale_stages')}
                    >
                        <Validator rules={[{required: true, message: Intl.get('crm.155', '请选择销售阶段')}]}>
                            <Select size="large" placeholder={Intl.get('crm.155', '请选择销售阶段')}
                                style={{width: '100%'}}
                                value={formData.sale_stages}
                                onChange={this.setField.bind(this, 'sale_stages')}
                                name="sale_stages"
                                onSelect={this.handleSelect}
                                getPopupContainer={() => document.getElementById('order-form')}
                            >
                                {this.props.stageList.map(function(stage, index) {
                                    return (<Option value={stage.name} key={index}>{stage.name}</Option>);
                                })}
                            </Select>
                        </Validator>
                    </FormItem>
                    <FormItem
                        label={Intl.get('crm.148', '预算金额')}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                        validateStatus={this.getValidateStatus('budget')}
                        help={this.getHelpMessage('budget')}
                    >
                        <Validator
                            rules={[{pattern: /^\d+(\.\d+)?$/, message: Intl.get('crm.157', '预算金额必须为数字')}]}>
                            <Input value={formData.budget}
                                name="budget"
                                onChange={this.setField.bind(this, 'budget')}
                                addonAfter={Intl.get('contract.82', '元')}
                            />
                        </Validator>
                    </FormItem>
                    <FormItem
                        label={Intl.get('crm.order.expected.deal', '预计成交')}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                    >
                        <DatePicker
                            disabledDate={disabledBeforeToday}
                            defaultValue={formData.predict_finish_time ? moment(formData.predict_finish_time) : null}
                            onChange={this.changeExpectedTime.bind(this)}
                            allowClear={false}/>
                    </FormItem>
                    <FormItem
                        className="order-app-edit-block"
                        label={Intl.get('common.app', '应用')}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}
                    >
                        <SearchIconList
                            totalList={this.props.appList}
                            selectedList={selectedAppList}
                            selectedListId={selectedAppListId}
                            id_field="client_id"
                            name_field="client_name"
                            image_field="client_image"
                            search_fields={['client_name']}
                            onItemsChange={this.onAppsChange}
                        />
                    </FormItem>
                    <FormItem
                        label={Intl.get('common.remark', '备注')}
                        labelCol={{span: 4}}
                        wrapperCol={{span: 20}}>
                        <Input type="textarea" rows="3"
                            value={formData.remarks}
                            onChange={this.setField.bind(this, 'remarks')}
                            data-tracename="填写备注"
                        />
                    </FormItem>
                </Validation>
            </Form>
        );
    },

    render(){
        return (<DetailCard content={this.renderOrderForm()}
            isEdit={true}
            className="order-form-container"
            loading={this.state.isLoading}
            saveErrorMsg={this.state.errorMsg}
            handleSubmit={this.handleSubmit}
            handleCancel={this.handleCancel}
        />);
    },
});

module.exports = OrderForm;

