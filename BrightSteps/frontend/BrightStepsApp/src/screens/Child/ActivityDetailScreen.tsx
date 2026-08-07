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

type ShapeChoice = {
  key: string;
  nameKey: string;
  colorKey: string;
  colorHex: string;
  glyph: string;
};

type ColorChoice = {
  key: string;
  nameKey: string;
  hex: string;
  textColor?: string;
};

const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBER_TILES = Array.from({ length: 50 }, (_, index) => `${index + 1}`);
const READING_LINES = ['The', 'The cat', 'The cat sat', 'The cat sat on', 'The cat sat on the mat.'];
const EMOTION_CHOICES: EmotionChoice[] = [
  { key: 'happy', emoji: '😊', cardColor: '#FFEDB0' },
  { key: 'sad', emoji: '😢', cardColor: '#C2DDF4' },
  { key: 'angry', emoji: '😡', cardColor: '#F5C8DA' },
  { key: 'scared', emoji: '😨', cardColor: '#D9CEF4' },
];

const SHAPE_CHOICES: ShapeChoice[] = [
  { key: 'circle', nameKey: 'activity.shape.circle', colorKey: 'activity.color.red', colorHex: '#EF4444', glyph: '●' },
  { key: 'square', nameKey: 'activity.shape.square', colorKey: 'activity.color.blue', colorHex: '#3B82F6', glyph: '■' },
  { key: 'triangle', nameKey: 'activity.shape.triangle', colorKey: 'activity.color.yellow', colorHex: '#F59E0B', glyph: '▲' },
  { key: 'star', nameKey: 'activity.shape.star', colorKey: 'activity.color.green', colorHex: '#10B981', glyph: '★' },
  { key: 'diamond', nameKey: 'activity.shape.diamond', colorKey: 'activity.color.purple', colorHex: '#8B5CF6', glyph: '◆' },
  { key: 'rectangle', nameKey: 'activity.shape.rectangle', colorKey: 'activity.color.orange', colorHex: '#F97316', glyph: '▬' },
];

const COLOR_CHOICES: ColorChoice[] = [
  { key: 'red', nameKey: 'activity.color.red', hex: '#EF4444' },
  { key: 'yellow', nameKey: 'activity.color.yellow', hex: '#FACC15', textColor: '#1F2937' },
  { key: 'blue', nameKey: 'activity.color.blue', hex: '#3B82F6' },
  { key: 'green', nameKey: 'activity.color.green', hex: '#10B981' },
  { key: 'orange', nameKey: 'activity.color.orange', hex: '#F97316' },
  { key: 'purple', nameKey: 'activity.color.purple', hex: '#8B5CF6' },
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
  if (taskKey === 'morning_routine') {
    if (locale === 'fil') {
      return [
        { icon: '🌞', title: 'Gumising', subtitle: 'Simulan ang araw nang maayos' },
        { icon: '🛏️', title: 'Ayusin ang kama', subtitle: 'Iunat at itupi ang kumot' },
        { icon: '🧼', title: 'Maghilamos', subtitle: 'Hugasan ang mukha nang malinis' },
      ];
    }

    return [
      { icon: '🌞', title: 'Wake up', subtitle: 'Start your day calmly' },
      { icon: '🛏️', title: 'Clean bed', subtitle: 'Fix and tidy your blanket' },
      { icon: '🧼', title: 'Wash your face', subtitle: 'Wash gently and dry your face' },
    ];
  }

  if (taskKey === 'toilet') {
    if (locale === 'fil') {
      return [
        { icon: '🚻', title: 'Pumunta sa CR', subtitle: 'Lumapit nang maingat' },
        { icon: '🚽', title: 'Buksan ang takip ng inidoro', subtitle: 'Iangat ang toilet cover' },
        { icon: '💧', title: 'Umihi', subtitle: 'Dahan-dahan at malinis' },
      ];
    }

    return [
      { icon: '🚻', title: 'Go to the CR', subtitle: 'Walk safely to the restroom' },
      { icon: '🚽', title: 'Open the toilet bowl', subtitle: 'Lift the toilet cover' },
      { icon: '💧', title: 'Take a pee', subtitle: 'Take your time and stay clean' },
    ];
  }

  if (taskKey === 'dressing') {
    if (locale === 'fil') {
      return [
        { icon: '🩲', title: 'Magsuot ng underwear', subtitle: 'Simulan sa damit panloob' },
        { icon: '👕', title: 'Magsuot ng shirt', subtitle: 'Ipasok ang dalawang braso' },
        { icon: '🩳', title: 'Magsuot ng short', subtitle: 'Itaas nang maayos' },
        { icon: '🧦', title: 'Magsuot ng medyas', subtitle: 'Isa-isa hanggang sakong' },
      ];
    }

    return [
      { icon: '🩲', title: 'Wear your under wear', subtitle: 'Start with your underwear' },
      { icon: '👕', title: 'Wear your shirt', subtitle: 'Put both arms through' },
      { icon: '🩳', title: 'Wear your short', subtitle: 'Pull it up properly' },
      { icon: '🧦', title: 'Wear your socks', subtitle: 'One sock at a time' },
    ];
  }

  if (taskKey === 'eating') {
    if (locale === 'fil') {
      return [
        { icon: '🪑', title: 'Umupo', subtitle: 'Umupo nang maayos sa mesa' },
        { icon: '🍽️', title: 'Kumain ng pagkain', subtitle: 'Ngumuya nang dahan-dahan' },
        { icon: '💧', title: 'Uminom ng tubig', subtitle: 'Uminom pagkatapos kumain' },
      ];
    }

    return [
      { icon: '🪑', title: 'Sit down', subtitle: 'Sit properly at the table' },
      { icon: '🍽️', title: 'Eat your food', subtitle: 'Chew slowly and carefully' },
      { icon: '💧', title: 'Drink water', subtitle: 'Take water after eating' },
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
  const isNumbers = taskKey === 'numbers';
  const isReading = taskKey === 'reading';
  const isShapes = taskKey === 'shapes';
  const isColors = taskKey === 'colors';
  const isEmotions = taskKey === 'emotions';
  const isTalk = taskKey === 'aac' && moduleKey === 'speech';
  const steps = useMemo(() => getActivitySteps(taskKey, locale), [taskKey, locale]);
  const [completed, setCompleted] = useState<boolean[]>(new Array(steps.length).fill(false));
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [selectedNumber, setSelectedNumber] = useState<string>('1');
  const [selectedReadingLine, setSelectedReadingLine] = useState<string>(READING_LINES[0]);
  const [selectedShapeKey, setSelectedShapeKey] = useState<string>(SHAPE_CHOICES[0].key);
  const [selectedColorKey, setSelectedColorKey] = useState<string>(COLOR_CHOICES[0].key);
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
      : isReading
        ? t('activity.reading.heading')
        : isNumbers
          ? t('activity.numbers.heading')
          : isShapes
            ? t('activity.shapes.heading')
            : isColors
              ? t('activity.colors.heading')
      : `${titleizeTask(taskKey)} • ${locale === 'fil' ? 'Visual Schedule' : 'Visual Schedule'}`;

  const toggleStep = (index: number) => {
    const step = steps[index];
    setCompleted((prev) => {
      const nextValue = !prev[index];
      const statusText = nextValue ? t('activity.checked') : t('activity.unchecked');
      speak(`${step.title}. ${statusText}`, locale);
      return prev.map((value, idx) => (idx === index ? nextValue : value));
    });
  };

  const handleReset = () => {
    if (isNumbers) {
      setSelectedNumber('1');
      return;
    }

    if (isReading) {
      setSelectedReadingLine(READING_LINES[0]);
      return;
    }

    if (isShapes) {
      setSelectedShapeKey(SHAPE_CHOICES[0].key);
      return;
    }

    if (isColors) {
      setSelectedColorKey(COLOR_CHOICES[0].key);
      return;
    }

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

    if (isNumbers) {
      speak(NUMBER_TILES.join(', '), 'en');
      return;
    }

    if (isReading) {
      speak(READING_LINES.join('. '), 'en');
      return;
    }

    if (isShapes) {
      const selectedShape = SHAPE_CHOICES.find((shape) => shape.key === selectedShapeKey) || SHAPE_CHOICES[0];
      speak(`${t(selectedShape.nameKey)} ${t('activity.word.color')} ${t(selectedShape.colorKey)}`, locale);
      return;
    }

    if (isColors) {
      const selectedColor = COLOR_CHOICES.find((color) => color.key === selectedColorKey) || COLOR_CHOICES[0];
      speak(t(selectedColor.nameKey), locale);
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

  const handleNumberPress = (value: string) => {
    setSelectedNumber(value);
    speak(value, 'en');
  };

  const handleReadingLinePress = (line: string) => {
    setSelectedReadingLine(line);
    speak(line, 'en');
  };

  const handleShapePress = (shape: ShapeChoice) => {
    setSelectedShapeKey(shape.key);
    speak(`${t(shape.nameKey)} ${t('activity.word.color')} ${t(shape.colorKey)}`, locale);
  };

  const handleColorPress = (choice: ColorChoice) => {
    setSelectedColorKey(choice.key);
    speak(t(choice.nameKey), locale);
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

        <Text style={[styles.heading, isTalk && styles.talkHeading, isReading && styles.readingHeading]}>{taskHeading}</Text>

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
        ) : isNumbers ? (
          <View style={styles.alphabetWrap}>
            <Text style={styles.alphabetInstruction}>{t('activity.numbersInstruction')}</Text>
            <View style={styles.selectedLetterCard}>
              <Text style={styles.selectedLetter}>{selectedNumber}</Text>
              <Text style={styles.selectedLetterSub}>{t('activity.tapNumberPrompt')}</Text>
            </View>

            <ScrollView style={styles.lettersScroll} contentContainerStyle={styles.numbersGrid}>
              {NUMBER_TILES.map((value) => (
                <TouchableOpacity
                  key={value}
                  style={[styles.numberTile, selectedNumber === value && styles.letterTileActive]}
                  onPress={() => handleNumberPress(value)}
                >
                  <Text style={[styles.numberTileText, selectedNumber === value && styles.letterTileTextActive]}>
                    {value}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : isReading ? (
          <View style={styles.readingWrap}>
            <Text style={styles.readingInstruction}>{t('activity.readingInstruction')}</Text>
            <View style={styles.selectedReadingCard}>
              <Text style={styles.selectedReadingLine}>{selectedReadingLine}</Text>
            </View>
            <ScrollView style={styles.readingLinesScroll} contentContainerStyle={styles.readingLinesList}>
              {READING_LINES.map((line, index) => (
                <TouchableOpacity
                  key={`${line}-${index}`}
                  style={[styles.readingLineCard, selectedReadingLine === line && styles.readingLineCardActive]}
                  onPress={() => handleReadingLinePress(line)}
                >
                  <Text style={[styles.readingLineText, selectedReadingLine === line && styles.readingLineTextActive]}>{line}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : isShapes ? (
          <View style={styles.shapeWrap}>
            <Text style={styles.shapeInstruction}>{t('activity.shapesInstruction')}</Text>
            <ScrollView contentContainerStyle={styles.shapeGrid}>
              {SHAPE_CHOICES.map((shape) => (
                <TouchableOpacity
                  key={shape.key}
                  style={[styles.shapeCard, selectedShapeKey === shape.key && styles.shapeCardActive]}
                  onPress={() => handleShapePress(shape)}
                >
                  <Text style={[styles.shapeGlyph, { color: shape.colorHex }]}>{shape.glyph}</Text>
                  <Text style={styles.shapeName}>{t(shape.nameKey)}</Text>
                  <Text style={styles.shapeColorName}>{t(shape.colorKey)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : isColors ? (
          <View style={styles.colorWrap}>
            <Text style={styles.shapeInstruction}>{t('activity.colorsInstruction')}</Text>
            <ScrollView contentContainerStyle={styles.shapeGrid}>
              {COLOR_CHOICES.map((choice) => {
                const isActive = selectedColorKey === choice.key;
                return (
                  <TouchableOpacity
                    key={choice.key}
                    style={[
                      styles.colorCard,
                      { backgroundColor: choice.hex },
                      isActive && styles.shapeCardActive,
                    ]}
                    onPress={() => handleColorPress(choice)}
                  >
                    <Text style={[styles.colorCardLabel, { color: choice.textColor || '#FFFFFF' }]}>{t(choice.nameKey)}</Text>
                  </TouchableOpacity>
                );
              })}
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 26,
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
  readingHeading: {
    fontSize: 24,
  },
  stepsWrap: {
    flex: 1,
  },
  readingWrap: {
    flex: 1,
  },
  readingInstruction: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 8,
  },
  selectedReadingCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: 10,
  },
  selectedReadingLine: {
    fontSize: 22,
    color: '#1E3A8A',
    fontWeight: '900',
  },
  readingLinesScroll: {
    flex: 1,
  },
  readingLinesList: {
    paddingBottom: 8,
  },
  readingLineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 8,
  },
  readingLineCardActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  readingLineText: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '800',
  },
  readingLineTextActive: {
    color: '#FFFFFF',
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
  shapeInstruction: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 10,
  },
  shapeWrap: {
    flex: 1,
  },
  colorWrap: {
    flex: 1,
  },
  shapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    paddingBottom: 10,
  },
  shapeCard: {
    width: '48.5%',
    minHeight: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  shapeCardActive: {
    borderColor: '#1D4ED8',
    borderWidth: 3,
  },
  shapeGlyph: {
    fontSize: 48,
  },
  shapeName: {
    marginTop: 8,
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '900',
  },
  shapeColorName: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '700',
    marginTop: 3,
  },
  colorCard: {
    width: '48.5%',
    minHeight: 100,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  colorCardLabel: {
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'capitalize',
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
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 14,
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
  numberTile: {
    width: '18.3%',
    minWidth: 52,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberTileText: {
    color: '#111827',
    fontWeight: '900',
    fontSize: 19,
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
    fontSize: 15,
    color: '#111827',
    fontWeight: '900',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontWeight: '700',
  },
  statusCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
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
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '900',
    lineHeight: 24,
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
