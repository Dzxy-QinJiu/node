/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/12/11.
 */
import Bundle from '../../public/sources/route/route-bundle';

const DocumentWriteApplyPage = (props) => (
    <Bundle load={() => import('./public')}>
        {(DocumentWriteApplyPage) => <DocumentWriteApplyPage {...props}/>}
    </Bundle>
);
module.exports = {
    path: '/application/document_write',
    component: DocumentWriteApplyPage

};