/**
 * 自适应高度计算高阶组件
 *
 * 用于在初次加载或窗口大小变化时计算被包裹组件里指定元素除去其上偏移和底边距后的高度
 *
 * 多与滚动条组件配合使用，计算滚动条组件外层容器的高度
 */

export default function(WrappedComponent, element, marginBottom = 10) {
    return class extends React.Component {
        state = {
            adaptiveHeight: 0
        }

        componentDidMount() {
            $(window).on('resize', this.onWindowResize);

            //该高阶组件装载完成时，其包裹的组件可能还没装载完成，因为窗口大小变化事件里要用到包裹的组件里的元素，所以加个延时，以便能找到需要的元素
            setTimeout(this.onWindowResize);
        }

        componentWillUnmount() {
            $(window).off('resize', this.onWindowResize);
        }

        onWindowResize = () => {
            const offsetTop = $(element).offset().top;
            const adaptiveHeight = $(window).height() - offsetTop - marginBottom;

            this.setState({ adaptiveHeight });
        }

        render() {
            return <WrappedComponent {...this.props} {...this.state} />;
        }
    };
}
