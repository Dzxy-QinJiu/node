/**
 * 请求路径 - contact
 */

module.exports = {
    module: 'crm/server/action/contact-controller',
    routes: [{
        'method': 'post',
        'path': '/rest/crm/contact_list/:type',
        'handler': 'getContactList',
        'passport': {
            'needLogin': true
        },
        'privileges': []
    },{
        'method': 'delete',
        'path': '/rest/contact/:contactId',
        'handler': 'deleteContact',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_DELETE_CONTACT'
        ]
    },{
        'method': 'post',
        'path': '/rest/contact',
        'handler': 'addContact',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_ADD_CONTACT'
        ]
    },{
        'method': 'put',
        'path': '/rest/contact',
        'handler': 'editContact',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_EDIT_CONTACT'
        ]
    },{
        //小程序中使用
        'method': 'put',
        'path': '/rest/edit/contact/entirety',
        'handler': 'editContactEntirety',
        'passport': {
            'needLogin': true
        },
    },
    {
        'method': 'post',
        'path': '/rest/contact/setdefault/:contactId',
        'handler': 'setDefault',
        'passport': {
            'needLogin': true
        },
        'privileges': [
            'CRM_EDIT_CONTACT'
        ]
    }]
};
