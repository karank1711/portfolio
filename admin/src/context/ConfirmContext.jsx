import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Button } from '@/components/Button.jsx';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((options) => new Promise((resolve) => {
    resolver.current = resolve;
    setState(options);
  }), []);

  function close(value) {
    resolver.current?.(value);
    resolver.current = null;
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state ? (
        <div className="fixed inset-0 z-[75] flex items-end justify-center p-4 sm:items-center">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Cancel" onClick={() => close(false)} />
          <div role="dialog" aria-modal="true" className="relative w-full max-w-md border border-line bg-elevated p-5">
            <h2 className="font-serif text-2xl text-ink">{state.title}</h2>
            {state.body ? <p className="mt-2 text-sm leading-relaxed text-muted">{state.body}</p> : null}
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => close(false)}>Cancel</Button>
              <Button onClick={() => close(true)}>{state.confirmLabel || 'Confirm'}</Button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
