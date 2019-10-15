/**
 * Created by hzl on 2019/10/14.
 */

module.exports = {
    module: 'clue_integration/server/action/clue-integration-controller',
    routes: [
        {
            'method': 'get',
            'path': '/rest/get/clue/integration',
            'handler': 'getIntegrationList',
            'passport': {
                'needLogin': true
            }
        }, {
            'method': 'post',
            'path': '/rest/create/clue/integration',
            'handler': 'createClueIntegration',
            'passport': {
                'needLogin': true
            }
        }, {
            'method': 'delete',
            'path': '/rest/delete/clue/integration',
            'handler': 'deleteClueIntegration',
            'passport': {
                'needLogin': true
            }
        }, {
            'method': 'put',
            'path': '/rest/change/clue/integration',
            'handler': 'changeClueIntegration',
            'passport': {
                'needLogin': true
            }
        }
    ]
};