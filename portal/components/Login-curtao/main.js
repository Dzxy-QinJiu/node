var React = require('react');
import './style.less';
import './index.less';

const PropTypes = require('prop-types');
const QRCode = require('qrcode.react');
const classnames = require('classnames');
const Logo = require('../Logo');
const LoginForm = require('./login-form');
import RegisterForm from './register-form';
import {Alert, Tabs, Icon, Button} from 'antd';
import {ssoLogin, callBackUrl, buildRefreshCaptchaUrl} from '../../lib/websso';
import SideBar from '../side-bar';

const TabPane = Tabs.TabPane;
let QRCodeLoginInterval = null;
const LOGIN_INTERVAL_TIME = 5 * 1000;//5s:获取二维码展示后，调用登录接口的时间间隔
var Spinner = require('../spinner');
//扫码登录的前缀，用于手机端扫码时判断扫的是不是登录的二维码
const LOGIN_QRCODE_PREFIX = 'ketao_login_';
const VIEWS = {
    LOGIN: 'login',
    RIGISTER: 'register',
};
const USER_LANG_KEY = 'userLang';//存储用户语言环境的key
import {storageUtil} from 'ant-utils';

const logoScr = require('./image/wihte-logo.png');
const FOMR_HEIGHT = {
    COMMON_H: 300,//只有用户名、密码时，登录表单的容器高度
    CAPTCHA_H: 48,//验证码输入框的高度
};
//注册步骤
const REGISTER_STEPS = {
    COMPANY_ID_SET: 0,//设置公司唯一标识
    PHONE_VALID: 1,//电话验证
    ACCOUNT_SET: 2//账号设置
};
const bgImgUrl = require('./image/login-bg.png');

class LoginMain extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentView: VIEWS.LOGIN,
            errorMsg: this.props.loginErrorMsg,
            //展示界面
            showUi: false,
            //验证码
            captcha: this.props.captchaCode || '',
            //二维码
            QRCode: '',
            //扫码和普通登录分别对应的key
            loginActiveKey: '2',//1:扫码登录，2：普通登录
            ketaoQRCodeShow: false,//是否展示下载展示客套App的二维码
            QRCodeErrorMsg: '',//扫码登录相关的错误
            isLoadingQRCode: false,//是否正在获取二维码
            currRegistStep: REGISTER_STEPS.COMPANY_ID_SET,//注册的当前步骤
        };

        this.setErrorMsg = this.setErrorMsg.bind(this);
    }

    componentDidMount() {
        if (this.state.loginActiveKey === '1') {
            this.getLoginQRCode();
        }
        //如果使用sso
        if (window.Oplate.useSso) {
            //如果尚未进行ssocheck
            if (!window.Oplate.stopcheck) {
                this.ssoCheck(this.show.bind(this));
            } else {
                this.show();
            }
        } else {
            //不是用sso登录，则直接显示登录界面
            this.show();
        }
        Trace.addEventListener(window, 'click', Trace.eventHandler);
    }

    componentWillUnmount() {
        Trace.detachEventListener(window, 'click', Trace.eventHandler);
    }

    setErrorMsg(errorMsg) {
        this.setState({errorMsg});
    }

    getLangClassName(lang, hasWindow) {
        const userLang = this.getLang();
        const isSelected = hasWindow && userLang === lang || false;
        return classnames('lang-btn', {'lang-selected': isSelected});
    }

    //检测是否已经sso登录
    ssoCheck(callback) {
        var lang = window.Oplate && window.Oplate.lang || 'zh_CN';
        //2. 在登录界面显示前，检测当前 SSO 是否已经登录
        ssoLogin.quickLogin().then((ticket) => {
            // SSO已成功登录成功的回调（因为这里拿到了 ticket, 所以这时候应该重定向到 callBackUrl 地址中）
            sendMessage && sendMessage('sso已登录,ticket=' + ticket);
            window.location.href = callBackUrl + '?t=' + ticket + '&lang=' + lang;
        }).catch((data) => {
            sendMessage && sendMessage('sso登录检查失败');
            // SSO尚未登录的回调（ data.captcha 为图片验证码的 base64）
            callback(data.captcha);
        });
    }

    //展示界面
    show(captcha) {
        var lang = storageUtil.local.get(USER_LANG_KEY);
        //之前设置过语言，且没有默认语言设置时,使用设置的语言，重新渲染界面（后端渲染部分）
        if (lang && !Oplate.lang) {
            window.location.href = '/login?lang=' + lang;
        } else {
            this.setState({
                showUi: true,
                captcha: captcha ? captcha : this.state.captcha
            });
        }
    }

    //改变语言环境
    changeLang(lang) {
        storageUtil.local.set(USER_LANG_KEY, lang);
    }

    //从本地缓存获取语言环境
    getLang() {
        return storageUtil.local.get(USER_LANG_KEY) || (window.Oplate && window.Oplate.lang) || 'zh_CN';
    }

    handleTabChange(activeKey) {
        this.setState({loginActiveKey: activeKey});
        if (activeKey === '1') {
            //切换到扫码登录
            if (this.state.QRCode) {
                this.setQRCodeLoginInterval();
            } else {
                this.getLoginQRCode();
            }
        } else if (activeKey === '2') {
            //切换到普通登录
            if (QRCodeLoginInterval) {
                clearInterval(QRCodeLoginInterval);
            }
        }
    }

    //获取二维码
    getLoginQRCode() {
        this.setState({isLoadingQRCode: true});
        $.ajax({
            url: '/login_QR_code',
            type: 'post',
            dataType: 'json',
            success: (data) => {
                this.setState({
                    QRCode: data ? data.code : '',
                    QRCodeErrorMsg: '',
                    isLoadingQRCode: false
                });
                //隔5秒调用一次扫码登录的接口
                this.setQRCodeLoginInterval();
            },
            error: (xhr) => {
                let errorObj = xhr.responseJSON;
                if (_.isObject(errorObj) && errorObj.message) {
                    this.setState({
                        QRCodeErrorMsg: errorObj.message,
                        isLoadingQRCode: false
                    });
                }
            }
        });
    }

    loginByQRCode() {
        $.ajax({
            url: '/QR_code/login/' + this.state.QRCode,
            dataType: 'json',
            type: 'post',
            success: data => {
                if (data && data === 'success') {
                    this.clearQRCodeLoginInterval();
                    location.reload(true);
                }
            },
            error: xhr => {
                let errorObj = xhr.responseJSON;
                if (_.isObject(errorObj) && errorObj.message) {
                    this.setState({
                        QRCodeErrorMsg: errorObj.message
                    });
                }
            }
        });
    }

    clearQRCodeLoginInterval() {
        if (QRCodeLoginInterval) {
            clearInterval(QRCodeLoginInterval);
        }
    }

    setQRCodeLoginInterval() {
        this.clearQRCodeLoginInterval();
        QRCodeLoginInterval = setInterval(() => {
            this.loginByQRCode();
        }, LOGIN_INTERVAL_TIME);
    }

    //展示下载ketaoApp的二维码
    showDownLoadKetaoQRCode() {
        this.setState({ketaoQRCodeShow: true});
    }

    //关闭下载ketaoApp的二维码
    closeDownLoadKetaoQRCode() {
        this.setState({ketaoQRCodeShow: false});
    }

    //注册、登录界面的切换
    changeView() {
        this.setState({
            currentView: this.state.currentView === VIEWS.RIGISTER ? VIEWS.LOGIN : VIEWS.RIGISTER,
            errorMsg: '',
            currRegistStep: REGISTER_STEPS.COMPANY_ID_SET,
        });
    }

    onRegisterStepChange(step) {
        if (step !== this.state.currRegistStep) {
            this.setState({currRegistStep: step});
        }
    }

    getFormHeight() {
        let height = FOMR_HEIGHT.COMMON_H;
        //注册页
        if (this.state.currentView === VIEWS.RIGISTER) {
            //手机验证
            if (this.state.currRegistStep === REGISTER_STEPS.PHONE_VALID) {
                height += FOMR_HEIGHT.CAPTCHA_H;
            } else if (this.state.currRegistStep === REGISTER_STEPS.ACCOUNT_SET) {//账号设置
                height += 2 * FOMR_HEIGHT.CAPTCHA_H;
            }
        }
        else {//登录页
            if (this.state.captcha) {//有验证码
                height += FOMR_HEIGHT.CAPTCHA_H;
            }
        }
        return height;
    }

    render() {
        const bgStyle = {
            backgroundImage: `url(${bgImgUrl})`,
            backgroundSize: 'cover'
        };
        //如果是初次渲染不展示表单;
        //如果有错误信息，则不显示loading状态
        if (!this.state.showUi) {
            return (<div className="login-wrap" style={bgStyle}>
                {this.state.errorMsg ? null : <Spinner className="isloading"/>}
            </div>);
        } else {
            const hasWindow = !(typeof window === 'undefined');
            return (
                <div className="login-wrap" style={bgStyle}>
                    <Logo logoSrc={logoScr}/>
                    {/*<Button className='login-register-btn' onClick={this.changeView.bind(this)}>*/}
                    {/*{this.state.currentView === VIEWS.RIGISTER ? Intl.get('login.login', '登录') : Intl.get('login.register', '注册')}*/}
                    {/*</Button>*/}
                    {hasWindow ? (
                        <div className="csm-form-wrap">
                            {/*<div className="form-wrap" style={{height: this.getFormHeight()}}>*/}
                            <div className="form-wrap">
                                <div className="form-title">
                                    {this.state.currentView === VIEWS.RIGISTER ? Intl.get('login.register', '注册') : Intl.get('login.login', '登录')}
                                </div>
                                {this.state.currentView === VIEWS.RIGISTER ?
                                    <RegisterForm
                                        REGISTER_STEPS={REGISTER_STEPS}
                                        changeToLoginView={this.changeView.bind(this)}
                                        onRegisterStepChange={this.onRegisterStepChange.bind(this)}/> :
                                    <LoginForm
                                        captcha={this.state.captcha}
                                        hasWindow={hasWindow}
                                        setErrorMsg={this.setErrorMsg}
                                        {...this.props}
                                    />}
                                {this.state.errorMsg ?
                                    <div className="login-error-tip"><span className="iconfont icon-warn-icon"></span>{this.state.errorMsg}</div> : null}
                            </div>
                        </div>

                    ) : null
                    }
                    <SideBar showChat={Oplate.isCurtao}></SideBar>
                </div>
            );
        }
    }
}

LoginMain.propTypes = {
    loginErrorMsg: PropTypes.string,
    captchaCode: PropTypes.string
};
export default LoginMain;
