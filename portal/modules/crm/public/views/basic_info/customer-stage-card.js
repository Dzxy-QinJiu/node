/**
 * Created by hzl on 2019/8/28.
 */
require('../../css/customer-stage.less');
import {message} from 'antd';
import DetailCard from 'CMP_DIR/detail-card';
import CrmBasicAjax from '../../ajax/index';

import Trace from 'LIB_DIR/trace';

class CustomerStageCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerStageList: props.customerStageList,
            currentStage: props.currentStage, // 当前客户处的客户阶段
            basicData: props.basicData,
        };
    }

    componentWillReceiveProps = (nextProps) => {
        if (nextProps.basicData && nextProps.basicData.id) {
            this.setState({
                customerStageList: nextProps.customerStageList,
                currentStage: nextProps.currentStage, // 当前客户处的客户阶段
                basicData: nextProps.basicData,
            });
        }
    };

    changeCustomerLabel = (item) => {
        let basicData = this.state.basicData;
        if (item === _.get(basicData, 'customer_label')) return;
        if (!_.get(basicData, 'id')) return;
        Trace.traceEvent(ReactDOM.findDOMNode(this), '保存客户阶段的修改');
        let saveLabelObj = {
            id: _.get(basicData, 'id'),
            customer_label: item,
            type: 'customer_label'
        };
        if (this.props.isMerge) {
            if (_.isFunction(this.props.updateMergeCustomer)) this.props.updateMergeCustomer(saveLabelObj);
            basicData.customer_label = item;
            this.setState({basicData});
        } else {
            CrmBasicAjax.updateCustomer(saveLabelObj).then((resData) => {
                if (resData && resData.result === 'success') {
                    this.setState({
                        currentStage: item
                    });
                    this.props.editBasicSuccess(saveLabelObj);
                    message.success(Intl.get('crm.218', '修改成功'));
                } else {
                    message.error(Intl.get('crm.219', '修改失败'));
                }
            }, (errorMsg) => {
                message.error(errorMsg || Intl.get('crm.219', '修改失败'));
            });

        }
    };

    renderContent = () => {
        const customerStageList = this.state.customerStageList; // 客户阶段列表
        const currentStage = this.state.currentStage; // 当前客户处的客户阶段
        let index = _.indexOf(customerStageList, currentStage);
        return (
            <div className="customer-stage-content">
                <span className="customer-stage-label">
                    {Intl.get('weekly.report.customer.stage', '客户阶段')}:
                </span>
                <span className="customer-stage">
                    {
                        _.map(customerStageList, (item, idx) => {
                            let cls = 'color-lump';
                            if (idx <= index) {
                                cls += ' customer-stage-color-lump' + idx;
                            } else {
                                cls += ' gray-color-lump';
                            }
                            return (
                                <div
                                    className={cls}
                                    title={item}
                                    onClick={this.changeCustomerLabel.bind(this, item)}
                                >
                                    {
                                        item.length > 2 ? <span>{item.substring(0, 2)}...</span> :
                                            <span>{item}</span>
                                    }
                                </div>
                            );
                        })
                    }
                </span>
            </div>
        );
    };

    render = () => {
        return (
            <DetailCard
                content={this.renderContent()}
                className="customer-stage-container"
            />);
    };
}

CustomerStageCard.propTypes = {
    basicData: PropTypes.object,
    isMerge: PropTypes.bool,
    updateMergeCustomer: PropTypes.func,
    disableEdit: PropTypes.bool,
    customerStageList: PropTypes.array,
    currentStage: PropTypes.string,
    editBasicSuccess: PropTypes.func
};

export default CustomerStageCard;