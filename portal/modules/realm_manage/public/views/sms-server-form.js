/**
 * 设置短信服务器配置信息
 */
import { Form, Input, Button } from 'antd';
const FormItem = Form.Item;
const RealmAjax = require('../ajax/realm-ajax');
import {SMS, COMMON} from '../consts';
import Trace from "LIB_DIR/trace";
const AlertTimer = require('CMP_DIR/alert-timer');

class SmsServerForm extends React.Component {
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
                RealmAjax.settingSmsServer(realmId, values).then( (result) => {
                    if (result) {
                        realmConfigInfo.sms_gate_username = values.sms_gate_username;
                        realmConfigInfo.sms_gate_password = values.sms_gate_username;
                        this.props.cancelSetOrUpdateSms();
                    }
                }, (errMsg) => {
                    this.setState({
                        errMsg: errMsg || SMS.errMsgTips
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
        const tailFormItemLayout = {
            wrapperCol: {
                span: 9,
                offset: 12
            }
        };
        let realmConfigInfo = this.state.realmConfigInfo;
        return (
            <Form onSubmit={this.handleSubmit}>
                <FormItem {...formItemLayout} label={SMS.smsLabel}>
                    {getFieldDecorator('sms_gate_username', {
                        initialValue: realmConfigInfo && realmConfigInfo.sms_gate_username
                    })(
                        <Input type="text" placeholder={SMS.smsMessage} />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={COMMON.password}>
                    {getFieldDecorator('sms_gate_password', {
                        initialValue: realmConfigInfo && realmConfigInfo.sms_gate_password,
                        rules: [{message: SMS.passwordMessage}]
                    })(
                        <Input type="password" autoComplete="new-password" placeholder={SMS.passwordMessage}/>
                    )}
                </FormItem>
                <FormItem className="submit-button">
                    <Button type="primary" htmlType="submit">{COMMON.sure}</Button>
                    <Button onClick={this.props.cancelSetOrUpdateSms}>{COMMON.cancel}</Button>
                </FormItem>
                {this.renderErrMsg()}
            </Form>
        );
    }
}

const SmsServer = Form.create()(SmsServerForm);

export default SmsServer;