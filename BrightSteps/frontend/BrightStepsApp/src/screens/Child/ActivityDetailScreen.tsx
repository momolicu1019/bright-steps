import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AppLocale, t } from '../../i18n';
import { speak, stop } from '../../services/tts';

type ActivityDetailScreenProps = {
  route: {
    params: {
      moduleKey: string;
      moduleEmoji: string;
      taskKey: string;
      childName: string;
      childAge?: string;
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
  key: 'happy' | 'sad' | 'angry' | 'scared' | 'surprise' | 'afraid' | 'disgust';
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
  colorHex: string;
  glyph: string;
};

type ColorChoice = {
  key: string;
  nameKey: string;
  hex: string;
  textColor?: string;
};

type FocusBubble = {
  id: number;
  size: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
};

type MoveExerciseStep = {
  key: string;
  labelKey: string;
  emoji: string;
};

type MathProblemPreset = {
  key: string;
  a: number;
  b: number;
  operator: '+' | '-';
  labelEn: string;
  labelFil: string;
};

const ALPHABET_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const NUMBER_TILES = Array.from({ length: 50 }, (_, index) => `${index + 1}`);
const BASE_READING_SENTENCES = [
  'Look at the dog.',
  'I like my hat.',
  'The big pig sat.',
  'He can run fast.',
  'She has a red cup.',
  'We can play here.',
  'Look at that bug.',
  'I can jump up.',
  'See the hot sun.',
  'I go to my bed.',
  'The sad fox hid.',
  'It is a big bus.',
  'My mom made jam.',
  'We like the wet frog.',
  'I see a cat.',
];
const EMOTION_CHOICES: EmotionChoice[] = [
  { key: 'happy', emoji: '😊', cardColor: '#FFEDB0' },
  { key: 'sad', emoji: '😢', cardColor: '#C2DDF4' },
  { key: 'angry', emoji: '😡', cardColor: '#F5C8DA' },
  { key: 'scared', emoji: '😨', cardColor: '#D9CEF4' },
  { key: 'surprise', emoji: '😲', cardColor: '#FFE2B8' },
  { key: 'afraid', emoji: '😰', cardColor: '#D5E8FF' },
  { key: 'disgust', emoji: '🤢', cardColor: '#D9F7D8' },
];

const SHAPE_CHOICES: ShapeChoice[] = [
  { key: 'circle', nameKey: 'activity.shape.circle', colorHex: '#EF4444', glyph: '●' },
  { key: 'square', nameKey: 'activity.shape.square', colorHex: '#3B82F6', glyph: '■' },
  { key: 'triangle', nameKey: 'activity.shape.triangle', colorHex: '#F59E0B', glyph: '▲' },
  { key: 'star', nameKey: 'activity.shape.star', colorHex: '#10B981', glyph: '★' },
  { key: 'diamond', nameKey: 'activity.shape.diamond', colorHex: '#8B5CF6', glyph: '◆' },
  { key: 'rectangle', nameKey: 'activity.shape.rectangle', colorHex: '#F97316', glyph: '▬' },
  { key: 'heart', nameKey: 'activity.shape.heart', colorHex: '#EC4899', glyph: '♥' },
  { key: 'pentagon', nameKey: 'activity.shape.pentagon', colorHex: '#14B8A6', glyph: '⬟' },
  { key: 'hexagon', nameKey: 'activity.shape.hexagon', colorHex: '#6366F1', glyph: '⬢' },
  { key: 'rhombus', nameKey: 'activity.shape.rhombus', colorHex: '#A855F7', glyph: '⬥' },
];

const COLOR_CHOICES: ColorChoice[] = [
  { key: 'red', nameKey: 'activity.color.red', hex: '#EF4444' },
  { key: 'yellow', nameKey: 'activity.color.yellow', hex: '#FACC15', textColor: '#1F2937' },
  { key: 'blue', nameKey: 'activity.color.blue', hex: '#3B82F6' },
  { key: 'green', nameKey: 'activity.color.green', hex: '#10B981' },
  { key: 'orange', nameKey: 'activity.color.orange', hex: '#F97316' },
  { key: 'purple', nameKey: 'activity.color.purple', hex: '#8B5CF6' },
  { key: 'indigo', nameKey: 'activity.color.indigo', hex: '#4F46E5' },
  { key: 'magenta', nameKey: 'activity.color.magenta', hex: '#D946EF' },
  { key: 'pink', nameKey: 'activity.color.pink', hex: '#EC4899' },
  { key: 'white', nameKey: 'activity.color.white', hex: '#FFFFFF', textColor: '#111827' },
  { key: 'brown', nameKey: 'activity.color.brown', hex: '#92400E' },
  { key: 'black', nameKey: 'activity.color.black', hex: '#111827' },
];

const MOVE_EXERCISE_STEPS: MoveExerciseStep[] = [
  { key: 'head', labelKey: 'activity.move.step.head', emoji: '🙂' },
  { key: 'shoulders', labelKey: 'activity.move.step.shoulders', emoji: '🙆' },
  { key: 'arms', labelKey: 'activity.move.step.arms', emoji: '💪' },
  { key: 'knees', labelKey: 'activity.move.step.knees', emoji: '🦵' },
  { key: 'toes', labelKey: 'activity.move.step.toes', emoji: '🦶' },
];

const MATH_PROBLEM_PRESETS: MathProblemPreset[] = [
  {
    key: 'apples-plus',
    a: 2,
    b: 3,
    operator: '+',
    labelEn: 'I have 2 apples and get 3 more.',
    labelFil: 'Mayroon akong 2 mansanas at nadagdagan ng 3.',
  },
  {
    key: 'balls-minus',
    a: 8,
    b: 2,
    operator: '-',
    labelEn: 'I have 8 balls and give away 2.',
    labelFil: 'Mayroon akong 8 bola at nagbigay ng 2.',
  },
  {
    key: 'birds-plus',
    a: 4,
    b: 1,
    operator: '+',
    labelEn: 'There are 4 birds and 1 more comes.',
    labelFil: 'May 4 na ibon at may dumating pang 1.',
  },
  {
    key: 'stickers-plus',
    a: 5,
    b: 2,
    operator: '+',
    labelEn: 'I have 5 stickers and get 2 more.',
    labelFil: 'Mayroon akong 5 sticker at nadagdagan ng 2.',
  },
  {
    key: 'cars-minus',
    a: 9,
    b: 4,
    operator: '-',
    labelEn: 'I have 9 cars and give 4 away.',
    labelFil: 'Mayroon akong 9 kotse at nagbigay ng 4.',
  },
  {
    key: 'books-minus',
    a: 7,
    b: 3,
    operator: '-',
    labelEn: 'There are 7 books and 3 are taken.',
    labelFil: 'May 7 libro at may kinuha na 3.',
  },
];

function shuffleMathPresets(presets: MathProblemPreset[]): MathProblemPreset[] {
  const list = [...presets];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = list[i];
    list[i] = list[j];
    list[j] = temp;
  }
  return list;
}

const FOCUS_BOARD_HEIGHT = 430;
const MOVE_STEP_MS = 1800;
const FOCUS_BUBBLE_COLORS = ['#7CC8FF', '#8B9CFF', '#95D5FF', '#A7B8FF', '#8DD7FF'];

function createFocusBubble(id: number): FocusBubble {
  return {
    id,
    size: 54 + Math.floor(Math.random() * 44),
    left: 8 + Math.floor(Math.random() * 74),
    delay: Math.floor(Math.random() * 1100),
    duration: 4200 + Math.floor(Math.random() * 2200),
    color: FOCUS_BUBBLE_COLORS[Math.floor(Math.random() * FOCUS_BUBBLE_COLORS.length)],
  };
}

function FocusBubbleItem({ bubble, onPop }: { bubble: FocusBubble; onPop: (id: number) => void }) {
  const translateY = useRef(new Animated.Value(-bubble.size - 20)).current;

  useEffect(() => {
    translateY.setValue(-bubble.size - 20);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(bubble.delay),
        Animated.timing(translateY, {
          toValue: FOCUS_BOARD_HEIGHT - bubble.size + 10,
          duration: bubble.duration,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => {
      loop.stop();
      translateY.stopAnimation();
    };
  }, [bubble, translateY]);

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPop(bubble.id)}
      style={[styles.focusBubbleHitbox, { left: `${bubble.left}%`, width: bubble.size, height: bubble.size }]}
    >
      <Animated.View
        style={[
          styles.focusBubble,
          {
            width: bubble.size,
            height: bubble.size,
            borderRadius: bubble.size / 2,
            backgroundColor: bubble.color,
            transform: [{ translateY }],
          },
        ]}
      >
        <View style={styles.focusBubbleHighlight} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function MoveExerciseKid({ currentStepKey, isRunning }: { currentStepKey: string; isRunning: boolean }) {
  const headBob = useRef(new Animated.Value(0)).current;
  const armLift = useRef(new Animated.Value(0)).current;
  const torsoDip = useRef(new Animated.Value(0)).current;
  const legBend = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(headBob, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(armLift, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(torsoDip, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(legBend, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(headBob, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(armLift, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(torsoDip, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(legBend, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        ]),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [armLift, headBob, isRunning, legBend, torsoDip]);

  const headTranslateY = headBob.interpolate({ inputRange: [0, 1], outputRange: [0, currentStepKey === 'head' ? -8 : -3] });
  const armRotate = armLift.interpolate({ inputRange: [0, 1], outputRange: ['0deg', currentStepKey === 'arms' || currentStepKey === 'shoulders' ? '-40deg' : '-14deg'] });
  const reverseArmRotate = armLift.interpolate({ inputRange: [0, 1], outputRange: ['0deg', currentStepKey === 'arms' || currentStepKey === 'shoulders' ? '40deg' : '14deg'] });
  const torsoTranslateY = torsoDip.interpolate({ inputRange: [0, 1], outputRange: [0, currentStepKey === 'toes' ? 18 : currentStepKey === 'knees' ? 10 : 2] });
  const legRotate = legBend.interpolate({ inputRange: [0, 1], outputRange: ['0deg', currentStepKey === 'knees' ? '18deg' : '5deg'] });

  return (
    <View style={styles.moveFigureStage}>
      <Animated.View style={[styles.moveFigureHead, { transform: [{ translateY: headTranslateY }] }]} />
      <Animated.View style={[styles.moveFigureBody, { transform: [{ translateY: torsoTranslateY }] }]}>
        <View style={styles.moveFigureTorso} />
        <Animated.View style={[styles.moveArm, styles.moveArmLeft, { transform: [{ rotate: armRotate }] }]} />
        <Animated.View style={[styles.moveArm, styles.moveArmRight, { transform: [{ rotate: reverseArmRotate }] }]} />
        <View style={styles.moveHips} />
        <Animated.View style={[styles.moveLeg, styles.moveLegLeft, { transform: [{ rotate: legRotate }] }]} />
        <Animated.View style={[styles.moveLeg, styles.moveLegRight, { transform: [{ rotate: legRotate }] }]} />
      </Animated.View>
      <View style={styles.moveGroundShadow} />
    </View>
  );
}

function buildReadingPyramid(sentence: string): string[] {
  const sanitized = sentence.replace(/[.]/g, '');
  const words = sanitized.split(' ').filter(Boolean);
  return words.map((_, index) => `${words.slice(0, index + 1).join(' ')}${index === words.length - 1 ? '.' : ''}`);
}

const TALK_TILES: TalkTile[] = [
  { key: 'i', wordKey: 'activity.talk.word.i', emoji: '🧒', cardColor: '#F5C8DA' },
  { key: 'my', wordKey: 'activity.talk.word.my', emoji: '🙋', cardColor: '#FDE7B8' },
  { key: 'name', wordKey: 'activity.talk.word.name', emoji: '🏷️', cardColor: '#CCE9FB' },
  { key: 'is', wordKey: 'activity.talk.word.is', emoji: '🟰', cardColor: '#E5DCF8' },
  { key: 'childName', wordKey: 'activity.talk.word.childName', emoji: '⭐', cardColor: '#FFD9A8', isChildName: true },
  { key: 'want', wordKey: 'activity.talk.word.want', emoji: '💛', cardColor: '#FFEDB0' },
  { key: 'need', wordKey: 'activity.talk.word.need', emoji: '🆘', cardColor: '#FFD7CF' },
  { key: 'help', wordKey: 'activity.talk.word.help', emoji: '🤝', cardColor: '#C8F4D8' },
  { key: 'to', wordKey: 'activity.talk.word.to', emoji: '➡️', cardColor: '#D7F1DF' },
  { key: 'take', wordKey: 'activity.talk.word.take', emoji: '✋', cardColor: '#DCE7FF' },
  { key: 'a', wordKey: 'activity.talk.word.a', emoji: '🔤', cardColor: '#E9E5FF' },
  { key: 'play', wordKey: 'activity.talk.word.play', emoji: '🎮', cardColor: '#E8FFD8' },
  { key: 'ride', wordKey: 'activity.talk.word.ride', emoji: '🚲', cardColor: '#FFE0B8' },
  { key: 'eat', wordKey: 'activity.talk.word.eat', emoji: '🍎', cardColor: '#F9D9BE' },
  { key: 'bath', wordKey: 'activity.talk.word.bath', emoji: '🛁', cardColor: '#CFEFFF' },
  { key: 'pee', wordKey: 'activity.talk.word.pee', emoji: '🚽', cardColor: '#FFF2B8' },
  { key: 'water', wordKey: 'activity.talk.word.water', emoji: '💧', cardColor: '#C2DDF4' },
  { key: 'fruit', wordKey: 'activity.talk.word.fruit', emoji: '🍓', cardColor: '#FFD9E8' },
  { key: 'car', wordKey: 'activity.talk.word.car', emoji: '🚗', cardColor: '#D7EBFF' },
  { key: 'ball', wordKey: 'activity.talk.word.ball', emoji: '⚽', cardColor: '#FFF0CF' },
  { key: 'more', wordKey: 'activity.talk.word.more', emoji: '✨', cardColor: '#D9CEF4' },
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
  const { moduleKey, moduleEmoji, taskKey, childName, childAge = '' } = route.params;
  const isAlphabet = taskKey === 'alphabet';
  const isNumbers = taskKey === 'numbers';
  const isMath = taskKey === 'math';
  const isReading = taskKey === 'reading';
  const isShapes = taskKey === 'shapes';
  const isColors = taskKey === 'colors';
  const isFocus = taskKey === 'bubble_pop' && moduleKey === 'sensory';
  const isMove = taskKey === 'head_to_toe' && moduleKey === 'motor';
  const isEmotions = taskKey === 'emotions';
  const isTalk = taskKey === 'aac' && moduleKey === 'speech';
  const steps = useMemo(() => getActivitySteps(taskKey, locale), [taskKey, locale]);
  const [completed, setCompleted] = useState<boolean[]>(new Array(steps.length).fill(false));
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [selectedNumber, setSelectedNumber] = useState<string>('1');
  const [selectedReadingSentence, setSelectedReadingSentence] = useState<string | null>(null);
  const [selectedReadingLine, setSelectedReadingLine] = useState<string>('');
  const [selectedShapeKey, setSelectedShapeKey] = useState<string>(SHAPE_CHOICES[0].key);
  const [selectedColorKey, setSelectedColorKey] = useState<string>(COLOR_CHOICES[0].key);
  const [mathDisplay, setMathDisplay] = useState<string>('0');
  const [mathStoredValue, setMathStoredValue] = useState<number | null>(null);
  const [mathOperator, setMathOperator] = useState<'+' | '-' | null>(null);
  const [mathEquation, setMathEquation] = useState<string>('');
  const [mathWaitingForNext, setMathWaitingForNext] = useState(false);
  const [activeMathPresets, setActiveMathPresets] = useState<MathProblemPreset[]>(() => shuffleMathPresets(MATH_PROBLEM_PRESETS).slice(0, 3));
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionChoice['key']>('angry');
  const [sentenceWords, setSentenceWords] = useState<string[]>([]);
  const [focusStars, setFocusStars] = useState(0);
  const [focusBubbles, setFocusBubbles] = useState<FocusBubble[]>(() => Array.from({ length: 6 }, (_, index) => createFocusBubble(index + 1)));
  const [currentMoveStepIndex, setCurrentMoveStepIndex] = useState(0);
  const [moveRunning, setMoveRunning] = useState(true);
  const [moveCycles, setMoveCycles] = useState(0);
  const readingLines = useMemo(
    () => (selectedReadingSentence ? buildReadingPyramid(selectedReadingSentence) : []),
    [selectedReadingSentence]
  );
  const currentMoveStep = MOVE_EXERCISE_STEPS[currentMoveStepIndex] || MOVE_EXERCISE_STEPS[0];
  const safeChildName = childName.trim() || t('setup.defaultChildName');
  const safeChildAge = childAge.trim() || '___';
  const readingSentences = useMemo(
    () =>
      locale === 'fil'
        ? [`Ang pangalan ko ay ${safeChildName}.`, `Ako ay ${safeChildAge} taong gulang.`, ...BASE_READING_SENTENCES]
        : [`My name is ${safeChildName}.`, `I am ${safeChildAge} years old.`, ...BASE_READING_SENTENCES],
    [locale, safeChildAge, safeChildName]
  );
  const mathPresetChips = useMemo(
    () =>
      activeMathPresets.map((preset) => ({
        ...preset,
        label: locale === 'fil' ? preset.labelFil : preset.labelEn,
      })),
    [activeMathPresets, locale]
  );

  useEffect(() => () => stop(), []);
 
  useEffect(() => {
    if (!isMove || !moveRunning) {
      return;
    }
 
    const timer = setInterval(() => {
      setCurrentMoveStepIndex((prev) => {
        const next = (prev + 1) % MOVE_EXERCISE_STEPS.length;
        if (next === 0) {
          setMoveCycles((cycles) => cycles + 1);
        }
        return next;
      });
    }, MOVE_STEP_MS);
 
    return () => clearInterval(timer);
  }, [isMove, moveRunning]);

  useEffect(() => {
    if (!isMove || !moveRunning) {
      return;
    }

    speak(t(currentMoveStep.labelKey), locale);
  }, [currentMoveStep, isMove, locale, moveRunning]);

  useEffect(() => {
    if (!isMath) {
      return;
    }

    setActiveMathPresets(shuffleMathPresets(MATH_PROBLEM_PRESETS).slice(0, 3));
  }, [isMath]);

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
      ? t('module.speech')
      : isAlphabet
        ? t('task.alphabet')
      : isReading
        ? t('task.reading')
        : isNumbers
          ? t('task.numbers')
          : isMath
            ? t('task.math')
          : isShapes
            ? t('activity.shapes.heading')
            : isColors
              ? t('task.colors')
              : isFocus
                ? t('activity.focus.heading')
                : isMove
                  ? t('activity.move.heading')
      : titleizeTask(taskKey);

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

    if (isMath) {
      setMathDisplay('0');
      setMathStoredValue(null);
      setMathOperator(null);
      setMathEquation('');
      setMathWaitingForNext(false);
      return;
    }

    if (isReading) {
      if (selectedReadingSentence) {
        setSelectedReadingLine(readingLines[0] || '');
      } else {
        setSelectedReadingSentence(null);
        setSelectedReadingLine('');
      }
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

    if (isFocus) {
      setFocusStars(0);
      setFocusBubbles(Array.from({ length: 6 }, (_, index) => createFocusBubble(index + 1)));
      return;
    }
 
    if (isMove) {
      setCurrentMoveStepIndex(0);
      setMoveCycles(0);
      setMoveRunning(true);
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

    if (isMath) {
      speak(mathEquation || mathDisplay, 'en');
      return;
    }

    if (isReading) {
      if (selectedReadingSentence) {
        speak(readingLines.join('. '), 'en');
      } else {
        speak(readingSentences.join('. '), 'en');
      }
      return;
    }

    if (isShapes) {
      const selectedShape = SHAPE_CHOICES.find((shape) => shape.key === selectedShapeKey) || SHAPE_CHOICES[0];
      speak(t(selectedShape.nameKey), locale);
      return;
    }

    if (isColors) {
      const selectedColor = COLOR_CHOICES.find((color) => color.key === selectedColorKey) || COLOR_CHOICES[0];
      speak(t(selectedColor.nameKey), locale);
      return;
    }

    if (isFocus) {
      speak(t('activity.focus.prompt'), locale);
      return;
    }
 
    if (isMove) {
      speak(`${t('activity.move.prompt')}. ${t(currentMoveStep.labelKey)}`, locale);
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

  const applyMath = (left: number, right: number, operator: '+' | '-') => {
    return operator === '+' ? left + right : left - right;
  };

  const handleMathDigitPress = (digit: string) => {
    setMathDisplay((prev) => {
      if (mathWaitingForNext) {
        setMathWaitingForNext(false);
        return digit;
      }
      return prev === '0' ? digit : `${prev}${digit}`;
    });
  };

  const handleMathOperatorPress = (operator: '+' | '-') => {
    const currentValue = Number(mathDisplay);

    if (mathStoredValue === null) {
      setMathStoredValue(currentValue);
      setMathEquation(`${currentValue} ${operator}`);
    } else if (mathOperator && !mathWaitingForNext) {
      const result = applyMath(mathStoredValue, currentValue, mathOperator);
      setMathStoredValue(result);
      setMathDisplay(String(result));
      setMathEquation(`${result} ${operator}`);
    }

    setMathOperator(operator);
    setMathWaitingForNext(true);
  };

  const handleMathEquals = () => {
    if (mathStoredValue === null || !mathOperator) {
      speak(mathDisplay, 'en');
      return;
    }

    const rightValue = Number(mathDisplay);
    const result = applyMath(mathStoredValue, rightValue, mathOperator);
    const nextEquation = `${mathStoredValue} ${mathOperator} ${rightValue} = ${result}`;

    setMathDisplay(String(result));
    setMathEquation(nextEquation);
    setMathStoredValue(result);
    setMathOperator(null);
    setMathWaitingForNext(true);
    speak(nextEquation, 'en');
  };

  const handleMathClear = () => {
    setMathDisplay('0');
    setMathStoredValue(null);
    setMathOperator(null);
    setMathEquation('');
    setMathWaitingForNext(false);
  };

  const handleMathPresetPress = (preset: MathProblemPreset) => {
    const result = applyMath(preset.a, preset.b, preset.operator);
    const equation = `${preset.a} ${preset.operator} ${preset.b} = ${result}`;
    setMathDisplay(String(result));
    setMathEquation(equation);
    setMathStoredValue(result);
    setMathOperator(null);
    setMathWaitingForNext(true);

    const spokenPrompt = locale === 'fil' ? preset.labelFil : preset.labelEn;
    speak(`${spokenPrompt}. ${equation}`, locale);
  };

  const handleReadingLinePress = (line: string) => {
    setSelectedReadingLine(line);
    speak(line, 'en');
  };

  const handleReadingSentencePress = (sentence: string) => {
    const pyramid = buildReadingPyramid(sentence);
    setSelectedReadingSentence(sentence);
    setSelectedReadingLine(pyramid[0] || '');
    speak(sentence, 'en');
  };

  const handleReadingBack = () => {
    setSelectedReadingSentence(null);
    setSelectedReadingLine('');
  };

  const handleShapePress = (shape: ShapeChoice) => {
    setSelectedShapeKey(shape.key);
    speak(t(shape.nameKey), locale);
  };

  const handleColorPress = (choice: ColorChoice) => {
    setSelectedColorKey(choice.key);
    speak(t(choice.nameKey), locale);
  };

  const handleEmotionPress = (emotionKey: EmotionChoice['key']) => {
    setSelectedEmotion(emotionKey);
    speak(t(`activity.emotion.${emotionKey}`), locale);
  };

  const handleFocusBubblePop = (bubbleId: number) => {
    setFocusStars((prev) => prev + 1);
    setFocusBubbles((prev) => prev.map((bubble) => (bubble.id === bubbleId ? createFocusBubble(bubbleId) : bubble)));
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
              <Text style={styles.moduleSubtitle}>{t(`module.desc.${moduleKey}`)}</Text>
              <Text style={styles.childText}>{t('common.forChild', { name: childName })}</Text>
            </View>
          </View>
        </View>

        {!isFocus && !isMove && (
          <Text style={[styles.heading, isTalk && styles.talkHeading, isReading && styles.readingHeading, isFocus && styles.focusHeading]}>{taskHeading}</Text>
        )}

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
        ) : isMath ? (
          <View style={styles.mathWrap}>
            <ScrollView style={styles.mathScroll} contentContainerStyle={styles.mathScrollContent}>
              <Text style={styles.mathInstruction}>{t('activity.mathInstruction')}</Text>

              <View style={styles.mathPresetsRow}>
                {mathPresetChips.map((preset) => (
                  <TouchableOpacity key={preset.key} style={styles.mathPresetChip} onPress={() => handleMathPresetPress(preset)}>
                    <Text style={styles.mathPresetText}>{preset.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.mathDisplayCard}>
                <Text style={styles.mathEquationText}>{mathEquation || ' '}</Text>
                <Text style={styles.mathDisplayText}>{mathDisplay}</Text>
              </View>

              <View style={styles.mathGrid}>
                <TouchableOpacity style={styles.mathKey} onPress={() => handleMathDigitPress('7')}><Text style={styles.mathKeyText}>7</Text></TouchableOpacity>
                <TouchableOpacity style={styles.mathKey} onPress={() => handleMathDigitPress('8')}><Text style={styles.mathKeyText}>8</Text></TouchableOpacity>
                <TouchableOpacity style={styles.mathKey} onPress={() => handleMathDigitPress('9')}><Text style={styles.mathKeyText}>9</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.mathKey, styles.mathOperatorKey]} onPress={() => handleMathOperatorPress('+')}><Text style={styles.mathKeyText}>+</Text></TouchableOpacity>

                <TouchableOpacity style={styles.mathKey} onPress={() => handleMathDigitPress('4')}><Text style={styles.mathKeyText}>4</Text></TouchableOpacity>
                <TouchableOpacity style={styles.mathKey} onPress={() => handleMathDigitPress('5')}><Text style={styles.mathKeyText}>5</Text></TouchableOpacity>
                <TouchableOpacity style={styles.mathKey} onPress={() => handleMathDigitPress('6')}><Text style={styles.mathKeyText}>6</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.mathKey, styles.mathOperatorKey]} onPress={() => handleMathOperatorPress('-')}><Text style={styles.mathKeyText}>-</Text></TouchableOpacity>

                <TouchableOpacity style={styles.mathKey} onPress={() => handleMathDigitPress('1')}><Text style={styles.mathKeyText}>1</Text></TouchableOpacity>
                <TouchableOpacity style={styles.mathKey} onPress={() => handleMathDigitPress('2')}><Text style={styles.mathKeyText}>2</Text></TouchableOpacity>
                <TouchableOpacity style={styles.mathKey} onPress={() => handleMathDigitPress('3')}><Text style={styles.mathKeyText}>3</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.mathKey, styles.mathEqualsKey]} onPress={handleMathEquals}><Text style={[styles.mathKeyText, styles.mathEqualsText]}>=</Text></TouchableOpacity>

                <TouchableOpacity style={[styles.mathKey, styles.mathZeroKey]} onPress={() => handleMathDigitPress('0')}><Text style={styles.mathKeyText}>0</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.mathKey, styles.mathClearKey]} onPress={handleMathClear}><Text style={[styles.mathKeyText, styles.mathClearText]}>C</Text></TouchableOpacity>
              </View>

              <View style={styles.mathBottomActions}>
                <TouchableOpacity style={styles.readAloudButton} onPress={handleReadAloud}>
                  <Text style={styles.readAloudButtonText}>🔊 {t('child.readAloud')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                  <Text style={styles.resetButtonText}>↻ {t('activity.reset')}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        ) : isReading ? (
          <View style={styles.readingWrap}>
            {!selectedReadingSentence ? (
              <>
                <Text style={styles.readingInstruction}>{t('activity.readingListInstruction')}</Text>
                <ScrollView style={styles.readingLinesScroll} contentContainerStyle={styles.readingLinesList}>
                  {readingSentences.map((sentence, index) => (
                    <TouchableOpacity
                      key={`${sentence}-${index}`}
                      style={styles.readingSentenceCard}
                      onPress={() => handleReadingSentencePress(sentence)}
                    >
                      <Text style={styles.readingSentenceNumber}>{index + 1}.</Text>
                      <Text style={styles.readingSentenceText}>{sentence}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            ) : (
              <>
                <View style={styles.readingTopActions}>
                  <TouchableOpacity style={styles.readingBackButton} onPress={handleReadingBack}>
                    <Text style={styles.readingBackButtonText}>{t('activity.readingBack')}</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.readingInstruction}>{t('activity.readingInstruction')}</Text>
                <View style={styles.selectedReadingCard}>
                  <Text style={styles.selectedReadingSentence}>{selectedReadingSentence}</Text>
                  <Text style={styles.selectedReadingLine}>{selectedReadingLine}</Text>
                </View>
                <ScrollView style={styles.readingLinesScroll} contentContainerStyle={styles.readingLinesList}>
                  {readingLines.map((line, index) => (
                    <TouchableOpacity
                      key={`${line}-${index}`}
                      style={[styles.readingLineCard, selectedReadingLine === line && styles.readingLineCardActive]}
                      onPress={() => handleReadingLinePress(line)}
                    >
                      <Text style={[styles.readingLineText, selectedReadingLine === line && styles.readingLineTextActive]}>{line}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}
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
        ) : isFocus ? (
          <View style={styles.focusWrap}>
            <View style={styles.focusTopRow}>
              <Text style={styles.focusPrompt}>{t('activity.focus.title')}</Text>
              <View style={styles.focusStarsBadge}>
                <Text style={styles.focusStarsText}>{focusStars} ⭐</Text>
              </View>
            </View>

            <View style={styles.focusBoard}>
              {focusBubbles.map((bubble) => (
                <FocusBubbleItem key={`${bubble.id}-${bubble.size}-${bubble.left}-${bubble.duration}`} bubble={bubble} onPop={handleFocusBubblePop} />
              ))}

              <View style={styles.focusHintPill}>
                <Text style={styles.focusHintText}>{t('activity.focus.prompt')}</Text>
              </View>
            </View>
          </View>
        ) : isMove ? (
          <View style={styles.moveWrap}>
            <View style={styles.moveTopRow}>
              <Text style={styles.movePrompt}>{t('activity.move.prompt')}</Text>
              <View style={styles.moveCyclesBadge}>
                <Text style={styles.moveCyclesText}>{moveCycles} ⭐</Text>
              </View>
            </View>
 
            <View style={styles.moveStageCard}>
              <MoveExerciseKid currentStepKey={currentMoveStep.key} isRunning={moveRunning} />
            </View>
 
            <View style={styles.moveCurrentStepCard}>
              <Text style={styles.moveCurrentStepEmoji}>{currentMoveStep.emoji}</Text>
              <Text style={styles.moveCurrentStepText}>{t(currentMoveStep.labelKey)}</Text>
            </View>

            <TouchableOpacity style={styles.movePlayPauseBtn} onPress={() => setMoveRunning((running) => !running)}>
              <Text style={styles.movePlayPauseText}>{moveRunning ? t('activity.move.pause') : t('activity.move.start')}</Text>
            </TouchableOpacity>
 
            <View style={styles.moveStepsList}>
              {MOVE_EXERCISE_STEPS.map((step, index) => (
                <View key={step.key} style={[styles.moveStepChip, index === currentMoveStepIndex && styles.moveStepChipActive]}>
                  <Text style={styles.moveStepChipEmoji}>{step.emoji}</Text>
                  <Text style={[styles.moveStepChipText, index === currentMoveStepIndex && styles.moveStepChipTextActive]}>
                    {t(step.labelKey)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : isEmotions ? (
          <View style={styles.emotionsWrap}>
            <View style={styles.emotionsGridWrap}>
              <ScrollView style={styles.emotionsGridScroll} contentContainerStyle={styles.emotionsGrid}>
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
              </ScrollView>
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

        {!isEmotions && !isTalk && !isFocus && !isMove && !isMath && (
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
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
    color: '#0F172A',
    flexShrink: 1,
  },
  moduleSubtitle: {
    marginTop: 2,
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '700',
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
  focusHeading: {
    fontSize: 18,
    marginTop: 14,
    marginBottom: 10,
  },
  moveWrap: {
    flexGrow: 0,
  },
  moveTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  movePrompt: {
    fontSize: 16,
    color: '#6B6661',
    fontWeight: '800',
    flexShrink: 1,
    marginRight: 10,
  },
  moveCyclesBadge: {
    backgroundColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  moveCyclesText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  moveStageCard: {
    backgroundColor: '#E9F8FF',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#D5ECFA',
    padding: 18,
    height: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moveFigureStage: {
    width: 210,
    height: 250,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  moveFigureHead: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F8C9A6',
    marginBottom: 10,
  },
  moveFigureBody: {
    width: 140,
    alignItems: 'center',
    position: 'relative',
  },
  moveFigureTorso: {
    width: 78,
    height: 92,
    borderRadius: 28,
    backgroundColor: '#5BA7FF',
  },
  moveArm: {
    position: 'absolute',
    top: 10,
    width: 22,
    height: 88,
    borderRadius: 14,
    backgroundColor: '#F8C9A6',
  },
  moveArmLeft: {
    left: 6,
  },
  moveArmRight: {
    right: 6,
  },
  moveHips: {
    width: 62,
    height: 18,
    borderRadius: 12,
    backgroundColor: '#1D4ED8',
    marginTop: -6,
  },
  moveLeg: {
    position: 'absolute',
    top: 98,
    width: 24,
    height: 96,
    borderRadius: 16,
    backgroundColor: '#1F2937',
  },
  moveLegLeft: {
    left: 46,
  },
  moveLegRight: {
    right: 46,
  },
  moveGroundShadow: {
    width: 120,
    height: 16,
    borderRadius: 999,
    backgroundColor: 'rgba(100,116,139,0.18)',
    marginTop: 10,
  },
  moveCurrentStepCard: {
    marginTop: 12,
    backgroundColor: '#111827',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  moveCurrentStepEmoji: {
    fontSize: 22,
  },
  moveCurrentStepText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
  },
  movePlayPauseBtn: {
    marginTop: 10,
    backgroundColor: '#111827',
    borderRadius: 999,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  movePlayPauseText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  moveStepsList: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  moveStepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moveStepChipActive: {
    backgroundColor: '#DBEAFE',
    borderColor: '#60A5FA',
  },
  moveStepChipEmoji: {
    fontSize: 15,
  },
  moveStepChipText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  moveStepChipTextActive: {
    color: '#1D4ED8',
  },
  readingHeading: {
    fontSize: 24,
  },
  focusWrap: {
    flexGrow: 0,
  },
  focusTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  focusPrompt: {
    fontSize: 18,
    color: '#6B6661',
    fontWeight: '800',
  },
  focusStarsBadge: {
    backgroundColor: '#111111',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  focusStarsText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  focusBoard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#D7EBFB',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#E0ECF7',
    height: FOCUS_BOARD_HEIGHT,
  },
  focusBubbleHitbox: {
    position: 'absolute',
    top: 0,
    zIndex: 2,
  },
  focusBubble: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingLeft: 12,
    shadowColor: '#7AA7DB',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  focusBubbleHighlight: {
    width: '34%',
    height: '34%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  focusHintPill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignSelf: 'center',
    marginHorizontal: 90,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
    zIndex: 1,
  },
  focusHintText: {
    textAlign: 'center',
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  stepsWrap: {
    flex: 1,
  },
  readingWrap: {
    flex: 1,
  },
  readingTopActions: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  readingBackButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  readingBackButtonText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
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
  selectedReadingSentence: {
    fontSize: 15,
    color: '#475569',
    fontWeight: '700',
    marginBottom: 6,
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
  readingSentenceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  readingSentenceNumber: {
    fontSize: 15,
    color: '#1D4ED8',
    fontWeight: '900',
  },
  readingSentenceText: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '700',
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
  mathWrap: {
    flex: 1,
    minHeight: 0,
  },
  mathScroll: {
    flex: 1,
  },
  mathScrollContent: {
    paddingBottom: 8,
  },
  mathInstruction: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 8,
  },
  mathPresetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  mathPresetChip: {
    backgroundColor: '#E8F5FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  mathPresetText: {
    color: '#1E3A8A',
    fontSize: 12,
    fontWeight: '800',
  },
  mathDisplayCard: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    minHeight: 88,
    justifyContent: 'space-between',
  },
  mathEquationText: {
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  mathDisplayText: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'right',
  },
  mathGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  mathBottomActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  mathKey: {
    width: '23.5%',
    minHeight: 68,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mathKeyText: {
    color: '#111827',
    fontSize: 26,
    fontWeight: '900',
  },
  mathOperatorKey: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  mathEqualsKey: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  mathEqualsText: {
    color: '#FFFFFF',
  },
  mathZeroKey: {
    width: '49%',
  },
  mathClearKey: {
    width: '49%',
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  mathClearText: {
    color: '#B91C1C',
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
    justifyContent: 'flex-start',
    marginTop: 2,
    paddingBottom: 4,
  },
  emotionsGridWrap: {
    flex: 1,
    minHeight: 0,
  },
  emotionsGridScroll: {
    flex: 1,
  },
  emotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    paddingBottom: 8,
  },
  emotionCard: {
    width: '31.5%',
    minHeight: 102,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
  },
  emotionCardActive: {
    borderColor: '#0F172A',
    borderWidth: 3,
  },
  emotionEmoji: {
    fontSize: 36,
  },
  emotionLabel: {
    marginTop: 6,
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '900',
    textAlign: 'center',
  },
  emotionSupportBar: {
    marginTop: 10,
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emotionSupportText: {
    color: '#FFFFFF',
    fontSize: 13,
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
