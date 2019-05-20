/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2019/3/27.
 */
require('../style/add_and_show_apply.less');
import {AntcTable} from 'antc';
import {Switch, Input, Button, Dropdown, Menu} from 'antd';
import Trace from 'LIB_DIR/trace';
import ApplyFormAndRules from './apply_form_and_rules';
var classNames = require('classnames');
import {calculateHeight, APPLYAPPROVE_LAYOUT } from '../utils/apply-approve-utils';
class AddAndShowApplyList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newApplyTitle: '',//新添加的申请的名称
            showApplyList: _.cloneDeep(this.props.showApplyList),
            showAddForm: this.props.showAddForm,
            showApplyDetailForm: false//是否展示审批的详情
        };
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.showAddForm !== this.state.showAddForm) {
            this.setState({
                showAddForm: nextProps.showAddForm,
            }, () => {
                if (this.state.showAddForm) {
                    var applyList = this.state.showApplyList;
                    applyList.unshift({'showAddForm': true});
                    this.setState({
                        showApplyList: applyList
                    });
                }
            });
        }
        

    };
    componentDidMount = () => {
        var _this = this;
        //点击客户列表某一行时打开对应的详情
        $('.apply-list-container').on('click', 'td.has-filter', function(e) {
            //td中的开关和省略号不能触发打开右侧面板的事件
            if ($(e.target).hasClass('ant-switch') || $(e.target).hasClass('icon-suspension-points')) {
                return;
            }
            Trace.traceEvent($(ReactDOM.findDOMNode(this)).find('.ant-table-tbody'), '打开申请审批详情');
            var $tr = $(this).closest('tr');
            var id = $tr.find('.record-id').text();
            if(id){
                _this.showApplyDetailPanel(id);
            }
        });
    };
    showApplyDetailPanel = (applyId) => {
        var target = this.getTargetApply(applyId);
        if (target){
            this.setState({
                showApplyDetailForm: true,
                applyTypeData: target
            });
        }

    };
    onStoreChange = () => {

    };
    handleInputValue = (e) => {
        this.setState({
            newApplyTitle: _.get(e, 'target.value')
        });
    };
    //保存新加的审批类型
    handleSaveApplyTitle = () => {
        //todo 发送ajax请求
        //todo 成功后的处理
        var applyList = this.state.showApplyList;
        applyList.splice(0, 1, {
            'applyType': this.state.newApplyTitle,
            'approveRoles': [],
            'approveCheck': false,
            id: '222222222'
        });
        this.setState({
            showApplyList: applyList,
            showAddForm: false
        }, () => {
            this.props.updateShowApplyList(applyList);
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
                <Button type='primary' onClick={this.handleSaveApplyTitle}>{Intl.get('common.confirm', '确认')}</Button>
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
                <Menu.Item>
                    <span onClick={this.copyApply.bind(this, record)}>{Intl.get('user.jscode.copy', '复制')}</span>
                </Menu.Item>
                {!record.approveCheck ? <Menu.Item>
                    <span onClick={this.deleteApply.bind(this, record)}>{Intl.get('common.delete', '删除')}</span>
                </Menu.Item> : null}

            </Menu>
        );
    };
    renderOperateBtns = (record) => {
        return (
            <span>
                <Switch size="small" checked={record.approveCheck}
                    onChange={this.changeApplyStatus.bind(this, _.get(record, 'id'))}/>
                <Dropdown overlay={this.renderOverLayMenu(record)} trigger={['click']}><i
                    className="iconfont icon-suspension-points"></i>
                </Dropdown>
            </span>
        );
    };
    handleConfirmDeleteApply = (record) => {
        //todo 删除成功后
        var applyList = this.state.showApplyList;
        applyList = _.filter(applyList, item => item.id !== record.id);
        this.setState({
            showApplyList: applyList
        });
    };
    handleCancelDeleteApply = (record) => {
        var target = this.getTargetApply(record.id);
        if (target){
            target.isDeleting = false;
            this.setState({
                showApplyList: this.state.showApplyList
            });
        }
    };

    renderDeletingBtns = (record) => {
        return (
            <span className="delete-btn-container">
                <Button className='confirm-del' onClick={this.handleConfirmDeleteApply.bind(this, record)}>{Intl.get('crm.contact.delete.confirm', '确认删除')}</Button>
                <Button onClick={this.handleCancelDeleteApply.bind(this, record)}>{Intl.get('config.manage.realm.canceltext', '取消')}</Button>
            </span>
        );
    };
    renderApplyDetail = () => {
        return (
            <ApplyFormAndRules
                applyTypeData= {this.state.applyTypeData}
                closeAddPanel ={this.closeAddApplyPanel}
            />
        );
    };
    closeAddApplyPanel = () => {
        this.setState({
            showApplyDetailForm: false
        });
    };
    render = () => {
        var columns = [
            {
                title: Intl.get('user.apply.type', '申请类型'),
                width: '240px',
                dataIndex: 'applyType',
                className: 'has-filter',
                render: (text, record, index) => {
                    if (record.showAddForm) {
                        return {
                            children: this.renderAddApplyProcessTitle(),
                            props: {
                                colSpan: 3,
                            },
                        };
                    } else {
                        var cls = classNames('apply-type',{'approve-status': !record.approveCheck});
                        return (
                            <span className={cls}>
                                <span>{text}</span>
                                <span className="hidden record-id">{record.id}</span>
                            </span>
                        );
                    }
                }
            }, {
                title: Intl.get('apply.approve.qualified.user', '可申用户'),
                dataIndex: 'approveRoles',
                className: 'has-filter',
                render: (text, record, index) => {
                    if (record.showAddForm) {
                        return {
                            children: text,
                            props: {'colSpan': 0},
                        };
                    } else {
                        return (<span className="approve-role">{text}</span>);
                    }

                }
            }, {
                title: Intl.get('common.operate', '操作'),
                width: '240px',
                className: '',
                render: (text, record, index) => {
                    if (record.showAddForm) {
                        return {
                            children: text,
                            props: {'colSpan': 0},
                        };
                    } else {
                        return (
                            <span className="operate-wrap">
                                {record.isDeleting ? this.renderDeletingBtns(record) : this.renderOperateBtns(record) }
                            </span>
                        );
                    }
                }
            },
        ];
        return (
            <div className="apply-list-container" style={{height: calculateHeight() - APPLYAPPROVE_LAYOUT.PADDINGHEIGHT * 2}}>
                {this.state.showApplyDetailForm ? this.renderApplyDetail() : <AntcTable
                    columns={columns}
                    dataSource={this.state.showApplyList}
                    pagination={false}
                />}

            </div>
        );
    }
}

AddAndShowApplyList.defaultProps = {
    showApplyList: [],
    showAddForm: false,
    updateShowApplyList: function() {
    }
};

AddAndShowApplyList.propTypes = {
    showApplyList: PropTypes.object,
    showAddForm: PropTypes.bool,
    updateShowApplyList: PropTypes.func
};
export default AddAndShowApplyList;