import { ArrowLeft, Mail, Smartphone, UserRound } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { errorMessage, fieldErrorsFrom } from '../../shared/lib/form-errors';
import { validators } from '../../shared/lib/validation';
import { Alert } from '../../shared/ui/Alert';
import { initialsOf } from '../../shared/lib/avatar';
import { Avatar } from '../../shared/ui/Avatar';
import { Button } from '../../shared/ui/Button';
import { Island } from '../../shared/ui/Island';
import { TextField } from '../../shared/ui/TextField';
import { apiAssetUrl } from '../auth/auth-api';
import { DemoNotice } from '../auth/DemoNotice';
import { useCurrentUser } from '../auth/useSession';
import { profileApi, useProfileMutation } from './account-api';
import styles from './Account.module.css';

const LABELS = { firstName: 'First name', lastName: 'Last name', phone: 'Mobile number' };

export function EditProfilePage() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const update = useProfileMutation(profileApi.update);
  const [values, setValues] = useState({ firstName: user.firstName, lastName: user.lastName, phone: user.phone?.replace(/^\+91/, '') ?? '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const set = (field: keyof typeof values) => (event: { target: { value: string } }) => setValues((current) => ({ ...current, [field]: event.target.value }));
  const previewName = `${values.firstName} ${values.lastName}`.trim() || user.fullName;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const next = {
      firstName: validators.name(values.firstName, 'First name'),
      lastName: validators.name(values.lastName, 'Last name'),
      phone: validators.phone(values.phone),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setFormError(null);
    try {
      await update.mutateAsync({ firstName: values.firstName.trim(), lastName: values.lastName.trim(), phone: values.phone.trim() || null });
      navigate('/profile', { state: { saved: 'Profile updated.' } });
    } catch (err) {
      const fields = fieldErrorsFrom(err, LABELS);
      setErrors(fields);
      setFormError(Object.keys(fields).length ? 'Please fix the highlighted fields.' : errorMessage(err));
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <Link to="/profile" className={styles.backLink}>
            <ArrowLeft size={14} aria-hidden="true" /> Profile
          </Link>
          <h1>Edit profile</h1>
          <p>Your name appears on payments and receipts.</p>
        </div>
      </header>

      <Island>
        <form className={styles.form} onSubmit={onSubmit} noValidate>
          <div className={styles.hero}>
            <Avatar
              name={previewName}
              initials={initialsOf(values.firstName || user.firstName, values.lastName || user.lastName)}
              src={apiAssetUrl(user.avatarUrl)}
              size="lg"
              decorative
            />
            <p className={styles.muted}>
              {user.avatarUrl ? 'Change your photo from the profile page.' : 'Without a photo, your initials are shown and update as you type.'}
            </p>
          </div>
          {user.isDemo && <DemoNotice>The demo profile is shared, so its details cannot be edited.</DemoNotice>}
          {formError && <Alert tone="danger" title={formError} />}
          <fieldset className={styles.fieldset} disabled={user.isDemo === true}>
            <div className={styles.formRow}>
              <TextField label="First name" autoComplete="given-name" value={values.firstName} onChange={set('firstName')} error={errors.firstName} leading={<UserRound size={18} />} />
              <TextField label="Last name" autoComplete="family-name" value={values.lastName} onChange={set('lastName')} error={errors.lastName} />
            </div>
            <TextField
              label="Mobile number"
              type="tel"
              inputMode="tel"
              autoComplete="tel-national"
              value={values.phone}
              onChange={set('phone')}
              error={errors.phone}
              hint="Needed for SMS alerts. Leave empty to remove."
              leading={<Smartphone size={18} />}
            />
          </fieldset>
          <TextField label="Email" value={user.email} disabled hint="Changing email needs verification, which arrives with OTP support (BE-007)." leading={<Mail size={18} />} />
          <div className={styles.formActions}>
            <Button type="submit" loading={update.isPending} loadingLabel="Saving profile" disabled={user.isDemo}>
              Save changes
            </Button>
            <Button variant="secondary" onClick={() => navigate('/profile')}>
              {user.isDemo ? 'Back to profile' : 'Cancel'}
            </Button>
          </div>
        </form>
      </Island>
    </div>
  );
}
