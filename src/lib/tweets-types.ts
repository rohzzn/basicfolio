export type TweetMedia = {
  type: 'photo' | 'video';
  previewUrl: string;
  videoUrl?: string;
};

export type TweetItem = {
  id: string;
  text: string;
  link: string;
  date: string;
  displayDate: string;
  media?: TweetMedia[];
};
