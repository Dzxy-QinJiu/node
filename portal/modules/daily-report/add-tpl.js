/**
 * 添加汇报模板
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';

class AddTpl extends React.Component {
    state = {
        currentView: VIEW_TYPE.ADD_TPL,
    }

    render() {
        return (
            <div>
                两步即可实现汇总和查看销售日常工作情况
                <Button
                    onClick={() => { this.props.changeView(VIEW_TYPE.ADD_NEW_TPL); }}
                >
                    添加新模板
                </Button>
                <Button
                    onClick={() => { this.props.changeView(VIEW_TYPE.EDIT_TPL); }}
                >
                    编辑模板
                </Button>
                <Button
                    onClick={() => { this.props.changeView(VIEW_TYPE.SET_RULE); }}
                >
                    下一步
                </Button>
            </div>
        );
    }
}

export default AddTpl;
