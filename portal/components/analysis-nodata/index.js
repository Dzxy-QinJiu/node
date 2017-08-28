
var language = require("../../public/language/getLanguage");
if (language.lan() == "es" || language.lan() == "en") {
    require("./index-es_VE.scss");
}else if (language.lan() == "zh"){
    require("./index-zh_CN.scss");
}
var NoData = React.createClass({
    getDefaultProps : function() {
        return {
            msg : Intl.get("organization.no.realms", "还没有安全域诶...")
        };
    },
    render : function() {
        return (
            <div className="nodata-msg-block">
                <p>{this.props.msg}</p>
            </div>
        );
    }
});

module.exports = NoData;