
module.exports = {
    module: 'domain_application/server/action/domain-application-controller',
    routes: [
        {
            method: 'get',
            path: '/rest/check/domain/name',
            handler: 'checkDomainExist',
            passport: {
                needLogin: true
            }
        }
    ]
};