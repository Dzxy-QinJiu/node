var history = require('../history');
var NotFound = React.createClass({
    componentWillMount: function() {
        history.replaceState(null,'/',{});
    },
    render: function() {
        return (
            <div></div>
        );
    }
});

module.exports = NotFound;