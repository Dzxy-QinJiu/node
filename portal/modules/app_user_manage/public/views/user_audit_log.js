import { AntcTable } from 'antc';
import { Icon, Select, Alert, Button, message } from 'antd';
// 加载时的动作显示
var Spinner = require('../../../../components/spinner');
var SelectFullWidth = require('../../../../components/select-fullwidth');
var Option = Select.Option;
var UserAuditLogAction = require('../action/user_audit_log_action');
var UserAuditLogStore = require('../store/user_audit_log_store');
import { AntcDatePicker as DatePicker } from 'antc';
import { SearchInput } from 'antc';
var GeminiScrollBar = require('../../../../components/react-gemini-scrollbar');
var topNavEmitter = require('../../../../public/sources/utils/emitters').topNavEmitter;
import { LITERAL_CONSTANT, FIRSR_SELECT_DATA } from 'PUB_DIR/sources/utils/consts';
//顶部导航
import ButtonZones from 'CMP_DIR/top-nav/button-zones';
var classnames = require('classnames');
var AppUserUtil = require('../util/app-user-util');
import CopyToClipboard from 'react-copy-to-clipboard';
import { userTypeList } from 'PUB_DIR/sources/utils/consts';
import { SELECT_TIME_TIPS, THREE_MONTH_TIME_RANGE, THIRTY_DAY_TIME_RANGE, THIRTY_ONE_DAY_TIME_RANGE } from '../util/consts';
var websiteConfig = require('../../../../lib/utils/websiteConfig');
var setWebsiteConfig = websiteConfig.setWebsiteConfig;
var getLocalWebsiteConfig = websiteConfig.getLocalWebsiteConfig;
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import Trace from 'LIB_DIR/trace';
import userData from 'PUB_DIR/sources/user-data';
import { phoneMsgEmitter } from 'PUB_DIR/sources/utils/emitters';
import { RETRY_GET_APP } from '../util/consts';
import BottomTotalCount from 'CMP_DIR/bottom-total-count';
import SelectAppTerminal from 'CMP_DIR/select-app-terminal';

// 用户类型的常量
const USER_TYPE_OPTION = {
    ALL: '', //  全部类型
    TRIAL: '试用用户', // 试用
    OFFICIAL: '正式用户', // 签约
    PRESENTED: 'special', // 赠送
    TRAIN: 'training', // 培训
    EMPLOYEE: 'internal' // 员工
};

class LogView extends React.Component {
    state = {
        curShowCustomerId: '', //查看右侧详情的客户id
        userType: USER_TYPE_OPTION.ALL, // 用户类型类型
        appTerminalType: '', // 应用终端类型，默认全部
        selectedRowIndex: null, // 点击的行索引
        isShowRightPanel: this.props.isShowRightPanel,
        firstSelectValue: FIRSR_SELECT_DATA[0], // 第一个选择框的值
        secondSelectValue: LITERAL_CONSTANT.ALL, // 第二个选择宽的值，默认是全部的状态
        ...UserAuditLogStore.getState()
    };

    onStoreChange = () => {
        var state = UserAuditLogStore.getState();
        this.setState(state);
    };

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        UserAuditLogStore.listen(this.onStoreChange);
        $(window).on('resize', this.changeTableHeight);
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
        let reqData = commonMethodUtil.getParamByPrivilege();
        //获取成员信息
        UserAuditLogAction.getSaleMemberList(reqData);
        //获取团队信息
        //必须在获取完团队后再获取操作日志，因为如果选中的是全部团队，需要把所有团队的id都传过去
        UserAuditLogAction.getTeamList(() => {
            this.getAppAndAuditData();
        });
    }
    componentWillReceiveProps(newProps) {
        this.setState({
            isShowRightPanel: newProps.isShowRightPanel || false
        });
    }
    getAppAndAuditData = () => {
        UserAuditLogAction.getUserApp((app_id) => {
            this.getAuditLog({
                appid: app_id,
                sort_id: ''
            });
        });
    };

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        UserAuditLogStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.changeTableHeight);
        UserAuditLogAction.resetState();
    }
    // 获取团队或是成员的id
    getTeamOrMemberId = (list, selectValue, isSelectedTeam) => {
        //如果选中的不是最低级的团队的时候，要取到低级团队的id
        if (isSelectedTeam) {
            //在团队树中查看该团队是否有下级团队
            var selectedTeams = _.chain(list).filter(item => selectValue.indexOf(item.name) > -1).map('id').value();
            //实际要传到后端的团队,默认是选中的团队
            let totalRequestTeams = JSON.parse(JSON.stringify(selectedTeams));
            let teamTotalArr = [];
            //跟据实际选中的id，获取包含下级团队的所有团队详情的列表teamTotalArr
            _.each(selectedTeams, (teamId) => {
                teamTotalArr = _.union(teamTotalArr, commonMethodUtil.traversingSelectTeamTree(this.state.teamTreeList, teamId));
            });
            //跟据包含下级团队的所有团队详情的列表teamTotalArr，获取包含所有的团队id的数组totalRequestTeams
            totalRequestTeams = _.union(totalRequestTeams, commonMethodUtil.getRequestTeamIds(teamTotalArr));
            return _.uniq(totalRequestTeams);
        } else {
            return _.chain(list).filter(item => selectValue.indexOf(item.name) > -1).map('id').value();
        }

    };

    // 获取团队或成员的参数
    getTeamMemberParam = () => {
        let teamList = _.get(this.state, 'teamList.list', []); // 团队数据
        let memberList = _.get(this.state, 'memberList.list', []); // 成员数据
        let secondSelectValue = this.state.secondSelectValue;
        let params = {};
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM && teamList.length > 1) { // 团队时
            //选全部团队时, 销售领导需要传他能看的所有团队的id,管理员、运营要看所有的审计日志，包括不在团队里的，所以什么都不用传
            if (this.state.secondSelectValue === LITERAL_CONSTANT.ALL) {
                if (!userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) && !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON)) {
                    let teamIdArray = _.map(teamList, 'id');
                    params.sale_team_ids = teamIdArray;
                }
            } else { //选择具体团队时，传团队及下级团队的团队id
                let secondSelectTeamId = this.getTeamOrMemberId(teamList, secondSelectValue, true);
                params.sale_team_ids = secondSelectTeamId;
            }
        } else { // 成员时
            // 全部成员时，什么都不用传，具体成员，传成员的id
            if (this.state.secondSelectValue !== LITERAL_CONSTANT.ALL) { // 具体成员时
                let secondSelectMemberId = this.getTeamOrMemberId(memberList, secondSelectValue);
                params.sale_ids = secondSelectMemberId; // 成员
            }
        }
        return params;
    };
    // 根据选择条件获取对应的数据
    getAuditLog = (queryParams) => {
        var queryObj = {
            load_size: this.state.loadSize, // 每次加载的条数
            appid: queryParams && 'appid' in queryParams ? queryParams.appid : this.state.selectAppId,
            sort_field: _.get(queryParams, 'sort_field') || this.state.sortField,
            sort_order: _.get(queryParams, 'sort_order') || this.state.sortOrder,
        };
        // 搜索字段
        var search = queryParams && 'search' in queryParams ? queryParams.search : this.state.searchName;
        queryObj.search = search ? _.trim(search.toString().toLowerCase()) : '';
        // 日志信息的id
        var sort_id = queryParams && 'sort_id' in queryParams ? queryParams.sort_id : this.state.sortId;
        if (sort_id) {
            queryObj.sort_id = sort_id;
        }
        var bodyObj = this.getTeamMemberParam();
        bodyObj.type_filter = this.state.typeFilter.join();
        // 用户类型
        var userType = _.get(queryParams, 'user_type') || this.state.userType;
        if (userType) {
            bodyObj.user_type = userType;
        }
        // 开始时间
        var starttime = queryParams && 'starttime' in queryParams ? queryParams.starttime : this.state.startTime;
        if (starttime) {
            bodyObj.start_time = starttime;
        }
        // 结束时间
        var endtime = queryParams && 'endtime' in queryParams ? queryParams.endtime : this.state.endTime;
        if (endtime) {
            bodyObj.end_time = endtime;
        }
        let appTerminalType = _.has(queryParams, 'appTerminalType') && queryParams.appTerminalType || this.state.appTerminalType;
        if (appTerminalType) {
            bodyObj.terminal = appTerminalType;
        }

        let searchObj = {
            queryObj: JSON.stringify(queryObj),
            bodyObj: JSON.stringify(bodyObj)
        };
        UserAuditLogAction.getAuditLogList(searchObj, this.addNoIdUserClass);
    };

    addNoIdUserClass = () => {
        $('.userNoIdClass').parents('.ant-table-row').addClass('no_valid_user');
    };
    handleClickRetryAppLists = () => {
        this.getAppAndAuditData();
    };
    // 应用下拉框的选择
    getAppOptions = () => {
        var list = this.state.userAppArray.map(function(item) {
            return <Option
                key={item.app_id}
                value={item.app_id}
                title={item.app_name}
            >
                {item.app_name}
            </Option>;
        });
        if (!this.state.userAppArray.length) {
            var clickMsg = Intl.get('app.user.manager.click.get.app', '点击获取应用');
            if (this.state.userAppArrayErrMsg) {
                clickMsg = Intl.get('app.user.failed.get.apps', '获取失败') + '，' + clickMsg;
            } else {
                clickMsg = Intl.get('user.no.product', '暂无产品') + '，' + clickMsg;
            }
            list.unshift(<Option value={RETRY_GET_APP} key={RETRY_GET_APP} className="get-applist-container">
                <div className="retry-get-appList" onClick={this.handleClickRetryAppLists}>
                    {clickMsg}
                </div>
            </Option>);
        }
        return list;
    };

    // 选择应用
    selectApp = (app_id) => {
        if (app_id === RETRY_GET_APP) {
            return;
        }
        UserAuditLogAction.setUserLogSelectedAppId(app_id);
        Trace.traceEvent('用户审计日志', '点击筛选菜单中的应用');
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        this.setState({
            appTerminalType: '',
        }, () => {
            this.getAuditLog({
                appid: app_id,
                sort_id: '',
            });
        });
    };

    // 搜索框
    handleSearchEvent = (inputContent) => {
        Trace.traceEvent('用户审计日志', '搜索框输入');
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        inputContent = inputContent ? inputContent : '';
        if (_.trim(inputContent) !== _.trim(this.state.searchName)) {
            UserAuditLogAction.handleSearchEvent(inputContent);
            this.getAuditLog({
                search: inputContent,
                sort_id: ''
            });
        }
    };

    // 更改时间
    onSelectDate = (start_time, end_time, range) => {
        let startTime = start_time;
        if (Date.now() - THREE_MONTH_TIME_RANGE > start_time) {
            startTime = Date.now() - THREE_MONTH_TIME_RANGE;
            message.info(SELECT_TIME_TIPS.range);
        }
        let endTime = end_time;
        if (endTime - startTime > THIRTY_ONE_DAY_TIME_RANGE) {
            startTime = endTime - THIRTY_DAY_TIME_RANGE;
            message.info(SELECT_TIME_TIPS.time);
        }
        this.props.setOperatorRecordSelectTime({ startTime, endTime, range });
        UserAuditLogAction.changeSearchTime({ startTime, endTime, range });
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        this.getAuditLog({
            starttime: startTime,
            endtime: endTime,
            sort_id: ''
        });
    };
    hideRightPanel = () => {
        this.setState({
            curShowCustomerId: ''
        });
    };

    showCustomerDetail = (customer_id) => {
        this.setState({
            curShowCustomerId: customer_id,
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customer_id,
                curCustomer: this.state.curCustomer,
                userViewShowCustomerUserListPanel: true,
                hideRightPanel: this.hideRightPanel
            }
        });
    };

    getTableColumns = () => {
        var _this = this;
        var columns = [
            {
                title: Intl.get('common.login.time', '时间'),
                dataIndex: 'timestamp',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '150px',
                key: 'timestamp',
                align: 'left',
                render: function(timestamp, rowData, idx) {
                    return (<span>
                        {moment(timestamp).format(oplateConsts.DATE_TIME_FORMAT)}
                    </span>);
                }
            },
            {
                title: Intl.get('common.username', '用户名'),
                dataIndex: 'user_name',
                className: 'has-filter click-show-user-detail',
                width: '100px',
                key: 'user_name',
                render: function($1, row) {
                    var userInputClass = classnames({
                        'user_id_hidden': true, // 点击查看详情的类
                        'userNoIdClass': row.user_id ? false : true // userId为空时的类
                    });
                    return (
                        <div>
                            {row.user_name}
                            <input type="hidden" value={row.user_id} className={userInputClass} />
                        </div>
                    );
                }
            },
            {
                title: Intl.get('common.nickname', '昵称'),
                dataIndex: 'nick_name',
                className: 'has-filter click-show-user-detail',
                width: '130px',
                key: 'nick_name'
            },
            {
                title: Intl.get('common.belong.customer', '所属客户'),
                dataIndex: 'customer_name',
                key: 'customer_name',
                className: 'has-filter owner-customer-wrap',
                width: '160px',
                render: function($1, rowData, idx) {
                    var customer_name = _.get(rowData, 'customer_name', '');
                    var customer_id = _.get(rowData, 'customer_id', '');
                    return (
                        <div title={customer_name} className="owner-customer"
                            onClick={_this.showCustomerDetail.bind(this, customer_id)}
                            data-tracename="点击所属客户列">{customer_name}
                        </div>
                    );
                }
            },
            {
                title: Intl.get('common.type', '类型'),
                dataIndex: 'tags',
                className: 'has-filter click-show-user-detail',
                width: '90px',
                key: 'tags',
                render: function(userType, record, index) {
                    let text = '';
                    if (_.isArray(userType) && userType.length) {
                        text = AppUserUtil.getUserTypeText(userType[0]);
                    }
                    return (
                        <span title={text}>
                            {text}
                        </span>
                    );
                }
            },
            {
                title: Intl.get('common.operate', '操作'),
                dataIndex: 'operate',
                className: 'has-filter click-show-user-detail',
                width: '100px',
                key: 'operation_name',
                render: function(operate, rowData, idx) {
                    return (<span title={operate}>
                        {operate === 'null' ? '' : operate}
                    </span>);
                }
            },
            {
                title: Intl.get('user.log.operate.detail', '操作详情'),
                dataIndex: 'operate_detail',
                className: 'has-filter operate-detail',
                width: '200px',
                key: 'operate_detail',
                render: function(text, record, index) {
                    return (
                        <div>
                            <span title={text} className="operate-detail-style">
                                {text}
                            </span>
                            <span className="show-copy-icon">
                                {text ? (
                                    <CopyToClipboard text={text}>
                                        <Icon type="copy" style={{ cursor: 'pointer' }}
                                            title={Intl.get('user.log.copy', '点击可复制')} />
                                    </CopyToClipboard>
                                ) : null}
                            </span>
                        </div>
                    );
                }
            },
            {
                title: 'IP',
                dataIndex: 'user_ip',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '120px',
                key: 'user_ip'
            },
            {
                title: Intl.get('common.ip.location', 'IP归属地'),
                dataIndex: 'location',
                className: 'has-filter click-show-user-detail',
                width: '110px',
                key: 'location',
                render: function(text, record, index) {
                    return (
                        <div>
                            {(record.country ? record.country : '') +
                                (record.province ? record.province : '') +
                                (record.city ? record.city : '') +
                                (record.county ? record.county : '')
                            }
                        </div>
                    );
                }
            },
            {
                title: Intl.get('user.log.area', '运营商'),
                dataIndex: 'area',
                className: 'has-filter click-show-user-detail',
                width: '100px',
                key: 'area'
            },
            {
                title: Intl.get('common.client', '客户端'),
                dataIndex: 'browser',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '210px',
                key: 'browser',
                render: function(text, record, index) {
                    return (
                        <div>
                            {record.browser_version ? (text + ' ' + record.browser_version) : text}
                        </div>
                    );
                }
            },
            {
                title: Intl.get('common.login.equipment', '设备'),
                dataIndex: 'os',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '120px',
                key: 'os'
            }
        ];
        return columns;
    };

    // 委内维拉项目，显示的列表项（不包括类型、IP归属地、运营商）
    getTableColumnsVe = () => {
        return _.filter(this.getTableColumns(), (item) => {
            return item.dataIndex !== 'location' && item.dataIndex !== 'area' && item.dataIndex !== 'tags';
        });
    };

    handleTableChange = (pagination, filters, sorter) => {
        const sortField = sorter.field || this.state.sortField;
        //将ascend、descend转换成后端要求的asc、desc
        const sortOrder = (sorter.order && sorter.order.replace('end', '')) || this.state.sortOrder;
        UserAuditLogAction.setSort({ sortField, sortOrder });
        this.getAuditLog({
            sort_id: '',
            sort_field: sortField,
            sort_order: sortOrder
        });
    };

    changeTableHeight = () => {
        this.setState({
            windowHeight: $(window).height()
        });
    };

    renderLoadingBlock = () => {
        if (this.state.appUserListResult !== 'loading') {
            return null;
        } else if (this.state.getUserLogErrorMsg !== '') {
            return null;
        } else if (this.state.sortId !== '') {
            return null;
        }
        return (
            <div className="appuser-list-loading-wrap">
                <Spinner />
            </div>
        );
    };

    onSelectFilterUserType = (value) => {
        UserAuditLogAction.handleFilterUserType();
        this.setState({
            userType: value
        }, () => {
            this.getAuditLog({
                user_type: value
            });
        });
        Trace.traceEvent('用户审计日志', '用户筛选');

    };

    // 渲染过滤用户类型
    renderFilterUserType = () => {
        return (
            <Select
                className="select-user-type btn-item"
                value={this.state.userType}
                onChange={this.onSelectFilterUserType}
            >
                {
                    userTypeList.map((userType, idx) => {
                        return (<Option key={idx} value={userType.value}> {userType.name} </Option>);
                    })
                }
            </Select>
        );
    };
    handleFirstSelect = () => {
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '选择成员过滤');
        } else if (this.state.firstSelectValue === LITERAL_CONSTANT.MEMBER) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '选择团队过滤');
        }
    };
    handleSelectTeamOrMember = () => {
        if (this.state.teamList.length > 1) {
            if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '根据团队过滤');
            } else if (this.state.firstSelectValue === LITERAL_CONSTANT.MEMBER) {
                Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '根据成员过滤');
            }
        } else if (this.state.teamList.length === 1) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.team-member-select'), '根据成员过滤');
        }
    };
    // 团队和成员框的选择
    handleFirstSelectChange = (value) => {
        UserAuditLogAction.handleFilterUserType();
        this.setState({
            firstSelectValue: value,
            secondSelectValue: LITERAL_CONSTANT.ALL
        }, () => {
            this.getAuditLog();
        });
    };

    // 第二个选择框，具体的值：全部和多个选择之间的切换显示
    onSecondSelectChange = (value) => {
        // 处理选择全部和多个的情况
        if (value[0] === LITERAL_CONSTANT.ALL && value.length > 1) {
            value.shift(); // 选择具体的某个成员后或团队时，‘全部’应该删除
        } else if (value[0] !== LITERAL_CONSTANT.ALL && _.indexOf(value, LITERAL_CONSTANT.ALL) !== -1 || value.length === 0) {
            value = LITERAL_CONSTANT.ALL; // 选择全部时，其他选项应该不显示
        }
        UserAuditLogAction.handleFilterUserType();
        this.setState({
            secondSelectValue: value,
        }, () => {
            this.getAuditLog();
        });
    };
    renderTeamMembersSelect() {
        let teamList = this.state.teamList.list; // 团队数据
        let memberList = this.state.memberList.list; // 成员数据

        // 第一个选择框渲染的数据
        let firstOptions = FIRSR_SELECT_DATA.map((item, index) => {
            return <Option value={item} key={index}>{item}</Option>;
        });

        // 第二个选择框的数据
        let secondOptions = [];
        if (teamList.length === 1) { // 只展示成员选择框时
            secondOptions = memberList.map((item, index) => {
                return <Option value={item.name} key={index}>{item.name}</Option>;
            });
        } else if (teamList.length > 1) { // 展示团队和成员
            if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM) {
                secondOptions = teamList.map((item, index) => {
                    return <Option value={item.name} key={index}>{item.name}</Option>;
                });
            } else if (this.state.firstSelectValue === LITERAL_CONSTANT.MEMBER) {
                secondOptions = memberList.map((item, index) => {
                    return <Option value={item.name} key={index}>{item.name}</Option>;
                });
            }
        }
        secondOptions.unshift(<Option value={LITERAL_CONSTANT.ALL}>{LITERAL_CONSTANT.ALL}</Option>);

        return (
            <div>
                {teamList.length > 1 ? (
                    <SelectFullWidth
                        defaultValue={FIRSR_SELECT_DATA[0]}
                        onChange={this.handleFirstSelectChange}
                        onSelect={this.handleFirstSelect}
                        className="btn-item"
                    >
                        {firstOptions}
                    </SelectFullWidth>
                ) : null}
                <SelectFullWidth
                    multiple
                    value={this.state.secondSelectValue}
                    onChange={this.onSecondSelectChange}
                    className="team-member-select-options btn-item"
                    onSelect={this.handleSelectTeamOrMember}
                >
                    {secondOptions}
                </SelectFullWidth>
            </div>
        );
    }

    // 筛选终端类型
    onSelectTerminalsType = (value) => {
        UserAuditLogAction.handleFilterAppTerminalType();
        this.setState({
            appTerminalType: value
        }, () => {
            this.getAuditLog({
                appTerminalType: value
            });
        });
        Trace.traceEvent('用户审计日志', '选择多终端类型');
    }

    // 渲染多终端类型
    renderAppTerminalsType = () => {
        return (
            <SelectAppTerminal
                appTerminals={this.state.selectAppTerminals}
                handleSelectedTerminal={this.onSelectTerminalsType.bind(this)}
                className="btn-item"
            />
        );
    }

    renderLogHeader = () => {
        var appOptions = this.getAppOptions();
        let teamList = _.get(this.state, 'teamList.list', []); // 团队数据
        return (
            <div className="user_audit_log_container">
                <ButtonZones>
                    <div className="btn-item-container">
                        <div className="user_audit_log_select_time btn-item" data-tracename="时间筛选">
                            <DatePicker
                                disableDateAfterToday={true}
                                dateSelectRange={THREE_MONTH_TIME_RANGE}
                                range={this.state.defaultRange}
                                onSelect={this.onSelectDate}
                                start_time={this.state.startTime}
                                end_time={this.state.endTime}
                            >
                                <DatePicker.Option
                                    value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                                <DatePicker.Option
                                    value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                            </DatePicker>
                        </div>
                        {/**
                         * 团队和成员筛选框
                         * */}
                        <div className="team-member-select">
                            {
                                teamList.length && !userData.getUserData().isCommonSales ?
                                    this.renderTeamMembersSelect() :
                                    null
                            }
                        </div>
                        <div className="user_audit_log_select_app btn-item">
                            <SelectFullWidth
                                showSearch
                                optionFilterProp="children"
                                value={this.state.selectAppId}
                                minWidth={140}
                                onSelect={this.selectApp}
                                notFoundContent={Intl.get('common.not.found', '无法找到')}
                            >
                                {appOptions}
                            </SelectFullWidth>
                        </div>
                        {
                            _.get(this.state.selectAppTerminals, 'length') ? (
                                this.renderAppTerminalsType()
                            ) : null
                        }
                        {Oplate.hideSomeItem ? null : this.renderFilterUserType()} {/**委内维拉项目隐藏*/}
                        <div className="user_audit_log_search_content btn-item">
                            <SearchInput
                                type="input"
                                searchPlaceHolder={Intl.get('user.search.placeholder', '请输入关键词搜索')}
                                searchEvent={this.handleSearchEvent}
                            />
                        </div>
                        <div className="user_audit_log_all">
                            <Button onClick={this.handleRefresh} className="btn-item" title="刷新">
                                <i className="iconfont icon-shuaxin"></i>
                            </Button>
                        </div>
                        <span className="refresh-btn customize-btn btn-item">
                            <i
                                className="iconfont icon-down-twoline handle-btn-item"
                                id="audit-log"
                                data-tracename="点击自定义表格列按钮"
                                title={Intl.get('common.table.customize', '自定义表格列')}
                            ></i>
                        </span>
                    </div>
                </ButtonZones>

            </div>
        );
    };

    handleRefresh = () => {
        UserAuditLogAction.handleRefresh();
        setTimeout(() => {
            this.getAuditLog({
                appid: this.state.selectAppId,
                sort_id: '',
                search: this.state.searchName
            });
        });
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
    };

    getRowKey = (record, index) => {
        return index;
    };

    handleScrollBottom = () => {
        var length = this.state.auditLogList.length;
        if (length < this.state.total) {
            this.getAuditLog({
                sort_id: this.state.sortId
            });
        } else if (length === this.state.total) {
            this.setState({
                listenScrollBottom: false
            });
        }
    };

    //是否显示没有更多数据了
    showNoMoreDataTip = () => {
        return !this.state.appUserListResult &&
            this.state.auditLogList.length >= 10 && !this.state.listenScrollBottom;
    };

    //处理选中行的样式
    handleRowClassName = (record, index) => {
        if ((index === this.state.selectedRowIndex) && this.state.isShowRightPanel) {
            return 'current_row';
        }
        else {
            return '';
        }
    };

    //记录点击行的索引
    handleRowClick = (record, index) => {
        this.setState({
            selectedRowIndex: index
        });
    };

    renderTableContent = () => {
        var isLoading = this.state.appUserListResult === 'loading';
        var doNotShow = false;
        if (isLoading && this.state.sortId === '') {
            doNotShow = true;
        }
        var columns = Oplate.hideSomeItem ? this.getTableColumnsVe() : this.getTableColumns();
        var tableHeight = commonMethodUtil.getTableContainerHeight();
        const dropLoadConfig = {
            listenScrollBottom: this.state.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            loading: this.state.appUserListResult === 'loading',
            showNoMoreDataTip: this.showNoMoreDataTip(),
            noMoreDataText: Intl.get('noMoreTip.log', '没有更多日志了')
        };
        return (
            <div
                className="user-list-table-wrap scroll-load"
                id="new-table"
                style={{ display: doNotShow ? 'none' : 'block' }}
            >
                <div className="" style={{ height: tableHeight }} ref="tableWrap">
                    <AntcTable
                        websiteConfig={getLocalWebsiteConfig()}
                        setWebsiteConfig={setWebsiteConfig}
                        buttonIdRef="audit-log"
                        dropLoad={dropLoadConfig}
                        util={{
                            zoomInSortArea: true
                        }}
                        dataSource={this.state.auditLogList}
                        rowKey={this.getRowKey}
                        onChange={this.handleTableChange}
                        onRowClick={this.handleRowClick}
                        columns={columns}
                        pagination={false}
                        rowClassName={this.handleRowClassName}
                        locale={{ emptyText: Intl.get('common.no.audit', '暂无操作记录') }}
                        scroll={{ y: tableHeight }}
                    />
                </div>
                {this.state.total ?
                    <BottomTotalCount totalCount={<ReactIntl.FormattedMessage
                        id="user.log.total"
                        defaultMessage={'共有{number}条日志记录'}
                        values={{
                            'number': this.state.total
                        }}
                    />} /> : null}
            </div>
        );
    };

    // 错误处理
    renderDataErrorHandle = () => {
        return <div className="alert-wrap">
            <Alert
                message={this.state.getUserLogErrorMsg}
                type="error"
                showIcon={true}
            />
        </div>;
    };

    render() {
        return (
            <div ref="userListTable" className="user_audit_log_style">
                {this.renderLogHeader()}
                {this.renderLoadingBlock()}
                {this.state.getUserLogErrorMsg !== '' ? this.renderDataErrorHandle() : this.renderTableContent()}
            </div>
        );
    }
}
LogView.propTypes = {
    isShowRightPanel: PropTypes.bool,
    setOperatorRecordSelectTime: PropTypes.func
};
module.exports = LogView;

