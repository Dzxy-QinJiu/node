/**
 * Copyright (c) 2015-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2020/7/10.
 */
require('./index.less');
const weixinImgUrl = require('./image/weixin.jpg');

const RightSideBar = () => {
    return (
        <div className='side-bar-wrap'>
            <div className='wechat-code-title'>{Intl.get('login.wechat.mini.program', '微信小程序')}</div>
            <img className='qrcode weixin' src={weixinImgUrl} />
        </div>
    );
};
export default RightSideBar;