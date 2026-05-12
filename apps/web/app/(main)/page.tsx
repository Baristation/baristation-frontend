import React from 'react';

import { getMainDataAction } from '@/actions/main.action';
import PageContainer from '@/components/layout/PageContainer';
import FlavorNotes from '@/components/main/FlavorNotes';
import HeroSection from '@/components/main/HeroSection';
import RecommendedProducts from '@/components/main/RecommendedProducts';
import RoasteryMapSection from '@/components/main/RoasteryMapSection';

export default async function Home() {
  const result = await getMainDataAction();
  const flavors = result.success && result.data ? result.data.flavors : [];
  const recommendedProducts = result.success && result.data ? result.data.recommendedProducts : [];

  return (
    <PageContainer withHeaderOffset={false}>
      <HeroSection />
      <FlavorNotes flavors={flavors} />
      <RecommendedProducts products={recommendedProducts} />
      <RoasteryMapSection />
    </PageContainer>
  );
}
