/** Created by 2019-05-28 16:23 */
// 自定义属性的添加，编辑
import './custom-variable.less';
import { Form, Button, Icon, Input, Row, Col, message } from 'antd';
const FormItem = Form.Item;
import Trace from 'LIB_DIR/trace';
import {AntcTable} from 'antc';
import classNames from 'classnames';
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import {productKeyRule, productDesRule} from 'PUB_DIR/sources/utils/validate-util';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {getUemJSCode} from 'PUB_DIR/sources/utils/uem-js-code';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';

// 自定义属性变量的字段名
const CUSTOM_VARIABLE_FIELD = 'custom_variable';
const CUSTOM_TYPES = {
    key: 'key',
    desc: 'description'
};
// 自定义属性的最大个数(2),总共7个减去固定的5个
const maxCustomVariableCount = 2;
//定时器的间隔时间，三秒后测试失败的信息将消失
const DELAY_TIME = 3000;
// 固定的自定义属性
const FIXED_CUSTOM_VARIABLES = [
    {
        key: 'nickname',
        description: Intl.get('common.nickname', '昵称')
    },
    {
        key: 'role',
        description: Intl.get('app.user.manage.role.name', '角色名称')
    },
    {
        key: 'organization',
        description: Intl.get('app.user.manage.organaization.name', '所在单位或公司')
    },
    {
        key: 'expiretime',
        description: Intl.get('user.time.end', '到期时间')
    },
    {
        key: 'user_type',
        description: Intl.get('user.user.type', '用户类型')
    },
];

class CustomVariable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            displayType: this.props.displayType || 'text',
            value: this.dealCustomVariable(_.get(this.props, 'addProduct.custom_variable')),
            submitErrorMsg: '',
            customer_variables: FIXED_CUSTOM_VARIABLES,
            jsCopied: false,
            testResult: '',//测试结果返回值 'success' 'error'
            isTesting: false, //正在测试
            jsCode: '',
            addProduct: this.props.addProduct,
            timerId: '' //定时器的id
        };
    }

    componentWillMount() {
        let jsCode = getUemJSCode(_.get(this.state, 'addProduct.integration_id'), this.reverseDeakCustomVariable());
        this.setState({
            jsCode
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.addProduct.id !== this.props.addProduct.id) {
            this.setState({
                value: this.dealCustomVariable(nextProps.value),
                loading: false,
                displayType: nextProps.displayType || 'text',
                submitErrorMsg: '',
            });
        }
    }

    // 自定义属性可编辑状态
    setEditable(type, e) {
        let value = this.state.value;
        if(type === 'add') {
            value = [{
                key: '',
                description: ''
            }];
        }
        this.setState({
            displayType: 'edit',
            value,
        });
        Trace.traceEvent(e, '点击编辑' + CUSTOM_VARIABLE_FIELD);
    }

    // 添加自定义属性框
    addCustomVariable = () => {
        let value = this.state.value;
        // 自定义属性不能超过最大个数
        if(_.get(value, 'length') < maxCustomVariableCount) {
            value.push({
                key: '',
                description: '',
            });
            this.setState({
                value
            });
        }
    };

    // 删除自定义属性
    deleteCustomVariable = (index) => {
        let { value } = this.state;

        value.splice(index, 1);
        // 清除form数据，以免缓存
        this.props.form.resetFields();
        this.setState({
            value
        }, () => {

        });
    };

    // 输入框改变事件
    onInputChange = (type, index, e) => {
        let inputValue = e.target.value;
        let value = this.state.value;
        if(inputValue) {
            // key发生变化
            if(type === CUSTOM_TYPES.key) {
                value[index].key = inputValue;
            }
            else if(type === CUSTOM_TYPES.desc) {// 描述发生变化
                value[index].description = inputValue;
            }
        }else {
            // 没值时，清除所有的参数
            value[index][type] = '';
        }
        this.setState({
            value
        });
    };

    // 处理自定义属性集合
    dealCustomVariable = (data) => {
        // data: {key: 描述}, 如{status: '状态'}
        let keys = _.keys(data);
        return _.map(keys,key => {
            return {
                key,
                description: data[key],
            };
        });
    };

    // 反编译自定义属性集合
    reverseDeakCustomVariable = () => {
        let value = this.state.value;
        let obj = {};
        _.each(value, item => {
            obj[item.key] = item.description;
        });
        return obj;
    };

    // 取消保存字段
    handleCancel = (e) => {
        this.setState({
            displayType: 'text',
            submitErrorMsg: ''
        });
        Trace.traceEvent(e, '取消对' + CUSTOM_VARIABLE_FIELD + '的修改');
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

    // 保存自定义字段
    handleSubmit = (e) => {
        this.props.form.validateFields((err) => {
            if(err) return false;
            Trace.traceEvent(e, '保存对' + CUSTOM_VARIABLE_FIELD + '的修改');
            let saveObj = {
                id: _.get(this.props, 'addProduct.id')
            };
            saveObj.custom_variable = this.reverseDeakCustomVariable();
            this.setState({
                loading: true
            });

            const setDisplayState = () => {
                this.setState({
                    loading: false,
                    submitErrorMsg: '',
                    value: this.dealCustomVariable(saveObj.custom_variable),
                    displayType: 'text'
                });
            };

            if (!_.isEqual(saveObj.custom_variable, this.props.value)) {
                this.saveCustomVariable(saveObj, () => {
                    setDisplayState();
                    //更新jsCode
                    let jsCode = getUemJSCode(_.get(this.state, 'addProduct.integration_id'), this.reverseDeakCustomVariable());
                    this.setState({
                        jsCode
                    });
                }, (errorMsg) => {
                    this.setState({
                        loading: false,
                        submitErrorMsg: errorMsg || Intl.get('common.edit.failed', '修改失败')
                    });
                });
            } else {
                setDisplayState();
            }
        });
    };

    // 测试uem产品接入
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
                    //如果时间戳存在，清除时间戳
                    if(_.get(this.state, 'timerId')) {
                        clearTimeout(_.get(this.state, 'timerId'));
                    }
                    let timerId = setTimeout(
                        () => this.setTestResultState(),
                        DELAY_TIME
                    );
                    this.setState({
                        testResult: 'error',
                        isTesting: false,
                        timerId: timerId
                    });
                }
            },
            error: () => {
                this.setState({
                    testResult: 'error',
                    isTesting: false,
                });
            }
        });
    }

    // 渲染antc表格的表头字段
    getUserPropertiesColumns = () => {
        let columns = [
            {
                title: 'key',
                dataIndex: 'key',
                width: '198px',
            }, {
                title: Intl.get('common.describe', '描述'),
                dataIndex: 'description',
                width: '214px',
            }
        ];
        return columns;
    }

    // 复制Js代码
    copyJSCode = () => {
        this.setState({jsCopied: true});
        setTimeout(() => {
            this.setState({jsCopied: false});
        }, 1000);
    }

    // 渲染antc表格
    renderFixedBlock = () => {
        let displayText = this.state.value;
        let bottonBorderNone = classNames({
            'table-bottom-border-none': displayText.length !== 0
        });
        return (
            <AntcTable
                className={bottonBorderNone}
                dataSource={this.state.customer_variables}
                bordered
                pagination={false}
                columns={this.getUserPropertiesColumns()}
            />
        );
    }

    // 置空测试结果
    setTestResultState = () => {
        this.setState({
            testResult: ''
        });
    }

    // 根据不同测试结果渲染不同的footer
    renderTestFooter = () => {
        let testFooter = null;
        let testResult = _.get(this.state, 'testResult');
        let isLoading = _.get(this.state, 'isTesting');
        let jsCode = _.get(this.state, 'jsCode');
        if(jsCode && _.isEqual(testResult, '')) {
            //当没有测试结果时
            testFooter = (<div className="js-code-user-tip">
                <ReactIntl.FormattedMessage
                    id="user.jscode.use.tip"
                    defaultMessage={'请{copyAndTraceCode}到产品页面的<header>中部署后测试'}
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

    render() {
        let displayCls = classNames({
            'clearfix': true,
            'custom-variables-wrapper': true,
            'editing': this.state.displayType === 'edit'
        });

        let displayText = this.state.value;
        let textBlock = null;
        let cls = classNames('edit-container',{
            'hover-show-edit': this.props.hasEditPrivilege
        });
        let {getFieldDecorator} = this.props.form;
        let itemSize = _.get(displayText, 'length');

        if (this.state.displayType === 'text'){
            textBlock = (
                <div className={cls}>
                    {displayText.length ? <div className="edit-text-wrapper">
                        {_.map(displayText, item => {
                            return (
                                <div className="custom-variable-item">
                                    <span className="custom-variable">{item.key}</span>
                                    <span className="custom-variable custom-variable-value">{item.description}</span>
                                </div>
                            );
                        })}
                        {this.props.hasEditPrivilege ? (
                            <DetailEditBtn
                                title={Intl.get('common.update', '修改')}
                                onClick={this.setEditable.bind(this, 'edit')}
                            />) : null}
                    </div> : null}
                </div>);
        }

        //自定义属性输入框
        let inputBlock = this.state.displayType === 'edit' ? (
            <div className="custom-variable-wrap">
                <Form className="clearfix" layout='horizontal' autoComplete="off" style={{width: this.props.width || '100%'}}>
                    {
                        _.map(displayText, (item, index) => {
                            const fieldName = CUSTOM_VARIABLE_FIELD + index;
                            // 展示删除按钮， 自定义属性数组长度不为1时展示
                            const isShowDeleteBtn = itemSize !== 1;
                            return (
                                <Row align="top" className="custom-form-item ant-row">
                                    <Col className="properties-form-item left">
                                        <FormItem
                                            key={index}
                                            className='custom-key'
                                        >
                                            {getFieldDecorator(fieldName + CUSTOM_TYPES.key, {
                                                initialValue: item.key,
                                                rules: [{
                                                    required: true,
                                                    message: Intl.get('app.user.manage.custom.variable.no.key.tip', '自定义属性的key不能为空')
                                                }, productKeyRule]
                                            })(
                                                <Input
                                                    title={Intl.get('app.user.manage.custom.variable.key.tip', '请输入key')}
                                                    placeholder={Intl.get('app.user.manage.custom.variable.key.tip', '请输入key')}
                                                    onChange={this.onInputChange.bind(this, CUSTOM_TYPES.key, index)}
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col className="properties-form-item">
                                        <FormItem
                                            key={index}
                                            className='custom-des'
                                        >
                                            {getFieldDecorator(fieldName + CUSTOM_TYPES.desc, {
                                                initialValue: item.description,
                                                rules: [{
                                                    required: true,
                                                    message: Intl.get('app.user.manage.custom.variable.no.des.tip', '自定义属性的描述不能为空')
                                                }, productDesRule]
                                            })(
                                                <Input
                                                    title={Intl.get('app.user.manage.custom.variable.des.tip', '请输入描述')}
                                                    placeholder={Intl.get('app.user.manage.custom.variable.des.tip', '请输入描述')}
                                                    onChange={this.onInputChange.bind(this, CUSTOM_TYPES.desc, index)}
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                    {isShowDeleteBtn ? (
                                        <Col className="iconfont icon-minus icon-button right">
                                            <Icon
                                                title={Intl.get('common.delete', '删除')}
                                                type="minus"
                                                onClick={this.deleteCustomVariable.bind(this, index)}/>
                                        </Col>) : null}
                                    {displayText.length < maxCustomVariableCount ? (
                                        <Col className="icon-button right">
                                            <i className="iconfont icon-add"
                                                title={Intl.get('common.add', '添加')}
                                                onClick={this.addCustomVariable}
                                            />
                                        </Col>) : null}
                                </Row>
                            );
                        })
                    }
                </Form>
                <div className="buttons">
                    <SaveCancelButton
                        loading={this.state.loading}
                        saveErrorMsg={this.state.submitErrorMsg}
                        okBtnText={this.props.okBtnText}
                        handleSubmit={this.handleSubmit.bind(this)}
                        handleCancel={this.handleCancel.bind(this)}
                    />
                </div>
            </div>
        ) : null;
        //当前不为编辑状态并且value为空时展示修改
        let isEditShow = _.isEqual(this.state.displayType, 'text') && _.get(this.state, 'value').length === 0;
        return (
            <React.Fragment>
                <div className='custom-variable-container'>
                    <div className="custom-label-container">
                        {_.get(this.props, 'hasEditPrivilege') && isEditShow ? (
                            <i className="iconfont icon-add"
                                title={Intl.get('common.update', '修改')}
                                onClick={this.setEditable.bind(this, 'add')}
                            /> ) : null}
                        <span className="custom-label">{Intl.get('app.user.manage.user.attributes', '用户属性')}：</span>
                    </div>
                    <div className="custom-variable-content">
                        {this.renderFixedBlock()}
                        <div className={displayCls}>
                            {textBlock}
                            {inputBlock}
                        </div>
                    </div>
                </div>
                <div className="access-step-tip margin-style js-code-container">
                    {_.get(this.state, 'jsCode') ? (
                        <span>
                            <CopyToClipboard text={_.get(this.state, 'jsCode')}
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
                    {_.get(this.state, 'jsCode') ? (
                        <React.Fragment>
                            <span className="js-code-label">{Intl.get('common.trace.code', '跟踪代码')}： </span>
                            <div className="access-step-tip margin-style js-code-contianer pre-code" style={{height: 200}}>
                                <GeminiScrollbar>
                                    <pre id='matomo-js-code'>{_.get(this.state, 'jsCode')}</pre>
                                </GeminiScrollbar>
                            </div>
                        </React.Fragment>) : null}
                </div>
                {this.renderTestFooter()}
            </React.Fragment>
        );
    }
}
CustomVariable.defaultProps = {
    // 自定义属性集合， {status: 状态}
    value: {},
    // 展示类型，text:文本展示状态，edit:编辑状态
    displayType: '',
    //是否有修改权限
    hasEditPrivilege: false,
    //添加按钮的提示文案
    addBtnTip: Intl.get('common.add', '添加'),
    //编辑区的宽度
    width: '100%',
    //保存按钮的文字展示
    okBtnText: Intl.get('common.add', '添加'),
    // 编辑表单的展示布局
    editFormLayout: {
        labelCol: {span: 4},
        wrapperCol: {span: 20}
    },
    //保存自定义属性的修改方法
    saveEditInput: function() {}
};
CustomVariable.propTypes = {
    form: PropTypes.object,
    displayType: PropTypes.string,
    value: PropTypes.array,
    hasEditPrivilege: PropTypes.bool,
    addBtnTip: PropTypes.string,
    width: PropTypes.string,
    okBtnText: PropTypes.string,
    editFormLayout: PropTypes.object,
    addProduct: PropTypes.object
};
export default Form.create()(CustomVariable);