var React = require('react');
require('../css/index.less');
require('CMP_DIR/antd-table-pagination/index.less');
import RightContent from 'CMP_DIR/privilege/right-content';
import TopNav from 'CMP_DIR/top-nav';
import CallRecordActions from '../action/call-record-actions';
import CallRecordStore from '../store/call-record-store';
import Spinner from 'CMP_DIR/spinner';
import { Alert, Input, Icon, Button, Select, message, Popconfirm, Menu, Dropdown} from 'antd';
import { AntcTable } from 'antc';
const Option = Select.Option;
import { AntcDatePicker as DatePicker } from 'antc';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import {getCallSystemConfig} from 'PUB_DIR/sources/utils/common-data-util';
import CallAddCustomerForm from './call-add-customer-form'; // 添加客户
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
import userData from 'PUB_DIR/sources/user-data';
import CrmAction from '../../../crm/public/action/crm-actions';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import CallRecordAjax from '../ajax/call-record-ajax';
var classNames = require('classnames');
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
import CallRecordAnalyis from './call-record-analysis';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import Trace from 'LIB_DIR/trace';
import commonMethodUtil from 'PUB_DIR/sources/utils/common-method-util';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import PhoneAddToCustomerForm from 'CMP_DIR/phone-add-to-customer-form';
import RefreshButton from 'CMP_DIR/refresh-button';
const DATE_TIME_FORMAT = oplateConsts.DATE_TIME_FORMAT;
import BottomTotalCount from 'CMP_DIR/bottom-total-count';
import { ignoreCase } from 'LIB_DIR/utils/selectUtil';
import ShearContent from 'CMP_DIR/shear-content';
//接听状态
let CALL_STATUS_MAP = {
    'ANSWERED': Intl.get('call.record.state.answer', '已接听'),
    'NO ANSWER': Intl.get('call.record.state.no.answer', '未接听'),
    'BUSY': Intl.get('call.record.state.busy', '用户忙')
};
//是否普通销售
let isCommonSales = userData.getUserData().isCommonSales;
let searchInputTimeOut = null;
var audioMsgEmitter = require('PUB_DIR/sources/utils/emitters').audioMsgEmitter;
// 通话状态的常量
const CALL_STATUS_OPTION = {
    ALL: 'ALL',
    ANSWERED: 'ANSWERED',
    MISSED: 'NO ANSWER',
    BUSY: 'BUSY'
};

// 通话类型的常量
const CALL_TYPE_OPTION = {
    ALL: '',
    PHONE: 'phone',//呼叫中心 - effung的电话系统（讯时+usterisk）
    CURTAO_PHONE: 'curtao_phone',//呼叫中心 - 容联的电话系统（curtao默认通话系统）
    APP: 'app',
    CALL_BACK: 'call_back',
};

//通话记录过滤类型
const FILTER_OPTION = [
    {
        value: 'all',
        label: Intl.get('common.all', '全部')
    },
    {
        value: 'customer',
        label: Intl.get('call.record.filter.customer', '客户电话')
    },
    {
        value: '114',
        label: Intl.get('call.record.filter.tip', '查号电话')
    },
    {
        value: 'invalid',
        label: Intl.get('call.record.filter.tip.service', '客服电话')
    }
];
//添加客户、添加到已有客户的menu选项
const ADD_CUSTOMER_MENUS = {
    ADD_CUSTOMER: 'addCustomer',
    ADD_TO_CUSTOMER: 'addToCustomer'
};

const filterOptions = FILTER_OPTION.map((x, index) => (
    <Option key={index} value={x.value}>{x.label}</Option>
));

class CallRecord extends React.Component {
    constructor(props) {
        super(props);
        CallRecordActions.resetState();
        let stateData = CallRecordStore.getState();

        this.state = {
            ...stateData,
            filterObj: {},//表头过滤条件
            isFilter: false, //是否是过滤状态，是：展示带搜索框的标题，否：展示可排序的表头
            isAddFlag: false, // 添加客户的标志
            isAddToCustomerFlag: false, //添加到已有客户的标识
            phoneNumber: '', // 电话号码
            rightPanelIsShow: false, // 若添加客户已存在，打开客户详情的标志
            currentId: '', // 查看右侧详情的id
            callType: '', // 通话类型
            selectValue: '',
            showRightPanel: false,
            seletedRecordId: '',//当前点击的记录id
            showTextEdit: {}, //展示跟进记录的编辑框
            isShowEffectiveTimeAndCount: false, // 是否展示有效通话时长和有效接通数
        };
    }

    componentDidMount() {
        $('body').css('overflow', 'hidden');
        CallRecordStore.listen(this.onStoreChange);
        // 获取组织电话系统配置
        this.getCallSystemConfig();
        this.getCallListByAjax();
        this.getCallRecommendList();
        this.changeTableHeight();
        $(window).on('resize', this.changeTableHeight);
    }

    componentWillUnmount() {
        $('body').css('overflow', 'auto');
        CallRecordStore.unlisten(this.onStoreChange);
        CallRecordActions.resetState();
        $(window).off('resize', this.changeTableHeight);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.currentId !== prevProps.currentId) {
            var _this = this;
            setTimeout(function() {
                var callRecord = _this.state.callRecord;
                callRecord.page = 1;
                callRecord.data_list = [];
                callRecord.listenScrollBottom = false;
                _this.updateStore({
                    callRecord: callRecord
                }, function() {
                    _this.getCallListByAjax();
                });
            });
        }
    }

    componentWillReceiveProps(newProps) {
        //外层右侧面板是否显示
        const {showRightPanel} = newProps;
        this.setState({showRightPanel});
    }

    //计算表格高度
    changeTableHeight = () => {
        var tableHeight = commonMethodUtil.getTableContainerHeight();
        this.setState({ tableHeight });
    };

    toggleFilter = (e) => {
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
    };

    //表头过滤框的内容修改的处理
    onChangeFilterObj = (filterKey, event) => {
        if (filterKey === 'nick_name') {
            Trace.traceEvent(event, '根据呼叫者过滤');
        } else if (filterKey === 'sales_team') {
            Trace.traceEvent(event, '根据团队过滤');
        }
        this.state.filterObj[filterKey] = event.target.value;
        if (!event.target.value) {
            //清空过滤框的内容，直接进行过滤
            this.filterCallRecord(filterKey);
            delete this.state.filterObj[filterKey];
        }
        this.setState({ filterObj: this.state.filterObj });
    };

    onSelectFilterObj = (filterKey, value) => {
        this.state.filterObj[filterKey] = value;
        if (value === `${CALL_TYPE_OPTION.PHONE},${CALL_TYPE_OPTION.CURTAO_PHONE}`) {
            this.state.callType = <i className="iconfont icon-call-back" title={Intl.get('call.record.call.center', '呼叫中心')}></i>;
        } else if (value === CALL_TYPE_OPTION.APP) {
            this.state.callType = <i className="iconfont icon-ketao-app" title={Intl.get('common.ketao.app', '客套APP')}></i>;
        } else if (value === CALL_TYPE_OPTION.ALL) {
            this.state.callType = <i className="iconfont icon-all" title={Intl.get('user.online.all.type', '全部类型')}></i>;
        } else if (value === CALL_TYPE_OPTION.CALL_BACK) {
            this.state.callType = <i className='iconfont icon-callback' title={Intl.get('common.callback', '回访')}></i>;
        }
        if (value === CALL_STATUS_OPTION.ALL || value === CALL_TYPE_OPTION.ALL) {
            this.filterCallRecord(filterKey);
            return;
        }
        this.setState({ filterObj: this.state.filterObj });
        this.filterCallRecord(filterKey);
    };

    //获取过滤后的通话记录
    filterCallRecord = (filterKey) => {
        if (this.state.filterObj[filterKey] === undefined) {
            return;
        }
        var callRecord = this.state.callRecord;
        callRecord.page = 1;
        callRecord.data_list = [];
        callRecord.listenScrollBottom = false;
        this.updateStore({
            callRecord: callRecord
        }, () => this.getCallListByAjax());
    };

    onSearchInputKeyUp = (filterKey) => {
        this.filterCallRecord(filterKey);
    };

    handleSelect = (filterKey) => {
        if (filterKey === 'disposition') {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '根据通话状态过滤');
        } else if (filterKey === 'type') {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '根据通话类型过滤');
        }
    };

    // 通话类型和通话状态的选择框
    filterTypeStatusKeySelect = (filterKey, columnLabel) => {
        const placeholder = Intl.get('call.record.search.placeholder', '根据{search}过滤', { search: columnLabel });
        if (filterKey === 'disposition') { // 通话状态
            return (
                <Select
                    className="select-call-status"
                    showSearch
                    placeholder={placeholder}
                    value={this.state.filterObj[filterKey]}
                    onChange={this.onSelectFilterObj.bind(this, filterKey)}
                    onSelect={this.handleSelect.bind(this, filterKey)}
                    filterOption={(input, option) => ignoreCase(input, option)}
                >
                    <Option value={CALL_STATUS_OPTION.ALL}> {Intl.get('user.online.all.status', '全部状态')} </Option>
                    <Option value={CALL_STATUS_OPTION.ANSWERED}> {Intl.get('call.record.state.answer', '已接听')} </Option>
                    <Option value={CALL_STATUS_OPTION.MISSED}> {Intl.get('call.record.state.no.answer', '未接听')} </Option>
                    <Option value={CALL_STATUS_OPTION.BUSY}> {Intl.get('call.record.state.busy', '用户忙')} </Option>
                </Select>
            );
        } else if (filterKey === 'type') { // 通话类型
            return (
                <Select
                    showSearch
                    dropdownMatchSelectWidth={false}
                    placeholder={placeholder}
                    onChange={this.onSelectFilterObj.bind(this, filterKey)}
                    value={this.state.callType}
                    onSelect={this.handleSelect.bind(this, filterKey)}
                    style={{minWidth: '50px'}}
                    filterOption={(input, option) => ignoreCase(input, option)}
                >
                    <Option value={CALL_TYPE_OPTION.ALL}>
                        <i className="iconfont  icon-all"></i>
                        <span>{Intl.get('user.online.all.type', '全部类型')}</span>
                    </Option>
                    <Option value={`${CALL_TYPE_OPTION.PHONE},${CALL_TYPE_OPTION.CURTAO_PHONE}`}>
                        <i className="iconfont  icon-call-back"></i>
                        <span>{Intl.get('call.record.call.center', '呼叫中心')}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.APP}>
                        <i className="iconfont icon-ketao-app"></i>
                        <span>{Intl.get('common.ketao.app', '客套APP')}</span>
                    </Option>
                    <Option value={CALL_TYPE_OPTION.CALL_BACK}>
                        <i className='iconfont icon-callback'></i>
                        <span>{Intl.get('common.callback', '回访')}</span>
                    </Option>
                </Select>
            );
        }
    };

    // 文本框值变化时调用
    handleChange = (value) => {
        value = _.trim(value);
        this.setState({
            selectValue: value
        }, () => {
            this.getCallRecommendList();
            if (!value) {
                this.state.filterObj['dst'] = '';
                this.filterCallRecord('dst');
            }
        });
    };

    // 被选中时调用
    onSelectContentChange = (filterKey, value) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '根据电话号码过滤');
        value = _.trim(value);
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
    };

    // 电话内容为空的，获取的推荐列表
    getCallRecommendList = () => {
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
                    name: 'call_date',
                    type: 'time'
                }
            ]
        };
        CallRecordActions.getRecommendPhoneList(recommendObj, reqBody);
    };

    // 搜索电话号码时，提供推荐列表
    getSearchPhoneRecommendList = (filterKey, columnLabel) => {
        const placeholder = Intl.get('call.record.search.placeholder', '根据{search}过滤', { search: columnLabel });
        const recommendList = this.state.recommendList.list;
        let searchContentOptions = [];
        if (_.isArray(recommendList) && recommendList.length) {
            for (let i = 0; i < recommendList.length; i++) {
                let showLabel = recommendList[i].key;
                //第一项是输入的内容，不显示个数
                if(recommendList[i].value){
                    showLabel += ' (' + recommendList[i].value + ')';
                }
                searchContentOptions.push(<Option value={recommendList[i].key}>{showLabel}</Option>);
            }
        }
        return this.state.isFilter ? (<div>
            <Select combobox
                style={{ width: '140px' }}
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
    };

    //filterKey:对应的过滤字段，columnLabel:该列的表头描述
    getColumnTitle = (filterKey, columnLabel) => {
        const placeholder = Intl.get('call.record.search.placeholder', '根据{search}过滤', { search: columnLabel });
        let filterValue = this.state.filterObj[filterKey];
        return this.state.isFilter ? (<div className="filter-input-container">
            {filterKey === 'disposition' || filterKey === 'type' ? (
                this.filterTypeStatusKeySelect(filterKey, columnLabel)
            ) : (
                <Input placeholder={placeholder} value={filterValue || ''}
                    onChange={this.onChangeFilterObj.bind(this, filterKey)}
                    onPressEnter={this.onSearchInputKeyUp.bind(this, filterKey)}
                />
            )}
            {filterValue && filterKey !== 'disposition' && filterKey !== 'type' ? (
                <Icon type="search" onClick={this.onSearchInputKeyUp.bind(this, filterKey)}/>
            ) : null}
        </div>) : columnLabel;
    };

    // 添加客户和联系人面板
    showAddCustomerForm = (phoneNumber) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击添加客户链接');
        this.setState({
            isAddFlag: true,
            phoneNumber: phoneNumber
        });
    };

    // 隐藏添加客户和联系人面板
    hideAddCustomerForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-customer'), '关闭添加客户和联系人面板');
        this.setState({
            isAddFlag: false
        });
    };

    //展示添加到已有客户面板
    showAddToCustomerForm = (phoneNumber) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), '点击添加到已有客户');
        this.setState({
            isAddToCustomerFlag: true,
            phoneNumber: phoneNumber
        });
    };
    // 隐藏添加到已有客户面板
    hideAddToCustomerForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)), '关闭添加到已有客户面板');
        this.setState({
            isAddToCustomerFlag: false
        });
    };

    afterAddCustomer = (customer) => {
        let callRecord = this.state.callRecord;
        let list = callRecord.data_list;
        let phone = _.get(customer,'[0].phones[0]');

        _.map(list,(cont) => {
            if(cont.dst === phone){
                cont.customer_name = _.get(customer, '[0].name');
                cont.customer_id = _.get(customer,'[0].id');
            }
        });
        this.setState({callRecord});
    };

    showRightPanel = (id) => {
        //舆情秘书角色不让看详情
        if (userData.hasRole(userData.ROLE_CONSTANS.SECRETARY)) {
            return;
        }
        CrmAction.setCurrentCustomer(id);
        this.setState({
            rightPanelIsShow: true,
            currentId: id
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: id,
                hideRightPanel: this.hideRightPanel,
                ShowCustomerUserListPanel: this.props.ShowCustomerUserListPanel
            }
        });
    };

    hideRightPanel = () => {
        this.setState({
            rightPanelIsShow: false,
            seletedRecordId: ''
        });
    };

    // 调整类型表格的宽度
    getCallTypeColumnWidth = () => {
        let widthPixel = 60;
        if (this.state.isFilter) {
            widthPixel = 100;
            if (this.state.filterObj.type) {
                widthPixel = 60;
            }
        }
        return widthPixel;
    };

    //点击播放录音
    handleAudioPlay = (item) => {
        //如果是点击切换不同的录音，找到上次点击播放的那一条记录，把他的playSelected属性去掉
        var oldItemId = '';
        var oldSelected = _.find(this.state.callRecord.data_list, function(item) { return item.playSelected; });
        if (oldSelected) {
            delete oldSelected.playSelected;
            oldItemId = oldSelected.id;
        }
        //给本条记录加上标识
        item.playSelected = true;
        audioMsgEmitter.emit(audioMsgEmitter.OPEN_AUDIO_PANEL, {
            curPlayItem: item,
            closeAudioPlayContainer: this.closeAudioPlayContainer,
        });
        this.setState({
            callRecord: this.state.callRecord,
        }, () => {
            var audio = $('#audio')[0];
            if (audio) {
                if (oldItemId && oldItemId === item.id) {
                    //点击当前正在播放的那条记录，重新播放
                    audio.currentTime = 0;
                } else {
                    //播放某条新记录
                    audio.play();
                }
            }
        });
    };

    //处理点击客户,存放当前选中的通话记录id
    handleClickCustomer = (record) => {
        this.setState({
            selectedRecordId: record.id,
            showRightPanel: true
        });
    };

    handleClickTextArea = (item) => {
        item.showTextEdit = !item.showTextEdit;
        this.setState(this.state);
    };
    handleEditBtnClick = (item) => {
        item.showTextEdit = !item.showTextEdit;
        this.setState(this.state);
    }

    onClickAddCustomerMenu = (record, params) => {
        if (params.key === ADD_CUSTOMER_MENUS.ADD_CUSTOMER) {
            this.showAddCustomerForm(record.dst);
        } else if (params.key === ADD_CUSTOMER_MENUS.ADD_TO_CUSTOMER) {
            this.showAddToCustomerForm(record.dst);
        }
    };

    getAddCustomerMenus(record){
        return (
            <Menu onClick={this.onClickAddCustomerMenu.bind(this,record)}>
                <Menu.Item key={ADD_CUSTOMER_MENUS.ADD_CUSTOMER}>
                    <a>{Intl.get('crm.3', '添加客户')}</a>
                </Menu.Item>
                <Menu.Item key={ADD_CUSTOMER_MENUS.ADD_TO_CUSTOMER}>
                    <a>{Intl.get('crm.add.to.exist.customer', '添加到已有客户')}</a>
                </Menu.Item>
            </Menu>
        );
    }
    //编辑时光标移动到尾部
    cursorBackward = (record,oldValue) => {
        if(oldValue){
            const id = record.id;
            let obj = $('.new-custom-tbody #content' + id);
            obj.val('').focus().val(oldValue).scrollTop(obj.height());

        }
    }
    //修改跟进记录的按钮和内容
    editButton = (record) => {
        if(record.remark){
            return(
                <span className="text-show line-clamp " >
                    <ShearContent lines={2} hasEditBtn={true} editBtnChange={this.handleEditBtnClick.bind(this,record)}>{record.remark}</ShearContent>
                </span>
            );
        }else{
            return(
                <span className="text-show line-clamp " >
                    <i className="iconfont icon-edit-btn-plus handle-btn-item " 
                        onClick={this.handleClickTextArea.bind(this, record)}
                        title={Intl.get('crm.record.edit.record.tip','点击修改跟进记录')}/>
                </span>
            );
        }                      
    }

    //通话记录表格列
    getCallRecordColumns = () => {
        let list = [
            {
                title: this.getColumnTitle('type', Intl.get('common.type', '类型')),
                dataIndex: 'type',
                key: 'type',
                width: this.getCallTypeColumnWidth(),
                render: (type, column) => {
                    var cls = classNames('iconfont',{
                        'icon-callrecord-out': column.call_type === 'OU',//呼出的电话
                        'icon-callrecord-in': column.call_type === 'IN',//呼出的电话
                        'icon-phone-call-out': !column.call_type
                    });
                    let returnContent;
                    if (type === CALL_TYPE_OPTION.PHONE || type === CALL_TYPE_OPTION.CURTAO_PHONE) {
                        //回访电话的处理
                        if (column.call_back === 'true') {
                            returnContent =
                                <i className='iconfont icon-callback' title={Intl.get('common.callback', '回访')}></i>;
                        } else {
                            returnContent = <i className={cls} title={Intl.get('call.record.call.center', '呼叫中心')}></i>;
                        }
                    } else {
                        returnContent = <i className="iconfont icon-ketao-app" title={Intl.get('common.ketao.app', '客套APP')}></i>;
                    }
                    return (
                        <div className="icon-column">
                            {returnContent}
                        </div>
                    );
                }
            }, {
                title: this.getColumnTitle('nick_name', Intl.get('call.record.caller', '呼叫者')),
                dataIndex: 'nick_name',
                key: 'nick_name',
                width: this.state.isFilter ? '150px' : '100px',
                className: this.state.isFilter ? 'call-user' : 'has-filter call-user has-sorter'
            }, {
                title: this.getColumnTitle('sales_team', Intl.get('call.record.team', '团队')),
                dataIndex: 'sales_team',
                width: this.state.isFilter ? 150 : 70,
                key: 'sales_team'
            }, {
                title: this.getSearchPhoneRecommendList('dst', Intl.get('common.phone', '电话')),
                dataIndex: 'dst',
                width: this.state.isFilter ? 150 : 120,
                align: 'left',
                key: 'call_number'
            }, {
                title: Intl.get('crm.96', '地域'),
                dataIndex: 'location',
                key: 'location',
                width: 100,
                render: (text, column) => {
                    return (
                        <div>
                            {column.province ? column.province + ' ' : ''}
                            {column.city || ''}
                        </div>
                    );
                }
            }, {
                title: this.getColumnTitle('disposition', Intl.get('call.record.call.state', '通话状态')),
                dataIndex: 'disposition',
                key: 'call_state',
                width: this.state.isFilter ? 150 : 90,
                render: (callState, column) => {
                    var cls = 'iconfont icon-audio-play';
                    //playSelected表示当前正在播放的那条录音，图标显示红色
                    cls += (column.playSelected ? ' icon-selected' : '');
                    return <div>
                        {CALL_STATUS_MAP[callState]}
                        {
                            /* 按是否有is_record_upload这个字段展示播放图标*/
                            column.is_record_upload === '1' && column.recording && column.billsec !== 0 ?
                                <i className={cls} onClick={this.handleAudioPlay.bind(this, column)}
                                    title={Intl.get('call.record.play', '播放录音')} data-tracename="点击播放录音按钮"></i> : null

                        }
                    </div>;
                }
            }, {
                title: Intl.get('call.record.call.duration', '通话时长'),
                dataIndex: 'billsec',
                key: 'holding_time',
                sorter: true,
                width: 100,
                className: 'has-filter data-float-right has-sorter',
                render: function(billsec) {
                    return <div>{TimeUtil.getFormatTime(billsec)}</div>;
                }
            }, {
                title: Intl.get('call.recoord.call.time', '拨打时间'),
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
                title: Intl.get('call.record.customer', '客户'),
                dataIndex: 'customer_name',
                key: 'customer_name',
                width: 100,
                className: 'customer_column',
                render: (text, record) => {
                    return (
                        <div>
                            {record.customer_name ? (
                                <div title={Intl.get('call.record.customer.title', '点击可查看客户详情')}
                                    onClick={this.handleClickCustomer.bind(this, record)}
                                >
                                    {record.customer_name}
                                    <input type="hidden" value={record.customer_id} className="customer_id_hidden"/>
                                    <input type="hidden" value={record.dst} className="phone_hidden" />
                                    <input type="hidden" value={record.customer_name} className="customer_name_hidden" />
                                </div>
                            ) : (
                                <Dropdown overlay={this.getAddCustomerMenus(record)} trigger={['click']}>
                                    <Icon type="plus" className="add-customer-icon handle-btn-item"/>
                                </Dropdown>
                            )}
                        </div>
                    );
                }

            }, {
                title: Intl.get('call.record.contacts', '联系人'),
                dataIndex: 'contact_name',
                width: '120px',
                key: 'contact_name'
            }, {
                title: Intl.get('call.record.follow.content', '跟进内容'),
                dataIndex: 'remark',
                width: this.state.isFilter ? 180 : 150,
                key: 'remark',
                render: (text, record) => {
                    return (
                        <div className="add-content">
                            <Popconfirm title={Intl.get('call.record.is.save.content.title', '是否保存跟进内容？')}
                                visible={record.confirmVisible}
                                onConfirm={this.handleContentSubmit.bind(this, record)}
                                onCancel={this.cancelConfirm.bind(this, record, record.remark)}
                                okText={Intl.get('user.yes', '是')}
                                cancelText={Intl.get('user.no', '否')}
                            >
                                {
                                    record.showTextEdit ? <textarea
                                        autoFocus
                                        className="textarea-fix"
                                        defaultValue={record.remark}
                                        onFocus={this.cursorBackward.bind(this,record, record.remark)}
                                        onBlur={this.toggleConfirm.bind(this, record, record.remark)}
                                        type="text"
                                        id={'content' + record.id}
                                        onKeyUp={this.checkEnter.bind(this, record.id)}
                                        onScroll={event => event.stopPropagation()}
                                    /> : this.editButton(record)
                                }
                            </Popconfirm>
                        </div>
                    );
                }
            }
        ];
        if(isCommonSales){
            list = _.filter(list,(o) => {
                return o.dataIndex !== 'nick_name' && o.dataIndex !== 'sales_team';
            });
        }
        return list;
    };

    // 检测回车，触发确认对话框
    checkEnter = (id, event) => {
        if (event.keyCode === 13) {
            $('.new-custom-tbody #content' + id).blur();
        }
    };

    // 失去焦点后，触发确认对话框
    toggleConfirm = (record, oldValue) => {
        const id = record.id;
        let value = $('.new-custom-tbody #content' + id).val();
        if (oldValue) { // 有内容时，对应的是修改
            if (value === oldValue) {
                // 没做修改，直接返回，不出现确认框
                record.showTextEdit = !record.showTextEdit;
                this.setState(this.state);
                return;
            } else { // 修改内容时，出现确认框
                CallRecordActions.toggleConfirm({ id, flag: true });
            }
        } else { // 添加跟进内容时
            if (_.trim(value)) {
                CallRecordActions.toggleConfirm({ id, flag: true });
            }else{
                record.showTextEdit = !record.showTextEdit;
                this.setState(this.state);
            }
        }
    };

    // 确认框点击不保存时
    cancelConfirm = (record, oldValue) => {
        const id = record.id;
        Trace.traceEvent(ReactDOM.findDOMNode(this), '是否保存编辑的跟进内容，点击否');
        let value = $('.new-custom-tbody #content' + id).val();
        if (oldValue) { // oldValue是跟进内容原有的值，当有内容时
            $('.new-custom-tbody #content' + id).val(oldValue);
        } else {
            $('.new-custom-tbody #content' + id).focus();
        }
        this.handleClickTextArea(record);
        CallRecordActions.toggleConfirm({ id, flag: false }); // 确认框关闭
    };

    // 编辑跟进内容的提交
    handleContentSubmit = (record) => {
        const id = record.id;
        Trace.traceEvent(ReactDOM.findDOMNode(this), '是否保存编辑的跟进内容，点击是');
        CallRecordActions.toggleConfirm({ id, flag: false });
        let value = $('.new-custom-tbody #content' + record.id).val();
        let queryObj = {
            id: record.id,
            dst: record.dst,
            remark: value
        };
        //有客户id时，直接把客户id传给后端的，后端就省一步通过电话号码查询客户的处理
        if (record.customer_id) {
            queryObj.customer_id = record.customer_id;
        }
        CallRecordAjax.editCallTraceContent(queryObj).then((result) => {
            this.handleClickTextArea(record);
            if (result.result) {
                CallRecordActions.updateCallContent(queryObj);
                message.success(Intl.get('call.record.save.content.success', '保存跟进内容成功！'));
            } else {
                message.error(Intl.get('call.record.save.content.error', '保存跟进内容失败！'));
            }
        });
    };

    getRowKey = (record, index) => {
        return index;
    };

    // 过滤小于7位的号码，如114、12580...
    selectFilterPhone = (value) => {
        switch (value) {
            case '114':
                Trace.traceEvent('通话记录界面', '仅显示小于7位的号码');
                break;
            case 'customer':
                Trace.traceEvent('通话记录界面', '仅显示客户电话');
                break;
            case 'invalid':
                Trace.traceEvent('通话记录界面', '仅显示客服电话');
                break;
            default:
                Trace.traceEvent('通话记录界面', '显示全部电话');
                break;
        }
        CallRecordActions.filterPhone(value);
        setTimeout(() => {
            this.getCallRecommendList();
            this.getCallListByAjax();
        });
    };

    // 刷新
    handleRefresh = () => {
        CallRecordActions.handleRefresh();
        setTimeout(() => {
            this.getCallListByAjax();
        });
    };

    // 通话分析
    handleCallAnalysis = () => {
        CallRecordActions.showCallAnalysisPanel(true);
    };

    // 关闭通话分析界面
    closeCallAnalysisPanel = (e) => {
        Trace.traceEvent(e, '关闭通话分析界面');
        CallRecordActions.showCallAnalysisPanel(false);
    };

    //关闭音频播放按钮
    closeAudioPlayContainer = (e) => {
        Trace.traceEvent(e, '关闭播放器按钮');
        //找到当前正在播放的那条记录
        var oldSelected = _.find(this.state.callRecord.data_list, function(item) { return item.playSelected; });
        if (oldSelected) {
            delete oldSelected.playSelected;
        }
        this.setState({
            callRecord: this.state.callRecord,
        });
        //隐藏播放窗口
        $('.audio-play-container').animate({ height: '0' }).css('border', '0');
    };
    
    // 获取组织电话系统配置
    getCallSystemConfig() {
        getCallSystemConfig().then(config => {
            const isFilter114 = _.get(config, 'filter_114');
            let isShowEffectiveTimeAndCount = isFilter114 || _.get(config,'filter_customerservice_number',false);
            this.setState({ isShowEffectiveTimeAndCount, isFilter114 });
        });
    }

    render() {
        //是否隐藏总数，蚁坊组织下的客户经理查看今天的数据时隐藏总数
        const isHideTotal = this.state.start_time === moment().startOf('day').valueOf() && commonMethodUtil.isEefungCustomerManager();

        return (<RightContent>
            <div className="call_record_content">
                <TopNav>
                    <div className="filter-phone-button float-l">
                        <Button type={this.state.isFilter ? 'primary' : 'ghost'} size="large" onClick={this.toggleFilter}
                            className="btn-item">{this.state.isFilter ? Intl.get('call.record.cancel.search', '取消搜索') : Intl.get('sales.team.search', '搜索')}</Button>
                    </div>
                    <DatePicker
                        className="btn-item"
                        disableDateAfterToday={true}
                        range="day"
                        onSelect={this.onSelectDate}>
                        <DatePicker.Option value="all">{Intl.get('user.time.all', '全部时间')}</DatePicker.Option>
                        <DatePicker.Option value="day">{Intl.get('common.time.unit.day', '天')}</DatePicker.Option>
                        <DatePicker.Option value="week">{Intl.get('common.time.unit.week', '周')}</DatePicker.Option>
                        <DatePicker.Option value="month">{Intl.get('common.time.unit.month', '月')}</DatePicker.Option>
                        <DatePicker.Option value="quarter">{Intl.get('common.time.unit.quarter', '季度')}</DatePicker.Option>
                        <DatePicker.Option value="custom">{Intl.get('user.time.custom', '自定义')}</DatePicker.Option>
                    </DatePicker>
                    <div className="filter-phone-button float-r">
                        <Select
                            className="btn-item"
                            defaultValue="all"
                            dropdownMatchSelectWidth={false}
                            onChange={this.selectFilterPhone}
                        >
                            {filterOptions}
                        </Select>
                        <Button onClick={this.handleRefresh} className="btn-item">{Intl.get('common.refresh', '刷新')}</Button>
                        <Button className="btn-item btn-m-r-2" onClick={this.handleCallAnalysis} data-tracename="点击通话分析按钮">
                            {Intl.get('user.detail.analysis', '分析')}
                        </Button>
                    </div>
                </TopNav>
                <div className="call_record_wrap splice-table" id="new-table" >
                    <div style={{ height: this.state.tableHeight }}>
                        {this.renderCallRecordList()}
                    </div>
                    {
                        this.state.callRecord.data_list.length && !isHideTotal ? (
                            <BottomTotalCount totalCount={<ReactIntl.FormattedMessage
                                id="common.total.data"
                                defaultMessage={'共{num}条数据'}
                                values={{
                                    'num': this.state.callRecord.total
                                }}
                            />}/>
                        ) : null
                    }
                </div>

                {/**
                     * 添加客户
                     */}
                {this.state.isAddFlag ?
                    <div className="add-customer">
                        <CRMAddForm
                            phoneNum={this.state.phoneNumber}
                            afterAddCustomer={this.afterAddCustomer}
                            hideAddForm={this.hideAddCustomerForm}
                            showRightPanel={this.showRightPanel}
                        />
                    </div>
                    : null}

                {this.state.isShowCallAnalysisPanel ? (
                    <RightPanel
                        className="call-analysis-panel"
                        showFlag={this.state.isShowCallAnalysisPanel}
                    >
                        <CallRecordAnalyis
                            closeCallAnalysisPanel={this.closeCallAnalysisPanel}
                            isFilter114={this.state.isFilter114}
                            isShowEffectiveTimeAndCount={this.state.isShowEffectiveTimeAndCount}
                        />
                    </RightPanel>
                ) : null}
                {this.state.isAddToCustomerFlag ? (
                    <RightPanelModal
                        className="phone-add-to-customer-container"
                        isShowMadal={true}
                        isShowCloseBtn={true}
                        onClosePanel={this.hideAddToCustomerForm}
                        title={Intl.get('crm.add.to.exist.customer', '添加到已有客户')}
                        content={this.renderAddToCustomerForm()}
                        dataTracename="添加到已有客户"
                    />) : null}
            </div>
        </RightContent >
        );
    }

    renderAddToCustomerForm() {
        return (<PhoneAddToCustomerForm phoneNum={this.state.phoneNumber} hideTitleFlag={true}
            cancelAddToCustomer={this.hideAddToCustomerForm}
            afterAddToCustomerSuccess={this.afterAddToCustomerSuccess}/>);
    }

    afterAddToCustomerSuccess = (customer) => {
        CallRecordActions.updateCallRecord({
            id: customer.id,
            name: customer.name,
            contacts0_phone: this.state.phoneNumber,
            contacts0_name: customer.contact_name
        });
        this.hideAddToCustomerForm();
    }

    /**
     * 参数说明，ant-design的table组件
     * @param pagination   分页参数，当前不需要使用分页
     * @param filters      过滤器参数，当前不需要使用过滤器
     * @param sorter       排序参数，当前需要使用sorter
     *                      {field : 'xxx' //排序字段 , order : 'descend'/'ascend' //排序顺序}
     */
    onSortChange = (pagination, filters, sorter) => {
        var _this = this;
        var callRecord = this.state.callRecord;
        callRecord.sort_field = sorter.field;
        callRecord.sort_order = sorter.order;
        callRecord.page = 1;
        callRecord.data_list = [];
        callRecord.listenScrollBottom = false;
        this.updateStore({
            callRecord: callRecord
        }, function() {
            _this.getCallListByAjax();
        });
    };

    onSelectDate = (start_time, end_time) => {
        var callRecord = this.state.callRecord;
        callRecord.page = 1;
        callRecord.data_list = [];
        callRecord.listenScrollBottom = false;
        if (!start_time) {
            start_time = moment('2010-01-01 00:00:00').valueOf();
        }
        if (!end_time) {
            end_time = moment().endOf('day').valueOf();
        }
        this.updateStore({
            callRecord: callRecord,
            start_time: start_time,
            end_time: end_time
        }, () => {
            this.getCallRecommendList();
            this.getCallListByAjax();
        });
    };

    updateStore = (obj, callback) => {
        $.extend(CallRecordStore.state, obj);
        this.setState(CallRecordStore.getState(), () => {
            callback && callback();
        });
    };

    //获取请求参数
    getReqParam = (obj, prop) => {
        var val = obj && prop in obj ? obj[prop] : this.state[prop];
        return val;
    };

    //获取日志列表的请求参数
    getCallListReqParam = (obj, prop) => {
        var val = obj && prop in obj ? obj[prop] : this.state.callRecord[prop];
        return val;
    };

    getCallListByAjax = (queryParam) => {

        var queryObj = {
            start_time: this.getReqParam(queryParam, 'start_time'),
            end_time: this.getReqParam(queryParam, 'end_time'),
            //page: _this.getCallListReqParam(queryParam, 'page'),
            page_size: 20,
            lastId: queryParam ? queryParam.lastId : '',
            sort_field: this.getCallListReqParam(queryParam, 'sort_field'),
            sort_order: this.getCallListReqParam(queryParam, 'sort_order'),
            phone_type: this.getReqParam(queryParam, 'phone_type')
        };
        let filterObj = {...this.state.filterObj};
        //回访电话类型的过滤处理
        if (filterObj.type === CALL_TYPE_OPTION.CALL_BACK) {
            filterObj.call_back = 'true';
            delete filterObj.type;
        }
        CallRecordActions.getCallRecordList(queryObj, filterObj);
    };

    handleScrollBottom = () => {
        //下拉加载数据
        let callRecordList = this.state.callRecord.data_list, lastId;
        if (_.isArray(callRecordList) && callRecordList.length > 0) {
            lastId = callRecordList[callRecordList.length - 1].id;//最后一个客户的id
        }
        this.getCallListByAjax({ lastId: lastId });
    };

    renderCallRecordList = () => {
        return (
            <div className="call-record-fix">
                {this.renderCallRecordContent()}
            </div>
        );
    };

    showNoMoreDataTip = () => {
        return !this.state.callRecord.is_loading &&
               this.state.callRecord.data_list.length >= this.state.callRecord.page_size &&
               !this.state.callRecord.listenScrollBottom;
    };

    //处理选中行的样式
    handleRowClassName = (record, index) => {
        if ((record.id === this.state.selectedRecordId) && this.state.showRightPanel) {
            return 'current_row';
        }
        else {
            return '';
        }
    };

    renderCallRecordContent = () => {
        let isLoading = this.state.callRecord.is_loading;
        //只有第一页和过滤表头不显示的时候，显示loading和错误信息
        let hiddenModule = this.state.callRecord.page === 1 && !this.state.isFilter;
        
        //首次加载时不显示下拉加载状态
        const handleScrollLoading = () => {
            if (this.state.callRecord.page === 1) {
                return false;
            }
            return this.state.callRecord.is_loading;
        };

        const tableClassnames = classNames('new-custom-tbody',{
            'hide-body': this.state.callRecord.is_loading && this.state.callRecord.page === 1 ,
        });

        const dropLoadConfig = {
            loading: handleScrollLoading(),
            listenScrollBottom: this.state.callRecord.listenScrollBottom,
            handleScrollBottom: this.handleScrollBottom,
            showNoMoreDataTip: this.showNoMoreDataTip(),
            noMoreDataText: Intl.get('noMoreTip.callRecord', '没有更多通话记录了')
        };

        // 是否显示过滤时的加载状态， 当前页数为1时，并且通话记录数组长度为0，显示过滤头，请求数据中
        const isFilterLoading = this.state.callRecord.page === 1 && this.state.callRecord.data_list.length === 0 && this.state.isFilter && this.state.callRecord.is_loading;
        //第一次加载时的loading或报错信息
        const renderLoading = () => {
            if(isLoading){
                return( <div className="load-content">
                    <Spinner loadingText={Intl.get('common.sales.frontpage.loading', '加载中')}/>
                </div>);
            }else{
                return( <div className="errmsg-wrap">
                    <i className="iconfont icon-data-error"></i>
                    <p className="abnornal-status-tip">{this.state.callRecord.errorMsg}</p>
                </div>);
            }

        };

        return (
            <div>
                {hiddenModule ? renderLoading() : null}
                <div style={{ display: hiddenModule ? 'none' : 'block' }}>
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
                            locale={{emptyText: isFilterLoading ? Intl.get('common.sales.frontpage.loading', '加载中') : Intl.get('common.no.data', '暂无数据')}}
                            scroll={{ x: this.state.isFilter ? 1450 : 1150, y: this.state.tableHeight }}
                        />
                        { isFilterLoading ? <Spinner /> : null }
                    </div>
                </div>
            </div>
        );
    };

    onStoreChange = () => {
        this.setState(CallRecordStore.getState());
    };
}


export default injectIntl(CallRecord);
