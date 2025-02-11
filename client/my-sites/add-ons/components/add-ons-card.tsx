import { PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import { Button, Gridicon, Spinner } from '@automattic/components';
import styled from '@emotion/styled';
import { Card, CardBody, CardFooter, CardHeader } from '@wordpress/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import Badge from 'calypso/components/badge';
import type { AddOnMeta } from '../hooks/use-add-ons';

export interface Props {
	actionPrimary?: {
		text: string;
		handler: ( productSlug: string, quantity?: number ) => void;
	};
	actionSecondary?: {
		text: string;
		handler: ( productSlug: string ) => void;
	};
	useAddOnAvailabilityStatus?: ( addOnMeta: AddOnMeta ) => {
		available: boolean;
		text?: string;
	};
	highlightFeatured: boolean;
	addOnMeta: AddOnMeta;
}

const Container = styled.div`
	.add-ons-card {
		width: 100%;
		height: 100%;
		border-radius: 5px;

		> div {
			// @wordpress/components<Card> wraps content in a first inner div
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			padding: 18px 10px; // Card sections have 16x24 inner padding
			box-sizing: border-box;
		}
	}

	.add-ons-card__header {
		display: flex;
		justify-content: flex-start;
		gap: 0.8em;

		.add-ons-card__icon {
			display: flex;
		}

		.add-ons-card__name-and-billing {
			.add-ons-card__billing {
				color: var( --studio-gray-60 );
				font-weight: 500;
			}

			.add-ons-card__name-tag {
				display: flex;
				align-items: center;
				gap: 10px;

				.add-ons-card__name {
					font-size: 1rem;
					font-weight: 500;
				}

				.add-ons-card__featured-badge {
					border-radius: 4px;
				}
			}
		}
	}

	.add-ons-card__footer {
		display: flex;
		margin-top: auto;

		.add-ons-card__selected-tag {
			display: flex;
			align-items: center;
			gap: 0.5em;

			.add-ons-card__checkmark {
				color: var( --studio-green-30 );
			}
		}
	}
`;

const AddOnCard = ( {
	addOnMeta,
	actionPrimary,
	actionSecondary,
	useAddOnAvailabilityStatus,
	highlightFeatured,
}: Props ) => {
	const translate = useTranslate();
	const availabilityStatus = useAddOnAvailabilityStatus?.( addOnMeta );
	const onActionPrimary = () => {
		actionPrimary?.handler( addOnMeta.productSlug, addOnMeta.quantity );
	};
	const onActionSecondary = () => {
		actionSecondary?.handler( addOnMeta.productSlug );
	};

	const shouldRenderLoadingState =
		addOnMeta.productSlug === PRODUCT_1GB_SPACE && addOnMeta.isLoading;

	// if product is space upgrade choose the action based on the purchased status
	const shouldRenderPrimaryAction =
		addOnMeta.productSlug === PRODUCT_1GB_SPACE
			? ! addOnMeta.purchased && ! shouldRenderLoadingState
			: availabilityStatus?.available && ! shouldRenderLoadingState;

	const shouldRenderSecondaryAction =
		addOnMeta.productSlug === PRODUCT_1GB_SPACE
			? addOnMeta.purchased && ! shouldRenderLoadingState
			: ! availabilityStatus?.available && ! shouldRenderLoadingState;

	return (
		<Container>
			<Card className="add-ons-card">
				<CardHeader isBorderless={ true } className="add-ons-card__header">
					<div className="add-ons-card__icon">
						<Icon icon={ addOnMeta.icon } size={ 44 } />
					</div>
					<div className="add-ons-card__name-and-billing">
						<div className="add-ons-card__name-tag">
							<div className="add-ons-card__name">{ addOnMeta.name }</div>
							{ highlightFeatured && addOnMeta.featured && (
								<Badge key="popular" type="info-green" className="add-ons-card__featured-badge">
									{ translate( 'Popular' ) }
								</Badge>
							) }
						</div>
						<div className="add-ons-card__billing">{ addOnMeta.displayCost }</div>
					</div>
				</CardHeader>
				<CardBody className="add-ons-card__body">{ addOnMeta.description }</CardBody>
				<CardFooter isBorderless={ true } className="add-ons-card__footer">
					{ shouldRenderLoadingState && (
						<Spinner size={ 24 } className="spinner-button__spinner" />
					) }
					{ shouldRenderSecondaryAction && (
						<>
							{ actionSecondary && (
								<Button onClick={ onActionSecondary }>{ actionSecondary.text }</Button>
							) }
							{ availabilityStatus?.text && (
								<div className="add-ons-card__selected-tag">
									<Gridicon icon="checkmark" className="add-ons-card__checkmark" />
									<span>{ availabilityStatus.text }</span>
								</div>
							) }
						</>
					) }
					{ shouldRenderPrimaryAction && actionPrimary && (
						<Button onClick={ onActionPrimary } primary>
							{ actionPrimary.text }
						</Button>
					) }
				</CardFooter>
			</Card>
		</Container>
	);
};

export default AddOnCard;
