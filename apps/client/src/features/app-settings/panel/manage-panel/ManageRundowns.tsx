import { useState } from 'react';
import {
  IoAdd,
  IoDocumentOutline,
  IoDownloadOutline,
  IoDuplicateOutline,
  IoEllipsisHorizontal,
  IoPencilOutline,
  IoTrash,
} from 'react-icons/io5';
import { useDisclosure } from '@mantine/hooks';

import { downloadAsExcel } from '../../../../common/api/excel';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import IconButton from '../../../../common/components/buttons/IconButton';
import Dialog from '../../../../common/components/dialog/Dialog';
import { DropdownMenu } from '../../../../common/components/dropdown-menu/DropdownMenu';
import Tag from '../../../../common/components/tag/Tag';
import { useMutateProjectRundowns, useProjectRundowns } from '../../../../common/hooks-query/useProjectRundowns';
import { cx } from '../../../../common/utils/styleUtils';
import * as Panel from '../../panel-utils/PanelUtils';

import RundownRenameForm from './composite/RundownRenameForm';
import { ManageRundownForm } from './ManageRundownForm';

import style from './ManagePanel.module.scss';

export default function ManageRundowns() {
  const { data } = useProjectRundowns();
  const { duplicate, remove, load, rename } = useMutateProjectRundowns();
  const [isOpenDelete, deleteHandlers] = useDisclosure();
  const [isOpenLoad, loadHandlers] = useDisclosure();
  const [isNewLoad, newHandlers] = useDisclosure();
  const [targetRundown, setTargetRundown] = useState('');
  const [renamingRundown, setRenamingRundown] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const openLoad = (id: string) => {
    setActionError(null);
    setTargetRundown(id);
    loadHandlers.open();
  };

  const openDelete = (id: string) => {
    setActionError(null);
    setTargetRundown(id);
    deleteHandlers.open();
  };

  const openRename = (id: string) => {
    setActionError(null);
    setRenamingRundown(id);
  };

  const submitRundownLoad = async () => {
    try {
      await load(targetRundown);
    } catch (error) {
      setActionError(`ランダウンの読み込みに失敗しました。${maybeAxiosError(error)}`);
    } finally {
      loadHandlers.close();
    }
  };

  const submitRundownDuplicate = async (id: string) => {
    setActionError(null);
    setRenamingRundown(null);
    setTargetRundown('');

    try {
      await duplicate(id);
    } catch (error) {
      setActionError(`ランダウンの複製に失敗しました。${maybeAxiosError(error)}`);
    }
  };

  const submitRundownRename = async (id: string, newTitle: string) => {
    try {
      await rename([id, newTitle]);
      setRenamingRundown(null);
    } catch (error) {
      setActionError(`ランダウンの名前変更に失敗しました。${maybeAxiosError(error)}`);
    }
  };

  const submitRundownDelete = async () => {
    try {
      await remove(targetRundown);
    } catch (error) {
      setActionError(`ランダウンの削除に失敗しました。${maybeAxiosError(error)}`);
    } finally {
      deleteHandlers.close();
    }
  };

  const handleDownloadXlsx = async (rundownId: string, title: string) => {
    await downloadAsExcel(rundownId, title);
  };

  return (
    <>
      <Panel.Section>
        <Panel.Card>
          <Panel.SubHeader>
            プロジェクトランダウン管理
            <Panel.InlineElements>
              <Button
                onClick={() => {
                  setActionError(null);
                  newHandlers.open();
                }}
              >
                新規 <IoAdd />
              </Button>
            </Panel.InlineElements>
          </Panel.SubHeader>
          <Panel.Divider />
          <Panel.Section>
            {isNewLoad && <ManageRundownForm onClose={newHandlers.close} />}
            {actionError && <Panel.Error>{actionError}</Panel.Error>}
            <Panel.Table>
              <thead>
                <tr>
                  <th># エントリ</th>
                  <th style={{ width: '100%' }}>タイトル</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.rundowns?.map(({ id, numEntries, title }) => {
                  const isLoaded = data.loaded === id;
                  const isRenaming = renamingRundown === id;

                  if (isRenaming) {
                    return (
                      <tr key={id}>
                        <td colSpan={3}>
                          <RundownRenameForm
                            onCancel={() => setRenamingRundown(null)}
                            onSubmit={(newTitle: string) => submitRundownRename(id, newTitle)}
                            initialTitle={title}
                          />
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={id} className={cx([isLoaded && style.current])}>
                      <td>{numEntries}</td>
                      <td>
                        {title} {isLoaded && <Tag>読み込み済み</Tag>}
                      </td>
                      <td>
                        <DropdownMenu
                          render={<IconButton variant='ghosted-white' />}
                          items={[
                            {
                              type: 'item',
                              icon: IoPencilOutline,
                              label: '名前変更',
                              onClick: () => openRename(id),
                            },
                            {
                              type: 'item',
                              icon: IoDownloadOutline,
                              label: '読み込む',
                              onClick: () => openLoad(id),
                              disabled: isLoaded,
                            },
                            {
                              type: 'item',
                              icon: IoDocumentOutline,
                              label: '.xlsxをダウンロード',
                              onClick: () => handleDownloadXlsx(id, title),
                            },
                            {
                              type: 'item',
                              icon: IoDuplicateOutline,
                              label: '複製',
                              onClick: () => submitRundownDuplicate(id),
                            },
                            { type: 'divider' },
                            {
                              type: 'destructive',
                              icon: IoTrash,
                              label: '削除',
                              onClick: () => openDelete(id),
                              disabled: isLoaded,
                            },
                          ]}
                        >
                          <IoEllipsisHorizontal />
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Panel.Table>
          </Panel.Section>
        </Panel.Card>
      </Panel.Section>
      <Dialog
        isOpen={isOpenDelete}
        onClose={deleteHandlers.close}
        title='ランダウンを削除'
        showBackdrop
        showCloseButton
        bodyElements={
          <>
            ランダウンのすべてのデータが失われます。<br />よろしいですか？
          </>
        }
        footerElements={
          <>
            <Button size='large' onClick={deleteHandlers.close}>
              キャンセル
            </Button>
            <Button variant='destructive' size='large' onClick={submitRundownDelete}>
              ランダウンを削除
            </Button>
          </>
        }
      />
      <Dialog
        isOpen={isOpenLoad}
        onClose={loadHandlers.close}
        title='ランダウンを読み込む'
        showBackdrop
        showCloseButton
        bodyElements={
          <>
            現在の再生が停止されます。<br />よろしいですか？
          </>
        }
        footerElements={
          <>
            <Button size='large' onClick={loadHandlers.close}>
              キャンセル
            </Button>
            <Button variant='primary' size='large' onClick={submitRundownLoad}>
              ランダウンを読み込む
            </Button>
          </>
        }
      />
    </>
  );
}
