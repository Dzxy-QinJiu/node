/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/8/10.
 */
import '../css/customer-pool.less';
import TopNav from'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import Trace from 'LIB_DIR/trace';
import {AntcTable} from 'antc';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {SearchInput} from 'antc';
import {message, Popconfirm, Icon, Tag, Button, Popover} from 'antd';
import crmAjax from '../ajax/index';
import userData from 'PUB_DIR/sources/user-data';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import {formatSalesmanList, isResponsiveDisplay, removeEmptyItem} from 'PUB_DIR/sources/utils/common-method-util';
import {getAllSalesUserList} from 'PUB_DIR/sources/utils/common-data-util';
import salesmanAjax from 'MOD_DIR/common/public/ajax/salesman';
import {RightPanelClose} from 'CMP_DIR/rightPanel/index';
import {FilterInput} from 'CMP_DIR/filter';
import CustomerPoolFilter from './customer-pool-filter';
import classNames from 'classnames';
import {COMMON_OTHER_ITEM, extractIcon} from 'PUB_DIR/sources/utils/consts';
import {DAY_TIME} from 'PUB_DIR/sources/utils/consts';
import CustomerLabel from 'CMP_DIR/customer_label';
import CustomerPoolRule from './customer_pool_rule';
import BackMainPage from 'CMP_DIR/btn-back';
import { CRM_VIEW_TYPES, CUSTOMER_POOL_TYPES } from '../utils/crm-util';
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';
import {isCommonSalesOrPersonnalVersion} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';

//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 66 + 46,//表格容器上外边距 + 表头的高度
    BOTTOM_DISTANCE: 30 + 10 * 2,//分页器的高度 + 分页器上下外边距
    MIN_WIDTH_NEED_CAL: 580,//手机端需要计算输入框时的断点
    WIDTH_WITHOUT_INPUT: 266,//topnav中除了输入框以外的宽度
    EXTRA_WIDTH_CAL_MIN: 720,//在需要额计算输入框宽度时，输入框宽度下限
    EXTRA_WIDTH_CAL_MAX: 850,//在需要额计算输入框宽度时，输入框宽度上限
    EXTRA_WIDTH_WITHOUT_INPUT: 548//在需要额计算输入框宽度时，除了输入框意外的宽度
};
const PAGE_SIZE = 20;
class CustomerPool extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitStateData();
    }

    getInitStateData() {
        let name = _.get(this.props.crmSearchCondition, 'name', '');
        let searchValue = name ? {name} : {};
        return {
            searchValue,
            lastId: '',
            isLoading: false,
            poolCustomerList: [],
            totalSize: 0,
            pageSize: PAGE_SIZE,
            pageNum: 1, // 当前页数
            nextPageNum: 0, //下次点击的页数
            pageNumBack: 1, //为了便于翻页，记录的上次翻页正确的页数
            customersBack: [], //为了便于翻页,记录的上次获取正确的客户列表
            errorMsg: '',
            currentId: '',
            customerId: '', //向前或者向后翻页时传的id值
            cursor: true,//向前还是向后翻页
            pageValue: 0,//两次点击时的页数差
            selectedCustomer: [],
            distributeUser: '',
            userList: [],
            showFilterList: false,
            showCustomerRulePanel: false, //显示规则设置面板
            isExtractSuccess: false,//是否提取成功
            filterInputWidth: 300,//输入框的默认宽度
        };
    }

    componentDidMount() {
        // 如果是从没有符合条件的客户点击跳转过来的,将搜索框中的关键字置为搜索的客户名称
        if(!_.isEmpty(this.props.crmSearchCondition)) {
            this.refs.searchInput.state.keyword = _.get(this.props.crmSearchCondition, 'name', '');
        }
        this.getPoolCustomer();
        this.getUserList();
        let _this = this;
        //点击客户列表某一行时打开对应的详情
        $('.customer-pool-table').delegate('td.has-filter', 'click', function(e) {
            Trace.traceEvent($(ReactDOM.findDOMNode(_this)).find('.ant-table-tbody'), '打开客户池中的客户详情');
            var $tr = $(this).closest('tr');
            var id = $tr.find('.record-id').text();
            _this.showRightPanel(id);
        });
        // 一进来就要显示筛选
        _.isFunction(this.refs.filterinput.handleToggle) && this.refs.filterinput.handleToggle();
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
        let needExtraCal = $(window).width() <= LAYOUT_CONSTANTS.EXTRA_WIDTH_CAL_MAX && $(window).width() >= LAYOUT_CONSTANTS.EXTRA_WIDTH_CAL_MIN;
        if(needExtraCal){
            let filterInputWidth = $(window).width() - LAYOUT_CONSTANTS.EXTRA_WIDTH_WITHOUT_INPUT;
            this.setState({
                filterInputWidth
            });
        } else if(needCalWidth) {
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

    // 获取销售人员
    getUserList() {
        //管理员
        if (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            getAllSalesUserList((allUserList) => {
                this.setState({userList: allUserList});
            });
        } else if (!isCommonSalesOrPersonnalVersion() && !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON)) {//销售领导获取我所在团队及下级团队的销售
            salesmanAjax.getSalesmanListAjax().sendRequest({filter_manager: true})
                .success(list => {
                    this.setState({userList: list});
                }).error((xhr) => {
                });
        }
    }

    getFilterParams() {
        let filterParams = {};
        if (this.customerPoolFilterRef) {
            let condition = _.get(this.customerPoolFilterRef, 'state.condition', {});
            _.each(condition, (val, key) => {
                if (val) {
                    //常用筛选
                    if (key === COMMON_OTHER_ITEM) {
                        //超15天未联系
                        if (val === 'fifteen_uncontact') {
                            filterParams.contact_end = moment().valueOf() - DAY_TIME.FIFTEEN_DAY;
                        } else if (val === 'thirty_uncontact') {
                            filterParams.contact_end = moment().valueOf() - DAY_TIME.THIRTY_DAY;
                        }else if(val === CUSTOMER_POOL_TYPES.FOLLOWUP) {//需联合跟进
                            filterParams.release_type = val;
                        }
                    } else {//高级筛选
                        filterParams[key] = val;
                    }
                }
            });
        }
        return filterParams;
    }

    getPoolCustomer(reset) {
        let curState = this.state;
        //当重置标志为true时，重新从第一页加载，并重置客户列表
        if (reset) {
            //清除客户的选择
            let selectedCustomer = [];
            //将分页器默认选中为第一页
            curState.pageNum = 1;
            curState.customerId = '';
            curState.pageValue = 0;
            curState.cursor = true;
            this.setState({
                pageNum: 1,
                nextPageNum: 1,
                selectedCustomer,
                customerId: '',
                cursor: true,
                pageValue: 0,
                poolCustomerList: []
            });
        }

        let queryObj = {
            page_size: curState.pageSize,
            sort_field: 'push_time',
            order: 'descend',
        };

        if(curState.customerId) {
            queryObj.sort_id = curState.customerId;
            queryObj.total_size = curState.pageSize * curState.pageValue;
            queryObj.cursor = curState.cursor;
        }

        const condition = _.extend({}, this.state.searchValue);

        //去除查询条件中值为空的项
        removeEmptyItem(condition);
        if(!_.isEmpty(condition)) {
            queryObj = {...queryObj, ...condition};
        }

        let filterParams = this.getFilterParams();
        if (!_.isEmpty(filterParams)) {
            queryObj = {...queryObj, ...filterParams};
        }

        this.setState({isLoading: true, errorMsg: ''});
        crmAjax.getPoolCustomer(queryObj).then(result => {
            let list = _.get(result, 'list', []);
            let poolCustomerList = [];
            let totalSize = _.get(result, 'total', 0);
            let pageNum = this.state.pageNum;
            let pageNumBack = this.state.pageNumBack;
            let customersBack = this.state.customersBack;
            if(list && _.isArray(list) && list.length) {
                customersBack = poolCustomerList = list;
                if(!_.isEqual(this.state.nextPageNum, 0)) {
                    pageNum = pageNumBack = this.state.nextPageNum;
                }
            }else {
                poolCustomerList = [];
                pageNum = this.state.nextPageNum;
                totalSize = 0;
            }

            this.setState({
                isLoading: false,
                totalSize,
                poolCustomerList,
                pageNum,
                pageNumBack,
                customersBack
            });
        }, (errorMsg) => {
            let pageNum = this.state.pageNum;
            if (this.state.nextPageNum !== 0) {
                pageNum = this.nextPageNum;
            }
            this.setState({isLoading: false, errorMsg, pageNum, poolCustomerList: []});
        });
    }

    //批量提取客户
    batchExtractCustomer = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.extract-btn'), '批量提取客户');
        let customerIdArray = _.map(this.state.selectedCustomer, 'id');
        this.extractCustomer(customerIdArray);
    };
    //单个提取客户
    singleExtractCustomer = (customer) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.icon-extract'), '提取单个客户');
        let customerIdArray = _.get(customer, 'id') ? [_.get(customer, 'id')] : [];
        this.extractCustomer(customerIdArray);
    };

    //提取客户的处理
    extractCustomer = (customerIds) => {
        if (this.state.isExtracting || !_.get(customerIds, 'length')) return;
        let paramObj = {
            customerIds: customerIds
        };
        if (isCommonSalesOrPersonnalVersion()) {
            paramObj.ownerId = userData.getUserData().user_id;
            if (_.get(paramObj, 'customerIds.length') > 20) {
                message.error(Intl.get('crm.customer.extract.limit.tip', '一次最多提取20个客户'));
                return;
            }
        } else {
            if (!this.state.salesMan) {
                this.setState({unSelectDataTip: Intl.get('crm.17', '请选择销售人员')});
                return;
            } else {
                if (_.get(paramObj, 'customerIds.length') > 20) {
                    this.setState({unSelectDataTip: Intl.get('crm.customer.extract.limit.tip', '一次最多提取20个客户')});
                    return;
                }
                //销售id和所属团队的id 中间是用&&连接的  格式为销售id&&所属团队的id
                let idArray = this.state.salesMan.split('&&');
                paramObj.ownerId = _.get(idArray, '[0]');
            }
        }
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.extract-btn'), '提取客户');
        this.setState({isExtracting: true});
        crmAjax.extractCustomer(paramObj).then(result => {
            let poolCustomerList = this.state.poolCustomerList;
            let customerIds = paramObj.customerIds;
            poolCustomerList = _.filter(poolCustomerList, item => !_.includes(customerIds, item.id));
            let selectedCustomer = _.filter(this.state.selectedCustomer, customer => !_.includes(customerIds, customer.id));
            let totalSize = this.state.totalSize - _.get(customerIds, 'length', 0);
            this.setState({
                isExtracting: false,
                salesMan: '',
                poolCustomerList,
                customersBack: poolCustomerList,
                selectedCustomer,
                totalSize,
                isExtractSuccess: true
            });
            message.success(Intl.get('clue.extract.success', '提取成功'));
            //隐藏批量提取面板
            this.batchExtractRef && this.batchExtractRef.handleCancel();
            // 当前页展示的客户全部释放完后，需要重新获取数据
            if (!poolCustomerList.length) {
                this.getPoolCustomer(true);
            }
        }, (errorMsg) => {
            this.setState({isExtracting: false, salesMan: ''});
            message.error(errorMsg);
        });
    };

    showRuleRightPanel = () => {
        this.setState({ showCustomerRulePanel: true });
    };

    hideRuleRightPanel = () => {
        this.setState({ showCustomerRulePanel: false });
    };

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
        $('.customer-pool-table .ant-table-row').removeClass('current-row');
    };
    renderCustomerDetail = () => {
        //触发打开带拨打电话状态的客户详情面板
        if (this.state.currentId) {
            let curCustomer = _.find(this.state.poolCustomerList, item => item.id === this.state.currentId);
            if (curCustomer) {
                //如果是需联合跟进的，需要使用customer_id字段
                if(_.isEqual(_.get(curCustomer, 'customerpool_tags[0]'), CUSTOMER_POOL_TYPES.FOLLOWUP)) {
                    curCustomer.id = _.get(curCustomer,'customer_id', curCustomer.id);
                }
                phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                    customer_params: {
                        curCustomer: {...curCustomer, customer_type: CRM_VIEW_TYPES.CRM_POOL},
                        hideRightPanel: this.colseRightPanel,
                        disableEdit: true,//是否是客户回收站中打开的客户详情(禁止编辑、添加客户信息)
                        hideContactWay: true,//客户池中打开的客户详情，不展示联系方式
                    }
                });
            }
        }
    };
    //返回客户列表
    returnCustomerList = (e) => {
        Trace.traceEvent(e, '点击返回按钮回到客户列表页面');
        if (_.isFunction(this.props.closeCustomerPool)) {
            this.props.closeCustomerPool(this.state.isExtractSuccess);
        }
    };

    onSearchInputChange = (keyword, selectedField) => {
        this.setState({searchValue: this.refs.searchInput.state.formData}, () => {
            this.getPoolCustomer(true);
        });
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
                    var tagsArray = _.isArray(record.customerpool_tags) ? record.customerpool_tags : [];
                    var tags = null;
                    if(_.get(tagsArray,'[0]') === CUSTOMER_POOL_TYPES.FOLLOWUP) {
                        tags = <Tag>{Intl.get('crm.pool.need.joint.followup', '需联合跟进')}</Tag>;
                    }
                    return (
                        <span>
                            <span>{text}</span>
                            <span className="hidden record-id">{record.id}</span>
                            {tags ?
                                <div className="customer-list-tags">
                                    {tags}
                                </div>
                                : null}
                        </span>);
                }
            }, {
                title: Intl.get('weekly.report.customer.stage', '客户阶段'),
                width: column_width,
                dataIndex: 'customer_label',
                className: 'has-filter',
                render: (text, record, index) => {
                    return (
                        <span>
                            <CustomerLabel label={record.customer_label}/>
                        </span>);
                }
            }, {
                title: Intl.get('crm.customer.label', '客户标签'),
                width: 130,
                dataIndex: 'labels',
                className: 'has-filter',
                render: (text, record, index) => {
                    var tagsArray = _.isArray(record.labels) ? record.labels : [];
                    //线索、转出、需联合跟进、已回访标签不可操作的标签，在immutable_labels属性中，和普通标签一起展示
                    if (_.isArray(record.immutable_labels) && record.immutable_labels.length) {
                        tagsArray = record.immutable_labels.concat(tagsArray);
                    }
                    var tags = tagsArray.map(function(tag, index) {
                        return (<Tag key={index}>{tag}</Tag>);
                    });

                    return (
                        <span>
                            <CustomerLabel label={record.qualify_label}/>
                            {tags.length ?
                                <div className="customer-list-tags">
                                    {tags}
                                </div>
                                : null}
                        </span>);
                }
            }, {
                title: Intl.get('user.login.score', '分数'),
                width: 50,
                dataIndex: 'score',
                className: 'has-filter'
            }, {
                title: Intl.get('crm.customer.extract.time', '释放时间'),
                width: 100,
                dataIndex: 'push_time',
                className: 'has-filter',
            }
        ];

        //没有获取用户列表的权限，或者不是销售或者管理员时不展示分数
        if(!hasPrivilege(crmPrivilegeConst.APP_USER_QUERY) || !(hasPrivilege(crmPrivilegeConst.CRM_LIST_CUSTOMERS) || hasPrivilege(crmPrivilegeConst.CUSTOMER_ALL))){
            columns = _.filter(columns, column => column.title !== Intl.get('user.login.score', '分数'));
        }

        //只要不是运营人员都可以提取
        if (!userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON)) {
            columns.push({
                title: Intl.get('common.operate', '操作'),
                width: 40,
                render: (text, record, index) => {
                    return isCommonSalesOrPersonnalVersion() ? (
                        <Popconfirm
                            placement="left"
                            title={Intl.get('crm.pool.single.extract.tip', '您确定要提取此客户吗？')}
                            onConfirm={this.singleExtractCustomer.bind(this, record)}
                        >
                            {extractIcon}
                        </Popconfirm>
                    ) : (<AntcDropdown
                        datatraceContainer='客户池提取客户并分配负责人'
                        content={extractIcon}
                        overlayTitle={Intl.get('crm.pool.extract.distribute', '提取并分配负责人')}
                        okTitle={Intl.get('common.confirm', '确认')}
                        cancelTitle={Intl.get('common.cancel', '取消')}
                        isSaving={this.state.isExtracting}
                        overlayContent={this.renderSalesBlock()}
                        handleSubmit={this.singleExtractCustomer.bind(this, record)}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectData={this.clearSelectSales}
                        btnAtTop={false}/>);
                }
            });
        }
        return columns;
    }

    getTableData() {
        let tableData = _.map(this.state.poolCustomerList, item => {
            let push_time = item.push_time ? moment(item.push_time).format(oplateConsts.DATE_FORMAT) : '';
            return {...item, push_time};
        });
        return tableData;
    }

    rowKey(record, index) {
        return record.id;
    }

    //处理选中行的样式
    handleRowClassName = (record, index) => {
        if ((record.id === this.state.currentId)) {
            return 'current-row';
        }
        else {
            return '';
        }
    };

    onPageChange = (page) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.antc-table .ant-table-wrapper'), '翻页至第' + page + '页');
        let currPageNum = this.state.pageNumBack;
        var curCustomerList = this.state.customersBack;
        if (page === currPageNum) {
            return;
        } else {
            let selectedCustomer = this.state.selectedCustomer;
            //清空翻页前选择的客户
            if (_.isArray(selectedCustomer) && selectedCustomer.length) {
                this.setState({ selectedCustomer: [] });
            }
            var pageValue = 0, cursor = true, customerId = '';
            if (page > currPageNum) {
                //向后翻页
                pageValue = page - currPageNum;
                customerId = _.last(curCustomerList).id;
            } else {
                //向前翻页
                if (page !== '1') {
                    pageValue = currPageNum - page;
                    cursor = false;
                    customerId = _.first(curCustomerList).id;
                }
            }
            //设置要跳转到的页码数值
            this.setState({
                nextPageNum: page,
                pageValue,
                cursor,
                customerId
            }, () => {
                this.search();
            });
        }
    };

    renderTableContent(tableWrapHeight) {
        //初次获取数据时展示loading效果
        if (this.state.isLoading && !_.get(this.state, 'poolCustomerList[0]')) {
            return (<Spinner />);
        } else if (_.get(this.state, 'poolCustomerList[0]')) {
            let rowSelection = userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) ? null : {
                type: 'checkbox',
                selectedRowKeys: _.map(this.state.selectedCustomer, 'id'),
                onSelect: (record, selected, selectedRows) => {
                    this.setState({selectedCustomer: selectedRows});
                    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中某个客户');
                },
                //对客户列表当前页进行全选或取消全选操作时触发
                onSelectAll: (selected, selectedRows, changeRows) => {
                    this.setState({selectedCustomer: selectedRows});
                    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中全部客户');
                }
            };
            return (
                <div>
                    <AntcTable
                        rowKey={this.rowKey}
                        rowSelection={rowSelection}
                        rowClassName={this.handleRowClassName}
                        columns={this.getColumns()}
                        loading={this.state.isLoading}
                        dataSource={this.getTableData()}
                        util={{zoomInSortArea: true}}
                        scroll={{y: tableWrapHeight}}
                        pagination={{
                            total: this.state.totalSize,
                            showTotal: total => {
                                return Intl.get('crm.207', '共{count}个客户', { count: total });
                            },
                            pageSize: this.state.pageSize,
                            onChange: this.onPageChange,
                            current: this.state.pageNum
                        }}
                    />
                </div>);
        } else {
            let noDataTip = Intl.get('contract.60', '暂无客户');
            if (this.state.errorMsg) {
                noDataTip = this.state.errorMsg;
            } else if (this.state.searchValue) {
                noDataTip = Intl.get('common.no.filter.crm', '没有符合条件的客户');
            }
            return (
                <NoDataIntro noDataTip={noDataTip}/>);
        }
    }

    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        this.setState({salesMan});
    };

    clearSelectSales = () => {
        this.setState({salesMan: ''});
    };
    renderSalesBlock = () => {
        let dataList = formatSalesmanList(this.state.userList);
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={this.state.salesMan}
                    onChange={this.onSalesmanChange}
                    getSelectContent={this.setSelectContent}
                    notFoundContent={dataList.length ? Intl.get('crm.29', '暂无销售') : Intl.get('crm.30', '无相关销售')}
                    dataList={dataList}
                />
            </div>
        );
    };
    toggleList = () => {
        this.setState({
            showFilterList: !this.state.showFilterList
        });
    };
    search = (reset) => {
        this.getPoolCustomer(reset);
    };

    //渲染选择客户数的提示
    renderSelectCustomerTips = () => {
        //只选择了当前页时，展示：已选当前页xxx项, <a>选择全部xxx项</a>
        return (
            <span>
                {Intl.get('crm.11', '已选当前页{count}项', { count: this.state.selectedCustomer.length })}
                （{Intl.get('crm.customer.pool.max.selected.num', '每次最多提取{num}个',{num: 20})}）
            </span>
        );
    };

    //渲染批量提取的按钮
    renderBatchExtractBtn(selectCustomerLength) {
        let {isWebMin} = isResponsiveDisplay();
        let extractCls = classNames('btn-item extract-btn', {
            'responsive-mini-btn': isWebMin
        });
        //运营人员不提取
        if (userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON)) {
            return null;
        } else {//销售、管理员
            const batchExtractBtn = (
                <Button title={Intl.get('clue.extract', '提取')} className={extractCls} disabled={!selectCustomerLength}>
                    {isWebMin ? <i className="iconfont icon-extract"></i> :
                        <React.Fragment>
                            <i className="iconfont icon-extract"></i>
                            {Intl.get('clue.extract', '提取')}
                        </React.Fragment>
                    }
                </Button>);
            //选择客户后可以进行批量提取
            if (selectCustomerLength) {
                //普通销售或者个人版，可以直接将客户提取到自己身上
                if (isCommonSalesOrPersonnalVersion()) {
                    return (<Popconfirm
                        title={Intl.get('crm.pool.batch.extract.tip', '您确定要提取选中的客户吗？')}
                        onConfirm={this.batchExtractCustomer}
                    >
                        {batchExtractBtn}
                    </Popconfirm>);
                } else {//销售领导、管理员提取需要分配客户的负责人
                    return (<AntcDropdown
                        datatraceContainer='客户池提取并分配负责人'
                        ref={batchExtract => this.batchExtractRef = batchExtract}
                        content={batchExtractBtn}
                        overlayTitle={Intl.get('crm.pool.extract.distribute', '提取并分配负责人')}
                        okTitle={Intl.get('common.confirm', '确认')}
                        cancelTitle={Intl.get('common.cancel', '取消')}
                        isSaving={this.state.isExtracting}
                        overlayContent={this.renderSalesBlock()}
                        handleSubmit={this.batchExtractCustomer}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectData={this.clearSelectSales}
                        btnAtTop={false}/>);
                }
            } else {//未选客户时，批量提取按钮不可用，点击后提示先选择客户
                const clickTip = (
                    <ReactIntl.FormattedMessage
                        id='crm.pool.select.customer.tip'
                        defaultMessage={'请点击列表中的{icon}选择客户'}
                        values={{'icon': <i className='table-select-icon'/>}}
                    />
                );
                return (
                    <Popover placement="left" content={clickTip} title={null} overlayClassName="batch-extract-popover">
                        {batchExtractBtn}
                    </Popover>);
            }
        }
    }

    render() {
        let tableWrapHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        let selectCustomerLength = _.get(this.state.selectedCustomer, 'length');
        // 没有在加载，并且有错误信息或者（在翻页时没有数据）
        let showRefresh = !this.state.isLoading && (this.state.errorMsg || (!_.get(this.state.poolCustomerList,'[0]') && !_.isEqual(this.state.pageValue, 0)));
        const searchFields = [
            {
                name: Intl.get('crm.41', '客户名'),
                field: 'name'
            },
            {
                name: Intl.get('common.phone', '电话'),
                field: 'phone'
            },
        ];
        let {isWebMin} = isResponsiveDisplay();
        let regulateCls = classNames('btn-item extract-btn',{
            'responsive-mini-btn': isWebMin
        });
        return (
            <div className="customer-pool" data-tracename="客户池列表">
                <TopNav>
                    <BackMainPage className="customer-back-btn" 
                        handleBackClick={this.returnCustomerList}></BackMainPage>
                    <div className="search-input-wrapper">
                        <FilterInput
                            ref="filterinput"
                            showSelectChangeTip={selectCustomerLength}
                            toggleList={this.toggleList.bind(this)}
                            filterType={Intl.get('call.record.customer', '客户')}
                            showList={this.state.showFilterList}
                        />
                    </div>
                    <div className="customer-search-block" style={{display: selectCustomerLength ? 'none' : 'block', width: this.state.filterInputWidth}}>
                        <SearchInput
                            ref="searchInput"
                            className="btn-item"
                            type="select"
                            searchFields={searchFields}
                            searchPlaceHolder={Intl.get('customer.search.by.customer.name', '请输入客户名称搜索')}
                            searchEvent={this.onSearchInputChange}
                        />
                    </div>
                    {showRefresh ? (
                        <Button
                            className="btn-item refresh-btn"
                            type='primary'
                            onClick={this.search.bind(this, !this.state.errorMsg)}
                            disabled={this.state.isLoading}
                        >{Intl.get('common.refresh', '刷新')}</Button>
                    ) : null}
                    {userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) ? (
                        <Button
                            className={regulateCls}
                            title={Intl.get('crm.customer.rule.name', '规则设置')}
                            onClick={this.showRuleRightPanel}>
                            {isWebMin ? <i className="iconfont icon-configuration"></i> :
                                <React.Fragment>
                                    <i className="iconfont icon-configuration"></i>
                                    {Intl.get('crm.customer.rule.name', '规则设置')}
                                </React.Fragment>
                            }
                        </Button>
                    ) : null}
                    {this.renderBatchExtractBtn(selectCustomerLength)}
                    {selectCustomerLength ? (
                        <div className="customerpool-list-selected-tip">
                            <span className="iconfont icon-sys-notice" />
                            {this.renderSelectCustomerTips()}
                        </div>
                    ) : null}
                </TopNav>
                <div className="customer-table-container customer-pool-table"
                    style={{height: tableWrapHeight}}>
                    <div
                        className={this.state.showFilterList ? 'filter-container' : 'filter-container filter-close'}>
                        <CustomerPoolFilter
                            ref={filterRef => this.customerPoolFilterRef = filterRef}
                            search={this.search.bind(this, true)}
                            showSelectTip={selectCustomerLength}
                            style={{width: 300, height: tableWrapHeight}}
                            toggleList={this.toggleList.bind(this)}
                        />
                    </div>
                    <div
                        className={classNames('customer-pool-table-wrap', {'filter-panel-show': this.state.showFilterList})}>
                        {this.renderTableContent(tableWrapHeight)}
                    </div>
                </div>
                {
                    this.state.showCustomerRulePanel ? (
                        <CustomerPoolRule
                            closeRightPanel={this.hideRuleRightPanel}
                        />
                    ) : null
                }
            </div>);
    }
}
CustomerPool.propTypes = {
    closeCustomerPool: PropTypes.func,
    crmSearchCondition: PropTypes.object,
};

export default CustomerPool;