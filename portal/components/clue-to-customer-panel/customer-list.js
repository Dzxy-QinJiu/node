/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by yubin on 2019/11/11.
 *
 * 相似客户列表面板
 */

import { Icon, Button } from 'antd';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { VIEW_TYPE, NOOP } from './consts';

//客户列表标题区域高度
const TITLE_BLOCK_HEIGHT = 135;
//转为新客户按钮区域高度
const CONVERT_TO_NEW_CUSTOMER_BTN_BLOCK_HEIGHT = 60;

class CustomerList extends React.Component {
    static defaultProps = {
        //改变视图类型
        changeViewType: NOOP,
        //关闭面板
        onClose: NOOP,
        //父组件
        parent: null,
        //相似客户
        customers: [],
        //当前线索
        clue: {},
    }

    static propTypes = {
        changeViewType: PropTypes.func,
        onClose: PropTypes.func,
        parent: PropTypes.object,
        customers: PropTypes.array,
        clue: PropTypes.object,
    }

    render() {
        return (
            <RightPanelModal
                isShowCloseBtn={true}
                onClosePanel={this.props.onClose}
                title={this.renderPanelTitle()}
                content={this.renderPanelContent()}
            />
        );
    }

    renderPanelTitle() {
        const title = Intl.get('common.convert.to.customer', '转为客户');
        const opBtnText = Intl.get('common.merge.to.other.customer', '合并到其他客户');

        return (
            <div>
                <span className="panel-title">{title}</span>
                <span className="op-btn" onClick={this.props.changeViewType.bind(this.props.parent, VIEW_TYPE.CUSTOMER_SEARCH)}>{opBtnText}</span>
            </div>
        );
    }

    renderPanelContent() {
        //相似客户列表
        const existingCustomers = this.props.customers;
        //列表容器最大高度
        const listWrapMaxHeight = $(window).height() - TITLE_BLOCK_HEIGHT - CONVERT_TO_NEW_CUSTOMER_BTN_BLOCK_HEIGHT;

        return (
            <div className="right-panel-content">
                <div className="customer-list">
                    <div className="title">
                        <Icon type="exclamation-circle" />
                        {Intl.get('common.has.similar.customers', '有{count}个信息相似的客户', {count: existingCustomers.length})}
                    </div>
    
                    <div className="list-wrap" style={{height: listWrapMaxHeight}}>
                        <GeminiScrollbar>
                            {_.map(existingCustomers, customer => {
                                return this.renderCustomerItem(customer);
                            })}
                        </GeminiScrollbar>
                    </div>
    
                    <div className="btn-block">
                        <Button onClick={this.props.onClose}>{Intl.get('common.cancel', '取消')}</Button>
    
                        {hasPrivilege('LEAD_TRANSFER_MERGE_CUSTOMER') ? null : (
                            <Button type="primary" onClick={this.props.changeViewType.bind(this.props.parent, VIEW_TYPE.ADD_CUSTOMER)}>{Intl.get('common.convert.to.new.customer', '转为新客户')}</Button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    //渲染客户列表项
    renderCustomerItem(customer) {
        const clue = this.props.clue;
        const clueName = clue.name;
        let customerName = customer.name;

        if (customerName === clueName) {
            customerName = <span className="high-light">{customerName}</span>;
        } else {
            const startIndex = customerName.indexOf(clueName);

            if (startIndex > -1) {
                const endIndex = startIndex + clueName.length;
                const beginPart = customerName.substr(0, startIndex);
                const endPart = customerName.substr(endIndex);

                customerName = <span>{beginPart}<span className="high-light">{clueName}</span>{endPart}</span>;
            }
        }

        const contacts = this.getDupCustomerContacts(customer, clue);

        return (
            <div className="customer-item">
                <div className="customer-info">
                    <div className="customer-name">
                        {customerName}
                    </div>
                    {contacts.length ? (
                        <div className="customer-contacts">
                            {_.map(contacts, contact => {
                                return (
                                    <div className="contact-item">
                                        <div className="contact-name">
                                            {contact.name}
                                        </div>
                                        <div className="contact-phone">
                                            {_.map(contact.phone, (phone, phoneIndex) => {
                                                return (
                                                    <div>
                                                        {phone}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                <Button
                    onClick={this.props.changeViewType.bind(this.props.parent, VIEW_TYPE.CUSTOMER_MERGE, customer)}
                >
                    {Intl.get('common.merge.to.customer', '合并到此客户')}
                </Button>
            </div>
        );
    }

    //获取重复的客户联系人
    getDupCustomerContacts(customer, clue) {
        let dupContacts = [];

        //客户联系人列表
        const customerContacts = customer.contacts;
        //线索联系人列表
        const clueContacts = clue.contacts;

        //遍历客户联系人列表
        _.each(customerContacts, customerContact => {
            //遍历线索联系人列表
            _.some(clueContacts, clueContact => {
                //将电话中的横线去掉，以免将数字相同只是有的带横线有的不带横线的电话识别为不同的电话
                customerContact.phone = _.map(customerContact.phone, item => item.replace(/-/g, ''));
                clueContact.phone = _.map(clueContact.phone, item => item.replace(/-/g, ''));

                //客户联系人电话和线索联系人电话的合集
                let allPhone = _.concat(customerContact.phone, clueContact.phone);

                //去重后的电话合集
                const uniqPhone = _.uniq(allPhone);
                //电话是否重复
                //如果去重后电话总数少了，说明有重复的电话
                const isPhoneDup = allPhone.length > uniqPhone.length;

                //联系人名是否重复
                //如果线索和客户存在同名联系人，说明联系人重复
                const isContactNameDup = clueContact.name === customerContact.name;

                //联系人名重复或电话重复都认为是联系人重复
                const isContactDup = isContactNameDup || isPhoneDup;

                //如果联系人重复
                if (isContactDup) {
                    let dupContact = {
                        name: customerContact.name,
                        phone: _.clone(customerContact.phone)
                    };

                    if (isContactNameDup) {
                        dupContact.name = <span className="high-light">{dupContact.name}</span>;
                    }

                    if (isPhoneDup) {
                        dupContact.phone = _.map(dupContact.phone, item => {
                            if (_.includes(clueContact.phone, item)) {
                                item = <span className="high-light">{item}</span>;
                            }

                            return item;
                        });
                    }

                    dupContacts.push(dupContact);
                }
            });
        });

        return dupContacts;
    }
}

export default CustomerList;
