/**
 * Created by xiaojinfeng on  2016/1/14 10:25 .
 */
var createReactClass = require('create-react-class');
var language = require('../../../public/language/getLanguage');
if (language.lan() === 'es' || language.lan() === 'en') {
    require('./css/user-password-es_VE.less');
} else if (language.lan() === 'zh') {
    require('./css/user-password-zh_CN.less');
}
import {Form, Icon, Input, Button, Col} from 'antd';
const FormItem = Form.Item;
var crypto = require('crypto');//用于密码md5SSSS
var AlertTimer = require('../../../components/alert-timer');
var UserInfoStore = require('../../user_info/public/store/user-info-store');
var UserInfoAction = require('../../user_info/public/action/user-info-actions');
var userInfoAjax = require('../../user_info/public/ajax/user-info-ajax');
var passwdStrengthFile = require('../../../components/password-strength-bar');
var PasswdStrengthBar = passwdStrengthFile.PassStrengthBar;
import {getUserData} from 'PUB_DIR/sources/user-data';
import { checkPassword, checkConfirmPassword } from 'PUB_DIR/sources/utils/validate-util';
function getStateFromStore() {
    let stateData = UserInfoStore.getState();
    return {
        userId: _.get(getUserData(), 'user_id'),
        userInfoFormPwdShow: stateData.userInfoFormPwdShow,
        submitErrorMsg: stateData.submitErrorMsg,
        submitResult: stateData.submitResult
    };
}

var UserPwdPage = createReactClass({
    displayName: 'UserPwdPage',
    getInitialState: function() {
        return this.initData();
    },
    initData: function() {
        var datas = getStateFromStore();
        datas.passBarShow = false;//是否显示密码强度
        datas.passStrength = 'L';//密码强度
        return datas;
    },

    onChange: function() {
        let datas = getStateFromStore();
        this.setState({
            status: this.state.status,
            ...datas,
        });
        if (this.state.userInfoFormPwdShow) {
            this.handleReset();
        }
    },

    propTypes: {
        form: PropTypes.object,
    },
    
    componentDidMount: function() {
        $('body').css('overflow', 'hidden');
        UserInfoStore.listen(this.onChange);
    },

    componentWillUnmount: function() {
        $(window).unbind('resize');
        UserInfoStore.unlisten(this.onChange);
        $('body').css('overflow', 'auto');
    },

    checkPass(rule, value, callback) {
        let { getFieldValue, validateFields } = this.props.form;
        // 确认密码
        let rePassWord = getFieldValue('rePasswd');
        // 原密码
        let oldPassword = getFieldValue('passwd');
        checkPassword(this, value, callback, rePassWord, () => {
            // 如果密码验证通过后，需要强制刷新下确认密码的验证，以防密码不一致的提示没有去掉
            validateFields(['rePasswd'], {force: true});
        }, oldPassword);
    },

    checkPass2(rule, value, callback) {
        let { getFieldValue, validateFields } = this.props.form;
        let password = getFieldValue('newPasswd');
        checkConfirmPassword(value, callback, password, () => {
            // 密码存在时，如果确认密码验证通过后，需要强制刷新下密码的验证，以防密码不一致的提示没有去掉
            validateFields(['newPasswd'], {force: true});
        });
    },

    checkUserInfoPwd(rule, value, callback) {
        if (!value) {
            callback();
        } else {
            setTimeout(() => {
                userInfoAjax.checkUserInfoPwd({passwd: value}).then(function(checkPwdFlag) {
                    if (!checkPwdFlag) {
                        callback(Intl.get('user.password.input.again', '原密码不正确，请重新输入。'));
                    } else {
                        callback();
                    }
                });

            }, 800);
        }
    },

    handleReset() {
        this.props.form.resetFields();
        this.setState(this.initData());
    },

    events_submitUserInfoForm: function(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let user = {
                    userId: this.state.userId,
                    passwd: this.md5Hash(values.passwd),
                    newPasswd: this.md5Hash(values.newPasswd)
                };
                UserInfoAction.editUserInfoPwd(user);
            }
        });
    },

    md5Hash: function(passwd) {
        var md5Hash = crypto.createHash('md5');
        md5Hash.update(passwd);
        return md5Hash.digest('hex');
    },

    renderIndicator: function() {
        if (this.state.submitResult === 'loading') {
            return (
                <Icon type="loading"/>
            );
        }
        var hide = function() {
            UserInfoAction.hideSubmitTip();
        };
        if (this.state.submitResult === 'success') {
            return (
                <AlertTimer time={3000} message={Intl.get('user.password.change.password.succ', '密码修改成功')}
                    type="success" showIcon onHide={hide}/>
            );
        }
        if (this.state.submitResult === 'error') {
            return (
                <AlertTimer time={3000} message={this.state.submitErrorMsg} type="error" showIcon onHide={hide}/>
            );
        }
        return null;
    },

    render: function() {
        const {getFieldDecorator} = this.props.form;

        return (
            <div className="userInfoManage_userPwd_content" data-tracename="密码管理">
                <div className="user-pwd-manage-container">
                    <div className="user-pwd-manage-div">
                        <Form layout='horizontal' className="user-info-edit-pwd-form" autoComplete="off">
                            <FormItem
                                label={Intl.get('user.password.initial.password', '原始密码')}
                                labelCol={{span: 5}}
                                wrapperCol={{span: 15}}
                            >
                                {getFieldDecorator('passwd', {
                                    rules: [{
                                        required: true,
                                        message: Intl.get('user.password.input.initial.password', '输入原密码')
                                    }]
                                })(
                                    <Input type="password" autoComplete="off"
                                        placeholder={Intl.get('user.password.input.initial.password', '输入原密码')}
                                        data-tracename="输入原密码"/>
                                )}
                            </FormItem>
                            <FormItem
                                className='new-password-item'
                                label={Intl.get('user.password.new.password', '新密码')}
                                labelCol={{span: 5}}
                                wrapperCol={{span: 15}}
                            >
                                {getFieldDecorator('newPasswd', {
                                    rules: [{
                                        validator: this.checkPass
                                    }]
                                })(
                                    <Input type="password" autoComplete="off"
                                        placeholder={Intl.get('common.password.compose.rule', '6-18位数字、字母、符号的组合')}
                                        data-tracename="输入新密码"/>
                                )}
                            </FormItem>
                            <Col span="23">
                                {this.state.passBarShow ?
                                    (<PasswdStrengthBar passStrength={this.state.passStrength}/>) : null}
                            </Col>
                            <FormItem
                                label={Intl.get('common.confirm.password', '确认密码')}
                                labelCol={{span: 5}}
                                wrapperCol={{span: 15}}
                            >
                                {getFieldDecorator('rePasswd', {
                                    rules: [{
                                        validator: this.checkPass2
                                    }]
                                })(
                                    <Input type="password"
                                        placeholder={Intl.get('login.please_enter_new_password', '确认新密码')}
                                        data-tracename="确认新密码"/>
                                )}
                            </FormItem>
                            <div className="user-pwd-indicator">
                                {
                                    this.renderIndicator()
                                }
                                <Button type="primary" className="user-info-edit-pwd-submit-btn btn-primary-sure"
                                    onClick={this.events_submitUserInfoForm.bind(this)}
                                    data-tracename="保存密码"
                                >

                                    <ReactIntl.FormattedMessage id="user.password.save.password"
                                        defaultMessage="保存密码"/>
                                </Button>
                            </div>
                        </Form>
                    </div>
                </div>
            </div>
        );
    },
});

const UserInfoFormForm = Form.create()(UserPwdPage);
module.exports = UserInfoFormForm;

