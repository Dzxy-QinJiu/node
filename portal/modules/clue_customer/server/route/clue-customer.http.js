/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/10/16.
 */
require('../action/clue-customer-controller');
module.exports = {
    module: 'clue_customer/server/action/clue-customer-controller',
    routes: [
        {//获取线索客户
            method: 'post',
            path: '/rest/customer/v2/customer/range/clue/:pageSize/:sortField/:sortOrder',
            handler: 'getClueCustomerList',
            passport: {
                needLogin: true
            }
        },
        {
            method: 'get',
            path: '/rest/sales_clue/source',
            handler: 'getClueSource',
            passport: {
                needLogin: true
            },
            privileges: [
                'CUSTOMER_CLUE_SOURCE_GET'
            ]
        },
        {
            method: 'get',
            path: '/rest/sales_clue/channel',
            handler: 'getClueChannel',
            passport: {
                needLogin: true
            },
            privileges: [
                'CUSTOMER_ACCESS_CHANNEL_GET'
            ]
        },
        {
            method: 'get',
            path: '/rest/sales_clue/classify',
            handler: 'getClueClassify',
            passport: {
                needLogin: true
            },
            privileges: [
                'CLUECUSTOMER_CLUE_CLASSIFY_GET'
            ]
        }
        ,{
            method: 'post',
            path: '/rest/cluecustomer/v2/add/trace',
            handler: 'addCluecustomerTrace',
            passport: {
                needLogin: true
            },
        },{
            method: 'post',
            path: '/rest/cluecustomer/v2/distribute/sales',
            handler: 'distributeCluecustomerToSale',
            passport: {
                needLogin: true
            },
        },{
            method: 'put',
            path: '/rest/cluecustomer/v2/update/detailitem',
            handler: 'updateCluecustomerDetail',
            passport: {
                needLogin: true
            },
        },{
            method: 'get',
            path: '/rest/sales_clue/only/check',
            handler: 'checkOnlySalesClue',
            passport: {
                needLogin: true
            },
        },{
            method: 'put',
            path: '/rest/relate_clue_and_customer/:type',
            handler: 'relateClueAndCustomer',
            passport: {
                needLogin: true
            },
        },{
            method: 'get',
            path: '/rest/clue/download_template',
            handler: 'getClueTemplate',
            passport: {
                'needLogin': true
            }
        },
        {
            method: 'post',
            path: '/rest/clue/upload',
            handler: 'uploadClues',
            passport: {
                'needLogin': true
            }
        },
        {
            method: 'get',
            path: '/rest/clue/confirm/upload/:flag',
            handler: 'confirmUploadClues',
            passport: {
                'needLogin': true
            }
        },{
            method: 'delete',
            path: '/rest/clue/repeat/delete/:index',
            handler: 'deleteRepeatClue',
            passport: {
                'needLogin': true
            }
        },
        {
            method: 'post',
            path: '/rest/clue/analysis',
            handler: 'getClueAnalysis',
            passport: {
                'needLogin': true
            }
        },{
            method: 'post',
            path: '/rest/clue/statics/:type/:field/:page_size/:num',
            handler: 'getClueStatics',
            passport: {
                'needLogin': true
            }
        },{
            method: 'post',
            path: '/rest/clue/trend/statics/:type',
            handler: 'getClueTrendStatics',
            passport: {
                'needLogin': true
            }
        },{
            method: 'post',
            path: '/rest/get/clue/fulltext/:page_size/:sort_field/:order',
            handler: 'getClueFulltext',
            passport: {
                'needLogin': true
            }
        }
    ]
};