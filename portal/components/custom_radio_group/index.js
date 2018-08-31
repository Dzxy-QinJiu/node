var React = require('react');
require('./index.less');

class CustomRadioGroup extends React.Component {
    static defaultProps = {
        options: [],
        extraData: {},
        value: '',
        marginRight: 30,
        padding: 14,
        onChange: function() {},
        onClick: function() {}
    };

    constructor(props) {
        super(props);
        var value = props.value;

        this.state = {
            value: value
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            value: nextProps.value
        });
    }

    onClickRadio = (value, name) => {
        this.props.onClick(value,name,this.props.extraData);
        this.props.onChange(value,name,this.props.extraData);
        this.setState({
            value: value
        });
    };

    render() {
        var _this = this;
        var value = this.state.value;
        var props = this.props;
        return (
            <div className="custom_radio_group">
                {
                    this.props.options.map(function(option) {
                        var cls = 'custom_radio';
                        if(value == option.value) {
                            cls += ' custom_radio_active';
                        }
                        return (
                            <div className={cls} style={{marginRight: props.marginRight,paddingLeft: props.padding,paddingRight: props.padding}} onClick={_this.onClickRadio.bind(_this , option.value , option.name)} key={option.value}>
                                {option.name}
                            </div>
                        );
                    })
                }
            </div>
        );
    }
}

module.exports = CustomRadioGroup;
