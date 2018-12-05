/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
import Bundle from '../../public/sources/route/route-bundle';

const DealManagePage = (props) => (
    <Bundle load={() => import('./public')}>
        {(DealManagePage) => <DealManagePage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/deal_manage',
    component: DealManagePage
};