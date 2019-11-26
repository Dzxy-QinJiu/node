var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
require('../css/clue-right-detail.less');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import {Button, Tabs, message, Icon} from 'antd';
var TabPane = Tabs.TabPane;
const TAB_KEYS = {
    OVERVIEW_TAB: '1',//概览页
    CLUE_TRACE_LIST: '2',//跟进记录
    DYNAMIC_TAB: '3',//动态
    SCHEDULE_LIST: '4',//联系计划
};
var tabNameList = {
    '1': Intl.get('clue.detail.info', '线索信息'),
    '2': Intl.get('menu.trace', '跟进记录'),
    '3': Intl.get('user.change.record', '变更记录'),
    '4': Intl.get('crm.right.schedule', '联系计划')
};
var noop = function() {

};
import {subtracteGlobalClue} from 'PUB_DIR/sources/utils/common-method-util';
import { clueEmitter } from 'PUB_DIR/sources/utils/emitters';
const DYNAMICHEIGHT = {
    LAYOUT: 117,
    HAS_PHONE_PANEL: 225,
    PHONE_PANEL_HAS_CUSTOMER_SCHEDULE: 235,
    PHONE_PANEL_HAS_TRACE_FINISHED: 65
};
import PropTypes from 'prop-types';
import {renderClueStatus} from 'PUB_DIR/sources/utils/common-method-util';
import ClueDynamic from '../views/dynamic';
import ClueBasicInfo from '../views/clue_detail_overview';
import ClueTraceList from '../views/clue_trace_list';
import ScheduleList from '../views/schedule';
import Trace from 'LIB_DIR/trace';
import clueCustomerAjax from '../ajax/clue-customer-ajax';
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
import {removeSpacesAndEnter} from 'PUB_DIR/sources/utils/common-method-util';
var clueCustomerAction = require('../action/clue-customer-action');
import {handleSubmitClueItemData, SELECT_TYPE, editCluePrivilege} from '../utils/clue-customer-utils';
import {phoneMsgEmitter} from 'PUB_DIR/sources/utils/emitters';
import cluePoolAjax from 'MOD_DIR/clue_pool/public/ajax';
import userData from 'PUB_DIR/sources/user-data';
import {getAllSalesUserList} from 'PUB_DIR/sources/utils/common-data-util';
//用来判断是否是线索池中打开的线索详情的类型标识
const ClUE_POOL = 'clue_pool';

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
            isRemoveClue: {},//正在删除的那条线索
            relatedCustomer: {},//与线索相关联的客户
            isDeletingClue: false,//正在删除线索
            tabsContainerHeight: 'auto',
        };
    }

    componentWillMount() {
        if (_.isEmpty(this.state.curClue) && this.props.currentId) {
            this.getCurClue(this.props.currentId);
        }
    }

    componentDidMount = () => {
        this.getClueSource();
        this.getClueChannel();
        this.getClueClassify();
        this.getSaleTeamList();
        this.setTabsContainerHeight();
        $(window).resize(e => {
            e.stopPropagation();
            this.setTabsContainerHeight();
        });
    };
    setTabsContainerHeight = () => {
        let tabsContainerHeight = $('body').height() - $('.clue-detail-content').outerHeight(true);
        this.setState({tabsContainerHeight: tabsContainerHeight});
    };
    componentWillReceiveProps(nextProps) {
        //如果有更改后，id不变，但是属性有变化  && nextProps.curClue.id !== this.props.curClue.id
        if (_.get(nextProps.curClue,'id')) {
            this.setState({
                curClue: $.extend(true, {}, nextProps.curClue)
            });
        } else if (nextProps.currentId !== this.props.currentId && nextProps.currentId) {
            this.getCurClue(nextProps.currentId);
        }
        this.setTabsContainerHeight();
    }
    //是否是从线索池中打开的详情
    isCluePool() {
        return this.props.type === ClUE_POOL;
    }
    getCurClue = (id) => {
        // 线索池中获取线索详情和线索中获取详情是两个路径
        if (this.isCluePool()) { // 线索池中获取线索详情的请求
            cluePoolAjax.getClueDetailById(id).then(resData => {
                if (_.isObject(resData)) {
                    resData.clue_type = ClUE_POOL;
                    this.setState({
                        curClue: resData
                    });
                }else{
                    this.setState({
                        getClueDetailErrMsg: Intl.get('clue.failed.get.clue.detail','获取线索详情失败')
                    });
                }
            }, (errMsg) => {
                this.setState({
                    getClueDetailErrMsg: errMsg || Intl.get('clue.failed.get.clue.detail','获取线索详情失败')
                });
            });
        } else { // 线索中获取详情的请求
            clueCustomerAjax.getClueDetailById(id).then(resData => {
                if (_.isObject(resData)) {
                    this.setState({
                        curClue: resData
                    });
                }else{
                    this.setState({
                        getClueDetailErrMsg: Intl.get('clue.failed.get.clue.detail','获取线索详情失败')
                    });
                }
            }, (errMsg) => {
                this.setState({
                    getClueDetailErrMsg: errMsg || Intl.get('clue.failed.get.clue.detail','获取线索详情失败')
                });
            });
        }

    };
    // 是否是管理员或者运营人员
    isManagerOrOperation = () => {
        return userData.hasRole(userData.ROLE_CONSTANS.REALM_ADMIN) || userData.hasRole(userData.ROLE_CONSTANS.OPERATION_PERSON);
    };
    getSaleTeamList = () => {
        if(this.isManagerOrOperation()) {
            getAllSalesUserList((list) => {
                this.setState({
                    salesManList: list
                });
            });
        }else {
            clueCustomerAjax.getSalesManList().then(data => {
                this.setState({
                    salesManList: _.filter(data, sales => sales && sales.user_info && sales.user_info.status === 1)
                });
            });
        }
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
        if (type === 'name'){
            saveObj.clueContact = _.get(this,'state.curClue.contacts');
        }
        var data = _.cloneDeep(saveObj);
        data = handleSubmitClueItemData(data);
        clueCustomerAjax.updateClueItemDetail(data).then((result) => {
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
    //删除某条线索
    handleRemoveClue = (curClue) => {
        this.setState({
            isRemoveClue: curClue
        });
    };
    //确认删除某条线索
    handleConfirmDeleteClue = (e) => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.delete-modal'), '确认删除线索');
        this.setState({
            isDeletingClue: true
        });
        var clueId = this.state.isRemoveClue.id;
        var clueStatus = this.state.isRemoveClue.status;
        clueCustomerAction.deleteClueById({customer_clue_ids: clueId, clueStatus: clueStatus}, (errorMsg) => {
            this.setState({
                isDeletingClue: false,
            });
            if (errorMsg) {
                message.error(errorMsg);
            } else {
                this.setState({
                    isRemoveClue: {},
                });
                var curClue = this.state.curClue;
                subtracteGlobalClue(curClue, (flag) => {
                    if(flag){
                        clueEmitter.emit(clueEmitter.REMOVE_CLUE_ITEM,curClue);
                    }
                });
                _.isFunction(this.props.hideRightPanel) && this.props.hideRightPanel(e);
            }
        });
    };
    //取消删除某条线索
    cancelDeleteClue = () => {
        Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.delete-modal'), '取消删除线索');
        this.setState({
            isRemoveClue: {}
        });
    };
    hideRightPanel = () => {
        _.isFunction(this.props.hideRightPanel) && this.props.hideRightPanel();
        this.setState({
            getClueDetailErrMsg: '',
            isRemoveClue: {},
        });
    };

    updateClueProperty = (updateProperty,flag) => {
        var curClue = this.state.curClue;
        let contactsKey = ['qq','weChat','phone','email'];
        let contact_id = updateProperty.contact_id;
        let contacts = _.find(curClue.contacts, ele => ele.id === contact_id);

        for (var key in updateProperty){
            if(contacts){//是否修改了联系人属性
                if(key === 'contact_name'){
                    contacts['name'] = updateProperty[key];
                }else if(contactsKey.indexOf(key) > -1){
                    contacts[key] = updateProperty[key];
                }
            }
            curClue[key] = updateProperty[key];
        }
        this.setState({
            curClue: curClue
        });
        if (!flag){
            clueCustomerAction.afterEditCustomerDetail(updateProperty);
        }

    };
    updateCustomerLastContact = (saveObj) => {
        this.props.updateCustomerLastContact(saveObj);
        this.updateClueProperty({status: SELECT_TYPE.HAS_TRACE},true);
    };

    getCluePanelHeight = () => {
        let baseHeight = $(window).height() - DYNAMICHEIGHT.LAYOUT;
        //如果有电话跟进面板
        if(_.get(this.props, 'hasPhonePanel')) {
            baseHeight -= DYNAMICHEIGHT.HAS_PHONE_PANEL;
            //如果电话跟进面板正在添加自定义计划
            if(_.get(this.props, 'phonePanelHasCustomerSchedule')) {
                baseHeight -= DYNAMICHEIGHT.PHONE_PANEL_HAS_CUSTOMER_SCHEDULE;
            }
            //如果电话跟进面板跟进计划是text状态
            if(_.get(this.props, 'phonePanelFinishTrace')) {
                baseHeight += DYNAMICHEIGHT.PHONE_PANEL_HAS_TRACE_FINISHED;
            }
        }
        return baseHeight;
    };


    render() {
        let curClue = _.get(this.state, 'curClue');
        //是否没有权限修改线索详情
        var hasPrivilegeEdit = hasPrivilege('CLUECUSTOMER_UPDATE_MANAGER');
        var divHeight = this.getCluePanelHeight();
        var cls = 'clue_customer_rightpanel white-space-nowrap';
        if (this.props.className){
            cls += ` ${this.props.className}`;
        }
        //是否隐藏联系方式（线索池中不展示联系方式）
        let hideContactWay = this.isCluePool();
        return (
            <div
                className={cls}
                showFlag={this.props.showFlag} data-tracename="线索详情面板">
                {this.state.getClueDetailErrMsg ? <div className="no-data-tip">{this.state.getClueDetailErrMsg}</div> :
                    <div className="clue-detail-wrap" data-tracename="线索详情">
                        <div className="clue-basic-info-container">
                            <div className="clue-name-wrap">
                                {
                                    curClue.clue_type === ClUE_POOL ? null : renderClueStatus(curClue)
                                }
                                <div className="clue-name-title">
                                    <BasicEditInputField
                                        hasEditPrivilege={hasPrivilegeEdit && editCluePrivilege(curClue)}
                                        id={curClue.id}
                                        saveEditInput={this.saveEditBasicInfo.bind(this, 'name')}
                                        value={curClue.name}
                                        field='name'
                                        placeholder={Intl.get('clue.customer.fillin.clue.name', '请填写线索名称')}
                                    />
                                </div>
                            </div>
                            {hasPrivilege('CLUECUSTOMER_DELETE') && editCluePrivilege(curClue) ?
                                <div className="remove-clue">
                                    <i className="iconfont icon-delete handle-btn-item"
                                        onClick={this.handleRemoveClue.bind(this, curClue)} data-tracename="点击删除线索按钮"></i>
                                </div> : null}
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
                                            ref={clueBasicInfo => this.clueBasicInfo = clueBasicInfo}
                                            curClue={curClue}
                                            accessChannelArray={this.state.accessChannelArray}
                                            clueSourceArray={this.state.clueSourceArray}
                                            clueClassifyArray={this.state.clueClassifyArray}
                                            updateClueSource={this.updateClueSource}
                                            updateClueChannel={this.updateClueChannel}
                                            updateClueClassify={this.updateClueClassify}
                                            salesManList={this.state.salesManList}
                                            divHeight={divHeight}
                                            removeUpdateClueItem={this.props.removeUpdateClueItem}
                                            hideRightPanel={this.hideRightPanel}
                                            updateClueProperty={this.updateClueProperty}
                                            afterTransferClueSuccess={this.props.afterTransferClueSuccess}
                                            onConvertToCustomerBtnClick={this.props.onConvertToCustomerBtnClick}
                                            showClueToCustomerPanel={this.props.showClueToCustomerPanel}
                                            updateCustomerLastContact={this.updateCustomerLastContact}
                                            extractClueOperator={this.props.extractClueOperator}
                                            changeActiveKey={this.changeActiveKey}
                                            hideContactWay={hideContactWay}
                                        />
                                    ) : null}
                                </TabPane>
                                <TabPane
                                    tab={tabNameList[TAB_KEYS.CLUE_TRACE_LIST]}
                                    key={TAB_KEYS.CLUE_TRACE_LIST}
                                >
                                    {this.state.activeKey === TAB_KEYS.CLUE_TRACE_LIST ? (
                                        <ClueTraceList
                                            ref={clueTraceList => this.clueTraceList = clueTraceList}
                                            curClue={curClue}
                                            divHeight={divHeight}
                                            updateCustomerLastContact={this.updateCustomerLastContact}
                                            hideContactWay={hideContactWay}
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
                                            divHeight={divHeight}
                                            ShowCustomerUserListPanel={this.props.ShowCustomerUserListPanel}
                                        />
                                    ) : null}
                                </TabPane>
                                <TabPane
                                    tab={tabNameList[TAB_KEYS.SCHEDULE_LIST]}
                                    key={TAB_KEYS.SCHEDULE_LIST}
                                >
                                    {this.state.activeKey === TAB_KEYS.SCHEDULE_LIST ? (
                                        <ScheduleList
                                            curClue={this.state.curClue}
                                            divHeight={divHeight}
                                        />
                                    ) : null}
                                </TabPane>
                            </Tabs>
                        </div>
                        {!_.isEmpty(this.state.isRemoveClue) ?
                            <div className="delete-modal">
                                <div className="handle-btn">
                                    <Button type='primary' onClick={this.handleConfirmDeleteClue}>
                                        {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                        {this.state.isDeletingClue ? <Icon type="loading"/> : null}
                                    </Button>
                                    <Button onClick={this.cancelDeleteClue}>{Intl.get('common.cancel', '取消')}</Button>
                                </div>
                            </div>
                            : null}
                    </div>
                }

            </div>
        );
    }
}
ClueRightPanel.defaultProps = {
    curClue: {},
    hideRightPanel: noop,
    salesManList: [],
    showFlag: false,
    currentId: '',
    className: '',
    hasPhonePanel: false, //判断是否此时线索详情面板上有电话跟进面板
    phonePanelHasCustomerSchedule: false, //判断电话跟进面板是否在编辑自定义计划
    phonePanelFinishTrace: false,//判断电话跟进面板是否正在编辑跟进记录
    removeUpdateClueItem: noop,
    updateRemarks: noop,
    updateCustomerLastContact: noop,
    afterTransferClueSuccess: noop,
    onConvertToCustomerBtnClick: noop,
    showClueToCustomerPanel: noop,
};
ClueRightPanel.propTypes = {
    curClue: PropTypes.object,
    hideRightPanel: PropTypes.func,
    salesManList: PropTypes.object,
    showFlag: PropTypes.bool,
    currentId: PropTypes.string,
    className: PropTypes.string,
    ShowCustomerUserListPanel: PropTypes.func,
    removeUpdateClueItem: PropTypes.func,
    updateCustomerLastContact: PropTypes.func,
    afterTransferClueSuccess: PropTypes.func,
    type: PropTypes.string,
    onConvertToCustomerBtnClick: PropTypes.func,
    extractClueOperator: PropTypes.func,
    showClueToCustomerPanel: PropTypes.func,
    hasPhonePanel: PropTypes.bool,
    phonePanelHasCustomerSchedule: PropTypes.bool,
    phonePanelFinishTrace: PropTypes.bool,
};
export default ClueRightPanel;