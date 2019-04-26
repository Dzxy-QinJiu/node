/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/4/24.
 */

import SaveCancelButton from 'CMP_DIR/detail-card/save-cancel-button';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import BpmnModdle from 'bpmn-moddle';
var moddle = new BpmnModdle();
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
require('../../style/reg-rules.less');
require('../../style/diagram-js.css');
import classNames from 'classnames';
import {Checkbox,Radio } from 'antd';
const RadioGroup = Radio.Group;
import assign from 'lodash/assign';
import CamundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda';
// import CamundaModdleDescriptor from './camunda.json';
class Regrules extends React.Component {
    constructor(props) {
        super(props);
        var applyTypeData = _.cloneDeep(this.props.applyTypeData);
        this.state = {
            applyTypeData: applyTypeData
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
                camunda: $.getJSON(CamundaModdleDescriptor)
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
        }, () => {
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
            this.createNewDiagram(bpmnXmlStr, () => {
                this.afterSuccessImportXML();
            });
        });
    }
    createNewDiagram(xml, callback) {
        this.state.bpmnModeler.importXML(xml, (err) => {
            if (err) {
                console.error(err);
            } else {
                _.isFunction(callback) && callback();
            }
        });
    }
    getStartNode() {
        return this.getNodeByType('bpmn:StartEvent')[0];
    }
    //获取某种类型的节点
    getNodeByType(type) {
        var elementRegistry = this.state.elementRegistry;
        console.log(elementRegistry);
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
    renderFormData(callback) {
        var formData = _.get(this, 'state.applyTypeData.applyRules'), elementRegistry = this.state.elementRegistry, modeling = this.state.modeling, elementFactory = this.state.elementFactory, bpmnFactory = this.state.bpmnFactory;
        if (_.isArray(formData)){
            _.forEach(formData,(item,itemIndex) => {
                var elementsArr = item['elements'] || item['defaultFlow'];
                if (_.isArray(elementsArr)){
                    _.forEach(elementsArr,(elem,elemIndex) => {
                        var previousNode = null;
                        if (elem.previous) {
                            previousNode = elementRegistry.get(elem.previous);
                        } else {
                            // previousNode = null;
                            previousNode = this.getStartNode();
                        }
                        var options = {};
                        if (elemIndex === 0) {
                            options.y = (itemIndex + 1) * 100;
                        }
                        var bpmnType = `bpmn:${elem.type}`;
                        var curNode = elementFactory.createShape(Object.assign({type: bpmnType}, {id: elem.id}));
                        var bo = curNode.businessObject;
                        bo.name = elem.showName;
                        //增加节点的审批人
                        if (elem.candidateApprover){
                            modeling.updateProperties(curNode, {
                                candidateUsers: elem.candidateApprover
                            });
                        }
                        if (elem.description){
                            bo.get('documentation').push(bpmnFactory.create('bpmn:Documentation', {text: elem.description}));
                        }
                        //把camunda换成activiti
                        // var eType = _.get(bo,'eventDefinitions[0]');
                        // console.log(eType);
                        // if (previousNode){
                        modeling.appendShape(previousNode, curNode);
                        // }else{
                        //创建开始节点
                        // var viewer = this.state.bpmnModeler;
                        // var canvas = viewer.get('canvas');
                        // assign(curNode, { x: 250, y: 250 });
                        // canvas.addShape(curNode);
                        // }
                        //将带有待审批人的节点的属性的camunda换成activiti
                        if (bo.candidateUsers){
                            setTimeout(() => {
                                _.isFunction(callback) && callback(curNode);
                            },60 * 1000);

                        }
                        //如果上一节点是个网关
                        if (this.isGatewayNode(elem)) {
                            let bpmnFactory = this.state.bpmnFactory;
                            var bo = curNode.incoming[0].businessObject;
                            bo.set('conditionExpression', bpmnFactory.create('bpmn:FormalExpression', {body: '${state == "' + elem.condition + '"}'}));
                            modeling.updateProperties(curNode.incoming[0], {
                                name: elem.conditionDsc
                            });
                            // bo.name = elem.conditionDsc;
                        }
                    });
                }
            });
        }
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
    afterSuccessImportXML() {
        this.getXML().then(({definitions, context}) => {
            //手动的添加剩下的节点
            this.renderFormData((nodes) => {
                //画完后把camunda改成activiti
                // var nodes = this.getSetCandidateNode();
                console.log(nodes);
            });
        });
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
    onRadioChange = () => {

    };
    getDefaultFlow = () => {
        var applyRules = _.get(this, 'state.applyTypeData.applyRules');
        return _.get(_.find(applyRules, item => item.defaultFlow),'defaultFlow');
    };
    renderDefaultWorkFlow = () => {
        var defaultRules = this.getDefaultFlow();
        //把默认流程的中待审批人所在的节点过滤出来
        var candidateRules = _.filter(defaultRules,(item) => item.candidateApprover);
        return (
            <div>
                {_.map(candidateRules,(item,index) => {
                    return (
                        <div className="item-node">
                            <div className="icon-container">
                                <i className="iconfont icon-active-user-ico"></i>
                            </div>
                            <span className="show-name"> {item.showName}</span>
                            {index !== candidateRules.length - 1 ? <span className="connet-bar"></span> : <i className="iconfont "></i>}
                        </div>
                    );
                })}
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
    render = () => {
        var hasErrTip = this.state.titleRequiredMsg;
        var cls = classNames('',{
            'err-tip': hasErrTip
        });
        return (
            <div className="reg-rule-container">
                <div className="reg-rule-wrap">
                    <div className="default-apply-workflow rule-item">
                        <span className="item-label">
                            {Intl.get('apply.default.apply.workflow','默认审批流程')}:
                        </span>
                        <div className="rule-content">
                            {this.renderDefaultWorkFlow()}
                        </div>

                    </div>
                    <div className="default-cc-person rule-item">
                        <span className="item-label">
                            {Intl.get('apply.default.cc.email','默认抄送人')}:
                        </span>
                        <div className="rule-content">

                        </div>

                    </div>
                    <div className="condition-apply-workflow rule-item">
                        <span className="item-label">
                            {Intl.get('apply.condition.work.flow', '条件审批流程')}:
                        </span>
                        <div className="rule-content">
                            <a href="">{Intl.get('apply.add.condition.workflow', '添加条件审批流程')}</a>
                        </div>
                    </div>
                    <div className="inform-cc rule-item">
                        <span className="item-label">
                            {Intl.get('apply.info.cc.email', '抄送通知')}：
                        </span>
                        <div className="rule-content info-container">
                            <RadioGroup onChange={this.onRadioChange} value='submit'>
                                <Radio value='submit'>{Intl.get('apply.cc.when,submit', '提交申请时抄送')}</Radio>
                                <Radio value='approve'>{Intl.get('apply.cc.when.approve.apply', '审批通过后抄送')}</Radio>
                                <Radio value='both'>{Intl.get('apply.cc.when.submit.and.approve', '提交申请和审批通过后都抄送')}</Radio>
                            </RadioGroup>
                        </div>

                    </div>
                    <div className="cancel-privilege rule-item">
                        <span className="item-label">
                            {Intl.get('apply.info.cancel.privilege', '撤销权限')}
                        </span>
                        <div className="rule-content">
                            <Checkbox >
                                {Intl.get('apply.workflow.cancel.approve', '通过后允许撤销（审批通过后，经审批人同意，可撤销申请）')}
                            </Checkbox>
                        </div>


                    </div>
                    <div className="other-wrap rule-item">
                        <span className="item-label">
                            {Intl.get('crm.186', '其他')}
                        </span>
                        <div className="rule-content">
                            <Checkbox >
                                {Intl.get('apply.workflow.merge.same.approver', '合并相同审批人（通过后，后面自动通过）')}
                            </Checkbox>
                        </div>
                    </div>
                </div>
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

        );
    }
}

Regrules.defaultProps = {
    applyTypeData: {},
};

Regrules.propTypes = {
    applyTypeData: PropTypes.object,
   
};
export default Regrules;