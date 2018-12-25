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
import ShearContent from 'CMP_DIR/shear-content';
const PRIVILEGES = {
    MANAGER_CUSTOMER_BAK_AUTH: 'CRM_MANAGER_GET_CUSTOMER_BAK_OPERATOR_RECORD'//管理员获取回收站中客户列表的权限
};
//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_NAV_HEIGHT: 64,//头部导航区高度
    TOTAL_HEIGHT: 40,//总数的高度
    TH_HEIGHT: 50//表头的高度
};
const PAGE_SIZE = 20;
class CustomerRecycleBin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: false,//正在加载客户列表
            customerList: [],//回收站中的客户列表
            totalSize: 0,//回收站中，客户总数
            lastId: '',//用于下拉加载的id
            errorMsg: '',//获取客户列表错误信息
            listenScrollBottom: true,//是否监听下拉加载

        };
    }

    componentDidMount() {
        this.getRecycleBinCustomers();
    }

    getRecycleBinCustomers() {
        let url = '/rest/customer/recycle_bin/:type';
        let type = 'user';
        if (hasPrivilege(PRIVILEGES.MANAGER_CUSTOMER_BAK_AUTH)) {
            type = 'manager';
        }
        url.replace(':type', type);
        if (this.state.lastId) {
            url = `${url}?id=${this.state.lastId}`;
        }
        $.ajax({
            url: url,
            type: 'get',
            dateType: 'json',
            // data: {},
            success: (data) => {
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

            },
            error: (errorMsg) => {
                this.setState({
                    errorMsg: errorMsg || Intl.get('failed.get.crm.list', '获取客户列表失败'),
                    isLoading: false
                });
            }
        });
    }

    //返回客户列表
    returnCustomerList = (e) => {
        Trace.traceEvent(e, '点击返回按钮回到客户列表页面');
        // this.props.closeRepeatCustomer();
        //重置获取数据页数，保证下次进来获取第一页数据时界面的刷新
        // CustomerRepeatAction.resetPage();
        // CustomerRepeatAction.setSelectedCustomer([]);
    };
    handleScrollBottom = () => {
        this.getRecycleBinCustomers();
    }
    showNoMoreDataTip = () => {
        return !this.state.isLoading && !this.state.errorMsg &&
            this.state.customerList.length >= PAGE_SIZE && !this.state.listenScrollBottom;
    }
    //恢复客户
    recoveryCustomer = (customer) => {

    }

    getColumns() {
        const column_width = '80px';
        let columns = [
            {
                title: Intl.get('crm.4', '客户名称'),
                width: '240px',
                dataIndex: 'name',
                sorter: true
            },
            {
                title: Intl.get('call.record.contacts', '联系人'),
                width: column_width,
                dataIndex: 'contact',
            },
            {
                title: Intl.get('crm.5', '联系方式'),
                width: '130px',
                dataIndex: 'contact_way',
                className: 'column-contact-way',
                render: (text, record, index) => {
                    let phoneArray = text && text.split('\n') || [];
                    return phoneArray.map((item) => {
                        if (item) {
                            return (
                                <div>
                                    <span>{item}</span>
                                </div>
                            );
                        }
                    });
                }
            }, {
                title: Intl.get('user.apply.detail.order', '订单'),
                width: column_width,
                dataIndex: 'order',
                className: 'has-filter'
            }, {
                title: Intl.get('crm.6', '负责人'),
                width: column_width,
                dataIndex: 'user_name',
                sorter: true,
                className: 'has-filter'
            }, {
                title: Intl.get('crm.last.contact', '最后联系'),
                width: '240px',
                dataIndex: 'last_contact_time',
                sorter: true,
                className: 'has-filter',
                render: function(text, record, index) {
                    //最后联系时间和跟进记录的合并
                    let time = record.last_contact_time || '';
                    let last_contact = record.trace || '';
                    return (
                        <span>
                            <div className="last-contact-time">{time}</div>
                            <span title={last_contact} className="comments-fix">
                                <ShearContent>
                                    {last_contact}
                                </ShearContent>
                            </span>
                        </span>
                    );
                }
            }, {
                title: Intl.get('user.login.score', '分数'),
                width: 60,
                dataIndex: 'score',
                align: 'right',
                sorter: true,
                className: 'has-filter'
            }, {
                title: Intl.get('member.create.time', '创建时间'),
                width: '100px',
                dataIndex: 'start_time',
                sorter: true,
                className: 'has-filter table-data-align-right'
            }, {
                title: Intl.get('crm.customer.delete.time', '删除时间'),
                width: '240px',
                dataIndex: 'time',
                sorter: true
            }, {
                title: Intl.get('user.operator', '操作人'),
                width: '240px',
                dataIndex: 'operator_name',
                sorter: true
            }, {
                title: Intl.get('common.operate', '操作'),
                width: 50,
                render: (text, record, index) => {
                    return (
                        <span className="iconfont icon-recovery"
                            data-tracename="恢复客户"
                            title={Intl.get('crm.customer.recovery', '恢复')}
                            onClick={this.recoveryCustomer.bind(this, record)}
                        />
                    );
                }
            }
        ];
        if (!hasPrivilege('CRM_CUSTOMER_SCORE_RECORD')) {
            columns = _.filter(columns, column => column.title !== Intl.get('user.login.score', '分数'));
        }
        //只对域管理员开放删除功能
        if (!userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            columns = _.filter(columns, column => column.title !== Intl.get('common.operate', '操作'));
        }
        return colums;
    }

    renderTableContent() {
        //初次获取数据时展示loading效果
        if (this.state.isLoading && !_.get(this.state, 'lastId')) {
            return (<Spinner />);
        } else if (_.get(this.state, 'customerList[0]')) {
            let tableHeight = $('body').height() - LAYOUT_CONSTANTS.TOP_NAV_HEIGHT - LAYOUT_CONSTANTS.TOTAL_HEIGHT;
            return (
                <div className="customer-table-container" style={{height: tableHeight}} data-tracename="回收站客户列表">
                    <AntcTable
                        rowKey={this.rowKey}
                        rowClassName={this.handleRowClassName}
                        columns={this.getColumns()}
                        loading={this.state.isLoading}
                        dataSource={this.state.customerList}
                        util={{zoomInSortArea: true}}
                        onChange={this.onTableChange}
                        pagination={false}
                        scroll={{y: tableHeight - LAYOUT_CONSTANTS.TH_HEIGHT}}
                        dropLoad={{
                            listenScrollBottom: this.state.listenScrollBottom,
                            handleScrollBottom: this.handleScrollBottom,
                            loading: this.state.isLoading,
                            showNoMoreDataTip: this.showNoMoreDataTip(),
                            noMoreDataText: Intl.get('deal.no.more.tip', '没有更多订单了')
                        }}
                    />
                    {this.state.totalSize ?
                        <div className="summary_info">
                            <ReactIntl.FormattedMessage
                                id='crm.207'
                                defaultMessage={'共{count}个客户'}
                                values={{
                                    'count': this.state.totalSize
                                }}
                            />
                        </div> : null
                    }
                </div>);
        } else {
            let noDataTip = Intl.get('contract.60', '暂无客户');
            if (this.state.errorMsg) {
                noDataTip = this.state.errorMsg;
            } else if (this.state.searchObj.value) {
                noDataTip = Intl.get('common.no.filter.crm', '没有符合条件的客户');
            }
            return (
                <NoDataIntro noDataTip={noDataTip}/>);
        }
    }

    render() {
        return (
            <div className="customer-recycle-bin" data-tracename="客户回收站">
                <TopNav>
                    <div className="return-btn-container" onClick={this.returnCustomerList}>
                        <span className="iconfont icon-return-btn"/>
                        <span className="return-btn-font">{Intl.get('crm.52', '返回')}</span>
                    </div>
                </TopNav>
                {this.renderTableContent()}
            </div>
        );
    }
}

CustomerRecycleBin.prototype = {};

export default CustomerRecycleBin;