import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import onClickOutside from 'react-onclickoutside';

import ActionButton from 'components/ActionButton';

import getOverlayPositionBasedOn from 'helpers/getOverlayPositionBasedOn';
import print from 'helpers/print';
import getClassName from 'helpers/getClassName';
import openFilePicker from 'helpers/openFilePicker';
import toggleFullscreen from 'helpers/toggleFullscreen';
import downloadPdf from 'helpers/downloadPdf';
import { isIOS } from 'helpers/device';
import { workerTypes } from 'constants/types';
import actions from 'actions';
import selectors from 'selectors';

import './MenuOverlay.scss';

class MenuOverlay extends React.PureComponent {
  static propTypes = {
    documentPath: PropTypes.string,
    documentFilename: PropTypes.string,
    isDownloadable: PropTypes.bool,
    isEmbedPrintSupported: PropTypes.bool,
    isFullScreen: PropTypes.bool,
    isDisabled: PropTypes.bool,
    isOpen: PropTypes.bool,
    closeElements: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
  }

  constructor() {
    super();
    this.overlay = React.createRef();
    this.state = {
      left: 0,
      right: 'auto',
    };
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.isOpen && this.props.isOpen) {
      this.props.closeElements(['groupOverlay', 'viewControlsOverlay', 'searchOverlay', 'toolStylePopup', 'signatureOverlay', 'zoomOverlay', 'redactionOverlay']);
      this.setState(getOverlayPositionBasedOn('menuButton', this.overlay));
    }
  }

  handlePrintButtonClick = () => {
    const { dispatch, isEmbedPrintSupported } = this.props;

    print(dispatch, isEmbedPrintSupported);
  }

  handleClickOutside = e => {
    const clickedMenuButton = e.target.getAttribute('data-element') === 'menuButton';

    if (!clickedMenuButton) {
      this.props.closeElements(['menuOverlay']);
    }
  }

  downloadDocument = () => {
    const { dispatch, documentPath, documentFilename } = this.props;

    downloadPdf(dispatch, {
      documentPath,
      filename: documentFilename,
    });
  }

  render() {
    const { left, right } = this.state;
    const { isDisabled, isDownloadable, isFullScreen, t } = this.props;

    if (isDisabled) {
      return null;
    }

    const className = getClassName('Overlay MenuOverlay', this.props);

    return (
      <div className={className} data-element="menuOverlay" style={{ left, right }} ref={this.overlay}>
        <ActionButton dataElement="filePickerButton" label={t('action.openFile')} onClick={openFilePicker} />
        {!isIOS &&
          <ActionButton dataElement="fullScreenButton" label={isFullScreen ? t('action.exitFullscreen') : t('action.enterFullscreen')} onClick={toggleFullscreen} />
        }
        {isDownloadable &&
          <ActionButton dataElement="downloadButton" label={t('action.download')} onClick={this.downloadDocument} />
        }
        <ActionButton dataElement="printButton" label={t('action.print')} onClick={this.handlePrintButtonClick} hidden={['mobile']} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  documentPath: selectors.getDocumentPath(state),
  documentFilename: state.document.filename,
  isDownloadable: selectors.getDocumentType(state) !== workerTypes.XOD,
  isEmbedPrintSupported: selectors.isEmbedPrintSupported(state),
  isFullScreen: selectors.isFullScreen(state),
  isDisabled: selectors.isElementDisabled(state, 'menuOverlay'),
  isOpen: selectors.isElementOpen(state, 'menuOverlay'),
});

const mapDispatchToProps = dispatch => ({
  dispatch,
  closeElements: dataElements => dispatch(actions.closeElements(dataElements)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(onClickOutside(MenuOverlay)));
