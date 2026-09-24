import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AmountDisplay } from './AmountDisplay';
import { Button } from './Button';
import { TextField } from './TextField';

describe('Button', () => {
  it('fires clicks when idle', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Pay</Button>);
    await userEvent.click(screen.getByRole('button', { name: 'Pay' }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('blocks repeat submission and announces progress while loading', async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} loading loadingLabel="Processing payment">
        Pay
      </Button>,
    );
    const button = screen.getByRole('button', { name: /Pay/ });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Processing payment')).toBeInTheDocument();
    await userEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('AmountDisplay', () => {
  it('exposes the full amount as text for assistive technology', () => {
    render(<AmountDisplay amountMinor={10_234_560} />);
    expect(screen.getByText('₹1,02,345.60')).toBeInTheDocument();
  });

  it('hides digits when masked', () => {
    render(<AmountDisplay amountMinor={4_999} masked />);
    expect(screen.getByText('Amount hidden')).toBeInTheDocument();
    expect(screen.queryByText(/49/)).not.toBeInTheDocument();
  });
});

describe('TextField', () => {
  it('associates the label and hint', () => {
    render(<TextField label="Payment ID" hint="e.g. asha@minipay" />);
    const input = screen.getByLabelText('Payment ID');
    expect(input).toHaveAccessibleDescription('e.g. asha@minipay');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('marks invalid input and announces the error', () => {
    render(<TextField label="Amount" error="Use at most 2 decimal places." />);
    const input = screen.getByLabelText('Amount');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Use at most 2 decimal places.');
    expect(screen.getByRole('alert')).toHaveTextContent('Use at most 2 decimal places.');
  });
});
