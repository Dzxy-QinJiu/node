/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */

require('../style/production-info.less');

import {Form, Input, Icon} from 'antd';
import Trace from 'LIB_DIR/trace';
import {nameLengthRule} from 'PUB_DIR/sources/utils/validate-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';

let FormItem = Form.Item;
let GeminiScrollbar = require('../../../../components/react-gemini-scrollbar');
let ProductionFormStore = require('../store/production-form-store');
let ProductionFormAction = require('../action/production-form-actions');
let AlertTimer = require('../../../../components/alert-timer');
let util = require('../utils/production-util');


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
        return {create_time: props.info.create_time ? moment(props.info.create_time).format(oplateConsts.DATE_FORMAT) : ''};
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.info.id !== nextProps.info.id)
            this.setState(this.initData(nextProps));
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
                //设置正在保存中
                ProductionFormAction.setSaveFlag(true);
                if (this.props.formType === util.CONST.ADD) {
                    production.create_time = new Date().getTime();
                    ProductionFormAction.addProduction(production);
                } else {
                    production.id = this.props.info.id;
                    ProductionFormAction.editProduction(production);
                }
            }
        });
    };


    uploadImg = (src) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.head-image-container .update-logo-desr'), '上传头像');
        this.props.form.setFieldsValue({image: src});
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

    renderFormContent() {
        const {getFieldDecorator} = this.props.form;
        let saveResult = this.state.saveResult;
        let formHeight = $('body').height() - LAYOUT_CONST.HEADICON_H - LAYOUT_CONST.TITLE_H;
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 19},
        };
        return (
            <Form layout='horizontal' className="form" autoComplete="off">
                <div className="user-form-scroll" style={{height: formHeight}}>
                    <GeminiScrollbar className="geminiScrollbar-vertical">
                        <div id="user-add-form">
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
                                    <Input name="specifications" id="preview_image" type="text"
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
                            <FormItem>
                                <SaveCancelButton loading={this.state.isSaving}
                                    saveErrorMsg={saveResult === 'error' ? this.state.saveMsg : ''}
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

    render() {
        let title = this.props.info.name ? Intl.get('config.product.modify', '修改产品') : Intl.get('config.product.add', '添加产品');
        return (
            <RightPanelModal
                className="member-add-container"
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


