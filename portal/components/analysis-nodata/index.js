
var React = require('react');
var language = require('../../public/language/getLanguage');
if (language.lan() == 'es' || language.lan() == 'en') {
    require('./index-es_VE.less');
}else if (language.lan() == 'zh'){
    require('./index-zh_CN.less');
}

class NoData extends React.Component {
    static defaultProps = {
        msg: Intl.get('organization.no.realms', '还没有安全域诶...')
    };

    render() {
        return (
            <div className="nodata-msg-block">
                <p>{this.props.msg}</p>
            </div>
        );
    }
}

module.exports = NoData;
