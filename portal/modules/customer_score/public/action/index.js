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
            'setInitialRangeValue',//初始化尺子上的尺寸
            'hideSaveErrMsg',
            'hideSaveLevelErrMsg',
            'updateCustomerScoreRange',
            'updateCustomerRule'
        );
    }
    getCustomerScoreRules() {
        this.dispatch({loading: true,error: false});
        customerScoreAjax.getCustomerScoreRules().then((result) => {
            this.dispatch({loading: false,error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    }
    getCustomerScoreLevel(callback) {
        this.dispatch({loading: true,error: false});
        customerScoreAjax.getCustomerScoreLevel().then((result) => {
            _.isFunction(callback) && callback(result);
            this.dispatch({loading: false,error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    }
    getCustomerScoreIndicator(callback){
        customerScoreAjax.getCustomerScoreIndicator().then((result) => {
            _.isFunction(callback) && callback(result);
            this.dispatch({resData: result});
        }, (errorMsg) => {

        });
    }
    saveCustomerRules(queryObj,callback){
        this.dispatch({loading: true,error: false});
        customerScoreAjax.saveCustomerRules(queryObj).then((result) => {
            if (result){
                _.isFunction(callback) && callback();
                this.dispatch({loading: false,error: false});
            }else{
                this.dispatch({loading: false,error: true, errorMsg: Intl.get('common.save.failed', '保存失败')});
            }

        }, (errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    }
    saveCustomerLevels(queryObj,callback){
        this.dispatch({loading: true,error: false});
        customerScoreAjax.saveCustomerLevels(queryObj).then((result) => {
            if (result){
                _.isFunction(callback) && callback();
                this.dispatch({loading: false,error: false});
            }else{
                this.dispatch({loading: false,error: true, errorMsg: Intl.get('common.save.failed', '保存失败')});
            }

        }, (errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    }
}

export default alt.createActions(CustomerScoreActions);