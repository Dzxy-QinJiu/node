/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */

require('../style/production-info.less');

import {Form, Input, Icon, Radio, Button, Select, Checkbox} from 'antd';
const Option = Select.Option;
import Trace from 'LIB_DIR/trace';
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

let HeadIcon = require('../../../../components/headIcon');
let FormItem = Form.Item;
let GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
let ProductionFormStore = require('../store/production-form-store');
let ProductionFormAction = require('../action/production-form-actions');
let ProductionAction = require('../action/production-actions');
let AlertTimer = require('../../../../components/alert-timer');
let util = require('../utils/production-util');
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {getUemJSCode} from 'PUB_DIR/sources/utils/uem-js-code';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';

const LAYOUT_CONST = {
    HEADICON_H: 107,//头像的高度
    TITLE_H: 94//标题的高度
};

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
        let uemSiteId = _.get(props, 'info.integration_type') === INTEGRATE_TYPES.UEM ? _.get(props, 'info.integration_id', '') : '';
        return {
            create_time: props.info.create_time ? moment(props.info.create_time).format(oplateConsts.DATE_FORMAT) : '',
            isGettingIntegrateType: false,//正在获取集成类型
            getItegrateTypeErrorMsg: '',//获取集成类型是否
            integrateType: _.get(props, 'info.integration_type') || props.integrateType,//集成类型
            uemSiteId: uemSiteId,//uem产品的集成id
            productType: '',//产品类型
            isAddingProduct: false, //正在添加产品
            addErrorMsg: '',//添加失败的错误提示
            testResult: '',
            isTesting: false,
            jsCopied: false
        };
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.info.id !== nextProps.info.id) {
            this.setState(this.initData(nextProps));
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
                let production = {};
                let oldProduct = this.props.info;
                //数据处理
                _.each(values, (value, key) => {
                    //添加
                    if (this.props.formType === util.CONST.ADD) {
                        if (key === 'price') {
                            production.price = _.toNumber(_.trim(value));
                        } else if (key !== 'useJS') {
                            production[key] = _.trim(value);
                        }
                    } else {//修改（修改哪些项传哪些项）
                        if (key === 'price') {
                            let priceVal = _.toNumber(_.trim(value));
                            if (priceVal !== oldProduct.price) {
                                production.price = priceVal;
                            }
                        } else if (key !== 'useJS') {
                            let newVal = _.trim(value);
                            if (newVal !== oldProduct[key]) {
                                production[key] = newVal;
                            }
                        }
                    }
                });
                //添加
                if (this.props.formType === util.CONST.ADD) {
                    production.create_time = new Date().getTime();
                    if (values.useJS) {
                        //添加集成类型为uem的产品，
                        this.addUemProduction(production);
                    } else {//添加默认的产品
                        //设置正在保存中
                        ProductionFormAction.setSaveFlag(true);
                        ProductionFormAction.addProduction(production);
                    }
                } else {//修改
                    //是否修改基本信息
                    production.isEditBasic = true;
                    if (_.isEmpty(production)) {
                        //未修改基本信息
                        production.isEditBasic = false;
                    }
                    //选中了使用js集成用户数据，并且之前不是集成类型时
                    if (values.useJS && !_.get(this.props, 'info.integration_type')) {
                        //由普通产品改为uem集成类型的产品
                        production.changeType = INTEGRATE_TYPES.UEM;
                    } else if (!values.useJS && _.get(this.props, 'info.integration_type') === INTEGRATE_TYPES.UEM) {
                        //由uem集成类型的产品改为普通产品
                        production.changeType = INTEGRATE_TYPES.NORMAL;
                    }
                    //未修改基本信息，也未修改集成类型
                    if (!production.isEditBasic && !production.changeType) return;
                    production.id = oldProduct.id;
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
                    this.setState({addErrorMsg: '', isAddingProduct: false, uemSiteId: integration_id});
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

    uploadImg = (src) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.head-image-container .update-logo-desr'), '上传产品logo');
        this.props.form.setFieldsValue({preview_image: src});
    };

    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.props.afterOperation(this.props.formType, this.state.savedProduction);
        //将普通产品成功修改为uem产品时
        if (_.get(this.state, 'savedProduction.changeType') === INTEGRATE_TYPES.UEM && _.get(this.state, 'savedProduction.id')) {
            //获取该产品的integration_id更新列表中的integration_id
            ProductionAction.getProductById(this.state.savedProduction.id, (data) => {
                if (_.get(data, 'integration_id')) {
                    this.setState({uemSiteId: data.integration_id});
                }
            });
        } else {
            this.props.closeRightPanel();
        }
    };
    testUemProduct = () => {
        let integration_id = this.state.uemSiteId;
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
        let headDescr = Intl.get('common.product', '产品');
        let saveResult = this.state.saveResult;
        let formHeight = $('body').height() - LAYOUT_CONST.HEADICON_H - LAYOUT_CONST.TITLE_H;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
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
                                label={Intl.get('config.product.spec', '规格/版本')}
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
                            {this.state.integrateType === INTEGRATE_TYPES.UEM ? (
                                <FormItem
                                    label=' '
                                    labelCol={{span: 2}}
                                    wrapperCol={{span: 22}}
                                    colon={false}
                                    className='useJS-form-item'
                                >
                                    {getFieldDecorator('useJS', {
                                        initialValue: !!_.get(this.props, 'info.integration_type'),//编辑时，集成类型存在，选中
                                        valuePropName: 'checked'
                                    })(
                                        <Checkbox>{Intl.get('config.product.js.collect.user', '使用JS脚本采集用户数据')}</Checkbox>
                                    )}
                                </FormItem>) : null}
                            {this.state.uemSiteId && values.useJS !== false ? (
                                <FormItem
                                    className='jscode-form-item'
                                    label={Intl.get('common.trace.code', '跟踪代码')}
                                    {...formItemLayout}
                                >
                                    <CopyToClipboard text={getUemJSCode(this.state.uemSiteId)}
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
                            {
                                this.state.uemSiteId && values.useJS !== false ? (
                                    <FormItem>
                                        <div className="access-step-tip margin-style js-code-contianer">
                                            <pre id='matomo-js-code'>{getUemJSCode(this.state.uemSiteId)}</pre>
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
                                this.props.formType === util.CONST.ADD && this.state.uemSiteId ? null : (
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
                        </div>
                    </GeminiScrollbar>
                </div>
            </Form>
        );
    }

    render() {
        let isShowModal = true;
        let title = Intl.get('config.product.add', '添加产品');
        let dataTracename = Intl.get('config.product.add', '添加产品');
        let content = this.renderFormContent();
        if (this.props.formType === util.CONST.EDIT) {
            isShowModal = false;
            title = Intl.get('config.product.modify', '修改产品');
            dataTracename = Intl.get('config.product.modify', '修改产品');
        }
        return (
            <RightPanelModal
                className="product-add-container"
                isShowMadal={isShowModal}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={title}
                content={content}
                dataTracename={dataTracename}
            />);
    }
}

Production.propTypes = {
    integrateType: PropTypes.string,
    info: PropTypes.object,
    formType: PropTypes.string,
    closeRightPanel: PropTypes.func,
    form: PropTypes.object,
    afterOperation: PropTypes.func
};
module.exports = Form.create()(Production);