import { getThemeType, isThemePremium } from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

/**
 * Returns the URL for signing up for a new WordPress.com account with the given theme pre-selected.
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {?string}         Signup URL
 */
export function getThemeSignupUrl( state, themeId ) {
	if ( ! themeId ) {
		return null;
	}

	let url = '/start/with-theme?ref=calypshowcase&theme=' + themeId;

	if ( isThemePremium( state, themeId ) ) {
		url += '&premium=true';
	}

	const themeType = getThemeType( state, themeId );
	url += `&theme_type=${ themeType }`;

	return url;
}
