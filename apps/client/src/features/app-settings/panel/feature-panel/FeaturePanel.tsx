import useScrollIntoView from '../../../../common/hooks/useScrollIntoView';
import { isOntimeCloud } from '../../../../externals';
import GenerateLinkFormExport from '../../../sharing/GenerateLinkFormExport';
import type { PanelBaseProps } from '../../panel-list/PanelList';
import * as Panel from '../../panel-utils/PanelUtils';
import InfoNif from '../network-panel/NetworkInterfaces';

import ReportSettings from './ReportSettings';
import URLPresets from './URLPresets';

export default function FeaturePanel({ location }: PanelBaseProps) {
  const presetsRef = useScrollIntoView<HTMLDivElement>('presets', location);
  const linkRef = useScrollIntoView<HTMLDivElement>('link', location);
  const reportRef = useScrollIntoView<HTMLDivElement>('report', location);

  return (
    <>
      <Panel.Header>共有とレポート</Panel.Header>
      <div ref={presetsRef}>
        <URLPresets />
      </div>
      <div ref={linkRef}>
        <Panel.Section>
          <Panel.Card>
            <Panel.SubHeader>Ontimeリンクを共有</Panel.SubHeader>
            {!isOntimeCloud && (
              <>
                <Panel.Paragraph>Ontimeは以下のネットワークインターフェースで配信中です</Panel.Paragraph>
                <InfoNif />
              </>
            )}
            <Panel.Divider />
            <GenerateLinkFormExport />
          </Panel.Card>
        </Panel.Section>
      </div>
      <div ref={reportRef}>
        <ReportSettings />
      </div>
    </>
  );
}
