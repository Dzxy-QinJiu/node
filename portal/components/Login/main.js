import "./style.less";
var LoginDetail = require("./LoginDetail");

class LoginMain extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <LoginDetail/>
        );
    }
}
module.exports = LoginMain;
