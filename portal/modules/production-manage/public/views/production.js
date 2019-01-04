/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */

require('../style/production-info.less');

import {Form, Input, Icon, Radio, Button, Select} from 'antd';
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
import Trace from 'LIB_DIR/trace';
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

let HeadIcon = require('../../../../components/headIcon');
let FormItem = Form.Item;
let GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
let ProductionFormStore = require('../store/production-form-store');
let ProductionFormAction = require('../action/production-form-actions');
let AlertTimer = require('../../../../components/alert-timer');
let util = require('../utils/production-util');
import {getIntegrationConfig} from 'PUB_DIR/sources/utils/common-data-util';
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
import {CopyToClipboard} from 'react-copy-to-clipboard';

const LAYOUT_CONST = {
    HEADICON_H: 107,//头像的高度
    TITLE_H: 94//标题的高度
};
//用来存储获取的oplate\matomo产品列表，不用每次添加产品时都获取一遍
let productList = [];
class Production extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.initData(props);
    }

    static defaultProps = {
        formType: util.CONST.ADD,
        info: {
            id: '',
            name: '',
            code: '',
            description: '',
            price: '',
            sales_unit: '',
            full_image: '',
            image: '',
            specifications: '',
            create_time: '',
            url: ''
        }
    };
    initData = (props) => {
        return {
            create_time: props.info.create_time ? moment(props.info.create_time).format(oplateConsts.DATE_FORMAT) : '',
            isGettingIntegrateType: false,//正在获取集成类型
            getItegrateTypeErrorMsg: '',//获取集成类型是否
            integrateType: '',//集成类型
            integrationId: '',//新加产品的集成id
            productType: '',//产品类型
            isAddingProduct: false, //正在添加产品
            addErrorMsg: '',//添加失败的错误提示
            jsCode: '',//uem产品的jsCode
            getJSCodeMsg: '',//获取jsCode的错误提示
            testResult: '',
            isTesting: false,
            jsCopied: false,
            productList: productList,//oplate\matomo的产品列表
        };
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.info.id !== nextProps.info.id) {
            this.setState(this.initData(nextProps));
            if (_.get(nextProps, 'info.integration_type') === INTEGRATE_TYPES.UEM && _.get(nextProps, 'info.integration_id')) {
                this.getIntegrateJSCode(nextProps.info.integration_id);
            }
        }
    }

    onChange = () => {
        this.setState({... ProductionFormStore.getState()});
    };

    componentWillUnmount() {
        ProductionFormStore.unlisten(this.onChange);
    }

    componentDidMount() {
        ProductionFormStore.listen(this.onChange);
        //添加产品界面
        if (this.props.formType === util.CONST.ADD) {
            //获取集成类型
            this.getIntegrationConfig();
        } else {//修改产品面板
            let integrationType = _.get(this.props, 'info.integration_type');
            if (integrationType === INTEGRATE_TYPES.UEM && _.get(this.props, 'info.integration_id')) {
                this.getIntegrateJSCode(this.props.info.integration_id);
            }
            //获取oplate\matomo产品列表
            if (this.isOplateOrMatomoType(integrationType)) {
                this.getProductList(integrationType);
            }
        }
    }

    //是否是oplate或matomo类型
    isOplateOrMatomoType(integration_type) {
        let typeList = [INTEGRATE_TYPES.OPLATE, INTEGRATE_TYPES.MATOMO];
        return typeList.indexOf(integration_type) !== -1;
    }

    getIntegrationConfig() {
        this.setState({isGettingIntegrateType: true});
        getIntegrationConfig(resultObj => {
            // 获取集成配置信息失败后的处理
            if (resultObj.errorMsg) {
                this.setState({isGettingIntegrateType: false, getItegrateTypeErrorMsg: resultObj.errorMsg});
            } else {
                //集成类型： uem、oplate、matomo
                let integrateType = _.get(resultObj, 'type');
                this.setState({isGettingIntegrateType: false, integrateType, getItegrateTypeErrorMsg: ''});
                //获取oplate\matomo产品列表
                if (this.isOplateOrMatomoType(integrateType)) {
                    this.getProductList(integrateType);
                }
            }
        });
    }

    getProductList(integrationType) {
        if (_.get(productList, '[0]')) {
            this.setState({productList: productList});
        } else {
            $.ajax({
                url: '/rest/product/' + integrationType,
                type: 'get',
                dataType: 'json',
                data: {page_num: 1, page_size: 1000},
                success: (result) => {
                    productList = result || [];
                    this.setState({productList: productList});
                },
                error: (xhr) => {
                    productList = [];
                    this.setState({productList: productList});
                }
            });
        }
    }

    //集成opalte、Matomo产品
    integrateProdcut = () => {
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            } else {
                this.setState({isAddingProduct: true});
                $.ajax({
                    url: '/rest/product/' + values.type,
                    type: 'post',
                    dataType: 'json',
                    data: {ids: values.products.join(',')},
                    success: (result) => {
                        this.setState({
                            isAddingProduct: false,
                            addErrorMsg: ''
                        });
                        if (_.get(result, '[0]')) {
                            _.each(result, item => {
                                this.props.afterOperation(this.props.formType, item);
                            });
                            this.props.closeRightPanel();
                        }
                    },
                    error: (xhr) => {
                        this.setState({
                            isAddingProduct: false,
                            addErrorMsg: xhr.responseJSON || Intl.get('crm.154', '添加失败')
                        });
                    }
                });
            }
        });
    }

    handleCancel = (e) => {
        e.preventDefault();
        this.props.closeRightPanel();
    };

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            } else {
                //所有者各项唯一性验证均不存在且没有出错再添加
                let production = _.extend({}, values);
                if (production.name) {
                    production.name = _.trim(production.name);
                }
                if (production.code) {
                    production.code = _.trim(production.code);
                }
                if (production.description) {
                    production.description = _.trim(production.description);
                }
                if (production.price) {
                    production.price = _.toNumber(_.trim(production.price));
                }
                if (production.sales_unit) {
                    production.sales_unit = _.trim(production.sales_unit);
                }
                if (production.specifications) {
                    production.specifications = _.trim(production.specifications);
                }
                if (production.url) {
                    production.url = _.trim(production.url);
                }
                if (this.props.formType === util.CONST.ADD) {
                    production.create_time = new Date().getTime();
                    if (values.type) {
                        //集成类型不存在或集成类型为uem时，
                        if (values.type === INTEGRATE_TYPES.UEM) {
                            this.addUemProduction(production);
                        }
                    } else {//添加默认类型的产品
                        //设置正在保存中
                        ProductionFormAction.setSaveFlag(true);
                        ProductionFormAction.addProduction(production);
                    }
                } else {
                    production.id = this.props.info.id;
                    //设置正在保存中
                    ProductionFormAction.setSaveFlag(true);
                    ProductionFormAction.editProduction(production);
                }
            }
        });
    };

    addUemProduction = (production) => {
        this.setState({isAddingProduct: true});
        $.ajax({
            url: '/rest/product/uem',
            type: 'post',
            dataType: 'json',
            data: production,
            success: (result) => {
                if (result) {
                    let integration_id = _.get(result, 'integration_id');
                    this.setState({addErrorMsg: '', isAddingProduct: false, integrationId: integration_id});
                    if (integration_id) {
                        this.getIntegrateJSCode(integration_id);
                    }
                    this.props.afterOperation(this.props.formType, result);
                } else {
                    this.setState({
                        isAddingProduct: false,
                        addErrorMsg: Intl.get('crm.154', '添加失败')
                    });
                }
            },
            error: (xhr) => {
                this.setState({
                    isAddingProduct: false,
                    addErrorMsg: xhr.responseJSON || Intl.get('crm.154', '添加失败')
                });
            }
        });
    }

    getIntegrateJSCode(integration_id) {
        $.ajax({
            url: '/rest/product/uem/js',
            type: 'get',
            dataType: 'json',
            data: {integration_id},
            success: (jsCode) => {
                this.setState({
                    jsCode: jsCode.code,
                    getJSCodeMsg: ''
                });

            },
            error: (xhr) => {
                this.setState({
                    getJSCodeMsg: xhr.responseJSON || Intl.get('app.user.failed.get.apps', '获取失败')
                });
            }
        });
    }

    uploadImg = (src) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.head-image-container .update-logo-desr'), '上传产品logo');
        this.props.form.setFieldsValue({preview_image: src});
    };

    //关闭
    closePanel = () => {
        this.props.closeRightPanel();
    };
    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.props.afterOperation(this.props.formType, this.state.savedProduction);
        this.props.closeRightPanel();
    };
    testUemProduct = () => {
        let integration_id = this.props.formType === util.CONST.ADD ? this.state.integrationId : _.get(this.props, 'info.integration_id');
        if (!integration_id) return;
        this.setState({isTesting: true});
        $.ajax({
            url: '/rest/product/uem/test',
            type: 'get',
            dataType: 'json',
            data: {integration_id},
            success: (result) => {
                if (result) {
                    this.setState({
                        testResult: 'success',
                        isTesting: false,
                    });
                } else {
                    this.setState({
                        testResult: 'error',
                        isTesting: false,
                    });
                }
            },
            error: (xhr) => {
                this.setState({
                    testResult: 'error',
                    isTesting: false,
                });
            }
        });
    }
    copyJSCode = () => {
        this.setState({jsCopied: true});
        setTimeout(() => {
            this.setState({jsCopied: false});
        }, 1000);
    }

    renderTestResult() {
        if (this.state.testResult === 'success') {
            return (<span className="test-success-tip">
                {Intl.get('user.user.add.success', '添加成功')},
                <a href="/user/list">{Intl.get('user.list.check.refresh', '刷新查看用户列表')}</a>
            </span>);
        } else if (this.state.testResult === 'error') {
            return (<span className="test-error-tip">{Intl.get('user.test.error.tip', '测试失败')}</span>);
        } else {
            return null;
        }
    }

    renderFormContent() {
        const {getFieldDecorator} = this.props.form;
        let values = this.props.form.getFieldsValue();
        var headDescr = Intl.get('common.product', '产品');
        let saveResult = this.state.saveResult;
        let formHeight = $('body').height() - LAYOUT_CONST.HEADICON_H - LAYOUT_CONST.TITLE_H;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        let integrateType = this.props.formType === util.CONST.ADD ? this.state.integrateType : this.props.info.integration_type;
        return (
            <Form layout='horizontal' className="form" autoComplete="off">
                <FormItem id="preview_image">
                    {getFieldDecorator('preview_image', {
                        initialValue: this.props.info.preview_image
                    })(
                        <div>
                            <HeadIcon
                                headIcon={this.props.info.preview_image || values.preview_image}
                                iconDescr={values.name || headDescr}
                                isEdit={true}
                                onChange={this.uploadImg}
                                isUserHeadIcon={true}
                            />
                            <Input type="hidden" name="preview_image" id="preview_image"/>
                        </div>
                    )}
                </FormItem>
                <div className="product-form-scroll" style={{height: formHeight}}>
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <div id="product-add-form">
                            <FormItem
                                label={Intl.get('config.product.type', '产品类型')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('type', {
                                    initialValue: integrateType
                                })(
                                    this.props.formType === util.CONST.ADD ? (
                                        <RadioGroup onChange={this.onTypeChange}>
                                            <RadioButton value="">{Intl.get('crm.119', '默认')}</RadioButton>
                                            {integrateType ? (
                                                <RadioButton value={integrateType}>
                                                    {integrateType.toUpperCase()}
                                                </RadioButton>) : null}
                                        </RadioGroup>) : (
                                        <RadioGroup>
                                            <RadioButton value={integrateType}>
                                                {integrateType ? integrateType.toUpperCase() : Intl.get('crm.119', '默认')}
                                            </RadioButton>
                                        </RadioGroup>)
                                )}
                            </FormItem>
                            {this.isOplateOrMatomoType(values.type) ? (
                                <div>
                                    <FormItem
                                        label={Intl.get('common.product', '产品')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('products')(
                                            <Select
                                                mode="multiple"
                                                placeholder={Intl.get('config.product.select.tip', '请选择产品（可多选）')}
                                            >
                                                { _.map(this.state.productList, (item, idx) => {
                                                    return <Option key={idx} value={item.id}>{item.name}</Option>;
                                                })}
                                            </Select>
                                        )}
                                    </FormItem>
                                    <FormItem>
                                        <SaveCancelButton
                                            loading={this.state.isAddingProduct}
                                            saveErrorMsg={this.state.addErrorMsg}
                                            handleSubmit={this.integrateProdcut}
                                            handleCancel={this.handleCancel.bind(this)}
                                        />
                                    </FormItem>
                                </div>
                            ) : (
                                <div>
                                    <FormItem
                                        label={Intl.get('common.product.name', '产品名称')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('name', {
                                            initialValue: this.props.info.name,
                                            rules: [nameLengthRule]
                                        })(
                                            <Input name="name" id="name"
                                                placeholder={Intl.get('config.product.input.name', '请输入产品名称')}
                                            />
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get('config.product.code', '产品编号')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('code', {
                                            initialValue: this.props.info.code,
                                            rules: [{
                                                required: false,
                                                min: 0,
                                                max: 50,
                                                message: Intl.get('crm.contact.name.length', '请输入最多50个字符')
                                            }]
                                        })(
                                            <Input name="code" id="code" type="text"
                                                placeholder={Intl.get('config.product.input.code', '请输入产品编号')}/>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get('config.product.desc', '产品描述')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('description', {
                                            initialValue: this.props.info.description,
                                        })(
                                            <Input name="description" id="description" type="text"
                                                placeholder={Intl.get('config.product.input.desc', '请输入产品描述')}/>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get('config.product.price', '产品单价')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('price', {
                                            initialValue: this.props.info.price || 0,
                                            rules: [{
                                                required: true,
                                                type: 'number',
                                                message: Intl.get('config.product.input.number', '请输入数字'),
                                                transform: (value) => {
                                                    return +value;
                                                }
                                            }]
                                        })(
                                            <Input name="price" id="price" type="text"/>
                                        )}
                                        < div className='currency_unit'>{Intl.get('contract.82', '元')}</div>
                                    </FormItem>

                                    <FormItem
                                        label={Intl.get('config.product.sales_unit', '计价单位')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('sales_unit', {
                                            initialValue: this.props.info.sales_unit,
                                            rules: [{
                                                required: true,
                                                message: Intl.get('config.product.input.sales_unit', '请输入计价单位')
                                            }]
                                        })(
                                            <Input name="sales_unit" id="sales_unit" type="text"/>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get('config.product.spec', '规格或版本')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('specifications', {
                                            initialValue: this.props.info.specifications,
                                        })(
                                            <Input name="specifications" id="specifications" type="text"
                                                placeholder={Intl.get('config.product.input.spec', '请输入产品规格(或版本)')}/>
                                        )}
                                    </FormItem>
                                    <FormItem
                                        label={Intl.get('config.product.url', '访问地址')}
                                        {...formItemLayout}
                                    >
                                        {getFieldDecorator('url', {
                                            initialValue: this.props.info.url,
                                        })(
                                            <Input name="url" id="url" type="text"
                                                placeholder={Intl.get('config.product.input.url', '请输入访问地址')}/>
                                        )}
                                    </FormItem>
                                    {this.state.create_time ?
                                        <FormItem
                                            label={Intl.get('config.product.create_time', '创建时间')}
                                            {...formItemLayout}
                                        >
                                            {getFieldDecorator('create_time', {
                                                initialValue: this.state.create_time
                                            })(
                                                <Input disabled='true' name="create_time" id="create_time" type="text"/>
                                            )}
                                        </FormItem> : null
                                    }

                                    {this.state.jsCode ? (
                                        <FormItem
                                            className='jscode-form-item'
                                            label={Intl.get('common.trace.code', '跟踪代码')}
                                            {...formItemLayout}
                                        >
                                            <CopyToClipboard text={this.state.jsCode}
                                                onCopy={this.copyJSCode}>
                                                <Button size='default' type="primary" className='copy-btn'>
                                                    {Intl.get('user.jscode.copy', '复制')}
                                                </Button>
                                            </CopyToClipboard>
                                            {this.state.jsCopied ? (
                                                <span className="copy-success-tip">
                                                    {Intl.get('user.copy.success.tip', '复制成功！')}
                                                </span>) : null}
                                        </FormItem>) : null}
                                    {this.state.jsCode ? (
                                        <FormItem>
                                            <div className="access-step-tip margin-style js-code-contianer">
                                                <pre id='matomo-js-code'>{this.state.jsCode}</pre>
                                                <span className="js-code-user-tip">
                                                    <span className="attention-flag"> * </span>
                                                    {Intl.get('user.jscode.use.tip', '请将以上js代码添加到应用页面的header中，如已添加')}
                                                    <Button size='default' type="primary"
                                                        onClick={this.testUemProduct}>{Intl.get('user.jscode.test.btn', '点击测试')}</Button>
                                                    {this.renderTestResult()}
                                                </span>
                                            </div>
                                        </FormItem>) : null}
                                    {//添加完uem产品，展示jscode时，不需要再展示保存按钮
                                        this.props.formType === util.CONST.ADD && this.state.integrationId ? null : (
                                            <FormItem>
                                                <SaveCancelButton
                                                    loading={this.state.isSaving || this.state.isAddingProduct}
                                                    saveErrorMsg={saveResult === 'error' ? this.state.saveMsg : this.state.addErrorMsg}
                                                    handleSubmit={this.handleSubmit.bind(this)}
                                                    handleCancel={this.handleCancel.bind(this)}
                                                />
                                            </FormItem>)}
                                    <FormItem>
                                        <div className="indicator">
                                            {saveResult === 'success' ?
                                                (
                                                    <AlertTimer time={1500}
                                                        message={this.state.saveMsg}
                                                        type={saveResult} showIcon
                                                        onHide={this.hideSaveTooltip}/>
                                                ) : ''
                                            }
                                        </div>
                                    </FormItem>
                                </div>)}
                        </div>
                    </GeminiScrollbar>
                </div>
            </Form>
        );
    }

    render() {
        let title = this.props.info.name ? Intl.get('config.product.modify', '修改产品') : Intl.get('config.product.add', '添加产品');
        return (
            <RightPanelModal
                className="product-add-container"
                isShowMadal={true}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={title}
                content={this.renderFormContent()}
                dataTracename={title}
            />);
    }
}

Production.propTypes = {
    info: PropTypes.object,
    formType: PropTypes.string,
    closeRightPanel: PropTypes.func,
    form: PropTypes.object,
    afterOperation: PropTypes.func
};
module.exports = Form.create()(Production);


