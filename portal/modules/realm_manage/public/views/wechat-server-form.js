/**
 * 设置短信服务器配置信息
 */
import { Form, Input, Button } from 'antd';
const FormItem = Form.Item;
const RealmAjax = require('../ajax/realm-ajax');
import {WECHAT, COMMON} from '../consts';
import Trace from "LIB_DIR/trace";
const AlertTimer = require('CMP_DIR/alert-timer');

class WeChatForm extends React.Component {
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
                RealmAjax.settingWeChat(realmId, values).then(  (result) => {
                    if (result) {
                        realmConfigInfo.wechat_client_id = values.wechat_client_id;
                        realmConfigInfo.wechat_client_secret = values.wechat_client_secret;
                        this.props.cancelSetOrUpdateWeChat();
                    }
                }, (errMsg) => {
                    this.setState({
                        errMsg: errMsg || WECHAT.errMsgTips
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
                <FormItem {...formItemLayout} label={WECHAT.wechatLabel}>
                    {getFieldDecorator('wechat_client_id', {
                        initialValue: realmConfigInfo && realmConfigInfo.wechat_client_id,
                        rules: [{message: WECHAT.wechatMessage}]
                    })(
                        <Input type="text" placeholder={WECHAT.wechatMessage} />
                    )}
                </FormItem>
                <FormItem {...formItemLayout} label={WECHAT.secretLabel}>
                    {getFieldDecorator('wechat_client_secret', {
                        initialValue: realmConfigInfo && realmConfigInfo.wechat_client_secret,
                        rules: [{message: WECHAT.secretMessage}]
                    })(
                        <Input  type="text" placeholder={WECHAT.secretMessage}/>
                    )}
                </FormItem>
                <FormItem className="submit-button">
                    <Button type="primary" htmlType="submit">{COMMON.sure}</Button>
                    <Button onClick={this.props.cancelSetOrUpdateWeChat}>{COMMON.cancel}</Button>
                </FormItem>
                {this.renderErrMsg()}
            </Form>
        );
    }
}

const WeChat = Form.create()(WeChatForm);

export default WeChat;