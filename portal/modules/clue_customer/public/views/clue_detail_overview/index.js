import { emailRegex, qqRegex, checkWechat } from 'PUB_DIR/sources/utils/validate-util';

/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
require('../../css/clue_detail_overview.less');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import { Button, Form, Icon, message, Input, Popover, Popconfirm } from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const FormItem = Form.Item;
const {TextArea} = Input;
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import DatePickerField from 'CMP_DIR/basic-edit-field-new/date-picker';
import CustomerSuggest from 'CMP_DIR/basic-edit-field-new/customer-suggest';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
var clueCustomerAction = require('../../action/clue-customer-action');
var clueCustomerAjax = require('../../ajax/clue-customer-ajax');
import Trace from 'LIB_DIR/trace';
var className = require('classnames');
var userData = require('PUB_DIR/sources/user-data');
var CRMAddForm = require('MOD_DIR/crm/public/views/crm-add-form');
const clueCustomerUtils = require('../../utils/clue-customer-utils');

import {
    SELECT_TYPE,
    AVALIBILITYSTATUS,
    getClueSalesList,
    getLocalSalesClickCount,
    SetLocalSalesClickCount,
    handleSubmitClueItemData,
    handleSubmitContactData,
    contactNameRule,
    contactPositionRule,
    getClueStatusValue,
    editCluePrivilege,
    assignSalesPrivilege,
    handlePrivilegeType,
    FLOW_FLY_TIME,
    isCommonSalesOrPersonnalVersion,
    freedCluePrivilege,
    avalibilityCluePrivilege,
    transferClueToCustomerIconPrivilege,
    editClueItemIconPrivilege,
    releaseClueTip,
    getShowPhoneNumber,
    dealClueCheckPhoneStatus
} from '../../utils/clue-customer-utils';
import {RightPanel} from 'CMP_DIR/rightPanel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
const EDIT_FEILD_WIDTH = 300;
import DynamicAddDelField from 'CMP_DIR/basic-edit-field-new/dynamic-add-delete-field';
import {addHyphenToPhoneNumber} from 'LIB_DIR/func';
import PhoneCallout from 'CMP_DIR/phone-callout';
import PhoneInput from 'CMP_DIR/phone-input';
var clueFilterStore = require('../../store/clue-filter-store');
var clueCustomerStore = require('../../store/clue-customer-store');
import {renderClueStatus, checkCurrentVersion } from 'PUB_DIR/sources/utils/common-method-util';
import crmUtil, {TAB_KEYS } from 'MOD_DIR/crm/public/utils/crm-util';
import {phoneMsgEmitter, userDetailEmitter} from 'PUB_DIR/sources/utils/emitters';
import {myWorkEmitter} from 'PUB_DIR/sources/utils/emitters';
import DetailCard from 'CMP_DIR/detail-card';
import ClueTraceList from 'MOD_DIR/clue_customer/public/views/clue_trace_list';
import moment from 'moment';
import ClueTraceAction from '../../action/clue-trace-action';
const HAS_BTN_HEIGHT = 58;//为按钮预留空间
const HAS_INPUT_HEIGHT = 140;//为无效输入框预留空间
import { clueEmitter, clueToCustomerPanelEmitter } from 'PUB_DIR/sources/utils/emitters';
import {sourceClassifyArray, SOURCE_CLASSIFY, sourceClassifyOptions} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {getMyTeamTreeList} from 'PUB_DIR/sources/utils/common-data-util';
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
import commonSalesHomePrivilegeConst from 'MOD_DIR/common_sales_home_page/public/privilege-const';
import LocationSelectField from 'CMP_DIR/basic-edit-field-new/location-select';
import CrmAction from 'MOD_DIR/crm/public/action/crm-actions';
import ApplyTryCard from 'CMP_DIR/apply-try-card';
import classNames from 'classnames';
import ShearContent from 'CMP_DIR/shear-content';
import CustomField from 'CMP_DIR/custom-field';

class ClueDetailOverview extends React.Component {
    state = {
        clickAssigenedBtn: false,//是否点击了分配客户的按钮
        isShowAddCustomer: false,//是否展示添加客户内容
        isShowCustomerUserListPanel: false,//是否展示客户下的用户列表
        customerOfCurUser: {},//当前展示用户所属客户的详情
        app_user_id: '',
        curClue: $.extend(true, {}, this.props.curClue),
        divHeight: this.props.divHeight,//没有按钮时高度
        similarClueLoading: false,//正在获取相似线索
        similarClueErrmsg: '',//获取相似线索出错
        similarClueLists: [],//相似线索列表
        similarCustomerLoading: false,//正在获取相似客户
        similarCustomerErrmsg: '',//获取相似客户出错
        similarCustomerLists: [],//相似客户列表
        similarIpClueLists: [],//相同IP线索列表
        similarIpClueLoading: false,//正在获取相同IP线索
        similarIpClueErrmsg: '',//获取相同Ip线索出错
        showLargerCustomerLists: false,//展示大于3个的客户列表
        showLargerClueLists: false,//展示大于3个的线索列表
        showLargerIpLists: false,//展示大于3个的相同IP线索列表
        submitReason: '',//要提交的无效原因
        submitInvalidateClueMsg: '',//提交标记无效出错的信息
        submitInvalidateLoading: false,//正在提交无效记录
        isShowInvalidateInputPanel: false, //正在展示无效信息输入框
        myTeamTree: [],//销售领导获取我所在团队及下级团队树
        phoneDuplicateWarning: [], //联系人电话重复时的提示
        isLoadingIndustryList: false,//正在加载
        industryList: [],//行业列表
        versionData: {}, //申请试用信息
        isExpandContact: false,//联系人信息是否展开
    };

    componentDidMount() {
        clueCustomerStore.listen(this.onClueCustomerStoreChange);
        //curClue为空的时候不调用接口发起请求
        if(!_.isEmpty(this.state.curClue)) {
            //获取相似线索列表,如果有相似线索字段才获取
            if(_.get(this.state, 'curClue.lead_similarity')) {
                this.getSimilarClueLists();
            }
            //获取相似客户列表，如果有相似客户字段才获取
            //如果是已转化的客户，不需要展示相似客户
            if (!this.isHasTransferClue() && _.get(this.state, 'curClue.customer_similarity')){
                this.getSimilarCustomerLists();
            }
            //获取相同IP线索列表，如果有相同IP线索字段才获取
            if(_.get(this.state, 'curClue.repeat_ip')) {
                this.getSimilarIpClueLists();
            }
        }
        //获取版本信息
        const curClue = this.state.curClue;
        if(curClue.version_upgrade_id){
            clueCustomerAction.getApplyTryData(curClue.id,curClue.version_upgrade_id);
        }
        if (editClueItemIconPrivilege(this.state.curClue)) {
            this.getIndustryList();
        }
        //销售领导获取我所在团队及下级团队树
        getMyTeamTreeList(result => {
            this.setState({myTeamTree: _.get(result, 'teamTreeList', [])});
        });
    }
    //获取行业列表
    getIndustryList = () => {
        //获取后台管理中设置的行业列表
        this.setState({isLoadingIndustryList: true});
        CrmAction.getIndustries(result => {
            let list = _.isArray(result) ? result : [];
            if (list.length > 0) {
                list = _.map(list, 'industry');
            }
            this.setState({isLoadingIndustryList: false, industryList: list});
        });
    };
    //线索的状态是已转化的线索
    isHasTransferClue = () => {
        return _.get(this, 'state.curClue.status') === SELECT_TYPE.HAS_TRANSFER;
    }
    componentWillUnmount() {
        clueCustomerStore.unlisten(this.onClueCustomerStoreChange);
    }
    onClueCustomerStoreChange = () => {
        let curClue = _.cloneDeep(this.state.curClue);
        curClue.contacts = _.get(clueCustomerStore.getState(), 'curClue.contacts', curClue.contacts);
        const versionData = _.get(clueCustomerStore.getState(),'versionData');
        this.setState({curClue,versionData});
    };
    getSimilarClueLists = () => {
        let ids = _.reduce(_.get(this.state, 'curClue.similarity_lead_ids'), (result, id) => {
            return result + `,${id}`;
        });
        //如果当前没有相似线索的字段，将相似线索列表清空
        if(!_.get(this.state, 'curClue.customer_similarity')) {
            this.setState({
                similarCustomerLists: []
            });
        }
        this.setState({
            similarClueLoading: true,
            similarClueErrmsg: ''
        });
        $.ajax({
            url: '/rest/clue/v2/query/leads/by/ids',
            type: 'post',
            dateType: 'json',
            data: {
                id: ids
            },
            success: (data) => {
                this.setState({
                    similarClueLists: _.isArray(data) ? data : [],
                    similarClueLoading: false,
                    similarClueErrmsg: ''
                });
            },
            error: (errorMsg) => {
                this.setState({
                    similarClueLists: [],
                    similarClueLoading: false,
                    similarClueErrmsg: errorMsg
                });
            }
        });

    };
    getSimilarIpClueLists = () => {
        let ids = _.reduce(_.get(this.state, 'curClue.repeat_ip_ids'), (result, id) => {
            return result + `,${id}`;
        });
        this.setState({
            similarIpClueLoading: true,
            similarIpClueErrmsg: ''
        });
        $.ajax({
            url: '/rest/clue/v2/query/leads/by/ids',
            type: 'post',
            dateType: 'json',
            data: {
                id: ids
            },
            success: (data) => {
                this.setState({
                    similarIpClueLists: _.isArray(data) ? data : [],
                    similarIpClueLoading: false,
                    similarIpClueErrmsg: ''
                });
            },
            error: (errorMsg) => {
                this.setState({
                    similarIpClueLists: [],
                    similarIpClueLoading: false,
                    similarIpClueErrmsg: errorMsg
                });
            }
        });

    };

    getCurCluePhones = () => {
        var curClue = this.state.curClue;
        var phones = [];
        if (_.get(curClue,'contacts[0]')){
            _.forEach(_.get(curClue,'contacts'), (item) => {
                if (_.isArray(item.phone)){
                    phones = _.concat(phones, item.phone);
                }
            });
        }
        return phones.join(',');
    }
    getSimilarCustomerLists = () => {
        let ids = _.reduce(_.get(this.state, 'curClue.similarity_customer_ids'), (result, id) => {
            return result + `,${id}`;
        });
        //如果当前没有相似客户的字段，将相似客户列表清空
        if(!_.get(this.state, 'curClue.clue_similarity')) {
            this.setState({
                similarClueLists: []
            });
        }
        this.setState({
            similarCustomerLoading: true,
            similarCustomerErrmsg: ''
        });
        $.ajax({
            url: '/rest/customer/v3/customer/query/customers/by/ids',
            type: 'post',
            dateType: 'json',
            data: {
                id: ids
            },
            success: (data) => {
                this.setState({
                    similarCustomerLists: _.isArray(data) ? data : [],
                    similarCustomerLoading: false,
                    similarCustomerErrmsg: ''
                });
            },
            error: (errorMsg) => {
                this.setState({
                    similarCustomerLists: [],
                    similarCustomerLoading: false,
                    similarCustomerErrmsg: errorMsg
                });
            }
        });
    };


    componentWillReceiveProps(nextProps) {
        //修改某些属性时，线索的id不变，但是需要更新一下curClue所以不加 nextProps.curClue.id !== this.props.curClue.id 这个判断了
        if (_.get(nextProps.curClue,'id')) {
            var diffClueId = _.get(nextProps,'curClue.id') !== _.get(this, 'props.curClue.id');
            const curClue = $.extend(true, {}, nextProps.curClue);
            this.setState({
                curClue
            },() => {
                var curClue = nextProps.curClue;
                if (diffClueId){
                    //获取相似线索列表
                    //获取相似线索列表,如果有相似线索字段才获取
                    if(_.get(this.state, 'curClue.lead_similarity')) {
                        this.getSimilarClueLists();
                    }
                    //获取相似客户列表，如果有相似客户字段才获取
                    //如果是已转化的客户，不需要展示相似客户
                    if (!this.isHasTransferClue() && _.get(this.state, 'curClue.customer_similarity')) {
                        this.getSimilarCustomerLists();
                    }
                    // 获取相同Ip列表
                    if(_.get(this.state, 'curClue.repeat_ip')) {
                        this.getSimilarIpClueLists();
                    }
                    //如果相似客户和相似线索两个字段都没有或者没有相同IP线索，清空相似客户和相似线索以及相同IP线索列表
                    if((!_.get(this.state, 'curClue.customer_similarity') && !_.get(this.state, 'curClue.customer_similarity')) || !_.get(this.state, 'curClue.repeat_ip')) {
                        this.setState({
                            similarClueLists: [],
                            similarCustomerLists: [],
                            similarIpClueLists: []
                        });
                    }
                }
            });
        }
        if (nextProps.divHeight !== this.props.divHeight){
            this.setState({
                divHeight: nextProps.divHeight,
            });
        }
        const nextClue = nextProps.curClue;
        const nowClue = this.state.curClue;
        if(nextClue.id !== nowClue.id && nextClue.version_upgrade_id){
            clueCustomerAction.getApplyTryData(nextClue.id,nextClue.version_upgrade_id);
        }
    }

    changeClueFieldSuccess = (newCustomerDetail, contact_id) => {
        //如果是修改的线索来源和接入渠道，要看是不是重新添加的
        for (var key in newCustomerDetail) {
            if (key === 'clue_source' && !_.includes(this.props.clueSourceArray, newCustomerDetail[key])) {
                this.props.updateClueSource(newCustomerDetail[key]);
            }
            if (key === 'access_channel' && !_.includes(this.props.accessChannelArray, newCustomerDetail[key])) {
                this.props.updateClueChannel(newCustomerDetail[key]);
            }
            if (key === 'clue_classify' && !_.includes(this.props.clueClassifyArray, newCustomerDetail[key])) {
                this.props.updateClueClassify(newCustomerDetail[key]);
            }
        }
        if (contact_id){
            newCustomerDetail.contact_id = contact_id;
        }
        clueCustomerAction.afterEditCustomerDetail(newCustomerDetail);
        this.props.updateClueProperty(newCustomerDetail);
    };

    //今天之后的日期不可以选
    disabledDate = (current) => {
        return current > moment().endOf('day');
    };

    getClueSourceOptions = () => {
        return (
            this.props.clueSourceArray.map((source, idx) => {
                return (<Option key={idx} value={source}>{source}</Option>);
            })
        );
    };

    getAccessChannelOptions = () => {
        return (
            this.props.accessChannelArray.map((source, idx) => {
                return (<Option key={idx} value={source}>{source}</Option>);
            })
        );
    };

    getClueClassifyOptions = () => {
        return this.props.clueClassifyArray.map((source, idx) => {
            return (<Option key={idx} value={source}>{source}</Option>);
        });
    };

    getSalesOptions = (user_id) => {
        var clueSalesIdList = getClueSalesList();
        _.forEach(this.props.salesManList,(sales) => {
            sales.clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(sales, 'user_info.user_id'));
        });
        //按点击的次数进行排序
        var dataList = _.sortBy(this.props.salesManList,(item) => {return -item.clickCount;});
        //主管分配线索时，负责人是自己的不能分配给自己
        let userList = _.cloneDeep(dataList);
        if(user_id && user_id === userData.getUserData().user_id){
            userList = _.filter(userList, user => !_.isEqual(_.get(user, 'user_info.user_id'), userData.getUserData().user_id));
        }
        return userList.map((sales, idx) => {
            let teamName = _.get(sales, 'user_groups[0].group_name') ? ` - ${sales.user_groups[0].group_name}` : '';
            let name = _.get(sales, 'user_info.nick_name', '') + teamName;
            return (<Option key={idx}
                value={_.get(sales, 'user_info.user_id')}>{name}</Option>);
        });
    };

    cancelEditClueSource = () => {
        var curClue = this.state.curClue;
        curClue.clue_source = this.props.curClue.clue_source;
        this.setState({
            curClue: curClue
        });
    };

    cancelEditClueChannel = () => {
        var curClue = this.state.curClue;
        curClue.access_channel = this.props.curClue.access_channel;
        this.setState({
            curClue: curClue
        });
    };

    cancelEditClueClassify = () => {
        var curClue = this.state.curClue;
        curClue.clue_classify = this.props.curClue.clue_classify;
        this.setState({
            curClue: curClue
        });
    };

    cancelEditSourceClassify = () => {
        let curClue = this.state.curClue;
        curClue.source_classify = this.props.curClue.source_classify;
        this.setState({
            curClue: curClue
        });
    };

    cancelEditSales = () => {
        var curClue = this.state.curClue;
        curClue.user_name = this.props.curClue.user_name;
        this.setState({
            curClue: curClue,
            clickAssigenedBtn: false
        });
    };

    onSelectCluesource = (updateSource) => {
        var curClue = this.state.curClue;
        curClue.clue_source = updateSource;
        this.setState({
            curClue: curClue
        });
    };

    onSelectAccessChannel = (updateChannel) => {
        var curClue = this.state.curClue;
        curClue.access_channel = updateChannel;
        this.setState({
            curClue: curClue
        });
    };

    onSelectClueClassify = (updateClassify) => {
        var curClue = this.state.curClue;
        curClue.clue_classify = updateClassify;
        this.setState({
            curClue: curClue
        });
    };

    onSelectClueSales = (updateUser) => {
        var curClue = this.state.curClue;
        curClue.user_name = updateUser;
        this.setState({
            curClue: curClue
        });
    };
    onSelectSourceClassify = (updateSource) => {
        let curClue = this.state.curClue;
        curClue.source_classify = updateSource;
        this.setState({
            curClue: curClue
        });
    };
    //保存修改的基本信息
    saveEditBasicInfo = (type, saveObj, successFunc, errorFunc) => {
        var item = type,contact_id = '';
        if (_.isObject(type)){
            //修改联系人的相关属性
            item = type.editItem;
            contact_id = type.id;
            saveObj.contact_id = contact_id;
            if (item === 'phone'){
                saveObj.clueName = _.get(this, 'state.curClue.name');
            }
        }
        //修改线索的基本信息
        this.changeClueItemInfo(saveObj, successFunc, errorFunc, contact_id);

        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存线索${item}的修改`);
    };

    //修改线索的相关信息
    changeClueItemInfo = (saveObj, successFunc, errorFunc, contact_id) => {
        var data = handleSubmitClueItemData(_.cloneDeep(saveObj));
        clueCustomerAjax.updateClueItemDetail(data).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.props.updateClueProperty(saveObj); //切换tab时实时更新线索详情
                //修改联系人的时候，需要把联系人的下标加上
                this.changeClueFieldSuccess(saveObj, contact_id);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    };

    //分配线索给某个销售 && 这个销售不是当前账号
    handleChangeAssignedSales = (submitObj, successFunc, errorFunc) => {
        var user_id = _.get(this.state.curClue,'user_id');
        var curClue = this.state.curClue;
        var clueCustomerTypeFilter = getClueStatusValue(clueFilterStore.getState().filterClueStatus);
        //如果是待分配状态，分配完之后要在列表中删除一个,在待跟进列表中增加一个
        var isWillDistribute = clueCustomerTypeFilter.status === SELECT_TYPE.WILL_DISTRIBUTE;
        var targetObj = _.find(this.props.salesManList, (item) => {
            var userId = _.get(item, 'user_info.user_id');
            return userId === submitObj.user_id;
        });
        if (targetObj && _.isArray(targetObj.user_groups) && targetObj.user_groups.length) {
            var userName = _.get(targetObj, 'user_info.nick_name');
            var teamId = _.get(targetObj, 'user_groups[0].group_id');
            var teamName = _.get(targetObj, 'user_groups[0].group_name');
            var updateObj = {
                'customer_id': submitObj.id,
                'sale_id': submitObj.user_id,
                'sale_name': userName,
                'team_name': teamName,
                'team_id': teamId,
            };
            clueCustomerAction.distributeCluecustomerToSale(updateObj, (result) => {
                SetLocalSalesClickCount(submitObj.user_id);
                if (result && result.errorMsg) {
                    if (_.isFunction(errorFunc)) errorFunc(result.errorMsg);
                } else {

                    if (_.isFunction(successFunc)) successFunc();
                    this.setState({
                        clickAssigenedBtn: false
                    });
                    var updateObj = {
                        'user_name': userName,
                        'user_id': submitObj.user_id,
                        'sales_team': teamName,
                        'sales_team_id': teamId
                    };
                    this.props.updateClueProperty(updateObj);
                    if (isWillDistribute) {
                        clueEmitter.emit(clueEmitter.FLY_CLUE_WILLTRACE,curClue);
                        setTimeout(() => {
                            clueCustomerAction.afterAssignSales(curClue.id);
                            this.props.updateClueProperty({
                                'status': SELECT_TYPE.WILL_TRACE
                            });
                        }, FLOW_FLY_TIME);

                    }
                    //分配完线索后，需要将首页对应的工作设为已完成
                    if (window.location.pathname === '/home') {
                        myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
                    }
                }
            });
        }
    };

    //点击分配客户按钮
    handleClickAssignedBtn = () => {
        this.setState({
            clickAssigenedBtn: true
        });
    };

    //线索关联客户
    handleAssociatedCustomer = (submitObj, successFunc, errorFunc) => {
        var curClueDetail = this.state.curClue;
        clueCustomerAction.setClueAssociatedCustomer(submitObj, (result) => {
            if (_.isString(result)) {
                if (_.isFunction(errorFunc)) errorFunc(result);
            } else {
                if (_.isFunction(successFunc)) successFunc();
                curClueDetail.customer_id = submitObj.customer_id;
                curClueDetail.customer_name = submitObj.customer_name;
                if (submitObj.customer_id){
                    //如果有客户的id，需要把线索的状态改成已跟进
                    this.props.removeUpdateClueItem();
                    if (curClueDetail.status !== SELECT_TYPE.HAS_TRACE){
                        curClueDetail.status = SELECT_TYPE.HAS_TRACE;

                    }
                }else{
                    if (!_.get(curClueDetail,'customer_traces[0].remark')){
                        if (_.get(curClueDetail,'user_name')){
                            curClueDetail.status = SELECT_TYPE.WILL_TRACE;
                        }else{
                            curClueDetail.status = SELECT_TYPE.WILL_DISTRIBUTE;
                        }
                    }
                }
                this.setState({
                    clickAssociatedBtn: false,
                    curClue: curClueDetail
                });
                clueCustomerAction.afterModifiedAssocaitedCustomer(curClueDetail);
            }
        });
    };
    saveSameNoCustomerName = () => {
        this.setState({
            clickAssociatedBtn: false,
        });
    };

    addAssignedCustomer = () => {

        this.setState({
            isShowAddCustomer: true
        });
    };

    //关闭添加面板
    hideAddForm = () => {
        this.setState({
            isShowAddCustomer: false
        });
    };

    //添加完客户后
    afterAddCustomer = (newCustomerArr) => {
        if (_.isArray(newCustomerArr) && newCustomerArr[0]) {
            var newCustomer = newCustomerArr[0];
            var curClue = this.state.curClue;
            curClue.customer_name = newCustomer.name;
            curClue.customer_id = newCustomer.id;
            curClue.customer_label = newCustomer.customer_label;
            this.setState({
                curClue: curClue,
                clickAssociatedBtn: false
            });
            clueCustomerAction.afterModifiedAssocaitedCustomer(curClue);
        }
    };

    //渲染添加客户内容
    renderAddCustomer = () => {
        var phoneNum = this.state.curClue ? this.state.curClue.contact_way : '';
        return (
            <CRMAddForm
                hideAddForm={this.hideAddForm}
                formData={this.state.curClue}
                isAssociateClue={true}
                phoneNum={phoneNum}
                afterAddCustomer={this.afterAddCustomer}
                isShowMadal={false}
            />
        );
    };

    //标记线索有效
    handleClickValidBtn = (item, callback) => {
        var updateValue = AVALIBILITYSTATUS.AVALIBILITY;
        var submitObj = {
            id: item.id,
            availability: updateValue
        };
        this.setState({
            isInvaliding: true,
        });
        clueCustomerAction.updateCluecustomerDetail(submitObj, (result) => {
            if (_.isString(result)) {
                this.setState({
                    isInvaliding: false,
                    editInvalidClueId: ''
                });
            } else {
                //改为有效，增加到不同的状态上
                switch (item.status){
                    case SELECT_TYPE.WILL_DISTRIBUTE:
                        clueEmitter.emit(clueEmitter.FLY_CLUE_WILLDISTRIBUTE,item);
                        break;
                    case SELECT_TYPE.WILL_TRACE:
                        clueEmitter.emit(clueEmitter.FLY_CLUE_WILLTRACE,item);
                        break;
                    case SELECT_TYPE.HAS_TRACE:
                        clueEmitter.emit(clueEmitter.FLY_CLUE_HASTRACE,item);
                        break;
                    case SELECT_TYPE.HAS_TRANSFER:
                        clueEmitter.emit(clueEmitter.FLY_CLUE_HASTRANSFER,item);
                        break;
                }
                //延时删除是把数字更新完再在界面删除数据
                setTimeout(() => {
                    _.isFunction(callback) && callback(updateValue);
                    clueCustomerAction.deleteClueById(item);
                    clueCustomerAction.updateClueTabNum(item.status);
                    this.props.updateClueProperty({
                        availability: updateValue
                    });
                },FLOW_FLY_TIME);
                this.setState({
                    isInvaliding: false,
                    editInvalidClueId: ''
                });
            }
        });
    };
    cancelInvalidClue = () => {
        this.setState({
            editInvalidClueId: ''
        });
    };
    renderItemSelfSettingContent = (curClue,item) => {
        let hasPrivilege = editCluePrivilege(curClue);
        let phone = getShowPhoneNumber(curClue, addHyphenToPhoneNumber(item), true);
        return <PhoneCallout
            phoneNumber={item}
            showPhoneNum={phone.phoneNumber}
            showPhoneIcon={true}
            showCheckPhone
            phoneStatus={phone.status}
            onCheckPhoneSuccess={this.onCheckPhoneSuccess}
            hidePhoneIcon={!hasPrivilege}
            type='lead'
            id={_.get(curClue, 'id', '')}
        />;
    };
    renderItemSelfSettingForm = (key, index, that) => {
        const fieldKey = `${that.props.field}[${key}]`;
        let initValue = _.get(that.state, `value[${key}]`, '');
        let validateRules = [];
        if (index === 0) {//电话必填的验证
            validateRules = _.concat(validateRules, [{
                required: true,
                message: Intl.get('user.info.input.phone', '请输入电话'),
            }]);
        }
        return (
            <div className='phone-input-wrap'>
                <PhoneInput
                    initialValue={initValue}
                    placeholder={Intl.get('clue.add.phone.num', '电话号码')}
                    validateRules={validateRules}
                    id={fieldKey}
                    labelCol={{span: 4}}
                    wrapperCol={{span: 20}}
                    colon={false}
                    form={that.props.form}
                    handleInputChange={this.handleInputChange.bind(this, fieldKey)}
                    label={index === 0 ? Intl.get('common.phone', '电话') : ' '}
                />
                {this.renderDuplicateWarning(fieldKey)}
            </div>
        );
    };

    //删除电话时的回调
    handleDelItem = (index, item_keys) => {
        let phoneKey = item_keys[index];
        let phoneDuplicateWarning = _.cloneDeep(this.state.phoneDuplicateWarning);
        _.remove(phoneDuplicateWarning, msg => _.isEqual(msg.id, `phone[${phoneKey}]`));
        this.setState({
            phoneDuplicateWarning
        });
    };

    //渲染电话重复信息
    renderDuplicateWarning = (phoneId) => {
        let duplicateWarning = this.state.phoneDuplicateWarning;
        let warningMsg = _.map(duplicateWarning, item => {
            let {id, warning} = item;
            if(_.isEqual(phoneId, id)) {
                return (
                    <div className='phone-validate-error'>
                        {warning}
                    </div>
                );
            }
        });
        return _.isEmpty(warningMsg) ? null : warningMsg;
    };

    //电话修改时的回调
    handleInputChange = (phoneKey, event) => {
        let change = {
            key: phoneKey,
            value: _.trim(_.get(event,'target.value',''))
        };
        setTimeout(() => {
            let queryObj = {phone: change.value};
            clueCustomerAction.checkOnlyClueNamePhone(queryObj, true, data => {
                if (_.isString(data)) {
                    //唯一性验证出错了
                } else {
                    if (_.isObject(data) && data.result === 'true') {
                        //电话没有被线索使用时
                        this.handleDuplicatePhoneMsg(change.key, false, '');
                    } else {
                        let message = <span>
                            <span>
                                {Intl.get('clue.customer.repeat.phone.user', '该电话已被线索"{userName}"使用',{userName: _.get(data, 'list[0].name', [])})}
                            </span>
                            <a href="javascript:void(0)"
                                onClick={this.handleDuplicatePhoneMsg.bind(this,change.key,false,'')}
                                className="handle-btn-item"
                                data-tracename="隐藏电话已被其他线索使用的警告">
                                {Intl.get('clue.customer.phone.still.add.phone',' 仍用此电话？')}
                            </a>
                        </span>;
                        //已存在
                        this.handleDuplicatePhoneMsg(change.key, true, message);
                    }
                }
            });
        }, 500);
    };

    //电话重复时错误信息的处理
    handleDuplicatePhoneMsg = (phoneKey, hasWarning, warningMsg) => {
        let phoneDuplicateWarning = _.cloneDeep(this.state.phoneDuplicateWarning);
        let phoneWarning = _.find(phoneDuplicateWarning, msg => _.isEqual(msg.id, phoneKey));
        //如果没有找到id,并且有警告信息
        if(_.isEmpty(phoneWarning) && hasWarning) {
            phoneDuplicateWarning.push({
                id: phoneKey,
                warning: warningMsg,
            });
            this.setState({
                phoneDuplicateWarning: phoneDuplicateWarning
            });
        } else if(!_.isEmpty(phoneWarning)) { //如果找到了此id，判断此时是否还有警告
            //如果还有警告，更新此电话的警告信息
            if(hasWarning){
                phoneWarning.warning = warningMsg;
            } else {//如果没有警告，说明已经修改为正确的电话
                _.remove(phoneDuplicateWarning, msg => _.isEqual(msg.id, phoneKey));
            }
            this.setState({
                phoneDuplicateWarning
            });
        }
    };

    renderAssigendClueText = () => {
        return (
            <div className="clue-info-item">
                <div className="clue-info-label">
                    {Intl.get('crm.6', '负责人')}：
                </div>
                <div className="clue-info-detail no-handled">
                    {Intl.get('clue.has.not.distribute', '该线索还没有分配')}
                </div>
                <div className="btn-container">
                    <Button type="primary" data-tracename="点击分配线索按钮"
                        onClick={this.handleClickAssignedBtn}>{Intl.get('clue.customer.distribute', '分配')}</Button>
                </div>
            </div>
        );
    };


    renderAssignedClueEdit = () => {
        let user = userData.getUserData();
        var curClue = this.state.curClue;
        //分配的状态
        var assignedDisplayType = this.state.clickAssigenedBtn ? 'edit' : 'text';
        //分配线索给销售的权限
        var hasAssignedPrivilege = assignSalesPrivilege(curClue);
        //所分配的销售
        var assignedSales = _.get(curClue, 'user_name');
        //所分配的销售所属的团队
        var assignedTeam = _.get(curClue, 'sales_team');
        var displayText = assignedSales;
        if (assignedTeam){
            displayText += ' - ' + assignedTeam;
        }
        return this.renderBasicContent(Intl.get('crm.6', '负责人'),<BasicEditSelectField
            width={EDIT_FEILD_WIDTH}
            displayType={assignedDisplayType}
            hasEditPrivilege={hasAssignedPrivilege}
            id={curClue.id}
            saveEditSelect={this.handleChangeAssignedSales}
            cancelEditField={this.cancelEditSales}
            value={displayText}
            field="user_id"
            displayText={displayText}
            selectOptions={this.getSalesOptions(curClue.user_id)}
            onSelectChange={this.onSelectClueSales}
            noDataTip={Intl.get('clue.handle.no.distribute.clue', '未分配')}
        />,{labelCls: 'handle-clue-person'});
    };
    showConfirmInvalid = (item) => {
        let availability = item.availability;
        //如果当前用户状态为有效，点击无效时标记flag
        if(_.isEqual(availability, AVALIBILITYSTATUS.AVALIBILITY)) {
            this.setState({
                isShowInvalidateInputPanel: true,
                editInvalidClueId: item.id
            }, () => {
                if (this['addTextarea']) {
                    this['addTextarea'].focus();
                }
            });
        } else {
            this.setState({
                editInvalidClueId: item.id
            });
        }
    };
    //取消无效处理
    handleInvalidateCancelBtn = (item) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-btn-cancel'), '取消保存跟进内容');
        this.setState({
            submitInvalidateClueMsg: '',
            submitReason: '',
            editInvalidClueId: '',
            isShowInvalidateInputPanel: false,
            invalidateClueStatus: ''
        });
    };
    //输入框改变时数据处理
    handleInvalidateInputChange = (e) => {
        this.setState({
            submitReason: e.target.value
        });
    };
    handleReleaseClue = () => {
        let curClue = this.state.curClue;
        if(_.isEmpty(curClue) && this.state.isReleasingClue) return;
        this.setState({isReleasingClue: true});
        Trace.traceEvent($(ReactDOM.findDOMNode(this)), '点击释放线索按钮');
        clueCustomerAction.releaseClue(curClue.id, () => {
            this.setState({isReleasingClue: false});
            //释放完线索后，需要将首页对应的工作设为已完成
            if (window.location.pathname === '/home') {
                myWorkEmitter.emit(myWorkEmitter.SET_WORK_FINISHED);
            }
            clueCustomerAction.afterReleaseClue(curClue.id);
            //需要关闭面板
            _.isFunction(this.props.hideRightPanel) && this.props.hideRightPanel();
        }, errorMsg => {
            this.setState({isReleasingClue: false});
            message.error(errorMsg);
        });
    };
    //确认无效处理
    handleInvalidateBtn = (item, callback) => {
        if (this.state.submitInvalidateLoading) {
            return;
        }
        let invalidReason = _.trim(this.state.submitReason);
        if (!invalidReason) {
            this.setState({
                submitInvalidateClueMsg: Intl.get('clue.invalid.reason.not.empty', '无效原因不能为空'),
                invalidateClueStatus: 'error'
            });
        } else {
            let updateAvailability = AVALIBILITYSTATUS.INAVALIBILITY;
            let updateObj = {
                id: item.id,
                availability: updateAvailability,
                invalid_info: {
                    invalid_reason: invalidReason
                }
            };
            updateObj = JSON.stringify(updateObj);
            let clueState = {
                updateItem: 'availability',
                updateObj: updateObj,
                type: handlePrivilegeType(true)
            };
            this.setState({
                submitInvalidateLoading: true,
            });
            clueCustomerAction.updateClueAvailability(clueState, (result) => {
                if (_.isString(result)) {
                    this.setState({
                        submitInvalidateLoading: false,
                        invalidateClueStatus: 'error',
                        submitInvalidateClueMsg: result
                    });
                } else {
                    clueEmitter.emit(clueEmitter.FLY_CLUE_INVALID,item);
                    setTimeout(() => {
                        _.isFunction(callback) && callback(updateAvailability);
                        clueCustomerAction.deleteClueById(item);
                        clueCustomerAction.updateClueTabNum('invalidClue');
                        //前端更新跟进记录
                        let newTrace = {
                            remark: invalidReason,
                            user_id: userData.getUserData().user_id || '',
                            nick_name: userData.getUserData().nick_name,
                            add_time: moment().valueOf(),
                            time: moment().valueOf(),
                            type: 'other',
                            showAdd: false
                        };
                        ClueTraceAction.addClueTraceWithoutAjax(newTrace);
                        this.props.updateClueProperty({
                            availability: updateAvailability
                        });
                    },FLOW_FLY_TIME);
                    this.setState({
                        submitInvalidateLoading: false,
                        editInvalidClueId: '',
                        invalidateClueStatus: '',
                        submitReason: '',
                        submitInvalidateClueMsg: '',
                        isShowInvalidateInputPanel: false,
                    });
                }
            });
        }
    };
    //渲染确认无效原因输入框
    renderInvalidatePanel = (salesClueItem) => {
        return (
            <div className="confirm-invalidate-item">
                <div className="confirm-invalidate-panel">
                    <Form className="confirm-invalidate-input">
                        <FormItem
                            validateStatus={_.get(this.state, 'invalidateClueStatus')}
                            help={_.get(this.state, 'submitInvalidateClueMsg')}
                        >
                            <TextArea
                                ref={addTextarea => this['addTextarea'] = addTextarea}
                                placeholder={Intl.get('clue.describe.invalid.reason', '请描述一下无效原因')}
                                value={this.state.submitReason}
                                onChange={this.handleInvalidateInputChange.bind(this)}
                            />
                        </FormItem
                        >
                        <div className="save-cancel-btn">
                            <Button className="ant-btn-cancel" data-tracename="取消保存无效原因"
                                onClick={this.handleInvalidateCancelBtn.bind(this,salesClueItem)}
                            >{Intl.get('common.cancel', '取消')}</Button>
                            <Button type='primary'
                                onClick={this.handleInvalidateBtn.bind(this, salesClueItem)}
                                className="ant-btn-save"
                                disabled={this.state.submitInvalidateLoading} data-tracename="保存无效原因">
                                {Intl.get('clue.confirm.clue.invalid', '确认无效')}
                                {this.state.submitInvalidateLoading ? <Icon type="loading"/> : null}
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    };
    //渲染确认有效按钮
    renderValidConfirm = (salesClueItem) => {
        var isEditting = this.state.isInvaliding;
        return (
            <span className="invalid-confirm">
                <Button className='confirm-btn' disabled={isEditting} type='primary' onClick={this.handleClickValidBtn.bind(this, salesClueItem)} data-tracename="点击确认有效按钮">
                    {Intl.get('clue.customer.confirm.valid', '确认有效')}
                    {isEditting ? <Icon type="loading"/> : null}
                </Button>
                <Button onClick={this.cancelInvalidClue} data-tracename="点击取消确认有效按钮">{Intl.get('common.cancel', '取消')}</Button>
            </span>
        );
    }
    renderInvalidConfirm = (salesClueItem) => {
        let isInvalid = salesClueItem.availability === AVALIBILITYSTATUS.INAVALIBILITY;
        return (
            <div>
                {isInvalid ? this.renderValidConfirm(salesClueItem) : this.renderInvalidatePanel(salesClueItem)}
            </div>

        );
    };
    renderAvailabilityClue = (curClue) => {
        //标记线索无效的权限
        var avalibility = avalibilityCluePrivilege();
        //是否有修改线索关联客户的权利
        var associatedPrivilege = transferClueToCustomerIconPrivilege(curClue);
        if (avalibility){
            let pathname = window.location.pathname;
            //不是运营人员，且（在首页或者线索列表里）
            var showRelease = !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) && (pathname === '/home' || pathname === '/leads'), releaseTip = '';
            if(showRelease) {
                releaseTip = releaseClueTip();
            }
            return <div>
                {associatedPrivilege ? <Button type="primary" data-tracename="点击转为客户按钮"
                    onClick={this.convertToCustomer.bind(this, curClue)}>{Intl.get('common.convert.to.customer', '转为客户')}</Button> : null}
                <Button data-tracename="点击判定线索无效按钮" className='clue-inability-btn'
                    onClick={this.showConfirmInvalid.bind(this, curClue)}>
                    {editCluePrivilege(curClue) ? <span className="can-edit">{Intl.get('clue.customer.set.invalid','标为无效')}</span> : <span className="can-edit"> {Intl.get('clue.cancel.set.invalid', '改为有效')}</span>}

                </Button>
                {showRelease ? (
                    <Popconfirm
                        placement="topRight" onConfirm={this.handleReleaseClue}
                        title={releaseTip}>
                        <Button className='clue-inability-btn' disabled={this.state.isReleasingClue} loading={this.state.isReleasingClue}>{Intl.get('clue.release', '释放线索')}</Button>
                    </Popconfirm>
                ) : null}
            </div>;
        }else{
            return null;
        }

    };
    renderAssociatedAndInvalidClueHandle = (curClue) => {
        return (
            <div className="invalid-valid-container">
                <div className="btn-container">
                    {this.state.editInvalidClueId === curClue.id ? this.renderInvalidConfirm(curClue) : this.renderAvailabilityClue(curClue)}
                </div>
            </div>
        );
    };
    //判断是否显示按钮控制tab高度
    hasButtonTabHeight = (curClue, associatedCustomer ) => {
        var avalibility = (avalibilityCluePrivilege())
                            || (hasPrivilege(cluePrivilegeConst.LEAD_TRANSFER_MERGE_CUSTOMER)) && editCluePrivilege(curClue);
        var associatedClue = (curClue.clue_type !== 'clue_pool')
                                && ((curClue.status === SELECT_TYPE.WILL_DISTRIBUTE || curClue.status === SELECT_TYPE.HAS_TRACE || curClue.status === SELECT_TYPE.WILL_TRACE) && !associatedCustomer);
        let height = this.state.divHeight;
        if(_.get(this.state, 'isShowInvalidateInputPanel')){
            height = this.props.divHeight - HAS_INPUT_HEIGHT;
        }else if(avalibility && associatedClue){
            height = this.props.divHeight - HAS_BTN_HEIGHT;
        }else{
            height = this.props.divHeight;
        }
        return ({height: height});
    }

    handleCancelCustomerSuggest = () => {
        this.setState({
            clickAssociatedBtn: false,
        });
    };

    renderAssociatedAndInvalidClueText = (associatedCustomer) => {
        var curClue = this.state.curClue;
        //关联客户的按钮状态
        var associatedDisplyType = this.state.clickAssociatedBtn ? 'edit' : 'text';
        //如果关联了客户
        if (this.state.clickAssociatedBtn || associatedCustomer) {
            return this.renderBasicContent(Intl.get('clue.customer.associate.customer','关联客户'),<CustomerSuggest
                field='customer_id'
                hasEditPrivilege={false}
                displayText={associatedCustomer}
                displayType={associatedDisplyType}
                id={curClue.id}
                show_error={this.state.isShowCustomerError}
                noJumpToCrm={true}
                saveEditSelectCustomer={this.handleAssociatedCustomer}
                customer_name={associatedCustomer}
                customer_id={curClue.customer_id}
                addAssignedCustomer={this.addAssignedCustomer}
                noDataTip={Intl.get('clue.has.no.data', '暂无')}
                handleCancel={this.handleCancelCustomerSuggest}
                customerLable={curClue.customer_label}
                saveSameNoCustomerName={this.saveSameNoCustomerName}
            />);
        }
    };

    handleShowAppUser = (appUserId) => {
        //触发打开用户详情面板
        userDetailEmitter.emit(userDetailEmitter.OPEN_USER_DETAIL, {userId: appUserId});
    };

    //渲染跟进列表
    renderTraceList = () => {
        let curClue = _.get(this.state, 'curClue');
        return (<ClueTraceList
            curClue={curClue}
            updateCustomerLastContact={this.props.updateCustomerLastContact}
            isOverViewPanel={true}
            changeActiveKey={this.props.changeActiveKey}
            hideContactWay={this.props.hideContactWay}
        />);
    }

    //渲染跟进内容
    renderTraceContent = () => {
        var curClue = this.state.curClue;
        //是否有添加跟进记录的权限
        var hasPrivilegeAddEditTrace = hasPrivilege(commonSalesHomePrivilegeConst.CURTAO_CRM_TRACE_ADD) && editCluePrivilege(curClue);
        let noTraceData = _.isEmpty(_.get(curClue, 'customer_traces'));
        return (
            <DetailCard
                className={classNames('lead-trace-card', {'no-trace-card': noTraceData})}
                title={`${Intl.get('sales.frontpage.recent.record', '最新跟进')}`}
                titleBottomBorderNone={noTraceData}
                content={this.renderTraceList()}
                contentNoPadding={true}
                disableEdit={hasPrivilegeAddEditTrace}
            />);
    };

    //渲染关联账号的详情
    renderAppUserDetail = () => {
        var curClue = this.state.curClue;
        //线索关联的账号
        var appUserInfo = _.isArray(curClue.app_user_info) && curClue.app_user_info.length ? curClue.app_user_info[0] : {};
        if (_.isEmpty(appUserInfo)){
            return null;
        }
        return (
            <DetailCard content={(
                <div className="associate-user-detail clue-detail-block">
                    {this.renderBasicContent(Intl.get('clue.associate.user', '关联账号'), <span className="associate-user" onClick={this.handleShowAppUser.bind(this, appUserInfo.id)} data-tracename="查看关联账号详情">{appUserInfo.name}</span>, { containerCls: 'associate-user-item' })}
                </div>
            )}/>);
    };
    //获取获客方式
    getSourceClassify = (sourceClassify) => {
        let displayText = '';
        if(_.isEqual(sourceClassify, SOURCE_CLASSIFY.OTHER)) {
            displayText = '';
        } else {
            let displayObj = _.find(sourceClassifyArray, item => item.value === sourceClassify);
            if(!_.isEmpty(displayObj)){
                displayText = displayObj.name;
            }
        }
        return displayText;
    };
    //是否是我团队或下级团队的人
    isMyTeamOrChildUser(teamId) {
        let userObj = userData.getUserData();
        let flag = false;
        if (teamId) {
            //我团队的人
            if (teamId === userObj.team_id) {
                flag = true;
            } else {//下级团队的人
                flag = this.travelMyTeamUserFlag(this.state.myTeamTree, teamId);
            }
        }
        return flag;
    }

    //递归变量团队树判断是否是我下级团队
    travelMyTeamUserFlag(treeList, teamId) {
        let flag = false;
        _.each(treeList, team => {
            if (team.group_id === teamId) {
                flag = true;
                return false;
            } else if (!_.isEmpty(team.child_groups)) {
                flag = this.travelMyTeamUserFlag(team.child_groups, teamId);
                if (flag) {
                    return false;
                }
            }
        });
        return flag;
    }
    renderClueSimilarLists = (listItem, isSimilarClue) => {
        let warningContent = (
            <span className="client-error-tip">
                <span className="iconfont icon-warn-icon"></span>
                <span className="client-error-text">
                    {isSimilarClue ? Intl.get('clue.check.customer.detail.warning', '此线索已在其他销售名下') : Intl.get('common.check.customer.detail.warning', '此客户已在其他销售名下')}
                </span>
            </span>);
        let curClue = this.state.curClue;
        //查看当前客户或线索是否属于此销售，如果不属于，用popover提示
        let user_id = userData.getUserData().user_id;
        //后端会返回user_id或者member_id，哪个返回用哪个
        let isMyClientsOrClues = _.isEqual(_.get(listItem, 'user_id'), user_id) || _.isEqual(_.get(listItem, 'member_id'), user_id);
        //展示相似客户，相似线索的时候判断
        //如果是普通销售或者个人版本，判断当前客户或线索是否属于此销售，如果是销售领导，判断查看是否是他团队或下级团队下的
        //管理员和运营人员可以看
        let hasPrivilege = (isCommonSalesOrPersonnalVersion() && isMyClientsOrClues)
                            || this.isMyTeamOrChildUser(_.get(listItem, 'sales_team_id'))
                            || userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
        let clueName = listItem.name || <span className='no-clue-name'>{isSimilarClue ? Intl.get('clue.list.no.clue.name', '无线索名') : Intl.get('clue.list.no.crm.name', '无客户名')}</span>;
        //如果在线索池中，相似客户相似线索都不能点击查看，只能展示
        if(_.isEqual(curClue.clue_type,'clue_pool')){
            return (<span>{clueName}</span>);
        } else {
            if(hasPrivilege) {
                return (
                    <div className="similar-title-name">
                        <span data-tracename={isSimilarClue ? '打开线索详情' : '打开客户详情'} onClick={isSimilarClue ? this.showClueDetail.bind(this, listItem) : this.showCustomerDetail.bind(this, listItem)}>{clueName}</span>
                        {!isSimilarClue && editCluePrivilege(this.state.curClue) ? <Button onClick={this.mergeToThisCustomer.bind(this, curClue, listItem)} data-tracename='点击合并到此客户按钮'>{Intl.get('common.merge.to.customer', '合并到此客户')}</Button> : null}
                    </div>);
            } else {
                return (
                    <Popover
                        placement="topLeft"
                        overlayClassName="client-invalid-popover"
                        content={warningContent}
                        trigger="click">
                        <span>{clueName}</span> :
                    </Popover>
                );
            }
        }
    };

    renderSimilarLists = (listType) => {
        var isSimilarClue = listType === 'clue';
        var moreListShowFlag = this.state.showLargerClueLists;
        var similarLists = this.state.similarClueLists;
        if (!isSimilarClue){
            similarLists = this.state.similarCustomerLists;
            moreListShowFlag = this.state.showLargerCustomerLists;
        }
        var listMoreThanThree = _.get(similarLists,'length') > 3;
        if (!moreListShowFlag && listMoreThanThree){
            similarLists = _.cloneDeep(similarLists).splice(0,3);
        }
        return (
            <DetailCard
                title={(
                    <div className="similar-tip">
                        <i className="iconfont icon-phone-call-out-tip"></i>
                        {isSimilarClue ? Intl.get('clue.has.similar.lists', '相似线索') : Intl.get('customer.has.similar.lists', '相似客户')}
                    </div>)}
                contentNoPadding={true}
                content={(
                    <div className="similar-content similar-customer-list">
                        {_.map(similarLists, (listItem) => {
                            var sameContact = this.getSamePhoneContact(_.get(listItem, 'contacts', []));
                            var traceAddTime = _.get(listItem, 'customer_traces[0].call_date') || _.get(listItem, 'customer_traces[0].add_time');//跟进时间
                            let hasTraceContent = _.has(listItem, 'customer_traces[0].remark');
                            let isFromCluepool = _.isEqual(_.get(this.state, 'curClue.clue_type'), 'clue_pool');
                            let similarTitleCls = className('similar-title', {
                                'title-from-clue-pool': isFromCluepool
                            });
                            return <div className="similar-block">
                                <div className={similarTitleCls}>
                                    {isSimilarClue ? renderClueStatus(listItem) : null}
                                    {this.renderClueSimilarLists(listItem, isSimilarClue)}
                                </div>
                                {_.isArray(sameContact) ? _.map(sameContact, (contactsItem) => {
                                    return (
                                        <div className="similar-name-phone">
                                            {isSimilarClue ?
                                                <span className="contact-name" title={_.get(contactsItem, 'name', '')}>
                                                    {Intl.get('call.record.contacts', '联系人') + '：' + _.get(contactsItem, 'name', '')}
                                                </span> :
                                                <span className="contact-name" title={contactsItem.name}>
                                                    {contactsItem.name}
                                                </span>
                                            }
                                            {contactsItem.name && !_.isEmpty(contactsItem.phone) && !isSimilarClue ? '：' : ''}
                                            {contactsItem.name && !_.isEmpty(contactsItem.phone) && isSimilarClue ? ' (' : ''}
                                            {_.isArray(contactsItem.phone) ? contactsItem.phone.join(',') : null}
                                            {contactsItem.name && !_.isEmpty(contactsItem.phone) && isSimilarClue ? ')' : ''}
                                        </div>
                                    );
                                }) : null}
                                {traceAddTime && isSimilarClue && !hasTraceContent ? <span className="trace-time">{Intl.get('crm.last.trace', '最后跟进') + '：' + moment(traceAddTime).format(oplateConsts.DATE_MONTH_DAY_HOUR_MIN_FORMAT)}</span> : null}
                                {traceAddTime && isSimilarClue && hasTraceContent ?
                                    <div className="trace-container">
                                        <span className="trace-time">{Intl.get('crm.last.trace', '最后跟进') + '：'}</span>
                                        <span className="trace-content">{_.get(listItem, 'customer_traces[0].remark') + ' (' + _.get(listItem, 'customer_traces[0].nick_name', '') + ' ' + moment(traceAddTime).format(oplateConsts.DATE_MONTH_DAY_HOUR_MIN_FORMAT) + ')'}</span>
                                    </div> : null}
                            </div>;
                        })}
                        {listMoreThanThree ? <div className="show-hide-tip" onClick={isSimilarClue ? this.handleToggleClueTip : this.handleToggleCustomerTip} data-tracename='点击收起或展开全部按钮'>
                            {moreListShowFlag ? Intl.get('crm.contact.way.hide', '收起') : Intl.get('notification.system.more', '展开全部')}</div> : null}
                    </div>
                )} />);
    };

    // 渲染相同IP线索卡片
    renderSimilarIpLists = () => {
        var repeatIpIds = this.state.similarIpClueLists;
        var moreListShowFlagIP = this.state.showLargerIpLists;
        var ipListMoreThanThree = _.get(repeatIpIds,'length') > 3;
        if (!moreListShowFlagIP && ipListMoreThanThree){
            repeatIpIds = _.cloneDeep(repeatIpIds).splice(0,3);
        }
        return (
            <div className='similar-wrap'>
                <DetailCard
                    title={(
                        <div className="similar-tip">
                            <i className="iconfont icon-phone-call-out-tip"></i>
                            {Intl.get('clue.has.similar.ip', '相似IP线索')}
                        </div>)}
                    contentNoPadding={true}
                    content={(
                        <div className="similar-content similar-customer-list">
                            {_.map(repeatIpIds, (listItem) => {
                                let isFromCluepool = _.isEqual(_.get(this.state, 'curClue.clue_type'), 'clue_pool');
                                let similarTitleCls = className('similar-title', {
                                    'title-from-clue-pool': isFromCluepool
                                });
                                return <div className="similar-block">
                                    <div className={similarTitleCls}>
                                        {renderClueStatus(listItem)}
                                        {this.renderClueSimilarLists(listItem, true)}
                                    </div>
                                    <div className="similar-name-phone">
                                        <span className="contact-name contact-name-ip" title={_.get(listItem, 'source_ip', '')}>
                                            {Intl.get('clue.customer.source.ip', '来源IP') + '：' + listItem.source_ip }
                                        </span>
                                    </div>
                                </div>;
                            })}
                            {ipListMoreThanThree ? <div className="show-hide-tip" onClick={ this.handleToggleIpClueTip } data-tracename='点击收起或展开全部按钮'>
                                {moreListShowFlagIP ? Intl.get('crm.contact.way.hide', '收起') : Intl.get('notification.system.more', '展开全部')}</div> : null}
                        </div>
                    )}
                />
            </div>);
    };


    handleToggleCustomerTip = () => {
        this.setState({
            showLargerCustomerLists: !this.state.showLargerCustomerLists
        });
    };
    showCustomerDetail = (customer) => {
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customer.id,
                curCustomer: customer,
            }
        });
    };
    showClueDetail = (item) => {
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
            clue_params: {
                currentId: item.id,
                curClue: item,
            }
        });
    };
    //获取该线索和查询到的相似线索或者相似客户电话一样的联系人
    getSamePhoneContact = (contacts) => {
        contacts = _.cloneDeep(contacts);
        var cluePhone = this.getCurCluePhones();
        var cluePhoneArr = cluePhone.split(',');
        contacts = _.filter(contacts, (contactItem) => {
            //获取相同电话
            var interSectArr = _.intersection(_.get(contactItem,'phone',[]),cluePhoneArr);
            if (_.isEmpty(interSectArr)){
                return false;
            }else{
                contactItem.phone = interSectArr;
                return true;
            }
        });
        return contacts;
    };

    handleToggleClueTip = () => {
        this.setState({
            showLargerClueLists: !this.state.showLargerClueLists
        });
    }

    handleToggleIpClueTip = () => {
        this.setState({
            showLargerIpLists: !this.state.showLargerIpLists
        });
    }

    renderClueCustomerLists = () => {
        if (_.get(this,'state.similarClueLists[0]') || _.get(this, 'state.similarCustomerLists[0]')){
            return (
                <div className="similar-wrap">
                    {_.get(this, 'state.similarCustomerLists[0]') && !this.isHasTransferClue() ? this.renderSimilarLists() : null}
                    {_.get(this,'state.similarClueLists[0]') ? this.renderSimilarLists('clue') : null}
                </div>
            );
        }else{
            return null;
        }
    };

    // 调取渲染相同IP线索的方法
    renderIpClueLists = () => {
        if (_.get(this,'state.similarIpClueLists[0]')){
            return (
                <div className="similar-wrap">
                    { this.renderSimilarIpLists() }
                </div>
            );
        }else{
            return null;
        }
    };

    // 渲染提取线索按钮
    renderExtractClueBtn = (curClue) => {
        const hasAssignedPrivilege = !isCommonSalesOrPersonnalVersion();
        const assigenCls = 'detail-extract-clue-btn';
        return (
            <div className="clue-info-item">
                <div className="clue-info-label">
                    {Intl.get('clue.handle.clue', '线索处理')}
                </div>
                <div className="btn-container">
                    {this.props.extractClueOperator(hasAssignedPrivilege, curClue, assigenCls, true)}
                </div>
            </div>
        );
    };
    isClueNotAssociateCustomer = (curClue, associatedCustomer) => {
        return curClue.clue_type !== 'clue_pool' && (_.includes([SELECT_TYPE.WILL_DISTRIBUTE,SELECT_TYPE.HAS_TRACE,SELECT_TYPE.WILL_TRACE],curClue.status)) && !associatedCustomer;
    };
    // 渲染关联线索
    renderAssociatedClue = (curClue, associatedCustomer ) => {
        if (curClue.clue_type === 'clue_pool') { // 线索池中详情，处理线索
            if (freedCluePrivilege()) {
                return <DetailCard content={this.renderExtractClueBtn(curClue)}/>;
            } else {
                return null;
            }
        } else {
            if (this.isClueNotAssociateCustomer(curClue, associatedCustomer)) { // 待跟进或是已跟进，并且没有关联客户时，处理线索
                return <DetailCard content={this.renderAssociatedAndInvalidClueHandle(curClue)}/>;
            } else { // 显示处理线索的结果
                return <DetailCard content={this.renderAssociatedAndInvalidClueText(associatedCustomer)}/>;
            }
        }
    };

    //转为客户
    convertToCustomer = clue => {
        clueToCustomerPanelEmitter.emit(clueToCustomerPanelEmitter.OPEN_PANEL, {
            clue,
            similarCustomers: this.state.similarCustomerLists,
            afterConvert: this.props.afterTransferClueSuccess
        });
    }

    //合并到此客户
    mergeToThisCustomer = (clue, customer) => {
        clueToCustomerPanelEmitter.emit(clueToCustomerPanelEmitter.OPEN_PANEL, {
            clue,
            targetCustomer: customer,
            afterConvert: this.props.afterTransferClueSuccess
        });
    };
    onCheckPhoneSuccess = (result) => {
        this.props.updateClueProperty({phone_status: dealClueCheckPhoneStatus(this.state.curClue, result)});
    };
    renderContactContent() {
        let {curClue,isExpandContact} = this.state;
        //是否有权限修改线索详情
        var hasPrivilegeEdit = editClueItemIconPrivilege(curClue);
        return (_.map(curClue.contacts, (contactItem,index) => {
            var cls = classNames('contact-item-content contact-name',{
                'not-first-contact-name': index !== 0
            });
            return <div className="contact-item-wrap clue-info-item">
                <React.Fragment>
                    {index === 0 || isExpandContact ?
                        <React.Fragment>
                            <div className={cls}>
                                <span className="clue-info-label">{Intl.get('call.record.contacts', '联系人')}</span>
                                <div className="clue-info-detail">
                                    <BasicEditInputField
                                        width={EDIT_FEILD_WIDTH}
                                        hasEditPrivilege={hasPrivilegeEdit}
                                        id={curClue.id}
                                        saveEditInput={this.saveEditBasicInfo.bind(this, {
                                            editItem: 'contact_name',
                                            id: contactItem.id
                                        })}
                                        value={contactItem.name}
                                        field='contact_name'
                                        noDataTip={Intl.get('crm.no.contact', '暂无联系人')}
                                        addDataTip={Intl.get('clue.customer.edit.contact', '请填写联系人名称')}
                                        placeholder={Intl.get('clue.customer.edit.contact', '请填写联系人名称')}
                                        validators={contactNameRule()}
                                    />
                                </div>
                            </div>
                            <div className="contact-item-content">
                                <span className="clue-info-label">{Intl.get('member.position', '职务')}</span>
                                <div className="clue-info-detail">
                                    <BasicEditInputField
                                        width={EDIT_FEILD_WIDTH}
                                        hasEditPrivilege={hasPrivilegeEdit}
                                        id={curClue.id}
                                        saveEditInput={this.saveEditBasicInfo.bind(this, {
                                            editItem: 'position',
                                            id: contactItem.id
                                        })}
                                        value={contactItem.position}
                                        field='position'
                                        noDataTip={Intl.get('member.no.position', '暂无职务')}
                                        addDataTip={Intl.get('member.position.name.placeholder', '请输入职务名称')}
                                        placeholder={Intl.get('member.position.name.placeholder', '请输入职务名称')}
                                        validators={contactPositionRule()}
                                    />
                                </div>
                            </div>
                            <div className="contact-item-content">
                                <DynamicAddDelField
                                    id={curClue.id}
                                    field='phone'
                                    value={contactItem.phone}
                                    type='phone'
                                    label={Intl.get('common.phone', '电话')}
                                    hasEditPrivilege={hasPrivilegeEdit}
                                    placeholder={Intl.get('crm.95', '请输入联系人电话')}
                                    saveEditData={this.saveEditBasicInfo.bind(this, {
                                        editItem: 'phone',
                                        id: contactItem.id
                                    })}
                                    noDataTip={Intl.get('crm.contact.phone.none', '暂无电话')}
                                    addDataTip={Intl.get('crm.contact.phone.add', '添加电话')}
                                    contactName={contactItem.name}
                                    renderItemSelfSettingContent={this.renderItemSelfSettingContent.bind(this, curClue)}
                                    renderItemSelfSettingForm={this.renderItemSelfSettingForm}
                                    handleDelItem={this.handleDelItem}
                                />
                            </div>
                        </React.Fragment>
                        : null}
                    {isExpandContact ? <React.Fragment>
                        <div className="contact-item-content">
                            <DynamicAddDelField
                                id={curClue.id}
                                field='qq'
                                value={contactItem.qq}
                                type='input'
                                label={'QQ'}
                                hasEditPrivilege={hasPrivilegeEdit}
                                validateRules={[{
                                    message: Intl.get('common.correct.qq', '请输入正确的QQ号'),
                                    pattern: qqRegex,
                                }]}
                                placeholder={Intl.get('member.input.qq', '请输入QQ号')}
                                saveEditData={this.saveEditBasicInfo.bind(this, {
                                    editItem: 'qq',
                                    id: contactItem.id
                                })}
                                noDataTip={Intl.get('crm.contact.qq.none', '暂无QQ')}
                                addDataTip={Intl.get('crm.contact.qq.add', '添加QQ')}
                            />
                        </div>
                        <div className="contact-item-content">
                            <DynamicAddDelField
                                id={curClue.id}
                                field='weChat'
                                value={contactItem.weChat}
                                type='input'
                                label={Intl.get('crm.58', '微信')}
                                hasEditPrivilege={hasPrivilegeEdit}
                                validateRules={[{validator: checkWechat}]}
                                placeholder={Intl.get('member.input.wechat', '请输入微信号')}
                                saveEditData={this.saveEditBasicInfo.bind(this, {
                                    editItem: 'weChat',
                                    id: contactItem.id
                                })}
                                noDataTip={Intl.get('crm.contact.wechat.none', '暂无微信')}
                                addDataTip={Intl.get('crm.contact.wechat.add', '添加微信')}
                            />
                        </div>
                        <div className="contact-item-content">
                            <DynamicAddDelField
                                id={curClue.id}
                                field='email'
                                value={contactItem.email}
                                type='input'
                                label={Intl.get('common.email', '邮箱')}
                                hasEditPrivilege={hasPrivilegeEdit}
                                validateRules={[{
                                    message: Intl.get('user.email.validate.tip', '请输入正确格式的邮箱'),
                                    pattern: emailRegex
                                }]}
                                placeholder={Intl.get('member.input.email', '请输入邮箱')}
                                saveEditData={this.saveEditBasicInfo.bind(this, {
                                    editItem: 'email',
                                    id: contactItem.id
                                })}
                                noDataTip={Intl.get('crm.contact.email.none', '暂无邮箱')}
                                addDataTip={Intl.get('crm.contact.email.add', '添加邮箱')}
                            />
                        </div>
                    </React.Fragment> : null }
                </React.Fragment>
            </div>;
        })
        );
    }
    renderContactTitle = () => {
        return (
            <span className="contact-item-title">
                <span className='contact-name-label'>{Intl.get('crm.5', '联系方式')}</span>
            </span>);
    };
    toggleContactWay = (isExpanded) => {
        this.setState({
            isExpandContact: isExpanded
        });
    };
    renderClueContact = () => {
        return <DetailCard
            title={this.renderContactTitle()}
            content={this.renderContactContent()}
            className='contact-item clue-info-wrap clue-detail-block clue-contact-container'
            isShowToggleBtn={true}
            handleToggleDetail={this.toggleContactWay.bind(this)}
        />;
    };
    //渲染详情中label和content中的基本结构
    renderBasicContent = (label, content, basicCls) => {
        return <div className={'clue-info-item ' + _.get(basicCls,'containerCls','')}>
            <div className={'clue-info-label ' + _.get(basicCls,'labelCls','')}>
                {label}
            </div>
            <div className={'clue-info-detail ' + _.get(basicCls,'contentCls','')}>
                {content}
            </div>
        </div>;
    };
    renderClueCompanyInfo = () => {
        var {curClue} = this.state;
        return (
            <div className='clue-info-wrap clue-detail-block'>
                {curClue.formed ? this.renderBasicContent(Intl.get('clue.customer.register.time', '注册时间'),
                    <BasicEditInputField
                        hasEditPrivilege={false}
                        id={curClue.id}
                        value={moment(curClue.formed).format(oplateConsts.DATE_FORMAT)}
                        field='formed'
                        noDataTip={Intl.get('clue.customer.no.register.time', '暂无注册时间')}
                    />
                ) : null}
                {curClue.business_scope ? this.renderBasicContent(Intl.get('clue.recommend.clue.scope', '经营范围'),
                    <BasicEditInputField
                        hasEditPrivilege={false}
                        id={curClue.id}
                        value={<ShearContent rowsNum={3}>{curClue.business_scope}</ShearContent>}
                        field='business_scope'
                        noDataTip={Intl.get('clue.recommend.no.clue.scope', '暂无经营范围')}
                    />
                ) : null}
                {curClue.company_profile ? this.renderBasicContent(Intl.get('clue.recommend.clue.introduction', '简介'),
                    <BasicEditInputField
                        hasEditPrivilege={false}
                        id={curClue.id}
                        value={<ShearContent rowsNum={3}>{curClue.company_profile}</ShearContent>}
                        field='company_profile'
                        noDataTip={Intl.get('clue.recommend.no.clue.introduction', '暂无简介')}
                    />
                ) : null}
            </div>
        );
    };
    //线索的地域，地址，来源，官网
    renderClueAddress = () => {
        var {curClue} = this.state;
        //是否有权限修改线索详情
        var hasPrivilegeEdit = editClueItemIconPrivilege(curClue);
        return (
            <div className='clue-info-wrap clue-detail-block'>
                <div className="clue-basic-info">
                    {this.renderBasicContent(Intl.get('crm.96', '地域'), <LocationSelectField
                        width={EDIT_FEILD_WIDTH}
                        id={curClue.id}
                        province={curClue.province}
                        city={curClue.city}
                        county={curClue.county}
                        province_code={curClue.province_code}
                        city_code={curClue.city_code}
                        county_code={curClue.county_code}
                        saveEditLocation={this.saveEditBasicInfo.bind(this, 'province')}
                        hasEditPrivilege={hasPrivilegeEdit}
                        noDataTip={Intl.get('crm.basic.no.location', '暂无地域信息')}
                        addDataTip={Intl.get('crm.basic.add.location', '添加地域信息')}
                    />, {containerCls: 'area-content', contentCls: 'area-item'})}
                    {this.renderBasicContent(Intl.get('common.full.address', '详细地址'),<BasicEditInputField
                        width={EDIT_FEILD_WIDTH}
                        id={curClue.id}
                        value={curClue.address}
                        field="address"
                        type="input"
                        placeholder={Intl.get('crm.detail.address.placeholder', '请输入详细地址')}
                        hasEditPrivilege={hasPrivilegeEdit}
                        saveEditInput={this.saveEditBasicInfo.bind(this, 'address')}
                        noDataTip={Intl.get('crm.basic.no.address', '暂无详细地址')}
                        addDataTip={Intl.get('crm.basic.add.address', '添加详细地址')}
                    />,{containerCls: 'basic-info-detail-address'})}
                    {curClue.source_ip ? this.renderBasicContent(Intl.get('clue.customer.source.ip', '来源IP'),<BasicEditInputField
                        hasEditPrivilege={false}
                        id={curClue.id}
                        saveEditInput={this.saveEditBasicInfo.bind(this, 'source_ip')}
                        value={curClue.source_ip}
                        field='source_ip'
                        noDataTip={Intl.get('clue.customer.no.source.ip', '未设置来源IP')}
                    />) : null}
                    {/*有官网字段就展示*/}
                    {curClue.website ? this.renderBasicContent(Intl.get('lead.info.website.info' , '官网'),
                        <a onClick={this.openNewTabLink.bind(this,curClue.website)}><BasicEditInputField
                            hasEditPrivilege={false}
                            id={curClue.id}
                            value={curClue.website}
                            field='website'
                        /></a>
                    ) : null}
                    <div className='clear-float'></div>
                </div>
            </div>
        );
    };
    openNewTabLink = (website) => {
        if(website.indexOf('http') === -1){
            website = `http://${website}`;
        }
        window.open(website,'_blank');
    };
    //时间，线索描述，行业
    renderClueTimeAndIndustry = () => {
        var {curClue} = this.state;
        //是否有权限修改线索详情
        var hasPrivilegeEdit = editClueItemIconPrivilege(curClue);
        let industryOptions = this.state.industryList.map((item, i) => {
            return (<Option key={i} value={item}>{item}</Option>);
        });
        return (
            <div className='clue-info-wrap clue-detail-block'>
                <div className="clue-basic-info">
                    {this.renderBasicContent(Intl.get('common.login.time', '时间'), <DatePickerField
                        width={EDIT_FEILD_WIDTH}
                        hasEditPrivilege={hasPrivilegeEdit}
                        id={curClue.id}
                        saveEditDateInput={this.saveEditBasicInfo.bind(this, 'source_time')}
                        value={curClue.source_time}
                        field="source_time"
                        disabledDate={this.disabledDate}
                    />)}
                    {this.renderBasicContent(Intl.get('crm.sales.clue.descr', '线索描述'),<BasicEditInputField
                        width={EDIT_FEILD_WIDTH}
                        hasEditPrivilege={hasPrivilegeEdit}
                        id={curClue.id}
                        saveEditInput={this.saveEditBasicInfo.bind(this, 'source')}
                        value={curClue.source}
                        field='source'
                        type='textarea'
                        row={3}
                        noDataTip={Intl.get('clue.no.clue.describe', '暂无线索描述')}
                        addDataTip={Intl.get('clue.add.clue.describe', '添加线索描述')}
                        placeholder={Intl.get('clue.add.clue.placeholder', '请填写线索描述')}
                    />)}
                    {this.renderBasicContent(Intl.get('common.industry', '行业'), <BasicEditSelectField
                        width={EDIT_FEILD_WIDTH}
                        id={curClue.id}
                        displayText={curClue.industry}
                        value={curClue.industry}
                        field="industry"
                        selectOptions={industryOptions}
                        hasEditPrivilege={hasPrivilegeEdit}
                        placeholder={Intl.get('crm.22', '请选择行业')}
                        editBtnTip={Intl.get('crm.163', '设置行业')}
                        saveEditSelect={this.saveEditBasicInfo.bind(this, 'industry')}
                        noDataTip={Intl.get('crm.basic.no.industry', '暂无行业')}
                        addDataTip={Intl.get('crm.basic.add.industry', '添加行业')}
                    />,{containerCls: 'basic-info-industry'})}
                    <div className='clear-float'></div>
                </div>
            </div>);
    };
    isAdminOrOperationRole = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    }
    //获客方式，来源，接入渠道，分类
    renderClueSourceAndClassfy = () => {
        var {curClue} = this.state;
        //是否有权限修改线索详情
        var hasPrivilegeEdit = editClueItemIconPrivilege(curClue);
        // 已转化和无效的线索开放修改来源、渠道、获客方式、分类（运营和管理员）
        if(!hasPrivilegeEdit && this.isAdminOrOperationRole()){
            hasPrivilegeEdit = true;
        }
        return (
            <div className='clue-info-wrap clue-detail-block'>
                <div className="clue-basic-info">
                    {this.renderBasicContent(Intl.get('crm.clue.client.source', '获客方式'),<BasicEditSelectField
                        width={EDIT_FEILD_WIDTH}
                        hasEditPrivilege={hasPrivilegeEdit}
                        id={curClue.id}
                        saveEditSelect={this.saveEditBasicInfo.bind(this, 'source_classify')}
                        cancelEditField={this.cancelEditSourceClassify}
                        selectOptions={sourceClassifyOptions}
                        displayText={this.getSourceClassify(curClue.source_classify)}
                        onSelectChange={this.onSelectSourceClassify}
                        value={curClue.source_classify}
                        placeholder={Intl.get('crm.clue.client.source.placeholder', '请选择获客方式')}
                        addDataTip={Intl.get('crm.clue.client.source.add', '添加获客方式')}
                        field="source_classify"
                        noDataTip={Intl.get('common.unknown', '未知')}
                    />,{contentCls: 'source-classify'})}
                    {this.renderBasicContent(Intl.get('call.record.customer.source', '来源'),<BasicEditSelectField
                        width={EDIT_FEILD_WIDTH}
                        combobox={true}
                        hasEditPrivilege={hasPrivilegeEdit}
                        id={curClue.id}
                        saveEditSelect={this.saveEditBasicInfo.bind(this, 'clue_source')}
                        cancelEditField={this.cancelEditClueSource}
                        value={curClue.clue_source}
                        field="clue_source"
                        selectOptions={this.getClueSourceOptions()}
                        displayText={curClue.clue_source}
                        onSelectChange={this.onSelectCluesource}
                        placeholder={Intl.get('crm.clue.source.placeholder', '请选择或输入线索来源')}
                        noDataTip={Intl.get('clue.no.clue.source', '暂无线索来源')}
                        addDataTip={Intl.get('clue.add.clue.source', '添加线索来源')}
                    />)}
                    {this.renderBasicContent(Intl.get('crm.sales.clue.access.channel', '接入渠道'),<BasicEditSelectField
                        width={EDIT_FEILD_WIDTH}
                        combobox={true}
                        hasEditPrivilege={hasPrivilegeEdit}
                        id={curClue.id}
                        saveEditSelect={this.saveEditBasicInfo.bind(this, 'access_channel')}
                        cancelEditField={this.cancelEditClueChannel}
                        value={curClue.access_channel}
                        field="access_channel"
                        displayText={curClue.access_channel}
                        selectOptions={this.getAccessChannelOptions()}
                        onSelectChange={this.onSelectAccessChannel}
                        placeholder={Intl.get('crm.access.channel.placeholder', '请选择或输入接入渠道')}
                        noDataTip={Intl.get('clue.no.access.channel', '暂无接入渠道')}
                        addDataTip={Intl.get('clue.add.access.channel', '添加接入渠道')}
                    />)}
                    {this.renderBasicContent(Intl.get('contract.purchase.contract.type', '分类'),<BasicEditSelectField
                        width={EDIT_FEILD_WIDTH}
                        combobox={true}
                        hasEditPrivilege={hasPrivilegeEdit}
                        id={curClue.id}
                        saveEditSelect={this.saveEditBasicInfo.bind(this, 'clue_classify')}
                        cancelEditField={this.cancelEditClueClassify}
                        value={curClue.clue_classify}
                        field="clue_classify"
                        displayText={curClue.clue_classify}
                        selectOptions={this.getClueClassifyOptions()}
                        onSelectChange={this.onSelectClueClassify}
                        placeholder={Intl.get('crm.clue.classify.placeholder', '请选择或输入线索分类')}
                        noDataTip={Intl.get('clue.customer.no.classify.tip', '暂无分类')}
                        addDataTip={Intl.get('clue.add.clue.classfify', '添加线索分类')}
                    />)}
                    <div className='clear-float'></div>
                </div>
            </div>
        );
    };
    saveEditCustomFieldInfo = (saveObj, successFunc, errorFunc) => {
        // 自定义的值
        const customVariables = _.get(this.state.curClue, 'custom_variables', {});
        let updateObj = _.cloneDeep(saveObj);
        delete updateObj.id;
        const submitData = {
            id: this.state.curClue.id,
            type: 'custom_variables',
            custom_variables: _.extend(customVariables, updateObj)
        };
        this.changeClueItemInfo(submitData, successFunc, errorFunc);
    }
    render() {
        var curClue = this.state.curClue;
        //所分配的销售
        var assignedSales = _.get(curClue, 'user_name');
        //关联客户
        var associatedCustomer = curClue.customer_name;
        //分配线索给销售的权限
        var hasAssignedPrivilege = assignSalesPrivilege(curClue);
        var associateCls = className('associate-customer-detail clue-detail-block',{
            'no-margin': this.isClueNotAssociateCustomer(curClue, associatedCustomer)
        });
        //展示公司相关信息 有注册时间 || 经营范围 || 公司简介就展示该卡片
        var showClueCompany = curClue.formed || curClue.business_scope || curClue.company_profile;
        //是否有权限修改线索详情
        const hasPrivilegeEdit = editClueItemIconPrivilege(curClue);
        return (
            <div
                className="clue-detail-container"
                data-tracename="线索基本信息"
                style={this.hasButtonTabHeight(curClue, associatedCustomer)}
            >
                <GeminiScrollbar>
                    {
                        curClue.version_upgrade_id && !_.isEmpty(this.state.versionData) ?
                            <ApplyTryCard versionData={this.state.versionData}/> :
                            null
                    }
                    {
                        this.props.hideContactWay ? null : this.renderClueContact()
                    }
                    {
                        showClueCompany ?
                            <DetailCard content={this.renderClueCompanyInfo()}/> :
                            null
                    }
                    <DetailCard content={this.renderClueAddress()}/>
                    <DetailCard content={this.renderClueTimeAndIndustry()}/>
                    <DetailCard content={this.renderClueSourceAndClassfy()}/>
                    {this.renderClueCustomerLists()}
                    {this.renderIpClueLists()}
                    {/*分配线索给某个销售*/}
                    {/*有分配的权限，但是该线索没有分配给某个销售的时候，展示分配按钮，其他情况都展示分配详情就可以*/}
                    <DetailCard content={(
                        <div className="assign-sales-warp clue-detail-block">
                            {hasAssignedPrivilege && !assignedSales && !this.state.clickAssigenedBtn ?
                                this.renderAssigendClueText() : this.renderAssignedClueEdit()
                            }
                        </div>
                    )} />
                    <div className={associateCls}>
                        {/*线索处理，已跟进或待跟进的线索并且没有关联客户*/}
                        {this.renderAssociatedClue(curClue, associatedCustomer)}
                    </div>
                    {this.renderAppUserDetail()}
                    {this.state.isShowAddCustomer ? this.renderAddCustomer() : null}
                    {this.renderTraceContent()}
                    {
                        _.isEmpty(this.props.leadCustomFieldData) ? null : (
                            <CustomField
                                customFieldData={this.props.leadCustomFieldData}
                                basicDetailData={this.state.curClue}
                                hasEditPrivilege={hasPrivilegeEdit}
                                saveEditCustomFieldInfo={this.saveEditCustomFieldInfo}
                                editWidth={330}
                            />
                        )
                    }
                </GeminiScrollbar>
            </div>
        );
    }
}
ClueDetailOverview.defaultProps = {
    curClue: {},
    divHeight: '',
    clueSourceArray: [],
    accessChannelArray: [],
    clueClassifyArray: [],
    hideContactWay: false,
    updateClueSource: function() {},
    updateClueChannel: function() {},
    updateClueClassify: function() {},
    salesManList: [],
    removeUpdateClueItem: function() {

    },
    hideRightPanel: function() {

    },
    updateClueProperty: function() {

    },
    afterTransferClueSuccess: function() {

    },
    onConvertToCustomerBtnClick: function() {

    },
    updateCustomerLastContact: function() {

    },
    showClueToCustomerPanel: function() {

    },
    leadCustomFieldData: {}

};
ClueDetailOverview.propTypes = {
    curClue: PropTypes.object,
    divHeight: PropTypes.string,
    clueSourceArray: PropTypes.object,
    accessChannelArray: PropTypes.object,
    clueClassifyArray: PropTypes.object,
    updateClueSource: PropTypes.func,
    updateClueChannel: PropTypes.func,
    updateClueClassify: PropTypes.func,
    salesManList: PropTypes.object,
    removeUpdateClueItem: PropTypes.func,
    hideRightPanel: PropTypes.func,
    updateClueProperty: PropTypes.func,
    afterTransferClueSuccess: PropTypes.func,
    onConvertToCustomerBtnClick: PropTypes.func,
    updateCustomerLastContact: PropTypes.func,
    extractClueOperator: PropTypes.func,
    showClueToCustomerPanel: PropTypes.func,
    changeActiveKey: PropTypes.func,
    hideContactWay: PropTypes.bool,
    leadCustomFieldData: PropTypes.object,// 线索自定义字段数据
};

module.exports = ClueDetailOverview;


