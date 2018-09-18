/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/10.
 */
import Trace from 'LIB_DIR/trace';
var leaveApplyStore = require('./store/leave-apply-store');
var leaveApplyAction = require('./action/leave-apply-action');
import TopNav from 'CMP_DIR/top-nav';
require('./css/index.less');
var userData = require('PUB_DIR/sources/user-data');
import {Button} from 'antd';
import AddLeaveApplyPanel from './view/add-leave-apply';
var hasPrivilege = require('CMP_DIR/privilege/checker').hasPrivilege;
var className = require('classnames');
class LeaveApplyManagement extends React.Component {
    state = {
        showAddApplyPanel: false,//是否展示添加出差申请面板
        ...leaveApplyStore.getState()
    };

    onStoreChange = () => {
        this.setState(leaveApplyStore.getState());
    };

    componentDidMount() {
        leaveApplyStore.listen(this.onStoreChange);
        //如果是普通销售，就获取自己的申请列表
        // if (userData.getUserData().isCommonSales){
        //     this.getSelfLeaveApplyList();
        // }else{
        //如果是管理员或者是销售领导，就获取要由自己审批的申请列表
        // this.getWorklistLeaveApplyList();
        // }
        // todo 获取全部的申请列表
        this.getAllLeaveApplyList();


    }
    getQueryParams(){
        var params = {
            sort_field: this.state.sort_field,//排序字段
            status: this.state.status,//请假申请的状态
            order: this.state.order,
            page_size: this.state.page_size,
            id: this.state.lastLeaveApplyId, //用于下拉加载的id
        };
        return params;
    }

    //获取全部请假申请
    getAllLeaveApplyList() {
        var queryObj = this.getQueryParams();
        leaveApplyAction.getAllApplyList(queryObj);
    }

    //获取自己发起的请假申请
    getSelfLeaveApplyList() {
        leaveApplyAction.getSelfApplyList();
    }

    //获取由自己审批的请假申请
    getWorklistLeaveApplyList() {
        leaveApplyAction.getWorklistLeaveApplyList();
    }

    componentWillUnmount() {
        leaveApplyStore.unlisten(this.onStoreChange);
    }

    showAddApplyPanel = () => {
        this.setState({
            showAddApplyPanel: true
        });
    };
    hideLeaveApplyAddForm = () => {
        this.setState({
            showAddApplyPanel: false
        });
    };

    render() {
        var addPanelWrap = className({'show-add-modal': this.state.showAddApplyPanel});
        return (
            <div className="leave-apply-container">
                <TopNav>
                    {hasPrivilege('BUSINESS_TRIP_APPLY') ?
                        <Button className='pull-right btn-item' onClick={this.showAddApplyPanel}
                        >{Intl.get('add.leave.apply', '添加出差申请')}</Button> : null}
                </TopNav>
                <div className="leave-apply-list-detail-wrap">
                    <div className="col-md-4 leave-apply-list" data-tracename="出差申请列表">
                        {/*this.renderApplyHeader()*/}
                        {/*this.renderApplyListError()*/}
                        {/*
                            this.state.applyListObj.loadingResult === 'loading' && !this.state.lastApplyId ? (
                                <Spinner/>) : (<div className="app_user_apply_list_style">
                                    <div style={{height: applyListHeight}}>
                                        <GeminiScrollbar
                                            handleScrollBottom={this.handleScrollBarBottom}
                                            listenScrollBottom={this.state.listenScrollBottom}
                                            itemCssSelector=".app_user_manage_apply_list>li"
                                        >
                                            {this.renderApplyList()}
                                            <NoMoreDataTip
                                                fontSize="12"
                                                show={this.showNoMoreDataTip}
                                            />
                                        </GeminiScrollbar>
                                    </div>
                                    {this.state.applyId ? null : (
                                        <div className="summary_info">
                                            <ReactIntl.FormattedMessage
                                                id="user.apply.total.apply"
                                                defaultMessage={'共{number}条申请{apply_type}'}
                                                values={{
                                                    'number': this.state.totalSize,
                                                    'apply_type': applyType
                                                }}
                                            />
                                        </div>)
                                    }
                                </div>
                            )
                        */}
                    </div>

                </div>
                {this.state.showAddApplyPanel ?
                    <div className={addPanelWrap}>
                        <AddLeaveApplyPanel
                            hideLeaveApplyAddForm={this.hideLeaveApplyAddForm} />
                    </div>
                    : null}

            </div>
        );
    }
}
module.exports = LeaveApplyManagement;