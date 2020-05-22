/**
 * 批量变更标签和销售人员
 */

var React = require('react');
var createReactClass = require('create-react-class');
require('../css/crm-batch-change.less');
var BatchChangeStore = require('../store/batch-change-store');
var crmStore = require('../store/crm-store');
var BatchChangeActions = require('../action/batch-change-actions');
import {AntcAreaSelection, AntcSelect} from 'antc';
const Option = AntcSelect.Option;
import {Input, message, Radio, Button, Icon, Menu, Dropdown} from 'antd';
import ValidateMixin from '../../../../mixins/ValidateMixin';
const RadioGroup = Radio.Group;
var userData = require('../../../../public/sources/user-data');
var batchOperate = require('../../../../public/sources/push/batch');
import Trace from 'LIB_DIR/trace';
import {isUnmodifiableTag} from '../utils/crm-util';
import AntcDropdown from 'CMP_DIR/antc-dropdown';
import AlwaysShowSelect from 'CMP_DIR/always-show-select';
import crmUtil from '../utils/crm-util';
import {formatSalesmanList} from 'PUB_DIR/sources/utils/common-method-util';
import classNames from 'classnames';
import {isCommonSalesOrPersonnalVersion} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
var CrmAction = require('../action/crm-actions');
const BATCH_OPERATE_TYPE = {
    CHANGE_SALES: 'changeSales',//变更销售人员
    USER: 'user',//变更销售人员url中传的type
    CHANGE_SECOND_SALES: 'changeSecondSales',//变更联合跟进人
    ASSERT_USER: 'assert_user',//变更联合跟进人url中传的type
    CHANGE_TAG: 'changeTag',//更新标签
    CHANGE_LABEL: 'change_label',//更新标签url中传的type
    ADD_TAG: 'addTag',//添加标签
    ADD_LABEL: 'add_label',//添加标签url中传的type
    REMOVE_TAG: 'removeTag',//移除标签
    REMOVE_LABEL: 'remove_label', //移除标签url中传的type
    CHANGE_INDUSTRY: 'changeIndustry',//变更行业
    CHANGE_TERRITORY: 'changeTerritory',//变更地域
    CHANGE_ADMINISTRATIVE_LEVEL: 'changeAdministrativeLevel',//变更行政级别
    ADD_SCHEDULE_LISTS: 'addScheduleLists',
};
const BATCH_MENU_TYPE = [
    {key: 'changeSales', value: Intl.get('crm.6', '负责人')},
    {key: 'changeSecondSales', value: Intl.get('crm.second.sales', '联合跟进人')},
    {key: 'changeTag', value: Intl.get('common.tag', '标签')},
    {key: 'changeIndustry', value: Intl.get('common.industry', '行业')},
    {key: 'changeTerritory', value: Intl.get('crm.96', '地域')},
    {key: 'changeAdministrativeLevel', value: Intl.get('crm.administrative.level', '行政级别')}
];

var CrmScheduleForm = require('./schedule/form');

var CrmBatchChange = createReactClass({
    displayName: 'CrmBatchChange',
    mixins: [ValidateMixin],
    propTypes: {
        selectedCustomer: PropTypes.object,
        selectAllMatched: PropTypes.bool,
        matchedNum: PropTypes.number,
        condition: PropTypes.object,
        isWebMini: PropTypes.bool,
        isWebMiddle: PropTypes.bool
    },
    getInitialState: function() {
        return {
            ...BatchChangeStore.getState(),
            stopContentHide: false,//content内容中有select下拉框时，
            isShowBatchMenu: true // 是否显示批量变更菜单，默认显示
        };
    },

    onStoreChange: function() {
        this.setState(BatchChangeStore.getState());
    },

    componentDidMount: function() {
        BatchChangeStore.listen(this.onStoreChange);
        if (userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN)) {
            //如果是管理员要取所有的用户
            BatchChangeActions.getALLUserList({});
        } else {
            //如果是销售，只取销售的列表
            BatchChangeActions.getSalesManList();
        }
        BatchChangeActions.getRecommendTags();
        BatchChangeActions.getIndustries();
    },

    componentWillUnmount: function() {
        BatchChangeStore.unlisten(this.onStoreChange);
    },

    setCurrentTab: function(tab) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.op-type'), '点击切换变更类型');
        BatchChangeActions.setCurrentTab(tab);
        if (tab === BATCH_OPERATE_TYPE.ADD_SCHEDULE_LISTS) {
            this.setState({stopContentHide: true});
        }
    },

    onSalesmanChange: function(sales_man) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.change-salesman'), '点击切换负责人');
        BatchChangeActions.setSalesMan(sales_man);
    },

    onSecondUserChange: function(user) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.change-second-user'), '选择联合跟进人');
        BatchChangeActions.setSecondUser(user);
    },
 
    getSalesBatchParams: function(sales_man) {
        let salesId = '', teamId = '', salesName = '', teamName = '';
        //客户所属销售团队的修改
        //销售id和所属团队的id
        let idArray = sales_man.split('&&');
        if (_.isArray(idArray) && idArray.length) {
            salesId = idArray[0];
            teamId = idArray[1];
        }
        //销售昵称和所属团队的团队名称
        let salesman = _.find(this.state.salesManList, item => item.user_info && item.user_info.user_id === salesId);
        if (salesman) {
            salesName = salesman.user_info ? (_.get(salesman.user_info, 'nick_name') || _.get(salesman.user_info,'user_name')) : '';
            if (_.isArray(salesman.user_groups) && salesman.user_groups.length) {
                let salesTeam = _.find(salesman.user_groups, team => team.group_id === teamId);
                if (salesTeam) {
                    teamName = salesTeam.group_name;
                }
            }
        }
        return {
            sales_id: salesId,
            sales_nick_name: salesName,
            sales_team_id: teamId,
            sales_team_name: teamName
        };
    },

    /**
     * 变更销售
     * @param transferType: user
     * @param title: 变更销售
     */
    doTransfer: function(transferType, title) {
        if (!this.state.sales_man) {
            // message.error(Intl.get("crm.17", "请选择销售人员"));
            BatchChangeActions.setUnSelectDataTip(Intl.get('contract.63', '请选择负责人'));
            return;
        }
        BatchChangeActions.setLoadingState(true);
        //如果是批量变更所属销售的，需要先看一下该销售已经拥有的客户数量再加上这些是否已经达到上限
        var sales_man = this.state.sales_man;
        var member_id = sales_man.split('&&')[0];
        if (transferType === BATCH_OPERATE_TYPE.USER){
            //如果是选中全部的客户，要用全部客户的数量
            var selectedCustomerNum = this.props.selectedCustomer.length;
            if (this.props.selectAllMatched) {
                selectedCustomerNum = this.props.matchedNum;
            }
            CrmAction.getCustomerLimit({member_id: member_id, num: selectedCustomerNum}, (result) => {
                if (_.isNumber(result) && result > 0){
                    //超过销售拥有客户的上限
                    var warningTip = Intl.get('crm.104', '变更负责人后会超过该负责人拥有客户的上限，请减少{num}个客户后再变更负责人' ,{num: result});
                    message.warn(warningTip);
                    BatchChangeActions.setLoadingState(false);
                }else{
                    this.batchSubmitData(transferType, title, sales_man);
                }
            });
        }else{
            this.batchSubmitData(transferType, title, sales_man);
        }
    },

    batchSubmitData: function(transferType, title, sales_man) {
        let condition = {
            query_param: {},
            update_param: {
                user_id: sales_man.split('&&')[0]
            }
        };
        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function(customer) {
                return customer.id;
            });
        }

        BatchChangeActions.doBatch(transferType, condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code === 0) {
                //批量操作参数
                let is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                let totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                let batchParams = this.getSalesBatchParams(sales_man);
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/accounts',
                    showFailed: true, //是否显示失败数
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: title
                });
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });

    },

    /**
     * 批量变更联合跟进人
     * @param transferType: assert_user
     * @param title: 变更联合跟进人
     */
    doChangeSecondUser: function(transferType, title) {
        if (!this.state.second_user) {
            BatchChangeActions.setUnSelectDataTip(Intl.get('crm.select.second.sales', '请选择联合跟进人'));
            return;
        }
        BatchChangeActions.setLoadingState(true);
        this.batchSubmitData(transferType, title, this.state.second_user);
    },


    addTag: function(e) {
        if (e.keyCode !== 13) return;

        const tag = _.trim(e.target.value);
        if (!tag) return;
        //”线索“、”转出“、“已回访”标签，不可以添加
        if (isUnmodifiableTag(tag)) {
            message.error(Intl.get('crm.sales.clue.add.disable', '不能手动添加\'{label}\'标签', {label: tag}));
            return;
        }
        this.toggleTag(tag, true);
        Trace.traceEvent(e, '按enter键添加新标签');

    },

    toggleTag: function(tag, isAdd) {

        BatchChangeActions.toggleTag({tag, isAdd});
    },

    //批量更新标签
    doChangeTag: function(type, typeText) {
        if (!_.isArray(this.state.tags) || !this.state.tags.length) {
            BatchChangeActions.setUnSelectDataTip(Intl.get('crm.212', '请选择标签'));
            return;
        }
        let savedTags = this.state.tags;
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: {
                labels: this.state.tags.length ? this.state.tags : null
            }
        };

        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function(customer) {
                return customer.id;
            });
        }
        BatchChangeActions.doBatch(type, condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code === 0) {
                //批量操作参数
                var is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                var totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                var batchParams = {
                    tags: savedTags
                };
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/accounts'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: typeText
                });
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });
    },

    //批量修改行业
    doChangeIndustry: function() {
        let industryStr = this.state.selected_industries.join(',');
        if (!industryStr) {
            BatchChangeActions.setUnSelectDataTip(Intl.get('crm.22', '请选择行业'));
            return;
        }
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: {
                industry: industryStr || null
            }
        };
        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function(customer) {
                return customer.id;
            });
        }
        BatchChangeActions.doBatch('industry', condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code === 0) {
                //批量操作参数
                var is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                var totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                var batchParams = {
                    industry: industryStr
                };
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/accounts'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: Intl.get('crm.20', '变更行业')
                });
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });
    },

    //批量修改地域
    doChangeTerritory: function() {
        let territoryObj = _.cloneDeep(this.state.territoryObj);
        if (!territoryObj.city && !territoryObj.county && !territoryObj.province) {
            BatchChangeActions.setUnSelectDataTip(Intl.get('common.edit.address.placeholder', '请选择地址'));
            return;
        }
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: territoryObj
        };
        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function(customer) {
                return customer.id;
            });
        }
        BatchChangeActions.doBatch('address', condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code === 0) {
                //批量操作参数
                var is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                var totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                var batchParams = territoryObj;
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/accounts'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: Intl.get('crm.21', '变更地域')
                });
                //清空选择的地域信息
                this.updateLocation('');
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });
    },

    //批量修改行政级别
    doChangeAdministrativeLevel: function() {
        let administrativeLevel = this.state.administrative_level;
        BatchChangeActions.setLoadingState(true);
        let condition = {
            query_param: {},
            update_param: {
                administrative_level: administrativeLevel || ''
            }
        };
        //选中全部搜索结果时，将搜索条件传给后端
        //后端会将符合这个条件的客户进行迁移
        if (this.props.selectAllMatched) {
            condition.query_param = this.props.condition;
        } else {
            //只在当前页进行选择时，将选中项的id传给后端
            //后端检测到传递的id后，将会对这些id的客户进行迁移
            condition.query_param.id = this.props.selectedCustomer.map(function(customer) {
                return customer.id;
            });
        }
        BatchChangeActions.doBatch('administrative_level', condition, (result) => {
            BatchChangeActions.setLoadingState(false);
            if (result.code === 0) {
                //批量操作参数
                var is_select_all = !!this.props.selectAllMatched;
                //全部记录的个数
                var totalSelectedSize = is_select_all ? crmStore.getCustomersLength() : this.props.selectedCustomer.length;
                //构造批量操作参数
                var batchParams = {
                    administrative_level: administrativeLevel
                };
                //向任务列表id中添加taskId
                batchOperate.addTaskIdToList(result.taskId);
                //存储批量操作参数，后续更新时使用
                batchOperate.saveTaskParamByTaskId(result.taskId, batchParams, {
                    showPop: true,
                    urlPath: '/accounts'
                });
                //立即在界面上显示推送通知
                //界面上立即显示一个初始化推送
                batchOperate.batchOperateListener({
                    taskId: result.taskId,
                    total: totalSelectedSize,
                    running: totalSelectedSize,
                    typeText: Intl.get('crm.administrative.level.change', '变更行政级别')
                });
            } else {
                var errorMsg = result.msg;
                message.error(errorMsg);
            }
        });
    },

    //批量添加联系计划
    doAddScheduleLists: function() {
        //调用子组件中保存数据的方法
        if (_.isFunction(_.get(this.refs, 'crmScheduleForm.handleSave'))) {
            this.refs.crmScheduleForm.handleSave();
        }
    },

    //添加完联系计划后，关闭下拉面板
    closeContent: function() {
        if (_.isFunction(_.get(this.refs, 'addSchedule.handleCancel'))) {
            this.refs.addSchedule.handleCancel();
        }
    },

    //取消添加日程
    cancelAddSchedule: function() {
        this.setState({
            stopContentHide: false
        });
        if (_.isFunction(_.get(this.refs, 'crmScheduleForm.handleCancel'))) {
            this.refs.crmScheduleForm.handleCancel();
        }
    },

    handleSubmit: function(e) {
        Trace.traceEvent(e, '点击变更按钮');
        this.showDropDownContent();
        var currentTab = this.state.currentTab;
        switch (currentTab) {
            case BATCH_OPERATE_TYPE.CHANGE_SALES:
                this.doTransfer(BATCH_OPERATE_TYPE.USER, Intl.get('crm.103', '变更负责人'));
                break;
            case BATCH_OPERATE_TYPE.CHANGE_SECOND_SALES:
                this.doChangeSecondUser(BATCH_OPERATE_TYPE.ASSERT_USER, Intl.get('crm.batch.second.user', '变更联合跟进人'));
                break;
            case BATCH_OPERATE_TYPE.CHANGE_TAG:
                this.doChangeTag(BATCH_OPERATE_TYPE.CHANGE_LABEL, Intl.get('crm.206', '更新标签'));
                break;
            case BATCH_OPERATE_TYPE.ADD_TAG:
                this.doChangeTag(BATCH_OPERATE_TYPE.ADD_LABEL, Intl.get('crm.205', '添加标签'));
                break;
            case BATCH_OPERATE_TYPE.REMOVE_TAG:
                this.doChangeTag(BATCH_OPERATE_TYPE.REMOVE_LABEL, Intl.get('crm.204', '移除标签'));
                break;
            case BATCH_OPERATE_TYPE.CHANGE_INDUSTRY:
                this.doChangeIndustry();
                break;
            case BATCH_OPERATE_TYPE.CHANGE_TERRITORY:
            //批量修改地域
                this.doChangeTerritory();
                break;
            case BATCH_OPERATE_TYPE.CHANGE_ADMINISTRATIVE_LEVEL:
            //批量修改行政级别
                this.doChangeAdministrativeLevel();
                break;
            case BATCH_OPERATE_TYPE.ADD_SCHEDULE_LISTS:
            //批量添加联系计划
                this.doAddScheduleLists();
                break;
        }
    },

    industryChange: function(industry) {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.block-industry-edit'), '选择行业');
        BatchChangeActions.industryChange([industry]);
    },

    renderIndustryBlock: function() {
        let dataList = [], industryList = this.state.industries.list;
        if (_.isArray(industryList)) {
            dataList = industryList.map(item => {
                return {name: item.industry, value: item.industry};
            });
        }
        return (
            <div className="op-pane change-industry">
                <AlwaysShowSelect
                    placeholder={Intl.get('crm.22', '请选择行业')}
                    value={this.state.selected_industries.join(',')}
                    onChange={this.industryChange}
                    notFoundContent={dataList.length ? Intl.get('crm.23', '无相关行业') : Intl.get('crm.24', '暂无行业')}
                    dataList={dataList}
                />
            </div>
        );
    },

    renderAdministrativeLevelBlock: function() {
        let dataList = crmUtil.administrativeLevels.map(item => {
            return {name: item.level, value: item.id};
        });
        return (
            <div className="op-pane change-administrative-level">
                <AlwaysShowSelect
                    placeholder={Intl.get('crm.select.level', '请选择行政级别')}
                    value={this.state.administrative_level}
                    hasClearOption={true}
                    onChange={this.administrativeLevelChange}
                    notFoundContent={Intl.get('crm.no.level', '无相关行政级别')}
                    dataList={dataList}
                />
            </div>
        );
    },

    //更新地址
    updateLocation: function(address) {
        BatchChangeActions.locationChange(address);
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.change-territory'), '选择地址');
    },

    //标签变更类型的切换
    onChangeTag: function(e, v) {
        this.setCurrentTab(e.target.value);
    },

    renderSalesBlock: function() {
        //获取销售所在团队的成员列表
        let dataList = formatSalesmanList(this.state.salesManList);
        return (
            <div className="op-pane change-salesman">
                <AlwaysShowSelect
                    placeholder={Intl.get('contract.63', '请选择负责人')}
                    value={this.state.sales_man}
                    onChange={this.onSalesmanChange}
                    notFoundContent={dataList.length ? Intl.get('crm.search.no.owner', '无相关负责人') : Intl.get('contract.64', '暂无负责人') }
                    dataList={dataList}
                />
            </div>
        );
    },
    // 变更联合跟进人
    renderSecondSalesBlock: function() {
        //获取销售所在团队的成员列表
        let dataList = formatSalesmanList(this.state.salesManList);
        return (
            <div className="op-pane change-second-user">
                <AlwaysShowSelect
                    placeholder={Intl.get('crm.select.second.sales', '请选择联合跟进人')}
                    value={this.state.second_user}
                    onChange={this.onSecondUserChange}
                    notFoundContent={dataList.length ? Intl.get('crm.no.second.sales', '暂无符合条件的联合跟进人') : Intl.get('crm.no.second.sales', '暂无联合跟进人')}
                    dataList={dataList}
                />
            </div>
        );
    },

    //批量添加联系计划
    renderScheduleLists: function() {
        //批量操作选中的客户
        var selectedCustomer = this.props.selectedCustomer;
        const newSchedule = {
            customer_id: selectedCustomer[0].id,
            customer_name: selectedCustomer[0].name,
            start_time: '',
            end_time: '',
            alert_time: '',
            topic: '',
            edit: true
        };
        const formItemLayout = {
            colon: false,
            labelCol: {span: 4},
            wrapperCol: {span: 20},
        };
        return (
            <div className="batch-add-schedule">
                <CrmScheduleForm
                    formItemLayout={formItemLayout}
                    currentSchedule={newSchedule}
                    selectedCustomer={selectedCustomer}
                    ref="crmScheduleForm"
                    cancelAddSchedule={this.cancelAddSchedule}
                    closeContent={this.closeContent}
                />
            </div>
        );
    },

    renderAddressBlock: function() {
        let territoryObj = this.state.territoryObj;//地域
        return (
            <div className="op-pane change-territory">
                {<AntcAreaSelection labelCol="0" wrapperCol="24" width="210"
                    isAlwayShow={true}
                    provName={territoryObj.province} cityName={territoryObj.city}
                    countyName={territoryObj.county}
                    updateLocation={this.updateLocation}/>}
            </div>
        );
    },

    renderTagChangeBlock: function() {
        let selectedTagsArray = this.state.tags ? this.state.tags : [];
        let recommendTagsArray = _.isArray(this.state.recommendTags) ? this.state.recommendTags : [];
        let unionTagsArray = _.union(recommendTagsArray, selectedTagsArray);
        //过滤掉“线索”、“转出”、“已回访”标签，“线索“、“转出”、“已回访”标签不可添加、修改、删除
        unionTagsArray = _.filter(unionTagsArray, tag => !isUnmodifiableTag(tag));
        let tagsJsx = unionTagsArray.map((tag, index) => {
            let className = 'customer-tag';
            className += selectedTagsArray.indexOf(tag) > -1 ? ' tag-selected' : '';
            return (<span key={index} onClick={() => this.toggleTag(tag)} className={className}
                data-tracename="点击选中/取消选中某个标签">{tag}</span>);
        });
        return (
            <div className="op-pane change-tag">
                <RadioGroup onChange={this.onChangeTag} value={this.state.currentTab}>
                    <Radio
                        value={BATCH_OPERATE_TYPE.CHANGE_TAG}>{Intl.get('crm.206', '更新标签')}</Radio>
                    <Radio value={BATCH_OPERATE_TYPE.ADD_TAG}>{Intl.get('crm.205', '添加标签')}</Radio>
                    <Radio
                        value={BATCH_OPERATE_TYPE.REMOVE_TAG}>{Intl.get('crm.204', '移除标签')}</Radio>
                </RadioGroup>
                <div className="block-tag-edit">
                    {tagsJsx}
                </div>
                {this.state.currentTab === BATCH_OPERATE_TYPE.CHANGE_TAG || this.state.currentTab === BATCH_OPERATE_TYPE.ADD_TAG ? (
                    <Input placeholder={Intl.get('crm.28', '按Enter键添加新标签')}
                        onChange={this.setField.bind(this, 'tag')}
                        value={this.state.formData.tag}
                        onKeyUp={this.addTag}
                    />
                ) : ''}
            </div>
        );
    },

    clearSelectSales: function() {
        BatchChangeActions.setSalesMan('');
    },
    clearSelectSecondUser: function() {
        BatchChangeActions.setSecondUser('');
    },
    clearSelectLocation: function() {
        BatchChangeActions.locationChange('');
    },

    clearSelectIndustry: function() {
        BatchChangeActions.industryChange([]);
    },

    clearSelectTags: function() {
        BatchChangeActions.clearSelectedTag();
    },

    administrativeLevelChange: function(level) {
        BatchChangeActions.administrativeLevelChange(level);
    },

    handleMenuClick(e) {
        this.setCurrentTab(e.key);
        this.setState({
            isShowBatchMenu: false
        });
    },

    getBatchChangeMenus() {
        return(
            <Menu onClick={this.handleMenuClick} defaultSelectedKeys={[BATCH_OPERATE_TYPE.CHANGE_SALES]}>
                {_.map(BATCH_MENU_TYPE, item => {
                    if (_.indexOf([BATCH_OPERATE_TYPE.CHANGE_SALES, BATCH_OPERATE_TYPE.CHANGE_SECOND_SALES], item.key) !== -1 && isCommonSalesOrPersonnalVersion()) return null;
                    return (<Menu.Item key={item.key}>{item.value}</Menu.Item>);
                })}
            </Menu>
        );
    },

    // 渲染变更菜单
    renderBatchChange() {
        return (
            <Dropdown overlay={this.getBatchChangeMenus()}>
                <Button type='primary' className='btn-item'>
                    <span className="iconfont icon-modify-condition"></span>
                    {Intl.get('crm.32', '变更')}
                </Button>
            </Dropdown>
        );
    },

    showDropDownContent() {
        this.setState({
            isShowBatchMenu: true
        });
    },
    //是否是普通销售
    isCommonSales() {
        let userObj = userData.getUserData();
        return _.get(userObj, 'isCommonSales');
    },
    render: function() {
        //在页面处于手机屏尺寸时，dropdown按钮模拟为“更多”按钮
        let showBatchBtn = !this.props.isWebMini ?
            (<Button type='primary' className='btn-item'>
                <span className="iconfont icon-modify-condition"></span>
                {Intl.get('crm.32', '变更')}
            </Button>) : (
                <Button className='more-btn'>
                    <i className="iconfont icon-more"></i>
                </Button>);
        //在页面处于手机屏尺寸与pad尺寸时，添加联系计划按钮模拟为“更多”按钮
        let showScheduleBtn = !(this.props.isWebMiddle || this.props.isWebMini) ? (
            <Button className='btn-item' onClick={this.setCurrentTab.bind(this, BATCH_OPERATE_TYPE.ADD_SCHEDULE_LISTS)}>
                <span className="iconfont icon-filter"></span>
                {Intl.get('crm.214', '添加联系计划')}
            </Button>) : (
            <Button className='more-btn schedule-more-btn'>
                <i className="iconfont icon-more"></i>
            </Button>);
        let changeBtns = {
            btn: showBatchBtn,
            schedule: showScheduleBtn
        };
        let isShowDropDownContent = !this.state.isShowBatchMenu;
        //中屏和小屏的时候不展示添加联系计划按钮
        let showAddingSchedule = !(this.props.isWebMini || this.props.isWebMiddle) ? 'inline-block' : 'none';
        let miniWebBatch = classNames('crm-batch-change-container', {
            'mini-crm-batch': this.props.isWebMini
        });
        return (
            <div className={miniWebBatch}>
                {
                    !this.props.isWebMini && this.state.isShowBatchMenu ? this.renderBatchChange() : null
                }
                {
                    (this.state.currentTab === BATCH_OPERATE_TYPE.CHANGE_TAG ||
                    this.state.currentTab === 'addTag' || this.state.currentTab === 'removeTag') && isShowDropDownContent ? (
                            <AntcDropdown
                                datatraceContainer='客户批量变更标签'
                                content={changeBtns.btn}
                                overlayTitle={Intl.get('common.tag', '标签')}
                                isSaving={this.state.isLoading}
                                overlayContent={this.renderTagChangeBlock()}
                                handleSubmit={this.handleSubmit}
                                okTitle={Intl.get('crm.32', '变更')}
                                cancelTitle={Intl.get('common.cancel', '取消')}
                                unSelectDataTip={this.state.unSelectDataTip}
                                clearSelectData={this.clearSelectTags}
                                showDropDownContent={this.showDropDownContent}
                                isShowDropDownContent={isShowDropDownContent}
                            />
                        ) : null
                }
                {
                    this.state.currentTab === BATCH_OPERATE_TYPE.CHANGE_INDUSTRY && isShowDropDownContent ? (
                        <AntcDropdown
                            datatraceContainer='客户批量变更行业'
                            content={changeBtns.btn}
                            overlayTitle={Intl.get('common.industry', '行业')}
                            isSaving={this.state.isLoading}
                            overlayContent={this.renderIndustryBlock()}
                            handleSubmit={this.handleSubmit}
                            okTitle={Intl.get('crm.32', '变更')}
                            cancelTitle={Intl.get('common.cancel', '取消')}
                            unSelectDataTip={this.state.unSelectDataTip}
                            clearSelectData={this.clearSelectIndustry}
                            showDropDownContent={this.showDropDownContent}
                            isShowDropDownContent={isShowDropDownContent}
                        />
                    ) : null
                }
                {
                    this.state.currentTab === BATCH_OPERATE_TYPE.CHANGE_TERRITORY && isShowDropDownContent ? (
                        <AntcDropdown
                            datatraceContainer='客户批量变更地域'
                            content={changeBtns.btn}
                            overlayTitle={Intl.get('crm.96', '地域')}
                            isSaving={this.state.isLoading}
                            overlayContent={this.renderAddressBlock()}
                            handleSubmit={this.handleSubmit}
                            okTitle={Intl.get('crm.32', '变更')}
                            cancelTitle={Intl.get('common.cancel', '取消')}
                            unSelectDataTip={this.state.unSelectDataTip}
                            clearSelectData={this.clearSelectLocation}
                            showDropDownContent={this.showDropDownContent}
                            isShowDropDownContent={isShowDropDownContent}
                        />
                    ) : null
                }
                {
                    this.state.currentTab === BATCH_OPERATE_TYPE.CHANGE_SALES && isShowDropDownContent ? (
                        <AntcDropdown
                            datatraceContainer='客户批量变更负责人'
                            content={changeBtns.btn}
                            overlayTitle={Intl.get('crm.6', '负责人')}
                            isSaving={this.state.isLoading}
                            overlayContent={this.renderSalesBlock()}
                            handleSubmit={this.handleSubmit}
                            okTitle={Intl.get('crm.32', '变更')}
                            cancelTitle={Intl.get('common.cancel', '取消')}
                            unSelectDataTip={this.state.unSelectDataTip}
                            clearSelectData={this.clearSelectSales}
                            showDropDownContent={this.showDropDownContent}
                            isShowDropDownContent={isShowDropDownContent}
                        />
                    ) : null
                }
                {
                    this.state.currentTab === BATCH_OPERATE_TYPE.CHANGE_SECOND_SALES && isShowDropDownContent ? (
                        <AntcDropdown
                            datatraceContainer='客户批量变更联合跟进人'
                            content={changeBtns.btn}
                            overlayTitle={Intl.get('crm.second.sales', '联合跟进人')}
                            isSaving={this.state.isLoading}
                            overlayContent={this.renderSecondSalesBlock()}
                            handleSubmit={this.handleSubmit}
                            okTitle={Intl.get('crm.32', '变更')}
                            cancelTitle={Intl.get('common.cancel', '取消')}
                            unSelectDataTip={this.state.unSelectDataTip}
                            clearSelectData={this.clearSelectSecondUser}
                            showDropDownContent={this.showDropDownContent}
                            isShowDropDownContent={isShowDropDownContent}
                        />
                    ) : null
                }
                {
                    this.state.currentTab === BATCH_OPERATE_TYPE.CHANGE_ADMINISTRATIVE_LEVEL && isShowDropDownContent ? (
                        <AntcDropdown
                            datatraceContainer='客户批量变更行政级别'
                            content={changeBtns.btn}
                            overlayTitle={Intl.get('crm.administrative.level', '行政级别')}
                            isSaving={this.state.isLoading}
                            overlayContent={this.renderAdministrativeLevelBlock()}
                            handleSubmit={this.handleSubmit}
                            okTitle={Intl.get('crm.32', '变更')}
                            cancelTitle={Intl.get('common.cancel', '取消')}
                            unSelectDataTip={this.state.unSelectDataTip}
                            clearSelectData={this.administrativeLevelChange.bind(this, '')}
                            showDropDownContent={this.showDropDownContent}
                            isShowDropDownContent={isShowDropDownContent}
                        />
                    ) : null
                }
                <AntcDropdown
                    datatraceContainer='客户批量添加联系计划'
                    ref="addSchedule"
                    placement="bottomRight"
                    stopContentHide={this.state.stopContentHide}
                    content={changeBtns.schedule}
                    overlayTitle={Intl.get('crm.214', '添加联系计划')}
                    isSaving={this.state.isLoading}
                    overlayContent={this.renderScheduleLists()}
                    handleSubmit={this.handleSubmit}
                    okTitle={Intl.get('common.add', '添加')}
                    cancelTitle={Intl.get('common.cancel', '取消')}
                    clearSelectData={this.cancelAddSchedule}
                />
            </div>
        );
    },
});
module.exports = CrmBatchChange;