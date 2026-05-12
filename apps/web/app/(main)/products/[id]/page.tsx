import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getMainDataAction } from '@/actions/main.action';
import { getProductDetailAction } from '@/actions/products.action';
import PageContainer from '@/components/layout/PageContainer';
import RecommendedProducts from '@/components/main/RecommendedProducts';
import { mapSearchItemToProductInfo } from '@/lib/api/products';

import { ProductDetailHero } from './_components/ProductDetailHero';
import { ProductInfoTable } from './_components/ProductInfoTable';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

// 동적 메타데이터 생성 (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id) || idParam !== id.toString()) {
    return {
      title: '상품을 찾을 수 없습니다 | Baristation',
      description: '존재하지 않는 상품 페이지입니다.',
    };
  }

  const result = await getProductDetailAction(id);
  if (!result.success || !result.data) {
    return {
      title: '상품을 찾을 수 없습니다 | Baristation',
      description: '존재하지 않는 상품 페이지입니다.',
    };
  }

  // TODO: 상세 응답 스펙 확정 시 맵퍼 수정 필요. 우선 목록과 동일한 스키마로 가정합니다.
  const product = mapSearchItemToProductInfo(result.data);

  const title = `${product.name} - Baristation`;
  const description = `${product.origin}에서 온 ${product.primaryFlavor} 향미의 매력적인 상품입니다.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: product.flavorImageUrl,
          alt: `${product.name} 이미지`,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);

  if (isNaN(id) || idParam !== id.toString()) {
    notFound();
  }

  const result = await getProductDetailAction(id);
  if (!result.success || !result.data) {
    notFound();
  }

  // TODO: 상세 데이터 스키마 확정 전까지 검색 아이템 스키마로 임시 매핑
  const product = mapSearchItemToProductInfo(result.data);

  const mainDataResult = await getMainDataAction();
  const recommendedProducts =
    mainDataResult.success && mainDataResult.data ? mainDataResult.data.recommendedProducts : [];

  return (
    <PageContainer>
      <ProductDetailHero
        name={product.name}
        origin={product.origin}
        roastery={product.roastery}
        flavorImageUrl={product.flavorImageUrl}
        primaryFlavor={product.primaryFlavor}
        purchaseUrl={product.purchaseUrl}
      />
      <ProductInfoTable
        origin={product.origin}
        category={product.category}
        blend={product.blend}
        processing={product.processing}
        variety={product.variety}
        altitude={product.altitude}
        description={product.description}
      />
      {/* <FlavorProfileSection
        balance={product.balance || 0}
        sweetness={product.sweetness || 0}
        acidity={product.acidity || 0}
        body={product.body || 0}
        roasting={product.roasting || 0}
      /> */}
      <RecommendedProducts products={recommendedProducts} />
    </PageContainer>
  );
}
