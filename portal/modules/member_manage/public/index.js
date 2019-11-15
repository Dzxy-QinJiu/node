require('./css/index.less');
import {SearchInput} from 'antc';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import SelectFullWidth from 'CMP_DIR/select-fullwidth';
import Spinner from 'CMP_DIR/spinner';
import MemberManageStore from './store';
import MemberManageAction from './action';
import MemberManageAjax from './ajax';
import MemberFormAction from './action/member-form-actions';
import MemberForm from './view/member-form';
import MemberInfo from './view/member-info';
import {memberStatusList} from 'PUB_DIR/sources/utils/consts';
import {Icon, Button, Popover} from 'antd';
import Trace from 'LIB_DIR/trace';
import { positionEmitter } from 'PUB_DIR/sources/utils/emitters';
import MemberTableList from 'MOD_DIR/member-table-list';
import {BACKGROUG_LAYOUT_CONSTANTS, BOOT_PROCESS_KEYS} from 'PUB_DIR/sources/utils/consts';
import {updateGuideMark, getOrganizationInfo} from 'PUB_DIR/sources/utils/common-data-util';

let openTimeout = null;//打开面板时的时间延迟设置
let focusTimeout = null;//focus事件的时间延迟设置

const LAYOUT_CONSTANTS = {
    FRIST_NAV_WIDTH: 75, // 一级导航的宽度
    NAV_WIDTH: 120, // 导航宽度
    TOP_ZONE_HEIGHT: 80, // 头部（添加成员、筛选的高度）高度
    TABLE_HEAD_HEIGHT: 40, // 表格头部的高度
    PADDING_WIDTH: 24 * 2, // padding占的宽度
    PADDING_HEIGHT: 24 * 2 // padding占的高度
};

class MemberManage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRowIndex: null, // 点击的行索引
            memberRoleList: [],
            maxMemberNumber: -1, // 成员上限数量，设为-1，是为了比较，防止已进界面出现禁用情况
            currentMemberNumber: 0, // 当前成员数量
            ...MemberManageStore.getState(),
        };
    }

    onChange = () => {
        this.setState(MemberManageStore.getState());
    };

    // 获取筛选成员的职务
    getMemberPosition = (positionObj) => {
        let teamroleId = positionObj.teamroleId;
        MemberManageAction.setPositionId(teamroleId);
        // 筛选职务时，重新获取成员列表
        MemberManageAction.setInitialData();
        setTimeout(() => {
            this.getMemberList({teamroleId: teamroleId, id: ''});
        }, 0);
    };

    componentDidMount = () => {
        MemberManageStore.listen(this.onChange);
        MemberManageAjax.getRoleList().then( (result) => {
            if ( _.isArray(result) && result.length) {
                this.setState({
                    memberRoleList: result
                });
            }
        });
        // 获取成员的组织信息
        getOrganizationInfo().then( (result) => {
            if (result) {
                this.setState({
                    currentMemberNumber: _.get(result, 'membernumber', 0),
                    maxMemberNumber: _.get(result, 'max_membernumber', -1)
                });
            }
        });
        // 判断是否从组织切换到相应的部门，若切换，此方法不执行
        if (!this.props.isBeforeShowTeamList) {
            // 加setTimeout是为了解决 Dispatch.dispatch(...)的错误
            setTimeout( () => {
                // 从部门切换到职务时，再次切换到部门时，若展示的是部门（团队）的数据，会卸载此组件
                // 点击显示组织的成员时，会再次DidMount，要先置空数据
                MemberManageAction.setInitialConditionData();
                this.getMemberList(); // 获取成员列表
            }, 0);
        }
        positionEmitter.on(positionEmitter.CLICK_POSITION, this.getMemberPosition);
    };

    getMemberList = (queryParams) => {
        let queryObj = {
            pageSize: this.state.pageSize, // 每次加载的条数
            searchContent: _.get(queryParams, 'search', this.state.searchContent), // 搜索框内容
            roleParam: _.get(queryParams, 'role', this.state.selectRole), // 成员角色
            status: _.get(queryParams, 'status', this.state.status), // 成员状态
            id: _.get(queryParams, 'id', ''), // 下拉加载最后一条的id
            teamrole_id: _.get(queryParams, 'teamroleId', this.state.teamroleId) // 职务id
        };
        MemberManageAction.getMemberList(queryObj, (memberTotal) => {
            this.props.getMemberCount && this.props.getMemberCount(memberTotal);
        });
    };

    componentWillUnmount = () => {
        MemberManageStore.unlisten(this.onChange);
        MemberManageAction.setInitialData();
        positionEmitter.removeListener(positionEmitter.CLICK_POSITION, this.getMemberPosition);
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
        setTimeout( () => {
            this.getMemberList({search: content, id: '', role: ''});
        }, 0);
    };

    // 角色下拉框
    getRoleOptions = () => {
        let options = _.map(this.state.memberRoleList, roleItem =>
            <Option value={roleItem.roleId}>{roleItem.roleName}</Option>
        );
        options.unshift(<Option value="" key="all">
            {Intl.get('member.role.select.default.role', '全部角色')}
        </Option>);
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
        let maxMemberNumber = this.state.maxMemberNumber; // 添加成员上限
        let currentMemberNumber = this.state.currentMemberNumber; // 当前成员数量
        let disabled = false;
        let title = '';
        // maxMemberNumber等于-1时，创建成员数量没有限制
        if (maxMemberNumber !== -1 && !(currentMemberNumber < maxMemberNumber)) {
            disabled = true;
            title = Intl.get('member.number.toplimit', '成员数量已达{number}个上限', {number: maxMemberNumber});
        }
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <PrivilegeChecker check="USER_MANAGE_ADD_USER" className="btn-item">
                        {title ? (
                            <Popover content={title}>
                                <Button
                                    data-tracename="添加成员"
                                    disabled={disabled}
                                >
                                    <Icon type="plus" />{Intl.get('common.add.member', '添加成员')}
                                </Button>
                            </Popover>
                        ) : (
                            <Button
                                data-tracename="添加成员"
                                onClick={this.showMemberForm.bind(this, 'add')}
                            >
                                <Icon type="plus" />{Intl.get('common.add.member', '添加成员')}
                            </Button>
                        )}
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

    // 点击表格
    handleRowClick = (record, index) => {
        this.showMemberInfo(record);
        this.setState({
            selectedRowIndex: index
        });
    };

    renderMemberTableContent = () => {
        let isLoading = this.state.loading;
        let doNotShow = false;
        if (isLoading && this.state.sortId === '') {
            doNotShow = true;
        }
        let dataSource = this.state.memberList;
        let tableHeight = $(window).height() - LAYOUT_CONSTANTS.PADDING_HEIGHT -
            LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT - LAYOUT_CONSTANTS.TABLE_HEAD_HEIGHT;
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            loading: isLoading,
            showNoMoreDataTip: this.showNoMoreDataTip(),
            noMoreDataText: Intl.get('member.no.more.tips', '没有更多成员信息了')
        };
        return (
            <MemberTableList
                doNotShow={doNotShow}
                dropLoad={dropLoadConfig}
                dataSource={dataSource}
                handleRowClick={this.handleRowClick}
                selectedRowIndex={this.state.selectedRowIndex}
                isShowMemberDetail={this.state.isShowMemberDetail}
                tableHeight={tableHeight}
            />
        );
    };

    // 关闭右侧面板
    closeRightPanel = () => {
        MemberManageAction.closeRightPanel();
        MemberManageAction.hideContinueAddButton();
    };

    // 更新引导流程
    upDateGuideMark = () => {
        updateGuideMark(BOOT_PROCESS_KEYS.PERFACT_ORGANIZATION);
    };

    // 由编辑页面返回信息展示页面
    returnInfoPanel = (newMember) => {
        this.upDateGuideMark();
        MemberManageAction.returnInfoPanel(newMember);
        this.props.getMemberCount(this.state.memberTotal);
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
    };

    //显示继续添加按钮
    showContinueAddButton = () => {
        MemberManageAction.showContinueAddButton();
    };
    
    // 修改成员字段成功的处理
    changeMemberFieldSuccess = (member) => {
        MemberManageAction.afterEditMember(member);
    };

    render() {
        const height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        const topNavWidth = $(window).width() - BACKGROUG_LAYOUT_CONSTANTS.NAV_WIDTH -
        BACKGROUG_LAYOUT_CONSTANTS.PADDING_WIDTH - BACKGROUG_LAYOUT_CONSTANTS.FRIST_NAV_WIDTH;
        const contentHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;

        return (
            <div className='member-container' style={{height: height}}>
                <div className='member-wrap' style={{height: height}}>
                    <div className='member-detail-wrap'>
                        <div className='member-top-nav' style={{width: topNavWidth}}>
                            {this.renderTopNavOperation()}
                        </div>
                        <div className='member-content' style={{height: contentHeight}}>
                            {
                                this.state.loading && this.state.sortId === '' ? (
                                    <div>
                                        <Spinner/>
                                    </div>
                                ) : (
                                    <div className='member-table-info'>
                                        {this.renderMemberTableContent()}
                                    </div>
                                )
                            }

                        </div>
                    </div>
                </div>
                <div className='member-right-panel'>
                    {
                        this.state.isShowMemberForm ? (
                            <MemberForm
                                formType={this.state.formType}
                                closeRightPanel={this.closeRightPanel}
                                returnInfoPanel={this.returnInfoPanel}
                                showMemberInfo={this.showMemberInfo.bind(this)}
                                showContinueAddButton={this.showContinueAddButton}
                                member={this.state.currentMember}
                                isShowMemberForm={this.state.isShowMemberForm}
                                roleList={this.state.memberRoleList}
                            />
                        ) : null
                    }
                    {
                        this.state.isShowMemberDetail ? (
                            <MemberInfo
                                memberInfo={this.state.currentMember}
                                closeRightPanel={this.closeRightPanel}
                                showEditForm={this.showMemberForm}
                                isContinueAddButtonShow={this.state.isContinueAddButtonShow}
                                changeMemberFieldSuccess={this.changeMemberFieldSuccess}
                                resultType={this.state.resultType}
                                errorMsg={this.state.errorMsg}
                                isGetMemberDetailLoading={this.state.isGetMemberDetailLoading}
                                getMemberDetailErrMsg={this.state.getMemberDetailErrMsg}
                                roleList={this.state.memberRoleList}
                            />
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

MemberManage.propTypes = {
    getMemberCount: PropTypes.func,
    isBeforeShowTeamList: PropTypes.bool
};

module.exports = MemberManage;
