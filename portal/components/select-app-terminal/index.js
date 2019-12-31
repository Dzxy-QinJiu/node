/**
 * Created by hzl on 2019/12/31.
 */

import SelectFullWidth from '../select-fullwidth';
import { Component } from 'React';

class SelectAppTerminal extends Component {
    constructor(prop) {
        super(prop);
        this.state = {
            terminalType: '', // 终端类型
            selectAppTerminals: props.selectAppTerminals
        };
    }

    // 筛选终端类型
    onSelectTerminalsType = (value) => {
        this.setState({
            terminalType: value
        });
        this.props.handleSelectedTerminal(value);
    };
    
    render() {
        let selectAppTerminals = this.state.selectAppTerminals;
        let appTerminals = _.map(selectAppTerminals, terminalType =>
            <Option key={terminalType.id} value={terminalType.code}> {terminalType.name} </Option>);
        appTerminals.unshift(<Option value="" id="">{Intl.get('common.all.terminals', '所有終端')}</Option>);
        return (
            <SelectFullWidth
                className="select-app-terminal-type"
                value={this.state.terminalType}
                onChange={this.onSelectTerminalsType}
            >
                {appTerminals}
            </SelectFullWidth>
        );
    }
}

SelectAppTerminal.propTypes = {
    handleSelectedTerminal: PropTypes.func,
    selectAppTerminals: PropTypes.array
};

export default SelectAppTerminal;