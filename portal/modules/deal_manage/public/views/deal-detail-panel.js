/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/11/5.
 */
require('../style/deal-detail-panel.less');
import {Button, Menu, Popconfirm, Dropdown, message, Tag, Icon} from 'antd';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import BasicEditSelectField from 'CMP_DIR/basic-edit-field-new/select';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import BasicEditDateField from 'CMP_DIR/basic-edit-field-new/date-picker';
import DetailCard from 'CMP_DIR/detail-card';
import StepsBar from 'CMP_DIR/steps-bar';
import Trace from 'LIB_DIR/trace';
import {disabledBeforeToday, dealTimeNotLessThanToday} from 'PUB_DIR/sources/utils/common-method-util';
import commonDataUtil from 'PUB_DIR/sources/utils/common-data-util';
import {DEAL_STATUS} from 'PUB_DIR/sources/utils/consts';
import {checkBudgetRule} from 'PUB_DIR/sources/utils/validate-util';
import userData from 'PUB_DIR/sources/user-data';
import ApplyUserForm from '../../../crm/public/views/apply-user-form';
import dealBoardAction from '../action/deal-board-action';
import dealAction from '../action';
import dealAjax from '../ajax';
import {formatNumHasDotToFixed} from 'PUB_DIR/sources/utils/common-method-util';
import { PrivilegeChecker,hasPrivilege } from 'CMP_DIR/privilege/checker';
import { orderEmitter } from 'PUB_DIR/sources/utils/emitters';

const TOP_STAGE_HEIGHT = 110;//头部阶段
//展示申请签约用户的阶段
const APPLY_OFFICIALL_STAGES = [Intl.get('crm.141', '成交阶段'), Intl.get('crm.142', '执行阶段')];
//展示申请试用用户的阶段
const APPLY_TIAL_STAGES = [Intl.get('crm.143', '试用阶段'), Intl.get('crm.144', '立项报价阶段'), Intl.get('crm.145', '谈判阶段')];
const HAS_UPDATA = 'SALESOPPORTUNITY_UPDATE';//修改权限的常量
const HAS_DELETE = 'CRM_SALESOPPORTUNITY_DELETE';//删除权限的常量
class DealDetailPanel extends React.Component {
    constructor(props) {
        super(props);
        let initData = this.getInitStateData(props);
        this.state = {
            ...initData,
            appList: [],//应用列表
            stageList: []//订单列表
        };
    }

    getInitStateData(props) {
        return {
            currDealId: _.get(props, 'currDealId', ''),
            loading: false,//正在加载订单详情
            errorMsg: '',//获取订单详情失败的错误提示
            currDeal: _.cloneDeep(props.currDeal) || {},
            isDelConfirmShow: false,//是否时删除订单确认状态的展示
            isDeleting: false,//是否正在删除订单
            curDealCloseStatus: '',//关闭订单的状态（win:赢单，lose:丢单）
            isShowApplyUserForm: false,//是否展示申请用户的表单
            applyType: Intl.get('common.trial.user', '试用用户'),//申请用户的类型：试用用户、正式用户
            applyUserApps: [],//申请用户对应的应用列表
            isAddAppTipShow: false,//是否展示请先添加应用的提示
        };
    }

    componentDidMount() {
        //获取应用列表
        this.getAppList();
        //获取订单阶段列表
        this.getDealStageList();
        if (this.props.currDealId) {
            this.getDealDetail(this.props.currDealId);
        }
    }
    
    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'currDeal') && _.get(nextProps, 'currDeal.id') !== _.get(this.state, 'currDeal.id')) {
            let initData = this.getInitStateData(nextProps);
            this.setState(initData);
        }
        if (nextProps.currDealId && nextProps.currDealId !== this.state.currDealId) {
            this.getDealDetail(nextProps.currDealId);
        }
        if(nextProps.currDeal){
            this.getCurrDeal(nextProps.currDeal);
        }
    }

    getDealDetail(dealId) {
        this.setState({loading: true});
        dealAjax.getDealList({
            page_size: 1,
            page_num: 1,
            sort_field: 'id',
            sort_order: 'descond'
        }, {id: dealId}).then((data) => {
            this.setState({loading: false, errorMsg: '', currDeal: _.get(data, 'result.[0]', {})});
        }, (errorMsg) => {
            this.setState({loading: false, errorMsg: errorMsg || Intl.get('errorcode.118', '获取数据失败')});
        });
    }

    //当拖动改变时更新状态
    getCurrDeal(currDeal){
        this.setState({currDeal});
    }

    //获取应用列表（ketao:产品列表+oplate的应用列表， curtao: 产品列表）
    getAppList = () => {
        commonDataUtil.getAllProductList(appList => {
            this.setState({appList: appList});
        });
    };
    //获取订单阶段列表
    getDealStageList = () => {
        commonDataUtil.getDealStageList(stageList => {
            this.setState({stageList: stageList});
        });
    };
    closeDetailPanel = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.close-modal-btn'), '关闭订单详情界面');
        if (_.isFunction(this.props.hideDetailPanel)) {
            this.props.hideDetailPanel();
        }
    }

    hideDelConfirmTip = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.item-delete-confirm'), '取消删除订单');
        this.setState({
            isDelConfirmShow: false
        });
    };
    //展示是否删除的模态框
    showDelConfirmTip = (e) => {
        Trace.traceEvent(e, '点击删除订单按钮');
        this.setState({
            isDelConfirmShow: true
        });
    };
    //确定删除订单的处理
    deleteDeal = (deal) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.item-delete-confirm'), '确定删除订单');
        if (deal.id) {
            this.setState({isDeleting: true});
            dealAjax.deleteDeal(deal.id).then(result => {
                this.setState({isDeleting: false});
                //关闭此订单详情
                this.closeDetailPanel();
                message.success(Intl.get('crm.138', '删除成功'));
                //将列表中的订单删掉
                if (this.props.isBoardView) {
                    dealBoardAction.afterDeleteDeal(deal);
                } else {
                    dealAction.afterDeleteDeal(deal.id);
                }
                //触发列表更新emitter
                orderEmitter.emit(orderEmitter.REFRESH_ORDER_LIST);
            }, (errorMsg) => {
                this.setState({isDeleting: false});
                message.error(errorMsg || Intl.get('crm.139', '删除失败'));
            });
        }
    };
    renderDealStatus = (status) => {
        if (status) {
            let descr = '', statusClass = '', iconClass = '';
            if (status === DEAL_STATUS.WIN) {
                descr = Intl.get('crm.order.status.won', '赢单');
                statusClass = 'deal-status-win';
                iconClass = 'iconfont icon-deal-win';
            } else if (status === DEAL_STATUS.LOSE) {
                descr = Intl.get('crm.order.status.lost', '丢单');
                statusClass = 'deal-status-lose';
                iconClass = 'iconfont icon-deal-lose';
            }
            return (
                <span className={`deal-status ${statusClass}`}>
                    <span className={iconClass}/>
                    <span className='deal-status-descr'>{descr}</span>
                </span>);
        }
        return null;
    };
    //修改订单的销售阶段
    editDealStage = (sale_stages) => {
        let currDeal = this.state.currDeal;
        let saveObj = {
            customer_id: _.get(currDeal, 'customer_id'),
            id: _.get(currDeal, 'id'),
            sale_stages: sale_stages,
            property: 'sale_stages'
        };
        if (saveObj.customer_id && saveObj.id) {
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.deal-item-title'), '保存订单阶段的修改');
            dealAjax.editDeal(saveObj).then(result => {
                currDeal.sale_stages = sale_stages;
                this.setState({currDeal});
                //更新列表中的订单阶段
                if (this.props.isBoardView) {
                    dealBoardAction.afterEditDealStage({
                        ...saveObj,
                        old_stages: _.get(this.props, 'currDeal.sale_stages')
                    });
                } else {
                    dealAction.updateDeal(saveObj);
                }
            }, (errorMsg) => {
                message.error(errorMsg || Intl.get('common.edit.failed', '修改失败'));
            });
        }
    };
    selectCloseDealStatus = ({item, key}) => {
        this.setState({curDealCloseStatus: key});
    };

    cancelCloseDeal = (e) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.deal-item-title'), '取消关闭订单');
        this.setState({curDealCloseStatus: ''});
    };

    //关闭订单（赢单）
    closeDeal = (status) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.deal-item-title'), '关闭订单并设为赢单');
        if (this.state.isClosingDeal) return;
        this.setState({isClosingDeal: true});
        let deal = this.state.currDeal;
        let saveDeal = {
            customer_id: deal.customer_id,
            id: deal.id,
            oppo_status: status,
            property: 'oppo_status'
        };
        if (saveDeal.customer_id && saveDeal.id) {
            dealAjax.editDeal(saveDeal).then(result => {
                deal.oppo_status = status;
                this.setState({
                    isClosingDeal: false,
                    closeOrderErrorMsg: '',
                    currDeal: deal
                });
                if (this.props.isBoardView) {
                    dealBoardAction.afterCloseDeal({
                        ...saveDeal,
                        sale_stages: _.get(deal, 'sale_stages', '')
                    });
                } else {
                    //更新订单的关闭状态
                    dealAction.updateDeal(saveDeal);
                }
            }, (errorMsg) => {
                this.setState({
                    isClosingDeal: false,
                    closeDealErrorMsg: errorMsg || Intl.get('crm.order.close.failed', '关闭订单失败')
                });
            });
        }
    };

    renderDealStage = (curStage) => {
        let stageList = this.state.stageList;
        let currentStageIndex = _.findIndex(stageList, stage => stage.name === curStage);
        let stageStepList = _.map(stageList, (stage, index) => {
            const stageName = stage.name ? stage.name.split('阶段')[0] : '';
            if (index === currentStageIndex || !hasPrivilege(HAS_UPDATA)) {
                return {title: stageName};
            } else {
                return {
                    title: stageName,
                    //该步骤的处理元素渲染             
                    stepHandleElement: (
                        <Popconfirm title={Intl.get('crm.order.update.confirm', '确定要修改订单阶段？')}
                            onConfirm={this.editDealStage.bind(this, stage.name)} key={index}>
                            <span className="deal-stage-name"/>
                        </Popconfirm>
                    )
                };
            }
        });
        const menu = (
            <Menu onClick={this.selectCloseDealStatus} selectedKeys={[this.state.curDealCloseStatus]}>
                <Menu.Item key={DEAL_STATUS.WIN}>
                    {Intl.get('crm.order.status.win', '赢单')}
                </Menu.Item>
                <Menu.Item key={DEAL_STATUS.LOSE}>
                    {Intl.get('crm.order.status.lose', '丢单')}
                </Menu.Item>
            </Menu>
        );
        //关闭订单项
        const closeDealStep = (
            <Dropdown overlay={menu} trigger={['click']} placement="bottomCenter">
                {this.state.curDealCloseStatus === DEAL_STATUS.WIN ? (
                    <Popconfirm placement="topRight" visible={true} onCancel={this.cancelCloseDeal}
                        onConfirm={this.closeDeal.bind(this, DEAL_STATUS.WIN)}
                        title={Intl.get('crm.order.close.win.confirm', '确定将订单的关闭状态设为赢单吗？')}>
                        <span className="deal-stage-win"/>
                    </Popconfirm>) : (<span className="deal-stage-name"/>)}
            </Dropdown>);
        hasPrivilege(HAS_UPDATA) ?
            stageStepList.push({
                title: Intl.get('crm.order.close.step', '关闭订单'), 
                stepHandleElement: closeDealStep,}) : null;
        return (
            <StepsBar stepDataList={stageStepList} currentStepIndex={currentStageIndex}
                onClickStep={this.onClickStep.bind(this)}/>);
    };
    onClickStep = (event) => {
        $(event.target).parents('.step-item').find('.deal-stage-name').trigger('click');
    };

    showApplyForm = (applyType, deal, apps, e) => {
        Trace.traceEvent(e, '点击订单的申请用户按钮');
        if (apps && !apps.length) {
            this.setState({isAddAppTipShow: true});
            setTimeout(() => {
                this.setState({isAddAppTipShow: false});
            }, 3000);
            return;
        }
        this.setState({
            isShowApplyUserForm: true,
            applyType: applyType,
            applyUserApps: apps
        });
    };

    //渲染填写丢单原因的表单
    renderLoseDealForm = (deal) => {
        return (
            <div className="close-deal-lose-wrap">
                <BasicEditInputField
                    id={deal.id}
                    type="textarea"
                    displayType="edit"
                    field="lose_reason"
                    value={deal.lose_reason}
                    placeholder={Intl.get('crm.order.lose.reason.input', '请输入丢单原因')}
                    saveEditInput={this.saveDealBasicInfo.bind(this, 'oppo_status')}
                    okBtnText={Intl.get('crm.order.lose.confirm', '确认丢单')}
                    cancelEditInput={this.cancelCloseDeal}
                />
            </div>);
    };

    renderDealTitle = () => {
        const deal = this.state.currDeal;
        return (
            <span className="deal-item-title">
                {deal.oppo_status ? (
                    <span>
                        {this.renderDealStatus(deal.oppo_status)}
                    </span>) : (
                    <span>
                        {this.state.curDealCloseStatus === DEAL_STATUS.LOSE ? this.renderLoseDealForm(deal) :
                            this.state.isDelConfirmShow ? (
                                <span>{Intl.get('crm.137', '确定要删除这个订单吗')}?</span>) : this.renderDealStage(deal.sale_stages)}
                        <span className="deal-item-buttons">
                            {this.state.isDelConfirmShow ? (
                                <span className="item-delete-buttons">
                                    <Button className="item-delete-cancel delete-button-style"
                                        onClick={this.hideDelConfirmTip.bind(this, deal)}>
                                        {Intl.get('common.cancel', '取消')}
                                    </Button>
                                    <Button className="item-delete-confirm delete-button-style"
                                        disabled={this.state.isDeleting}
                                        onClick={this.deleteDeal.bind(this, deal)}>
                                        {this.state.isDeleting ? <Icon type="loading"/> : null}
                                        {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                    </Button>
                                </span>) : (
                                <PrivilegeChecker check={HAS_DELETE}>
                                    <span className="iconfont icon-delete handle-btn-item" 
                                        title={Intl.get('common.delete', '删除')}
                                        onClick={this.showDelConfirmTip}/>
                                </PrivilegeChecker>
                            )
                            }
                        </span>
                    </span>
                )}
            </span>
        );
    };

    renderDealBottom = () => {
        let deal = this.state.currDeal;
        //申请按钮文字
        let applyBtnText = '';
        //申请类型
        let applyType = Intl.get('common.trial.user', '试用用户');
        if (APPLY_OFFICIALL_STAGES.indexOf(deal.sale_stages) > -1) {
            applyBtnText = Intl.get('user.apply.user.official', '申请签约用户');
            applyType = Intl.get('common.trial.official', '正式用户');
        } else if (APPLY_TIAL_STAGES.indexOf(deal.sale_stages) > -1) {
            applyBtnText = Intl.get('common.apply.user.trial', '申请试用用户');
        }
        let selectedAppList = this.getSelectedAppList(deal);
        let createTime = deal.time ? moment(deal.time).format(oplateConsts.DATE_FORMAT) : '';
        let isApplyButtonShow = false;
        if ((userData.hasRole(userData.ROLE_CONSTANS.SALES) || userData.hasRole(userData.ROLE_CONSTANS.SALES_LEADER))) {
            isApplyButtonShow = true;
        }
        return (
            <div className="deal-bottom-wrap">
                {applyBtnText && isApplyButtonShow && deal.oppo_status !== DEAL_STATUS.LOSE ? (//丢单后不展示申请用户按钮
                    <Button className="deal-bottom-button"
                        onClick={this.showApplyForm.bind(this, applyType, deal, selectedAppList)}
                    >
                        {applyBtnText}
                    </Button>
                ) : null}
                {this.state.isAddAppTipShow ? (
                    <span className="add-app-tip"> * {Intl.get('crm.153', '请先添加应用')}</span>
                ) : null}
                <span className="deal-add-time">{Intl.get('crm.order.add.to', '添加于{time}', {time: createTime})}</span>
                <span className="deal-user">{deal.user_name || ''}</span>
            </div>
        );
    };
    //修改订单的预算、备注、应用、丢单原因、预计成交、丢单+丢单原因
    saveDealBasicInfo = (property, saveObj, successFunc, errorFunc) => {
        let currDeal = this.state.currDeal;
        saveObj.customer_id = currDeal.customer_id;
        saveObj.property = property;
        if (property === 'oppo_status') {//丢单+丢单原因
            saveObj.oppo_status = DEAL_STATUS.LOSE;
        }
        if(property === 'predict_finish_time') {//预计成交时间
            saveObj.predict_finish_time = dealTimeNotLessThanToday(saveObj.predict_finish_time);
        }
        if (saveObj.id && saveObj.customer_id) {
            dealAjax.editDeal(saveObj).then(result => {
                _.each(saveObj, (value, key) => {
                    currDeal[key] = value;
                });
                this.setState({currDeal});
                if (_.isFunction(successFunc)) successFunc();
                if (this.props.isBoardView) {
                    //丢单+丢单原因
                    if (property === 'oppo_status') {
                        dealBoardAction.afterCloseDeal({...saveObj, sale_stages: currDeal.sale_stages});
                    } else {
                        dealBoardAction.updateDeal({...saveObj, sale_stages: currDeal.sale_stages});
                    }
                } else {
                    //更新订单的关闭状态
                    dealAction.updateDeal(saveObj);
                }
            }, (errorMsg) => {
                if (_.isFunction(errorFunc)) errorFunc(errorMsg || Intl.get('common.save.failed', '保存失败'));
            });
        }
    };

    getSelectedAppList = (deal) => {
        let selectedAppList = [];
        if (_.get(deal, 'apps[0]')) {
            selectedAppList = _.filter(this.state.appList, app => deal.apps.indexOf(app.client_id) > -1);
        }
        return selectedAppList;
    };

    getAppOptions() {
        if (_.get(this.state, 'appList[0]')) {
            return _.map(this.state.appList, app => {
                let appId = app ? app.client_id : '';
                return (
                    <Option key={appId} value={appId}>
                        {app ? app.client_name : ''}
                    </Option>);
            });
        } else {
            return [];
        }
    }

    getSelectAppNames(selectedAppIds) {
        let appList = this.state.appList;
        if (_.get(selectedAppIds, '[0]')) {
            return (
                <span className="deal-application-wrap">
                    {
                        _.map(selectedAppIds, (appId, i) => {
                            let app = _.find(appList, item => item.client_id === appId);
                            if (app) {
                                return (
                                    <Tag key={i} color="#d7e6f7" style={{color: '#4c8ec4'}}>
                                        {app.client_name}
                                    </Tag>);
                            }
                        })
                    }
                </span>);
        } else {
            return '';
        }
    }

    renderDealContent = () => {
        const deal = this.state.currDeal;
        const EDIT_FEILD_WIDTH = 350;
        //确认删除状态下和处于关闭状态时，不可修改订单的信息
        let hasEditPrivilege = !this.state.isDelConfirmShow && !deal.oppo_status && hasPrivilege(HAS_UPDATA);
        return (
            <div className="deal-item modal-container">
                {deal.oppo_status === DEAL_STATUS.LOSE ? (
                    <div className="deal-item-content">
                        <span
                            className="deal-key deal-lose-reason">{Intl.get('crm.order.lose.reason', '丢单原因')}:</span>
                        <BasicEditInputField
                            width={EDIT_FEILD_WIDTH}
                            id={deal.id}
                            type="textarea"
                            field="lose_reason"
                            value={deal.lose_reason}
                            placeholder={Intl.get('crm.order.lose.reason.input', '请输入丢单原因')}
                            hasEditPrivilege={!this.state.isDelConfirmShow}
                            saveEditInput={this.saveDealBasicInfo.bind(this, 'lose_reason')}
                            noDataTip={Intl.get('crm.no.order.lose.reason', '暂无丢单原因')}
                            addDataTip={Intl.get('crm.fill.order.lose.reason', '补充丢单原因')}
                        />
                    </div>) : null}
                <div className="deal-item-content deal-application-list">
                    <span className="deal-key">{Intl.get('call.record.application.product', '应用产品')}:</span>
                    {
                        _.get(this.state, 'appList[0]') ? (
                            <BasicEditSelectField
                                width={EDIT_FEILD_WIDTH}
                                id={deal.id}
                                displayText={this.getSelectAppNames(deal.apps)}
                                value={_.get(deal, 'apps', [])}
                                multiple={true}
                                field="apps"
                                selectOptions={this.getAppOptions()}
                                hasEditPrivilege={hasEditPrivilege}
                                validators={[{
                                    required: true,
                                    message: Intl.get('leave.apply.select.atleast.one.app', '请选择至少一个产品'),
                                    type: 'array'
                                }]}
                                placeholder={Intl.get('leave.apply.select.product', '请选择产品')}
                                saveEditSelect={this.saveDealBasicInfo.bind(this, 'apps')}
                                noDataTip={Intl.get('deal.detail.no.products', '暂无产品')}
                                addDataTip={Intl.get('config.product.add', '添加产品')}/>) : null
                    }
                </div>
                <div className="deal-item-content">
                    <span className="deal-key">{Intl.get('crm.148', '预算金额')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_WIDTH}
                        id={deal.id}
                        // type="number"
                        field="budget"
                        value={formatNumHasDotToFixed(deal.budget, 2)}
                        validators={[{required: true, validator: checkBudgetRule}]}
                        afterValTip={Intl.get('contract.82', '元')}
                        afterTextTip={Intl.get('contract.82', '元')}
                        placeholder={Intl.get('crm.order.budget.input', '请输入预算金额')}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.saveDealBasicInfo.bind(this, 'budget')}
                        noDataTip={Intl.get('crm.order.no.budget', '暂无预算')}
                        addDataTip={Intl.get('crm.order.add.budget', '添加预算')}
                    />         
                </div>
                <div className="deal-item-content">
                    <span className="deal-key">{Intl.get('crm.order.expected.deal', '预计成交')}:</span>
                    <BasicEditDateField
                        width={EDIT_FEILD_WIDTH}
                        id={deal.id}
                        field="predict_finish_time"
                        value={deal.predict_finish_time}
                        placeholder={Intl.get('crm.order.expected.deal.placeholder', '请选择预计成交时间')}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditDateInput={this.saveDealBasicInfo.bind(this, 'predict_finish_time')}
                        disabledDate={disabledBeforeToday}
                        noDataTip={Intl.get('crm.order.no.expected.deal.time', '暂无预计成交时间')}
                        addDataTip={Intl.get('crm.order.add.expected.deal.time', '添加预计成交时间')}
                    /> 
                </div>
                <div className="deal-item-content">
                    <span className="deal-key">{Intl.get('crm.order.remarks', '订单备注')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_WIDTH}
                        id={deal.id}
                        type="textarea"
                        field="remarks"
                        value={deal.remarks}
                        editBtnTip={Intl.get('user.remark.set.tip', '设置备注')}
                        placeholder={Intl.get('user.input.remark', '请输入备注')}
                        hasEditPrivilege={hasEditPrivilege}
                        saveEditInput={this.saveDealBasicInfo.bind(this, 'remarks')}
                        noDataTip={Intl.get('crm.basic.no.remark', '暂无备注')}
                        addDataTip={Intl.get('crm.basic.add.remark', '添加备注')}
                    /> 
                </div>
            </div>
        );
    };
    cancelApply = () => {
        this.setState({
            isAddAppTipShow: false,
            isShowApplyUserForm: false,
            applyType: Intl.get('common.trial.user', '试用用户'),
            applyUserApps: []
        });
    };

    renderDetailContent() {
        let deal = this.state.currDeal;
        let dealContentHeight = $('body').height() - TOP_STAGE_HEIGHT;
        return (
            <div className="deal-detail-content" style={{height: dealContentHeight}}>
                <GeminiScrollbar>
                    <DetailCard className='deal-detail-card-container'
                        content={this.renderDealContent()}
                        bottom={this.renderDealBottom()}
                    />
                    {this.state.isShowApplyUserForm ? (
                        <ApplyUserForm
                            userType={this.state.applyType}
                            apps={this.state.applyUserApps}
                            order={deal}
                            customerName={_.get(deal, 'customer_name')}
                            cancelApply={this.cancelApply}
                            applyFrom="order"
                            appList={this.state.appList}
                        />
                    ) : null}
                </GeminiScrollbar>
            </div>);
    }

    render() {
        return (
            <RightPanelModal
                className="deal-detail-container"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.closeDetailPanel}
                title={this.renderDealTitle()}
                content={this.renderDetailContent()}
                dataTracename="订单详情"
            />);
    }
}

DealDetailPanel.propTypes = {
    isBoardView: PropTypes.bool,
    currDeal: PropTypes.object,
    currDealId: PropTypes.string,
    hideDetailPanel: PropTypes.func
};

export default DealDetailPanel;