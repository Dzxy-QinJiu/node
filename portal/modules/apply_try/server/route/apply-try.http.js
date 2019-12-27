'use strict';
import apply_try_privilege_const from '../../public/privilege-const';
module.exports = {
    module: 'apply_try/server/action/apply-try-controller',
    routes: [{
        'method': 'post',
        'path': '/rest/apply_try',
        'handler': 'postApplyTry',
        'passport': {
            'needLogin': true
        },
        'privileges': [apply_try_privilege_const.VERSION_UPGRADE_APPLY]
    }]
};