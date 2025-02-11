import debugFactory from 'debug';
import { GP_BASE_URL } from './constants';

const debug = debugFactory( 'calypso:i18n-utils:glotpress' );

/**
 * Sends the POST request
 *
 * @param {string} glotPressUrl API url
 * @param {string} postFormData post data url param string
 * @returns {Object} request object
 */
export async function postRequest( glotPressUrl, postFormData ) {
	const response = await window.fetch( glotPressUrl, {
		method: 'POST',
		credentials: 'include',
		body: postFormData,
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	} );
	if ( response.ok ) {
		return await response.json();
	}

	// Invalid response.
	throw new Error( await response.body );
}

export function encodeOriginalKey( { original, context } ) {
	return context + '\u0004' + original;
}

/**
 * Sends originals to translate.wordpress.com to be recorded
 *
 * @param {[string]} originalKeys Array of original keys to record
 * @param {string} recordId fallback recordId to pass to the backend
 * @param {Function} post see postRequest()
 * @returns {Object} request object
 */
export function recordOriginals( originalKeys, recordId, post = postRequest ) {
	const glotPressUrl = `${ GP_BASE_URL }/api/translations/-record-originals`;
	const recordIdQueryFragment = recordId ? `record_id=${ encodeURIComponent( recordId ) }&` : '';
	const postFormData =
		recordIdQueryFragment + `originals=${ encodeURIComponent( JSON.stringify( originalKeys ) ) }`;

	return post( glotPressUrl, postFormData ).catch( ( err ) =>
		debug( 'recordOriginals failed:', err )
	);
}
