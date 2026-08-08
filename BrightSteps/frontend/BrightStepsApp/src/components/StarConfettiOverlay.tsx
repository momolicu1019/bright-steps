import React, { useEffect, useRef } from 'react';
import { Modal, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { t } from '../i18n';

type StarConfettiOverlayProps = {
  visible: boolean;
  stars: number;
  onFinished: () => void;
};

const CELEBRATION_MS = 15_000;
const BURST_INTERVAL_MS = 2_500;

export default function StarConfettiOverlay({ visible, stars, onFinished }: StarConfettiOverlayProps) {
  const { width } = useWindowDimensions();
  const leftRef = useRef<ConfettiCannon | null>(null);
  const rightRef = useRef<ConfettiCannon | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const fire = () => {
      leftRef.current?.start();
      rightRef.current?.start();
    };

    fire();
    const burstTimer = setInterval(fire, BURST_INTERVAL_MS);
    const endTimer = setTimeout(() => {
      clearInterval(burstTimer);
      onFinished();
    }, CELEBRATION_MS);

    return () => {
      clearInterval(burstTimer);
      clearTimeout(endTimer);
    };
  }, [visible, onFinished]);

  if (!visible) {
    return null;
  }

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onFinished}>
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.banner}>
          <Text style={styles.bannerEmoji}>🎉</Text>
          <Text style={styles.bannerTitle}>{t('child.starMilestoneTitle', { count: stars })}</Text>
          <Text style={styles.bannerSub}>{t('child.starMilestoneSub')}</Text>
        </View>
        <ConfettiCannon
          ref={leftRef}
          count={80}
          origin={{ x: 0, y: 0 }}
          autoStart={false}
          fadeOut
          fallSpeed={2800}
          explosionSpeed={350}
        />
        <ConfettiCannon
          ref={rightRef}
          count={80}
          origin={{ x: width, y: 0 }}
          autoStart={false}
          fadeOut
          fallSpeed={2800}
          explosionSpeed={350}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  banner: {
    marginTop: 72,
    marginHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FACC15',
  },
  bannerEmoji: { fontSize: 36 },
  bannerTitle: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '900',
    color: '#172554',
    textAlign: 'center',
  },
  bannerSub: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    textAlign: 'center',
  },
});
