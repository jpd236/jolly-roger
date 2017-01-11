import React from 'react';

const GoogleDocumentDisplay = React.createClass({
  propTypes: {
    document: React.PropTypes.shape(Schemas.Documents.asReactPropTypes()).isRequired,
    displayMode: React.PropTypes.oneOf(['link', 'embed']),
  },

  render() {
    let url;
    let title;
    switch (this.props.document.value.type) {
      case 'spreadsheet':
        url = `https://docs.google.com/spreadsheets/d/${this.props.document.value.id}/edit?ui=2&rm=embedded#gid=0`;
        title = 'worksheet';
        break;
      default:
        return (
          <span className="puzzle-document-message">
            Don't know how to link to a document of type {this.props.document.value.type}
          </span>
        );
    }

    switch (this.props.displayMode) {
      case 'link':
        return (
          <a className="gdrive-button" href={url} target="_blank" rel="noreferrer noopener">
            Open {title}
          </a>
        );
      case 'embed':
        return (
          <iframe className="gdrive-embed" src={url} />
        );
      default:
        return (
          <span className="puzzle-document-message">
            Unknown displayMode {this.props.displayMode}
          </span>
        );
    }
  },
});

const DocumentDisplay = React.createClass({
  propTypes: {
    document: React.PropTypes.shape(Schemas.Documents.asReactPropTypes()).isRequired,
    displayMode: React.PropTypes.oneOf(['link', 'embed']),
  },

  render() {
    switch (this.props.document.provider) {
      case 'google':
        return (
          <GoogleDocumentDisplay
            document={this.props.document}
            displayMode={this.props.displayMode}
          />
        );
      default:
        return (
          <span className="puzzle-document-message">
            Unable to display document from provider {this.props.document.provider}
          </span>
        );
    }
  },
});

export { DocumentDisplay };
