var React = require('react');
import '../css/basic-overview.less';
import DetailCard from 'CMP_DIR/detail-card';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import TagCard from 'CMP_DIR/detail-card/tag-card';
import SalesTeamCard from './basic_info/sales-team-card';
import {isUnmodifiableTag} from '../utils/crm-util';
var basicOverviewStore = require('../store/basic-overview-store');
var basicOverviewAction = require('../action/basic-overview-actions');
var SalesTeamStore = require('../../../sales_team/public/store/sales-team-store');
import {message, Button, Popover} from 'antd';
var history = require('../../../../public/sources/history');
var FilterAction = require('../action/filter-actions');
let CrmAction = require('../action/crm-actions');
let CrmRepeatAction = require('../action/customer-repeat-action');
import {sourceClassifyArray} from 'MOD_DIR/clue_customer/public/utils/clue-customer-utils';
import crmUtil from '../utils/crm-util';
import crmAjax from '../ajax';
import batchAjax from '../ajax/batch-change-ajax';
import filterAjax from '../ajax/filter-ajax';
import userData from 'PUB_DIR/sources/user-data';
import TimeUtil from 'PUB_DIR/sources/utils/time-format-util';
import CustomerRecord from './customer_record';
import ScheduleItem from './schedule/schedule-item';
import Trace from 'LIB_DIR/trace';
import RightPanelScrollBar from './components/rightPanelScrollBar';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import {isCurtao, checkVersionAndType} from 'PUB_DIR/sources/utils/common-method-util';
import CustomerRecordStore from '../store/customer-record-store';
import ApplyUserForm from './apply-user-form';
import TimeStampUtil from 'PUB_DIR/sources/utils/time-stamp-util';
import CrmScoreCard from './basic_info/crm-score-card';
import {INTEGRATE_TYPES, PRIVILEGE_MAP} from 'PUB_DIR/sources/utils/consts';
import CustomerStageCard from './basic_info/customer-stage-card';
import {getApplyState} from 'PUB_DIR/sources/utils/apply-estimate';
import crmPrivilegeConst from '../privilege-const';
class BasicOverview extends React.Component {
    constructor(props) {
        super(props);
        let customerRecordState = CustomerRecordStore.getState();

        this.state = {
            ...basicOverviewStore.getState(),
            basicData: props.curCustomer || {},
            salesObj: {salesTeam: SalesTeamStore.getState().salesTeamList},
            showDetailFlag: false,//控制客户详情展示隐藏的标识
            recommendTags: [],//推荐标签
            customerRecordLoading: customerRecordState.customerRecordLoading,
            customerRecord: customerRecordState.customerRecord,
            appList: [],
            applyFormShowFlag: false,
            competitorList: [],
            isOplateUser: false,
            customerStageList: [], // 客户阶段列表
        };
    }

    onChange = () => {
        this.setState({
            ...basicOverviewStore.getState(),
        });
    };

    onRecordStoreChange = () => {
        let customerRecordState = CustomerRecordStore.getState();
        this.setState({
            customerRecordLoading: customerRecordState.customerRecordLoading,
            customerRecord: customerRecordState.customerRecord
        });
    };

    componentWillMount = () => {
        getApplyState().then(applyState => {
            this.setState({
                applyState
            });
        });
    }

    componentDidMount() {
        basicOverviewStore.listen(this.onChange);
        CustomerRecordStore.listen(this.onRecordStoreChange);
        let curCustomer = this.props.curCustomer;
        let teamId = _.get(curCustomer, 'sales_team_id');
        basicOverviewAction.getBasicData(curCustomer);
        if(!this.props.disableEdit){
            this.getRecommendTags();
            this.getCompetitorList();
            this.getIntegrateConfig();
            // this.getCustomerStageByTeamId(teamId); // 获取客户阶段
            setTimeout(() => {
                //有获取客户下用户列表的权限，并且不是csm.curtao.com
                if (hasPrivilege(crmPrivilegeConst.APP_USER_QUERY) && !isCurtao()) {
                    this.getCrmUserList(this.props.curCustomer);
                }
                //需要展示未处理的电联的联系计划
                this.getNotCompletedScheduleList(this.props.curCustomer);
            });
        }
    }

    // 获取客户阶段
    getCustomerStageByTeamId = (teamId) => {
        crmAjax.getCustomerStageByTeamId(teamId).then( (result) => {
            if (result && result.id) {
                let customerStageList = result.customer_stages;
                this.setState({
                    customerStageList: _.map(customerStageList, 'name')
                });
            } else {
                this.setState({
                    customerStageList: []
                });
            }
        });
    };

    getIntegrateConfig(){
        commonDataUtil.getIntegrationConfig().then(resultObj => {
            let isOplateUser = _.get(resultObj, 'type') === INTEGRATE_TYPES.OPLATE;
            this.setState({isOplateUser});
        });
    }
    getAppList = () => {
        commonDataUtil.getAppList(appList => {
            this.setState({appList: _.map(appList, app => {
                return {
                    client_id: app.app_id,
                    client_name: app.app_name,
                    client_logo: app.app_logo
                };
            })
            });
        });
    };

    //获取推荐标签列表
    getRecommendTags = () => {
        batchAjax.getRecommendTags().then(data => {
            if (_.isArray(data.result) && data.result.length) {
                // 过滤掉线索、转出、已回访标签，保证selectedTagsArray中有”线索“、“转出”、“已回访”标签，则只展示，没有就不展示
                let recommendTags = _.filter(data.result, tag => !isUnmodifiableTag(tag));
                this.setState({recommendTags: recommendTags});
            }
        });
    };

    getCompetitorList = () => {
        filterAjax.getCompetitorList().then((list) => {
            this.setState({competitorList: _.isArray(list) ? list : []});
        }, (errorMsg) => {
            this.setState({competitorList: []});
        });
    };

    //获取客户开通的用户列表
    getCrmUserList = (curCustomer) => {
        if(!_.get(curCustomer,'id')) return;
        basicOverviewAction.setCrmUserList([]);
        //该客户开通的用户个数
        basicOverviewAction.getCrmUserList({
            customer_id: curCustomer.id,
            id: '',
            page_size: _.get(curCustomer, 'app_user_ids.length', 1)
        }, (result) => {
            //没有用户列表,销售及销售主管才有用户申请
            if (!_.get(result,'data[0]') && (userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER))) {
                //该客户没有用户时需要引导申请，申请用户时需要应用列表
                this.getAppList();
            }
        });
    };

    //获取未完成的日程列表
    getNotCompletedScheduleList = (curCustomer) => {
        if(!_.get(curCustomer,'id')) return;
        basicOverviewAction.getNotCompletedScheduleList({
            customer_id: curCustomer.id,
            page_size: 100,
            status: false,
            type: 'calls',
            sort_field: 'start_time',
            order: 'ascend',
            start_time: TimeStampUtil.getTodayTimeStamp().start_time,
            end_time: TimeStampUtil.getTodayTimeStamp().end_time,
        });
    };

    componentWillReceiveProps(nextProps) {
        basicOverviewAction.getBasicData(nextProps.curCustomer);
        if (!this.props.disableEdit && _.get(nextProps, 'curCustomer.id') !== _.get(this.state, 'basicData.id')) {
            setTimeout(() => {
                //有获取客户下用户列表的权限，并且不是csm.curtao.com
                if (hasPrivilege(crmPrivilegeConst.APP_USER_QUERY) && !isCurtao()) {
                    this.getCrmUserList(nextProps.curCustomer);
                }
                //需要展示未处理的电联的联系计划
                this.getNotCompletedScheduleList(nextProps.curCustomer);
                // let teamId = _.get(nextProps.curCustomer, 'sales_team_id');
                // this.getCustomerStageByTeamId(teamId); // 获取客户阶段
            });
        }
    }

    componentWillUnmount() {
        basicOverviewStore.unlisten(this.onChange);
        CustomerRecordStore.unlisten(this.onRecordStoreChange);
    }

    //展示按客户搜索到的用户列表
    triggerUserList = () => {
        //获取客户基本信息
        var basicData = this.state.basicData || {};
        this.props.ShowCustomerUserListPanel({customerObj: basicData || {}});
    };

    //修改客户基本资料成功后的处理
    editBasicSuccess = (newBasic) => {
        if (this.props.isMerge) {
            //合并面板的修改保存
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(newBasic);
        } else if (this.props.isRepeat) {
            //重客户的修改
            CrmRepeatAction.editBasicSuccess(newBasic);
        } else {
            CrmAction.editBasicSuccess(newBasic);
            //如果修改的是标签，则刷新标签列表
            if (newBasic.labels) {
                FilterAction.getTagList();
            }
            if (_.isFunction(this.props.editCustomerBasic)) {
                this.props.editCustomerBasic(newBasic);
            }
        }
    };

    getAdministrativeLevelOptions = () => {
        let options = crmUtil.administrativeLevels.map(obj => {
            return (<Option key={obj.id} value={obj.id}>{obj.level}</Option>);
        });
        options.unshift(<Option key="" value="">&nbsp;</Option>);
        return options;
    };

    onSelectAdministrativeLevel = (administrative_level) => {
        administrative_level = parseInt(administrative_level);
        if (!_.isNaN(administrative_level)) {
            let basicData = this.state.basicData;
            basicData.administrative_level = parseInt(administrative_level);
            this.setState({basicData});
        }
    };

    getAdministrativeLevel = (levelId) => {
        let levelObj = _.find(crmUtil.administrativeLevels, level => level.id === levelId);
        return levelObj ? levelObj.level : '';
    };

    //保存修改后的标签
    saveEditTags = (tags, successFunc, errorFunc) => {
        // 保存前先过滤掉线索、转出、已回访标签
        tags = _.filter(tags, tag => !isUnmodifiableTag(tag));
        let submitData = {
            id: this.state.basicData.id,
            type: 'label',
            labels: tags
        };
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(submitData);
            if (_.isFunction(successFunc)) successFunc();
        } else {
            crmAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    if (_.isFunction(successFunc)) successFunc();
                    //更新列表中的标签
                    this.editBasicSuccess(submitData);
                    let basicData = this.state.basicData;
                    basicData.labels = tags;
                    this.setState({
                        basicData,
                        recommendTags: _.union(this.state.recommendTags, tags)
                    });
                } else {
                    if (_.isFunction(errorFunc)) errorFunc();
                }
            }, errorMsg => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg);
            });
        }
    };

    saveEditCompetitors = (competitors, successFunc, errorFunc) => {
        let submitData = {
            id: this.state.basicData.id,
            competing_products: competitors,
            type: 'competing_products',
        };
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(submitData);
            if (_.isFunction(successFunc)) successFunc();
        } else {
            crmAjax.updateCustomer(submitData).then(result => {
                if (result) {
                    if (_.isFunction(successFunc)) successFunc();
                    //更新列表中的竞品
                    this.editBasicSuccess(submitData);
                    let basicData = this.state.basicData;
                    basicData.competing_products = competitors;
                    this.setState({
                        basicData,
                        competitorList: _.union(this.state.competitorList, competitors)
                    });
                } else {
                    if (_.isFunction(errorFunc)) errorFunc();
                }
            }, errorMsg => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg);
            });
        }
    };

    //控制客户详情展示隐藏的方法
    toggleBasicDetail = () => {
        this.setState({
            showDetailFlag: !this.state.showDetailFlag
        });
    };

    //渲染有应用到期的提示
    renderExpireTip = () => {
        let crmUserList = this.state.crmUserList;
        const TRIAL_TYPE = '试用用户';
        let expireTrialUsers = [];//3天内到期的试用用户列表
        _.each(crmUserList, userObj => {
            let appList = userObj.apps;
            _.each(appList, app => {
                let end_time = app.end_time;
                //启用状态下，有到期时间的试用用户
                if (app.is_disabled !== 'true' && app.end_time && app.user_type === TRIAL_TYPE) {
                    let duration = end_time - moment().valueOf();
                    let over_draft_days = parseInt(duration / oplateConsts.ONE_DAY_TIME_RANGE);
                    if (over_draft_days > 0 && over_draft_days < 3) {//概览页只提示3天内到期的试用用户
                        let overDraftTime = TimeUtil.getFutureTimeStr(end_time);
                        expireTrialUsers.push({overDraftDays: over_draft_days, overDraftTimeStr: overDraftTime});
                    }
                }
            });
        });
        if (expireTrialUsers.length) {
            //排序，优先展示短时间到期的
            expireTrialUsers.sort((obj1, obj2) => obj1.overDraftDays - obj2.overDraftDays);
            let tip = (
                <div className="overview-user-tip">
                    <span className="iconfont icon-warn-icon"/>
                    <span className="expire-tip-content">
                        {Intl.get('crm.overview.expire.tip', '有应用{days}试用到期', {days: expireTrialUsers[0].overDraftTimeStr})}
                    </span>
                    <span className="iconfont icon-arrow-right handle-btn-item" onClick={this.turnToUserList}
                        title={Intl.get('call.record.show.customer.detail', '查看详情')}/>
                </div>);
            return (<DetailCard content={tip} className="expire-tip-contianer"/>);
        } else {
            return null;
        }
    };

    //根据是否绑定激活渲染带Popover的button和不带Popover的button
    renderApplyButton = () => {
        let applyPrivileged = _.get(this.state, 'applyState.applyPrivileged');
        return (
            applyPrivileged ? (
                <Button className='crm-detail-add-btn' onClick={this.toggleApplyForm.bind(this)}>
                    {Intl.get('crm.apply.user.new', '申请新用户')}
                </Button>) :
                (<Popover
                    placement="bottomRight"
                    overlayClassName="apply-invalid-popover"
                    content={_.get(this.state, 'applyState.applyMessage')}
                    trigger="click">
                    <Button className='crm-detail-add-btn'>
                        {Intl.get('crm.apply.user.new', '申请新用户')}
                    </Button>
                </Popover>)
        );
    }

    //渲染申请用户的提示\面板
    renderApplyUserBlock = () => {
        //只有销售和销售主管才会申请
        let hasApplyPrivilege = userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER);
        if (!this.state.isUserLoading && hasApplyPrivilege && !this.props.isMerge && this.state.isOplateUser) {
            if (this.state.applyFormShowFlag) {
                return (
                    <ApplyUserForm
                        applyFrom="crmUserList"
                        apps={[]}
                        appList={this.state.appList}
                        users={[]}
                        customerName={this.props.curCustomer.name}
                        customerId={this.props.curCustomer.id}
                        cancelApply={this.toggleApplyForm.bind(this)}
                    />);
            } else {
                let tip = (
                    <div className="overview-user-tip">
                        <span className="iconfont icon-warn-icon"/>
                        <span className="no-user-tip-content">
                            {Intl.get('crm.overview.apply.user.tip', '该客户还没有用户')}
                        </span>
                        {this.renderApplyButton()}
                    </div>);
                return <DetailCard content={tip} className="apply-user-tip-contianer"/>;
            }
        }
        return null;
    };

    toggleApplyForm = () => {
        let applyFormShowFlag = !this.state.applyFormShowFlag;
        this.setState({applyFormShowFlag: applyFormShowFlag});
    };

    turnToUserList = () => {
        if (_.isFunction(this.props.changeActiveKey)) this.props.changeActiveKey('4');
    };

    refreshSrollbar = () => {
        //渲染完跟进记录列表后需要重新render来刷新滚动条（因为跟进记录渲染完成后不会走概览页的render，所以滚动条的高度计算还是一开始没有跟进记录时的界面高度）
        this.setState(this.state);
    };

    renderUserApplyForm = () => {
        return (
            <ApplyUserForm
                applyFrom="crmUserList"
                apps={[]}
                appList={this.state.appList}
                users={[]}
                customerName={this.props.curCustomer.name}
                customerId={this.props.curCustomer.id}
                cancelApply={this.closeRightPanel.bind(this)}
            />
        );
    };

    renderCustomerRcord = () => {
        return <CustomerRecord
            isOverViewPanel={true}
            curCustomer={this.state.basicData}
            refreshCustomerList={this.props.refreshCustomerList}
            refreshSrollbar={this.refreshSrollbar}
            changeActiveKey={this.props.changeActiveKey}
            disableEdit={this.props.disableEdit || this.props.isMerge}
            hideContactWay={this.props.hideContactWay}
            updateCustomerLastContact={this.props.updateCustomerLastContact}
        />;
    };

    toggleScheduleContact = (item, flag) => {
        let curSchedule = _.find(this.state.scheduleList, schedule => schedule.id === item.id);
        curSchedule.isShowContactPhone = flag;
        this.setState({scheduleList: this.state.scheduleList});
    };

    //修改状态
    handleItemStatus = (item) => {
        const user_id = userData.getUserData().user_id;
        //只能修改自己创建的日程的状态
        if (user_id !== item.member_id) {
            return;
        }
        const reqData = {
            id: item.id,
            status: item.status === 'false' ? 'handle' : 'false',
        };
        var status = item.status === 'false' ? '完成' : '未完成';
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.item-wrapper .ant-btn'), '修改联系计划的状态为' + status);
        basicOverviewAction.handleScheduleStatus(reqData, (resData) => {
            if (_.isBoolean(resData) && resData) {
                var newStatusObj = {
                    'id': item.id,
                    'status': reqData.status
                };
                basicOverviewAction.afterHandleStatus(newStatusObj);
            } else {
                message.error(resData || Intl.get('crm.failed.alert.todo.list', '修改待办事项状态失败'));
            }
        });
    };

    renderScheduleItem = () => {
        return _.map(this.state.scheduleList, item => {
            return (
                <ScheduleItem
                    item={item}
                    hideDelete={true}
                    hasSplitLine={false}
                    isMerge={this.props.isMerge}
                    toggleScheduleContact={this.toggleScheduleContact}
                    handleItemStatus={this.handleItemStatus}
                />);
        });

    };

    renderUnComplateScheduleList = () => {
        if (!this.props.disableEdit && _.isArray(this.state.scheduleList) && this.state.scheduleList.length) {
            return (
                <DetailCard title={Intl.get('clue.not.complete.schedule','今天的联系计划')}
                    content={this.renderScheduleItem()}/>);
        }
        return null;
    };

    renderSecondLevelDomain = (subDomain) => {
        return <span className="second-level-domain-name">{`${subDomain}.eagok.com`}</span>;
    };
    renderPlatFormName = (platFormName) => {
        return <span className="plat-form-name">{platFormName}</span>;
    };

    //获取集客方式
    getSourceClassify = (sourceClassify) => {
        let displayText = '';
        let displayObj = _.find(sourceClassifyArray, item => item.value === sourceClassify);
        if(!_.isEmpty(displayObj)){
            displayText = displayObj.name;
        }
        return [displayText];
    };

    render() {
        var basicData = this.state.basicData ? this.state.basicData : {};
        let tagArray = _.isArray(basicData.labels) ? basicData.labels : [];
        //线索、转出、已回访标签不可操作的标签，在immutable_labels属性中,和普通标签一起展示，但不可操作
        if (_.isArray(basicData.immutable_labels) && basicData.immutable_labels.length) {
            tagArray = basicData.immutable_labels.concat(tagArray);
        }
        var noRecordData = !this.state.customerRecord.length && !this.state.customerRecordLoading;
        var subDomain = _.get(basicData, 'sub_domains', '');//域名
        var platformName = _.get(basicData,'platform_name','');//平台名称
        return (
            <RightPanelScrollBar isMerge={this.props.isMerge}>
                <div className="basic-overview-contianer">
                    {!this.props.disableEdit && !isCurtao() && hasPrivilege(crmPrivilegeConst.APP_USER_QUERY) ? (
                        _.get(this.state.crmUserList, '[0]') ?
                            this.renderExpireTip() : this.renderApplyUserBlock()) : null}
                    {/*<CustomerStageCard*/}
                    {/*isMerge={this.props.isMerge}*/}
                    {/*updateMergeCustomer={this.props.updateMergeCustomer}*/}
                    {/*disableEdit={this.props.disableEdit}*/}
                    {/*customerStageList={this.state.customerStageList}*/}
                    {/*currentStage={basicData.customer_label}*/}
                    {/*basicData={basicData}*/}
                    {/*editBasicSuccess={this.editBasicSuccess}*/}
                    {/*/>*/}
                    {/*只要负责人或者联合跟进人有一项能修改，就展示*/}
                    {!hasPrivilege(crmPrivilegeConst.CRM_ASSERT_CUSTOMER_SALES) && checkVersionAndType().personal ? null : (
                        <SalesTeamCard
                            isMerge={this.props.isMerge}
                            updateMergeCustomer={this.props.updateMergeCustomer}
                            disableEdit={this.props.disableEdit}
                            customerId={basicData.id}
                            userName={basicData.user_name}
                            userId={basicData.user_id}
                            salesTeam={basicData.sales_team}
                            salesTeamId={basicData.sales_team_id}
                            modifySuccess={this.editBasicSuccess}
                        />
                    )}
                    {
                        subDomain ? (
                            <DetailCard
                                title={`${Intl.get('crm.basic.second.level.domain', '舆情平台域名')}:`}
                                titleBottomBorderNone
                                titleDescr={this.renderSecondLevelDomain(subDomain)}
                            />
                        ) : null
                    }
                    {platformName ? (
                        <DetailCard
                            title={`${Intl.get('crm.basic.plat.form.name', '舆情平台名称')}:`}
                            titleBottomBorderNone
                            titleDescr={this.renderPlatFormName(platformName)}
                        />
                    ) : null}
                    {hasPrivilege(PRIVILEGE_MAP.CRM_CUSTOMER_SCORE_RECORD) && !this.props.disableEdit ? (
                        <CrmScoreCard customerScore={basicData.score} customerId={basicData.id}
                            showUserDetail={this.props.showUserDetail}
                            customerUserSize={_.get(this.state.crmUserList, 'length', 0)}/>) : null
                    }
                    <TagCard title={`${Intl.get('common.tag', '标签')}:`}
                        placeholder={Intl.get('crm.input.new.tag', '请输入新标签')}
                        data={basicData}
                        tags={tagArray}
                        recommendTags={this.state.recommendTags}
                        enableEdit={crmUtil.checkPrivilege([crmPrivilegeConst.CUSTOMER_UPDATE, crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL]) && !this.props.disableEdit}
                        noDataTip={tagArray.length ? '' : Intl.get('crm.detail.no.tag', '暂无标签')}
                        saveTags={this.saveEditTags}
                    />
                    <TagCard title={`${Intl.get('crm.competing.products', '竞品')}:`}
                        placeholder={Intl.get('crm.input.new.competing', '请输入新竞品')}
                        tags={basicData.competing_products}
                        recommendTags={this.state.competitorList}
                        data={basicData}
                        enableEdit={crmUtil.checkPrivilege([crmPrivilegeConst.CUSTOMER_UPDATE, crmPrivilegeConst.CUSTOMER_MANAGER_UPDATE_ALL]) && !this.props.disableEdit}
                        noDataTip={_.get(basicData, 'competing_products[0]') ? '' : Intl.get('crm.no.competing', '暂无竞品')}
                        saveTags={this.saveEditCompetitors}
                    />
                    {
                        _.get(basicData, 'source_classify') ?
                            <TagCard title={`${Intl.get('crm.clue.client.source', '集客方式')}:`}
                                tags={this.getSourceClassify(basicData.source_classify)}
                                data={basicData}
                                enableEdit={false}
                            /> : null
                    }

                    {this.renderUnComplateScheduleList()}
                    <DetailCard
                        title={`${Intl.get('sales.frontpage.recent.record', '最新跟进')}:`}
                        titleBottomBorderNone={noRecordData}
                        titleDescr={noRecordData ? Intl.get('crm.no.trace.record', '还没有跟进过该客户') : ''}
                        content={this.renderCustomerRcord()}
                    />
                </div>
            </RightPanelScrollBar>
        );
    }
}
BasicOverview.propTypes = {
    curCustomer: PropTypes.object,
    ShowCustomerUserListPanel: PropTypes.func,
    isMerge: PropTypes.bool,
    updateMergeCustomer: PropTypes.func,
    isRepeat: PropTypes.bool,
    editCustomerBasic: PropTypes.func,
    changeActiveKey: PropTypes.func,
    refreshCustomerList: PropTypes.func,
    disableEdit: PropTypes.bool,
    hideContactWay: PropTypes.bool,
    updateCustomerLastContact: PropTypes.func,
    showUserDetail: PropTypes.func,
};
module.exports = BasicOverview;

