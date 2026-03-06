import { memo } from 'react';
import { IoClose, IoContract, IoExpand, IoLockClosedOutline, IoSwapVertical } from 'react-icons/io5';
import { LuCoffee } from 'react-icons/lu';
import { useLocation } from 'react-router';
import { Dialog } from '@base-ui/react/dialog';
import { useDisclosure, useFullscreen } from '@mantine/hooks';

import { isLocalhost, supportsFullscreen } from '../../../externals';
import { canUseWakeLock, useKeepAwakeOptions } from '../../../features/keep-awake/useWakeLock';
import { navigatorConstants } from '../../../viewerConfig';
import { useIsSmallScreen } from '../../hooks/useIsSmallScreen';
import { useClientStore } from '../../stores/clientStore';
import { useViewOptionsStore } from '../../stores/viewOptions';
import IconButton from '../buttons/IconButton';
import { RenameClientModal } from '../client-modal/RenameClientModal';

import ClientLink from './client-link/ClientLink';
import EditorNavigation from './editor-navigation/EditorNavigation';
import NavigationMenuItem from './navigation-menu-item/NavigationMenuItem';
import OtherAddresses from './other-addresses/OtherAddresses';

import style from './NavigationMenu.module.scss';

interface NavigationMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default memo(NavigationMenu);
function NavigationMenu({ isOpen, onClose }: NavigationMenuProps) {
  const id = useClientStore((store) => store.id);
  const name = useClientStore((store) => store.name);
  const isSmallScreen = useIsSmallScreen();

  const [isRenameOpen, handlers] = useDisclosure(false);
  const { fullscreen, toggle } = useFullscreen();
  const { mirror, toggleMirror } = useViewOptionsStore();
  const { keepAwake, toggleKeepAwake } = useKeepAwakeOptions();
  const location = useLocation();

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={style.backdrop} />
        <RenameClientModal id={id} name={name} isOpen={isRenameOpen} onClose={handlers.close} />
        <Dialog.Popup className={style.drawer}>
          <div className={style.header}>
            <Dialog.Title>Ontime</Dialog.Title>
            <IconButton variant='subtle-white' size='large' onClick={onClose}>
              <IoClose />
            </IconButton>
          </div>
          <div className={style.body}>
            {supportsFullscreen && (
              <NavigationMenuItem active={fullscreen} onClick={toggle}>
                フルスクリーン切り替え
                {fullscreen ? <IoContract /> : <IoExpand />}
              </NavigationMenuItem>
            )}
            <NavigationMenuItem active={mirror} onClick={() => toggleMirror()}>
              画面反転
              <IoSwapVertical />
              {mirror && <span className={style.note}>有効</span>}
            </NavigationMenuItem>
            {canUseWakeLock && (
              <NavigationMenuItem active={keepAwake} onClick={toggleKeepAwake}>
                スリープ防止
                <LuCoffee />
                {keepAwake && <span className={style.note}>有効</span>}
              </NavigationMenuItem>
            )}
            <NavigationMenuItem onClick={handlers.open}>クライアント名変更</NavigationMenuItem>

            <hr className={style.separator} />

            <EditorNavigation />
            <ClientLink
              to='cuesheet'
              current={location.pathname === '/cuesheet'}
              postAction={isSmallScreen ? onClose : undefined}
            >
              <IoLockClosedOutline />
              キューシート
            </ClientLink>
            <ClientLink to='op' current={location.pathname === '/op'} postAction={isSmallScreen ? onClose : undefined}>
              <IoLockClosedOutline />
              オペレーター
            </ClientLink>

            <hr className={style.separator} />

            {navigatorConstants.map((route) => (
              <ClientLink
                key={route.url}
                to={route.url}
                current={location.pathname === `/${route.url}`}
                postAction={isSmallScreen ? onClose : undefined}
              >
                {route.label}
              </ClientLink>
            ))}
          </div>

          {isLocalhost && (
            <div>
              <OtherAddresses currentLocation={location.pathname} />
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
