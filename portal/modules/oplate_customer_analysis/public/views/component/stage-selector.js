import { Spin, Alert } from 'antd';
import { AntcSelect } from 'antc';
const Option = AntcSelect.Option;
const STAGES = [
    Intl.get('oplate_customer_analysis.allLabel', '全部标签'), 
    Intl.get('sales.stage.message', '信息'),
    Intl.get('sales.stage.intention', '意向'),
    Intl.get('common.trial', '试用'),
    Intl.get('common.trial.qualified', '试用合格'),
    Intl.get('sales.stage.signed', '签约'),
    Intl.get('contract.163', '续约'),
    Intl.get('sales.stage.lost', '流失')
];
class StageSelector extends React.Component {
    constructor(props) {
        super();
        this.state = {
            selectedStage: Intl.get('oplate_customer_analysis.allLabel', '全部标签')
        };
    }
    handleSelect = value => {        
        this.setState({
            selectedStage: value
        }, () => {
            if (value == Intl.get('oplate_customer_analysis.allLabel', '全部标签')) {
                value = '';
            }
            this.props.onChange(value);
        });
    }
    render() {
        const options = STAGES.map((x, idx) => (
            <Option key={idx} value={x}>{x}</Option>
        ));
        return (
            <AntcSelect
                value={this.state.selectedStage}
                dropdownMatchSelectWidth={false}
                onChange={this.handleSelect}
            >
                {options}
            </AntcSelect>
        );
    }
}
export default StageSelector;