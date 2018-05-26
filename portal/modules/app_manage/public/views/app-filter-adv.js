import { Button, Icon } from "antd";

var DEFAULT_TAG = Intl.get("common.all", "全部");
var ENABLE_DESC = Intl.get("app.filter.status.enable", "可用"), DISABLE_DESC = Intl.get("common.disabled", "禁用"), ENABLE = "enable", DISABLE = "disable";
var statusArray = [DEFAULT_TAG, ENABLE_DESC, DISABLE_DESC];
var AppFilterAdv = React.createClass({
    tagSelected: function(tag) {
        if (tag && tag != this.props.selectTag) {
            //标签筛选
            this.props.filterAppByTags(tag);
        }
    },
    statusSelected: function(status) {
        if (status != this.props.selectStatus) {
            //状态筛选
            this.props.filterAppByStatus(status);
        }
    },
    getTagListJsx: function() {
        const tagList = $.extend(true, [], this.props.appTagList), tagObj = this.props.appTagObj;
        tagList.unshift(DEFAULT_TAG);
        tagObj[DEFAULT_TAG] = this.props.allAppTotal;
        return tagList.map((tag, idx) => {
            let className = this.props.selectTag == tag ? "selected" : "";
            return (<li key={idx} onClick={this.tagSelected.bind(this, tag)}
                className={className}>
                <span className="tag-name">{tag}</span>
                <span className="tag-count">{tagObj[tag]}</span>
            </li>);
        });
    },
    getStatusListJsx: function() {
        const _this = this;
        return statusArray.map((status, idx) => {
            //     status       状态筛选描述：全部、可用、禁用
            var statusKey = "";//状态筛选的key："",enable,disable
            var statusCount = _this.props.allAppTotal;//默认：全部应用的个数
            //通过将描述对应的key，获取状态对应的应用个数
            if (status == ENABLE_DESC) {
                statusKey = ENABLE;
            } else if (status == DISABLE_DESC) {
                statusKey = DISABLE;
            }
            if (statusKey) {
                statusCount = _this.props.appStatusObj[statusKey];
            }
            let className = this.props.selectStatus == statusKey ? "selected" : "";
            return (<li key={idx} onClick={this.statusSelected.bind(this, statusKey)}
                className={className}>
                <span className="tag-name">{status}</span>
                <span className="tag-count">{statusCount}</span>
            </li>);
        });
    },
    render: function() {
        const tagList = $.extend(true, [], this.props.appTagList), tagObj = this.props.appTagObj;
        tagList.unshift(DEFAULT_TAG);
        const tagListJsx = tagList.map((tag, idx) => {
            let className = this.props.selectTag == tag ? "selected" : "";
            return (<li key={idx} onClick={this.tagSelected.bind(this, tag)}
                className={className}>
                <span className="tag-name">{tag}</span>
                <span className="tag-count">{tagObj[tag]}</span>
            </li>);
        });

        return (
            <div className="app-filter-adv" style={{display:this.props.isFilterPanelShow ? "block" : "none"}}>
                <dl>
                    <dt>{Intl.get("common.tag", "标签")}:</dt>
                    <dd>
                        <ul>{this.getTagListJsx()}</ul>
                    </dd>
                </dl>
                <dl>
                    <dt>{Intl.get("common.status", "状态")}:</dt>
                    <dd>
                        <ul>{this.getStatusListJsx()}</ul>
                    </dd>
                </dl>

            </div>
        );
    }
})
    ;

module.exports = AppFilterAdv;
