
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
import elementFactory from 'diagram-js/lib/core/';
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
            {name: 'task1',
                id: ''}
        ]

    };

    createNewDiagram(xml) {
        var bpmnXmlStr = xml ? xml : `<?xml version="1.0" encoding="UTF-8"?>
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
        //一个节点都没有
        //         var bpmnXmlStr = `<?xml version="1.0" encoding="UTF-8"?>
        // <bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1qk94fz" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="3.2.1">
        //   <bpmn:process id="Process_1e6gm5j" isExecutable="false" />
        //   <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        //     <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1e6gm5j" />
        //   </bpmndi:BPMNDiagram>
        // </bpmn:definitions>`;
        //         var bpmnXmlStr = `<?xml version="1.0" encoding="UTF-8"?>
        // <bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" id="NEW ID" targetNamespace="http://bpmn.io/schema/bpmn"><bpmn2:process id="MyProcess_1" /></bpmn2:definitions>`;
        // 将字符串转换成图显示出来
        this.state.bpmnModeler.importXML(bpmnXmlStr, function(err) {
            if (err) {
                console.error(err);
            } else {
                // 这里还没用到这个，先注释掉吧
                // that.success()
            }
        });



    }
    renderNewDiagram2(){
        var xmlStr =
            '<?xml version="1.0" encoding="UTF-8"?>' +
            '<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
            'id="empty-definitions" ' +
            'targetNamespace="http://bpmn.io/schema/bpmn">' +
            '</bpmn2:definitions>';

        moddle.fromXML(xmlStr, (err, definitions) => {

            // update id attribute
            definitions.set('id', 'NEW ID');

            // add a root element
            // var bpmnProcess = moddle.create('bpmn:Process', { id: 'MyProcess_1' });

            // given
            var bpmnProcess = moddle.create('bpmn:SequenceFlow', {
                id: 'SequenceFlow_1'
            });

            var bpmdi = moddle.create('bpmndi:BPMNShape', {
                // 填充颜色
                fill: '#fff',
                // 边框颜色
                stroke: '#000',
                // bpmnElement: bpmnProcess,
                // bounds: moddle.create('dc:Bounds', { x: 100.0, y: 200.0, width: 100.0, height: 50.0 })
            });
            definitions.get('rootElements')[0].flowElements.push(bpmnProcess);
            // definitions.diagrams[0].plane.planeElement.push(bpmdi);
            moddle.toXML(definitions, (err, xmlStrUpdated) => {
                this.createNewDiagram(xmlStrUpdated);
                console.log(xmlStrUpdated);
                // xmlStrUpdated contains new id and the added process

            });

        });

    }
    addConnector= (shape, inputParam, outputParam) => {
        let self = this;
        let bpmnFactory = self.bpmn.bpmnFactory;
        let bo = shape.businessObject;
        // 添加链接器
        let bpmConnector = bpmnFactory.create('camunda:Connector', {connectorId: 'http-connector'});
        bo.set('extensionElements', bpmnFactory.create('bpmn:ExtensionElements', {values: [bpmConnector]}));
        // 把JSON类型转为Map
        let headers = [];
        for (let k in inputParam.headers) {
            let header = bpmnFactory.create('camunda:Entry', {key: k, value: inputParam.headers[k]});
            headers.push(header);
        }

        // 添加输入输出参数

        // 添加输入参数
        var inputParameters = [
            bpmnFactory.create('camunda:InputParameter', { // method  text类型
                name: 'method',
                value: inputParam.method.toUpperCase()
            }),
            bpmnFactory.create('camunda:InputParameter', { // headers  text类型
                name: 'headers',
                definition: bpmnFactory.create('camunda:Map', { // method  Map类型
                    entries: headers
                })
            })
        ];
        if (inputParam.method.toUpperCase() === 'GET') {
            var url = '';
            if (inputParam.params) {
                url = self.generateUrl(inputParam.url, inputParam.params);
            } else {
                url = inputParam.url;
            }
            inputParameters.push(
                bpmnFactory.create('camunda:InputParameter', {
                    name: 'url',
                    value: url
                })
            );
        } else {
            inputParameters.push(
                bpmnFactory.create('camunda:InputParameter', {
                    name: 'url',
                    value: inputParam.url
                })
            );
            if (inputParam.params && inputParam.params !== '') {
                inputParameters.push(
                    bpmnFactory.create('camunda:InputParameter', {
                        name: 'payload',
                        value: inputParam.params
                    })
                );
            }
        }
        bpmConnector.inputOutput = bpmnFactory.create('camunda:InputOutput', {
            inputParameters: inputParameters, // 输入参数
            outputParameters: [ // 输出参数
                bpmnFactory.create('camunda:OutputParameter', {
                    name: 'HTTP_RESPONSE',
                    value: '${response}'
                })
            ]
        });
    };
    componentDidMount(){
        // 获取到属性ref为“canvas”的dom节点
        const canvas = this.refs.canvas;
        this.state.bpmnModeler = new BpmnModeler({
            container: canvas,
            // moddleExtensions: {
            //     camunda: camundaModdleDescriptor
            // }
        });
        this.createNewDiagram();
        // this.renderNewDiagram2();
        // this.renderNewDiagram3()

    }
    //创建结束节点
    createEndNode =(event) => {
        let self = this;
        // if(!self.createdTask){
        //     alert('请先创建节点！');
        //     return;
        // }
        var type = 'bpmn:EndEvent';
        var viewer = this.state.bpmnModeler;
        var elementFactory = viewer.get('elementFactory');
        var create = viewer.get('create');
        var canvas = viewer.get('canvas');
        var rootElement = canvas.getRootElement();
        var shape = elementFactory.createShape({type: type},{id: 'EndTask_1'});
        var bo = shape.businessObject;
        bo.name = '结束节点';
        assign(shape, { x: 250, y: 250 });
        canvas.addShape(shape,rootElement);
        // create.start(event, shape);
    };
    getXML = () => {
        var viewer = this.state.bpmnModeler;
        return new Promise((resolve) => {
            viewer.saveXML({format: true },(err, xml) => {
                moddle.fromXML(xml, {format: true}, (err, definitions, context) => {
                    resolve({definitions, context});
                });
            });

        });
    };
    renderNewDiagram3=() => {
        this.getXML().then(({definitions,context}) => {
            let model = new BpmnModdle();
            var bpmnProcess = moddle.create('bpmn:UserTask', {
                id: 'UserTask_1_1',
            });
            var bpmdi = moddle.create('bpmndi:BPMNShape', {
                // 填充颜色
                fill: '#fff',
                // 边框颜色
                stroke: '#000',
                bpmnElement: bpmnProcess,
                bounds: moddle.create('dc:Bounds', { x: 100.0, y: 200.0, width: 100.0, height: 50.0 })
            });
            definitions.get('rootElements')[0].flowElements.push(bpmnProcess);
            definitions.diagrams[0].plane.planeElement.push(bpmdi);
            moddle.toXML(definitions, (err, xmlStrUpdated) => {
                // console.log(xmlStrUpdated)
                this.createNewDiagram(xmlStrUpdated);
            });
        });


    };
    handleAddElement= () => {

        this.getXML().then(({definitions,context}) => {
            //todo ok
            // var bpmnProcess = moddle.create('bpmn:UserTask', {
            //     id: 'UserTask_1_1',
            // });
            //todo ok
            // var bpmnProcess = moddle.create('bpmn:StartEvent', {
            //     id: 'StartEvent_1'
            // });
            //todo ok网关
            var bpmnProcess = moddle.create('bpmn:Gateway', {
                id: 'Gateway_1'
            });
            //todo
            // var bpmnProcess = moddle.create('bpmn:Process', {
            //     id: 'Process_1'
            // });
            //todo 结束时间也报错
            // var bpmnProcess = moddle.create('bpmn:EndEvent', {
            //     id: 'EndEvent_1'
            // });


            var viewer = this.state.bpmnModeler;
            var elementFactory = viewer.get('elementFactory');

            console.log(elementFactory);
            // var connection = GraphicsFactory.drawConnection();
            // var connection = elementFactory.create('connection', {
            //     type: 'bpmn:SequenceFlow',
            //     waypoints: [
            //         { x: 0, y: 0 },
            //         { x: 10, y: 100 }
            //     ]
            // });


            var bpmdi = moddle.create('bpmndi:BPMNShape', {
                // 填充颜色
                fill: '#fff',
                // 边框颜色
                stroke: '#000',
                bpmnElement: bpmnProcess,
                bounds: moddle.create('dc:Bounds', { x: 300.0, y: 74.0, width: 100.0, height: 50.0 })
            });
            definitions.get('rootElements')[0].flowElements.push(bpmnProcess);
            definitions.diagrams[0].plane.planeElement.push(bpmdi);
            moddle.toXML(definitions, (err, xmlStrUpdated) => {
                // console.log(xmlStrUpdated)
                this.createNewDiagram(xmlStrUpdated);
            });


        });









        // var viewer = this.state.bpmnModeler;
        // var overlays = viewer.get('overlays'),
        //     canvas = viewer.get('canvas'),
        //     //获取的一个元素
        //     elementRegistry = viewer.get('elementRegistry'),
        //     modeling = viewer.get('modeling');
        // //默认元素的id是 StartEvent_1k7etac
        // var shape = elementRegistry.get('StartEvent_1k7etac');
        // var $overlayHtml = $('<div class="circle-element" id="Task_2">')
        //     .css({
        //         width: shape.width -10,
        //         height: shape.height -10
        //     });
        //
        // overlays.add('StartEvent_1k7etac', {
        //     position: {
        //         top: shape.width+10,
        //         left: shape.height +10
        //     },
        //     html: $overlayHtml
        // });
        //
        // var bpmnProcess = moddle.create('bpmn:Process', { id: 'MyProcess_1' });

    };
    handleEditElement=() => {
        var viewer = this.state.bpmnModeler;
        var overlays = viewer.get('overlays'),
            canvas = viewer.get('canvas'),
            //获取的一个元素
            elementRegistry = viewer.get('elementRegistry'),
            modeling = viewer.get('modeling');
        //默认元素的id是 StartEvent_1k7etac
        var shape = elementRegistry.get('StartEvent_1k7etac');
        var directEditing = viewer.get('directEditing');
        directEditing.activate(shape);
    };
    setEncoded=(link, name, data) => {
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
    handleDownLoadBPMN =() => {
        var viewer = this.state.bpmnModeler;
        var downloadSvgLink = $('#js-download-svg');
        var downloadLink = $('#js-download-diagram');
        viewer.saveXML({format: true },(err, xml) => {
            this.setEncoded(downloadLink, 'diagram.bpmn', err ? null : xml);
        });
    };
    clickToConnectTasks = () => {

        //         //todo 如何画一个直线
        // var viewer = this.state.bpmnModeler;
        //         viewer.addCustomElements([ {
        //             "type":"custom:connection",
        //             "id":"CustomConnection_2",
        //             "replacementType" : 'bpmn:SequenceFlow',
        //             "waypoints":[
        //                 {
        //                     "original":{
        //                         "x":219,
        //                         "y":145
        //                     },
        //                     "x":219,
        //                     "y":145
        //                 },
        //                 {
        //                     "original":{
        //                         "x":309,
        //                         "y":145
        //                     },
        //                     "x":309,
        //                     "y":145
        //                 }
        //             ],
        //             "source":"StartEvent_1k7etac",
        //             "target":"UserTask_1_1"
        //         },]);


        var viewer = this.state.bpmnModeler;
        var
            //获取的一个元素
            elementRegistry = viewer.get('elementRegistry');
        var modeling = viewer.get('modeling');
        // given
        var eventBasedGateway = elementRegistry.get('StartEvent_1k7etac'),
            receiveTask = elementRegistry.get('Gateway_1');

        // when
        modeling.connect(eventBasedGateway, receiveTask, {
            type: 'bpmn:SequenceFlow'
        });
    }
    render() {
        return (
            <div className="containers" ref="content">
                <div className="canvas" id="canvas" ref="canvas"></div>
                <div id="js-properties-panel" className="panel">
                    <button onClick={this.handleAddElement}>点击添加某个元素</button>
                    <button onClick={this.handleEditElement}>点击输入节点描述</button>
                    <button onClick={this.clickToConnectTasks}>点击连接两条线</button>
                    <button onClick={this.createEndNode}>创建结束节点</button>
                </div>
                <ul className="buttons">
                    <li>
                        <a id="js-download-diagram" href title="download BPMN diagram" onClick={this.handleDownLoadBPMN}>
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

/**
 * Created by wangliping on 2019/2/27.
 */
