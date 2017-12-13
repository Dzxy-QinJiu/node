import "./style.less";
var LoginForm = require("./login-form");

class LoginMain extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <LoginForm/>
        );
    }
}
module.exports = LoginMain;
