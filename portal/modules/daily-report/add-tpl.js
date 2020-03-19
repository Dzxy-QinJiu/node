/**
 * 开启报告
 */

import { Radio } from 'antd';
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
        const { updateState, selectedTpl } = this.props;

        return (
            <div>
                {_.map(this.props.tplList, tpl => (
                    <DetailCard
                        title={tpl.name}
                        content={tpl.name}
                    />
                ))}
            </div>
        );
    }
}

export default AddTpl;
