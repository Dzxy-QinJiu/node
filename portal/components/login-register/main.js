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

const logoSrc = require('./image/curtao_logo_white.svg');
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

class RegisterPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currRegistStep: REGISTER_STEPS.COMPANY_ID_SET,//注册的当前步骤
        };
    }

    componentDidMount() {
        Trace.addEventListener(window, 'click', Trace.eventHandler);
    }

    componentWillUnmount() {
        Trace.detachEventListener(window, 'click', Trace.eventHandler);
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
        const hasWindow = !(typeof window === 'undefined');
        return (
            <div className="register-wrap" data-tracename="个人注册页面">
                <div className="register-image-container">
                    <div className='register-left-content-style'>
                        <img src={logoSrc} className='register-logo' />
                    </div>
                    <div className='register-left-content-style'>
                        <span className='register-slogan-tip'>{Intl.get('register.slogan.tip', '销售加速，从这里开始...')}</span>
                    </div>
                </div>
                {hasWindow ? (
                    <div className="register-form-wrap">
                        <div className="form-wrap">
                            <div className="form-title">{Intl.get('register.title.tip', '欢迎注册客套')}</div>
                            <RegisterForm/>
                        </div>
                    </div>) : null
                }
            </div>
        );
    }
}

export default RegisterPage;
