import { includes } from 'lodash';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';

/**
 * Check if an email address is disallowed according to
 * the list of blocked addresses for the site.
 *
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @param {string} email An email address.
 * @returns {boolean} If the email address is disallowed.
 */
export const isAuthorsEmailBlocked = ( state, siteId, email = '' ) => {
	const blocklist = getSiteSetting( state, siteId, 'disallowed_keys' ) || '';
	return includes( blocklist.split( '\n' ), email );
};

export default isAuthorsEmailBlocked;
