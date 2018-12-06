/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/30.
 */
import Bundle from '../../public/sources/route/route-bundle';


const ProductPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(ProductPage) => <ProductPage {...props}/>}
    </Bundle>
);

module.exports = {
    path: '/background_management/products',
    component: ProductPage
};
