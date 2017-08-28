/**
 * Created by wangliping on 2015/12/23.
 */
import {Icon} from "antd";

var CardItem = React.createClass({

    render: function () {
        var className = "card-item";
        if (this.props.className) {
            className += " " + this.props.className;
        }
        return (
            <div className={className}>
                <span className="card-item-left"> {this.props.cardItem.label} </span>
                {this.props.noRihtValue ? null : (
                    <span className="card-item-right" title={this.props.cardItem.value}>
                        {this.props.cardItem.value}
                    </span>)}
                {this.props.hasRefreshBtn ? (
                    <a className="refresh-app-secret"
                       onClick={this.props.refreshAppSecret}>
                        {Intl.get("common.refresh", "刷新")} {this.props.appSecretRefreshing ? (<Icon type="loading"/>) : null}</a>
                ) : null}
            </div>
        );
    } 
});

module.exports = CardItem;