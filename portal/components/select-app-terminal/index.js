/**
 * Created by hzl on 2019/12/31.
 */

import SelectFullWidth from '../select-fullwidth';
import { Component } from 'React';
import classNames from 'classnames';

class SelectAppTerminal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            terminalType: '', // 终端类型
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
        let appTerminals = this.props.appTerminals;
        let appTerminalsOptions = _.map(appTerminals, terminalType =>
            <Option key={terminalType.id} value={terminalType.code}> {terminalType.name} </Option>);
        appTerminalsOptions.unshift(<Option value="" id="">{Intl.get('common.all.terminals', '所有終端')}</Option>);
        const cls = classNames('select-app-terminal-type', this.props.className);
        return (
            <SelectFullWidth
                className={cls}
                value={this.state.terminalType}
                onChange={this.onSelectTerminalsType}
            >
                {appTerminalsOptions}
            </SelectFullWidth>
        );
    }
}

SelectAppTerminal.defaultProps = {
    handleSelectedTerminal: function() {
    },
    appTerminals: [],
    className: ''
};

SelectAppTerminal.propTypes = {
    handleSelectedTerminal: PropTypes.func,
    appTerminals: PropTypes.array,
    className: PropTypes.string,
};

export default SelectAppTerminal;