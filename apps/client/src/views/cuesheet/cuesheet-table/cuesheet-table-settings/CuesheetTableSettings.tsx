import { ReactNode } from 'react';
import { IoBookOutline, IoChevronDown, IoOptions } from 'react-icons/io5';
import { Popover } from '@base-ui/react/popover';
import { Toggle } from '@base-ui/react/toggle';
import { ToggleGroup } from '@base-ui/react/toggle-group';
import { Toolbar } from '@base-ui/react/toolbar';
import type { Column } from '@tanstack/react-table';

import Button from '../../../../common/components/buttons/Button';
import Checkbox from '../../../../common/components/checkbox/Checkbox';
import * as Editor from '../../../../common/components/editor-utils/EditorUtils';
import PopoverContents from '../../../../common/components/popover/Popover';
import type { ExtendedEntry } from '../../../../common/utils/rundownMetadata';
import { cx } from '../../../../common/utils/styleUtils';
import { AppMode } from '../../../../ontimeConfig';
import { CuesheetOptions, usePersistedCuesheetOptions } from '../../cuesheet.options';
import { useCuesheetPermissions } from '../../useTablePermissions';

import CuesheetShareModal from './CuesheetShareModal';

import style from './CuesheetTableSettings.module.scss';

interface CuesheetTableSettingsProps {
  columns: Column<ExtendedEntry, unknown>[];
  cuesheetMode: AppMode;
  setCuesheetMode: (mode: AppMode) => void;
  handleResetResizing: () => void;
  handleResetReordering: () => void;
  handleClearToggles: () => void;
}

export interface ViewSettingsProps {
  optionsStore: CuesheetOptions;
}

export interface ColumnSettingsProps {
  columns: Column<ExtendedEntry, unknown>[];
  handleResetResizing: () => void;
  handleResetReordering: () => void;
  handleClearToggles: () => void;
}

export default function CuesheetTableSettings({
  columns,
  cuesheetMode,
  setCuesheetMode,
  handleResetResizing,
  handleResetReordering,
  handleClearToggles,
}: CuesheetTableSettingsProps) {
  const canChangeMode = useCuesheetPermissions((state) => state.canChangeMode);
  const canShare = useCuesheetPermissions((state) => state.canShare);
  const options = usePersistedCuesheetOptions();

  const toggleCuesheetMode = (mode: AppMode[]) => {
    // we need to stop user from deselecting a mode
    const newValue = mode.at(0);
    if (!newValue) return;
    setCuesheetMode(newValue);
  };

  return (
    <Toolbar.Root className={style.tableSettings}>
      <ViewSettings optionsStore={options} />
      <ColumnSettings
        columns={columns}
        handleResetResizing={handleResetResizing}
        handleResetReordering={handleResetReordering}
        handleClearToggles={handleClearToggles}
      />
      {canChangeMode && (
        <ToggleGroup
          value={[cuesheetMode]}
          onValueChange={toggleCuesheetMode}
          className={cx([style.group, style.apart])}
        >
          <Toolbar.Button render={<Toggle />} value={AppMode.Run} className={style.radioButton}>
            実行
          </Toolbar.Button>
          <Toolbar.Button render={<Toggle />} value={AppMode.Edit} className={style.radioButton}>
            編集
          </Toolbar.Button>
        </ToggleGroup>
      )}

      {canShare && (
        <>
          <Editor.Separator orientation='vertical' />
          <CuesheetShareModal />
        </>
      )}
    </Toolbar.Root>
  );
}

export function ViewSettings({ optionsStore }: ViewSettingsProps) {
  const options = optionsStore;

  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Toolbar.Button
            render={
              <Button variant='ghosted-white'>
                <IoOptions /> 設定
                <IoChevronDown />
              </Button>
            }
          />
        }
      />

      <PopoverContents align='start' className={style.inline}>
        <div className={style.column}>
          <Editor.Label className={style.sectionTitle}>要素の表示</Editor.Label>
          <Editor.Label className={style.option}>
            <Checkbox
              defaultChecked={options.hideTableSeconds}
              onCheckedChange={(checked) => options.setOption('hideTableSeconds', checked)}
            />
            テーブルの秒を非表示
          </Editor.Label>
          <Editor.Label className={style.option}>
            <Checkbox
              defaultChecked={options.hideIndexColumn}
              onCheckedChange={(checked) => options.setOption('hideIndexColumn', checked)}
            />
            インデックス列を非表示
          </Editor.Label>
        </div>

        <div className={style.column}>
          <Editor.Label className={style.sectionTitle}>テーブルの動作</Editor.Label>
          <Editor.Label className={style.option}>
            <Checkbox
              defaultChecked={options.showDelayedTimes}
              onCheckedChange={(checked) => options.setOption('showDelayedTimes', checked)}
            />
            遅延時刻を表示
          </Editor.Label>
          <Editor.Label className={style.option}>
            <Checkbox
              defaultChecked={options.hideDelays}
              onCheckedChange={(checked) => options.setOption('hideDelays', checked)}
            />
            遅延エントリを非表示
          </Editor.Label>
        </div>
      </PopoverContents>
    </Popover.Root>
  );
}

export function ColumnSettings({
  columns,
  handleResetResizing,
  handleResetReordering,
  handleClearToggles,
}: ColumnSettingsProps) {
  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <Toolbar.Button
            render={
              <Button variant='ghosted-white'>
                <IoBookOutline /> 列
                <IoChevronDown />
              </Button>
            }
          />
        }
      />
      <PopoverContents align='start' className={style.inline}>
        <div className={style.column}>
          <Editor.Label className={style.sectionTitle}>列の表示</Editor.Label>
          {columns.map((column) => {
            const columnHeader = column.columnDef.header;
            const visible = column.getIsVisible();
            return (
              <Editor.Label key={`${column.id}-${visible}`} className={style.option}>
                <Checkbox defaultChecked={visible} onCheckedChange={column.toggleVisibility} />
                {columnHeader as ReactNode}
              </Editor.Label>
            );
          })}
        </div>
        <div className={style.column}>
          <Editor.Label className={style.sectionTitle}>リセットオプション</Editor.Label>
          <Button size='small' fluid onClick={handleClearToggles}>
            すべて表示
          </Button>
          <Button size='small' fluid onClick={handleResetResizing}>
            サイズ変更をリセット
          </Button>
          <Button size='small' fluid onClick={handleResetReordering}>
            並び替えをリセット
          </Button>
        </div>
      </PopoverContents>
    </Popover.Root>
  );
}
