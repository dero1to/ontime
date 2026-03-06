import { EndAction, TimerType, TimeStrategy } from 'ontime-types';
import { parseUserTime } from 'ontime-utils';

import TimeInput from '../../../../common/components/input/time-input/TimeInput';
import Select from '../../../../common/components/select/Select';
import Switch from '../../../../common/components/switch/Switch';
import { editorSettingsDefaults, useEditorSettings } from '../../../../common/stores/editorSettings';
import * as Panel from '../../panel-utils/PanelUtils';

export default function RundownDefaultSettings() {
  const {
    defaultDuration,
    linkPrevious,
    defaultTimeStrategy,
    defaultWarnTime,
    defaultDangerTime,
    defaultTimerType,
    defaultEndAction,
    setDefaultDuration,
    setLinkPrevious,
    setTimeStrategy,
    setWarnTime,
    setDangerTime,
    setDefaultTimerType,
    setDefaultEndAction,
  } = useEditorSettings((state) => state);

  const durationInMs = parseUserTime(defaultDuration);
  const warnTimeInMs = parseUserTime(defaultWarnTime);
  const dangerTimeInMs = parseUserTime(defaultDangerTime);

  return (
    <Panel.Section>
      <Panel.Card>
        <Panel.SubHeader>ランダウンのデフォルト</Panel.SubHeader>
        <Panel.Divider />
        <Panel.Section>
          <Panel.Title>新規イベントのデフォルト設定</Panel.Title>
          <Panel.ListGroup>
            <Panel.ListItem>
              <Panel.Field
                title='前のイベントとリンク'
                description='新規イベントの開始時刻を前のイベントの終了時刻にリンクするかどうか'
              />
              <Switch size='large' checked={linkPrevious} onCheckedChange={setLinkPrevious} />
            </Panel.ListItem>
            <Panel.ListItem>
              <Panel.Field
                title='タイマー戦略'
                description='イベントスケジュール再計算時にどの時間を維持するか'
              />
              <Select
                value={defaultTimeStrategy}
                onValueChange={(value: TimeStrategy | null) => {
                  if (value === null) return;
                  setTimeStrategy(value);
                }}
                options={[
                  { value: TimeStrategy.LockDuration, label: '継続時間' },
                  { value: TimeStrategy.LockEnd, label: '終了時刻' },
                ]}
              />
            </Panel.ListItem>
          </Panel.ListGroup>
          <Panel.ListGroup>
            <Panel.ListItem>
              <Panel.Field title='デフォルト継続時間' description='新規イベントのデフォルト継続時間' />
              <TimeInput<'defaultDuration'>
                name='defaultDuration'
                submitHandler={(_field, value) => setDefaultDuration(value)}
                time={durationInMs}
                placeholder={editorSettingsDefaults.duration}
              />
            </Panel.ListItem>
            <Panel.ListItem>
              <Panel.Field title='タイマータイプ' description='新規イベントのデフォルトタイマータイプ' />
              <Select
                value={defaultTimerType}
                onValueChange={(value: TimerType | null) => {
                  if (value === null) return;
                  setDefaultTimerType(value);
                }}
                options={[
                  { value: TimerType.CountDown, label: 'カウントダウン' },
                  { value: TimerType.CountUp, label: 'カウントアップ' },
                  { value: TimerType.Clock, label: '時計' },
                  { value: TimerType.None, label: 'なし' },
                ]}
              />
            </Panel.ListItem>
            <Panel.ListItem>
              <Panel.Field title='終了アクション' description='新規イベントのデフォルト終了アクション' />
              <Select
                value={defaultEndAction}
                onValueChange={(value: EndAction | null) => {
                  if (value === null) return;
                  setDefaultEndAction(value);
                }}
                options={[
                  { value: EndAction.None, label: 'なし' },
                  { value: EndAction.LoadNext, label: '次を読み込む' },
                  { value: EndAction.PlayNext, label: '次を再生' },
                ]}
              />
            </Panel.ListItem>
          </Panel.ListGroup>
          <Panel.ListGroup>
            <Panel.ListItem>
              <Panel.Field title='警告時間' description='イベントの警告時間のデフォルトしきい値' />
              <TimeInput<'warnTime'>
                name='warnTime'
                submitHandler={(_field, value) => setWarnTime(value)}
                time={warnTimeInMs}
                placeholder={editorSettingsDefaults.warnTime}
              />
            </Panel.ListItem>
            <Panel.ListItem>
              <Panel.Field title='危険時間' description='イベントの危険時間のデフォルトしきい値' />
              <TimeInput<'dangerTime'>
                name='dangerTime'
                submitHandler={(_field, value) => setDangerTime(value)}
                time={dangerTimeInMs}
                placeholder={editorSettingsDefaults.dangerTime}
              />
            </Panel.ListItem>
          </Panel.ListGroup>
        </Panel.Section>
      </Panel.Card>
    </Panel.Section>
  );
}
