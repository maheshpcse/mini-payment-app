import { Camera, ImageUp, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { errorMessage } from '../../shared/lib/form-errors';
import { AVATAR_ACCEPT, ImageProcessingError, prepareAvatar } from '../../shared/lib/image';
import { Alert } from '../../shared/ui/Alert';
import { Avatar } from '../../shared/ui/Avatar';
import { Button } from '../../shared/ui/Button';
import { Dialog } from '../../shared/ui/Dialog';
import { apiAssetUrl } from '../auth/auth-api';
import { DemoNotice } from '../auth/DemoNotice';
import type { User } from '../auth/types';
import { profileApi, useProfileMutation } from './account-api';
import styles from './Account.module.css';

type Mode = 'closed' | 'view' | 'preview';

/** Profile avatar with view (lightbox), change (crop → preview → upload) and remove. */
export function AvatarManager({ user, onStatus }: { user: User; onStatus(message: string): void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>('closed');
  const [pending, setPending] = useState<{ blob: Blob; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const upload = useProfileMutation(profileApi.uploadAvatar);
  const remove = useProfileMutation(profileApi.removeAvatar);
  const avatarSrc = apiAssetUrl(user.avatarUrl);

  useEffect(() => () => {
    if (pending) URL.revokeObjectURL(pending.url);
  }, [pending]);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setProcessing(true);
    try {
      const blob = await prepareAvatar(file);
      setPending({ blob, url: URL.createObjectURL(blob) });
      setMode('preview');
    } catch (err) {
      setError(err instanceof ImageProcessingError ? err.message : 'This image could not be processed.');
      setMode('view');
    } finally {
      setProcessing(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  function close() {
    setMode('closed');
    setError(null);
    setPending(null);
  }

  async function confirmUpload() {
    if (!pending) return;
    try {
      await upload.mutateAsync(pending.blob);
      close();
      onStatus('Profile photo updated.');
    } catch (err) {
      setError(errorMessage(err, 'The photo could not be uploaded.'));
    }
  }

  async function confirmRemove() {
    try {
      await remove.mutateAsync(undefined);
      close();
      onStatus('Profile photo removed. Your initials are shown instead.');
    } catch (err) {
      setError(errorMessage(err, 'The photo could not be removed.'));
    }
  }

  const choose = () => fileInput.current?.click();

  return (
    <>
      <button type="button" className={styles.avatarButton} onClick={() => setMode('view')} aria-label="View profile photo">
        <Avatar name={user.fullName} initials={user.initials} src={avatarSrc} size="xl" className={styles.avatarRing} decorative />
        <span className={styles.avatarBadge} aria-hidden="true">
          <Camera size={16} />
        </span>
      </button>
      <input
        ref={fileInput}
        type="file"
        accept={AVATAR_ACCEPT}
        className={styles.hiddenInput}
        tabIndex={-1}
        aria-label="Choose a profile photo"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />

      <Dialog
        open={mode === 'view'}
        onClose={close}
        title="Profile photo"
        description={avatarSrc ? 'This photo is visible to people you pay and request money from.' : 'No photo yet. Your initials are shown instead.'}
        size="sm"
      >
        <div className={styles.viewer}>
          {avatarSrc ? (
            <img src={avatarSrc} alt={`${user.fullName}'s profile photo`} className={styles.viewerImage} />
          ) : (
            <Avatar name={user.fullName} initials={user.initials} size="xl" />
          )}
          {error && <Alert tone="danger" title={error} />}
          {user.isDemo && <DemoNotice>The demo account's photo cannot be changed.</DemoNotice>}
          <div className={styles.formActions}>
            <Button icon={<ImageUp size={18} />} onClick={choose} loading={processing} loadingLabel="Preparing photo" disabled={user.isDemo}>
              {avatarSrc ? 'Change photo' : 'Upload photo'}
            </Button>
            {avatarSrc && (
              <Button variant="ghost" icon={<Trash2 size={18} />} onClick={() => void confirmRemove()} loading={remove.isPending} loadingLabel="Removing photo" disabled={user.isDemo}>
                Remove
              </Button>
            )}
          </div>
          <p className={styles.muted}>PNG, JPEG or WebP. We crop to a square and resize to 320 × 320.</p>
        </div>
      </Dialog>

      <Dialog open={mode === 'preview'} onClose={close} title="Use this photo?" description="Here is how it will appear across MiNi Pay." size="sm">
        {pending && (
          <div className={styles.viewer}>
            <div className={styles.previewRow}>
              <span className={styles.previewLabel}>
                <Avatar name={user.fullName} initials={user.initials} src={pending.url} size="xl" decorative />
                Profile
              </span>
              <span className={styles.previewLabel}>
                <Avatar name={user.fullName} initials={user.initials} src={pending.url} size="md" decorative />
                Header
              </span>
            </div>
            {error && <Alert tone="danger" title={error} />}
            <div className={styles.formActions}>
              <Button onClick={() => void confirmUpload()} loading={upload.isPending} loadingLabel="Uploading photo">
                Save photo
              </Button>
              <Button variant="secondary" onClick={choose}>
                Choose another
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
