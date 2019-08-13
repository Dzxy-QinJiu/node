/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2019/8/10.
 */
import '../css/customer-pool.less';
import TopNav from'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import Trace from 'LIB_DIR/trace';
import {AntcTable} from 'antc';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import {SearchInput} from 'antc';
import {message, Popconfirm, Icon, Tag, Button} from 'antd';
import BottomTotalCount from 'CMP_DIR/bottom-total-count';
import crmAjax from '../ajax/index';
import {getTableContainerHeight} from 'PUB_DIR/sources/utils/common-method-util';
import crmUtil from '../utils/crm-util';
import userData from 'PUB_DIR/sources/user-data';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import {formatSalesmanList} from 'PUB_DIR/sources/utils/common-method-util';
import {getAllSalesUserList} from 'PUB_DIR/sources/utils/common-data-util';
import salesmanAjax from 'MOD_DIR/common/public/ajax/salesman';
const PAGE_SIZE = 20;
class CustomerPool extends React.Component {
    constructor(props) {
        super(props);
        this.state = this.getInitStateData();
    }

    getInitStateData() {
        return {
            searchValue: '',
            lastId: '',
            isLoading: false,
            poolCustomerList: [],
            totalSize: 0,
            errorMsg: '',
            currentId: '',
            selectedCustomer: [],
            distributeUser: '',
            userList: [],
        };
    }

    componentDidMount() {
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
    }

    componentWillUnmount() {
        this.setState(this.getInitStateData());
    }

    // 获取销售人员
    getUserList() {
        //管理员
        if (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            getAllSalesUserList((allUserList) => {
                this.setState({userList: allUserList});
            });
        } else if (!userData.getUserData().isCommonSales && !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON)) {//销售领导获取我所在团队及下级团队的销售
            salesmanAjax.getSalesmanListAjax().sendRequest({filter_manager: true})
                .success(list => {
                    this.setState({userList: list});
                }).error((xhr) => {
                });
        }
    }

    getPoolCustomer() {
        let queryObj = {
            page_size: PAGE_SIZE,
            sort_field: 'push_time',
            order: 'descend'
        };
        if (this.state.lastId) {
            queryObj.sort_id = this.state.lastId;
        }
        if (this.state.searchValue) {
            queryObj.name = this.state.searchValue;
        }
        this.setState({isLoading: true, loadErrorMsg: ''});
        crmAjax.getPoolCustomer(queryObj).then(result => {
            let list = _.get(result, 'list', []);
            let customerList = this.state.poolCustomerList;
            let totalSize = _.get(result, 'total', 0);
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
                poolCustomerList: customerList,
                listenScrollBottom,
                lastId: _.get(customerList, `[${customerList.length - 1}].id`, '')
            });
        }, (errorMsg) => {
            this.setState({isLoading: false, errorMsg});
        });
    }

    extractCustomer = () => {
        if (this.state.isExtracting) return;
        let paramObj = {
            customerIds: _.map(this.state.selectedCustomer, 'id')
        };
        if (userData.getUserData().isCommonSales) {
            paramObj.ownerId = userData.getUserData().user_id;
            if(_.get(paramObj, 'customerIds.length') > 20){
                message.error(Intl.get('crm.customer.extract.limit.tip', '一次最多提取20个客户'));
                return;
            }
        } else {
            if (!this.state.salesMan) {
                this.setState({unSelectDataTip: Intl.get('crm.17', '请选择销售人员')});
                return;
            } else {
                if(_.get(paramObj, 'customerIds.length') > 20){
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
            let customerIds = _.map(this.state.selectedCustomer, 'id');
            poolCustomerList = _.filter(poolCustomerList, item => !_.includes(customerIds, item.id));
            let totalSize = this.state.totalSize - _.get(customerIds, 'length', 0);
            this.setState({isExtracting: false, salesMan: '', poolCustomerList, totalSize});
            message.success(Intl.get('clue.extract.success', '提取成功'));
            if (poolCustomerList.length < 20) {
                this.getPoolCustomer();
            }
        }, (errorMsg) => {
            this.setState({isExtracting: false, salesMan: ''});
            message.error(errorMsg);
        });
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
                phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
                    customer_params: {
                        currentId: this.state.currentId,
                        curCustomer: curCustomer,
                        hideRightPanel: this.colseRightPanel,
                        disableEdit: true,//是否是客户回收站中打开的客户详情(禁止编辑、添加客户信息)
                    }
                });
            }
        }
    };
    //返回客户列表
    returnCustomerList = (e) => {
        Trace.traceEvent(e, '点击返回按钮回到客户列表页面');
        if (_.isFunction(this.props.closeCustomerPool)) {
            this.props.closeCustomerPool();
        }
    };

    onSearchInputChange = (keyword) => {
        let searchValue = _.trim(keyword);
        if (searchValue !== this.state.searchValue) {
            this.setState({searchValue: searchValue, lastId: ''}, () => {
                this.getPoolCustomer();
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
                            <span className="hidden record-id">{record.id}</span>
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
                            {record.customer_label ? (
                                <Tag
                                    className={crmUtil.getCrmLabelCls(record.customer_label)}>
                                    {record.customer_label}</Tag>) : null
                            }
                        </span>);
                }
            }, {
                title: Intl.get('crm.customer.label', '客户标签'),
                width: 130,
                dataIndex: 'labels',
                className: 'has-filter',
                render: (text, record, index) => {
                    var tagsArray = _.isArray(record.labels) ? record.labels : [];
                    //线索、转出、已回访标签不可操作的标签，在immutable_labels属性中，和普通标签一起展示
                    if (_.isArray(record.immutable_labels) && record.immutable_labels.length) {
                        tagsArray = record.immutable_labels.concat(tagsArray);
                    }
                    var tags = tagsArray.map(function(tag, index) {
                        return (<Tag key={index}>{tag}</Tag>);
                    });

                    return (
                        <span>
                            {record.qualify_label ? (
                                <Tag className={crmUtil.getCrmLabelCls(record.qualify_label)}>
                                    {record.qualify_label === 1 ? crmUtil.CUSTOMER_TAGS.QUALIFIED :
                                        record.qualify_label === 2 ? crmUtil.CUSTOMER_TAGS.HISTORY_QUALIFIED : ''}</Tag>) : null
                            }
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

    handleScrollBottom = () => {
        if (this.state.isLoading) return;
        this.getPoolCustomer();
    }
    showNoMoreDataTip = () => {
        return !this.state.isLoading && !this.state.errorMsg &&
            this.state.poolCustomerList.length >= PAGE_SIZE && !this.state.listenScrollBottom;
    }

    renderTableContent() {
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
                        // onChange={this.onTableChange}
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

    render() {
        return (
            <div className="customer-pool" data-tracename="客户池列表">
                <TopNav>
                    <div className="return-btn-container" onClick={this.returnCustomerList}>
                        <span className="iconfont icon-return-btn"/>
                        <span className="return-btn-font">{Intl.get('crm.52', '返回')}</span>
                    </div>
                    <div className="customer-search-block">
                        <SearchInput
                            className="btn-item"
                            type="input"
                            searchPlaceHolder={Intl.get('customer.search.by.customer.name', '请输入客户名称搜索')}
                            searchEvent={this.onSearchInputChange}
                        />
                    </div>
                    {userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) || !_.get(this.state, 'selectedCustomer.length') ? null :
                        userData.getUserData().isCommonSales ? (
                            <Button className="btn-item extract-btn"
                                onClick={this.extractCustomer}>{Intl.get('clue.extract', '提取')}</Button>
                        ) : (<AntcDropdown
                            content={<Button className="btn-item extract-btn">{Intl.get('clue.extract', '提取')}</Button>}
                            overlayTitle={Intl.get('user.salesman', '销售人员')}
                            okTitle={Intl.get('common.confirm', '确认')}
                            cancelTitle={Intl.get('common.cancel', '取消')}
                            isSaving={this.state.isExtracting}
                            overlayContent={this.renderSalesBlock()}
                            handleSubmit={this.extractCustomer}
                            unSelectDataTip={this.state.unSelectDataTip}
                            clearSelectData={this.clearSelectSales}
                            btnAtTop={false}/>)}
                </TopNav>
                <div className="customer-table-container customer-pool-table"
                    style={{height: getTableContainerHeight()}}>
                    {this.renderTableContent()}
                </div>
            </div>);
    }
}
CustomerPool.propTypes = {
    closeCustomerPool: PropTypes.func,
};

export default CustomerPool;