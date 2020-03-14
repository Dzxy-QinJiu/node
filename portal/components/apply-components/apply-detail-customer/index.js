/**
 * Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/9/27.
 */
import {AntcTable} from 'antc';
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
                        <AntcTable
                            columns={this.props.columns}
                            dataSource={this.props.dataSource}
                            bordered={this.props.bordered}
                            isSmallSize={true}
                            tableType='data'
                            pagination={false}
                        />
                    </div>
                </div>
            </div>
        );
    }
}
ApplyDetailCustomer.defaultProps = {
    columns: [],
    dataSource: [],
    bordered: false
};
ApplyDetailCustomer.propTypes = {
    columns: PropTypes.object,
    dataSource: PropTypes.object,
    bordered: PropTypes.bool
};

export default ApplyDetailCustomer;