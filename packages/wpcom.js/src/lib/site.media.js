import debugFactory from 'debug';
import TusUploader from './tus-uploader';
import { createReadStream } from './util/fs';

const debug = debugFactory( 'wpcom:media' );

/**
 * Build a formData object to be sent in a POST request
 *
 * @param  {Array|File} files - array of files
 * @returns {Array} formData array
 */
function buildFormData( files ) {
	const formData = [];
	const isArray = Array.isArray( files );
	files = isArray ? files : [ files ];

	let i;
	let f;
	let k;
	let param;
	for ( i = 0; i < files.length; i++ ) {
		f = files[ i ];

		if ( 'string' === typeof f ) {
			f = createReadStream( f );
		}

		const isStream = !! f._readableState;
		const isFile = 'undefined' !== typeof File && f instanceof File;

		debug( 'isStream: %s', isStream );
		debug( 'isFile: %s', isFile );

		if ( ! isFile && ! isStream ) {
			// process file attributes like as `title`, `description`, ...
			for ( k in f ) {
				debug( 'add %o => %o', k, f[ k ] );
				if ( 'file' !== k ) {
					param = 'attrs[' + i + '][' + k + ']';
					formData.push( [ param, f[ k ] ] );
				}
			}
			// set file path
			f = f.file;
			if ( 'string' === typeof f ) {
				f = createReadStream( f );
			}
		}

		formData.push( [ 'media[]', f ] );
	}

	return formData;
}

/**
 * Media methods
 *
 * @param {string} id - media id
 * @param {string} sid site id
 * @param {WPCOM} wpcom - wpcom instance
 * @returns {Media|undefined}
 */
export default function Media( id, sid, wpcom ) {
	if ( ! ( this instanceof Media ) ) {
		return new Media( id, sid, wpcom );
	}

	this.wpcom = wpcom;
	this._sid = sid;
	this._id = id;

	if ( ! this._id ) {
		debug( 'WARN: media `id` is not defined' );
	}
}

/**
 * Get media
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Media.prototype.get = function ( query = {}, fn ) {
	query.apiVersion = query.apiVersion || '1.2';
	const path = '/sites/' + this._sid + '/media/' + this._id;
	return this.wpcom.req.get( path, query, fn );
};

/**
 * Update media
 *
 * @param {Object} [query] - query object parameter
 * @param {Object} body - body object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Media.prototype.update = function ( query, body, fn ) {
	const params = { path: '/sites/' + this._sid + '/media/' + this._id };
	return this.wpcom.req.put( params, query, body, fn );
};

/**
 * Edit media
 *
 * @param {Object} [query] - query object parameter
 * @param {Object} body - body object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Media.prototype.edit = function ( query, body, fn ) {
	if ( typeof body === 'function' || ! body ) {
		fn = body;
		body = query;
		query = {};
	}

	const params = { path: '/sites/' + this._sid + '/media/' + this._id + '/edit' };

	if ( body && body.media ) {
		params.formData = [ [ 'media', body.media ] ];
		delete body.media;

		for ( const k in body ) {
			params.formData.push( [ `attrs[${ k }]`, body[ k ] ] );
		}

		body = null;
	}

	return this.wpcom.req.put( params, query, body, fn );
};

/**
 * Add media file
 *
 * @param {Object} [query] - query object parameter
 * @param {string | Object | Array} files - files to add
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Media.prototype.addFiles = function ( query, files, fn ) {
	if ( undefined === fn ) {
		if ( undefined === files ) {
			files = query;
			query = {};
		} else if ( 'function' === typeof files ) {
			fn = files;
			files = query;
			query = {};
		}
	}

	if ( ! Array.isArray( files ) ) {
		files = [ files ];
	}

	const videoFiles = this.filterFilesUploadableOnVideoPress( files );
	if ( videoFiles.length ) {
		const uploader = new TusUploader( this.wpcom, this._sid );
		return uploader.startUpload( videoFiles );
	}

	const params = {
		path: '/sites/' + this._sid + '/media/new',
		formData: buildFormData( files ),
	};

	return this.wpcom.req.post( params, query, null, fn );
};

/**
 * Filters an array to only return files that can use VideoPress for upload.
 *
 * @param {Array} files An array of file objects
 * @returns {Array}
 */
Media.prototype.filterFilesUploadableOnVideoPress = function ( files ) {
	return files.filter( ( file ) => this.fileCanBeUploadedOnVideoPress( file ) );
};

/**
 * Checks whether a media file can use VideoPress for upload.
 *
 * @param {Object} file A file object
 * @returns {boolean}
 */
Media.prototype.fileCanBeUploadedOnVideoPress = function ( file ) {
	return !! file.canUseVideoPress && !! file.type && file.type.startsWith( 'video/' );
};

/**
 * Add media files from URL
 *
 * @param {Object} [query] - query object parameter
 * @param {string | Array | Object} media - files to add
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Media.prototype.addUrls = function ( query, media, fn ) {
	if ( undefined === fn ) {
		if ( undefined === media ) {
			media = query;
			query = {};
		} else if ( 'function' === typeof media ) {
			fn = media;
			media = query;
			query = {};
		}
	}

	const path = '/sites/' + this._sid + '/media/new';
	const body = { media_urls: [] };

	// process formData
	let i;
	let m;
	let url;
	let k;

	media = Array.isArray( media ) ? media : [ media ];
	for ( i = 0; i < media.length; i++ ) {
		m = media[ i ];

		if ( 'string' === typeof m ) {
			url = m;
		} else {
			if ( ! body.attrs ) {
				body.attrs = [];
			}

			// add attributes
			body.attrs[ i ] = {};
			for ( k in m ) {
				if ( 'url' !== k ) {
					body.attrs[ i ][ k ] = m[ k ];
				}
			}
			url = m.url;
		}

		// push url into [media_url]
		body.media_urls.push( url );
	}

	return this.wpcom.req.post( path, query, body, fn );
};

/**
 * Delete media
 *
 * @param {Object} [query] - query object parameter
 * @param {Function} fn - callback function
 * @returns {Function} request handler
 */
Media.prototype.delete = Media.prototype.del = function ( query, fn ) {
	const path = '/sites/' + this._sid + '/media/' + this._id + '/delete';
	return this.wpcom.req.del( path, query, fn );
};
