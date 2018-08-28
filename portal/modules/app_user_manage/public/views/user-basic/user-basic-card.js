/**
* Copyright (c) 2015-2018 EEFUNG Software Co.Ltd. All rights reserved.
* 版权所有 (c) 2015-2018 湖南蚁坊软件股份有限公司。保留所有权利。
* Created by xuning on 2018 
*/
import DetailCard from 'CMP_DIR/detail-card';
import { Select, Input } from 'antd';
// import { hasPrivilege } from '../../privilege/checker';s
import CustomerSuggest from 'MOD_DIR/app_user_manage/public/views/customer_suggest/customer_suggest';

const PropTypes = React.PropTypes;
//class的前缀
const CLASS_PREFIX = 'user-customer';
const USER_CUSTOMER_SUGGEST_ID = 'user-customer-suggest-wrap';
var customerAjax = require('MOD_DIR/common/public/ajax/customer');
import { DetailEditBtn } from 'CMP_DIR/rightPanel';
import { StatusWrapper } from 'antc';

class UserBasicCard extends React.Component {
    constructor(props) {
        super();
        this.state = {
            showEdit: false,
            //客户ids
            customer_id: props.customer_id,
            //客户名称
            customer_name: props.customer_name,
            //是显示文字text，还是显示操作区select
            displayType: props.displayType,
            //提交状态
            submitType: '',
            //错误信息
            error_message: '',
            //销售id
            sales_id: props.sales_id,
            //销售名称
            sales_name: props.sales_name,
            //销售id
            sales_team_id: props.sales_team_id,
            //销售名称
            sales_team_name: props.sales_team_name
        };
    }
    componentWillReceiveProps(nextProps) {
        //外层传进来新的客户、销售、销售团队数据的时候，更新这些字段
        var propList = [
            'customer_id',
            'customer_name',
            'sales_id',
            'sales_name',
            'sales_team_id',
            'sales_team_name'
        ];
        const newState = {};
        _.each(propList, (prop) => {
            if (this.props[prop] !== nextProps[prop]) {
                newState[prop] = nextProps[prop];
            }
        });
        if (!_.isEmpty(newState)) {
            this.setState(newState);
        }
    }
    onCustomerChoosen(info) {
        var customer_id = info && info.customer && info.customer.id || '';
        if (!customer_id) {
            this.setState({
                customer_id: this.props.customer_id,
                customer_name: this.props.customer_name,
                sales_id: this.props.sales_id,
                sales_name: this.props.sales_name,
                sales_team_id: this.props.sales_team_id,
                sales_team_name: this.props.sales_team_name
            });
            return;
        }
        this.setState({
            customer_id: customer_id,
            customer_name: info && info.customer && info.customer.name || '',
            //销售id
            sales_id: info && info.sales && info.sales.id || '',
            //销售名称
            sales_name: info && info.sales && info.sales.name || '',
            //销售id
            sales_team_id: info && info.sales_team && info.sales_team.id || '',
            //销售名称
            sales_team_name: info && info.sales_team && info.sales_team.name || ''
        });
    }
    hideCustomerError() {
        this.setState({
            show_customer_error: false,
            submitType: '',
            error_message: ''
        });
    }
    toggleEdit = () => {
        this.setState({
            showEdit: !this.state.showEdit
        });
    }
    changeCustomerAjax(appUser) {
        this.setState({
            submitType: 'loading'
        });
        $.ajax({
            url: '/rest/appuser',
            dataType: 'json',
            contentType: 'application/json',
            type: 'put',
            data: JSON.stringify(appUser),
            success: (bool) => {
                if (bool === true) {
                    this.toggleEdit();
                    this.setState({
                        error_message: '',
                        submitType: 'success'
                    });
                    this.props.onChangeSuccess({
                        user_id: this.props.user_id,
                        customer_id: this.state.customer_id,
                        customer_name: this.state.customer_name,
                        sales_id: this.state.sales_id,
                        sales_name: this.state.sales_name,
                        sales_team_id: this.state.sales_team_id,
                        sales_team_name: this.state.sales_team_name
                    });
                } else {
                    this.setState({
                        error_message: Intl.get('common.edit.failed', '修改失败'),
                        submitType: 'error'
                    });
                }
            },
            error: (xhr) => {
                this.setState({
                    submitType: 'error',
                    error_message: xhr.responseJSON || Intl.get('common.edit.failed', '修改失败')
                });
            }
        });
    }
    submit() {
        if (this.state.submitType === 'loading') {
            return;
        }
        var $input = $('.ant-select-search__field', this.refs.wrap);
        var input_val = $input[0] && $input.val();
        if (input_val !== undefined) {
            if (!input_val) {
                this.setState({
                    customer_id: '',
                    customer_name: '',
                    sales_id: '',
                    sales_name: '',
                    sales_team_id: '',
                    sales_team_name: '',
                }, () => {
                    //要提交的数据
                    let appUser = {
                        user_id: this.props.user_id,
                        customer_id: this.state.customer_id
                    };
                    this.changeCustomerAjax(appUser);
                });
                return;
            } else if (input_val !== this.props.customer_name) {
                this.setState({
                    show_customer_error: true
                });
                return;
            }
        }
        //要提交的数据
        var appUser = {
            //用户id
            user_id: this.props.user_id,
            //客户id
            customer_id: this.state.customer_id
        };
        this.changeCustomerAjax(appUser);
    }
    render() {
        return (
            <DetailCard
                isEdit={this.state.showEdit}
                className="sales-team-container sales-editor"
                handleCancel={this.toggleEdit}
                handleSubmit={this.submit.bind(this)}
                loading={this.state.submitType === 'loading'}
                titleBottomBorderNone={true}
                title={
                    (
                        <div className="sales-team-show-block">
                            <div className="sales-team">
                                <span className="sales-team-label">{Intl.get('common.belong.customer', '所属客户')}:</span>
                                <span className="sales-team-text">
                                    {this.props.customer_name}
                                </span>
                                <DetailEditBtn
                                    title={Intl.get('common.edit', '编辑')}
                                    onClick={this.toggleEdit}
                                />
                            </div>
                        </div>
                    )
                }
                content={
                    <div className="sales-team-show-block">
                        {
                            this.state.showEdit ?
                                <div className="select_text_wrap" ref="wrap" style={{ display: 'block' }} id={USER_CUSTOMER_SUGGEST_ID}>
                                    <CustomerSuggest
                                        required={true}
                                        customer_id={this.props.customer_id}
                                        customer_name={this.props.customer_name}
                                        keyword={this.state.customer_name}
                                        onCustomerChoosen={this.onCustomerChoosen.bind(this)}
                                        show_error={this.state.show_customer_error}
                                        hideCustomerError={this.hideCustomerError.bind(this)}
                                        customerSuggestWrapId={USER_CUSTOMER_SUGGEST_ID}
                                    />
                                    <StatusWrapper
                                        errorMsg={this.state.error_message}
                                    />
                                </div> : <div className="sales-role">
                                    <span className="sales-team-label">{Intl.get('user.detail.belongTo', '归属')}:</span>
                                    <span className="sales-team-text">
                                        {this.props.sales_name} - {this.props.sales_team_name}
                                    </span>
                                </div>
                        }

                    </div>
                }
            />

        );
    }
}
UserBasicCard.propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    customer_id: PropTypes.string,
    customer_name: PropTypes.string,
    displayType: PropTypes.string,
    sales_id: PropTypes.string,
    sales_name: PropTypes.string,
    sales_team_id: PropTypes.string,
    sales_team_name: PropTypes.string,
    onChangeSuccess: PropTypes.func,
    user_id: PropTypes.string,
};
export default UserBasicCard;