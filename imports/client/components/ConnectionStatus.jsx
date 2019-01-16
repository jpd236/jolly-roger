import { Meteor } from 'meteor/meteor';
import React from 'react';
import PropTypes from 'prop-types';
import Alert from 'react-bootstrap/lib/Alert';
import Button from 'react-bootstrap/lib/Button';
import { withTracker } from 'meteor/react-meteor-data';
import Ansible from '../../ansible';

class ConnectionStatus extends React.Component {
  static propTypes = {
    meteorStatus: PropTypes.object,
  };

  refresh() {
    // Mark this timeout as completed
    if (this.timeoutId) {
      this.timeoutId = undefined;
    }
    this.forceUpdate();
  }

  render() {
    switch (this.props.meteorStatus.status) {
      case 'connecting':
        return (
          <Alert bsStyle="warning">
            Trying to reconnect to Jolly Roger...
          </Alert>
        );
      case 'failed':
        return (
          <Alert bsStyle="danger">
            <strong>Oh no!</strong>
            {' '}
            Unable to connect to Jolly Roger:
            {this.props.meteorStatus.reason}
          </Alert>
        );
      case 'waiting': {
        const now = Date.now();
        const timeToRetry = Math.ceil((this.props.meteorStatus.retryTime - now) / 1000);

        // If we have no refresh scheduled yet, trigger a refresh in a second.
        if (this.timeoutId === undefined) {
          this.timeoutId = window.setTimeout(() => this.refresh(), 1000);
        }
        return (
          <Alert bsStyle="warning">
            We can&apos;t connect to Jolly Roger right now. We&apos;ll try again in
            {' '}
            {timeToRetry}
            s. Your pending changes will be pushed to the server when we reconnect.
            {' '}
            <Button bsStyle="link" onClick={Meteor.reconnect}>retry now</Button>
          </Alert>
        );
      }
      case 'offline':
        return (
          <Alert bsStyle="warning">
            <strong>Warning!</strong>
            {' '}
            Currently not connected to Jolly Roger server. Changes will be synced when you
            reconnect.
            <Button bsStyle="link" onClick={Meteor.reconnect}>reconnect now</Button>
          </Alert>
        );
      case 'connected':
        return null;
      default:
        Ansible.warn('Unknown connection status', { state: this.props.meteorStatus.status });
        return null;
    }
  }
}

export default withTracker(() => {
  return { meteorStatus: Meteor.status() };
})(ConnectionStatus);
