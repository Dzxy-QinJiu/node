/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/5/20.
 */
var _ = require('lodash');
exports.toFrontRecommendClueData = function(item) {
    return {
        id: item.id,
        //(会有高亮内容<em>###</em>)
        name: item.name,
        sortvalues: item.sortvalues,
        ranking: item.ranking,
        //注册时间
        startTime: _.get(item,'startTime', ''),
        //经营范围(会有高亮内容<em>###</em>)
        scope: _.get(item,'scope', ''),
        //标签
        labels: _.get(item,'labels', []),
        features: _.get(item,'features',[]),
        //注册资本
        capital: _.get(item,'capital', ''),
        //法人
        legalPerson: _.get(item,'legalPerson', ''),
        //产品(会有高亮内容<em>###</em>)
        products: _.get(item,'products', ''),
        //行业
        industry: _.get(item,'industry', ''),
        //简介(会有高亮内容<em>###</em>)
        companyProfile: _.get(item,'companyProfile', ''),
        telephones: _.get(item,'telephones',[]),
        //企业状态
        openStatus: _.get(item,'openStatus', ''),
        //contact: {phones: 1, qq: 1, weChat: 0, email: 2}
        contact: {
            phones: _.get(item, 'telephones.length', 0),
            qq: 0,//qq信息后端暂未实现，这里先占位
            weChat: _.get(item, 'gongzhonghao') ? 1 : 0,
            email: _.get(item, 'email.length', 0),
        }
    };
};