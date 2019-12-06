/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/11/20.
 */
const Logo = require('../Logo');
const logoSrc = require('./curtao-logo.png');
const LoginLogo = () => {
    return (<Logo logoSrc={logoSrc} fontColor="#000000" fontSize='24px' size='32px'/>);
};
export default LoginLogo;