/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/3/15.
 */
import Bundle from '../../public/sources/route-bundle';

const ApplyPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(ApplyPage) => <ApplyPage {...props}/>}
    </Bundle>
);

module.exports = function(path) {
    return {
        path: '/apply',
        compoent: ApplyPage
    };
};
