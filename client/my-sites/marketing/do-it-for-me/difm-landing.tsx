import {
	WPCOM_DIFM_LITE,
	getPlan,
	PLAN_PREMIUM,
	isBusiness,
	isPremium,
	isEcommerce,
	isPro,
	getDIFMTieredPriceDetails,
} from '@automattic/calypso-products';
import { Gridicon } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { NextButton } from '@automattic/onboarding';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState, useCallback } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import QueryProductsList from 'calypso/components/data/query-products-list';
import FoldableFAQComponent from 'calypso/components/foldable-faq';
import FormattedHeader from 'calypso/components/formatted-header';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import scrollIntoViewport from 'calypso/lib/scroll-into-viewport';
import { useSelector } from 'calypso/state';
import { getCurrentUserCurrencyCode } from 'calypso/state/currency-code/selectors';
import { getProductBySlug, getProductCost } from 'calypso/state/products-list/selectors';
import { getSitePlan } from 'calypso/state/sites/selectors';
import type { TranslateResult } from 'i18n-calypso';

const Placeholder = styled.span`
	padding: 0 60px;
	animation: loading-fade 800ms ease-in-out infinite;
	background-color: var( --color-neutral-10 );
	color: transparent;
	min-height: 20px;
	@keyframes loading-fade {
		0% {
			opacity: 0.5;
		}
		50% {
			opacity: 1;
		}
		100% {
			opacity: 0.5;
		}
	}
`;

const Wrapper = styled.div`
	display: flex;
	align-items: flex-start;
	gap: 96px;
	padding: 12px;
`;

const ContentSection = styled.div`
	flex: 1;
`;

const ImageSection = styled.div`
	width: 540px;
	height: 562px;
	padding-top: 75px;
	display: flex;
	align-items: center;
	justify-content: center;
	@media ( max-width: 960px ) {
		display: none;
	}
`;

const Header = styled( FormattedHeader )`
	.formatted-header__title {
		line-height: 3rem;
	}
`;

const FAQExpander = styled( Button )`
	align-self: center;
	background: var( --studio-gray-0 );
	font-size: 0.875rem;
	padding: 12px 0;
	width: 500px;
	height: 48px;
	text-align: center;
	&&& {
		justify-content: center;
	}
	@media ( max-width: 660px ) {
		width: 90vw;
	}
`;

const FAQHeader = styled.h1`
	font-size: 2rem;
	text-align: center;
	margin: 48px 0;
`;

const FAQSection = styled.div`
	display: flex;
	flex-direction: column;
`;

const FoldableFAQ = styled( FoldableFAQComponent )`
	border: 1px solid #e9e9ea;
	padding: 0;
	margin-bottom: 24px;
	.foldable-faq__question {
		padding: 24px 16px 24px 24px;
		flex-direction: row-reverse;
		width: 100%;
		svg {
			margin-inline-end: 0;
			margin-inline-start: auto;
		}
		.foldable-faq__question-text {
			padding-inline-start: 0;
			font-size: 1.125rem;
		}
	}
	&.is-expanded {
		border: 2px solid var( --studio-blue-50 );
		background: linear-gradient(
			180deg,
			rgba( 6, 117, 196, 0.2 ) -44.3%,
			rgba( 255, 255, 255, 0 ) 100%
		);
		.foldable-faq__answer {
			margin: 0 16px 24px 0;
			ul {
				margin: 0 0 0 16px;
			}
		}
	}
	.foldable-faq__answer {
		padding: 0 16px 0 24px;
		border: 0;
	}
`;

const CTASectionWrapper = styled.div`
	display: flex;
	gap: 32px;
	margin: 2rem 0;
`;

const StepContainer = styled.div`
	display: flex;
	gap: 20px;
`;

const ProgressLine = styled.div`
	width: 1px;
	background: var( --studio-gray-5 );
	height: 100%;
`;

const VerticalStepProgress = styled.div`
	display: flex;
	flex-direction: column;
	margin: 36px 0 12px 0;
	${ StepContainer }:last-child {
		${ ProgressLine } {
			display: none;
		}
	}
`;

const IndexContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;

const Index = styled.div`
	border-radius: 50%;
	border: 1px solid var( --studio-gray-5 );
	color: var( --studio-gray-30 );
	font-size: 1.125rem;
	height: 20px;
	line-height: 20px;
	padding: 10px;
	text-align: center;
	width: 20px;
`;
const Title = styled.div`
	margin-bottom: 6px;
	color: var( --studio-gray-100 );
	font-weight: 500;
`;
const Description = styled.div`
	color: var( --studio-gray-60 );
	padding-bottom: 18px;
	font-size: 0.875rem;
`;

const Step = ( {
	index,
	title,
	description,
}: {
	index: TranslateResult;
	title: TranslateResult;
	description: TranslateResult;
} ) => {
	return (
		<StepContainer>
			<IndexContainer>
				<Index>{ index }</Index>
				<ProgressLine />
			</IndexContainer>
			<div>
				<Title>{ title }</Title>
				<Description>{ description }</Description>
			</div>
		</StepContainer>
	);
};

export default function DIFMLanding( {
	onSubmit,
	siteId,
}: {
	onSubmit: () => void;
	onSkip?: () => void;
	isInOnboarding: boolean;
	siteId?: number | null;
} ) {
	const translate = useTranslate();

	const product = useSelector( ( state ) => getProductBySlug( state, WPCOM_DIFM_LITE ) );
	const productCost = product?.cost;

	const planObject = getPlan( PLAN_PREMIUM );
	const planTitle = planObject?.getTitle();
	const planCostInteger = useSelector( ( state ) => getProductCost( state, PLAN_PREMIUM ) );

	const difmTieredPriceDetails = getDIFMTieredPriceDetails( product );
	const extraPageCost = difmTieredPriceDetails?.perExtraPagePrice;

	const currencyCode = useSelector( getCurrentUserCurrencyCode );
	const hasPriceDataLoaded = productCost && extraPageCost && planCostInteger && currencyCode;

	const displayCost = hasPriceDataLoaded
		? formatCurrency( productCost, currencyCode, { stripZeros: true } )
		: '';

	const planCost = hasPriceDataLoaded
		? formatCurrency( planCostInteger, currencyCode, { stripZeros: true } )
		: '';

	const extraPageDisplayCost = hasPriceDataLoaded
		? formatCurrency( extraPageCost, currencyCode, {
				stripZeros: true,
				isSmallestUnit: true,
		  } )
		: '';

	const faqHeader = useRef( null );
	const [ isFAQSectionOpen, setIsFAQSectionOpen ] = useState( false );
	const onFAQButtonClick = useCallback( () => {
		setIsFAQSectionOpen( ( isFAQSectionOpen ) => ! isFAQSectionOpen );
	}, [ setIsFAQSectionOpen ] );

	useEffect( () => {
		if ( isFAQSectionOpen && faqHeader.current ) {
			scrollIntoViewport( faqHeader.current, {
				behavior: 'smooth',
				scrollMode: 'if-needed',
			} );
		}
	}, [ isFAQSectionOpen ] );

	const headerText = translate(
		'Let us build your site for {{PriceWrapper}}%(displayCost)s{{/PriceWrapper}}{{sup}}*{{/sup}}',
		{
			components: {
				PriceWrapper: ! hasPriceDataLoaded ? <Placeholder /> : <span />,
				sup: <sup />,
			},
			args: {
				displayCost,
			},
		}
	);

	const currentPlan = useSelector( ( state ) => ( siteId ? getSitePlan( state, siteId ) : null ) );
	const hasPremiumOrHigherPlan = currentPlan?.product_slug
		? [ isPremium, isBusiness, isEcommerce, isPro ].some( ( planMatcher ) =>
				planMatcher( {
					productSlug: currentPlan.product_slug,
				} )
		  )
		: false;

	const subHeaderText = hasPremiumOrHigherPlan
		? translate(
				'{{sup}}*{{/sup}}One time fee. A WordPress.com professional will create layouts for up to %(freePages)d pages of your site. It only takes 4 simple steps:',
				{
					args: {
						freePages: 5,
					},
					components: {
						sup: <sup />,
					},
				}
		  )
		: translate(
				'{{sup}}*{{/sup}}One time fee, plus an additional purchase of the %(plan)s plan. A WordPress.com professional will create layouts for up to %(freePages)d pages of your site. It only takes 4 simple steps:',
				{
					args: {
						plan: planTitle ?? '',
						freePages: 5,
					},
					components: {
						sup: <sup />,
					},
				}
		  );

	return (
		<>
			{ ! hasPriceDataLoaded && <QueryProductsList /> }
			<Wrapper>
				<ContentSection>
					<Header align="left" headerText={ headerText } subHeaderText={ subHeaderText } />
					<VerticalStepProgress>
						<Step
							index={ translate( '1' ) }
							title={ translate( 'Submit your business information' ) }
							description={ translate( 'Optionally provide your profiles to be found on social.' ) }
						/>

						<Step
							index={ translate( '2' ) }
							title={ translate( 'Select your design and pages' ) }
							description={ translate( 'Can’t decide? Let our experts choose the best design!' ) }
						/>

						<Step
							index={ translate( '3' ) }
							title={ translate( 'Complete the purchase' ) }
							description={ translate( 'Try risk free with a %(days)d-day money back guarantee.', {
								args: {
									days: 14,
								},
								comment: 'the arg is the refund period in days',
							} ) }
						/>

						<Step
							index={ translate( '4' ) }
							title={ translate( 'Submit content for your new website' ) }
							description={ translate( 'Content can be edited later with the WordPress editor.' ) }
						/>
					</VerticalStepProgress>
					<p>
						{ translate(
							'Share your finished site with the world in %(days)d business days or less!',
							{
								args: {
									days: 4,
								},
							}
						) }
					</p>
					<CTASectionWrapper>
						<NextButton onClick={ onSubmit } isPrimary={ true }>
							{ translate( 'Get started' ) }
						</NextButton>
					</CTASectionWrapper>
				</ContentSection>
				<ImageSection>
					<AsyncLoad require="./site-build-showcase" placeholder={ <LoadingEllipsis /> } />
				</ImageSection>
			</Wrapper>

			<FAQSection>
				<FAQExpander
					ref={ faqHeader }
					onClick={ onFAQButtonClick }
					icon={ <Gridicon icon={ isFAQSectionOpen ? 'chevron-up' : 'chevron-down' } /> }
				>
					{ isFAQSectionOpen
						? translate( 'Hide Frequently Asked Questions' )
						: translate( 'Show Frequently Asked Questions' ) }
				</FAQExpander>
				{ isFAQSectionOpen && (
					<>
						{ /* eslint-disable-next-line wpcalypso/jsx-classname-namespace */ }
						<FAQHeader className="wp-brand-font">
							{ translate( 'Frequently Asked Questions' ) }{ ' ' }
						</FAQHeader>
						<FoldableFAQ
							id="faq-1"
							expanded={ true }
							question={ translate( 'What is Built By WordPress.com Express, and who is it for?' ) }
						>
							<p>
								{ translate(
									'Our website-building service is for anyone who wants a polished website fast: small businesses, personal websites, bloggers, clubs or organizations, and more. ' +
										"Just answer a few questions, submit your content, and we'll handle the rest. " +
										"Click the button above to start, and you'll receive your customized 5-page site within 4 business days!"
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-2" question={ translate( 'How much does it cost?' ) }>
							<p>
								{ translate(
									'The service costs %(displayCost)s, plus an additional %(planCost)s for the %(planTitle)s plan, which offers fast, secure hosting, video embedding, 13 GB of storage, a free domain for one year, and live chat support.',
									{
										args: {
											displayCost,
											planTitle: planTitle ?? '',
											planCost,
										},
									}
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ
							id="faq-3"
							question={ translate( 'Can I purchase additional pages if I need more than five?' ) }
						>
							<p>
								{ translate(
									'Yes, extra pages can be purchased for %(extraPageDisplayCost)s each.',
									{
										args: {
											extraPageDisplayCost,
										},
									}
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ
							id="faq-4"
							question={ translate( "What if I don't have enough images or content?" ) }
						>
							<p>
								{ translate(
									"Don't worry if you don't have images or content for every page. " +
										"After checkout, you'll have an option to opt into AI text creation. " +
										'Our design team can select images and use AI to create your site content, all of which you can edit later using the editor. ' +
										"If you select the blog page during sign up, we'll even create three blog posts for you to get you started!"
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-5" question={ translate( 'When will you contact me?' ) }>
							<p>
								{ translate(
									'After you check out, you’ll fill out a content upload form that includes any design preferences and reference sites. ' +
										"While we can't guarantee an exact match, we'll consider all your feedback during site construction, and you'll receive an email when your new site is ready — always within four business days."
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ
							id="faq-6"
							question={ translate( 'What will my completed website look like?' ) }
						>
							<p>
								{ translate(
									'Each website is unique, mobile-friendly, and customized to your brand and content. ' +
										'With a 97% satisfaction rate, we are confident that you will love your new site, just like hundreds of customers before you. ' +
										'Additionally, we offer a 14-day refund window, giving you peace of mind.'
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-7" question={ translate( 'How many revisions are included?' ) }>
							<p>
								{ translate(
									'While this service does not include revisions, once you’ve received your completed site, you can modify everything using the WordPress editor – colors, text, images, adding new pages, and anything else you’d like to tweak. ' +
										'Furthermore, our Premium plan offers live chat and priority email support if you need assistance.'
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ
							id="faq-8"
							question={ translate( 'What happens to my existing content?' ) }
						>
							<p>
								{ translate(
									'If you choose to use your current WordPress.com site, your existing content will remain untouched. ' +
										"We'll create new pages with your provided content while applying a new, customized theme. However, we won't edit any existing content on your site's pages."
								) }
							</p>
						</FoldableFAQ>
						<FoldableFAQ id="faq-9" question={ translate( 'Can I use my existing domain name?' ) }>
							<p>
								{ translate(
									'Yes, our support team will help you connect your existing domain name to your site after the build is complete.'
								) }
							</p>
						</FoldableFAQ>
					</>
				) }
			</FAQSection>
		</>
	);
}
