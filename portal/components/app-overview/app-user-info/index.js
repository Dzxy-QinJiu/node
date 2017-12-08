/**
 *  应用概览页总体统计的组件(顶部组件)
 * */
require('./index.less');
class AppUserInfo extends React.Component {
    constructor(props) {
        super(props);
    }
    // 处理数字的显示方式
    handleNumberShow(number) {
        let num = (number || 0).toString(), result = '';
        while (num.length > 3) {
            result = ',' + num.slice(-3) + result;
            num = num.slice(0, num.length - 3);
        }
        if (num) {
            result = num + result;
        }
        return result;
    }

    render() {
        return (
            <div className="app-user-info">
                <div className="total-title">
                    {this.props.title}
                    {this.props.viewDetail ? (<span className="view-detail" onClick={this.props.viewDetail}>查看详情</span>) : null}
                </div>
                <div className="total-content">
                    {this.props.content.map( (item) => {
                        return <div className="app-content">
                            <span className="app-number">{this.handleNumberShow(item.count)}</span>
                            <span className="app-type">{item.name}</span>
                        </div>
                    })}
                </div>
            </div>
        )
    }
}

export default AppUserInfo;