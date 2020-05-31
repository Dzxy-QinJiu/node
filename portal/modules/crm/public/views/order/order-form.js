const Validation = require('rc-form-validation-for-react16');
import {Form, Input, DatePicker} from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const FormItem = Form.Item;
const OrderAction = require('../../action/order-actions');
import SearchIconList from '../../../../../components/search-icon-list';
import Trace from 'LIB_DIR/trace';
import DetailCard from 'CMP_DIR/detail-card';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
import {disabledBeforeToday, dealTimeNotLessThanToday} from 'PUB_DIR/sources/utils/common-method-util';
class OrderForm extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isLoading: false,
            isAppPanelShow: false,
            errorMsg: ''
        };
    }

    handleCancel(e) {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '取消添加订单');
        e.preventDefault();
        OrderAction.hideForm();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存订单');
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            let reqData = JSON.parse(JSON.stringify(values));
            reqData.predict_finish_time = reqData.predict_finish_time ? moment(reqData.predict_finish_time).valueOf() : moment().valueOf();
            reqData.predict_finish_time = dealTimeNotLessThanToday(reqData.predict_finish_time);
            //保存
            reqData.customer_id = this.props.customerId;
            this.setState({isLoading: true});
            OrderAction.addOrder(reqData, {}, (data) => {
                let errorMsg = '';
                if (data && data.code === 0) {
                    OrderAction.afterAddOrder(data.result);
                    //稍等一会儿再去重新获取数据，以防止更新未完成从而取到的还是旧数据
                    setTimeout(() => {
                        _.isFunction(this.props.refreshCustomerList) && this.props.refreshCustomerList(reqData.customer_id);
                    }, 200);
                }
                else {
                    errorMsg = data || Intl.get('crm.154', '添加失败');
                }
                this.setState({isLoading: false, errorMsg});
            });
        });
    }

    onAppsChange = (selectedApps) => {
        let selectAppIds = _.map(selectedApps, 'client_id');
        this.props.form.setFieldsValue({
            apps: selectAppIds,
        });
    }

    renderOrderForm() {
        const { getFieldDecorator, getFieldsValue } = this.props.form;
        const formData = getFieldsValue();
        //添加时，app的添加，修改时不需要展示
        let selectedAppList = [];
        let selectedAppListId = [];
        const appList = this.props.appList;
        if (!formData.id) {
            if (formData.apps && formData.apps.length > 0) {
                selectedAppList = _.filter(appList, app => _.indexOf(formData.apps, app.client_id) !== -1);
                selectedAppListId = _.map(selectedAppList, 'client_id');
            }
        }
        const formItemLayout = {
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        return (
            <Form layout='horizontal' className="order-form" id="order-form">
                <Validation ref="validation" onValidate={this.handleValidate}>
                    <FormItem
                        label={Intl.get('deal.stage', '阶段')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('sale_stages', {
                            initialValue: _.get(this.props,'stageList[0].name',''),
                            rules: [{required: true, message: Intl.get('crm.155', '请选择销售阶段')}]
                        })(
                            <AntcSelect size="large" placeholder={Intl.get('crm.155', '请选择销售阶段')}
                                style={{width: '100%'}}
                                getPopupContainer={() => document.getElementById('order-form')}
                            >
                                {this.props.stageList.map(function(stage, index) {
                                    return (<Option value={stage.name} key={index}>{stage.name}</Option>);
                                })}
                            </AntcSelect>
                        )}
                    </FormItem>
                    <FormItem
                        label={Intl.get('leave.apply.buget.count', '预算')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('budget', {
                            rules: [{required: true, message: Intl.get('crm.order.budget.input', '请输入预算金额')},getNumberValidateRule()]
                        })(
                            <Input placeholder={Intl.get('crm.order.budget.input', '请输入预算金额')}
                                addonAfter={Intl.get('contract.82', '元')}
                            />
                        )}
                    </FormItem>
                    <FormItem
                        label={Intl.get('crm.order.expected.deal', '预计成交')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('predict_finish_time', {
                            initialValue: moment().endOf('day'),
                            rules: [{required: true, message: Intl.get('crm.order.expected.deal.placeholder', '请选择预计成交时间')}]
                        })(
                            <DatePicker allowClear={false} disabledDate={disabledBeforeToday}/>
                        )}
                    </FormItem>
                    <FormItem
                        className="order-app-edit-block"
                        label={Intl.get('common.product', '产品')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('apps', {
                            rules: [{required: true, message: Intl.get('leave.apply.select.product', '请选择产品')}]
                        })(
                            <SearchIconList
                                totalList={this.props.appList}
                                selectedList={selectedAppList}
                                selectedListId={selectedAppListId}
                                id_field="client_id"
                                name_field="client_name"
                                image_field="client_image"
                                search_fields={['client_name']}
                                onItemsChange={this.onAppsChange}
                                searchPlaceholder={Intl.get('common.product.search.placeholder', '请输入产品名进行筛选')}
                            />
                        )}
                    </FormItem>
                    <FormItem
                        label={Intl.get('common.remark', '备注')}
                        {...formItemLayout}
                    >
                        {getFieldDecorator('remarks')(
                            <Input type="textarea" rows="3"/>
                        )}
                    </FormItem>
                </Validation>
            </Form>
        );
    }

    render(){
        return (<DetailCard content={this.renderOrderForm()}
            isEdit={true}
            className="order-form-container"
            loading={this.state.isLoading}
            saveErrorMsg={this.state.errorMsg}
            handleSubmit={this.handleSubmit}
            handleCancel={this.handleCancel}
        />);
    }
}
OrderForm.propTypes = {
    form: PropTypes.object,
    order: PropTypes.object,
    appList: PropTypes.array,
    stageList: PropTypes.array,
    customerId: PropTypes.string,
    refreshCustomerList: PropTypes.func
};
module.exports = Form.create()(OrderForm);

