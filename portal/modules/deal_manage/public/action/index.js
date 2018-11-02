/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/10/31.
 */
import dealAjax from '../ajax';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
function dealManageAction() {
    this.generateActions(
        'setInitData'
    );
    //获取订单列表
    this.getDealList = function(params, body, query) {
        this.dispatch({loading: true});
        dealAjax.getDealList(params, body, query).then((data) => {
            this.dispatch({loading: false, data: data});
            scrollBarEmitter.emit(scrollBarEmitter.HIDE_BOTTOM_LOADING);
        }, (errorMsg) => {
            this.dispatch({loading: false, errorMsg: errorMsg || Intl.get('deal.list.get.failed', '获取订单列表失败')});
        });
    };
}

export default alt.createActions(dealManageAction);
