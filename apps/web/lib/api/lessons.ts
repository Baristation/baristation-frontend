export interface LessonSummary {
  lessonId: number;
  lessonImageUrl: string;
  title: string;
  subTitle: string;
  hostName: string;
  hostProfileUrl: string;
  region: string;
  city?: string;
  place: string;
  nextDate: string | null;
  price: number;
  difficulty: string;
}

export interface LessonSearchRequest {
  region?: string | null;
  difficulty?: string;
  page?: number;
  size?: number;
}

export interface LessonSearchResponse {
  statusCode: string;
  message: string;
  data: {
    content: LessonSummary[];
    page: {
      number: number;
      size: number;
      totalElements: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  };
}

export interface LessonImage {
  lessonImageId: number;
  imageType: 'THUMB' | 'SUB' | 'DETAIL';
  imageUrl: string;
  sortOrder: number;
}

export interface CurriculumItem {
  title: string;
  subTitle: string;
  sortOrder: number;
}

export interface LessonDetail {
  lessonId: number;
  lessonImages: LessonImage[];
  title: string;
  hostName: string;
  hostProfileUrl: string;
  careers: string[];
  region: string;
  city: string;
  place: string;
  schedules: string[];
  duration: number;
  curriculum: CurriculumItem[];
  price: number;
  lessonCategory: string;
  remainingSeats?: number;
}

export interface LessonDetailResponse {
  statusCode: string;
  message: string;
  data: LessonDetail;
}
