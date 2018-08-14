/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/clue-right-detail.less');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
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
import {renderClueStatus} from 'PUB_DIR/sources/utils/common-method-util';
import ClueDynamic from '../views/dynamic';
import ClueBasicInfo from '../views/clue_detail_overview';
import Trace from 'LIB_DIR/trace';
import clueCustomerAjax from '../ajax/clue-customer-ajax';
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
import {removeSpacesAndEnter} from 'PUB_DIR/sources/utils/common-method-util';
var clueCustomerAction = require('../action/clue-customer-action');

class ClueRightPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accessChannelArray: accessChannelArray,//线索渠道
            clueSourceArray: clueSourceArray,//线索来源
            clueClassifyArray: clueClassifyArray,//线索分类
            salesManList: [],//销售列表
            activeKey: TAB_KEYS.OVERVIEW_TAB,//tab激活页的key
            curClue: $.extend(true, {}, this.props.curClue),
            relatedCustomer: {},//与线索相关联的客户
        };
    }
    componentDidMount = () => {
        this.getClueSource();
        this.getClueChannel();
        this.getClueClassify();
        this.getSaleTeamList();
    };
    getSaleTeamList = () => {
        clueCustomerAjax.getSalesManList().then(data => {
            this.setState({
                salesManList: data
            });
        });
    };
    getClueSource = () => {
        clueCustomerAjax.getClueSource().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueSourceArray: _.union(this.state.clueSourceArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索来源出错了 ' + errorMsg);
        });
    };
    getClueChannel = () => {
        clueCustomerAjax.getClueChannel().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    accessChannelArray: _.union(this.state.accessChannelArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索渠道出错了 ' + errorMsg);
        });
    };
    getClueClassify = () => {
        clueCustomerAjax.getClueClassify().then(data => {
            if (data && _.isArray(data.result) && data.result.length) {
                this.setState({
                    clueClassifyArray: _.union(this.state.clueClassifyArray, removeSpacesAndEnter(data.result))
                });
            }
        }, errorMsg => {
            // eslint-disable-next-line no-console
            console.log('获取线索分类出错了 ' + errorMsg);
        });
    };
    //更新线索来源列表
    updateClueSource = (newSource) => {
        this.state.clueSourceArray.push(newSource);
        this.setState({
            clueSourceArray: this.state.clueSourceArray
        });
    };
    //更新线索渠道列表
    updateClueChannel = (newChannel) => {
        this.state.accessChannelArray.push(newChannel);
        this.setState({
            accessChannelArray: this.state.accessChannelArray
        });
    };
    //更新线索分类
    updateClueClassify = (newClue) => {
        this.state.clueClassifyArray.push(newClue);
        this.setState({
            clueClassifyArray: this.state.clueClassifyArray
        });
    };
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
    //保存修改的基本信息
    saveEditBasicInfo = (type, saveObj, successFunc, errorFunc) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.clue-basic-info-container'), `保存线索${type}的修改`);
        clueCustomerAjax.updateCluecustomerDetail(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                clueCustomerAction.afterEditCustomerDetail(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    };
    render(){
        var curClue = this.state.curClue;
        //是否没有权限修改线索详情
        var hasPrivilegeEdit = hasPrivilege('CLUECUSTOMER_UPDATE_MANAGER');
        return (
            <div className="clue-detail-wrap">
                <div className="clue-basic-info-container">
                    <div className="clue-name-wrap">
                        {renderClueStatus(curClue.status)}
                        <div className="clue-name-title">
                            <BasicEditInputField
                                hasEditPrivilege={hasPrivilegeEdit}
                                id={curClue.id}
                                saveEditInput={this.saveEditBasicInfo.bind(this, 'name')}
                                value={curClue.name}
                                field='name'
                            />
                        </div>
                    </div>
                </div>
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
                                    curClue={curClue}
                                    accessChannelArray={this.state.accessChannelArray}
                                    clueSourceArray={this.state.clueSourceArray}
                                    clueClassifyArray={this.state.clueClassifyArray}
                                    updateClueSource={this.updateClueSource}
                                    updateClueChannel={this.updateClueChannel}
                                    updateClueClassify={this.updateClueClassify}
                                    salesManList={this.state.salesManList}
                                />
                            ) : null}
                        </TabPane>
                        <TabPane
                            tab={tabNameList[TAB_KEYS.DYNAMIC_TAB]}
                            key={TAB_KEYS.DYNAMIC_TAB}
                        >
                            {this.state.activeKey === TAB_KEYS.DYNAMIC_TAB ? (
                                <ClueDynamic
                                    currentId={curClue.id}
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
    hideRightPanel: noop,
    salesManList: [],
};
ClueRightPanel.propTypes = {
    curClue: React.PropTypes.object,
    hideRightPanel: React.PropTypes.func,
    salesManList: React.PropTypes.object,

};
export default ClueRightPanel;