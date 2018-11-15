/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/15.
 */
const React = require('react');
const PropTypes = require('prop-types');
class WechatBindLoginMain extends React.Component {
    render() {
        return (
            <div className="wechat-bind-login-container">
                微信绑定界面
            </div>);
    }
}
WechatBindLoginMain.propTypes = {
    loginErrorMsg: PropTypes.string
};
export default WechatBindLoginMain;