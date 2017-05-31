import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import { createSelector } from 'reselect';
import createProfileInUseSelector from 'Store/Selectors/createProfileInUseSelector';
import createProviderSettingsSelector from 'Store/Selectors/createProviderSettingsSelector';
import { fetchLanguageProfileSchema, setLanguageProfileValue, saveLanguageProfile } from 'Store/Actions/settingsActions';
import connectSection from 'Store/connectSection';
import EditLanguageProfileModalContent from './EditLanguageProfileModalContent';

function createLanguagesSelector() {
  return createSelector(
    createProviderSettingsSelector(),
    (languageProfile) => {
      const languages = languageProfile.item.languages;
      if (!languages || !languages.value) {
        return [];
      }

      return _.reduceRight(languages.value, (result, { allowed, language }) => {
        if (allowed) {
          result.push({ [language.id]: language.name });
        }

        return result;
      }, []);
    }
  );
}

function createMapStateToProps() {
  return createSelector(
    (state) => state.settings.advancedSettings,
    createProviderSettingsSelector(),
    createLanguagesSelector(),
    createProfileInUseSelector('languageProfileId'),
    (advancedSettings, languageProfile, languages, isInUse) => {
      return {
        advancedSettings,
        languages,
        ...languageProfile,
        isInUse
      };
    }
  );
}

const mapDispatchToProps = {
  fetchLanguageProfileSchema,
  setLanguageProfileValue,
  saveLanguageProfile
};

class EditLanguageProfileModalContentConnector extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      dragIndex: null,
      dropIndex: null
    };
  }

  componentWillMount() {
    if (!this.props.id) {
      this.props.fetchLanguageProfileSchema();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.isSaving && !this.props.isSaving && !this.props.saveError) {
      this.props.onModalClose();
    }
  }

  //
  // Listeners

  onInputChange = ({ name, value }) => {
    this.props.setLanguageProfileValue({ name, value });
  }

  onCutoffChange = ({ name, value }) => {
    const id = parseInt(value);
    const item = _.find(this.props.item.languages.value, (i) => i.language.id === id);

    this.props.setLanguageProfileValue({ name, value: item.language });
  }

  onSavePress = () => {
    this.props.saveLanguageProfile({ id: this.props.id });
  }

  onLanguageProfileItemAllowedChange = (id, allowed) => {
    const languageProfile = _.cloneDeep(this.props.item);

    const item = _.find(languageProfile.languages.value, (i) => i.language.id === id);
    item.allowed = allowed;

    this.props.setLanguageProfileValue({
      name: 'languages',
      value: languageProfile.languages.value
    });

    const cutoff = languageProfile.cutoff.value;

    // If the cutoff isn't allowed anymore or there isn't a cutoff set one
    if (!cutoff || !_.find(languageProfile.languages.value, (i) => i.language.id === cutoff.id).allowed) {
      const firstAllowed = _.find(languageProfile.languages.value, { allowed: true });

      this.props.setLanguageProfileValue({ name: 'cutoff', value: firstAllowed ? firstAllowed.language : null });
    }
  }

  onLanguageProfileItemDragMove = (dragIndex, dropIndex) => {
    if (this.state.dragIndex !== dragIndex || this.state.dropIndex !== dropIndex) {
      this.setState({
        dragIndex,
        dropIndex
      });
    }
  }

  onLanguageProfileItemDragEnd = ({ id }, didDrop) => {
    const {
      dragIndex,
      dropIndex
    } = this.state;

    if (didDrop && dropIndex !== null) {
      const languageProfile = _.cloneDeep(this.props.item);

      const languages = languageProfile.languages.value.splice(dragIndex, 1);
      languageProfile.languages.value.splice(dropIndex, 0, languages[0]);

      this.props.setLanguageProfileValue({
        name: 'languages',
        value: languageProfile.languages.value
      });
    }

    this.setState({
      dragIndex: null,
      dropIndex: null
    });
  }

  //
  // Render

  render() {
    if (_.isEmpty(this.props.item.languages) && !this.props.isFetching) {
      return null;
    }

    return (
      <EditLanguageProfileModalContent
        {...this.state}
        {...this.props}
        onSavePress={this.onSavePress}
        onInputChange={this.onInputChange}
        onCutoffChange={this.onCutoffChange}
        onLanguageProfileItemAllowedChange={this.onLanguageProfileItemAllowedChange}
        onLanguageProfileItemDragMove={this.onLanguageProfileItemDragMove}
        onLanguageProfileItemDragEnd={this.onLanguageProfileItemDragEnd}
      />
    );
  }
}

EditLanguageProfileModalContentConnector.propTypes = {
  id: PropTypes.number,
  isFetching: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,
  saveError: PropTypes.object,
  item: PropTypes.object.isRequired,
  setLanguageProfileValue: PropTypes.func.isRequired,
  fetchLanguageProfileSchema: PropTypes.func.isRequired,
  saveLanguageProfile: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default connectSection(
  createMapStateToProps,
  mapDispatchToProps,
  undefined,
  undefined,
  { section: 'languageProfiles' }
)(EditLanguageProfileModalContentConnector);
