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
import GeminiScrollbar from 'CMP_DIR/react-gemini-scrollbar';
import { positionEmitter } from 'PUB_DIR/sources/utils/emitters';
import positionPrivilege from './privilege-const';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';

const LAYOUT = {
    HAED_HEIGHT: 40, // tabs项的高度
    ADD_POSITION_HEIGHT: 60, // 添加职务占据的高度
    ADD_FORM_HEIGHT: 130 // 添加表单的高度
};

class OfficeManage extends React.Component {
    state = {
        positionList: [], // 职务列表
        getPositionListMsg: '', // 获取职务列表失败的信息
        errMsgTips: '', // 错误信息
        isLoading: false,
        deleteOrSetDefaultErrMsg: '', // 删除角色或是默认设置失败
        isShowAddPosition: true, // 默认显示添加职务
        isShowEditPositionFlag: false, // 默认不显示编辑
        isShowDeletePositionFlag: false, // 默认不显示删除
        mouseZoneHoverItemId: '', // 鼠标移入区域的id
        visible: false, // 是否显示编辑、删除、设置默认职务的操作，默认是false
        deleteOrSetDefaultPositionId: '', // 被删除职务或是设置默认的id
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
        this.setState({
            isLoading: true
        });
        officeManageAjax.getPositionList().then( (result) => {
            let data = _.isArray(result) && result || [];
            if (data.length) {
                data[0].selected = true;
            }
            this.setState({
                isLoading: false,
                positionList: data,
            }, () => {
                this.props.getOfficeList(data);
            });
        }, (xhr) => {
            this.setState({
                isLoading: false,
                getPositionListMsg: xhr.responseJSON
            });
        } );
    };

    // 编辑职务
    editPosition = (item) => {
        item.isEdit = true;
        this.setState({
            isShowEditPositionFlag: true
        });
    };


    //设为默认角色
    setDefautRole = (item) => {
        let isDefault = _.get(item, 'is_default');
        let id = _.get(item, 'id');
        if (isDefault) {
            return;
        }
        this.setState({
            deleteOrSetDefaultPositionId: id
        });
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
                    mouseZoneHoverItemId: '',
                    visible: false
                });
            } else {
                this.setState({
                    deleteOrSetDefaultErrMsg: Intl.get('member.position.set.default.failed', '设置默认角色失败！'),
                    mouseZoneHoverItemId: '',
                    visible: false
                });
            }
        }, (errMsg) => {
            this.setState({
                deleteOrSetDefaultErrMsg: errMsg,
                mouseZoneHoverItemId: '',
                visible: false
            });
        } );
    };

    renderErrorAlert = (errorMsg, hide) => {
        return (<AlertTimer time={ALERT_TIME} message={errorMsg} type="error" onHide={hide}/>);
    };

    handleDeleteRoleFail = () => {
        let hide = () => {
            this.setState({
                deleteOrSetDefaultErrMsg: '',
                deleteOrSetDefaultPositionId: ''
            });
        };
        return (
            <div className="delete_ip_config_err_tips">
                {this.renderErrorAlert(this.state.deleteOrSetDefaultErrMsg, hide)}
            </div>
        );
    };

    handleMouseEnter = (item, event) => {
        event.stopPropagation();
        this.setState({
            mouseZoneHoverItemId: _.get(item, 'id'),
            visible: false
        });
    };


    handleClickPosition = (item) => {
        _.each(this.state.positionList, (position) => {
            delete position.selected;
        });
        item.selected = true;
        let positionObj = {teamroleId: item.id};
        positionEmitter.emit(positionEmitter.CLICK_POSITION, positionObj);
    };

    handleMouseLeave = (event) => {
        event.stopPropagation();
        if (!this.state.visible) {
            this.setState({
                mouseZoneHoverItemId: '',
            });
        }
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
                    <i className='iconfont icon-delete handle-btn-item'></i>
                    <span className='operation-item-text'>
                        {Intl.get('member.position.delete.office', '删除职务')}
                    </span>
                </div>
                <div className="operation-item-zone"
                    onClick={this.setDefautRole.bind(this, item)}
                >
                    <span className='operation-item-text setting-default'>
                        {Intl.get('member.position.set.default', '设为默认')}
                    </span>
                </div>
            </div>
        );
    };

    //删除职务
    deletePosition = (item) => {
        item.isDelete = true;
        this.setState({
            isShowDeletePositionFlag: true
        });
    };

    // 确认删除
    handleConfirmDelete = (item) => {
        let id = _.get(item, 'id');
        this.setState({
            deleteOrSetDefaultPositionId: id
        });
        officeManageAjax.deletePosition(id).then( (result) => {
            delete item.isDelete;
            if (result === true) {
                //在数组中删除当前正在删除的职务
                let positionList = _.filter(this.state.positionList, (item) => item.id !== id);
                this.setState({
                    positionList: positionList,
                    isShowDeletePositionFlag: false,
                    visible: false
                });
            } else {
                this.setState({
                    deleteOrSetDefaultErrMsg: Intl.get('crm.139', '删除失败！'),
                    isShowDeletePositionFlag: false,
                    visible: false
                });
            }
        }, (errMsg) => {
            delete item.isDelete;
            this.setState({
                deleteOrSetDefaultErrMsg: errMsg,
                isShowDeletePositionFlag: false,
                visible: false
            });
        } );
    };

    // 取消删除
    handleCancelDelete = (item) => {
        delete item.isDelete;
        this.setState({
            isShowDeletePositionFlag: false,
            visible: false
        });
    };


    handleSubmit = (result, flag) => {
        if (flag === 'add') {
            let positionList = this.state.positionList;
            // 数组默认角色后添加输入的职务(第一个角色是默认角色)
            if (positionList.length) {
                positionList.splice(1, 0, result);
            } else {
                positionList = [result];
            }
            this.setState({
                positionList: positionList,
                isShowAddPosition: true,
            });
        } else if( flag === 'edit'){
            delete result.isEdit;
            let id = _.get(result, 'id');
            let positionList = this.state.positionList;
            let index = _.findIndex(positionList, item => item.id === id);
            positionList.splice(index, 1, result);
            this.setState({
                isShowEditPositionFlag: false,
                mouseZoneHoverItemId: '',
                visible: false
            });
        }

    };

    handleCancelForm = (data) => {
        if (!this.state.isShowAddPosition) {
            this.setState({
                isShowAddPosition: true,
            });
        } else {
            let id = _.get(data, 'id');
            _.find(this.state.positionList, item => {
                if (item.id === id) {
                    delete item.isEdit;
                }
            });
            this.setState({
                isShowEditPositionFlag: false,
                mouseZoneHoverItemId: '',
                visible: false
            });
        }
    };

    renderEditOrAddPosition = (item) => {
        let itemOffice = {color: this.getPositionColor()};
        if (this.state.isShowAddPosition) {
            itemOffice = item;
        }
        return (
            <div className='edit-item-or-add-zone'>
                <OfficeForm
                    positionList={this.state.positionList}
                    itemOffice={itemOffice}
                    handleCancelForm={this.handleCancelForm}
                    handleSubmit={this.handleSubmit}
                />
            </div>
        );
    };

    getContentHeight = () => {
        return this.props.height - LAYOUT.HAED_HEIGHT;
    };

    handleHoverChange = (flag) => {
        if (!flag) {
            this.setState({
                mouseZoneHoverItemId: '',
                visible: false
            });
        }
    };

    handleMouseEnterMoreBtn = () => {
        this.setState({
            visible: true
        });
    };

    // 渲染职务列表
    renderPositionList = () => {
        let positionList = this.state.positionList;
        let length = _.get(positionList, 'length');
        let scrollHeight = this.getContentHeight() - LAYOUT.ADD_POSITION_HEIGHT;
        if (!this.state.isShowAddPosition) {
            scrollHeight -= LAYOUT.ADD_FORM_HEIGHT;
        }
        if (this.state.isLoading) {
            return (
                <Spinner/>
            );
        } else if (this.state.getPositionListMsg) { // 错误提示
            return (
                <div className="office-list-error-tips">
                    <Alert type="error" showIcon message={this.state.getPositionListMsg}/>
                </div>
            );
        } else if (_.isArray(positionList) && length) {
            let privilege = hasPrivilege(positionPrivilege.POSITION_MANAGE);
            // 职务列表
            return (
                <div className="office-content-zone">
                    <GeminiScrollbar style={{height: scrollHeight}}>
                        <ul className="office-list" data-tracename="职务管理" onMouseLeave={this.handleMouseLeave}>
                            {_.map(positionList,(item) => {
                                let isDefaultFlag = _.get(item, 'is_default');
                                let defaultCls = classNames('default-role-descr', {'default-role-checked': isDefaultFlag});
                                let count = _.get(item, 'customer_num', 0);
                                let id = _.get(item, 'id');
                                let isShowMoreBtn = privilege && this.state.mouseZoneHoverItemId === id; // 是否显示更多按钮
                                let isEdit = privilege && _.get(item, 'isEdit');
                                let isDelete = privilege && _.get(item, 'isDelete');
                                let itemContainerCls = classNames('item-office-container', {
                                    'item-office-delete-container': isDelete,
                                    'item-selected': item.selected
                                });
                                let name = item.name;
                                return (
                                    <li
                                        onMouseEnter={this.handleMouseEnter.bind(this, item)}
                                        onClick={this.handleClickPosition.bind(this, item )}
                                    >
                                        <div className={itemContainerCls}>
                                            {
                                                isEdit && this.state.isShowEditPositionFlag ? (
                                                    <div className="item-office-edit-zone">
                                                        {this.renderEditOrAddPosition(item)}
                                                    </div>
                                                ) : (
                                                    <div className="item-office-content">
                                                        <span className="iconfont icon-team-role sales-role-icon" style={{color: item.color}}/>
                                                        <span className="item-text" title={name}>
                                                            {
                                                                name.length > 6 ? <span>
                                                                    {name.substring(0, 6)}...
                                                                </span> : <span>
                                                                    {name}
                                                                </span>
                                                            }
                                                        </span>
                                                        {
                                                            isDefaultFlag ?
                                                                <span className={defaultCls}>
                                                                    {Intl.get('role.default.set', '默认')}
                                                                </span> : null
                                                        }
                                                        {
                                                            isDelete && this.state.isShowDeletePositionFlag ? (
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
                                                                    {
                                                                        isShowMoreBtn ? (
                                                                            <Popover
                                                                                overlayClassName="edit-office-popover"
                                                                                content={this.renderModifyOffice(item)}
                                                                                placement="bottomRight"
                                                                                onVisibleChange={this.handleHoverChange}
                                                                                visible={this.state.visible}
                                                                            >
                                                                                <span
                                                                                    className='iconfont icon-more'
                                                                                    onMouseEnter={this.handleMouseEnterMoreBtn}
                                                                                ></span>
                                                                            </Popover>
                                                                        ) : (
                                                                            <span>
                                                                                <span>{Intl.get('sales.role.config.customer.num','最大客户数')}</span>
                                                                                <span className="customer-count">{count}</span>
                                                                            </span>
                                                                        )
                                                                    }
                                                                </div>
                                                            )
                                                        }
                                                    </div>
                                                )
                                            }
                                        </div>
                                        {
                                            this.state.deleteOrSetDefaultPositionId === item.id && this.state.deleteOrSetDefaultErrMsg ? (
                                                this.handleDeleteRoleFail()
                                            ) : null
                                        }
                                    </li>);
                            }
                            )}
                        </ul>
                    </GeminiScrollbar>
                </div>
            );}
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
        let height = this.getContentHeight();
        return (
            <div className="office-container" data-tracename="职务" style={{height: height}}>
                {
                    hasPrivilege(positionPrivilege.POSITION_MANAGE) ? (
                        <div className="add-office-container">
                            { this.state.isShowAddPosition ? (
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
                    ) : null
                }
                <div className="office-content">
                    {this.renderPositionList()}
                </div>
            </div>
        );
    }
}

OfficeManage.propTypes = {
    height: PropTypes.number,
    getOfficeList: PropTypes.func
};

module.exports = OfficeManage;