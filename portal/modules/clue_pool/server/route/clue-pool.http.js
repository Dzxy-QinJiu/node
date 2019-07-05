/**
 * Created by hzl on 2019/7/2.
 */

module.exports = {
    module: 'clue_pool/server/action/clue-pool-controller',
    routes: [
        { // 获取线索池列表
            method: 'post',
            path: '/rest/clue_pool/fulltext/:page_size/:sort_field/:order/:type',
            handler: 'getCluePoolList',
            passport: {
                needLogin: true
            }
        },
        { // 获取线索池负责人
            method: 'post',
            path: '/rest/clue_pool/leading',
            handler: 'getCluePoolLeading',
            passport: {
                needLogin: true
            }
        },
        { // 获取线索池来源
            method: 'post',
            path: '/rest/clue_pool/source',
            handler: 'getCluePoolSource',
            passport: {
                needLogin: true
            }
        },
        { // 获取线索池接入渠道
            method: 'post',
            path: '/rest/clue_pool/channel',
            handler: 'getCluePoolChannel',
            passport: {
                needLogin: true
            }
        },
        { // 获取线索池分类
            method: 'post',
            path: '/rest/clue_pool/classify',
            handler: 'getCluePoolClassify',
            passport: {
                needLogin: true
            }
        },
        { // 获取线索池地域
            method: 'post',
            path: '/rest/clue_pool/province',
            handler: 'getCluePoolProvince',
            passport: {
                needLogin: true
            }
        },
        { // 单个提取线索
            method: 'post',
            path: '/rest/clue_pool/single/assign/sales/:id/:sale_id',
            handler: 'extractClueAssignToSale',
            passport: {
                needLogin: true
            },
        },
        { // 批量提取线索
            method: 'post',
            path: '/rest/clue_pool/batch/assign/sales/:type',
            handler: 'batchExtractClueAssignToSale',
            passport: {
                needLogin: true
            },
        }
    ]
};