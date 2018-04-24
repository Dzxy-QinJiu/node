/**
 * 联系人的action
 */
//联系人的ajax
var contactAjax = require("../ajax/contact-ajax");
var crmStore = require('../store/crm-store');
var CrmAction = require('./crm-actions');
var util = require("../utils/contact-util");

function ContactAction() {

    this.generateActions(
        //通过ajax获取联系人列表
        'getContactList'
        //展示添加联系人表单
        , 'showAddContactForm'
        //隐藏添加联系人表单
        , 'hideAddContactForm'
        //提交添加联系人表单
        , 'submitAddContact'
        //展示修改联系人表单
        , 'showEditContactForm'
        //隐藏修改联系人表单
        , 'hideEditContactForm'
        //提交修改联系人表单
        , 'submitEditContact'
        //添加一个联系方式
        , 'addContactWay'
        //显示删除一个联系人的对话框
        , 'showDeleteContactConfirm'
        //隐藏删除一个联系人的对话框
        , 'hideDeleteContactConfirm'
        //删除一个联系人
        , 'deleteContact'
        //设置为默认联系人
        , 'toggleDefaultContact',
        //设置初始化数据
        'setInitData'
    );
    //获取联系人列表
    this.getContactList = function (curCustomer, isMerge) {
        if (isMerge) {
            let contactList = curCustomer && curCustomer.contacts || [];
            setTimeout(() => {
                this.dispatch({list: contactList});
            });
        } else {
            this.dispatch({isLoading: true});
            contactAjax.getContactList(curCustomer.id).then((data) => {
                if (data && data.result) {
                    this.dispatch({list: data.result});
                } else {
                    this.dispatch({errorMsg: Intl.get("crm.contact.list.failed", "获取联系人列表失败")});
                }
            }, (errorMsg) => {
                this.dispatch({
                    isLoading: false,
                    errorMsg: errorMsg || Intl.get("crm.contact.list.failed", "获取联系人列表失败")
                });
            });
        }
    };

    //展示添加联系人表单
    this.showAddContactForm = function () {
        this.dispatch();
    };
    //隐藏添加联系人表单
    this.hideAddContactForm = function () {
        this.dispatch();
    };
    //添加联系人提交
    this.submitAddContact = function (contact, cb) {
        var _this = this;
        contactAjax.addContact(contact).then(function (data) {
            _this.dispatch(data && data.result[0]);
            if (_.isFunction(cb)) cb({contact: data && data.result[0]});
        }, function (errorMsg) {
            _this.dispatch(errorMsg);
            if (_.isFunction(cb)) cb({errorMsg: errorMsg});
        });
    };
    //展示修改联系人表单
    this.showEditContactForm = function (contact) {
        this.dispatch(contact);
    };
    //隐藏修改联系人表单
    this.hideEditContactForm = function (contact) {
        this.dispatch(contact);
    };
    //提交修改联系人
    this.submitEditContact = function (contact, editType, cb) {
        var _this = this;
        contactAjax.editContact(contact, editType).then(function (contact) {
            _this.dispatch(contact);
            if (_.isFunction(cb)) cb({contact: contact});
        }, function (errorMsg) {
            _this.dispatch(errorMsg);
            if (_.isFunction(cb)) cb({errorMsg: errorMsg});
        });
    };
    //添加一个联系方式
    this.addContactWay = function (contact, contactWayType) {
        this.dispatch([contact, contactWayType]);
    };
    //显示删除一个联系人的对话框
    this.showDeleteContactConfirm = function (contact) {
        this.dispatch(contact);
    };
    //隐藏删除一个联系人的对话框
    this.hideDeleteContactConfirm = function (contact) {
        this.dispatch(contact);
    };
    //删除一个联系人
    this.deleteContact = function (contactData, cb) {
        var _this = this;
        contactAjax.deleteContact(contactData.contact).then(function (contact) {
            _this.dispatch(contactData);
            if (_.isFunction(cb)) cb();
        }, function (errorMsg) {
            _this.dispatch("");
        });
    };
    //设置一个默认联系人
    this.toggleDefaultContact = function (contact, cb) {
        var _this = this;
        contactAjax.toggleDefaultContact(contact).then(function (result) {
            _this.dispatch(contact);
            if (_.isFunction(cb)) cb(result);
        }, function (errorMsg) {
            if (_.isFunction(cb)) cb(errorMsg);
        });
    };
}

module.exports = alt.createActions(ContactAction);
