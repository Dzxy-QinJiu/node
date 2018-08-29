var React = require('react');

class LogOut extends React.Component {
    render() {
        return (
            // <a href="/logout" className="logout">退出&nbsp;&nbsp;&nbsp;<i className="iconfont">&#xe602;</i></a>
            <a href="/logout" className="logout">
                <ReactIntl.FormattedMessage id="login.logout" defaultMessage="退出"/>
            </a>
            //<Link className="logout" to="/logout">退出</Link>
        );
    }
}

module.exports = LogOut;

