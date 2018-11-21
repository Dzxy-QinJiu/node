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
            //数据
            data: this.processData(props.data),
            //加载状态
            loading: true,
            //是否显示出错信息
            isShowError: false,
        };
    }

    componentDidMount() {
        //补全客户名
        this.replenishCustomerName();
    }

    //处理数据
    processData(data) {
        const customerIds = data.customer_ids;

        let processedData = _.map(customerIds, customer_id => {
            return {
                customer_id,
                time: Intl.get('common.qualified.time', '合格时间') + ': ' + data.highest_date,
            };
        });

        _.each(data.turn_in, turnInItem => {
            let customer = _.find(processedData, dataItem => dataItem.customer_id === turnInItem.customer_id);

            if (customer) {
                customer.flag = 'turn-in';
                customer.time = customer.time + ', ' + Intl.get('common.turn.in.time', '转入时间') + ': ' + moment(turnInItem.time).format(oplateConsts.DATE_FORMAT);
            } else {
                processedData.push({
                    customer_id: turnInItem.customer_id,
                    flag: 'turn-in',
                    time: Intl.get('common.turn.in.time', '转入时间') + ': ' + moment(turnInItem.time).format(oplateConsts.DATE_FORMAT)
                });
            }
        });

        _.each(data.turn_out, turnOutItem => {
            let customer = _.find(processedData, dataItem => dataItem.customer_id === turnOutItem.customer_id);

            if (customer) {
                customer.flag = 'turn-out';
                customer.time = customer.time + ', ' + Intl.get('common.turn.out.time', '转出时间') + ': ' + moment(turnOutItem.time).format(oplateConsts.DATE_FORMAT);
                customer.turn_out_time = moment(turnOutItem.time).format(oplateConsts.DATE_FORMAT);
            } else {
                processedData.push({
                    customer_id: turnOutItem.customer_id,
                    flag: 'turn-out',
                    time: Intl.get('common.turn.out.time', '转出时间') + ': ' + moment(turnOutItem.time).format(oplateConsts.DATE_FORMAT)
                });
            }
        });

        return processedData;
    }

    //补全客户名
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
        }).done(result => {
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
        })
            .fail(() => {
                this.setState({
                    isShowError: true,
                    loading: false
                });
            });
    }

    //获取表格列定义
    getColumns() {
        return [{
            title: Intl.get('crm.41', '客户名'),
            dataIndex: 'customer_name',
            width: '50%',
            render: (text, record) => {
                let flag = '';

                if (record.flag) {
                    if (record.flag === 'turn-in') {
                        flag = <b>(转入客户)</b>;
                    } else {
                        flag = <b>(转出客户)</b>;
                    }
                }

                return <span>{text}{flag}</span>;
            }
        }, {
            title: '时间',
            dataIndex: 'time',
            width: '50%',
        }];
    }

    render() {
        //顶部栏高度
        const topNavHeight = 64;
        //表头高度
        const tableHeaderHeight = 40;
        //底边距
        const bottomMargin = 16;
        //表体高度
        const tableBodyHeight = $(window).height() - topNavHeight - tableHeaderHeight - bottomMargin;

        return (
            <div className='historic-high-detail'>
                {this.state.isShowError ? (
                    <div className='error-info'>
                        {Intl.get('common.data.request.error', '数据请求出错')}, <span className="retry-btn" onClick={this.replenishCustomerName.bind(this)}>{Intl.get('user.info.retry': '请重试')}</span>
                    </div>
                ) : (
                    <AntcTable
                        columns={this.getColumns()}
                        dataSource={this.state.data}
                        loading={this.state.loading}
                        pagination={false}
                        scroll={{y: tableBodyHeight}}
                    />
                )}
            </div>
        );
    }
}

export default HistoricHighDetail;
