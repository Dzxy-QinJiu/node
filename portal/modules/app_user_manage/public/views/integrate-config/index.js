/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/12/13.
 */
require('./index.less');

import {Input, Button, Form, Icon} from 'antd';
const FormItem = Form.Item;
import Logo from 'CMP_DIR/Logo';
import {Link} from 'react-router-dom';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {getUemJSCode} from 'PUB_DIR/sources/utils/uem-js-code';
import classNames from 'classnames';
const matomoSrc = require('./matomo.png');
const oplateSrc = require('./oplate.png');

class IntegrateConfigView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isAddingProduct: false,
            addErrorMsg: '',
            addProduct: null,//添加的产品
            jsCopied: false,
            testResult: '',//测试结果success、error
        };
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (err) return;
            this.setState({isAddingProduct: true});
            $.ajax({
                url: '/rest/product/uem',
                type: 'post',
                dataType: 'json',
                data: {name: _.trim(values.name)},
                success: (result) => {
                    if (result) {
                        this.setState({addProduct: result, addErrorMsg: '', isAddingProduct: false});
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
        });
    };

    testUemProduct = () => {
        let integration_id = _.get(this.state, 'addProduct.integration_id');
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

    render() {
        const {getFieldDecorator} = this.props.form;
        const formItemLayout = {colon: false};
        let integrateConfigUrl = '/background_management/integration';
        let addProduct = this.state.addProduct;
        let jsCode = _.get(addProduct, 'integration_id') ? getUemJSCode(addProduct.integration_id) : '';
        let integrateConfigCls = classNames('integrate-config-wrap', {
            'js-code-show': _.get(addProduct, 'name')
        });
        return (
            <div className={integrateConfigCls}>
                <div className="access-step-tip">{Intl.get('user.access.steps.tip', '您还没有接入用户，请按照下面流程接入用户')}</div>
                <div className="curtao-access-wrap">
                    {_.get(addProduct, 'name') ? (
                        <div className="integrate-js-code-wrap">
                            <div className="accesss-title">
                                <Logo size="24px" fontColor='#333' jumpUrl="#"/>
                            </div>
                            <div className="access-step-tip margin-style curtao-product-name">
                                <span className="js-code-label">{Intl.get('common.product.name', '产品名称')}：</span>
                                <span>{addProduct.name} </span>
                            </div>
                            <div className="access-step-tip margin-style js-code-contianer">
                                <span className="js-code-label">{Intl.get('common.trace.code', '跟踪代码')}： </span>
                                {jsCode ? (
                                    <span>
                                        <CopyToClipboard text={jsCode}
                                            onCopy={this.copyJSCode}>
                                            <Button size='default' type="primary" className='copy-btn'>
                                                {Intl.get('user.jscode.copy', '复制')}
                                            </Button>
                                        </CopyToClipboard>
                                        {this.state.jsCopied ? (
                                            <span className="copy-success-tip">
                                                {Intl.get('user.copy.success.tip', '复制成功！')}
                                            </span>) : null}
                                    </span>) : (
                                    <span className="js-code-label">{Intl.get('clue.has.no.data', '暂无')}</span>)}
                            </div>
                            {jsCode ? (
                                <div className="access-step-tip margin-style js-code-contianer">
                                    <pre id='matomo-js-code'>{jsCode}</pre>
                                    <span className="js-code-user-tip">
                                        <span className="attention-flag"> * </span>
                                        {Intl.get('user.jscode.use.tip', '请将以上js代码添加到应用页面的header中，如已添加')}
                                        <Button size='default' type="primary"
                                            onClick={this.testUemProduct}>{Intl.get('user.jscode.test.btn', '点击测试')}</Button>
                                        {this.renderTestResult()}
                                    </span>
                                </div>) : null}
                        </div>
                    ) : (
                        <Form className="integrate-config-form">
                            <FormItem
                                {...formItemLayout}
                            >
                                {getFieldDecorator('name', {
                                    rules: [{
                                        required: true,
                                        message: Intl.get('config.product.input.name', '请输入产品名称')
                                    }],
                                })(
                                    <Input placeholder={Intl.get('config.product.input.name', '请输入产品名称')}/>
                                )}
                            </FormItem>
                            <FormItem {...formItemLayout}>
                                <Button size='default' type="primary" onClick={this.handleSubmit}>
                                    {Intl.get('common.add', '添加')}
                                </Button>
                                {this.state.isAddingProduct ? (
                                    <Icon type="loading" className="save-loading"/>) : this.state.addErrorMsg ? (
                                    <span className="save-error">{this.state.addErrorMsg}</span>
                                ) : null}
                            </FormItem>
                            <div className="access-step-tip other-access-way-wrap">
                                <span>{Intl.get('user.access.way.tip', '您如果使用了以下产品，还可以通过以下方式接入用户')}: </span>
                                <div className="other-access-way">
                                    <Link to={integrateConfigUrl}><img src={matomoSrc} className="matomo-image"/></Link>
                                    <Logo size="24px" fontColor='#6da5e1' logoSrc={oplateSrc} logoText='OPLATE' jumpUrl={integrateConfigUrl}/>
                                </div>
                            </div>
                        </Form>)}
                </div>
            </div>
        );
    }
}

IntegrateConfigView.propTypes = {
    form: PropTypes.object
};
export default Form.create()(IntegrateConfigView);