/**
 * Created by hzl on 2019/12/31.
 */

import SelectFullWidth from '../select-fullwidth';
import classNames from 'classnames';
import { selectedAppEmitter } from 'PUB_DIR/sources/utils/emitters';

class SelectAppTerminal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            terminalType: '', // 终端类型
        };
    }

    changeTerminalType = (type) => {
        this.setState({
            terminalType: type
        });
    }

    componentDidMount() {
        selectedAppEmitter.on(selectedAppEmitter.CHANGE_SELECTED_APP, this.changeTerminalType);
    }

    componentWillUnmount() {
        selectedAppEmitter.removeListener(selectedAppEmitter.CHANGE_SELECTED_APP, this.changeTerminalType);
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
            <Option
                key={terminalType.id}
                value={ this.props.isNeedTerminalId ? terminalType.id : terminalType.code}
            > {terminalType.name} </Option>);
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
    className: '',
    isNeedTerminalId: false, // 是否需要多终端的id
};

SelectAppTerminal.propTypes = {
    handleSelectedTerminal: PropTypes.func,
    appTerminals: PropTypes.array,
    className: PropTypes.string,
    isNeedTerminalId: PropTypes.bool,
};

export default SelectAppTerminal;