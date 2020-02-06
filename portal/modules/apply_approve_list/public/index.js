/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2020/02/06.
 */
require('./css/index.less');
import {APPLY_APPROVE_TAB_TYPES, APPLY_TYPE} from './utils/apply_approve_utils';
import classNames from 'classnames';
import {Dropdown, Menu} from 'antd';
import userData from 'PUB_DIR/sources/user-data';

import {APPLY_APPROVE_TYPES} from 'PUB_DIR/sources/utils/consts';
import AddSalesOpportunityApply from 'MOD_DIR/sales_opportunity/public/view/add-sales-opportunity-apply';
import AddBusinessApply from 'MOD_DIR/business-apply/public/view/add-business-apply';
import AddLeaveApply from 'MOD_DIR/leave-apply/public/view/add-leave-apply';

class ApplyApproveList extends React.Component {
    state = {
        activeApplyTab: APPLY_TYPE.APPLY_BY_ME,
        addApplyFormPanel: '',//添加的申请审批的表单类型
    };

    onStoreChange = () => {
    };

    componentDidMount() {

    }

    handleChangeApplyActiveTab = (activeTab) => {
        this.setState({
            activeApplyTab: activeTab
        });
    };
    //打开添加申请的面板
    openAddApplyForm = (item) => {
        this.setState({
            addApplyFormPanel: item.type
        });
    };
    getAddApplyTypeMenu = () => {
        let user = userData.getUserData();
        var workFlowList = _.get(user, 'workFlowConfigs', []);
        return (
            <Menu>
                {_.map(workFlowList, (item, index) => {
                    if(item.type === APPLY_APPROVE_TYPES.USERAPPLY){
                        return null;
                    }
                    return (
                        <Menu.Item key={index}>
                            <a onClick={this.openAddApplyForm.bind(this, item)}>
                                {Intl.get('common.add', '添加')}
                                {_.get(item, 'description')}</a>
                        </Menu.Item>
                    );
                })}
            </Menu>
        );
    };
    //左侧申请审批不同类型列表
    renderApplyListTab = () => {
        var activeApplyTab = this.state.activeApplyTab;
        return (
            <div className='apply_approve_list_wrap'>
                <div className='apply_approve_list_tab'>
                    <ul>
                        {_.map(APPLY_APPROVE_TAB_TYPES, item => {
                            var cls = classNames('apply_type_item', {
                                'active-tab': activeApplyTab === _.get(item, 'value', '')
                            });
                            return <li className={cls}
                                onClick={this.handleChangeApplyActiveTab.bind(this, _.get(item, 'value', ''))}>
                                {_.get(item, 'name', '')}
                            </li>;
                        })}
                    </ul>
                    <div className='add_apply_type_icon'>
                        <Dropdown overlay={this.getAddApplyTypeMenu()} trigger={['click']}>
                            <i className='iconfont icon-plus'></i>
                        </Dropdown>
                    </div>
                </div>
            </div>
        );
    };
    //申请审批的详情
    renderApplyListDetail = () => {
        return (
            <div className='apply_approve_detail_wrap'>

            </div>
        );
    };
    closeAddApplyForm = () => {
        this.setState({
            addApplyFormPanel: ''
        });
    };
    renderAddApplyForm = () => {
        var addApplyFormPanel = this.state.addApplyFormPanel;
        let addApplyPanel = null;
        switch (addApplyFormPanel) {
            case APPLY_APPROVE_TYPES.BUSINESSOPPORTUNITIES:
                return <AddSalesOpportunityApply hideSalesOpportunityApplyAddForm={this.closeAddApplyForm}/>;
            case APPLY_APPROVE_TYPES.BUSSINESSTRIP:
                return <AddBusinessApply hideBusinessApplyAddForm={this.closeAddApplyForm}/>;
            case APPLY_APPROVE_TYPES.LEAVE:
                return <AddLeaveApply/>;
        }
    };

    render() {
        return (
            <div className='apply_approve_content_wrap'>
                {this.renderApplyListTab()}
                {this.renderApplyListDetail()}
                {this.renderAddApplyForm()}
            </div>
        );
    }
}

ApplyApproveList.defaultProps = {};
ApplyApproveList.propTypes = {};
module.exports = ApplyApproveList;