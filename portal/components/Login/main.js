var React = require('react');
import './style.less';
import './index.less';
const PropTypes = require('prop-types');
const QRCode = require('qrcode.react');
const classnames = require('classnames');
const Logo = require('../Logo');
const LoginForm = require('./login-form');
import {Alert, Tabs, Icon, Button} from 'antd';
import {ssoLogin, callBackUrl, buildRefreshCaptchaUrl} from '../../lib/websso';
import {storageUtil} from 'ant-utils';
import SideBar from '../side-bar';
import WeChatRegisterForm from './wechat-register-form';

const TabPane = Tabs.TabPane;
let QRCodeLoginInterval = null;
const LOGIN_INTERVAL_TIME = 5 * 1000;//5s:获取二维码展示后，调用登录接口的时间间隔
var Spinner = require('../spinner');
const LANGUAGES = [
    {code: 'zh_CN', name: '简体中文'},
    {code: 'en_US', name: 'English'},
    {code: 'es_VE', name: 'Español'},
];
//扫码登录的前缀，用于手机端扫码时判断扫的是不是登录的二维码
const LOGIN_QRCODE_PREFIX = 'ketao_login_';
const VIEWS = {
    LOGIN: 'login',
    FORGOT_PASSWORD: 'forgot_password',
};
const USER_LANG_KEY = 'userLang';//存储用户语言环境的key
const logoScr = require('./image/wihte-logo.png');
//微信绑定的tab-key
const BIND_WECHAT_TAB_KEYS = {
    BIND_USER: 'bind_user',//绑定已有用户
    REGISTER_BIND: 'register_bind'//注册新用户并绑定
};
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
            bindWechatActiveKey: this.props.isWechatRegisterError ? BIND_WECHAT_TAB_KEYS.REGISTER_BIND : BIND_WECHAT_TAB_KEYS.BIND_USER,
            isBindWechat: this.props.isBindWechat,
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

    changeView(view) {
        this.setState({currentView: view, errorMsg: ''});
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
        ssoLogin.check().then((ticket) => {
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

    bindWechatTabChange(activeKey) {
        this.setState({bindWechatActiveKey: activeKey});
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

    renderBindWechatBlock(hasWindow) {
        return (
            <Tabs activeKey={this.state.bindWechatActiveKey} onChange={this.bindWechatTabChange.bind(this)}>
                <TabPane tab={Intl.get('register.wechat.bind.user', '绑定已有账号')} key={BIND_WECHAT_TAB_KEYS.BIND_USER}>
                    <div className="form-wrap">
                        {this.state.bindWechatActiveKey === BIND_WECHAT_TAB_KEYS.BIND_USER ? (
                            <LoginForm
                                captcha={this.state.captcha}
                                hasWindow={hasWindow}
                                // setErrorMsg={this.setErrorMsg}
                                isBindWechat={true}
                                {...this.props}
                            />
                        ) : null}
                        {/*{this.state.errorMsg ? (
                            <Alert message={this.state.errorMsg} type="error" showIcon/>
                        ) : null}*/}

                    </div>
                </TabPane>
                {/*<TabPane tab={Intl.get('register.wechat.register.bind', '注册新账号')}*/}
                {/*key={BIND_WECHAT_TAB_KEYS.REGISTER_BIND}>*/}
                {/*<div className="form-wrap">*/}
                {/*{this.state.bindWechatActiveKey === BIND_WECHAT_TAB_KEYS.REGISTER_BIND ? (*/}
                {/*<WeChatRegisterForm setErrorMsg={this.setErrorMsg} hasWindow={hasWindow}/>*/}
                {/*) : null}*/}
                {/*{this.state.errorMsg ? (*/}
                {/*<Alert message={this.state.errorMsg} type="error" showIcon/>*/}
                {/*) : null}*/}
                {/*</div>*/}
                {/*</TabPane>*/}
            </Tabs>);
    }

    render() {
        //如果是初次渲染不展示表单;
        //如果有错误信息，则不显示loading状态
        const useSso = window.Oplate && window.Oplate.useSso;
        if (!this.state.showUi) {
            return (<div className="login-wrap">
                {this.state.errorMsg ? null : useSso ? <div className="sso-login-wrap">
                    <Spinner className="isloading"/>
                </div> : <Spinner className="isloading"/>}
            </div>);
        } else {
            const hasWindow = !(typeof window === 'undefined');

            return (
                <div className="login-wrap">
                    <Logo logoSrc={logoScr} size='36px'/>
                    {/*{ hasWindow ? (Oplate.hideLangQRcode ? null :*/}
                    {/*(<div>*/}
                    {/*<div className="lang-wrap">*/}
                    {/*<span>{Intl.get('common.user.lang', '语言')}：</span>*/}
                    {/*{LANGUAGES.map(lang => {*/}
                    {/*return <span><a href={`/login?lang=${lang.code}`}*/}
                    {/*onClick={this.changeLang.bind(this, lang.code)}*/}
                    {/*className={this.getLangClassName(lang.code, hasWindow)}>{lang.name}</a></span>;*/}
                    {/*})}*/}
                    {/*</div>*/}
                    {/*</div>)) : null*/}
                    {/*}*/}
                    {this.state.ketaoQRCodeShow ? (
                        <div className="ketao-download-qrcode-container">
                            <Icon type="cross" onClick={this.closeDownLoadKetaoQRCode.bind(this)}/>
                            <div className="ketao-download-qrcode">
                                <QRCode
                                    value={location.protocol + '//' + location.host + '/ketao'}
                                    level="H"
                                    size={165}
                                />
                            </div>
                            <div className="scan-ketao-qrcode-download-tip">
                                {Intl.get('scan.ketao.qrcode.download.tip', '扫码下载客套APP安卓端')}
                            </div>
                        </div>) : (hasWindow ? this.state.isBindWechat ? this.renderBindWechatBlock(hasWindow) : (
                        <Tabs activeKey={this.state.loginActiveKey} onChange={this.handleTabChange.bind(this)}>
                            <TabPane tab={Intl.get('login.account.login', '账号登录')} key="2">
                                <div className="form-wrap">
                                    {this.state.currentView === VIEWS.LOGIN ? (
                                        <LoginForm
                                            captcha={this.state.captcha}
                                            hasWindow={hasWindow}
                                            // setErrorMsg={this.setErrorMsg}
                                            {...this.props}
                                        />
                                    ) : null}
                                    {/*{this.state.errorMsg ? (
                                        <Alert message={this.state.errorMsg} type="error" showIcon/>
                                    ) : null}*/}

                                </div>
                            </TabPane>
                            <TabPane tab={Intl.get('login.scan.qrcode.login', '扫码登录')} key="1">
                                {this.state.isLoadingQRCode ? (<div className="qrcode-tip-layer">
                                    <div className="qrcode-tip-content">
                                        {Intl.get('login.qrcode.loading', '正在获取二维码...')}
                                    </div>
                                </div>) : this.state.QRCodeErrorMsg ? (
                                    <div className="qrcode-tip-layer">
                                        <div className="qrcode-tip-content">
                                            <Icon type="exclamation-circle"/><br/>
                                            <span className="error-text">{this.state.QRCodeErrorMsg}</span><br/>
                                            <Button
                                                onClick={this.getLoginQRCode.bind(this)}>{this.state.QRCodeErrorMsg === Intl.get('errorcode.147', '二维码已失效') ?
                                                    Intl.get('common.refresh', '刷新') : Intl.get('common.get.again', '重新获取')}</Button>
                                        </div>
                                    </div>) : null}
                                <div className="login-qrcode-container">
                                    <QRCode
                                        value={LOGIN_QRCODE_PREFIX + this.state.QRCode}
                                        level="H"
                                        size={165}
                                    />
                                </div>
                                <div className="login-scan-qrcode-tip">
                                    <ReactIntl.FormattedMessage
                                        id="login.qrcode.scan.tip"
                                        defaultMessage={'请使用{appName}扫描二维码安全登录'}
                                        values={{
                                            'appName': <a className="ketao-font-style"
                                                onClick={this.showDownLoadKetaoQRCode.bind(this)}>{Intl.get('login.ketao.app.name', '客套APP')}</a>,
                                        }}
                                    />
                                </div>
                            </TabPane>
                        </Tabs>) : null
                    )}

                    <SideBar showChat={Oplate.isCurtao}></SideBar>
                </div>
            );
        }
    }
}
LoginMain.propTypes = {
    loginErrorMsg: PropTypes.string,
    captchaCode: PropTypes.string,
    isBindWechat: PropTypes.bool,
    isWechatRegisterError: PropTypes.bool,
};
export default LoginMain;
