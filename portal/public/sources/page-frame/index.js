var language = require("../../../public/language/getLanguage");
import Trace from "LIB_DIR/trace";

if (language.lan() == "es" || language.lan() == "en") {
    require("./index-es_VE.scss");
} else if (language.lan() == "zh") {
    require("./index-zh_CN.scss");
}
require("./oplate");
var LeftMenu = require("../../../components/privilege/nav-sidebar");
var PageFrame = React.createClass({
    componentDidMount: function () {
        Trace.addEventListener(window, "click", Trace.eventHandler);
    },
    componentWillUnmount: function () {
        Trace.detachEventListener(window, "click", Trace.eventHandler);
    },
    render: function () {
        return (
            <div className="container-fluid">
                <div className="row">
                    <div className="col-xs-2">
                        <LeftMenu />
                    </div>
                    <div className="col-xs-10">
                        {this.props.children}
                    </div>
                </div>
            </div>
        );
    }
});

module.exports = PageFrame;
