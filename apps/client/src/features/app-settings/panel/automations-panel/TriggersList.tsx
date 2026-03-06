import { Fragment, useMemo, useState } from 'react';
import { IoAdd } from 'react-icons/io5';
import { NormalisedAutomation, Trigger } from 'ontime-types';

import { deleteTrigger } from '../../../../common/api/automation';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import useAutomationSettings from '../../../../common/hooks-query/useAutomationSettings';
import * as Panel from '../../panel-utils/PanelUtils';

import { checkDuplicates } from './automationUtils';
import AutomationForm from './TriggerForm';
import TriggersListItem from './TriggersListItem';

interface TriggersListProps {
  triggers: Trigger[];
  automations: NormalisedAutomation;
}

export default function TriggersList(props: TriggersListProps) {
  const { triggers, automations } = props;
  const [showForm, setShowForm] = useState(false);
  const { refetch } = useAutomationSettings();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    try {
      await deleteTrigger(id);
    } catch (error) {
      setDeleteError(maybeAxiosError(error));
    } finally {
      refetch();
    }
  };

  const postSubmit = () => {
    setShowForm(false);
    refetch();
  };

  const duplicates = useMemo(() => checkDuplicates(triggers), [triggers]);

  // there is no point letting user creating a trigger if there are no automations
  const canAdd = Object.keys(automations).length > 0;

  return (
    <Panel.Card>
      <Panel.SubHeader>
        トリガー管理
        <Button type='submit' form='trigger-form' disabled={!canAdd} loading={false} onClick={() => setShowForm(true)}>
          新規 <IoAdd />
        </Button>
      </Panel.SubHeader>
      <Panel.Divider />
      <Panel.Section>
        {duplicates && (
          <Panel.Error>
            同じトリガーとオートメーション間に複数のリンクが作成されています。パフォーマンスの問題が発生する可能性があります。
          </Panel.Error>
        )}
        {showForm && (
          <AutomationForm automations={automations} onCancel={() => setShowForm(false)} postSubmit={postSubmit} />
        )}
        <Panel.Table>
          <thead>
            <tr>
              <th style={{ width: '35%' }}>タイトル</th>
              <th style={{ width: '25%' }}>ライフサイクルトリガー</th>
              <th style={{ width: '25%' }}>オートメーション</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {!showForm && triggers.length === 0 && (
              <Panel.TableEmpty
                label='トリガーを紐付けるオートメーションを作成してください'
                handleClick={canAdd ? () => setShowForm(true) : undefined}
              />
            )}
            {triggers.map((trigger, index) => {
              return (
                <Fragment key={trigger.id}>
                  <TriggersListItem
                    automations={automations}
                    id={trigger.id}
                    title={trigger.title}
                    trigger={trigger.trigger}
                    automationId={trigger.automationId}
                    duplicate={duplicates?.includes(index)}
                    handleDelete={() => handleDelete(trigger.id)}
                    postSubmit={postSubmit}
                  />
                  {deleteError && (
                    <tr>
                      <td colSpan={5}>
                        <Panel.Error>{deleteError}</Panel.Error>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </Panel.Table>
      </Panel.Section>
    </Panel.Card>
  );
}
