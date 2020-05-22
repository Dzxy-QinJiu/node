/**
 * onChange 选择行业后调用，会传入选择的行业名
 */
const crmAjax = require('MOD_DIR/crm/public/ajax');
import { Spin, Alert } from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const defualtValueObj = {
    industry: Intl.get('oplate_customer_analysis.allIndustries', '全部行业')
};
class IndustrySelector extends React.Component {
    constructor(props) {
        super();
        this.state = {
            loading: false,
            data: [],
            errorMsg: '',
            selectedValue: defualtValueObj.industry
        };
    }
    componentDidMount() {
        this.getIndustry();
    }
    handleSelect(value) {
        this.setState({
            selectedValue: value
        }, () => {
            if (value == defualtValueObj.industry) {
                value = null;
            }
            this.props.onChange(value);
        });
    }
    getIndustry=() => {
        this.setState({
            loading: true
        }, () => {
            crmAjax.getIndustries()
                .then(data => {
                    this.setState({
                        loading: false,
                        data: data,
                    });
                }).fail(err => {
                    this.setState({
                        loading: false,
                        errorMsg: Intl.get('errorcode.118', '获取数据失败')
                    });
                });
        });
    }
    render() {
        const { loading, errorMsg } = this.state;
        let data = this.state.data;
        data.unshift(defualtValueObj);
        const list = data.map((x, idx) => (
            <Option key={idx} value={x.industry}>{x.industry}</Option>
        ));
        if (loading) {
            return (
                <Spin size="small"/>
            );
        }
        if (!loading && !errorMsg) {
            return (
                <AntcSelect
                    value={this.state.selectedValue}
                    onChange={this.handleSelect.bind(this)}
                    dropdownMatchSelectWidth={false}
                >
                    {list}
                </AntcSelect>
            );
        }
        if (errorMsg) {
            return (
                <Alert message={errorMsg} type="error" showIcon />
            );
        }
    }
}
export default IndustrySelector;