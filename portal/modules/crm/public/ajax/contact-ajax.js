/**
 * 联系人相关的ajax操作
 */
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import crmPrivilegeConst from '../privilege-const';
//获取联系人列表
let contactListAjax;
exports.getContactList = function(customerId, hideContactWay) {
    if (contactListAjax) {
        contactListAjax.abort();
    }
    let type = 'user';//crmPrivilegeConst.CRM_USER_LIST_CONTACTS
    if (hasPrivilege(crmPrivilegeConst.CRM_MANAGER_LIST_CONTACTS)) {
        type = 'manager';
    }
    var Deferred = $.Deferred();
    contactListAjax = $.ajax({
        url: `/rest/crm/contact_list/${type}`,
        dataType: 'json',
        type: 'post',
        data: {query: {id: customerId}, hideContactWay},
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(error, errorText) {
            if (errorText !== 'abort') {
                Deferred.reject(error && error.responseJSON || Intl.get('crm.contact.list.failed', '获取联系人列表失败'));
            }
        }
    });
    return Deferred.promise();

};

//添加一个联系人
var addContactAjax = null;
exports.addContact = function(contact) {
    var Deferred = $.Deferred();
    addContactAjax && addContactAjax.abort();
    addContactAjax = $.ajax({
        url: '/rest/contact',
        dataType: 'json',
        type: 'post',
        data: contact,
        success: function(data) {
            Deferred.resolve(data);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('crm.180', '添加联系人失败'));
        }
    });
    return Deferred.promise();
};

//修改一个联系人
exports.editContact = function(contact) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/contact',
        dataType: 'json',
        type: 'put',
        data: contact,
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get('crm.181', '修改联系人失败'));
        }
    });
    return Deferred.promise();
};

//删除一个联系人
exports.deleteContact = function(contact) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/contact/' + contact.id,
        dataType: 'json',
        type: 'delete',
        success: function() {
            Deferred.resolve(contact);
        },
        error: function() {
            Deferred.reject(Intl.get('crm.182', '删除联系人失败'));
        }
    });
    return Deferred.promise();
};

//设置默认联系人
exports.toggleDefaultContact = function(contact) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/contact/setdefault/' + contact.id,
        dataType: 'json',
        type: 'post',
        success: function(result) {
            Deferred.resolve(result);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
