require("./index.less");
import classNames from 'classnames';
import {Icon,Alert} from 'antd';
import CustomerSuggest from '../../../modules/app_user_manage/public/views/customer_suggest/customer_suggest';
import AlertTimer from '../../alert-timer';
import {hasPrivilege} from '../../privilege/checker';

const PropTypes = React.PropTypes;
//class的前缀
const CLASS_PREFIX = "user-customer";
//空函数
function noop(){}
/**
 * 用户属于选择器
 *
 * <UserCustomer
 *    customer_id=""
 *    customer_name=""
 * />
 */

class UserCustomer extends React.Component{
    constructor(props){
        super(props);
        this.componentId = _.uniqueId("UserCustomer");
        this.state = {
            //客户id
            customer_id : this.props.customer_id,
            //客户名称
            customer_name : this.props.customer_name,
            //是显示文字text，还是显示操作区select
            displayType : this.props.displayType,
            //提交状态
            submitType : '',
            //错误信息
            error_message : '',
            //销售id
            sales_id : this.props.sales_id,
            //销售名称
            sales_name : this.props.sales_name,
            //销售id
            sales_team_id : this.props.sales_team_id,
            //销售名称
            sales_team_name : this.props.sales_team_name
        };
    }
    componentWillReceiveProps(nextProps){
        //外层传进来新的客户、销售、销售团队数据的时候，更新这些字段
        var propList = [
            "customer_id",
            "customer_name",
            "sales_id",
            "sales_name",
            "sales_team_id",
            "sales_team_name"
        ];
        const newState = {};
        _.each(propList , (prop) => {
            if(this.props[prop] != nextProps[prop]) {
                newState[prop] = nextProps[prop];
            }
        });
        if(!_.isEmpty(newState)) {
            this.setState(newState);
        }
    }
    componentWillUnmount() {
        if(this.bodyClickFunc) {
            $('body').off('mousedown' , this.bodyClickFunc);
        }
    }
    onCustomerChoosen(info){
        var customer_id = info && info.customer && info.customer.id || '';
        if(!customer_id) {
            this.setState({
                customer_id : this.props.customer_id,
                customer_name : this.props.customer_name,
                sales_id : this.props.sales_id,
                sales_name : this.props.sales_name,
                sales_team_id : this.props.sales_team_id,
                sales_team_name : this.props.sales_team_name
            });
            return;
        }
        this.setState({
            customer_id : customer_id,
            customer_name : info && info.customer && info.customer.name || '',
            //销售id
            sales_id : info && info.sales && info.sales.id || '',
            //销售名称
            sales_name : info && info.sales && info.sales.name || '',
            //销售id
            sales_team_id : info && info.sales_team && info.sales_team.id || '',
            //销售名称
            sales_team_name : info && info.sales_team && info.sales_team.name || ''
        });
    }
    renderCustomerBlock() {
        return (
            <div className="select_text_wrap" style={{display : 'block'}}>
                <CustomerSuggest
                    required={true}
                    customer_id={this.state.customer_id}
                    customer_name={this.state.customer_name}
                    keyword={this.state.customer_name}
                    onCustomerChoosen={this.onCustomerChoosen.bind(this)}
                    show_error={this.state.show_customer_error}
                    hideCustomerError={this.hideCustomerError.bind(this)}
                />
            </div>
        );
    }
    hideCustomerError() {
        this.setState({
            show_customer_error : false,
            submitType : "",
            error_message : ''
        });
    }
    changeDisplayType(type) {
        if(this.state.submitType === 'loading') {
            return;
        }
        this.setState({
            displayType : type
        });
        if(type === 'text') {
            this.setState({
                error_message : '',
                submitType : '',
                show_customer_error : false,
                customer_id : this.props.customer_id,
                customer_name : this.props.customer_name
            });
            this.onCustomerChoosen();
        }
    }
    submit() {
        if(this.state.submitType === 'loading') {
            return;
        }
        var $input = $(".ant-select-search__field",this.refs.wrap);
        var input_val = $input[0] && $input.val();
        if(input_val !== undefined) {
            if(!input_val) {
                this.state.customer_id = '';
                this.state.customer_name = '';
                this.state.sales_id = '';
                this.state.sales_name = '';
                this.state.sales_team_id = '';
                this.state.sales_team_name = '';
            } else if(input_val !== this.props.customer_name) {
                this.setState({
                    show_customer_error : true
                });
                return;
            }
        }
        //要提交的数据
        var appUser = {
            //用户id
            user_id : this.props.user_id,
            //客户id
            customer_id : this.state.customer_id
        };
        var _this = this;
        this.setState({
            submitType : 'loading'
        });
        $.ajax({
            url: '/rest/appuser',
            dataType: 'json',
            contentType: 'application/json',
            type: 'put',
            data: JSON.stringify(appUser),
            success: function(bool) {
                if(bool === true) {
                    _this.setState({
                        error_message : '',
                        submitType : 'success'
                    });
                    _this.props.onChangeSuccess({
                        user_id : _this.props.user_id,
                        customer_id : _this.state.customer_id ,
                        customer_name : _this.state.customer_name,
                        sales_id : _this.state.sales_id,
                        sales_name : _this.state.sales_name,
                        sales_team_id : _this.state.sales_team_id,
                        sales_team_name : _this.state.sales_team_name
                    });
                } else {
                    _this.setState({
                        error_message : Intl.get("common.edit.failed", "修改失败"),
                        submitType : 'error'
                    });
                }
            },
            error: function(xhr) {
                _this.setState({
                    submitType : 'error',
                    error_message : xhr.responseJSON || Intl.get("common.edit.failed", "修改失败")
                });
            }
        });
    }
    renderIndicator() {
        if(this.state.submitType === 'loading') {
            return (<Icon type="loading" />);
        }
        var _this = this;
        var onSuccessHide = function() {
            _this.setState({
                submitType : '',
                displayType : 'text'
            });
        };
        if(this.state.submitType === 'success') {
            return <AlertTimer message={Intl.get("user.edit.success", "修改成功")} type="success" onHide={onSuccessHide} showIcon/>;
        }
        if(this.state.submitType === 'error') {
            return <Alert message={this.state.error_message} type="error" showIcon/>;
        }
    }
    renderUserCustomer() {
        const props = this.props;
        const {customer_id,customer_name,onChangeSuccess,children,className,displayType,user_id,...restProps} = props;

        if(this.state.displayType === 'text') {
            //有修改用户的权限或者有修改用户所属客户的权限，并且有查询客户列表的权限时，才可以修改用户的所属客户
            var canEdit = (hasPrivilege("APP_USER_EDIT")||hasPrivilege("CHANGE_USER_CUSTOMER")) && hasPrivilege("CRM_LIST_CUSTOMERS");
            return (
                <div className="user-basic-edit-field">
                    <span>{this.props.customer_name}</span>
                    {
                        canEdit ? <i className="iconfont icon-update"
                            onClick={this.changeDisplayType.bind(this,"select")}></i> : null
                    }
                </div>
            );
        }

        const cls = classNames(CLASS_PREFIX , className);

        const showBtnBool = !/success/.test(this.state.submitType);

        return (
            <div className={cls} {...restProps} ref="wrap">
                {this.renderCustomerBlock()}
                {showBtnBool ? <span className="iconfont icon-choose" onClick={this.submit.bind(this)}></span> : null}
                {showBtnBool ? <span className="iconfont icon-close" onClick={this.changeDisplayType.bind(this , "text")}></span> : null}
                {this.renderIndicator()}
            </div>
        );
    }
    render(){
        return (
            <div>
                {
                    this.state.sales_team_name ? (
                        <dl className="dl-horizontal user_detail_item detail_item">
                            <dt><ReactIntl.FormattedMessage id="user.sales.team" defaultMessage="销售团队" /></dt>
                            <dd>{this.state.sales_team_name}</dd>
                        </dl>
                    ) : null
                }
                {
                    this.state.sales_name ? (
                        <dl className="dl-horizontal user_detail_item detail_item">
                            <dt><ReactIntl.FormattedMessage id="user.salesman" defaultMessage="销售人员" /></dt>
                            <dd>{this.state.sales_name}</dd>
                        </dl>
                    ) : null
                }
                <dl className="dl-horizontal user_detail_item  detail_item">
                    <dt>
                        {Intl.get("call.record.customer","客户")}
                    </dt>
                    <dd>
                        {this.renderUserCustomer()}
                    </dd>
                </dl>
            </div>
        );
    }
}

/**
 * 获取默认属性
 */
function getDefaultProps(){
    //客户id
    const customer_id = "";
    //客户name
    const customer_name = "";
    //保存成功的处理函数
    const onChangeSuccess = noop;
    //class名
    const className = "";
    //显示类型
    const displayType = "text";
    //用户id
    const user_id = "";
    return {customer_id,customer_name,onChangeSuccess,className,displayType,user_id};
}

//默认属性
UserCustomer.defaultProps = getDefaultProps();
//属性类型
UserCustomer.propTypes = {
    //客户id
    customer_id : PropTypes.string,
    //客户name
    range : PropTypes.string,
    //成功更改关联关系触发
    onChangeSuccess : PropTypes.func,
    //class名
    className : PropTypes.string,
    //显示文字还是操作区
    displayType : PropTypes.string
};

export default UserCustomer;