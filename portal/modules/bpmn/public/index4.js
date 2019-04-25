/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/2/21.
 */
var React = require('react');
import BpmnModeler from 'bpmn-js/lib/Modeler';
// import BpmnModeler from './custom-modeler';
import BpmnModdle from 'bpmn-moddle';
import GraphicsFactory from 'diagram-js/lib/core/GraphicsFactory';
// import elementFactory from 'diagram-js/lib/core/';
var moddle = new BpmnModdle();
require('./index.less');
import assign from 'lodash/assign';
// import diagramXML from './index.bpmn';
import {
    Reader,
    Writer
} from 'moddle-xml';
class BpmnManage extends React.Component {
    state = {
        bpmnModeler: null,
        formData: [
            {
                name: 'UserTask_1',
                id: 'UserTask_1',
                type: 'UserTask',
                next: [{
                    name: 'Gateway_1',
                    id: 'Gateway_1',
                    type: 'Gateway',
                    previous: 'UserTask_1',
                    next: [{
                        name: 'UserTask_2',
                        id: 'UserTask_2',
                        type: 'UserTask',
                        previous: 'Gateway_1',
                        next: [{
                            name: 'EndTask_1',
                            id: 'EndTask_1',
                            type: 'EndEvent',
                            previous: 'UserTask_2',

                        }]
                    }, {
                        name: 'UserTask_3',
                        id: 'UserTask_3',
                        type: 'UserTask',
                        previous: 'Gateway_1',
                        next: [{
                            name: 'EndTask_2',
                            id: 'EndTask_2',
                            type: 'EndEvent',
                            previous: 'UserTask_3',
                        }]
                    }]
                }]
            }
        ],

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
    traversingBpmnNodeTree = (formData, definitions) => {
        var viewer = this.state.bpmnModeler;
        var overlays = viewer.get('overlays'),
            canvas = this.state.canvas,
            //获取的一个元素
            elementRegistry = this.state.elementRegistry,
            modeling = this.state.modeling,
            elementFactory = this.state.elementFactory;
        if (_.isArray(formData) && formData.length) {
            _.forEach(formData, (item, index) => {
                var previousNode = null;
                if (item.previous) {
                    previousNode = elementRegistry.get(item.previous);
                } else {
                    previousNode = this.getStartNode();
                }
                
                //如果上一节点是网关，就要分别设置位置了
                var option = {};
                if (this.isGatewayNode(item)) {
                    // option.x = (index+1) *100;
                    // option.y = (index+1) *100
                }
                //取到创建节点的类型
                var bpmnType = `bpmn:${item.type}`;
                var curNode = elementFactory.createShape(Object.assign({type: bpmnType}, {id: item.id}));
                if (this.isGatewayNode(item)) {
                    modeling.appendShape(previousNode, curNode);
                } else {
                    modeling.appendShape(previousNode, curNode);
                }


                //如果有下一节点
                this.traversingBpmnNodeTree(item.next);

            });
        }

    };

    afterSuccessImportXML() {
        this.getXML().then(({definitions, context}) => {
            //手动的添加剩下的节点
            var formData = this.state.formData;
            this.traversingBpmnNodeTree(formData, definitions);
        });
    }

    componentDidMount() {
        // 获取到属性ref为“canvas”的dom节点
        const canvas = this.refs.canvas;
        var bpmnModeler = this.state.bpmnModeler;
        bpmnModeler = new BpmnModeler({
            container: canvas
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
    <bpmn:startEvent id="StartEvent_1k7etac" />
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
                // 这里还没用到这个，先注释掉吧
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

