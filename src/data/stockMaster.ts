import type { Household, StockItem } from '../types';

// =============================================================
// 備蓄量の計算基準(すべて出典つき。年1回見直し → docs/08_release_plan.md)
//
// [1] 農林水産省「災害時に備えた食品ストックガイド」
//     https://www.maff.go.jp/j/zyukyu/foodstock/guidebook.html
//     - 飲料水: 1人1日3L(飲用+調理)、最低3日分・推奨1週間分
//     - 主食: 1人1日3食、カセットボンベ: 約6本/週(1人の目安)
// [2] 東京備蓄ナビ(東京都) https://www.bichiku.metro.tokyo.lg.jp/
//     - 家族構成別の品目・数量の考え方を参考
// [3] 内閣府・日本トイレ協会: 携帯トイレは1人1日5回分
//     https://www.bousai.go.jp/
// 数量はいずれも「目安」であり、画面上でもその旨を常時表示する。
// =============================================================

const ceil = Math.ceil;

export function buildItems(h: Household): StockItem[] {
  const persons = h.adults + h.seniors + h.kidsInfant + h.kidsChild;
  const eaters = h.adults + h.seniors + h.kidsChild; // 乳幼児は別計算
  const days = h.targetDays;
  const petCount = h.pets.length;

  const items: StockItem[] = [
    {
      id: 'water', name: '飲料水(2Lペットボトル)', emoji: '💧', category: 'water', priority: 'S',
      requiredQty: ceil((3 * persons * days) / 2), unit: '本',
      note: `1人1日3Lが目安(飲用+調理)[出典1]`, expirable: true, status: 'need',
    },
    {
      id: 'staple', name: '主食(パックご飯・麺・米など)', emoji: '🍚', category: 'staple', priority: 'S',
      requiredQty: 3 * eaters * days, unit: '食',
      note: 'ふだん食べているものでOK。それがローリングストック [出典1]', expirable: true, status: 'need',
    },
    {
      id: 'main', name: '主菜(缶詰・常温保存のレトルト等)', emoji: '🥫', category: 'main', priority: 'A',
      requiredQty: ceil(1.5 * eaters * days), unit: '品',
      note: '常温で保存できるものを中心に。1人1日1.5品は本アプリの目安。食事量に合わせて調整 [出典1]', expirable: true, status: 'need',
    },
    {
      id: 'side', name: '野菜ジュース・果物缶・汁物など', emoji: '🧃', category: 'side', priority: 'B',
      requiredQty: eaters * days, unit: '個',
      note: '1人1日1個は本アプリの目安。食事内容に合わせ、野菜・果物も備えてください [出典1]', expirable: true, status: 'need',
    },
    {
      id: 'toilet', name: '携帯トイレ・簡易トイレ', emoji: '🚽', category: 'toilet', priority: 'S',
      requiredQty: 5 * persons * days, unit: '回分',
      note: h.dwelling === 'apt_high'
        ? '成人の目安は1人1日5回。乳幼児分はおむつ等の利用に合わせて調整。排水設備の安全確認前は流さない [出典3]'
        : '成人の目安は1人1日5回。乳幼児分はおむつ等の利用に合わせて調整 [出典3]',
      expirable: false, status: 'need',
    },
    {
      id: 'konro', name: 'カセットコンロ', emoji: '🔥', category: 'heat', priority: 'A',
      requiredQty: 1, unit: '台',
      note: '温かい食事は想像以上に大事 [出典1]', expirable: false, status: 'need',
    },
    {
      id: 'bombe', name: 'カセットボンベ', emoji: '🛢️', category: 'heat', priority: 'A',
      requiredQty: ceil((6 * persons * days) / 7), unit: '本',
      note: '1人1週間約6本から日数換算。調理方法で調整し、換気・保管は製品の注意に従ってください [出典4]', expirable: true, status: 'need',
    },
    {
      id: 'battery', name: 'モバイルバッテリー', emoji: '🔋', category: 'power', priority: 'S',
      requiredQty: Math.max(1, ceil((h.adults + h.seniors) / 2)), unit: '台',
      note: '情報と連絡が命綱。ふだんから満充電の習慣を', expirable: false, status: 'need',
    },
    {
      id: 'light', name: 'LEDライト・ランタン', emoji: '🔦', category: 'common', priority: 'A',
      requiredQty: Math.max(1, ceil(persons / 2)), unit: '個',
      note: '1人1灯が理想。両手が空くヘッドライトも便利 [出典2]', expirable: false, status: 'need',
    },
    {
      id: 'drybattery', name: '乾電池(ライト・ラジオ用)', emoji: '⚡', category: 'power', priority: 'A',
      requiredQty: 1, unit: '式',
      note: '使用機器に合うサイズを多めに。期限もある [出典2]', expirable: true, status: 'need',
    },
    {
      id: 'radio', name: '携帯ラジオ', emoji: '📻', category: 'common', priority: 'B',
      requiredQty: 1, unit: '台',
      note: '停電・通信障害時の情報源 [出典2]', expirable: false, status: 'need',
    },
    {
      id: 'firstaid', name: '救急セット・常備薬', emoji: '🩹', category: 'common', priority: 'A',
      requiredQty: 1, unit: '式',
      note: '絆創膏・消毒・解熱鎮痛剤・持病の薬 [出典2]', expirable: true, status: 'need',
    },
    {
      id: 'cash', name: '現金(小銭・千円札を多めに)', emoji: '💴', category: 'common', priority: 'A',
      requiredQty: 1, unit: '式',
      note: '停電時はキャッシュレスが使えない [出典2]', expirable: false, status: 'need',
    },
    {
      id: 'wet', name: 'ウェットティッシュ・からだふき', emoji: '🧻', category: 'common', priority: 'B',
      requiredQty: Math.max(1, ceil(persons / 2)), unit: '個',
      note: '断水時の衛生維持に [出典2]', expirable: false, status: 'need',
    },
    {
      id: 'wrap', name: '食品用ラップ・ポリ袋', emoji: '🎁', category: 'common', priority: 'B',
      requiredQty: 1, unit: '式',
      note: '皿に巻けば洗い物ゼロ。万能選手 [出典2]', expirable: false, status: 'need',
    },
    {
      id: 'warm', name: 'ブランケット・カイロ', emoji: '🧣', category: 'common', priority: 'B',
      requiredQty: persons, unit: '人分',
      note: '停電の冬は暖房なし。夏なら冷感タオルも [出典2]', expirable: false, status: 'need',
    },
  ];

  if (h.kidsInfant > 0) {
    items.push(
      {
        id: 'diaper', name: 'おむつ', emoji: '👶', category: 'baby', priority: 'S',
        requiredQty: 8 * days * h.kidsInfant, unit: '枚',
        note: '1人1日8枚目安。サイズアウトに注意=こまめに入替 [出典2]', expirable: false, status: 'need',
      },
      {
        id: 'milk', name: '液体ミルク・離乳食', emoji: '🍼', category: 'baby', priority: 'S',
        requiredQty: days * h.kidsInfant, unit: '日分',
        note: '年齢・授乳方法に合うものを、普段の1日量で。2歳児などは通常食も含めて調整 [出典1]', expirable: true, status: 'need',
      },
    );
  }

  if (h.seniors > 0 || h.flags.medication) {
    items.push({
      id: 'medicine', name: '常用薬の予備+お薬手帳のコピー', emoji: '💊', category: 'senior', priority: 'S',
      requiredQty: 1, unit: '式',
      note: '必要な予備の量は、かかりつけ医・薬剤師に相談。お薬手帳も用意 [出典1]', expirable: true, status: 'need',
    });
  }

  if (h.seniors > 0) {
    items.push({
      id: 'carefood', name: '介護食・とろみ剤(必要な方のみ)', emoji: '🥣', category: 'senior', priority: 'A',
      requiredQty: 1, unit: '式',
      note: '要配慮者向けストックガイド参照 [出典1]', expirable: true, status: 'need',
    });
  }

  if (h.flags.allergy) {
    items.push({
      id: 'allergyfood', name: 'アレルギー対応食の確保', emoji: '🏷️', category: 'main', priority: 'S',
      requiredQty: days, unit: '日分',
      note: '必要な全員分の食事量を1日分として確認。主食・主菜と重複するので別枠で買い足す必要はありません [出典1]', expirable: true, status: 'need',
    });
  }

  if (petCount > 0) {
    items.push(
      {
        id: 'petfood', name: 'ペットフード・ペット用の水', emoji: '🐾', category: 'pet', priority: 'A',
        requiredQty: days * petCount, unit: '頭日分',
        note: '頭数×日数。1頭日分はそのペットの普段の1日量。人用の水とは別に確保 [出典2]', expirable: true, status: 'need',
      },
      {
        id: 'pettoilet', name: 'ペットのトイレ用品', emoji: '🐈', category: 'pet', priority: 'B',
        requiredQty: 1, unit: '式',
        note: 'ペットシーツ・猫砂など', expirable: false, status: 'need',
      },
    );
  }

  return items.filter(i => i.requiredQty > 0).map(i => ({ ...i, ownedQty: 0 }));
}

export const SOURCES = [
  {
    label: '[出典1] 農林水産省「災害時に備えた食品ストックガイド」',
    url: 'https://www.maff.go.jp/j/zyukyu/foodstock/guidebook.html',
  },
  { label: '[出典2] 東京備蓄ナビ(東京都)', url: 'https://www.bichiku.metro.tokyo.lg.jp/' },
  { label: '[出典3] 内閣府：災害時のトイレ対策', url: 'https://www.bousai.go.jp/kohou/kouhoubousai/r06/111/news_08.html' },
  { label: '[出典4] 農林水産省：熱源を確保しよう', url: 'https://www.maff.go.jp/j/zyukyu/foodstock/chapter07.html' },
  { label: 'ハザードマップポータルサイト(国土交通省)', url: 'https://disaportal.gsi.go.jp/' },
];
