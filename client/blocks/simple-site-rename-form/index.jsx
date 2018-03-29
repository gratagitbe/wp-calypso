/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { get, flow, inRange, isEmpty } from 'lodash';
import Gridicon from 'gridicons';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';
import ConfirmationDialog from './dialog';
import FormSectionHeading from 'components/forms/form-section-heading';
import TrackComponentView from 'lib/analytics/track-component-view';
import { requestSiteRename } from 'state/site-rename/actions';
import { isRequestingSiteRename } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const SUBDOMAIN_LENGTH_MINIMUM = 4;
const SUBDOMAIN_LENGTH_MAXIMUM = 50;
const ADDRESS_CHANGE_SUPPORT_URL = 'https://support.wordpress.com/changing-blog-address/';

export class SimpleSiteRenameForm extends Component {
	static propTypes = {
		currentDomainSuffix: PropTypes.string.isRequired,
		currentDomain: PropTypes.object.isRequired,

		// `connect`ed
		isSiteRenameRequesting: PropTypes.bool,
		selectedSiteId: PropTypes.number,
	};

	static defaultProps = {
		currentDomainSuffix: '.wordpress.com',
		currentDomain: {},
	};

	state = {
		showDialog: false,
		domainFieldValue: '',
		domainFieldError: '',
	};

	onConfirm = () => {
		const { selectedSiteId } = this.props;
		// @TODO: Give ability to chose whether or not to discard the original site address.
		const discard = true;

		this.props.requestSiteRename( selectedSiteId, this.state.domainFieldValue, discard );
	};

	getDomainValidationMessage( domain ) {
		const { translate } = this.props;

		if ( isEmpty( domain ) ) {
			return '';
		}

		if ( domain.match( /[^a-z0-9]/i ) ) {
			return translate( 'Your site address can only contain letters and numbers.' );
		}

		if ( ! inRange( domain.length, SUBDOMAIN_LENGTH_MINIMUM, SUBDOMAIN_LENGTH_MAXIMUM ) ) {
			return translate(
				'Your site address should be between %(minimumLength)s and %(maximumLength)s characters in length.',
				{
					args: {
						minimumLength: SUBDOMAIN_LENGTH_MINIMUM,
						maximumLength: SUBDOMAIN_LENGTH_MAXIMUM,
					},
				}
			);
		}

		return '';
	}

	showConfirmationDialog() {
		this.setState( {
			showDialog: true,
		} );
	}

	onSubmit = event => {
		const domainFieldError = this.getDomainValidationMessage( this.state.domainFieldValue );

		this.setState( { domainFieldError } );
		! domainFieldError && this.showConfirmationDialog();

		event.preventDefault();
	};

	onDialogClose = () => {
		this.setState( {
			showDialog: false,
		} );
	};

	onFieldChange = event => {
		const domainFieldValue = get( event, 'target.value', '' ).toLowerCase();
		const shouldUpdateError = ! isEmpty( this.state.domainFieldError );

		this.setState( {
			domainFieldValue,
			...( shouldUpdateError && {
				domainFieldError: this.getDomainValidationMessage( domainFieldValue ),
			} ),
		} );
	};

	render() {
		const { currentDomain, currentDomainSuffix, isSiteRenameRequesting, translate } = this.props;
		const currentDomainName = get( currentDomain, 'name', '' );
		const currentDomainPrefix = currentDomainName.replace( currentDomainSuffix, '' );
		const { domainFieldError, domainFieldValue } = this.state;
		const isDisabled =
			! domainFieldValue || !! domainFieldError || domainFieldValue === currentDomainPrefix;

		if ( ! currentDomain.currentUserCanManage ) {
			return (
				<div className="simple-site-rename-form simple-site-rename-form__only-owner-info">
					<Gridicon icon="info-outline" />
					{ isEmpty( currentDomain.owner )
						? translate( 'Only the site owner can edit this domain name.' )
						: translate(
								'Only the site owner ({{strong}}%(ownerInfo)s{{/strong}}) can edit this domain name.',
								{
									args: { ownerInfo: currentDomain.owner },
									components: { strong: <strong /> },
								}
							) }
				</div>
			);
		}

		return (
			<div className="simple-site-rename-form">
				<ConfirmationDialog
					isVisible={ this.state.showDialog }
					onClose={ this.onDialogClose }
					newDomainName={ domainFieldValue }
					currentDomainName={ currentDomainPrefix }
					onConfirm={ this.onConfirm }
				/>
				<form onSubmit={ this.onSubmit }>
					<TrackComponentView eventName="calypso_siterename_form_view" />
					<Card className="simple-site-rename-form__content">
						<FormSectionHeading>{ translate( 'Change Site Address' ) }</FormSectionHeading>
						<FormTextInputWithAffixes
							type="text"
							value={ this.state.domainFieldValue }
							suffix={ currentDomainSuffix }
							onChange={ this.onFieldChange }
							placeholder={ currentDomainPrefix }
							isError={ !! domainFieldError }
						/>
						{ domainFieldError && <FormInputValidation isError text={ domainFieldError } /> }
						<div className="simple-site-rename-form__footer">
							<div className="simple-site-rename-form__info">
								<Gridicon icon="info-outline" size={ 18 } />
								<p>
									{ translate(
										'Once you change your site address, %(currentDomainName)s will no longer be available. ' +
											'{{link}}Before you confirm the change, please read this important information.{{/link}}',
										{
											args: { currentDomainName },
											components: {
												link: <a href={ ADDRESS_CHANGE_SUPPORT_URL } />,
											},
										}
									) }
								</p>
							</div>
							<FormButton disabled={ isDisabled } busy={ isSiteRenameRequesting } type="submit">
								{ translate( 'Change Site Address' ) }
							</FormButton>
						</div>
					</Card>
				</form>
			</div>
		);
	}
}

export default flow(
	localize,
	connect(
		state => {
			const siteId = getSelectedSiteId( state );

			return {
				selectedSiteId: siteId,
				isSiteRenameRequesting: isRequestingSiteRename( state, siteId ),
			};
		},
		{
			requestSiteRename,
		}
	)
)( SimpleSiteRenameForm );
