var React = require('react');

  class Bundle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mod: null
        };
    }
    //加载文件
    load = props => {
        this.setState({
            mod: null
        });
        props.load().then((mod) => {
            this.setState({
                mod: mod ? mod.default : null
            });
        });
    }

    componentWillMount() {
        this.load(this.props);
    }

    render() {
        return this.state.mod ? this.props.children(this.state.mod) : null;
    }
}
export default Bundle;