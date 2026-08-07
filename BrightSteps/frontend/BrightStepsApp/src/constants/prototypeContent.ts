export type ModuleTile = {
  id: string;
  moduleKey: string;
  subtitleKey: string;
  emoji: string;
  color: string;
};

export const CHILD_MODULE_TILES: ModuleTile[] = [
  { id: 'daily', moduleKey: 'daily_living', subtitleKey: 'module.desc.daily_living', emoji: '🏠', color: '#D8F4E8' },
  { id: 'academic', moduleKey: 'academic', subtitleKey: 'module.desc.academic', emoji: '📚', color: '#FFE7D6' },
  { id: 'emotional', moduleKey: 'emotional', subtitleKey: 'module.desc.emotional', emoji: '😊', color: '#FFDDE2' },
  { id: 'speech', moduleKey: 'speech', subtitleKey: 'module.desc.speech', emoji: '🗣️', color: '#FFD8E9' },
  { id: 'sensory', moduleKey: 'sensory', subtitleKey: 'module.desc.sensory', emoji: '🎮', color: '#EAF7BF' },
  // { id: 'cognitive', moduleKey: 'cognitive', subtitleKey: 'module.desc.cognitive', emoji: '🧠', color: '#E9DDFB' },
  { id: 'motor', moduleKey: 'motor', subtitleKey: 'module.desc.motor', emoji: '💪', color: '#D9F2FF' },
  // { id: 'life', moduleKey: 'life_skills', subtitleKey: 'module.desc.life_skills', emoji: '🌍', color: '#FFF0C7' },
];

export const CHILD_ACCESSIBILITY_ITEMS = [
  { prefix: 'Aa', labelKey: 'child.largeText', statusKey: 'common.off' },
  { prefix: '◐', labelKey: 'child.highContrast', statusKey: 'common.off' },
  { prefix: '🔊', labelKey: 'child.tts', statusKey: 'common.on' },
  { prefix: '●', labelKey: 'child.offlineReady', statusKey: '' },
];

export const PARENT_REWARD_BADGES = ['🏅', '🌟', '💧', '🤝'];

export const PARENT_PROGRESS_KEYS = [
  'parent.progressLine1',
  'parent.progressLine2',
  'parent.progressLine3',
  'parent.progressLine4',
] as const;

export const PARENT_AI_TIP_KEYS = ['parent.aiTip1', 'parent.aiTip2', 'parent.aiTip3'] as const;
