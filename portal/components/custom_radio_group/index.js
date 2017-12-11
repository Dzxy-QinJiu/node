require("./index.less");

var CustomRadioGroup = React.createClass({
    getDefaultProps : function() {
        return {
            options : [],
            extraData : {},
            value : "",
            marginRight : 30,
            padding:14,
            onChange : function() {},
            onClick : function() {}
        };
    },
    getInitialState : function() {
        var value = this.props.value;
        return {
            value : value
        };
    },
    componentWillReceiveProps: function (nextProps) {
        this.setState({
            value:nextProps.value
        });
    },
    onClickRadio : function(value , name) {
        this.props.onClick(value,name,this.props.extraData);
        this.props.onChange(value,name,this.props.extraData);
        this.setState({
            value : value
        });
    },
    render : function() {
        var _this = this;
        var value = this.state.value;
        var props = this.props;
        return (
            <div className="custom_radio_group">
                {
                    this.props.options.map(function(option) {
                        var cls = "custom_radio";
                        if(value == option.value) {
                            cls += " custom_radio_active";
                        }
                        return (
                            <div className={cls} style={{marginRight:props.marginRight,paddingLeft:props.padding,paddingRight:props.padding}} onClick={_this.onClickRadio.bind(_this , option.value , option.name)} key={option.value}>
                                {option.name}
                            </div>
                        );
                    })
                }
            </div>
        );
    }
});

module.exports = CustomRadioGroup;