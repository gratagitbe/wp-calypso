import { getSiteOption } from 'calypso/state/sites/selectors';

/**
 * Returns the front page type.
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @returns {string} 'posts' if blog posts are set as the front page or 'page' if a static page is
 */
export default function getSiteFrontPageType( state, siteId ) {
	return getSiteOption( state, siteId, 'show_on_front' );
}
