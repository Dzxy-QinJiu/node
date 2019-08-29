/**
 * Created by hzl on 2019/8/28.
 */
require('../../css/customer-stage.less');
import DetailCard from 'CMP_DIR/detail-card';

class CustomerStageCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            customerId: props.customerId,
            customerStageList: props.customerStageList,
            currentStage: props.currentStage, // 当前客户处的客户阶段
        };
    }

    changeCustomerLabel = () => {

    };

    renderContent = () => {
        const customerStageList = this.props.customerStageList; // 客户阶段列表
        const currentStage = this.props.currentStage; // 当前客户处的客户阶段
        let index = _.indexOf(customerStageList, currentStage);
        return (
            <div className="customer-stage-content">
                <span className="customer-stage-label">
                    {Intl.get('weekly.report.customer.stage', '客户阶段')}:
                </span>
                <span className="customer-stage">
                    {
                        _.map(this.props.customerStageList, (item, idx) => {
                            let cls = 'color-lump';
                            if (idx <= index) {
                                cls += ' customer-stage-color-lump' + idx;
                            } else {
                                cls += ' grap-color-lump';
                            }
                            return (
                                <div
                                    className={cls}
                                    title={item}
                                >
                                    <span
                                        onClick={this.changeCustomerLabel.bind(this)}
                                        title={Intl.get('crm.customer.label.edit.tip', '点击修改客户阶段')}
                                    >
                                        {item}
                                    </span>
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
    curCustomer: PropTypes.object,
    isMerge: PropTypes.bool,
    updateMergeCustomer: PropTypes.func,
    isRepeat: PropTypes.bool,
    refreshCustomerList: PropTypes.func,
    disableEdit: PropTypes.bool,
    updateCustomerLastContact: PropTypes.func,
    customerStageList: PropTypes.array,
    customerId: PropTypes.string,
    currentStage: PropTypes.string
};

export default CustomerStageCard;