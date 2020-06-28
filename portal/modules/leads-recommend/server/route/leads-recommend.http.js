/**
 * Copyright (c) 2019-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2019-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/6/23.
 */

module.exports = {
    module: 'leads-recommend/server/action/leads-recommend-controller',
    routes: [{//获取线索最大提取量的数值
        method: 'get',
        path: '/rest/get/maxlimit/and/hasExtracted/count',
        handler: 'getMaxLimitCountAndHasExtractedClue',
        passport: {
            needLogin: true
        }
    }, {//获取推荐线索列表
        method: 'post',
        path: '/rest/clue/recommend/lists',
        handler: 'getRecommendClueLists',
        passport: {
            'needLogin': true
        }
    }, {//获取行业列表
        method: 'get',
        path: '/rest/clue/condition/industries',
        handler: 'getClueIndustryLists',
        passport: {
            'needLogin': true
        }
    }, {//获取推荐线索条件配置
        method: 'get',
        path: '/rest/clue/recommend/condition',
        handler: 'getSelfClueConditionConfig',
        passport: {
            'needLogin': true
        }
    }, {//修改推荐线索条件配置
        method: 'post',
        path: '/rest/clue/recommend/condition',
        handler: 'addOrEditSelfClueConditionConfig',
        passport: {
            'needLogin': true
        }
    }, {//单个提取线索
        method: 'post',
        path: '/rest/clue/extract/recommend/clue',
        handler: 'extractRecommendClue',
        passport: {
            'needLogin': true
        }
    }, {//批量提取线索
        method: 'post',
        path: '/rest/clue/batch/recommend/list',
        handler: 'batchExtractRecommendLists',
        passport: {
            'needLogin': true
        }
    }, {//根据公司名获取联想列表
        method: 'get',
        path: '/rest/recommend/clue/company/name',
        handler: 'getCompanyListByName',
        passport: {
            needLogin: true
        },
    }, {//获取该线索是否被提取
        method: 'get',
        path: '/rest/recommend/clue/picked',
        handler: 'getRecommendCluePicked',
        passport: {
            needLogin: true
        },
    }]
};