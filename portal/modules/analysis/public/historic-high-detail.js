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
        data: PropsTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            data: this.processData(props.data),
            loading: true,
        };
    }

    componentDidMount() {
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

    getNames() {
        ajax.send({
            url: '/rest/customer/v2/salestage'
        }).then(result => {
            Store.stageList = result.result;
        });
    }

    componentWillReceiveProps(nextProps) {
    }

    componentWillUnmount() {
    }

    render() {
        console.log(this.state.data);
        return (
            <div className='historic-high-detail'>
                <AntcTable
                    columns={this.getColumns}
                    dataSource={this.state.data}
                    loading={this.state.loading}
                    pagination={false}
                />
            </div>
        );
    }
}

export default HistoricHighDetail;
