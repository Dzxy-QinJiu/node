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
var addLeaveApplyPanel = require('./view/add-leave-apply');
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
        this.getAllLeaveApplyList();


    }
    //获取全部请假申请
    getAllLeaveApplyList(){
        leaveApplyAction.getAllApplyList();
    }
    //获取自己发起的请假申请
    getSelfLeaveApplyList(){
        leaveApplyAction.getSelfApplyList();
    }
    //获取由自己审批的请假申请
    getWorklistLeaveApplyList(){
        leaveApplyAction.getWorklistLeaveApplyList();
    }
    componentWillUnmount() {
        leaveApplyStore.unlisten(this.onStoreChange);
    }
    showAddApplyPanel = () => {

    };
    render(){
        return (
            <div className="leave-apply-container">
                <TopNav>
                    <Button className='pull-right' onClick={this.showAddApplyPanel}
                    >{Intl.get('add.leave.apply','添加出差申请')}</Button>
                </TopNav>
                <div>

                </div>
                {this.state.showAddApplyPanel ? <addLeaveApplyPanel/> : null}

            </div>
        );
    }
}
module.exports = LeaveApplyManagement;