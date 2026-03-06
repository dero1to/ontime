import { useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import { CustomField, CustomFieldKey } from 'ontime-types';

import { deleteCustomField, editCustomField, postCustomField } from '../../../../common/api/customFields';
import Button from '../../../../common/components/buttons/Button';
import Info from '../../../../common/components/info/Info';
import AppLink from '../../../../common/components/link/app-link/AppLink';
import ExternalLink from '../../../../common/components/link/external-link/ExternalLink';
import useCustomFields from '../../../../common/hooks-query/useCustomFields';
import { customFieldsDocsUrl } from '../../../../externals';
import * as Panel from '../../panel-utils/PanelUtils';

import CustomFieldEntry from './composite/CustomFieldEntry';
import CustomFieldForm from './composite/CustomFieldForm';

export default function CustomFieldSettings() {
  const { data, refetch } = useCustomFields();
  const [isAdding, setIsAdding] = useState(false);

  const handleInitiateCreate = () => {
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
  };

  const handleCreate = async (customField: CustomField) => {
    await postCustomField(customField);
    refetch();
    setIsAdding(false);
  };

  const handleEditField = async (key: CustomFieldKey, customField: CustomField) => {
    await editCustomField(key, customField);
    refetch();
  };

  const handleDelete = async (key: CustomFieldKey) => {
    try {
      await deleteCustomField(key);
      refetch();
    } catch (_error) {
      /** we do not handle errors here */
    }
  };

  return (
    <Panel.Section>
      <Panel.Card>
        <Panel.SubHeader>
          カスタムフィールド
          <Button onClick={handleInitiateCreate}>
            新規 <IoAdd />
          </Button>
        </Panel.SubHeader>
        <Panel.Divider />
        <Panel.Section>
          <Info>
            カスタムフィールドを使用してイベントに追加情報を付与できます。
            <br />
            <br />
            カスタムフィールドを
            <AppLink search='settings=automation__automations'>オートメーション</AppLink>のデータソースとして使用するには、生成されたキーを確認してください。
            <ExternalLink href={customFieldsDocsUrl}>ドキュメントを見る</ExternalLink>
          </Info>
        </Panel.Section>
        <Panel.Section>
          {isAdding && <CustomFieldForm onSubmit={handleCreate} onCancel={handleCancel} />}
          <Panel.Table>
            <thead>
              <tr>
                <th>色</th>
                <th>タイプ</th>
                <th>名前</th>
                <th>キー（オートメーションで使用）</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {Object.entries(data).map(([key, { colour, label, type }]) => {
                return (
                  <CustomFieldEntry
                    key={key}
                    fieldKey={key}
                    colour={colour}
                    label={label}
                    type={type}
                    onEdit={handleEditField}
                    onDelete={handleDelete}
                  />
                );
              })}
            </tbody>
          </Panel.Table>
        </Panel.Section>
      </Panel.Card>
    </Panel.Section>
  );
}
