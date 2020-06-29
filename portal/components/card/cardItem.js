/**
 * Created by wangliping on 2015/12/23.
 */
var React = require('react');


class CardItem extends React.Component {
    render() {
        var className = 'card-item';
        if (this.props.className) {
            className += ' ' + this.props.className;
        }
        return (
            <div className={className}>
                <span className="card-item-left"> {this.props.cardItem.label} </span>
                {this.props.noRihtValue ? null : (
                    <span className="card-item-right" title={this.props.cardItem.value}>
                        {this.props.cardItem.value}
                    </span>)}
            </div>
        );
    }
}

module.exports = CardItem;
