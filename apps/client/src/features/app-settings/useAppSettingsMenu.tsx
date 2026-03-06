import { useMemo } from 'react';

import useAppVersion from '../../common/hooks-query/useAppVersion';
import { isDocker } from '../../externals';

export type SettingsOption = {
  id: string;
  label: string;
  secondary?: Readonly<SettingsOption[]>;
  split?: boolean;
  highlight?: string;
};

const staticOptions = [
  {
    id: 'settings',
    label: '設定',
    secondary: [
      { id: 'settings__data', label: 'プロジェクトデータ' },
      { id: 'settings__general', label: '一般設定' },
      { id: 'settings__view', label: 'ビュー設定' },
      { id: 'settings__port', label: 'サーバーポート' },
    ],
  },
  {
    id: 'project',
    label: 'プロジェクト',
    split: true,
    secondary: [
      { id: 'project__create', label: '作成...' },
      { id: 'project__list', label: 'プロジェクト管理' },
    ],
  },
  {
    id: 'manage',
    label: 'プロジェクト設定',
    secondary: [
      { id: 'manage__defaults', label: 'ランダウンのデフォルト' },
      { id: 'manage__custom', label: 'カスタムフィールド' },
      { id: 'manage__rundowns', label: 'ランダウン管理' },
      { id: 'manage__sheets', label: 'スプレッドシートをインポート' },
      { id: 'manage__sheets', label: 'Googleシートと同期' },
    ],
  },
  {
    id: 'automation',
    label: 'オートメーション',
    split: true,
    secondary: [
      { id: 'automation__settings', label: 'オートメーション設定' },
      { id: 'automation__automations', label: 'オートメーション管理' },
      { id: 'automation__triggers', label: 'トリガー管理' },
    ],
  },
  {
    id: 'sharing',
    label: '共有とレポート',
    split: true,
    secondary: [
      { id: 'sharing__presets', label: 'URLプリセット' },
      {
        id: 'sharing__link',
        label: 'リンクを共有',
      },
      { id: 'sharing__report', label: 'ランタイムレポート' },
    ],
  },
  {
    id: 'network',
    label: 'ネットワーク',
    split: true,
    secondary: [
      {
        id: 'network__log',
        label: 'イベントログ',
      },
      {
        id: 'network__clients',
        label: 'クライアント管理',
      },
    ],
  },
  {
    id: 'about',
    label: 'このアプリについて',
    split: true,
  },
  {
    id: 'shutdown',
    label: 'シャットダウン',
    split: true,
  },
] as const;

// a child of navigation or a child of secondary navigation
export type SettingsOptionId =
  | (typeof staticOptions)[number]['id']
  | Extract<(typeof staticOptions)[number], { secondary: object }>['secondary'][number]['id'];

export function useAppSettingsMenu() {
  const { data } = useAppVersion();

  const options: Readonly<SettingsOption[]> = useMemo(
    () =>
      staticOptions.map((option) => ({
        ...option,
        // if we are in docker don't show the port option
        secondary:
          'secondary' in option
            ? isDocker && option.id === 'settings'
              ? [...option.secondary.filter(({ id }) => id !== 'settings__port')]
              : [...option.secondary]
            : undefined,
        // if there is an update then highlight the about setting
        highlight: option.id === 'about' && data.hasUpdates ? '新しいバージョンが利用可能' : undefined,
      })),
    [data],
  );

  return { options };
}
