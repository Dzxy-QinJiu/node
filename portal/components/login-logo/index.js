/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/11/20.
 */
const Logo = require('../Logo');
const logoSrc = require('./curtao-logo.png');
const PropTypes = require('prop-types');
const LoginLogo = (props) => {
    return (<Logo logoSrc={logoSrc} fontColor="#000000" fontSize={props.fontSize || '24px'} size={props.size || '32px'} />);
};
LoginLogo.propTypes = {
    size: PropTypes.string,
    fontSize: PropTypes.string,
};
export default LoginLogo;