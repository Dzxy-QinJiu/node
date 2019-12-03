var React = require('react');
require('../css/crm-right-panel.less');
import {Tabs, Select, Button, Icon, message} from 'antd';
var TabPane = Tabs.TabPane;
var Option = Select.Option;
var AlertTimer = require('../../../../components/alert-timer');
var rightPanelUtil = require('../../../../components/rightPanel/index');
var RightPanel = rightPanelUtil.RightPanel;
var Contacts = require('./contacts');
import Contract from './contract';
var Dynamic = require('./dynamic');
var CrmSchedule = require('./schedule');
var Order = require('./order');
var CustomerRecord = require('./customer_record');
var CustomerRepeatAction = require('../action/customer-repeat-action');
import Trace from 'LIB_DIR/trace';
import ajax from '../ajax/index';
import {tabNameList} from '../utils/crm-util';
import BasicInfo from './basic_info';
import BasicOverview from './basic-overview';
import CustomerUsers from './users';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import Spinner from 'CMP_DIR/spinner';
import crmPrivilegeConst from '../privilege-const';

class CrmRightMergePanel extends React.Component {
    componentDidMount() {
        this.getRepeatCustomersById(this.props.mergeCustomerList);
        this.setTabsContainerHeight();
        $(window).resize(e => {
            e.stopPropagation();
            this.setTabsContainerHeight();
        });
    }

    getRepeatCustomersById = (mergeCustomerList) => {
        this.setState({isLoadingMergeCustomer: true});
        let mergedCustomerIds = _.map(mergeCustomerList, 'id');
        ajax.getRepeatCustomersById(mergedCustomerIds.join(',')).then((data) => {
            if (_.get(data, 'result[0]')) {
                this.setState({
                    isLoadingMergeCustomer: false,
                    originCustomerList: data.result,
                    selectedCustomer: this.getMergedCustomer(mergeCustomerList, data.result)
                });
            }
        }, (errorMsg) => {
            this.setState({isLoadingMergeCustomer: false});
            message.error(errorMsg);
        });
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            originCustomerList: nextProps.originCustomerList,//后端返回的重复列表的数据
            mergeCustomerList: nextProps.mergeCustomerList,//选中的要合并的客户
            selectedCustomer: this.getMergedCustomer(nextProps.mergeCustomerList, nextProps.originCustomerList)
        });
        this.getRepeatCustomersById(nextProps.mergeCustomerList);
    }

    /**
     * 合并联系方式
     * @param contact 要合并的联系人
     * @param mergedContact 合并后的联系人
     * @param key 联系方式（电话/qq/微信/邮箱）
     */
    mergeContactWay = (contact, mergedContact, key) => {
        if (_.isArray(contact[key]) && contact[key].length > 0) {
            if (_.isArray(mergedContact[key]) && mergedContact[key].length > 0) {
                //过滤掉相同的联系方式
                contact[key] = _.filter(contact[key], contactKey => mergedContact[key].indexOf(contactKey) === -1);
                mergedContact[key] = mergedContact[key].concat(contact[key]);
            } else {
                mergedContact[key] = contact[key];
            }
        }
        return mergedContact[key];
    };

    /**
     * 合并客户
     * @param mergedCustomer 合并后要保存的客户
     * @param mergeCustomerList 需要合并的客户列表
     * @param originCustomerList 所有展示的重复客户列表数据（完整）
     */
    mergeCustomer = (mergedCustomer, mergeCustomerList, originCustomerList) => {
        //将其他重复的客户合并到要保存的客户上来
        if (_.isArray(mergeCustomerList) && mergeCustomerList.length > 0) {
            let mergedRemarks = [];//所有需合并客户的备注组成的数组
            if (mergedCustomer.remarks) {
                mergedRemarks.push(mergedCustomer.remarks);
            }
            mergeCustomerList.forEach((curCustomer) => {
                if (curCustomer.id !== mergedCustomer.id) {
                    let customer = _.find(originCustomerList, (customer) => customer.id === curCustomer.id);
                    customer = $.extend(true, {}, customer);
                    //合并客户下关联的应用
                    if (_.isArray(customer.app_ids) && customer.app_ids.length > 0) {
                        if (_.isArray(mergedCustomer.app_ids) && mergedCustomer.app_ids.length > 0) {
                            mergedCustomer.app_ids = mergedCustomer.app_ids.concat(customer.app_ids);
                            //去重
                            mergedCustomer.app_ids = _.uniq(mergedCustomer.app_ids);
                        } else {
                            mergedCustomer.app_ids = customer.app_ids;
                        }
                    }
                    //合并客户下关联的用户
                    if (_.isArray(customer.app_user_ids) && customer.app_user_ids.length > 0) {
                        if (_.isArray(mergedCustomer.app_user_ids) && mergedCustomer.app_user_ids.length > 0) {
                            mergedCustomer.app_user_ids = mergedCustomer.app_user_ids.concat(customer.app_user_ids);
                            //去重
                            mergedCustomer.app_user_ids = _.uniq(mergedCustomer.app_user_ids);
                        } else {
                            mergedCustomer.app_user_ids = customer.app_user_ids;
                        }
                    }
                    // 合并标签的处理
                    if (_.isArray(customer.labels) && customer.labels.length > 0) {
                        if (_.isArray(mergedCustomer.labels) && mergedCustomer.labels.length > 0) {
                            //合并标签
                            mergedCustomer.labels = mergedCustomer.labels.concat(customer.labels);
                            //去重
                            mergedCustomer.labels = _.uniq(mergedCustomer.labels);
                        } else {
                            mergedCustomer.labels = customer.labels;
                        }
                    }
                    //合并客户竞品的处理
                    if (_.isArray(customer.competing_products) && customer.competing_products.length > 0) {
                        if (_.isArray(mergedCustomer.competing_products) && mergedCustomer.competing_products.length > 0) {
                            //合并客户竞品
                            mergedCustomer.competing_products = mergedCustomer.competing_products.concat(customer.competing_products);
                            //去重
                            mergedCustomer.competing_products = _.uniq(mergedCustomer.competing_products);
                        } else {
                            mergedCustomer.competing_products = customer.competing_products;
                        }
                    }
                    //合并备注
                    if (customer.remarks) {
                        mergedRemarks.push(customer.remarks);
                    }
                    //合并联系人
                    if (_.get(customer, 'contacts[0]')) {
                        customer.contacts.forEach((contact) => {
                            //去掉默认联系方式
                            contact.def_contancts = 'false';
                        });
                        if (_.get(mergedCustomer,'contacts[0]')) {
                            mergedCustomer.contacts = mergedCustomer.contacts.concat(customer.contacts);
                        } else {
                            mergedCustomer.contacts = customer.contacts;
                        }
                    }
                    //合并订单
                    if (_.isArray(customer.sales_opportunities) && customer.sales_opportunities.length > 0) {
                        if (_.isArray(mergedCustomer.sales_opportunities) && mergedCustomer.sales_opportunities.length > 0) {
                            mergedCustomer.sales_opportunities = mergedCustomer.sales_opportunities.concat(customer.sales_opportunities);
                        } else {
                            mergedCustomer.sales_opportunities = customer.sales_opportunities;
                        }
                        //TODO 过滤掉’信息阶段’的订单
                        //mergedCustomer.sales_opportunities = _.filter(mergedCustomer.sales_opportunities, oppor=>oppor.sale_stages !== "信息阶段");
                    }
                    //合并创建时间（用最早的）
                    if (customer.start_time && customer.start_time < mergedCustomer.start_time) {
                        mergedCustomer.start_time = customer.start_time;
                    }
                    //合并最后联系时间（用最后的）
                    if (customer.last_contact_time && customer.last_contact_time > mergedCustomer.last_contact_time) {
                        mergedCustomer.last_contact_time = customer.last_contact_time;
                    }
                }
            });
            //所有备注的去重
            mergedRemarks = _.uniq(mergedRemarks);
            if (_.isArray(mergedRemarks) && mergedRemarks.length > 0) {
                //将去重后的备注连起来赋值给合并后的客户
                mergedCustomer.remarks = mergedRemarks.join(' ; ');
            }

            //联系人去重
            let mergedContacts = [];//合并后的联系人
            if (_.get(mergedCustomer, 'contacts[0]')) {
                mergedCustomer.contacts.forEach(contact => {
                    if (mergedContacts.length > 0) {
                        //查找相同名称的联系人
                        let existContact = _.find(mergedContacts, mergedContact => mergedContact.name === contact.name);
                        if (existContact) {
                            //已存在该名称的联系人，合并联系方式
                            //电话的合并
                            existContact.phone = this.mergeContactWay(contact, existContact, 'phone');
                            //QQ的合并
                            existContact.qq = this.mergeContactWay(contact, existContact, 'qq');
                            //微信的合并
                            existContact.webChat = this.mergeContactWay(contact, existContact, 'weChat');
                            //邮箱的合并
                            existContact.email = this.mergeContactWay(contact, existContact, 'email');
                        } else {
                            //不存在该名称的联系人，直接加入
                            mergedContacts.push(contact);
                        }
                    } else {
                        mergedContacts = [contact];
                    }
                });
            }
            mergedCustomer.contacts = mergedContacts;
            //默认联系方式的设置
            if (_.get(mergedCustomer, 'contacts[0]')) {
                let hasDefault = _.some(mergedCustomer.contacts, (contact) => contact.def_contancts === 'true');
                if (!hasDefault) {
                    mergedCustomer.contacts[0].def_contancts = 'true';
                }
            }
        }
        return mergedCustomer;
    };

    /**
     * 合并后保存的客户（默认第一个）
     * @param mergeCustomerList 选中的需要合并的重复客户列表
     * @param originCustomerList 所有展示的重复客户列表数据（完整）
     * @param customerId 合并后要保存的客户id
     */
    getMergedCustomer = (mergeCustomerList, originCustomerList, customerId) => {
        let mergedCustomer = {};
        if (customerId) {
            mergedCustomer = _.find(originCustomerList, (customer) => customer.id === customerId);
        } else if (_.isArray(mergeCustomerList) && mergeCustomerList.length > 0) {
            mergedCustomer = _.find(originCustomerList, (customer) => customer.id === mergeCustomerList[0].id);
        }
        mergedCustomer = $.extend({}, true, mergedCustomer);
        //将其他重复的客户合并到要保存的客户上来
        mergedCustomer = this.mergeCustomer(mergedCustomer, mergeCustomerList, originCustomerList);
        return mergedCustomer;
    };

    hideRightPanel = (e) => {
        Trace.traceEvent(e, '关闭合并客户面板');
        this.props.hideMergePanel();
        this.setState({
            activeKey: '1'
        });
    };

    //切换tab时的处理
    changeActiveKey = (key) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-tabs-nav-wrap .ant-tabs-nav'), '查看' + tabNameList[key]);
        this.setState({
            activeKey: key
        });
    };

    //选择合并后要保存的客户
    handleChange = (customerId) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.merge-customer-select'), '切换合并后要保存的客户名称');
        let mergedCustomer = this.getMergedCustomer(this.state.mergeCustomerList, this.state.originCustomerList, customerId);
        this.setState({selectedCustomer: mergedCustomer});
    };

    //合并客户
    mergeRepeatCustomer = () => {
        if (this.state.isMergingCustomer) return;
        let delete_customers = [], mergeCustomerList = this.props.mergeCustomerList,
            selectedCustomer = this.state.selectedCustomer;
        //获取合并后要删除的重复客户id
        if (_.isArray(mergeCustomerList) && mergeCustomerList.length > 0) {
            mergeCustomerList.forEach((customer) => {
                if (customer.id !== selectedCustomer.id) {
                    delete_customers.push({id: customer.id, name: customer.name});
                }
            });
        }
        //联系人的处理
        let contactPhone = [];//联系电话
        if (_.get(selectedCustomer, 'contacts[0]')) {
            selectedCustomer.contacts.forEach(contact => {
                if (contact.customer_id !== selectedCustomer.id) {
                    //将联系方式对应的客户id改为要保存客户的id
                    contact.customer_id = selectedCustomer.id;
                }
                if (_.isArray(contact.phone) && contact.phone.length) {
                    contactPhone = contactPhone.concat(contact.phone);
                }
            });
            //重复电话的验证
            let noRepeatContacts = [], repeatContacts = [];
            _.each(contactPhone, phone => {
                if (noRepeatContacts.indexOf(phone) === -1) {
                    noRepeatContacts.push(phone);
                } else {
                    repeatContacts.push(phone);
                }
            });
            if (_.isArray(repeatContacts) && repeatContacts.length) {
                message.warn(Intl.get('crm.repeat.phone.unhandle', '您还有未处理的重复电话：') + repeatContacts.join(','), 10);
                return;
            }
        }
        //订单的处理
        if (_.isArray(selectedCustomer.sales_opportunities) && selectedCustomer.sales_opportunities.length > 0) {
            selectedCustomer.sales_opportunities.forEach((sales_oppor) => {
                if (sales_oppor.customer_id !== selectedCustomer.id) {
                    //将订单对应的客户id改为要保存客户的id
                    sales_oppor.customer_id = selectedCustomer.id;
                }
            });
        }
        this.setState({isMergingCustomer: true});
        let mergeObj = {
            customer: selectedCustomer,
            delete_customers: delete_customers
        };
        CustomerRepeatAction.mergeRepeatCustomer(mergeObj, resultObj => {
            if (resultObj.error) {
                //合并失败的处理
                this.setState({mergeErrorMsg: resultObj.errorMsg, isMergingCustomer: false});
            } else {
                //合并成功的处理
                this.setState({mergeErrorMsg: '', isMergingCustomer: false});
                //关闭合并面板
                CustomerRepeatAction.setMergePanelShow(false);
                if (this.props.afterMergeCustomer) {
                    //客户列表界面，合并客户后的处理
                    this.props.afterMergeCustomer(mergeObj);
                } else {
                    //重复客户列表，合并重复客户后的处理
                    CustomerRepeatAction.afterMergeRepeatCustomer(mergeObj);
                }
            }
        });
    };

    renderSelectOptions = () => {
        let selectOptions = [], mergeCustomerList = this.props.mergeCustomerList;
        if (_.isArray(mergeCustomerList) && mergeCustomerList.length > 0) {
            selectOptions = this.props.mergeCustomerList.map((customer, index) => (
                <Option key={index} value={customer.id}>{customer.name}</Option>));
        }
        return selectOptions;
    };

    hideSaveTooltip = () => {
        CustomerRepeatAction.clearMergeFlags();
    };

    //修改要合并的客户
    updateMergeCustomer = (newBasic) => {
        let updateCustomer = this.state.selectedCustomer;
        //客户名的修改
        if (newBasic.name) {
            updateCustomer.name = newBasic.name;
        }
        //客户标签的修改
        if (newBasic.labels) {
            updateCustomer.labels = newBasic.labels;
        }
        //客户行业的修改
        if (newBasic.industry) {
            updateCustomer.industry = newBasic.industry;
        }
        //客户的行政级别
        if (newBasic.administrative_level || newBasic.administrative_level === '') {
            updateCustomer.administrative_level = newBasic.administrative_level;
        }
        //客户地域的修改
        if (newBasic.province) {
            updateCustomer.province = newBasic.province;
        }
        if (newBasic.city) {
            updateCustomer.city = newBasic.city;
        }
        if (newBasic.county) {
            updateCustomer.county = newBasic.county;
        }
        //地址
        if (newBasic.address || newBasic.address === '') {
            updateCustomer.address = newBasic.address;
        }
        //客户备注的修改
        if (newBasic.remarks || newBasic.remarks === '') {
            updateCustomer.remarks = newBasic.remarks;
        }
        //客户所属销售的修改
        if (newBasic.user_id) {
            updateCustomer.user_id = newBasic.user_id;
        }
        if (newBasic.user_name) {
            updateCustomer.user_name = newBasic.user_name;
        }
        if (newBasic.sales_team_id) {
            updateCustomer.sales_team_id = newBasic.sales_team_id;
        }
        if (newBasic.sales_team) {
            updateCustomer.sales_team = newBasic.sales_team;
        }
        this.setState({selectedCustomer: updateCustomer});
    };

    //修改要合并客户的联系方式
    updateMergeCustomerContact = (newContact) => {
        if (newContact.id) {
            let mergedCustomer = this.state.selectedCustomer;
            //修改联系方式
            if (_.get(mergedCustomer, 'contacts[0]')) {
                //找到修改的联系方式并更新
                _.some(mergedCustomer.contacts, (contact, index) => {
                    if (contact.id === newContact.id) {
                        mergedCustomer.contacts[index][newContact.property] = newContact[newContact.property];
                        return true;
                    }
                });
            }
            this.setState({selectedCustomer: mergedCustomer});
        }
    };

    //删除合并客户的联系方式
    delMergeCustomerContact = (delContactId) => {
        if (delContactId) {
            let mergedCustomer = this.state.selectedCustomer;
            if (_.get(mergedCustomer, 'contacts[0]')) {
                mergedCustomer.contacts = _.filter(mergedCustomer.contacts, contact => contact.id !== delContactId);
            }
            this.setState({selectedCustomer: mergedCustomer});
        }
    };

    //设置合并客户的默认联系方式
    setMergeCustomerDefaultContact = (defaultContactId) => {
        if (defaultContactId) {
            let mergedCustomer = this.state.selectedCustomer;
            if (_.get(mergedCustomer,'contacts[0]')) {
                mergedCustomer.contacts.forEach(contact => {
                    if (contact.id === defaultContactId) {
                        contact.def_contancts = 'true';
                    } else {
                        contact.def_contancts = 'false';
                    }
                });
            }
            this.setState({selectedCustomer: mergedCustomer});
        }
    };

    //修改合并客户的订单
    updateMergeCustomerOrder = (newOrder) => {
        let mergedCustomer = this.state.selectedCustomer;
        if (newOrder.id) {
            if (_.isArray(mergedCustomer.sales_opportunities) && mergedCustomer.sales_opportunities.length) {
                //找到要修改的订单并更新
                _.some(mergedCustomer.sales_opportunities, (order, index) => {
                    if (order.id === newOrder.id) {
                        mergedCustomer.sales_opportunities[index] = $.extend(mergedCustomer.sales_opportunities[index], newOrder);
                        return true;
                    }
                });
            }
            this.setState({selectedCustomer: mergedCustomer});
        }
    };

    //删除合并客户的订单
    delMergeCustomerOrder = (delOrderId) => {
        if (delOrderId) {
            let mergedCustomer = this.state.selectedCustomer;
            if (_.isArray(mergedCustomer.sales_opportunities)) {
                //过滤掉要删除的订单
                mergedCustomer.sales_opportunities = _.filter(mergedCustomer.sales_opportunities, order => order.id !== delOrderId);
            }
            this.setState({selectedCustomer: mergedCustomer});
        }
    };

    setTabsContainerHeight = () => {
        let tabsContainerHeight = $('body').height() - $('.select-customer-container').height() - $('.basic-info-contianer').outerHeight(true);
        this.setState({tabsContainerHeight: tabsContainerHeight});
    };

    state = {
        activeKey: '1',//tab激活页的key
        apps: [],
        curOrder: {},
        isMergingCustomer: false,//正在合并客户
        mergeErrorMsg: '',//合并失败的提示信息
        originCustomerList: this.props.originCustomerList,//后端返回的重复列表的数据
        mergeCustomerList: this.props.mergeCustomerList,//选中的要合并的客户
        selectedCustomer: this.getMergedCustomer(this.props.mergeCustomerList, this.props.originCustomerList),//合并后保存的客户（默认第一个）
        tabsContainerHeight: 'auto',
        isLoadingMergeCustomer: true,//正在获取合并客户详细信息（联系人、订单）
    };

    render() {
        var className = 'right-panel-content';
        if (this.state.applyUserShowFlag) {
            //展示form面板时，整体左移
            className += ' crm-right-panel-content-slide';
        }
        return (
            <RightPanel showFlag={this.props.showFlag}
                className="crm-right-panel white-space-nowrap crm-right-merge-panel" data-tracename="合并客户面板">
                <span className="iconfont icon-close" onClick={(e) => {
                    this.hideRightPanel(e);
                }}/>
                {this.state.isLoadingMergeCustomer ? (
                    <div className={className}>
                        <Spinner/>
                    </div>) : (
                    <div className={className}>
                        <div className="select-customer-container">
                            <span className="select-customer-label">{Intl.get('crm.63', '合并后保存的客户')}：</span>
                            <Select value={this.state.selectedCustomer.id}
                                dropdownClassName="merge-customer-select"
                                style={{width: 200}}
                                onChange={this.handleChange}>
                                {this.renderSelectOptions()}
                            </Select>
                            <Button type="primary" className="btn-primary-merge"
                                onClick={this.mergeRepeatCustomer}
                                data-tracename="点击合并按钮"
                            ><ReactIntl.FormattedMessage id="crm.54" defaultMessage="合并"/></Button>
                        </div>
                        {this.state.isMergingCustomer ?
                            <Icon className="merge-customer-loading" type="loading"/> : null}
                        { this.state.mergeErrorMsg ? (
                            <div className="merge-customer-tooltip">
                                <AlertTimer time={3000}
                                    message={this.state.mergeErrorMsg}
                                    type="error" showIcon
                                    onHide={this.hideSaveTooltip}/></div>) : null}
                        <BasicInfo isRepeat={this.props.isRepeat}
                            isMerge={true}
                            curCustomer={this.state.selectedCustomer}
                            refreshCustomerList={this.props.refreshCustomerList}
                            updateMergeCustomer={this.updateMergeCustomer}
                            handleFocusCustomer={this.props.handleFocusCustomer}
                            setTabsContainerHeight={this.setTabsContainerHeight}
                            showRightPanel={this.props.showRightPanel}
                        />
                        <div className="crm-right-panel-content" style={{height: this.state.tabsContainerHeight}}>
                            {this.state.selectedCustomer ? (
                                <Tabs
                                    defaultActiveKey="1"
                                    activeKey={this.state.activeKey}
                                    onChange={this.changeActiveKey}
                                >
                                    <TabPane
                                        tab={Intl.get('crm.basic.overview', '概览')}
                                        key="1"
                                    >
                                        {this.state.activeKey === '1' ? (
                                            <BasicOverview
                                                isMerge={true}
                                                curCustomer={this.state.selectedCustomer}
                                                refreshCustomerList={this.props.refreshCustomerList}
                                                updateMergeCustomer={this.updateMergeCustomer}
                                                changeActiveKey={this.changeActiveKey}
                                            />
                                        ) : null}
                                    </TabPane>
                                    <TabPane
                                        tab={Intl.get('call.record.contacts', '联系人')}
                                        key="2"
                                    >
                                        {this.state.activeKey === '2' ? (
                                            <Contacts
                                                isMerge={true}
                                                setMergeCustomerDefaultContact={this.setMergeCustomerDefaultContact}
                                                delMergeCustomerContact={this.delMergeCustomerContact}
                                                updateMergeCustomerContact={this.updateMergeCustomerContact}
                                                refreshCustomerList={this.props.refreshCustomerList}
                                                curCustomer={this.state.selectedCustomer}
                                                isUseCustomerContacts={true}
                                            />
                                        ) : null}
                                    </TabPane>
                                    <TabPane
                                        tab={Intl.get('menu.trace', '跟进记录')}
                                        key="3"
                                    >
                                        {this.state.activeKey === '3' ? (
                                            <CustomerRecord
                                                disableEdit={true}
                                                curCustomer={this.state.selectedCustomer}
                                                refreshCustomerList={this.props.refreshCustomerList}
                                            />
                                        ) : null}
                                    </TabPane>
                                    <TabPane
                                        tab={Intl.get('crm.detail.user', '用户')}
                                        key="4"
                                    >
                                        {this.state.activeKey === '4' ? (
                                            <CustomerUsers
                                                isMerge={true}
                                                curCustomer={this.state.selectedCustomer}
                                                refreshCustomerList={this.props.refreshCustomerList}
                                            />
                                        ) : null}
                                    </TabPane>
                                    <TabPane
                                        tab={Intl.get('user.apply.detail.order', '订单')}
                                        key="5"
                                    >
                                        {this.state.activeKey === '5' ? (
                                            <Order
                                                isMerge={true}
                                                updateMergeCustomerOrder={this.updateMergeCustomerOrder}
                                                delMergeCustomerOrder={this.delMergeCustomerOrder}
                                                closeRightPanel={this.props.hideRightPanel}
                                                curCustomer={this.state.selectedCustomer}
                                                refreshCustomerList={this.props.refreshCustomerList}
                                            />
                                        ) : null}
                                    </TabPane>
                                    {
                                        hasPrivilege(crmPrivilegeConst.CRM_CONTRACT_QUERY) ? (
                                            <TabPane
                                                tab={Intl.get('contract.125', '合同')}
                                                key='6'
                                            >
                                                {this.state.activeKey === 6 ? (
                                                    <Contract
                                                        isMerge={true}
                                                        curCustomer={this.state.curCustomer}
                                                    />
                                                ) : null}
                                            </TabPane>
                                        ) : null
                                    }
                                    <TabPane
                                        tab={Intl.get('user.change.record', '变更记录')}
                                        key="7"
                                    >
                                        {this.state.activeKey === '7' ? (
                                            <Dynamic
                                                isMerge={true}
                                                currentId={this.state.selectedCustomer.id}
                                            />
                                        ) : null}
                                    </TabPane>
                                    <TabPane
                                        tab={Intl.get('crm.right.schedule', '联系计划')}
                                        key="7"
                                    >
                                        {this.state.activeKey === '7' ? (
                                            <CrmSchedule
                                                isMerge={true}
                                                curCustomer={this.state.selectedCustomer}
                                            />
                                        ) : null}
                                    </TabPane>
                                </Tabs>
                            ) : null}
                        </div>
                    </div>
                )}
            </RightPanel>
        );
    }
}
CrmRightMergePanel.propTypes = {
    mergeCustomerList: PropTypes.array,
    originCustomerList: PropTypes.array,
    showFlag: PropTypes.bool,
    isRepeat: PropTypes.bool,
    hideMergePanel: PropTypes.func,
    afterMergeCustomer: PropTypes.func,
    refreshCustomerList: PropTypes.func,
    handleFocusCustomer: PropTypes.func,
    hideRightPanel: PropTypes.func,
    showRightPanel: PropTypes.func,
};
module.exports = CrmRightMergePanel;


