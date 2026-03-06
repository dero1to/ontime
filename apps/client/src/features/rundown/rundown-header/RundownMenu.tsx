import { memo, useCallback } from 'react';
import { IoEllipsisHorizontal, IoList, IoTrash } from 'react-icons/io5';
import { Toolbar } from '@base-ui/react/toolbar';
import { useDisclosure } from '@mantine/hooks';

import Button from '../../../common/components/buttons/Button';
import IconButton from '../../../common/components/buttons/IconButton';
import Dialog from '../../../common/components/dialog/Dialog';
import { DropdownMenu } from '../../../common/components/dropdown-menu/DropdownMenu';
import { useEntryActionsContext } from '../../../common/context/EntryActionsContext';
import useAppSettingsNavigation from '../../app-settings/useAppSettingsNavigation';
import { useEventSelection } from '../useEventSelection';

import style from './RundownHeader.module.scss';

interface RundownMenuProps {
  allowNavigation?: boolean;
}

export default memo(RundownMenu);
function RundownMenu({ allowNavigation }: RundownMenuProps) {
  const [isOpen, handlers] = useDisclosure();

  const clearSelectedEvents = useEventSelection((state) => state.clearSelectedEvents);
  const { deleteAllEntries } = useEntryActionsContext();
  const { setLocation } = useAppSettingsNavigation();

  const deleteAll = useCallback(() => {
    deleteAllEntries();
    clearSelectedEvents();
    handlers.close();
  }, [clearSelectedEvents, deleteAllEntries, handlers]);

  return (
    <>
      <div className={style.apart}>
        <DropdownMenu
          render={<Toolbar.Button render={<IconButton variant='subtle-white' aria-label='Rundown menu' />} />}
          items={[
            {
              type: 'item',
              label: 'ランダウン管理...',
              icon: IoList,
              onClick: () => setLocation('manage__rundowns'),
              disabled: !allowNavigation,
            },
            { type: 'divider' },
            {
              type: 'destructive',
              label: 'すべてクリア',
              icon: IoTrash,
              onClick: handlers.open,
            },
          ]}
        >
          <IoEllipsisHorizontal />
        </DropdownMenu>
      </div>

      <Dialog
        isOpen={isOpen}
        onClose={handlers.close}
        title='ランダウンをクリア'
        showBackdrop
        showCloseButton
        bodyElements={
          <>
            ランダウンのすべてのデータが失われます。<br />よろしいですか？
          </>
        }
        footerElements={
          <>
            <Button variant='ghosted-white' size='large' onClick={handlers.close}>
              キャンセル
            </Button>
            <Button variant='destructive' size='large' onClick={deleteAll}>
              すべて削除
            </Button>
          </>
        }
      />
    </>
  );
}
