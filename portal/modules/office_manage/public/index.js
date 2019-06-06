const React = require('react');
require('./index.less');
const Spinner = require('CMP_DIR/spinner');
const AlertTimer = require('CMP_DIR/alert-timer');
import Trace from 'LIB_DIR/trace';
import {Icon, Alert, Popover} from 'antd';
import classNames from 'classnames';
import officeManageAjax from './ajax';
import {COLOR_LIST} from 'PUB_DIR/sources/utils/consts';
import OfficeForm from './office-form';
const ALERT_TIME = 4000;//错误提示的展示时间：4s

class OfficeManage extends React.Component {
    state = {
        positionList: [], // 职务列表
        getPositionListMsg: '', // 获取职务列表失败的信息
        errMsgTips: '', // 错误信息
        isLoading: false,
        deleteErrMsg: '', // 删除角色失败
        isShowAddPosition: true, // 默认显示添加职务
        mouseZoneHoverItemId: '', // 鼠标移入区域的id
    };

    componentDidMount = () => {
        this.getPositionList();
    };

    // 获取职务的颜色
    getPositionColor = () => {
        // 职务列表中已存在的颜色列表
        let existColors = _.map(this.state.positionList, 'color');
        //第一个不在已有角色的颜色列表中的颜色，作为当前添加角色的颜色
        return _.find(COLOR_LIST, color => existColors.indexOf(color) === -1);
    };

    // 获取职务列表
    getPositionList = () => {
        officeManageAjax.getPositionList().then( (data) => {
            this.setState({
                positionList: _.isArray(data) ? data : [],
            });
        }, (xhr) => {
            this.setState({
                getPositionListMsg: xhr.responseJSON
            });
        } );
    };

    // 编辑职务
    editPosition = (item) => {
        item.isEdit = true;
        let updateObj = {
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
                    });
                }
                item.isEdit = false;
            },
            error: (errMsg) => {
                this.setState({
                    isUpdateloading: false,
                    updateErrMsg: errMsg
                });
                item.isEdit = false;
            }
        });

    };


    //设为默认角色
    setDefautRole = (item) => {
        let isDefault = _.get(item, 'is_default');
        let id = _.get(item, 'id');
        if (isDefault) {
            return;
        }
        officeManageAjax.setDefautRole(id).then( (result) => {
            if (result) {
                //设置默认的角色
                _.each(this.state.positionList, (item) => {
                    if (item.id === id) {
                        item.is_default = true;
                    } else {//去掉原来默认角色的默认属性
                        delete item.is_default;
                    }
                });
                this.setState({
                    positionList: this.state.positionList,
                });
            } else {
                this.setState({
                    deleteErrMsg: Intl.get('member.position.set.default.failed', '设置默认角色失败！')
                });
            }
        }, (errMsg) => {
            this.setState({
                deleteErrMsg: errMsg
            });
        } );
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
            updateErrMsg: ''
        });
    };

    cancelEditCustomerNum = () => {
        this.setState({
            updateErrMsg: '',
            updateRoleCustomerNum: 0
        });
    };

    handleMouseEnter = (item, event) => {
        event.stopPropagation();
        this.setState({
            mouseZoneHoverItemId: _.get(item, 'id'),
        });
    };

    handleMouseLeave = (event) => {
        event.stopPropagation();
        this.setState({
            mouseZoneHoverItemId: '',
        });
    };

    renderModifyOffice = (item) => {
        return (
            <div className="office-operation-zone">
                <div className="operation-item-zone"
                    onClick={this.editPosition.bind(this, item)}
                >
                    <i className='iconfont icon-update'></i>
                    <span className='operation-item-text'>
                        {Intl.get('member.position.edit.office', '编辑职务')}
                    </span>
                </div>
                <div className="operation-item-zone"
                    onClick={this.deletePosition.bind(this, item)}
                >
                    <i className='iconfont icon-delete'></i>
                    <span className='operation-item-text'>
                        {Intl.get('member.position.delete.office', '删除职务')}
                    </span>
                </div>
                <div className="operation-item-zone"
                    onClick={this.setDefautRole.bind(this, item)}
                >
                    <span className='operation-item-text'>
                        {Intl.get('member.position.set.default', '设为默认')}
                    </span>
                </div>
            </div>
        );
    };

    //删除职务
    deletePosition = (item) => {
        item.isDelete = true;
    };

    // 确认删除
    handleConfirmDelete = (item) => {
        let id = _.get(item, 'id');
        officeManageAjax.deletePosition(id).then( (result) => {
            delete item.isDelete;
            if (result) {
                //在数组中删除当前正在删除的职务
                let positionList = _.filter(this.state.positionList, (item) => item.id !== id);
                this.setState({
                    positionList: positionList
                });
            } else {
                this.setState({
                    deleteErrMsg: Intl.get('crm.139', '删除失败！')
                });
            }
        }, (errMsg) => {
            delete item.isDelete;
            this.setState({
                deleteErrMsg: errMsg
            });
        } );
    };

    // 取消删除
    handleCancelDelete = (item) => {
        delete item.isDelete;
    };

    // 正在添加、编辑、删除职务时，其他不能点击
    onSelectPosition = (item, event) => {
        event.stopPropagation();
        if ( !this.state.isShowAddPosition || item.isEdit || item.isDelete) {
            return;
        }
    };

    handleSubmitOperate = (result) => {
        let positionList = this.state.positionList;
        // 数组默认角色后添加输入的职务(第一个角色是默认角色)
        if (positionList.length) {
            positionList.splice(1, 0, result);
        } else {
            positionList = [result];
        }
        this.setState({
            positionList: positionList,
        });
    };

    handleCancelOperate = () => {

    };

    renderEditOrAddPosition = (item) => {
        let officeItem = {color: this.getPositionColor()};
        if (this.state.isShowAddPosition) {
            officeItem = item;
        }
        return (
            <div className='item'>
                <OfficeForm
                    positionList={this.state.positionList}
                    officeItem={officeItem}
                    handleCancel={this.handleCancelOperate.bind(this, officeItem)}
                    handleSubmit={this.handleSubmitOperate}
                />
            </div>
        );
    };

    // 渲染职务列表
    renderPositionList = () => {
        let positionList = this.state.positionList;
        let length = _.get(positionList, 'length');
        if (this.state.getPositionListMsg) { // 错误提示
            return (
                <div className="office-list-error-tips">
                    <Alert type="error" showIcon message={this.state.getPositionListMsg}/>
                </div>
            );
        } else if (_.isArray(positionList) && length) {
            // 职务列表
            return (
                <ul className="office-list" data-tracename="职务管理">
                    {_.map(positionList,(item) => {
                        let isDefaultFlag = _.get(item, 'is_default');
                        let defaultCls = classNames('default-role-descr', {'default-role-checked': isDefaultFlag});
                        let count = _.get(item, 'customer_num', 0);
                        let id = _.get(item, 'id');
                        let isShowMoreBtn = this.state.mouseZoneHoverItemId === id; // 是否显示更多按钮
                        let isEdit = _.get(item, 'isEdit');
                        let isDelete = _.get(item, 'isDelete');
                        let itemContainerCls = classNames('item-office-container', {
                            'item-office-delete-container': isDelete
                        });
                        return (
                            <li
                                className={itemContainerCls}
                                onMouseEnter={this.handleMouseEnter.bind(this, item)}
                                onClick={this.onSelectPosition.bind(this, item )}
                            >
                                {
                                    isEdit ? (
                                        <div className="item-office-content">
                                            {this.renderEditOrAddPosition(item)}
                                        </div>
                                    ) : (
                                        <div className="item-office-content">
                                            <span className="iconfont icon-team-role sales-role-icon" style={{color: item.color}}/>
                                            <span className="item-text">{item.name}</span>
                                            {
                                                isDefaultFlag ?
                                                    <span className={defaultCls}>
                                                        {Intl.get('role.default.set', '默认')}
                                                    </span> :
                                                    null
                                            }
                                            {
                                                isDelete ? (
                                                    <div className='delete-zone'>
                                                        <span
                                                            className='delete-position'
                                                            onClick={this.handleConfirmDelete.bind(this, item)}
                                                        >
                                                            {Intl.get('crm.contact.delete.confirm', '确认删除')}
                                                        </span>
                                                        <span
                                                            className='cancel-delete'
                                                            onClick={this.handleCancelDelete.bind(this, item)}
                                                        >
                                                            {Intl.get('common.cancel', '取消')}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="customer-container">
                                                        <span>{Intl.get('sales.role.config.customer.num','最大客户数')}</span>
                                                        {
                                                            isShowMoreBtn ? (
                                                                <Popover
                                                                    content={this.renderModifyOffice(item)}
                                                                    placement="bottomRight"
                                                                >
                                                                    <span className='iconfont icon-more'></span>
                                                                </Popover>
                                                            ) : (
                                                                <span className="customer-count">{count}</span>
                                                            )
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                    )
                                }
                            </li>);
                    }
                    )}
                </ul>);
        }
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

    render() {
        return (
            <div className="office-container" data-tracename="职务">
                {this.state.deleteErrMsg ? this.handleDeleteRoleFail() : null}
                <div className="add-office-container">
                    {this.state.isShowAddPosition ? (
                        <div className="add-office" onClick={this.addPosition}>
                            <Icon type="plus" />
                            <span className="name-label">{Intl.get('member.add.position', '添加职务')}</span>
                        </div>
                    ) : (
                        <div className="add-office-box">
                            {this.renderEditOrAddPosition()}
                        </div>
                    )}
                </div>
                <div className="office-content">
                    {this.renderPositionList()}
                </div>
            </div>
        );
    }
}

module.exports = OfficeManage;