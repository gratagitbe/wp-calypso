/**
 * @group calypso-pr
 */

import { DataHelper, LoginFlow, SupportComponent, setupHooks } from '@automattic/calypso-e2e';
import { Page } from 'playwright';

describe( DataHelper.createSuiteTitle( 'Support: My Home' ), function () {
	let page: Page;

	setupHooks( ( args ) => {
		page = args.page;
	} );

	describe.each( [
		{ siteType: 'Simple', user: 'defaultUser' },
		{ siteType: 'Atomic', user: 'wooCommerceUser' },
	] )( 'Search from Support Card ($siteType)', function ( { user } ) {
		let supportComponent: SupportComponent;

		it( 'Log in', async function () {
			const loginFlow = new LoginFlow( page, user );
			await loginFlow.logIn();
		} );

		it( 'Displays default entries', async function () {
			supportComponent = new SupportComponent( page );
			await supportComponent.showSupportCard();
			await supportComponent.defaultStateShown();
		} );

		it( 'Enter valid search keyword', async function () {
			const keyword = 'Domain';
			await supportComponent.search( keyword );
		} );

		it( 'Search results are shown', async function () {
			const results = await supportComponent.getResults( 'article' );
			expect( results.length ).toBeGreaterThan( 0 );
		} );

		it( 'Clear keyword', async function () {
			await supportComponent.clearSearch();
		} );

		it( 'Default entries are shown again', async function () {
			await supportComponent.defaultStateShown();
		} );

		it( 'Enter invalid search keyword', async function () {
			const keyword = ';;;ppp;;;';
			await supportComponent.search( keyword );
		} );

		it( 'No search results are shown', async function () {
			await supportComponent.noResultsShown();
		} );

		it( 'Enter empty search keyword', async function () {
			const keyword = '        ';
			await supportComponent.clearSearch();
			await supportComponent.search( keyword );
		} );

		it( 'Continues to display default results', async function () {
			await supportComponent.noResultsShown();
		} );
	} );
} );
