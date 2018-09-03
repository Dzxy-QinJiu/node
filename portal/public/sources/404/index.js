var React = require('react');
var history = require('../history');

class NotFound extends React.Component {
    componentWillMount() {
        history.replace('/',{});
    }

    render() {
        return (
            <div></div>
        );
    }
}

module.exports = NotFound;
