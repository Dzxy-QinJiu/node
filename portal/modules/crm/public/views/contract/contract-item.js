import DetailCard from 'CMP_DIR/detail-card';
import { AntcTable } from 'antc';
import { num as antUtilsNum } from 'ant-utils';
const parseAmount = antUtilsNum.parseAmount;
import classNames from 'classnames';
import Trace from 'LIB_DIR/trace';

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
    toggleContractDetail(event) {
        let formData = this.state.formData;
        formData.isShowAllContractInfo = !formData.isShowAllContractInfo;
        if (formData.isShowAllContractInfo) {
            Trace.traceEvent(event, '点击展开详情');
        } else {
            Trace.traceEvent(event, '点击收起详情');
        }
        this.setState({formData});
    },
    renderContractTitle() {
        const contract = this.state.formData;
        let contractStageClass = classNames('contract-stage', {
            'contract-pending': contract.stage === '待审',
            'contract-review': contract.stage === '审核',
            'contract-filed': contract.stage === '归档',
            'contract-scrapped': contract.stage === '报废'
        });
        let contractClass = classNames('iconfont',{
            'icon-down-twoline': !contract.isShowAllContractInfo,
            'icon-up-twoline': contract.isShowAllContractInfo
        });
        let contractTitle = contract.isShowAllContractInfo ? Intl.get('crm.basic.detail.hide', '收起详情') :
            Intl.get('crm.basic.detail.show', '展开详情');
        return (
            <div className='contract-title'>
                {contract.stage === '待审' && !contract.num ? (
                    <span className='contract-item-stage'>{Intl.get('contract.170', '合同待审')}</span>
                ) : (
                    <span className='contract-item-title'>
                        <span className={contractStageClass}>
                            <span className='contract-left-bracket'>[</span>{contract.stage}<span className='contract-right-bracket'>]</span>
                        </span>
                        <span className='contract-num'>{contract.num}</span>
                    </span>
                )}
                <span className={contractClass} title={contractTitle} onClick={this.toggleContractDetail}/>
            </div>
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
    renderAppIconName(appName, appId) {
        let appList = this.props.appList;
        let matchAppObj = _.find( appList, (appItem) => {
            return appItem.client_id === appId;
        });
        return (
            <span className="app-icon-name">
                {appName ? (
                    matchAppObj && matchAppObj.client_image ? (
                        <span className="app-self">
                            <img src={matchAppObj.client_image} />
                        </span>
                    ) : (
                        <span className='app-default'>
                            <i className='iconfont icon-app-default'></i>
                        </span>
                    )
                ) : null}
                <span className='app-name' title={appName}>{appName}</span>
            </span>
        );
    },
    getProductColumns() {
        return [
            {
                title: Intl.get('common.app', '应用'),
                dataIndex: 'name',
                key: 'name',
                width: '50%',
                render: (text, record, index) => {
                    return <span className="app-info">{this.renderAppIconName(text, record.id)}</span>;
                }
            },
            {
                title: Intl.get('contract.171', '用户个数'),
                dataIndex: 'count',
                width: '20%',
                key: 'count'
            },
            {
                title: Intl.get('contract.172', '金额(元)'),
                dataIndex: 'total_price',
                key: 'total_price',
                width: '30%',
                render: (text) => {
                    return <span>{parseAmount(text.toFixed(2))}</span>;
                }
            }
        ];
    },
    renderProductInfo(products) {
        let columns = this.getProductColumns(products);
        return (
            <AntcTable
                dataSource={products}
                columns={columns}
                pagination={false}
                bordered
            />
        );
    },
    renderContractContent() {
        const contract = this.state.formData;
        const start_time = contract.start_time ? moment(contract.start_time).format(oplateConsts.DATE_FORMAT) : '';
        const end_time = contract.end_time ? moment(contract.end_time).format(oplateConsts.DATE_FORMAT) : '';
        return (
            <div className="contract-item">
                <div className="contract-item-content">
                    <span className="contract-label">{Intl.get('contract.37', '合同类型')}:</span>
                    <span className="contract-value">{contract.category}</span>
                </div>
                <div className="contract-item-content">
                    <span className="contract-label">{Intl.get('contract.4', '甲方')}:</span>
                    <span className="contract-value">{contract.buyer}</span>
                </div>
                <div className="contract-item-content">
                    <span className="contract-label"> {Intl.get('call.record.customer', '客户')}:</span>
                    <span className="contract-value">{contract.customer_name}</span>
                </div>
                <div className="contract-item-content">
                    <span className="contract-label">{Intl.get('contract.168', '有效期')}:</span>
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
                    <span className="contract-label">{Intl.get('contract.109', '毛利')}:</span>
                    <span className="contract-value">{this.formatValues(contract.gross_profit)}</span>
                </div>
                {
                    contract.isShowAllContractInfo ? (
                        <div className="contract-item-content">
                            <span className="contract-label">{Intl.get('contract.95', '产品信息')}:</span>
                            <span className="contract-value">
                                {_.get(contract.products, '[0]') ? this.renderProductInfo(contract.products) : Intl.get('contract.173', '暂无产品信息')}
                            </span>
                        </div>
                    ) : null
                }
                {
                    contract.isShowAllContractInfo && contract.remarks ? (
                        <div className="contract-item-content">
                            <span className="contract-label">{Intl.get('common.remark', '备注')}:</span>
                            <span className="contract-value contract-remarks">
                                {contract.remarks}
                            </span>
                        </div>
                    ) : null
                }
            </div>
        );
    },
    renderContractBottom() {
        const contract = this.state.formData;
        const date = contract.date ? moment(contract.date).format(oplateConsts.DATE_FORMAT) : '';
        return (
            <div className="contract-bottom-wrap">
                <ReactIntl.FormattedMessage
                    id="contract.169"
                    defaultMessage={'{uername}签订于{date}'}
                    values={{
                        'uername': <span className="signed-username">{contract.user_name}</span>,
                        'date': date
                    }}
                />
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
