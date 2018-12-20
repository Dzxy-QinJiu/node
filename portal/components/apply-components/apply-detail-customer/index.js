/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {Table} from 'react-bootstrap';
require('./index.less');
class ApplyDetailCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {

        };
    }
    render(){
        return (
            <div className="apply-detail-customer apply-detail-info">
                <div className="leave-detail-icon-block">
                    <span className="iconfont icon-customer"/>
                </div>
                <div className="leave-detail-block apply-info-block">
                    <div className="apply-info-content">
                        <Table striped bordered>
                            <tbody>
                                <tr className="apply-detail-head">
                                    {_.map(this.props.columns, (colItem) => {
                                        return (<th>{colItem.title}</th>);
                                    })}
                                </tr>
                                {
                                    this.props.data.map((customer,index) => {
                                        return (<tr key={index}>
                                            {this.props.columns.map((column, index) => {
                                                return (
                                                    <td className={column.className} key={index}>
                                                        {_.isFunction(column.render) ? column.render(customer[column.dataIndex], customer, index) : customer[column.dataIndex]}
                                                    </td>
                                                );
                                            })}
                                        </tr>);
                                    })
                                }
                            </tbody>
                        </Table>
                    </div>
                </div>
            </div>
        );
    }
}
ApplyDetailCustomer.defaultProps = {
    columns: [],
    data: [],
};
ApplyDetailCustomer.propTypes = {
    columns: PropTypes.object,
    data: PropTypes.object,

};

export default ApplyDetailCustomer;