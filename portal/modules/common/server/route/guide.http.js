import privilegeConst_common from '../../public/privilege-const';
module.exports = {
    module: 'common/server/action/guide',
    routes: [{
        //获取我的引导
        'method': 'get',
        'path': '/rest/global/guide/config',
        'handler': 'getGuideConfig',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.BASE_QUERY_PERMISSION_MEMBER]
    },{
        //引导步骤标注
        'method': 'post',
        'path': '/rest/global/guide/mark/:step',
        'handler': 'setGuideMark',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.USER_INFO_UPDATE]
    },{
        //关闭引导步骤标注
        'method': 'post',
        'path': '/rest/global/guide/close/:step',
        'handler': 'closeGuideMark',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.USER_INFO_UPDATE]
    },{
        //获取推荐线索
        'method': 'post',
        'path': '/rest/global/guide/recommend/list',
        'handler': 'getRecommendClueLists',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.CURTAO_CRM_COMPANY_STORAGE]
    },{
        //批量提取推荐线索
        'method': 'post',
        'path': '/rest/global/guide/batch/recommend/list',
        'handler': 'batchExtractRecommendLists',
        'passport': {
            'needLogin': true
        },
    },]
};