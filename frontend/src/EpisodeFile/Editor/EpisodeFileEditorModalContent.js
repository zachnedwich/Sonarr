import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import getSelectedIds from 'Utilities/Table/getSelectedIds';
import selectAll from 'Utilities/Table/selectAll';
import toggleSelected from 'Utilities/Table/toggleSelected';
import { kinds } from 'Helpers/Props';
import Button from 'Components/Link/Button';
import SpinnerButton from 'Components/Link/SpinnerButton';
import SelectInput from 'Components/Form/SelectInput';
import ModalContent from 'Components/Modal/ModalContent';
import ModalHeader from 'Components/Modal/ModalHeader';
import ModalBody from 'Components/Modal/ModalBody';
import ModalFooter from 'Components/Modal/ModalFooter';
import Table from 'Components/Table/Table';
import TableBody from 'Components/Table/TableBody';
import EpisodeFileEditorRow from './EpisodeFileEditorRow';
import styles from './EpisodeFileEditorModalContent.css';

const columns = [
  {
    name: 'episodeNumber',
    label: 'Episode',
    isVisible: true
  },
  {
    name: 'relativePath',
    label: 'Relative Path',
    isVisible: true
  },
  {
    name: 'airDateUtc',
    label: 'Air Date',
    isVisible: true
  },
  {
    name: 'language',
    label: 'Language',
    isVisible: true
  },
  {
    name: 'quality',
    label: 'Quality',
    isVisible: true
  }
];

class EpisodeFileEditorModalContent extends Component {

  //
  // Lifecycle

  constructor(props, context) {
    super(props, context);

    this.state = {
      allSelected: false,
      allUnselected: false,
      lastToggled: null,
      selectedState: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items !== this.props.items) {
      this.onSelectAllChange({ value: false });
    }
  }

  //
  // Control

  getSelectedIds = () => {
    const selectedIds = getSelectedIds(this.state.selectedState);

    return _.uniq(_.map(selectedIds, (id) => {
      return _.find(this.props.items, { id }).episodeFileId;
    }));
  }

  //
  // Listeners

  onSelectAllChange = ({ value }) => {
    this.setState(selectAll(this.state.selectedState, value));
  }

  onSelectedChange = ({ id, value, shiftKey = false }) => {
    this.setState((state) => {
      return toggleSelected(state, this.props.items, id, value, shiftKey);
    });
  }

  onDeletePress = () => {
    this.props.onDeletePress(this.getSelectedIds());
  }

  onLanguageChange = ({ value }) => {
    const selectedIds = this.getSelectedIds();

    if (value === 'selectLanguage' || !selectedIds.length) {
      return;
    }

    this.props.onLanguageChange(selectedIds, parseInt(value));
  }

  onQualityChange = ({ value }) => {
    const selectedIds = this.getSelectedIds();

    if (value === 'selectQuality' || !selectedIds.length) {
      return;
    }

    this.props.onQualityChange(selectedIds, parseInt(value));
  }

  //
  // Render

  render() {
    const {
      isDeleting,
      items,
      languages,
      qualities,
      seriesType,
      onModalClose
    } = this.props;

    const {
      allSelected,
      allUnselected,
      selectedState
    } = this.state;

    const languageOptions = _.reduceRight(languages, (acc, language) => {
      acc.push({
        [language.id]: language.name
      });

      return acc;
    }, [{ 'selectLanguage': 'Select Language' }]);

    const qualityOptions = _.reduceRight(qualities, (acc, quality) => {
      acc.push({
        [quality.id]: quality.name
      });

      return acc;
    }, [{ 'selectQuality': 'Select Quality' }]);

    return (
      <ModalContent onModalClose={onModalClose}>
        <ModalHeader>
          Manage Episodes
        </ModalHeader>

        <ModalBody>
          {
            !items.length &&
              <div>
                No episode files to manage.
              </div>
          }

          {
            !!items.length &&
              <Table
                columns={columns}
                selectAll={true}
                allSelected={allSelected}
                allUnselected={allUnselected}
                onSelectAllChange={this.onSelectAllChange}
              >
                <TableBody>
                  {
                    items.map((item) => {
                      return (
                        <EpisodeFileEditorRow
                          key={item.id}
                          seriesType={seriesType}
                          isSelected={selectedState[item.id]}
                          {...item}
                          onSelectedChange={this.onSelectedChange}
                        />
                      );
                    })
                  }
                </TableBody>
              </Table>
          }
        </ModalBody>

        <ModalFooter>
          <div className={styles.actions}>
            <SpinnerButton
              kind={kinds.DANGER}
              isSpinning={isDeleting}
              onPress={this.onDeletePress}
            >
              Delete
            </SpinnerButton>

            <div className={styles.selectInput}>
              <SelectInput
                name="language"
                value="selectLanguage"
                values={languageOptions}
                onChange={this.onLanguageChange}
              />
            </div>

            <div className={styles.selectInput}>
              <SelectInput
                name="quality"
                value="selectQuality"
                values={qualityOptions}
                onChange={this.onQualityChange}
              />
            </div>
          </div>

          <Button
            onPress={onModalClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    );
  }
}

EpisodeFileEditorModalContent.propTypes = {
  isDeleting: PropTypes.bool.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  languages: PropTypes.arrayOf(PropTypes.object).isRequired,
  qualities: PropTypes.arrayOf(PropTypes.object).isRequired,
  seriesType: PropTypes.string.isRequired,
  onDeletePress: PropTypes.func.isRequired,
  onLanguageChange: PropTypes.func.isRequired,
  onQualityChange: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired
};

export default EpisodeFileEditorModalContent;
