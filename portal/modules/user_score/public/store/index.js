/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/5.
 */
import UserScoreActions from '../action';
import {TimeRangeSelect} from 'MOD_DIR/customer_score/public/utils/customer_score_util';
class UserScoreStore {
    constructor() {
        this.resetState();
        this.bindActions(UserScoreActions);
    }

    // 初始化数据
    resetState() {
        this.userIndicator = [];//用户的评分的提示选项
        this.userIndicatorRange = {};
        this.userIndicatorType = {};
        this.saveRulesErr = '';//保存报错的情况
        this.isSavingRules = false;//正在保存规则
        this.userLevelObj = {
            loading: true,
            errMsg: '',
            obj: {}
        };//已保存的用户评分规则
        this.userEngagementObj = {
            loading: true,
            errMsg: '',
            obj: {}
        };//已保存的用户评分规则
        this.appListErrorMsg = '';//获取应用列表出错的信息
        this.appList = [];//获取应用列表
        this.isSavingEngagement = false;//正在保存用户参与度
        this.saveEngagementErr = '';//保存用户参与度出错
    }
    getUserScoreLists(result) {
        if (result.loading) {
            this.userLevelObj.loading = true;
            this.userLevelObj.errMsg = '';
        } else if (result.error){
            this.userLevelObj.loading = false;
            this.userLevelObj.errMsg = result.errorMsg;
        }else{
            this.userLevelObj.loading = false;
            this.userLevelObj.errMsg = '';
            this.userLevelObj.obj = result.resData;
        }
    }
    getUserEngagementRule(result){
        if (result.loading) {
            this.userEngagementObj.loading = true;
            this.userEngagementObj.errMsg = '';
        } else if (result.error){
            this.userEngagementObj.loading = false;
            this.userEngagementObj.errMsg = result.errorMsg;
        }else{
            this.userEngagementObj.loading = false;
            this.userEngagementObj.errMsg = '';
            this.userEngagementObj.obj = result.resData;
        }
    }
    getUserScoreIndicator(result){
        if (_.isArray(result.resData)){
            this.userIndicator = result.resData;
            //对数据进行组合关联一下
            _.each(this.userIndicator, item => {
                this.userIndicatorRange[item.indicator] = TimeRangeSelect;
                if (item.indicator === 'online_time'){
                    this.userIndicatorType[item.indicator] = [
                        {name: Intl.get('user.score.total.minutes', '总分钟数'),value: 'min'},
                        {name: Intl.get('user.score.total.hours', '总小时数'),value: 'hour'}];
                }else{
                    this.userIndicatorType[item.indicator] = [{name: Intl.get('user.score.total.days', '总天数'),value: 'day'}];
                }
            });
        }

    }
    hideSaveErrMsg(){
        this.saveRulesErr = '';
    }
    updateUserRule(updateObj){
        this.userLevelObj.obj = updateObj;
    }
    updateUserEngagement(updateObj){
        this.userEngagementObj.obj = updateObj;
    }
    saveUserScoreLists(result){
        if (result.loading){
            this.isSavingRules = true;
            this.saveRulesErr = '';
        }else if (result.error){
            this.isSavingRules = false;
            this.saveRulesErr = result.errorMsg;
        }else{
            this.isSavingRules = false;
            this.saveRulesErr = '';

        }
    }
    saveUserEngagementRule(result){
        if (result.loading){
            this.isSavingEngagement = true;
            this.saveEngagementErr = '';
        }else if (result.error){
            this.isSavingEngagement = false;
            this.saveEngagementErr = result.errorMsg;
        }else{
            this.isSavingEngagement = false;
            this.saveEngagementErr = '';
        }
    }





}

export default alt.createStore(UserScoreStore, 'UserScoreStore');