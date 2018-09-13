var React = require('react');
import { AntcTable } from 'antc';
import { Icon, Select, Alert, Button, message } from 'antd';
// 加载时的动作显示
var Spinner = require('../../../../components/spinner');
var SelectFullWidth = require('../../../../components/select-fullwidth');
var Option = Select.Option;
var UserAuditLogAction = require('../action/user_audit_log_action');
var UserAuditLogStore = require('../store/user_audit_log_store');
import DatePicker from '../../../../components/datepicker';
import {SearchInput} from 'antc';
var GeminiScrollBar = require('../../../../components/react-gemini-scrollbar');
var topNavEmitter = require('../../../../public/sources/utils/emitters').topNavEmitter;
import {LITERAL_CONSTANT, FIRSR_SELECT_DATA} from 'PUB_DIR/sources/utils/consts';
//顶部导航
var TopNav = require('../../../../components/top-nav');
var classnames = require('classnames');
var AppUserUtil = require('../util/app-user-util');
import CopyToClipboard from 'react-copy-to-clipboard';
import { userTypeList } from 'PUB_DIR/sources/utils/consts';
import { SELECT_TIME_TIPS, THREE_MONTH_TIME_RANGE, THIRTY_DAY_TIME_RANGE, THIRTY_ONE_DAY_TIME_RANGE } from '../util/consts';
import RefreshButton from 'CMP_DIR/refresh-button';
var websiteConfig = require('../../../../lib/utils/websiteConfig');
var setWebsiteConfig = websiteConfig.setWebsiteConfig;
var getLocalWebsiteConfig = websiteConfig.getLocalWebsiteConfig;
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import Trace from 'LIB_DIR/trace';

//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 120,
    BOTTOM_DISTANCE: 40
};

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
        userType: USER_TYPE_OPTION.ALL, // 用户类型类型
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
        var _this = this;
        UserAuditLogAction.getUserApp(function(app_id) {
            _this.getAuditLog({
                appid: app_id,
                sort_id: ''
            });
        });
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
        //获取团队信息
        UserAuditLogAction.getTeamList();
        let reqData = commonMethodUtil.getParamByPrivilege();
        //获取成员信息
        UserAuditLogAction.getSaleMemberList(reqData);
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            isShowRightPanel: newProps.isShowRightPanel || false
        });
    }

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        UserAuditLogStore.unlisten(this.onStoreChange);
        $(window).off('resize', this.changeTableHeight);
        UserAuditLogAction.resetState();
    }
    // 获取团队或是成员的id
    getTeamOrMemberId = (list, selectValue,isSelectedTeam) => {
        //如果选中的不是最低级的团队的时候，要取到低级团队的id
        if(isSelectedTeam){
            //在团队树中查看该团队是否有下级团队
            var teamArr = _.chain(list).filter(item => selectValue.indexOf(item.name) > -1).map('id').value();
            _.map(teamArr,(teamId) => {
                var targetObj = _.find(this.state.teamTreeList,(item) => {
                    return item.group_id === teamId;
                });
                if (!_.isEmpty(targetObj) && _.isArray(targetObj.child_groups)){
                    _.forEach(targetObj.child_groups, (childTeam) => {
                        teamArr.push(childTeam.group_id);
                    });
                }
            });

            return _.uniq(teamArr);


        }else{
            return _.chain(list).filter(item => selectValue.indexOf(item.name) > -1).map('id').value();
        }

    };

    // 获取团队或成员的参数
    getTeamMemberParam = () => {
        let teamList = _.get(this.state,'teamList.list',[]); // 团队数据
        let memberList = _.get(this.state, 'memberList.list',[]); // 成员数据
        let secondSelectValue = this.state.secondSelectValue;
        let params = {};
        if (this.state.firstSelectValue === LITERAL_CONSTANT.TEAM && teamList.length > 1) { // 团队时
            if (this.state.secondSelectValue === LITERAL_CONSTANT.ALL){//选择全部团队时，把所有团队的id传过去
                let teamIdArray = _.map(teamList, 'id');
                params.sale_team_ids = teamIdArray;
            }else { // 具体团队时
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
            sort_field: _.get(queryParams,'sort_field') || this.state.sortField,
            sort_order: _.get(queryParams, 'sort_order') || this.state.sortOrder,
        };
        // 搜索字段
        var search = queryParams && 'search' in queryParams ? queryParams.search : this.state.searchName;
        queryObj.search = search ? (search.toString().trim()).toLowerCase() : '';
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
            bodyObj.start_time = starttime + '';
        }
        // 结束时间
        var endtime = queryParams && 'endtime' in queryParams ? queryParams.endtime : this.state.endTime;
        if (endtime) {
            bodyObj.end_time = endtime + '';
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
        return list;
    };

    // 选择应用
    selectApp = (app_id) => {
        UserAuditLogAction.setUserLogSelectedAppId(app_id);
        Trace.traceEvent('用户审计日志','点击筛选菜单中的应用');
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        this.getAuditLog({
            appid: app_id,
            sort_id: ''
        });
    };

    // 搜索框
    handleSearchEvent = (inputContent) => {
        Trace.traceEvent('用户审计日志','搜索框输入');
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        inputContent = inputContent ? inputContent : '';
        if (inputContent.trim() !== this.state.searchName.trim()) {
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
            message.info(SELECT_TIME_TIPS.range, message.config({ top: 50 }));
        }
        let endTime = end_time;
        if (endTime - startTime > THIRTY_ONE_DAY_TIME_RANGE) {
            startTime = endTime - THIRTY_DAY_TIME_RANGE;
            message.info(SELECT_TIME_TIPS.time, message.config({ top: 50 }));
        }
        UserAuditLogAction.changeSearchTime({ startTime, endTime, range });
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        this.getAuditLog({
            starttime: startTime,
            endtime: endTime,
            sort_id: ''
        });
    };

    getTableColumns = () => {
        var columns = [
            {
                title: Intl.get('common.username', '用户名'),
                dataIndex: 'user_name',
                className: 'has-filter click-show-user-detail',
                sorter: true,
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
                sorter: true,
                width: '130px',
                key: 'nick_name'
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
                sorter: true,
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
                sorter: true,
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
                sorter: true,
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
                sorter: true,
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
            },
            {
                title: Intl.get('common.login.time', '时间'),
                dataIndex: 'timestamp',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '150px',
                key: 'timestamp',
                render: function(timestamp, rowData, idx) {
                    return (<span>
                        {moment(timestamp).format(oplateConsts.DATE_TIME_FORMAT)}
                    </span>);
                }
            },
            {
                title: Intl.get('user.log.type', '类别'),
                dataIndex: 'type',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '100px',
                key: 'type'
            },
            {
                title: Intl.get('authority.auth.api', '服务地址'),
                dataIndex: 'remote_addr',
                className: 'has-filter click-show-user-detail',
                width: '120px',
                key: 'remote_addr'
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
        this.state.userType = value;
        UserAuditLogAction.handleFilterUserType();
        this.setState({
            userType: value
        }, () => {
            this.getAuditLog({
                user_type: this.state.userType
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
        this.setState({
            firstSelectValue: value,
            secondSelectValue: LITERAL_CONSTANT.ALL
        }, () => {
            if (value === LITERAL_CONSTANT.MEMBER) {
                let userIdArray = _.map(this.state.memberList.list, 'id');
                this.getAuditLog({user_id: userIdArray.join(',')});
            } else {
                this.getAuditLog();
            }
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
        this.setState({
            secondSelectValue: value,
        }, () => {
            this.getAuditLog();
        });
    };
    renderTeamMembersSelect(){
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
                ) : null }
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
    renderLogHeader = () => {
        var appOptions = this.getAppOptions();
        return (
            <div className="user_audit_log_container">
                <TopNav>
                    <TopNav.MenuList />
                    <div className="user_audit_log_header">
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
                        {Oplate.hideSomeItem ? null : this.renderFilterUserType()} {/**委内维拉项目隐藏*/}
                        {/**
                         * 团队和成员筛选框
                         * */}
                        <div className="team-member-select">
                            {
                                this.state.teamList.list.length ?
                                    this.renderTeamMembersSelect() :
                                    null
                            }
                        </div>
                        <div className="user_audit_log_search_content btn-item">
                            <SearchInput
                                type="input"
                                searchPlaceHolder={Intl.get('user.search.placeholder', '请输入关键词搜索')}
                                searchEvent={this.handleSearchEvent}
                            />
                        </div>
                        <div className="user_audit_log_all">
                            <Button onClick={this.handleRefresh} className="btn-item">{Intl.get('common.refresh', '刷新')}</Button>  
                        </div>
                        <span className="refresh-btn customize-btn btn-item">
                            <i
                                className="iconfont icon-down-twoline"
                                id="audit-log"
                                data-tracename="点击自定义表格列按钮"
                                title={Intl.get('common.table.customize', '自定义表格列')}
                            ></i>
                        </span>                       
                    </div>
                </TopNav>

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
        var tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
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
                        locale={{ emptyText: Intl.get('common.no.audit', '暂无审计') }}
                        scroll={{ y: tableHeight }}
                    />
                </div>
                {this.state.total ?
                    <div className="summary_info">
                        <ReactIntl.FormattedMessage
                            id="user.log.total"
                            defaultMessage={'共有{number}条日志记录'}
                            values={{
                                'number': this.state.total
                            }}
                        />
                    </div> : null}
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

module.exports = LogView;

