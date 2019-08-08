/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/5.
 */
import userScoreAjax from '../ajax';
import {scrollBarEmitter} from 'PUB_DIR/sources/utils/emitters';
class UserScoreActions {
    constructor() {
        this.generateActions(
            'resetState',
            'hideSaveErrMsg',
            'updateUserRule'

        );
    }
    getUserScoreIndicator() {
        userScoreAjax.getUserScoreIndicator().then((result) => {
            this.dispatch({resData: result});
        }, (errorMsg) => {

        });
    }
    getUserEngagementRule(callback) {
        this.dispatch({loading: true,error: false});
        userScoreAjax.getUserEngagementRule().then((result) => {
            _.isFunction(callback) && callback(result);
            this.dispatch({loading: false,error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    }
    saveUserEngagementRule() {
        userScoreAjax.saveUserEngagementRule().then((result) => {
            this.dispatch({resData: result});
        }, (errorMsg) => {

        });
    }
    getUserScoreLists(callback) {
        this.dispatch({loading: true,error: false});
        userScoreAjax.getUserScoreLists().then((result) => {
            _.isFunction(callback) && callback(result);
            this.dispatch({loading: false,error: false, resData: result});
        }, (errorMsg) => {
            this.dispatch({loading: false,error: true, errorMsg: errorMsg});
        });
    }
    saveUserScoreLists(queryObj,callback){
        this.dispatch({loading: true,error: false});
        userScoreAjax.saveUserScoreLists(queryObj).then((result) => {
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

export default alt.createActions(UserScoreActions);