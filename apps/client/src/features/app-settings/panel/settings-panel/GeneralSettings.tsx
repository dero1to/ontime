import { lazy, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDisclosure } from '@mantine/hooks';
import { Settings } from 'ontime-types';

import { postSettings } from '../../../../common/api/settings';
import { maybeAxiosError } from '../../../../common/api/utils';
import Button from '../../../../common/components/buttons/Button';
import Info from '../../../../common/components/info/Info';
import Select from '../../../../common/components/select/Select';
import useSettings from '../../../../common/hooks-query/useSettings';
import { preventEscape } from '../../../../common/utils/keyEvent';
import * as Panel from '../../panel-utils/PanelUtils';

import GeneralPinInput from './composite/GeneralPinInput';

const TranslationModal = lazy(() => import('./composite/CustomTranslationModal'));

export default function GeneralSettings() {
  const { data, status, refetch } = useSettings();
  const {
    handleSubmit,
    register,
    reset,
    setError,
    watch,
    setValue,
    formState: { isSubmitting, isDirty, isValid, errors },
  } = useForm<Settings>({
    mode: 'onChange',
    defaultValues: data,
    resetOptions: {
      keepDirtyValues: true,
    },
  });

  const [isOpen, handler] = useDisclosure();

  // update form if we get new data from server
  useEffect(() => {
    if (data) {
      reset(data);
    }
  }, [data, reset]);

  const onSubmit = async (formData: Settings) => {
    try {
      await postSettings(formData);
    } catch (error) {
      const message = maybeAxiosError(error);
      setError('root', { message });
    } finally {
      await refetch();
    }
  };

  const disableInputs = status === 'pending';
  const disableSubmit = isSubmitting || !isDirty || !isValid;
  const submitError = '';

  const onReset = () => {
    reset(data);
  };

  const isLoading = status === 'pending';

  return (
    <>
      <TranslationModal isOpen={isOpen} onClose={handler.close} />
      <Panel.Section
        as='form'
        onSubmit={handleSubmit(onSubmit)}
        onKeyDown={(event) => preventEscape(event, onReset)}
        id='app-settings'
      >
        <Panel.Card>
          <Panel.SubHeader>
            一般設定
            <Panel.InlineElements>
              <Button disabled={!isDirty || isSubmitting} variant='ghosted' onClick={onReset}>
                元に戻す
              </Button>
              <Button
                type='submit'
                form='app-settings'
                name='general-settings-submit'
                loading={isSubmitting}
                disabled={disableSubmit}
                variant='primary'
              >
                保存
              </Button>
            </Panel.InlineElements>
          </Panel.SubHeader>
          {submitError && <Panel.Error>{submitError}</Panel.Error>}
          <Panel.Divider />
          <Panel.Section>
            <Info>時刻形式とビュー言語の変更はエディタービューには影響しません</Info>
            <Panel.Loader isLoading={isLoading} />
            <Panel.ListGroup>
              <Panel.ListItem>
                <Panel.Field
                  title='エディター暗証番号'
                  description='エディタービューを暗証番号で保護します'
                  error={errors.editorKey?.message}
                />
                <GeneralPinInput register={register} formName='editorKey' disabled={disableInputs} />
              </Panel.ListItem>
              <Panel.ListItem>
                <Panel.Field
                  title='オペレーター暗証番号'
                  description='オペレーターとキューシートビューを暗証番号で保護します'
                  error={errors.operatorKey?.message}
                />
                <GeneralPinInput register={register} formName='operatorKey' disabled={disableInputs} />
              </Panel.ListItem>
              <Panel.ListItem>
                <Panel.Field
                  title='時刻形式'
                  description='ビューに表示するデフォルトの時刻形式（12時間 / 24時間）'
                  error={errors.timeFormat?.message}
                />
                <Select
                  value={watch('timeFormat')}
                  onValueChange={(value: '12' | '24' | null) => {
                    if (value === null) return;
                    setValue('timeFormat', value, { shouldDirty: true });
                  }}
                  defaultValue='24'
                  options={[
                    { value: '12', label: '12時間制 11:00:10 PM' },
                    { value: '24', label: '24時間制 23:00:10' },
                  ]}
                />
              </Panel.ListItem>
              <Panel.ListItem>
                <Panel.Field
                  title='ビュー言語'
                  description='ビューに表示する言語'
                  error={errors.language?.message}
                />
                <Select
                  value={watch('language')}
                  onValueChange={(value: string | null) => {
                    if (value === null) return;
                    setValue('language', value, { shouldDirty: true });
                  }}
                  disabled={disableInputs}
                  defaultValue='en'
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'fr', label: 'French' },
                    { value: 'de', label: 'German' },
                    { value: 'it', label: 'Italian' },
                    { value: 'ja', label: 'Japanese' },
                    { value: 'pt', label: 'Portuguese' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'custom', label: 'Custom' },
                  ]}
                />
                <Button onClick={handler.open}>カスタム翻訳を編集</Button>
              </Panel.ListItem>
            </Panel.ListGroup>
          </Panel.Section>
        </Panel.Card>
      </Panel.Section>
    </>
  );
}
