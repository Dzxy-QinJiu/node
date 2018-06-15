/**
 * 客户查重界面
 * Created by wangliping on 2016/12/29.
 */
import '../css/customer-repeat.less';
import {Button, message, Icon, Input, Row, Col, Popconfirm, Alert} from 'antd';
import TopNav from'../../../../components/top-nav';
import Spinner from '../../../../components/spinner';
import GeminiScrollBar from '../../../../components/react-gemini-scrollbar';
import userData from '../../../../public/sources/user-data';
import CustomerRepeatAction from '../action/customer-repeat-action';
import CustomerRepeatStore from '../store/customer-repeat-store';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import CrmRightMergePanel from './crm-right-merge-panel';
import Privilege from '../../../../components/privilege/checker';
import classNames from 'classnames';
import {RightPanel} from 'CMP_DIR/rightPanel';
let PrivilegeChecker = Privilege.PrivilegeChecker;
import Trace from 'LIB_DIR/trace';

let CONSTANTS = {
    PADDING_TOP: 84,
    PADDING_BOTTOM: 20,
    TABLE_HEAD_HEIGHT: 53,
    TOTAL_HEIGHT: 20,
    PAGE_SIZE: 20//一页展示的客户个数
};
let searchInputTimeOut = null;
const delayTime = 800;
let CustomerRepeat = React.createClass({
    getInitialState: function() {
        return {
            crmListHeight: this.getCrmListHeight(),
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            CustomerInfoOfCurrUser: {},//当前展示用户所属客户的详情
            ...CustomerRepeatStore.getState()};
    },
    onStoreChange: function() {
        this.setState(CustomerRepeatStore.getState());
    },
    componentDidMount: function() {
        CustomerRepeatStore.listen(this.onStoreChange);
        //第一次的数据从父组件中传进来时，第一次不用发请求获取数据了
        if (this.props.setInitialRepeatList && this.props.initialRepeatObj){
            CustomerRepeatAction.setInitialRepeatCustomerList(this.props.initialRepeatObj);
        }else{
            CustomerRepeatAction.setRepeatCustomerLoading(true);
            CustomerRepeatAction.getRepeatCustomerList({
                page_size: CONSTANTS.PAGE_SIZE,
                filterObj: JSON.stringify(this.state.filterObj)
            });
        }
        $(window).resize(() => {
            this.setState({crmListHeight: this.getCrmListHeight()});
        });
        let _this = this;
        //点击客户列表某一行时打开对应的详情
        $(this.refs.crmList).on('click', 'tbody .has-filter', function() {
            var $tr = $(this).closest('tr');
            $tr.addClass('current-row').siblings().removeClass('current-row');
            Trace.traceEvent($(_this.getDOMNode()).find('.current-row'), '点击查看客户详情');
            var id = $tr.find('.record-id').text();
            _this.showRightPanel(id);
        });
    },
    componentDidUpdate: function() {
        let curCustomerId = _.isObject(this.state.curCustomer) ? this.state.curCustomer.id : '';
        if (curCustomerId && this.state.rightPanelIsShow) {
            $('.customer-repeat-container .record-id').each(function() {
                if ($(this).text() === curCustomerId) {
                    $(this).closest('tr').addClass('current-row').siblings().removeClass('current-row');
                    return false;
                }
            });
        }
    },
    componentWillUnmount: function() {
        CustomerRepeatStore.unlisten(this.onStoreChange);
    },
    getCrmListHeight: function() {
        return $(window).height() - CONSTANTS.PADDING_TOP - CONSTANTS.TABLE_HEAD_HEIGHT - CONSTANTS.TOTAL_HEIGHT - CONSTANTS.PADDING_BOTTOM;
    },
    //删除选中的重复的客户
    delRepeatCustomer: function(customer) {
        if (customer && customer.id) {
            Trace.traceEvent($(this.getDOMNode()).find('.modal-footer .btn-ok'), '删除重复客户');
            CustomerRepeatAction.delRepeatCustomer([customer.id], result => {
                if (result.error) {
                    message.error(result.errorMsg);
                } else {
                    message.success(result.successMsg);
                }
            });
        }
    },
    //返回客户列表
    returnCustomerList: function(e) {
        Trace.traceEvent(e, '点击返回按钮回到客户列表页面');
        this.props.closeRepeatCustomer();
        //重置获取数据页数，保证下次进来获取第一页数据时界面的刷新
        CustomerRepeatAction.resetPage();
        CustomerRepeatAction.setSelectedCustomer([]);
    },
    showRightPanel: function(id) {
        //舆情秘书角色不让看详情
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
            return;
        }
        CustomerRepeatAction.setRightPanelShow(true);
        CustomerRepeatAction.setCurCustomer(id);
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                isRepeat: true,
                refreshCustomerList: this.refreshRepeatCustomerList,
                curCustomer: this.state.curCustomer,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                updateCustomerDefContact: CustomerRepeatAction.updateCustomerDefContact,
                hideRightPanel: this.hideRightPanel
            }
        });
    },
    hideRightPanel: function() {
        CustomerRepeatAction.setRightPanelShow(false);
        CustomerRepeatAction.setCurCustomer('');
    },
    handleScrollBottom() {
        //下拉加载数据
        let queryParams = {
                page_size: CONSTANTS.PAGE_SIZE,
                filterObj: JSON.stringify(this.state.filterObj)
            }, repeatCustomerList = this.state.originCustomerList;
        if (_.isArray(repeatCustomerList) && repeatCustomerList.length > 0) {
            queryParams.id = repeatCustomerList[repeatCustomerList.length - 1].id;//最后一个客户的id
        }
        CustomerRepeatAction.setRepeatCustomerLoading(true);
        CustomerRepeatAction.getRepeatCustomerList(queryParams);
    },
    refreshRepeatCustomerList: function(customerId) {
        setTimeout(() => CustomerRepeatAction.refreshRepeatCustomer(customerId), 1000);
    },
    //获取删除客户时的确认提示
    getModalContent: function(customer) {
        let modalContent = Intl.get('crm.43', '确定要是删除该客户吗?');
        if (customer) {
            let userSize = _.isArray(customer.app_user_ids) && customer.app_user_ids.length || 0;
            if (userSize > 0) {
                modalContent = Intl.get('crm.44', '该客户已开通{count}个用户，删除后用户的客户关系将丢失，确定要删除该客户吗？', {count: userSize});
            }
        }
        return modalContent;
    },
    showMergePanel: function(repeatList) {
        if (_.isArray(repeatList) && repeatList.length > 0) {
            Trace.traceEvent($(this.getDOMNode()).find('.customer-merge-btn'), '点击合并按钮');
            CustomerRepeatAction.setMergeRepeatCustomers(repeatList);
            CustomerRepeatAction.setMergePanelShow(true);
        }
    },
    hideMergePanel: function() {
        CustomerRepeatAction.setMergePanelShow(false);
    },

    showSearchInput: function(key) {
        CustomerRepeatAction.toggleSearchInput({key: key, isShow: true});
        if (key === 'name') {
            Trace.traceEvent($(this.getDOMNode()).find('.repeat-customer-search-icon'), '点击按客户名称搜索按钮');
        } else if (key === 'user_name') {
            Trace.traceEvent($(this.getDOMNode()).find('.repeat-customer-search-icon'), '点击按负责人搜索按钮');
        } else if (key === 'remarks') {
            Trace.traceEvent($(this.getDOMNode()).find('.repeat-customer-search-icon'), '点击按备注搜索按钮');
        }
        //之前有搜索的内容时，先还原
        if (!_.isEmpty(this.state.filterObj)) {
            CustomerRepeatAction.resetPage();
            CustomerRepeatAction.setRepeatCustomerLoading(true);
            CustomerRepeatAction.getRepeatCustomerList({
                page_size: CONSTANTS.PAGE_SIZE,
                filterObj: JSON.stringify({})
            });
        }
    },
    //表头过滤框的内容修改的处理
    onChangeFilterObj: function(filterKey, event) {
        this.state.filterObj[filterKey] = event.target.value;
        if (!event.target.value) {
            //清空过滤框的内容，直接进行过滤
            this.filterRepeatCustomer(filterKey);
            delete this.state.filterObj[filterKey];
        }
        CustomerRepeatAction.setFilterObj(this.state.filterObj);
    },
    //获取过滤后的重复客户
    filterRepeatCustomer: function(filterKey) {
        if (this.state.filterObj[filterKey] === undefined) {
            return;
        }
        CustomerRepeatAction.resetPage();
        CustomerRepeatAction.setRepeatCustomerLoading(true);
        CustomerRepeatAction.getRepeatCustomerList({
            page_size: CONSTANTS.PAGE_SIZE,
            filterObj: JSON.stringify(this.state.filterObj)
        });
    },
    //清空过滤框中的内容
    clearFilterContent: function(filterKey) {
        this.state.filterObj[filterKey] = '';
        //清空过滤框的内容，直接进行过滤
        this.filterRepeatCustomer(filterKey);
        delete this.state.filterObj[filterKey];
        CustomerRepeatAction.setFilterObj(this.state.filterObj);
        CustomerRepeatAction.toggleSearchInput({key: filterKey, isShow: false});
        if (filterKey === 'name') {
            Trace.traceEvent($(this.getDOMNode()).find('.anticon-cross-circle-o'), '关闭客户名称后的搜索框');
        } else if (filterKey === 'user_name') {
            Trace.traceEvent($(this.getDOMNode()).find('.anticon-cross-circle-o'), '关闭负责人后的搜索框');
        } else {
            Trace.traceEvent($(this.getDOMNode()).find('.anticon-cross-circle-o'), '关闭备注后的搜索框');
        }
    },
    onSearchInputKeyUp: function(filterKey) {
        if (searchInputTimeOut) {
            clearTimeout(searchInputTimeOut);
        }
        searchInputTimeOut = setTimeout(() => {
            this.filterRepeatCustomer(filterKey);
            if (filterKey === 'name') {
                Trace.traceEvent($(this.getDOMNode()).find('input'), '跟据客户名称过滤');
            } else if (filterKey === 'user_name') {
                Trace.traceEvent($(this.getDOMNode()).find('input'), '跟据负责人过滤');
            } else if (filterKey === 'remarks') {
                Trace.traceEvent($(this.getDOMNode()).find('input'), '跟据备注过滤');
            }
        }, delayTime);

    },
    //filterKey:对应的过滤字段，columnLabel:该列的表头描述
    getSearchInput: function(filterKey, columnLabel) {
        const placeholder = Intl.get('common.filter.by.key', '根据{key}过滤', {key: columnLabel});
        let filterValue = this.state.filterObj[filterKey];
        return (<div className="filter-input-container">
            <Input placeholder={placeholder} value={filterValue || ''}
                onChange={this.onChangeFilterObj.bind(this, filterKey)}
                onKeyUp={this.onSearchInputKeyUp.bind(this, filterKey)}
            />
            <Icon type="cross-circle-o" onClick={this.clearFilterContent.bind(this, filterKey)}/>
        </div>);
    },
    getColumnTitle: function(filterKey, columnLabel) {
        return ( <div>{columnLabel}<Icon type="search" onClick={this.showSearchInput.bind(this, filterKey)}
            className="repeat-customer-search-icon"/></div>);
    },
    ShowCustomerUserListPanel: function(data) {
        this.setState({
            isShowCustomerUserListPanel: true,
            CustomerInfoOfCurrUser: data.customerObj
        });

    },
    closeCustomerUserListPanel: function() {
        this.setState({
            isShowCustomerUserListPanel: false
        });
    },
    renderRepeatCustomerHead: function() {
        return (<Row>
            <Col span={23}>
                <Row>
                    <Col span={5} className="repeat-customer-col">{Intl.get('crm.4', '客户名称')}</Col>
                    <Col span={2}
                        className="repeat-customer-col">{Intl.get('call.record.contacts', '联系人')}</Col>
                    <Col span={3} className="repeat-customer-col">{Intl.get('crm.5', '联系方式')}</Col>
                    <Col span={2}
                        className="repeat-customer-col">{Intl.get('user.apply.detail.order', '订单')}</Col>
                    <Col span={2} className="repeat-customer-col">{Intl.get('crm.6', '负责人')}</Col>
                    <Col span={2}
                        className="repeat-customer-col">{Intl.get('member.create.time', '创建时间')}</Col>
                    <Col span={2} className="repeat-customer-col">{Intl.get('crm.7', '最后联系时间')}</Col>
                    <Col span={5}
                        className="repeat-customer-col">{Intl.get('crm.last.trace.content', '最后跟进内容')}</Col>
                </Row>
            </Col>
        </Row>);
    },
    renderContactWay: function(customer) {
        if (_.isArray(customer.phones) && customer.phones.length) {
            return customer.phones.map(phone => (<div>{phone}</div>));
        } else {
            return null;
        }
    },
    getCustomerRow: function(customer) {
        let customerNameCls = classNames('repeat-customer-col customer-name-click',
            {'customer-name-active': this.state.curCustomer.id === customer.id});
        return (
            <Row className="customer-row">
                <Col span={5} className={customerNameCls}
                    onClick={this.showRightPanel.bind(this, customer.id)}>
                    {customer.name}
                </Col>
                <Col span={2} className="repeat-customer-col">{customer.contact_name}</Col>
                <Col span={3} className="repeat-customer-col">
                    {this.renderContactWay(customer)}
                </Col>
                <Col span={2} className="repeat-customer-col">{customer.sales_stage}</Col>
                <Col span={2} className="repeat-customer-col">{customer.user_name}</Col>
                <Col span={2} className="repeat-customer-col">{customer.start_time_str}</Col>
                <Col span={2} className="repeat-customer-col">{customer.last_contact_time_str}</Col>
                <Col span={5} className="repeat-customer-col comments-fix">
                    {customer.customer_trace}
                </Col>
                <Col span={1}>
                    <PrivilegeChecker check="CUSTOMER_DELETE">
                        <Popconfirm title={this.getModalContent(customer)}
                            onConfirm={this.delRepeatCustomer.bind(this, customer)}
                            okText={Intl.get('common.sure', '确认')}
                            cancelText={Intl.get('common.cancel', '取消')}>
                            <Button className="repeat-del-btn" icon="delete"
                                title={Intl.get('common.delete', '删除')}/>
                        </Popconfirm>
                    </PrivilegeChecker>
                </Col>
            </Row>);
    },
    renderRepeatCustomerList: function() {
        let repeatCustomerList = this.state.repeatCustomerList;
        if (this.state.page === 1 && this.state.isLoadingRepeatCustomer) {
            return (<div className="table-loading-wrap">
                <Spinner />
            </div>);
        } else if (this.state.errorMsg) {
            return (<div className="alert-tip-wrap">
                <Alert type="error" showIcon={true} message={this.state.errorMsg}/>
            </div>);
        } else if (_.isArray(repeatCustomerList) && repeatCustomerList.length) {
            return repeatCustomerList.map(repeatObj => {
                let isPhoneRepeat = repeatObj.repeatList[0] && repeatObj.repeatList[0].repeat_type === 'phone';
                return (
                    <Row className="customer-repeat-row">
                        {isPhoneRepeat ? <span className="phone-repeat-tag">{Intl.get('crm.repeat.phone','电话重复')}</span> : null}
                        <Col span={23}>
                            {repeatObj.repeatList.map(customer => {
                                return this.getCustomerRow(customer);
                            })}
                        </Col>
                        <Col span={1}>
                            <PrivilegeChecker check="CUSTOMER_MERGE_CUSTOMER" className="repeat-merge-btn"
                                onClick={this.showMergePanel.bind(this, repeatObj.repeatList)}>
                                {Intl.get('crm.54', '合并')}
                            </PrivilegeChecker>
                        </Col>
                    </Row>);
            });
        } else {
            return (
                <div className="alert-tip-wrap"><Alert showIcon={true} message={Intl.get('common.no.more.crm', '没有更多客户了')}/>
                </div>);
        }
    },
    render: function() {
        let tableData = this.state.repeatCustomerList;
        const total = Intl.get('crm.14', '共{count}条记录', {count: this.state.repeatCustomersSize});
        return (<div className="customer-repeat-container" data-tracename="客户查重页面">
            {!this.props.noNeedClose ? <TopNav>
                <div className="return-btn-container" onClick={(e) => {
                    this.returnCustomerList(e);
                }}>
                    <span className="iconfont icon-return-btn"/>
                    <span className="return-btn-font">{Intl.get('crm.52', '返回')}</span>
                </div>
            </TopNav> : null}
            <div className="content-block customer-repeat-table splice-table">
                <div className="repeat-customer-table-thead" ref="thead">
                    {this.renderRepeatCustomerHead()}
                </div>
                <div className="repeat-customer-table-tbody" style={{height: this.state.crmListHeight}}
                    ref="crmList">
                    <GeminiScrollBar
                        listenScrollBottom={this.state.listenScrollBottom}
                        handleScrollBottom={this.handleScrollBottom}
                        itemCssSelector=".customer-repeat-row"
                    >
                        {this.renderRepeatCustomerList()}
                    </GeminiScrollBar>
                </div>
                {tableData.length > 0 ? (<div className="total">{total}</div>) : null}
            </div>
            {this.state.mergePanelIsShow ? (<CrmRightMergePanel
                showFlag={this.state.mergePanelIsShow}
                originCustomerList={this.state.originCustomerList}
                mergeCustomerList={this.state.mergeRepeatCustomers}
                hideMergePanel={this.hideMergePanel}
                refreshCustomerList={this.refreshRepeatCustomerList}
            />) : null}
        </div>);
    }
});

module.exports = CustomerRepeat;
