/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2017/2/15.
 */
require('../css/user-type-config.less');
import {Icon} from 'antd';
var _ = require('lodash');
var UserTypeConfigForm = require('./user-type-config-form');
var UserTypeConfigList = require('./user-type-config-list');
import Trace from 'LIB_DIR/trace';
//表单默认配置
var initialItem = {
    //默认没id，用id区分增加和修改类型，有id是修改，没id是增加
    id: '',
    //到期停用 0 否 1 是,默认:1
    over_draft: 1,
    //多人登录
    mutilogin: 0,
    //是否是二步认证
    is_two_factor: 0,
    //用户类型
    user_type: '',
    //范围
    range: '0.5m',
    //配置名称
    config_name: '',
    //默认已选中的角色列表
    roles: [],
    //默认已选中的权限列表
    permissions: [],
    //默认开通周期毫秒数 半个月
    valid_period: 1209600000
};
var UserTypeConfig = React.createClass({
    getDefaultProps: function() {
        return {
            appId: '',
            appName: '',
            //配置信息展示页面
            userTypeConfigShow: true
        };
    },
    getInitialState: function() {
        return {
            //增加用户类型设置信息表单页面是否展示
            addUserTypeConfigInfoShow: false,
            appId: this.props.appId,
            appName: this.props.appName,
            //展示表单的默认选项
            item: initialItem
        };
    },
    //list页面和form页面的切换
    togglePageChange: function(newstate) {
        this.setState({
            addUserTypeConfigInfoShow: newstate
        });
    },
    //点击编辑按钮 区分修改和增加两种情况
    handleEdit: function(item) {
        var _this = this;
        if (item.id !== '') {
            Trace.traceEvent($(this.getDOMNode()).find('.grantinfo-content-list'),'编辑用户类型配置');
            //编辑状态
            _this.setState({
                item: item
            });
        } else {
            //添加状态，为不同类型的用户设置对应默认的config_name
            Trace.traceEvent($(this.getDOMNode()).find('.grantinfo-content-list'),'添加用户类型配置');
            initialItem.user_type = item.user_type;
            initialItem.config_name = item.user_type;
            _this.setState({
                item: initialItem
            });
        }
    },
    //展示配置列表还是配置表单的逻辑
    renderContent: function() {
        if (this.state.addUserTypeConfigInfoShow) {
            return <div className="grantinfo-content-list" data-tracename="添加/编辑用户类型界面">
                <UserTypeConfigForm
                    togglePageChange={this.togglePageChange}
                    addUserTypeConfigInfoShow={this.state.addUserTypeConfigInfoShow}
                    appId={this.props.appId}
                    item={this.state.item}
                    appName={this.props.appName}
                />
            </div>;
        }
        return (<div className="grantinfo-content-list">

            <UserTypeConfigList
                togglePageChange={this.togglePageChange}
                handleEdit={this.handleEdit}
                appId={this.props.appId}
                appName={this.props.appName}
                returnInfoPanel={this.props.returnInfoPanel}
                closeRightPanel={this.props.closeRightPanel}
            />
        </div>);
    },
    render: function() {
        return (
            <div className="usertype-config-style right-panel-content" data-tracename="用户类型界面">
                <div className="usertype-config-item-lists">
                    {this.renderContent()}
                </div>
            </div>
        );
    }
});

module.exports = UserTypeConfig;