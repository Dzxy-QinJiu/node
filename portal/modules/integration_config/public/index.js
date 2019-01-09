/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/1/9.
 */
import './index.less';
import {Form, Input, Button, Radio, Icon} from 'antd';
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
import {getIntegrationConfig} from 'PUB_DIR/sources/utils/common-data-util';
class IntegrationConfig extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isGettingIntegrateConfig: false,
            getItegrateConfigError: '',
            integrateType: '',//集成类型
            server: '',//matomo域名
            authToken: '',//matomo API验证token
            isSaving: false,//正在保存
            saveErrorMsg: ''//保存失败的错误提示
        };
    }

    componentDidMount() {
        this.getIntegrateConfig();
    }

    getIntegrateConfig() {
        this.setState({isGettingIntegrateConfig: true});
        getIntegrationConfig(resultObj => {
            // 获取集成配置信息失败后的处理
            if (resultObj.errorMsg) {
                this.setState({
                    isGettingIntegrateConfig: false,
                    getItegrateConfigError: resultObj.errorMsg || Intl.get('config.integration.config.get.error', '获取集成配置的信息出错了')
                });
            } else {
                let integrateType = _.get(resultObj, 'type');
                //由于默认类型就是uem，所以无法判断是已配置了uem还是默认的，
                // 所以需要用create_time来判断，存在说明已配置，不存在说明是默认
                if (integrateType === INTEGRATE_TYPES.UEM && !_.get(resultObj, 'create_time')) {
                    integrateType = '';
                }
                if (integrateType === INTEGRATE_TYPES.MATOMO) {
                    this.setState({
                        integrateType,
                        isGettingIntegrateConfig: false,
                        getItegrateConfigError: ''
                    });
                } else {
                    this.setState({
                        integrateType,
                        server: _.get(resultObj, 'server'),
                        authToken: _.get(resultObj, 'authToken'),
                        isGettingIntegrateConfig: false,
                        getItegrateConfigError: ''
                    });
                }
            }
        });
    }

    onSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (err) return;
            this.setState({isSaving: true});
            $.ajax({
                url: '/rest/integration/config',
                type: 'post',
                dataType: 'json',
                data: values,
                success: (result) => {
                    if (result) {
                        this.setState({isSaving: false, saveErrorMsg: '', integrateType: values.name});
                    } else {
                        this.setState({
                            isSaving: false,
                            saveErrorMsg: Intl.get('common.save.failed', '保存失败')
                        });
                    }
                },
                error: (xhr) => {
                    this.setState({
                        isSaving: false,
                        saveErrorMsg: xhr.responseJSON || Intl.get('common.save.failed', '保存失败')
                    });
                }
            });
        });
    }

    render() {
        const {getFieldDecorator, getFieldsValue} = this.props.form;
        let values = getFieldsValue();
        const formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 18},
            colon: false
        };
        //已配置了集成类型后，不可再配置（只能配置一次）
        let isEnableEdit = this.state.integrateType ? false : true;
        return (
            <Form className="integrate-config-container">
                <Form.Item
                    label={Intl.get('config.integration.type', '集成类型')}
                    {...formItemLayout}
                >
                    {getFieldDecorator('name', {
                        initialValue: this.state.integrateType || INTEGRATE_TYPES.OPLATE
                    })(
                        <Radio.Group disabled={!isEnableEdit}>
                            <Radio.Button value={INTEGRATE_TYPES.OPLATE}>
                                {INTEGRATE_TYPES.OPLATE.toUpperCase()}
                            </Radio.Button>
                            <Radio.Button value={INTEGRATE_TYPES.MATOMO}>
                                {INTEGRATE_TYPES.MATOMO.toUpperCase()}
                            </Radio.Button>
                        </Radio.Group>
                    )}
                </Form.Item>
                {values.name && values.name === INTEGRATE_TYPES.MATOMO ? (
                    <div>
                        <Form.Item
                            label={Intl.get('config.integration.domain', '域名')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('server', {
                                rules: [{
                                    required: true,
                                    message: Intl.get('config.integration.server.placeholder', '请输入Matomo域名')
                                }],
                                initialValue: this.state.server
                            })(
                                <Input disabled={!isEnableEdit}
                                    placeholder={Intl.get('config.integration.server.placeholder', '请输入Matomo域名')}/>
                            )}
                        </Form.Item>

                        <Form.Item
                            label={Intl.get('config.integration.token', '验证token')}
                            {...formItemLayout}
                        >
                            {getFieldDecorator('authToken', {
                                rules: [{
                                    required: true,
                                    message: Intl.get('config.integration.token.placeholder', '请输入API验证token')
                                }],
                                initialValue: this.state.authToken
                            })(
                                <Input disabled={!isEnableEdit}
                                    placeholder={Intl.get('config.integration.token.placeholder', '请输入API验证token')}/>
                            )}
                        </Form.Item>
                    </div>
                ) : null}
                {isEnableEdit ? (
                    <Form.Item>
                        <Button type="primary" size='default' onClick={this.onSubmit}>
                            {Intl.get('common.save', '保存')}
                        </Button>
                        {this.state.saving ? (
                            <Icon type="loading" className="save-loading"/>) : this.state.saveErrorMsg ? (
                            <span className="save-error">{this.state.saveErrorMsg}</span>
                        ) : null}
                    </Form.Item>) : null}
            </Form>
        );
    }
}
IntegrationConfig.propTypes = {
    form: PropTypes.object
};
export default Form.create()(IntegrationConfig);