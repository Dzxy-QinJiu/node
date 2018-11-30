/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/19.
 */

/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2017/4/11.
 */
'use strict';

var React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
import {Icon} from 'antd';
import {storageUtil} from 'ant-utils';

class LoginForm extends React.Component {
    state = {
        //用户名
        username: '',
        //注册登录按钮是否可用
        loginButtonDisabled: true,
        //登录状态
        logining: false
    };

    beforeSubmit = (event) => {
        var userName = _.trim(this.refs.username.value);
        if (!userName) {
            //用户名不能为空
            this.props.setErrorMsg(Intl.get('login.write.username', '请输入用户名'));
            event.preventDefault();
            return false;
        }
        //客户分析,第一次登录的时候，默认展示全部应用
        storageUtil.local.set('customer_analysis_stored_app_id', 'all');

        //设置状态为注册登录中
        this.setState({
            logining: true
        });
    };

    userNameChange = (evt) => {
        this.setState({
            username: evt.target.value,
            loginButtonDisabled: false
        }, () => this.props.setErrorMsg(''));
    };

    render() {
        const loginButtonClassName = classnames('login-button', {'not-allowed': this.state.loginButtonDisabled});

        const hasWindow = this.props.hasWindow;

        return (
            <div>
                <form action={'/register/login/wechat'} method="post"
                    onSubmit={this.beforeSubmit} autoComplete="off">
                    <div className="input-area">
                        <div className="input-item">
                            <input
                                placeholder={hasWindow ? Intl.get('common.username', '用户名') : null}
                                type="text"
                                name="username" autoComplete="off" tabIndex="1"
                                ref="username" value={this.state.username} onChange={this.userNameChange}
                                onBlur={this.getLoginCaptcha}/>
                        </div>
                    </div>
                    <button className={loginButtonClassName} type={this.state.loginButtonDisabled ? 'button' : 'submit'}
                        tabIndex="3"
                        disabled={this.state.loginButtonDisabled}
                        data-tracename='点击注册登录'
                    >
                        {hasWindow ? Intl.get('register.wechat.register.btn', '注册并登录') : null}
                        {this.state.logining ? <Icon type="loading"/> : null}
                    </button>
                </form>
            </div>
        );
    }
}

LoginForm.propTypes = {
    setErrorMsg: PropTypes.func,
    hasWindow: PropTypes.bool,
};
module.exports = LoginForm;
