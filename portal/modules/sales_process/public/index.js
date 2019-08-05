/**
 * Created by hzl on 2019/8/1.
 */
require('./css/index.less');
import {Button, Popover, Icon} from 'antd';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import Spinner from 'CMP_DIR/spinner';
import SalesProcessStatusSwitch from 'CMP_DIR/confirm-switch-modify-status';
import SalesProcessStore from './store';
import SalesProcessAction from './action';
import SalesProcessForm from './views/sales-process-form';
import SalesProcessInfo from './views/sale-process-info';

class SalesProcess extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            ...SalesProcessStore.getState(),
        };
    }

    onChange = () => {
        this.setState(SalesProcessStore.getState());
    };

    componentDidMount = () => {
        SalesProcessStore.listen(this.onChange);
        //SalesProcessAction.getSalesProcess();
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

    // 提交销售流程表单
    submitSalesProcessForm = (submitObj) => {
        SalesProcessAction.addSalesProcess(submitObj, (result) => {
            if (result.id) { // 添加成功
                this.closeAddProcessFormPanel();
                SalesProcessAction.upDateSalesProcessList(result);
                message.success(Intl.get('crm.216', '添加成功！'));
            } else { // 添加失败
                message.error(Intl.get('crm.154', '添加失败！'));
            }
        });
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
                    {/**
                     * todo 现在后端还没有实现，先用原来的权限，选更改为CRM_ADD_SALES_PROCESS
                     * */}
                    <PrivilegeChecker check="BGM_SALES_STAGE_ADD">
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

    // 处理设置销售流程
    setShowCustomerStage = (item) => {
        SalesProcessAction.setShowCustomerStage(item);
    };

    // 处理删除销售流程
    handleDeleteSaleProcess = (item) => {
        
    };

    // 确认更改销售流程的状态
    handleConfirmChangeProcessStatus = (item) => {

    };

    // 显示销售流程详情面板
    showProcessDetailPanel = (saleProcess) => {
        SalesProcessAction.showProcessDetailPanel(saleProcess);
    };
    // 关闭销售流程详情面板
    closeProcessDetailPanel = () => {
        SalesProcessAction.closeProcessDetailPanel();
    };

    // 渲染销售流程
    renderSalesProcess = () => {
        const salesProcessList = this.state.salesProcessList;
        return (
            <div className="content-zone">
                {
                    this.state.loading ? <Spinner/> : null
                }
                <ul>
                    {
                        _.map(salesProcessList, (item, index) => {
                            return (
                                <li className="process-box" key={index}>
                                    <div className="item-content">
                                        <div
                                            className="item item-name"
                                            onClick={this.showProcessDetailPanel.bind(this, item)}
                                        >
                                            {item.name}
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
                                        <div className="item item-suitable">
                                            <span>{Intl.get('sales.process.suitable.objects', '适用范围')}:</span>
                                        </div>
                                    </div>
                                    <div className="item-operator">
                                        <span
                                            onClick={this.setShowCustomerStage.bind(this, item)}
                                            data-tracename={'点击设置' + item.name + '销售流程按钮'}
                                        >
                                            <i className="iconfont icon-role-auth-config"></i>
                                        </span>
                                        {
                                            item.type === 'custom' ? (
                                                <span
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
        SalesProcessAction.afterEditSaleProcess(saleProcess);
    };

    render = () => {
        let height = $(window).height() - BACKGROUG_LAYOUT_CONSTANTS.PADDING_HEIGHT;
        let containerHeight = height - BACKGROUG_LAYOUT_CONSTANTS.TOP_ZONE_HEIGHT;

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
                        this.state.isShowAddProcessFormPanel ? (
                            <SalesProcessForm
                                closeAddProcessFormPanel={this.closeAddProcessFormPanel}
                                submitSalesProcessForm={this.submitSalesProcessForm}
                                handleConfirmChangeProcessStatus={this.handleConfirmChangeProcessStatus}
                            />
                        ) : null
                    }
                    {
                        this.state.isShowProcessInfoPanel ? (
                            <SalesProcessInfo
                                saleProcess={this.state.currentSaleProcess}
                                closeProcessDetailPanel={this.closeProcessDetailPanel}
                                changeSaleProcessFieldSuccess={this.changeSaleProcessFieldSuccess}
                            />
                        ) : null
                    }
                </div>
            </div>
        );
    }
}

export default SalesProcess;