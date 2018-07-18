import DetailCard from 'CMP_DIR/detail-card';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;

const ContractItem = React.createClass({
    getInitialState() {
        return {
            formData: JSON.parse(JSON.stringify(this.props.contract)),
        };
    },

    componentWillReceiveProps(nextProps) {
        if (this.props.customerId !== nextProps.customerId) {
            this.setState({
                formData: JSON.parse(JSON.stringify(nextProps.contract)),
            });
        }

    },
    renderContractTitle() {
        const contract = this.state.formData;
        return (
            <span className="contract-item-title">合同号:{contract.num}</span>
        );
    },
    // 格式化数值
    formatValues(value, showUnit = true) {
        // 校验参数是否为数值
        value = parseFloat(value);
        if (isNaN(value)) {
            value = 0;
        }
        // 保留两位小数
        value = value.toFixed(2);
        // 增加千分位分割
        if (value) {
            value = parseAmount(value);
        }
        return showUnit ? value + Intl.get('contract.155', '元') : value;
    },
    renderContractContent() {
        const contract = this.state.formData;
        const start_time = contract.start_time ? moment(contract.start_time).format(oplateConsts.DATE_FORMAT) : '';
        const end_time = contract.end_time ? moment(contract.end_time).format(oplateConsts.DATE_FORMAT) : '';
        return (
            <div className="contract-item">
                <div className="contract-item-content">
                    <span className="contract-label">  {Intl.get('contract.4', '甲方')}:</span>
                    <span className="contract-value">{contract.buyer}</span>
                </div>
                <div className="contract-item-content">
                    <span className="contract-label"> {Intl.get('call.record.customer', '客户')}:</span>
                    <span className="contract-value">{contract.customer_name}</span>
                </div>
                <div className="contract-item-content">
                    <span className="contract-label">有效期:</span>
                    <span className="contract-value">
                        {start_time}
                        {end_time ? Intl.get('common.time.connector', '至') : ''}
                        {end_time}
                    </span>
                </div>
                <div className="contract-item-content">
                    <span className="contract-label">{Intl.get('contract.25', '合同额')}:</span>
                    <span className="contract-value">{this.formatValues(contract.contract_amount)}</span>
                </div>
                <div className="contract-item-content">
                    <span className="contract-label">毛利:</span>
                    <span className="contract-value">{this.formatValues(contract.gross_profit)}</span>
                </div>
            </div>
        );
    },
    renderContractBottom() {
        const contract = this.state.formData;
        const date = contract.date ? moment(contract.date).format(oplateConsts.DATE_FORMAT) : '';
        return (
            <div className="contract-bottom-wrap">
                {contract.user_name} 签订于 {date}
            </div>
        );
    },
    render(){
        return (
            <DetailCard
                title={this.renderContractTitle()}
                content={this.renderContractContent()}
                bottom={this.renderContractBottom()}
                className="contract-item-container"
            />
        );
    }
});

module.exports = ContractItem;
