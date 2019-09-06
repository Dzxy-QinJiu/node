/**
 * Created by hzl on 2019/9/2.
 * 客户阶段详情面板
 */
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import BasicEditInputField from 'CMP_DIR/basic-edit-field-new/input';
import SalesProcessStore from '../store';
import SalesProcessAjax from '../ajax';
import {nameRule} from 'PUB_DIR/sources/utils/validate-util';
import GeminiScrollBar from 'CMP_DIR/react-gemini-scrollbar';
import CustomerStageInfo from './customer-stage-info';
import CustomerStageTimeLine from './customer-stage-timeline';
import Trace from 'LIB_DIR/trace';

const EDIT_FEILD_LESS_WIDTH = 420;

class CustomerStageDetailPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentCustomerStage: props.currentCustomerStage, // 客户阶段信息
            salesProcessList: props.salesProcessList, //
            ...SalesProcessStore.getState(),
        };
    }

    componentWillReceiveProps(nextProps) {
        if (_.get(nextProps, 'currentCustomerStage.id') !== this.state.currentCustomerStage.id) {
            this.setState({
                currentCustomerStage: nextProps.currentCustomerStage,
                salesProcessList: nextProps.salesProcessList,
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
    };

    changeSaleProcessFieldSuccess = (saleProcess) => {
        _.isFunction(this.props.changeSaleProcessFieldSuccess) && this.props.changeSaleProcessFieldSuccess(saleProcess);
    };

    saveEditCustomerStageName = (type, saveObj, successFunc, errorFunc) => {
        Trace.traceEvent(ReactDOM.findDOMNode(this), `保存客户阶段${type}的修改`);
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
    };

    handleCancel = (event) => {
        event.preventDefault();
        Trace.traceEvent(event, '关闭编辑客户阶段面板');
        this.props.closeCustomerStagePanel();
    };

    getContainerHeight = () => {
        const PADDING = 100;
        return $('body').height()
            - $('.member-detail-container .right-panel-modal-title').outerHeight(true)
            - $('.member-detail-container .ant-tabs-bar').outerHeight(true)
            - PADDING;
    };

    // 渲染右侧面板内容区的值
    renderContent(){
        const currentCustomerStage = this.state.currentCustomerStage;
        let customerStages = currentCustomerStage.customer_stages;
        let teams = _.map(currentCustomerStage.teams, 'name');
        let users = _.map(currentCustomerStage.users, 'name');
        let scope = _.concat(teams, users);
        let heigth = this.getContainerHeight();
        return (
            <div className="stage-detail-wrap" style={{height: heigth}}>
                <GeminiScrollBar style={{height: heigth}}>
                    <div className="stage-content-set-stage">
                        <div className="stage-label">
                            {Intl.get('customer.stage.stage.title', '阶段设置')}
                        </div>
                        <div className="stage-content">
                            <div className="customer-stage-table-block">
                                <ul className="customer-stage-timeline">
                                    {
                                        _.map(customerStages, (item, idx) => {
                                            let cls = 'customer-stage-timeline-item-head';
                                            cls += ' customer-stage-color-lump' + idx;
                                            return (
                                                <li className="customer-stage-timeline-item" key={idx}>
                                                    <div className="customer-stage-timeline-item-tail"></div>
                                                    <div className={cls}>
                                                        <i className='iconfont icon-order-arrow-down'></i>
                                                    </div>
                                                    <div className="customer-stage-timeline-item-right"></div>
                                                    <CustomerStageTimeLine
                                                        customerStage={item}
                                                    />
                                                </li>
                                            );
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="stage-content-team-user">
                        <div className="stage-label">
                            {Intl.get('sales.process.suitable.objects', '适用范围')}
                        </div>
                        <div className="stage-content">
                            {_.join(scope, '、')}
                        </div>
                    </div>
                </GeminiScrollBar>
            </div>
        );
    }

    // 客户阶段唯一性校验
    getValidator = () => {
        return (rule, value, callback) => {
            let stageName = _.trim(value); // 文本框中的值
            if (stageName) {
                let salesProcessList = this.state.salesProcessList; // 已存在的客户阶段
                let isExist = _.find(salesProcessList, item => item.name === stageName);
                if (isExist && stageName !== this.state.currentCustomerStage.name) { // 和已存在的客户阶段名称是相同
                    callback(Intl.get('sales.process.name.verify.exist', '该客户阶段已存在'));
                } else {
                    callback();
                }
            } else {
                callback(Intl.get('common.name.rule', '{name}名称只能包含汉字、字母、数字、横线、下划线、点、中英文括号等字符，且长度在1到50（包括50）之间', {name: Intl.get('weekly.report.customer.stage', '客户阶段')}));
            }
        };
    };

    // 渲染客户阶段名称
    renderCustomerStageName = () => {
        const currentCustomerStage = this.state.currentCustomerStage;
        const id = currentCustomerStage.id;

        return (
            <div className="basic-info-item">
                <BasicEditInputField
                    width={EDIT_FEILD_LESS_WIDTH}
                    id={id}
                    value={currentCustomerStage.name}
                    field='name'
                    type="text"
                    hasEditPrivilege={hasPrivilege('CRM_UPDATE_CUSTOMER_SALES')}
                    validators={[{validator: this.getValidator()}]}
                    placeholder={Intl.get('customer.stage.name.placeholder', '请输入客户阶段')}
                    saveEditInput={this.saveEditCustomerStageName.bind(this, 'name')}
                />
            </div>
        );
    };

    render() {
        return (
            <RightPanelModal
                className="customer-stage-detail-container"
                isShowMadal={false}
                isShowCloseBtn={true}
                onClosePanel={this.handleCancel.bind(this)}
                title={this.renderCustomerStageName()}
                content={this.renderContent()}
                dataTracename='编辑客户阶段'
            />);
    }

}

CustomerStageDetailPanel.propTypes = {
    currentCustomerStage: PropTypes.object,
    salesProcessList: PropTypes.array,
    changeSaleProcessFieldSuccess: PropTypes.func,
    closeCustomerStagePanel: PropTypes.func,
};

export default CustomerStageDetailPanel;