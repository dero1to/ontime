import { useState } from 'react';
import { IoAdd, IoOpenOutline, IoPencil, IoTrash } from 'react-icons/io5';
import { URLPreset } from 'ontime-types';

import Button from '../../../../common/components/buttons/Button';
import IconButton from '../../../../common/components/buttons/IconButton';
import Info from '../../../../common/components/info/Info';
import ExternalLink from '../../../../common/components/link/external-link/ExternalLink';
import Switch from '../../../../common/components/switch/Switch';
import Tag from '../../../../common/components/tag/Tag';
import useUrlPresets, { useUpdateUrlPreset } from '../../../../common/hooks-query/useUrlPresets';
import { handleLinks } from '../../../../common/utils/linkUtils';
import * as Panel from '../../panel-utils/PanelUtils';

import URLPresetForm from './composite/URLPresetForm';

type FormState = {
  isOpen: boolean;
  preset?: URLPreset;
};

const urlPresetsDocs = 'https://docs.getontime.no/features/url-presets/';

export default function URLPresets() {
  const [formState, setFormState] = useState<FormState>({ isOpen: false, preset: undefined });
  const { data, status } = useUrlPresets();
  const { deletePreset, isMutating } = useUpdateUrlPreset();

  const openNewForm = () => setFormState({ isOpen: true });
  const openEditForm = (preset: URLPreset) => setFormState({ isOpen: true, preset });
  const closeForm = () => setFormState({ isOpen: false, preset: undefined });

  return (
    <Panel.Section>
      <Panel.Card>
        <Panel.SubHeader>
          URLプリセット
          <Button onClick={openNewForm}>
            新規 <IoAdd />
          </Button>
        </Panel.SubHeader>
        <Panel.Divider />
        <Panel.Section>
          <Info>
            URLプリセットはOntimeのURLに対するユーザー定義のエイリアスです。
            <br />
            パラメータを含む完全な設定URLや、特定のビューへのルーティングが可能です。
            <br />
            <br />
            ブラウザからURLをコピーしてフォームに貼り付けるのが最も簡単な方法です。
            <ExternalLink href={urlPresetsDocs}>ドキュメントを見る</ExternalLink>
          </Info>
        </Panel.Section>
        <Panel.Section>
          <Panel.Loader isLoading={status === 'pending'} />
          {formState.isOpen && <URLPresetForm urlPreset={formState.preset} onClose={closeForm} />}
          <Panel.Table>
            <thead>
              <tr>
                <th>有効</th>
                <th>対象ビュー</th>
                <th>エイリアス</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && <Panel.TableEmpty handleClick={openNewForm} />}
              {data.map((preset, index) => {
                return (
                  <tr key={preset.alias}>
                    <td>
                      <Switch defaultChecked={preset.enabled} onCheckedChange={() => {}} />
                    </td>
                    <td>
                      <Tag>{preset.target}</Tag>
                    </td>
                    <td style={{ width: '100%' }}>{preset.alias}</td>
                    <Panel.InlineElements relation='inner' as='td'>
                      <IconButton
                        variant='ghosted-white'
                        onClick={(event) => handleLinks(preset.alias, event)}
                        disabled={isMutating}
                      >
                        <IoOpenOutline />
                      </IconButton>
                      <IconButton
                        onClick={() => openEditForm(preset)}
                        variant='ghosted-white'
                        aria-label='Edit entry'
                        data-testid={`field__edit_${index}`}
                        disabled={isMutating}
                      >
                        <IoPencil />
                      </IconButton>
                      <IconButton
                        onClick={() => deletePreset(preset.alias)}
                        variant='ghosted-destructive'
                        aria-label='Delete entry'
                        data-testid={`field__delete_${index}`}
                        disabled={isMutating}
                      >
                        <IoTrash />
                      </IconButton>
                    </Panel.InlineElements>
                  </tr>
                );
              })}
            </tbody>
          </Panel.Table>
        </Panel.Section>
      </Panel.Card>
    </Panel.Section>
  );
}
