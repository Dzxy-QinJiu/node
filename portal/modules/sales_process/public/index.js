/**
 * Created by hzl on 2019/8/1.
 */
require('./css/index.less');
import {Button, Popover, Icon, message} from 'antd';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {PrivilegeChecker, hasPrivilege } from 'CMP_DIR/privilege/checker';
import Spinner from 'CMP_DIR/spinner';
import SalesProcessStatusSwitch from 'CMP_DIR/confirm-switch-modify-status';
import SalesProcessStore from './store';
import SalesProcessAction from './action';
import SalesProcessAjax from './ajax';
import SalesProcessForm from './views/sales-process-form';
import SalesProcessInfo from './views/sale-process-info';
import CustomerStage from './views/customer-stage';
import CONSTS from 'LIB_DIR/consts';
import NoDataIntro from 'CMP_DIR/no-data-intro';

const saleId = CONSTS.ROLE_ID_CONSTANS.SALE_ID;
const pageSize = 1000;

class SalesProcess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            addProcessLoading: false, // 添加流程的loading
            addProcessResult: '', // 添加流程是否成功，成功：success， 失败：error
            ...SalesProcessStore.getState(),
        };
    }

    onChange = () => {
        this.setState(SalesProcessStore.getState());
    };

    // 获取销售角色的成员列表
    getSalesRoleMemberList = () => {
        let queryobj = {
            status: 1, // 启用
            with_extentions: true,
            role_id: saleId,
            page_size: pageSize
        };
        SalesProcessAction.getSalesRoleMemberList(queryobj);
    };

    componentDidMount = () => {
        SalesProcessStore.listen(this.onChange);
        // this.getSalesRoleMemberList(); // 获取销售角色的成员列表
        // SalesProcessAction.getSalesTeamList(); // 获取销售团队
        SalesProcessAction.getSalesProcess(); // 获取销售流程
    };
    
    componentWillUnmount = () => {
        SalesProcessStore.unlisten(this.onChange);
    };
    
    // 显示添加销售流表单程面板
    showAddProcessFormPanel = () => {
        SalesProcessAction.showAddProcessFormPanel();
    };
    // 关闭添加销售流表单程面板
    closeAddProcessFormPanel = () => {
        SalesProcessAction.closeAddProcessFormPanel();
    };

    // 处理添加销售流程的数据，转为后端需要的数据
    handleProcessSubmitData(saleProcess) {
        let salesMemberList = this.state.salesMemberList; // 销售人员
        let salesTeamList = this.state.salesTeamList; // 销售团队
        let scope = saleProcess.scope; // 选择的流程的适用范围的数据
        if (scope && scope.length) {
            saleProcess.teams = [];
            saleProcess.users = [];
            _.each(scope, id => {
                let selectTeam = _.find(salesTeamList, item => item.group_id === id);
                if (selectTeam) {
                    saleProcess.teams.push({id: id, name: selectTeam.group_name});
                    // 已经找到的数据，从原数组中删除，remove是为了减少遍历的数据
                    _.remove(salesTeamList, item => item.group_id === id);
                } else {
                    let selectUser = _.find(salesMemberList, item => item.user_id === id);
                    saleProcess.users.push({id: id, name: selectUser.nick_name});
                    _.remove(salesMemberList, item => item.user_id === id);
                }
            });
        }
        delete saleProcess.scope;
        return saleProcess;
    }

    // 提交销售流程表单
    submitSalesProcessForm = (saleProcess) => {
        let submitObj = this.handleProcessSubmitData(saleProcess);
        this.setState({
            addProcessLoading: true
        });
        SalesProcessAjax.addSalesProcess(submitObj).then( (result) => {
            let addProcessResult = 'success';
            if (result && result.id) { // 添加成功
                SalesProcessAction.upDateSalesProcessList(result);
                this.closeAddProcessFormPanel();
            } else { // 添加失败
                addProcessResult = 'error';
            }
            this.setState({
                addProcessLoading: false,
                addProcessResult: addProcessResult
            });
        }, () => {
            this.setState({
                addProcessLoading: false,
                addProcessResult: 'error'
            });
        } );
    };

    //渲染操作按钮区
    renderTopNavOperation = () => {
        let length = _.get(this.state.salesProcessList, 'length');
        let disabled = false;
        let title = '';
        if (length > 7) {
            disabled = true;
            title = Intl.get('sales.process.toplimit', '销售流程个数已达上限（8个）');
        }
        return (
            <div className='condition-operator'>
                <div className='pull-left'>
                    <PrivilegeChecker check="CRM_ADD_SALES_PROCESS">
                        {title ? (
                            <Popover content={title}>
                                <Button
                                    type="ghost"
                                    className="sales-stage-top-btn btn-item"
                                    disabled={disabled}
                                >
                                    <Icon type="plus" />
                                    {Intl.get('sales.process.add.process', '添加销售流程')}
                                </Button>
                            </Popover>
                        ) : (
                            <Button
                                type="ghost" className="sales-stage-top-btn btn-item"
                                onClick={this.showAddProcessFormPanel}
                                data-tracename="添加销售流程"
                            >
                                <Icon type="plus" />
                                {Intl.get('sales.process.add.process', '添加销售流程')}
                            </Button>
                        )}
                    </PrivilegeChecker>
                </div>
            </div>
        );
    };

    // 显示客户阶段面板
    showCustomerStagePanel = (item) => {
        SalesProcessAction.showCustomerStagePanel(item);
    };

    // 关闭客户阶段面板
    closeCustomerStagePanel = () => {
        SalesProcessAction.closeCustomerStagePanel();
    };

    // 在删除或是停用之前，先判断其他销售流程的状态，是否是全部停用
    isSalesProcessDisable(saleProcess) {
        let isOtherProcessAllDisable = false; // 默认false
        const id = saleProcess.id;
        const otherSalesProcessList = _.filter(this.state.salesProcessList, item => item.id !== id);
        const status = _.map(otherSalesProcessList, 'status');
        let statusArray = _.uniq(status);
        if (statusArray.length === 1 && status[0] === '0') {
            isOtherProcessAllDisable = true;
        }
        return isOtherProcessAllDisable;
    }

    // 处理删除销售流程
    handleDeleteSaleProcess = (saleProcess) => {
        const id = saleProcess.id;
        const isSalesProcessDisable = this.isSalesProcessDisable(saleProcess); // 判断其他销售流程是否全部停用
        if (isSalesProcessDisable) {
            message.warn(Intl.get('sales.process.delete.tips', '请先启用一个销售流程'));
        } else {
            SalesProcessAjax.deleteSalesProcess(id).then((result) => {
                if (result === true) { // 删除成功
                    saleProcess.flag = 'delete'; // 增加一个删除标志，可以合和添加流程，更新列表区分开
                    SalesProcessAction.upDateSalesProcessList(saleProcess);
                    message.success(Intl.get('crm.138', '删除成功！'));
                } else {
                    message.error(Intl.get('crm.139', '删除失败！'));
                }
            }, (errMsg) => {
                message.error(errMsg || Intl.get('crm.139', '删除失败！'));
            });
        }
    };

    // 确认更改销售流程的状态
    handleConfirmChangeProcessStatus = (item) => {
        const isSalesProcessDisable = this.isSalesProcessDisable(item); // 判断其他销售流程是否全部停用
        if (isSalesProcessDisable) { // 若其他流程全部停用，则提示开启流程
            message.warn(Intl.get('sales.process.delete.tips', '请先启用一个销售流程'));
        } else {
            let upDateProcess = {
                id: item.id,
                status: item.status === '0' ? '1' : '0'
            };
            SalesProcessAjax.updateSalesProcess(upDateProcess).then((result) => {
                if (result) {
                    this.changeSaleProcessFieldSuccess(upDateProcess);
                    message.success(Intl.get('crm.218', '修改成功！'));
                } else {
                    message.success(Intl.get('crm.219', '修改失败！'));
                }
            }, (errorMsg) => {
                message.success(errorMsg || Intl.get('crm.219', '修改失败！'));
            });
        }
    };

    // 显示销售流程详情面板
    showProcessDetailPanel = (saleProcess) => {
        SalesProcessAction.showProcessDetailPanel(saleProcess);
    };
    // 关闭销售流程详情面板
    closeProcessDetailPanel = () => {
        SalesProcessAction.closeProcessDetailPanel();
    };

    // 重新获取销售流程
    retryGetSalesProcess = () => {
        SalesProcessAction.getSalesProcess(); // 获取销售流程
    };

    renderMsgTips = (errMsg) => {
        return (
            <div>
                <span>{errMsg},</span>
                <a className="retry-btn" onClick={this.retryGetSalesProcess}>
                    {Intl.get('user.info.retry', '请重试')}
                </a>
            </div>
        );
    };

    renderNoDataTipsOrErrMsg = (errMsg) => {
        let noDataTips = Intl.get('sales.process.nodata.tips', '暂无销售流程，请先添加');
        if (errMsg) {
            noDataTips = this.renderMsgTips(errMsg);
        }
        return (
            <NoDataIntro noDataTip={noDataTips}/>
        );
    };

    // 渲染销售流程
    renderSalesProcess = () => {
        const salesProcessList = this.state.salesProcessList;
        const length = _.get(salesProcessList, 'length');
        const errorMsg = this.state.errorMsg;
        return (
            <div className="content-zone">
                {
                    this.state.loading ? <Spinner/> : null
                }
                {
                    !this.state.loading && (length === 0 || errorMsg) ?
                        this.renderNoDataTipsOrErrMsg(errorMsg) : null
                }
                <ul>
                    {
                        _.map(salesProcessList, (item, index) => {
                            let teams = _.map(item.teams, 'name');
                            let users = _.map(item.users, 'name');
                            let scope = _.concat(teams, users);
                            let processName = item.name;
                            return (
                                <li className="process-box" key={index}>
                                    <div className="item-content">
                                        <div
                                            title={processName}
                                            className="item item-name"
                                            onClick={this.showProcessDetailPanel.bind(this, item)}
                                        >
                                            {
                                                processName.length > 6 ? <span>
                                                    {processName.substring(0, 6)}...
                                                </span> : <span>
                                                    {processName}
                                                </span>
                                            }
                                        </div>
                                        <div className="item item-description">{item.description}</div>
                                        <div className="item item-status">
                                            <span>{Intl.get('common.status', '状态')}:</span>
                                            <SalesProcessStatusSwitch
                                                title={Intl.get('sales.process.status.edit.tip', '确定要{status}该销售流程？', {
                                                    status: item.status === '0' ? Intl.get('common.enabled', '启用') :
                                                        Intl.get('common.stop', '停用')
                                                })}
                                                handleConfirm={this.handleConfirmChangeProcessStatus.bind(this, item)}
                                                status={item.status === '1' ? true : false}
                                            />
                                        </div>
                                        <div className="item item-customer-stage-number">
                                            <span>{Intl.get('sales.process.customer.stage.number', '客户阶段数')}:</span>
                                            <span className="stage-number">{item.stage_num || 0}</span>
                                        </div>
                                        {/**
                                         * todo 先隐藏，先展示客户阶段数
                                         * <div className="item item-suitable">
                                         <span>{Intl.get('sales.process.suitable.objects', '适用范围')}:</span>
                                         {
                                             scope.length ? <span className="scope-teams-users">{_.join(scope, '、')}</span> : null
                                         }

                                         </div>
                                         */}
                                    </div>
                                    <div className="item-operator">
                                        <span
                                            title={Intl.get('sales.process.set.customer.stage', '设置客户阶段')}
                                            onClick={this.showCustomerStagePanel.bind(this, item)}
                                            data-tracename={'点击设置' + item.name + '销售流程按钮'}
                                        >
                                            <i className="iconfont icon-role-auth-config"></i>
                                        </span>
                                        {
                                            hasPrivilege('CRM_DELETE_SALES_PROCESS') && item.type === 'custom' ? (
                                                <span
                                                    title={Intl.get('sales.process.delete.process', '删除销售流程')}
                                                    onClick={this.handleDeleteSaleProcess.bind(this, item)}
                                                    data-tracename={'点击删除' + item.name + '销售流程按钮'}
                                                >
                                                    <i className="iconfont icon-delete "></i>
                                                </span>
                                            ) : null
                                        }
                                    </div>
                                </li>
                            );}
                        )}
                </ul>
            </div>
        );
    };

    // 修改销售流程字段成功的处理
    changeSaleProcessFieldSuccess = (saleProcess) => {
        SalesProcessAction.changeSaleProcessFieldSuccess(saleProcess);
    };

    render = () => {
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let containerHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;
        const treeSelectData = _.concat(this.state.salesTeamTree, this.state.salesNoBelongToTeamList);
        let containerWidth = $(window).width() - BACKGROUG_LAYOUT_CONSTANTS.FRIST_NAV_WIDTH -
            BACKGROUG_LAYOUT_CONSTANTS.NAV_WIDTH - BACKGROUG_LAYOUT_CONSTANTS.PADDING_WIDTH + 24;
        return (
            <div
                className="sales-process-container"
                style={{height: height}}
                data-tracename="销售流程"
            >
                <div className="sale-process-wrap" style={{height: height}}>
                    <div className="sale-process-top-nav">
                        {this.renderTopNavOperation()}
                    </div>
                    <div className="sales-process-content" style={{height: containerHeight}}>
                        {this.renderSalesProcess()}
                    </div>
                    {
                        /**
                         * isShowAddProcessFormPanel true 打开添加销售流程面板
                         **/
                        this.state.isShowAddProcessFormPanel ? (
                            <SalesProcessForm
                                closeAddProcessFormPanel={this.closeAddProcessFormPanel}
                                submitSalesProcessForm={this.submitSalesProcessForm}
                                treeSelectData={treeSelectData}
                                isLoading={this.state.addProcessLoading}
                                saveResult={this.state.addProcessResult}
                            />
                        ) : null
                    }
                    {
                        /**
                         * isShowProcessInfoPanel true 打开销售流程详情面板
                         **/
                        this.state.isShowProcessInfoPanel ? (
                            <SalesProcessInfo
                                saleProcess={this.state.currentSaleProcess}
                                closeProcessDetailPanel={this.closeProcessDetailPanel}
                                changeSaleProcessFieldSuccess={this.changeSaleProcessFieldSuccess}
                                treeSelectData={treeSelectData}
                                changeProcessStatus={this.handleConfirmChangeProcessStatus}
                            />
                        ) : null
                    }
                </div>
                <div className="customer-stage-wrap" style={{width: containerWidth}}>
                    {
                        this.state.isShowCustomerStage ? (
                            <CustomerStage
                                closeCustomerStagePanel={this.closeCustomerStagePanel}
                                saleProcessId={this.state.saleProcessId}
                                containerWidth={containerWidth}
                                isShowCustomerStage={this.state.isShowCustomerStage}
                                saleProcesTitle={this.state.saleProcessName}
                            />
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

export default SalesProcess;