/**
 * Created by hzl on 2019/8/5.
 * 销售流程的详情面板，可以编辑
 */

import Trace from 'LIB_DIR/trace';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import SalesProcessStatusSwitch from 'CMP_DIR/confirm-switch-modify-status';
import SalesProcessStore from '../store';
import SalesProcessAjax from '../ajax';
import CUSTOMER_STAGE_PRIVILEGE from '../privilege-const';

class SalesProcessInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            saleProcess: props.saleProcess,
            ...SalesProcessStore.getState(),
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'saleProcess.id') !== this.state.saleProcess.id) {
            this.setState({
                saleProcess: nextProps.saleProcess,
            });
        }
    }

    componentDidMount() {
        SalesProcessStore.listen(this.onChange);
    }

    componentWillUnmount() {
        SalesProcessStore.unlisten(this.onChange);
    }

    onChange = () => {
        this.setState(SalesProcessStore.getState());
    }

    changeSaleProcessFieldSuccess = (saleProcess) => {
        _.isFunction(this.props.changeSaleProcessFieldSuccess) && this.props.changeSaleProcessFieldSuccess(saleProcess);
    };

    saveEditSaleProcess = (type, saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存销售流程${type}的修改`);
        SalesProcessAjax.updateSalesProcess(saveObj).then((result) => {
            if (result) {
                if (_.isFunction(successFunc)) successFunc();
                this.changeSaleProcessFieldSuccess(saveObj);
            } else {
                if (_.isFunction(errorFunc)) errorFunc();
            }
        }, (errorMsg) => {
            if (_.isFunction(errorFunc)) errorFunc(errorMsg);
        });
    }

    handleCancel = (event) => {
        event.preventDefault();
        Trace.traceEvent(event, '关闭编辑销售流程面板');
        this.props.closeProcessDetailPanel();
    };

    changeProcessStatus = (saleProcess) => {
        this.props.changeProcessStatus(saleProcess);
    };

    renderContent(){
        const saleProcess = this.state.saleProcess;
        const id = saleProcess.id;
        const EDIT_FEILD_LESS_WIDTH = 350;

        return (
            <div className="process-content-wrap">
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('common.definition', '名称')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={id}
                        value={saleProcess.name}
                        field='name'
                        type="text"
                        hasEditPrivilege={hasPrivilege(CUSTOMER_STAGE_PRIVILEGE.UPDATE_SPECIFIC_STAGE)}
                        placeholder={Intl.get('sales.process.name.placeholder', '请输入销售流程名称')}
                        saveEditInput={this.saveEditSaleProcess.bind(this, 'name')}
                    />
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('common.status', '状态')}:</span>
                    {
                        hasPrivilege(CUSTOMER_STAGE_PRIVILEGE.UPDATE_SPECIFIC_STAGE) ? (
                            <div className="process-status">
                                <SalesProcessStatusSwitch
                                    title={Intl.get('sales.process.status.edit.tip', '确定要{status}该销售流程？', {
                                        status: saleProcess.status === '0' ? Intl.get('common.enabled', '启用') :
                                            Intl.get('common.stop', '停用')
                                    })}
                                    handleConfirm={this.changeProcessStatus.bind(this, saleProcess)}
                                    status={saleProcess.status === '1' ? true : false}
                                />
                            </div>
                        ) : null
                    }
                </div>
                <div className="basic-info-item">
                    <span className="basic-info-label">{Intl.get('common.describe', '描述')}:</span>
                    <BasicEditInputField
                        width={EDIT_FEILD_LESS_WIDTH}
                        id={id}
                        value={saleProcess.description}
                        field='description'
                        type="text"
                        hasEditPrivilege={hasPrivilege(CUSTOMER_STAGE_PRIVILEGE.UPDATE_SPECIFIC_STAGE)}
                        placeholder={Intl.get('sales.process.destrip.placeholder', '请输入销售流程的描述信息')}
                        saveEditInput={this.saveEditSaleProcess.bind(this, 'description')}
                    />
                </div>
                {
                    /***
                     * toTO: 暂时隐藏
                     * <div className="basic-info-item">
                     <span className="basic-info-label">{Intl.get('sales.process.suitable.objects', '适用范围')}:</span>
                     </div>
                     * */
                }
            </div>
        );
    }

    render() {
        return (
            <RightPanelModal
                className="sals-process-detail-container"
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title='编辑销售流程'
                content={this.renderContent()}
                dataTracename='编辑销售流程'
            />);
    }
}

function noop() {
}

SalesProcessInfo.defaultProps = {
    saleProcess: {},
    changeSaleProcessFieldSuccess: noop,
    closeProcessDetailPanel: noop,
    changeProcessStatus: noop
};
SalesProcessInfo.propTypes = {
    saleProcess: PropTypes.object,
    changeSaleProcessFieldSuccess: PropTypes.func,
    closeProcessDetailPanel: PropTypes.func,
    changeProcessStatus: PropTypes.func,
};

export default SalesProcessInfo;