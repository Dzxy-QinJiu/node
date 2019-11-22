var React = require('react');
require('../../css/contact.less');
//一个用于显示的联系人
import ContactItem from './contact-item';
//联系人表单
var ContactForm = require('./contact-form');
//联系人store
var ContactStore = require('../../store/contact-store');
//联系人action
var ContactAction = require('../../action/contact-action');
//滚动条
var GeminiScrollbar = require('../../../../../components/react-gemini-scrollbar');
import Spinner from 'CMP_DIR/spinner';
import CallNumberUtil from 'PUB_DIR/sources/utils/common-data-util';
import NoDataIconTip from 'CMP_DIR/no-data-icon-tip';
import {Button} from 'antd';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';

//高度常量
var LAYOUT_CONSTANTS = {
    MERGE_SELECT_HEIGHT: 30,//合并面板下拉框的高度
    TOP_NAV_HEIGHT: 36 + 8,//36：头部导航的高度，8：导航的下边距
    MARGIN_BOTTOM: 8, //跟进记录页的下边距
    ADD_CONTACT_HEIGHHT: 324,//添加联系人面板的高度
    TOP_TOTAL_HEIGHT: 30//共xxx条的高度
};

import Trace from 'LIB_DIR/trace';

class Contacts extends React.Component {
    state = {
        getCallNumberError: '', // 获取座机号失败的信息
        curCustomer: this.props.curCustomer,//当前查看详情的客户
        windowHeight: $(window).height(),
        ...ContactStore.getState()
    };

    onStoreChange = () => {
        this.setState(ContactStore.getState());
    };

    componentDidMount() {
        ContactStore.listen(this.onStoreChange);
        if (this.props.curCustomer) {
            //isUseCustomerContacts是否要用客户里的联系人列表
            ContactAction.getContactList(this.props.curCustomer, this.props.isUseCustomerContacts, this.props.hideContactWay);
        }
        $(window).on('resize', this.onStoreChange);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isMerge || nextProps.curCustomer && nextProps.curCustomer.id !== this.props.curCustomer.id) {
            this.setState({
                curCustomer: nextProps.curCustomer
            });
            setTimeout(() => {
                ContactAction.setInitData();
                //isUseCustomerContacts是否要用客户里的联系人列表
                ContactAction.getContactList(nextProps.curCustomer, this.props.isUseCustomerContacts, this.props.hideContactWay);
            });
        }
    }

    componentWillUnmount() {
        ContactStore.unlisten(this.onStoreChange);
        setTimeout(() => {
            ContactAction.setInitData();
        });
        $(window).off('resize', this.onStoreChange);
    }

    showAddContactForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.crm-right-panel-addbtn .anticon-plus'), '添加联系人');
        ContactAction.showAddContactForm();
        GeminiScrollbar.scrollTo(this.refs.scrollList, 0);
    };

    render() {
        var divHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.MARGIN_BOTTOM;
        let basicInfoHeight = parseInt($('.basic-info-contianer').outerHeight(true));
        //减头部的客户基本信息高度
        divHeight -= basicInfoHeight;
        if ($('.phone-alert-modal-title').size()) {
            divHeight -= $('.phone-alert-modal-title').outerHeight(true);
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
                        customer_name={this.state.curCustomer ? this.state.curCustomer.name : ''}
                        contactListLength={contactListLength}
                        updateCustomerDefContact={this.props.updateCustomerDefContact}
                        refreshCustomerList={this.props.refreshCustomerList}/>) : (
                    <div className="contact-top-block crm-detail-top-total-block">
                        {this.state.contactListLoading ? null : (
                            <span className="total-tip crm-detail-total-tip">
                                {contactListLength ? (
                                    <ReactIntl.FormattedMessage
                                        id="sales.frontpage.total.list"
                                        defaultMessage={'共{n}条'}
                                        values={{'n': contactListLength + ''}}/>) :
                                    Intl.get('crm.no.contact.tip', '该客户还没有联系人')}
                            </span>
                        )}
                        {this.props.isMerge || this.props.disableEdit || !hasPrivilege(crmPrivilegeConst.CRM_ADD_CONTACT) ? null : (
                            <Button className='crm-detail-add-btn' onClick={this.showAddContactForm.bind(this)}>
                                {Intl.get('crm.detail.contact.add', '添加联系人')}
                            </Button>
                        )}
                    </div>
                )}
                <div className="contact-list-container" style={{height: divHeight}} ref="scrollList">
                    <GeminiScrollbar className="srollbar-out-card-style">
                        {this.state.contactListLoading ? (
                            <Spinner/>) : contactListLength ? this.state.contactList.map((contact, i) => {
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
                                        curCustomer={this.state.curCustomer}
                                        disableEdit={this.props.disableEdit}
                                        hideContactWay={this.props.hideContactWay}
                                    />);
                            } else {
                                return '';
                            }
                        }) : <NoDataIconTip tipContent={Intl.get('crm.no.contact', '暂无联系人')}/>}
                    </GeminiScrollbar>
                </div>
            </div>
        );
    }
}
Contacts.propTypes = {
    curCustomer: PropTypes.object,
    isMerge: PropTypes.bool,
    refreshCustomerList: PropTypes.array,
    updateMergeCustomerContact: PropTypes.func,
    updateCustomerDefContact: PropTypes.func,
    setMergeCustomerDefaultContact: PropTypes.func,
    delMergeCustomerContact: PropTypes.func,
    disableEdit: PropTypes.bool,
    hideContactWay: PropTypes.bool,
    isUseCustomerContacts: PropTypes.bool,
};
module.exports = Contacts;

