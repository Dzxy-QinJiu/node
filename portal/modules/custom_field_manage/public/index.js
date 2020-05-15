/**
 * Created by hzl on 2020/5/14.
 */

require('./css/index.less');

class CustomFieldManage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div
                className="custom-field-manage-wrap"
                data-tracename="字段管理"
            >
                <div className="custom-field-content-wrap">
                    内容区域
                </div>
            </div>
        );
    }
}

export default CustomFieldManage;
