/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/15.
 */
require('./style/main.less');
const React = require('react');
const PropTypes = require('prop-types');
const Logo = require('../Logo');
const LoginForm = require('../Login/login-form');
import {Alert, Tabs, Icon, Button} from 'antd';
const TabPane = Tabs.TabPane;
const logoScr = require('../Login/image/wihte-logo.png');
const TAB_KEYS = {
    BIND_USER: 'bind_user',//绑定已有用户
    REGISTER_BIND: 'register_bind'//注册新用户并绑定
};
class WechatBindLoginMain extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: TAB_KEYS.BIND_USER,
            captcha: ''
        };
    }

    handleTabChange(activeKey) {
        this.setState({activeKey: activeKey});
    }
    setErrorMsg
    render() {
        const hasWindow = !(typeof window === 'undefined');
        return (
            <div className="login-wrap">
                {/*<Logo logoSrc={logoScr}/>*/}
                {/*{hasWindow ? (*/}
                <Tabs activeKey={this.state.activeKey} onChange={this.handleTabChange.bind(this)}>
                    <TabPane tab={Intl.get('register.wechat.bind.user', '绑定已有账号')} key={TAB_KEYS.BIND_USER}>
                        <div className="form-wrap">
                            {this.state.activeKey === TAB_KEYS.BIND_USER ? (
                                <LoginForm
                                    captcha={this.state.captcha}
                                    hasWindow={hasWindow}
                                    {...this.props}
                                />
                            ) : null}
                        </div>
                    </TabPane>
                    <TabPane tab={Intl.get('register.wechat.register.bind', '注册新账号')} key={TAB_KEYS.REGISTER_BIND}>
                        <div className="form-wrap">
                            {this.state.activeKey === TAB_KEYS.REGISTER_BIND ? (
                                <div>{Intl.get('register.wechat.register.bind', '注册新账号')}</div>
                            ) : null}
                        </div>
                    </TabPane>
                </Tabs>
                {/*) : null}*/}
            </div>);
    }
}
WechatBindLoginMain.propTypes = {
    loginErrorMsg: PropTypes.string
};
export default WechatBindLoginMain;