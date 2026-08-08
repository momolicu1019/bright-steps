type SpedVideoBase = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  emoji: string;
};

export type SpedVideo =
  | (SpedVideoBase & { kind: 'mp4'; uri: string })
  | (SpedVideoBase & { kind: 'youtube'; youtubeId: string });

export function youtubeEmbedUrl(youtubeId: string): string {
  const params = new URLSearchParams({
    playsinline: '1',
    rel: '0',
    modestbranding: '1',
    enablejsapi: '1',
  });
  return `https://www.youtube.com/embed/${youtubeId}?${params.toString()}`;
}

/** Add or edit entries here to change what appears under the Videos tile. */
export const SPED_VIDEOS: SpedVideo[] = [
  {
    id: 'youtube_Gl-JJ9jwtCo',
    kind: 'youtube',
    youtubeId: 'Gl-JJ9jwtCo',
    titleKey: 'spedVideo.featured.title',
    descriptionKey: 'spedVideo.featured.desc',
    emoji: '📺',
  },
  {
    id: 'calm_breathing',
    kind: 'mp4',
    titleKey: 'spedVideo.calmBreathing.title',
    descriptionKey: 'spedVideo.calmBreathing.desc',
    emoji: '🌬️',
    uri: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  },
  {
    id: 'social_story',
    kind: 'mp4',
    titleKey: 'spedVideo.socialStory.title',
    descriptionKey: 'spedVideo.socialStory.desc',
    emoji: '🤝',
    uri: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  },
  {
    id: 'sensory_break',
    kind: 'mp4',
    titleKey: 'spedVideo.sensoryBreak.title',
    descriptionKey: 'spedVideo.sensoryBreak.desc',
    emoji: '🎧',
    uri: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  },
];
