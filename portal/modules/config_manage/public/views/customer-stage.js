/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by wangliping on 2018/9/20.
 */
var React = require('react');
require('../css/index.less');
const Spinner = require('CMP_DIR/spinner');
const AlertTimer = require('CMP_DIR/alert-timer');
import Trace from 'LIB_DIR/trace';
import {Icon, Alert} from 'antd';
const ALERT_TIME = 4000;//错误提示的展示时间：4s

class CustomerStageManage extends React.Component {
    state = {
        //阶段列表
        stageList: [],
        //点击竞品添加按钮的loading效果是否显示
        isAddloading: false,
        //当前正在删除的阶段
        DeletingItem: '',
        //点击刷新按钮的loading效果是否显示
        isRefreshLoading: false,
        //加载失败的提示信息
        getErrMsg: '',
        //添加失败的信息
        addErrMsg: '',
        // 删除阶段失败
        deleteErrMsg: '',
    };

    //获取阶段列表
    getStageList = () => {
        this.setState({
            isRefreshLoading: true
        });
        $.ajax({
            url: '/rest/customer_stage',
            type: 'get',
            dateType: 'json',
            success: (data) => {
                this.setState({
                    stageList: data ? data.result : [],
                    isRefreshLoading: false
                });
            },
            error: (errorMsg) => {
                this.setState({
                    isRefreshLoading: false,
                    getErrMsg: errorMsg.responseJSON
                });
            }
        });

    };

    componentWillMount() {
        this.getStageList();
    }

    //点击刷新按钮
    getRefreshInfo = (e) => {
        this.setState({
            isRefreshLoading: true,
            stageList: []
        });
        this.getStageList();
    };

    //删除阶段标签
    handleDeleteItem = (item) => {
        //当前正在删除的阶段的id
        this.setState({
            DeletingItem: item
        });
        $.ajax({
            url: '/rest/customer_stage/' + item,
            type: 'delete',
            dateType: 'json',
            success: (result) => {
                //在数组中删除当前正在删除的阶段
                let stageList = _.filter(this.state.stageList, (product) => product !== item);
                this.setState({
                    DeletingItem: '',
                    stageList
                });
            },
            error: (errorInfo) => {
                this.setState({
                    DeletingItem: '',
                    deleteErrMsg: errorInfo.responseJSON
                });
            }
        });

    };

    //增加阶段标签
    handleSubmit = (e) => {
        Trace.traceEvent(e, '点击添加客户阶段按钮');
        e.preventDefault();
        //输入的阶段名称去左右空格
        let stage = $.trim(this.refs.addStage.value);
        if (!stage) {
            return;
        }
        //显示添加的loading效果
        this.setState({
            isAddloading: true
        });
        $.ajax({
            url: '/rest/customer_stage',
            type: 'post',
            dateType: 'json',
            data: {stage},
            success: (result) => {
                //数组开头添加输入的阶段
                let stageList = this.state.stageList;
                stageList.unshift(stage);
                this.setState({
                    stageList,
                    isAddloading: false
                });
                this.refs.addStage.value = '';

            },
            error: (errorInfo) => {
                this.setState({
                    isAddloading: false,
                    addErrMsg: errorInfo.responseJSON
                });
            }
        });

    };

    //增加阶段失败
    handleAddStageFail = () => {
        var hide = () => {
            this.setState({
                addErrMsg: '',
                isAddloading: false
            });
        };
        return (
            <div className="add-config-fail">
                {this.renderErrorAlert(this.state.addErrMsg, hide)}
            </div>
        );
    };

    renderErrorAlert = (errorMsg, hide) => {
        return (<AlertTimer time={ALERT_TIME} message={errorMsg} type="error" showIcon onHide={hide}/>);
    };

    handleDeleteStageFail = () => {
        var hide = () => {
            this.setState({
                deleteErrMsg: ''
            });
        };
        return (
            <div className="delete_ip_config_err_tips">
                {this.renderErrorAlert(this.state.deleteErrMsg, hide)}
            </div>
        );
    };

    renderCustomerStageList = () => {
        let stageList = this.state.stageList;
        //正在获取数据的状态渲染
        if (this.state.isRefreshLoading) {
            return <Spinner/>;
        } else if (this.state.getErrMsg) {
            //错误提示
            return <Alert type="error" showIcon message={this.state.getErrMsg}/>;
        } else if (_.get(stageList, '[0]')) {
            //阶段列表
            return (<ul className="mb-taglist">
                {stageList.map((item, index) => {
                    return (
                        <li className="mb-tag" key={index}>
                            <div className="mb-tag-content">
                                <span className="mb-tag-text">{item}</span>&nbsp;&nbsp;
                                <span className="glyphicon glyphicon-remove mb-tag-remove"
                                    onClick={this.handleDeleteItem.bind(this, item)}
                                    data-tracename="点击删除某个客户阶段按钮"
                                />
                                { this.state.DeletingItem === item ? (
                                    <Icon type="loading"/>
                                ) : null}
                            </div>
                        </li>);
                }
                )}
            </ul>);
        } else {//没有阶段时的提示
            return <Alert type="info" showIcon
                message={Intl.get('config.no.customer.stage', '暂无客户阶段，请添加！')}/>;
        }
    };

    render() {
        return (
            <div className="box" data-tracename="客户阶段配置">
                <div className="box-title">
                    {Intl.get('config.customer.stage.mange', '客户阶段管理')}&nbsp;&nbsp;
                    <span
                        onClick={this.getStageList.bind(this)}
                        className="refresh"
                        data-tracename="点击获取客户阶段的刷新按钮"
                    >
                        <Icon type="reload" title={Intl.get('config.customer.stage.reload', '重新获取客户阶段')}/>
                    </span>
                    {this.state.deleteErrMsg ? this.handleDeleteStageFail() : null}
                </div>
                <div className="box-body">
                    {this.renderCustomerStageList()}
                </div>
                <div className="box-footer">
                    <form onSubmit={this.handleSubmit}>
                        <div>
                            <input className="mb-input" ref="addStage"/>
                            <button className="btn mb-add-button" type="submit"
                                disabled={this.state.isAddloading ? 'disabled' : ''}>
                                {Intl.get('common.add', '添加')}
                                {this.state.isAddloading ?
                                    <Icon type="loading"/> : null}
                            </button>
                        </div>
                        {this.state.addErrMsg ? this.handleAddStageFail() : null}
                    </form>
                </div>
            </div>
        );
    }
}

module.exports = CustomerStageManage;

