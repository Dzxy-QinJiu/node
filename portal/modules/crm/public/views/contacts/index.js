require("../../scss/contact.scss");
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

//高度常量
var LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    RIGHT_PANEL_PADDING_TOP: 20,//右侧面板顶部padding
    RIGHT_PANEL_PADDING_BOTTOM: 20,//右侧面板底部padding
    CONTACT_LIST_MARGIN_BOTTOM: 20,//联系人列表距离底部margin
    RIGHT_PANEL_TAB_HEIGHT: 36,//右侧面板tab高度
    RIGHT_PANEL_TAB_MARGIN_BOTTOM: 17,//右侧面板tab的margin
    CONTACT_ADD_BUTTON_HEIGHT: 34  //添加联系人按钮高度
};

import Trace from "LIB_DIR/trace";
var Contacts = React.createClass({
    getInitialState: function () {
        return this.getStateFromStore();
    },
    getStateFromStore: function () {
        return {
            contactList: ContactStore.getContactListFromView(),
            windowHeight: $(window).height(),
            isShowAddContactForm: ContactStore.getIsShowAddContactForm()
        };
    },
    onStoreChange: function () {
        this.setState(this.getStateFromStore());
    },
    componentDidMount: function () {
        ContactStore.listen(this.onStoreChange);
        ContactAction.getContactList(this.props.curCustomer);
        $(window).on("resize", this.onStoreChange);
    },
    componentWillReceiveProps: function (nextProps) {
        ContactAction.getContactList(nextProps.curCustomer);
    },
    componentWillUnmount: function () {
        ContactStore.unlisten(this.onStoreChange);
        $(window).off("resize", this.onStoreChange);
    },
    showAddContactForm: function () {
        Trace.traceEvent(this.getDOMNode(),"点击添加一个联系人按钮");
        ContactAction.showAddContactForm();
        GeminiScrollbar.scrollTo(this.refs.scrollList, 0);
    },
    render: function () {
        var divHeight = this.state.windowHeight -
            LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_TOP - //右侧面板顶部padding
            LAYOUT_CONSTANTS.RIGHT_PANEL_PADDING_BOTTOM - //右侧面板底部padding
            LAYOUT_CONSTANTS.CONTACT_LIST_MARGIN_BOTTOM -//联系人列表距离底部margin
            LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_HEIGHT -//右侧面板tab高度
            LAYOUT_CONSTANTS.RIGHT_PANEL_TAB_MARGIN_BOTTOM;//右侧面板tab的margin
        //合并面板，去掉客户选择框的高度,加上添加按钮的高度
        if (this.props.isMerge) {
            divHeight = divHeight - LAYOUT_CONSTANTS.MERGE_SELECT_HEIGHT;
        } else {
            divHeight = divHeight - LAYOUT_CONSTANTS.CONTACT_ADD_BUTTON_HEIGHT;//添加联系人按钮高度
        }
        return (
            <div className="crm-pannel-contacts" data-tracename="联系人页面">
                <div style={{height : divHeight}} ref="scrollList">
                    <GeminiScrollbar>
                        <ul className="crm-contacts-list list-unstyled">
                            {
                                this.state.isShowAddContactForm ? (
                                    <li>
                                        <ContactForm type="add" customer_id={this.props.curCustomer.id}
                                                     refreshCustomerList={this.props.refreshCustomerList}/>
                                    </li>
                                ) : null
                            }
                            {
                                !this.state.contactList ? null : this.state.contactList.map((contact, i) => {
                                    if (contact) {
                                        return (
                                            <li key={i}>
                                                {
                                                    contact.isShowEditContactForm ?
                                                        (<ContactForm contact={contact}
                                                                      isMerge={this.props.isMerge}
                                                                      updateMergeCustomerContact={this.props.updateMergeCustomerContact}
                                                                      refreshCustomerList={this.props.refreshCustomerList}
                                                                      type="edit"/>) :
                                                        (<ContactItem isMerge={this.props.isMerge} contact={contact}
                                                                      setMergeCustomerDefaultContact={this.props.setMergeCustomerDefaultContact}
                                                                      delMergeCustomerContact={this.props.delMergeCustomerContact}
                                                                      updateMergeCustomerContact={this.props.updateMergeCustomerContact}
                                                                      refreshCustomerList={this.props.refreshCustomerList}
                                                                      callNumber={this.props.callNumber}
                                                                      getCallNumberError={this.props.getCallNumberError}
                                                        />)
                                                }
                                            </li>
                                        );
                                    } else {
                                        return "";
                                    }
                                })
                            }
                        </ul>
                    </GeminiScrollbar>
                </div>
                {this.props.isMerge ? null : (
                    <div className="crm-right-panel-addbtn" onClick={this.showAddContactForm}>
                        <Icon type="plus"/><span><ReactIntl.FormattedMessage id="crm.121" defaultMessage="添加一个联系人" /></span>
                    </div>)}
            </div>
        );
    }
});

module.exports = Contacts;
