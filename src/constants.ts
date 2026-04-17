import type { Mood, StoreItem, Task, WikiProfile, WishlistItem } from './types';

export const DEFAULT_MOODS: Mood[] = [
  { id: 'sunny', icon: '☀️', text: '心情大好', colorClass: 'bg-orange-400' },
  { id: 'emo', icon: '🌧️', text: 'emo求安慰', colorClass: 'bg-blue-400' },
  { id: 'explosive', icon: '🌩️', text: '易燃易爆', colorClass: 'bg-rose-600' },
  { id: 'busy', icon: '🧱', text: '加班搬砖中', colorClass: 'bg-slate-500' },
  { id: 'period', icon: '🩸', text: '大姨妈', colorClass: 'bg-red-500' },
  { id: 'calm', icon: '🌈', text: '平稳正常', colorClass: 'bg-green-400' },
];

export const DEFAULT_MOOD: Mood = DEFAULT_MOODS[5];

export const DEFAULT_STORE_ITEMS: StoreItem[] = [
  { id: 's1', title: 'PS5 畅玩两小时', cost: 100, icon: '🎮', colorClass: 'bg-blue-100 text-blue-500', isCustom: false },
  { id: 's2', title: '免除一次争吵权', cost: 800, icon: '🛡️', colorClass: 'bg-yellow-100 text-yellow-600', isCustom: false },
  { id: 's3', title: '买新外设/游戏额度', cost: 2000, icon: '⌨️', colorClass: 'bg-purple-100 text-purple-500', isCustom: false },
  { id: 's4', title: '随叫随到按摩券', cost: 150, icon: '💆‍♂️', colorClass: 'bg-green-100 text-green-500', isCustom: false },
];

export const DEFAULT_TASKS: Task[] = [
  { id: 't1', title: '周末全屋大扫除', icon: '🧹', reward: 200, createdBy: 'wife', status: 'open', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: 't2', title: '下楼拿三个重快递', icon: '📦', reward: 30, createdBy: 'wife', status: 'open', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: 't3', title: '今晚做饭并洗碗', icon: '🍳', reward: 100, createdBy: 'wife', status: 'open', createdAt: new Date(Date.now() - 10800000).toISOString() },
];

export const DEFAULT_WIKI_PROFILES: WikiProfile[] = [
  {
    id: 'wife',
    displayName: '老婆大人',
    avatar: '🐱',
    fields: [
      { key: 'shoeSize', label: '👠 鞋码', value: '37码 (偶尔36.5)', colSpan: 1 },
      { key: 'ringSize', label: '💍 戒指圈口', value: '港度 11 号', colSpan: 1 },
      { key: 'clothes', label: '👕 衣服尺码', value: 'S / 小码', colSpan: 1 },
      { key: 'allergy', label: '🚫 过敏/禁忌', value: '不吃香菜', colSpan: 1 },
      { key: 'milkTea', label: '🧋 奶茶喜好', value: '三分糖、去冰、加波霸 (绝不要椰果)', colSpan: 2, highlight: true },
      { key: 'birthday', label: '🎂 生日', value: '3月8日', colSpan: 1 },
      { key: 'id', label: '🪪 身份证', value: '(已隐藏，点击查看)', colSpan: 1 },
    ],
  },
  {
    id: 'husband',
    displayName: '苦命老公',
    avatar: '🐶',
    fields: [
      { key: 'shoeSize', label: '👟 鞋码', value: '42码', colSpan: 1 },
      { key: 'clothes', label: '👕 衣服尺码', value: 'L / 大码', colSpan: 1 },
      { key: 'allergy', label: '🚫 过敏/禁忌', value: '不吃芫荽', colSpan: 1 },
      { key: 'food', label: '🍜 最爱', value: '烤冷面、麻辣烫', colSpan: 1 },
      { key: 'birthday', label: '🎂 生日', value: '7月22日', colSpan: 1 },
    ],
  },
];

export const DEFAULT_WISHLIST: WishlistItem[] = [
  { id: 'w1', name: '某牌新款托特包', emoji: '👜', notes: '官网黑色款', addedAt: new Date(Date.now() - 86400000).toISOString() },
  { id: 'w2', name: '香氛蜡烛套装', emoji: '🕯️', notes: '小红书同款，薰衣草香', addedAt: new Date(Date.now() - 172800000).toISOString() },
];

export const TASK_ICONS = ['🧹', '📦', '🍳', '🐕', '🛒', '💊', '🚗', '🌿', '🧺', '💡'];

export const APPROVAL_TEMPLATES = {
  basketball: {
    title: '外出打球申请',
    reason: '和老李打全场篮球',
    datetime: '',
    sincerity: '回来路上买奶茶，晚上洗碗',
  },
  shopping: {
    title: '大额采购请示',
    reason: '买新外设',
    datetime: '',
    sincerity: '下个月不乱花钱，保证！',
  },
  truce: {
    title: '赛博休战申请',
    reason: '申请停火，我先道歉',
    datetime: '',
    sincerity: '都是我的错，想和好',
  },
  custom: {
    title: '',
    reason: '',
    datetime: '',
    sincerity: '',
  },
};
