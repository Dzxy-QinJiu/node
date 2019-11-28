/**
 * Copyright (c) 2015-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2015-2019 湖南蚁坊软件股份有限公司。保留所有权利。
 * Created by yubin on 2019/11/11.
 *
 * 查询客户面板
 */

import ajax from 'ant-ajax';
import { Select, message } from 'antd';
import RightPanelModal from 'CMP_DIR/right-panel-modal';
import { hasPrivilege } from 'CMP_DIR/privilege/checker';
import { VIEW_TYPE, NOOP } from './consts';
import crmPrivilegeConst from 'MOD_DIR/crm/public/privilege-const';

let queryCustomerTimeout = null;

class CustomerSearch extends React.Component {
    static defaultProps = {
        //改变视图类型
        prevViewType: '',
        //改变视图类型
        changeViewType: NOOP,
        //关闭面板
        onClose: NOOP,
        //父组件
        parent: null,
    }

    static propTypes = {
        prevViewType: PropTypes.string,
        changeViewType: PropTypes.func,
        onClose: PropTypes.func,
        parent: PropTypes.object,
    }

    constructor(props) {
        super(props);

        this.state = {
            customerList: [],
        };
    }

    render() {
        return (
            <RightPanelModal
                isShowCloseBtn={true}
                onClosePanel={this.props.onClose}
                title={this.renderPanelTitle()}
                content={this.renderPanelContent()}
            />
        );
    }

    renderPanelTitle() {
        const title = Intl.get('common.merge.to.other.customer', '合并到其他客户');
        const opBtnText = Intl.get('crm.52', '返回');

        return (
            <div>
                <span className="panel-title">{title}</span>
                <span className="op-btn" onClick={this.props.changeViewType.bind(this.props.parent, this.props.prevViewType)}>{opBtnText}</span>
            </div>
        );
    }

    renderPanelContent() {
        return (
            <div className="customer-search">
                <Select
                    combobox
                    filterOption={false}
                    placeholder={Intl.get('customer.search.by.customer.name', '请输入客户名称搜索')}
                    optionLabelProp='children'
                    onSearch={this.queryCustomer}
                    onSelect={this.onCustomerChoosen}
                >
                    {this.state.customerList.map((customer, index) => {
                        return <Option key={index} value={customer.id}>{customer.name}</Option>;
                    })}
                </Select>
            </div>
        );
    }

    // 查询客户
    queryCustomer = keyword => {
        //更新输入框内容

        if (queryCustomerTimeout) {
            clearTimeout(queryCustomerTimeout);
        }

        queryCustomerTimeout = setTimeout(() => {
            const authType = hasPrivilege(crmPrivilegeConst.CUSTOMER_ALL) ? 'manager' : 'user';

            ajax.send({
                url: `/rest/customer/v3/customer/range/${authType}/10/1/start_time/descend`,
                type: 'post',
                data: {
                    query: {
                        name: keyword
                    }
                }
            })
                .done(result => {
                    this.setState({customerList: result.result});
                })
                .fail(errMsg => {
                    message.error(errMsg);
                });
        }, 500);
    }

    // 客户选择触发事件
    onCustomerChoosen = customerId => {
        const customer = _.find(this.state.customerList, item => item.id === customerId);

        this.props.changeViewType(VIEW_TYPE.CUSTOMER_MERGE, customer);
    }
}

export default CustomerSearch;
