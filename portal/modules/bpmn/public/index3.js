/**
 * Created by wangliping on 2019/2/27.
 */
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
        formData1111: [
            {
                name: 'task1',
                id: 'UserTask_1',
                type: 'UserTask',
                next: ['Gateway_1']
            },
            {
                name: 'Gateway_1',
                id: 'Gateway_1',
                type: 'Gateway',
                next: ['UserTask_2']
            },
            {
                name: 'task2',
                id: 'UserTask_2',
                type: 'UserTask',
                next: ['Gateway_2']
            },
            {
                name: 'Gateway_2',
                id: 'Gateway_2',
                type: 'Gateway',
                next: []
            }
        ],
        formData: [
            {
                name: 'UserTask_1',
                id: 'UserTask_1',
                type: 'UserTask',
                previous: 'StartEvent_1k7etac',
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
                    },{
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

    createNewDiagram(xml,callback) {
        this.state.bpmnModeler.importXML(xml, (err) => {
            if (err) {
                console.error(err);
            } else {
                _.isFunction(callback) && callback();
            }
        });
    }

    traversingSelectTeamTree =(teamTreeList, selectedTeams) => {
        let teamTotalArr = [];
        if (_.isArray(teamTreeList) && teamTreeList.length) {
            _.each(teamTreeList, team => {
                if (selectedTeams === team.group_id) {
                    teamTotalArr.push(team);
                } else if (team.child_groups) {
                    teamTotalArr = _.union(teamTotalArr, traversingSelectTeamTree(team.child_groups, selectedTeams));
                }
            });
        }
        return teamTotalArr;
    };
    //连接两个节点进行画线
    connectDiffNode = (startNode,endNode) => {
        var viewer = this.state.bpmnModeler;
        var modeling = viewer.get('modeling');
        modeling.connect(startNode, endNode, {
            type: 'bpmn:SequenceFlow'
        });
    };
    //创建结束节点
    createEndNode =(event) => {
        let self = this;
        var type = 'bpmn:EndEvent';
        var viewer = this.state.bpmnModeler;
        var elementFactory = this.state.elementFactory;
        var create = this.state.create;
        var canvas = this.state.canvas;
        var rootElement = canvas.getRootElement();
        var shape = elementFactory.createShape({type: type},{id: 'EndTask_1'});
        // var bo = shape.businessObject;
        // bo.name = '结束节点';
        assign(shape, { x: 250, y: 250 });
        canvas.addShape(shape,rootElement);
        // create.start(event, shape);
    };
    traversingBpmnNodeTree = (formData,definitions) => {
        var viewer = this.state.bpmnModeler;
        var overlays = viewer.get('overlays'),
            canvas = this.state.canvas,
            //获取的一个元素
            elementRegistry = this.state.elementRegistry,
            modeling = this.state.modeling,
            elementFactory = this.state.elementFactory;
        if(_.isArray(formData) && formData.length){
            _.forEach(formData,(item) => {
                //取到创建节点的类型
                var bpmnType = `bpmn:${item.type}`;
                var curNode = elementFactory.createShape(Object.assign({ type: bpmnType},{id: item.id}));
                var previousNode = elementRegistry.get(item.previous);
                modeling.appendShape(previousNode, curNode);
                //如果有下一节点
                this.traversingBpmnNodeTree(item.next);

                //todo 添加元素的第二种方法
                // var bpmnProcess = moddle.create(`bpmn:${bpmnType}`, {
                //     id: item.id
                // });
                // var bpmdi = moddle.create('bpmndi:BPMNShape', {
                //     // 填充颜色
                //     fill: '#fff',
                //     // 边框颜色
                //     stroke: '#000',
                //     bpmnElement: bpmnProcess,
                //     bounds: moddle.create('dc:Bounds', {x: 300.0, y: 74.0, width: 100.0, height: 50.0})
                // });
                // definitions.get('rootElements')[0].flowElements.push(bpmnProcess);
                // definitions.diagrams[0].plane.planeElement.push(bpmdi);
                // moddle.toXML(definitions, (err, xmlStrUpdated) => {
                //     this.createNewDiagram(xmlStrUpdated,()=>{
                //         var startNode = elementRegistry.get(item.previous);
                //         var endNode = elementRegistry.get(item.id);
                //         this.connectDiffNode(startNode, endNode);
                //     });
                //
                // });

            });
        }

    };

    afterSuccessImportXML(){
        this.getXML().then(({definitions, context}) => {
            //手动的添加剩下的节点
            var formData = this.state.formData;
            this.traversingBpmnNodeTree(formData,definitions);
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
        },() => {
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
            this.createNewDiagram(bpmnXmlStr,() => {
                // 这里还没用到这个，先注释掉吧
                this.afterSuccessImportXML();
                //创建结束节点
                // this.createEndNode();
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

