/**
 * Created by hzl on 2019/8/1.
 */
require('./css/index.less');
import {Button, Popover, Icon} from 'antd';
import {BACKGROUG_LAYOUT_CONSTANTS} from 'PUB_DIR/sources/utils/consts';
import {PrivilegeChecker} from 'CMP_DIR/privilege/checker';
import Spinner from 'CMP_DIR/spinner';
import SalesProcessStore from './store';
import SalesProcessAction from './action';
import SalesProcessStatusSwitch from 'CMP_DIR/confirm-switch-modify-status';

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
        SalesProcessAction.getSalesProcess();
    };

    componentWillUnmount = () => {
        SalesProcessStore.unlisten(this.onChange);
    };

    showAddSalesProcessForm = () => {

    };

    //渲染操作按钮区
    renderTopNavOperation = () => {
        let length = _.get(this.state.salesprocessList, 'length');
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
                                onClick={this.showAddSalesProcessForm.bind(this, 'addSalesProcess')}
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
    handleSettingSalesProcess = (item) => {

    };

    // 处理删除销售流程
    handleDeleteSaleProcess = (item) => {
        
    };

    // 确认更改销售流程的状态
    handleConfirm = (item) => {

    };

    // 渲染销售流程
    renderSalesProcess = () => {
        const salesProcessList = this.state.salesprocessList;
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
                                        <div className="item item-name">{item.name}</div>
                                        <div className="item item-description">{item.description}</div>
                                        <div className="item item-status">
                                            <span>{Intl.get('common.status', '状态')}:</span>
                                            <SalesProcessStatusSwitch
                                                title={Intl.get('member.status.eidt.tip', '确定要{status}该销售流程？', {
                                                    status: item.status === 0 ? Intl.get('common.enabled', '启用') :
                                                        Intl.get('common.stop', '停用')
                                                })}
                                                handleConfirm={this.handleConfirm.bind(this, item)}
                                                status={item.status}
                                            />
                                        </div>
                                        <div className="item item-suitable">
                                            <span>{Intl.get('sales.process.suitable.objects', '适用范围')}:</span>
                                        </div>
                                    </div>
                                    <div className="item-operator">
                                        <span
                                            onClick={this.handleSettingSalesProcess.bind(this, item)}
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
                </div>
            </div>
        );
    }
}

export default SalesProcess;