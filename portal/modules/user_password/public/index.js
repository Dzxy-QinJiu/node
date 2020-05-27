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
import {Form, Icon, Input, Button, Col, Modal} from 'antd';
const FormItem = Form.Item;
var crypto = require('crypto');//用于密码md5SSSS
var AlertTimer = require('../../../components/alert-timer');
var UserInfoStore = require('../../user_info/public/store/user-info-store');
var userInfoAjax = require('../../user_info/public/ajax/user-info-ajax');
var passwdStrengthFile = require('../../../components/password-strength-bar');
var PasswdStrengthBar = passwdStrengthFile.PassStrengthBar;
import {getUserData} from 'PUB_DIR/sources/user-data';
import { checkPassword, checkConfirmPassword } from 'PUB_DIR/sources/utils/validate-util';
import { isResponsiveDisplay } from 'PUB_DIR/sources/utils/common-method-util';
import classNames from 'classnames';

function getStateFromStore() {
    let stateData = UserInfoStore.getState();
    return {
        userId: _.get(getUserData(), 'user_id'),
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
        datas.rePasswordErrMsg = ''; // 重置密码错误的提示信息
        datas.loading = false; // loading
        return datas;
    },

    onChange: function() {
        let datas = getStateFromStore();
        this.setState({
            status: this.state.status,
            ...datas,
        });
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
        this.setState({
            passBarShow: false,
            passStrength: 'L',
            loading: false
        }, () => {
            this.props.form.resetFields();
        });
    },

    // 重置密码错误的处理
    handleRePasswordSaveError(errMsg) {
        this.setState({
            rePasswordErrMsg: errMsg,
        }, () => {
            this.handleReset();
        });
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
                this.setState({
                    loading: true
                });
                userInfoAjax.editUserInfoPwd(user).then( (result) => {
                    if (result) {
                        this.setState({
                            rePasswordErrMsg: '',
                            loading: false
                        });
                        Modal.success({
                            content: Intl.get('common.change.password.success.tips','密码已成功修改，请使用新密码重新登录系统。'),
                            okText: <a href="/logout">{Intl.get('config.manage.realm.oktext','确定')}</a>,
                        });
                    } else {
                        this.handleRePasswordSaveError(Intl.get('user.info.edit.password.failed','密码修改失败'));
                    }
                }, (errMsg) => {
                    this.handleRePasswordSaveError(errMsg);
                } );
            }
        });
    },

    md5Hash: function(passwd) {
        var md5Hash = crypto.createHash('md5');
        md5Hash.update(passwd);
        return md5Hash.digest('hex');
    },

    renderIndicator: function() {
        if (this.state.loading) {
            return (
                <Icon type="loading"/>
            );
        }
        const hide = () => {
            this.setState({
                rePasswordErrMsg: ''
            });
        };
        let rePasswordErrMsg = this.state.rePasswordErrMsg;
        if (rePasswordErrMsg) {
            return (
                <AlertTimer
                    time={3000}
                    message={rePasswordErrMsg}
                    type="error"
                    showIcon
                    onHide={hide}
                />
            );
        }
        return null;
    },

    render: function() {
        const {getFieldDecorator, getFieldValue} = this.props.form;
        let formLayout = 'horizontal';
        if (isResponsiveDisplay().isWebSmall) {
            formLayout = 'vertical';
        }
        const formItemLayout = formLayout === 'horizontal' ? {
            labelCol: { span: 5 },
            wrapperCol: { span: 15},
        } : null;
        const btnCls = classNames('user-info-edit-pwd-submit-btn btn-primary-sure', {
            'disabled-btn': _.isEmpty(getFieldValue('rePasswd'))
        });
        return (
            <div className="userInfoManage_userPwd_content" data-tracename="密码管理">
                <div className="user-pwd-manage-container">
                    <div className="user-pwd-manage-div">
                        <Form
                            layout={formLayout}
                            className="user-info-edit-pwd-form"
                            autoComplete="off"
                        >
                            <FormItem
                                label={Intl.get('user.password.initial.password', '原始密码')}
                                {...formItemLayout}
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
                                {...formItemLayout}
                            >
                                {getFieldDecorator('newPasswd', {
                                    rules: [{
                                        required: true,
                                        validator: this.checkPass
                                    }]
                                })(
                                    <Input
                                        type="password"
                                        autoComplete="off"
                                        placeholder={Intl.get('common.password.compose.rule', '6-18位数字、字母、符号的组合')}
                                        data-tracename="输入新密码"
                                    />
                                )}
                            </FormItem>
                            <Col span="23">
                                {this.state.passBarShow ?
                                    (<PasswdStrengthBar passStrength={this.state.passStrength}/>) : null}
                            </Col>
                            <FormItem
                                label={Intl.get('common.confirm.password', '确认密码')}
                                {...formItemLayout}
                            >
                                {getFieldDecorator('rePasswd', {
                                    rules: [{
                                        required: true,
                                        validator: this.checkPass2
                                    }]
                                })(
                                    <Input
                                        type="password"
                                        placeholder={Intl.get('login.please_enter_new_password', '确认新密码')}
                                        data-tracename="确认新密码"
                                    />
                                )}
                            </FormItem>
                            <div className="user-pwd-indicator">
                                {
                                    this.renderIndicator()
                                }
                                <Button
                                    type="primary"
                                    className={btnCls}
                                    onClick={this.events_submitUserInfoForm.bind(this)}
                                    data-tracename="保存密码"
                                    disabled={_.isEmpty(getFieldValue('rePasswd'))}
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