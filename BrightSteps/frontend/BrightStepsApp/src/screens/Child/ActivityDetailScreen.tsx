import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppLocale, t } from '../../i18n';
import { speak } from '../../services/tts';

type ActivityDetailScreenProps = {
  route: {
    params: {
      moduleKey: string;
      moduleEmoji: string;
      taskKey: string;
      childName: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
  locale: AppLocale;
};

type ActivityStep = {
  icon: string;
  title: string;
  subtitle: string;
};

type EmotionChoice = {
  key: 'happy' | 'sad' | 'angry' | 'scared';
  emoji: string;
  cardColor: string;
};

type TalkTile = {
  key: string;
  wordKey: string;
  emoji: string;
  cardColor: string;
  isChildName?: boolean;
};

const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const EMOTION_CHOICES: EmotionChoice[] = [
  { key: 'happy', emoji: '😊', cardColor: '#FFEDB0' },
  { key: 'sad', emoji: '😢', cardColor: '#C2DDF4' },
  { key: 'angry', emoji: '😡', cardColor: '#F5C8DA' },
  { key: 'scared', emoji: '😨', cardColor: '#D9CEF4' },
];

const TALK_TILES: TalkTile[] = [
  { key: 'i', wordKey: 'activity.talk.word.i', emoji: '🧒', cardColor: '#F5C8DA' },
  { key: 'want', wordKey: 'activity.talk.word.want', emoji: '💛', cardColor: '#FFEDB0' },
  { key: 'water', wordKey: 'activity.talk.word.water', emoji: '💧', cardColor: '#C2DDF4' },
  { key: 'help', wordKey: 'activity.talk.word.help', emoji: '🤝', cardColor: '#C8F4D8' },
  { key: 'eat', wordKey: 'activity.talk.word.eat', emoji: '🍎', cardColor: '#F9D9BE' },
  { key: 'more', wordKey: 'activity.talk.word.more', emoji: '✨', cardColor: '#D9CEF4' },
  { key: 'my', wordKey: 'activity.talk.word.my', emoji: '🙋', cardColor: '#FDE7B8' },
  { key: 'name', wordKey: 'activity.talk.word.name', emoji: '🏷️', cardColor: '#CCE9FB' },
  { key: 'is', wordKey: 'activity.talk.word.is', emoji: '🟰', cardColor: '#E5DCF8' },
  { key: 'to', wordKey: 'activity.talk.word.to', emoji: '➡️', cardColor: '#D7F1DF' },
  { key: 'childName', wordKey: 'activity.talk.word.childName', emoji: '⭐', cardColor: '#FFD9A8', isChildName: true },
];

function titleizeTask(task: string): string {
  return task
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getActivitySteps(taskKey: string, locale: AppLocale): ActivityStep[] {
  if (taskKey === 'brushing') {
    if (locale === 'fil') {
      return [
        { icon: '🪥', title: 'Kunin ang sipilyo', subtitle: 'Hawakan sa kamay' },
        { icon: '🧴', title: 'Lagyan ng toothpaste', subtitle: 'Kasukat ng gisantes' },
        { icon: '😁', title: 'Magsipilyo nang 2 minuto', subtitle: 'Pataas, pababa, paikot!' },
      ];
    }

    return [
      { icon: '🪥', title: 'Get toothbrush', subtitle: 'Hold with your hand' },
      { icon: '🧴', title: 'Add toothpaste', subtitle: 'Pea-sized amount' },
      { icon: '😁', title: 'Brush for 2 minutes', subtitle: 'Up, down, all around!' },
    ];
  }

  if (locale === 'fil') {
    return [
      { icon: '1️⃣', title: 'Maghanda', subtitle: `Ihanda ang kailangan para sa ${titleizeTask(taskKey)}` },
      { icon: '2️⃣', title: 'Gawin ang aktibidad', subtitle: 'Sundan ang mga hakbang nang dahan-dahan' },
      { icon: '3️⃣', title: 'Magaling!', subtitle: 'Tapos na! Pindutin ang reset para ulitin' },
    ];
  }

  return [
    { icon: '1️⃣', title: 'Prepare', subtitle: `Get ready for ${titleizeTask(taskKey)}` },
    { icon: '2️⃣', title: 'Do the activity', subtitle: 'Follow each step carefully' },
    { icon: '3️⃣', title: 'Great job!', subtitle: 'Completed. Tap reset to try again' },
  ];
}

export default function ActivityDetailScreen({ route, navigation, locale }: ActivityDetailScreenProps) {
  const { moduleKey, moduleEmoji, taskKey, childName } = route.params;
  const isAlphabet = taskKey === 'alphabet';
  const isEmotions = taskKey === 'emotions';
  const isTalk = taskKey === 'aac' && moduleKey === 'speech';
  const steps = useMemo(() => getActivitySteps(taskKey, locale), [taskKey, locale]);
  const [completed, setCompleted] = useState<boolean[]>(new Array(steps.length).fill(false));
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionChoice['key']>('angry');
  const [sentenceWords, setSentenceWords] = useState<string[]>([]);

  const talkTiles = useMemo(
    () =>
      TALK_TILES.map((tile) => ({
        ...tile,
        word: tile.isChildName ? childName : t(tile.wordKey),
      })),
    [childName, locale]
  );

  const taskHeading = isEmotions
    ? t('activity.feelingsQuestion')
    : isTalk
      ? t('activity.talk.heading')
      : `${titleizeTask(taskKey)} • ${locale === 'fil' ? 'Visual Schedule' : 'Visual Schedule'}`;

  const toggleStep = (index: number) => {
    setCompleted((prev) => prev.map((value, idx) => (idx === index ? !value : value)));
  };

  const handleReset = () => {
    if (isTalk) {
      setSentenceWords([]);
      return;
    }

    if (isEmotions) {
      setSelectedEmotion('angry');
      return;
    }
    setCompleted(new Array(steps.length).fill(false));
  };

  const handleReadAloud = () => {
    if (isAlphabet) {
      speak(ALPHABET_LETTERS.join(' '), 'en');
      return;
    }

    if (isEmotions) {
      speak(`${t(`activity.emotion.${selectedEmotion}`)}. ${t(`activity.emotionSupport.${selectedEmotion}`)}`, locale);
      return;
    }

    if (isTalk) {
      if (!sentenceWords.length) {
        speak(t('activity.talk.placeholder'), locale);
        return;
      }
      speak(sentenceWords.join(' '), 'en');
      return;
    }

    const lines = steps.map((step) => `${step.title}. ${step.subtitle}`).join(' ');
    speak(lines, locale);
  };

  const handleLetterPress = (letter: string) => {
    setSelectedLetter(letter);
    speak(letter, 'en');
  };

  const handleEmotionPress = (emotionKey: EmotionChoice['key']) => {
    setSelectedEmotion(emotionKey);
    speak(t(`activity.emotion.${emotionKey}`), locale);
  };

  const handleTalkTilePress = (word: string) => {
    setSentenceWords((prev) => [...prev, word]);
    speak(word, 'en');
  };

  const clearTalkSentence = () => {
    setSentenceWords([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.panel}>
        <View style={styles.topRow}>
          <View style={styles.moduleInfoRow}>
            <View style={styles.moduleIconBox}>
              <Text style={styles.moduleIconText}>{moduleEmoji}</Text>
            </View>
            <View>
              <Text style={styles.moduleTitle}>{t(`module.${moduleKey}`)}</Text>
              <Text style={styles.moduleSubtitle}>{t(`module.desc.${moduleKey}`)} • AI Adaptive</Text>
              <Text style={styles.childText}>{t('common.forChild', { name: childName })}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={navigation.goBack}>
            <Text style={styles.closeButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.heading, isTalk && styles.talkHeading]}>{taskHeading}</Text>

        {isAlphabet ? (
          <View style={styles.alphabetWrap}>
            <Text style={styles.alphabetInstruction}>{t('activity.alphabetInstruction')}</Text>
            <View style={styles.selectedLetterCard}>
              <Text style={styles.selectedLetter}>{selectedLetter}</Text>
              <Text style={styles.selectedLetterSub}>{t('activity.tapLetterPrompt')}</Text>
            </View>

            <ScrollView style={styles.lettersScroll} contentContainerStyle={styles.lettersGrid}>
              {ALPHABET_LETTERS.map((letter) => (
                <TouchableOpacity
                  key={letter}
                  style={[styles.letterTile, selectedLetter === letter && styles.letterTileActive]}
                  onPress={() => handleLetterPress(letter)}
                >
                  <Text style={[styles.letterTileText, selectedLetter === letter && styles.letterTileTextActive]}>
                    {letter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : isEmotions ? (
          <View style={styles.emotionsWrap}>
            <View style={styles.emotionsGrid}>
              {EMOTION_CHOICES.map((emotion) => (
                <TouchableOpacity
                  key={emotion.key}
                  style={[
                    styles.emotionCard,
                    { backgroundColor: emotion.cardColor },
                    selectedEmotion === emotion.key && styles.emotionCardActive,
                  ]}
                  onPress={() => handleEmotionPress(emotion.key)}
                >
                  <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                  <Text style={styles.emotionLabel}>{t(`activity.emotion.${emotion.key}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.emotionSupportBar}>
              <Text style={styles.emotionSupportText}>
                {t(`activity.emotion.${selectedEmotion}`)} • {t(`activity.emotionSupport.${selectedEmotion}`)}
              </Text>
            </View>
          </View>
        ) : isTalk ? (
          <View style={styles.talkWrap}>
            <View style={styles.talkBuilderCard}>
              <Text style={[styles.talkBuilderText, !sentenceWords.length && styles.talkBuilderPlaceholder]}>
                {sentenceWords.length ? sentenceWords.join(' ') : t('activity.talk.placeholder')}
              </Text>
              <TouchableOpacity onPress={clearTalkSentence}>
                <Text style={styles.talkClearText}>{t('activity.talk.clear')}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.talkTilesScroll} contentContainerStyle={styles.talkTilesGrid}>
              {talkTiles.map((tile) => (
                <TouchableOpacity
                  key={tile.key}
                  style={[styles.talkTile, { backgroundColor: tile.cardColor }]}
                  onPress={() => handleTalkTilePress(tile.word)}
                >
                  <Text style={styles.talkTileEmoji}>{tile.emoji}</Text>
                  <Text style={styles.talkTileWord}>{tile.word}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.talkSayButton} onPress={handleReadAloud}>
              <Text style={styles.talkSayButtonText}>🔊 {t('activity.talk.saySentence')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.stepsWrap} contentContainerStyle={styles.stepsContent}>
            {steps.map((step, index) => (
              <TouchableOpacity key={`${taskKey}-${index}`} style={styles.stepCard} onPress={() => toggleStep(index)}>
                <View style={styles.stepLeft}>
                  <View style={styles.stepIconBox}>
                    <Text style={styles.stepIcon}>{step.icon}</Text>
                  </View>
                  <View>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
                  </View>
                </View>
                <View style={[styles.statusCircle, completed[index] && styles.statusCircleDone]}>
                  <Text style={styles.statusCircleText}>{completed[index] ? '✓' : ''}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {!isEmotions && !isTalk && (
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.readAloudButton} onPress={handleReadAloud}>
              <Text style={styles.readAloudButtonText}>🔊 {t('child.readAloud')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>↻ {t('activity.reset')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3F3F46',
    padding: 14,
  },
  panel: {
    flex: 1,
    backgroundColor: '#F7F2E9',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECE3D6',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  moduleInfoRow: {
    flexDirection: 'row',
    gap: 12,
    flexShrink: 1,
  },
  moduleIconBox: {
    width: 84,
    height: 84,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D8DEE8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleIconText: {
    fontSize: 40,
  },
  moduleTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#0F172A',
  },
  moduleSubtitle: {
    marginTop: 2,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
  },
  closeButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '400',
  },
  heading: {
    marginTop: 22,
    marginBottom: 10,
    fontSize: 28,
    color: '#0F172A',
    fontWeight: '900',
  },
  talkHeading: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 14,
  },
  stepsWrap: {
    flex: 1,
  },
  talkWrap: {
    flex: 1,
    paddingBottom: 4,
  },
  talkBuilderCard: {
    minHeight: 84,
    borderRadius: 26,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  talkBuilderText: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
    marginRight: 10,
  },
  talkBuilderPlaceholder: {
    color: '#9CA3AF',
  },
  talkClearText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  talkTilesScroll: {
    flex: 1,
  },
  talkTilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    paddingBottom: 12,
  },
  talkTile: {
    width: '32%',
    minHeight: 122,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  talkTileEmoji: {
    fontSize: 40,
  },
  talkTileWord: {
    marginTop: 9,
    color: '#111827',
    fontWeight: '900',
    fontSize: 16,
  },
  talkSayButton: {
    backgroundColor: '#36C36B',
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  talkSayButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  emotionsWrap: {
    flex: 1,
    justifyContent: 'space-between',
    marginTop: 2,
    paddingBottom: 4,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  emotionCard: {
    width: '48.5%',
    minHeight: 148,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  emotionCardActive: {
    borderColor: '#0F172A',
    borderWidth: 3.5,
  },
  emotionEmoji: {
    fontSize: 52,
  },
  emotionLabel: {
    marginTop: 10,
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '900',
  },
  emotionSupportBar: {
    marginTop: 14,
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  emotionSupportText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  alphabetWrap: {
    flex: 1,
  },
  alphabetInstruction: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 8,
  },
  selectedLetterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 10,
  },
  selectedLetter: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1D4ED8',
  },
  selectedLetterSub: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '700',
  },
  lettersScroll: {
    flex: 1,
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 12,
  },
  letterTile: {
    width: '15.5%',
    minWidth: 48,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterTileActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  letterTileText: {
    color: '#111827',
    fontWeight: '900',
    fontSize: 20,
  },
  letterTileTextActive: {
    color: '#FFFFFF',
  },
  stepsContent: {
    paddingBottom: 12,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexShrink: 1,
  },
  stepIconBox: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIcon: {
    fontSize: 26,
  },
  stepTitle: {
    fontSize: 18,
    color: '#111827',
    fontWeight: '900',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '700',
  },
  statusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  statusCircleDone: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  statusCircleText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 32,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  readAloudButton: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
  },
  readAloudButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  resetButton: {
    minWidth: 140,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 999,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButtonText: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '800',
  },
  childText: {
    marginTop: 8,
    fontSize: 12,
    color: '#475569',
    fontWeight: '700',
  },
});
