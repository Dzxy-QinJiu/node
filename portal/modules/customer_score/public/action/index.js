/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/1.
 */
import customerScoreAjax from '../ajax';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
class CustomerScoreActions {
    constructor() {
        this.generateActions(
            'resetState',
            'setRangeMaxValue',
            'setRangeValue',
            'changeLowerHandlePoint',
            'changeLargerHandlePoint',
        );
    }
    getCustomerScoreRules() {
        customerScoreAjax.getCustomerScoreRules().then((result) => {
            this.dispatch({resData: result});
        }, (errorMsg) => {

        });
    }
    getCustomerScoreLevel() {
        customerScoreAjax.getCustomerScoreLevel().then((result) => {
            this.dispatch({resData: result});
        }, (errorMsg) => {

        });
    }
}

export default alt.createActions(CustomerScoreActions);