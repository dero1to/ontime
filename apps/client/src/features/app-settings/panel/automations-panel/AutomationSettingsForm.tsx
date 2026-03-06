import { useForm } from 'react-hook-form';

import { editAutomationSettings } from '../../../../common/api/automation';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Info from '../../../../common/components/info/Info';
import Input from '../../../../common/components/input/input/Input';
import ExternalLink from '../../../../common/components/link/external-link/ExternalLink';
import Switch from '../../../../common/components/switch/Switch';
import { preventEscape } from '../../../../common/utils/keyEvent';
import { isOnlyNumbers } from '../../../../common/utils/regex';
import { isOntimeCloud } from '../../../../externals';
import * as Panel from '../../panel-utils/PanelUtils';

const oscApiDocsUrl = 'https://docs.getontime.no/api/protocols/osc/';

interface AutomationSettingsProps {
  enabledAutomations: boolean;
  enabledOscIn: boolean;
  oscPortIn: number;
}

export default function AutomationSettingsForm({
  enabledAutomations,
  enabledOscIn,
  oscPortIn,
}: AutomationSettingsProps) {
  const {
    handleSubmit,
    reset,
    register,
    setError,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<AutomationSettingsProps>({
    mode: 'onChange',
    defaultValues: { enabledAutomations, enabledOscIn, oscPortIn },
    resetOptions: {
      keepDirtyValues: false,
    },
  });

  const onSubmit = async (formData: AutomationSettingsProps) => {
    try {
      await editAutomationSettings(formData);
      reset(formData);
    } catch (error) {
      const message = maybeAxiosError(error);
      setError('root', { message });
    }
  };

  const onReset = () => {
    reset({ enabledAutomations, enabledOscIn, oscPortIn });
  };

  const canSubmit = !isSubmitting && isDirty && isValid;

  return (
    <Panel.Card>
      <Panel.SubHeader>
        オートメーション設定
        <Panel.InlineElements>
          <Button variant='ghosted' onClick={onReset} disabled={!canSubmit}>
            元に戻す
          </Button>
          <Button
            variant='primary'
            type='submit'
            form='automation-settings-form'
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            保存
          </Button>
        </Panel.InlineElements>
      </Panel.SubHeader>
      {errors?.root && <Panel.Error>{errors.root.message}</Panel.Error>}

      <Panel.Divider />

      <Panel.Section>
        <Info>
          <p>Ontimeを制御し、ワークフロー内の外部システムとデータを共有します。</p>
          <p>- オートメーションはライフサイクルトリガーでOntimeのデータを送信できます。</p>
          <p>- OSC入力はOntimeに指定ポートでメッセージを受信させます。</p>
          <br />
          <ExternalLink href={oscApiDocsUrl}>ドキュメントを見る</ExternalLink>
        </Info>
      </Panel.Section>

      <Panel.Section
        as='form'
        id='automation-settings-form'
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(event) => preventEscape(event, onReset)}
      >
        <Panel.Loader isLoading={false} />

        <Panel.Title>オートメーション</Panel.Title>
        <Panel.ListGroup>
          <Panel.ListItem>
            <Panel.Field
              title='オートメーションを有効化'
              description='ライフサイクルトリガーでOntimeがメッセージを送信することを許可'
              error={errors.enabledAutomations?.message}
            />
            <Switch
              size='large'
              checked={watch('enabledAutomations')}
              onCheckedChange={(value: boolean) =>
                setValue('enabledAutomations', value, { shouldDirty: true, shouldValidate: true })
              }
            />
          </Panel.ListItem>
        </Panel.ListGroup>

        <Panel.Title>OSC入力</Panel.Title>

        <Panel.ListGroup>
          {isOntimeCloud && <Info>セキュリティ上の理由により、OSC連携はクラウドサービスでは利用できません。</Info>}
          <Panel.ListItem>
            <Panel.Field
              title='OSC入力'
              description='OSCを通じたOntimeの制御を許可'
              error={errors.enabledOscIn?.message}
            />
            <Switch
              size='large'
              checked={watch('enabledOscIn')}
              onCheckedChange={(value: boolean) =>
                setValue('enabledOscIn', value, { shouldDirty: true, shouldValidate: true })
              }
            />
          </Panel.ListItem>
          <Panel.ListItem>
            <Panel.Field
              title='受信ポート'
              description='OSC受信用ポート。デフォルト: 8888'
              error={errors.oscPortIn?.message}
            />
            <Input
              id='oscPortIn'
              placeholder='8888'
              maxLength={5}
              style={{ textAlign: 'right', width: '5rem' }}
              type='number'
              fluid
              {...register('oscPortIn', {
                required: { value: true, message: '必須フィールドです' },
                max: { value: 65535, message: 'ポートは1024～65535の範囲で指定してください' },
                min: { value: 1024, message: 'ポートは1024～65535の範囲で指定してください' },
                pattern: {
                  value: isOnlyNumbers,
                  message: '数値を入力してください',
                },
              })}
            />
          </Panel.ListItem>
        </Panel.ListGroup>
      </Panel.Section>
    </Panel.Card>
  );
}
