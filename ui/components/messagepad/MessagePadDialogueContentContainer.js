import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import TimeAgo from 'timeago-react';
import moment from 'moment';
import 'jquery-scroll-lock';
import 'jquery.easing';

import i18n from 'vj/utils/i18n';
import Message from './MessageComponent';

const mapStateToProps = (state) => ({
  activeId: state.activeId,
  item: state.activeId !== null
    ? state.dialogues[state.activeId]
    : null,
});

@connect(mapStateToProps, null)
export default class MessagePadDialogueContentContainer extends React.PureComponent {
  componentDidMount() {
    $(this.refs.list).scrollLock({ strict: true });
  }

  UNSAFE_componentWillUpdate(nextProps) { // eslint-disable-line camelcase
    if (nextProps.activeId !== this.props.activeId) {
      this.scrollToBottom = true;
      this.scrollWithAnimation = false;
      return;
    }
    const node = this.refs.list;
    if (node.scrollTop + node.offsetHeight === node.scrollHeight) {
      this.scrollToBottom = true;
      this.scrollWithAnimation = true;
      return;
    }
    this.scrollToBottom = false;
  }

  componentDidUpdate() {
    if (this.scrollToBottom) {
      const node = this.refs.list;
      const targetScrollTop = node.scrollHeight - node.offsetHeight;
      if (this.scrollWithAnimation) {
        $(node).stop().animate({ scrollTop: targetScrollTop }, 200, 'easeOutCubic');
      } else {
        node.scrollTop = targetScrollTop;
      }
    }
  }

  renderInner() {
    if (this.props.activeId === null) {
      return [];
    }
    return _.map(this.props.item.reply, (reply, idx) => (
      <Message
        key={idx}
        isSelf={reply.from === UserContext._id}
        faceUrl={
          reply.from === this.props.item.from
            ? this.props.item.from_udoc.gravatar
            : this.props.item.to_udoc.gravatar
        }
      >
        <div>{reply.content}</div>
        <time data-tooltip={moment(reply.at).format('YYYY-MM-DD HH:mm:ss')}>
          <TimeAgo datetime={reply.at} locale={i18n('timeago_locale')} />
        </time>
      </Message>
    ));
  }

  render() {
    return (
      <ol className="messagepad__content" ref="list">
        {this.renderInner()}
      </ol>
    );
  }
}
