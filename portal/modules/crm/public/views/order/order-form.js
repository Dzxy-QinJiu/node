const Validation = require("rc-form-validation");
const Validator = Validation.Validator;
import {Form, Input, Button, Select, Icon, message} from "antd";
const FormItem = Form.Item;
const classnames = require("classnames");
const Spinner = require('../../../../../components/spinner');
const rightPanelUtil = require("../../../../../components/rightPanel/index");
const RightPanelSubmit = rightPanelUtil.RightPanelSubmit;
const RightPanelCancel = rightPanelUtil.RightPanelCancel;
const OrderAction = require("../../action/order-actions");
import SearchIconList from '../../../../../components/search-icon-list';
import ValidateMixin from "../../../../../mixins/ValidateMixin";
import Trace from "LIB_DIR/trace";

const OrderForm = React.createClass({
    mixins: [ValidateMixin],

    getInitialState: function () {
        return {
            isLoading: false,
            isAppPanelShow: false,
            formData: JSON.parse(JSON.stringify(this.props.order)),
        };
    },

    handleCancel: function (e) {
        var message = this.props.order.id ? "取消编辑订单" :"取消添加订单";
        Trace.traceEvent(this.getDOMNode(),message);
        e.preventDefault();
        OrderAction.hideForm(this.props.order.id);
    },

    handleSubmit: function (e) {
        e.preventDefault();
        const validation = this.refs.validation;
        Trace.traceEvent(this.getDOMNode(),"保存订单");
        validation.validate(valid => {
            if (!valid) {
                return;
            } else {
                let reqData = JSON.parse(JSON.stringify(this.state.formData));
                delete reqData.isEdit;
                //修改
                if (reqData.id) {
                    if (this.props.isMerge) {
                        //合并客户时的修改
                        this.props.updateMergeCustomerOrder(reqData);
                    } else {
                        this.setState({isLoading: true});
                        OrderAction.editOrder(reqData, {}, (result) => {
                            this.setState({isLoading: false});
                            if (result.code === 0) {
                                message.success( Intl.get("common.save.success", "保存成功"));
                                OrderAction.afterEditOrder(reqData);
                                //稍等一会儿再去重新获取数据，以防止更新未完成从而取到的还是旧数据
                                setTimeout(() => {
                                    this.props.refreshCustomerList(reqData.customer_id);
                                }, 200);
                            }
                            else {
                                message.error( Intl.get("common.save.failed", "保存失败"));
                            }
                        });
                    }
                } else {
                    //保存
                    reqData.customer_id = this.props.customerId;
                    this.setState({isLoading: true});
                    OrderAction.addOrder(reqData, {}, (data) => {
                        this.setState({isLoading: false});
                        if (data.code === 0) {
                            message.success( Intl.get("user.user.add.success", "添加成功"));
                            OrderAction.afterAddOrder(data.result);
                            //稍等一会儿再去重新获取数据，以防止更新未完成从而取到的还是旧数据
                            setTimeout(() => {
                                this.props.refreshCustomerList(reqData.customer_id);
                            }, 200);
                        }
                        else {
                            message.error( Intl.get("crm.154", "添加失败"));
                        }

                    });
                }
            }
        });
    },
    onAppsChange: function (selectedApps) {
        Trace.traceEvent(this.getDOMNode(),"点击选中/取消选中某个应用");
        this.state.formData.apps = _.pluck(selectedApps, "client_id");
        this.setState(this.state);
    },
    handleSelect: function () {
        Trace.traceEvent(this.getDOMNode(),"选择销售阶段");
    },
    render: function () {
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
                selectedAppListId = _.pluck(selectedAppList, "client_id");
            }
            if (appList && appList.length > 0 && formData.apps && formData.apps.length > 0) {
                apps = _.filter(appList, app => {
                    if (formData.apps.indexOf(app.client_id) > -1) return true;
                });
            }
        }
        return (
            <div className="order-item order-form">
                <Form horizontal className="form">
                    <Validation ref="validation" onValidate={this.handleValidate}>
                        <div className="order-title">
                            <div className="order-title-left">
                                <label><ReactIntl.FormattedMessage id="crm.146" defaultMessage="日期" />：{moment(formData.time).format(oplateConsts.DATE_FORMAT)}</label>
                                <br />
                                <label><ReactIntl.FormattedMessage id="crm.147" defaultMessage="订单号" />：{formData.id}</label>
                            </div>
                            <div className="order-title-right-btn">
                                <div className="order-btn-class icon-return iconfont"
                                        onClick={this.handleCancel}
                                />
                            </div>
                        </div>
                        <div className="order-introduce">
                            {formData.id ? null : (
                                <FormItem
                                    label={Intl.get("sales.stage.sales.stage", "销售阶段")}
                                    labelCol={{span: 6}}
                                    wrapperCol={{span: 10}}
                                    validateStatus={this.getValidateStatus("sale_stages")}
                                    help={this.getHelpMessage("sale_stages")}
                                >
                                    <Validator rules={[{required: true, message: Intl.get("crm.155", "请选择销售阶段")}]}>
                                        <Select size="large" placeholder={Intl.get("crm.155", "请选择销售阶段")} style={{width: '100%'}}
                                                value={formData.sale_stages}
                                                onChange={this.setField.bind(this, 'sale_stages')}
                                                name="sale_stages"
                                                onSelect={this.handleSelect}
                                        >
                                            {this.props.stageList.map(function (stage, index) {
                                                return (<Option value={stage.name} key={index}>{stage.name}</Option>);
                                            })}
                                        </Select>
                                    </Validator>
                                </FormItem>
                            )}
                            <FormItem
                                label={Intl.get("crm.200", "预算金额(单位: 万)")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 10}}
                                hasFeedback
                                validateStatus={this.getValidateStatus("budget")}
                                help={this.getHelpMessage("budget")}
                            >
                                <Validator rules={[{pattern: /^\d+(\.\d+)?$/, message: Intl.get("crm.157", "预算金额必须为数字")}]}>
                                    <Input value={formData.budget}
                                           name="budget"
                                           onChange={this.setField.bind(this, 'budget')}
                                    />
                                </Validator>
                            </FormItem>
                            {formData.id ? null : (<FormItem
                                label={Intl.get("common.app", "应用")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 24}}
                            >
                                <SearchIconList
                                    totalList={this.props.appList}
                                    selectedList={selectedAppList}
                                    selectedListId={selectedAppListId}
                                    id_field="client_id"
                                    name_field="client_name"
                                    image_field="client_image"
                                    search_fields={["client_name"]}
                                    onItemsChange={this.onAppsChange}
                                />
                            </FormItem>)}
                            <FormItem
                                label={Intl.get("common.remark", "备注")}
                                labelCol={{span: 6}}
                                wrapperCol={{span: 10}}>
                                <div className="remarks-wrapper">
                                    <Input type="textarea" rows="3"
                                           value={formData.remarks}
                                           onChange={this.setField.bind(this, 'remarks')}
                                           data-tracename="填写备注"
                                    />
                                </div>
                            </FormItem>

                            <FormItem
                                wrapperCol={{span: 23}}>
                                <RightPanelCancel onClick={this.handleCancel}>
                                    <ReactIntl.FormattedMessage id="common.cancel" defaultMessage="取消" />
                                </RightPanelCancel>
                                <RightPanelSubmit onClick={this.handleSubmit}>
                                    <ReactIntl.FormattedMessage id="common.save" defaultMessage="保存" />
                                </RightPanelSubmit>
                                {this.state.isLoading ? <Icon type="loading"/> : null}
                            </FormItem>
                        </div>
                    </Validation>
                </Form>
            </div>
        );
    }
});

module.exports = OrderForm;
