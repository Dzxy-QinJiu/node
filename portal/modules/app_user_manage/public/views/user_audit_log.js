var Table = require('antd').Table;
var Checkbox = require('antd').Checkbox;
var Icon = require('antd').Icon;
// 调整表格的head和body对齐
var TableUtil = require("../../../../components/antd-table-pagination");
// 加载时的动作显示
var Spinner = require("../../../../components/spinner");
var Select = require("antd").Select;
var SelectFullWidth = require("../../../../components/select-fullwidth");
var Option = Select.Option;
var UserAuditLogAction = require("../action/user_audit_log_action");
var UserAuditLogStore = require("../store/user_audit_log_store");
import DatePicker from "../../../../components/datepicker";
var SearchInput = require("../../../../components/searchInput");
var Alert = require("antd").Alert;
var GeminiScrollBar = require("../../../../components/react-gemini-scrollbar");
// 没有数据的提示信息
var NoMoreDataTip = require("../../../../components/no_more_data_tip");
var topNavEmitter = require("../../../../public/sources/utils/emitters").topNavEmitter;
//顶部导航
var TopNav = require("../../../../components/top-nav");
var classnames = require("classnames");
var AppUserUtil = require("../util/app-user-util");
var Button = require("antd").Button;

import CopyToClipboard from 'react-copy-to-clipboard';

//用于布局的高度
var LAYOUT_CONSTANTS = {
    TOP_DISTANCE: 150,
    BOTTOM_DISTANCE: 50
};


// 用户类型的常量
const USER_TYPE_OPTION = {
    ALL: '', //  全部类型
    TRIAL: '试用用户',  // 试用
    OFFICIAL: '正式用户',   // 签约
    PRESENTED: 'special', // 赠送
    TRAIN: 'training',  // 培训
    EMPLOYEE: 'internal'  // 员工
};

var LogView = React.createClass({
    getInitialState: function () {
        return {
            checked: true,
            userType: USER_TYPE_OPTION.ALL, // 用户类型类型
            ...UserAuditLogStore.getState()
        }

    },

    onStoreChange: function () {
        var state = UserAuditLogStore.getState();
        this.setState(state);
    },

    componentDidMount: function () {
        $("body").css("overflow", "hidden");
        UserAuditLogStore.listen(this.onStoreChange);
        $(window).on("resize", this.changeTableHeight);
        TableUtil.zoomInSortArea(this.refs.userListTable);
        var _this = this;
        UserAuditLogAction.getUserApp(function (app_id) {
            _this.getAuditLog({
                appid: app_id,
                sort_id: ''
            });
        });
        topNavEmitter.emit(topNavEmitter.RELAYOUT);
    },

    componentWillUnmount: function () {
        $("body").css("overflow", "auto");
        UserAuditLogStore.unlisten(this.onStoreChange);
        $(window).off("resize", this.changeTableHeight);
        UserAuditLogAction.resetState();
    },

    // 根据选择条件获取对应的数据
    getAuditLog: function (queryParams) {
        var searchObj = {
            load_size: this.state.loadSize,  // 每次加载的条数
            appid: queryParams && 'appid' in queryParams ? queryParams.appid : this.state.selectAppId,
            sort_field: queryParams.sort_field || this.state.sortField,
            sort_order: queryParams.sort_order || this.state.sortOrder
        };
        // 用户类型
        var userType = queryParams.user_type || this.state.userType;
        if (userType) {
            searchObj.user_type = userType;
        }
        // 搜索字段
        var search = queryParams && 'search' in queryParams ? queryParams.search : this.state.searchName;
        searchObj.search = search ? (search.toString().trim()).toLowerCase() : '';
        // 日志信息的id
        var sort_id = queryParams && 'sort_id' in queryParams ? queryParams.sort_id : this.state.sortId;
        if(sort_id){
            searchObj.sort_id = sort_id
        }
        // 开始时间
        var starttime = queryParams && 'starttime' in queryParams ? queryParams.starttime : this.state.startTime;
        if(starttime){
            searchObj.starttime = starttime
        }
        // 结束时间
        var endtime = queryParams && 'endtime' in queryParams ? queryParams.endtime : this.state.endTime;
        if(endtime){
            searchObj.endtime = endtime
        }
        // 过滤类型
        var type_filter = queryParams && 'type_filter' in queryParams ? queryParams.type_filter : this.state.typeFilter;
        if(type_filter){
            searchObj.type_filter = type_filter
        }
        UserAuditLogAction.getAuditLogList(searchObj, this.addNoIdUserClass);
    },
    addNoIdUserClass: function () {
        $(".userNoIdClass").parents(".ant-table-row").addClass("no_valid_user");
    },
    // 应用下拉框的选择
    getAppOptions : function() {
        var list = this.state.userAppArray.map(function(item) {
            return <Option
                key={item.app_id}
                value={item.app_id}
                title={item.app_name}
            >
                {item.app_name}
            </Option>
        });
        return list;
    },

    // 选择应用
    selectApp: function (app_id) {
        UserAuditLogAction.setUserLogSelectedAppId(app_id);
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        this.getAuditLog({
            appid: app_id,
            sort_id: ''
        });
    },

    // 搜索框
    handleSearchEvent: function (inputContent) {
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        inputContent = inputContent ? inputContent : '';
        if (inputContent.trim() !== this.state.searchName.trim()) {
            UserAuditLogAction.handleSearchEvent(inputContent);
            this.getAuditLog({
                search: inputContent,
                sort_id: ''
            });
        }
    },
    // 更改时间
    onSelectDate: function (startTime, endTime) {
        UserAuditLogAction.changeSearchTime({startTime, endTime});
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        this.getAuditLog({
            starttime: startTime,
            endtime: endTime,
            sort_id: ''
        });
    },

    getTableColumns: function () {
        var columns = [
            {
                title: Intl.get("common.username", "用户名"),
                dataIndex: 'user_name',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '10%',
                key: 'user_name',
                render: function ($1, row) {
                    var userInputClass = classnames({
                        'user_id_hidden': true,  // 点击查看详情的类
                        'userNoIdClass': row.user_id ? false : true   // userId为空时的类
                    });
                    return (
                        <div>
                            {row.user_name}
                            <input type="hidden" value={row.user_id} className={userInputClass}/>
                        </div>
                    )
                }
            },
            {
                title: Intl.get("common.nickname", "昵称"),
                dataIndex: 'nick_name',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '10%',
                key: 'nick_name'
            },
            {
                title: Intl.get("common.type", "类型"),
                dataIndex: 'tags',
                className: 'has-filter click-show-user-detail',
                width: '3%',
                key: 'tags',
                render : function(userType, record, index) {
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
                title: Intl.get("common.operate", "操作"),
                dataIndex: 'operate',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '5%',
                key: 'operation_name',
                render: function (operate, rowData, idx) {
                    return (<span title={operate}>
                        {operate == "null" ? '' : operate}
                    </span>);
                }
            },
            {
                title: Intl.get("user.log.operate.detail", "操作详情"),
                dataIndex: 'operate_detail',
                className: 'has-filter operate-detail',
                sorter: true,
                width: '8%',
                key: 'operate_detail',
                render: function (text, record, index) {
                    return (
                        <div>
                            <span title={text} className="operate-detail-style">
                                 {text}
                            </span>
                             <span className="show-copy-icon">
                                 {text ? (
                                     <CopyToClipboard text={text}>
                                         <Icon type="copy" style={{cursor: 'pointer'}}
                                               title={Intl.get("user.log.copy", "点击可复制")}/>
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
                width: '8%',
                key: 'user_ip'
            },
            {
                title: Intl.get("common.ip.location", "IP归属地"),
                dataIndex: 'location',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '8%',
                key: 'location',
                render: function (text, record, index) {
                    return (
                        <div>
                            { (record.country ? record.country : '') +
                              (record.province ? record.province : '' ) +
                              (record.city ? record.city : '')  +
                              (record.county ? record.county : '')
                            }
                        </div>
                    );
                }
            },
            {
                title: Intl.get("user.log.area", "运营商"),
                dataIndex: 'area',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '8%',
                key: 'area'
            },
            {
                title: Intl.get("common.client", "客户端"),
                dataIndex: 'browser',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '11%',
                key: 'browser',
                render: function (text, record, index) {
                    return (
                        <div>
                            { record.browser_version ? (text + ' ' + record.browser_version) : text }
                        </div>
                    );
                }
            },
            {
                title: Intl.get("common.login.equipment", "设备"),
                dataIndex: 'os',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '6%',
                key: 'os'
            },
            {
                title: Intl.get("common.login.time", "时间"),
                dataIndex: 'timestamp',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '10%',
                key: 'timestamp',
                render: function (timestamp, rowData, idx) {
                    return (<span>
                        {moment(timestamp).format(oplateConsts.DATE_TIME_FORMAT)  }
                    </span>);
                }
            },
            {
                title: Intl.get("user.log.type", "类别"),
                dataIndex: 'type',
                className: 'has-filter click-show-user-detail',
                sorter: true,
                width: '5%',
                key: 'type'
            },
            {
                title: Intl.get("authority.auth.api", "服务地址"),
                dataIndex: 'remote_addr',
                className: 'has-filter click-show-user-detail',
                width: '7%',
                key: 'remote_addr'
            }
        ];
        return columns;
    },

    // 委内维拉项目，显示的列表项（不包括类型、IP归属地、运营商）
    getTableColumnsVe: function () {
        return  _.filter(this.getTableColumns(), (item) => {
            return item.dataIndex != 'location' && item.dataIndex != 'area' && item.dataIndex != 'tags' ;
        } );
    },

    handleTableChange: function (pagination, filters, sorter) {
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
        const sortField = sorter.field || this.state.sortField;
        //将ascend、descend转换成后端要求的asc、desc
        const sortOrder = (sorter.order && sorter.order.replace("end", "")) || this.state.sortOrder;
        UserAuditLogAction.setSort({sortField, sortOrder});
        this.getAuditLog({
            sort_id: '',
            sort_field: sortField,
            sort_order: sortOrder,
        });
    },

    changeTableHeight: function () {
        this.setState({
            windowHeight: $(window).height()
        });
    },
    renderLoadingBlock: function () {
        if (this.state.appUserListResult !== 'loading') {
            return null;
        } else if (this.state.getUserLogErrorMsg != '') {
            return null;
        } else if (this.state.sortId !== '') {
            return null;
        }
        return (
            <div className="appuser-list-loading-wrap">
                <Spinner />
            </div>
        );
    },

    selectShowLogsType: function (e) {
        var status = e.target.checked;
        UserAuditLogAction.filterType(status);
        this.setState({
            checked: e.target.checked
        }, ()=> {
            this.getAuditLog({
                type_filter: this.state.typeFilter
            })
        });

    },

    onSelectFilterUserType(value) {
        if (value == USER_TYPE_OPTION.ALL){
            this.state.userType = USER_TYPE_OPTION.ALL;
        } else if (value == USER_TYPE_OPTION.TRIAL) {
            this.state.userType = USER_TYPE_OPTION.TRIAL;
        } else if (value == USER_TYPE_OPTION.OFFICIAL) {
            this.state.userType = USER_TYPE_OPTION.OFFICIAL;
        } else if (value == USER_TYPE_OPTION.PRESENTED) {
            this.state.userType = USER_TYPE_OPTION.PRESENTED;
        } else if (value == USER_TYPE_OPTION.TRAIN) {
            this.state.userType = USER_TYPE_OPTION.TRAIN;
        }else if (value == USER_TYPE_OPTION.EMPLOYEE) {
            this.state.userType = USER_TYPE_OPTION.EMPLOYEE;
        }
        UserAuditLogAction.handleFilterUserType();
        this.setState({
            userType: value
        }, () => {
            this.getAuditLog({
                user_type: this.state.userType
            });
        });

    },

    // 渲染过滤用户类型
    renderFilterUserType(){
        return (
            <SelectFullWidth
                className="select-user-type"
                value={this.state.userType}
                showSearch
                onChange={this.onSelectFilterUserType}
            >
                <Option value={USER_TYPE_OPTION.ALL}> {Intl.get("user.online.all.type", "全部类型")} </Option>
                <Option value={USER_TYPE_OPTION.TRIAL}> {Intl.get("common.trial", "试用")} </Option>
                <Option value={USER_TYPE_OPTION.OFFICIAL}> {Intl.get("common.official", "签约")} </Option>
                <Option value={USER_TYPE_OPTION.PRESENTED}> {Intl.get("user.type.presented", "赠送")} </Option>
                <Option value={USER_TYPE_OPTION.TRAIN}> {Intl.get("user.type.train", "培训")} </Option>
                <Option value={USER_TYPE_OPTION.EMPLOYEE}> {Intl.get("user.type.employee", "员工")} </Option>
            </SelectFullWidth>
        );
    },

    renderLogHeader: function () {
        var appOptions = this.getAppOptions();
        return (
            <div className="user_audit_log_container">
                <TopNav>
                    <TopNav.MenuList />
                    <div className="user_audit_log_header">
                        {Oplate.hideUserManageItem ? null : this.renderFilterUserType()} {/**委内维拉项目隐藏*/}
                        <div className="user_audit_log_select_time">
                            <DatePicker
                                disableDateAfterToday={true}
                                range={this.state.defaultRange}
                                onSelect={this.onSelectDate}
                            >
                                <DatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</DatePicker.Option>
                                <DatePicker.Option
                                    value="day">{Intl.get("common.time.unit.day", "天")}</DatePicker.Option>
                                <DatePicker.Option
                                    value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                                <DatePicker.Option
                                    value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                                <DatePicker.Option
                                    value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                                <DatePicker.Option
                                    value="year">{Intl.get("common.time.unit.year", "年")}</DatePicker.Option>
                                <DatePicker.Option
                                    value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                            </DatePicker>
                        </div>
                        <div className="user_audit_log_select_app">
                            <SelectFullWidth
                                showSearch
                                optionFilterProp="children"
                                value={this.state.selectAppId}
                                minWidth={140}
                                onSelect={this.selectApp}
                                notFoundContent={Intl.get("common.not.found", "无法找到")}
                            >
                                {appOptions}
                            </SelectFullWidth>
                        </div>

                        <div className="user_audit_log_search_content">
                            <SearchInput
                                type="input"
                                searchPlaceHolder={Intl.get("user.search.placeholder", "请输入关键词搜索")}
                                searchEvent={this.handleSearchEvent}
                            />
                        </div>
                        <div className="user_audit_log_all">
                            <Checkbox
                                title={Intl.get("user.filter.heartbeat.service", "过滤心跳服务")}
                                checked={this.state.checked}
                                onChange={this.selectShowLogsType}
                            />
                            <Button type="primary" className="refresh-button" onClick={this.handleRefresh}>
                                {Intl.get("common.refresh", "刷新")}
                            </Button>
                        </div>
                    </div>
                </TopNav>

            </div>
        );
    },
    handleRefresh:function () {
        UserAuditLogAction.handleRefresh();
        setTimeout(() => {
            this.getAuditLog({
                appid: this.state.selectAppId,
                sort_id: ''
            });
        });
        GeminiScrollBar.scrollTo(this.refs.tableWrap, 0);
    },
    getRowKey: function (record, index) {
        return index;
    },

    handleScrollBottom: function () {
        var length = this.state.auditLogList.length;
        if (length < this.state.total) {
            this.getAuditLog({
                sort_id: this.state.sortId
            });
        } else if (length == this.state.total) {
            this.setState({
                listenScrollBottom: false
            });
        }
    },

    //是否显示没有更多数据了
    showNoMoreDataTip: function () {
        return !this.state.appUserListResult &&
            this.state.auditLogList.length >= 10 && !this.state.listenScrollBottom;
    },

    renderTableContent: function () {
        var isLoading = this.state.appUserListResult === 'loading';
        var doNotShow = false;
        if (isLoading && this.state.sortId === '') {
            doNotShow = true;
        }
        var columns = Oplate.hideUserManageItem ? this.getTableColumnsVe() : this.getTableColumns();
        var tableHeight = $(window).height() - LAYOUT_CONSTANTS.TOP_DISTANCE - LAYOUT_CONSTANTS.BOTTOM_DISTANCE;
        return (
            <div
                className="user-list-table-wrap splice-table "
                style={{display : doNotShow ? 'none' : 'block'}}
            >
                <div className="user-list-thead custom-thead">
                    <Table
                        rowKey={this.getRowKey}
                        columns={columns}
                        dataSource={this.state.auditLogList}
                        pagination={false}
                        onChange={this.handleTableChange}
                    />
                </div>
                <div className="user-list-tbody custom-tbody" style={{height:tableHeight}} ref="tableWrap">
                    <GeminiScrollBar
                        listenScrollBottom={this.state.listenScrollBottom}
                        handleScrollBottom={this.handleScrollBottom}
                        itemCssSelector=".ant-table-tbody .ant-table-row"
                    >
                        <Table
                            dataSource={this.state.auditLogList}
                            rowKey={this.getRowKey}
                            columns={columns}
                            pagination={false}
                            locale={{ emptyText: Intl.get("common.no.data", "暂无数据") }}
                        />
                        <NoMoreDataTip
                            fontSize="12"
                            show={this.showNoMoreDataTip}
                        />
                    </GeminiScrollBar>
                </div>
                <div className="summary_info">
                    <ReactIntl.FormattedMessage
                        id="user.log.total"
                        defaultMessage={`共有{number}条日志记录`}
                        values={{
                            'number':  this.state.total
                        }}
                    />
                </div>
            </div>
        );
    },

    // 错误处理
    renderDataErrorHandle: function () {
        return <div className="alert-wrap">
            <Alert
                message={this.state.getUserLogErrorMsg}
                type="error"
                showIcon={true}
            />
        </div>;
    },

    render: function () {
        return (
            <div ref="userListTable" className="user_audit_log_style">
                {this.renderLogHeader()}
                {this.renderLoadingBlock()}
                {this.state.getUserLogErrorMsg != "" ? this.renderDataErrorHandle() : this.renderTableContent()}
            </div>
        );
    }
});

module.exports = LogView;
