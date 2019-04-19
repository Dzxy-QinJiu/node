var EventEmitter = require('events');
import {clueNameContactRule} from 'PUB_DIR/sources/utils/validate-util';
//客户联系人的角色
exports.roleArray = [Intl.get('crm.115', '经办人'), Intl.get('crm.184', '决策人'), Intl.get('crm.185', '关键人'), Intl.get('crm.186', '其他')];
exports.sexArray = [Intl.get('crm.contact.sex.male', '男'), Intl.get('crm.contact.sex.female', '女')];
//获取一个空的视图中使用的联系人对象
exports.getEmptyViewContactObject = function() {
    return {
        //是否显示修改的表单
        isShowEditContactForm: false,
        //是否显示确认删除联系人的confirm
        isShowDeleteContactConfirm: false,
        //修改出错提示
        submitEditContactErrorMsg: '',
        //联系人
        contact: {
            id: '',
            name: '',//联系人名称
            position: '',//职位
            role: '',//角色
            phone: '',//电话
            email: '',//邮箱
            qq: '',//qq
            weChat: '',//微信
            isDefault: false //默认联系人
        },
        //联系方式的数组对象
        contactWayAddObj: {
            phone: [''],//添加“电话”联系方式
            email: [''],//添加“邮箱”联系方式
            qq: [''],//添加“qq”联系方式
            weChat: ['']//添加“微信”联系方式
        }
    };
};
//构建一个视图中使用的联系人对象
exports.newViewContactObject = function(contact) {
    contact = contact || {};
    var complexContact = {
        //是否显示修改的表单
        isShowEditContactForm: false,
        //是否显示确认删除联系人的confirm
        isShowDeleteContactConfirm: false,
        //修改出错提示
        submitEditContactErrorMsg: '',
        //服务器返回的联系人对象
        contact: contact,
        //联系方式的数组对象
        contactWayAddObj: {
            phone: contact.phone ? contact.phone : [''],//添加“电话”联系方式
            email: contact.email ? contact.email : [''],//添加“邮箱”联系方式
            qq: contact.qq ? contact.qq : [''],//添加“qq”联系方式
            weChat: contact.weChat ? contact.weChat : ['']//添加“微信”联系方式
        }
    };

    return complexContact;
};

//从界面的联系人列表中获取一个联系人
exports.getContactFromContactListView = function(list, contact) {
    return _.find(list, function(item) {
        if (item.contact.id === contact.id) {
            return true;
        }
    });
};

//从界面的联系人列表中删除一个联系人
exports.deleteContactFromContactListView = function(list, contact) {
    var idx = -1;
    _.find(list, function(item, i) {
        if (item.contact.id === contact.id) {
            idx = i;
            return true;
        }
    });
    if (idx >= 0) {
        list.splice(idx, 1);
    }
};

//将所有的默认联系人设置为非默认联系人
exports.unsetDefaultContacts = function(list) {
    _.each(list, function(item) {
        item.contact.def_contancts = 'false';
    });
};
exports.contactNameRule = function() {
    var contactNameRule = _.cloneDeep(clueNameContactRule);
    contactNameRule.required = false;
    return contactNameRule;
};

//暴露一个emitter，做自定义事件
exports.emitter = new EventEmitter();

