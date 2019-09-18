class CardItem extends React.Component {
    render() {
        return (
            <div className="card-item">
                <span className="card-item-left"> {this.props.cardItem.label} </span>
                <span className="card-item-right" title={this.props.cardItem.value}>
                    {this.props.cardItem.value}
                </span>
            </div>
        );
    }
}

CardItem.propTypes = {
    cardItem: PropTypes.obj
};

module.exports = CardItem;
