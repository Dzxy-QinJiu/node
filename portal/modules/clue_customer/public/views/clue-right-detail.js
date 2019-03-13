var React = require('react');
/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/8/8.
 */
import {RightPanel} from 'CMP_DIR/rightPanel';
require('../css/clue-right-detail.less');
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
import {Button, Tabs, message, Icon} from 'antd';
var TabPane = Tabs.TabPane;
const TAB_KEYS = {
    OVERVIEW_TAB: '1',//概览页
    DYNAMIC_TAB: '2',//动态
};
var tabNameList = {
    '1': Intl.get('clue.detail.info', '线索信息'),
    '2': Intl.get('user.change.record', '变更记录'),
};
var noop = function() {

};
const DYNAMICHEIGHT = {
    LAYOUT: 130
};
import PropTypes from 'prop-types';
import {renderClueStatus} from 'PUB_DIR/sources/utils/common-method-util';
import ClueDynamic from '../views/dynamic';
import ClueBasicInfo from '../views/clue_detail_overview';
import Trace from 'LIB_DIR/trace';
import clueCustomerAjax from '../ajax/clue-customer-ajax';
import {clueSourceArray, accessChannelArray, clueClassifyArray} from 'PUB_DIR/sources/utils/consts';
import {removeSpacesAndEnter} from 'PUB_DIR/sources/utils/common-method-util';
var clueCustomerAction = require('../action/clue-customer-action');
import {checkOnlyContactName} from '../utils/clue-customer-utils';

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
            tabsContainerHeight: 'auto'
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

    getCurClue = (id) => {
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
    };
    getSaleTeamList = () => {
        clueCustomerAjax.getSalesManList().then(data => {
            this.setState({
                salesManList: _.filter(data, sales => sales && sales.user_info && sales.user_info.status === 1)
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
        var curClue = this.state.curClue;
        var phoneArr = [],contactsArr = curClue.contacts;
        if (_.isArray(contactsArr) && contactsArr.length){
            _.forEach(contactsArr,(contactItem) => {
                var phone = contactItem.phone;
                if (_.isArray(phone) && phone.length){
                    phoneArr = _.concat(phoneArr,phone);
                }
            });
        }
        var queryObj = {phone: phoneArr.join(','),name: _.get(saveObj,'name'),customer_id: _.get(curClue,'id')};
        checkOnlyContactName(queryObj, (result) => {
            if (_.isString(result)){
                errorFunc();
            }else{
                this.updateClueCustomerName(type, saveObj, successFunc, errorFunc);
            }

        });
    };
    updateClueCustomerName = (type, saveObj, successFunc, errorFunc) => {
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
    //删除某条线索
    handleRemoveClue = (curClue) => {
        this.setState({
            isRemoveClue: curClue
        });
    };
    //确认删除某条线索
    handleConfirmDeleteClue = () => {
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
                _.isFunction(this.props.hideRightPanel) && this.props.hideRightPanel();
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
    render() {
        var curClue = this.state.curClue;
        //是否没有权限修改线索详情
        var hasPrivilegeEdit = hasPrivilege('CLUECUSTOMER_UPDATE_MANAGER');
        var divHeight = $(window).height() - DYNAMICHEIGHT.LAYOUT;
        var cls = 'clue_customer_rightpanel white-space-nowrap';
        if (this.props.className){
            cls += ` ${this.props.className}`;
        }
        return (
            <RightPanel
                className={cls}
                showFlag={this.props.showFlag} data-tracename="线索详情面板">
                <span className="iconfont icon-close clue-right-btn" onClick={this.hideRightPanel} data-tracename="关闭线索详情面板"></span>
                {this.state.getClueDetailErrMsg ? <div className="no-data-tip">{this.state.getClueDetailErrMsg}</div> :
                    <div className="clue-detail-wrap" data-tracename="线索详情">
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
                                        placeholder={Intl.get('clue.customer.fillin.clue.name', '请填写线索名称')}
                                    />
                                </div>
                            </div>
                            {hasPrivilege('CLUECUSTOMER_DELETE') ?
                                <div className="remove-clue">
                                    <i className="iconfont icon-delete"
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
                                            curClue={curClue}
                                            accessChannelArray={this.state.accessChannelArray}
                                            clueSourceArray={this.state.clueSourceArray}
                                            clueClassifyArray={this.state.clueClassifyArray}
                                            updateClueSource={this.updateClueSource}
                                            updateClueChannel={this.updateClueChannel}
                                            updateClueClassify={this.updateClueClassify}
                                            salesManList={this.state.salesManList}
                                            divHeight={divHeight}
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

            </RightPanel>
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
};
ClueRightPanel.propTypes = {
    curClue: PropTypes.object,
    hideRightPanel: PropTypes.func,
    salesManList: PropTypes.object,
    showFlag: PropTypes.bool,
    currentId: PropTypes.string,
    className: PropTypes.string,

};
export default ClueRightPanel;