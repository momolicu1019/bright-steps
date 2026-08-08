import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import YoutubePlayer from 'react-native-youtube-iframe';
import NetInfo from '@react-native-community/netinfo';
import { AppLocale, t } from '../../i18n';
import { SPED_VIDEOS, SpedVideo } from '../../constants/spedVideos';
import { stop } from '../../services/tts';
import { ResponsiveVideoLayout, useResponsiveVideoLayout } from '../../utils/responsiveVideoLayout';
import { cacheVideoFromUrl, getCachedVideoUri, isVideoCachedOnDevice } from '../../services/videoOfflineCache';
import { getVideoWatchHistory, recordVideoWatch } from '../../services/videoWatchHistory';

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
  isOnline: boolean;
  cachedLocalUri: string | null;
  onCompletedWatch: () => void;
};

function YoutubeInAppPlayer({
  videoId,
  layout,
  onCompletedWatch,
}: {
  videoId: string;
  layout: ResponsiveVideoLayout;
  onCompletedWatch: () => void;
}) {
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    setPlaying(false);
  }, [videoId]);

  return (
    <YoutubePlayer
      key={`${videoId}-${layout.playerWidth}x${layout.playerHeight}`}
      height={layout.playerHeight}
      width={layout.playerWidth}
      play={playing}
      videoId={videoId}
      onChangeState={(state) => {
        if (state === 'ended') {
          setPlaying(false);
          onCompletedWatch();
        }
        if (state === 'paused') {
          setPlaying(false);
        }
        if (state === 'playing') {
          setPlaying(true);
        }
      }}
      webViewProps={{
        allowsFullscreenVideo: true,
        allowsInlineMediaPlayback: true,
        androidLayerType: 'hardware',
      }}
      initialPlayerParams={{
        controls: true,
        modestbranding: true,
        rel: false,
        preventFullScreen: false,
      }}
    />
  );
}

function VideoPlayer({ video, layout, isOnline, cachedLocalUri, onCompletedWatch }: VideoPlayerProps) {
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

  if (!isOnline && !cachedLocalUri) {
    return (
      <View style={[frameStyle, styles.offlinePlayer]}>
        <Text style={styles.offlinePlayerTitle}>{t('spedVideo.offlineBlockedTitle')}</Text>
        <Text style={styles.offlinePlayerText}>{t('spedVideo.offlineBlockedBody')}</Text>
      </View>
    );
  }

  if (!isOnline && cachedLocalUri) {
    return (
      <View style={frameStyle}>
        <Video
          key={`${video.id}-cached-${layout.playerWidth}`}
          style={styles.webViewFill}
          source={{ uri: cachedLocalUri }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          onPlaybackStatusUpdate={(status) => {
            if (status.isLoaded && status.didJustFinish) {
              onCompletedWatch();
            }
          }}
        />
      </View>
    );
  }

  if (video.kind === 'youtube') {
    return (
      <View style={frameStyle}>
        <YoutubeInAppPlayer videoId={video.youtubeId} layout={layout} onCompletedWatch={onCompletedWatch} />
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
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            onCompletedWatch();
          }
        }}
      />
    </View>
  );
}

export default function SpecialEdVideosScreen({ route, locale }: SpecialEdVideosScreenProps) {
  const { moduleEmoji, childName } = route.params;
  const [activeVideo, setActiveVideo] = useState<SpedVideo>(SPED_VIDEOS[0]);
  const layout = useResponsiveVideoLayout();
  const [isOnline, setIsOnline] = useState(true);
  const [cachedLocalUri, setCachedLocalUri] = useState<string | null>(null);
  const [watchedIds, setWatchedIds] = useState<Set<string>>(new Set());
  const [cachedIds, setCachedIds] = useState<Set<string>>(new Set());
  const [isSavingOffline, setIsSavingOffline] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState<string | null>(null);

  const refreshMeta = useCallback(async () => {
    const history = await getVideoWatchHistory();
    setWatchedIds(new Set(history.map((entry) => entry.videoId)));

    const cached = new Set<string>();
    await Promise.all(
      SPED_VIDEOS.map(async (video) => {
        if (await isVideoCachedOnDevice(video.id)) {
          cached.add(video.id);
        }
      })
    );
    setCachedIds(cached);

    const localUri = await getCachedVideoUri(activeVideo.id);
    setCachedLocalUri(localUri);
  }, [activeVideo.id]);

  useEffect(() => () => stop(), []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    NetInfo.fetch().then((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    refreshMeta();
  }, [refreshMeta]);

  const handleCompletedWatch = useCallback(async () => {
    await recordVideoWatch(activeVideo.id, true);
    setOfflineNotice(null);

    const youtubeMirror =
      activeVideo.kind === 'youtube' && activeVideo.offlineMp4Uri ? activeVideo.offlineMp4Uri : null;

    if (youtubeMirror && isOnline) {
      setIsSavingOffline(true);
      try {
        await cacheVideoFromUrl(activeVideo.id, youtubeMirror);
        setOfflineNotice(t('spedVideo.savedOfflineFile'));
      } catch {
        setOfflineNotice(t('spedVideo.saveOfflineFailed'));
      } finally {
        setIsSavingOffline(false);
      }
    } else if (activeVideo.kind === 'youtube') {
      setOfflineNotice(t('spedVideo.savedWatchHistory'));
    }

    await refreshMeta();
  }, [activeVideo, isOnline, refreshMeta]);

  if (!SPED_VIDEOS.length) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>{t('spedVideo.empty')}</Text>
      </View>
    );
  }

  const showCachedBadge = cachedIds.has(activeVideo.id);
  const showOnlineOnly = activeVideo.kind === 'youtube' && !showCachedBadge;

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
          <VideoPlayer
            video={activeVideo}
            layout={layout}
            isOnline={isOnline}
            cachedLocalUri={cachedLocalUri}
            onCompletedWatch={handleCompletedWatch}
          />
          {isSavingOffline ? (
            <View style={styles.savingRow}>
              <ActivityIndicator size="small" color="#1D4ED8" />
              <Text style={styles.streamNote}>{t('spedVideo.savingOffline')}</Text>
            </View>
          ) : null}
          {offlineNotice ? <Text style={styles.streamNote}>{offlineNotice}</Text> : null}
          {showOnlineOnly && isOnline ? (
            <Text style={styles.streamNote}>{t('spedVideo.inAppStream')}</Text>
          ) : null}
          {showCachedBadge ? (
            <Text style={styles.savedBadge}>{t('spedVideo.availableOffline')}</Text>
          ) : null}
          <Text style={styles.nowPlaying}>
            {activeVideo.emoji} {t(activeVideo.titleKey)}
          </Text>
          <Text style={styles.nowPlayingDesc}>{t(activeVideo.descriptionKey)}</Text>
        </View>

        {SPED_VIDEOS.map((video) => {
          const selected = video.id === activeVideo.id;
          const watched = watchedIds.has(video.id);
          const saved = cachedIds.has(video.id);
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
              {(watched || saved) && (
                <Text style={styles.cardMeta}>
                  {watched ? `✓ ${t('spedVideo.watchedLabel')}` : ''}
                  {watched && saved ? ' • ' : ''}
                  {saved ? `📥 ${t('spedVideo.offlineLabel')}` : ''}
                </Text>
              )}
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
  offlinePlayer: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  offlinePlayerTitle: { fontSize: 16, fontWeight: '900', color: '#F9FAFB', textAlign: 'center' },
  offlinePlayerText: { fontSize: 13, fontWeight: '600', color: '#D1D5DB', marginTop: 8, textAlign: 'center' },
  savingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, alignSelf: 'stretch' },
  streamNote: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginTop: 8, alignSelf: 'stretch' },
  savedBadge: { fontSize: 12, color: '#047857', fontWeight: '800', marginTop: 6, alignSelf: 'stretch' },
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
  cardMeta: { fontSize: 12, color: '#1D4ED8', fontWeight: '800', marginTop: 6 },
});
