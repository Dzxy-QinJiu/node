const Validation = require('rc-form-validation');
const Validator = Validation.Validator;
/**
 * 产品信息添加表单
 */

import { Form, Input, Select, Button, Icon } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
import ValidateMixin from '../../../mixins/ValidateMixin';

const AddProduct = React.createClass({
    mixins: [ValidateMixin],
    getInitialState: function() {
        let products;

        if (_.isArray(this.props.products) && this.props.products.length) {
            products = JSON.parse(JSON.stringify(this.props.products));
        } else {
            products = [{}];
        }

        return {
            products: products,
            formData: {},
        };
    },
    addProduct: function() {
        this.state.products.push({});

        this.setState(this.state, () => {
            this.props.updateScrollBar();
        });
    },
    deleteProduct: function(index) {
        this.state.products.splice(index, 1);

        this.setState(this.state, () => {
            this.props.updateScrollBar();
        });
    },
    onAppChoosen: function(index, value) {
        const appName = $.trim(value);
        const selectedApp = _.find(this.props.appList, app => app.app_name === appName);
        const appId = selectedApp ? selectedApp.app_id : '';

        this.state.products[index].id = appId;
        this.state.products[index].name = appName;
        this.setState(this.state);
    },
    setField2: function(field, index, e) {
        let value = _.isObject(e) ? e.target.value : e;

        this.state.products[index][field] = value;
        this.setState(this.state);
    },
    renderFormContent: function() {
        const appList = this.props.appList;
        const products = this.state.products;

        const appOptions = appList.map(app => {
            return <Option key={app.app_name} value={app.app_name}>{app.app_name}</Option>;
        });

        return (
            <Validation ref="validation" onValidate={this.handleValidate}>
                {products.map((product, index) => {
                    let value = product.name || '';
                    const existInAppList = _.findIndex(appList, app => app.app_name === product.name) > -1;
                    if (!existInAppList) {
                        appOptions.push(<Option key={value} value={value}>{product.name}</Option>);
                    }

                    return (
                        <Form key={index}>
                            <FormItem 
                                label={index === 0 ? Intl.get('common.app.name', '应用名称') : ''}
                            >
                                <Select
                                    mode="combobox"
                                    placeholder={Intl.get('user.app.select.please', '请选择应用')}
                                    value={value}
                                    onSearch={this.onAppChoosen.bind(this, index)}
                                    onChange={this.onAppChoosen.bind(this, index)}
                                    notFoundContent={Intl.get('my.app.no.app', '暂无应用')}
                                >
                                    {appOptions}
                                </Select>
                            </FormItem>
                            <FormItem 
                                label={index === 0 ? Intl.get('contract.21', '版本号') : ''}
                            >
                                <Input
                                    value={product.version}
                                    onChange={this.setField2.bind(this, 'version', index)}
                                />
                            </FormItem>
                            <FormItem 
                                label={index === 0 ? '数量（个）' : ''}
                                validateStatus={this.getValidateStatus('num' + index)}
                                help={this.getHelpMessage('num' + index)}
                            >
                                <Validator rules={[{required: true, message: Intl.get('contract.89', '请填写数量')}, {pattern: /^\d+$/, message: Intl.get('contract.45', '请填写数字')}]}>
                                    <Input
                                        name={'num' + index}
                                        value={(isNaN(product.num) ? '' : product.num).toString()}
                                        onChange={this.setField2.bind(this, 'num', index)}
                                    />
                                </Validator>
                            </FormItem>
                            <FormItem 
                                label={index === 0 ? '总价' : ''}
                                validateStatus={this.getValidateStatus('total_price' + index)}
                                help={this.getHelpMessage('total_price' + index)}
                            >
                                <Validator rules={[{required: true, message: Intl.get('contract.90', '请填写总价')}, this.getNumberValidateRule()]}>
                                    <Input
                                        name={'total_price' + index}
                                        value={(isNaN(product.total_price) ? '' : product.total_price).toString()}
                                        onChange={this.setField2.bind(this, 'total_price', index)}
                                    />
                                </Validator>
                            </FormItem>
                            <FormItem 
                                label={index === 0 ? Intl.get('contract.141', '提成比例') : ''}
                                validateStatus={this.getValidateStatus('commission_rate' + index)}
                                help={this.getHelpMessage('commission_rate' + index)}
                            >
                                <Validator rules={[this.getNumberValidateRule()]}>
                                    <Input
                                        name={'commission_rate' + index}
                                        value={(isNaN(product.commission_rate) ? '' : product.commission_rate).toString()}
                                        onChange={this.setField2.bind(this, 'commission_rate', index)}
                                    />
                                </Validator>
                            &nbsp;%
                            </FormItem>
                            <div className="circle-button circle-button-minus"
                                title={Intl.get('common.delete', '删除')}
                                onClick={this.deleteProduct.bind(this, index)}>
                                <Icon type="minus"/>
                            </div>
                        </Form>
                    );
                })}
            </Validation>
        );
    },
    render: function() {
        return (
            <div className="add-products">
                <div className="add-product">
                    <Button
                        className="btn-primary-sure"
                        onClick={this.addProduct}
                    >
                        <ReactIntl.FormattedMessage id="common.add.app" defaultMessage="添加应用" />
                    </Button>
                </div>
                <div className="product-forms">
                    {this.renderFormContent()}
                </div>
            </div>
        );
    }
});

module.exports = AddProduct;

