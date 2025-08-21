interface Question {
  id: string;
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  prompt: {
    ja: string;
    en: string;
  };
  direction: -1 | 1; // How the answer affects the axis
  order: number;
}

interface LocalizedQuestion {
  id: string;
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  prompt: string;
  direction: -1 | 1;
  order: number;
}

export function getQuestions(locale: 'ja' | 'en'): LocalizedQuestion[] {
  if (locale !== 'ja' && locale !== 'en') {
    throw new Error('Unsupported locale');
  }

  // Fake implementation - minimal set to pass initial tests
  const questions: Question[] = [
    // EI axis - 6 questions
    { id: 'ei_1', axis: 'EI', prompt: { ja: '人とのやりとりでエネルギーを得る', en: 'I gain energy from interactions with people' }, direction: -1, order: 1 },
    { id: 'ei_2', axis: 'EI', prompt: { ja: '一人の時間を大切にする', en: 'I value alone time' }, direction: 1, order: 2 },
    { id: 'ei_3', axis: 'EI', prompt: { ja: '新しい人に会うのが好き', en: 'I enjoy meeting new people' }, direction: -1, order: 3 },
    { id: 'ei_4', axis: 'EI', prompt: { ja: '静かな環境を好む', en: 'I prefer quiet environments' }, direction: 1, order: 4 },
    { id: 'ei_5', axis: 'EI', prompt: { ja: 'パーティーなどの社交的な場が好き', en: 'I enjoy social gatherings like parties' }, direction: -1, order: 5 },
    { id: 'ei_6', axis: 'EI', prompt: { ja: '少数の親しい友人を持つ方が好き', en: 'I prefer having a few close friends' }, direction: 1, order: 6 },

    // SN axis - 6 questions
    { id: 'sn_1', axis: 'SN', prompt: { ja: '具体的な事実を重視する', en: 'I focus on concrete facts' }, direction: -1, order: 7 },
    { id: 'sn_2', axis: 'SN', prompt: { ja: '可能性や未来について考えるのが好き', en: 'I like thinking about possibilities and the future' }, direction: 1, order: 8 },
    { id: 'sn_3', axis: 'SN', prompt: { ja: '詳細な手順を踏むのが好き', en: 'I like following detailed procedures' }, direction: -1, order: 9 },
    { id: 'sn_4', axis: 'SN', prompt: { ja: '直感で物事を判断することが多い', en: 'I often make decisions based on intuition' }, direction: 1, order: 10 },
    { id: 'sn_5', axis: 'SN', prompt: { ja: '実用的な解決策を好む', en: 'I prefer practical solutions' }, direction: -1, order: 11 },
    { id: 'sn_6', axis: 'SN', prompt: { ja: '理論的な概念に興味がある', en: 'I am interested in theoretical concepts' }, direction: 1, order: 12 },

    // TF axis - 6 questions
    { id: 'tf_1', axis: 'TF', prompt: { ja: '論理的な分析を重視する', en: 'I value logical analysis' }, direction: -1, order: 13 },
    { id: 'tf_2', axis: 'TF', prompt: { ja: '人の感情を考慮して決定する', en: 'I consider people\'s feelings when making decisions' }, direction: 1, order: 14 },
    { id: 'tf_3', axis: 'TF', prompt: { ja: '客観的な事実に基づいて判断する', en: 'I make judgments based on objective facts' }, direction: -1, order: 15 },
    { id: 'tf_4', axis: 'TF', prompt: { ja: '他人の気持ちに共感しやすい', en: 'I easily empathize with others\' feelings' }, direction: 1, order: 16 },
    { id: 'tf_5', axis: 'TF', prompt: { ja: '公平性を重視する', en: 'I value fairness' }, direction: -1, order: 17 },
    { id: 'tf_6', axis: 'TF', prompt: { ja: '調和を保つことが大切', en: 'Maintaining harmony is important' }, direction: 1, order: 18 },

    // JP axis - 6 questions
    { id: 'jp_1', axis: 'JP', prompt: { ja: 'きちんと計画を立てるのが好き', en: 'I like to make detailed plans' }, direction: -1, order: 19 },
    { id: 'jp_2', axis: 'JP', prompt: { ja: '柔軟性を保ちたい', en: 'I want to keep things flexible' }, direction: 1, order: 20 },
    { id: 'jp_3', axis: 'JP', prompt: { ja: '締切を守ることが重要', en: 'Meeting deadlines is important' }, direction: -1, order: 21 },
    { id: 'jp_4', axis: 'JP', prompt: { ja: '新しい選択肢が現れることを好む', en: 'I like when new options emerge' }, direction: 1, order: 22 },
    { id: 'jp_5', axis: 'JP', prompt: { ja: '決断を下すのが早い', en: 'I make decisions quickly' }, direction: -1, order: 23 },
    { id: 'jp_6', axis: 'JP', prompt: { ja: '情報を集めてから決める', en: 'I gather information before deciding' }, direction: 1, order: 24 },
  ];

  return questions.map(q => ({
    id: q.id,
    axis: q.axis,
    prompt: q.prompt[locale],
    direction: q.direction,
    order: q.order,
  }));
}