/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/12/25.
 * 客户回收站
 */
import '../css/customer-recycle-bin.less';
import TopNav from'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import Trace from 'LIB_DIR/trace';
import {AntcTable} from 'antc';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {SearchInput} from 'antc';
import {message, Popconfirm, Icon, Button} from 'antd';
import {addHyphenToPhoneNumber} from 'LIB_DIR/func';
import { phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';
import BottomTotalCount from 'CMP_DIR/bottom-total-count';
import {getTableContainerHeight, isCurtao, checkVersionAndType} from 'PUB_DIR/sources/utils/common-method-util';
import BackMainPage from 'CMP_DIR/btn-back';
import {CRM_VIEW_TYPES, checkPrivilege} from '../utils/crm-util';
import crmPrivilegeConst from '../privilege-const';
const PRIVILEGES = {
    MANAGER_CUSTOMER_BAK_AUTH: crmPrivilegeConst.CRM_MANAGER_CUSTOMER_BAK_OPERATOR_RECORD//管理员获取回收站中客户列表的权限
};
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_NAV_HEIGHT: 64,//头部导航区高度
    TOTAL_HEIGHT: 40,//总数的高度
    TH_HEIGHT: 50,//表头的高度
    MIN_WIDTH_NEED_CAL: 446,//需要计算输入框时的断点
    WIDTH_WITHOUT_INPUT: 145//topnav中除了输入框以外的宽度
};
const PAGE_SIZE = 20;
class CustomerRecycleBin extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitStateData();
    }
    getInitStateData(){
        return {
            isLoading: false,//正在加载客户列表
            customerList: [],//回收站中的客户列表
            totalSize: 0,//回收站中，客户总数
            lastId: '',//用于下拉加载的id
            errorMsg: '',//获取客户列表错误信息
            listenScrollBottom: true,//是否监听下拉加载
            isRecoveringId: '',//正在恢复的客户id
            isDeletingId: '',//正在删除的客户id
            sorter: {//默认按操作时间排序
                field: 'time',
                order: 'descend'
            },
            searchObj: _.isEmpty(this.props.crmSearchCondition) ? {
                field: '',
                value: ''
            } : this.props.crmSearchCondition,
            filterInputWidth: 300,//输入框的默认宽度
        };
    }
    componentDidMount() {
        // 如果是从没有符合条件的客户点击跳转过来的,将搜索框中的关键字置为搜索的客户名称
        if(!_.isEmpty(this.props.crmSearchCondition)) {
            this.refs.recycleSearchInput.state.keyword = _.get(this.props.crmSearchCondition, 'value', '');
        }
        this.getRecycleBinCustomers();
        let _this = this;
        //点击客户列表某一行时打开对应的详情
        $('.customer-bak-table').delegate('td.has-filter', 'click', function(e) {
            Trace.traceEvent($(ReactDOM.findDOMNode(_this)).find('.ant-table-tbody'), '打开回收站中的客户详情');
            var $tr = $(this).closest('tr');
            var id = $tr.find('.record-id').text();
            _this.showRightPanel(id);
        });
        this.setFilterInputWidth();
        //响应式布局时动态计算filterinput的宽度
        $(window).on('resize', this.resizeHandler);
    }

    resizeHandler = () => {
        clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => {
            this.setFilterInputWidth();
        }, 100);
    };

    setFilterInputWidth = () => {
        let needCalWidth = $(window).width() <= LAYOUT_CONSTANTS.MIN_WIDTH_NEED_CAL;
        if(needCalWidth) {
            let filterInputWidth = $(window).width() - LAYOUT_CONSTANTS.WIDTH_WITHOUT_INPUT;
            this.setState({
                filterInputWidth
            });
        } else {
            this.setState({
                filterInputWidth: 300
            });
        }
    }

    componentWillUnmount() {
        this.setState(this.getInitStateData());
        $(window).off('resize', this.resizeHandler);
    }
    showRightPanel = (id) => {
        this.setState({
            currentId: id
        });
        setTimeout(() => {
            this.renderCustomerDetail();
        });
    };

    colseRightPanel = () => {
        this.setState({
            currentId: ''
        });
        $('.customer-bak-table .ant-table-row').removeClass('current-row');
    };
    renderCustomerDetail = () => {
        //触发打开带拨打电话状态的客户详情面板
        if (this.state.currentId) {
            let curCustomer = _.find(this.state.customerList, item => item.unique_id === this.state.currentId);
            if(curCustomer){
                let customerInfo = {
                    ...curCustomer,
                    id: curCustomer.unique_id,//客户真实的id, 获取客户详情中的数据时需要用此id
                    customer_type: CRM_VIEW_TYPES.CRM_RECYCLE
                };
                phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                    customer_params: {
                        currentId: this.state.currentId,
                        curCustomer: customerInfo,
                        hideRightPanel: this.colseRightPanel,
                        disableEdit: true,//是否是客户回收站中打开的客户详情(禁止编辑、添加客户信息)
                        isUseCustomerContacts: true//联系人用客户对象上的contacts,不用再通过接口获取
                    }
                });
            }
        }
    };

    getAuthType() {
        let type = 'user';
        if (hasPrivilege(PRIVILEGES.MANAGER_CUSTOMER_BAK_AUTH)) {
            type = 'manager';
        }
        return type;
    }

    //获取body中的参数
    getBodyData() {
        let bodyData = {
            query: {//过滤条件
                operation: '删除,合并'//只取删除和合并的客户，去掉更新的
            }
        };
        //排序
        if (_.get(this.state, 'sorter.field')) {
            bodyData.sort_and_orders = [{key: this.state.sorter.field, value: this.state.sorter.order}];
        }
        //搜索
        if (_.get(this.state, 'searchObj.field')) {
            bodyData.query[this.state.searchObj.field] = this.state.searchObj.value;
        }
        return bodyData;
    }

    //获取回收站中的客户列表
    getRecycleBinCustomers() {
        let type = this.getAuthType();
        let url = `/rest/crm/recycle_bin/customer/${type}`;
        if (this.state.lastId) {
            url = `${url}?id=${this.state.lastId}`;
        }
        let bodyData = this.getBodyData();
        this.setState({isLoading: true});
        $.ajax({
            url: url,
            type: 'post',
            dateType: 'json',
            data: bodyData,
            success: (data) => {
                this.handleSuccessData(data);
            },
            error: (xhr) => {
                this.setState({
                    errorMsg: xhr.responseJSON || Intl.get('failed.get.crm.list', '获取客户列表失败'),
                    isLoading: false
                });
            }
        });
    }

    //获取客户列表成功后的数据处理
    handleSuccessData(data) {
        let list = _.get(data, 'result', []);
        let customerList = this.state.customerList;
        let totalSize = _.get(data, 'total', 0);
        if (this.state.lastId) {
            customerList = _.concat(customerList, list);
        } else {
            customerList = list;
        }
        //是否监听下拉加载的处理
        let listenScrollBottom = false;
        if (_.get(customerList, 'length') < totalSize) {
            listenScrollBottom = true;
        }
        this.setState({
            errorMsg: '',
            isLoading: false,
            totalSize,
            customerList,
            listenScrollBottom,
            lastId: _.get(customerList, `[${customerList.length - 1}].id`, '')
        });
    }

    //返回客户列表
    returnCustomerList = (e) => {
        Trace.traceEvent(e, '点击返回按钮回到客户列表页面');
        if (_.isFunction(this.props.closeRecycleBin)) {
            this.props.closeRecycleBin();
        }
    };
    handleScrollBottom = () => {
        this.getRecycleBinCustomers();
    }
    showNoMoreDataTip = () => {
        return !this.state.isLoading && !this.state.errorMsg &&
            this.state.customerList.length >= PAGE_SIZE && !this.state.listenScrollBottom;
    }
    //恢复客户
    recoveryCustomer = (id) => {
        if (!id || this.state.isRecoveringId) return;
        let recoveryCustomer = _.find(this.state.customerList, item => item.id === id);
        if (!recoveryCustomer) return;
        this.setState({isRecoveringId: id});
        $.ajax({
            url: '/rest/crm/recovery/customer',
            type: 'put',
            dateType: 'json',
            data: recoveryCustomer,
            success: (data) => {
                message.success(Intl.get('crm.recovery.customer.success', '恢复客户成功'));
                //回收站中，去掉恢复成功的客户
                let customerList = _.filter(this.state.customerList, item => item.id !== id);
                let totalSize = this.state.totalSize;
                totalSize--;
                this.setState({
                    isRecoveringId: '',
                    customerList: customerList || [],
                    totalSize: totalSize > 0 ? totalSize : 0
                });
            },
            error: (xhr) => {
                this.setState({isRecoveringId: ''});
                message.error(xhr.responseJSON || Intl.get('crm.recovery.customer.failed', '恢复客户失败'));
            }
        });
    }
    //彻底删除客户
    deleteCustomer = (id) => {
        if (!id || this.state.isDeletingId) return;
        this.setState({isDeletingId: id});
        $.ajax({
            url: `/rest/crm/customer_bak/${id}`,
            type: 'delete',
            dateType: 'json',
            success: (data) => {
                message.success(Intl.get('crm.138', '删除成功'));
                //回收站中，去掉恢复成功的客户
                let customerList = _.filter(this.state.customerList, item => item.id !== id);
                let totalSize = this.state.totalSize;
                totalSize--;
                this.setState({
                    isDeletingId: '',
                    customerList: customerList || [],
                    totalSize: totalSize > 0 ? totalSize : 0
                });
            },
            error: (xhr) => {
                this.setState({isDeletingId: ''});
                message.error(xhr.responseJSON || Intl.get('crm.139', '删除失败'));
            }
        });
    }

    onTableChange = (pagination, filters, sorter) => {
        if (!_.isEmpty(sorter) && (sorter.field !== this.state.sorter.field || sorter.order !== this.state.sorter.order)) {
            this.setState({sorter, lastId: ''}, () => {
                this.getRecycleBinCustomers();
            });
        }
    };

    getColumns() {
        const column_width = 80;
        let columns = [
            {
                title: Intl.get('crm.4', '客户名称'),
                width: 200,
                dataIndex: 'name',
                className: 'has-filter',
                render: (text, record, index) => {
                    return (
                        <span>
                            <span>{text}</span>
                            <span className="hidden record-id">{record.unique_id}</span>
                        </span>);
                }
            }, {
                title: Intl.get('call.record.contacts', '联系人'),
                width: column_width,
                dataIndex: 'contact',
            }, {
                title: Intl.get('crm.5', '联系方式'),
                width: 130,
                dataIndex: 'contact_way',
                className: 'column-contact-way has-filter',
                render: (text, record, index) => {
                    return _.map(record.contact_way, item => {
                        if (item) {
                            return (<div>{item}</div>);
                        }
                    });
                }
            }, {
                title: Intl.get('user.apply.detail.order', '订单'),
                width: column_width,
                dataIndex: 'order',
                className: 'has-filter'
            },
            {
                title: Intl.get('crm.6', '负责人'),
                width: column_width,
                dataIndex: 'user_name',
                className: 'has-filter'
            },
            {
                title: Intl.get('crm.last.contact', '最后联系'),
                width: 100,
                dataIndex: 'last_contact_time',
                sorter: true,
                className: 'has-filter'
            }, {
                title: Intl.get('member.create.time', '创建时间'),
                width: 100,
                dataIndex: 'start_time',
                sorter: true,
                className: 'has-filter table-data-align-right'
            }, {
                title: Intl.get('crm.recycle.bin.type', '操作类型'),
                width: column_width,
                dataIndex: 'operation',
            }, {
                title: Intl.get('user.operator', '操作人'),
                width: column_width,
                dataIndex: 'operator_name'
            }, {
                title: Intl.get('crm.recycle.bin.time', '操作时间'),
                width: 100,
                dataIndex: 'time',
                sorter: true
            }, {
                title: Intl.get('notification.system.handled.set', '处理'),
                width: 70,
                render: (text, record, index) => {
                    if (record.id === this.state.isRecoveringId || record.id === this.state.isDeletingId) {
                        return (<Icon type="loading" className='operate-icon'/>);
                    } else if(checkPrivilege([
                        crmPrivilegeConst.CRM_MANAGER_CUSTOMER_BAK_OPERATOR_RECORD,
                        crmPrivilegeConst.CRM_USER_CUSTOMER_BAK_OPERATOR_RECORD
                    ])) {
                        return (
                            <React.Fragment>
                                <Popconfirm placement="leftTop" data-tracename="恢复客户"
                                    title={Intl.get('crm.recovery.customer.confirm.tip', '确定要恢复客户 {name} 吗？', {name: _.get(record, 'name', '')})}
                                    onConfirm={this.recoveryCustomer.bind(this, _.get(record, 'id', ''))}>
                                    <span className="iconfont icon-recovery operate-icon handle-btn-item"
                                        data-tracename="恢复客户"
                                        title={Intl.get('crm.customer.recovery', '恢复')}/>
                                </Popconfirm>
                                <Popconfirm placement="leftTop"
                                    title={Intl.get('crm.delete.customer.confirm.tip', '删除后不可恢复，确定要彻底删除客户 {name} 吗？', {name: _.get(record, 'name', '')})}
                                    onConfirm={this.deleteCustomer.bind(this, _.get(record, 'id', ''))}>
                                    <span className="iconfont icon-delete operate-icon handle-btn-item"
                                        data-tracename="彻底删除客户"
                                        title={Intl.get('crm.delete.thoroughly', '彻底删除')}/>
                                </Popconfirm>
                            </React.Fragment>
                        );
                    }else { return null; }
                }
            }
        ];
        //csm.curtao.com域名下不展示订单
        if (isCurtao()) {
            columns = _.filter(columns, column => column.title !== Intl.get('user.apply.detail.order', '订单'));
        }
        //个人版不展示负责人
        if(checkVersionAndType().personal) {
            columns = _.filter(columns, column => column.title !== Intl.get('crm.6', '负责人'));
        }
        //没有恢复、彻底删除的权限，就去掉操作列
        if (!checkPrivilege([crmPrivilegeConst.CRM_MANAGER_CUSTOMER_BAK_OPERATOR_RECORD, crmPrivilegeConst.CRM_USER_CUSTOMER_BAK_OPERATOR_RECORD])) {
            columns = _.filter(columns, column => column.title !== Intl.get('common.operate', '操作'));
        }
        return columns;
    }

    getTableData() {
        let tableData = _.map(this.state.customerList, item => {
            let start_time = item.start_time ? moment(item.start_time).format(oplateConsts.DATE_FORMAT) : '';
            let last_contact_time = item.last_contact_time ? moment(item.last_contact_time).format(oplateConsts.DATE_FORMAT) : '';
            let phoneArray = _.get(item, 'contacts[0].phone', []);
            phoneArray = _.map(phoneArray, phone => addHyphenToPhoneNumber(phone));
            return {
                id: item.id,
                unique_id: item.unique_id,//客户的真实id,用户来获取客户详情中的数据
                name: item.name,
                contact: _.get(item, 'contacts[0].name', ''),
                contact_way: phoneArray,
                order: _.get(item, 'sales_opportunities[0].sale_stages', ''),
                user_name: _.get(item, 'user_name', ''),
                start_time,
                last_contact_time,
                time: item.time ? moment(parseInt(item.time)).format(oplateConsts.DATE_FORMAT) : '',
                operator_name: _.get(item, 'operator_name', ''),
                operation: _.get(item, 'operation', '')
            };
        });
        return tableData;
    }

    rowKey(record, index) {
        return record.id;
    }

    //处理选中行的样式
    handleRowClassName = (record, index) => {
        if ((record.unique_id === this.state.currentId)) {
            return 'current-row';
        }
        else {
            return '';
        }
    };

    renderTableContent() {
        //初次获取数据时展示loading效果
        if (this.state.isLoading && !_.get(this.state, 'customerList[0]')) {
            return (<Spinner />);
        } else if (_.get(this.state, 'customerList[0]')) {
            return (
                <div>
                    <AntcTable
                        rowKey={this.rowKey}
                        rowClassName={this.handleRowClassName}
                        columns={this.getColumns()}
                        loading={this.state.isLoading}
                        dataSource={this.getTableData()}
                        util={{zoomInSortArea: true}}
                        onChange={this.onTableChange}
                        pagination={false}
                        scroll={{y: getTableContainerHeight()}}
                        dropLoad={{
                            listenScrollBottom: this.state.listenScrollBottom,
                            handleScrollBottom: this.handleScrollBottom,
                            loading: this.state.isLoading,
                            showNoMoreDataTip: this.showNoMoreDataTip(),
                            noMoreDataText: Intl.get('common.no.more.crm', '没有更多客户了')
                        }}
                    />
                    {this.state.totalSize ?
                        <BottomTotalCount
                            totalCount={Intl.get('crm.207', '共{count}个客户', {count: this.state.totalSize})}/>
                        : null}
                </div>);
        } else {
            let noDataTip = Intl.get('contract.60', '暂无客户');
            if (this.state.errorMsg) {
                noDataTip = this.state.errorMsg;
            }
            // else if (this.state.searchObj.value) {
            //     noDataTip = Intl.get('common.no.filter.crm', '没有符合条件的客户');
            // }
            return (
                <NoDataIntro noDataTip={noDataTip}/>);
        }
    }

    searchEvent = (value, key) => {
        let searchObj = this.state.searchObj;
        if (searchObj.field !== key || _.trim(value) !== searchObj.value) {
            searchObj.field = key;
            searchObj.value = _.trim(value);
            this.setState({searchObj, lastId: ''}, () => {
                this.getRecycleBinCustomers();
            });
        }
    };

    render() {
        const searchFields = [
            {
                name: Intl.get('crm.41', '客户名'),
                field: 'name'
            },
            {
                name: Intl.get('user.operator', '操作人'),
                field: 'operator_name'
            },
            {
                name: Intl.get('call.record.contacts', '联系人'),
                field: 'contact_name'
            }
        ];
        //个人版不展示负责人
        if(!checkVersionAndType().personal) {
            searchFields.splice(searchFields.length - 1, 0, {
                name: Intl.get('crm.6', '负责人'),
                field: 'user_name'

            });
        }
        return (
            <div className="customer-recycle-bin" data-tracename="回收站客户列表">
                <TopNav>
                    <div className="return-btn-container" onClick={this.returnCustomerList}>
                        <BackMainPage className="customer-back-btn" 
                            handleBackClick={this.returnCustomerList}></BackMainPage>
                    </div>
                    <div className="customer-search-block" style={{width: this.state.filterInputWidth}}>
                        <SearchInput
                            ref="recycleSearchInput"
                            type="select"
                            searchFields={searchFields}
                            searchEvent={this.searchEvent}
                            className="btn-item"
                        />
                    </div>
                </TopNav>
                <div className="customer-table-container customer-bak-table" style={{height: getTableContainerHeight()}}>
                    {this.renderTableContent()}
                </div>
            </div>
        );
    }
}

CustomerRecycleBin.propTypes = {
    closeRecycleBin: PropTypes.func,
    crmSearchCondition: PropTypes.object
};

export default CustomerRecycleBin;