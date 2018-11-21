/**
 * 试用合格客户统计历史最高值明细
 */

//require('./style.less');
import ajax from 'ant-ajax';
import { AntcTable } from 'antc';

class HistoricHighDetail extends React.Component {
    static defaultProps = {
        data: {}
    };

    static propTypes = {
        data: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            data: this.processData(props.data),
            loading: true,
        };
    }

    componentDidMount() {
        this.replenishCustomerName();
    }

    processData(data) {
        const customerIds = data.customer_ids;

        let processedData = _.map(customerIds, customer_id => {
            return {
                customer_id,
                qualified_time: data.highest_date,
            };
        });

        _.each(data.turn_in, turnInItem => {
            let customer = _.findIndex(processedData, dataItem => dataItem.customer_id === turnInItem.customer_id);

            if (customer) {
                customer.turn_in_time = moment(turnInItem.time).format(oplateConsts.DATE_FORMAT);
            } else {
                processedData.push({
                    customer_id: turnInItem.customer_id,
                    turn_in_time: moment(turnInItem.time).format(oplateConsts.DATE_FORMAT),
                });
            }
        });

        _.each(data.turn_out, turnOutItem => {
            let customer = _.find(processedData, dataItem => dataItem.customer_id === turnOutItem.customer_id);

            if (customer) {
                customer.turn_out_time = moment(turnOutItem.time).format(oplateConsts.DATE_FORMAT);
            } else {
                processedData.push({
                    customer_id: turnOutItem.customer_id,
                    turn_out_time: moment(turnOutItem.time).format(oplateConsts.DATE_FORMAT),
                });
            }
        });

        return processedData;
    }

    replenishCustomerName() {
        const customers = this.state.data;
        const count = customers.length;
        const customerIds = _.map(customers, 'customer_id').join(',');

        ajax.send({
            url: `/rest/customer/v2/customer/range/${count}/id/asc/force_use_common_rest`,
            type: 'post',
            data: {
                query: {
                    id: customerIds
                }
            }
        }).then(result => {
            const resultData = _.get(result, 'result');

            if (_.isArray(resultData)) {
                const processedData = _.cloneDeep(this.state.data);

                _.each(processedData, dataItem => {
                    const matchedResultDataItem = _.find(resultData, resultDataItem => resultDataItem.id === dataItem.customer_id);

                    if (matchedResultDataItem) {
                        dataItem.customer_name = matchedResultDataItem.name;
                    }
                });

                this.setState({
                    data: processedData,
                    loading: false
                });
            }
        });
    }

    componentWillReceiveProps(nextProps) {
    }

    componentWillUnmount() {
    }

    getColumns() {
        return [{
            title: '客户名',
            dataIndex: 'customer_name',
        }, {
            title: '合格时间',
            dataIndex: 'qualified_time',
        }, {
            title: '转入时间',
            dataIndex: 'turn_in_time',
        }, {
            title: '转出时间',
            dataIndex: 'turn_out_time',
        }];
    }

    render() {
        return (
            <div className='historic-high-detail'>
                <AntcTable
                    columns={this.getColumns()}
                    dataSource={this.state.data}
                    loading={this.state.loading}
                    pagination={false}
                />
            </div>
        );
    }
}

export default HistoricHighDetail;
