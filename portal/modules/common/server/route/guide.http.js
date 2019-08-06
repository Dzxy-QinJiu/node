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
        'privileges': ['USER_INFO_USER']
    },{
        //引导步骤标注
        'method': 'post',
        'path': '/rest/global/guide/mark/:step',
        'handler': 'setGuideMark',
        'passport': {
            'needLogin': true
        },
        'privileges': ['USER_INFO_USER']
    },{
        //关闭引导步骤标注
        'method': 'post',
        'path': '/rest/global/guide/close/:step',
        'handler': 'closeGuideMark',
        'passport': {
            'needLogin': true
        },
        'privileges': ['USER_INFO_USER']
    },{
        //获取推荐线索
        'method': 'post',
        'path': '/rest/global/guide/recommend/list',
        'handler': 'getRecommendClueLists',
        'passport': {
            'needLogin': true
        }
    },{
        //批量提取推荐线索
        'method': 'post',
        'path': '/rest/global/guide/batch/recommend/list',
        'handler': 'batchExtractRecommendLists',
        'passport': {
            'needLogin': true
        }
    },]
};