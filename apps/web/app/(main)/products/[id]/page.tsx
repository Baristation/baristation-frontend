import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getProductDetailAction } from '@/actions/products.action';
import PageContainer from '@/components/layout/PageContainer';

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

  const product = result.data;
  const title = `${product.beanSummary.beanNameKo} - Baristation`;
  const flavors = product.flavorNotes.map((f) => f.nameKo).join(', ');
  const description = `${product.beanSummary.origin}에서 온 ${flavors} 향미의 매력적인 원두입니다.`;
  const imageUrl = product.beanSummary.productImage?.imageUrl || '/images/default-product.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: `${product.beanSummary.beanNameKo} 이미지`,
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

  const product = result.data;

  return (
    <PageContainer>
      <ProductDetailHero
        beanSummary={product.beanSummary}
        roaster={product.roaster}
        agtronMin={product.agtronMin}
        agtronMax={product.agtronMax}
        additionalImages={product.images}
        flavorNotes={product.flavorNotes}
        productUrl={product.productUrl}
      />
      <ProductInfoTable beanSummary={product.beanSummary} description={product.description} />
      <FlavorProfileSection
        balance={product.balance}
        sweetness={product.sweetness}
        acidity={product.acidity}
        body={product.body}
        roastingType={product.roastingType}
      />
    </PageContainer>
  );
}
