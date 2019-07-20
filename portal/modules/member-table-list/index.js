/**
 * Created by hzl on 2019/7/15.
 */

require('./index.less');
import {AntcTable} from 'antc';
import classNames from 'classnames';

const noop = function() {
};

class MemberTableList extends React.Component {
    constructor(props) {
        super(props);
    }

    memberStatusClass = (status) => {
        return classNames({'member-status': status === 0});
    };

    getTableColumns = () => {
        let isHideTableTitle = this.props.isHideTableTitle;
        return [{
            title: isHideTableTitle ? null : Intl.get('member.member', '成员'),
            dataIndex: 'name',
            key: 'name',
            width: '40%',
            render: (name, record) => {
                let status = record.status;
                let memberNameCls = classNames('member-name', this.memberStatusClass(status));
                let role = record.role;
                let iconClass = classNames('iconfont', {
                    'icon-team-role': role === 'owner',
                    'icon-sale-team-manager': role === 'manager',
                    'sale-status-stop': record.status === 0
                });
                return (
                    <div className={memberNameCls}>
                        <div className='account'>
                            {
                                role ? (<i className={iconClass}/>) : null
                            }
                            <span> {record.name}</span>
                            {
                                status === 0 ? (
                                    <span className='member-stop-status'>{Intl.get('user.status.stopped', '已停用')}</span>
                                ) : null
                            }
                        </div>
                        <div className='nickname'>{record.userName}</div>
                    </div>
                );
            }
        }, {
            title: isHideTableTitle ? null : Intl.get('crm.113', '部门'),
            dataIndex: 'teamName',
            key: 'teamName',
            width: '20%',
            render: (teamName, record) => {
                let teamCls = this.memberStatusClass(record.status);
                return (
                    <div className={teamCls}>
                        {teamName}
                    </div>
                );
            }
        }, {
            title: isHideTableTitle ? null : Intl.get('member.position', '职务'),
            dataIndex: 'positionName',
            key: 'positionName',
            width: '20%',
            render: (positionName, record) => {
                let positionCls = this.memberStatusClass(record.status);
                return (
                    <div className={positionCls}>
                        {positionName}
                    </div>
                );
            }
        }, {
            title: isHideTableTitle ? null : Intl.get('member.phone', '手机'),
            dataIndex: 'phone',
            key: 'phone',
            width: '30%',
            render: (phone, record) => {
                let phoneCls = this.memberStatusClass(record.status);
                return (
                    <div className={phoneCls}>
                        {phone}
                    </div>
                );
            }
        }];
    };

    handleRowClick = (record, index) => {
        this.props.handleRowClick(record, index);
    };

    handleRowClassName = (record, index) => {
        if (index === this.props.selectedRowIndex && this.props.isShowMemberDetail) {
            return 'current-row';
        }
        else {
            return '';
        }
    };

    render = () => {
        const columns = this.getTableColumns();
        const dataSource = this.props.dataSource;
        const tableHeight = this.props.tableHeight;
        return (
            <div
                className="common-member-list-table-wrap scroll-load"
                style={{ display: this.props.doNotShow ? 'none' : 'block' }}
            >
                <div style={{ height: tableHeight }} ref="tableWrap">
                    <AntcTable
                        rowSelection={this.props.rowSelection}
                        dropLoad={this.props.dropLoad}
                        dataSource={dataSource}
                        onRowClick={this.handleRowClick}
                        rowClassName={this.handleRowClassName}
                        util={{zoomInSortArea: true}}
                        pagination={false}
                        columns={columns}
                        locale={{ emptyText: Intl.get('common.no.member', '暂无成员') }}
                        scroll={{ y: tableHeight }}
                    />
                </div>
            </div>
        );
    };
}

MemberTableList.defaultProps = {
    dataSource: [],
    doNotShow: false,
    tableHeight: 0,
    dropLoad: {},
    rowSelection: null,
    handleRowClick: noop,
    isHideTableTitle: false, // 是否隐藏table表格的标题，默认不隐藏
    isShowMemberDetail: false,
    selectedRowIndex: -1
};

MemberTableList.propTypes = {
    dataSource: PropTypes.array,
    doNotShow: PropTypes.bool,
    tableHeight: PropTypes.number,
    rowSelection: PropTypes.object,
    handleRowClick: PropTypes.func,
    dropLoad: PropTypes.object,
    isHideTableTitle: PropTypes.bool,
    isShowMemberDetail: PropTypes.bool,
    selectedRowIndex: PropTypes.number,
};

export default MemberTableList;