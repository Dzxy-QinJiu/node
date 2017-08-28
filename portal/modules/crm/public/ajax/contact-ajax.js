/**
 * 联系人相关的ajax操作
 */

//添加一个联系人
exports.addContact = function(contact) {
    var Deferred = $.Deferred();
    $.ajax({
        url : '/rest/contact',
        dataType : 'json',
        type : 'post',
        data : contact,
        success : function(contact) {
            Deferred.resolve(contact);
        },
        error : function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get("crm.180", "添加联系人失败"));
        }
    });
    return Deferred.promise();
};

//修改一个联系人
exports.editContact = function(contact) {
    var Deferred = $.Deferred();
    $.ajax({
        url : '/rest/contact',
        dataType : 'json',
        type : 'put',
        data : contact,
        success : function(contact) {
            Deferred.resolve(contact);
        },
        error : function(xhr) {
            Deferred.reject(xhr.responseJSON || Intl.get("crm.181", "修改联系人失败"));
        }
    });
    return Deferred.promise();
};

//删除一个联系人
exports.deleteContact = function(contact) {
    var Deferred = $.Deferred();
    $.ajax({
        url : '/rest/contact/' + contact.id,
        dataType : 'json',
        type : 'delete',
        success : function() {
            Deferred.resolve(contact);
        },
        error : function() {
            Deferred.reject( Intl.get("crm.182", "删除联系人失败"));
        }
    });
    return Deferred.promise();
};

//设置默认联系人
exports.toggleDefaultContact = function(contact) {
    var Deferred = $.Deferred();
    $.ajax({
        url : '/rest/contact/setdefault/' + contact.id,
        dataType : 'json',
        type : 'post',
        success : function(result) {
            Deferred.resolve(result);
        },
        error: function (errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
