require("../css/index.less");
require("CMP_DIR/antd-table-pagination/index.less");
import RightContent from "CMP_DIR/privilege/right-content";
import TopNav from "CMP_DIR/top-nav";
import CallRecordActions from '../action/call-record-actions';
import CallRecordStore from '../store/call-record-store';
import Spinner from 'CMP_DIR/spinner';
import { Alert, Input, Icon, Button, Checkbox, Select, message, Popconfirm } from 'antd';
import { AntcTable } from "antc";
const Option = Select.Option;
import DatePicker from "CMP_DIR/datepicker";
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import CallAddCustomerForm from './call-add-customer-form';  // 添加客户
import userData from 'PUB_DIR/sources/user-data';
import CrmAction from '../../../crm/public/action/crm-actions';
import CrmRightPanel from '../../../crm/public/views/crm-right-panel';
import CallRecordAjax from '../ajax/call-record-ajax';
var classNames = require("classnames");
import rightPanelUtil from "CMP_DIR/rightPanel";
const RightPanel = rightPanelUtil.RightPanel;
import CallRecordAnalyis from './call-record-analysis';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util'
import Trace from "LIB_DIR/trace";
import commonMethodUtil from "PUB_DIR/sources/utils/common-method-util";
var hasPrivilege = require("../../../../components/privilege/checker").hasPrivilege;
import RefreshButton from 'CMP_DIR/refresh-button';
const DATE_TIME_FORMAT = oplateConsts.DATE_TIME_FORMAT;
import AppUserManage from "MOD_DIR/app_user_manage/public";

//接听状态
let CALL_STATUS_MAP = {
    'ANSWERED': Intl.get("call.record.state.answer", "已接听"),
    'NO ANSWER': Intl.get("call.record.state.no.answer", "未接听"),
    'BUSY': Intl.get("call.record.state.busy", "用户忙")
};
let searchInputTimeOut = null;
const delayTime = 800;
//计算布局的常量
const LAYOUT_CONSTANTS = {
    PADDING_TOP: 100,
    PANEL_PADDING: 40,
    TAB_HEIGHT: 53,
    RANGE_HEIGHT: 30,
    CHART_HEIGHT: 232,
    FIXED_THEAD: 50,
    TABLE_MARGIN_BOTTOM: 20,
    SUMMARY: 55
};

// 通话状态的常量
const CALL_STATUS_OPTION = {
    ALL: 'ALL',
    ANSWERED: 'ANSWERED',
    MISSED: 'NO ANSWER',
    BUSY: 'BUSY'
};

// 通话类型的常量
const CALL_TYPE_OPTION = {
    ALL: 'all',
    PHONE: 'phone',
    APP: 'app'
};

//通话记录过滤类型
const FILTER_OPTION = [
    {
        value: "all",
        label: Intl.get("common.all", "全部")
    },
    {
        value: "customer",
        label: Intl.get("call.record.filter.customer", "客户电话")
    },
    {
        value: "114",
        label: Intl.get("call.record.filter.tip", "查号电话")
    },
    {
        value: "invalid",
        label: Intl.get("call.record.filter.tip.service", "客服电话")
    }
];

const filterOptions = FILTER_OPTION.map(x => (
    <Option value={x.value}>{x.label}</Option>
));

const CallRecord = React.createClass({
    getInitialState() {
        let stateData = CallRecordStore.getState();
        return {
            ...stateData,
            filterObj: {},//表头过滤条件
            isFilter: false, //是否是过滤状态，是：展示带搜索框的标题，否：展示可排序的表头
            isAddFlag: false,  // 添加客户的标志
            phoneNumber: '', // 电话号码
            rightPanelIsShow: false, // 若添加客户已存在，打开客户详情的标志
            currentId: '',  // 查看右侧详情的id
            callType: '', // 通话类型
            selectValue: '',
            playingItemAddr: "",//正在播放的那条记录的地址
            showRightPanel: false,
            seletedRecordId: "",//当前点击的记录id
            showTextEdit: {}, //展示跟进记录的编辑框
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            CustomerInfoOfCurrUser: {},//当前展示用户所属客户的详情
        };
    },

    componentDidMount() {
        $("body").css("overflow", "hidden");
        CallRecordStore.listen(this.onStoreChange);
        this.getCallListByAjax();
        this.getCallRecommendList();
        this.changeTableHeight();
        $(window).on("resize", this.changeTableHeight);
    },
    componentWillUnmount() {
        $("body").css("overflow", "auto");
        CallRecordStore.unlisten(this.onStoreChange);
        CallRecordActions.resetState();
        $(window).off("resize", this.changeTableHeight);
    },
    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentId != prevProps.currentId) {
            var _this = this;
            setTimeout(function () {
                var callRecord = _this.state.callRecord;
                callRecord.page = 1;
                callRecord.data_list = [];
                callRecord.listenScrollBottom = false;
                _this.updateStore({
                    callRecord: callRecord
                }, function () {
                    _this.getCallListByAjax();
                });
            });
        }
        if (this.state.callRecord.total && this.state.callRecord.data_list.length === this.state.callRecord.total && !this.state.isNoMoreTipShow) {
            //滚动条区域容器
            const scrollWrap = $(".call_record_wrap");
            //滚动条区域内容
            const scrollContent = scrollWrap.children();
            //若内容高度大于容器高度，说明已显示滚动条
            if (scrollContent.height() > scrollWrap.height()) {
                //显示“没有更多数据了”的提示
                this.setState({ isNoMoreTipShow: true }, () => {
                    //将控制是否显示“没有更多数据了”提示的标识设为假，
                    //以使组件下次更新完成时能再做这个检测
                    this.state.isNoMoreTipShow = false;
                });
            }
        }
    },
    componentWillReceiveProps(newProps) {
        //外层右侧面板是否显示
        const {showRightPanel} = newProps;
        this.setState({showRightPanel});
    },
    //计算表格高度
    changeTableHeight: function () {
        var tableHeight = $(window).height() -
            LAYOUT_CONSTANTS.PADDING_TOP -
            LAYOUT_CONSTANTS.FIXED_THEAD -
            LAYOUT_CONSTANTS.TABLE_MARGIN_BOTTOM -
            LAYOUT_CONSTANTS.SUMMARY;
        this.setState({ tableHeight });
    },
    toggleFilter(e) {
        if (this.state.isFilter) {
            Trace.traceEvent(e, '点击取消搜索按钮');
        } else {
            Trace.traceEvent(e, '点击搜索按钮');
        }        
        //表头关闭过滤框,并且过滤框中还有过滤内容时
        if (this.state.isFilter && !_.isEmpty(this.state.filterObj)) {
            //清空过滤框
            this.setState({ isFilter: !this.state.isFilter, filterObj: {}, callType: '', selectValue: '' }, () => {
                //清空过滤框后，重新获取数据
                var callRecord = this.state.callRecord;
                callRecord.page = 1;
                callRecord.data_list = [];
                callRecord.listenScrollBottom = false;
                this.updateStore({
                    callRecord: callRecord
                }, () => this.getCallListByAjax());
            });
        } else {
            //表头展示过滤框、过滤框中没有内容时表头关闭过滤框
            this.setState({ isFilter: !this.state.isFilter });
        }
    },
    //表头过滤框的内容修改的处理
    onChangeFilterObj(filterKey, event) {
        if (filterKey == 'nick_name') {
            Trace.traceEvent(event, '根据呼叫者过滤');
        } else if (filterKey == 'sales_team') {
            Trace.traceEvent(event, '根据团队过滤');
        }
        this.state.filterObj[filterKey] = event.target.value;
        if (!event.target.value) {
            //清空过滤框的内容，直接进行过滤
            this.filterCallRecord(filterKey);
            delete this.state.filterObj[filterKey];
        }
        this.setState({ filterObj: this.state.filterObj });
    },
    onSelectFilterObj(filterKey, value) {
        this.state.filterObj[filterKey] = value;
        if (value == CALL_TYPE_OPTION.PHONE) {
            this.state.callType = <i className="iconfont icon-call-back" title={Intl.get("call.record.call.center", "呼叫中心")}></i>;
        } else if (value == CALL_TYPE_OPTION.APP) {
            this.state.callType = <i className="iconfont icon-ketao-app" title={Intl.get("common.ketao.app", "客套APP")}></i>;
        } else if (value == CALL_TYPE_OPTION.ALL) {
            this.state.callType = <i className="iconfont icon-all" title={Intl.get("user.online.all.type", "全部类型")}></i>;
        }
        if (value == CALL_STATUS_OPTION.ALL || value == CALL_TYPE_OPTION.ALL) {
            this.filterCallRecord(filterKey);
            return;
        }
        this.setState({ filterObj: this.state.filterObj });
        this.filterCallRecord(filterKey);
    },
    //获取过滤后的通话记录
    filterCallRecord(filterKey) {
        if (this.state.filterObj[filterKey] == undefined) {
            return;
        }
        var callRecord = this.state.callRecord;
        callRecord.page = 1;
        callRecord.data_list = [];
        callRecord.listenScrollBottom = false;
        this.updateStore({
            callRecord: callRecord
        }, () => this.getCallListByAjax());
    },
    //清空过滤框中的内容
    clearFilterContent(filterKey, event) {
        if (filterKey == 'nick_name') {
            Trace.traceEvent(event, '清空呼叫者过滤框');
        } else if (filterKey == 'sales_team') {
            Trace.traceEvent(event, '清空团队过滤框');
        }
        this.state.filterObj[filterKey] = "";
        //清空过滤框的内容，直接进行过滤
        this.filterCallRecord(filterKey);
        delete this.state.filterObj[filterKey];
        this.setState({ filterObj: this.state.filterObj });
    },
    onSearchInputKeyUp: function (filterKey) {
        if (searchInputTimeOut) {
            clearTimeout(searchInputTimeOut);
        }
        searchInputTimeOut = setTimeout(() => {
            this.filterCallRecord(filterKey);
        }, delayTime);

    },

    handleSelect(filterKey) {
        if (filterKey == 'disposition') {
            Trace.traceEvent(this.getDOMNode(), '根据通话状态过滤');
        } else if (filterKey == 'type') {
            Trace.traceEvent(this.getDOMNode(), '根据通话类型过滤');
        }
    },

    // 通话类型和通话状态的选择框
    filterTypeStatusKeySelect(filterKey, columnLabel) {
        const placeholder = Intl.get("call.record.search.placeholder", "根据{search}过滤", { search: columnLabel });
        if (filterKey == 'disposition') {  // 通话状态
            return (
                <Select
                    className="select-call-status"
                    showSearch
                    placeholder={placeholder}
                    value={this.state.filterObj[filterKey]}
                    onChange={this.onSelectFilterObj.bind(this, filterKey)}
                    onSelect={this.handleSelect.bind(this, filterKey)}
                >
                    <Option value={CALL_STATUS_OPTION.ALL}> {Intl.get("user.online.all.status", "全部状态")} </Option>
                    <Option value={CALL_STATUS_OPTION.ANSWERED}> {Intl.get("call.record.state.answer", "已接听")} </Option>
                    <Option value={CALL_STATUS_OPTION.MISSED}> {Intl.get("call.record.state.no.answer", "未接听")} </Option>
                    <Option value={CALL_STATUS_OPTION.BUSY}> {Intl.get("call.record.state.busy", "用户忙")} </Option>
                </Select>
            );
        } else if (filterKey == 'type') { // 通话类型
            return (
                <Select
                    showSearch
                    dropdownMatchSelectWidth={false}
                    placeholder={placeholder}
                    onChange={this.onSelectFilterObj.bind(this, filterKey)}
                    value={this.state.callType}
                    onSelect={this.handleSelect.bind(this, filterKey)}
                >
                    <Option value={CALL_TYPE_OPTION.ALL}>
                        <i className="iconfont  icon-all"></i>
                        <span>{Intl.get("user.online.all.type", "全部类型")}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.PHONE}>
                        <i className="iconfont icon-call-back"></i>
                        <span>{Intl.get("call.record.call.center", "呼叫中心")}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.APP}>
                        <i className="iconfont icon-ketao-app"></i>
                        <span>{Intl.get("common.ketao.app", "客套APP")}</span>
                    </Option>
                </Select>
            );
        }
    },

    // 文本框值变化时调用
    handleChange(value) {
        this.setState({
            selectValue: value
        }, () => {
            this.getCallRecommendList();
            if (!value) {
                this.state.filterObj['dst'] = '';
                this.filterCallRecord('dst');
            }
        });
    },

    // 被选中时调用
    onSelectContentChange(filterKey, value) {
        Trace.traceEvent(this.getDOMNode(), '根据电话号码过滤');
        if (this.state.recommendList.list.length) {
            this.state.filterObj[filterKey] = value;
            this.setState({
                filterObj: this.state.filterObj,
                selectValue: value
            });
        } else {
            this.state.filterObj[filterKey] = this.state.selectValue;
            this.setState({
                filterObj: this.state.filterObj
            });
        }
        this.filterCallRecord(filterKey);
    },
    // 电话内容为空的，获取的推荐列表
    getCallRecommendList() {
        let value = this.state.selectValue;
        var recommendObj = {
            filter_phone: this.state.filter_phone
        };
        var reqBody = {
            query: {
                dst: value
            },
            rang_params: [
                {
                    from: this.state.start_time,
                    to: this.state.end_time,
                    name: "call_date",
                    type: "time"
                }
            ]
        };
        CallRecordActions.getRecommendPhoneList(recommendObj, reqBody);
    },

    // 搜索电话号码时，提供推荐列表
    getSearchPhoneRecommendList(filterKey, columnLabel) {
        const placeholder = Intl.get("call.record.search.placeholder", "根据{search}过滤", { search: columnLabel });
        const recommendList = this.state.recommendList.list;
        let searchContentOptions = [];
        if (recommendList.length) {
            for (let i = 0; i < recommendList.length; i++) {
                searchContentOptions.push(<Option value={recommendList[i].key}>{recommendList[i].key + ' (' + recommendList[i].value + ')'}</Option>);
            }
        }
        return this.state.isFilter ? (<div>
            <Select combobox
                style={{ width: "140px" }}
                value={this.state.selectValue}
                onSearch={this.handleChange}
                searchPlaceholder={placeholder}
                onSelect={this.onSelectContentChange.bind(this, filterKey)} // 选中时，在进行搜索
                dropdownMatchSelectWidth={false}
                filterOption={false} // 数据是动态设置的
            >
                {searchContentOptions}
            </Select>
        </div>) : columnLabel;
    },

    //filterKey:对应的过滤字段，columnLabel:该列的表头描述
    getColumnTitle(filterKey, columnLabel) {
        const placeholder = Intl.get("call.record.search.placeholder", "根据{search}过滤", { search: columnLabel });
        let filterValue = this.state.filterObj[filterKey];

        return this.state.isFilter ? (<div className="filter-input-container">
            {filterKey == 'disposition' || filterKey == 'type' ? (
                this.filterTypeStatusKeySelect(filterKey, columnLabel)
            ) : (
                    <Input placeholder={placeholder} value={filterValue || ""}
                        onChange={this.onChangeFilterObj.bind(this, filterKey)}
                        onKeyUp={this.onSearchInputKeyUp.bind(this, filterKey)}
                    />
                )}
            {filterValue && filterKey != 'disposition' && filterKey != 'type' ? (<Icon type="cross-circle-o"
                onClick={this.clearFilterContent.bind(this, filterKey)} />) : null}
        </div>) : columnLabel;
    },
    // 添加客户和联系人面板
    showAddCustomerForm: function (phoneNumber) {
        Trace.traceEvent(this.getDOMNode(), '点击+添加客户和联系人');
        this.setState({
            isAddFlag: true,
            phoneNumber: phoneNumber
        });
    },
    // 隐藏添加客户和联系人面板
    hideAddCustomerForm: function () {
        Trace.traceEvent($(this.getDOMNode()).find(".add-customer"), '关闭添加客户和联系人面板');
        this.setState({
            isAddFlag: false
        });
    },       
    addOne: function (customer) {
        this.setState({
            isAddFlag: false
        });
    },
    showRightPanel: function (id) {
        //舆情秘书角色不让看详情
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
            return;
        }
        CrmAction.setCurrentCustomer(id);
        this.setState({
            rightPanelIsShow: true,
            currentId: id
        });
    },
    hideRightPanel: function () {
        this.setState({
            rightPanelIsShow: false,
            seletedRecordId: ""
        });
    },

    // 调整类型表格的宽度
    getCallTypeColumnWidth() {
        let widthPixel = 60;
        if (this.state.isFilter) {
            widthPixel = 100;
            if (this.state.filterObj.type) {
                widthPixel = 60;
            }
        }
        return widthPixel;
    },
    //点击播放录音
    handleAudioPlay: function (item) {
        //如果是点击切换不同的录音，找到上次点击播放的那一条记录，把他的playSelected属性去掉
        var oldItemId = "";
        var oldSelected = _.find(this.state.callRecord.data_list, function (item) { return item.playSelected; });
        if (oldSelected) {
            delete oldSelected.playSelected;
            oldItemId = oldSelected.id;
        }
        //给本条记录加上标识
        item.playSelected = true;
        var urlObj = commonMethodUtil.urlConifg(item.local, item.recording);
        //录音的地址
        var playItemAddr = "/record/" + urlObj.local + item.recording + urlObj.audioType;
        this.setState({
            callRecord: this.state.callRecord,
            playingItemAddr: playItemAddr
        }, () => {
            if ($(".audio-play-container").height() < 45) {
                $(".audio-play-container").animate({ height: '45px' }).css("border", "2px solid #eee");
            }
            var audio = $("#audio")[0];
            if (audio) {
                if (oldItemId && oldItemId == item.id) {
                    //点击当前正在播放的那条记录，重新播放
                    audio.currentTime = 0;
                } else {
                    //播放某条新记录
                    audio.play();
                }
            }
        });
    },
    //处理点击客户,存放当前选中的通话记录id
    handleClickCustomer: function (record) {
        this.setState({
            selectedRecordId: record.id,
            showRightPanel: true
        })
    },
    handleClickTextArea: function (item) {
        item.showTextEdit = !item.showTextEdit;
        this.setState(this.state);
    },
    //通话记录表格列
    getCallRecordColumns() {
        return [
            {
                title: this.getColumnTitle("type", Intl.get("common.type", "类型")),
                dataIndex: 'type',
                key: 'type',
                width: this.getCallTypeColumnWidth(),
                render: (type) => {
                    return (
                        <div>
                            {type == 'phone' ? (
                                <i className="iconfont icon-call-back" title={Intl.get("call.record.call.center", "呼叫中心")}></i>
                            ) : (
                                    <i className="iconfont icon-ketao-app" title={Intl.get("common.ketao.app", "客套APP")}></i>
                                )}
                        </div>
                    );
                }
            }, {
                title: this.getColumnTitle("nick_name", Intl.get("call.record.caller", "呼叫者")),
                dataIndex: 'nick_name',
                key: 'nick_name',
                width: this.state.isFilter ? '150px' : '100px',
                sorter: !this.state.isFilter,
                className: this.state.isFilter ? 'call-user' : 'has-filter call-user has-sorter'
            }, {
                title: this.getColumnTitle("sales_team", Intl.get("call.record.team", "团队")),
                dataIndex: 'sales_team',
                width: this.state.isFilter ? 150 : 70,
                key: 'sales_team'
            }, {
                title: this.getSearchPhoneRecommendList("dst", Intl.get("common.phone", "电话")),
                dataIndex: 'dst',
                width: this.state.isFilter ? 150 : 120,
                key: 'call_number'
            }, {
                title: Intl.get("crm.96", "地域"),
                dataIndex: 'location',
                key: 'location',
                width: 100,
                render: (text, column) => {
                    return (
                        <div>
                            {column.province ? column.province + " " : ""}
                            {column.city || ""}
                        </div>
                    )
                }
            }, {
                title: this.getColumnTitle("disposition", Intl.get("call.record.call.state", "通话状态")),
                dataIndex: 'disposition',
                key: 'call_state',
                width: this.state.isFilter ? 150 : 90,
                render: (callState, column) => {
                    var cls = "iconfont icon-audio-play";
                    //playSelected表示当前正在播放的那条录音，图标显示红色
                    cls += (column.playSelected ? " icon-selected" : "");
                    return <div>
                        {CALL_STATUS_MAP[callState]}
                        {
                            /* 按是否有recording这个字段展示播放图标*/
                            column.recording && column.billsec != 0 ? <i className={cls} onClick={this.handleAudioPlay.bind(this, column)}
                                title={Intl.get("call.record.play", "播放录音")} data-tracename="点击播放录音按钮"></i> : null
                        }
                    </div>;
                }
            }, {
                title: Intl.get("call.record.call.duration", "通话时长"),
                dataIndex: 'billsec',
                key: 'holding_time',
                sorter: true,
                width: 100,
                className: 'has-filter data-float-right has-sorter',
                render: function (billsec) {
                    return <div>{TimeUtil.getFormatTime(billsec)}</div>;
                }
            }, {
                title: Intl.get("call.recoord.call.time", "拨打时间"),
                dataIndex: 'call_date',
                key: 'call_date',
                sorter: true,
                width: 160,
                className: 'has-filter call-time has-sorter',
                render: (time) => {
                    var displayTime = moment(new Date(+time)).format(DATE_TIME_FORMAT);
                    return (
                        <div title={displayTime}>
                            {displayTime}
                        </div>
                    );
                }
            }, {
                title: Intl.get("call.record.customer", "客户"),
                dataIndex: 'customer_name',
                key: 'customer_name',
                width: 100,
                className: 'customer_column',
                render: (text, record) => {
                    return (
                        <div>
                            {record.customer_name ? (
                                <div title={Intl.get("call.record.customer.title", "点击可查看客户详情")}
                                    onClick={this.handleClickCustomer.bind(this, record)}
                                >
                                    {record.customer_name}
                                    <input type="hidden" value={record.dst} className="phone_hidden" />
                                    <input type="hidden" value={record.customer_name} className="customer_name_hidden" />
                                </div>
                            ) : (
                                    <div title="点击添加客户和联系人" onClick={this.showAddCustomerForm.bind(this, record.dst)}>
                                        <Icon type="plus"/>
                                    </div>
                                )}
                        </div>
                    )
                }

            }, {
                title: Intl.get("call.record.contacts", "联系人"),
                dataIndex: 'contact_name',
                width: '120px',
                key: 'contact_name'
            }, {
                title: Intl.get("call.record.follow.content", "跟进内容"),
                dataIndex: 'remark',
                width: this.state.isFilter ? 180 : 150,
                key: 'remark',
                render: (text, record) => {
                    return (
                        <div className="add-content">
                            <Popconfirm title={Intl.get("call.record.is.save.content.title", "是否保存跟进内容？")}
                                visible={record.confirmVisible}
                                onConfirm={this.handleContentSubmit.bind(this, record)}
                                onCancel={this.cancelConfirm.bind(this, record, record.remark)}
                                okText={Intl.get("user.yes", "是")}
                                cancelText={Intl.get("user.no", "否")}
                            >
                                {
                                    record.showTextEdit ? <textarea
                                        autoFocus
                                        className="textarea-fix"
                                        row={2}
                                        defaultValue={record.remark}
                                        onBlur={this.toggleConfirm.bind(this, record, record.remark)}
                                        type="text"
                                        id={"content" + record.id}
                                        onKeyUp={this.checkEnter.bind(this, record.id)}
                                        onScroll={event => event.stopPropagation()}
                                    /> : 
                                    <span className="text-show line-clamp line-clamp-2" onClick={this.handleClickTextArea.bind(this, record)}>
                                        {record.remark}
                                    </span>
                                }
                            </Popconfirm>
                        </div>
                    )
                }
            }
        ];
    },

    // 检测回车，触发确认对话框
    checkEnter(id) {
        if (event.keyCode == 13) {
            $(".new-custom-tbody #content" + id).blur();
        }
    },

    // 失去焦点后，触发确认对话框
    toggleConfirm(record, oldValue) {
        const id = record.id;
        let value = $(".new-custom-tbody #content" + id).val();
        if (oldValue) { // 有内容时，对应的是修改
            if (value == oldValue) { // 没做修改，直接返回，不出现确认框
                return;
            } else { // 修改内容时，出现确认框
                CallRecordActions.toggleConfirm({ id, flag: true });
            }
        } else { // 添加跟进内容时
            if (value && value.trim()) {
                CallRecordActions.toggleConfirm({ id, flag: true });
            }
        }        
    },

    // 确认框点击不保存时
    cancelConfirm(record, oldValue) {
        const id = record.id;
        Trace.traceEvent(this.getDOMNode(), '是否保存编辑的跟进内容，点击否');
        let value = $(".new-custom-tbody #content" + id).val();
        if (oldValue) { // oldValue是跟进内容原有的值，当有内容时
            $(".new-custom-tbody #content" + id).val(oldValue);
        } else {
            $(".new-custom-tbody #content" + id).focus();
        }
        this.handleClickTextArea(record);
        CallRecordActions.toggleConfirm({ id, flag: false }); // 确认框关闭
    },

    // 编辑跟进内容的提交
    handleContentSubmit(record) {
        const id = record.id;
        Trace.traceEvent(this.getDOMNode(), '是否保存编辑的跟进内容，点击是');
        CallRecordActions.toggleConfirm({ id, flag: false });
        let value = $(".new-custom-tbody #content" + record.id).val();
        var queryObj = {
            remark: value,
            id: record.id
        };
        CallRecordAjax.editCallTraceContent(queryObj).then((result) => {
            this.handleClickTextArea(record);
            if (result.result) {
                CallRecordActions.updateCallContent(queryObj);
                message.success(Intl.get("call.record.save.content.success", "保存跟进内容成功！"));
            } else {
                message.error(Intl.get("call.record.save.content.error", "保存跟进内容失败！"));
            }
        });
    },

    getRowKey: function (record, index) {
        return index;
    },
    // 过滤小于7位的号码，如114、12580...
    selectFilterPhone(value) {
        switch (value) {
            case "114":
                Trace.traceEvent("通话记录界面", '仅显示小于7位的号码');
            case "customer":
                Trace.traceEvent("通话记录界面", '仅显示客户电话');
            case "invalid":
                Trace.traceEvent("通话记录界面", '仅显示客服电话');
            default:
                Trace.traceEvent("通话记录界面", '显示全部电话');
        }
        CallRecordActions.filterPhone(value);
        setTimeout(() => {
            this.getCallRecommendList();
            this.getCallListByAjax();
        });
    },
    // 刷新
    handleRefresh() {
        CallRecordActions.handleRefresh();
        setTimeout(() => {
            this.getCallListByAjax();
        });
    },

    // 通话分析
    handleCallAnalysis() {
        CallRecordActions.showCallAnalysisPanel(true);
    },

    // 关闭通话分析界面
    closeCallAnalysisPanel(e) {
        Trace.traceEvent(e, '关闭通话分析界面');
        CallRecordActions.showCallAnalysisPanel(false);
    },

    //关闭音频播放按钮
    closeAudioPlayContainer: function (e) {
        Trace.traceEvent(e, '关闭播放器按钮');
        //找到当前正在播放的那条记录
        var oldSelected = _.find(this.state.callRecord.data_list, function (item) { return item.playSelected; });
        if (oldSelected) {
            delete oldSelected.playSelected;
        }
        this.setState({
            callRecord: this.state.callRecord,
            playingItemAddr: "",
        });
        //隐藏播放窗口
        $(".audio-play-container").animate({ height: '0' }).css("border", "0");
    },
    ShowCustomerUserListPanel:function(data) {
        this.setState({
            isShowCustomerUserListPanel: true,
            CustomerInfoOfCurrUser: data.customerObj
        });

    },
    closeCustomerUserListPanel:function() {
        this.setState({
            isShowCustomerUserListPanel: false
        })
    },
    render() {
        var scrollBarHeight = $(window).height() -
            LAYOUT_CONSTANTS.PADDING_TOP -
            LAYOUT_CONSTANTS.FIXED_THEAD -
            LAYOUT_CONSTANTS.TABLE_MARGIN_BOTTOM -
            LAYOUT_CONSTANTS.SUMMARY;
        return (<RightContent>
            <div className="call_record_content">
                <TopNav>
                    <DatePicker
                        disableDateAfterToday={true}
                        range="day"
                        onSelect={this.onSelectDate}>
                        <DatePicker.Option value="all">{Intl.get("user.time.all", "全部时间")}</DatePicker.Option>
                        <DatePicker.Option value="day">{Intl.get("common.time.unit.day", "天")}</DatePicker.Option>
                        <DatePicker.Option value="week">{Intl.get("common.time.unit.week", "周")}</DatePicker.Option>
                        <DatePicker.Option value="month">{Intl.get("common.time.unit.month", "月")}</DatePicker.Option>
                        <DatePicker.Option value="quarter">{Intl.get("common.time.unit.quarter", "季度")}</DatePicker.Option>
                        <DatePicker.Option value="custom">{Intl.get("user.time.custom", "自定义")}</DatePicker.Option>
                    </DatePicker>
                    <Button type="ghost" size="large" onClick={this.toggleFilter}
                        className="search-btn">{this.state.isFilter ? Intl.get("call.record.cancel.search", "取消搜索") : Intl.get("sales.team.search", "搜索")}</Button>
                    <div className="filter-phone-button">
                        <Select
                            className="filter-select-fix"
                            defaultValue="all"
                            dropdownMatchSelectWidth={false}
                            onChange={this.selectFilterPhone}
                        >
                            {filterOptions}
                        </Select>
                        <RefreshButton handleRefresh={this.handleRefresh}/>
                        <span className="call-analysis-btn">
                            <i className="iconfont  icon-call-analysis call-analysis" title="通话分析"
                                onClick={this.handleCallAnalysis} data-tracename="点击通话分析按钮"></i>
                        </span>
                    </div>
                </TopNav>
                <div className="call_record_wrap splice-table" id="new-table" >
                    <div style={{ height: this.state.tableHeight }}>
                        {this.renderCallRecordList()}
                    </div>
                    {
                        this.state.callRecord.data_list.length ? (
                            <div className="total_summary">
                                <ReactIntl.FormattedMessage
                                    id="common.total.data"
                                    defaultMessage={`共{num}条数据`}
                                    values={{
                                        'num': this.state.callRecord.total
                                    }}
                                />
                            </div>
                        ) : null
                    }
                </div>

            {/**
                     * 添加客户
                     */}
            <div className="add-customer">
                <CallAddCustomerForm
                    showFlag={this.state.isAddFlag}
                    hideAddForm={this.hideAddCustomerForm}
                    addOne={this.addOne}
                    showRightPanel={this.showRightPanel}
                    phoneNumber={this.state.phoneNumber}
                />
            </div>
            {/**
             添加客户时，客户名已存在，可以点开查看客户详情
                     */}
            {this.state.rightPanelIsShow ? (
                <CrmRightPanel
                    showFlag={this.state.rightPanelIsShow}
                    currentId={this.state.currentId}
                    hideRightPanel={this.hideRightPanel}
                    refreshCustomerList={function () { }}
                    ShowCustomerUserListPanel={this.ShowCustomerUserListPanel}
                />
            ) : null}
            {/*
                        底部播放器
                    */}
            <div className="audio-play-container">
                {this.state.playingItemAddr ? (
                    <div>
                        <audio id="audio" width="320" controls="controls" autoplay="autoplay"
                            src={this.state.playingItemAddr}>
                        </audio>
                        <i className="iconfont icon-close close-panel" onClick={this.closeAudioPlayContainer}></i>
                    </div>
                ) : null
                }
            </div>

            <RightPanel
                className="call-analysis-panel"
                showFlag={this.state.isShowCallAnalysisPanel}
            >
                <CallRecordAnalyis
                    closeCallAnalysisPanel={this.closeCallAnalysisPanel}
                />
            </RightPanel>
            </div>
            {/*该客户下的用户列表*/}
            <RightPanel
                className="customer-user-list-panel"
                showFlag={this.state.isShowCustomerUserListPanel}
            >
                {this.state.isShowCustomerUserListPanel?
                    <AppUserManage
                        customer_id={this.state.CustomerInfoOfCurrUser.id}
                        hideCustomerUserList={this.closeCustomerUserListPanel}
                        customer_name={this.state.CustomerInfoOfCurrUser.name}
                    />:null
                }
            </RightPanel>
        </RightContent >
        );
    },
    /**
     * 参数说明，ant-design的table组件
     * @param pagination   分页参数，当前不需要使用分页
     * @param filters      过滤器参数，当前不需要使用过滤器
     * @param sorter       排序参数，当前需要使用sorter
     *                      {field : 'xxx' //排序字段 , order : 'descend'/'ascend' //排序顺序}
     */
    onSortChange(pagination, filters, sorter) {
        var _this = this;
        var callRecord = this.state.callRecord;
        callRecord.sort_field = sorter.field;
        callRecord.sort_order = sorter.order;
        callRecord.page = 1;
        callRecord.data_list = [];
        callRecord.listenScrollBottom = false;
        this.updateStore({
            callRecord: callRecord
        }, function () {
            _this.getCallListByAjax();
        });
    },

    onSelectDate(start_time, end_time) {
        var callRecord = this.state.callRecord;
        callRecord.page = 1;
        callRecord.data_list = [];
        callRecord.listenScrollBottom = false;
        var _this = this;
        if (!start_time) {
            start_time = moment('2010-01-01 00:00:00').valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf("day").valueOf();
        }
        this.updateStore({
            callRecord: callRecord,
            start_time: start_time,
            end_time: end_time
        }, () => {
            this.getCallRecommendList();
            this.getCallListByAjax();
        });
    },

    updateStore(obj, callback) {
        $.extend(CallRecordStore.state, obj);
        this.setState(CallRecordStore.getState(), () => {
            callback && callback();
        });
    },
    //获取请求参数
    getReqParam(obj, prop) {
        var val = obj && prop in obj ? obj[prop] : this.state[prop];
        return val;
    },
    //获取日志列表的请求参数
    getCallListReqParam(obj, prop) {
        var val = obj && prop in obj ? obj[prop] : this.state.callRecord[prop];
        return val;
    },
    getCallListByAjax(queryParam) {
        var queryObj = {
            start_time: this.getReqParam(queryParam, 'start_time'),
            end_time: this.getReqParam(queryParam, 'end_time'),
            //page: _this.getCallListReqParam(queryParam, 'page'),
            page_size: 20,
            lastId: queryParam ? queryParam.lastId : "",
            sort_field: this.getCallListReqParam(queryParam, 'sort_field'),
            sort_order: this.getCallListReqParam(queryParam, 'sort_order'),
            //电话记录类型
            phone_type: this.getReqParam(queryParam, 'phone_type'),
            //角色类型
            type: hasPrivilege("CUSTOMER_TRACE_MANAGER_QUERY") ? "manager" : "user"
        };
        CallRecordActions.getCallRecordList(queryObj, this.state.filterObj);
    },

    handleScrollBottom() {
        //下拉加载数据
        let callRecordList = this.state.callRecord.data_list, lastId;
        if (_.isArray(callRecordList) && callRecordList.length > 0) {
            lastId = callRecordList[callRecordList.length - 1].id;//最后一个客户的id
        }
        this.getCallListByAjax({ lastId: lastId });
    },
    renderCallRecordList() {
        return (
            <div className="call-record-fix">
                {this.renderCallRecordContent()}               
            </div>
        );
    },
    showNoMoreDataTip: function () {
        return !this.state.callRecord.is_loading &&
               this.state.callRecord.data_list.length >= this.state.callRecord.page_size &&
               !this.state.callRecord.listenScrollBottom;
    },
    //处理选中行的样式
    handleRowClassName: function (record, index) {
        if ((record.id == this.state.selectedRecordId) && this.state.showRightPanel) {
            return "current_row";
        }
        else {
            return "";
        }
    },
    renderCallRecordContent() {
        //只有第一页的时候，显示loading和错误信息
        if (this.state.callRecord.page === 1) {
            if (this.state.callRecord.errorMsg) {
                return <div className="alert-wrap">
                    <Alert
                        message={this.state.callRecord.errorMsg}
                        type="error"
                        showIcon={true}
                    />
                </div>;
            }
        }
        //首次加载时不显示下拉加载状态
        const handleScrollLoading = () => {
            if (this.state.callRecord.page === 1) {
                return false
            }
            return this.state.callRecord.is_loading
        }

        const tableClassnames = classNames("new-custom-tbody",{
            "hide-body": this.state.callRecord.is_loading && this.state.callRecord.page === 1 ,
        });

        const dropLoadConfig = {
            loading: handleScrollLoading(),
            listenScrollBottom: this.state.callRecord.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            showNoMoreDataTip: this.showNoMoreDataTip()
        }

        return (
            <div style={{ position: "relative" }}>
                <Spinner
                    className={(this.state.callRecord.page === 1 && this.state.callRecord.is_loading) ? "spin-fix" : "hide"}
                />
                <div
                    className={tableClassnames}
                    ref="thead"
                >
                    <AntcTable
                        dropLoad={dropLoadConfig}
                        util={{zoomInSortArea: true}}
                        ref={this.tableBody}
                        dataSource={this.state.callRecord.data_list}
                        rowKey={this.getRowKey}
                        columns={this.getCallRecordColumns()}
                        rowClassName={this.handleRowClassName}
                        onChange={this.onSortChange}
                        pagination={false}
                        scroll={{ x: this.state.isFilter ? 1450 : 1150, y: this.state.tableHeight }}
                    />
                </div>
            </div>
        );
    },
    onStoreChange() {
        this.setState(CallRecordStore.getState());
    }
});


export default injectIntl(CallRecord);