import {Form} from 'antd';
import CustomerSuggest from '../../../modules/app_user_manage/public/views/customer_suggest/customer_suggest';
const FormItem = Form.Item;

const UserCustomerSuggestField = {
    //获取“所属客户”输入框中的内容
    getCustomerInputValue() {
        var $search_input = $('.ant-select-search__field',this.refs.customer_searchbox);
        return $.trim($search_input.val());
    },
    renderUserCustomerSuggestBlock() {
        return (
            <div className="user-customer-suggestfield-block" ref="customer_searchbox">
                <FormItem
                    label=""
                    labelCol={{span: 0}}
                    wrapperCol={{span: 24}}
                >
                    <CustomerSuggest
                        required={false}
                        show_error={this.state.isShowCustomerError}
                        onCustomerChoosen={this.onCustomerChoosen}
                        hideCustomerError={this.hideCustomerError}
                    />
                </FormItem>
            </div>
        );
    }
};

export default UserCustomerSuggestField;