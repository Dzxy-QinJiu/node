/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/11/14.
 */
var React = require('react');
const PropTypes = require('prop-types');
const QRCode = require('qrcode.react');
const classnames = require('classnames');
const Logo = require('../Logo');
import RegisterForm from './register-form';
import {Alert, Tabs, Icon, Button} from 'antd';
import SideBar from '../side-bar';
var Spinner = require('../spinner');
const USER_LANG_KEY = 'userLang';//存储用户语言环境的key
import {storageUtil} from 'ant-utils';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const logoSrc = require('./image/curtao_logo_white.svg');
const LAYOUT = {
    COPY_RIGHT_HEIGHT: 46,//底部公司版权信息高度
    SLOGON_HEIGHT: 48,//缩小屏幕后slogon在头部展示时的高度
    SHOW_COPPY_RIGHT_HEIGHT: 620, //高度大于600时才展示版权信息
    SHOW_SLOGON_TOP_WIDTH: 720,//宽度大于720时，slogon在顶部展示
};
//注册步骤
const REGISTER_STEPS = {
    COMPANY_ID_SET: 0,//设置公司唯一标识
    PHONE_VALID: 1,//电话验证
    ACCOUNT_SET: 2//账号设置
};

class RegisterPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currRegistStep: REGISTER_STEPS.COMPANY_ID_SET,//注册的当前步骤
            formWrapHeight: this.getFormWrapHeight(),
        };
    }

    componentDidMount() {
        Trace.addEventListener(window, 'click', Trace.eventHandler);
        $(window).on('resize', this.onWindowResize);
    }

    componentWillUnmount() {
        Trace.detachEventListener(window, 'click', Trace.eventHandler);
        $(window).off('resize', this.onWindowResize);
    }
    onWindowResize = () => {
        this.setState({formWrapHeight: this.getFormWrapHeight()});
    }
    getFormWrapHeight() {
        // 减去底部版权信息的高度
        let formWrapHeight = $('body').height();
        // 高度大于600才展示版权信息
        if ($('body').height() > LAYOUT.SHOW_COPPY_RIGHT_HEIGHT) {
            formWrapHeight -= -LAYOUT.COPY_RIGHT_HEIGHT;
        }
        // 宽度小于720时，slogon在头部展示，去掉slgon的高度
        if ($('body').width() < LAYOUT.SHOW_SLOGON_TOP_WIDTH) {
            formWrapHeight -= LAYOUT.SLOGON_HEIGHT;
        }
        return formWrapHeight;
    }

    render() {
        const hasWindow = !(typeof window === 'undefined');
        return (
            <div className="register-wrap" data-tracename="个人注册页面">
                <div className="register-image-container">
                    <div className='register-left-content-style register-logo-wrap'>
                        <img src={logoSrc} className='register-logo' />
                    </div>
                    <div className='register-left-content-style register-slogan'>
                        <span className='register-slogan-tip'>{Intl.get('register.slogan.tip', '销售加速，从这里开始...')}</span>
                    </div>
                </div>
                {hasWindow ? (
                    <div className="register-form-wrap">
                        <div className="form-wrap" style={{height: this.state.formWrapHeight}}>
                            <GeminiScrollbar className='register-scroll-bar'>
                                <div className="register-content-continer">
                                    <div className="form-title">{Intl.get('register.title.tip', '欢迎注册客套')}</div>
                                    <RegisterForm/>
                                </div>
                            </GeminiScrollbar>
                        </div>
                    </div>) : null
                }
            </div>
        );
    }
}

export default RegisterPage;
