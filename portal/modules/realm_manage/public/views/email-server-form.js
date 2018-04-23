/**
 * 设置邮箱服务器配置信息
 */
import { Form, Input, Button } from 'antd';
const FormItem = Form.Item;
const RealmAjax = require('../ajax/realm-ajax');
import {EMAIL, COMMON} from '../consts';
import Trace from "LIB_DIR/trace";
const AlertTimer = require('CMP_DIR/alert-timer');

class EmailServerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            realmConfigInfo: this.props.realmConfigInfo,
            errMsg: ''
        };
    }
    handleSubmit = (e) => {
        e.preventDefault();
        Trace.traceEvent(e,"点击保存");
        this.props.form.validateFields((err, values) => {
            if (err) {
                return;
            } else {
                let realmId = this.props.realmId;
                let realmConfigInfo = this.state.realmConfigInfo;
                RealmAjax.settingEmailServer(realmId, values).then(  (result) => {
                    if (result) {
                        realmConfigInfo.email_host = values.email_host;
                        realmConfigInfo.email_password = values.email_password;
                        realmConfigInfo.email = values.email;
                        realmConfigInfo.email_port = values.email_port;
                        realmConfigInfo.email_protocol = values.email_protocol;
                        this.props.cancelSetOrUpdateEmail();
                    }
                }, (errMsg) => {
                    this.setState({
                        errMsg: errMsg || EMAIL.errMsgTips
                    });
                } );
            }
        });
    }

    renderErrMsg() {
        if (this.state.errMsg) {
            return (
                <AlertTimer time="3000"
                            message={this.state.errMsg}
                            type="error" showIcon
                            onHide={this.hideSaveTooltip}/>
            );
        } else {
            return null;
        }
    }

    render() {
        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 6 },
            wrapperCol: { span: 15 }
        };
        let realmConfigInfo = this.state.realmConfigInfo;
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label={EMAIL.emailLabel}>
                    {getFieldDecorator('email', {
                        initialValue: realmConfigInfo && realmConfigInfo.email || ''
                    })(
                        <Input placeholder={EMAIL.emailMessage} />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={COMMON.password}>
                    {getFieldDecorator('email_password', {
                        initialValue: realmConfigInfo && realmConfigInfo.email_password || '',
                        rules: [{message: EMAIL.passwordMessage}]
                    })(
                        <Input type="password" placeholder={EMAIL.passwordMessage} autoComplete="new-password"/>
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={EMAIL.hostLabel}>
                    {getFieldDecorator('email_host', {
                        initialValue: realmConfigInfo && realmConfigInfo.email_host || '',
                        rules: [{ message: EMAIL.hostMessage}]
                    })(
                        <Input placeholder={EMAIL.hostMessage} />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={EMAIL.portLabel}>
                    {getFieldDecorator('email_port', {
                        initialValue: realmConfigInfo && realmConfigInfo.email_port || '',
                        rules: [{ message: EMAIL.portMessage}]
                    })(
                        <Input  placeholder={EMAIL.portMessage}/>
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={EMAIL.protocolLabel}>
                    {getFieldDecorator('email_protocol', {
                        initialValue: realmConfigInfo && realmConfigInfo.email_protocol || '',
                        rules: [{ message: EMAIL.portMessage}]
                    })(
                        <Input  placeholder={EMAIL.portMessage}/>
                    )}
                </FormItem>
                <FormItem className="submit-button">
                    <Button type="primary" htmlType="submit">{COMMON.sure}</Button>
                    <Button onClick={this.props.cancelSetOrUpdateEmail}>{COMMON.cancel}</Button>
                </FormItem>
                {this.renderErrMsg()}
            </Form>
        );
    }
}

const EmailServer = Form.create()(EmailServerForm);

export default EmailServer;