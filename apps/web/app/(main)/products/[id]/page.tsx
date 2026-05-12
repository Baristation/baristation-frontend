import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getMainDataAction } from '@/actions/main.action';
import PageContainer from '@/components/layout/PageContainer';
import RecommendedProducts from '@/components/main/RecommendedProducts';
import { mockProductsData } from '@/lib/api/products';

import { FlavorProfileSection } from './_components/FlavorProfileSection';
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
  const product =
    !isNaN(id) && idParam === id.toString() ? mockProductsData.find((b) => b.id === id) : null;

  if (!product) {
    return {
      title: '원두를 찾을 수 없습니다 | Baristation',
      description: '존재하지 않는 원두 페이지입니다.',
    };
  }

  const title = `${product.name} - ${product.roastery || 'Baristation'}`;
  const description =
    product.description ||
    `${product.origin}에서 온 ${product.primaryFlavor} 향미의 매력적인 원두입니다.`;

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

  // ID가 숫자가 아니거나 유효하지 않은 정수인 경우 404 처리
  if (isNaN(id) || idParam !== id.toString()) {
    notFound();
  }

  const product = mockProductsData.find((b) => b.id === id);

  if (!product) {
    notFound();
  }

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
      <FlavorProfileSection
        balance={product.balance || 0}
        sweetness={product.sweetness || 0}
        acidity={product.acidity || 0}
        body={product.body || 0}
        roasting={product.roasting || 0}
      />
      <RecommendedProducts products={recommendedProducts} />
    </PageContainer>
  );
}
