export interface Story {
  id: string;
  title: string;
  thumbnailColor: string;
  ageGroup?: string;
  isLocked?: boolean;
}

export interface StoryDetail extends Story {
  description: string;
  category: string;
  duration: string;
  pages: number;
}

export interface StoryPage {
  id: number;
  imageColor: string;
  textKo: string;
  textEn: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  isRecommended: boolean;
}
