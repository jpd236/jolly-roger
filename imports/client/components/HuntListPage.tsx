import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/nicolaslopezj:roles';
import { withTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';
import { faEdit, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Col from 'react-bootstrap/Col';
import FormCheck from 'react-bootstrap/FormCheck';
import FormControl, { FormControlProps } from 'react-bootstrap/FormControl';
import FormGroup from 'react-bootstrap/FormGroup';
import FormLabel from 'react-bootstrap/FormLabel';
import FormText from 'react-bootstrap/FormText';
import Row from 'react-bootstrap/Row';
import { withBreadcrumb } from 'react-breadcrumbs-context';
import { Link } from 'react-router-dom';
import Ansible from '../../ansible';
import Hunts from '../../lib/models/hunts';
import { HuntType } from '../../lib/schemas/hunts';
import ModalForm from './ModalForm';

/* eslint-disable max-len */

const splitLists = function (lists: string): string[] {
  const strippedLists = lists.trim();
  if (strippedLists === '') {
    return [];
  }

  return strippedLists.split(/[, ]+/);
};

export interface HuntModalSubmit {
  // eslint-disable-next-line no-restricted-globals
  name: string;
  mailingLists: string[];
  signupMessage: string;
  openSignups: boolean;
  hasGuessQueue: boolean;
  homepageUrl: string;
  submitTemplate: string;
}

interface HuntModalFormProps {
  hunt?: HuntType;
  onSubmit: (state: HuntModalSubmit, callback: (error?: Error) => void) => void;
}

enum HuntModalFormSubmitState {
  IDLE = 'idle',
  SUBMITTING = 'submitting',
  FAILED = 'failed',
}

type HuntModalFormState = {
  submitState: HuntModalFormSubmitState;
  errorMessage: string;
  mailingLists: string;
} & Pick<HuntModalSubmit, Exclude<keyof HuntModalSubmit, 'mailingLists'>>

class HuntModalForm extends React.Component<HuntModalFormProps, HuntModalFormState> {
  private formRef: React.RefObject<ModalForm>;

  constructor(props: HuntModalFormProps, context?: any) {
    super(props, context);
    this.state = this.initialState();
    this.formRef = React.createRef();
  }

  initialState = (): HuntModalFormState => {
    const state = {
      submitState: HuntModalFormSubmitState.IDLE,
      errorMessage: '',
    };
    if (this.props.hunt) {
      return Object.assign(state, {
        name: this.props.hunt.name || '',
        mailingLists: this.props.hunt.mailingLists.join(', ') || '',
        signupMessage: this.props.hunt.signupMessage || '',
        openSignups: this.props.hunt.openSignups || false,
        hasGuessQueue: !!this.props.hunt.hasGuessQueue,
        homepageUrl: this.props.hunt.homepageUrl || '',
        submitTemplate: this.props.hunt.submitTemplate || '',
      });
    } else {
      return Object.assign(state, {
        name: '',
        mailingLists: '',
        signupMessage: '',
        openSignups: false,
        hasGuessQueue: true,
        homepageUrl: '',
        submitTemplate: '',
      });
    }
  };

  onNameChanged: FormControlProps['onChange'] = (e) => {
    this.setState({
      name: e.currentTarget.value,
    });
  };

  onMailingListsChanged: FormControlProps['onChange'] = (e) => {
    this.setState({
      mailingLists: e.currentTarget.value,
    });
  };

  onSignupMessageChanged: FormControlProps['onChange'] = (e) => {
    this.setState({
      signupMessage: e.currentTarget.value,
    });
  };

  onOpenSignupsChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      openSignups: e.currentTarget.checked,
    });
  };

  onHasGuessQueueChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      hasGuessQueue: e.currentTarget.checked,
    });
  };

  onHomepageUrlChanged: FormControlProps['onChange'] = (e) => {
    this.setState({
      homepageUrl: e.currentTarget.value,
    });
  };

  onSubmitTemplateChanged: FormControlProps['onChange'] = (e) => {
    this.setState({
      submitTemplate: e.currentTarget.value,
    });
  };

  onFormSubmit = (callback: () => void) => {
    this.setState({ submitState: HuntModalFormSubmitState.SUBMITTING });
    const { submitState, errorMessage, ...state } = this.state;
    const sendState = Object.assign(
      state,
      { mailingLists: splitLists(this.state.mailingLists) },
    );
    this.props.onSubmit(sendState, (error?: Error) => {
      if (error) {
        this.setState({
          submitState: HuntModalFormSubmitState.FAILED,
          errorMessage: error.message,
        });
      } else {
        this.setState(this.initialState());
        callback();
      }
    });
  };

  show = () => {
    if (this.formRef.current) {
      this.formRef.current.show();
    }
  };

  render() {
    const disableForm = this.state.submitState === HuntModalFormSubmitState.SUBMITTING;
    const idPrefix = this.props.hunt ? `jr-hunt-${this.props.hunt._id}-modal-` : 'jr-hunt-new-modal-';
    return (
      <ModalForm
        ref={this.formRef}
        title={this.props.hunt ? 'Edit Hunt' : 'New Hunt'}
        onSubmit={this.onFormSubmit}
        submitDisabled={disableForm}
      >
        <FormGroup as={Row}>
          <FormLabel column xs={3} htmlFor={`${idPrefix}name`}>
            Name
          </FormLabel>
          <Col xs={9}>
            <FormControl
              id={`${idPrefix}name`}
              type="text"
              value={this.state.name}
              onChange={this.onNameChanged}
              autoFocus
              disabled={disableForm}
            />
          </Col>
        </FormGroup>

        <FormGroup as={Row}>
          <FormLabel column xs={3} htmlFor={`${idPrefix}mailing-lists`}>
            Mailing lists
          </FormLabel>
          <Col xs={9}>
            <FormControl
              id={`${idPrefix}mailing-lists`}
              type="text"
              value={this.state.mailingLists}
              onChange={this.onMailingListsChanged}
              disabled={disableForm}
            />
            <FormText>
              Users joining this hunt will be automatically added to all of these (comma-separated) lists
            </FormText>
          </Col>
        </FormGroup>

        <FormGroup as={Row}>
          <FormLabel column xs={3} htmlFor={`${idPrefix}signup-message`}>
            Signup message
          </FormLabel>
          <Col xs={9}>
            <FormControl
              id={`${idPrefix}signup-message`}
              as="textarea"
              value={this.state.signupMessage}
              onChange={this.onSignupMessageChanged}
              disabled={disableForm}
            />
            <FormText>
              This message (rendered as markdown) will be shown to users who aren&apos;t part of the hunt. This is a good place to put directions for how to sign up.
            </FormText>
          </Col>
        </FormGroup>

        <FormGroup as={Row}>
          <FormLabel column xs={3} htmlFor={`${idPrefix}open-signups`}>
            Open invites
          </FormLabel>
          <Col xs={9}>
            <FormCheck
              id={`${idPrefix}open-signups`}
              checked={this.state.openSignups}
              onChange={this.onOpenSignupsChanged}
              disabled={disableForm}
            />
            <FormText>
              If open invites are enabled, then any current member of the hunt can add a new member to the hunt. Otherwise, only operators can add new members.
            </FormText>
          </Col>
        </FormGroup>

        <FormGroup as={Row}>
          <FormLabel column xs={3} htmlFor={`${idPrefix}has-guess-queue`}>
            Guess queue
          </FormLabel>
          <Col xs={9}>
            <FormCheck
              id={`${idPrefix}has-guess-queue`}
              checked={this.state.hasGuessQueue}
              onChange={this.onHasGuessQueueChanged}
              disabled={disableForm}
            />
            <FormText>
              If enabled, users can submit guesses for puzzles but operators must mark them as correct. If disabled, any user can enter the puzzle answer.
            </FormText>
          </Col>
        </FormGroup>

        <FormGroup as={Row}>
          <FormLabel column xs={3} htmlFor={`${idPrefix}homepage-url`}>
            Homepage URL
          </FormLabel>
          <Col xs={9}>
            <FormControl
              id={`${idPrefix}homepage-url`}
              type="text"
              value={this.state.homepageUrl}
              onChange={this.onHomepageUrlChanged}
              disabled={disableForm}
            />
            <FormText>
              If provided, a link to the hunt homepage will be placed on the landing page.
            </FormText>
          </Col>
        </FormGroup>

        <FormGroup as={Row}>
          <FormLabel column xs={3} htmlFor={`${idPrefix}submit-template`}>
            Submit URL template
          </FormLabel>
          <Col xs={9}>
            <FormControl
              id={`${idPrefix}submit-template`}
              type="text"
              value={this.state.submitTemplate}
              onChange={this.onSubmitTemplateChanged}
              disabled={disableForm}
            />
            <FormText>
              If provided, this
              {' '}
              <a href="https://mustache.github.io/mustache.5.html">Mustache template</a>
              {' '}
              is used to generate the link to the guess submission page. It gets as context a
              {' '}
              <a href="https://developer.mozilla.org/en-US/docs/Web/API/URL">parsed URL</a>
              {', '}
              providing variables like
              {' '}
              <code>hostname</code>
              {' '}
              or
              {' '}
              <code>pathname</code>
              {'. '}
              Because this will be used as a link directly, make sure to use &quot;triple-mustaches&quot; so that the URL components aren&apos;t escaped. As an example, setting this to
              {' '}
              <code>{'{{{origin}}}/submit{{{pathname}}}'}</code>
              {' '}
              would work for the 2018 Mystery Hunt. If not specified, the puzzle URL is used as the link to the guess submission page.
            </FormText>
          </Col>
        </FormGroup>

        {this.state.submitState === HuntModalFormSubmitState.FAILED && <Alert variant="danger">{this.state.errorMessage}</Alert>}
      </ModalForm>
    );
  }
}

interface HuntProps {
  hunt: HuntType;
  canUpdate: boolean;
  canDestroy: boolean;
}

class Hunt extends React.Component<HuntProps> {
  private editModalRef: React.RefObject<HuntModalForm>;

  private deleteModalRef: React.RefObject<ModalForm>;

  constructor(props: HuntProps) {
    super(props);
    this.editModalRef = React.createRef();
    this.deleteModalRef = React.createRef();
  }

  onEdit = (state: HuntModalSubmit, callback: (error?: Error) => void) => {
    Ansible.log('Updating hunt settings', { hunt: this.props.hunt._id, user: Meteor.userId(), state });
    Hunts.update(
      { _id: this.props.hunt._id },
      { $set: state },
      {},
      callback
    );
  };

  onDelete = (callback: () => void) => {
    Hunts.destroy(this.props.hunt._id, callback);
  };

  showEditModal = () => {
    if (this.editModalRef.current) {
      this.editModalRef.current.show();
    }
  };

  showDeleteModal = () => {
    if (this.deleteModalRef.current) {
      this.deleteModalRef.current.show();
    }
  };

  editButton = () => {
    if (this.props.canUpdate) {
      return (
        <Button onClick={this.showEditModal} variant="outline-secondary" title="Edit hunt...">
          <FontAwesomeIcon fixedWidth icon={faEdit} />
        </Button>
      );
    }

    return undefined;
  };

  deleteButton = () => {
    if (this.props.canDestroy) {
      return (
        <Button onClick={this.showDeleteModal} variant="danger" title="Delete hunt...">
          <FontAwesomeIcon fixedWidth icon={faMinus} />
        </Button>
      );
    }

    return undefined;
  };

  render() {
    const hunt = this.props.hunt;
    return (
      <li>
        <HuntModalForm
          ref={this.editModalRef}
          hunt={this.props.hunt}
          onSubmit={this.onEdit}
        />
        <ModalForm
          ref={this.deleteModalRef}
          title="Delete Hunt"
          submitLabel="Delete"
          submitStyle="danger"
          onSubmit={this.onDelete}
        >
          Are you sure you want to delete &quot;
          {this.props.hunt.name}
          &quot;? This will additionally delete all puzzles and associated state.
        </ModalForm>
        <ButtonGroup size="sm">
          {this.editButton()}
          {this.deleteButton()}
        </ButtonGroup>
        {' '}
        <Link to={`/hunts/${hunt._id}`}>
          {hunt.name}
        </Link>
      </li>
    );
  }
}

const HuntContainer = withTracker((_props: { hunt: HuntType }) => {
  return {
    canUpdate: Roles.userHasPermission(Meteor.userId(), 'mongo.hunts.update'),

    // Because we delete by setting the deleted flag, you only need
    // update to "remove" something
    canDestroy: Roles.userHasPermission(Meteor.userId(), 'mongo.hunts.update'),
  };
})(Hunt);

/*
const MockHunt = React.createClass({
  render() {
    return (
      <li>
        <Link to={`/hunts/${this.props.hunt._id}`}>{this.props.hunt.title} (mock data)</Link>
      </li>
    );
  },
});
*/

interface HuntListPageProps {
  ready: boolean;
  canAdd: boolean;
  hunts: HuntType[];
  myHunts: Record<string, boolean>;
}

class HuntListPage extends React.Component<HuntListPageProps> {
  private addModalRef: React.RefObject<HuntModalForm>

  constructor(props: HuntListPageProps) {
    super(props);
    this.addModalRef = React.createRef();
  }

  onAdd = (state: HuntModalSubmit, callback: (error?: Error) => void): void => {
    Ansible.log('Creating a new hunt', { user: Meteor.userId(), state });
    Hunts.insert(state, callback);
  };

  showAddModal = () => {
    if (this.addModalRef.current) {
      this.addModalRef.current.show();
    }
  };

  addButton = () => {
    if (this.props.canAdd) {
      return (
        <Button onClick={this.showAddModal} variant="success" size="sm" title="Add new hunt...">
          <FontAwesomeIcon icon={faPlus} />
        </Button>
      );
    }

    return undefined;
  };

  render() {
    const body = [];
    if (this.props.ready) {
      const joinedHunts: JSX.Element[] = [];
      const otherHunts: JSX.Element[] = [];
      this.props.hunts.forEach((hunt) => {
        const huntTag = <HuntContainer key={hunt._id} hunt={hunt} />;
        if (this.props.myHunts[hunt._id]) {
          joinedHunts.push(huntTag);
        } else {
          otherHunts.push(huntTag);
        }
      });

      body.push(<h2 key="myhuntsheader">Hunts you are a member of:</h2>);
      if (joinedHunts.length > 0) {
        body.push(
          <ul key="myhunts">
            {joinedHunts}
          </ul>
        );
      } else {
        body.push(<div key="nomyhunts">You&apos;re not a member of any hunts yet.  Consider joining one, or asking an operator to invite you.</div>);
      }
      body.push(<h2 key="otherhuntsheader">Other hunts:</h2>);
      if (otherHunts.length > 0) {
        body.push(
          <ul key="otherhunts">
            {otherHunts}
          </ul>
        );
      } else {
        body.push(<div key="nootherhunts">There are no other hunts you haven&apos;t joined.</div>);
      }
    } else {
      body.push(<div key="loading">Loading...</div>);
    }

    return (
      <div id="jr-hunts">
        <h1>Hunts</h1>
        <HuntModalForm
          ref={this.addModalRef}
          onSubmit={this.onAdd}
        />
        {this.addButton()}
        {body}
      </div>
    );
  }
}

const crumb = withBreadcrumb<{}>({ title: 'Hunts', path: '/hunts' });
const tracker = withTracker(() => {
  const huntListHandle = Meteor.subscribe('mongo.hunts');
  const myHuntsHandle = Meteor.subscribe('selfHuntMembership');
  const ready = huntListHandle.ready() && myHuntsHandle.ready();

  const myHunts: Record<string, boolean> = {};
  if (ready) {
    Meteor.user()!.hunts.forEach((hunt) => { myHunts[hunt] = true; });
  }

  return {
    ready,
    canAdd: Roles.userHasPermission(Meteor.userId(), 'mongo.hunts.insert'),
    hunts: Hunts.find({}, { sort: { createdAt: -1 } }).fetch(),
    myHunts,
  };
});

const HuntListContainer = crumb(tracker(HuntListPage));

export default HuntListContainer;
