import privilegeConst_common from '../../public/privilege-const';
var crmPrivilegeConst = require('../../../crm/public/privilege-const').default;
module.exports = {
    module: 'common/server/action/customer',
    routes: [{
        //获取客户联想列表
        'method': 'get',
        'path': '/rest/global/customer_suggest',
        'handler': 'getCustomerSuggest',
        'passport': {
            'needLogin': true
        },
        'privileges': [privilegeConst_common.CUSTOMER_ALL]
    }, {
        'method': 'get',
        'path': '/rest/crm/user_list',
        'handler': 'getCrmUserList',
        'passport': {
            'needLogin': true
        },
        'privileges': [crmPrivilegeConst.APP_USER_QUERY]
    }]
};