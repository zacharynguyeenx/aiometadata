/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { InstallDialog } from '../../configure/src/components/InstallDialog';

describe('install dialog', () => {
  it('shows the generated protocol and web install links', () => {
    render(
      <InstallDialog
        isOpen
        onClose={() => undefined}
        manifestUrl="https://example.test/stremio/user/manifest.json"
      />,
    );

    expect(screen.getByRole('heading', { name: 'Install Addon' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open in Stremio Desktop App/i })).toHaveAttribute(
      'href',
      'stremio://example.test/stremio/user/manifest.json',
    );
    expect(screen.getByRole('link', { name: /Open in Stremio Web/i })).toHaveAttribute(
      'href',
      'https://web.stremio.com/#/addons?addon=https%3A%2F%2Fexample.test%2Fstremio%2Fuser%2Fmanifest.json',
    );
    expect(screen.getByDisplayValue('https://example.test/stremio/user/manifest.json')).toBeInTheDocument();
  });
});
