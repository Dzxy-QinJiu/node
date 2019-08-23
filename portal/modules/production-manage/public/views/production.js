/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */

import '../style/production-info.less';
import {Form, Icon, Input, Switch} from 'antd';
import Trace from 'LIB_DIR/trace';
import {productNameRule} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';

let HeadIcon = require('../../../../components/headIcon');
let FormItem = Form.Item;
let GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
let ProductionFormStore = require('../store/production-form-store');
let ProductionFormAction = require('../action/production-form-actions');
let ProductionAction = require('../action/production-actions');
let AlertTimer = require('../../../../components/alert-timer');
let util = require('../utils/production-util');
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
import {getUemJSCode} from 'PUB_DIR/sources/utils/uem-js-code';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import CustomVariable from 'CMP_DIR/custom-variable/custom_variable';
import DetailCard from 'CMP_DIR/detail-card';
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import classNames from 'classnames';

const LAYOUT_CONST = {
    HEADICON_H: 107,//头像的高度
    TITLE_H: 94,//标题的高度
    TITLE_EDIT_FIELD_WIDTH: 256,//标题输入框宽度
    EDIT_FIELD_WIDTH: 346,//卡片输入框宽度
    BOTTOM: 50,//底部长度
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
            firstLoaded: false, // 是否第一次加载完
            isJsCardShow: false,//是否展示Js采集用户信息card
            addUemProductErrorMsg: '',//改为集成错误信息
            isAddingUemProduct: false,//正在添加为集成产品
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
        this.firstLoaded();
    }

    firstLoaded() {
        if(!this.state.firstLoaded) {
            this.setState({firstLoaded: true});
        }
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
                    if (this.props.formType === util.CONST.ADD) {
                        if (key === 'price') {
                            production.price = _.toNumber(_.trim(value));
                        } else if (key !== 'useJS') {
                            production[key] = _.trim(value);
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
                }
                production.id = oldProduct.id;
                //设置正在保存中
                ProductionFormAction.setSaveFlag(true);
                ProductionFormAction.editProduction(production);
            }
        });
    };

    addUemProduction = (production, successFunc, errorFunc) => {
        this.setState({isAddingUemProduct: true});
        $.ajax({
            url: '/rest/product/uem',
            type: 'post',
            dataType: 'json',
            data: production,
            success: (result) => {
                if (result) {
                    successFunc(result);
                } else {
                    errorFunc(Intl.get('crm.154', '添加失败'));
                }
            },
            error: (xhr) => {
                errorFunc(xhr.responseJSON || Intl.get('crm.154', '添加失败'));
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

    //渲染添加面板内容
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
        let jsCode = '';
        if(this.state.uemSiteId && values.useJS !== false) {
            jsCode = getUemJSCode(this.state.uemSiteId, _.get(this.props.info,'custom_variable',{}));
        }
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
                                    rules: [productNameRule]
                                })(
                                    <Input
                                        name="name"
                                        id="name"
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
                            <FormItem>
                                <SaveCancelButton
                                    loading={this.state.isSaving || this.state.isAddingProduct}
                                    saveErrorMsg={saveResult === 'error' ? this.state.saveMsg : this.state.addErrorMsg}
                                    handleSubmit={this.handleSubmit.bind(this)}
                                    handleCancel={this.handleCancel.bind(this)}
                                />
                            </FormItem>
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

    onSwitchChange = (checked) => {
        //如果为打开switch
        if(checked) {
            this.addUemProduction(_.get(this.props, 'info'), (result) => {

                let integration_id = _.get(result, 'integration_id');
                let production = _.get(this.props, 'info');
                production.integration_id = integration_id;
                production.isEditBasic = false;
                production.changeType = INTEGRATE_TYPES.UEM;

                ProductionFormAction.editProduction(production, errorMsg => {
                    //如果编辑成功
                    if(_.isEmpty(errorMsg)) {
                        this.setState({
                            addUemProductErrorMsg: '',
                            isAddingUemProduct: false,
                            uemSiteId: integration_id,
                            isJsCardShow: true
                        });
                        this.props.afterOperation(this.props.formType, result);
                    } else { //如果编辑失败
                        this.setState({
                            isAddingUemProduct: false,
                            addUemProductErrorMsg: errorMsg,
                        });
                    }
                });
            }, (errorMsg) => {
                this.setState({
                    isAddingUemProduct: false,
                    addUemProductErrorMsg: errorMsg
                });
            });
        } else {
            let production = _.get(this.props, 'info');
            production.isEditBasic = false;
            production.changeType = INTEGRATE_TYPES.NORMAL;

            ProductionFormAction.editProduction(production, errorMsg => {
                if(_.isEmpty(errorMsg)) {
                    this.setState({
                        isJsCardShow: checked
                    });
                } else {
                    this.setState({
                        addUemProductErrorMsg: 'errorMsg'
                    });
                }
            });
        }
        // let production = ;
        // production.isEditBasic = false;
        // //选中了使用js集成用户数据，并且之前不是集成类型时
        // if (checked && !_.get(this.props, 'info.integration_type')) {
        //     //由普通产品改为uem集成类型的产品
        //     production.changeType = INTEGRATE_TYPES.UEM;
        // } else if (!checked && _.get(this.props, 'info.integration_type') === INTEGRATE_TYPES.UEM) {
        //     //由uem集成类型的产品改为普通产品
        //     production.changeType = INTEGRATE_TYPES.NORMAL;
        // }
        // ProductionFormAction.setSaveFlag(true);
        // ProductionFormAction.editProduction(production, errorMsg => {
        //     if(_.isEmpty(errorMsg)) {
        //         this.setState({
        //             isJsCardShow: checked
        //         });
        //     } else {
        //
        //     }
        // });
    }

    saveProductItem = (saveObj, successFunc, errorFunc) => {
        console.log(saveObj);
        let isProductLogo = false;
        //如果保存的内容是logo，手动为其添加id属性
        if(!_.get(saveObj, 'id')) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.head-image-container .update-logo-desr'), '上传产品logo');
            this.props.form.setFieldsValue({preview_image: saveObj});
            saveObj = {
                preview_image: saveObj,
                id: this.props.info.id
            };
            isProductLogo = true;
        }
        let production = {
            isEditBasic: true,
        };
        _.extend(production, saveObj);
        ProductionFormAction.setSaveFlag(true);
        ProductionFormAction.editProduction(production, errorMsg => {
            if(_.isEmpty(errorMsg)) {
                //头像保存没有成功的回调函数
                if(!isProductLogo){
                    successFunc();
                }
                this.props.afterOperation(this.props.formType, _.extend(this.props.info, saveObj));
            } else {
                errorFunc(errorMsg);
            }
        });
    }
    
    //渲染使用JS脚本采集用户数据card
    renderCustomVariable = () => {
        let dataWrapClass = classNames('add-user-data-warp',{'show-js-card': _.get(this.state, 'isJsCardShow')});
        return (
            <div className={dataWrapClass}>
                <div className="float-operation-content">
                    {_.get(this.state, 'isAddingUemProduct') ? <Icon type="loading" className="save-loading"/> : null}
                    {_.get(this.state, 'addUemProductErrorMsg') ? <span className="add-uem-error">{this.state.addUemProductErrorMsg}</span> : null}
                    <Switch size="small" onChange={this.onSwitchChange} checked={this.state.isJsCardShow}/>
                </div>
                {_.get(this.state, 'isJsCardShow') ? <div className="add-user-data-details">
                    <CustomVariable
                        ref={custom => this.custom = custom}
                        addProduct={_.get(this.props, 'info')}
                        value={this.state.custom_variable}
                        hasEditPrivilege={true}
                        addBtnTip={Intl.get('app.user.manage.add.custom.text', '添加属性')}
                    />
                </div> : null}
            </div>
        );
    }

    //渲染编辑面板内容
    renderProductDetails = () => {
        let values = this.props.form.getFieldsValue();
        let jsCode = '';
        if(this.state.uemSiteId && values.useJS !== false) {
            jsCode = getUemJSCode(this.state.uemSiteId, _.get(this.props.info,'custom_variable',{}));
        }
        jsCode = '1232131';
        //产品单价
        let productPrice = (<div className="product-detail-item">
            <span className="product-detail-item-title">{Intl.get('config.product.price', '产品单价')}：</span>
            <span className="product-detail-item-des">
                <BasicEditInputField
                    width={LAYOUT_CONST.EDIT_FIELD_WIDTH}
                    hasEditPrivilege={true}
                    id={this.props.info.id}
                    saveEditInput={this.saveProductItem}
                    value={this.props.info.price || 0}
                    afterTextTip={Intl.get('contract.82', '元')}
                    field='price'
                    type='textarea'
                    validators={[{
                        required: true,
                        type: 'number',
                        message: Intl.get('config.product.input.number', '请输入数字'),
                        transform: (value) => {
                            return +value;
                        }
                    }]}
                    addDataTip={Intl.get('config.product.add.price', '添加产品单价')}
                    placeholder={Intl.get( 'config.product.input.price', '请输入产品单价')}
                />
            </span>
        </div>);
        //产品单位
        let priceUnit = (<div className="product-detail-item">
            <span className="product-detail-item-title">{Intl.get('config.product.sales_unit', '计价单位')}：</span>
            <span className="product-detail-item-des">
                <BasicEditInputField
                    width={LAYOUT_CONST.EDIT_FIELD_WIDTH}
                    hasEditPrivilege={true}
                    id={this.props.info.id}
                    saveEditInput={this.saveProductItem}
                    value={this.props.info.sales_unit || 0}
                    field='sales_unit'
                    type='textarea'
                    validators={[{
                        required: true,
                        message: Intl.get('config.product.input.sales_unit', '请输入计价单位')
                    }]}
                    addDataTip={Intl.get('config.product.add.sales_unit', '添加计价单位')}
                    placeholder={Intl.get( 'config.product.input.sales_unit', '请输入计价单位')}
                />
            </span>
        </div>);
        //访问地址
        let accessAddress = (<div className="product-detail-item">
            <span className="product-detail-item-title">{Intl.get('config.product.url', '访问地址')}：</span>
            <span className="product-detail-item-des">
                <BasicEditInputField
                    width={LAYOUT_CONST.EDIT_FIELD_WIDTH}
                    hasEditPrivilege={true}
                    id={this.props.info.id}
                    saveEditInput={this.saveProductItem}
                    value={this.props.info.url}
                    field='url'
                    type='textarea'
                    addDataTip={Intl.get('config.product.add.address', '添加访问地址')}
                    placeholder={Intl.get('config.product.input.url', '请输入访问地址')}
                />
            </span>
        </div>);
        //产品描述
        let productDescription = (<div className="product-detail-item">
            <span className="product-detail-item-title">{Intl.get('config.product.desc', '产品描述')}：</span>
            <span className="product-detail-item-des">
                <BasicEditInputField
                    width={LAYOUT_CONST.EDIT_FIELD_WIDTH}
                    hasEditPrivilege={true}
                    id={this.props.info.id}
                    saveEditInput={this.saveProductItem}
                    value={this.props.info.description}
                    field='description'
                    type='textarea'
                    addDataTip={Intl.get('config.product.add.desc', '添加产品描述')}
                    placeholder={Intl.get('config.product.input.desc', '请输入产品描述')}
                />
            </span>
        </div>);
        //创建时间
        let foundTime = (<div className="product-detail-item">
            <span className="product-detail-item-title">{Intl.get('config.product.create_time', '创建时间')}：</span>
            <span className="product-detail-item-des">
                <BasicEditInputField
                    width={LAYOUT_CONST.EDIT_FIELD_WIDTH}
                    hasEditPrivilege={false}
                    id={this.props.info.id}
                    //saveEditInput={this.saveTraceContentInfo}
                    value={this.state.create_time}
                    field='create_time'
                    type='textarea'
                />
            </span>
        </div>);
        let height = $(window).height() - $('.product-info-title').height() - LAYOUT_CONST.BOTTOM;
        let addUserData = classNames('product-add-user-data-card', {
            'warped': !_.get(this.state, 'isJsCardShow')
        });
        return (<div className="product-details-content">
            <div className="product-info-title">
                <div className="product-icon">
                    <HeadIcon
                        headIcon={this.props.info.preview_image}
                        isNotShowUserName={true}
                        isEdit={true}
                        onChange={this.saveProductItem}
                        isUserHeadIcon={true}
                        userName={this.props.info.name}
                    />
                </div>
                <div className="product-info">
                    <div className="product-title">
                        <BasicEditInputField
                            hasEditPrivilege={true}
                            id={this.props.info.id}
                            saveEditInput={this.saveProductItem}
                            value={this.props.info.name}
                            field='name'
                            type='textarea'
                            validators={[nameLengthRule]}
                            placeholder={Intl.get('config.product.input.name', '请输入产品名称')}
                            hasMoreRow={true}
                        />
                    </div>
                    <div className="product-item product-version">
                        <div className="product-item-key">{Intl.get('config.product.spec', '规格/版本')}：</div>
                        <div className="product-item-editor">
                            <BasicEditInputField
                                width={LAYOUT_CONST.TITLE_EDIT_FIELD_WIDTH}
                                hasEditPrivilege={true}
                                id={this.props.info.id}
                                saveEditInput={this.saveProductItem}
                                value={this.props.info.specifications}
                                field='specifications'
                                type='textarea'
                                addDataTip={Intl.get('config.product.add.spec','添加产品规格(或版本)')}
                                placeholder={Intl.get('config.product.input.spec', '请输入产品规格(或版本)')}
                                hasMoreRow={true}
                            />
                        </div>
                    </div>
                    <div className="product-item product-identifier">
                        <div className="product-item-key">{Intl.get('config.product.code', '产品编号')}：</div>
                        <div className="product-item-editor">
                            <BasicEditInputField
                                width={LAYOUT_CONST.TITLE_EDIT_FIELD_WIDTH}
                                hasEditPrivilege={true}
                                id={this.props.info.id}
                                saveEditInput={this.saveProductItem}
                                value={this.props.info.code}
                                field='code'
                                type='textarea'
                                addDataTip={Intl.get('config.product.add.code', '添加产品编号')}
                                placeholder={Intl.get('config.product.input.code', '请输入产品编号')}
                                hasMoreRow={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="product-card-items" style={{height: height}}>
                <GeminiScrollBar>
                    <DetailCard content={productPrice}/>
                    <DetailCard content={priceUnit}/>
                    <DetailCard content={accessAddress}/>
                    <DetailCard content={productDescription}/>
                    {_.get(this.state, 'create_time') ? <DetailCard content={foundTime}/> : null}
                    {_.isEqual(_.get(this.state, 'integrateType'), INTEGRATE_TYPES.UEM) ?
                        <div className="product-card-with-switch">
                            <DetailCard
                                className="product-add-user-data-card"
                                title={`${Intl.get('config.product.js.collect.user','使用JS脚本采集用户数据')}:`}
                                content={this.renderCustomVariable(jsCode)}
                                titleBottomBorderNone={!_.get(this.state, 'isJsCardShow')}
                            />
                        </div>
                        : null}
                </GeminiScrollBar>
            </div>
        </div>);
    }

    render() {
        let isShowModal = true;
        let dataTracename = Intl.get('config.product.add', '添加产品');
        if (this.props.formType === util.CONST.EDIT) {
            isShowModal = false;
            dataTracename = Intl.get('config.product.modify', '修改产品');
        }
        let content = this.props.formType === util.CONST.EDIT ? this.renderProductDetails() : this.renderFormContent();
        return (
            <RightPanelModal
                className="product-add-container"
                isShowMadal={isShowModal}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
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