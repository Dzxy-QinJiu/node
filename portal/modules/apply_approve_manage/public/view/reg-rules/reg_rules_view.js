/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/24.
 */
import BpmnModeler from 'bpmn-js/lib/Modeler';
import BpmnModdle from 'bpmn-moddle';
var moddle = new BpmnModdle();
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
require('../../style/reg-rules.less');
require('../../style/diagram-js.css');
import classNames from 'classnames';
import {Checkbox, Radio, Button, message} from 'antd';
const RadioGroup = Radio.Group;
import assign from 'lodash/assign';
// import CamundaModdleDescriptor from 'camunda-bpmn-moddle/camunda';
import CamundaModdleDescriptor from '../../../../../camunda.json';
import AddApplyNodePanel from './add_apply_node_panel';
import AddApplyConditionPanel from './add_apply_condition_panel';
import AddApplyCCNodePanel from './add_apply_cc_node_panel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
var applyApproveManageAction = require('../../action/apply_approve_manage_action');
const FORMLAYOUT = {
    PADDINGTOTAL: 260,
};
import {
    FLOW_TYPES,
    ADDTIONPROPERTIES,
    ASSIGEN_APPROVER,
    isSalesOpportunityFlow,
    isVisitApplyFlow,
    isDomainApplyFlow,
    CC_SETTINGT_TYPE,
    isUserApplyFlow, ROLES_SETTING,ALL_COMPONENTS
} from '../../utils/apply-approve-utils';
import {CC_INFO} from 'PUB_DIR/sources/utils/consts';
import ApplyApproveManageStore from '../../store/apply_approve_manage_store';
//是否在蚁坊域的判断方法
const isOrganizationEefung = require('PUB_DIR/sources/utils/common-method-util').isOrganizationEefung;
class RegRulesView extends React.Component {
    constructor(props) {
        super(props);
        var applyRulesAndSetting = _.cloneDeep(this.props.applyTypeData.applyRulesAndSetting);
        var notify_configs = _.cloneDeep(this.props.applyTypeData.notify_configs);
        var customiz_user_range = _.cloneDeep(this.props.applyTypeData.customiz_user_range);
        var customiz_team_range = _.cloneDeep(this.props.applyTypeData.customiz_team_range);
        const customerSaleResponsible = _.get(this.props.applyTypeData, 'variable.origin_customer_sales', 'delete'); // 机会申请中，审批后，分配销售配置
        this.state = {
            applyRulesAndSetting: applyRulesAndSetting,
            notify_configs: notify_configs || {},
            customiz_user_range: customiz_user_range || [],//单独划定一批的用户
            customiz_team_range: customiz_team_range || [],//单独划定一批的团队
            addNodePanelFlow: '',
            addCCNodePanelFlow: '',//添加抄送人的流程类型
            showAddConditionPanel: false,
            roleList: this.props.roleList,//角色列表
            userList: this.props.userList,//用户列表
            teamList: this.props.teamList,//团队列表
            customerSaleResponsible: customerSaleResponsible, // 机会申请，审批通过后，默认作为负责人
            isChangeCustomerSale: false, // 机会申请，审批通过后,是否修改了负责人，默认false
            workflowform_emailto: [],//配置在哪个节点上发送邮件
            ...ApplyApproveManageStore.getState()
        };
    }

    onStoreChange = () => {
        this.setState(ApplyApproveManageStore.getState());
    };

    componentWillReceiveProps(nextProps) {
        this.setState({
            roleList: nextProps.roleList,//角色列表
            userList: nextProps.userList,//用户列表
            teamList: nextProps.teamList,//团队列表
        });
    }

    componentDidMount() {
        // 获取到属性ref为“canvas”的dom节点
        const canvas = this.refs.canvas;
        var bpmnModeler = this.state.bpmnModeler;
        window.BPMN = bpmnModeler;
        bpmnModeler = new BpmnModeler({
            container: canvas,
            propertiesPanel: {
                parent: '#js-properties-panel'//
            },
            moddleExtensions: {
                camunda: CamundaModdleDescriptor
            }

        });
        this.createBpmnTool(bpmnModeler);
        ApplyApproveManageStore.listen(this.onStoreChange);
    }
    componentWillUnmount() {
        ApplyApproveManageStore.unlisten(this.onStoreChange);
    }

    createBpmnTool = (bpmnModeler) => {
        //在这个对象上加上相应的操作方法
        this.setState({
            bpmnModeler: bpmnModeler,
            elementRegistry: bpmnModeler.get('elementRegistry'),
            elementFactory: bpmnModeler.get('elementFactory'),
            bpmnFactory: bpmnModeler.get('bpmnFactory'),
            modeling: bpmnModeler.get('modeling'),
        });
    };


    createNewDiagram(callback) {
        var bpmnXmlStr = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_0i4r441" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="3.2.1">
  <bpmn:process id="Process_0pqepm7" isExecutable="true">
   <bpmn:startEvent id="StartEvent_1k7etac" name="start"/>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_0pqepm7">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1k7etac">
        <dc:Bounds x="156" y="81" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
        this.state.bpmnModeler.importXML(bpmnXmlStr, (err) => {
            if (err) {
                console.error(err);
            } else {
                this.getXML().then(({definitions, context}) => {
                    //手动的添加剩下的节点
                    this.renderFormData(callback);
                });
            }
        });
    }

    getStartNode() {
        return this.getNodeByType('bpmn:StartEvent')[0];
    }

    //获取某种类型的节点
    getNodeByType(type) {
        var elementRegistry = this.state.elementRegistry;
        let nodes = elementRegistry.filter((element, gix) => {
            if (element.type === type) {
                return true;
            }
        });
        return nodes;
    }

    isGatewayNode = (item) => {
        return item.previous && item.previous.indexOf('Gateway') > -1;
    };
    //连接两个节点进行画线
    connectDiffNode = (startNode, endNode) => {
        var viewer = this.state.bpmnModeler;
        var modeling = viewer.get('modeling');
        modeling.connect(startNode, endNode, {
            type: 'bpmn:SequenceFlow'
        });
    };
    //在最后一个流程节点设置相关属性
    lastNodePropertySetting = (elem,isConditionFlow) => {
        if (isSalesOpportunityFlow(_.get(this, 'props.applyTypeData.type'))) {
            elem.distributeSales = true;
        } else {
            elem.distributeSales = false;
        }
        if (isVisitApplyFlow(_.get(this, 'props.applyTypeData.type'))) {
            var isEefungRealm = isOrganizationEefung();
            if(isEefungRealm){
                if(isConditionFlow){
                    elem.distributeSalesToVisit = true;//分配销售字段
                    elem.releaseCustomerToTeamPool = false;
                }else{
                    elem.distributeSalesToVisit = false;
                    elem.releaseCustomerToTeamPool = true;//分配团队字段
                }
            }else{
                //todo 不同组织所传的字段不一样
                elem.distributeSalesToVisit = true;//分配销售字段
                // elem.releaseCustomerToTeamPool = true;//分配团队字段
            }
        } else {
            elem.distributeSalesToVisit = false;
            // elem.releaseCustomerToTeamPool = false;
        }
        if (isDomainApplyFlow(_.get(this, 'props.applyTypeData.type'))) {
            elem.customerSLDUpdate = true;
        } else {
            elem.customerSLDUpdate = false;
        }

    };
    //把表单中的点画到图表中，一些单独设置的条件，也放到bpmn文件中
    renderFormData(callback) {
        var formData = _.get(this, 'state.applyRulesAndSetting.applyApproveRules'),
            elementRegistry = this.state.elementRegistry,
            modeling = this.state.modeling, elementFactory = this.state.elementFactory,
            bpmnFactory = this.state.bpmnFactory;
        if (_.isObject(formData)) {
            _.map(formData, (item, key) => {
                var elementsArr = item['bpmnNode'];
                if (_.isArray(elementsArr)) {
                    _.forEach(elementsArr, (elem, elemIndex) => {
                        //如果该节点是流程的倒数第二个节点（最后一个节点是endtask），并且是销售机会申请，那么在最后一个节点要加上可以分配销售的
                        if (elemIndex + 2 === elementsArr.length && key === FLOW_TYPES.DEFAULTFLOW) {
                            this.lastNodePropertySetting(elem);
                        }

                        var previousNode = null;
                        if (elem.previous) {
                            previousNode = elementRegistry.get(elem.previous);
                        } else {
                            previousNode = this.getStartNode();
                        }
                        var bpmnType = `bpmn:${elem.type}`;
                        var curNode = elementFactory.createShape(Object.assign({type: bpmnType}, {id: elem.id}));
                        var bo = curNode.businessObject;
                        bo.name = elem.showName;
                        //增加节点的审批人，如果是指定的审批人，先不需要加candidateUsers这个属性，加上会报错
                        if (elem.candidateApprover && elem.candidateApprover !== ASSIGEN_APPROVER) {
                            var candidateText = '${' + elem.candidateApprover + '}';
                            if (elem.hideBrack) {
                                candidateText = elem.candidateApprover;
                            }
                            modeling.updateProperties(curNode, {
                                candidateUsers: candidateText
                            });
                        }
                        modeling.appendShape(previousNode, curNode);
                        //如果此节点是条件流程中的最后一个节点，需要再单独把这个节点和结束节点连接起来
                        if (key !== FLOW_TYPES.DEFAULTFLOW && _.isString(elem.next) && elem.next.indexOf('EndTask') > -1) {
                            this.lastNodePropertySetting(elem,true);
                            var nextNode = elementRegistry.get(elem.next);
                            this.connectDiffNode(curNode, nextNode);
                        }
                        //各个节点，单独属性的设置
                        var additonConditionArr = [];
                        //每个属性单独判断
                        _.forEach(ADDTIONPROPERTIES, (item) => {
                            if ('' + elem[item] === 'true') {
                                additonConditionArr.push(bpmnFactory.create('activiti:FormProperty', {
                                    id: item,
                                    name: elem[item]
                                }));
                            }else if(item === 'workflowFormEmailTo' && _.isArray(elem[item])){//发送邮件，在每个节点要配置的抄送人
                                additonConditionArr.push(bpmnFactory.create('activiti:FormProperty', {
                                    id: item,
                                    name: elem[item].join(',')
                                }));
                            }
                        });
                        bo.set('extensionElements', bpmnFactory.create('bpmn:ExtensionElements', {values: additonConditionArr}));

                        //如果上一节点是个网关
                        if (this.isGatewayNode(elem)) {
                            var incomingBo = curNode.incoming[0].businessObject;
                            //网关的条件
                            if (elem.conditionTotalRule) {
                                let bpmnFactory = this.state.bpmnFactory;
                                incomingBo.set('conditionExpression', bpmnFactory.create('bpmn:FormalExpression', {body: elem.conditionTotalRule}));
                                modeling.updateProperties(curNode.incoming[0], {
                                    name: elem.conditionTotalRuleDsc
                                });
                            } else {
                                //网关默认流程
                                modeling.updateProperties(previousNode, {
                                    default: incomingBo,
                                });
                                modeling.updateProperties(curNode.incoming[0], {
                                    name: '默认审批流程'
                                });
                            }
                        }
                    });
                }
            });
        }
        _.isFunction(callback) && callback();
    }

    //获取设置待审批角色的节点
    getSetCandidateNode() {
        var elementRegistry = this.state.elementRegistry;
        let nodes = elementRegistry.filter((element, gix) => {
            if (element.type) {
                return true;
            }
        });
        return nodes;
    }


    getXML = () => {
        var viewer = this.state.bpmnModeler;
        return new Promise((resolve) => {
            viewer.saveXML({format: true}, (err, xml) => {
                moddle.fromXML(xml, {format: true}, (err, definitions, context) => {
                    resolve({definitions, context});
                });
            });

        });
    };

    //获取某种类型的流程节点
    getDiffTypeFlow = (flowType) => {
        return _.get(this, `state.applyRulesAndSetting.applyApproveRules.${flowType}.bpmnNode`);
    };
    addApplyNode = (applyFlow) => {
        this.setState({
            addNodePanelFlow: applyFlow
        });
    };
    addApplyCC = (applyFlow) => {
        this.setState({
            addCCNodePanelFlow: applyFlow
        });
    };
    handleDeleteNode = (flowType, deleteItem) => {
        var applyRulesAndSetting = this.state.applyRulesAndSetting;
        var applyApproveRules = applyRulesAndSetting.applyApproveRules;
        var flowTypeNode = this.getDiffTypeFlow(flowType);
        //把流程的中待审批人所在的节点过滤出来
        applyApproveRules[flowType].bpmnNode = _.filter(flowTypeNode, (item) => deleteItem.id !== item.id);
        this.setState({
            applyRulesAndSetting: applyRulesAndSetting
        });

    };

    handleDeleteCCNode = (flowType, deleteKey) => {
        var notify_configs = this.state.notify_configs;
        var targetObj = _.find(notify_configs, item => item.type === flowType);
        if (targetObj){
            delete targetObj[deleteKey];
        }
        this.setState({
            notify_configs: notify_configs
        });
    };
    //抄送节点
    renderApplyCCNode = (notityConfig, flowType) => {
        var keyNum = 0;
        return (
            <div className="rule-content cc-node-lists">
                {_.isEmpty(notityConfig) ? null : _.map(notityConfig, (item,key) => {
                    keyNum++;
                    var showName = _.isArray(item.show_name) ? item.show_name.join('，') : item.show_name;
                    if (key === 'system_roles' && !item.show_name){
                        var cloneSystem = _.cloneDeep(item);
                        var systemItem = {
                            show_name: []};
                        _.forEach(cloneSystem, role => {
                            switch (role){
                                case 'operations':
                                    systemItem['show_name'].push(Intl.get('apply.add.approve.node.operation', '运营人员'));
                                    break;
                                case 'managers':
                                    systemItem['show_name'].push(Intl.get('common.managers', '管理员'));
                                    break;
                            }
                        });
                        showName = systemItem['show_name'].join('，');
                    }
                    if (key === 'member_ids' && !item.show_name){
                        var cloneSystem = _.cloneDeep(item);
                        var systemItem = {
                            show_name: []};
                        _.forEach(cloneSystem, userId => {
                            var targetObj = _.find(this.state.userList, item => item.userId === userId);
                            if(targetObj){
                                systemItem['show_name'].push(targetObj.nickName);
                            }
                        });
                        showName = systemItem['show_name'].join('，');
                    }
                    return (
                        <div className="item-node">
                            <div className="icon-container">
                                <i className="iconfont icon-active-users"></i>
                            </div>
                            <span className="show-name" title={showName}> {showName}</span>
                            <i className="iconfont icon-close-btn"
                                onClick={this.handleDeleteCCNode.bind(this, flowType, key)}></i>
                        </div>
                    );
                })}
                {keyNum === CC_SETTINGT_TYPE.length ? null : <div className="item-node">
                    <div className="icon-container add-node" onClick={this.addApplyCC.bind(this, flowType)}>
                        <i className="iconfont icon-add handle-btn-item"></i>
                    </div>
                </div>}
            </div>
        );
    };
    renderApplyWorkFlowNode = (candidateRules, flowType) => {
        return (
            <div className="rule-content apply-node-lists">
                {_.map(candidateRules, (item, index) => {
                    var showDeleteIcon = index === _.get(candidateRules, 'length') - 1;
                    var workflowFormEmailTo = _.get(item,'workflowFormEmailTo',[]);
                    return (
                        <div className="item-node">
                            <div className="icon-container">
                                <i className="iconfont icon-active-users"></i>
                            </div>
                            <span className="show-name" title={item.showName}> {item.showName}</span>
                            {showDeleteIcon ? <i className="iconfont icon-close-btn"
                                onClick={this.handleDeleteNode.bind(this, flowType, item)}></i> : null}
                            {item.submitFiles + '' === 'true' ?
                                <span
                                    className="addition-text">{Intl.get('apply.add.approver.submit.files', '可提交文件')}</span> : null}
                            {item.assignNextNodeApprover + '' === 'true' ?
                                <span
                                    className="addition-text">{Intl.get('apply.add.approver.distribute', '指定下一审批人')}</span> : null}
                            {item.distributeSales + '' === 'true' || item.distributeSalesToVisit + '' === 'true' ? <span
                                className="addition-text">{Intl.get('leave.apply.general.apply', '分配销售')}</span> : null}
                            {item.releaseCustomerToTeamPool + '' === 'true' ? <span
                                className="addition-text">{Intl.get('apply.approve.distribute.team', '分配团队')}</span> : null}
                            {_.get(workflowFormEmailTo,'[0]') ?
                                <p className="addition-text workflow-to-email">{Intl.get('apply.approved.receive.email', '接收邮件人员或邮箱')}：
                                    {_.isArray(item.workflowFormEmailToName) ? <p>{item.workflowFormEmailToName.join('，')}</p> : null}
                                </p>
                                : null}
                            <span className="connet-bar"></span>
                        </div>
                    );
                })}
                <div className="item-node">
                    <div className="icon-container add-node" onClick={this.addApplyNode.bind(this, flowType)}>
                        <i className="iconfont icon-add handle-btn-item"></i>
                    </div>
                </div>
            </div>
        );
    };
    setEncoded = (link, name, data) => {
        var encodedData = encodeURIComponent(data);
        if (data) {
            link.addClass('active').attr({
                'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
                'download': name
            });
        } else {
            link.removeClass('active');
        }
    };
    handleSavedBPMNFlow = () => {
        var viewer = this.state.bpmnModeler, applyRulesAndSetting = this.state.applyRulesAndSetting;
        viewer.saveXML({format: true}, (err, xml) => {
            applyRulesAndSetting.bpmnJson = xml;
            var applyId = _.get(this, 'props.applyTypeData.id');
            //表单的内容不需要提交
            var submitObj = {
                customiz_user_range: this.state.customiz_user_range,
                customiz_team_range: this.state.customiz_team_range,
                notify_configs: this.state.notify_configs,
                ...applyRulesAndSetting
            };
            applyApproveManageAction.saveSelfSettingWorkFlowRules(applyId, submitObj, (result) => {
                if(_.isString(result)){
                    message.error(result);
                }else{
                    message.success('保存成功');
                    this.props.updateRegRulesView({
                        ...submitObj,
                        customiz_user_range: JSON.parse(submitObj.customiz_user_range),
                        customiz_team_range: JSON.parse(submitObj.customiz_team_range),
                    });
                }

            });
        });
    };
    removeEndEventNode = () => {
        var defaultBpmnNode = this.getDiffTypeFlow(FLOW_TYPES.DEFAULTFLOW);
        var previousNode = _.last(defaultBpmnNode);
        //看一下最后一个节点的节点类型
        if (previousNode.type === 'EndEvent') {
            //删除最后一个节点
            previousNode = _.last(defaultBpmnNode.pop());
        }
        return previousNode;
    };
    handleSubmitCCApply = () => {
        var notify_configs = _.cloneDeep(this.state.notify_configs);
        //修改抄送人相关信息如果选角色，角色保存的时候要以数组的形式
        _.forEach(notify_configs,(notyType) => {
            if (!_.isArray(_.get(notyType, 'system_roles',''))){
                var systemRoles = _.cloneDeep(_.get(notyType, 'system_roles'));
                notyType['system_roles'] = [];
                _.map(systemRoles,(item,key) => {
                    if (key !== 'show_name'){
                        notyType['system_roles'].push(key);
                    }

                });
            }
        });
        var submitObj = {
            id: _.get(this, 'props.applyTypeData.id'),
            notify_configs: notify_configs
        };
        applyApproveManageAction.editSelfSettingWorkFlow(submitObj, (result) => {
            if(_.isString(result)){
                message.error(result);
            }else{
                message.success('保存成功');
            }
        });

    };
    handleSubmitApproveApply = () => {
        var applyRulesAndSetting = this.state.applyRulesAndSetting;
        //需要在最后加上最后一个节点,需要先判断之前是不是有结束节点
        var defaultBpmnNode = this.getDiffTypeFlow(FLOW_TYPES.DEFAULTFLOW);
        var previousNode = _.last(defaultBpmnNode);
        //看一下最后一个节点的节点类型
        if (previousNode.type === 'EndEvent') {
            //删除最后一个节点
            defaultBpmnNode.pop();
            previousNode = _.last(defaultBpmnNode);
        }
        var previousNodeIndex = _.get(previousNode, 'flowIndex');
        var nodeIndexArr = _.split(previousNodeIndex, '_');
        nodeIndexArr.splice(nodeIndexArr.length - 1, 1, parseInt(_.last(nodeIndexArr)) + 1);
        var newIndex = nodeIndexArr.join('_');
        previousNode.next = `EndTask_${newIndex}`;
        defaultBpmnNode.push({
            name: `EndTask_${newIndex}`,
            id: `EndTask_${newIndex}`,
            type: 'EndEvent',
            previous: `UserTask_${previousNodeIndex}`,
            showName: 'end',
            flowIndex: `${newIndex}`,
        });
        //其他流程最后一个节点的next设置为endEvent
        var applyApproveRules = _.get(applyRulesAndSetting, 'applyApproveRules');
        if (_.isObject(applyApproveRules)) {
            _.map(applyApproveRules, (flowType, typeKey) => {
                if (typeKey !== FLOW_TYPES.DEFAULTFLOW) {
                    var elementsArr = flowType['bpmnNode'];
                    if (_.isArray(elementsArr)) {
                        var lastNode = _.last(elementsArr);
                        if (lastNode) {
                            lastNode.next = `EndTask_${newIndex}`;
                        }
                    }
                }
            });
        }
        //保存的时候进行画图
        this.createNewDiagram(() => {
            this.handleSavedBPMNFlow();
        });

    };
    handleCancelApproveApply = () => {

    };
    hideRightAddPanel = () => {
        this.setState({
            addNodePanelFlow: '',
            showAddConditionPanel: false,
            addCCNodePanelFlow: '',
            updateConditionObj: {},
            updateConditionFlowKey: ''
        });
    };

    saveAddCCApproveNode = (data) => {
        var addCCType = this.state.addCCNodePanelFlow;
        var notify_configs = this.state.notify_configs;
        var targetObj = _.find(notify_configs, item => item.type === addCCType);
        for (var key in data){
            targetObj[key] = data[key];
        }
        this.setState({
            notify_configs: notify_configs
        });
    };
    saveAddApproveNode = (data) => {
        //新加节点的数据,要把原来最后一个节点的next加上，先判断之前的数据结构中是不是有结束节点
        var applyFlow = this.state.addNodePanelFlow;
        var applyRulesAndSetting = this.state.applyRulesAndSetting;
        var applyFlowObj = _.get(applyRulesAndSetting, ['applyApproveRules',applyFlow], {});
        var bpmnNodeFlow = _.get(applyFlowObj, 'bpmnNode', []);
        var defaultBpmnNode = this.getDiffTypeFlow(FLOW_TYPES.DEFAULTFLOW);
        //如果是默认流程
        var previousNode = _.last(bpmnNodeFlow);
        //看一下最后一个节点的节点类型
        if (!previousNode) {
            //如果上一个节点不存在，那就指定为网关节点
            previousNode = _.find(defaultBpmnNode, item => item.type === 'ExclusiveGateway');

        }
        if (_.get(previousNode, 'type') === 'EndEvent') {
            //删除最后一个节点
            bpmnNodeFlow.pop();
            previousNode = _.last(bpmnNodeFlow);
        }
        if (_.get(previousNode, 'type') === 'ExclusiveGateway') {
            var nodeIndexArr = applyFlow.split('_');
            var newIndex = _.last(nodeIndexArr) + '_' + '1';
            var newNodeObj = {
                name: `UserTask_${newIndex}`,
                id: `UserTask_${newIndex}`,
                type: 'UserTask',
                previous: 'Gateway_1_1',
                flowIndex: `${newIndex}`
            };
            //如果流程不是默认流程并且流程上没有节点，在添加这个节点的时候需要加上条件
            if (applyFlow !== FLOW_TYPES.DEFAULTFLOW && !bpmnNodeFlow.length) {
                var limitRules = _.get(applyRulesAndSetting, `applyApproveRules.${applyFlow}.conditionRuleLists.limitRules`, []);
                this.updateCustomizeNode(limitRules,newNodeObj);
            }
        } else {
            //如果是第一个节点
            if (previousNode) {
                var previousNodeIndex = _.get(previousNode, 'flowIndex');
                var nodeIndexArr = _.split(previousNodeIndex, '_');
                nodeIndexArr.splice(nodeIndexArr.length - 1, 1, parseInt(_.last(nodeIndexArr)) + 1);
                var newIndex = nodeIndexArr.join('_');
                previousNode.next = `UserTask_${newIndex}`;
                var newNodeObj = {
                    name: `UserTask_${newIndex}`,
                    id: `UserTask_${newIndex}`,
                    type: 'UserTask',
                    previous: `UserTask_${previousNodeIndex}`,
                    flowIndex: `${newIndex}`
                };
            } else {
                var newIndex = '1_2';
                var newNodeObj = {
                    name: `UserTask_${newIndex}`,
                    id: `UserTask_${newIndex}`,
                    type: 'UserTask',
                    flowIndex: `${newIndex}`
                };
            }

        }
        for (var key in data) {
            newNodeObj[key] = data[key];
        }
        bpmnNodeFlow.push(newNodeObj);
        //为了避免bpmnNodeFlow在condition中没有值的情况，在这里重新设置一下
        applyFlowObj['bpmnNode'] = bpmnNodeFlow;
    };
    //更新每个节点上总的条件
    updateCustomizeNode = (limitRules,newNodeObj) => {
        //limitRules是流程所加的限制条件
        _.forEach(limitRules, (item, index) => {
            if (index === 0) {
                newNodeObj['conditionTotalRule'] = _.get(item, 'conditionRule');
                newNodeObj['conditionTotalRuleDsc'] = _.get(item, 'conditionRuleDsc');
            } else {
                //如果是有两个条件或者多个条件的时候
                //如果有多个条件的时候，需要用类似于这样的展示方式增加条件${user_range=="b0292bef-a1f8-4ce5-80d2-1a0f58a67ba1" && condition&gt;3.0}
                newNodeObj['conditionTotalRule'] = _.replace(newNodeObj['conditionTotalRule'], '}', '');
                newNodeObj['conditionTotalRule'] += '  \&& ' + _.replace( _.get(item, 'conditionRule'), '${', '');
                newNodeObj['conditionTotalRuleDsc'] += '并且' + _.get(item, 'conditionRuleDsc');

            }
            //如果是单独划分出一批人，需要单独把这些人传过去
            var customiz_user_range = [];
            if(item.limitType === 'userSearch_limit'){
                customiz_user_range.push({
                    'range_key': _.get(item,'userRangeRoute'),
                    'range_users': _.get(item,'userRange')
                });

            }
            this.setState({
                customiz_user_range: customiz_user_range
            });
        });
    };
    saveAddApprovCondition = (data) => {
        //再原来默认的流程上加上一个网关，然后把添加的条件改成节点，有利于画图
        var applyRulesAndSetting = this.state.applyRulesAndSetting;
        var applyApproveRules = _.get(applyRulesAndSetting, 'applyApproveRules');
        //要在默认流程那里加一个网关,只限于在第一次添加网关的时候
        var defaultBpmnNode = this.getDiffTypeFlow(FLOW_TYPES.DEFAULTFLOW);
        var firstNode = _.get(defaultBpmnNode, '[0]');
        if (!data.updateConditionFlowKey && firstNode.type !== 'ExclusiveGateway') {
            firstNode['previous'] = 'Gateway_1_1';
            var secondNode = _.get(defaultBpmnNode, '[1]');
            defaultBpmnNode.splice(0, 0, {
                name: 'Gateway_1_1',
                id: 'Gateway_1_1',
                type: 'ExclusiveGateway',
                next: 'UserTask_1_2',
                flowIndex: '1_1'
            });
        }
        var initialValue = 1;
        for (var key in applyApproveRules) {
            initialValue++;
        }
        //还需要把节点上的条件改一下
        if (data.updateConditionFlowKey) {
            var flowKey = data.updateConditionFlowKey;
            delete data.updateConditionFlowKey;
            applyApproveRules[flowKey]['conditionRuleLists'] = data;
            var limitRules = _.get(data, 'limitRules', []);
            var firstNode = _.get(applyApproveRules[flowKey], 'bpmnNode[0]',{});
            this.updateCustomizeNode(limitRules,firstNode);
        } else {
            applyApproveRules[`condition_${initialValue}`] = {
                bpmnNode: [],
                conditionRuleLists: data,
                ccPerson: []
            };
        }

        this.setState({
            applyRulesAndSetting
        });
    };
    isUserLimit = (item) => {
        return _.get(item,'limitType') === `${ALL_COMPONENTS.USER_SEARCH}_limit`;
    };
    //是否有添加用户的条件
    hasAddUserLimit = (list) => {
        return _.find(list,item => this.isUserLimit(item));
    };
    isTeamLimit = (item) => {
        return _.get(item,'limitType') === `${ALL_COMPONENTS.TEAM_SEARCH}_limit`;
    };
    //是否有添加团队的条件
    hasAddTeamLimit = (list) => {
        return _.find(list,item => this.isTeamLimit(item));
    };

    //给除了默认流程之外的其他条件审批流程加上user_range 或者team_range为none的条件
    addDefaultUserOrTeamCondition = () => {
        //如果这几个条件中，有一个有userRange 或者有teamRange，并且当前这个条件中没有设置团队或者用户，需要加上团队或者用户字段为none
        var applyApproveRules = _.get(this.state.applyRulesAndSetting,'applyApproveRules',{});
        var customiz_user_range = [], customiz_team_range = [];
        _.forEach(applyApproveRules,(value,flowKey) => {
            if(flowKey === 'defaultFlow'){
                //默认流程不做处理
                return;
            }
            var otherLimitList = [];
            for(var key in applyApproveRules){
                if(key !== flowKey){
                    otherLimitList = otherLimitList.concat(_.get(applyApproveRules[key],'conditionRuleLists.limitRules',[]));
                }
            }
            var limitRules = _.get(value,'conditionRuleLists.limitRules'),//当前的限制条件
                newNodeObj = _.get(value,'bpmnNode[0]');//当前的node节点
            var hasUserLimitBeside = this.hasAddUserLimit(otherLimitList);//除该条件外其他条件是否有userRange
            var hasTeamLimitBeside = this.hasAddTeamLimit(otherLimitList);//除该条件外其他条件是否有teamRange
            var hasUserLimit = this.hasAddUserLimit(limitRules);//该是否有用户申请
            var hasTeamLimit = this.hasAddTeamLimit(limitRules);//是否有团队申请

            _.forEach(limitRules, item => {
                //如果是单独划分出一批人，需要单独把这些人传过去
                if(this.isUserLimit(item)){
                    customiz_user_range.push({
                        'range_key': _.get(item,'userRangeRoute'),
                        'range_users': _.get(item,'userRange')
                    });

                }
                //如果是单独划分出一些团队，把组织相关的人和key单独传到后端
                if(this.isTeamLimit(item)){
                    customiz_team_range.push({
                        'range_key': _.get(item,'teamRangeRoute'),
                        'range_teams': _.get(item,'teamRange')
                    });
                }
            });

            if(!_.isEmpty(newNodeObj)){
                if(_.isString(newNodeObj['conditionTotalRule'])){
                    if(newNodeObj['conditionTotalRule'].indexOf('none') === -1){//之前没有自动补齐没有用户/团队的条件
                        if(hasUserLimitBeside && !hasUserLimit){
                            //加上该属性
                            newNodeObj['conditionTotalRule'] = _.replace(newNodeObj['conditionTotalRule'], '}', '');
                            newNodeObj['conditionTotalRule'] += '  \&& user_range == "none"}';//如果有一个条件选择了用户，自动补齐其他没有选择用户的条件
                        }
                        if(hasTeamLimitBeside && !hasTeamLimit){
                            newNodeObj['conditionTotalRule'] = _.replace(newNodeObj['conditionTotalRule'], '}', '');
                            newNodeObj['conditionTotalRule'] += '  \&& team_range == "none"}';
                        }
                    }else{//之前有自动补齐有用户/团队的条件
                        if(!hasUserLimitBeside && !hasUserLimit){
                            newNodeObj['conditionTotalRule'] = _.replace(newNodeObj['conditionTotalRule'], '  && user_range == "none"', '');
                        }
                        if(!hasTeamLimitBeside && !hasTeamLimit){
                            newNodeObj['conditionTotalRule'] = _.replace(newNodeObj['conditionTotalRule'], '  && team_range == "none"', '');
                        }
                        if(hasUserLimitBeside && !hasUserLimit){
                            //加上该属性
                            newNodeObj['conditionTotalRule'] = _.replace(newNodeObj['conditionTotalRule'], '}', '');
                            newNodeObj['conditionTotalRule'] += '  \&& user_range == "none"}';//如果有一个条件选择了用户，自动补齐其他没有选择用户的条件
                        }
                        if(hasTeamLimitBeside && !hasTeamLimit){
                            newNodeObj['conditionTotalRule'] = _.replace(newNodeObj['conditionTotalRule'], '}', '');
                            newNodeObj['conditionTotalRule'] += '  \&& team_range == "none"}';
                        }
                    }
                }
            }
        });
        this.setState({
            customiz_user_range: _.uniqBy(customiz_user_range, 'range_key'),
            customiz_team_range: _.uniqBy(customiz_team_range, 'range_key')
        });

    };
    handleOtherCheckChange = (e) => {
        var applyRulesAndSetting = _.get(this, 'state.applyRulesAndSetting');
        applyRulesAndSetting.mergeSameApprover = e.target.checked;
        this.setState({
            applyRulesAndSetting: applyRulesAndSetting
        });
    };
    handleCancelCheckChange = (e) => {
        var applyRulesAndSetting = _.get(this, 'state.applyRulesAndSetting');
        applyRulesAndSetting.cancelAfterApprove = e.target.checked;
        this.setState({
            applyRulesAndSetting: applyRulesAndSetting
        });
    };
    handleAddConditionProcess = () => {
        this.setState({
            showAddConditionPanel: true
        });
    };
    handleDeleteConditionItem = (key) => {
        this.setState({
            confirmDeleteItem: key
        });
    };
    handleCancelDeleteItem = () => {
        this.setState({
            confirmDeleteItem: ''
        });
    };
    handleConfirmDeleteItem = () => {
        var deleteKey = this.state.confirmDeleteItem;
        if (deleteKey) {
            var applyRulesAndSetting = _.get(this, 'state.applyRulesAndSetting');
            var applyApproveRules = _.get(applyRulesAndSetting, 'applyApproveRules');
            //删除这个流程之前要把设置的划定一批人也删除掉
            var limitRoutes = _.map(_.get(applyApproveRules[deleteKey],'conditionRuleLists.limitRules',[]),'userRangeRoute');
            var customiz_user_range = this.state.customiz_user_range;
            if(!_.isEmpty(limitRoutes)){
                _.forEach(limitRoutes,routeKey => {
                    customiz_user_range = _.filter(customiz_user_range, range => range.range_key !== routeKey);
                });
            }
            //删除这个流程之前要把设置的团队也删除
            var limitRules = _.get(applyApproveRules[deleteKey],'conditionRuleLists.limitRules',[]);
            var teamLimitRoutes = _.map(limitRules,'teamRangeRoute');
            var {customiz_team_range} = this.state;
            if(!_.isEmpty(teamLimitRoutes)){
                _.forEach(teamLimitRoutes,routeKey => {
                    customiz_team_range = _.filter(customiz_team_range, range => range.range_key !== routeKey);
                });
            }
            delete applyApproveRules[deleteKey];
            var flowLength = 0;
            for (var key in applyApproveRules) {
                flowLength++;
            }
            //如果只剩最后一个默认流程，就把网关也去掉
            if (flowLength === 1) {
                var defalutBpmnNode = this.getDiffTypeFlow(FLOW_TYPES.DEFAULTFLOW);
                //网关就是第一个元素
                defalutBpmnNode.splice(0, 1);
                var firstNode = _.get(defalutBpmnNode, '[0]');
                delete firstNode.previous;
            }
            this.setState({
                applyRulesAndSetting,
                customiz_user_range,
                customiz_team_range,
                confirmDeleteItem: '',
            });
        }

    };
    //修改某个节点的条件
    handleUpdateConditionItem = (key) => {
        var applyApproveRules = _.get(this, 'state.applyRulesAndSetting.applyApproveRules');
        this.setState({
            showAddConditionPanel: true,
            updateConditionObj: _.get(applyApproveRules[key], 'conditionRuleLists'),
            updateConditionFlowKey: key
        });
    };
    renderAddConditionFlow = () => {
        var applyApproveRules = _.get(this, 'state.applyRulesAndSetting.applyApproveRules');
        return (
            <div className='condition-container'>
                {_.map(applyApproveRules, (item, key) => {
                    if (key.indexOf('condition') > -1) {
                        var conditionRuleLists = _.get(item, 'conditionRuleLists');
                        return (
                            <div className="condition-item-content">
                                <div className="condition-item condition-item-title-wrap">
                                    <span className="condition-item-title">
                                        {_.get(conditionRuleLists, 'conditionTitle')}
                                    </span>
                                    <span className="pull-right condition-operate">
                                        {this.state.confirmDeleteItem === key ? <span className="confirm-btns">
                                            <Button className='confirm-delete'
                                                onClick={this.handleConfirmDeleteItem}>{Intl.get('crm.contact.delete.confirm', '确认删除')}</Button>
                                            <Button
                                                onClick={this.handleCancelDeleteItem}>{Intl.get('common.cancel', '取消')}</Button>
                                        </span> : <span className="iconfont-wrap"> <i className="iconfont icon-update"
                                            onClick={this.handleUpdateConditionItem.bind(this, key)}></i>
                                        <i className="iconfont icon-delete handle-btn-item"
                                            onClick={this.handleDeleteConditionItem.bind(this, key)}></i></span>}

                                    </span>
                                </div>
                                <div className="condition-item condition-item-des">
                                    <span
                                        className="condition-item-label">{Intl.get('apply.add.qualify.condition', '满足条件')}:</span>
                                    <ul>
                                        {_.map(_.get(conditionRuleLists, 'limitRules'), ruleItem => {
                                            return (
                                                <li>
                                                    <i className="icon-tip"></i>
                                                    {ruleItem.limitTypeDsc}:
                                                    {ruleItem.conditionRuleDsc}
                                                </li>
                                            );
                                        })}
                                    </ul>

                                </div>
                                <div className="condition-item condition-item-flow">
                                    <span
                                        className="condition-item-label">{Intl.get('apply.condition.apply.approve', '审批流程')}:</span>
                                    {_.get(item, 'bpmnNode.length') ? this.renderApplyWorkFlowNode(item.bpmnNode, key) :
                                        <div className="rule-content apply-node-lists">
                                            <div className="icon-container add-node"
                                                onClick={this.addApplyNode.bind(this, key)}>
                                                <i className="iconfont icon-add handle-btn-item"></i>
                                            </div>
                                        </div>
                                    }
                                </div>
                                {/*<div className="condition-item condition-item-cc">*/}
                                {/*    <span*/}
                                {/*        className="condition-item-label">{Intl.get('apply.condition.item.add.cc', '抄送人')}:</span>*/}
                                {/*</div>*/}

                            </div>
                        );
                    } else {
                        return null;
                    }
                })}
            </div>
        );
    };
    //修改抄送的类型
    changeCCInformate = (cctype) => {
        //cctype 是个数组
        var notify_configs = this.state.notify_configs;
        var ccInfoclone = _.cloneDeep(notify_configs);
        notify_configs = [];

        _.forEach(cctype, item => {
            var targetObj = _.find(ccInfoclone, configItem => configItem.type === item);
            if (targetObj){
                notify_configs.push(targetObj);
            }else{
                notify_configs.push({
                    type: item,
                    email_notice: true,
                    socket_notice: true
                });
            }
        });
        this.setState({notify_configs});
    };
    //修改提醒的方式
    changeCCInformateType = (ccType,infoType) => {
        var notify_configs = this.state.notify_configs;
        var notityConfig = _.find(notify_configs, item => item.type === ccType);
        delete notityConfig.email_notice;
        delete notityConfig.socket_notice;
        _.forEach(infoType, item => {
            notityConfig[item] = true;
        });
        this.setState({
            notify_configs
        });
    };
    //点击保存流程，如果没有修改流程节点，只需要走修改流程的接口，如果修改了节点，需要走重布的接口
    handleSubmitWorkflow = () => {
        //点击保存之前对节点数量进行校验，如果有节点选中了指定下一节点审批人（assignNextNodeApprover： true）需要校验是否有下一个节点
        var applyApproveRulesNodes = _.get(this.state, 'applyRulesAndSetting.applyApproveRules');//所保存的节点
        var showAddNextNodeTip = false, //是否展示要添加下一节点的提示
            showAddApproveNodeTip = false;//是否展示添加审批人节点的提示
        _.each(applyApproveRulesNodes, (value, key) => {
            if(showAddNextNodeTip || showAddApproveNodeTip){
                return;
            }
            var bpmnNode = _.get(value,'bpmnNode',[]);
            if(_.isEmpty(bpmnNode)){//如果bpmnNode没有值，提示要加上审批人节点
                showAddApproveNodeTip = true;
            }
            showAddNextNodeTip = _.some(bpmnNode, (item,index) => {
                //该节点设置了指定下一节点审批人并且下一节点没有添加审批人
                return item['assignNextNodeApprover'] + '' === 'true' && _.get(bpmnNode, `[${index + 1}].type`) !== 'UserTask';
            });

        });

        if(showAddNextNodeTip){
            message.warning(Intl.get('apply.please.add.assign.node', '流程不完整，需添加“指定审批人审批节点”'));
        }else if(showAddApproveNodeTip){
            message.warning(Intl.get('apply.please.add.approve.node', '流程不完整，需添加审批人节点'));
        }else{
            const isChangeRuleNotify = this.isChangeRuleNotify();
            // 修改了分配销售的职责,需要发请求处理
            if (this.state.isChangeCustomerSale) {
                this.handleApprovedSettingWordFlow();
            }
            // 判断是否修改了其他配置，若修改了其他配置，需要同时保存
            if (isChangeRuleNotify) {
            //在提交的时候，把用户或者团队为非的情况也加上
                this.addDefaultUserOrTeamCondition();
                if (_.isEqual(_.get(this.props, 'applyTypeData.applyRulesAndSetting.applyApproveRules'), applyApproveRulesNodes)){
                    this.handleSubmitCCApply();
                }else{
                    this.handleSubmitApproveApply();
                }
            }
        }
    };
    handleDownLoadBPMN = () => {
        var viewer = this.state.bpmnModeler;
        var downloadSvgLink = $('#js-download-svg');
        var downloadLink = $('#js-download-diagram');
        viewer.saveXML({format: true}, (err, xml) => {
            this.setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
        });
    };
    // 判断是否修改了流程、通知
    isChangeRuleNotify = () => {
        const applyApproveRulesNodes = _.get(this.state, 'applyRulesAndSetting.applyApproveRules');//所保存的节点
        // 判断是否修改了流程
        const isChangeApplyRule = !_.isEqual(_.get(this.props, 'applyTypeData.applyRulesAndSetting.applyApproveRules'), applyApproveRulesNodes);
        // 判断是否修改了通知的配置
        const isChangeNoticeConfig = !_.isEqual(_.get(this.props, 'applyTypeData.notify_configs'), this.state.notify_configs);
        return isChangeApplyRule || isChangeNoticeConfig;
    };
    // 修改审批通知后的自定义流程
    handleApprovedSettingWordFlow = () => {
        const submitObj = {
            id: _.get(this, 'props.applyTypeData.id'),
            variable: {
                origin_customer_sales: this.state.customerSaleResponsible
            }
        };
        applyApproveManageAction.approvedSettingWordFlow(submitObj, (result) => {
            this.setState({
                isChangeCustomerSale: false
            });
            if (result === true) {
                // 只修改了审批通过后，分配销售的操作，才提示
                const isChangeRuleNotify = this.isChangeRuleNotify();
                if (!isChangeRuleNotify) {
                    message.success(Intl.get('common.save.success', '保存成功'));
                }
            } else {
                message.error(result);
            }
        });
    };

    // 审批通过后，配置中修改负责人的处理
    handleChangeApproveResponsible = (e) => {
        const customerSaleResponsible = e.target.value;
        this.setState({ customerSaleResponsible, isChangeCustomerSale: true });
    };
    render = () => {
        var hasErrTip = this.state.titleRequiredMsg;
        var cls = classNames('', {
            'err-tip': hasErrTip
        });
        var addPanelWrap = classNames({'show-add-node-modal': this.state.addCCNodePanelFlow || this.state.addNodePanelFlow || this.state.showAddConditionPanel});
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL + 110;
        var defaultRules = this.getDiffTypeFlow(FLOW_TYPES.DEFAULTFLOW);
        //把默认流程的中待审批人所在的节点过滤出来
        var candidateRules = _.filter(defaultRules, (item) => item.candidateApprover);
        //提交申请时通知
        var ccApplyInforType = [],ccApproveInforType = [],ccInformationType = [];
        var notify_configs = this.state.notify_configs;
        if (_.find(notify_configs, item => item.type === CC_INFO.APPLY_NOTIFY_CONFIG)){
            ccInformationType.push(CC_INFO.APPLY_NOTIFY_CONFIG);
        }
        if (_.find(notify_configs, item => item.type === CC_INFO.APPROVE_NOTIFY_CONFIG)){
            ccInformationType.push(CC_INFO.APPROVE_NOTIFY_CONFIG);
        }
        var applyNoty = _.find(notify_configs, item => item.type === CC_INFO.APPLY_NOTIFY_CONFIG);
        if (applyNoty){
            var cloneApplyNoty = _.cloneDeep(applyNoty);//删掉这两个属性是为了渲染抄送人的时候方便操作
            delete cloneApplyNoty['email_notice'];
            delete cloneApplyNoty['socket_notice'];
            delete cloneApplyNoty['type'];
        }
        var approveNoty = _.find(notify_configs, item => item.type === CC_INFO.APPROVE_NOTIFY_CONFIG);
        if (approveNoty){
            var cloneApproveNoty = _.cloneDeep(approveNoty);//删掉这两个属性是为了渲染抄送人的时候方便操作
            delete cloneApproveNoty['email_notice'];
            delete cloneApproveNoty['socket_notice'];
            delete cloneApproveNoty['type'];
        }


        _.forEach(applyNoty,(value,key) => {
            if ((key === 'email_notice' || key === 'socket_notice') && value){
                ccApplyInforType.push(key);
            }
        });
        _.forEach(approveNoty,(value,key) => {
            if ((key === 'email_notice' || key === 'socket_notice') && value){
                ccApproveInforType.push(key);
            }
        });

        var applyType = _.get(this, 'props.applyTypeData.type');
        return (
            <div className="reg-rule-container" style={{'height': divHeight}}>
                <GeminiScrollbar>
                    <div className="reg-rule-wrap">
                        <div className="default-apply-workflow rule-item">
                            <span className="item-label">
                                {Intl.get('apply.default.apply.workflow', '默认审批流程')}:
                            </span>
                            {this.renderApplyWorkFlowNode(candidateRules, FLOW_TYPES.DEFAULTFLOW)}
                        </div>
                        <div className="condition-apply-workflow rule-item">
                            <span className="item-label">
                                {Intl.get('apply.condition.work.flow', '条件审批流程')}:
                            </span>
                            <div className="rule-content condition-block">
                                <a className="add-condition"
                                    onClick={this.handleAddConditionProcess}>{Intl.get('apply.add.condition.workflow', '添加条件审批流程')}</a>
                                {this.renderAddConditionFlow()}
                            </div>
                        </div>
                        <div className="inform-cc rule-item">
                            <span className="item-label">
                                {Intl.get('menu.notification', '通知')}：
                            </span>
                            <div className="rule-content info-container">
                                <Checkbox.Group onChange={this.changeCCInformate} defaultValue={ccInformationType}>
                                    <div className="cc-info-type">
                                        <Checkbox value={CC_INFO.APPLY_NOTIFY_CONFIG}>
                                            {Intl.get('apply.cc.when,submit', '提交申请时通知审批人')}
                                        </Checkbox>
                                        {_.includes(ccInformationType, CC_INFO.APPLY_NOTIFY_CONFIG) ?
                                            <div>
                                                <div className='apply-cc-node'>
                                                    <span className="cc-person-label sub-item-label">{Intl.get('apply.condition.item.add.cc', '抄送人')}</span>
                                                    {/*选中该选项才会有下面添加抄送人*/}
                                                    {this.renderApplyCCNode(cloneApplyNoty, CC_INFO.APPLY_NOTIFY_CONFIG)}
                                                </div>
                                                <div className="cancel-privilege">
                                                    <span className="sub-item-label">
                                                        {Intl.get('apply.cc.node.infor.type', '通知方式')}
                                                    </span>
                                                    <div className="info-ways-checks">
                                                        <Checkbox.Group onChange={this.changeCCInformateType.bind(this, CC_INFO.APPLY_NOTIFY_CONFIG)}
                                                            defaultValue={ccApplyInforType}>
                                                            <Checkbox value="email_notice">
                                                                {Intl.get('apply.cc.node.email', '邮件')}
                                                            </Checkbox>
                                                            <Checkbox value='socket_notice'>
                                                                {Intl.get('apply.cc.node.socket.noty', '系统弹窗')}
                                                            </Checkbox>
                                                        </Checkbox.Group>
                                                    </div>
                                                </div>
                                            </div>
                                            : null}
                                    </div>
                                    <div className="cc-info-type">
                                        <Checkbox value={CC_INFO.APPROVE_NOTIFY_CONFIG}>
                                            {Intl.get('apply.cc.when.approve.apply', '审批通过后通知申请人')}
                                        </Checkbox>
                                        {_.includes(ccInformationType, CC_INFO.APPROVE_NOTIFY_CONFIG) ?
                                            <div>
                                                <div className='apply-cc-node'>
                                                    <span className="cc-person-label sub-item-label">{Intl.get('apply.condition.item.add.cc', '抄送人')}</span>
                                                    {/*选中该选项才会有下面添加抄送人*/}
                                                    {this.renderApplyCCNode(cloneApproveNoty, CC_INFO.APPROVE_NOTIFY_CONFIG)}
                                                </div>
                                                <div className="cancel-privilege">
                                                    <span className="sub-item-label">
                                                        {Intl.get('apply.cc.node.infor.type', '通知方式')}
                                                    </span>
                                                    <div className="info-ways-checks">
                                                        <Checkbox.Group onChange={this.changeCCInformateType.bind(this, CC_INFO.APPROVE_NOTIFY_CONFIG)} defaultValue={ccApproveInforType}>
                                                            <Checkbox value="email_notice">
                                                                {Intl.get('apply.cc.node.email', '邮件')}
                                                            </Checkbox>
                                                            <Checkbox value='socket_notice'>
                                                                {Intl.get('apply.cc.node.socket.noty', '系统弹窗')}
                                                            </Checkbox>
                                                        </Checkbox.Group>
                                                    </div>
                                                </div>
                                            </div>
                                            : null}
                                    </div>
                                </Checkbox.Group>
                            </div>
                        </div>
                        {/*只有机会申请，才有审批通过后自动处理*/}
                        {
                            applyType === 'businessopportunities' ? (
                                <div className="rule-item rule-sale-responsible">
                                    <span className="item-label">
                                        {Intl.get('apply.approved.title', '审批通过后')}:
                                    </span>
                                    <div className="rule-content info-sale-responsible">
                                        <RadioGroup
                                            value={this.state.customerSaleResponsible}
                                            onChange={this.handleChangeApproveResponsible}
                                        >
                                            <Radio value="delete" className="sale-responsible">
                                                {Intl.get('apply.approved.sales.assigned', '分配的销售作为负责人')}
                                            </Radio>
                                            <Radio value="followup" className="sale-responsible">
                                                {Intl.get('apply.approved.sales.assigned.follow', '分配的销售作为负责人，同时原负责人变为联合跟进人')}
                                            </Radio>
                                        </RadioGroup>
                                    </div>

                                </div>
                            ) : null
                        }
                        {/*<div className="cancel-privilege rule-item">*/}
                        {/*<span className="item-label">*/}
                        {/*{Intl.get('apply.info.cancel.privilege', '撤销权限')}*/}
                        {/*</span>*/}
                        {/*<div className="rule-content">*/}
                        {/*<Checkbox onChange={this.handleCancelCheckChange}*/}
                        {/*checked={_.get(this, 'state.applyRulesAndSetting.cancelAfterApprove')}>*/}
                        {/*{Intl.get('apply.workflow.cancel.approve', '通过后允许撤销（审批通过后，经审批人同意，可撤销申请）')}*/}
                        {/*</Checkbox>*/}
                        {/*</div>*/}
                        {/*</div>*/}
                        {/*<div className="other-wrap rule-item">*/}
                        {/*<span className="item-label">*/}
                        {/*{Intl.get('crm.186', '其他')}*/}
                        {/*</span>*/}
                        {/*<div className="rule-content">*/}
                        {/*<Checkbox onChange={this.handleOtherCheckChange}*/}
                        {/*checked={_.get(this, 'state.applyRulesAndSetting.mergeSameApprover')}>*/}
                        {/*{Intl.get('apply.workflow.merge.same.approver', '合并相同审批人（通过后，后面自动通过）')}*/}
                        {/*</Checkbox>*/}
                        {/*</div>*/}
                        {/*</div>*/}

                        <div className="containers" id="bpmn-container" ref="content">
                            <div className="canvas" id="canvas" ref="canvas"></div>
                            <div className="properties-panel-parent" id="js-properties-panel"></div>
                            <ul className="buttons">
                                <li>
                                    <a id="js-download-diagram" href title="download BPMN diagram"
                                        onClick={this.handleDownLoadBPMN}>
                                        下载BPMN
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </GeminiScrollbar>
                <div className="save-cancel-container">
                    <SaveCancelButton
                        loading={this.state.saveRulesWorkFlowLoading}
                        handleSubmit={this.handleSubmitWorkflow}
                        hideCancelBtns={true}
                    />
                </div>
                {this.state.addNodePanelFlow ?
                    <div className={addPanelWrap}>
                        <AddApplyNodePanel
                            saveAddApproveNode={this.saveAddApproveNode}
                            hideRightPanel={this.hideRightAddPanel}
                            applyTypeData={this.props.applyTypeData}
                            applyRulesAndSetting={this.state.applyRulesAndSetting}
                            addNodePanelFlow={this.state.addNodePanelFlow}
                        />
                    </div>
                    : null}
                {this.state.addCCNodePanelFlow ?
                    <div className={addPanelWrap}>
                        <AddApplyCCNodePanel
                            saveAddCCApproveNode={this.saveAddCCApproveNode}
                            hideRightPanel={this.hideRightAddPanel}
                            applyTypeData={this.props.applyTypeData}
                            notify_configs={this.state.notify_configs}
                            addCCNodePanelFlow={this.state.addCCNodePanelFlow}
                            roleList={this.state.roleList}
                            userList={this.state.userList}
                        />
                    </div>
                    : null}
                {this.state.showAddConditionPanel ?
                    <div className={addPanelWrap}>
                        <AddApplyConditionPanel
                            saveAddApprovCondition={this.saveAddApprovCondition}
                            hideRightPanel={this.hideRightAddPanel}
                            applyTypeData={this.props.applyTypeData}
                            updateConditionObj={this.state.updateConditionObj}
                            updateConditionFlowKey={this.state.updateConditionFlowKey}
                            roleList={this.state.roleList}
                            userList={this.state.userList}
                            teamList={this.state.teamList}
                        />
                    </div>
                    : null}
            </div>

        );
    }
}

RegRulesView.defaultProps = {
    applyTypeData: {},
    updateRegRulesView: function() {

    },
    roleList: [],
    userList: [],
    teamList: []
};

RegRulesView.propTypes = {
    applyTypeData: PropTypes.object,
    updateRegRulesView: PropTypes.func,
    roleList: PropTypes.array,
    userList: PropTypes.array,
    teamList: PropTypes.array,

};
export default RegRulesView;
