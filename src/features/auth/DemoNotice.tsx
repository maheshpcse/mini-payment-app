import { Alert } from '../../shared/ui/Alert';

/** Shown wherever the API turns a control off for shared demo accounts. */
export function DemoNotice({ children }: { children: string }) {
  return (
    <Alert tone="info" title="Shared demo account">
      {children}
    </Alert>
  );
}
