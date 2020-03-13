var ContactActions = require('../action/contact-action');
var ContactUtils = require('../utils/contact-util');

function ContactStore() {
    //联系人列表
    /**
     * [
     {
         isShowEditContactForm : false,//是否显示修改的表单
        //是否显示确认删除联系人的confirm
        isShowDeleteContactConfirm : false,
         contact : {//联系人
             id : '',
             name : '',//联系人名称
             position : '',//职位
             role : '',//角色
             phone : '',//电话
             email : '',//邮箱
             qq : '',//qq
             weChat : '',//微信
             isDefault : false //默认联系人
         },
         contactWayAddState : {
             phone : false,//添加“电话”联系方式
             email : false,//添加“邮箱”联系方式
             qq : false,//添加“qq”联系方式
             weChat : false,//添加“微信”联系方式
         }
     }
     ]
     */
    //设置初始值
    this.setInitData();
    //绑定action方法
    this.bindActions(ContactActions);
}
//设置初始化数据
ContactStore.prototype.setInitData = function() {
    //是否显示添加联系人表单
    this.isShowAddContactForm = false;
    this.contactListLoading = false;
    this.contactList = [];
    //获取联系人列表出错的提示，默认不出错
    this.getContactListErrorMsg = '';
    //添加联系人出错的提示，默认不出错
    this.submitAddContactErrorMsg = '';
};

//FromAction-通过ajax获取联系人列表
ContactStore.prototype.getContactList = function(data) {
    if (data.isLoading) {
        this.contactListLoading = data.isLoading;
    } else if (data.errorMsg) {
        this.getContactListErrorMsg = data.errorMsg;
        this.contactListLoading = false;
        this.contactList = [];
    } else {
        this.getContactListErrorMsg = '';
        this.contactListLoading = false;
        let viewList = [];
        if (_.isArray(data.list) && data.list.length) {
            viewList = data.list.map((contact) => {
                return ContactUtils.newViewContactObject(contact);
            });
        }
        this.contactList = viewList;
    }
};

//FromAction-展示添加联系人表单
ContactStore.prototype.showAddContactForm = function() {
    this.isShowAddContactForm = true;
};

//FromAction-隐藏添加联系人表单
ContactStore.prototype.hideAddContactForm = function() {
    this.isShowAddContactForm = false;
};

//FromAction-提交添加联系人表单
ContactStore.prototype.submitAddContact = function(result) {
    if (result.errorMsg) {
        this.submitAddContactErrorMsg = result.errorMsg;
    } else if (result.contact) {
        this.hideAddContactForm();
        this.submitAddContactErrorMsg = '';
        var newContact = ContactUtils.newViewContactObject(result.contact);
        this.contactList.unshift(newContact);
    }
};

//FromAction-展示修改联系人表单
ContactStore.prototype.showEditContactForm = function(contact) {
    contact.isShowEditContactForm = true;
    //["phone", "qq", "weChat", "email"].forEach(function (type) {
    //    contact.contactWayAddObj[type] = contact.contact[type];
    //});
};

//FromAction-隐藏修改联系人表单
ContactStore.prototype.hideEditContactForm = function(contact) {
    contact.isShowEditContactForm = false;
};

//FromAction-提交修改联系人表单
ContactStore.prototype.submitEditContact = function(result) {
    let contact = result.contact || {};
    var targetContact = ContactUtils.getContactFromContactListView(this.contactList, contact);
    if(!targetContact) return;
    if (result.errorMsg) {
        targetContact.submitEditContactErrorMsg = result.errorMsg;
    } else {
        this.hideEditContactForm(targetContact);
        targetContact.submitEditContactErrorMsg = '';
        //将修改后返回的联系人对象转换为界面上所需的数据格式
        let afterEditContact = ContactUtils.newViewContactObject(contact);
        targetContact.contact = afterEditContact.contact;//联系人对象
        //该联系人对应的联系方式数组对象
        // contactWayAddObj: {phone: [], email: [],qq: [],weChat: []}
        targetContact.contactWayAddObj = afterEditContact.contactWayAddObj;
    }
};
ContactStore.prototype.afterEditContact = function(editContact) {
    let targetContact = ContactUtils.getContactFromContactListView(this.contactList, editContact);
    let editProperty = editContact.property;//修改的属性
    if(!targetContact) return;
    //更新对应的属性值
    if(_.get(targetContact,'contact')){
        targetContact.contact[editProperty] = editContact[editProperty];
        const contactWays = ['phone','qq','weChat','email'];
        if (_.indexOf(contactWays, editProperty) !== -1) {
            //该联系人对应的联系方式数组对象的修改
            // contactWayAddObj: {phone: [], email: [],qq: [],weChat: []}
            targetContact.contactWayAddObj[editProperty] = editContact[editProperty];
        }
    }
};

//FromAction-添加一个联系方式
ContactStore.prototype.addContactWay = function(array) {
    var obj = array[0], type = array[1];
    obj.contactWayAddObj[type].push('');
};

//FromAction-显示删除一个联系人的对话框
ContactStore.prototype.showDeleteContactConfirm = function(contact) {
    contact.isShowDeleteContactConfirm = true;
};

//FromAction-隐藏删除一个联系人的对话框
ContactStore.prototype.hideDeleteContactConfirm = function(contact) {
    contact.isShowDeleteContactConfirm = false;
};

//FromAction-删除一个联系人
ContactStore.prototype.deleteContact = function(contactData) {
    ContactUtils.deleteContactFromContactListView(this.contactList, contactData.contact);
    contactData.isShowDeleteContactConfirm = false;
};

//FromAction-设置为默认联系人
ContactStore.prototype.toggleDefaultContact = function(contact) {
    ContactUtils.unsetDefaultContacts(this.contactList);
    let curContact = _.find(this.contactList, item => item.contact.id === contact.id);
    curContact.contact.def_contancts = 'true';
};
//展开、收起联系方式
ContactStore.prototype.toggleContactWay = function(contactData) {
    contactData.contact.isExpanded = contactData.isExpanded;
};
module.exports = alt.createStore(ContactStore, 'ContactStore');