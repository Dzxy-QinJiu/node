/**
 * Copyright (c) 2018-2019 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2019 山东客套智能科技有限公司。保留所有权利。
 * Created by tangmaoqin on 2020/03/17.
 */
import './css/emotion-marquee.less';
import classNames from 'classnames';

class EmotionMarquee extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentNumber: 1,
            marqueeChildren: [],
            marqueeStyle: {
                'padding-top:': 0,
                'padding-bottom': '30px'
            },
            btnWidth: 0,
            btnStyle: {},
            leftEnd: false,
            rightEnd: false,
            canAnimate: true
        };
    }

    isOnece = null;

    componentDidMount() {
        this.initCurrentKey();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.isOnece) return;
        this.initCurrentKey();
    }

    componentWillUnmount() { this.isOnece = null; }

    initCurrentKey() {
        if (_.get(this.props.children, '[0]')) {
            this.isOnece = true;
            let newState = {};
            let firstKey = _.get(this.props.children[0],'props.key', 1);
            newState.currentNumber = this.state.activeNumber || firstKey;
            this.setState(newState, () => {
                this.initSlideComponent();
            });
        }

    }

    initSlideComponent() {
        let newState = {
            marqueeChildren: []
        };
        React.Children.forEach(this.props.children,(item) => {
            newState.marqueeChildren.push(item);
        });
        newState.leftEnd = false;
        newState.rightEnd = false;
        if (this.state.currentNumber <= 1) {
            newState.leftEnd = true;
        }
        if (this.state.currentNumber >= newState.marqueeChildren.length) {
            newState.rightEnd = true;
        }
        newState.btnWidth = newState.marqueeChildren.length * 30;
        this.setState(newState);
    }

    handleSlideClick(key) {
        let {marqueeChildren, currentNumber, canAnimate} = this.state;
        if (marqueeChildren.length <= 0) {
            return;
        }
        if (key <= 0 || key > marqueeChildren.length || key === currentNumber || !canAnimate) return;
        let newState = {};
        newState.canAnimate = false;
        newState.leftEnd = false;
        newState.rightEnd = false;
        if (key === 1) {
            newState.leftEnd = true;
        } else if (key === marqueeChildren.length) {
            newState.rightEnd = true;
        }
        this.setState(newState,() => {
            if (key > currentNumber) {
                this.slideAnimate(key, 'right');
            } else {
                this.slideAnimate(key, 'left');
            }
        });
    }

    slideAnimate(key, type) {
        let $this = $(this.refs.marqueeBody);
        let $next, $self;
        this.state.marqueeChildren.forEach(item => {
            if (item.props.key === key) {
                $next = $(ReactDOM.findDOMNode(item));
            }
            if (item.props.key === this.currentNumber) {
                $self = $(ReactDOM.findDOMNode(item));
            }
        });
        if (type === 'left') {
            $next.css({
                'left': '-100%',
                'display': 'block'
            });
            $this.addClass('can-transition').one('webkitTransitionEnd', () => {
                $this.removeClass('can-transition').css('left', 0);
                $next.css('left', 0);
                $self.css('display', 'none');
                this.setState({
                    currentNumber: key,
                    canAnimate: true
                });
            }).css('left', '100%');
        } else if (type === 'right') {
            $next.css({
                'left': '100%',
                'display': 'block'
            });
            $this.addClass('can-transition').one('webkitTransitionEnd', () => {
                $this.removeClass('can-transition').css('left', 0);
                $next.css('left', 0);
                $self.css('display', 'none');
                this.setState({
                    currentNumber: key,
                    canAnimate: true
                });
            }).css('left', '-100%');
        }
    }

    render() {
        return (
            <div className="emotion-marquee">
                <div className="marquee">
                    <div className="inner-marquee">
                        <div className="marquee-body" ref="marqueeBody">
                            {this.props.children}
                        </div>
                    </div>
                </div>
                <div className="btns">
                    <div className="inner-btns" style={{width: this.state.btnWidth}}>
                        {this.state.marqueeChildren.map((item, index) => {
                            let cls = classNames('switch-btn', {
                                'active': item.props.key === this.state.currentNumber
                            });
                            return (
                                <div key={index} className={cls} onClick={this.handleSlideClick.bind(this, item.props.key)}>
                                    <div className="btn-border"/>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }
}

EmotionMarquee.defaultProp = {
    height: 0,
    // 选传属性，默认显示第几页，默认值为1
    activeNumber: 1
};
EmotionMarquee.propTypes = {
    children: PropTypes.element,
    height: PropTypes.number,
    activeNumber: PropTypes.number
};
export default EmotionMarquee;