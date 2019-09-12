/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by liwenjun on 2018/10/31.
 */
let ProductionActions = require('../action/production-actions');
import {INTEGRATE_TYPES} from 'PUB_DIR/sources/utils/consts';
let emptyProduction = {
    id: '',
    name: '',
    code: '',
    description: '',
    price: '',
    sales_unit: '',
    full_image: '',
    image: '',
    specifications: '',
    create_time: '',
    url: ''
};

function ProductionStore() {
    //在 编辑/添加 状态的时候 formShow 为true
    this.formShow = false;
    //列表
    this.userListSize = 0;
    //当前要展示的用户列表
    this.productionList = [];
    // 编辑/添加 状态时
    this.currentProduction = emptyProduction;
    //当前正在展示的是第几页的数据
    this.curPage = 1;
    //一页可显示的个数
    this.pageSize = 20;
    //用于下拉加载数据的id
    this.lastId = '';
    //加载数据中。。。
    this.isLoading = true;
    //表单的类型：添加/修改
    this.formType = 'add';
    //获取成员列表时，错误/暂无（符合条件的）数据的提示
    this.listTipMsg = '';
    this.bindActions(ProductionActions);
}

//关闭右侧详情后，将数据置为空
ProductionStore.prototype.setInitialData = function() {
    this.currentProduction = emptyProduction;
};

//公开方法，获取当前展示的列表
ProductionStore.prototype.getProductions = function(data) {
    this.isLoading = false;
    if (_.isString(data)) {
        //错误提示的赋值
        this.listTipMsg = data;
        this.productionList = [];
        this.userListSize = 0;
    } else {
        let list = _.get(data, 'list', []);
        if (this.curPage === 1) {
            this.productionList = list;
        } else {
            this.productionList = _.concat(this.productionList, list);
        }
        this.userListSize = _.get(data, 'total', 0);
        if (_.get(this.productionList, '[0]')) {
            this.lastId = _.last(this.productionList).id;
            //清空无数据的提示
            this.listTipMsg = '';
        } else {
            this.listTipMsg = Intl.get('common.no.data', '暂无数据') + '!';
        }
    }
};

ProductionStore.prototype.getProductById = function(data) {
    if (_.get(data, 'id')) {
        let production = _.find(this.productionList, item => item.id === data.id);
        production = production = _.extend(production, data);
    }
};

//添加产品后更新列表
ProductionStore.prototype.addProduction = function(production) {
    this.productionList.unshift(production);
    this.currentProduction = production;
    this.listTipMsg = '';
};
//更新产品
ProductionStore.prototype.updateProduction = function(updatedProduction) {
    let production = _.find(this.productionList, item => item.id === updatedProduction.id);
    //修改产品的集成类型
    if (updatedProduction.changeType) {
        production.integration_type = updatedProduction.changeType === INTEGRATE_TYPES.UEM ? INTEGRATE_TYPES.UEM : '';
        //将uem产品改为普通产品时，去掉集成的id
        if (!production.integration_type) {
            delete production.integration_id;
        }
        delete updatedProduction.changeType;
    }
    //基本信息的修改
    if (updatedProduction.isEditBasic) {
        delete updatedProduction.isEditBasic;
        production = _.extend(production, updatedProduction);
    }
};

//点击产品查看详情时
ProductionStore.prototype.setCurProduction = function(id) {
    let curProduction = _.find(this.productionList, function(production) {
        if (production.id === id) {
            return true;
        }
    });
    this.currentProduction = curProduction || emptyProduction;
};


ProductionStore.prototype.showForm = function(type) {
    if (type === 'add') {
        this.currentProduction = emptyProduction;
    }
    this.formType = type;
    this.formShow = true;
};


ProductionStore.prototype.updateCurPage = function(curPage) {
    this.curPage = curPage;
};

ProductionStore.prototype.updatePageSize = function(pageSize) {
    this.pageSize = pageSize;
};

ProductionStore.prototype.showInfoPanel = function() {
    this.formShow = true;
};

ProductionStore.prototype.closeInfoPanel = function() {
    this.formShow = false;
};

//删除产品
ProductionStore.prototype.deleteItemById = function(id) {
    if (id) {
        this.productionList.forEach((item, key) => {
            if (item.id === id) {
                this.productionList.splice(key, 1);
                return true;
            }
        });
        if (this.productionList.length === 0) {
            this.listTipMsg = Intl.get('common.no.data', '暂无数据') + '!';
        }
    }
};
module.exports = alt.createStore(ProductionStore, 'ProductionStore');
