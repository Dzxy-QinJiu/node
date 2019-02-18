var React = require('react');
var createReactClass = require('create-react-class');
const Validation = require('rc-form-validation-for-react16');
const Validator = Validation.Validator;
/**
 * 产品信息添加表单
 */

import { Form, Input, Select, Button, Icon, Alert, DatePicker, message } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
import ValidateMixin from '../../../mixins/ValidateMixin';
import {getNumberValidateRule} from 'PUB_DIR/sources/utils/validate-util';
import ProductTable from 'CMP_DIR/basic-edit-field-new/product-table';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { PRIVILEGE_MAP, VIEW_TYPE } from 'MOD_DIR/contract/consts';
import Trace from 'LIB_DIR/trace';
import routeList from 'MOD_DIR/contract/common/route';
import ajax from 'MOD_DIR/contract/common/ajax';

const defaultValueMap = {
    count: 1,
    total_price: 1000, 
    commission_rate: 6
};

const AddProduct = createReactClass({
    displayName: 'AddProduct',
    mixins: [ValidateMixin],
    
    getInitialState: function() {
        let products;

        if (_.isArray(this.props.products) && this.props.products.length) {
            products = JSON.parse(JSON.stringify(this.props.products));
        } else {
            products = [];
        }
        return {
            products: products,
            formData: {},
            valid: false,
            pristine: true,
            validator: null
        };
    },
    getDefaultProps: function(){
        return{
            totalAmout: 0
        };
    },

    producTableRef: null,

    propTypes: {
        products: PropTypes.array,
        appList: PropTypes.array,
        updateScrollBar: PropTypes.func,
        isDetailType: PropTypes.bool.isRequired,
        totalAmout: PropTypes.number,
        contract: PropTypes.array,
        refreshCurrentContract: PropTypes.func,
    },

    componentWillReceiveProps(nextProps) {
        if(_.get(this.props,'contract') && this.props.contract.id !== nextProps.contract.id){
            let newState = this.getInitialState();
            newState.products = JSON.parse(JSON.stringify(nextProps.contract.products));
            newState.isEdit = false;
            this.producTableRef.state.isEdit = false;
            this.setState(newState);
        }
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
        const appName = _.trim(value);
        let products = _.cloneDeep(this.state.products);
        const selectedApp = _.find(this.props.appList, app => app.app_name === appName);
        const appId = selectedApp ? selectedApp.app_id : '';

        products[index].id = appId;
        products[index].name = appName;
        this.setState({products});
    },

    onStartEndTimeChange: function(index, momentArr) {
        let products = _.cloneDeep(this.state.products);
        let product = products[index];

        product.account_start_time = momentArr[0].valueOf();
        product.account_end_time = momentArr[1].valueOf();

        this.setState({products});
    },

    setField2: function(field, index, e) {
        let value = _.isObject(e) ? e.target.value : e;
        let products = _.cloneDeep(this.state.products);
        products[index][field] = value;
        this.setState({products});
    },
    getNumberValidate(text) {
        return /^(\d|,)+(\.\d+)?$/.test(text);
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
                                className='app-name'
                            >
                                <Select
                                    mode="combobox"
                                    dropdownMatchSelectWidth={false}
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
                                validateStatus={this.getValidateStatus('count' + index)}
                                help={this.getHelpMessage('count' + index)}
                            >
                                <Validator rules={[{ required: true, message: Intl.get('contract.89', '请填写数量') }, { pattern: /^\d+$/, message: Intl.get('contract.45', '请填写数字') }]}>
                                    <Input
                                        name={'count' + index}
                                        value={(isNaN(product.count) ? '' : product.count).toString()}
                                        onChange={this.setField2.bind(this, 'count', index)}
                                    />
                                </Validator>
                            </FormItem>
                            <FormItem
                                label={index === 0 ? '总价' : ''}
                                validateStatus={this.getValidateStatus('total_price' + index)}
                                help={this.getHelpMessage('total_price' + index)}
                            >
                                <Validator rules={[{ required: true, message: Intl.get('contract.90', '请填写总价') }, this.getNumberValidateRule()]}>
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
                                <Validator rules={[getNumberValidateRule()]}>
                                    <Input
                                        name={'commission_rate' + index}
                                        value={(isNaN(product.commission_rate) ? '' : product.commission_rate).toString()}
                                        onChange={this.setField2.bind(this, 'commission_rate', index)}
                                    />
                                </Validator>
                                &nbsp;%
                            </FormItem>
                            <FormItem
                                label={index === 0 ? Intl.get('common.start.end.time', '起止时间') : ''}
                                className='start-end-time'
                            >
                                <RangePicker
                                    defaultValue={this.state.products[index].account_start_time ? [moment(this.state.products[index].account_start_time), moment(this.state.products[index].account_end_time)] : []}
                                    onChange={this.onStartEndTimeChange.bind(this, index)}
                                />
                            </FormItem>
                            <div className="circle-button circle-button-minus"
                                title={Intl.get('common.delete', '删除')}
                                onClick={this.deleteProduct.bind(this, index)}>
                                <Icon type="minus" />
                            </div>
                        </Form>
                    );
                })}
            </Validation>
        );
    },
    validate(cb) {
        const products = this.state.products;
        let flag = true;
        products.forEach(x => {
            //存在无数据的单元格，不通过验证
            ['count', 'version', 'commission_rate', 'total_price'].forEach(key => {
                if (!x[key]) {
                    flag = false;
                    return false;
                }
            });
        });
        this.setState({
            products,
            valid: flag,
            //点击下一步后展示错误提示
            pristine: false,
            validator: text => text
        });
        cb && cb(flag);
        return flag;
    },
    handleProductChange(data) {
        this.setState({ products: data, pristine: true });
    },
    renderAppIconName(appName, appId) {
        let appList = this.props.appList;
        let matchAppObj = _.find(appList, (appItem) => {
            return appItem.app_id === appId;
        });
        return (
            <span className='app-icon-name'>
                {appName ? (
                    matchAppObj && matchAppObj.app_logo ? (
                        <span className='app-self'>
                            <img src={matchAppObj.app_logo} />
                        </span>
                    ) : (
                        <span className='app-default'>
                            <i className='iconfont icon-app-default'></i>
                        </span>
                    )
                ) : null}
                <span className='app-name' title={appName}>{appName}</span>
            </span>
        );
    },
    handleAddCustomeizeApp() { 
        const {products} = this.state;
        products.push({
            editable: true,
            ...defaultValueMap
        });
        this.setState({
            products
        });
    },
    handleProductCancel() {
        let products = _.clone(this.props.products);
        this.setState({products});
    },
    handleProductSave(saveObj,successFunc,errorFunc) {
        saveObj = {products: saveObj};
        Trace.traceEvent(ReactDOM.findDOMNode(this),'修改产品信息');
        let valid = this.validate();
        if(!valid) {
            errorFunc(Intl.get('contract.table.form.fill', '请填写表格内容'));
            return false;
        }
        const handler = 'editContract';
        const route = _.find(routeList, route => route.handler === handler);
        // 单项编辑时，这里得添加上客户信息字段
        if(!_.get(saveObj, 'customers')){
            saveObj.customers = this.props.contract.customers;
        }
        const arg = {
            url: route.path,
            type: route.method,
            data: saveObj || {},
            params: {type: VIEW_TYPE.SELL}
        };
        ajax(arg).then(result => {
            if (result.code === 0) {
                message.success(Intl.get('user.edit.success', '修改成功'));
                if (_.isFunction(successFunc)) successFunc();
                const hasResult = _.isObject(result.result) && !_.isEmpty(result.result);
                let contract = _.extend({},this.props.contract,result.result);
                if (hasResult) {
                    this.props.refreshCurrentContract(this.props.contract.id, true, contract);
                }
            } else {
                if (_.isFunction(errorFunc)) errorFunc(Intl.get('common.edit.failed', '修改失败'));
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg || Intl.get('common.edit.failed', '修改失败'));
        });
    },
    render: function() {

        let num_col_width = 75;
        const columns = [
            {
                title: Intl.get('common.product', '产品'),
                dataIndex: 'name',
                key: 'name',
                width: 110,
                render: (text, record, index) => {
                    return <span className='app-info'>{this.renderAppIconName(text, record.id)}</span>;
                },
                validator: this.state.validator,
                getIsEdit: text => !text
            },
            {
                title: Intl.get('contract.21', '版本号'),
                dataIndex: 'version',
                editable: true,
                key: 'version',
                width: 70,
                validator: this.state.validator
            },
            {
                title: `${Intl.get('common.app.count', '数量')}(${Intl.get('contract.22', '个')})`,
                dataIndex: 'count',
                editable: true,
                key: 'count',
                width: num_col_width,
                /*render: (text) => {
                    return <span>{parseAmount(text.toFixed(2))}</span>;
                },*/
                validator: text => this.getNumberValidate(text)//this.state.validator
            },
            {
                title: Intl.get('contract.23', '总价') + '(' + Intl.get('contract.82', '元') + ')',
                dataIndex: 'total_price',
                key: 'total_price',
                width: num_col_width,
                editable: true,
                validator: text => this.getNumberValidate(text)//this.state.validator
            },
            {
                title: Intl.get('sales.commission', '提成') + '(%)',
                dataIndex: 'commission_rate',
                key: 'commission_rate',
                width: num_col_width,
                editable: true,
                validator: text => this.getNumberValidate(text)//this.state.validator
            }
        ];
        const customizeBTN = (
            <span onClick={this.handleAddCustomeizeApp}>{Intl.get('contract.form.customize', '添加自定义产品')}</span>
        );
        // 如果是添加合同时，是可以编辑的（true），详情查看时，显示可编辑按钮，点编辑后，显示编辑状态且有保存取消按钮
        let isEditBtnShow = this.props.isDetailType && hasPrivilege(PRIVILEGE_MAP.CONTRACT_UPATE_PRIVILEGE);
        let isEdit = !this.props.isDetailType ? true :
            (isEditBtnShow && this.producTableRef ? this.producTableRef.state.isEdit : false);
        let isSaveCancelBtnShow = this.props.isDetailType;

        // 获取合同金额的大小
        let totalAmout = 0;
        if(isEditBtnShow) {
            let reports = _.get(this,'props.parent.refs.addReport.state.reports') || _.get(this,'props.contract.reports') || [];
            let totalReportsPrice = 0;
            reports.length > 0 ? totalReportsPrice = _.reduce(reports,(sum, item) => {
                const amount = +item.total_price;
                return sum + amount;
            }, 0) : '';
            console.log(reports,totalReportsPrice);
            totalAmout = this.props.contract.contract_amount - totalReportsPrice;
        }

        return (
            <div className="add-products">               
                <div className="product-forms product-table-container">
                    <ProductTable
                        addBtnText={Intl.get('common.product', '产品')}
                        ref={ref => this.producTableRef = ref}
                        appendDOM={customizeBTN}
                        defaultValueMap={defaultValueMap}
                        appList={this.props.appList.map(x => ({
                            client_id: x.app_id,
                            client_image: x.app_logo,
                            client_name: x.app_name
                        }))}
                        totalAmount={totalAmout}
                        data={this.state.products}
                        dataSource={this.state.products}
                        isEdit={isEdit}
                        isEditBtnShow={isEditBtnShow}
                        isSaveCancelBtnShow={isSaveCancelBtnShow}
                        columns={columns}
                        onSave={this.handleProductSave}
                        handleCancel={this.handleProductCancel}
                        onChange={this.handleProductChange}
                    />
                    {
                        !isEditBtnShow && !this.state.pristine && !this.state.valid ?
                            <div className="alert-container">
                                <Alert type="error" message={Intl.get('contract.table.form.fill', '请填写表格内容')} showIcon/>
                            </div> : null
                    }
                    {/* {this.renderFormContent()} */}

                </div>
            </div>
        );
    },
});

module.exports = AddProduct;


