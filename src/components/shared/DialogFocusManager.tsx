import { useEffect } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

// offsetParent is null for position:fixed elements, and every dialog here is
// `fixed inset-0`, so visibility is tested by whether the element renders a box.
const visible = (el: HTMLElement) => el.getClientRects().length > 0;

/**
 * Keyboard behaviour for modal dialogs, applied app-wide.
 *
 * The app opens modals as plain conditionally-rendered markup in 20-odd
 * components rather than through a shared Modal component. Each already carries
 * role="dialog" and aria-modal="true", but without focus containment Tab walks
 * straight out of the dialog and into the page behind it, which for a screen
 * reader or keyboard user means the modal is effectively not modal.
 *
 * Rather than thread a hook through every one of them, this watches for a
 * dialog appearing and applies the behaviour to whichever is on top:
 *
 *  - focus moves to the first control in the dialog when it opens
 *  - Tab and Shift+Tab wrap inside it
 *  - focus returns to the element that opened it when it closes
 *
 * Escape is deliberately not wired up here: each modal closes through its own
 * state and there is no reliable way to reach that from outside the component.
 * Every dialog has a visible Cancel or Close control, which is now reachable by
 * keyboard. Escape should be added per-modal when these move to a shared
 * component.
 */
export default function DialogFocusManager() {
  useEffect(() => {
    let opener: HTMLElement | null = null;
    let current: HTMLElement | null = null;

    const topDialog = (): HTMLElement | null => {
      const all = Array.from(
        document.querySelectorAll<HTMLElement>('[role="dialog"]')
      ).filter(visible);
      return all.length ? all[all.length - 1] : null;
    };

    const sync = () => {
      const dialog = topDialog();

      if (dialog && dialog !== current) {
        if (!current) opener = document.activeElement as HTMLElement | null;
        current = dialog;
        const first = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE)).find(visible);
        if (first) {
          first.focus();
        } else {
          dialog.setAttribute('tabindex', '-1');
          dialog.focus();
        }
      } else if (!dialog && current) {
        current = null;
        opener?.focus?.();
        opener = null;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !current) return;
      const items = Array.from(current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(visible);
      if (!items.length) return;

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && (active === first || !current.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !current.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', onKeyDown, true);
    sync();

    return () => {
      observer.disconnect();
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, []);

  return null;
}
