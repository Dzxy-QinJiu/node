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
import {Checkbox, Radio, Button} from 'antd';
const RadioGroup = Radio.Group;
import assign from 'lodash/assign';
// import CamundaModdleDescriptor from 'camunda-bpmn-moddle/camunda';
import CamundaModdleDescriptor from '../../../../../camunda.json';
import AddApplyNodePanel from './add_apply_node_panel';
import AddApplyConditionPanel from './add_apply_condition_panel';
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
const FORMLAYOUT = {
    PADDINGTOTAL: 260,
};
class RegRulesView extends React.Component {
    constructor(props) {
        super(props);
        var applyRulesAndSetting = _.cloneDeep(this.props.applyRulesAndSetting);
        var applySaveForm = _.cloneDeep(this.props.applySaveForm);
        this.state = {
            applySaveForm: applySaveForm,
            applyRulesAndSetting: applyRulesAndSetting,
            showAddNodePanel: false,
            showAddConditionPanel: false
        };
    }

    onStoreChange = () => {

    };

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
            additionalModules: [
                // // 右边的工具栏
                // propertiesPanelModule,
                // // 左边的工具栏
                // propertiesProviderModule
            ],
            moddleExtensions: {
                camunda: CamundaModdleDescriptor
            }
        });
        //在这个对象上加上相应的操作方法
        this.setState({
            bpmnModeler: bpmnModeler,
            canvas: bpmnModeler.get('canvas'),
            elementRegistry: bpmnModeler.get('elementRegistry'),
            create: bpmnModeler.get('create'),
            elementFactory: bpmnModeler.get('elementFactory'),
            bpmnFactory: bpmnModeler.get('bpmnFactory'),
            modeling: bpmnModeler.get('modeling'),
        });
    }


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
        // console.log(elementRegistry);
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
    //把表单中的点画到图表中
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
                        //增加节点的审批人
                        if (elem.candidateApprover) {
                            modeling.updateProperties(curNode, {
                                candidateUsers: elem.candidateApprover
                            });
                        }
                        if (elem.description) {
                            bo.get('documentation').push(bpmnFactory.create('bpmn:Documentation', {text: elem.description}));
                        }
                        modeling.appendShape(previousNode, curNode);
                        //如果上一节点是个网关
                        if (this.isGatewayNode(elem)) {
                            let bpmnFactory = this.state.bpmnFactory;
                            var bo = curNode.incoming[0].businessObject;
                            bo.set('conditionExpression', bpmnFactory.create('bpmn:FormalExpression', {body: '${state == "' + elem.condition + '"}'}));
                            modeling.updateProperties(curNode.incoming[0], {
                                name: elem.conditionDsc
                            });
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
    getDefaultFlow = () => {
        return _.get(this, 'state.applyRulesAndSetting.applyApproveRules.defaultFlow.bpmnNode');
    };
    addApplyNode = () => {
        this.setState({
            showAddNodePanel: true
        });
    };
    handleDeleteNode = (deleteItem) => {
        var applyRulesAndSetting = this.state.applyRulesAndSetting;
        var applyApproveRules = applyRulesAndSetting.applyApproveRules;
        var defaultRules = this.getDefaultFlow();
        //把默认流程的中待审批人所在的节点过滤出来
        applyApproveRules.defaultFlow.bpmnNode = _.filter(defaultRules, (item) => deleteItem.id !== item.id);
        this.setState({
            applyRulesAndSetting: applyRulesAndSetting
        });

    };
    renderDefaultWorkFlow = () => {
        var defaultRules = this.getDefaultFlow();
        //把默认流程的中待审批人所在的节点过滤出来
        var candidateRules = _.filter(defaultRules, (item) => item.candidateApprover);
        return (
            <div>
                {_.map(candidateRules, (item, index) => {
                    var showDeleteIcon = index === _.get(candidateRules, 'length') - 1 && index !== 0;
                    return (
                        <div className="item-node">
                            <div className="icon-container">
                                <i className="iconfont icon-active-user-ico"></i>
                            </div>
                            <span className="show-name"> {item.showName}</span>
                            {showDeleteIcon ? <i className="iconfont icon-close-btn"
                                onClick={this.handleDeleteNode.bind(this, item)}></i> : null}
                            <span className="connet-bar"></span>
                        </div>
                    );
                })}
                <div className="item-node">
                    <div className="icon-container  add-node" onClick={this.addApplyNode}>
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
        var viewer = this.state.bpmnModeler, applyRulesAndSetting = this.state.applyRulesAndSetting;
        var downloadSvgLink = $('#js-download-svg');
        var downloadLink = $('#js-download-diagram');
        viewer.saveXML({format: true}, (err, xml) => {
            applyRulesAndSetting.bpmnJson = xml;
        });
    };
    removeEndEventNode = () => {
        var defaultBpmnNode = _.get(this, 'state.applyRulesAndSetting.applyApproveRules.defaultFlow.bpmnNode');
        var previousNode = _.last(defaultBpmnNode);
        //看一下最后一个节点的节点类型
        if (previousNode.type === 'EndEvent') {
            //删除最后一个节点
            previousNode = _.last(defaultBpmnNode.pop());
        }
        return previousNode;
    };
    handleSubmitApproveApply = () => {
        //需要在最后加上最后一个节点,需要先判断之前是不是有结束节点
        var defaultBpmnNode = _.get(this, 'state.applyRulesAndSetting.applyApproveRules.defaultFlow.bpmnNode');
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
        //保存的时候进行画图
        this.createNewDiagram(() => {
            this.handleDownLoadBPMN();
        });

    };
    handleCancelApproveApply = () => {

    };
    hideRightAddPanel = () => {
        this.setState({
            showAddNodePanel: false,
            showAddConditionPanel: false
        });
    };
    saveAddApproveNode = (data) => {
        //新加节点的数据,要把原来最后一个节点的next加上，先判断之前的数据结构中是不是有结束节点
        var defaultBpmnNode = _.get(this, 'state.applyRulesAndSetting.applyApproveRules.defaultFlow.bpmnNode');
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
        previousNode.next = `UserTask_${newIndex}`;
        var newNodeObj = {
            name: `UserTask_${newIndex}`,
            id: `UserTask_${newIndex}`,
            type: 'UserTask',
            previous: `UserTask_${previousNodeIndex}`,
            flowIndex: `${newIndex}`
        };
        for (var key in data) {
            newNodeObj[key] = data[key];
        }
        defaultBpmnNode.push(newNodeObj);
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
        var applyApproveRules = _.get(this, 'state.applyRulesAndSetting.applyApproveRules');
        //要在默认流程那里加一个网关
        var defalutBpmnNode = _.get(applyApproveRules, 'defaultFlow.bpmnNode');
        var firstNode = _.get(defalutBpmnNode,'[0]');
        firstNode['next'] = 'Gateway_1_1';
        var secondNode = _.get(defalutBpmnNode,'[1]');
        secondNode['previous'] = 'Gateway_1_1';
        defalutBpmnNode.splice(1,0,{
            name: 'Gateway_1_1',
            id: 'Gateway_1_1',
            type: 'ExclusiveGateway',
            next: 'UserTask_1_2',
            previous: 'UserTask_1_0',
            flowIndex: '1_1'
        });

        applyApproveRules['condition1'] = {
            bpmnNode: [],
            conditionDsc: data,
            ccPerson: []
        };
        this.setState({
            applyApproveRules
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
            var applyApproveRules = _.get(this, 'state.applyRulesAndSetting.applyApproveRules');
            delete applyApproveRules[deleteKey];
            this.setState({applyApproveRules, confirmDeleteItem: ''});
        }

    };
    handleUpdateConditionItem = (key) => {

    };
    renderAddConditionFlow = () => {
        var applyApproveRules = _.get(this, 'state.applyRulesAndSetting.applyApproveRules');
        return (
            <div className='condition-container'>
                {_.map(applyApproveRules, (item, key) => {
                    if (key.indexOf('condition') > -1) {
                        var conditionDsc = _.get(item, 'conditionDsc');
                        return (
                            <div className="condition-item-content">
                                <div className="condition-item condition-item-title-wrap">
                                    <span className="condition-item-title">
                                        {_.get(conditionDsc, 'conditionTitle')}
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
                                        {_.map(_.get(conditionDsc, 'limitRules'), ruleItem => {
                                            return (
                                                <li>
                                                    <i className="icon-tip"></i>
                                                    {ruleItem.limitTypeDsc}:
                                                    {ruleItem.rangeLimitDsc}{ruleItem.rangeNumberDsc}
                                                </li>
                                            );
                                        })}
                                    </ul>

                                </div>
                                <div className="condition-item condition-item-flow">
                                    <span
                                        className="condition-item-label">{Intl.get('apply.condition.apply.approve', '审批流程')}:</span>
                                    {_.get(item, 'bpmnNode.length') ? <div></div> : null}
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
        var addPanelWrap = classNames({'show-add-node-modal': this.state.showAddNodePanel || this.state.showAddConditionPanel});
        var divHeight = $(window).height() - FORMLAYOUT.PADDINGTOTAL;
        return (
            <div className="reg-rule-container" style={{'height': divHeight}}>
                <GeminiScrollbar>
                    <div className="reg-rule-wrap">
                        <div className="default-apply-workflow rule-item">
                            <span className="item-label">
                                {Intl.get('apply.default.apply.workflow', '默认审批流程')}:
                            </span>
                            <div className="rule-content apply-node-lists">
                                {this.renderDefaultWorkFlow()}
                            </div>

                        </div>
                        <div className="default-cc-person rule-item">
                            <span className="item-label">
                                {Intl.get('apply.default.cc.email', '默认抄送人')}:
                            </span>
                            <div className="rule-content">

                            </div>

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
                                {Intl.get('apply.info.cc.email', '抄送通知')}：
                            </span>
                            <div className="rule-content info-container">
                                <RadioGroup onChange={this.onRadioChange}
                                    value={_.get(this, 'state.applyRulesAndSetting.ccInformation')}>
                                    <Radio value='apply'>{Intl.get('apply.cc.when,submit', '提交申请时抄送')}</Radio>
                                    <Radio value='approve'>{Intl.get('apply.cc.when.approve.apply', '审批通过后抄送')}</Radio>
                                    <Radio
                                        value='apply_and_approve'>{Intl.get('apply.cc.when.submit.and.approve', '提交申请和审批通过后都抄送')}</Radio>
                                </RadioGroup>
                            </div>

                        </div>
                        <div className="cancel-privilege rule-item">
                            <span className="item-label">
                                {Intl.get('apply.info.cancel.privilege', '撤销权限')}
                            </span>
                            <div className="rule-content">
                                <Checkbox onChange={this.handleCancelCheckChange}
                                    value={_.get(this, 'state.applyRulesAndSetting.cancelAfterApprove')}>
                                    {Intl.get('apply.workflow.cancel.approve', '通过后允许撤销（审批通过后，经审批人同意，可撤销申请）')}
                                </Checkbox>
                            </div>
                        </div>
                        <div className="other-wrap rule-item">
                            <span className="item-label">
                                {Intl.get('crm.186', '其他')}
                            </span>
                            <div className="rule-content">
                                <Checkbox onChange={this.handleOtherCheckChange}
                                    value={_.get(this, 'state.applyRulesAndSetting.mergeSameApprover')}>
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
                        handleSubmit={this.handleSubmitApproveApply}
                        hideCancelBtns={true}
                    />
                </div>
                {this.state.showAddNodePanel ?
                    <div className={addPanelWrap}>
                        <AddApplyNodePanel
                            saveAddApproveNode={this.saveAddApproveNode}
                            hideRightPanel={this.hideRightAddPanel}
                            getAllApplyList={this.getAllBusinessApplyList}
                        />
                    </div>
                    : null}
                {this.state.showAddConditionPanel ?
                    <div className={addPanelWrap}>
                        <AddApplyConditionPanel
                            saveAddApprovCondition={this.saveAddApprovCondition}
                            hideRightPanel={this.hideRightAddPanel}
                            applySaveForm={this.state.applySaveForm}
                        />
                    </div>
                    : null}
            </div>

        );
    }
}

RegRulesView.defaultProps = {
    applyRulesAndSetting: {},
    applySaveForm: {},
};

RegRulesView.propTypes = {
    applyRulesAndSetting: PropTypes.object,
    applySaveForm: PropTypes.object,

};
export default RegRulesView;