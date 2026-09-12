import { useState } from 'react';

interface Props {
  id: string;
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete: string;
  invalid?: boolean;
  hint?: string;
}

function PasswordField({ id, label, value, onChange, autoComplete, invalid, hint }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={`auth__field${invalid ? ' auth__field--invalid' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <span className="auth__password">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={invalid || undefined}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
        {/* A button, not a checkbox with an eye: the state is the word, so it
            reads correctly to a screen reader with no label of its own. */}
        <button
          type="button"
          className="auth__reveal"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? 'hide' : 'show'}
        </button>
      </span>
      {hint && (
        <span className="auth__hint" id={`${id}-hint`}>
          {hint}
        </span>
      )}
    </div>
  );
}

export default PasswordField;
