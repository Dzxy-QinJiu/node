/**
 * 开启报告
 */

import { Button } from 'antd';
import { VIEW_TYPE } from './consts';
import { getTplList } from './utils';
import DetailCard from 'CMP_DIR/detail-card';

class AddTpl extends React.Component {
    componentDidMount() {
        getTplList({
            callback: result => this.props.updateState({ tplList: result })
        });
    }

    render() {
        const { updateState, currentTpl } = this.props;

        return (
            <div>
                {_.map(this.props.tplList, tpl => (
                    <DetailCard
                        title={tpl.name}
                        content={this.renderCardContent(tpl)}
                    />
                ))}
            </div>
        );
    }

    renderCardContent(tpl) {
        const { updateState } = this.props;

        return (
            <div>
                <a href="javascript:void(0)" onClick={() => { updateState({ currentView: VIEW_TYPE.REPORT_FORM, currentTpl: tpl }); }}>查看</a>

                <Button
                    onClick={() => { updateState({ currentView: VIEW_TYPE.SET_RULE, currentTpl: tpl }); }}
                >
                    开启
                </Button>
            </div>
        );
    }
}

export default AddTpl;
