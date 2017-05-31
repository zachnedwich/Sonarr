import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import Autosuggest from 'react-autosuggest';
import jdu from 'jdu';
import { icons } from 'Helpers/Props';
import Icon from 'Components/Icon';
import keyboardShortcuts, { shortcuts } from 'Components/keyboardShortcuts';
import SeriesSearchResult from './SeriesSearchResult';
import styles from './SeriesSearchInput.css';

const ADD_NEW_TYPE = 'addNew';

class SeriesSearchInput extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this._autosuggest = null;

    this.state = {
      value: '',
      suggestions: []
    };
  }

  componentWillMount() {
    this.props.bindShortcut(shortcuts.SERIES_SEARCH_INPUT.key, this.focusInput);
  }

  //
  // Control

  setAutosuggestRef = (ref) => {
    this._autosuggest = ref;
  }

  focusInput = (event) => {
    event.preventDefault();
    this._autosuggest.input.focus();
  }

  getSectionSuggestions(section) {
    return section.suggestions;
  }

  renderSectionTitle(section) {
    return (
      <div className={styles.sectionTitle}>
        {section.title}
      </div>
    );
  }

  getSuggestionValue({ title }) {
    return title;
  }

  renderSuggestion(item, { query }) {
    if (item.type === ADD_NEW_TYPE) {
      return (
        <div className={styles.addNewSeriesSuggestion}>
          Search for {query}
        </div>
      );
    }

    return (
      <SeriesSearchResult
        query={query}
        {...item}
      />
    );
  }

  goToSeries(series) {
    this.setState({ value: '' });
    this.props.onGoToSeries(series.titleSlug);
  }

  reset() {
    this.setState({
      value: '',
      suggestions: []
    });
  }

  //
  // Listeners

  onChange = (event, { newValue }) => {
    this.setState({ value: newValue });
  }

  onKeyDown = (event) => {
    if (event.key !== 'Tab' && event.key !== 'Enter') {
      return;
    }

    const {
      suggestions,
      value
    } = this.state;

    const {
      focusedSectionIndex,
      focusedSuggestionIndex
    } = this._autosuggest.state;

    if (!suggestions.length || focusedSectionIndex) {
      this.props.onGoToAddNewSeries(value);
      this._autosuggest.input.blur();

      return;
    }

    // If an suggestion is not selected go to the first series,
    // otherwise go to the selected series.

    if (focusedSuggestionIndex == null) {
      this.goToSeries(suggestions[0]);
    } else {
      this.goToSeries(suggestions[focusedSuggestionIndex]);
    }
  }

  onBlur = () => {
    this.reset();
  }

  onSuggestionsFetchRequested = ({ value }) => {
    const lowerCaseValue = jdu.replace(value).toLowerCase();

    const suggestions = _.filter(this.props.series, (series) => {
      // Check the title first and if there isn't a match fallback to the alternate titles

      const titleMatch = jdu.replace(series.title).toLowerCase().contains(lowerCaseValue);

      return titleMatch || _.some(series.alternateTitles, (alternateTitle) => {
        return jdu.replace(alternateTitle.title).toLowerCase().contains(lowerCaseValue);
      });
    });

    this.setState({ suggestions });
  }

  onSuggestionsClearRequested = () => {
    this.reset();
  }

  onSuggestionSelected = (event, { suggestion, sectionIndex }) => {
    if (suggestion.type === ADD_NEW_TYPE) {
      this.props.onGoToAddNewSeries(this.state.value);
    } else {
      this.goToSeries(suggestion);
    }
  }

  //
  // Render

  render() {
    const {
      value,
      suggestions
    } = this.state;

    const suggestionGroups = [];

    if (suggestions.length) {
      suggestionGroups.push({
        title: 'Existing Series',
        suggestions
      });
    }

    if (suggestions.length <= 3) {
      suggestionGroups.push({
        title: 'Add New Series',
        suggestions: [
          {
            type: ADD_NEW_TYPE,
            title: value
          }
        ]
      });
    }

    const inputProps = {
      ref: this.setInputRef,
      className: styles.input,
      name: 'seriesSearch',
      value,
      placeholder: 'Search',
      autoComplete: 'off',
      spellCheck: false,
      onChange: this.onChange,
      onKeyDown: this.onKeyDown,
      onBlur: this.onBlur,
      onFocus: this.onFocus
    };

    const theme = {
      container: styles.container,
      containerOpen: styles.containerOpen,
      suggestionsContainer: styles.seriesContainer,
      suggestionsList: styles.list,
      suggestion: styles.listItem,
      suggestionFocused: styles.focused
    };

    return (
      <div className={styles.wrapper}>
        <Icon
          className={styles.icon}
          name={icons.SEARCH}
        />

        <Autosuggest
          ref={this.setAutosuggestRef}
          id={name}
          inputProps={inputProps}
          theme={theme}
          focusInputOnSuggestionClick={false}
          multiSection={true}
          suggestions={suggestionGroups}
          getSectionSuggestions={this.getSectionSuggestions}
          renderSectionTitle={this.renderSectionTitle}
          getSuggestionValue={this.getSuggestionValue}
          renderSuggestion={this.renderSuggestion}
          onSuggestionSelected={this.onSuggestionSelected}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        />
      </div>
    );
  }
}

SeriesSearchInput.propTypes = {
  series: PropTypes.arrayOf(PropTypes.object).isRequired,
  onGoToSeries: PropTypes.func.isRequired,
  onGoToAddNewSeries: PropTypes.func.isRequired,
  bindShortcut: PropTypes.func.isRequired
};

export default keyboardShortcuts(SeriesSearchInput);
