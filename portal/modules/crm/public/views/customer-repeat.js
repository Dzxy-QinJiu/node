/**
 * 客户查重界面
 * Created by wangliping on 2016/12/29.
 */
var React = require('react');
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
import ShearContent from '../../../../components/shear-content';
import AppUserManage from 'MOD_DIR/app_user_manage/public';
import {isCurtao,checkVersionAndType} from 'PUB_DIR/sources/utils/common-method-util';
import BackMainPage from 'CMP_DIR/btn-back';
import {CRM_VIEW_TYPES, checkPrivilege} from '../utils/crm-util';
import crmPrivilegeConst from '../privilege-const';

let CONSTANTS = {
    PADDING_TOP: 84,
    PADDING_BOTTOM: 20,
    TABLE_HEAD_HEIGHT: 35,
    TOTAL_HEIGHT: 30,
    PAGE_SIZE: 20//一页展示的客户个数
};
let searchInputTimeOut = null;
const delayTime = 800;

class CustomerRepeat extends React.Component {
    onStoreChange = () => {
        this.setState(CustomerRepeatStore.getState());
    };

    componentDidMount() {
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
        $(this.refs.crmList).on('click', 'tbody .has-filter', function(event) {
            var $tr = $(this).closest('tr');
            $tr.addClass('current-row').siblings().removeClass('current-row');
            Trace.traceEvent(event, '点击查看客户详情');
            var id = $tr.find('.record-id').text();
            _this.showRightPanel(id);
        });
    }

    componentDidUpdate() {
        let curCustomerId = _.isObject(this.state.curCustomer) ? this.state.curCustomer.id : '';
        if (curCustomerId && this.state.rightPanelIsShow) {
            $('.customer-repeat-container .record-id').each(function() {
                if ($(this).text() === curCustomerId) {
                    $(this).closest('tr').addClass('current-row').siblings().removeClass('current-row');
                    return false;
                }
            });
        }
    }

    componentWillUnmount() {
        CustomerRepeatStore.unlisten(this.onStoreChange);
        CustomerRepeatAction.setInitData();
    }

    getCrmListHeight = () => {
        return $(window).height() - CONSTANTS.PADDING_TOP - CONSTANTS.TABLE_HEAD_HEIGHT - CONSTANTS.TOTAL_HEIGHT - CONSTANTS.PADDING_BOTTOM;
    };

    //删除选中的重复的客户
    delRepeatCustomer = (customer) => {
        if (customer && customer.id) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-footer .btn-ok'), '删除重复客户');
            CustomerRepeatAction.delRepeatCustomer([customer.id], result => {
                if (result.error) {
                    message.error(result.errorMsg);
                } else {
                    message.success(result.successMsg);
                }
            });
        }
    };

    //返回客户列表
    returnCustomerList = (e) => {
        Trace.traceEvent(e, '点击返回按钮回到客户列表页面');
        this.props.closeRepeatCustomer();
        //重置获取数据页数，保证下次进来获取第一页数据时界面的刷新
        CustomerRepeatAction.resetPage();
        CustomerRepeatAction.setSelectedCustomer([]);
    };

    showRightPanel = (id) => {
        //舆情秘书角色不让看详情
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
            return;
        }
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击查看客户详情');
        CustomerRepeatAction.setRightPanelShow(true);
        CustomerRepeatAction.setCurCustomer(id);
        setTimeout(() => {
            this.renderCustomerDetail();
        });
    };

    hideRightPanel = () => {
        CustomerRepeatAction.setRightPanelShow(false);
        CustomerRepeatAction.setCurCustomer('');
    };

    handleScrollBottom = () => {
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
    };

    refreshRepeatCustomerList = (customerId) => {
        setTimeout(() => CustomerRepeatAction.refreshRepeatCustomer(customerId), 1000);
    };

    //获取删除客户时的确认提示
    getModalContent = (customer) => {
        let modalContent = Intl.get('crm.43', '确定要是删除该客户吗?');
        if (customer) {
            let userSize = _.isArray(customer.app_user_ids) && customer.app_user_ids.length || 0;
            if (userSize > 0) {
                modalContent = Intl.get('crm.44', '该客户已开通{count}个用户，删除后用户的客户关系将丢失，确定要删除该客户吗？', {count: userSize});
            }
        }
        return modalContent;
    };

    showMergePanel = (repeatList) => {
        if (_.isArray(repeatList) && repeatList.length > 0) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.customer-merge-btn'), '点击合并按钮');
            CustomerRepeatAction.setMergeRepeatCustomers(repeatList);
            CustomerRepeatAction.setMergePanelShow(true);
        }
    };

    hideMergePanel = () => {
        CustomerRepeatAction.setMergePanelShow(false);
    };

    showSearchInput = (key) => {
        CustomerRepeatAction.toggleSearchInput({key: key, isShow: true});
        if (key === 'name') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.repeat-customer-search-icon'), '点击按客户名称搜索按钮');
        } else if (key === 'user_name') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.repeat-customer-search-icon'), '点击按负责人搜索按钮');
        } else if (key === 'remarks') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.repeat-customer-search-icon'), '点击按备注搜索按钮');
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
    };

    //表头过滤框的内容修改的处理
    onChangeFilterObj = (filterKey, event) => {
        let filterObj = this.state.filterObj;
        filterObj[filterKey] = event.target.value;
        if (!event.target.value) {
            //清空过滤框的内容，直接进行过滤
            this.filterRepeatCustomer(filterKey);
            delete this.state.filterObj[filterKey];
        }
        CustomerRepeatAction.setFilterObj(filterObj);
    };

    //获取过滤后的重复客户
    filterRepeatCustomer = (filterKey) => {
        if (this.state.filterObj[filterKey] === undefined) {
            return;
        }
        CustomerRepeatAction.resetPage();
        CustomerRepeatAction.setRepeatCustomerLoading(true);
        CustomerRepeatAction.getRepeatCustomerList({
            page_size: CONSTANTS.PAGE_SIZE,
            filterObj: JSON.stringify(this.state.filterObj)
        });
    };

    //清空过滤框中的内容
    clearFilterContent = (filterKey) => {
        let filterObj = this.state.filterObj;
        filterObj[filterKey] = '';
        //清空过滤框的内容，直接进行过滤
        this.filterRepeatCustomer(filterKey);
        delete this.state.filterObj[filterKey];
        CustomerRepeatAction.setFilterObj(filterObj);
        CustomerRepeatAction.toggleSearchInput({key: filterKey, isShow: false});
        if (filterKey === 'name') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.anticon-cross-circle-o'), '关闭客户名称后的搜索框');
        } else if (filterKey === 'user_name') {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.anticon-cross-circle-o'), '关闭负责人后的搜索框');
        } else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.anticon-cross-circle-o'), '关闭备注后的搜索框');
        }
    };

    onSearchInputKeyUp = (filterKey) => {
        if (searchInputTimeOut) {
            clearTimeout(searchInputTimeOut);
        }
        searchInputTimeOut = setTimeout(() => {
            this.filterRepeatCustomer(filterKey);
            if (filterKey === 'name') {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('input'), '跟据客户名称过滤');
            } else if (filterKey === 'user_name') {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('input'), '跟据负责人过滤');
            } else if (filterKey === 'remarks') {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('input'), '跟据备注过滤');
            }
        }, delayTime);

    };

    //filterKey:对应的过滤字段，columnLabel:该列的表头描述
    getSearchInput = (filterKey, columnLabel) => {
        const placeholder = Intl.get('common.filter.by.key', '根据{key}过滤', {key: columnLabel});
        let filterValue = this.state.filterObj[filterKey];
        return (<div className="filter-input-container">
            <Input placeholder={placeholder} value={filterValue || ''}
                onChange={this.onChangeFilterObj.bind(this, filterKey)}
                onKeyUp={this.onSearchInputKeyUp.bind(this, filterKey)}
            />
            <Icon type="cross-circle-o" onClick={this.clearFilterContent.bind(this, filterKey)}/>
        </div>);
    };

    getColumnTitle = (filterKey, columnLabel) => {
        return ( <div>{columnLabel}<Icon type="search" onClick={this.showSearchInput.bind(this, filterKey)}
            className="repeat-customer-search-icon"/></div>);
    };

    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    };

    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };

    renderRepeatCustomerHead = () => {
        return (<Row>
            <Col span={23}>
                <Row>
                    <Col span={5} className="repeat-customer-col">{Intl.get('crm.4', '客户名称')}</Col>
                    <Col span={2}
                        className="repeat-customer-col">{Intl.get('call.record.contacts', '联系人')}</Col>
                    <Col span={3} className="repeat-customer-col">{Intl.get('crm.5', '联系方式')}</Col>
                    {isCurtao() ? null : (
                        <Col span={2} className="repeat-customer-col">
                            {Intl.get('user.apply.detail.order', '订单')}
                        </Col>)}
                    {checkVersionAndType().personal ? null : (
                        <Col span={2} className="repeat-customer-col">{Intl.get('crm.6', '负责人')}</Col>
                    )}
                    <Col span={2}
                        className="repeat-customer-col">{Intl.get('member.create.time', '创建时间')}</Col>
                    <Col span={2} className="repeat-customer-col">{Intl.get('crm.7', '最后联系时间')}</Col>
                    <Col span={5}
                        className="repeat-customer-col">{Intl.get('crm.last.trace.content', '最后跟进内容')}</Col>
                </Row>
            </Col>
        </Row>);
    };

    renderContactWay = (customer) => {
        //只展示重复的电话，repeat_id
        if(_.get(customer, 'repeat_id')) {
            return customer.repeat_id;
        }else { return null; }
    };

    getCustomerRow = (customer) => {
        let customerNameCls = classNames('repeat-customer-col customer-name-click',
            {'customer-name-active': this.state.curCustomer.id === customer.id});
        return (
            <Row className="customer-row" key={customer.id}>
                <Col span={5} className={customerNameCls}
                    onClick={this.showRightPanel.bind(this, customer.id)}>
                    {customer.name}
                </Col>
                <Col span={2} className="repeat-customer-col">{customer.contact_name}</Col>
                <Col span={3} className="repeat-customer-col">
                    <ShearContent>
                        {this.renderContactWay(customer)}
                    </ShearContent>
                </Col>
                <Col span={2} className="repeat-customer-col">{customer.sales_stage}</Col>
                <Col span={2} className="repeat-customer-col">{customer.user_name}</Col>
                <Col span={2} className="repeat-customer-col">{customer.start_time_str}</Col>
                <Col span={2} className="repeat-customer-col">{customer.last_contact_time_str}</Col>
                <Col span={5} className="repeat-customer-col comments-fix">
                    <ShearContent>
                        {customer.customer_trace}
                    </ShearContent>
                </Col>
                <Col span={1}>
                    <PrivilegeChecker check={() => checkPrivilege([crmPrivilegeConst.CUSTOMER_UPDATE, crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL])}>
                        <Popconfirm title={this.getModalContent(customer)}
                            onConfirm={this.delRepeatCustomer.bind(this, customer)}
                            okText={Intl.get('common.sure', '确认')}
                            cancelText={Intl.get('common.cancel', '取消')}>
                            <Button className="repeat-del-btn handle-btn-item"
                                title={Intl.get('common.delete', '删除')}>
                                <i className="iconfont icon-delete"></i>
                            </Button>
                        </Popconfirm>
                    </PrivilegeChecker>
                </Col>
            </Row>);
    };

    renderRepeatCustomerList = () => {
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
            return repeatCustomerList.map( (repeatObj, index) => {
                let isPhoneRepeat = repeatObj.repeatList[0] && repeatObj.repeatList[0].repeat_type === 'phone';
                return (
                    <Row className="customer-repeat-row" key={index}>
                        {isPhoneRepeat ? <span className="phone-repeat-tag">{Intl.get('crm.repeat.phone','电话重复')}</span> : null}
                        <Col span={23}>
                            {repeatObj.repeatList.map( (customer) => {
                                return this.getCustomerRow(customer);
                            })}
                        </Col>
                        <Col span={1}>
                            <PrivilegeChecker check={() => checkPrivilege([
                                crmPrivilegeConst.CUSTOMER_UPDATE,
                                crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL
                            ])} className="repeat-merge-btn handle-btn-item"
                            onClick={this.showMergePanel.bind(this, repeatObj.repeatList)}>
                                <span className="iconfont icon-merge-btn" title={Intl.get('crm.54', '合并')}></span>
                            </PrivilegeChecker>
                        </Col>
                    </Row>);
            });
        } else {
            return (
                <div className="alert-tip-wrap"><Alert showIcon={true} message={Intl.get('common.no.more.repeat.crm', '没有重复的客户')}/>
                </div>);
        }
    };

    renderCustomerDetail = () => {
        //触发打开带拨打电话状态的客户详情面板
        if (this.state.curCustomer) {
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                customer_params: {
                    isRepeat: true,
                    refreshCustomerList: this.refreshRepeatCustomerList,
                    curCustomer: {...this.state.curCustomer, customer_type: CRM_VIEW_TYPES.CRM_REPEAT},
                    ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                    updateCustomerDefContact: CustomerRepeatAction.updateCustomerDefContact,
                    hideRightPanel: this.hideRightPanel,
                }
            });
        }
    };

    state = {
        crmListHeight: this.getCrmListHeight(),
        isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
        customerOfCurUser: {},//当前展示用户所属客户的详情
        ...CustomerRepeatStore.getState()};

    render() {
        let tableData = this.state.repeatCustomerList;
        const total = Intl.get('crm.14', '共{count}条记录', {count: this.state.repeatCustomersSize});
        return (<div className="customer-repeat-container" data-tracename="重复客户列表">
            {!this.props.noNeedClose ? <TopNav>
                <div className="return-btn-container" onClick={(e) => {
                    this.returnCustomerList(e);
                }}>
                    <BackMainPage className="customer-back-btn" 
                        handleBackClick={this.returnCustomerList}></BackMainPage>
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
            {/*该客户下的用户列表*/}
            {
                this.state.isShowCustomerUserListPanel ?
                    <RightPanel
                        className="customer-user-list-panel"
                        showFlag={this.state.isShowCustomerUserListPanel}
                    >
                        {this.state.isShowCustomerUserListPanel ?
                            <AppUserManage
                                customer_id={this.state.customerOfCurUser.id}
                                hideCustomerUserList={this.closeCustomerUserListPanel}
                                customer_name={this.state.customerOfCurUser.name}
                            /> : null
                        }
                    </RightPanel> : null
            }
        </div>);
    }
}
CustomerRepeat.propTypes = {
    setInitialRepeatList: PropTypes.bool,
    initialRepeatObj: PropTypes.object,
    closeRepeatCustomer: PropTypes.func,
    noNeedClose: PropTypes.bool,
};
module.exports = CustomerRepeat;

