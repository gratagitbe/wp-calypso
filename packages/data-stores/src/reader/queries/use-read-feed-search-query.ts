import { Railcar } from '@automattic/calypso-analytics';
import { useInfiniteQuery } from '@tanstack/react-query';
import { buildQueryString } from '@wordpress/url';
import wpcomRequest from 'wpcom-proxy-request';

export enum FeedSort {
	LastUpdated = 'last_updated',
	Relevance = 'relevance',
}

type FetchReadFeedSearchType = {
	query?: string;
	excludeFollowed?: boolean;
	sort?: FeedSort;
};

type FeedItem = {
	URL: string;
	blog_ID: string;
	feed_ID: string;
	meta: {
		links: {
			feed: string;
			site: string;
		};
	};
	railcar: Railcar;
	subscribe_URL: string;
	subscribers_count: number;
	title: string;
};

type FeedResponse = {
	algorithm: string;
	feeds: FeedItem[];
	next_page: string;
	total: number;
};

const useReadFeedSearch = ( {
	query,
	excludeFollowed = false,
	sort = FeedSort.Relevance,
}: FetchReadFeedSearchType ) => {
	return useInfiniteQuery(
		[ 'readFeedSearch', query, excludeFollowed, sort ],
		async ( { pageParam: pageParamQueryString } ) => {
			if ( query === undefined ) {
				return;
			}

			const urlQuery = buildQueryString( {
				q: query,
				exclude_followed: excludeFollowed,
				sort,
			} ).concat( pageParamQueryString ? `&${ pageParamQueryString }` : '' );

			return wpcomRequest< FeedResponse >( {
				path: '/read/feed',
				apiVersion: '1.1',
				method: 'GET',
				query: urlQuery,
			} );
		},
		{
			enabled: Boolean( query ),
			getNextPageParam: ( lastPage ) => lastPage?.next_page,
		}
	);
};

export default useReadFeedSearch;
