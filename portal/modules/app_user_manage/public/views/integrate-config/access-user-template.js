/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by sunqingfeng on 2018/8/20.
 */
var React = require('react');
import {Button, Steps, message, Alert, Form, Input, Icon} from 'antd';
const FormItem = Form.Item;
const PropTypes = require('prop-types');
require('./access-user-template.less');
const Step = Steps.Step;
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {getUemJSCode} from 'PUB_DIR/sources/utils/uem-js-code';
import DetailCard from 'CMP_DIR/detail-card';
import Spinner from 'CMP_DIR/spinner';
import Trace from 'LIB_DIR/trace';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import RightPanelScrollBar from 'MOD_DIR/crm/public/views/components/rightPanelScrollBar';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import DefaultUserLogoTitle from 'CMP_DIR/default-user-logo-title';
import CustomVariable from './custom-variable';
import rightPanelUtil from 'CMP_DIR/rightPanel';
var RightPanel = rightPanelUtil.RightPanel;
const SET_TIME_OUT = {
    TRANSITION_TIME: 600,//右侧面板动画隐藏的时间
    LOADING_TIME: 1500//避免在第三步时关闭太快，加上延时展示loading效果
};
const LAYOUT = {
    INITIALWIDTH: 504,
    SMALLWIDTH: 24,
    LARGEWIDTH: 75,
    TOP_DISTANCE: 120,
    BOTTOM_DISTANCE: 80,
    TABLE_TOP: 40
};
function noop() {}
let className = require('classnames');
const steps = [{
    title: Intl.get('config.product.add', '添加产品'),
    content: 'First-content',
}, {
    title: Intl.get('app.manage.configure.access.info', '配置接入信息'),
    content: 'Second-content',
}];

class AccessUserTemplate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0,//进度条的步骤
            isAddingProduct: false, //正在添加产品
            addErrorMsg: '', //添加失败信息
            addProduct: null,//添加的产品
            testResult: '',//测试结果返回值 'success' 'error'
            isTesting: false, //正在测试
            custom_variable: [] //用户自定义变量
        };
    }

    //关闭模板面板
    handleCancel = (e) => {
        this.props.closeTemplatePanel();
        setTimeout(() => {
            this.setState({
                current: 0,
                isLoading: false,
            });
            e && e.preventDefault();
        },SET_TIME_OUT.TRANSITION_TIME);
    };

    //添加客户操作
    handleNextStep = (e) => {
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
                        this.setState({
                            addProduct: result,
                            addErrorMsg: '',
                            isAddingProduct: false,
                            current: 1
                        });
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
    }

    //渲染第一步内容区
    renderFirstStepContent = () => {
        const formItemLayout = {colon: false};
        const {getFieldDecorator} = this.props.form;
        return (
            <div className="first-step-content">
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
                        <div className='first-step-buttons'>
                            <Button size='default' type="default" onClick={this.handleCancel}>
                                {Intl.get('config.manage.realm.canceltext', '取消')}
                            </Button>
                            <Button size='default' type="primary" onClick={this.handleNextStep}>
                                {Intl.get('user.user.add.next', '下一步')}
                            </Button>
                            <div className='prompt-info'>
                                {this.state.isAddingProduct ? (
                                    <Icon type="loading" className="save-loading"/>) : this.state.addErrorMsg ? (
                                    <span className="save-error">{this.state.addErrorMsg}</span>
                                ) : null}
                            </div>
                        </div>
                    </FormItem>
                </Form>
            </div>
        );
    };

    // 添加自定义属性
    saveCustomVariable = (saveObj, successFunc, errorFunc) => {
        //是否修改基本信息
        saveObj.isEditBasic = true;
        $.ajax({
            url: '/rest/product',
            type: 'put',
            dataType: 'json',
            data: saveObj,
            success: (data) => {
                //修改成功{editBasicSuccess: true, editTypeSuccess:true}
                if (_.get(data, 'editBasicSuccess') && _.get(data, 'editTypeSuccess')) {
                    //保存成功后的处理
                    message.success(Intl.get('user.user.add.success', '添加成功'));
                    _.isFunction(successFunc) && successFunc();
                    this.setState({
                        custom_variable: saveObj.custom_variable
                    });
                } else {
                    _.isFunction(errorFunc) && errorFunc(Intl.get('member.add.failed', '添加失败！'));
                }
            },
            error: (xhr) => {
                _.isFunction(errorFunc) && errorFunc(xhr.responseJSON);
            }
        });
    }

    //复制Js代码
    copyJSCode = () => {
        this.setState({jsCopied: true});
        setTimeout(() => {
            this.setState({jsCopied: false});
        }, 1000);
    }

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

    //渲染使用JS脚本采集用户数据card
    renderCustomVariable = (jsCode) => {
        return (
            <div className="add-user-data-warp">
                <CustomVariable
                    id={_.get(this.state.addProduct,'id')}
                    value={this.state.custom_variable}
                    hasEditPrivilege={true}
                    addBtnTip={Intl.get('app.user.manage.add.custom.text', '添加属性')}
                    saveEditInput={this.saveCustomVariable}
                />
                <div className="access-step-tip margin-style js-code-contianer">
                    {jsCode ? (
                        <span>
                            <CopyToClipboard text={jsCode}
                                onCopy={this.copyJSCode}>
                                <a className='copy-btn'>
                                    {Intl.get('user.jscode.copy', '复制')}
                                </a>
                            </CopyToClipboard>
                            {this.state.jsCopied ? (
                                <span className="copy-success-tip">
                                    <Icon type="check-circle" theme="filled" />
                                    {Intl.get('user.copy.success.tip', '复制成功！')}
                                </span>) : null}
                        </span>) : (
                        <span className="js-code-label">{Intl.get('clue.has.no.data', '暂无')}</span>)
                    }
                    <span className="js-code-label">{Intl.get('common.trace.code', '跟踪代码')}： </span>
                    {jsCode ? (
                        <div className="access-step-tip margin-style js-code-contianer pre-code" style={{height: 200}}>
                            <GeminiScrollbar>
                                <pre id='matomo-js-code'>{jsCode}</pre>
                            </GeminiScrollbar>
                        </div>) : null}
                </div>
            </div>
        );
    }

    //渲染接入用户title card
    renderAccessTitle = () => {
        return (
            <div className='access-title' >
                <DefaultUserLogoTitle
                    nickName={_.get(this.state,'addProduct.name')}
                />
                <span>{_.get(this.state,'addProduct.name')} </span>
            </div>
        );
    }

    renderTestFooter = (jsCode) => {
        let testFooter = null;
        let testResult = _.get(this.state, 'testResult');
        let isLoading = _.get(this.state, 'isTesting');
        if(jsCode && _.isEqual(testResult, '')) {
            //当没有测试结果时
            testFooter = (<div className="js-code-user-tip">
                <ReactIntl.FormattedMessage
                    id="user.jscode.use.tip"
                    defaultMessage={'请{copyAndTraceCode}到产品页面的header中后测试'}
                    values={{
                        'copyAndTraceCode':
                            <CopyToClipboard text={jsCode} onCopy={this.copyJSCode}>
                                <a className='copy-btn'>
                                    <ReactIntl.FormattedMessage id="user.jscode.copy.trace" defaultMessage="复制跟踪代码"/>
                                </a>
                            </CopyToClipboard>
                    }}/>
                {isLoading ? <span className="test-loading"><Icon type="loading" /></span> : null}
                <Button size='default' type="primary" onClick={this.testUemProduct}>{Intl.get('user.jscode.test.btn', '测试')}</Button>
            </div>);
        } else if(jsCode && _.isEqual(testResult, 'success')) {
            //当测试成功时
            testFooter = (<div className="js-code-user-tip">
                <Icon type="check-circle" theme="filled" />
                <span className="test-success-tip">
                    {Intl.get('user.user.add.success', '添加成功')},
                    <a href="/user/list">{Intl.get('user.list.check.refresh', '刷新查看用户列表')}</a>
                </span>
            </div>);
        } else if(jsCode && _.isEqual(testResult, 'error')) {
            //当测试失败时
            testFooter = (<div className="js-code-user-tip">
                <Icon type="exclamation-circle" theme="filled" />
                <span className="test-error-tip">{Intl.get('user.test.error.tip', '测试失败')}</span>
                {isLoading ? <span className="test-loading"><Icon type="loading" /></span> : null}
                <Button size='default' type="primary" onClick={this.testUemProduct}>{Intl.get('user.jscode.test.btn', '测试')}</Button>
            </div>);
        }
        return testFooter;
    }

    //渲染第二步内容区
    renderSecondStepContent = () => {
        let jsCode = getUemJSCode(_.get(this.state, 'addProduct.integration_id'), this.state.custom_variable);
        let height = $(window).height() - LAYOUT.BOTTOM_DISTANCE - LAYOUT.TOP_DISTANCE;
        return (
            <div className="second-step-content" style ={{height: height}}>
                <GeminiScrollBar>
                    <DetailCard
                        content={this.renderAccessTitle()}
                    />
                    <DetailCard
                        className="add-user-data-card"
                        title={`${Intl.get('config.product.js.collect.user','使用JS脚本采集用户数据')}:`}
                        content={this.renderCustomVariable(jsCode)}
                    />
                </GeminiScrollBar>
                {this.renderTestFooter(jsCode)}
            </div>
        );

    };

    //不同步骤渲染不同的内容
    renderStepsContent = (current) => {
        let stepContent = null;
        switch (current) {
            case 0:
                stepContent = this.renderFirstStepContent();
                break;
            case 1:
                stepContent = this.renderSecondStepContent();
                break;
        }
        return stepContent;
    };

    render() {
        let current = this.state.current;
        let width = LAYOUT.INITIALWIDTH;
        let integrateConfigUrl = '/background_management/integration';
        let cls = className('access-user-step-container',{
            'show-modal': this.props.showFlag
        });
        return (
            <div className={cls}>
                <RightPanel className="access-user-template-panel white-space-nowrap"
                    showFlag={this.props.showFlag} data-tracename="导入模板"
                    style={{width: width}}
                >
                    <span className="iconfont icon-close access-user-btn" onClick={this.handleCancel}
                        data-tracename="点击关闭接入用戶面板"></span>
                    <div className="access-user-detail-wrap" style={{width: width - LAYOUT.SMALLWIDTH}}>
                        <div className="access-top-title">
                            {/*
                                <div className='other-access-way'>
                                    <Link
                                        to={integrateConfigUrl}>{Intl.get('user.access.way.other.tip', '其他方式接入')}</Link>
                                </div>
                            */}
                            {Intl.get('app.manage.access.user', '接入用户')}
                        </div>
                        <div className="access-title-top">
                            <Steps current={current}>
                                {steps.map(item => <Step key={item.title} title={item.title}/>)}
                            </Steps>
                        </div>
                        <div className="access-detail-container">
                            {this.renderStepsContent(current)}
                        </div>
                    </div>
                </RightPanel>
            </div>
        );
    }
}

AccessUserTemplate.defaultProps = {
    showFlag: false,//控制导入面板是否展示
    closeTemplatePanel: noop,//关闭面板的回调
};
AccessUserTemplate.propTypes = {
    showFlag: PropTypes.bool,
    closeTemplatePanel: PropTypes.func,
    form: PropTypes.object
};
export default Form.create()(AccessUserTemplate);