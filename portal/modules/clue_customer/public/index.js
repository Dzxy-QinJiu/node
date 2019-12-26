/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/7/23.
 */
import 'babel-polyfill';
var rightPanelShow = false;
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
var clueCustomerStore = require('./store/clue-customer-store');
var clueFilterStore = require('./store/clue-filter-store');
var clueCustomerAction = require('./action/clue-customer-action');
var clueFilterAction = require('./action/filter-action');
var userData = require('../../../public/sources/user-data');
import Trace from 'LIB_DIR/trace';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import {SearchInput, AntcTable} from 'antc';
import {
    message,
    Icon,
    Row,
    Col,
    Button,
    Alert,
    Select,
    Modal,
    Radio,
    Input,
    Tag,
    Menu,
    Dropdown,
    Popconfirm,
    Popover,
} from 'antd';
const {TextArea} = Input;
const RadioGroup = Radio.Group;
const Option = Select.Option;
import TopNav from 'CMP_DIR/top-nav';
import queryString from 'query-string';
import {removeSpacesAndEnter, getTableContainerHeight, getCertainTabsTitle} from 'PUB_DIR/sources/utils/common-method-util';
import {XLS_FILES_TYPE_RULES} from 'PUB_DIR/sources/utils/consts';
require('./css/index.less');
import {
    SELECT_TYPE,
    getClueStatusValue,
    clueStartTime,
    getClueSalesList,
    getLocalSalesClickCount,
    SetLocalSalesClickCount,
    AVALIBILITYSTATUS,
    assignSalesPrivilege,
    editCluePrivilege,
    handlePrivilegeType,
    sourceClassifyArray,
    FLOW_FLY_TIME,
    HIDE_CLUE_TIME,
    ADD_SELECT_TYPE,
    SIMILAR_CLUE,
    SIMILAR_CUSTOMER,
    NEED_MY_HANDLE,
    isCommonSalesOrPersonnalVersion,
    freedCluePrivilege,
    deleteCluePrivilege,
    deleteClueIconPrivilege,
    avalibilityCluePrivilege,
    transferClueToCustomerIconPrivilege,
    addCluePrivilege,
    releaseClueTip,
} from './utils/clue-customer-utils';
var Spinner = require('CMP_DIR/spinner');
import clueCustomerAjax from './ajax/clue-customer-ajax';
import ContactItem from 'MOD_DIR/common_sales_home_page/public/view/contact-item';
import ClueAnalysisPanel from './views/clue-analysis-panel';
import SalesClueAddForm from './views/add-clues-form';
import ClueImportRightDetail from 'CMP_DIR/import_step';
import rightPanelUtil from 'CMP_DIR/rightPanel';
const RightPanel = rightPanelUtil.RightPanel;
var RightContent = require('CMP_DIR/privilege/right-content');
import classNames from 'classnames';
var crmUtil = require('MOD_DIR/crm/public/utils/crm-util');
import ajax from 'ant-ajax';
import commonAjax from 'MOD_DIR/common/ajax';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import {pathParamRegex} from 'PUB_DIR/sources/utils/validate-util';
var batchOperate = require('PUB_DIR/sources/push/batch');
import {FilterInput} from 'CMP_DIR/filter';
import NoDataAddAndImportIntro from 'CMP_DIR/no-data-add-and-import-intro';
import ClueFilterPanel from './views/clue-filter-panel';
import {isSalesRole, checkCurrentVersion, checkCurrentVersionType, getRecommendClueCount} from 'PUB_DIR/sources/utils/common-method-util';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import {phoneMsgEmitter, clueToCustomerPanelEmitter, paymentEmitter} from 'PUB_DIR/sources/utils/emitters';
import ShearContent from 'CMP_DIR/shear-content-new';
const AlertTimer = require('CMP_DIR/alert-timer');
const DELAY_TIME = 3000;
import AppUserManage from 'MOD_DIR/app_user_manage/public';
var batchPushEmitter = require('PUB_DIR/sources/utils/emitters').batchPushEmitter;
import ClueExtract from 'MOD_DIR/clue_pool/public';
import MoreButton from 'CMP_DIR/more-btn';
import DifferentVersion from 'MOD_DIR/different_version/public';
import {subtracteGlobalClue, formatSalesmanList,isResponsiveDisplay} from 'PUB_DIR/sources/utils/common-method-util';
//用于布局的高度
var LAYOUT_CONSTANTS = {
    FILTER_WIDTH: 300,
    TABLE_TITLE_HEIGHT: 60,//带选择框的TH高度
    TH_MORE_HEIGHT: 20,//带选择框的TH60比不带选择框的TH40多出来的高度
    MIN_WIDTH_NEED_CAL: 405,//需要计算输入框时的断点
    WIDTH_WITHOUT_INPUT: 185//topnav中除了输入框以外的宽度
};
import RecommendCluesForm from './views/recomment_clues/recommend_clues_form';
import ClueRecommedLists from './views/recomment_clues/recommend_clues_lists';
import CustomerLabel from 'CMP_DIR/customer_label';
import { clueEmitter, notificationEmitter } from 'PUB_DIR/sources/utils/emitters';
import { parabola } from 'PUB_DIR/sources/utils/parabola';
import { storageUtil } from 'ant-utils';
import { setWebsiteConfig } from 'LIB_DIR/utils/websiteConfig';
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
const DIFFREF = {
    ASSIGN: 'assign',//分配
    TRACE: 'trace', //跟进
    TRASFERINVALID: 'trasferInvalid',//转化和标为无效
};
class ClueCustomer extends React.Component {
    constructor(props) {
        super(props);

        const websiteConfig = JSON.parse(storageUtil.local.get('websiteConfig'));
        this.state = {
            clueAddFormShow: false,//
            rightPanelIsShow: rightPanelShow,//是否展示右侧客户详情
            accessChannelArray: accessChannelArray,//线索渠道
            clueSourceArray: clueSourceArray,//线索来源
            clueClassifyArray: clueClassifyArray,//线索分类
            isRemarkingItem: '',//正在标记的那条线索
            clueImportTemplateFormShow: false,//线索导入面板是否展示
            previewList: [],//预览列表
            clueAnalysisPanelShow: false,//线索分析面板是否展示
            exportRange: 'filtered',
            isExportModalShow: false,//是否展示导出线索的模态框
            isEdittingItem: {},//正在编辑的那一条
            isInvalidateItem: {},//标记无效的那一条
            submitContent: '',//要提交的跟进记录的内容
            submitReason: '',//要提交的无效原因
            submitTraceErrMsg: '',//提交跟进记录出错的信息
            submitInvalidateClueMsg: '',//提交标记无效出错的信息
            submitTraceLoading: false,//正在提交跟进记录
            submitInvalidateLoading: false,//正在提交无效记录
            showCustomerId: '',//正在展示客户详情的客户id
            isShowCustomerUserListPanel: false,//是否展示该客户下的用户列表
            customerOfCurUser: {},//当前展示用户所属客户的详情
            selectedClues: [],//获取批量操作选中的线索
            isShowExtractCluePanel: false, // 是否显示提取线索界面，默认不显示
            addType: 'start',//添加按钮的初始
            isReleasingClue: false,//是否正在释放线索
            selectedClue: [],//选中的线索
            isShowRefreshPrompt: false,//是否展示刷新线索面板的提示
            cluePoolCondition: {},//线索池的搜索条件
            filterInputWidth: 210,//筛选输入框的宽度
            batchSelectedSales: '',//记录当前批量选择的销售，销销售团队id
            showRecommendTips: !_.get(websiteConfig,['oplateConsts','STORE_PERSONNAL_SETTING','NO_SHOW_RECOMMEND_CLUE_TIPS'],false),
            showDifferentVersion: false,//是否显示版本信息面板
            //显示内容
            ...clueCustomerStore.getState()
        };
    }

    componentDidMount() {
        const query = queryString.parse(this.props.location.search);
        clueCustomerStore.listen(this.onStoreChange);
        //获取线索来源
        this.getClueSource();
        //获取线索渠道
        this.getClueChannel();
        //获取线索分类
        this.getClueClassify();
        //获取已提取线索量
        this.getRecommendClueCount();
        this.getSalesmanList();
        this.getClueList();
        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_CHANGE_TRACE, this.batchChangeTraceMan);
        batchPushEmitter.on(batchPushEmitter.CLUE_BATCH_LEAD_RELEASE, this.batchReleaseLead);
        clueEmitter.on(clueEmitter.REMOVE_CLUE_ITEM, this.removeClueItem);
        clueEmitter.on(clueEmitter.FLY_CLUE_WILLDISTRIBUTE, this.flyClueWilldistribute);
        clueEmitter.on(clueEmitter.FLY_CLUE_WILLTRACE, this.flyClueWilltrace);
        clueEmitter.on(clueEmitter.FLY_CLUE_HASTRACE, this.flyClueHastrace);
        clueEmitter.on(clueEmitter.FLY_CLUE_HASTRANSFER, this.flyClueHastransfer);
        clueEmitter.on(clueEmitter.FLY_CLUE_INVALID, this.flyClueInvalid);
        clueEmitter.on(clueEmitter.SHOW_RECOMMEND_PANEL, this.showClueRecommendTemplate);

        notificationEmitter.on(notificationEmitter.UPDATE_CLUE, this.showRefreshPrompt);
        //如果从url跳转到该页面，并且有add=true，则打开右侧面板
        if (query.add === 'true') {
            this.showAddForm();
        }
        //如果是进入线索推荐
        if(_.get(this.props, 'history.action') === 'PUSH' && _.get(this.props, 'location.state.showRecommendCluePanel')) {
            if(_.get(this.props, 'location.state.targetObj')) {
                clueCustomerAction.saveSettingCustomerRecomment(_.get(this.props, 'location.state.targetObj', {})); 
            }
            this.showClueRecommendTemplate();
        }else {
            //获取是否配置过线索推荐条件
            this.getSettingCustomerRecomment();
        }
        this.setFilterInputWidth();
        //响应式布局时动态计算filterinput的宽度
        $(window).on('resize', this.resizeHandler);
    }

    resizeHandler = () => {
        clearTimeout(this.scrollTimer);
        this.scrollTimer = setTimeout(() => {
            this.setFilterInputWidth();
        }, 100);
    };

    setFilterInputWidth = () => {
        let needCalWidth = $(window).width() <= LAYOUT_CONSTANTS.MIN_WIDTH_NEED_CAL;
        if(needCalWidth) {
            let filterInputWidth = $(window).width() - LAYOUT_CONSTANTS.WIDTH_WITHOUT_INPUT;
            this.setState({
                filterInputWidth
            });
        } else {
            this.setState({
                filterInputWidth: 210
            });
        }
    }

    //打开添加线索面板
    showAddForm = () => {
        this.setState({
            addType: 'add',//手动添加
            clueAddFormShow: true
        });
    }

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
    getUnhandledClue = () => {
        //现在只有普通销售有未读数
        clueFilterAction.setTimeType('all');
        clueFilterAction.setFilterClueAllotNoTrace(NEED_MY_HANDLE);
        this.filterPanel.filterList.setDefaultFilterSetting();
    };

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'history.action') === 'PUSH' && _.get(nextProps, 'location.state.clickUnhandleNum')) {
            var filterStoreData = clueFilterStore.getState();
            var checkAllotNoTraced = filterStoreData.filterAllotNoTraced === NEED_MY_HANDLE;//待我处理
            var checkedAdvance = false;//在高级筛选中是否有其他的选中项
            var checkOtherData = _.get(this, 'filterPanel.filterList.props.advancedData', []);//线索状态
            if (filterStoreData.filterClueAvailability === '1') {
                //是否选中线索无效的标签
                checkedAdvance = true;
            }
            if (!checkedAdvance) {
                _.forEach(checkOtherData, (group) => {
                    var target = _.find(group.data, item => item.selected);
                    if (target) {
                        checkedAdvance = true;
                        return;
                    }
                });
            }
            if (!checkedAdvance) {
                var filterItem = ['filterClueAccess', 'filterClueClassify', 'filterClueProvince', 'filterClueSource'];//高级筛选的其他选项
                _.forEach(filterItem, (itemName) => {
                    if (_.get(filterStoreData, `[${itemName}].length`)) {
                        checkedAdvance = true;
                        return;
                    }
                });
            }
            //点击数字进行跳转时，如果当前选中的条件只是待我审批的条件，那么就不需要清空数据,如果当前选中的除了待我审批的，还有其他的条件，就需要把数据进行情况  checkAllotNoTraced： 选中了待我审批  checkedAdvance： 还有其他筛选项
            if ((!checkAllotNoTraced || (checkAllotNoTraced && checkedAdvance))) {
                delete nextProps.location.state.clickUnhandleNum;
                clueCustomerAction.setClueInitialData();
                this.getUnhandledClue();
            }
        }
        //是否是点击noty上的查看全部线索
        if (_.get(nextProps, 'history.action') === 'PUSH' && _.get(nextProps, 'location.state.refreshClueList')){
            this.onTypeChange();
        }
    }

    batchChangeTraceMan = (taskInfo, taskParams) => {
        //如果参数不合法，不进行更新
        if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
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
        var curClueLists = this.state.curClueLists;
        var clueArr = _.map(tasks, 'taskDefine');
        //遍历每一个客户
        _.each(clueArr, (clueId) => {
            //如果当前客户是需要更新的客户，才更新
            var target = _.find(curClueLists, item => item.id === clueId);
            if (target) {
                clueCustomerAction.updateClueItemAfterAssign({
                    item: target,
                    submitObj: taskParams,
                    isWillDistribute: taskParams.isWillDistribute
                });
            }
        });
        this.setState({
            selectedClues: [],
        });
    };
    removeClueItem = (item) => {
        //在列表中删除线索
        var filterAllotNoTraced = clueFilterStore.getState().filterAllotNoTraced;//待我处理的线索
        if (filterAllotNoTraced) {
            //需要在列表中删除
            clueCustomerAction.deleteClueById(item);
        }
    };

    componentWillUnmount() {
        clueCustomerStore.unlisten(this.onStoreChange);
        this.hideRightPanel();
        //清空页面上的筛选条件
        clueFilterAction.setInitialData();
        clueCustomerAction.resetState();
        //“这里可以提取线索”，只提示一次（登录后或者点击关闭）
        const websiteConfig = JSON.parse(storageUtil.local.get('websiteConfig'));
        if(this.state.showRecommendTips && !_.get(websiteConfig,['oplateConsts','STORE_PERSONNAL_SETTING','NO_SHOW_RECOMMEND_CLUE_TIPS'],false)) {
            this.handleClickCloseClue();
        }
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_CHANGE_TRACE, this.batchChangeTraceMan);
        batchPushEmitter.removeListener(batchPushEmitter.CLUE_BATCH_LEAD_RELEASE, this.batchReleaseLead);
        clueEmitter.removeListener(clueEmitter.REMOVE_CLUE_ITEM, this.removeClueItem);
        clueEmitter.removeListener(clueEmitter.FLY_CLUE_WILLDISTRIBUTE, this.flyClueWilldistribute);
        clueEmitter.removeListener(clueEmitter.FLY_CLUE_WILLTRACE, this.flyClueWilltrace);
        clueEmitter.removeListener(clueEmitter.FLY_CLUE_HASTRACE, this.flyClueHastrace);
        clueEmitter.removeListener(clueEmitter.FLY_CLUE_HASTRANSFER, this.flyClueHastransfer);
        clueEmitter.removeListener(clueEmitter.FLY_CLUE_INVALID, this.flyClueInvalid);
        clueEmitter.removeListener(clueEmitter.SHOW_RECOMMEND_PANEL, this.showClueRecommendTemplate);
        notificationEmitter.removeListener(notificationEmitter.UPDATE_CLUE, this.showRefreshPrompt);
        $(window).off('resize', this.resizeHandler);
    }
    //动画收起某个元素后再有飞出效果
    animateHideItem = (updateItem,callback) => {
        const index = _.findIndex(this.state.curClueLists, item => item.id === updateItem.id);
        var jqueryDom = $('.clue-customer-list .ant-table-body tr:nth-child(' + (index + 1) + ') td');
        jqueryDom.animate({height: '1px !important',padding: '0 !important'},HIDE_CLUE_TIME,'linear',() => {
            // _.isFunction(callback) && callback();
        });
    };
    changeAddNumTab = (addNumTab) => {
        this.setState({
            addNumTab: addNumTab
        },() => {
            var addNumber = $('.clue-content-container .clue-status-wrap .clue-status-tab .clue-add-num.show-add-num');
            addNumber.animate({top: '-20px'},FLOW_FLY_TIME,'linear',() => {
                this.setState({
                    addNumTab: ''
                },() => {
                    $('.clue-content-container .clue-status-wrap .clue-status-tab .clue-add-num').css({top: 0});
                });
            });
        });
    };
    flyClueWilldistribute = (item,startType) => {
        //飞入待分配的，在待分配的数字上加一
        this.changeAddNumTab(ADD_SELECT_TYPE.WILL_DISTRIBUTE);
        // this.onAnimate(item, this.$willDistribute,startType);
    }
    //动画移动到待跟进中
    flyClueWilltrace = (item,startType) => {
        this.changeAddNumTab(ADD_SELECT_TYPE.WILL_TRACE);
        // this.onAnimate(item, this.$willTrace,startType);
    };
    //动画移动到已跟进中
    flyClueHastrace = (item,startType) => {
        this.changeAddNumTab(ADD_SELECT_TYPE.HAS_TRACE);
        // this.onAnimate(item,this.$hasTrace,startType);
    };
    //动画移动到已转化中
    flyClueHastransfer = (item,startType) => {
        this.changeAddNumTab(ADD_SELECT_TYPE.HAS_TRANSFER);
        // this.onAnimate(item, this.$hasTransfer,startType);
    };
    //动画移动到无效中
    flyClueInvalid = (item,startType) => {
        this.changeAddNumTab(ADD_SELECT_TYPE.INVALID_CLUE);
        // this.onAnimate(item, this.$invalidClue,startType);
    };

    //有新线索时线索面板添加刷新提示
    showRefreshPrompt = (data) => {
        if(!_.isEmpty(data) && _.isObject(data)) {
            //如果当前无线索，直接展示刷新提示
            if(_.isEmpty(this.state.curClueLists)) {
                this.setState({
                    isShowRefreshPrompt: true
                });
            } else {
                let clue_list = _.get(data, 'clue_list', []);
                _.map(clue_list, clue => {
                    //判断是否推送的线索为当前tab下的线索
                    let status = clue.status;
                    //线索类型
                    let typeFilter = this.getFilterStatus();
                    if(_.isEqual(status, typeFilter.status)) {
                        //如果当前已经展示了刷新提示，不做操作
                        if(!_.get(this.state, 'isShowRefreshPrompt')) {
                            this.setState({
                                isShowRefreshPrompt: true
                            });
                        }
                    }
                });
            }
        }
    }

    //展示右侧面板
    showClueDetailOut = (item) => {
        rightPanelShow = true;
        this.setState({rightPanelIsShow: true});
        clueCustomerAction.setCurrentCustomer(item.id);
        setTimeout(() => {
            this.renderClueDetail();
        });
    };
    renderClueDetail = () => {
        //触发打开带拨打电话状态的线索详情面板
        if (this.state.currentId) {
            phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
                clue_params: {
                    currentId: this.state.currentId,
                    showRightPanel: this.showClueDetailOut,
                    hideRightPanel: this.hideRightPanel,
                    curClue: this.state.curClue,
                    afterTransferClueSuccess: this.afterTransferClueSuccess,
                    ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                    updateCustomerLastContact: this.updateCustomerLastContact
                }
            });
        }
    };
    hideRightPanel = () => {
        rightPanelShow = false;
        this.setState({rightPanelIsShow: false});
        //关闭右侧面板后，将当前展示线索的id置为空
        clueCustomerAction.setCurrentCustomer('');
        $('.ant-table-row').removeClass('current-row');
    };

    onClueImport = (list) => {
        this.setState({
            previewList: this.handlePreviewList(list),
        });
    };
    //将导入预览的数据转换为预览列表中展示所需数据
    handlePreviewList(list) {
        return _.map(list, item => {
            if (_.get(item, 'errors')) {
                //导入组件中需要此参数进行判断是否展示错误提示
                item.repeat = true;
            }
            return item;
        });
    }

    onStoreChange = () => {
        this.setState(clueCustomerStore.getState());
    };

    getClueSource = () => {
        clueCustomerAjax.getClueSource().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueSourceArray: _.union(this.state.clueSourceArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索来源出错了 ' + errorMsg);
        });
    };

    getClueChannel = () => {
        clueCustomerAjax.getClueChannel().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    accessChannelArray: _.union(this.state.accessChannelArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索渠道出错了 ' + errorMsg);
        });
    };

    getClueClassify = () => {
        clueCustomerAjax.getClueClassify().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueClassifyArray: _.union(this.state.clueClassifyArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索分类出错了 ' + errorMsg);
        });
    };
    getSettingCustomerRecomment = () => {
        clueCustomerAction.getSettingCustomerRecomment();
    };

    getRecommendClueCount = () => {
        let version = _.get(userData.getUserData(), 'organization.version', {});
        getRecommendClueCount({
            timeStart: _.get(version, 'create_time', ''), //组织创建时间
            timeEnd: moment().endOf('day').valueOf()
        },(result) => {
            this.setState({
                hasExtractCount: _.get(result, 'count', 0)
            });
        });
    };


    //根据按钮选择导入或添加线索
    handleButtonClick = (e) => {
        if(e.key === 'add'){
            this.setState({
                addType: e.key,//手动添加
                clueAddFormShow: true
            });
        }else if(e.key === 'import'){
            this.setState({
                addType: e.key,
                clueImportTemplateFormShow: true
            });
        }
    }
    //渲染导入线索或添加线索按钮
    renderAddBtn = () => {
        let menu = (<Menu onClick = {this.handleButtonClick.bind(this)} >
            <Menu.Item key="add" >
                {Intl.get('crm.sales.manual_add.clue','手动添加')}
            </Menu.Item>
            <Menu.Item key="import" >
                {Intl.get('crm.sales.manual.import.clue','导入线索')}
            </Menu.Item>
        </Menu>);
        return (
            <div className="recomend-clue-customer-container">
                {
                    addCluePrivilege() ?
                        <Dropdown overlay={menu} overlayClassName="norm-add-dropdown" placement="bottomCenter">
                            <Button className="ant-btn ant-btn-primary manual-add-btn">
                                <Icon type="plus" className="add-btn"/>
                                {(this.state.addType === 'start') ? (Intl.get('crm.sales.add.clue', '添加线索')) : (
                                    (this.state.addType === 'add') ? Intl.get('crm.sales.manual_add.clue', '手动添加') :
                                        Intl.get('crm.sales.manual.import.clue', '导入线索')
                                )}
                            </Button>
                        </Dropdown> : null
                }
            </div>
        );
    };
    showClueRecommendTemplate = () => {
        this.setState({
            isShowRecommendCluePanel: true
        });
    };
    closeRecommendCluePanel = () => {
        this.setState({
            isShowRecommendCluePanel: false
        },() => {
            //重新刷新一下线索列表,防止提取线索后页面不刷新的问题
            this.getClueList();
        });
    }
    handleClickCloseClue = () => {
        let personnelObj = {};
        personnelObj[oplateConsts.STORE_PERSONNAL_SETTING.NO_SHOW_RECOMMEND_CLUE_TIPS] = true;
        setWebsiteConfig(personnelObj, () => {
            this.setState({
                showRecommendTips: false
            });
        }, (err) => {
            message.error(err);
        });
    };
    //渲染线索推荐按钮
    renderClueRecommend = () => {
        return (
            <div className="recomend-clue-customer-container pull-right">
                {hasPrivilege(cluePrivilegeConst.CURTAO_CRM_COMPANY_STORAGE) ?
                    <Popover
                        placement="bottom"
                        content={(
                            <span className="clue-recommend-tips-container">
                                {Intl.get('clue.customer.has.clue.can.extract', '您可以从这里提取线索哦')}
                                <i className="iconfont icon-close-wide" title={Intl.get('common.app.status.close', '关闭')} onClick={this.handleClickCloseClue}/>
                            </span>
                        )}
                        visible={!_.isNil(this.state.hasExtractCount) && !this.state.hasExtractCount && this.state.showRecommendTips}
                        overlayClassName="clue-recommend-tips explain-pop"
                    >
                        <Button onClick={this.showClueRecommendTemplate} className="btn-item" data-tracename="点击线索推荐按钮">
                            <i className="iconfont icon-clue-recommend"></i>
                            <span className="clue-container">
                                {Intl.get('clue.customer.clue.recommend', '线索推荐')}
                            </span>
                        </Button>
                    </Popover>
                    : null}
            </div>
        );
    };


    // 点击关闭提取线索的界面
    closeExtractCluePanel = () => {
        this.setState({
            isShowExtractCluePanel: false
        });
    };

    // 点击显示提取线索的界面
    showExtractCluePanel = () => {
        this.setState({
            isShowExtractCluePanel: true
        });
    };
    // 渲染提取线索
    renderExtractClue = () => {
        return (
            <div className="extract-clue-customer-container pull-right">
                <Popover trigger="hover"
                    placement="bottom"
                    content={Intl.get('clue.pool.explain', '存放释放的线索')}
                    overlayClassName="explain-pop">
                    <Button onClick={this.showExtractCluePanel} className="btn-item">
                        <i className="iconfont icon-clue-pool"></i>
                        <span className="clue-container">
                            {Intl.get('clue.pool','线索池')}
                        </span>
                    </Button>
                </Popover>
            </div>
        );
    };

    //个人试用升级为正式版
    handleUpgradePersonalVersion = () => {
        paymentEmitter.emit(paymentEmitter.OPEN_UPGRADE_PERSONAL_VERSION_PANEL, {
            showDifferentVersion: this.triggerShowVersionInfo
        });
    };
    //显示/隐藏版本信息面板
    triggerShowVersionInfo = () => {
        this.setState({showDifferentVersion: !this.state.showDifferentVersion});
    };


    getExportClueTips = () => {
        let currentVersion = checkCurrentVersion();
        let currentVersionType = checkCurrentVersionType();
        let tips = '';
        if(currentVersion.personal && currentVersionType.trial) {//个人试用
            tips = <a onClick={this.handleUpgradePersonalVersion}>{Intl.get('clue.customer.export.trial.user.tip', '请升级正式版')}</a>;
        }else if(currentVersion.company && currentVersionType.trial){//企业试用
            tips = Intl.get('payment.please.contact.our.sale', '请联系我们的销售人员进行升级，联系方式：{contact}', {contact: '400-6978-520'});
        }
        return tips;
    };

    //渲染导出线索的按钮
    renderExportClue = () => {
        let currentVersionType = checkCurrentVersionType();
        let tips = this.getExportClueTips();
        return(
            <div className="export-clue-customer-container pull-right">
                {currentVersionType.trial ?
                    (<Popover content={tips} overlayClassName="explain-pop">
                        <Button disabled={true} className="btn-item btn-disabled">
                            <i className="iconfont icon-export-clue"></i>
                            <span className="clue-container">
                                {Intl.get('clue.export.clue.list','导出线索')}
                            </span>
                        </Button>
                    </Popover>) :
                    (<Button onClick={this.showExportClueModal} className="btn-item">
                        <i className="iconfont icon-export-clue"></i>
                        <span className="clue-container">
                            {Intl.get('clue.export.clue.list','导出线索')}
                        </span>
                    </Button>)}
            </div>
        );
    };

    //点击导入线索按钮
    showImportClueTemplate = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.import-clue-customer-container'), '点击导入线索按钮');
        this.setState({
            clueImportTemplateFormShow: true
        });
    };
    //点击导出线索按钮
    showExportClueModal = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.export-clue-customer-container'), '点击导出线索按钮');
        this.setState({
            isExportModalShow: true
        });
    };
    hideExportModal = () => {
        this.setState({
            isExportModalShow: false
        });
    };

    //关闭导入线索模板
    closeClueTemplatePanel = () => {
        this.setState({
            clueImportTemplateFormShow: false,
            previewList: [],
        });
    };

    showClueAddForm = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.add-clue-customer-container'), '点击添加销售线索按钮');
        this.setState({
            clueAddFormShow: true
        });
    };

    //关闭增加线索面板
    hideClueAddForm = () => {
        this.setState({
            clueAddFormShow: false
        });
    };

    clearSelectedClue = () => {
        this.setState({
            selectedClues: [],
            selectAllMatched: false
        });
    };
    getFilterStatus = () => {
        var filterClueStatus = clueFilterStore.getState().filterClueStatus;
        return getClueStatusValue(filterClueStatus);
    };
    //是否有筛选过滤条件
    hasNoFilterCondition = () => {
        var filterStoreData = clueFilterStore.getState();
        if (_.isEmpty(filterStoreData.filterClueSource)
            && _.isEmpty(filterStoreData.filterClueAccess)
            && _.isEmpty(filterStoreData.filterClueClassify)
            && _.isEmpty(filterStoreData.filterSourceClassify)
            && _.get(filterStoreData, 'rangeParams[0].from') === 0
            && this.state.keyword === ''
            && _.isEmpty(filterStoreData.exist_fields)
            && _.isEmpty(filterStoreData.unexist_fields)
            && _.isEmpty(filterStoreData.filterClueProvince)
            && _.isEmpty(filterStoreData.filterLabels)
            && _.isEmpty(filterStoreData.filterClueUsers)){
            return true;
        }else{
            return false;
        }
    };
    //获取查询线索的参数
    getClueSearchCondition = (isExport,isGetAllClue) => {
        var filterStoreData = clueFilterStore.getState();
        var rangeParams = isGetAllClue ? [{
            from: clueStartTime,
            to: moment().endOf('day').valueOf(),
            type: 'time',
            name: 'source_time'
        }] : filterStoreData.rangeParams;
        //如果是选的全部时间，在获取线索列表的时候把结束时间再重新取一下，避免第二天再切换tab，传的时间还是昨天的时间
        if (filterStoreData.timeType === 'all'){
            rangeParams[0].to = moment().endOf('day').valueOf();
        }
        var typeFilter = isGetAllClue ? {status: ''} : this.getFilterStatus();//线索类型
        if (!isGetAllClue){
            typeFilter.availability = filterStoreData.filterClueAvailability;
        }
        //如果筛选的是无效的，不传status参数
        if (typeFilter.availability === AVALIBILITYSTATUS.INAVALIBILITY ){
            delete typeFilter.status;
        }
        //按销售进行筛选
        var filterClueUsers = filterStoreData.filterClueUsers;
        if (_.isArray(filterClueUsers) && filterClueUsers.length && !isGetAllClue) {
            typeFilter.user_name = filterClueUsers.join(',');
        }
        var existFilelds = filterStoreData.exist_fields;
        var unExistFileds = filterStoreData.unexist_fields;
        var sorter = this.state.sorter;
        //如果选中的是已跟进或者已转化的线索，按最后联系时间排序
        if (typeFilter.status === SELECT_TYPE.HAS_TRACE || typeFilter.status === SELECT_TYPE.HAS_TRANSFER) {
            sorter.field = 'last_contact_time';
        }else{
            sorter.field = 'source_time';
        }
        var bodyField = {};
        if (!isGetAllClue){
            //选中的线索来源
            var filterClueSource = filterStoreData.filterClueSource;
            if (_.isArray(filterClueSource) && filterClueSource.length){
                typeFilter.clue_source = filterClueSource.join(',');
            }
            //选中的线索接入渠道
            var filterClueAccess = filterStoreData.filterClueAccess;
            if (_.isArray(filterClueAccess) && filterClueAccess.length){
                typeFilter.access_channel = filterClueAccess.join(',');
            }
            //选中线索的销售团队
            let filterTeamList = filterStoreData.filterTeamList;
            if (_.isArray(filterTeamList) && filterTeamList.length){
                typeFilter.sales_team_id = filterTeamList.join(',');
            }
            //选中的线索分类
            var filterClueClassify = filterStoreData.filterClueClassify;
            if (_.isArray(filterClueClassify) && filterClueClassify.length){
                typeFilter.clue_classify = filterClueClassify.join(',');
            }
            //选中的获客方式
            let filterSourceClassify = filterStoreData.filterSourceClassify;
            if (_.isArray(filterSourceClassify) && filterSourceClassify.length){
                typeFilter.source_classify = filterSourceClassify.join(',');
            }
            //选中的线索地域
            var filterClueProvince = filterStoreData.filterClueProvince;
            if (_.isArray(filterClueProvince) && filterClueProvince.length){
                typeFilter.province = filterClueProvince.join(',');
            }
            //相似客户和线索
            let filterLabels = filterStoreData.filterLabels;
            if(!_.isEmpty(filterLabels)){
                if(_.isEqual(filterLabels, SIMILAR_CLUE)) {
                    typeFilter.lead_similarity = SIMILAR_CLUE;
                }else if(_.isEqual(filterLabels, SIMILAR_CUSTOMER)) {
                    typeFilter.customer_similarity = SIMILAR_CUSTOMER;
                }
            }

            if(_.isArray(existFilelds) && existFilelds.length){
                bodyField.exist_fields = existFilelds;
            }

            if(_.isArray(unExistFileds) && unExistFileds.length){
                bodyField.unexist_fields = unExistFileds;
            }
        }
        if (isExport){
            bodyField.export = true;
        }else{
            delete bodyField.export;
        }
        var queryRangeParam = _.cloneDeep(rangeParams);
        if (filterStoreData.notConnectedClues){
            queryRangeParam.push({name: 'no_answer_times', from: 1});
        }
        if(filterStoreData.leadFromLeadPool){//筛选从线索池中提取的线索
            queryRangeParam[0].name = 'extract_time';
        }
        //查询线索列表的请求参数
        return {
            queryParam: {
                keyword: isGetAllClue ? '' : _.trim(this.state.keyword),
                statistics_fields: 'status,availability'
            },
            bodyParam: {
                query: {
                    ...typeFilter
                },
                rang_params: queryRangeParam,
                ...bodyField,
            },
            pageNum: this.state.pageNum,//路径中需要加的参数
            pageSize: this.state.pageSize,//路径中需要加的参数
            sorter: sorter,
            firstLogin: this.state.firstLogin
        };
    };
    //是否选中待我处理
    isSelfHandleFilter = () => {
        var filterStoreData = clueFilterStore.getState();
        return filterStoreData.filterAllotNoTraced;//待我处理的线索
    };
    //获取线索列表
    getClueList = () => {
        //如果有刷新提示，点击刷新提示获取线索列表的，将刷新提示清除
        if(_.get(this.state, 'isShowRefreshPrompt')) {
            this.setState({
                isShowRefreshPrompt: false
            });
        }
        //跟据类型筛选
        const queryObj = this.getClueSearchCondition();
        if (this.isSelfHandleFilter()){
            clueCustomerAction.getClueFulltextSelfHandle(queryObj,(isSelfHandleFlag) => {
                this.handleFirstLoginData(isSelfHandleFlag);
            });
        }else{
            //取全部线索列表
            clueCustomerAction.getClueFulltext(queryObj,(isSelfHandleFlag) => {
                this.handleFirstLoginData(isSelfHandleFlag);
            });

        }
    };
    handleFirstLoginData = (flag) => {
        if (flag === 'filterAllotNoTraced'){
            clueFilterAction.setFilterClueAllotNoTrace();
            this.filterPanel.filterList.setDefaultFilterSetting(true);
        }else if (flag === 'avalibility'){
            this.handleChangeSelectedType('avaibility');
        }else{
            clueCustomerAction.setLoadingFalse();
        }

    };

    exportData = () => {
        Trace.traceEvent('线索管理', '导出线索');
        const sorter = this.state.sorter;
        var type = 'user';
        if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL)){
            type = 'manager';
        }
        //如果是有已经选中的线索，那么导出的就是已经选中的线索
        //没有选中的线索，再根据radio的选择不同导出该筛选条件下或者是全部的线索
        var reqData = {};
        if(this.hasSelectedClues()){
            reqData = _.cloneDeep(this.getClueSearchCondition(true, true));
            //然后再在query中加id字段
            var selectCluesIds = _.map(_.get(this, 'state.selectedClues'),'id');
            reqData.bodyParam.query.id = selectCluesIds.join(',');
        }else{
            var isGetAll = this.state.exportRange === 'all';
            reqData = isGetAll ? this.getClueSearchCondition(true, true) : this.getClueSearchCondition(true,false);
        }
        const params = {
            page_size: 10000,
            sort_field: sorter.field,
            order: sorter.order,
            type: type,
        };
        var route = '/rest/customer/v2/customer/range/clue/export/:page_size/:sort_field/:order/:type';
        if(this.isSelfHandleFilter()){
            route = '/rest/customer/v2/customer/range/selfHandle/clue/export/:page_size/:sort_field/:order/:type';
        }
        const url = route.replace(pathParamRegex, function($0, $1) {
            return params[$1];
        });

        let form = $('<form>', {action: url, method: 'post'});
        form.append($('<input>', {name: 'reqData', value: JSON.stringify(reqData)}));
        //将构造的表单添加到body上
        //Chrome 56 以后不在body上的表单不允许提交了
        $(document.body).append(form);
        form.submit();
        form.remove();
        this.hideExportModal();
    };

    errTipBlock = () => {
        //加载完成，出错的情况
        var errMsg = <span>{this.state.clueCustomerErrMsg}
            <a onClick={this.getClueList}>
                {Intl.get('user.info.retry', '请重试')}
            </a>
        </span>;
        return (
            <div className="alert-wrap">
                <Alert
                    message={errMsg}
                    type="error"
                    showIcon={true}
                />
            </div>
        );
    };


    handleContactLists = (contact) => {
        var clipContact = false;
        if (contact.length > 1){
            clipContact = true;
            contact.splice(1,contact.length - 1);
        }
        _.map(contact, (contactItem, idx) => {
            if (_.isArray(contactItem.phone) && contactItem.phone.length){
                if (contactItem.phone.length > 1){
                    contactItem.phone.splice(1, contactItem.phone.length - 1);
                    clipContact = true;
                }else if (_.isArray(contactItem.email) && contactItem.email.length || _.isArray(contactItem.qq) && contactItem.qq.length || _.isArray(contactItem.weChat) && contactItem.weChat.length){
                    clipContact = true;

                }
                contactItem.email = [];
                contactItem.qq = [];
                contactItem.weChat = [];

            }
            if (_.isArray(contactItem.email) && contactItem.email.length){
                if (contactItem.email.length > 1){
                    contactItem.email.splice(1, contactItem.email.length - 1);
                    clipContact = true;
                }else if (_.isArray(contactItem.qq) && contactItem.qq.length || _.isArray(contactItem.weChat) && contactItem.weChat.length) {
                    clipContact = true;

                }
                contactItem.qq = [];
                contactItem.weChat = [];
            }
            if (_.isArray(contactItem.qq) && contactItem.qq.length){
                if (contactItem.qq.length > 1){
                    contactItem.qq.splice(1, contactItem.qq.length - 1);
                    clipContact = true;
                } else if (_.isArray(contactItem.weChat) && contactItem.weChat.length) {
                    clipContact = true;

                }
                contactItem.qq.splice(1, contactItem.qq.length - 1);
                contactItem.weChat = [];
            }
            if (_.isArray(contactItem.weChat) && contactItem.weChat.length){
                if (contactItem.weChat.length > 1){
                    contactItem.weChat.splice(1, contactItem.weChat.length - 1);
                    clipContact = true;
                }

            }
        });
        return {clipContact: clipContact,contact: contact};
    };
    handleEditTrace = (updateItem) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.foot-text-content'), '点击添加/编辑跟进内容');
        this.setState({
            isEdittingItem: updateItem,
            submitContent: ''
        }, () => {
            if (this['changeTextare' + updateItem.id]) {
                this['changeTextare' + updateItem.id].focus();
            }
        });
    };
    handleInputChange = (e) => {
        this.setState({
            submitContent: e.target.value
        });
    };
    handleSubmitContent = (item) => {
        if (this.state.submitTraceLoading) {
            return;
        }
        var value = _.get(item, 'customer_traces[0].remark', '');
        subtracteGlobalClue(item);
        //获取填写的保存跟进记录的内容
        var textareVal = _.trim(this.state.submitContent);
        if (!textareVal) {
            this.setState({
                submitTraceErrMsg: Intl.get('cluecustomer.content.not.empty', '跟进内容不能为空')
            });
        } else {
            var submitObj = {
                'lead_id': item.id,
                'type': 'other',
                'remark': textareVal
            };
            this.setState({
                submitTraceLoading: true,
            });
            clueCustomerAction.addCluecustomerTrace(submitObj, (result) => {
                if (result && result.error) {
                    this.setState({
                        submitTraceLoading: false,
                        submitTraceErrMsg: Intl.get('common.save.failed', '保存失败')
                    });
                } else {
                    var clueItem = _.find(this.state.curClueLists, clueItem => clueItem.id === item.id);
                    var userId = userData.getUserData().user_id || '';
                    var userName = userData.getUserData().nick_name;
                    var addTime = moment().valueOf();
                    if (!_.get(clueItem,'customer_traces[0]')) {
                        this.flyClueHastrace(item, DIFFREF.TRACE);
                        clueItem.customer_traces = [
                            {
                                remark: textareVal,
                                user_id: userId,
                                nick_name: userName,
                                add_time: addTime
                            }];
                    } else {
                        //原来有customer_traces这个属性时，数组中除了remark还有别的属性
                        clueItem.customer_traces[0].remark = textareVal;
                        clueItem.customer_traces[0].user_id = userId;
                        clueItem.customer_traces[0].nick_name = userName;
                        clueItem.customer_traces[0].add_time = addTime;
                    }
                    this.setState({
                        submitTraceLoading: false,
                        submitTraceErrMsg: '',
                        isEdittingItem: {},
                    });
                    //如果是待分配或者待跟进状态,需要在列表中删除并且把数字减一
                    setTimeout(() => {
                        clueCustomerAction.afterAddClueTrace(item);
                    },FLOW_FLY_TIME);
                }
            });
        }
    };
    handleCancelBtn = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.foot-text-content'), '取消保存跟进内容');
        this.setState({
            submitTraceErrMsg: '',
            isEdittingItem: {},
            submitContent: ''
        });
    };

    renderEditTraceContent = (salesClueItem) => {
        //点击增加按钮 补充跟进记录
        var hide = () => {
            this.setState({
                submitTraceErrMsg: '',
            });
        };
        let btnSize = !_.get(this.state, 'showFilterList') ? 'default' : 'small';
        return (
            <div className="edit-trace-content">
                {this.state.submitTraceErrMsg ? (
                    <div className="has-error">
                        <AlertTimer
                            time={DELAY_TIME}
                            message={this.state.submitTraceErrMsg}
                            type="error"
                            showIcon
                            onHide={hide}
                        />
                    </div>
                ) : null}
                <TextArea onScroll={event => event.stopPropagation()}
                    ref={changeTextare => this['changeTextare' + salesClueItem.id] = changeTextare}
                    placeholder={Intl.get('sales.home.fill.in.trace.content', '请输入跟进内容')}
                    onChange={this.handleInputChange}
                />
                <div className="save-cancel-btn">
                    <Button type='primary'
                        size={btnSize}
                        onClick={this.handleSubmitContent.bind(this, salesClueItem)}
                        disabled={this.state.submitTraceLoading} data-tracename="保存跟进内容">
                        {Intl.get('common.save', '保存')}
                        {this.state.submitTraceLoading ? <Icon type="loading"/> : null}
                    </Button>
                    <Button className='cancel-btn'
                        size={btnSize}
                        onClick={this.handleCancelBtn}>{Intl.get('common.cancel', '取消')}</Button>
                </div>
            </div>
        );
    };
    renderShowTraceContent = (salesClueItem) => {
        var traceContent = _.trim(_.get(salesClueItem, 'customer_traces[0].remark', ''));//该线索的跟进内容
        var traceAddTime = _.get(salesClueItem, 'customer_traces[0].call_date') || _.get(salesClueItem, 'customer_traces[0].add_time');//跟进时间
        return (
            <div className="foot-text-content" key={salesClueItem.id}>
                {/*有跟进记录*/}
                {traceContent ?
                    <div className="record-trace-container">
                        <ShearContent>
                            <span
                                className="trace-time">{traceAddTime ? moment(traceAddTime).format(oplateConsts.DATE_FORMAT) : ''}</span>
                            <span>
                                {traceContent}
                            </span>
                        </ShearContent>
                    </div>
                    : editCluePrivilege(salesClueItem) ?
                        <span className='add-trace-content handle-btn-item'
                            onClick={this.handleEditTrace.bind(this, salesClueItem)}>{Intl.get('clue.add.trace.content', '添加跟进内容')}</span>
                        : null}

            </div>

        );
    };

    showCustomerDetail = (customerId) => {
        this.setState({
            showCustomerId: customerId
        });
        //触发打开带拨打电话状态的客户详情面板
        phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_PHONE_PANEL, {
            customer_params: {
                currentId: customerId,
                ShowCustomerUserListPanel: this.ShowCustomerUserListPanel,
                hideRightPanel: this.closeRightPanel
            }
        });
    };
    closeRightPanel = () => {
        this.setState({
            showCustomerId: ''
        });
    };
    ShowCustomerUserListPanel = (data) => {
        this.setState({
            isShowCustomerUserListPanel: true,
            customerOfCurUser: data.customerObj
        });

    };
    closeCustomerUserListPanel = () => {
        this.setState({
            isShowCustomerUserListPanel: false,
            customerOfCurUser: {}
        });
    };
    handleClickClueInvalid = (item) => {
        //如果点击标为无效，input聚焦
        this.setState({
            isInvalidClue: item.id,//正在标为无效的线索
            isInvalidateItem: item,
            submitReason: ''
        }, () => {
            if (this['invalidateClueChange' + item.id]) {
                this['invalidateClueChange' + item.id].focus();
            }
        });
    };
    //标记线索有效
    handleClickClueValidBtn = (item, callback) => {
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
                    isInvalidClue: ''
                });
            } else {
                //改为有效，增加到不同的状态上
                switch (item.status){
                    case SELECT_TYPE.WILL_DISTRIBUTE:
                        this.flyClueWilldistribute(item, DIFFREF.TRASFERINVALID);
                        break;
                    case SELECT_TYPE.WILL_TRACE:
                        this.flyClueWilltrace(item, DIFFREF.TRASFERINVALID);
                        break;
                    case SELECT_TYPE.HAS_TRACE:
                        this.flyClueHastrace(item, DIFFREF.TRASFERINVALID);
                        break;
                    case SELECT_TYPE.HAS_TRANSFER:
                        this.flyClueHastransfer(item, DIFFREF.TRASFERINVALID);
                        break;
                }
                setTimeout(() => {
                    _.isFunction(callback) && callback(updateValue);
                    clueCustomerAction.deleteClueById(item);
                    //标记为有效的时候，在其他类型上加上相应的数字
                    clueCustomerAction.updateClueTabNum(item.status);
                },FLOW_FLY_TIME);

                this.setState({
                    isInvaliding: false,
                    isInvalidClue: ''
                });
            }
        });
    };
    renderInavailabilityOrValidClue = (salesClueItem) => {
        return(
            <span className="valid-or-invalid-container">
                {avalibilityCluePrivilege() ? <span className="cancel-invalid" onClick={this.handleClickClueInvalid.bind(this, salesClueItem)}
                    data-tracename="判定线索无效">
                    {editCluePrivilege(salesClueItem) ? <span className="can-edit handle-btn-item">{Intl.get('clue.customer.set.invalid', '标为无效')}</span> : <span className="can-edit handle-btn-item"> {Intl.get('clue.cancel.set.invalid', '改为有效')}</span>}
                </span> : null}
            </span>

        );

    };
    renderAssociatedCustomer = (salesClueItem) => {
        //关联客户
        var associatedCustomer = salesClueItem.customer_name;
        return(
            <div className="avalibility-container">
                {/*是有效线索并且有关联客户*/}
                {associatedCustomer ? (
                    <div className="associate-customer">
                        <CustomerLabel label={salesClueItem.customer_label} />
                        <b className="customer-name" onClick={this.showCustomerDetail.bind(this, salesClueItem.customer_id)} data-tracename="点击查看关联客户详情">{associatedCustomer}</b>
                    </div>
                ) : null}
            </div>
        );
    };

    cancelInvalidClue = () => {
        this.setState({
            isInvalidClue: ''
        });
    };
    //取消无效处理
    handleInvalidateCancelBtn = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.edit-invalid-trace-content'), '取消保存跟进内容');
        this.setState({
            submitInvalidateClueMsg: '',
            isInvalidateItem: {},
            submitReason: '',
            isInvalidClue: ''
        });
    };
    //确认无效输入框改变时数据处理
    handleInvalidateInputChange = (e) => {
        this.setState({
            submitReason: e.target.value
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
                submitInvalidateClueMsg: Intl.get('clue.invalid.reason.not.empty', '无效原因不能为空')
            });
        } else {
            let updateAvailability = AVALIBILITYSTATUS.INAVALIBILITY;
            let updateObj = {
                id: item.id,
                availability: updateAvailability,
                invalid_info: {
                    invalid_reason: _.get(this.state, 'submitReason')
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
                        submitInvalidateClueMsg: result
                    });
                } else {
                    //待我审批状态中没有无效的tab，不展示动画
                    let filterAllotNoTraced = clueFilterStore.getState().filterAllotNoTraced;
                    if(!filterAllotNoTraced) {
                        this.flyClueInvalid(item,DIFFREF.TRASFERINVALID);
                    }
                    this.setState({
                        submitInvalidateLoading: false,
                        isInvalidClue: ''
                    });
                    _.isFunction(callback) && callback(updateAvailability);
                    setTimeout(() => {
                        clueCustomerAction.deleteClueById(item);
                        subtracteGlobalClue(item);
                        clueCustomerAction.updateClueTabNum('invalidClue');
                    },FLOW_FLY_TIME);

                }
            });
        }
    };

    //渲染确认无效输入框
    renderInvalidInput = (salesClueItem) => {
        //点击增加按钮 补充跟进记录
        let hide = () => {
            this.setState({
                submitInvalidateClueMsg: '',
            });
        };
        let invalidBtnSize = !_.get(this.state, 'showFilterList') ? 'default' : 'small';
        return (
            <div className="edit-invalid-trace-content">
                {this.state.submitInvalidateClueMsg ? (
                    <div className="has-error">
                        <AlertTimer
                            time={DELAY_TIME}
                            message={this.state.submitInvalidateClueMsg}
                            type="error"
                            showIcon
                            onHide={hide}
                        />
                    </div>
                ) : null}
                <TextArea ref={invalidateClueChange => this['invalidateClueChange' + salesClueItem.id] = invalidateClueChange}
                    onScroll={event => event.stopPropagation()}
                    placeholder={Intl.get('clue.describe.invalid.reason', '请描述一下无效原因')}
                    onChange={this.handleInvalidateInputChange}
                />
                <div className="save-cancel-btn">
                    <Button type='primary' onClick={this.handleInvalidateBtn.bind(this, salesClueItem)}
                        size={invalidBtnSize}
                        disabled={this.state.submitInvalidateLoading} data-tracename="保存无效原因">
                        {Intl.get('clue.confirm.clue.invalid', '确认无效')}
                        {this.state.submitInvalidateLoading ? <Icon type="loading"/> : null}
                    </Button>
                    <Button className='cancel-btn'
                        size={invalidBtnSize}
                        onClick={this.handleInvalidateCancelBtn}>{Intl.get('common.cancel', '取消')}</Button>
                </div>
            </div>
        );
    }

    //渲染确认有效输入框
    renderValidInput = (salesClueItem) => {
        let isEditting = this.state.isInvalidClue === salesClueItem.id && this.state.isInvaliding;
        return (
            <span className="invalid-confirm">
                <Button className='confirm-btn' disabled={isEditting} type='primary' onClick={this.handleClickClueValidBtn.bind(this, salesClueItem)}>
                    {Intl.get('clue.customer.confirm.valid', '确认有效')}
                    {isEditting ? <Icon type="loading"/> : null}
                </Button>
                <Button onClick={this.cancelInvalidClue}>{Intl.get('common.cancel', '取消')}</Button>
            </span>);
    }
    renderInvalidConfirm = (salesClueItem) => {
        let availability = _.get(salesClueItem,'availability');
        return (_.isEqual(availability, '1') ? this.renderValidInput(salesClueItem) : this.renderInvalidInput(salesClueItem));
    };
    renderAvailabilityClue = (salesClueItem) => {
        //是否有修改线索关联客户的权利
        var associatedPrivilege = transferClueToCustomerIconPrivilege(salesClueItem);
        return(
            <div className="avalibility-container">
                <div className="associate-customer">

                    {associatedPrivilege ? (
                        <span
                            className="can-edit handle-btn-item"
                            style={{marginRight: 15}}
                            onClick={() => { clueToCustomerPanelEmitter.emit(clueToCustomerPanelEmitter.OPEN_PANEL, {clue: salesClueItem, afterConvert: this.afterTransferClueSuccess}); }}
                        >
                            {Intl.get('common.convert.to.customer', '转为客户')}
                        </span> 
                    ) : null}
                    {this.renderInavailabilityOrValidClue(salesClueItem)}
                </div>
            </div>
        );

    };
    handleChangeSelectedType = (selectedType) => {
        //如果选中的是无效状态
        if (selectedType === 'avaibility'){
            clueFilterAction.setFilterClueAvailbility();
        }else{
            clueFilterAction.setFilterType(selectedType);
            clueFilterAction.setFilterType(selectedType);
        }
        this.onTypeChange();
    };
    isFireFoxBrowser = () => {
        return navigator.userAgent.toUpperCase().indexOf('FIREFOX') > -1;
    };
    setInvalidClassName= (record, index) => {
        var cls = '';
        if ((record.id === this.state.currentId) && rightPanelShow){
            cls += ' current-row';
        }
        return cls;
    };
    //删除线索
    deleteClue = (curDeleteClue) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.modal-footer .btn-ok'), '确定删除线索');
        clueCustomerAction.deleteClueById({customer_clue_ids: curDeleteClue.id, clueStatus: curDeleteClue.status}, (errorMsg) => {
            if (errorMsg) {
                message.error(errorMsg);
            } else {
                subtracteGlobalClue(curDeleteClue);
            }
        });
    }
    getClueTypeTab = () => {
        var isFirstLoading = this.isFirstLoading();
        var typeFilter = this.getFilterStatus();//线索类型
        var willDistCls = classNames('clue-status-tab', {'active-tab': SELECT_TYPE.WILL_DISTRIBUTE === typeFilter.status});
        var willTrace = classNames('clue-status-tab', {'active-tab': SELECT_TYPE.WILL_TRACE === typeFilter.status});
        var hasTrace = classNames('clue-status-tab', {'active-tab': SELECT_TYPE.HAS_TRACE === typeFilter.status});
        var hasTransfer = classNames('clue-status-tab', {'active-tab': SELECT_TYPE.HAS_TRANSFER === typeFilter.status});
        var filterStore = clueFilterStore.getState();
        var invalidClue = classNames('clue-status-tab', {'active-tab': filterStore.filterClueAvailability === AVALIBILITYSTATUS.INAVALIBILITY});
        var addNumTab = this.state.addNumTab;
        //加1效果
        var willDistAddCls = classNames('clue-add-num', {'show-add-num': ADD_SELECT_TYPE.WILL_DISTRIBUTE === addNumTab});
        var willTraceAddCls = classNames('clue-add-num', {'show-add-num': ADD_SELECT_TYPE.WILL_TRACE === addNumTab});
        var hasTraceAddCls = classNames('clue-add-num', {'show-add-num': ADD_SELECT_TYPE.HAS_TRACE === addNumTab});
        var hasTransferAddCls = classNames('clue-add-num', {'show-add-num': ADD_SELECT_TYPE.HAS_TRANSFER === addNumTab});
        var invalidClueAddCls = classNames('clue-add-num', {'show-add-num': ADD_SELECT_TYPE.INVALID_CLUE === addNumTab});
        var statics = this.state.agg_list;
        const clueStatusCls = classNames('clue-status-wrap',{
            'show-clue-filter': this.state.showFilterList,
            'firefox-padding': this.isFireFoxBrowser(),
            'firefox-show-filter-padding': this.state.showFilterList && this.isFireFoxBrowser(),
            'status-type-hide': isFirstLoading,
            'has-refresh-tip': _.get(this.state, 'isShowRefreshPrompt')
        });
        //如果选中了待我审批状态，就不展示已转化
        var filterAllotNoTraced = clueFilterStore.getState().filterAllotNoTraced;
        return <span className={clueStatusCls}>
            {isCommonSalesOrPersonnalVersion() ? null : <span className={willDistCls}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.WILL_DISTRIBUTE)}
                title={getCertainTabsTitle(SELECT_TYPE.WILL_DISTRIBUTE)}>{Intl.get('clue.customer.will.distribution', '待分配')}
                <span ref={dom => {this.$willDistribute = dom;}} className="clue-status-num">{_.get(statics, 'willDistribute', 0)}</span>
                <span className={willDistAddCls}> +1 </span>
            </span>}
            <span className={willTrace}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.WILL_TRACE)}
                title={getCertainTabsTitle(SELECT_TYPE.WILL_TRACE)}>{Intl.get('sales.home.will.trace', '待跟进')}
                <span className="clue-status-num" ref={dom => {this.$willTrace = dom;}}>{_.get(statics, 'willTrace', 0)}</span>
                <span className={willTraceAddCls}> +1 </span>
            </span>
            <span className={hasTrace}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.HAS_TRACE)}
                title={getCertainTabsTitle(SELECT_TYPE.HAS_TRACE)}>{Intl.get('clue.customer.has.follow', '已跟进')}
                <span className="clue-status-num" ref={dom => {this.$hasTrace = dom;}}>{_.get(statics, 'hasTrace', 0)}</span>
                <span className={hasTraceAddCls}> +1 </span>
            </span>
            {filterAllotNoTraced || isCommonSalesOrPersonnalVersion() ? null : <span className={hasTransfer}
                onClick={this.handleChangeSelectedType.bind(this, SELECT_TYPE.HAS_TRANSFER)}
                title={getCertainTabsTitle(SELECT_TYPE.HAS_TRANSFER)}>{Intl.get('clue.customer.has.transfer', '已转化')}
                <span className="clue-status-num" ref={dom => {this.$hasTransfer = dom;}} >{_.get(statics, 'hasTransfer', 0)}</span>
                <span className={hasTransferAddCls}> +1 </span>
            </span>}
            {filterAllotNoTraced ? null : <span className={invalidClue}
                onClick={this.handleChangeSelectedType.bind(this, 'avaibility')}
                title={getCertainTabsTitle('invalidClue')}>{Intl.get('sales.clue.is.enable', '无效')}
                <span className="clue-status-num" ref={dom => {this.$invalidClue = dom;}} >{_.get(statics, 'invalidClue', 0)}</span>
                <span className={invalidClueAddCls}> +1 </span>
            </span>}
        </span>;
    };
   showClueDetailPanel = (salesClueItem) => {
       phoneMsgEmitter.emit(phoneMsgEmitter.OPEN_CLUE_PANEL, {
           clue_params: {
               curClue: salesClueItem,
               currentId: salesClueItem.id,
               afterTransferClueSuccess: this.afterTransferClueSuccess,
           }
       });
   };

    getClueTableColunms = () => {
        const column_width = '100px';
        let columns = [
            {
                dataIndex: 'clue_name',
                width: '220px',
                render: (text, salesClueItem, index) => {
                    //有相似线索
                    let hasSimilarClue = _.get(salesClueItem, 'lead_similarity');
                    //有相似客户
                    let hasSimilarClient = _.get(salesClueItem, 'customer_similarity');
                    let availability = _.get(salesClueItem, 'availability');
                    let status = _.get(salesClueItem, 'status');
                    //判断是否为无效客户
                    let isInvalidClients = _.isEqual(availability, '1');
                    // 判断是否为已转化客户
                    let isConvertedClients = _.isEqual(status, '3');
                    // 已转化客户和无效客户，不可以展示“有相似客户”标签
                    let ifShowTags = !isInvalidClients && !isConvertedClients;
                    let userId = userData.getUserData().user_id;
                    //是否展示“新”字图标 如果是今天分配的并且线索负责人就是当前登录人，就展示新的图标
                    var allotTime = _.get(salesClueItem,'allot_time');
                    var isShowNewIcon = allotTime >= moment().startOf('day').valueOf() && allotTime <= moment().endOf('day').valueOf() && _.get(salesClueItem,'user_id') === userId;
                    return (
                        <div className="clue-top-title" id={salesClueItem.id}>
                            <span className="hidden record-id">{salesClueItem.id}</span>
                            <div className="clue-name" data-tracename="查看线索详情"
                                onClick={this.showClueDetailOut.bind(this, salesClueItem)}>
                                <span className="clue-name-item">
                                    {isShowNewIcon ? <i className="icon-new-clue"></i> : null}
                                    {salesClueItem.name}</span>

                                {!isInvalidClients && hasSimilarClue ?
                                    <span className="clue-label intent-tag-style">
                                        {Intl.get('clue.has.similar.clue', '有相似线索')}
                                    </span> : null}
                                {ifShowTags && hasSimilarClient ?
                                    <span className="clue-label intent-tag-style">
                                        {Intl.get('clue.has.similar.customer', '有相似客户')}
                                    </span> : null}
                            </div>
                            <div className="clue-trace-content" key={salesClueItem.id + index}>
                                <ShearContent>
                                    <span>
                                        <span className="clue_source_time">{moment(salesClueItem.source_time).format(oplateConsts.DATE_FORMAT)}&nbsp;</span>
                                        
                                        <span>{salesClueItem.source ? Intl.get('clue.item.acceess.channel', '详情：{content}',{content: salesClueItem.source}) : null}</span>

                                    </span>
                                </ShearContent>
                            </div>
                        </div>
                    );

                }
            },{
                dataIndex: 'contact',
                width: '100px',
                render: (text, salesClueItem, index) => {
                    //联系人的相关信息
                    let contacts = salesClueItem.contacts ? salesClueItem.contacts : [];
                    if (_.isArray(contacts) && contacts.length) {
                        return (
                            <div className="contact-container">
                                {_.map(contacts, (contactItem, idx) => {
                                    var contactName = _.trim(contactItem.name) || '';
                                    var cls = classNames({
                                        'contact-name': contactName
                                    });
                                    return (
                                        <div className="contact-container" key={idx}>
                                            <span
                                                className={cls}
                                                title={contactName}
                                            >
                                                {contactName}
                                            </span>
                                        </div>
                                    );})}
                            </div>

                        );
                    } else {
                        return null;
                    }
                }
            },{
                dataIndex: 'phone',
                width: '200px',
                render: (text, salesClueItem, index) => {
                    //联系人的相关信息
                    let contacts = salesClueItem.contacts ? salesClueItem.contacts : [];
                    if (_.isArray(contacts) && contacts.length){
                        //处理联系方式，处理成只有一种联系方式
                        let handledContactObj = this.handleContactLists(_.cloneDeep(contacts));
                        let hasMoreIconPrivilege = handledContactObj.clipContact;
                        return (
                            <div className="contact-container">
                                <ContactItem
                                    isHideContactName={true}
                                    contacts={handledContactObj.contact}
                                    customerData={salesClueItem}
                                    showContactLabel={false}
                                    hasMoreIcon={hasMoreIconPrivilege}
                                    showClueDetailPanel={this.showClueDetailPanel.bind(this, salesClueItem)}
                                    id={_.get(salesClueItem, 'id', '')}
                                    type='lead'
                                    hidePhoneIcon={!editCluePrivilege(salesClueItem)}
                                />
                                {hasMoreIconPrivilege ? <i className="iconfont icon-more" onClick={this.showClueDetailOut.bind(this, salesClueItem)}/> : null}
                            </div>

                        );
                    }else{
                        return null;
                    }

                }
            },{
                dataIndex: 'trace_person',
                width: column_width,
                render: (text, salesClueItem, index) => {
                    let user = userData.getUserData();
                    var handlePersonName = _.get(salesClueItem,'user_name','');//当前跟进人
                    //分配线索给销售的权限
                    var hasAssignedPrivilege = assignSalesPrivilege(salesClueItem);
                    var assigenCls = classNames('assign-btn',{'can-edit': !handlePersonName});
                    var containerCls = classNames('handle-and-trace',{'assign-privilege handle-btn-item': hasAssignedPrivilege});
                    return (
                        <div className={containerCls} ref={dom => {this[`$origin_${DIFFREF.ASSIGN}_${salesClueItem.id}`] = dom;}}>
                            {/*有分配权限*/}
                            {hasAssignedPrivilege ?
                                <AntcDropdown
                                    datatraceContainer='线索列表分配销售按钮'
                                    ref={changeSale => this['changesale' + salesClueItem.id] = changeSale}
                                    content={<span
                                        data-tracename="点击分配线索客户按钮"
                                        className={assigenCls}> {handlePersonName || Intl.get('clue.customer.distribute', '分配')}</span>}
                                    overlayTitle={Intl.get('user.salesman', '销售人员')}
                                    okTitle={Intl.get('common.confirm', '确认')}
                                    cancelTitle={Intl.get('common.cancel', '取消')}
                                    isSaving={this.state.distributeLoading}
                                    overlayContent={this.renderSalesBlock()}
                                    handleSubmit={this.handleSubmitAssignSales.bind(this, salesClueItem)}
                                    unSelectDataTip={this.state.unSelectDataTip}
                                    clearSelectData={this.clearSelectSales}
                                    btnAtTop={false}
                                /> : handlePersonName
                            }
                        </div>
                    );

                }
            },{
                dataIndex: 'trace_content',
                width: '150px',
                render: (text, salesClueItem, index) => {
                    return(
                        <div className="clue-foot" id="clue-foot" ref={dom => {this[`$origin_${DIFFREF.TRACE}_${salesClueItem.id}`] = dom;}}>
                            {_.get(this,'state.isEdittingItem.id') === salesClueItem.id ? this.renderEditTraceContent(salesClueItem) :
                                this.renderShowTraceContent(salesClueItem)
                            }
                        </div>
                    );

                }
            }];
        columns.push({
            dataIndex: 'assocaite_customer',
            className: 'invalid-td-clue',
            width: '170px',
            render: (text, salesClueItem, index) => {
                return (
                    <div className="avalibity-or-invalid-container" ref={dom => {this[`$origin_${DIFFREF.TRASFERINVALID}_${salesClueItem.id}`] = dom;}}>
                        {salesClueItem.customer_name ? this.renderAssociatedCustomer(salesClueItem) : this.renderHandleAssociateInvalidBtn(salesClueItem)}
                    </div>
                );
            }
        });
        let typeFilter = this.getFilterStatus();//线索类型
        let willTrace = SELECT_TYPE.WILL_TRACE === typeFilter.status;
        let hasTrace = SELECT_TYPE.HAS_TRACE === typeFilter.status;
        let filterStore = clueFilterStore.getState();
        let invalidClue = filterStore.filterClueAvailability === AVALIBILITYSTATUS.INAVALIBILITY;
        //除了运营不能释放线索，管理员、销售，都可以释放
        //待跟进，已跟进，无效线索才可以被释放
        let showRelease = !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) && (willTrace || hasTrace || invalidClue);
        if(showRelease || deleteCluePrivilege()) {
            let releaseTip = releaseClueTip();
            columns.push({
                dataIndex: 'clue_action',
                className: 'action-td-clue',
                width: '80px',
                render: (text, salesClueItem, index) => {
                    return(
                        <React.Fragment>
                            {showRelease ? <div className="release-clue-btn">
                                <Popconfirm placement="topRight" onConfirm={this.releaseClue.bind(this, salesClueItem)}
                                    title={releaseTip}>
                                    <a className='release-customer'
                                        title={Intl.get('crm.customer.release', '释放')}>
                                        <i className="iconfont icon-release handle-btn-item"/>
                                    </a>
                                </Popconfirm>
                            </div> : null}
                            {deleteClueIconPrivilege(salesClueItem) ?
                                <Popconfirm placement="topRight" onConfirm={this.deleteClue.bind(this, salesClueItem)}
                                    title={Intl.get('clue.customer.delete', '删除后无法恢复，您确定要删除吗？')}>
                                    <a className="order-btn-class delete-btn handle-btn-item"
                                        title={Intl.get('common.delete', '删除')} >
                                        <i className="iconfont icon-delete"></i>
                                    </a>
                                </Popconfirm> : null}
                        </React.Fragment>
                    );
                }
            });
        }
        return columns;
    };
    renderHandleAssociateInvalidBtn = (salesClueItem) => {
        //只有不是待跟进状态，才能展示操作区域
        var typeFilter = this.getFilterStatus();//线索类型
        if (typeFilter.status === SELECT_TYPE.WILL_DISTRIBUTE || typeFilter.status === SELECT_TYPE.HAS_TRACE || typeFilter.status === SELECT_TYPE.WILL_TRACE || typeFilter.status === SELECT_TYPE.ALL){
            return _.get(this,'state.isInvalidClue') === salesClueItem.id ? this.renderInvalidConfirm(salesClueItem) : this.renderAvailabilityClue(salesClueItem);
        }else{
            return null;
        }
    };

    //在列表中隐藏当前操作的线索
    hideCurClue = (clue) => {
        const index = _.findIndex(this.state.curClueLists, item => item.id === clue.id);
        
        $('.clue-customer-list .ant-table-body tr:nth-child(' + (index + 1) + ')').slideToggle(2000);
    };
    //转化线索成功后，在相关状态将线索数减一并在待合并统计数据中加一
    changeClueNum = (clue) => {
        clueCustomerAction.afterTranferClueSuccess(clue);
    };
    afterTransferClueSuccess = (clue, callback) => {
        //增加一个动态效果，隐藏该线索
        this.flyClueHastransfer(clue,DIFFREF.TRASFERINVALID);
        setTimeout(() => {
            this.hideCurClue(clue);
            this.changeClueNum(clue);
        }, FLOW_FLY_TIME,() => {
            _.isFunction(callback) && callback();
        });
    };
    afterMergeUpdateClueProperty = (customerId,customerName) => {
        //如果是打开右侧详情，需要改一下详情的状态和关联的客户
        clueCustomerAction.afterEditCustomerDetail({status: SELECT_TYPE.HAS_TRANSFER,customer_name: customerName, customer_id: customerId});
        this.renderClueDetail();
    };
    editCluePrivilege = () => {
        var filterStoreData = clueFilterStore.getState();
        var typeFilter = this.getFilterStatus();//线索类型
        return typeFilter.status !== SELECT_TYPE.HAS_TRANSFER && filterStoreData.filterClueAvailability === AVALIBILITYSTATUS.AVALIBILITY;
    };
    getRowSelection = () => {
        //只有有批量变更权限并且不是普通销售的时候，才展示选择框的处理
        let showSelectionFlag = (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_SELF) || hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_ALL) && !userData.getUserData().isCommonSales);
        //待跟进，已跟进，无效可以有批量释放,可以展示选择框
        let typeFilter = this.getFilterStatus();//线索类型
        let willTrace = SELECT_TYPE.WILL_TRACE === typeFilter.status;
        let hasTrace = SELECT_TYPE.HAS_TRACE === typeFilter.status;
        let filterStore = clueFilterStore.getState();
        let invalidClue = filterStore.filterClueAvailability === AVALIBILITYSTATUS.INAVALIBILITY;
        let tags = !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON) && (willTrace || hasTrace || invalidClue);
        if ((showSelectionFlag && this.editCluePrivilege()) || tags){
            let rowSelection = {
                type: 'checkbox',
                selectedRowKeys: _.map(this.state.selectedClues, 'id'),
                onSelect: (record, selected, selectedRows) => {
                    if (selectedRows.length !== _.get(this, 'state.curClueLists.length')) {
                        this.state.selectAllMatched = false;
                    }
                    this.setState({
                        selectedClues: selectedRows,
                        selectAllMatched: this.state.selectAllMatched
                    });
                    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中某个线索');
                },
                //对客户列表当前页进行全选或取消全选操作时触发
                onSelectAll: (selected, selectedRows, changeRows) => {
                    if (this.state.selectAllMatched && selectedRows.length === 0) {
                        this.state.selectAllMatched = false;
                    }
                    this.setState({selectedClues: selectedRows, selectAllMatched: this.state.selectAllMatched});
                    Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-selection-column'), '点击选中/取消选中全部线索');
                }
            };
            return rowSelection;
        }else{
            return null;
        }
    };
    onPageChange = (page) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.antc-table .ant-table-wrapper'), '翻页至第' + page + '页');
        if (page === this.state.pageNum) {
            return;
        } else {
            let selectedCustomer = this.state.selectedCustomer;
            //不是全选时，清空翻页前选择的客户
            if (_.isArray(selectedCustomer) && selectedCustomer.length && !this.state.selectAllMatched) {
                this.state.selectedCustomer = [];
                this.setState({ selectedCustomer: [] });
            }
            //设置要跳转到的页码数值
            clueCustomerAction.setPageNum(page);
            setTimeout(() => {
                this.getClueList();
            });
        }
    };
    renderClueCustomerLists = () => {
        var customerList = this.state.curClueLists;
        var rowSelection = this.getRowSelection();
        function rowKey(record, index) {
            return record.id;
        }
        return (
            <AntcTable
                loading={this.state.isLoading}
                rowSelection={rowSelection}
                rowKey={rowKey}
                dataSource={customerList}
                columns={this.getClueTableColunms()}
                rowClassName={this.setInvalidClassName}
                scroll={{y: getTableContainerHeight() - LAYOUT_CONSTANTS.TH_MORE_HEIGHT}}
                // locale={{
                //     emptyText: !this.state.isLoading ? (this.state.getErrMsg ? this.state.getErrMsg : Intl.get('common.no.more.filter.crm', '没有符合条件的客户')) : ''
                // }}
                pagination={{
                    total: this.state.customersSize,
                    showTotal: total => {
                        return Intl.get('clue.list.total.num', '共{num}个线索', { num: total });
                    },
                    pageSize: this.state.pageSize,
                    onChange: this.onPageChange,
                    current: this.state.pageNum
                }}
            />);

    };

    clearSelectSales = () => {
        clueCustomerAction.setSalesMan({'salesMan': ''});
        clueCustomerAction.setSalesManName({'salesManNames': ''});
    };
    getSalesDataList = () => {
        var clueSalesIdList = getClueSalesList();
        let salesManList = this.state.salesManList;
        //销售领导、域管理员,展示其所有（子）团队的成员列表
        let dataList = _.map(formatSalesmanList(salesManList),salesman => {
            let clickCount = getLocalSalesClickCount(clueSalesIdList, _.get(salesman,'value'));
            return {
                ...salesman,
                clickCount
            };
        });
        return dataList;
    };
    renderSalesBlock = () => {
        var dataList = this.getSalesDataList();
        //按点击的次数进行排序
        dataList = _.sortBy(dataList,(item) => {return -item.clickCount;});
        //主管分配线索时，负责人是自己的不能分配给自己
        let userList = _.cloneDeep(dataList);
        userList = _.filter(userList, user => !_.includes(_.get(user, 'value'), userData.getUserData().user_id));
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('sales.team.search', '搜索')}
                    value={this.state.salesMan}
                    onChange={this.onSalesmanChange}
                    getSelectContent={this.setSelectContent}
                    notFoundContent={dataList.length ? Intl.get('crm.29', '暂无销售') : Intl.get('crm.30', '无相关销售')}
                    dataList={userList}
                />
            </div>
        );
    };
    //批量修改或者单个修改线索的跟进人，发请求前的处理
    handleBeforeSumitChangeSales = (itemId) => {
        if (!this.state.salesMan) {
            clueCustomerAction.setUnSelectDataTip(Intl.get('crm.17', '请选择销售人员'));
        } else {
            let sale_id = '', team_id = '', sale_name = '', team_name = '';
            //销售id和所属团队的id 中间是用&&连接的  格式为销售id&&所属团队的id
            let idArray = this.state.salesMan.split('&&');
            if (_.isArray(idArray) && idArray.length) {
                sale_id = idArray[0];//销售的id
                team_id = idArray[1] || '';//团队的id
            }
            //销售的名字和团队的名字 格式是 销售名称 -团队名称
            let nameArray = this.state.salesManNames.split('-');
            if (_.isArray(nameArray) && nameArray.length) {
                sale_name = nameArray[0];//销售的名字
                team_name = _.trim(nameArray[1]) || '';//团队的名字
            }
            var submitObj = {
                'sale_id': sale_id,
                'sale_name': sale_name,
                'team_id': team_id,
                'team_name': team_name,
            };
            if (itemId){
                submitObj.customer_id = itemId;
            }
            return submitObj;
        }
    };
    //当前选中状态是待分配
    isWillDistributeStatusTabActive = () => {
        var clueCustomerTypeFilter = this.getFilterStatus();
        return clueCustomerTypeFilter.status === SELECT_TYPE.WILL_DISTRIBUTE;
    }
    //当前选中的状态是待跟进
    isWillTraceStatusTabActive = () => {
        var clueCustomerTypeFilter = this.getFilterStatus();
        return clueCustomerTypeFilter.status === SELECT_TYPE.WILL_TRACE;
    }
    //单个及批量修改跟进人完成后的处理
    afterHandleAssignSalesBatch = (feedbackObj,submitObj,item) => {
        let clue_id = _.get(submitObj,'customer_id','');//线索的id，可能是一个，也可能是多个
        //在从AntcDropDown选择完销售人员时，salesMan会被清空，这里需要克隆储存
        let salesMan = _.cloneDeep(this.state.salesMan);
        if (feedbackObj && feedbackObj.errorMsg) {
            message.error(feedbackObj.errorMsg || Intl.get('failed.to.distribute.cluecustomer', '分配线索客户失败'));
        } else {
            //如果是待分配状态，分配完之后要在列表中删除一个,在待跟进列表中增加一个
            var isWillDistribute = this.isWillDistributeStatusTabActive();
            if (item){
                //有item的是单个修改跟进人
                clueCustomerAction.updateClueItemAfterAssign({item: item,submitObj: submitObj,isWillDistribute: isWillDistribute});
                subtracteGlobalClue(item);
                if (this['changesale' + clue_id]) {
                    //隐藏批量变更销售面板
                    this['changesale' + clue_id].handleCancel();
                }
                if(isWillDistribute){
                    //增加动态效果
                    this.flyClueWilltrace(item,DIFFREF.ASSIGN);
                    setTimeout(() => {
                        clueCustomerAction.afterAssignSales(clue_id);
                    }, FLOW_FLY_TIME);
                }
                SetLocalSalesClickCount(salesMan);
            }else{
                //这个是批量修改联系人
                if (this.refs.changesales) {
                    //隐藏批量变更销售面板
                    this.refs.changesales.handleCancel();
                }
                var taskId = _.get(feedbackObj, 'taskId','');
                if (taskId){
                    //向任务列表id中添加taskId
                    batchOperate.addTaskIdToList(taskId);
                    //存储批量操作参数，后续更新时使用
                    var batchParams = _.cloneDeep(submitObj);
                    batchParams.isWillDistribute = isWillDistribute;
                    batchOperate.saveTaskParamByTaskId(taskId, batchParams, {
                        showPop: true,
                        urlPath: '/leads'
                    });
                    //立即在界面上显示推送通知
                    //界面上立即显示一个初始化推送
                    //批量操作参数
                    let is_select_all = !!this.state.selectAllMatched;
                    var totalSelectedSize = is_select_all ? this.state.customersSize : _.get(this,'state.selectedClues.length',0);
                    batchOperate.batchOperateListener({
                        taskId: taskId,
                        total: totalSelectedSize,
                        running: totalSelectedSize,
                        typeText: Intl.get('clue.batch.change.trace.man', '变更跟进人')
                    });
                    subtracteGlobalClue({id: clue_id});
                    if (isWillDistribute) {
                        clueCustomerAction.afterAssignSales(clue_id);
                    }
                }
                SetLocalSalesClickCount(this.state.batchSelectedSales);
            }
            this.setState({
                curClueLists: this.state.curClueLists
            });

        }
    };
    //批量修改跟进人
    handleSubmitAssignSalesBatch = () => {
        //如果是选了修改全部
        var selectedClueIds = '', selectClueAll = this.state.selectAllMatched;
        if (!selectClueAll){
            var cluesArr = _.map(this.state.selectedClues, item => item.id);
            selectedClueIds = cluesArr.join(',');
        }
        var submitObj = this.handleBeforeSumitChangeSales(selectedClueIds);
        if (selectClueAll){
            submitObj.query_param = {...this.state.queryObj};
        }
        //在从AntcDropDown选择完销售人员时，salesMan会被清空，这里需要克隆储存
        let batchSelectedSales = _.cloneDeep(this.state.salesMan);
        this.setState({
            batchSelectedSales
        });
        if (_.isEmpty(submitObj)){
            return;
        }else{
            clueCustomerAction.distributeCluecustomerToSaleBatch(_.cloneDeep(submitObj), (feedbackObj) => {
                this.afterHandleAssignSalesBatch(feedbackObj,submitObj);
            });
        }
    };
    //修改跟进人
    handleSubmitAssignSales = (item) => {
        var submitObj = this.handleBeforeSumitChangeSales(item.id);
        if (_.isEmpty(submitObj)){
            return;
        }else{
            clueCustomerAction.distributeCluecustomerToSale(_.cloneDeep(submitObj), (feedbackObj) => {

                this.afterHandleAssignSalesBatch(feedbackObj,submitObj,item);
            });
        }
    };

    //获取已选销售的id
    onSalesmanChange = (salesMan) => {
        clueCustomerAction.setSalesMan({'salesMan': salesMan});
    };

    //设置已选销售的名字
    setSelectContent = (salesManNames) => {
        clueCustomerAction.setSalesManName({'salesManNames': salesManNames});
    };

    renderClueCustomerBlock = () => {
        if (this.state.curClueLists.length) {
            return (
                <div id="clue-content-block" className="clue-content-block" ref="clueCustomerList">
                    <div className="clue-customer-list" id="area">
                        {this.renderClueCustomerLists()}
                    </div>
                </div>
            );
        }else{
            return null;
        }
    };
    onTypeChange = () => {
        clueCustomerAction.setClueInitialData();
        rightPanelShow = false;
        this.setState({rightPanelIsShow: false});
        setTimeout(() => {
            this.getClueList();
        });
    };
    renderAddDataContent = () => {
        if (addCluePrivilege()) {
            return (
                <div className="btn-containers">
                    <div>
                        <Button type='primary' className='add-clue-btn' onClick={this.showClueAddForm}>{Intl.get('crm.sales.add.clue', '添加线索')}</Button>
                    </div>
                    <div>
                        {Intl.get('no.data.add.import.tip', '向客套中添加{type}',{type: Intl.get('crm.sales.clue', '线索')})}
                    </div>
                </div>
            );
        } else {
            return null;
        }
    };
    renderImportDataContent = () => {
        if (addCluePrivilege()) {
            return (
                <div className="btn-containers">
                    <div>
                        <Button className='import-btn' onClick={this.showImportClueTemplate}>{Intl.get('clue.manage.import.clue', '导入{type}',{type: Intl.get('crm.sales.clue', '线索')})}</Button>
                    </div>
                    <div>
                        {Intl.get('import.excel.data.ketao', '将excel中的{type}导入到客套中',{type: Intl.get('crm.sales.clue', '线索')})}
                    </div>

                </div>
            );
        } else {
            return null;
        }
    };
    renderNotFoundClue = () => {
        const isShowCluepoolTip = _.get(this.state, 'keyword', '')//搜索线索名称时
            && !_.get(this.state, 'allClueCount', 0)//未查到线索
            && !_.get(this.state, 'selectedCustomer.length', 0);//以及没有选中线索的情况下，才显示是否去线索池中查询
        if (isShowCluepoolTip) {
            return (
                <div>
                    <ReactIntl.FormattedMessage
                        id="clue.search.no.found"
                        defaultMessage={'没有符合条件的线索，您可以去{cluepool}查看是否有该线索'}
                        values={{
                            'cluepool': <a
                                style={{textDecoration: 'underline'}}
                                onClick={this.handleClickCluePool.bind(this)}>
                                {Intl.get('clue.pool', '线索池')}</a>
                        }}
                    />
                </div>
            );
        }else {
            return Intl.get('clue.no.data.during.range.and.status', '没有符合条件的线索');
        }
    };
    handleClickCluePool = () => {
        var cluePoolCondition = this.state.cluePoolCondition;
        cluePoolCondition.name = this.state.keyword;
        this.setState({
            cluePoolCondition
        },() => {
            this.showExtractCluePanel();
        });
    };

    //渲染loading和出错的情况
    renderLoadingAndErrAndNodataContent = () => {
        //加载中的展示
        if (this.state.isLoading) {
            return (
                <div className="load-content">
                    <Spinner />
                    <p className="abnornal-status-tip">{Intl.get('common.sales.frontpage.loading', '加载中')}</p>
                </div>
            );
        } else if (this.state.clueCustomerErrMsg) {
            //加载完出错的展示
            return (
                <div className="err-content">
                    <i className="iconfont icon-data-error"></i>
                    <p className="abnornal-status-tip">{this.state.clueCustomerErrMsg}</p>
                </div>
            );
        }
        else if (!this.state.isLoading && !this.state.clueCustomerErrMsg && !this.state.curClueLists.length) {
            //总的线索不存在并且没有筛选条件时
            var showAddBtn = !this.state.allClueCount && this.hasNoFilterCondition() && addCluePrivilege();
            return (
                <NoDataAddAndImportIntro
                    renderOtherOperation={this.renderOtherOperation}
                    renderAddDataContent={this.renderAddDataContent}
                    renderImportDataContent={this.renderImportDataContent}
                    showAddBtn={showAddBtn}
                    noDataTip={this.hasNoFilterCondition() ? Intl.get('clue.no.data', '暂无线索信息') : this.renderNotFoundClue()}
                />
            );
        }
        else {
            //渲染线索列表
            return this.renderClueCustomerBlock();
        }
    };
    renderOtherOperation = () => {
        return (
            <div className="intro-recommend-list">
                <ReactIntl.FormattedMessage
                    id="import.excel.no.data"
                    defaultMessage={'试下客套给您{recommend}的功能'}
                    values={{
                        'recommend': <a onClick={this.showClueRecommendTemplate} data-tracename="点击推荐线索">
                            {Intl.get('import.recommend.clue.lists', '推荐线索')}
                        </a>
                    }}/>
            </div>
        );
    };

    //点击展开线索分析面板
    handleClueAnalysisPanel = () => {
        this.setState({
            clueAnalysisPanelShow: true
        });
    };

    //点击关闭线索分析面板
    closeClueAnalysisPanel = () => {
        this.setState({
            clueAnalysisPanelShow: false
        });
    };

    renderClueAnalysisBtn = () => {
        return (
            <div className="clue-analysis-btn-container pull-right">
                <Button className="call-analysis-btn btn-item" title={Intl.get('clue.alanalysis.charts','线索分析')} onClick={this.handleClueAnalysisPanel}
                    data-tracename="点击线索分析按钮">
                    {Intl.get('user.detail.analysis', '分析')}
                </Button>
            </div>
        );
    };
    searchFullTextEvent = (keyword) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.search-container'), '根据关键字搜索');
        //如果keyword存在，就用全文搜索的接口
        clueCustomerAction.setKeyWord(_.trim(keyword));
        //如果keyword不存在，就用获取线索的接口
        this.onTypeChange();
    };

    //更新线索来源列表
    updateClueSource = (newSource) => {
        this.state.clueSourceArray.push(newSource);
        this.setState({
            clueSourceArray: this.state.clueSourceArray
        });
    };

    //更新线索渠道列表
    updateClueChannel = (newChannel) => {
        this.state.accessChannelArray.push(newChannel);
        this.setState({
            accessChannelArray: this.state.accessChannelArray
        });
    };

    //更新线索分类
    updateClueClassify = (newClue) => {
        this.state.clueClassifyArray.push(newClue);
        this.setState({
            clueClassifyArray: this.state.clueClassifyArray
        });
    };

    //是否是运营人员
    isOperation = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    };

    //是否是管理员
    isRealmManager = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN);
    };

    toggleList = () => {
        clueCustomerAction.changeFilterFlag(!this.state.showFilterList);
    };
    onExportRangeChange = (e) => {
        this.setState({
            exportRange: e.target.value
        });
    };
    doImportAjax = (successCallback,errCallback) => {
        $.ajax({
            url: '/rest/clue/confirm/upload/' + true,
            dataType: 'json',
            type: 'get',
            async: false,
            success: (data) => {
                this.getClueList();
                _.isFunction(successCallback) && successCallback();
            },
            error: (errorMsg) => {
                _.isFunction(errCallback) && errCallback(errorMsg);
            }
        });
    };
    //删除重复的线索
    deleteDuplicatImportClue = (index) => {
        var _this = this;
        $.ajax({
            url: '/rest/clue/repeat/delete/' + index,
            dataType: 'json',
            type: 'delete',
            success: function(result) {
                if (result && result.result === 'success') {
                    var previewList = _this.state.previewList;
                    previewList.splice(index, 1);
                    _this.setState({
                        previewList: previewList
                    });
                } else {
                    message.error(Intl.get('clue.delete.duplicate.failed', '删除重复线索失败'));
                }
            },
            error: function(errorMsg) {
                message.error(Intl.get('clue.delete.duplicate.failed', '删除重复线索失败') || errorMsg);
            }
        });
    };
    //是否包含此项内容
    isIncludesItem(list, item) {
        return !_.isEmpty(list) && _.includes(list, item);
    }
    getCluePrevList = () => {
        var _this = this;
        var requiredText = <span className='repeat-item-name' title={Intl.get('crm.import.required', '必填项，不能为空')}>
            {Intl.get('apply.components.required.item', '必填')}
        </span>;
        let previewColumns = [
            {
                title: Intl.get('clue.analysis.consult.time', '咨询时间'),
                dataIndex: 'source_time',
                render: function(text, record) {
                    if (text) {
                        return (
                            <span>{record.source_time ? moment(record.source_time).format(oplateConsts.DATE_FORMAT) : null}</span>
                        );
                    }else{
                        return requiredText;
                    }
                }
            },
            {
                title: Intl.get('clue.customer.clue.name', '线索名称'),
                dataIndex: 'name',
                render: function(text, record, index) {
                    if (text) {
                        //线索名不符合验证规则
                        let name_verify = _.get(record, 'errors.name_verify');
                        //导入的数据中存在同名线索
                        let import_name_repeat = _.get(record, 'errors.import_name_repeat');
                        //系统中存在同名线索
                        let name_repeat = _.get(record, 'errors.name_repeat');
                        let cls = classNames({
                            'repeat-item-name': name_verify || import_name_repeat || name_repeat
                        });
                        let title = '';
                        if (name_verify) {
                            title = Intl.get('clue.name.rule', '线索名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号，且长度在1到50（包括50）之间');
                        } else if (import_name_repeat) {
                            title = Intl.get('crm.import.name.repeat', '导入数据中存在同名{type}',{type: Intl.get('crm.sales.clue', '线索')});
                        } else if (name_repeat) {
                            title = Intl.get('crm.system.name.repeat', '系统中已存在同名{type}',{type: Intl.get('crm.sales.clue', '线索')});
                        }
                        return (<span className={cls} title={title}>{text}</span>);
                    } else {//必填
                        return requiredText;
                    }
                }
            },
            {
                title: Intl.get('call.record.contacts', '联系人'),
                render: function(text, record, index) {
                    if (_.isArray(record.contacts)) {
                        return (
                            <span>{record.contacts[0] ? record.contacts[0].name : null}</span>
                        );
                    }
                }
            },
            {
                title: Intl.get('common.phone', '电话'),
                render: (text, record, index) => {
                    if (text && _.isArray(_.get(record, 'contacts[0].phone'))) {
                        return _.map(_.get(record, 'contacts[0].phone'), (item, index) => {
                            //电话规则不匹配的电话列表
                            let phone_verify_list = _.get(record, 'errors.phone_verify');
                            //导入的列表中存在相同的电话的电话列表
                            let import_phone_repeat_list = _.get(record, 'errors.import_phone_repeat');
                            //系统中存在相同电话的电话列表
                            let phone_repeat_list = _.get(record, 'errors.phone_repeat_list');
                            let cls = '';
                            let title = '';
                            //电话规则不匹配
                            if (this.isIncludesItem(phone_verify_list, item)) {
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('crm.import.phone.verify', '电话只能是11位手机号或11-12位带区号的座机号');
                            } else if (this.isIncludesItem(import_phone_repeat_list, item)) {
                                //导入的列表中存在相同的电话
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('crm.import.phone.repeat', '导入数据中存在相同的电话');
                            } else if (this.isIncludesItem(phone_repeat_list, item)) {
                                //系统中存在同名客户
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('crm.system.phone.repeat', '电话已被其他{type}使用',{type: Intl.get('crm.sales.clue', '线索')});
                            }
                            return (<div className={cls} title={title} key={index}>{item}</div>);
                        });
                    }else{
                        return requiredText;
                    }
                }
            },
            {
                title: 'QQ',
                render: function(text, record, index) {
                    if (_.isArray(_.get(record, 'contacts[0].qq'))) {
                        return _.map(_.get(record, 'contacts[0].qq'), (item, index) => {
                            //电话规则不匹配的电话列表
                            let qq_verify_list = _.get(record, 'errors.QQ_verify');
                            let cls = '';
                            let title = '';
                            //电话规则不匹配
                            if (qq_verify_list) {
                                cls = classNames({'repeat-item-name': true});
                                title = Intl.get('common.correct.qq', '请输入正确的QQ号');
                            }
                            return (<div className={cls} title={title} key={index}>{item}</div>);
                        });
                    }
                }
            }, {
                title: Intl.get('crm.clue.client.source', '获客方式'),
                render: function(text, record, index) {
                    let type = _.get(record, 'source_classify');
                    let displayObj = _.find(sourceClassifyArray, item => _.isEqual(item.value, type));
                    return _.get(displayObj, 'name', '');
                }
            }, {
                title: Intl.get('clue.analysis.source', '来源'),
                dataIndex: 'clue_source',
            }, {
                title: Intl.get('crm.sales.clue.access.channel', '接入渠道'),
                dataIndex: 'access_channel',
            }, {
                title: Intl.get('crm.sales.clue.descr', '线索描述'),
                dataIndex: 'source',
            }, {
                title: 'IP',
                dataIndex: 'source_ip',
            }, {
                title: Intl.get('common.operate', '操作'),
                width: '60px',
                render: (text, record, index) => {
                    return (
                        <span className="cus-op">
                            <i className="order-btn-class iconfont icon-delete handle-btn-item "
                                onClick={_this.deleteDuplicatImportClue.bind(_this, index)}
                                data-tracename="删除重复线索"
                                title={Intl.get('common.delete', '删除')}/>

                        </span>
                    );
                }
            }
        ];
        return previewColumns;
    };
    selectAllSearchResult = () => {
        this.setState({
            selectedClues: this.state.curClueLists.slice(),
            selectAllMatched: true,
        });
    };
    clearSelectAllSearchResult = () => {
        this.setState({
            selectedClues: [],
            selectAllMatched: false,
        }, () => {
            $('th.ant-table-selection-column input').click();
        });
    };

    renderSelectClueTips = () => {
        //选择全部选项后，展示：已选择全部xxx项，<a>只选当前项</a>
        if (this.state.selectAllMatched) {
            return (
                <span>
                    {Intl.get('crm.8', '已选择全部{count}项', { count: this.state.customersSize })}
                    <a href="javascript:void(0)"
                        onClick={this.clearSelectAllSearchResult}>{Intl.get('crm.10', '只选当前展示项')}</a>
                </span>);
        } else {//只选择了当前页时，展示：已选当前页xxx项, <a>选择全部xxx项</a>
            return (
                <span>
                    {Intl.get('crm.11', '已选当前页{count}项', { count: _.get(this, 'state.selectedClues.length') })}
                    {/*在筛选条件下可 全选 ，没有筛选条件时，后端接口不支持选 全选*/}
                    {/*如果一页可以展示全，不再展示选择全部的提示*/}
                    {this.state.customersSize <= this.state.pageSize ? null : (
                        <a href="javascript:void(0)" onClick={this.selectAllSearchResult}>
                            {Intl.get('crm.12', '选择全部{count}项', { count: this.state.customersSize })}
                        </a>)
                    }
                </span>);
        }
    };
    //批量释放到线索池-emitter
    batchReleaseLead = (taskInfo, taskParams) => {
        //如果参数不合法，不进行更新
        if (!_.isObject(taskInfo) || !_.isObject(taskParams)) {
            return;
        }
        //解析tasks
        let {
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
        var curClueLists = this.state.curClueLists;
        var clueArr = _.map(tasks, 'taskDefine');
        //遍历每一个线索
        _.each(clueArr, (clueId) => {
            //如果当前线索是需要更新的线索，才更新
            var target = _.find(curClueLists, item => item.id === clueId);
            if (target) {
                clueCustomerAction.updateClueItemAfterAssign({
                    item: target,
                    submitObj: taskParams
                });
            }
        });
        _.each(tasks, task => {
            clueCustomerAction.afterReleaseClue(task.taskDefine);
        });
        //当最后一个推送完成后
        if(_.isEqual(taskInfo.running, 0)) {
            //批量操作删除之后，
            // 1.如果全部删除，因为tab的数据对不上
            // 2.如果删除的数据小于二十个，当前页面的数据并不能补充展示
            //刷新重新获取列表
            //做1s延迟为了跟数据库同步
            setTimeout(() => {
                this.getClueList();
            },1000);
            this.setState({
                selectedClues: []
            });
        }
    };

    //批量释放到线索池
    batchReleaseClue = () => {
        if(this.state.isReleasingClue) {
            return;
        }
        let condition = {
        };
        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户释放
        if (this.state.selectAllMatched) {
            let queryObj = this.getClueSearchCondition();
            condition.query_param = queryObj.bodyParam;
            let filterStoreData = clueFilterStore.getState();
            let filterAllotNoTraced = filterStoreData.filterAllotNoTraced;//待我处理的线索
            if (filterAllotNoTraced) {
                //获取有待我处理条件的线索
                condition.self_no_traced = true;
            }

        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            let clueIds = _.map(this.state.selectedClues, 'id').join(',');
            condition.customer_ids = clueIds;
        }
        this.setState({isReleasingClue: true});
        clueCustomerAction.batchReleaseClue(condition, (data) => {
            let batch_label = _.get(data,'batch_label');
            //lead_batch_release
            this.setState({isReleasingClue: false});
            //批量操作参数
            let is_select_all = this.state.selectAllMatched;
            //全部记录的个数
            let totalSelectedSize = is_select_all ? this.state.customersSize : this.state.selectedClues.length;
            //构造批量操作参数
            let batchParams = {};
            //向任务列表id中添加taskId
            batchOperate.addTaskIdToList(batch_label);
            //存储批量操作参数，后续更新时使用
            batchOperate.saveTaskParamByTaskId(batch_label, batchParams, {
                showPop: true,
                urlPath: '/leads'
            });
            //立即在界面上显示推送通知
            //界面上立即显示一个初始化推送
            batchOperate.batchOperateListener({
                taskId: batch_label,
                total: totalSelectedSize,
                running: totalSelectedSize,
                typeText: Intl.get('clue.release','释放线索',)
            });
        }, (errorMsg) => {
            this.setState({isReleasingCustomer: false});
            message.error(errorMsg);
        });
    };

    //释放单个线索
    releaseClue = (clue) => {
        if(this.state.isReleasingCustomer) return;
        this.setState({isReleasingCustomer: true});
        clueCustomerAction.releaseClue(clue.id, () => {
            this.setState({isReleasingCustomer: false});
            clueCustomerAction.afterReleaseClue(clue.id);
            subtracteGlobalClue(clue);
        }, errorMsg => {
            this.setState({isReleasingCustomer: false});
            message.error(errorMsg);
        });
    };

    //渲染批量操作按钮
    renderBatchChangeClues = () => {
        //只有有批量变更权限并且不是普通销售的时候，才展示批量分配
        let showBatchChange = ((hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_ALL) || hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_UPDATE_SELF)) && !isCommonSalesOrPersonnalVersion()) && this.editCluePrivilege();
        let filterClueStatus = clueFilterStore.getState().filterClueStatus;
        let curStatus = getClueStatusValue(filterClueStatus);
        //除了运营不能释放线索，管理员、销售都可以释放
        let roleRule = !userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
        let filterStore = clueFilterStore.getState();
        //只有待跟进和已跟进和无效tab才有批量操作
        let batchRule = _.isEqual(curStatus.status, SELECT_TYPE.WILL_TRACE) || _.isEqual(curStatus.status, SELECT_TYPE.HAS_TRACE) || _.isEqual(filterStore.filterClueAvailability, AVALIBILITYSTATUS.INAVALIBILITY);
        let {isWebMin} = isResponsiveDisplay();
        let assignCls = classNames('pull-right', {
            'responsive-mini-btn': isWebMin
        });
        let releaseTip = releaseClueTip();
        return (
            <div className="pull-right">
                {this.renderExportClue()}
                <div className={assignCls}>
                    {showBatchChange ?
                        <AntcDropdown
                            ref='changesales'
                            datatraceContainer='线索列表批量分配销售按钮'
                            content={<Button type="primary"
                                title={Intl.get('clue.batch.assign.sales', '批量分配')}
                                className='btn-item'>
                                { isWebMin ? <span className="iconfont icon-assign"></span> :
                                    <React.Fragment>
                                        <span className="iconfont icon-assign"></span>
                                        {Intl.get('clue.batch.assign.sales', '批量分配')}
                                    </React.Fragment>}
                            </Button>}
                            overlayTitle={Intl.get('user.salesman', '销售人员')}
                            okTitle={Intl.get('common.confirm', '确认')}
                            cancelTitle={Intl.get('common.cancel', '取消')}
                            isSaving={this.state.distributeBatchLoading}
                            overlayContent={this.renderSalesBlock()}
                            handleSubmit={this.handleSubmitAssignSalesBatch}
                            unSelectDataTip={this.state.unSelectDataTip}
                            clearSelectData={this.clearSelectSales}
                            btnAtTop={false}
                        /> : null}
                    {
                        roleRule && batchRule ? (
                            <Popconfirm placement="bottomRight" onConfirm={this.batchReleaseClue}
                                title={releaseTip}>
                                <Button data-tracename="点击批量释放线索按钮"
                                    className='btn-item handle-btn-item'
                                    title={Intl.get('clue.customer.release.pool', '释放到线索池')}>
                                    { isWebMin ? <span className="iconfont icon-release"></span> :
                                        <React.Fragment>
                                            <span className="iconfont icon-release"></span>
                                            {Intl.get('clue.customer.batch.release', '批量释放')}
                                        </React.Fragment>
                                    }
                                </Button>
                            </Popconfirm>
                        ) : null}
                </div>
            </div>
        );
    };
    //是否有选中的线索
    hasSelectedClues = () => {
        return _.get(this, 'state.selectedClues.length');
    };
    updateCustomerLastContact = (traceObj) => {
        //如果是待分配或者待跟进状态写了跟进记录，要加个动态效果把线索移到已跟进中去
        if(this.isWillDistributeStatusTabActive() || this.isWillTraceStatusTabActive()){
            this.flyClueHastrace(this.state.curClue,DIFFREF.TRACE);
            setTimeout(() => {
                clueCustomerAction.afterAddClueTrace(this.state.curClue);
                clueCustomerAction.updateCustomerLastContact(traceObj);
            },FLOW_FLY_TIME);
        }else{
            clueCustomerAction.updateCustomerLastContact(traceObj);
        }

    };
    handleMenuSelectClick = (e) => {
        if(e.key === 'add') {
            this.setState({
                addType: e.key,//手动添加
                clueAddFormShow: true
            });
        }else if(e.key === 'import') {
            this.setState({
                addType: e.key,
                clueImportTemplateFormShow: true
            });
        } else if(e.key === 'export') {
            this.showExportClueModal();
        } else if(e.key === 'clue_pool') {
            this.showExtractCluePanel();
        } else if(e.key === 'recommend') {
            this.showClueRecommendTemplate();
        }
    }
    topBarDropList = (isWebMin) => {
        return (<Menu onClick={this.handleMenuSelectClick.bind(this)}>
            {isWebMin && addCluePrivilege() ?
                <Menu.Item key="add" >
                    {Intl.get('crm.sales.manual_add.clue','手动添加')}
                </Menu.Item>
                : null}
            {isWebMin && addCluePrivilege() ?
                <Menu.Item key="import" >
                    {Intl.get('crm.sales.manual.import.clue','导入线索')}
                </Menu.Item>
                : null}
            <Menu.Item key="export" >
                {Intl.get('clue.export.clue.list','导出线索')}
            </Menu.Item>
            {freedCluePrivilege() ?
                <Menu.Item key="clue_pool">
                    {Intl.get('clue.pool', '线索池')}
                </Menu.Item> : null}
            {hasPrivilege(cluePrivilegeConst.CURTAO_CRM_COMPANY_STORAGE) ?
                <Menu.Item key="recommend">
                    {Intl.get('clue.customer.clue.recommend', '线索推荐')}
                </Menu.Item> : null}
        </Menu>);
    };
    renderNotSelectClueBtns = () => {
        let {isWebMiddle, isWebMin} = isResponsiveDisplay();
        return (
            <div className="pull-right add-anlysis-handle-btns">
                {!(isWebMiddle || isWebMin) ? this.renderClueRecommend() : null}
                {/*是否有查看线索分析的权限
                 CRM_CLUE_STATISTICAL 查看线索概览的权限
                 CRM_CLUE_TREND_STATISTIC_ALL CRM_CLUE_TREND_STATISTIC_SELF 查看线索趋势分析的权限
                 */}
                {/*{*/}
                {/*hasPrivilege('CRM_CLUE_STATISTICAL') ||*/}
                {/*hasPrivilege('CRM_CLUE_TREND_STATISTIC_ALL') ||*/}
                {/*hasPrivilege('CRM_CLUE_TREND_STATISTIC_SELF') ?*/}
                {/*this.renderClueAnalysisBtn() : null*/}
                {/*}*/}
                {
                    !(isWebMiddle || isWebMin) && freedCluePrivilege() ?
                        this.renderExtractClue() : null
                }
                {!(isWebMiddle || isWebMin) ? this.renderExportClue() : null}
                {!isWebMin ? this.renderAddBtn() : null}
                {isWebMiddle || isWebMin ?
                    <MoreButton
                        topBarDropList={this.topBarDropList.bind(this, isWebMin)}
                    /> : null}
            </div>
        );
    };
    isFirstLoading = () => {
        return this.state.isLoading && this.state.firstLogin;
    };

    //渲染有新线索，刷新页面提示
    getClueRefreshPrompt = () => {
        return (
            <div className="new-clue-prompt">
                <span className="iconfont icon-warn-icon"></span>
                <div className="prompt-sentence">
                    <ReactIntl.FormattedMessage
                        id="clue.customer.refresh.tip"
                        defaultMessage={'有新线索，{refreshPage}查看'}
                        values={{
                            'refreshPage': <a
                                onClick={this.getClueList}>{Intl.get('clue.customer.refresh.page', '刷新页面')}</a>
                        }}
                    />
                </div>
                <span className="iconfont icon-close" onClick={this.closeRefreshPrompt}></span>
            </div>
        );
    }
    //关闭刷新界面
    closeRefreshPrompt = () => {
        this.setState({
            isShowRefreshPrompt: false
        });
    };
    //在对应的tab数字上加一
    addOneOnTab = ($target) => {

    };
    onAnimate = (item, $target,startType) => {
        return new Promise(resolve => {
            const config = {
                ballWrapper: this.$wrapper,
                origin: this[`$origin_${startType}_${item.id}`],
                target: $target,
                time: FLOW_FLY_TIME,
                a: 0.0001,
                callback: this.updateLocation,
                finish: animationDone.bind(this),
            };
            parabola(config);
            function animationDone() {
                this.setState({
                    isVisible: false,
                });
                resolve();
            }
        });
    };
    updateLocation = (x, y) => {
        this.setState({
            x,
            y,
            isVisible: true
        });
    };

    //添加常用筛选项
    handleAddCommonFilter(params) {
        const condition = this.getClueSearchCondition();

        let query = _.get(condition, 'bodyParam.query', {});

        //删掉“有效性”条件，该条件是其他条件的组成部分，自己没有在界面上的对应项，所以不需要在界面是显示出来
        delete query.availability;

        //删掉“状态”条件，该条件是其他条件的组成部分，自己没有在界面上的对应项，所以不需要在界面是显示出来
        delete query.status;

        const queryCondition = {
            query,
            rang_params: _.get(condition, 'bodyParam.rang_params', []),
        };

        const data = {
            query_condition: queryCondition,
            user_id: userData.getUserData().user_id,
            name: params.filterName,
            type: params.range,
            tag: 'clue_customer'
        };

        return commonAjax({
            url: '/rest/condition/v1/condition',
            type: 'post',
            data,
            usePromise: true
        });
    }

    render() {
        var isFirstLoading = this.isFirstLoading();
        var cls = classNames('right-panel-modal',
            {'show-modal': this.state.clueAddFormShow
            });
        const contentClassName = classNames('content-container',{
            'content-full': !this.state.showFilterList
        });
        var hasSelectedClue = this.hasSelectedClues();
        var filterCls = classNames('filter-container',{
            'filter-close': !this.state.showFilterList || isFirstLoading
        });
        const animateStyle = {
            transform: `translate(${this.state.x}px, ${this.state.y}px)`,
            opacity: this.state.isVisible ? 1 : 0
        };
        return (
            <RightContent>
                <div className="clue_customer_content" data-tracename="线索列表">
                    <TopNav>
                        <div className="date-picker-wrap">
                            <div className="search-container">
                                <div className="search-input-wrapper">
                                    <FilterInput
                                        isFirstLoading={isFirstLoading}
                                        ref="filterinput"
                                        showSelectChangeTip={_.get(this.state.selectedClues, 'length')}
                                        toggleList={this.toggleList.bind(this)}
                                        filterType={Intl.get('crm.sales.clue', '线索')}
                                        onSubmit={this.handleAddCommonFilter.bind(this)}
                                        showList={this.state.showFilterList}
                                    />
                                </div>
                                {hasSelectedClue ? (
                                    <div className="clue-list-selected-tip">
                                        <span className="iconfont icon-sys-notice" />
                                        {this.renderSelectClueTips()}
                                    </div>
                                ) : <div className="search-input-inner" style={{width: this.state.filterInputWidth}}>
                                    <SearchInput
                                        searchEvent={this.searchFullTextEvent}
                                        searchPlaceHolder ={Intl.get('clue.search.full.text','全文搜索')}
                                    />
                                </div>}
                            </div>
                            {hasSelectedClue ? this.renderBatchChangeClues() : this.renderNotSelectClueBtns()}
                        </div>
                    </TopNav>
                    <div className="clue-content-container" ref={dom => {
                        this.$wrapper = dom;
                    }}>
                        <div
                            className={filterCls}>
                            <ClueFilterPanel
                                ref={filterPanel => this.filterPanel = filterPanel}
                                clueSourceArray={this.state.clueSourceArray}
                                accessChannelArray={this.state.accessChannelArray}
                                clueClassifyArray={this.state.clueClassifyArray}
                                salesManList={this.getSalesDataList()}
                                getClueList={this.getClueList}
                                style={{width: LAYOUT_CONSTANTS.FILTER_WIDTH, height: getTableContainerHeight() + LAYOUT_CONSTANTS.TABLE_TITLE_HEIGHT}}
                                showSelectTip={_.get(this.state.selectedClues, 'length')}
                                toggleList={this.toggleList.bind(this)}
                            />
                        </div>
                        <div className={contentClassName}>
                            {_.get(this.state, 'isShowRefreshPrompt') ? this.getClueRefreshPrompt() : null}
                            {this.state.allClueCount ? this.getClueTypeTab() : null}
                            {this.renderLoadingAndErrAndNodataContent()}
                        </div>
                        <div className="customer-item-ball" style={animateStyle} ></div>
                    </div>
                    {this.state.clueAddFormShow ?
                        <div className={cls}>
                            <span className="iconfont icon-close clue-add-btn" onClick={this.hideClueAddForm}
                                data-tracename="关闭添加线索面板"></span>
                            <SalesClueAddForm
                                hideAddForm={this.hideClueAddForm}
                                accessChannelArray={this.state.accessChannelArray}
                                clueSourceArray={this.state.clueSourceArray}
                                clueClassifyArray={this.state.clueClassifyArray}
                                updateClueSource={this.updateClueSource}
                                updateClueChannel={this.updateClueChannel}
                                updateClueClassify={this.updateClueClassify}
                                showRightPanel={this.showClueDetailOut}
                            />
                        </div> : null}
                    <ClueImportRightDetail
                        importType={Intl.get('crm.sales.clue', '线索')}
                        uploadActionName='clues'
                        templateHref='/rest/clue/download_template'
                        uploadHref='/rest/clue/upload'
                        previewList={this.state.previewList}
                        getItemPrevList={this.getCluePrevList}
                        showFlag={this.state.clueImportTemplateFormShow}
                        closeTemplatePanel={this.closeClueTemplatePanel}
                        doImportAjax={this.doImportAjax}
                        onItemListImport={this.onClueImport}
                        repeatAlertMessage={Intl.get('import.repeat.delete.tip', '红色标示数据已存在或不符合规则，请删除红色标示的数据后直接导入，或本地修改数据后重新导入')}
                        regRules={XLS_FILES_TYPE_RULES}
                    />
                    {
                        this.state.isShowExtractCluePanel ?
                            <RightPanel
                                className="extract-clue-panel"
                                showFlag={this.state.isShowExtractCluePanel}
                            >
                                <ClueExtract
                                    clueSearchCondition = {this.state.cluePoolCondition}
                                    closeExtractCluePanel={this.closeExtractCluePanel}
                                />
                            </RightPanel>
                            : null
                    }
                    {
                        this.state.isShowRecommendCluePanel ?
                            <ClueRecommedLists
                                closeRecommendCluePanel={this.closeRecommendCluePanel}
                            />
                            : null
                    }
                    {this.state.clueAnalysisPanelShow ? <RightPanel
                        className="clue-analysis-panel"
                        showFlag={this.state.clueAnalysisPanelShow}
                    >
                        <ClueAnalysisPanel
                            accessChannelArray={this.state.accessChannelArray}
                            clueSourceArray={this.state.clueSourceArray}
                            closeClueAnalysisPanel={this.closeClueAnalysisPanel}
                        />
                    </RightPanel> : null}
                    <Modal
                        className="clue-export-modal"
                        visible={this.state.isExportModalShow}
                        closable={false}
                        onOk={this.exportData}
                        onCancel={this.hideExportModal}
                    >
                        <div className='modal-tip'>
                            {Intl.get('contract.116', '导出范围')}：
                            {/*如果当前有选中的线索就提示导出选中的线索，如果没有就提示导出全部或者符合当前条件的线索*/}
                            {this.hasSelectedClues() ?
                                <span>
                                    {Intl.get('clue.customer.export.select.clue', '导出选中的线索')}
                                </span>
                                : <RadioGroup
                                    value={this.state.exportRange}
                                    onChange={this.onExportRangeChange}
                                >
                                    <Radio key="all" value="all">
                                        {Intl.get('common.all', '全部')}
                                    </Radio>
                                    <Radio key="filtered" value="filtered">
                                        {Intl.get('contract.117', '符合当前筛选条件')}
                                    </Radio>
                                </RadioGroup>}

                        </div>
                        <div className='modal-tip'>
                            {Intl.get('contract.118','导出类型')}：
                            {Intl.get('contract.152','excel格式')}
                        </div>
                    </Modal>
                    {/*该客户下的用户列表*/}
                    {
                        this.state.isShowCustomerUserListPanel ?
                            <RightPanel
                                className="customer-user-list-panel"
                                showFlag={this.state.isShowCustomerUserListPanel}
                            >
                                {this.state.isShowCustomerUserListPanel ?
                                    <AppUserManage
                                        customer_id={this.state.customerOfCurUser.id}
                                        hideCustomerUserList={this.closeCustomerUserListPanel}
                                        customer_name={this.state.customerOfCurUser.name}
                                    /> : null
                                }
                            </RightPanel> : null
                    }
                    <DifferentVersion
                        showFlag={this.state.showDifferentVersion}
                        closeVersion={this.triggerShowVersionInfo}
                    />
                </div>
            </RightContent>
        );
    }
}
ClueCustomer.propTypes = {
    location: PropTypes.object
};
module.exports = ClueCustomer;

