/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/8/1.
 */


import CustomerScoreActions from '../action';

class CustomerScoreStore {
    constructor() {
        this.resetState();
        this.bindActions(CustomerScoreActions);
    }

    // 初始化数据
    resetState() {
        this.customerLevelRules = [];//客户不同等级对应的分数,后端获取来的
        this.rangeHandleValue = [];//默认区分不同类型的点的数组
        this.lowerHandlePoint = 0;//不合格和合格直接的节点值
        this.largerHandlePoint = 0;//合格和优质直接的节点值
        this.minValue = 0;//分数尺子上的最小刻度
        this.maxValue = 0;//分数尺子上的最大刻度
        this.marks = {};//尺子上的下标
        this.customerIndicator = [];//客户评分规则
        this.customerLevelObj = {
            loading: true,
            errMsg: '',
            obj: {}
        };//已保存的客户评分规则
        //正在保存客户规则
        this.isSavingRules = false;
        this.saveRulesErr = '';
    }


    //修改最大值
    setRangeMaxValue(updateValue) {
        this.maxValue = updateValue;
        var range = updateValue / 5;
        this.marks = {};
        for (var i = 0; i < 5; i++) {
            this.marks[i * range] = i * range;
        }
    }

    //修改range的值
    setRangeValue(value) {
        if (_.isArray(value)) {
            //需要先按大小排一下顺序
            value = value.sort((a, b) => {return a - b;});
            this.rangeHandleValue = value;
            this.lowerHandlePoint = _.get(value, '[1]');
            this.largerHandlePoint = _.get(value, '[2]');
        } else {
            this.rangeHandleValue = [0, this.lowerHandlePoint, this.largerHandlePoint];
            //重新计算尺子的最大长度 todo
            var max = this.largerHandlePoint + (this.largerHandlePoint - this.lowerHandlePoint);
            this.maxValue = Math.ceil(max / 5) * 5 < 100 ? 100 : Math.ceil(max / 5) * 5;
            var range = this.maxValue / 5;
            this.marks = {};
            for (var i = 0; i < 5; i++) {
                this.marks[i * range] = i * range;
            }
        }

    }

    getCustomerScoreRules(result) {
        if (_.isArray(result.resData)) {
            this.customerLevelRules = result.resData;
            this.setInitialRangeValue();

        }
    }

    setInitialRangeValue(){
        this.rangeHandleValue = [0];
        _.forEach(this.customerLevelRules, item => {
            // if (item.from && item.from.toFixed(0)) {
            //     this.rangeHandleValue.push(+item.from.toFixed(0));
            // }
            //
            // if (item.to && item.to.toFixed(0)) {
            //     this.rangeHandleValue.push(+item.to.toFixed(0));
            // }

            if (item.level_name === 'cold') {
                this.lowerHandlePoint = +item.to.toFixed(0);
                this.rangeHandleValue.push(+item.to.toFixed(0));
            }
            if (item.level_name === 'warm') {
                this.largerHandlePoint = +item.to.toFixed(0);
                this.rangeHandleValue.push(+item.to.toFixed(0));
            }
        });
        this.rangeHandleValue = this.rangeHandleValue.sort((a, b) => {return a - b;});
        this.rangeHandleValue = _.uniq(this.rangeHandleValue);
        //排序
        this.rangeHandleValue = this.rangeHandleValue.sort((a, b) => {return a - b;});
        //把最大值的范围修改一下
        var max = this.largerHandlePoint + (this.largerHandlePoint - this.lowerHandlePoint);
        this.maxValue = Math.ceil(max / 5) * 5 < 100 ? 100 : Math.ceil(max / 5) * 5;
        var range = this.maxValue / 5;
        this.marks = {};
        for (var i = 0; i < 5; i++) {
            this.marks[i * range] = i * range;
        }
    }

    changeLowerHandlePoint(updateValue) {
        this.lowerHandlePoint = updateValue;
    }

    changeLargerHandlePoint(updateValue) {
        this.largerHandlePoint = updateValue;
    }

    getCustomerScoreLevel(result) {
        if (result.loading) {
            this.customerLevelObj.loading = true;
            this.customerLevelObj.errMsg = '';
        } else if (result.error){
            this.customerLevelObj.loading = false;
            this.customerLevelObj.errMsg = result.errorMsg;
        }else{
            this.customerLevelObj.loading = false;
            this.customerLevelObj.errMsg = '';
            this.customerLevelObj.obj = result.resData;

        }
    }
    getCustomerScoreIndicator(result) {
        if (_.isArray(result.resData)) {
            this.customerIndicator = result.resData;
        }
    }
    saveCustomerRules(result){
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
    hideSaveErrMsg(){
        this.saveRulesErr = '';
    }
    updateCustomerScoreRange(updateObj){
        this.customerLevelRules = updateObj;
    }
    updateCustomerRule(updateObj){
        this.customerLevelObj.obj = updateObj;
    }

}

export default alt.createStore(CustomerScoreStore, 'CustomerScoreStore');