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
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
var applyApproveManageAction = require('../../action/apply_approve_manage_action');
const FORMLAYOUT = {
    PADDINGTOTAL: 260,
};
import {FLOW_TYPES, ADDTIONPROPERTIES, ASSIGEN_APPROVER, isSalesOpportunityFlow} from '../../utils/apply-approve-utils';
import {CC_INFO} from 'PUB_DIR/sources/utils/consts';
class RegRulesView extends React.Component {
    constructor(props) {
        super(props);
        var applyRulesAndSetting = _.cloneDeep(this.props.applyTypeData.applyRulesAndSetting);
        this.state = {
            applyRulesAndSetting: applyRulesAndSetting,
            addNodePanelFlow: '',
            showAddConditionPanel: false
        };
    }

    onStoreChange = () => {

    };

    componentWillReceiveProps(nextProps) {
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
                        if (elemIndex + 2 === elementsArr.length && isSalesOpportunityFlow(_.get(this, 'props.applyTypeData.type')) && key === FLOW_TYPES.DEFAULTFLOW){
                            elem.distributeSales = true;
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
                            if (elem.hideBrack){
                                candidateText = elem.candidateApprover;
                            }
                            modeling.updateProperties(curNode, {
                                candidateUsers: candidateText
                            });
                        }
                        modeling.appendShape(previousNode, curNode);
                        //如果此节点是条件流程中的最后一个节点，需要再单独把这个节点和结束节点连接起来
                        if (key !== FLOW_TYPES.DEFAULTFLOW && _.isString(elem.next) && elem.next.indexOf('EndTask') > -1) {
                            //如果是销售机会，最后一个节点才加这个分配销售的字段
                            if(isSalesOpportunityFlow(_.get(this, 'props.applyTypeData.type'))){
                                elem.distributeSales = true;
                            }

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
                            }
                        });
                        bo.set('extensionElements', bpmnFactory.create('bpmn:ExtensionElements', {values: additonConditionArr}));

                        //如果上一节点是个网关
                        if (this.isGatewayNode(elem)) {
                            var incomingBo = curNode.incoming[0].businessObject;
                            //网关的条件
                            if (elem.conditionTotalRule) {
                                let bpmnFactory = this.state.bpmnFactory;
                                incomingBo.set('conditionExpression', bpmnFactory.create('bpmn:FormalExpression', {body: elem.conditionTotalRule }));
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
    onRadioChange = (e) => {
        var applyRulesAndSetting = this.state.applyRulesAndSetting;
        applyRulesAndSetting.ccInformation = e.target.value;
        this.setState({applyRulesAndSetting});

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
    renderApplyWorkFlowNode = (candidateRules, flowType) => {
        return (
            <div className="rule-content apply-node-lists">
                {_.map(candidateRules, (item, index) => {
                    var showDeleteIcon = index === _.get(candidateRules, 'length') - 1;
                    return (
                        <div className="item-node">
                            <div className="icon-container">
                                <i className="iconfont icon-active-user-ico"></i>
                            </div>
                            <span className="show-name"> {item.showName}</span>
                            {showDeleteIcon ? <i className="iconfont icon-close-btn"
                                onClick={this.handleDeleteNode.bind(this, flowType, item)}></i> : null}
                            {item.submitFiles + '' === 'true' ?
                                <span className="addition-text">{Intl.get('apply.add.approver.submit.files', '可提交文件')}</span> : null}
                            {item.assignNextNodeApprover + '' === 'true' ?
                                <span className="addition-text">{Intl.get('apply.add.approver.distribute', '指定下一审批人')}</span> : null}
                            {item.distributeSales + '' === 'true' ? <span className="addition-text">{Intl.get('leave.apply.general.apply', '分配销售')}</span> : null}
                            <span className="connet-bar"></span>
                        </div>
                    );
                })}
                <div className="item-node">
                    <div className="icon-container add-node" onClick={this.addApplyNode.bind(this, flowType)}>
                        <i className="iconfont icon-add"></i>
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
    handleDownLoadBPMN = () => {
        var viewer = this.state.bpmnModeler;
        var downloadSvgLink = $('#js-download-svg');
        var downloadLink = $('#js-download-diagram');
        viewer.saveXML({format: true}, (err, xml) => {
            this.setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
        });
    };
    handleSavedBPMNFlow = () => {
        var viewer = this.state.bpmnModeler, applyRulesAndSetting = this.state.applyRulesAndSetting;
        var downloadSvgLink = $('#js-download-svg');
        var downloadLink = $('#js-download-diagram');
        viewer.saveXML({format: true}, (err, xml) => {
            applyRulesAndSetting.bpmnJson = xml;
            var applyId = _.get(this, 'props.applyTypeData.id');
            //表单的内容不需要提交
            applyApproveManageAction.saveSelfSettingWorkFlowRules(applyId,applyRulesAndSetting,() => {
                message.success('保存成功');
                this.props.updateRegRulesView(applyRulesAndSetting);
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
            showAddConditionPanel: false
        });
    };
    getGateWayNode = () => {

    };
    saveAddApproveNode = (data) => {
        //新加节点的数据,要把原来最后一个节点的next加上，先判断之前的数据结构中是不是有结束节点
        var applyFlow = this.state.addNodePanelFlow;
        var applyRulesAndSetting = this.state.applyRulesAndSetting;
        var bpmnNodeFlow = _.get(applyRulesAndSetting, `applyApproveRules.${applyFlow}.bpmnNode`, []);
        var defaultBpmnNode = this.getDiffTypeFlow(FLOW_TYPES.DEFAULTFLOW);
        //如果是默认流程
        var previousNode = _.last(bpmnNodeFlow);
        //看一下最后一个节点的节点类型
        if (!previousNode) {
            //如果上一个节点不存在，那就指定为网关节点
            previousNode = _.find(defaultBpmnNode, item => item.type === 'ExclusiveGateway');

        }
        if (_.get(previousNode,'type') === 'EndEvent') {
            //删除最后一个节点
            bpmnNodeFlow.pop();
            previousNode = _.last(bpmnNodeFlow);
        }
        if (_.get(previousNode,'type') === 'ExclusiveGateway') {
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
                _.forEach(limitRules, (item, index) => {
                    if (index === 0) {
                        newNodeObj['conditionTotalRule'] = _.get(item, 'conditionRule');
                        newNodeObj['conditionTotalRuleDsc'] = _.get(item, 'conditionRuleDsc');
                    } else {
                        newNodeObj['conditionTotalRule'] += '  && ' + _.get(item, 'conditionRule');
                        newNodeObj['conditionTotalRuleDsc'] += '并且' + _.get(item, 'conditionRuleDsc');
                    }

                });

            }
        } else {
            //如果是第一个节点
            if (previousNode){
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
            }else{
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
    saveAddApprovCondition = (data) => {
        //再原来默认的流程上加上一个网关，然后把添加的条件改成节点，有利于画图
        var applyRulesAndSetting = this.state.applyRulesAndSetting;
        var applyApproveRules = _.get(applyRulesAndSetting, 'applyApproveRules');
        //要在默认流程那里加一个网关,只限于在第一次添加网关的时候
        var defalutBpmnNode = this.getDiffTypeFlow(FLOW_TYPES.DEFAULTFLOW);
        var firstNode = _.get(defalutBpmnNode, '[0]');
        if (!data.updateConditionFlowKey) {
            firstNode['previous'] = 'Gateway_1_1';
            var secondNode = _.get(defalutBpmnNode, '[1]');
            defalutBpmnNode.splice(0, 0, {
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
        if (data.updateConditionFlowKey){
            var flowKey = data.updateConditionFlowKey;
            delete data.updateConditionFlowKey;
            applyApproveRules[flowKey]['conditionRuleLists'] = data;
            var limitRules = _.get(data, 'limitRules', []);
            var firstNode = _.get(applyApproveRules[flowKey], 'bpmnNode[0]');
            _.forEach(limitRules, (item, index) => {
                if (index === 0) {
                    firstNode['conditionTotalRule'] = _.get(item, 'conditionRule');
                    firstNode['conditionTotalRuleDsc'] = _.get(item, 'conditionRuleDsc');
                } else {
                    firstNode['conditionTotalRule'] += '  && ' + _.get(item, 'conditionRule');
                    firstNode['conditionTotalRuleDsc'] += '并且' + _.get(item, 'conditionRuleDsc');
                }
            });


        }else{
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
            this.setState({applyRulesAndSetting, confirmDeleteItem: ''});
        }

    };
    //修改某个节点的条件
    handleUpdateConditionItem = (key) => {
        var applyApproveRules = _.get(this, 'state.applyRulesAndSetting.applyApproveRules');
        this.setState({
            showAddConditionPanel: true,
            updateConditionObj: _.get(applyApproveRules[key],'conditionRuleLists'),
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
                                        <i className="iconfont icon-delete"
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
                                                <i className="iconfont icon-add"></i>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className="condition-item condition-item-cc">
                                    <span
                                        className="condition-item-label">{Intl.get('apply.condition.item.add.cc', '抄送人')}:</span>
                                </div>

                            </div>
                        );
                    } else {
                        return null;
                    }
                })}
            </div>
        );
    };

    render = () => {
        var hasErrTip = this.state.titleRequiredMsg;
        var cls = classNames('', {
            'err-tip': hasErrTip
        });
        var addPanelWrap = classNames({'show-add-node-modal': this.state.addNodePanelFlow || this.state.showAddConditionPanel});
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL + 110;
        var defaultRules = this.getDiffTypeFlow(FLOW_TYPES.DEFAULTFLOW);
        //把默认流程的中待审批人所在的节点过滤出来
        var candidateRules = _.filter(defaultRules, (item) => item.candidateApprover);
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
                        {/*<div className="default-cc-person rule-item">*/}
                        {/*<span className="item-label">*/}
                        {/*{Intl.get('apply.default.cc.email', '默认抄送人')}:*/}
                        {/*</span>*/}
                        {/*<div className="rule-content">*/}

                        {/*</div>*/}

                        {/*</div>*/}
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
                                {Intl.get('apply.info.cc.email', '抄送通知')}：
                            </span>
                            <div className="rule-content info-container">
                                <RadioGroup onChange={this.onRadioChange}
                                    value={_.get(this, 'state.applyRulesAndSetting.ccInformation')}>
                                    <Radio value={CC_INFO.APPLY}>{Intl.get('apply.cc.when,submit', '提交申请时抄送')}</Radio>
                                    <Radio value={CC_INFO.APPROVE}>{Intl.get('apply.cc.when.approve.apply', '审批通过后抄送')}</Radio>
                                    <Radio
                                        value={CC_INFO.APPLY_AND_APPROVE}>{Intl.get('apply.cc.when.submit.and.approve', '提交申请和审批通过后都抄送')}</Radio>
                                </RadioGroup>
                            </div>

                        </div>
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
                        <div className="other-wrap rule-item">
                            <span className="item-label">
                                {Intl.get('crm.186', '其他')}
                            </span>
                            <div className="rule-content">
                                <Checkbox onChange={this.handleOtherCheckChange}
                                    checked={_.get(this, 'state.applyRulesAndSetting.mergeSameApprover')}>
                                    {Intl.get('apply.workflow.merge.same.approver', '合并相同审批人（通过后，后面自动通过）')}
                                </Checkbox>
                            </div>
                        </div>
                        <div className="containers" id="bpmn-container" ref="content">
                            <div className="canvas" id="canvas" ref="canvas"></div>
                            <div className="properties-panel-parent" id="js-properties-panel"></div>
                        </div>
                    </div>
                </GeminiScrollbar>
                <div className="save-cancel-container">
                    <SaveCancelButton
                        loading={this.state.saveRulesWorkFlowLoading}
                        handleSubmit={this.handleSubmitApproveApply}
                        hideCancelBtns={true}
                    />
                </div>
                {this.state.addNodePanelFlow ?
                    <div className={addPanelWrap}>
                        <AddApplyNodePanel
                            saveAddApproveNode={this.saveAddApproveNode}
                            hideRightPanel={this.hideRightAddPanel}
                            getAllApplyList={this.getAllBusinessApplyList}
                            applyTypeData={this.props.applyTypeData}
                            applyRulesAndSetting={this.state.applyRulesAndSetting}
                            addNodePanelFlow={this.state.addNodePanelFlow}
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
};

RegRulesView.propTypes = {
    applyTypeData: PropTypes.object,
    updateRegRulesView: PropTypes.func

};
export default RegRulesView;