const React = require('react');
require('../css/position.less');
const Spinner = require('CMP_DIR/spinner');
const AlertTimer = require('CMP_DIR/alert-timer');
import Trace from 'LIB_DIR/trace';
import {Icon, Alert, InputNumber, Input, Form, Button} from 'antd';
const FormItem = Form.Item;
import classNames from 'classnames';
import positionManageAjax from '../ajax/position-manage-ajax';
import {COLOR_LIST} from 'PUB_DIR/sources/utils/consts';
const ALERT_TIME = 4000;//错误提示的展示时间：4s

class SalesRoleManage extends React.Component {
    state = {
        positionList: [], // 职务列表
        getPositionListMsg: '', // 获取职务列表失败的信息
        errMsgTips: '', // 错误信息


        //点击角色添加按钮的loading效果是否显示
        isLoading: false,
        //当前正在删除的角色
        DeletingItem: '',
        //正在设置默认的角色
        settingDefaultRole: '',

        //添加失败的信息
        addErrMsg: '',
        // 删除角色失败
        deleteErrMsg: '',
        //正在编辑客户容量的角色
        isEdittingItem: '',
        updateRoleCustomerNum: 0,//要更新某个职务的客户容量,默认值0
        addRoleCustomerNum: '',//某个添加角色的客户容量
        isUpdateloading: false,
        updateErrMsg: '',//修改客户容量失败后的错误信息
        isShowAddPosition: true, // 默认显示添加职务
        positionNameValue: '', // 职位名称的值
    };

    componentDidMount = () => {
        this.getPositionList();
    };

    // 获取职务列表
    getPositionList = () => {
        positionManageAjax.getPositionList().then( (data) => {
            this.setState({
                positionList: _.isArray(data) ? data : [],
            });
        }, (xhr) => {
            this.setState({
                getPositionListMsg: xhr.responseJSON
            });
        } );
    };

    // 获取职务的颜色
    getPositionColor = () => {
        // 职务列表中已存在的颜色列表
        let existColors = _.map(this.state.positionList, 'color');
        //第一个不在已有角色的颜色列表中的颜色，作为当前添加角色的颜色
        return _.find(COLOR_LIST, color => existColors.indexOf(color) === -1);
    };

    //删除职务
    handleDeleteItem = (delId) => {
        //当前正在删除的职务的id
        this.setState({
            DeletingItem: delId
        });
        $.ajax({
            url: '/rest/sales/role/' + delId,
            type: 'delete',
            dateType: 'json',
            success: (result) => {
                //在数组中删除当前正在删除的职务
                let positionList = _.filter(this.state.positionList, (role) => role.id !== delId);
                this.setState({
                    DeletingItem: '',
                    positionList: positionList
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

    //设为默认角色
    setDefautRole = (role) => {
        if (role.is_default) {
            return;
        }
        this.setState({settingDefaultRole: role.id});
        $.ajax({
            url: '/rest/sales/default_role/' + role.id,
            type: 'put',
            dateType: 'json',
            success: (result) => {
                //设置默认的角色
                _.each(this.state.positionList, (item) => {
                    if (item.id === role.id) {
                        item.is_default = true;
                    } else {//去掉原来默认角色的默认属性
                        delete item.is_default;
                    }
                });
                this.setState({positionList: this.state.positionList, settingDefaultRole: ''});
            },
            error: (errorInfo) => {
                this.setState({
                    settingDefaultRole: '',
                    deleteErrMsg: errorInfo.responseJSON
                });
            }
        });
    };

    // 增加职务
    handleSubmit = (e) => {
        Trace.traceEvent(e, '点击添加职务按钮');
        e.preventDefault();
        // 输入的职务名称去空格
        let nameValue = _.trim(this.state.positionNameValue);
        if (nameValue) {
            // 判断添加的职务和已有的职务名称是否相同，唯一性检测
            let targetItem = _.find(this.state.positionList, item => item.name === nameValue);
            if (targetItem){
                this.setState({
                    addErrMsg: Intl.get('config.sales.role.has.repeat', '该职务名称已存在')
                });
                return;
            }
        }
        // 输入的客户容量
        let customer_num = this.state.addRoleCustomerNum;
        let addRole = {name: nameValue, color: this.getPositionColor(), customer_num: customer_num};
        //显示添加的loading效果
        this.setState({
            isLoading: true
        });
        $.ajax({
            url: '/rest/sales/role',
            type: 'post',
            dateType: 'json',
            data: addRole,
            success: (result) => {
                if (result) {
                    let positionList = this.state.positionList;
                    // 数组默认角色后添加输入的职务(第一个角色是默认角色)
                    if (positionList.length) {
                        positionList.splice(1, 0, result);
                    } else {
                        positionList = [result];
                    }
                    this.setState({
                        positionList: positionList,
                        isLoading: false,
                        addRoleCustomerNum: '',
                        isShowAddPosition: true,
                        positionNameValue: ''
                    });
                }
            },
            error: (errorInfo) => {
                this.setState({
                    isLoading: false,
                    addErrMsg: errorInfo.responseJSON
                });
            }
        });

    };

    // 添加职务失败
    handleAddRoleFail = () => {
        var hide = () => {
            this.setState({
                addErrMsg: '',
                isLoading: false
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

    handleDeleteRoleFail = () => {
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

    handleEditItem = (item) => {
        this.setState({
            isEdittingItem: item.id,
            updateErrMsg: ''
        });
    };

    cancelEditCustomerNum = () => {
        this.setState({
            isEdittingItem: '',
            updateErrMsg: '',
            updateRoleCustomerNum: 0
        });
    };

    submitUpdateCustomerNum = (item) => {
        if (this.state.updateRoleCustomerNum === 0){
            this.setState({
                isEdittingItem: ''
            });
            return;
        }
        var updateObj = {
            id: item.id,
            customer_num: this.state.updateRoleCustomerNum
        };
        this.setState({
            isUpdateloading: true
        });

        $.ajax({
            url: '/rest/sales/setting/customer',
            type: 'put',
            dateType: 'json',
            data: updateObj,
            success: (result) => {
                if (result) {
                    let positionList = this.state.positionList;
                    let updateRoleItem = _.find(positionList, saleRole => saleRole.id === item.id);
                    updateRoleItem.customer_num = this.state.updateRoleCustomerNum;
                    this.setState({
                        positionList: this.state.positionList,
                        isUpdateloading: false,
                        updateErrMsg: '',
                        isEdittingItem: ''
                    });
                }
            },
            error: (errorInfo) => {
                this.setState({
                    isUpdateloading: false,
                    updateErrMsg: errorInfo.responseJSON
                });
            }
        });

    };
    // 渲染职务列表
    renderPositionList = () => {
        let positionList = this.state.positionList;
        let length = _.get(positionList, 'length');
        if (this.state.getPositionListMsg) { // 错误提示
            return (
                <div className="position-list-error-tips">
                    <Alert type="error" showIcon message={this.state.getPositionListMsg}/>
                </div>
            );
        } else if (_.isArray(positionList) && length) {
            // 职务列表
            return (
                <ul className="position-list" data-tracename="职务管理">
                    {_.map(positionList,(item) => {
                        let defaultCls = classNames('default-role-descr', {'default-role-checked': item.is_default});
                        let title_tip = item.is_default ? '' : Intl.get('role.set.default', '设为默认角色');
                        return (
                            <li className="sales-tag">
                                <div className="sales-tag-content">
                                    <span className="iconfont icon-team-role sales-role-icon" style={{color: item.color}}/>
                                    <span className="sales-tag-text">{item.name}</span>
                                    <span className={defaultCls} title={title_tip}
                                        onClick={this.setDefautRole.bind(this, item)}
                                        data-tracename="点击设为默认角色按钮">
                                        {Intl.get('role.default.set', '默认')}
                                        {this.state.settingDefaultRole === item.id ? <Icon type="loading"/> : null}
                                    </span>
                                    <div className="customer-container">
                                        {Intl.get('sales.role.config.customer.num','最大客户数')}:
                                        {this.state.isEdittingItem === item.id ? <span><InputNumber defaultValue={item.customer_num} onChange={this.onUpdateCustomerNumChange} min={1}/>
                                            {this.state.isUpdateloading ? <Icon type="loading"/> : <span>
                                                <i className="iconfont icon-choose" onClick={this.submitUpdateCustomerNum.bind(this, item)} data-tracename="保存设置最大客户数量"></i><i className="iconfont icon-close" onClick={this.cancelEditCustomerNum} data-tracename="取消设置最大客户数量"></i>
                                            </span>}
                                        </span> : <span>{item.customer_num}<i className="iconfont icon-update" onClick={this.handleEditItem.bind(this, item)}></i></span>}
                                    </div>
                                    {item.is_default || this.state.settingDefaultRole === item.id ? null :
                                        <span className="anticon anticon-delete"
                                            onClick={this.handleDeleteItem.bind(this, item.id)}
                                            data-tracename="点击删除某个销售角色按钮"
                                        />}
                                    { this.state.DeletingItem === item.id ? (
                                        <Icon type="loading"/>
                                    ) : null}
                                    {this.state.updateErrMsg && this.state.isEdittingItem === item.id ? this.renderErrorAlert(this.state.updateErrMsg, hide) : null}
                                </div>
                            </li>);
                    }
                    )}
                </ul>);
        }
    };

    onChange = (value) => {
        this.setState({
            addRoleCustomerNum: value
        });
    };

    onUpdateCustomerNumChange = (value) => {
        this.setState({
            updateRoleCustomerNum: value
        });
    };

    // 添加职务
    addPosition = () => {
        this.setState({
            isShowAddPosition: false
        });
    };

    // 取消添加职务
    handleCancel = () => {
        this.setState({
            isShowAddPosition: true
        });
    };
    // 职位名称的input
    handlePositionName = (event) => {
        let value = _.get(event, 'target.value');
        this.setState({
            positionNameValue: value
        });
    };
    // 渲染职务的添加或是编辑内容区
    renderPositionBox = () => {
        const formItemLayout = {
            colon: false,
            labelCol: {span: 5},
            wrapperCol: {span: 15}
        };
        let errMsgTips = this.state.addErrMsg;
        return (
            <div className="position-box">
                <Form layout='horizontal' className='form' autoComplete='off'>
                    <FormItem
                        label={Intl.get('member.position.name.label', '职务名称')}
                        {...formItemLayout}
                    >
                        <Input value={this.state.positionNameValue} onChange={this.handlePositionName}/>
                    </FormItem>
                    <FormItem
                        label={Intl.get('sales.role.config.customer.num', '最大客户数')}
                        {...formItemLayout}
                    >
                        <InputNumber onChange={this.onChange} value={this.state.addRoleCustomerNum} min={1}/>
                    </FormItem>
                    <FormItem>
                        <div className="position-btn">
                            <Button className="button-save" type="primary"
                                onClick={this.handleSubmit}
                                disabled={this.state.isLoading}
                            >
                                {Intl.get('common.save', '保存')}
                            </Button>
                            <Button className="button-cancel" onClick={this.handleCancel}>
                                {Intl.get('common.cancel', '取消')}
                            </Button>
                            {this.state.isLoading ? (
                                <Icon type="loading" className="save-loading"/>) : errMsgTips ? (
                                <span className="save-error">{errMsgTips}</span>
                            ) : null}
                        </div>
                    </FormItem>
                </Form>
            </div>
        );
    };

    render() {
        return (
            <div className="position-container" data-tracename="职务">
                {this.state.deleteErrMsg ? this.handleDeleteRoleFail() : null}
                <div className="add-position-container">
                    {this.state.isShowAddPosition ? (
                        <div className="add-position" onClick={this.addPosition}>
                            <Icon type="plus" />
                            <span className="name-label">{Intl.get('member.add.position', '添加职务')}</span>
                        </div>
                    ) : (
                        <div className="add-position-box">
                            {this.renderPositionBox()}
                        </div>
                    )}

                </div>
                <div className="position-content">
                    {this.renderPositionList()}
                </div>
            </div>
        );
    }
}

module.exports = SalesRoleManage;