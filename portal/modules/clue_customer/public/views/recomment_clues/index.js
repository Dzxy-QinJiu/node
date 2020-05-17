/**
 * Copyright (c) 2018-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/4/9.
 */
import '../../css/recommend_clues_lists.less';
import { RightPanel } from 'CMP_DIR/rightPanel';
import TopNav from 'CMP_DIR/top-nav';
import Spinner from 'CMP_DIR/spinner';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import {Button, Checkbox, message, Popover, Tag, Icon} from 'antd';
import NoDataIntro from 'CMP_DIR/no-data-intro';
import ShearContent from 'CMP_DIR/shear-content';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import DetailCard from 'CMP_DIR/detail-card';
import AlertTimer from 'CMP_DIR/alert-timer';
var clueCustomerAction = require('MOD_DIR/clue_customer/public/action/clue-customer-action');
var clueCustomerStore = require('MOD_DIR/clue_customer/public/store/clue-customer-store');
import {
    batchPushEmitter,
    leadRecommendEmitter,
    notificationEmitter,
    paymentEmitter
} from 'PUB_DIR/sources/utils/emitters';
import RecommendCluesFilterPanel from './recommend_clues_filter_panel';
const ADVANCED_OPTIONS = RecommendCluesFilterPanel.ADVANCED_OPTIONS;
var batchOperate = require('PUB_DIR/sources/push/batch');
import userData from 'PUB_DIR/sources/user-data';
import {
    ADD_INDUSTRY_ADDRESS_CLUE_CONDITION,
    checkClueCondition,
    getClueSalesList,
    getLocalSalesClickCount,
    HASEXTRACTBYOTHERERRTIP,
    isCommonSalesOrPersonnalVersion,
    SetLocalSalesClickCount,
    EXTRACT_CLUE_CONST_MAP,
    getShowPhoneNumber
} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import {
    checkCurrentVersionType,
    checkVersionAndType,
    formatSalesmanList, 
    getContactSalesPopoverTip, 
    getFormattedCondition, 
    isExpired, 
    isResponsiveDisplay,
    isCurtao
} from 'PUB_DIR/sources/utils/common-method-util';
import {getMaxLimitExtractClueCount, updateGuideMark, checkPhoneStatus} from 'PUB_DIR/sources/utils/common-data-util';
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';
import {
    BOOT_PROCESS_KEYS,
    COMPANY_PHONE,
    COMPANY_VERSION_KIND,
    extractIcon,
    RECOMMEND_CLUE_FILTERS,
    PHONE_STATUS_MAP,
} from 'PUB_DIR/sources/utils/consts';
import history from 'PUB_DIR/sources/history';
import React from 'react';
import {addOrEditSettingCustomerRecomment} from 'MOD_DIR/clue_customer/public/ajax/clue-customer-ajax';
import {isSupportCheckPhone} from 'PUB_DIR/sources/utils/validate-util';
import { storageUtil } from 'ant-utils';
import { setWebsiteConfig } from 'LIB_DIR/utils/websiteConfig';


const LAYOUT_CONSTANCE = {
    FILTER_WIDTH: 396,
    TABLE_TITLE_HEIGHT: 60,//带选择框的TH高度
    TITLE_HEIGHT: 70,// 顶部标题区域高度
    PADDING_TOP: 24,// 距离顶部标题区域高度
    PADDING_BOTTOM: 20, //底部区域padding高度
};

const CLUE_RECOMMEND_SELECTED_SALES = 'clue_recommend_selected_sales';

const CONTACT_PHONE_CLS = 'extract-clue-contact-count';

//提取成功后，显示的时间，默认5s
const EXTRACTED_SUCCESS_TIME = 5000;

const EXTRACT_OPERATOR_TYPE = {
    SINGLE: 'single',
    BATCH: 'batch'
};

const BATCH_EXTRACT_TYPE = {
    ONLY: 'only',//只提有实号的
    ALL: 'all',//全部提取
};

const ENABLE_CHECK_PHONE_STATUS = 'enable_check_phone_status';

class RecommendCluesList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            singleExtractLoading: '', // 单个提取的loading
            batchExtractLoading: false,
            saveErrorMsg: '',
            selectedRecommendClues: [],//选中状态的推荐线索
            disabledCheckedClues: [],//禁用状态的线索,用于记录提取之前selected中的线索数量
            salesMan: '',
            salesManNames: '',
            unSelectDataTip: '', // 没有选择销售时的提示
            hasExtractCount: 0,//已经提取的推荐线索的数量
            maxLimitExtractNumber: 0,//该账号的最大提取线索数量（试用账号是今天的，正式账号是本月的）
            getMaxLimitExtractNumberError: false,//获取该账号的最大提取量出错
            hasNoExtractCountTip: false,//批量操作展示popover
            disableExtract: false,//是否还能提取
            batchSelectedSales: '',//记录当前批量选择的销售，销销售团队id
            canClickExtract: true, //防止连续点击批量提取相同线索
            showDifferentVersion: false,//是否显示版本信息面板
            isShowWiningClue: false, // 是否显示领线索活动界
            singlePopoverVisible: '',//是否显示单个提取后超限内容
            batchPopoverVisible: '',//是否显示批量提取后超限内容
            extractLimitContent: null,//超限后提示内容
            extractedResult: '',//提取成功后提示
            batchExtractType: '',//批量检测后选择的提取类型（只提有实号的、全部提取）
            showSingleExtractTip: '',//是否展示单个提取上的tip
            showBatchExtractTip: false,//是否展示批量提取上的tip
            ...clueCustomerStore.getState()
        };
    }

    isClearSelectSales = true;

    onStoreChange = () => {
        this.setState(clueCustomerStore.getState());
    };

    componentDidMount() {
        this.getSalesmanList();
        this.getRecommendClueCount('didMount');
        //获取是否配置过线索推荐条件
        this.getSettingCustomerRecomment();
        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
        paymentEmitter.on(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
        paymentEmitter.on(paymentEmitter.ADD_CLUES_PAYMENT_SUCCESS, this.handleUpdateClues);
        clueCustomerStore.listen(this.onStoreChange);
        $('#app .row > .col-xs-10').addClass('recommend-clues-page-container');
    }

    componentWillUnmount() {
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_ENT_CLUE, this.batchExtractCluesLists);
        paymentEmitter.removeListener(paymentEmitter.PERSONAL_GOOD_PAYMENT_SUCCESS, this.handleUpdatePersonalVersion);
        paymentEmitter.removeListener(paymentEmitter.ADD_CLUES_PAYMENT_SUCCESS, this.handleUpdateClues);
        clueCustomerStore.unlisten(this.onStoreChange);
        clueCustomerAction.initialRecommendClues();
        $('#app .row > .col-xs-10').removeClass('recommend-clues-page-container');
        this.isClearSelectSales = true;
    }

    batchExtractCluesLists = (taskInfo, taskParams) => {
        //如果参数不合法，不进行更新
        if (!_.isObject(taskInfo)) {
            return;
        }
        //解析tasks
        var {
            tasks
        } = taskInfo;
        //如果tasks为空，不进行更新
        if (!_.isArray(tasks) || !tasks.length) {
            return;
        }
        //检查taskDefine
        tasks = _.filter(tasks, (task) => typeof task.taskDefine === 'string');
        //如果没有要更新的数据
        if (!tasks.length) {
            return;
        }

        // 如果提取给的销售是自己，则需要提示刷新
        if(_.isEqual(_.get(taskParams,'user_id'), userData.getUserData().user_id)) {
            notificationEmitter.emit(notificationEmitter.UPDATED_MY_HANDLE_CLUE, {});
            //提取成功nav-sidebar线索管理展示加1效果
            leadRecommendEmitter.emit(leadRecommendEmitter.ADD_LEAD_MANAGEMENT_ONE_NUM);
        }

        var clueArr = _.map(tasks, 'taskDefine');
        // 遍历每一个线索
        _.each(clueArr, (clueItem) => {
            var arr = _.split(clueItem,'_');
            //如果当前线索是需要更新的线索，才更新
            this.updateRecommendClueLists(arr[0]);
        });
        //列表空时
        if ( _.isEmpty(this.state.recommendClueLists)) {
            this.getRecommendClueLists();
        }
    };

    // 获取销售人员
    getSalesmanList() {
        // 管理员，运营获取所有人
        if (this.isManagerOrOperation()) {
            clueCustomerAction.getAllSalesUserList();
        } else {
            clueCustomerAction.getSalesManList();
        }
    }

    // 是否是管理员或者运营人员
    isManagerOrOperation = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    };

    //获取个人线索推荐保存配置
    getSettingCustomerRecomment() {
        let settedCustomerRecommend = this.state.settedCustomerRecommend;
        this.setState({
            settedCustomerRecommend: _.extend(settedCustomerRecommend, {loading: true})
        });
        clueCustomerAction.getSettingCustomerRecomment(_.get(settedCustomerRecommend,'obj'), (condition) => {
            let isNotSavedRecommendFilter = this.isNotSavedRecommendFilter({obj: condition});
            if(isNotSavedRecommendFilter) {//需要判断是否设置过过滤条件，没有则根据手机号获取所在区域
                this.getAreaByPhone(condition);
                return false;
            }
            //获取推荐的线索
            this.getRecommendClueLists(condition);
        });
    }

    //没有设置过筛选条件
    isNotSavedRecommendFilter = (settedCustomerRecommend) => {
        var hasCondition = checkClueCondition(ADD_INDUSTRY_ADDRESS_CLUE_CONDITION, _.get(settedCustomerRecommend,'obj'));
        return (!settedCustomerRecommend.loading && !hasCondition);
    };

    //根据手机号获取所在区域
    getAreaByPhone = (condition) => {
        let phone = _.get(userData.getUserData(), 'phone');
        if(phone) {
            $.ajax({
                url: '/rest/user/address/' + phone,
                type: 'get',
                dataType: 'json',
                success: (data) => {
                    let {...hasSavedRecommendParams} = _.get(this.state.settedCustomerRecommend,'obj', {});
                    if(_.isObject(data)) {
                        hasSavedRecommendParams.province = data.province;
                        hasSavedRecommendParams.city = data.city;
                        //保存条件
                        this.saveRecommendFilter(hasSavedRecommendParams);
                    }

                    //获取推荐的线索
                    this.getRecommendClueLists(hasSavedRecommendParams);
                },
                error: () => {
                    //获取推荐的线索
                    this.getRecommendClueLists(condition);
                }
            });
        }else {
            //获取推荐的线索
            this.getRecommendClueLists(condition);
        }
    };

    getSearchCondition = (condition) => {
        var conditionObj = _.cloneDeep(condition || _.get(this, 'state.settedCustomerRecommend.obj'));
        conditionObj.load_size = this.state.pageSize;
        return conditionObj;
    };
    getRecommendClueLists = (condition, type) => {
        if(!_.isEqual(type, EXTRACT_CLUE_CONST_MAP.RESET) && this.state.canClickMoreBatch === false) return;
        this.setState({selectedRecommendClues: [], disabledCheckedClues: []});
        var conditionObj = this.getSearchCondition(condition);
        let lastItem = _.last(this.state.recommendClueLists);
        //去掉为空的数
        //todo 暂时注释掉，之后可能需要用到
        // if(this.state.hasExtraRecommendList){
        //     conditionObj = {
        //         'sortvalues': this.state.sortvalues,
        //         ...conditionObj
        //     };
        // }
        //是否选择复工企业或者上市企业
        if(this.state.feature) {
            //如果选中'最近半年注册'项
            if(this.isSelectedHalfYearRegister()) {
                // startTime、endTime改为最近半年注册的时间
                conditionObj.startTime = moment().subtract(6, 'months').startOf('day').valueOf();
                conditionObj.endTime = moment().endOf('day').valueOf();
            }else {
                let feature = this.getAdvanceItem();
                if(feature.value) {
                    conditionObj[feature.key] = feature.value;
                }
            }
        }

        let length = this.state.recommendClueLists.length;
        let total = this.state.total;
        //点击换一批,且总数大于20，且当前列表长度等于20时，才加这个ranking参数
        if(_.isEqual(type, EXTRACT_CLUE_CONST_MAP.ANOTHER_BATCH)
            && total > this.state.pageSize
            && length === this.state.pageSize
            && !_.isNil(_.get(lastItem,'ranking'))
        ) {
            conditionObj.ranking = _.get(lastItem, 'ranking') + 1;
        }
        clueCustomerAction.getRecommendClueLists(conditionObj);
    };
    //保存推荐线索的条件
    saveRecommendFilter(hasSavedRecommendParams) {
        let traceStr = getFormattedCondition(hasSavedRecommendParams, RECOMMEND_CLUE_FILTERS);
        Trace.traceEvent($(ReactDOM.findDOMNode(this)), '保存线索推荐查询条件 ' + traceStr);
        addOrEditSettingCustomerRecomment(hasSavedRecommendParams).then((data) => {
            if (data){
                let targetObj = _.get(data, '[0]');
                clueCustomerAction.saveSettingCustomerRecomment(targetObj);
            }
        });
    }

    //获取选中的高级筛选
    getAdvanceItem() {
        let feature = this.state.feature;
        feature = feature.split(':');
        return {
            key: feature[0],
            value: feature[1]
        };
    }

    isSelectedHalfYearRegister() {
        let feature = this.getAdvanceItem();
        return feature.value === EXTRACT_CLUE_CONST_MAP.LAST_HALF_YEAR_REGISTER;
    }

    //-------------- 检测手机号状态 start -------
    //获取可检测空号的线索列表
    getCluePhoneList(clues) {
        let checkedClueList = [];
        _.each(clues, clue => {
            let phones = _.get(clue, 'telephones');
            if(!_.isEmpty(phones)) {
                phones = _.chain(phones)
                    .uniq()
                    .filter(item => isSupportCheckPhone(item))
                    .value();
                if(phones.length) {
                    checkedClueList.push({id: clue.id});
                }
            }
        });
        return {
            //都是不可检测的电话（座机号、不支持的号段(14,16,17,19)）
            isCanNotCheckPhone: _.isEmpty(checkedClueList),
            //可检测空号的线索列表
            checkedClueList
        };
    }
    //检测手机号状态
    checkPhoneStatus(clues, type, callback, hasAssignedPrivilege) {
        if(this.state.singleExtractLoading || this.state.batchExtractLoading) {return false;}
        if(hasAssignedPrivilege && !this.state.salesMan) {//有分配销售的权限时，需要判断是否选择了销售人员
            this.setState({unSelectDataTip: Intl.get('crm.17', '请选择销售人员')});
            return false;
        }

        //有分配权限，在检测空号时，不能清除选择的销售人员
        this.isClearSelectSales = !hasAssignedPrivilege;

        if(type === EXTRACT_OPERATOR_TYPE.SINGLE) {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '点击单个检测按钮');
        }else {
            Trace.traceEvent(ReactDOM.findDOMNode(this), '点击批量检测按钮');
            clues = this.state.selectedRecommendClues;
        }

        let data = this.getCluePhoneList(clues);
        clues = type === EXTRACT_OPERATOR_TYPE.SINGLE ? clues[0] : clues;
        let recommendClueLists = this.state.recommendClueLists;
        let ids = _.map(data.checkedClueList, 'id').join(',');

        //没有可检测的电话时,直接提示
        if(data.isCanNotCheckPhone) {
            let newState = {};
            if(type === EXTRACT_OPERATOR_TYPE.SINGLE) {//单个检测时
                let content = this.renderCheckedStatusTip(type, {clueEmptyPhoneIds: [], phones: clues.telephones}, () => {
                    _.isFunction(callback) && callback(clues, hasAssignedPrivilege);
                });
                newState.extractLimitContent = content;
                newState.singlePopoverVisible = clues.id;
                if (this['changeSales' + clues.id]) {
                    //隐藏批量变更销售面板
                    this['changeSales' + clues.id].handleCancel();
                }
            }else {
                let content = this.renderCheckedStatusTip(type, {}, (extractType) => {
                    if(_.isFunction(callback)) {
                        callback(clues, extractType);
                    }
                });
                newState.extractLimitContent = content;
                newState.batchPopoverVisible = true;
            }
            this.setState(newState);
            return false;
        }

        if(type === EXTRACT_OPERATOR_TYPE.BATCH) {
            this.setState({batchExtractLoading: true});
        }
        checkPhoneStatus({ids}, 'recommend-clue').then((result) => {
            let newState = {};
            let checkPhoneResult = this.getCheckedPhoneStatus(clues, result);
            if(type === EXTRACT_OPERATOR_TYPE.SINGLE) {//单个检测时
                let index = _.findIndex(recommendClueLists, item => item.id === clues.id);
                let phone_status = _.get(checkPhoneResult.list, '[0].phone_status', []);
                if(index > -1) {
                    recommendClueLists[index].phone_status = phone_status;
                }
                let content = this.renderCheckedStatusTip(type, {...checkPhoneResult, phones: clues.telephones}, () => {
                    _.isFunction(callback) && callback(clues, hasAssignedPrivilege);
                });
                newState.recommendClueLists = recommendClueLists;
                newState.extractLimitContent = content;
                newState.singlePopoverVisible = ids;
                if (this['changeSales' + clues.id]) {
                    //隐藏批量变更销售面板
                    this['changeSales' + clues.id].handleCancel();
                }
            }else {//批量检测时
                _.each(recommendClueLists, item => {
                    let ids = _.map(checkPhoneResult.list, 'id');
                    if(_.includes(ids, item.id)) {
                        let curListItem = _.find(checkPhoneResult.list, listItem => listItem.id === item.id);
                        item.phone_status = _.get(curListItem, 'phone_status', []);
                    }
                });
                let content = this.renderCheckedStatusTip(type, {...checkPhoneResult, clues,}, (extractType, canExtractClueList) => {
                    if(_.isFunction(callback)) {
                        let list = clues;
                        if(extractType === BATCH_EXTRACT_TYPE.ONLY) {//智能提取时，需要排除掉那些手机号全部疑似空号的线索以及检测时没有返回检测状态的线索
                            list = canExtractClueList;
                        }
                        callback(list, extractType);
                    }
                });
                newState.recommendClueLists = recommendClueLists;
                newState.extractLimitContent = content;
                newState.batchPopoverVisible = true;
                newState.batchExtractLoading = false;
            }
            this.setState(newState);
        }, () => {
            let newState = {};
            if(type === EXTRACT_OPERATOR_TYPE.SINGLE) {//单个检测时
                let content = this.renderCheckedStatusTip(type, {error: Intl.get('lead.check.phone.fiald', '空号检测失败')}, () => {
                    _.isFunction(callback) && callback(clues, hasAssignedPrivilege);
                });
                newState.extractLimitContent = content;
                newState.singlePopoverVisible = clues.id;
                if (this['changeSales' + clues.id]) {
                    //隐藏批量变更销售面板
                    this['changeSales' + clues.id].handleCancel();
                }
            }else {
                let content = this.renderCheckedStatusTip(type, {error: Intl.get('lead.check.phone.fiald', '空号检测失败')}, (extractType) => {
                    if(_.isFunction(callback)) {
                        callback(clues, extractType);
                    }
                });
                newState.extractLimitContent = content;
                newState.batchPopoverVisible = true;
                newState.batchExtractLoading = false;
            }
            this.setState(newState);
        });
    }
    //获取检测后的手机号状态
    getCheckedPhoneStatus(clues, result) {
        let list = [];
        let clueEmptyPhoneIds = [];//有疑似空号的线索ids
        let clueRealPhoneIds = [];//有实号的线索ids
        let allEmptyPhones = [];//全部疑似空号的线索ids
        let checkEmptyResultClues = [];//返回的检测状态为空[]的线索
        _.each(result, item => {
            if(!_.isEmpty(item.check_result)){
                let obj = {
                    id: item.id,
                    //疑似空号
                    emptyPhones: [],
                    //实号
                    realPhones: [],
                    //停机
                    downTimePhones: [],
                    //其他
                    otherPhones: [],
                    phone_status: []
                };
                let idObj = {id: item.id};
                _.each(item.check_result, checkedItem => {
                    obj.phone_status.push({phone: checkedItem.mobile_phone, status: checkedItem.phone_status});
                    switch(checkedItem.phone_status) {
                        case '0'://疑似空号
                            obj.emptyPhones.push(checkedItem.mobile_phone);
                            break;
                        case '1'://实号
                            obj.realPhones.push(checkedItem.mobile_phone);
                            break;
                        case '2'://停机
                            obj.downTimePhones.push(checkedItem.mobile_phone);
                            break;
                        default://其他(沉默号、风险号等)
                            obj.otherPhones.push(checkedItem.mobile_phone);
                            break;
                    }
                });
                if(_.get(obj.emptyPhones,'length')) {//有疑似空号
                    clueEmptyPhoneIds.push(idObj);

                    let cluesList = clues;
                    if(!_.isArray(clues) && _.isObject(clues)) {
                        cluesList = [clues];
                    }
                    let curClue = _.find(cluesList, item => item.id === obj.id);
                    let phones = _.get(curClue, 'telephones', []);
                    let data = this.getCluePhoneList([curClue]);
                    //全部是疑似空号，逻辑：该线索下都是可检测的手机号，且都是疑似空号
                    if(_.isEqual(data.checkedClueList.length, phones.length) && _.isEqual(obj.emptyPhones.length, phones.length)) {
                        allEmptyPhones.push(item.id);
                    }
                }
                if(_.get(obj.realPhones,'length')) {//有实号
                    clueRealPhoneIds.push(idObj);
                }
                obj.phone_status = _.uniq(obj.phone_status);
                list.push(obj);
            }else {
                checkEmptyResultClues.push(item.id);
            }
        });
        //单个提取时，此线索有#个号码，系统帮您发现了#个疑似空号。
        //批量提取时，系统帮您发现了#条线索全部疑似空号。
        return {
            clueEmptyPhoneIds: _.uniq(clueEmptyPhoneIds),
            allEmptyPhones: _.uniq(allEmptyPhones),
            clueRealPhoneIds: _.uniq(clueRealPhoneIds),
            checkEmptyResultClues: _.uniq(checkEmptyResultClues),
            list
        };
    }
    //渲染检测后的提示信息
    renderCheckedStatusTip(type, result, callback) {
        let btnContent = null;
        let i18n = {};
        let handleCancel = () => {};
        let errorMsg = _.get(result, 'error');

        if(type === EXTRACT_OPERATOR_TYPE.SINGLE) {//单个检测时
            i18n = {
                id: 'lead.check.phone.single.tip',
                name: '此线索有{allCount}个号码，系统帮您发现了{emptyCount}个疑似空号。',
                value: {
                    allCount: <span className="primary-count">{_.get(result, 'phones.length', 0)}</span>,
                    emptyCount: <span className="extract-count">{_.get(result, 'clueEmptyPhoneIds.length', 0)}</span>
                }
            };
            handleCancel = this.handleSingleVisibleChange.bind(this, false);
            let traceTip = errorMsg ? '直接提取' : '确认提取';
            btnContent = (
                <React.Fragment>
                    <Button type="primary" size="small" loading={this.state.singleExtractLoading} onClick={callback} data-tracename={`点击单个检测中的'${traceTip}'按钮`}>{
                        errorMsg ? Intl.get('lead.direct.extraction', '直接提取') : Intl.get('lead.extract.confirm', '确认提取')
                    }</Button>
                </React.Fragment>
            );
        }else {
            let allEmptyPhonesCount = _.get(result,'allEmptyPhones.length', 0);
            let allEmptyPhones = _.get(result,'allEmptyPhones', []);
            i18n = {
                id: 'lead.check.phone.batch.tip',
                name: '系统帮您发现了{emptyCount}条线索全部疑似空号。',
                value: {
                    emptyCount: <span className="extract-count">{allEmptyPhonesCount}</span>
                }
            };
            handleCancel = this.handleBatchVisibleChange.bind(this, false);
            let traceTip = errorMsg ? '直接提取' : '全部提取';
            //已选线索中过滤掉全部疑似空号的线索后，可以提取的线索列表
            let canExtractClueList = _.filter(_.get(result, 'clues'), item => !_.includes(allEmptyPhones, item.id));
            {/*有错误信息，或者可以提取的线索列表为空时，不显示智能提取按钮*/}
            let hiddenSmartExtractBtn = errorMsg || !canExtractClueList.length;
            btnContent = (
                <React.Fragment>
                    {hiddenSmartExtractBtn ? null : (
                        <Button
                            className="check-btn-cancel"
                            size="small"
                            disabled={this.state.batchExtractLoading && this.state.batchExtractType && this.state.batchExtractType !== BATCH_EXTRACT_TYPE.ONLY}
                            loading={this.state.batchExtractLoading && this.state.batchExtractType === BATCH_EXTRACT_TYPE.ONLY}
                            onClick={callback.bind(this, BATCH_EXTRACT_TYPE.ONLY, canExtractClueList)}
                            data-tracename="点击批量检测中的'智能提取'按钮"
                        >{Intl.get('lead.smart.extract.real.phone', '智能提取')}</Button>
                    )}
                    <Button
                        type="primary"
                        size="small"
                        disabled={this.state.batchExtractLoading && this.state.batchExtractType && this.state.batchExtractType !== BATCH_EXTRACT_TYPE.ALL}
                        loading={this.state.batchExtractLoading && this.state.batchExtractType === BATCH_EXTRACT_TYPE.ALL}
                        onClick={callback.bind(this, BATCH_EXTRACT_TYPE.ALL)}
                        data-tracename={`点击批量检测中的'${traceTip}'按钮`}
                    >{ errorMsg ? Intl.get('lead.direct.extraction', '直接提取') : Intl.get('lead.all.extract', '全部提取')}</Button>
                </React.Fragment>
            );
        }

        return (
            <div className={`check-phone-container ${errorMsg ? 'check-phone-error-container' : ''}`} data-tracname="检测空号内容提示区">
                <i className="iconfont icon-close" data-tracename="点击关闭" title={Intl.get('common.app.status.close', '关闭')} onClick={handleCancel}/>
                <div className="check-phone-content">
                    {/*<i className="iconfont icon-search"/>*/}
                    <div className="check-phone-box">
                        <div className="check-phone-title">
                            <span>{Intl.get('lead.check.phone', '空号检测')}</span>
                            {/*<span className="check-phone-only">({Intl.get('lead.check.phone.only.phone', '仅手机号')})</span>*/}
                        </div>
                        <span className="check-phone-text">
                            {errorMsg ? (
                                <span>
                                    <i className="iconfont icon-warn-icon error-icon"/>
                                    {errorMsg}
                                </span>
                            ) : (
                                <ReactIntl.FormattedMessage
                                    id={i18n.id}
                                    defaultMessage={i18n.name}
                                    values={i18n.value}
                                />
                            )}
                        </span>
                    </div>
                </div>
                <div className="check-btn-container">
                    {errorMsg ? null : (
                        <span className="check-phone-free-tip">
                            <i className="iconfont icon-warn-icon"/>
                            {Intl.get('lead.check.phone.explain', '仅支持手机号检测(不支持14、16、17、19号段)')}
                        </span>
                    )}
                    {btnContent}
                </div>
            </div>
        );
    }
    //是否启用空号检测
    hasEnableCheckPhone = () => {
        const websiteConfig = JSON.parse(storageUtil.local.get('websiteConfig')) || {};
        return _.get(websiteConfig, ENABLE_CHECK_PHONE_STATUS, true);
    };
    //启用/停用空号检测
    handleCheckPhoneChange = () => {
        if(this.state.setEnableCheckPhone) {
            return false;
        }
        let isEnableCheckPhone = this.hasEnableCheckPhone();
        this.setState({
            setEnableCheckPhone: false
        });
        setWebsiteConfig({
            [ENABLE_CHECK_PHONE_STATUS]: !isEnableCheckPhone
        }, () => {
            this.setState({
                setEnableCheckPhone: false
            });
        }, (err) => {
            message.error(err);
            this.setState({
                setEnableCheckPhone: false
            });
        });
    }
    //-------------- 检测手机号状态 end -------

    //更新推荐线索列表,需要给已经提取成功的加上一个类名，界面相应的加上对应的不能处理的样式
    updateRecommendClueLists = (updateClueId) => {
        this.updateSelectedClueLists(updateClueId);
        var disabledCheckedClues = this.state.disabledCheckedClues;
        //todo 更新已提取线索量
        let hasExtractCount = this.state.hasExtractCount;
        hasExtractCount++;
        this.setState({
            disabledCheckedClues: _.filter(disabledCheckedClues,item => item.id !== updateClueId),
            hasExtractCount: hasExtractCount,
            //判断是否还能提取
            disableExtract: !this.isExtractedCount(hasExtractCount).ableExtract
        });
        clueCustomerAction.updateRecommendClueLists(updateClueId);
    };
    //更新选中的推荐线索
    updateSelectedClueLists = (updateClueId) => {
        let { selectedRecommendClues, disabledCheckedClues } = this.state;
        let name = '', list = [];
        //在这里需要判断selectedRecommendClues是否存在，不存在就使用disabledCheckedClues
        if(_.get(selectedRecommendClues, 'length')) {
            name = 'selectedRecommendClues';
            list = selectedRecommendClues;
        }else if(_.get(disabledCheckedClues, 'length')) {
            name = 'disabledCheckedClues';
            list = disabledCheckedClues;
        }
        if(name) {
            let newDate = {
                [name]: _.filter(list,item => item.id !== updateClueId)
            };

            this.setState(newDate);
        }
    };
    //标记线索已被其他人提取
    remarkLeadExtractedByOther = (remarkLeadId) => {
        this.updateSelectedClueLists(remarkLeadId);
        clueCustomerAction.remarkLeadExtractedByOther(remarkLeadId);
    };

    //处理被别人提取过的线索
    handleLeadHasExtractedByOther = (hasExtractedLeadIds) => {
        if(_.isArray(hasExtractedLeadIds)){
            _.each(hasExtractedLeadIds, remarkId => {
                this.remarkLeadExtractedByOther(remarkId);
            });
        }
    };

    // 获取待分配人员列表
    getSalesDataList = () => {
        let clueSalesIdList = getClueSalesList(CLUE_RECOMMEND_SELECTED_SALES);
        //销售领导、域管理员,展示其所有（子）团队的成员列表
        let dataList = _.map(formatSalesmanList(this.state.salesManList), salesman => {
            let clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(salesman,'value'));
            return {
                ...salesman,
                clickCount
            };
        });
        return dataList;
    };

    //获取最多提取线索的数量以及已经提取多少线索
    getRecommendClueCount(callback){
        if(!_.isEqual(callback, 'didMount')) {
            this.setState({canClickExtract: false});
        }
        getMaxLimitExtractClueCount().then((data) => {
            let disableExtract = !(data.maxCount - data.hasExtractedCount);
            this.setState({
                hasExtractCount: data.hasExtractedCount,
                maxLimitExtractNumber: data.maxCount,
                disableExtract
            });
            _.isFunction(callback) && callback(data.hasExtractedCount, disableExtract);
        }, (error) => {
            _.isFunction(callback) && callback('error');
        });
    }

    // 判断是否为普通销售
    isCommonSales = () => {
        return userData.getUserData().isCommonSales;
    };
    //判断是否为管理员
    isManager = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN); // 返回true，说明是管理员，否则是销售或运营
    };
    // 是否是管理员或者运营人员
    isManagerOrOperation = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    };
    clearSelectSales = () => {
        if(this.isClearSelectSales) {
            this.setState({
                salesMan: '',
                salesManNames: '',
            });
        }
    };
    //设置已选销售的名字
    setSelectContent = (salesManNames) => {
        this.setState({salesManNames, unSelectDataTip: ''});
    };
    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        this.setState({salesMan,unSelectDataTip: ''});
    };

    renderSalesBlock = () => {
        let dataList = this.getSalesDataList();
        //按点击的次数进行排序
        dataList = _.sortBy(dataList,(item) => {return -item.clickCount;});
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={this.state.salesMan}
                    onChange={this.onSalesmanChange}
                    getSelectContent={this.setSelectContent}
                    notFoundContent={dataList.length ? Intl.get('crm.29', '暂无销售') : Intl.get('crm.30', '无相关销售')}
                    dataList={dataList}
                />
            </div>
        );
    };

    getTimeRangeText = () => {
        return checkCurrentVersionType().trial ? Intl.get('user.time.today', '今天') : Intl.get('common.this.month', '本月');
    };

    getSelectedClues = () => {
        return _.isEmpty(this.state.selectedRecommendClues) ? this.state.disabledCheckedClues : this.state.selectedRecommendClues;//选中的线索
    };

    // 可提取数为0时，或者选中的个数等于可提取数时
    isExtractedCount(hasExtractCount) {
        let selectedRecommendClues = this.getSelectedClues();
        let selectedClueLength = _.get(selectedRecommendClues, 'length',0);
        let maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        hasExtractCount = hasExtractCount || this.state.hasExtractCount;
        //可提取数
        let ableExtract = maxLimitExtractNumber > hasExtractCount ? maxLimitExtractNumber - hasExtractCount : 0;
        //选中的个数等于可提取数时
        let isExtractedEqual = _.isEqual(selectedClueLength, ableExtract);

        return {
            ableExtract,
            isExtractedEqual
        };
    }

    //还可提取线索的数量展示
    hasNoExtractCountTip = () => {
        let content;
        let selectedClues = this.getSelectedClues();
        if(selectedClues.length) {
            content = (
                <ReactIntl.FormattedMessage
                    id="clue.recommend.selected.tip"
                    defaultMessage={'已选{count}条'}
                    values={{
                        count: <span className="has-extracted-count">{selectedClues.length}</span>
                    }}
                />
            );
        }else if(isExpired()) {//过期账号就不用显示还可提取数
            content = null;
        }else {
            let maxLimitExtractNumber = this.state.maxLimitExtractNumber;
            let ableExtract = maxLimitExtractNumber > this.state.hasExtractCount ? maxLimitExtractNumber - this.state.hasExtractCount : 0;

            const i18Obj = {
                hasExtract: <span className="has-extracted-count">{this.state.hasExtractCount}</span>,
                ableExtract: <span className="has-extracted-count">{ableExtract}</span>, timerange: this.getTimeRangeText()
            };
            content = (
                <ReactIntl.FormattedMessage
                    id="clue.recommend.default.tip"
                    defaultMessage={'{timerange}还可提取{ableExtract}条线索'}
                    values={i18Obj}
                />
            );
        }
        return (
            <span className="tip-wrapper">{content}</span>
        );
    };

    //超限时的事件处理
    handleExtractLimit = (disableExtract) => {
        var maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        var ableExtract = maxLimitExtractNumber > this.state.hasExtractCount ? maxLimitExtractNumber - this.state.hasExtractCount : 0;
        let versionAndType = checkVersionAndType();
        const i18Obj = {hasExtract: <span className="extract-count">{this.state.hasExtractCount}</span>, ableExtract: <span className="extract-count">{ableExtract}</span>, timerange: this.getTimeRangeText()};
        let maxLimitTip = null;

        /***
         * 超限下的处理
         * 个人试用：直接滑出付费界面
         * 个人正式、企业正式管理员：直接滑出增加线索量界面
         * 企业试用、企业正式销售，展示notification弹框
         *
         * 选中个数超过可提取数时
         * 个人版和企业正式管理员：直接弹出付费或者购买线索量界面
         * 企业试用和企业正式销售，展示notification弹框
         */
        if(versionAndType.isPersonalTrial) {//个人试用
            Trace.traceEvent(ReactDOM.findDOMNode(this), '超限后再提取线索自动打开个人升级界面');
            this.handleUpgradePersonalVersion(Intl.get('payment.upgrade.extract.clue.limit', '提取线索超过{count}条', {count: maxLimitExtractNumber}));
        }else if(versionAndType.isPersonalFormal//个人正式版
            || versionAndType.isCompanyFormal && this.isManager()) { //或企业正式版管理员
            Trace.traceEvent(ReactDOM.findDOMNode(this), '超限后再提取线索自动打开增加线索量界面');
            this.handleClickAddClues(Intl.get('payment.upgrade.extract.clue.limit', '提取线索超过{count}条', {count: maxLimitExtractNumber}));
        }else if(disableExtract && versionAndType.isCompanyTrial) {//超限时，企业试用
            maxLimitTip = <ReactIntl.FormattedMessage
                id="clue.recommend.company.trial.extract.num.limit.tip"
                defaultMessage={'还可提取{count}条，如需继续提取,请联系我们的销售人员进行升级，联系方式：{contact}'}
                values={{
                    count: <span className="extract-count">{ableExtract}</span>,
                    contact: COMPANY_PHONE
                }}
            />;
        } else if(disableExtract && versionAndType.isCompanyFormal && !this.isManagerOrOperation()) {//超限时，企业正式版销售（除了管理员和运营人员）
            maxLimitTip = <ReactIntl.FormattedMessage
                id="clue.recommend.company.formal.sales.extract.num.limit.tip"
                defaultMessage={'本月{count}条已提取完毕，如需继续提取请联系管理员'}
                values={{
                    count: <span className="extract-count">{maxLimitExtractNumber}</span>
                }}
            />;
        }else {//选中个数超过可提取数时
            maxLimitTip = <ReactIntl.FormattedMessage
                id="clue.recommend.has.extract.count"
                defaultMessage="{timerange}已经提取了{hasExtract}条，最多还能提取{ableExtract}条线索"
                values={i18Obj}
            />;
        }

        if(maxLimitTip) {
            return (
                <div>
                    <i className="iconfont icon-warn-icon"/>
                    {maxLimitTip}
                    <i
                        className="iconfont icon-close"
                        title={Intl.get('common.app.status.close','关闭')}
                        onClick={this.handleVisibleChange.bind(this, false)}
                    />
                </div>
            );
        }
    };

    //点击后，隐藏掉所有的popover
    handleVisibleChange = () => {
        this.setState({
            batchPopoverVisible: '',
            singlePopoverVisible: '',
            extractLimitContent: null,
            showSingleExtractTip: '',
            showBatchExtractTip: false,
            batchExtractType: '',
        });
    };

    handleSuccessTip() {
        // 更新引导流程
        this.upDateGuideMark();
        this.props.afterSuccess();
        this.setState({
            extractedResult: 'success'
        });
    }

    //------ 升级正式版或者购买线索量的处理start ------//
    //个人试用升级为正式版
    handleUpgradePersonalVersion = (tipTitle = '') => {
        let currentVersionObj = checkVersionAndType();
        //个人试用版本过期
        if (currentVersionObj.isPersonalTrial && isExpired()) {
            // 展示升级个人正式版的界面
            Trace.traceEvent(event, '个人试用到期后点击提取线索，打开个人升级界面');
            tipTitle = Intl.get('payment.upgrade.extract.lead', '升级后可提取线索');
        } else if (currentVersionObj.isPersonalFormal && isExpired()) {//个人正式版过期时，展示续费界面
            Trace.traceEvent(event, '个人正式过期后点击提取线索，打开个人续费界面');
            tipTitle = Intl.get('payment.renewal.extract.lead', '续费后可提取线索');
        }
        paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, {
            showDifferentVersion: this.triggerShowVersionInfo,
            leftTitle: tipTitle
        });
    };
    //升级正式后的回调事件
    handleUpdatePersonalVersion = (result) => {
        //需要更新最大线索量
        let lead_limit = _.get(result, 'version.lead_limit', '');
        let clue_number = _.get(lead_limit.split('_'),'[0]',0);
        this.setState({
            maxLimitExtractNumber: +clue_number,
            getMaxLimitExtractNumberError: false,
            hasNoExtractCountTip: false,
            disabledCheckedClues: [],
            disableExtract: false
        });
    };
    //显示/隐藏版本信息面板
    triggerShowVersionInfo = (isShowModal = true) => {
        paymentEmitter.emit(paymentEmitter.OPEN_APPLY_TRY_PANEL, {isShowModal, versionKind: COMPANY_VERSION_KIND});
    };
    //增加线索量
    handleClickAddClues = (tipTitle = '') => {
        paymentEmitter.emit(paymentEmitter.OPEN_ADD_CLUES_PANEL, { leftTitle: tipTitle });
    };
    //购买线索量成功后的回调事件
    handleUpdateClues = (result) => {
        let count = _.get(result, 'count', 0);
        let maxLimitExtractNumber = this.state.maxLimitExtractNumber;
        this.setState({
            maxLimitExtractNumber: count + maxLimitExtractNumber,
            getMaxLimitExtractNumberError: false,
            hasNoExtractCountTip: false,
            disabledCheckedClues: [],
            disableExtract: false
        });
    };
    //------ 升级正式版或者购买线索量的处理end ------//

    //------ 批量提取处理start ------//
    //批量提取发送请求
    handleBatchAssignClues = (submitObj) => {
        if(this.state.batchExtractLoading) return;
        this.setState({
            batchExtractLoading: true,
            unSelectDataTip: '',
            saveErrorMsg: '',
            canClickExtract: false
        });
        $.ajax({
            url: '/rest/clue/batch/recommend/list',
            type: 'post',
            dateType: 'json',
            data: submitObj,
            success: (data) => {
                let disabledCheckedClues = _.get(this.state,'disabledCheckedClues', []);
                this.setState({
                    batchExtractLoading: false,
                    canClickExtract: true,
                    selectedRecommendClues: disabledCheckedClues,
                    disabledCheckedClues: [],
                });
                var taskId = _.get(data, 'batch_label','');
                if (taskId){
                    this.handleSuccessTip();
                    //向任务列表id中添加taskId
                    batchOperate.addTaskIdToList(taskId);
                    //存储批量操作参数，后续更新时使用
                    var batchParams = _.cloneDeep(submitObj);
                    batchOperate.saveTaskParamByTaskId(taskId, batchParams, {
                        showPop: true,
                        urlPath: '/leads'
                    });
                    //总的被选中的线索数量
                    var totalSelectedSize = _.get(disabledCheckedClues,'length',0);
                    //已经被提取的线索
                    var hasExtractedLeadIds = _.get(data,'picked',[]);
                    var hasExtractedLeadCount = hasExtractedLeadIds.length;
                    if(totalSelectedSize >= hasExtractedLeadCount){
                        //去掉被提取的线索数量，因为这些不会有推送
                        totalSelectedSize -= hasExtractedLeadCount;
                    }
                    //在这些数据上加一个特殊的标识
                    if(hasExtractedLeadCount){
                        this.handleLeadHasExtractedByOther(hasExtractedLeadIds);
                    }
                    //立即在界面上显示推送通知
                    //界面上立即显示一个初始化推送
                    //批量操作参数
                    batchOperate.batchOperateListener({
                        taskId: taskId,
                        total: totalSelectedSize,
                        running: totalSelectedSize,
                        typeText: Intl.get('clue.extract.clue', '提取线索')
                    });
                    this.clearSelectSales();
                    this.handleBatchVisibleChange();
                    let batchSelectedSales = this.state.batchSelectedSales;
                    SetLocalSalesClickCount(batchSelectedSales, CLUE_RECOMMEND_SELECTED_SALES);
                }
            },
            error: (errorInfo) => {
                var errTip = errorInfo.responseJSON || Intl.get('clue.extract.failed', '提取失败');
                this.setState({
                    canClickExtract: true,
                    batchExtractLoading: false,
                    disabledCheckedClues: [],
                    selectedRecommendClues: _.get(this.state,'disabledCheckedClues', [])
                    // saveErrorMsg: errTip,
                    // unSelectDataTip: errTip
                });
                //如果提取失败的原因是因为被提取过，将该推荐线索设置不可点击并且前面加提示
                if(_.includes(HASEXTRACTBYOTHERERRTIP, errTip)){
                    this.handleLeadHasExtractedByOther(submitObj.companyIds);
                    if (this['changeSales']) {
                        //隐藏批量变更销售面板
                        this['changeSales'].handleCancel();
                    }
                }
                message.error(errTip);
            }
        });
    };
    // 批量提取，发请求前的参数处理
    handleBeforeSubmitChangeSales = (itemId) => {
        this.isClearSelectSales = true;
        let list_id = this.state.recommendClueListId;
        if(isCommonSalesOrPersonnalVersion()) {// 普通销售或者个人版
            let saleLoginData = userData.getUserData();
            let submitObj = {
                'user_id': saleLoginData.user_id,
                'user_name': saleLoginData.nick_name,
                'sales_team_id': saleLoginData.team_id,
                'sales_team': saleLoginData.team_name,
            };
            if(list_id) {
                submitObj.list_id = list_id;
            }
            if(_.isArray(itemId)) {
                submitObj.companyIds = itemId;
            }
            return submitObj;
        }else {// 管理员，运营人员或销售领导
            if(!this.state.salesMan) {
                this.setState({unSelectDataTip: Intl.get('crm.17', '请选择销售人员')});
            }else {
                let user_id = '', sales_team_id = '', user_name = '', sales_team = '';
                // 销售id和所属团队的id，中间是用&&连接的 格式为销售id&&所属团队id
                let idArray = this.state.salesMan.split('&&');
                if(_.isArray(idArray) && idArray.length) {
                    user_id = idArray[0];//销售id
                    sales_team_id = idArray[1] || '';//所属团队id
                }
                // 销售的名字和团队的名字 格式是 销售名称-团队名称
                let nameArray = this.state.salesManNames.split('-');
                if(_.isArray(nameArray) && nameArray.length) {
                    user_name = nameArray[0];//销售的名字
                    sales_team = _.trim(nameArray[1]) || '';//团队的名字
                }
                let submitObj = {user_id, user_name, sales_team_id, sales_team};
                if(list_id) {
                    submitObj.list_id = list_id;
                }
                if (itemId){
                    submitObj.companyIds = itemId;
                }
                return submitObj;
            }
        }
    };
    batchAssignRecommendClues = (submitObj) => {
        this.setState({
            hasNoExtractCountTip: false,
            batchSelectedSales: _.cloneDeep(this.state.salesMan) //在从AntcDropDown选择完销售人员时，salesMan会被清空，这里需要克隆储存
        });
        this.handleBatchAssignClues(submitObj);
    };
    //点击批量提取按钮
    handleSubmitAssignSalesBatch = (clues, extractType) => {
        if(!this.state.canClickExtract) return;
        let selectedIds = _.map(this.state.selectedRecommendClues,'id');
        let batchExtractType = '';
        if(_.isArray(clues) && _.get(clues, '[0]')) {
            selectedIds = _.map(clues,'id');
            batchExtractType = extractType;
        }
        if(_.isEmpty(selectedIds)) {return;}
        //如果是选了修改全部
        let submitObj = this.handleBeforeSubmitChangeSales(selectedIds);
        if (_.isEmpty(submitObj)){
            return;
        }else{
            //批量提取之前要验证一下可以再提取多少条的数量，如果提取的总量比今日上限多，就提示还能再提取几条
            //如果获取提取总量失败了,就不校验数字了
            //点击批量提取后把select的check选中状态都取消，并且加上disabled的样式
            this.setState({
                disabledCheckedClues: this.state.selectedRecommendClues,
                batchExtractType
            });
            if(this.state.getMaxLimitExtractNumberError){
                this.batchAssignRecommendClues(submitObj);
            }else{
                this.getRecommendClueCount((count, disableExtract) => {
                    let currentVersionType = checkCurrentVersionType();
                    if (
                        //获取已经提取的线索失败了就不校验了 获取失败count返回的是字符串‘error’
                        _.isNumber(count) &&
                        //是试用账号或者正式账号
                        (currentVersionType.trial || currentVersionType.formal) &&
                        //已经提取的数量和这次要提取数量之和大于最大限制的提取数
                        count + _.get(this, 'state.disabledCheckedClues.length') > this.state.maxLimitExtractNumber
                    ){
                        let maxLimitTip = this.handleExtractLimit(disableExtract);
                        let newState = {
                            hasNoExtractCountTip: true,
                            canClickExtract: true,
                            disabledCheckedClues: [],
                            selectedRecommendClues: this.state.disabledCheckedClues,
                            showBatchExtractTip: true,
                        };
                        if(maxLimitTip) {//显示超限提示
                            newState.batchPopoverVisible = true;
                            newState.extractLimitContent = maxLimitTip;
                        }
                        this.setState(newState);

                        if (this['changeSales']) {
                            //隐藏批量变更销售面板
                            this['changeSales'].handleCancel();
                        }
                    }else{
                        this.batchAssignRecommendClues(submitObj);
                    }
                });
            }
        }
    };
    //渲染批量提取的按钮
    renderExtractOperator = (isWebMin) => {
        const hasSelectedClue = _.get(this, 'state.selectedRecommendClues.length') || _.get(this, 'state.disabledCheckedClues.length');
        let isDisabled = !hasSelectedClue;
        if(isDisabled) {
            return null;
        }
        // 过期的账号不能提取线索
        if(isExpired()) {
            let currentVersionObj = checkVersionAndType();
            // 企业账号到期，提示联系销售升级\续费的popover
            if(currentVersionObj.company){
                return (
                    <Popover content={getContactSalesPopoverTip()} placement="bottom" trigger="click">
                        {this.renderBatchExtractBtn(() => {}, isWebMin)}
                    </Popover>
                );
            }else {//个人版，展示升级\续费的界面
                // 渲染批量提取按钮
                return this.renderBatchExtractBtn(this.handleUpgradePersonalVersion, isWebMin);
            }
        }else {//渲染可提取线索的按钮
            let hasAssignedPrivilege = !isCommonSalesOrPersonnalVersion();
            let isShowCheckPhoneStatus = this.hasEnableCheckPhone() && !this.state.disableExtract && !this.state.showBatchExtractTip;
            let handleFnc = this.handleSubmitAssignSalesBatch;
            if(isShowCheckPhoneStatus) {
                handleFnc = this.checkPhoneStatus.bind(this, [], EXTRACT_OPERATOR_TYPE.BATCH, this.handleSubmitAssignSalesBatch, hasAssignedPrivilege);
            }
            if(hasAssignedPrivilege) {
                isDisabled = !hasSelectedClue || this.state.batchExtractLoading;
                let btnCls = classNames('button-save btn-item', {
                    'btn-disabled': isDisabled
                });
                const batchExtractBtn = (
                    <Popover
                        placement="bottomLeft"
                        trigger="click"
                        content={this.state.extractLimitContent}
                        visible={this.state.batchPopoverVisible}
                        onVisibleChange={this.handleBatchVisibleChange}
                        overlayClassName="extract-limit-content"
                    >
                        <Button
                            type={isDisabled ? 'ghost' : 'primary'}
                            className={btnCls}
                            disabled={isDisabled}
                        >
                            <span className="iconfont icon-extract"/>
                            {isWebMin ? null : Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                        </Button>
                    </Popover>
                );
                if(isDisabled) {
                    return batchExtractBtn;
                }
                return (
                    <AntcDropdown
                        datatraceContainer='批量提取线索'
                        ref={ref => this['changeSales'] = ref}
                        content={batchExtractBtn}
                        overlayTitle={Intl.get('user.salesman', '销售人员')}
                        okTitle={Intl.get('common.confirm', '确认')}
                        cancelTitle={Intl.get('common.cancel', '取消')}
                        isSaving={this.state.batchExtractLoading}
                        isDisabled={!hasSelectedClue}
                        overlayContent={this.renderSalesBlock()}
                        handleSubmit={handleFnc}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectData={this.clearSelectSales}
                        placement="topRight"
                        btnAtTop={false}
                    />
                );
            }else {
                return (
                    <Popover
                        placement="bottomLeft"
                        trigger="click"
                        content={this.state.extractLimitContent}
                        visible={this.state.batchPopoverVisible}
                        onVisibleChange={this.handleBatchVisibleChange}
                        overlayClassName="extract-limit-content"
                    >
                        {this.renderBatchExtractBtn(handleFnc, isWebMin)}
                    </Popover>
                );
            }
        }
    };
    // 渲染批量提取按钮
    renderBatchExtractBtn(clickFunc, isWebMin){
        const hasSelectedClue = _.get(this, 'state.selectedRecommendClues.length') || _.get(this, 'state.disabledCheckedClues.length');
        let isDisabled = !hasSelectedClue || this.state.batchExtractLoading;
        let btnCls = classNames('btn-item common-sale-batch-extract', {
            'btn-disabled': isDisabled
        });
        return (
            <Button
                title={Intl.get('clue.pool.batch.extract.clue', '批量提取')}
                type={isDisabled ? 'ghost' : 'primary'}
                data-tracename="点击批量提取线索按钮"
                className={btnCls}
                onClick={clickFunc}
                disabled={isDisabled}
                loading={this.state.batchExtractLoading}
            >
                <span className="iconfont icon-extract"/>
                {isWebMin ? null : Intl.get('clue.pool.batch.extract.clue', '批量提取')}
            </Button>
        );
    }
    handleBatchVisibleChange = (visible) => {
        if(!visible && !this.state.batchExtractLoading) {
            this.setState({batchPopoverVisible: '', extractLimitContent: null, showBatchExtractTip: false, batchExtractType: ''});
        }
    };
    //------ 批量提取处理end ------//

    //------ 单个提取start ------//
    handleExtractRecommendClues = (reqData) => {
        //在从AntcDropDown选择完销售人员时，salesMan会被清空，这里需要克隆储存
        let salesMan = _.cloneDeep(this.state.salesMan);
        var leadId = _.get(reqData,'companyIds[0]');
        $.ajax({
            url: '/rest/clue/extract/recommend/clue',
            dataType: 'json',
            type: 'post',
            data: reqData,
            success: (data) => {
                this.setState({
                    singleExtractLoading: '',
                    canClickExtract: true
                });
                if (data){
                    if (this['changeSales' + leadId]) {
                        //隐藏批量变更销售面板
                        this['changeSales' + leadId].handleCancel();
                    }
                    this.handleSuccessTip();
                    // 如果提取的是自己，则需要提示刷新
                    if(_.isEqual(_.get(reqData, 'user_id'), userData.getUserData().user_id)) {
                        //提取成功nav-sidebar线索管理展示加1效果
                        leadRecommendEmitter.emit(leadRecommendEmitter.ADD_LEAD_MANAGEMENT_ONE_NUM);
                    }
                    this.clearSelectSales();
                    this.handleSingleVisibleChange();
                    SetLocalSalesClickCount(salesMan, CLUE_RECOMMEND_SELECTED_SALES);
                    this.updateRecommendClueLists(leadId);
                    //线索提取完后，会到待分配状态中
                }else{
                    message.error(Intl.get('clue.extract.failed', '提取失败'));
                }
            },
            error: (errorInfo) => {
                this.setState({
                    singleExtractLoading: '',
                    canClickExtract: true
                });
                var errTip = errorInfo.responseJSON || Intl.get('clue.extract.failed', '提取失败');
                //如果提取失败的原因是因为被提取过，将该推荐线索设置不可点击并且前面加提示
                if(_.includes(HASEXTRACTBYOTHERERRTIP, errTip)){
                    this.handleLeadHasExtractedByOther(reqData.companyIds);
                    if (this['changeSales' + leadId]) {
                        //隐藏批量变更销售面板
                        this['changeSales' + leadId].handleCancel();
                    }
                }
                message.error(errTip);
            }
        });
    };
    extractRecommendCluesSingele = (record) => {
        this.setState({
            hasNoExtractCountTip: false
        });
        let submitObj = this.handleBeforeSubmitChangeSales([record.id]);
        this.handleExtractRecommendClues(submitObj);
    };
    //单个提取线索
    handleExtractClueAssignToSale = (record, flag) => {
        //如果这条线索已经提取过了或正在提取，就不能再点击提取了
        if(record.hasExtracted || record.hasExtractedByOther || this.state.singleExtractLoading || !this.state.canClickExtract){
            return;
        }
        if (!this.state.salesMan && flag) {
            clueCustomerAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
        } else {
            this.setState({
                singleExtractLoading: record.id
            });
            //提取线索前，先发请求获取还能提取的线索数量
            //如果获取能提取的总量出错了就不用发请求了获取已经提取的线索量，直接提取就可以，后端有校验
            if(this.state.getMaxLimitExtractNumberError){
                this.extractRecommendCluesSingele(record);
            }else{
                this.getRecommendClueCount((count, disableExtract) => {
                    let currentVersionType = checkCurrentVersionType();
                    //如果获取出错了就不要校验数字了
                    if (_.isNumber(count) &&
                        //是试用账号或者正式账号
                        (currentVersionType.trial || currentVersionType.formal) &&
                        count >= this.state.maxLimitExtractNumber
                    ){
                        let maxLimitTip = this.handleExtractLimit(disableExtract);
                        let newState = {
                            hasNoExtractCountTip: true,
                            singleExtractLoading: '',
                            canClickExtract: true,
                            showSingleExtractTip: record.id,
                        };
                        if(maxLimitTip) {//显示超限提示
                            newState.singlePopoverVisible = record.id;
                            newState.extractLimitContent = maxLimitTip;
                        }
                        this.setState(newState);

                        if (this['changeSales' + record.id]) {
                            //隐藏批量变更销售面板
                            this['changeSales' + record.id].handleCancel();
                        }
                    }else{
                        this.extractRecommendCluesSingele(record);
                    }
                });
            }
        }
    };
    //渲染单项中的提取按钮
    extractClueOperator = (record) => {
        let {isWebMin} = isResponsiveDisplay();
        // 过期的账号不能提取线索
        if(isExpired()){
            let currentVersionObj = checkVersionAndType();
            // 企业账号到期，提示联系销售升级\续费的popover
            if(currentVersionObj.company){
                return (
                    <Popover content={getContactSalesPopoverTip()} placement="bottomLeft" trigger="click">
                        {this.renderSingleExtractBtn(() => {})}
                    </Popover>
                );
            } else {//个人版，展示升级\续费的界面
                return this.renderSingleExtractBtn(this.handleUpgradePersonalVersion);
            }
        } else {//渲染可提取线索的按钮
            // 提取线索分配给相关的销售人员的权限
            let hasAssignedPrivilege = !isCommonSalesOrPersonnalVersion();
            let checkRecord = this.state.singlePopoverVisible === record.id;
            let isShowCheckPhoneStatus = this.hasEnableCheckPhone() && !this.state.disableExtract && !_.isEqual(this.state.showSingleExtractTip, record.id);
            let placement = isShowCheckPhoneStatus ? 'topRight' : 'bottomRight';
            let handleFnc = this.handleExtractClueAssignToSale.bind(this, record, hasAssignedPrivilege);
            if(isShowCheckPhoneStatus) {
                handleFnc = this.checkPhoneStatus.bind(this, [record], EXTRACT_OPERATOR_TYPE.SINGLE, this.handleExtractClueAssignToSale, hasAssignedPrivilege);
            }
            if (hasAssignedPrivilege) {
                return (
                    <AntcDropdown
                        isDropdownAble={record.hasExtracted}
                        datatraceContainer='线索推荐页面单个提取'
                        ref={assignSale => this['changeSales' + record.id] = assignSale}
                        content={
                            <Popover
                                placement={placement}
                                trigger="click"
                                content={this.state.extractLimitContent}
                                visible={checkRecord}
                                onVisibleChange={this.handleSingleVisibleChange}
                                overlayClassName="extract-limit-content"
                            >
                                <Button
                                    type="primary"
                                    data-tracename="点击提取按钮"
                                    className="assign-btn btn-item"
                                >
                                    {extractIcon}
                                    {isWebMin ? null : Intl.get('clue.extract', '提取')}
                                </Button>
                            </Popover>
                        }
                        overlayTitle={Intl.get('user.salesman', '销售人员')}
                        okTitle={Intl.get('common.confirm', '确认')}
                        cancelTitle={Intl.get('common.cancel', '取消')}
                        isSaving={this.state.singleExtractLoading}
                        overlayContent={this.renderSalesBlock()}
                        handleSubmit={handleFnc}
                        unSelectDataTip={this.state.unSelectDataTip}
                        clearSelectData={this.clearSelectSales}
                        btnAtTop={false}
                    />
                );
            } else {
                return (
                    <Popover
                        placement={placement}
                        trigger="click"
                        content={this.state.extractLimitContent}
                        visible={checkRecord}
                        onVisibleChange={this.handleSingleVisibleChange}
                        overlayClassName="extract-limit-content"
                    >
                        {this.renderSingleExtractBtn(handleFnc, record)}
                    </Popover>
                );
            }
        }
    };
    renderSingleExtractBtn(clickFunc, record) {
        let {isWebMin} = isResponsiveDisplay();
        return (
            <Button
                onClick={clickFunc}
                data-tracename='点击单个提取推荐线索按钮'
                type="primary"
                className="assign-btn btn-item"
                loading={this.state.singleExtractLoading === record.id}
            >
                {extractIcon}
                {isWebMin ? null : Intl.get('clue.extract', '提取')}
            </Button>
        );
    }
    handleSingleVisibleChange = (visible) => {
        if(!visible && !this.state.singleExtractLoading) {
            this.setState({singlePopoverVisible: '', extractLimitContent: null, showSingleExtractTip: ''});
        }
    };
    //------ 单个提取end ------//

    //------ checkbox事件start ------//
    //点击checkbox
    handleCheckChange = (item, e) => {
        let checked = e.target.checked;
        let selectedRecommendClues = this.state.selectedRecommendClues;
        if(checked) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.extract-clue-item .ant-checkbox-wrapper'), '点击选中某个线索');
            selectedRecommendClues.push(item);
        }else {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.extract-clue-item .ant-checkbox-wrapper'), '点击取消选中某个线索');
            selectedRecommendClues = _.filter(selectedRecommendClues, recommend => {
                return recommend.id !== item.id;
            });
        }
        this.setState({
            selectedRecommendClues: _.uniqBy(selectedRecommendClues, 'id'),
            hasNoExtractCountTip: false
        });
    };
    // 全选/反选
    handleCheckAllChange = (e) => {
        let canExtractClues = [];
        let isCheckAll = this.isCheckAll();
        if(!isCheckAll) {
            canExtractClues = _.filter(this.state.recommendClueLists, item => {
                return !this.getDisabledClue(item);
            });
        }
        this.setState({selectedRecommendClues: canExtractClues, hasNoExtractCountTip: false});
        Trace.traceEvent(e, '点击选中/取消选中全部线索');
    };
    //是否全选
    isCheckAll = () => {
        let canExtractClues = _.filter(this.state.recommendClueLists, item => {
            return !this.getDisabledClue(item);
        });
        return canExtractClues.length > 0 && canExtractClues.length === this.state.selectedRecommendClues.length;
    };
    //是否选中
    hasChecked = (record) => {
        return _.find(this.getSelectedClues(), item => item.id === record.id);
    };
    //该线索前的checkbox不可用
    getDisabledClue = (record) => {
        // 有hasExtracted属性是已经成功提取了的,有hasExtractedByOther属性是已经被别人提取了的
        return record.hasExtracted || _.find(this.state.disabledCheckedClues,item => item.id === record.id) || record.hasExtractedByOther;
    };
    //点击线索名，选中checkbox
    handleClickClueName = (item, event) => {
        let target = _.get(event,'target');
        //如果是电话和提取按钮点击冒泡上来的，不触发选中checkbox
        let hasOtherClick = _.filter(['icon-extract', CONTACT_PHONE_CLS, 'ant-checkbox-input', 'ant-btn'], item => _.get(target,'className', '').indexOf(item) > -1);

        if( //如果被禁用了，点击后无效
            this.getDisabledClue(item)
            || hasOtherClick.length) {
            return false;
        }

        let isSelected = _.find(this.state.selectedRecommendClues, clueItem => clueItem.id === item.id);
        this.handleCheckChange(item,{target: {checked: !isSelected}});
    };
    //是否禁用全选按钮
    disabledCheckAll = () => {
        //列表为空，或者请求数据，或者提取线索中（单个和批量）
        return !this.state.recommendClueLists.length || this.state.isLoadingRecommendClue || this.state.singleExtractLoading || this.state.batchExtractLoading;
    };
    //------ checkbox事件end ------//

    handleLinkLeads = () => {
        history.push('/leads', {
            showWillTraceTab: true,//打开待跟进tab栏
        });
    };

    //设置该条线索不能提取的样式
    setInvalidClassName = (record) => {
        var cls = '';
        if(record.hasExtracted){
            cls += ' has-extracted-row';
        }
        if(record.hasExtractedByOther){
            cls += ' has-extracted-by-other-row';
        }
        return cls;
    };

    //更新首页引导流程
    upDateGuideMark = () => {
        updateGuideMark(BOOT_PROCESS_KEYS.EXTRACT_CLUE);
    };

    //处理高亮文字
    handleHighLightStyle(text) {
        //百捷集团武汉<em>百度</em>分公司
        return {
            content: _.replace(text, /<em>/g, '<em class="text-highlight">'),
            hasHighLight: text && text.indexOf('<em>') > -1,
            hasContent: text.length > 0
        };
    }

    //处理标签根据热门中的feature字段进行高亮处理
    handleTagHighLightText(text) {
        let {key, value} = this.getAdvanceItem();
        if(key === 'feature' && value !== EXTRACT_CLUE_CONST_MAP.LAST_HALF_YEAR_REGISTER) {
            let feature = _.find(ADVANCED_OPTIONS, item => item.value === this.state.feature);
            let char = new RegExp(feature.name, 'g');
            text = text.replace(char, `<em class="text-highlight">${feature.name}</em>`);
        }
        return text;
    }

    //处理点击展开全部条件时
    handleToggleOtherCondition = () => {
        this.setState({});
    };

    //去掉成功提示信息
    hideExtractedTooltip = () => {
        this.setState({extractedResult: ''});
    };

    //手机号状态为其他时，后面添加tip
    handlePhoneOtherStatusTip(phoneNumber) {
        if(phoneNumber.indexOf(Intl.get( 'common.others', '其他')) > -1) {
            return (
                <Popover
                    placement="right"
                    content={Intl.get('lead.check.phone.status.other.tip', '标示号码是危险号码、不存在或沉默号。')}
                >
                    <Icon type="question-circle-o" className="handle-btn-item"/>
                </Popover>
            );
        }
        return null;
    }

    renderBtnClock = (isWebMin) => {
        let moreRotationClass = classNames('iconfont icon-change-new', {
            'change-new-icon-rotation': !this.state.canClickMoreBatch
        });
        return (
            <React.Fragment>
                <Button
                    className="btn-item more-batch-btn"
                    data-tracename="点击换一批按钮"
                    title={Intl.get('clue.customer.refresh.list', '换一批')}
                    onClick={this.getRecommendClueLists.bind(this, null, EXTRACT_CLUE_CONST_MAP.ANOTHER_BATCH)}
                >
                    <span className={moreRotationClass}/>
                    <span>{isWebMin ? null : Intl.get('clue.customer.refresh.list', '换一批')}</span>
                </Button>
                {/*空号检测*/}
                <Popover
                    placement="top"
                    content={(
                        <div className="check-phone-use-container">
                            <div className="img-wrapper">
                                <img className="image" src="/static/images/curtao-personal.svg"/>
                            </div>
                            <span>
                                <ReactIntl.FormattedMessage
                                    id="lead.check.phone.free.weekly.tip"
                                    defaultMessage="本周免费提供空号检测{text}，欢迎大家试用！"
                                    values={{
                                        text: <span className="only-phone-text">({Intl.get('lead.check.phone.only.phone', '仅手机号')})</span>
                                    }}
                                />
                            </span>
                        </div>
                    )}
                    overlayClassName="extract-limit-content"
                >
                    <Checkbox
                        checked={this.hasEnableCheckPhone()}
                        disabled={this.state.setEnableCheckPhone}
                        onChange={this.handleCheckPhoneChange}
                        className="check-phone-enable-checkbox"
                    >
                        {Intl.get('lead.check.phone', '空号检测')}
                    </Checkbox>
                </Popover>
                {this.state.extractedResult === 'success' ? (
                    <AlertTimer
                        closable
                        time={EXTRACTED_SUCCESS_TIME}
                        message={(
                            <ReactIntl.FormattedMessage
                                id="clue.recommend.extract.success.tip"
                                defaultMessage={'提取成功！ 去{leads}查看'}
                                values={{
                                    leads: <a data-tracename="点击查看线索管理按钮" onClick={this.handleLinkLeads}>{Intl.get('versions.feature.lead.management', '线索管理')}</a>
                                }}
                            />
                        )}
                        type="success"
                        showIcon
                        onHide={this.hideExtractedTooltip}
                        onClose={this.hideExtractedTooltip}
                    />
                ) : null}
            </React.Fragment>
        );
    };

    renderMoreDataBlock = () => {
        return (
            <div className="more-date-wrapper">
                <div className="more-data-content">
                    <span className="btn-wrapper" data-tracename="点击列表底部的换一批按钮" title={Intl.get('clue.customer.refresh.list', '换一批')} onClick={this.getRecommendClueLists.bind(this, null, EXTRACT_CLUE_CONST_MAP.ANOTHER_BATCH)}>
                        <i className="iconfont icon-change-new"/>
                        <span>{Intl.get('clue.customer.refresh.list', '换一批')}</span>
                    </span>
                </div>
            </div>
        );
    };

    renderRecommendLists = () => {
        let {
            recommendClueLists,
            settedCustomerRecommend,
            isLoadingRecommendClue,
            getRecommendClueErrMsg,
            total
        } = this.state;
        if(settedCustomerRecommend.loading || isLoadingRecommendClue) {
            return (
                <div className="load-content">
                    <Spinner className='home-loading'/>
                </div>
            );
        }else if(getRecommendClueErrMsg && getRecommendClueErrMsg !== Intl.get('errorcode.168', '符合条件的线索已被提取完成，请修改条件再查看')) {
            return (
                <div className="errmsg-container">
                    <span className="errmsg-tip">{getRecommendClueErrMsg},</span>
                    <a className="retry-btn" data-tracename="点击重新获取推荐线索按钮" onClick={this.getRecommendClueLists.bind(this, null, '')}>
                        {Intl.get('user.info.retry', '请重试')}
                    </a>
                </div>
            );
        }else if(!_.get(recommendClueLists,'[0]')) {
            return (
                <NoDataIntro
                    noDataTip={Intl.get('clue.no.data.during.range.and.status', '没有符合条件的线索')}
                />
            );
        }else {
            return (
                <div className="extract-clue-panel-container">
                    {
                        _.map(recommendClueLists, item => {
                            const cls = 'extract-clue-item' + this.setInvalidClassName(item);
                            let otherProps = {
                                products: this.handleHighLightStyle(item.products),
                                scope: this.handleHighLightStyle(item.scope),
                                industry: this.handleHighLightStyle(item.industry),
                                companyProfile: this.handleHighLightStyle(item.companyProfile),
                            };
                            const otherCls = classNames('extract-clue-text__info extract-clue-text__filters', {
                                'extract-clue-text__null': !otherProps.products.hasHighLight && !otherProps.scope.hasHighLight && !otherProps.industry.hasHighLight && !otherProps.companyProfile.hasHighLight
                            });
                            let labels = item.labels.concat(item.features);
                            return (
                                <div className={cls} key={item.id}>
                                    <Checkbox checked={this.hasChecked(item)} disabled={this.getDisabledClue(item)} onChange={this.handleCheckChange.bind(this, item)}/>
                                    <div className="extract-clue-text-wrapper" title={item.hasExtractedByOther ? Intl.get('errorcode.169', '该线索已被提取') : ''}>
                                        <div className="extract-clue-text__name">
                                            {item.hasExtractedByOther ? <i className='iconfont icon-warning-tip'/> : null}
                                            <span className="clue-name" dangerouslySetInnerHTML={{__html: this.handleHighLightStyle(item.name).content}}/>
                                            {item.openStatus ? <span className="clue-company-open-status">{item.openStatus.split('（')[0].replace('开业', '在业')}</span> : null}
                                            {labels.length ? (
                                                <div className="clue-labels">
                                                    {_.map(labels, (tag, index) => (
                                                        <Tag key={index}><span dangerouslySetInnerHTML={{__html: this.handleTagHighLightText(tag)}}/></Tag>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                        <div className="extract-clue-text__filters">
                                            {item.startTime ? (
                                                <div className="extract-clue-text-item">
                                                    <span className='extract-clue-info-item'>
                                                        <span className="extract-clue-text-label">{Intl.get('clue.customer.register.time', '注册时间')}：</span>
                                                        <span>{moment(item.startTime).format(oplateConsts.DATE_FORMAT)}</span>
                                                    </span>
                                                    {/*<span className='extract-clue-info-item'>
                                                        <span className="extract-clue-text-label">{Intl.get('clue.recommend.registered.capital', '注册资本')}：</span>
                                                        <span>{Intl.get('crm.149', '{num}万', {num: item.capital / 10000})}</span>
                                                    </span>*/}
                                                    {/*<span className='extract-clue-info-item'>
                                                        <span className="extract-clue-text-label">{Intl.get('call.record.contacts', '联系人')}：</span>
                                                        <span>{item.legalPerson}</span>
                                                    </span>*/}
                                                </div>
                                            ) : null}
                                            <div className="extract-clue-text-item">
                                                {_.get(item.contact, 'phones') ? (
                                                    <span className="extract-clue-contacts-item">
                                                        <span className="extract-clue-text-label">{Intl.get('common.phone', '电话')}：</span>
                                                        <Popover trigger="hover" content={_.get(item,'telephones').map(phone => {
                                                            let phoneNumber = getShowPhoneNumber(item, phone);
                                                            return (<div key={phone}>{phoneNumber}{this.handlePhoneOtherStatusTip(phoneNumber)}</div>);
                                                        })}>
                                                            <span className={CONTACT_PHONE_CLS}>{_.get(item.contact, 'phones')}</span>
                                                        </Popover>
                                                        {Intl.get('contract.22', '个')}
                                                    </span>
                                                ) : null}
                                                {_.get(item.contact, 'email') ? (
                                                    <span className="extract-clue-contacts-item">
                                                        <span className="extract-clue-text-label">{Intl.get('common.email', '邮箱')}：</span>
                                                        <span>{Intl.get('clue.recommend.clue.count', '{count}个', {
                                                            count: _.get(item.contact, 'email')
                                                        })}</span>
                                                    </span>
                                                ) : null}
                                                {_.get(item.contact, 'qq') ? (
                                                    <span className="extract-clue-contacts-item">
                                                        <span className="extract-clue-text-label">QQ：</span>
                                                        <span>{Intl.get('clue.recommend.clue.count', '{count}个', {
                                                            count: _.get(item.contact, 'qq')
                                                        })}</span>
                                                    </span>
                                                ) : null}
                                                {_.get(item.contact, 'weChat') ? (
                                                    <span className="extract-clue-contacts-item">
                                                        <span className="extract-clue-text-label">{Intl.get('crm.58', '微信')}：</span>
                                                        <span>{Intl.get('clue.recommend.clue.count', '{count}个', {
                                                            count: _.get(item.contact, 'weChat')
                                                        })}</span>
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className={otherCls}>
                                            {/*行业*/}
                                            {otherProps.industry.hasContent ? (
                                                <div className="extract-clue-text-item">
                                                    <span>{Intl.get('menu.industry', '行业')}：</span>
                                                    <span dangerouslySetInnerHTML={{__html: otherProps.industry.content}}/>
                                                </div>
                                            ) : null}
                                            {/*产品*/}
                                            {otherProps.products.hasContent ? (
                                                <div className="extract-clue-text-item">
                                                    <ShearContent rowsNum={1}>
                                                        <span>{Intl.get('common.product', '产品')}：</span>
                                                        <span dangerouslySetInnerHTML={{__html: otherProps.products.content}}/>
                                                    </ShearContent>
                                                </div>
                                            ) : null}
                                            {/*经营范围*/}
                                            {otherProps.scope.hasContent ? (
                                                <div className="extract-clue-text-item">
                                                    <ShearContent rowsNum={1}>
                                                        <span>{Intl.get('clue.recommend.clue.scope', '经营范围')}：</span>
                                                        <span dangerouslySetInnerHTML={{__html: otherProps.scope.content}}/>
                                                    </ShearContent>
                                                </div>
                                            ) : null}
                                            {/*简介*/}
                                            {otherProps.companyProfile.hasContent ? (
                                                <div className="extract-clue-text-item">
                                                    <ShearContent
                                                        rowsNum={1}
                                                    >
                                                        <span>{Intl.get('clue.recommend.clue.introduction', '简介')}：</span>
                                                        <span dangerouslySetInnerHTML={{__html: otherProps.companyProfile.content}}/>
                                                    </ShearContent>
                                                </div>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="single-extract-clue">
                                        {item.hasExtracted ? <span className="clue-has-extracted">{Intl.get('common.has.been.extracted', '已提取')}</span> : (
                                            this.getDisabledClue(item) ? null : <div className="handle-btn-item">
                                                {this.extractClueOperator(item)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    }
                    {total === recommendClueLists.length ? null : this.renderMoreDataBlock()}
                </div>
            );
        }
    }

    renderTitle() {
        let {isWebMin} = isResponsiveDisplay();
        return (
            <div className="unextract-clue-tip clearfix">
                <div className="no-extract-count-tip">
                    <Checkbox className="check-all" checked={this.isCheckAll()} onChange={this.handleCheckAllChange} disabled={this.disabledCheckAll()}>{Intl.get('common.all.select', '全选')}</Checkbox>
                    {this.hasNoExtractCountTip()}
                    {isWebMin ? null : this.renderExtractOperator(isWebMin)}
                </div>
                {this.renderBtnClock(isWebMin)}
                {isWebMin ? this.renderExtractOperator(isWebMin) : null}
            </div>
        );
    }

    render() {
        let divHeight = $(window).height();

        let {isWebMin} = isResponsiveDisplay();
        let contentEl = $('.recommend-clue-content');
        if(contentEl.length) {
            divHeight -= (contentEl.offset().top + (isWebMin ? 0 : LAYOUT_CONSTANCE.PADDING_BOTTOM));
        }

        let recommendCls = classNames('recommend-customer-top-nav-wrap', {
            'responsive-mini-btn': isWebMin
        });
        return (
            <div className="recommend-clues-lists-container" data-tracename="推荐线索列表面板">
                <div className="recommend-customer-list">
                    <div className="recommend-clue-panel">
                        <div className="recommend-clue-content-container">
                            <div className="filter-container">
                                <RecommendCluesFilterPanel
                                    hasSavedRecommendParams={this.state.settedCustomerRecommend.obj}
                                    isLoading={this.state.settedCustomerRecommend.loading || this.state.isLoadingRecommendClue}
                                    canClickMoreBatch={this.state.canClickMoreBatch}
                                    isSelectedHalfYearRegister={this.isSelectedHalfYearRegister()}
                                    feature={this.state.feature}
                                    getRecommendClueLists={this.getRecommendClueLists}
                                    style={{width: LAYOUT_CONSTANCE.FILTER_WIDTH, height: $(window).height()}}
                                    handleToggleOtherCondition={this.handleToggleOtherCondition}
                                />
                            </div>
                            <div className="recommend-clue-detail-content-container">
                                <div className="recommend-clue-detail-content-box clearfix">
                                    <DetailCard
                                        title={this.renderTitle()}
                                        content={(
                                            <div className="recommend-clue-content" style={{height: divHeight}}>
                                                <GeminiScrollbar>
                                                    {this.renderRecommendLists()}
                                                </GeminiScrollbar>
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

RecommendCluesList.defaultProps = {
    afterSuccess: function() {},
    onClosePanel: function() {}
};
RecommendCluesList.propTypes = {
    onClosePanel: PropTypes.func,
    afterSuccess: PropTypes.func,
    guideRecommendCondition: PropTypes.object,
    clearGuideRecomentCondition: PropTypes.func
};

export default RecommendCluesList;