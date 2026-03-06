import { IoAdd } from 'react-icons/io5';
import { SupportedEntry } from 'ontime-types';

import Button from '../../common/components/buttons/Button';
import * as Editor from '../../common/components/editor-utils/EditorUtils';
import Empty from '../../common/components/state/Empty';

import style from './Empty.module.scss';

interface RundownEmptyProps {
  handleAddNew: (type: SupportedEntry) => void;
}

export default function RundownEmpty(props: RundownEmptyProps) {
  const { handleAddNew } = props;

  return (
    <div className={style.empty}>
      <Empty injectedStyles={{ marginTop: '5vh', marginBottom: '3rem' }} />
      <div className={style.inline}>
        <Button onClick={() => handleAddNew(SupportedEntry.Event)} variant='primary' size='large'>
          <IoAdd />
          イベントを作成
        </Button>

        <Editor.Separator />

        <Button onClick={() => handleAddNew(SupportedEntry.Group)} variant='primary' size='large'>
          <IoAdd /> グループを作成
        </Button>
      </div>
    </div>
  );
}
