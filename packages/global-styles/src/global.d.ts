declare module '@wordpress/block-editor' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const __unstableIframe: React.ComponentType< Props >;
	export const __unstableEditorStyles: React.ComponentType< Props >;
	export const transformStyles: ( styles: unknown[], wrapperClassName: string ) => string;
}

declare module '@wordpress/block-library' {
	export const registerCoreBlocks: () => void;
}

declare module '@wordpress/components' {
	interface Props {
		[ key: string ]: unknown;
	}

	export const __unstableComposite: React.ComponentType< Props >;
	export const __unstableCompositeItem: React.ComponentType< Props >;
	export const __unstableMotion: React.ComponenType< Props >;
	export const __unstableUseCompositeState: ( props?: {
		orientation?: 'horizontal' | 'vertical';
	} ) => any;
	export const __experimentalHStack: React.ComponentType< Props >;
	export const __experimentalVStack: React.ComponentType< Props >;
}

declare module '@wordpress/edit-site/build-module/components/global-styles/context';
declare module '@wordpress/edit-site/build-module/components/global-styles/global-styles-provider';
declare module '@wordpress/edit-site/build-module/components/global-styles/hooks';
declare module '@wordpress/edit-site/build-module/components/global-styles/preview';
declare module '@wordpress/edit-site/build-module/components/global-styles/use-global-styles-output';
