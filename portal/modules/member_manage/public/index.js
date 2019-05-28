require('./css/index.less');
import {SearchInput, AntcTable} from 'antc';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import MemberManageStore from './store';
import MemberManageAction from './action';
import MemberFormAction from './action/member-form-actions';
import MemberForm from './view/member-form';
import MemberInfo from './view/member-info';
import {memberStatusList} from 'PUB_DIR/sources/utils/consts';
import {Icon, Button, Tabs} from 'antd';
const TabPane = Tabs.TabPane;
import Trace from 'LIB_DIR/trace';
import PositionManage from './view/sales-role-manage';
import DepartmentManage from '../../sales_team/public';
import {getOrganization} from 'PUB_DIR/sources/utils/common-method-util';

let openTimeout = null;//打开面板时的时间延迟设置
let focusTimeout = null;//focus事件的时间延迟设置
const TAB_KEYS = {
    DEPARTMENT_TAB: '1',//部门
    POSITION_TAB: '2'// 职务
};

//用于布局的高度
const LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 120,
    BOTTOM_DISTANCE: 40
};

class MemberManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: TAB_KEYS.DEPARTMENT_TAB,
            ...MemberManageStore.getState(),
        };
    }

    onChange = () => {
        this.setState(MemberManageStore.getState());
    };

    componentDidMount = () => {
        $('body').css('overflow', 'hidden');
        MemberManageStore.listen(this.onChange);
        this.getMemberList(); // 获取成员列表
    };

    getMemberList = (queryParams) => {
        let queryObj = {
            pageSize: this.state.pageSize, // 每次加载的条数
            searchContent: _.get(queryParams, 'search', this.state.searchContent), // 搜索框内容
            roleParam: _.get(queryParams, 'role', this.state.selectRole), // 成员角色
            status: _.get(queryParams, 'status', this.state.status), // 成员状态
            id: _.get(queryParams, 'id', ''), // 下拉加载最后一条的id
        };
        MemberManageAction.getMemberList(queryObj);
    };

    componentWillUnmount = () => {
        $('body').css('overflow', 'auto');
        MemberManageStore.unlisten(this.onChange);
    };

    showMemberForm = (type) => {
        //type：“edit”/"add"
        if (type === 'add') {
            Trace.traceEvent('成员管理', '成员详情面板点击添加成员按钮');
            //获取团队列表
            if (!Oplate.hideSomeItem) { // v8环境下，不显示所属团队，所以不用发请求
                MemberFormAction.setTeamListLoading(true);
                MemberFormAction.getUserTeamList();
            }
            // 获取职务列表
            MemberFormAction.setPositionListLoading(true);
            MemberFormAction.getSalesPosition();
            //获取角色列表
            MemberFormAction.setRoleListLoading(true);
            MemberFormAction.getRoleList();
            if (focusTimeout) {
                clearTimeout(focusTimeout);
            }
            focusTimeout = setTimeout(function() {
                $('#userName').focus();
            }, 600);
        }
        MemberManageAction.showMemberForm(type);
    };

    // 搜索处理
    searchEvent = (searchContent) => {
        let content = _.trim(searchContent);
        if (content) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-input-container input'), '跟据用户名/昵称/电话/邮箱搜索成员');
        } else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-input-container input'), '清空搜索内容');
        }
        MemberManageAction.updateSearchContent(content);
        MemberManageAction.setInitialData();
        this.getMemberList({search: content, id: '', role: ''});
    };

    // 角色下拉框
    getRoleOptions = () => {
        let options = _.map(this.state.memberRoleList, roleItem => <Option key={roleItem.role_id} value={roleItem.role_define}>{roleItem.role_name}</Option>);
        options.unshift(<Option value="" key="all">{Intl.get('member.role.select.default.role', '全部角色')}</Option>);
        return options;
    };
    // 选择角色
    onSelectRole = (role) => {
        MemberManageAction.setSelectRole(role);
        MemberManageAction.setInitialData();
        this.getMemberList({role: role, id: ''});
    };

    // 状态下拉框
    getStatusOptions = () => {
        return _.map(memberStatusList, statusItem => <Option key={statusItem.value} value={statusItem.value}>{statusItem.name}</Option>);
    };

    // 选择状态
    onSelectStatus = (status) => {
        MemberManageAction.setSelectStatus(status);
        MemberManageAction.setInitialData();
        this.getMemberList({status: status, id: ''});
    };

    //渲染操作按钮区
    renderTopNavOperation = () => {
        let roleOptions = this.getRoleOptions(); // 角色下拉框
        let statusOptions = this.getStatusOptions(); // 成员状态下拉框
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <PrivilegeChecker check="USER_MANAGE_ADD_USER" className="btn-item">
                        <Button
                            data-tracename="添加成员"
                            onClick={this.showMemberForm.bind(this, 'add')}
                        >
                            <Icon type="plus" />{Intl.get('common.add.member', '添加成员')}
                        </Button>
                    </PrivilegeChecker>
                </div>
                <div className='pull-right'>
                    <div className="search-input-block btn-item">
                        <SearchInput
                            searchPlaceHolder={Intl.get('member.search.placeholder', '账号/昵称/手机')}
                            searchEvent={this.searchEvent.bind(this)}
                        />
                    </div>
                    <div className="select-role btn-item">
                        <SelectFullWidth
                            value={this.state.selectRole}
                            onChange={this.onSelectRole}
                        >
                            {roleOptions}
                        </SelectFullWidth>
                    </div>
                    <div className="select-status btn-item">
                        <SelectFullWidth
                            value={this.state.status}
                            onChange={this.onSelectStatus}
                        >
                            {statusOptions}
                        </SelectFullWidth>
                    </div>
                </div>
            </div>
        );
    };

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.loading &&
            this.state.memberTotal >= 10 && !this.state.listenScrollBottom;
    };

    // 处理下拉加载数据
    handleScrollBottom = () => {
        this.getMemberList({id: this.state.sortId});
    };

    getTableColumns = () => {
        return [{
            title: Intl.get('member.member', '成员'),
            dataIndex: 'name',
            key: 'name',
            width: '35%',
            render: (name, record) => {
                return (
                    <div>
                        <div>{_.get(record, 'name')}</div>
                        <div>{_.get(record, 'userName')}</div>
                    </div>
                );
            }
        }, {
            title: Intl.get('operation.report.department', '部门'),
            dataIndex: 'department',
            key: 'department',
            width: '25%'
        },{
            title: Intl.get('member.position', '职务'),
            dataIndex: 'position',
            key: 'position',
            width: '25%'
        },{
            title: Intl.get('member.phone', '手机'),
            dataIndex: 'phone',
            key: 'phone',
            width: '15%'
        }];
    };
    
    // 点击表格
    handleRowClick = (record, index) => {
        this.showMemberInfo(record);
    };

    renderMemberTableContent = () => {
        let isLoading = this.state.loading;
        let doNotShow = false;
        if (isLoading && this.state.sortId === '') {
            doNotShow = true;
        }
        let columns = this.getTableColumns();
        let dataSource = this.state.memberList;
        let tableHeight = $(window).height() - 24 * 2 - 32 - 40;
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            loading: isLoading,
            showNoMoreDataTip: this.showNoMoreDataTip(),
            noMoreDataText: Intl.get('member.no.more.tips', '没有更多成员信息了')
        };
        return (
            <div
                className="member-list-table-wrap scroll-load"
                id="new-table"
                style={{ display: doNotShow ? 'none' : 'block' }}
            >
                <div className="" style={{ height: tableHeight }} ref="tableWrap">
                    <AntcTable
                        dropLoad={dropLoadConfig}
                        util={{zoomInSortArea: true}}
                        dataSource={dataSource}
                        rowKey={this.getRowKey}
                        onRowClick={this.handleRowClick}
                        columns={columns}
                        pagination={false}
                        rowClassName={this.handleRowClassName}
                        locale={{ emptyText: Intl.get('common.no.member', '暂无成员') }}
                        scroll={{ y: tableHeight }}
                    />
                </div>
            </div>
        );
    };

    // 关闭右侧面板
    closeRightPanel = () => {
        MemberManageAction.closeRightPanel();
        MemberManageAction.hideContinueAddButton();
    };

    // 由编辑页面返回信息展示页面
    returnInfoPanel = (newMember) => {
        MemberManageAction.returnInfoPanel(newMember);
    };
    
    // 显示成员详情
    showMemberInfo = (member) => {
        //如果正在展示其他详情，则先不展示当前点击的成员详情
        if (this.state.userIsLoading || this.state.logIsLoading) {
            return;
        }
        Trace.traceEvent('成员管理', '点击查看成员详情');
        let id = _.get(member, 'id');
        MemberManageAction.setCurMember(id);
        MemberManageAction.setMemberLoading(true);
        // 获取成员详情
        MemberManageAction.getCurMemberById(id);
        if ($('.right-panel-content').hasClass('right-panel-content-slide')) {
            $('.right-panel-content').removeClass('right-panel-content-slide');
            if (openTimeout) {
                clearTimeout(openTimeout);
            }
            openTimeout = setTimeout( () => {
                MemberManageAction.showMemberInfoPanel();
            }, 200);
        } else {
            MemberManageAction.showMemberInfoPanel();
        }
        //获取团队列表
        if (!Oplate.hideSomeItem) { // v8环境下，不显示所属团队，所以不用发请求
            MemberFormAction.setTeamListLoading(true);
            MemberFormAction.getUserTeamList();
        }
        //获取角色列表
        MemberFormAction.setRoleListLoading(true);
        MemberFormAction.getRoleList();
    };

    //显示继续添加按钮
    showContinueAddButton = () => {
        MemberManageAction.showContinueAddButton();
    };
    
    // 修改成员字段成功的处理
    changeMemberFieldSuccess = (member) => {
        MemberManageAction.afterEditMember(member);
    };
    // 修改成员状态
    updateMemberStatus = (updateObj) => {
        let status = _.get(updateObj, 'status');
        MemberManageAction.updateMemberStatus(updateObj);
        // 更新列表中当前修改成员的状态
        MemberManageAction.updateCurrentMemberStatus(status);
    };

    // 切换tab时的处理
    changeActiveKey = (key) => {
        this.setState({
            activeKey: key
        });
    };

    renderMemberTeamGroup = () => {
        let organizationName = _.get(getOrganization(), 'name', '');
        let count = this.state.memberTotal;
        return (
            <Tabs
                defaultActiveKey={TAB_KEYS.DEPARTMENT_TAB}
                activeKey={this.state.activeKey}
                onChange={this.changeActiveKey}
            >
                <TabPane
                    tab={Intl.get('crm.113', '部门')}
                    key={TAB_KEYS.DEPARTMENT_TAB}
                >
                    <ul>
                        <li>
                            <div className='organization-name'>{organizationName}</div>
                        </li>
                        <li>
                            <DepartmentManage/>
                        </li>
                    </ul>
                </TabPane>
                <TabPane
                    tab={Intl.get('member.position', '职务')}
                    key={TAB_KEYS.POSITION_TAB}
                >
                    <PositionManage />
                </TabPane>
            </Tabs>
        );
    }

    render() {
        return (
            <div className='member-container'>
                <div className='member-wrap'>
                    <div className='member-detail-wrap'>
                        <div className='member-top-nav'>
                            {this.renderTopNavOperation()}
                        </div>
                        <div className='member-content'>
                            <div className='member-table-info'>
                                {this.renderMemberTableContent()}
                            </div>
                        </div>
                    </div>
                </div>
                <div className='member-teams-group'>

                </div>
                <div className='member-right-panel'>
                    {this.state.isShowMemberForm ? (
                        <MemberForm
                            formType={this.state.formType}
                            closeRightPanel={this.closeRightPanel}
                            returnInfoPanel={this.returnInfoPanel}
                            showMemberInfo={this.showMemberInfo.bind(this)}
                            showContinueAddButton={this.showContinueAddButton}
                            member={this.state.currentMember}
                            isShowMemberForm={this.state.isShowMemberForm}
                        />
                    ) : null}
                    {
                        this.state.isShowMemberDetail ? (
                            <MemberInfo
                                memberInfo={this.state.currentMember}
                                closeRightPanel={this.closeRightPanel}
                                showEditForm={this.showMemberInfo}
                                isContinueAddButtonShow={this.state.isContinueAddButtonShow}
                                changeMemberFieldSuccess={this.changeMemberFieldSuccess}
                                updateMemberStatus={this.updateMemberStatus}
                                resultType={this.state.resultType}
                                errorMsg={this.state.errorMsg}
                                isGetMemberDetailLoading={this.state.isGetMemberDetailLoading}
                                getMemberDetailErrMsg={this.state.getMemberDetailErrMsg}
                            />
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

module.exports = MemberManage;
