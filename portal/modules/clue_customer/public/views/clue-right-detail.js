/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
import BasicData from './basic_info';
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/clue-right-detail.less');
var Tabs = require('antd').Tabs;
var TabPane = Tabs.TabPane;
const TAB_KEYS = {
    OVERVIEW_TAB: '1',//概览页
    DYNAMIC_TAB: '2',//动态
};
var tabNameList = {
    '1': Intl.get('clue.detail.info','线索信息'),
    '2': Intl.get('user.change.record', '变更记录'),
};
var noop = function() {

};
import ClueDynamic from '../views/dynamic';
import ClueBasicInfo from '../views/clue_detail_overview';
import Trace from 'LIB_DIR/trace';
import clueAjax from '../ajax/clue-customer-ajax';
class ClueRightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: TAB_KEYS.OVERVIEW_TAB,//tab激活页的key
            curClue: $.extend(true, {}, this.props.curClue),
            relatedCustomer: {},//与线索相关联的客户
        };
    }


    componentWillReceiveProps(nextProps) {
        //如果有更改后，id不变，但是属性有变化  && nextProps.curClue.id !== this.props.curClue.id
        if (nextProps.curClue) {
            this.setState({
                curClue: $.extend(true, {}, nextProps.curClue)
            });
        }
    }
    hideRightPanel = () => {
        this.setState({
            relatedCustomer: {},
            activeKey: TAB_KEYS.OVERVIEW_TAB,
            curClue: $.extend(true, {}, this.props.curClue),
        });
        this.props.hideRightPanel();
    };
    //切换tab时的处理
    changeActiveKey = (key) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-tabs-nav-wrap .ant-tabs-nav'), '查看' + tabNameList[key]);
        this.setState({
            activeKey: key
        });
    };
    render(){
        return (
            <div className="clue-detail-wrap">
                <BasicData
                    clueStatus={this.state.curClue.status}
                    clueTypeTitle={this.state.curClue.name}
                    data-tracename="点击关闭展示线索客户面板"
                />
                <div className="clue-detail-content" >
                    <Tabs
                        defaultActiveKey={TAB_KEYS.OVERVIEW_TAB}
                        activeKey={this.state.activeKey}
                        onChange={this.changeActiveKey}
                    >
                        <TabPane
                            tab={tabNameList[TAB_KEYS.OVERVIEW_TAB]}
                            key={TAB_KEYS.OVERVIEW_TAB}
                        >
                            {this.state.activeKey === TAB_KEYS.OVERVIEW_TAB ? (
                                <ClueBasicInfo
                                    curClue={this.state.curClue}
                                    accessChannelArray={this.props.accessChannelArray}
                                    clueSourceArray={this.props.clueSourceArray}
                                    clueClassifyArray={this.props.clueClassifyArray}
                                    updateClueSource={this.props.updateClueSource}
                                    updateClueChannel={this.props.updateClueChannel}
                                    updateClueClassify={this.props.updateClueClassify}
                                    salesManList={this.props.salesManList}
                                />
                            ) : null}
                        </TabPane>
                        <TabPane
                            tab={tabNameList[TAB_KEYS.DYNAMIC_TAB]}
                            key={TAB_KEYS.DYNAMIC_TAB}
                        >
                            {this.state.activeKey === TAB_KEYS.DYNAMIC_TAB ? (
                                <ClueDynamic
                                    currentId={this.state.curClue.id}
                                />
                            ) : null}
                        </TabPane>
                    </Tabs>
                </div>
            </div>


        );
    }
}
ClueRightPanel.defaultProps = {
    curClue: {},
    clueSourceArray: [],
    accessChannelArray: [],
    clueClassifyArray: [],
    hideRightPanel: noop,
    updateClueSource: noop,
    updateClueChannel: noop,
    updateClueClassify: noop,
    salesManList: [],
};
ClueRightPanel.propTypes = {
    curClue: React.PropTypes.object,
    hideRightPanel: React.PropTypes.func,
    clueSourceArray: React.PropTypes.object,
    accessChannelArray: React.PropTypes.object,
    clueClassifyArray: React.PropTypes.object,
    updateClueSource: React.PropTypes.func,
    updateClueChannel: React.PropTypes.func,
    updateClueClassify: React.PropTypes.func,
    salesManList: React.PropTypes.object,

};
export default ClueRightPanel;