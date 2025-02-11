import { Button, Icon } from '@wordpress/components';
import { chevronDown, chevronRight } from '@wordpress/icons';
import classNames from 'classnames';
import { FunctionComponent, useCallback, useEffect, useState } from 'react';
import FileInfoCard from './file-info-card';
import FileTypeIcon from './file-type-icon';
import { useTruncatedFileName } from './hooks';
import { FileBrowserItem } from './types';
import { useBackupContentsQuery } from './use-backup-contents-query';

interface FileBrowserNodeProps {
	item: FileBrowserItem;
	path: string;
	siteId: number;
	rewindId: number;
	isAlternate: boolean; // This decides if the node will have a background color or not
	setActiveNodePath: ( path: string ) => void;
	activeNodePath: string;
}

const FileBrowserNode: FunctionComponent< FileBrowserNodeProps > = ( {
	item,
	path,
	siteId,
	rewindId,
	isAlternate,
	setActiveNodePath,
	activeNodePath,
} ) => {
	const isRoot = path === '/';
	const isCurrentNodeClicked = activeNodePath === path;
	const [ fetchContentsOnMount, setFetchContentsOnMount ] = useState< boolean >( isRoot );
	const [ isOpen, setIsOpen ] = useState< boolean >( isRoot );

	const {
		isSuccess,
		isInitialLoading,
		data: backupFiles,
	} = useBackupContentsQuery( siteId, rewindId, path, fetchContentsOnMount );

	useEffect( () => {
		// When it is no longer the current node clicked, close the node
		if ( ! isCurrentNodeClicked && ! isRoot ) {
			setIsOpen( false );
		}
	}, [ isCurrentNodeClicked, isRoot ] );

	const handleClick = useCallback( () => {
		if ( ! isOpen ) {
			setFetchContentsOnMount( true );
		}

		if ( ! item.hasChildren && item.type !== 'wordpress' ) {
			if ( ! isOpen ) {
				setActiveNodePath( path );
			} else {
				setActiveNodePath( '' );
			}
		}

		setIsOpen( ! isOpen );
	}, [ isOpen, item, path, setActiveNodePath ] );

	const renderChildren = () => {
		if ( isInitialLoading ) {
			return <div className="file-browser-node__loading placeholder" />;
		}

		// @TODO: Add a message when the API fails to fetch
		if ( isSuccess ) {
			let childIsAlternate = isAlternate;

			return backupFiles.map( ( childItem ) => {
				childIsAlternate = ! childIsAlternate;

				// Let's hide archives that don't have an extension version
				if ( childItem.type === 'archive' && ! item.extensionVersion ) {
					return null;
				}

				return (
					<FileBrowserNode
						key={ childItem.name }
						item={ childItem }
						path={ `${ path }${ childItem.name }/` }
						siteId={ siteId }
						rewindId={ rewindId }
						isAlternate={ childIsAlternate }
						activeNodePath={ activeNodePath }
						setActiveNodePath={ setActiveNodePath }
					/>
				);
			} );
		}

		return null;
	};

	const renderExpandIcon = () => {
		if ( ! item.hasChildren ) {
			return null;
		}

		return <Icon icon={ isOpen ? chevronDown : chevronRight } />;
	};

	const nodeItemClassName = classNames( 'file-browser-node__item', {
		'is-alternate': isAlternate,
	} );
	const [ label, isLabelTruncated ] = useTruncatedFileName( item.name, 30, item.type );

	return (
		<div className="file-browser-node">
			<div className={ nodeItemClassName }>
				{ ! isRoot && (
					<Button
						icon={ renderExpandIcon }
						className="file-browser-node__title has-icon"
						onClick={ handleClick }
						showTooltip={ isLabelTruncated }
						label={ item.name }
					>
						<FileTypeIcon type={ item.type } /> { label }
					</Button>
				) }
			</div>
			{ isCurrentNodeClicked && <FileInfoCard siteId={ siteId } item={ item } /> }
			{ isOpen && (
				<>
					{ item.hasChildren && (
						<div className="file-browser-node__contents">{ renderChildren() }</div>
					) }
				</>
			) }
		</div>
	);
};

export default FileBrowserNode;
