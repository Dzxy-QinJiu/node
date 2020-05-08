/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/27.
 */
require('../style/add_and_show_apply.less');
import {AntcTable} from 'antc';
import {Switch, Input, Button, Dropdown, Menu, Icon} from 'antd';
import Trace from 'LIB_DIR/trace';
import ApplyFormAndRules from './apply_form_and_rules';
var classNames = require('classnames');
import {calculateHeight, APPLYAPPROVE_LAYOUT, getAllWorkFlowList} from '../utils/apply-approve-utils';
var applyApproveManageStore = require('../store/apply_approve_manage_store');
var applyApproveManageAction = require('../action/apply_approve_manage_action');
var uuid = require('uuid/v4');
let userData = require('PUB_DIR/sources/user-data');
class AddAndShowApplyList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newApplyTitle: '',//新添加的申请的名称
            showApplyList: [],
            isLoading: true,//正在获取申请审批类型列表
            showAddWorkFlowName: this.props.showAddWorkFlowName,//是否展示添加自定义流程名称
            showApplyDetailForm: false,//是否展示审批的详情
            showApplyDetailId: '',
            tableHeight: 610,
            ...applyApproveManageStore.getState()
        };
    }
    componentWillReceiveProps = (nextProps) => {
        if (nextProps.showAddWorkFlowName !== this.state.showAddWorkFlowName) {
            this.setState({
                showAddWorkFlowName: nextProps.showAddWorkFlowName,
            }, () => {
                if (this.state.showAddWorkFlowName) {
                    var applyList = this.state.showApplyList;
                    applyList.unshift({'showAddWorkFlowName': true});
                    this.setState({
                        showApplyList: applyList
                    });
                }
            });
        }


    };
    componentDidMount = () => {
        applyApproveManageStore.listen(this.onStoreChange);
        getAllWorkFlowList((list) => {
            this.setState({
                showApplyList: list,
                isLoading: false
            });
        });//自定义流程的列表
        var _this = this;
        this.changeTableHeight();
        $(window).on('resize', e => this.changeTableHeight());
        //点击客户列表某一行时打开对应的详情
        $('.apply-list-container').on('click', 'td.has-filter', function(e) {
            //td中的开关和省略号不能触发打开右侧面板的事件
            if ($(e.target).hasClass('ant-switch') || $(e.target).hasClass('icon-suspension-points')) {
                return;
            }
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-tbody'), '打开申请审批详情');
            var $tr = $(this).closest('tr');
            var id = $tr.find('.record-id').text();
            if (id) {
                _this.getSelfSettingWorkFlowId(id);
            }
        });
    };
    getSelfSettingWorkFlowId = (recordId) => {
        this.setState({
            showApplyDetailForm: true,
            showApplyDetailId: recordId,
        });
    }
    onStoreChange = () => {
        this.setState(applyApproveManageStore.getState());
    };
    handleInputValue = (e) => {
        this.setState({
            newApplyTitle: _.get(e, 'target.value')
        });
    };

    componentWillUnmount() {
        $(window).off('resize', this.changeTableHeight);
        applyApproveManageStore.unlisten(this.onStoreChange);
    }

    //保存新加的审批类型
    handleSaveApplyTitle = () => {
        //只能用数字，字母，下划线组成这个任意的type，但是任意生成的会有-
        var randomType = 'work_flow_' + uuid();
        var reg = new RegExp('-', 'g');
        randomType = randomType.replace(reg, '_');
        var submitObj = {
            description: this.state.newApplyTitle,
            customiz_form: {},
            //todo 用uuid生成一个唯一的type，不知道只取前20个会不会有重复的id 'domainName'
            type: randomType.slice(0, 20)
        };
        applyApproveManageAction.addSelfSettingWorkFlow(submitObj, (data) => {
            var applyList = this.state.showApplyList;
            applyList.splice(0, 1, data);
            this.setState({
                showApplyList: applyList,
                showAddWorkFlowName: false
            }, () => {
                //把userData上的值也改掉
                userData.setUserData('workFlowConfigs', applyList);
                this.props.updateShowApplyList(applyList);
            });
        });
    };
    handleCancelSaveApplyTitle = () => {
        this.setState({
            newApplyTitle: ''
        });
        var applyList = this.state.showApplyList;
        applyList.splice(0, 1);
        this.props.updateShowApplyList();
    };
    renderAddApplyProcessTitle = () => {
        return (
            <span className="add-form">
                <Input onChange={this.handleInputValue} placeholder={Intl.get('apply.approve.name.apply', '申请类型名称')}/>
                <Button disabled={this.state.addWorkFlowLoading} type='primary'
                    onClick={this.handleSaveApplyTitle}>{Intl.get('common.confirm', '确认')}
                    {this.state.addWorkFlowLoading ? <Icon type="loading"/> : null}
                </Button>
                <Button onClick={this.handleCancelSaveApplyTitle}>{Intl.get('common.cancel', '取消')}</Button>
            </span>
        );
    };
    changeApplyStatus = (applyId, checkStatus) => {
        var target = this.getTargetApply(applyId);
        if (target) {
            target.approveCheck = checkStatus;
            this.setState({
                showApplyList: this.state.showApplyList
            });
        }
    };
    copyApply = (record) => {
        console.log('复制');
    };
    getTargetApply = (applyId) => {
        return _.find(this.state.showApplyList, item => item.id === applyId);
    };
    deleteApply = (record) => {
        var target = this.getTargetApply(record.id);
        if (target) {
            target.isDeleting = true;
            this.setState({
                showApplyList: this.state.showApplyList
            });
        }
    };
    renderOverLayMenu = (record) => {
        return (
            <Menu>
                {/*<Menu.Item>*/}
                {/*<span onClick={this.copyApply.bind(this, record)}>{Intl.get('user.jscode.copy', '复制')}</span>*/}
                {/*</Menu.Item>*/}
                {!record.approveCheck && record.customiz ? <Menu.Item>
                    <span onClick={this.deleteApply.bind(this, record)}>{Intl.get('common.delete', '删除')}</span>
                </Menu.Item> : null}

            </Menu>
        );
    };
    renderOperateBtns = (record) => {
        return (
            <span>
                {/*<Switch size="small" checked={record.approveCheck}*/}
                {/*onChange={this.changeApplyStatus.bind(this, _.get(record, 'id'))}/>*/}
                <Dropdown overlay={this.renderOverLayMenu(record)} trigger={['click']}><i
                    className="iconfont icon-suspension-points icon-hangye"></i>
                </Dropdown>
            </span>
        );
    };
    handleConfirmDeleteApply = (record) => {
        applyApproveManageAction.delSelfSettingWorkFlow(record.id, () => {
            var applyList = this.state.showApplyList;
            applyList = _.filter(applyList, item => item.id !== record.id);
            this.setState({
                showApplyList: applyList
            });
        });


    };

    handleCancelDeleteApply = (record) => {
        var target = this.getTargetApply(record.id);
        if (target) {
            target.isDeleting = false;
            this.setState({
                showApplyList: this.state.showApplyList
            });
        }
    };

    renderDeletingBtns = (record) => {
        return (
            <span className="delete-btn-container">
                <Button className='confirm-del' disabled={this.state.delWorkFlowLoading}
                    onClick={this.handleConfirmDeleteApply.bind(this, record)}>{Intl.get('crm.contact.delete.confirm', '确认删除')}
                    {this.state.delWorkFlowLoading ? <Icon type="'loading"/> : null}
                </Button>
                <Button
                    onClick={this.handleCancelDeleteApply.bind(this, record)}>{Intl.get('config.manage.realm.canceltext', '取消')}</Button>
            </span>
        );
    };
    renderApplyDetail = () => {
        return(
            <div>
                <ApplyFormAndRules
                    applyTypeId={this.state.showApplyDetailId}
                    closeAddPanel={this.closeAddApplyPanel}
                />
            </div>);


    };
    closeAddApplyPanel = () => {
        this.setState({
            showApplyDetailForm: false
        });
    };
    changeTableHeight = () => {
        var tableHeight = calculateHeight() - APPLYAPPROVE_LAYOUT.PADDINGHEIGHT * 2 - APPLYAPPROVE_LAYOUT.TABLE_TITLE_HEIGHT;
        this.setState({tableHeight});
    };
    render = () => {
        var columns = [
            {
                title: Intl.get('user.apply.type', '申请类型'),
                width: '240px',
                dataIndex: 'description',
                className: 'has-filter',
                render: (text, record, index) => {
                    if (record.showAddWorkFlowName) {
                        return {
                            children: this.renderAddApplyProcessTitle(),
                            props: {
                                colSpan: 3,
                            },
                        };
                    } else {
                        var cls = classNames('apply-type', {'approve-status': !record.approveCheck});
                        //todo 现在数据不全，后期要补全，改成description
                        return (
                            <span className={cls}>
                                <span>{record.description || record.type}</span>
                                <span className="hidden record-id">{record.id}</span>
                            </span>
                        );
                    }
                }
            }
            // {
            //     title: Intl.get('apply.approve.qualified.user', '可申用户'),
            //     //todo 数据不全，后期会修改
            //     dataIndex: 'default_users',
            //     className: 'has-filter',
            //     render: (text, record, index) => {
            //         if (record.showAddWorkFlowName) {
            //             return {
            //                 children: text,
            //                 props: {'colSpan': 0},
            //             };
            //         } else {
            //             return (<span className="approve-role">{text}</span>);
            //         }
            //
            //     }
            // }
            , {

                title: Intl.get('common.operate', '操作'),
                width: '240px',
                className: '',
                render: (text, record, index) => {
                    if (record.showAddWorkFlowName) {
                        return {
                            children: text,
                            props: {'colSpan': 0},
                        };
                    } else if (record.customiz) {
                        //todo 暂时把内置流程先隐藏这个图标
                        return (
                            <span className="operate-wrap">
                                {record.isDeleting ? this.renderDeletingBtns(record) : this.renderOperateBtns(record) }
                            </span>
                        );
                    }else{
                        return null;
                    }
                }
            },
        ];
        var height = calculateHeight() - APPLYAPPROVE_LAYOUT.PADDINGHEIGHT * 2;
        return (
            <div className="apply-list-container">
                {this.state.showApplyDetailForm ? this.renderApplyDetail() : <AntcTable
                    loading={this.state.isLoading}
                    columns={columns}
                    dataSource={this.state.showApplyList}
                    pagination={false}
                    scroll={{y: this.state.tableHeight}}
                />}

            </div>
        );
    }
}

AddAndShowApplyList.defaultProps = {
    showApplyList: [],
    showAddWorkFlowName: false,
    updateShowApplyList: function() {
    }
};

AddAndShowApplyList.propTypes = {
    showApplyList: PropTypes.object,
    showAddWorkFlowName: PropTypes.bool,
    updateShowApplyList: PropTypes.func
};
export default AddAndShowApplyList;
