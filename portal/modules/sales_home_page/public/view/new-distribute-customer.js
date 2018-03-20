/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/3/19.
 */
require("../css/new-distribute-customer.less");
class NewDistributeCustomer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            newDistributeCustomer: this.props.newDistributeCustomer
        }
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.newDistributeCustomer.id && nextProps.newDistributeCustomer.id !== this.state.newDistributeCustomer.id) {
            this.setState({
                newDistributeCustomer: nextProps.newDistributeCustomer
            })
        }
    };

    render() {
        var expireItem = this.state.newDistributeCustomer;
        return (
            <div className="new-distribute-customer">
                <div className="new-distribute-customer-title">
                    {expireItem.name}
                </div>
            </div>
        )
    }
}
NewDistributeCustomer.defaultProps = {
    newDistributeCustomer: {}

};
export default NewDistributeCustomer;