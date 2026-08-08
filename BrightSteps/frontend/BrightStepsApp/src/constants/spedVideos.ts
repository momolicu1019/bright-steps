type SpedVideoBase = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  emoji: string;
};

export type SpedVideo =
  | (SpedVideoBase & { kind: 'mp4'; uri: string })
  | (SpedVideoBase & {
      kind: 'youtube';
      youtubeId: string;
      /** Optional direct MP4 you host — downloaded after a completed watch for offline playback. */
      offlineMp4Uri?: string;
    });

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
    kind: 'youtube',
    youtubeId: 'RiMb2Bw4Ae8',
    titleKey: 'spedVideo.calmBreathing.title',
    descriptionKey: 'spedVideo.calmBreathing.desc',
    emoji: '🌬️',
  },
  {
    id: 'social_story',
    kind: 'youtube',
    youtubeId: 'KU1koy_tshw',
    titleKey: 'spedVideo.socialStory.title',
    descriptionKey: 'spedVideo.socialStory.desc',
    emoji: '🤝',
  },
  {
    id: 'sensory_break',
    kind: 'youtube',
    youtubeId: '7s3jhXy63Wg',
    titleKey: 'spedVideo.sensoryBreak.title',
    descriptionKey: 'spedVideo.sensoryBreak.desc',
    emoji: '🎧',
  },
];
