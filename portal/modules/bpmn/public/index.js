/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/2/21.
 */
var React = require('react');
import BpmnModeler from 'bpmn-js/lib/Modeler';
import BpmnModdle from 'bpmn-moddle';
var moddle = new BpmnModdle();
require('./index.less');
import './index2.css';
require('./diagram-js.css');
require('./app.css');
import assign from 'lodash/assign';
import propertiesPanelModule from 'bpmn-js-properties-panel';
import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/camunda';
import {
    Reader,
    Writer
} from 'moddle-xml';
class BpmnManage extends React.Component {
    state = {
        bpmnModeler: null,
        formData: [{
            elements: [{
                name: 'UserTask_1_1',
                id: 'UserTask_1_1',
                type: 'UserTask',
                next: 'Gateway_1_1',
                showName: '直接领导审批',
            }, {
                name: 'Gateway_1_1',
                id: 'Gateway_1_1',
                type: 'ExclusiveGateway',
                previous: 'UserTask_1_1',
                next: 'UserTask_1_2'
            },{
                name: 'UserTask_1_2',
                id: 'UserTask_1_2',
                type: 'UserTask',
                next: 'EndTask_1',
                previous: 'Gateway_1_1',
                condition: 'Y',
                conditionDsc: '通过申请',
                showName: '男领导审批',
                finalTask: true
            }, {
                name: 'EndTask_1',
                id: 'EndTask_1',
                type: 'EndEvent',
                previous: 'UserTask_1_2',
            }]
        }, {elements: [{
            name: 'UserTask_2_1',
            id: 'UserTask_2_1',
            type: 'UserTask',
            condition: 'N',
            conditionDsc: '驳回申请',
            next: 'EndTask_2',
            previous: 'Gateway_1_1',
            showName: '女领导审批',

        }, {
            name: 'EndTask_2',
            id: 'EndTask_2',
            type: 'EndEvent',
            previous: 'UserTask_2_1',
        }]}
        ]
    };

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

    renderFormData() {
        var formData = this.state.formData, elementRegistry = this.state.elementRegistry, modeling = this.state.modeling, elementFactory = this.state.elementFactory;
        if (_.isArray(formData)){
            _.forEach(formData,(item,itemIndex) => {
                var elementsArr = item['elements'];
                if (_.isArray(elementsArr)){
                    _.forEach(elementsArr,(elem,elemIndex) => {
                        var previousNode = null;
                        if (elem.previous) {
                            previousNode = elementRegistry.get(elem.previous);
                        } else {
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
                        modeling.appendShape(previousNode, curNode);
                        //如果shang一节点是个网关
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
    isGatewayNode = (item) => {
        return item.previous && item.previous.indexOf('Gateway') > -1;
    };

    afterSuccessImportXML() {
        this.getXML().then(({definitions, context}) => {
            //手动的添加剩下的节点
            var formData = this.state.formData;
            this.renderFormData();
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
            additionalModules: [
                // 右边的工具栏
                propertiesPanelModule,
                // 左边的工具栏
                propertiesProviderModule
            ],
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
  <bpmn:process id="Process_0pqepm7" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1k7etac" name="销售发起申请"/>
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

    render() {
        return (
            <div className="containers" ref="content">
                <div className="canvas" id="canvas" ref="canvas"></div>
                <div className="properties-panel-parent" id="js-properties-panel"></div>
                <ul className="buttons">
                    <li>
                        <a id="js-download-diagram" href title="download BPMN diagram"
                            onClick={this.handleDownLoadBPMN}>
                            下载BPMN
                        </a>
                    </li>
                    <li>
                        <a id="js-download-svg" href title="download as SVG image">
                            下载SVG
                        </a>
                    </li>
                </ul>
            </div>
        );
    }
}

module.exports = BpmnManage;

