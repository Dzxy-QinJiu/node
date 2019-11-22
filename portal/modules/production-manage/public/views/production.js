/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */

import '../style/production-info.less';
import {Form, Icon, Input, Switch,message, Popover} from 'antd';
import Trace from 'LIB_DIR/trace';
import {productNameRule, getNumberValidateRule, productNameRuleForValidator} from 'PUB_DIR/sources/utils/validate-util';
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
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import CustomVariable from 'CMP_DIR/custom-variable/custom_variable';
import DetailCard from 'CMP_DIR/detail-card';
import classNames from 'classnames';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import AddIpForm from './add-ip-form';
import productionAjax from '../ajax/production-ajax';
import production_manager_privilegeConfig from '../privilege-config'

const LAYOUT_CONST = {
    HEADICON_H: 107,//头像的高度
    TITLE_H: 94,//标题的高度
    TITLE_EDIT_FIELD_WIDTH: 256,//标题输入框宽度
    EDIT_FIELD_WIDTH: 340,//卡片输入框宽度
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
            isJsCardShow: !_.isEmpty(_.get(this.props.info,'integration_type')),//是否展示Js采集用户信息card
            addUemProductErrorMsg: '',//改为集成错误信息
            isAddingUemProduct: false,//正在添加为集成产品
            saveLogoErrorMsg: '',//保存产品Logo错误信息
            productionFilterIp: _.get(props, 'productionFilterIp.filter_ips', []),
            isShowAddIp: false, // 是否显示添加IP
            isAppFilterIpLoading: false, // 添加过滤ip loading
            isDeletingLoading: false, // 删除过滤ip loading
            deleteIpId: '', // 删除过滤ip的ID
        };
    };

    componentWillReceiveProps(nextProps) {
        // 查看产品详情，只有更换产品或是产品IP变化时，更新产品详情中相关数据
        if (this.props.info.id !== nextProps.info.id || !_.isEqual(this.props.productionFilterIp, nextProps.productionFilterIp)) {
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
                    ProductionFormAction.setSaveFlag(true);
                    ProductionFormAction.addProduction(production);
                }
                production.id = oldProduct.id;
                //设置正在保存中
                ProductionFormAction.setSaveFlag(true);
                ProductionFormAction.editProduction(production);
            }
        });
    };

    uploadImg = (src) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.head-image-container .update-logo-desr'), '上传产品logo');
        this.props.form.setFieldsValue({preview_image: src});
    };

    //去掉保存后提示信息
    hideSaveTooltip = () => {
        this.props.afterOperation(this.props.formType, this.state.savedProduction);
        this.props.openRightPanel();
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
                                    rules: [productNameRule],
                                    validateTrigger: 'onBlur'
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
                                        required: false,
                                        type: 'number',
                                        message: Intl.get('config.product.input.number', '请输入数字'),
                                        transform: (value) => {
                                            return +value;
                                        }
                                    }]
                                })(
                                    <Input
                                        placeholder={Intl.get( 'config.product.input.price', '请输入产品单价')}
                                        name="price" id="price" type="text"/>
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
                                        required: false,
                                        message: Intl.get('config.product.input.sales_unit', '请输入计价单位')
                                    }]
                                })(
                                    <Input
                                        placeholder={Intl.get('config.product.input.sales_unit', '请输入计价单位')}
                                        name="sales_unit" id="sales_unit" type="text"/>
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
        //如果为打开switch,尝试将产品变为uem集成
        if(checked) {
            this.setState({
                isAddingUemProduct: true,
            });
            let production = _.get(this.props, 'info');
            production.isEditBasic = false;
            production.changeType = INTEGRATE_TYPES.UEM;

            ProductionFormAction.editProduction(production, errorMsg => {
                //如果编辑成功
                if(_.isEmpty(errorMsg)) {
                    this.setState({
                        addUemProductErrorMsg: '',
                        isAddingUemProduct: false,
                        isJsCardShow: true
                    });
                    this.props.afterOperation(this.props.formType, production);
                } else { //如果编辑失败
                    this.setState({
                        isAddingUemProduct: false,
                        addUemProductErrorMsg: Intl.get('common.edit.failed','修改失败')
                    });
                }
            });
        } else { //如果关闭switch，尝试将uem产品变为普通产品
            this.setState({
                isAddingUemProduct: true,
            });
            let production = _.get(this.props, 'info');
            production.isEditBasic = false;
            production.changeType = INTEGRATE_TYPES.NORMAL;

            ProductionFormAction.editProduction(production, errorMsg => {
                if(_.isEmpty(errorMsg)) {
                    this.setState({
                        addUemProductErrorMsg: '',
                        isAddingUemProduct: false,
                        isJsCardShow: checked
                    });
                    this.props.afterOperation(this.props.formType, production);
                } else {
                    this.setState({
                        isAddingUemProduct: false,
                        addUemProductErrorMsg: Intl.get('common.edit.failed','修改失败')
                    });
                }
            });
        }
    }

    saveProductItem = (saveObj, successFunc, errorFunc) => {
        let isProductLogo = false;
        //如果保存的内容是logo，手动为其添加id属性
        if(!_.get(saveObj, 'id')) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.head-image-container .update-logo-desr'), '上传产品logo');
            this.props.form.setFieldsValue({preview_image: saveObj});
            saveObj = {
                id: this.props.info.id,
                preview_image: saveObj,
            };
            isProductLogo = true;
        }
        let production = {
            isEditBasic: true,
        };
        //为saveObj的输入内容做trim
        saveObj = _.mapValues(saveObj, obj => _.trim(obj));
        //如果保存的是产品单价，将其转化为number类型
        if(_.has(saveObj, 'price')) {
            saveObj.price = _.toNumber(saveObj.price);
        }
        _.extend(production, saveObj);
        ProductionFormAction.setSaveFlag(true);
        ProductionFormAction.editProduction(production, errorMsg => {
            if(_.isEmpty(errorMsg)) {
                //头像保存没有"successFunc"回调函数
                if(!isProductLogo){
                    successFunc();
                } else {
                    //头像保存成功，提示错误信息置空
                    this.setState({
                        saveLogoErrorMsg: ''
                    });
                }
                this.props.afterOperation(this.props.formType, _.extend(this.props.info, saveObj));
            } else {
                //头像保存失败的提示信息需要自己添加
                if(isProductLogo) {
                    this.setState({
                        saveLogoErrorMsg: Intl.get('common.save.failed','保存失败')
                    });
                }
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
                        addProduct={_.get(this.props, 'info')}
                        realValue={this.state.custom_variable}
                        hasEditPrivilege={true}
                        addBtnTip={Intl.get('app.user.manage.add.custom.text', '添加属性')}
                    />
                </div> : null}
            </div>
        );
    }

    handleShowAddIp = () => {
        this.setState({
            isShowAddIp: true
        });
    };

    renderDetailTitle = () => {
        return (
            <div className="ip-filter-title">
                <span className="content">
                    {Intl.get('product.filter.ip.title', '该产品统计分析时过滤以下IP：')}
                </span>
                {
                    hasPrivilege(production_manager_privilegeConfig.PRODUCTS_MANAGE) ? (
                        this.state.isShowAddIp ? null : (
                            <span className="operate-btn" onClick={this.handleShowAddIp}>
                                <i className="iconfont icon-plus"></i>
                            </span>
                        )
                    ) : null
                }
            </div>
        );
    };

    // 添加IP
    handleSubmitAddIp = (ipObj) => {
        let submitObj = {
            product_id: this.props.info.id,
            filter_ips: [ipObj.ip]
        };
        this.setState({
            isAppFilterIpLoading: true
        });
        productionAjax.productionAddFilterIP(submitObj).then((result) => {
            this.setState({
                isAppFilterIpLoading: false,
                isShowAddIp: false
            });
            let productionFilterIp = this.state.productionFilterIp;

            if (result) {
                productionFilterIp.unshift(ipObj.ip);
                this.setState({
                    productionFilterIp: productionFilterIp
                });
            } else {
                message.error(Intl.get('crm.154', '添加失败！'));
            }
        }, (errMsg) => {
            this.setState({
                isAppFilterIpLoading: false,
                isShowAddIp: false
            });
            message.error(errMsg || Intl.get('crm.154', '添加失败！'));
        });
    };

    // 取消保存添加的ip
    handleCancelAddIP = () => {
        this.setState({
            isShowAddIp: false
        });
    };

    // 渲染产品添加过滤IP
    renderProductionAddFilterIp = () => {
        return (
            <AddIpForm
                handleCancelAddIP={this.handleCancelAddIP}
                handleSubmitAddIp={this.handleSubmitAddIp}
                loading={this.state.isAppFilterIpLoading}
            />
        );
    };

    // 点击删除IP
    handleDeleteIP = (ipItem) => {
        this.setState({
            deleteIpId: ipItem.id
        });
    };

    // 确认删除IP
    handleConfirmDeleteIp = (item, event) => {
        event && event.stopPropagation();
        this.setState({
            isDeletingLoading: true
        });
        const deleteIpObj = {
            productId: this.props.info.id,
            ip: item.ip
        };
        productionAjax.productionDeleteFilterIP(deleteIpObj).then((result) => {
            this.setState({
                isDeletingLoading: false,
                deleteIpId: ''
            });
            if (result === true) { // 删除成功
                let productionFilterIp = _.filter(this.state.productionFilterIp, ip => ip !== item.ip);
                this.setState({
                    productionFilterIp: productionFilterIp
                });
            } else {
                message.error(Intl.get('crm.139', '删除失败！'));
            }
        }, (errMsg) => {
            message.error(errMsg || Intl.get('crm.139', '删除失败！'));
            this.setState({
                isDeletingLoading: false,
                deleteIpId: ''
            });
        });
    };

    // 取消删除IP
    cancelDeleteIp = () => {
        this.setState({
            deleteIpId: ''
        });
    };

    // 处理全局过滤IP
    handleGlobalFilterIp = () => {
        return (
            <div className="global-filter-ip">
                <i className="iconfont icon-tips"></i>
                <span className="content">
                    <ReactIntl.FormattedMessage
                        id="product.global.filter.ip"
                        defaultMessage={'请到全部产品{clickContent}页面删除'}
                        values={{
                            'clickContent': <span
                                onClick={this.props.showIpFilterPanel}
                                className="click-content"
                            >
                                {Intl.get('product.filter.ip', '过滤IP')}
                            </span>
                        }}
                    />
                </span>
            </div>
        );
    };

    renderDetailIpList = () => {
        let filterIps = this.state.productionFilterIp;
        let productionFilterIpList = [];
        // 产品过滤ip数据处理，和全局过滤IP一致，方便处理
        _.each(filterIps, (item, index) => {
            productionFilterIpList.push({ip: item, id: index, flag: 'singleFilter'});
        });

        let allFilterIpList = _.concat(productionFilterIpList, this.props.globalFilterIpList);
        return (
            <div className="ip-filter-content">
                {
                    this.state.isShowAddIp ? (
                        <div className="add-ip-content">
                            {this.renderProductionAddFilterIp()}
                        </div>
                    ) : null
                }
                <ul className="ip-content">
                    {_.map(allFilterIpList, ipItem => {
                        return (
                            <li
                                className="ip-item"
                                key={ipItem.id}
                            >
                                <span>{ipItem.ip}</span>
                                {
                                    ipItem.flag ? null : (
                                        <span className="describe-info">
                                            {Intl.get('product.global.ip.tips', '（全部产品过滤)')}
                                        </span>
                                    )
                                }
                                <span className="ip-delete-operator-zone">
                                    {

                                        ipItem.flag && ipItem.id === this.state.deleteIpId ? (
                                            <span className="item-delete-buttons">
                                                <span
                                                    className="item-delete-confirm"
                                                    disabled={this.state.isDeletingLoading}
                                                    onClick={this.handleConfirmDeleteIp.bind(this, ipItem)}
                                                >
                                                    {
                                                        this.state.isDeletingLoading ? <Icon type="loading"/> : null
                                                    }
                                                    {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                                </span>
                                                <span
                                                    className="item-delete-cancel"
                                                    onClick={this.cancelDeleteIp.bind(this, ipItem)}
                                                >
                                                    {Intl.get('common.cancel', '取消')}
                                                </span>
                                            </span>
                                        ) : (
                                            ipItem.flag ? (
                                                <span
                                                    onClick={this.handleDeleteIP.bind(this, ipItem)}
                                                    className="operate-btn"
                                                    data-tracename={'点击删除' + ipItem.ip}
                                                >
                                                    <i className="iconfont icon-delete handle-btn-item"></i>
                                                </span>
                                            ) : (
                                                <Popover
                                                    overlayClassName="global-filter-ip-popover"
                                                    content={this.handleGlobalFilterIp()}
                                                    placement="bottomRight"
                                                >
                                                    <i className="iconfont icon-delete handle-btn-item"></i>
                                                </Popover>
                                            )
                                        )
                                    }
                                </span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        );
    };

    //渲染编辑面板内容
    renderProductDetails = () => {
        //产品单价
        let productPrice = (<div className="product-detail-item">
            <span className="product-detail-item-title">{Intl.get('config.product.price', '产品单价')}：</span>
            <span className="product-detail-item-des">
                <BasicEditInputField
                    width={LAYOUT_CONST.EDIT_FIELD_WIDTH}
                    hasEditPrivilege={true}
                    id={this.props.info.id}
                    saveEditInput={this.saveProductItem}
                    value={_.toString(this.props.info.price)}
                    afterTextTip={Intl.get('contract.82', '元')}
                    field='price'
                    type='textarea'
                    validators={[getNumberValidateRule()]}
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
                    value={this.props.info.sales_unit}
                    field='sales_unit'
                    type='textarea'
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
                    value={this.state.create_time}
                    field='create_time'
                    type='textarea'
                />
            </span>
        </div>);
        let height = $(window).height() - $('.product-info-title').height() - LAYOUT_CONST.BOTTOM;
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
                    {_.get(this.state, 'saveLogoErrorMsg') ? <span className="save-logo-error">{_.get(this.state, 'saveLogoErrorMsg')}</span> : null}
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
                            validators={[productNameRuleForValidator]}
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
                    <DetailCard content={foundTime}/>
                    <DetailCard
                        title={this.renderDetailTitle()}
                        content={this.renderDetailIpList()}
                        className='ip-filter-card-container'
                    />
                    {_.isEqual(_.get(this.state, 'integrateType'), INTEGRATE_TYPES.UEM) ?
                        <div className="product-card-with-switch">
                            <DetailCard
                                className="product-add-user-data-card"
                                title={`${Intl.get('config.product.js.collect.user','使用JS脚本采集用户数据')}:`}
                                content={this.renderCustomVariable()}
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
    afterOperation: PropTypes.func,
    openRightPanel: PropTypes.func,
    globalFilterIpList: PropTypes.array,
    productionFilterIp: PropTypes.object,
    showIpFilterPanel: PropTypes.func,
};
module.exports = Form.create()(Production);
