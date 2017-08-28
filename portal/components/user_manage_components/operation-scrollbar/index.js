/**
 ** 上一步、下一步 滚动条
 */
import GeminiScrollBar from '../../../components/react-gemini-scrollbar';
import OperationSteps from '../operation-steps';
import OperationStepsFooter from '../operation-steps-footer';
class StepScrollBar extends React.Component {
    render() {
        const divHeight = $(window).height() - OperationSteps.height - OperationStepsFooter.height;
        const props = this.props;
        const {children,...restProps} = props;
        return (
            <div style={{height:divHeight}} {...restProps}>
                <GeminiScrollBar>
                    {children}
                </GeminiScrollBar>
            </div>
        );
    }
}

export default StepScrollBar;