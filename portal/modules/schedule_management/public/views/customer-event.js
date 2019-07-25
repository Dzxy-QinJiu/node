/**
 * Copyright (c) 2016-2017 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2016-2017 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by zhangshujuan on 2018/1/3.
 */
var Popover = require('antd').Popover;
var classNames = require('classnames');
class CustomEvent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            curCustomerId: '',
        };
    }

    handleVisibleChange = (visible) => {
        this.setState({visible});
    };
    handleClickEvent = (item) => {
        this.setState({
            curCustomerId: item.customer_id
        });
        this.props.event.showCustomerOrClueDetail(item);
    };
    renderCustomerName = () => {
        var _this = this;
        return (
            <div className="customer-names-wrap">
                {_.map(this.props.event.totalCustomerObj, (item) => {
                    var listCls = classNames('list-item', {
                        'has-handled': item.status === 'handle',
                        'selected-customer': item.customer_id === this.state.curCustomerId
                    });
                    return (
                        <p className={listCls} onClick={this.handleClickEvent.bind(this, item)}>
                            {item.customer_name || item.lead_name }
                        </p>
                    );
                })}
            </div>
        );
    };

    render() {
        return (
            <div className="customer-event-wrap">
                <div className="circle-wrap-container">
                    {/*点击日程数字后展示的客户的名称*/}
                    <Popover
                        content={<div>{this.renderCustomerName()}</div>}
                        trigger="click"
                        visible={this.state.visible}
                        onVisibleChange={this.handleVisibleChange}
                        placement="right"
                        overlayClassName="schedule-manage-popover"
                    >
                        {/*日程的数字*/}
                        <div className="schedule-count">{this.props.event.count}</div>
                    </Popover>
                    {/*日期外面的圈*/}
                    <div className="circle-wrap">
                    </div>
                </div>
            </div>
        );
    }
}
export default CustomEvent;