require("../../css/contact.less");
var Icon = require("antd").Icon;
//一个用于显示的联系人
var ContactItem = require("./contact-item");
//联系人表单
var ContactForm = require("./contact-form");
//联系人store
var ContactStore = require("../../store/contact-store");
//联系人action
var ContactAction = require("../../action/contact-action");
//滚动条
var GeminiScrollbar = require("../../../../../components/react-gemini-scrollbar");
import Spinner from "CMP_DIR/spinner";
import crmAjax from '../../ajax/index';
import userData from 'PUB_DIR/sources/user-data';

//高度常量
var LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8, //跟进记录页的下边距
    ADD_CONTACT_HEIGHHT: 324,//添加联系人面板的高度
    TOP_TOTAL_HEIGHT: 30//共xxx条的高度
};

import Trace from "LIB_DIR/trace";
var Contacts = React.createClass({
    getInitialState: function () {
        return {
            callNumber: '', // 座机号
            getCallNumberError: '', // 获取座机号失败的信息
            curCustomer: this.props.curCustomer,//当前查看详情的客户
            windowHeight: $(window).height(),
            ...ContactStore.getState()
        };
    },
    onStoreChange: function () {
        this.setState(ContactStore.getState());
    },
    componentDidMount: function () {
        ContactStore.listen(this.onStoreChange);
        if (this.props.curCustomer) {
            ContactAction.getContactList(this.props.curCustomer, this.props.isMerge);
        }
        //获取该用户的座席号
        this.getUserPhoneNumber();
        $(window).on("resize", this.onStoreChange);
    },
    componentWillReceiveProps: function (nextProps) {
        if (nextProps.isMerge || nextProps.curCustomer && nextProps.curCustomer.id !== this.props.curCustomer.id) {
            this.setState({
                curCustomer: nextProps.curCustomer
            });
            setTimeout(() => {
                ContactAction.setInitData();
                ContactAction.getContactList(nextProps.curCustomer, nextProps.isMerge);
            });
        }
    },
    componentWillUnmount: function () {
        ContactStore.unlisten(this.onStoreChange);
        setTimeout(() => {
            ContactAction.setInitData();
        });
        $(window).off("resize", this.onStoreChange);
    },
    showAddContactForm: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".crm-right-panel-addbtn .anticon-plus"), "添加联系人");
        ContactAction.showAddContactForm();
        GeminiScrollbar.scrollTo(this.refs.scrollList, 0);
    },
    // 获取拨打电话的座席号
    getUserPhoneNumber: function () {
        let member_id = userData.getUserData().user_id;
        crmAjax.getUserPhoneNumber(member_id).then((result) => {
            if (result.phone_order) {
                this.setState({
                    callNumber: result.phone_order
                });
            }
        }, (errMsg) => {
            this.setState({
                getCallNumberError: errMsg || Intl.get("crm.get.phone.failed", " 获取座机号失败!")
            });
        });
    },
    render: function () {
        var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
        let basicInfoHeight = parseInt($(".basic-info-contianer").outerHeight(true));
        //减头部的客户基本信息高度
        divHeight -= basicInfoHeight;
        if ($(".phone-alert-modal-title").size()) {
            divHeight -= $(".phone-alert-modal-title").outerHeight(true);
        }
        //减添加联系人面版的高度
        if (this.state.isShowAddContactForm) {
            divHeight -= LAYOUT_CONSTANTS.ADD_CONTACT_HEIGHHT;
        } else {//减共xxx条的高度
            divHeight -= LAYOUT_CONSTANTS.TOP_TOTAL_HEIGHT;
        }
        //合并面板，去掉客户选择框的高度,添加按钮的高度
        if (this.props.isMerge) {
            divHeight = divHeight - LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        }
        let contactListLength = _.isArray(this.state.contactList) ? this.state.contactList.length : 0;
        return (
            <div className="crm-pannel-contacts" data-tracename="联系人页面">
                {this.state.isShowAddContactForm ? (
                    <ContactForm type="add" customer_id={this.state.curCustomer.id}
                                 customer_name={this.state.curCustomer ? this.state.curCustomer.name : ""}
                                 contactListLength={contactListLength}
                                 refreshCustomerList={this.props.refreshCustomerList}/>) : (
                    <div className="contact-top-block">
                        <span className="total-tip">
                        <ReactIntl.FormattedMessage id="sales.frontpage.total.list" defaultMessage={`共{n}条`}
                                                    values={{"n": contactListLength + ""}}/>
                        </span>
                        {this.props.isMerge ? null : (
                            <span className="iconfont icon-add" title={Intl.get("crm.detail.contact.add", "添加联系人")}
                                  onClick={this.showAddContactForm.bind(this)}/>
                        )}
                    </div>
                )}
                <div className="contact-list-container" style={{height: divHeight}} ref="scrollList">
                    <GeminiScrollbar>
                        {this.state.contactListLoading ? (<Spinner/>) : this.state.contactList.map((contact, i) => {
                            if (contact) {
                                return contact.isShowEditContactForm ?
                                    (<ContactForm contact={contact}
                                                  key={i}
                                                  isMerge={this.props.isMerge}
                                                  updateMergeCustomerContact={this.props.updateMergeCustomerContact}
                                                  refreshCustomerList={this.props.refreshCustomerList}
                                                  updateCustomerDefContact={this.props.updateCustomerDefContact}
                                                  type="edit"/>) :
                                    (<ContactItem isMerge={this.props.isMerge} contact={contact}
                                                  key={i}
                                                  setMergeCustomerDefaultContact={this.props.setMergeCustomerDefaultContact}
                                                  delMergeCustomerContact={this.props.delMergeCustomerContact}
                                                  updateMergeCustomerContact={this.props.updateMergeCustomerContact}
                                                  updateCustomerDefContact={this.props.updateCustomerDefContact}
                                                  refreshCustomerList={this.props.refreshCustomerList}
                                                  callNumber={this.state.callNumber}
                                                  getCallNumberError={this.state.getCallNumberError}
                                                  curCustomer={this.state.curCustomer}
                                    />);
                            } else {
                                return "";
                            }
                        })}
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
});

module.exports = Contacts;
