/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
require('../action/clue-customer-controller');
import cluePrivilegeConst from '../../../clue_customer/public/privilege-const';

module.exports = {
    module: 'clue_customer/server/action/clue-customer-controller',
    routes: [{
        //导出线索
        'method': 'post',
        'path': '/rest/customer/v2/customer/range/clue/export/:page_size/:sort_field/:order/:type',
        'handler': 'exportClueFulltext',
        'passport': {
            'needLogin': true
        }
    }, {
        method: 'get',
        path: '/rest/sales_clue/source',
        handler: 'getClueSource',
        passport: {
            needLogin: true
        },
        privileges: [
            cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_SELF,
            cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL
        ]
    }, {
        method: 'get',
        path: '/rest/sales_clue/channel',
        handler: 'getClueChannel',
        passport: {
            needLogin: true
        },
        privileges: [
            cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_SELF,
            cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL
        ]
    }, {
        method: 'get',
        path: '/rest/get/maxlimit/and/hasExtracted/count',
        handler: 'getMaxLimitCountAndHasExtractedClue',
        passport: {
            needLogin: true
        }
    }, {
        method: 'get',
        path: '/rest/sales_clue/classify',
        handler: 'getClueClassify',
        passport: {
            needLogin: true
        },
        privileges: [
            cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_SELF,
            cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL
        ]
    }, {
        method: 'post',
        path: '/rest/cluecustomer/v2/add/trace',
        handler: 'addCluecustomerTrace',
        passport: {
            needLogin: true
        },
    }, {
        method: 'post',
        path: '/rest/cluecustomer/v2/distribute/sales',
        handler: 'distributeCluecustomerToSale',
        passport: {
            needLogin: true
        },
    }, {
        method: 'put',
        path: '/rest/cluecustomer/v2/update/detailitem',
        handler: 'updateCluecustomerDetail',
        passport: {
            needLogin: true
        },
    }, {
        method: 'put',
        path: '/rest/relate_clue_and_customer/:type',
        handler: 'relateClueAndCustomer',
        passport: {
            needLogin: true
        },
    }, {
        method: 'get',
        path: '/rest/clue/download_template/:isCommonSales',
        handler: 'getClueTemplate',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/clue/upload',
        handler: 'uploadClues',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'get',
        path: '/rest/clue/confirm/upload/:flag',
        handler: 'confirmUploadClues',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'delete',
        path: '/rest/clue/repeat/delete/:index',
        handler: 'deleteRepeatClue',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/clue/analysis',
        handler: 'getClueAnalysis',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/clue/statics/:type/:field/:page_size/:num',
        handler: 'getClueStatics',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/clue/trend/statics/:type',
        handler: 'getClueTrendStatics',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/get/clue/fulltext/:page_size/:page_num/:sort_field/:order/:type',
        handler: 'getClueFulltext',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'get',
        path: '/rest/clue_dynamic/:clue_id/:page_size',
        handler: 'getDynamicList',
        passport: {
            needLogin: true
        },
        privileges: [
            cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL,
            cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_SELF
        ]
    }, {
        method: 'delete',
        path: '/rest/clue/delete',
        handler: 'deleteClue',
        passport: {
            needLogin: true
        },
        privileges: [
            cluePrivilegeConst.CURTAO_CRM_LEAD_DELETE
        ]
    }, {
        method: 'get',
        path: '/rest/clue/detail/:clueId',
        handler: 'getClueDetailById',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/clue/detail/belongTome/:page_size/:sort_field/:order/:type',
        handler: 'getClueDetailByIdBelongTome',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/cluecustomer/change/sales/batch/:type',
        handler: 'changeClueSalesBatch',
        passport: {
            needLogin: true
        },
    }, {
        method: 'post',
        path: '/rest/clue/v2/query/leads/by/ids',
        handler: 'getSimilarClueLists',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/customer/v3/customer/query/customers/by/ids',
        handler: 'getSimilarCustomerLists',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/clue/recommend/lists',
        handler: 'getRecommendClueLists',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'get',
        path: '/rest/clue/condition/industries',
        handler: 'getClueIndustryLists',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'get',
        path: '/rest/clue/recommend/condition',
        handler: 'getSelfClueConditionConfig',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/clue/recommend/condition',
        handler: 'addOrEditSelfClueConditionConfig',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/clue/extract/recommend/clue',
        handler: 'extractRecommendClue',
        passport: {
            'needLogin': true
        }
    }, {
        method: 'post',
        path: '/rest/clue/batch/recommend/list',
        handler: 'batchExtractRecommendLists',
        passport: {
            'needLogin': true
        }
    }, {//通过关键词获取线索列表
        method: 'post',
        path: '/rest/clue/:type/:page_size/:sort_field/:order',
        handler: 'getClueListByKeyword',
        passport: {
            'needLogin': true
        }
    }, {//释放线索
        method: 'post',
        path: '/rest/clue/release/:type',
        handler: 'releaseClue',
        passport: {
            needLogin: true
        }
    }, {//线索批量操作
        method: 'post',
        path: '/rest/clue/batch/release/:type',
        handler: 'batchReleaseClue',
        passport: {
            needLogin: true
        }
    }, {//线索名称唯一性验证
        method: 'get',
        path: '/rest/crm/clue_only/check',
        handler: 'checkOnlyClueNamePhone',
        passport: {
            needLogin: true
        }
    }, {
        method: 'get',
        path: '/rest/recommend/clue/count',
        handler: 'getRecommendClueCount',
        passport: {
            needLogin: true
        },
    },{
        method: 'get',
        path: '/rest/clue/apply_try',
        handler: 'getApplyTryData',
        passport: {
            needLogin: true
        },
        privileges: [cluePrivilegeConst.BASE_QUERY_PERMISSION_ORGANIZATION]
    }, {
        method: 'get',
        path: '/rest/recommend/clue/company/name',
        handler: 'getCompanyListByName',
        passport: {
            needLogin: true
        },
    }, {
        method: 'get',
        path: '/rest/recommend/clue/picked',
        handler: 'getRecommendCluePicked',
        passport: {
            needLogin: true
        },
    }
    ]
};