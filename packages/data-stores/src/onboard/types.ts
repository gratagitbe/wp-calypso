import type { DomainSuggestion } from '../domain-suggestions';

export type DomainForm = {
	lastQuery?: string;
	subdomainSearchResults?: DomainSuggestion[] | null;
	loadingResults?: boolean;
	searchResults?: DomainSuggestion[] | null;
	hideInitialQuery?: boolean;
};

export interface ProfilerData {
	[ key: string ]: string | number | boolean | string[] | number[];
}

export type BulkDomainTransferNames = Record< string, string >;

export type BulkDomainTransferAuthCodes = Record<
	string,
	{
		auth: string;
		valid: boolean;
	}
>;

export type BulkDomainTransferData = Record<
	string,
	{
		domain: string;
		auth: string;
		valid: boolean;
	}
>;
