import { Meteor } from 'meteor/meteor';
import React from 'react';
import { JRPropTypes } from '/imports/client/JRPropTypes.js';
import { HuntSignup } from '/imports/client/components/HuntSignup.jsx';
// TODO: ReactMeteorData

const HuntMembershipVerifier = React.createClass({
  mixins: [ReactMeteorData],

  contextTypes: {
    subs: JRPropTypes.subs,
  },

  propTypes: {
    huntId: React.PropTypes.string.isRequired,
  },

  getMeteorData() {
    const userHandle = this.context.subs.subscribe('huntMembership');
    if (!userHandle.ready()) {
      return {ready: false};
    }

    const user = Meteor.user();
    if (!user) {
      return {ready: false};
    }

    if (!_.contains(user.hunts, this.props.huntId)) {
      return {
        member: false,
        ready: true,
      };
    }

    return {ready: true, member: true};
  },

  render() {
    if (!this.data.ready) {
      return <span>loading...</span>;
    } else if (!this.data.member) {
      return <HuntSignup huntId={this.props.huntId}/>;
    } else {
      return React.Children.only(this.props.children);
    }
  },
});

export { HuntMembershipVerifier };
