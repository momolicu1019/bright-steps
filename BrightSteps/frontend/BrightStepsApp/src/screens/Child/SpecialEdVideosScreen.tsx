import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { WebView } from 'react-native-webview';
import { AppLocale, t } from '../../i18n';
import { SPED_VIDEOS, SpedVideo, youtubeEmbedUrl } from '../../constants/spedVideos';
import { stop } from '../../services/tts';
import { ResponsiveVideoLayout, useResponsiveVideoLayout } from '../../utils/responsiveVideoLayout';

type SpecialEdVideosScreenProps = {
  route: {
    params: {
      moduleEmoji: string;
      childName: string;
      childAge?: string;
    };
  };
  locale: AppLocale;
};

type VideoPlayerProps = {
  video: SpedVideo;
  layout: ResponsiveVideoLayout;
};

function youtubeEmbedHtml(youtubeId: string): string {
  const src = youtubeEmbedUrl(youtubeId);
  return `<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #111827; }
      .frame { position: absolute; inset: 0; }
      iframe { width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <div class="frame">
      <iframe
        src="${src}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
    </div>
  </body>
</html>`;
}

function VideoPlayer({ video, layout }: VideoPlayerProps) {
  const frameStyle = useMemo(
    () => ({
      width: layout.playerWidth,
      height: layout.playerHeight,
      borderRadius: 12,
      overflow: 'hidden' as const,
      backgroundColor: '#111827',
      alignSelf: 'center' as const,
    }),
    [layout.playerHeight, layout.playerWidth]
  );

  if (video.kind === 'youtube') {
    return (
      <View style={frameStyle}>
        <WebView
          key={`${video.id}-${layout.playerWidth}x${layout.playerHeight}`}
          style={styles.webViewFill}
          source={{ html: youtubeEmbedHtml(video.youtubeId) }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          javaScriptEnabled
          domStorageEnabled
          mediaPlaybackRequiresUserAction={false}
          originWhitelist={['https://*']}
          scrollEnabled={false}
        />
      </View>
    );
  }

  return (
    <View style={frameStyle}>
      <Video
        key={`${video.id}-${layout.playerWidth}x${layout.playerHeight}`}
        style={styles.webViewFill}
        source={{ uri: video.uri }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
      />
    </View>
  );
}

export default function SpecialEdVideosScreen({ route, locale }: SpecialEdVideosScreenProps) {
  const { moduleEmoji, childName } = route.params;
  const [activeVideo, setActiveVideo] = useState<SpedVideo>(SPED_VIDEOS[0]);
  const layout = useResponsiveVideoLayout();

  useEffect(() => () => stop(), []);

  if (!SPED_VIDEOS.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>{t('spedVideo.empty')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, layout.isTablet && { alignItems: 'center' }]}
    >
      <View style={[styles.mainColumn, { maxWidth: layout.contentWidth }]}>
        <View style={styles.topRow}>
          <View style={styles.headerBlock}>
            <Text style={[styles.header, layout.isTablet && styles.headerTablet]}>
              {moduleEmoji} {t('module.sped_videos')}
            </Text>
            <Text style={styles.subHeader}>{t('module.secondary.sped_videos')}</Text>
            <Text style={styles.childText}>{t('common.forChild', { name: childName })}</Text>
          </View>
          <Text style={styles.localeTag}>{locale.toUpperCase()}</Text>
        </View>

        <Text style={styles.hint}>{t('spedVideo.watchHint')}</Text>

        <View style={styles.playerWrap}>
          <VideoPlayer video={activeVideo} layout={layout} />
          <Text style={styles.nowPlaying}>
            {activeVideo.emoji} {t(activeVideo.titleKey)}
          </Text>
          <Text style={styles.nowPlayingDesc}>{t(activeVideo.descriptionKey)}</Text>
        </View>

        {SPED_VIDEOS.map((video) => {
          const selected = video.id === activeVideo.id;
          return (
            <TouchableOpacity
              key={video.id}
              style={[styles.card, selected && styles.cardSelected]}
              onPress={() => setActiveVideo(video)}
            >
              <Text style={styles.cardTitle}>
                {video.emoji} {t(video.titleKey)}
                {video.kind === 'youtube' ? ' • YouTube' : ''}
              </Text>
              <Text style={styles.cardText}>{t(video.descriptionKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F8FF' },
  content: { padding: 16, paddingBottom: 28, width: '100%' },
  mainColumn: { width: '100%' },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#F7F8FF' },
  emptyText: { fontSize: 15, fontWeight: '700', color: '#4B5563', textAlign: 'center' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  headerBlock: { flex: 1, paddingRight: 8 },
  header: { fontSize: 22, fontWeight: '900', color: '#172554' },
  headerTablet: { fontSize: 26 },
  subHeader: { fontSize: 14, fontWeight: '700', color: '#4B5563', marginTop: 2 },
  childText: { fontSize: 13, fontWeight: '700', color: '#1D4ED8', marginTop: 6 },
  localeTag: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B7280',
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  hint: { fontSize: 14, color: '#374151', fontWeight: '600', marginBottom: 12 },
  playerWrap: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EAF5',
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  webViewFill: { flex: 1, width: '100%', height: '100%', backgroundColor: '#111827' },
  nowPlaying: { fontSize: 17, fontWeight: '900', color: '#111827', marginTop: 10, alignSelf: 'stretch' },
  nowPlayingDesc: { fontSize: 13, color: '#4B5563', fontWeight: '600', marginTop: 4, alignSelf: 'stretch' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
  },
  cardSelected: { borderColor: '#1D4ED8', backgroundColor: '#EEF2FF' },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#111827' },
  cardText: { fontSize: 13, color: '#4B5563', marginTop: 4, fontWeight: '600' },
});
