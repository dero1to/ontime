import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDisclosure } from '@mantine/hooks';
import { ViewSettings as ViewSettingsType } from 'ontime-types';

import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Info from '../../../../common/components/info/Info';
import { SwatchPickerRHF } from '../../../../common/components/input/colour-input/SwatchPicker';
import ExternalLink from '../../../../common/components/link/external-link/ExternalLink';
import Switch from '../../../../common/components/switch/Switch';
import useViewSettings from '../../../../common/hooks-query/useViewSettings';
import { preventEscape } from '../../../../common/utils/keyEvent';
import * as Panel from '../../panel-utils/PanelUtils';

import CodeEditorModal from './composite/StyleEditorModal';

const cssOverrideDocsUrl = 'https://docs.getontime.no/features/custom-styling/';

export default function ViewSettings() {
  const { data, status, mutateAsync } = useViewSettings();
  const [isCodeEditorOpen, codeEditorHandler] = useDisclosure();

  const {
    control,
    handleSubmit,
    setError,
    reset,
    setValue,
    watch,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<ViewSettingsType>({
    defaultValues: data,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  // update form if we get new data from server
  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = async (formData: ViewSettingsType) => {
    try {
      mutateAsync(formData);
    } catch (error) {
      const message = maybeAxiosError(error);
      setError('root', { message });
    }
  };

  const onReset = () => {
    reset(data);
  };

  if (!control) {
    return null;
  }

  return (
    <Panel.Section
      as='form'
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={(event) => preventEscape(event, onReset)}
      id='view-settings'
    >
      <Panel.Card>
        <Panel.SubHeader>
          ビュー設定
          <Panel.InlineElements>
            <Button disabled={!isDirty} variant='ghosted' onClick={onReset}>
              元に戻す
            </Button>
            <Button type='submit' loading={isSubmitting} disabled={!isDirty} variant='primary'>
              保存
            </Button>
          </Panel.InlineElements>
        </Panel.SubHeader>
        <Panel.Divider />
        <Info>
          OntimeビューにカスタムCSSルールを適用してスタイルを上書きできます。
          <br />
          <ExternalLink href={cssOverrideDocsUrl}>ドキュメントを見る</ExternalLink>
        </Info>
        <Panel.Section>
          <Panel.Loader isLoading={status === 'pending'} />
          <Panel.Error>{errors.root?.message}</Panel.Error>
          <Panel.ListGroup>
            <CodeEditorModal isOpen={isCodeEditorOpen} onClose={codeEditorHandler.close} />
            <Panel.ListItem>
              <Panel.Field
                title='CSSスタイルの上書き'
                description='カスタムスタイルシートでビューのスタイルを上書きします'
              />
              <Switch
                size='large'
                checked={watch('overrideStyles')}
                onCheckedChange={(value: boolean) => setValue('overrideStyles', value, { shouldDirty: true })}
              />
              <Button onClick={codeEditorHandler.open} disabled={isSubmitting}>
                CSS上書きを編集
              </Button>
            </Panel.ListItem>
          </Panel.ListGroup>
          <Panel.ListGroup>
            <Panel.ListItem>
              <Panel.Field title='タイマーの色' description='実行中タイマーのデフォルト色' />
              <SwatchPickerRHF name='normalColor' control={control} />
            </Panel.ListItem>
            <Panel.ListItem>
              <Panel.Field title='警告の色' description='警告モード時のタイマーの色' />
              <SwatchPickerRHF name='warningColor' control={control} />
            </Panel.ListItem>
            <Panel.ListItem>
              <Panel.Field title='危険の色' description='危険モード時のタイマーの色' />
              <SwatchPickerRHF name='dangerColor' control={control} />
            </Panel.ListItem>
          </Panel.ListGroup>
        </Panel.Section>
      </Panel.Card>
    </Panel.Section>
  );
}
