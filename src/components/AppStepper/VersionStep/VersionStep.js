import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import BackButton from '../BackButton';
import CompileButton from '../CompileButton';
import VersionSelector from './VersionSelector';
import coreVersions from './Variables/CoreVersions';
import languages from './Variables/Languages';
import boardVersions from './Variables/BoardVersions';
import boardSpeeds from './Variables/BoardSpeeds';
import { FormattedMessage } from 'react-intl';

function getDefaultCoreVersion(microcontroller) {
  const index = coreVersions.findIndex(
    (item) => item.microcontroller === microcontroller && item.default === true
  );
  return coreVersions[index].value;
}

function getDefaultBoardVersion(microcontroller) {
  const index = boardVersions.findIndex(
    (item) => item.microcontroller === microcontroller && item.default === true
  );
  return boardVersions[index].value;
}

function getDefaultBoardSpeed(microcontroller) {
  const index = boardSpeeds.findIndex(
    (item) =>
      (item.microcontroller === microcontroller ||
        item.microcontroller === -1) &&
      item.default === true
  );
  return boardSpeeds[index].value;
}

class VersionStep extends Component {
  constructor(props) {
    super(props);

    // Search the current locale of browser on languages
    var languageIndex = languages.findIndex((element) =>
      element.value.includes(navigator.language)
    );
    // Set English if not found current locale of browser on languages
    if (languageIndex === -1) languageIndex = 0;

    this.state = {
      tasmotaVersion: 'development',
      coreVersion: getDefaultCoreVersion(this.props.microcontroller),
      MY_LANGUAGE: languages[languageIndex].value,
      boardVersion: getDefaultBoardVersion(this.props.microcontroller),
      boardSpeed: getDefaultBoardSpeed(this.props.microcontroller),
      memoryBuildFlag: 'eagle.flash.1m.ld',
      message: '',
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleCompile = this.handleCompile.bind(this);
    this.handleBack = this.handleBack.bind(this);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.microcontroller !== this.props.microcontroller) {
      this.setState({
        coreVersion: getDefaultCoreVersion(this.props.microcontroller),
        boardVersion: getDefaultBoardVersion(this.props.microcontroller),
        boardSpeed: getDefaultBoardSpeed(this.props.microcontroller),
      });
    }
  }
  handleChange(event) {
    let memoryBuildFlag;
    const { boardVersion, coreVersion } = this.state;

    if (event.target.name === 'coreVersion') {
      const mbf = event.target.value.mem_prefix;
      if (boardVersion.mem === 4) {
        memoryBuildFlag = `${mbf}4m1m.ld`;
      } else {
        // memory 1Mbit
        memoryBuildFlag = `${mbf}1m0.ld`;
        if (
          event.target.value.platform.startsWith('core_2_6_') ||
          event.target.value.platform.startsWith('core_2_7_')
        ) {
          memoryBuildFlag = `${mbf}1m.ld`;
        }
      }
    }

    if (event.target.name === 'boardVersion') {
      const mbf = coreVersion.mem_prefix;
      if (event.target.value.mem === 4) {
        memoryBuildFlag = `${mbf}4m1m.ld`;
      } else {
        memoryBuildFlag = `${mbf}1m0.ld`;
        if (
          coreVersion.platform.startsWith('core_2_6_') ||
          coreVersion.platform.startsWith('core_2_7_')
        ) {
          memoryBuildFlag = `${mbf}1m.ld`;
        }
      }
    }

    if (memoryBuildFlag) {
      this.setState({
        [event.target.name]: event.target.value,
        memoryBuildFlag,
      });
    } else {
      this.setState({ [event.target.name]: event.target.value });
    }
  }

  handleCompile() {
    const { compileHandler } = this.props;
    compileHandler({ ...this.state });
  }

  handleBack() {
    const { backHandler } = this.props;
    backHandler();
  }

  render() {
    const {
      message,
      tasmotaVersion,
      coreVersion,
      MY_LANGUAGE,
      boardVersion,
      boardSpeed,
    } = this.state;

    const {
      classes,
      backHandler,
      repoTags,
      compiling,
      compileHandler,
      microcontroller,
      ...other
    } = this.props;

    return (
      <Step {...other}>
        <StepLabel error={message.length > 0 && other.active}>
          <FormattedMessage id="stepVersionTitle" />
        </StepLabel>
        <StepContent>
          <Typography>
            <FormattedMessage id="stepVersionDesc" />
          </Typography>
          <form className={classes.actionsContainer} autoComplete="off">
            <VersionSelector
              items={repoTags}
              name="tasmotaVersion"
              value={tasmotaVersion}
              label={<FormattedMessage id="stepVersionTasmota" />}
              onChange={this.handleChange}
              classes={classes}
            />
            <VersionSelector
              items={coreVersions.filter(
                (item) => item.microcontroller === microcontroller
              )}
              name="coreVersion"
              value={coreVersion}
              label={<FormattedMessage id="stepVersionCore" />}
              onChange={this.handleChange}
              classes={classes}
            />
            <VersionSelector
              items={languages}
              name="MY_LANGUAGE"
              value={MY_LANGUAGE}
              label={<FormattedMessage id="stepVersionLanguage" />}
              onChange={this.handleChange}
              classes={classes}
            />
            <VersionSelector
              items={boardVersions.filter(
                (item) => item.microcontroller === microcontroller
              )}
              name="boardVersion"
              value={boardVersion}
              label={<FormattedMessage id="stepVersionBoard" />}
              onChange={this.handleChange}
              classes={classes}
            />
            <VersionSelector
              items={boardSpeeds.filter(
                (item) =>
                  item.microcontroller === microcontroller ||
                  item.microcontroller === -1
              )}
              name="boardSpeed"
              value={boardSpeed}
              label={<FormattedMessage id="stepVersionBoardSpeed" />}
              onChange={this.handleChange}
              classes={classes}
            />
          </form>
          <div className={classes.actionsContainer}>
            <div className={classes.wrapper}>
              <BackButton disabled={compiling} onClick={this.handleBack} />
            </div>
            <div className={classes.wrapper}>
              <CompileButton
                disabled={compiling}
                onClick={this.handleCompile}
              />
              {compiling && (
                <CircularProgress
                  size={24}
                  className={classes.buttonProgress}
                />
              )}
            </div>
          </div>
          {message && (
            <Typography color="error" variant="subtitle1">
              Error:
              {message}
            </Typography>
          )}
        </StepContent>
      </Step>
    );
  }
}

VersionStep.propTypes = {
  classes: PropTypes.oneOfType([PropTypes.object]).isRequired,
  repoTags: PropTypes.oneOfType([PropTypes.array]).isRequired,
  compiling: PropTypes.bool.isRequired,
  compileHandler: PropTypes.func.isRequired,
  backHandler: PropTypes.func.isRequired,
};

export default VersionStep;
