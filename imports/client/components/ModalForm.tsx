import * as PropTypes from 'prop-types';
import * as React from 'react';
import * as Button from 'react-bootstrap/lib/Button';
import * as Modal from 'react-bootstrap/lib/Modal';

interface ModalFormProps {
  title: string;
  submitLabel?: string;
  submitStyle?: string;
  submitDisabled?: boolean;
  onSubmit: (callback: () => void) => void;
  children?: React.ReactNode;
}

interface ModalFormState {
  show: boolean;
}

class ModalForm extends React.Component<ModalFormProps, ModalFormState> {
  static propTypes = {
    title: PropTypes.string.isRequired,
    submitLabel: PropTypes.string,
    submitStyle: PropTypes.string,
    submitDisabled: PropTypes.bool,
    onSubmit: PropTypes.func.isRequired,
    children: PropTypes.node,
  };

  static defaultProps = {
    submitLabel: 'Save',
    submitStyle: 'primary',
  };

  state = { show: false };

  componentWillUnmount() {
    this.dontTryToClose = true;
  }

  show = () => {
    this.setState({ show: true });
  };

  close = () => {
    this.setState({ show: false });
  };

  submit = (e: React.FormEvent) => {
    e.preventDefault();
    this.props.onSubmit(() => {
      // For delete forms, it's possible that the component gets
      // deleted and unmounted before the callback gets called.
      if (!this.dontTryToClose) {
        this.close();
      }
    });
  };

  private dontTryToClose?: boolean;

  render() {
    return (
      <Modal show={this.state.show} onHide={this.close}>
        <form className="form-horizontal" onSubmit={this.submit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.props.children}
          </Modal.Body>
          <Modal.Footer>
            <Button
              bsStyle="default"
              onClick={this.close}
              disabled={this.props.submitDisabled}
            >
              Close
            </Button>
            <Button
              bsStyle={this.props.submitStyle}
              type="submit"
              disabled={this.props.submitDisabled}
            >
              {this.props.submitLabel}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    );
  }
}

export default ModalForm;