'use client';

import { useRef, useState } from 'react';
import {
  CONTACT_EMAIL,
} from '@/lib/content';
import {
  SERVICE_OPTIONS,
  mailtoHref,
  normalise,
  validate,
  type Enquiry,
  type Errors,
} from '@/lib/enquiry';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string };

const EMPTY: Enquiry = { name: '', email: '', brand: '', service: '', brief: '' };

export default function EnquiryForm() {
  const [values, setValues] = useState<Enquiry>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const formRef = useRef<HTMLFormElement>(null);

  const set = (field: keyof Enquiry) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const next = { ...values, [field]: e.target.value };
    setValues(next);
    // Clear a field's error as soon as it becomes valid, not on next submit.
    if (errors[field as keyof Errors]) {
      const remaining = validate(next);
      setErrors((prev) => ({ ...prev, [field]: remaining[field as keyof Errors] }));
    }
  };

  const focusFirstError = (found: Errors) => {
    const order: (keyof Errors)[] = ['name', 'email', 'brief'];
    const first = order.find((f) => found[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`#f-${first}`)?.focus();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const cleaned = normalise(values);
    const found = validate(cleaned);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      setStatus({ kind: 'idle' });
      focusFirstError(found);
      return;
    }

    setStatus({ kind: 'sending' });

    // The honeypot travels with the payload but is never shown to a person.
    const company =
      formRef.current?.querySelector<HTMLInputElement>('input[name="company"]')?.value ?? '';

    try {
      const res = await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cleaned, company }),
      });

      if (res.ok) {
        setValues(EMPTY);
        setStatus({ kind: 'sent' });
        return;
      }

      const data: { errors?: Errors; fallback?: string; message?: string } = await res
        .json()
        .catch(() => ({}));

      // The server re-validates; surface anything it caught that we did not.
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus({ kind: 'idle' });
        focusFirstError(data.errors);
        return;
      }

      // No delivery provider configured, or the provider failed — hand the
      // enquiry to the visitor's mail client rather than losing it.
      if (data.fallback === 'mailto') {
        window.location.href = mailtoHref(CONTACT_EMAIL, cleaned);
        setStatus({
          kind: 'error',
          message: `Opening your email app. If nothing happens, write to ${CONTACT_EMAIL}.`,
        });
        return;
      }

      setStatus({
        kind: 'error',
        message: data.message ?? `That did not send. Email ${CONTACT_EMAIL} and we will pick it up.`,
      });
    } catch {
      setStatus({
        kind: 'error',
        message: `That did not send. Email ${CONTACT_EMAIL} and we will pick it up.`,
      });
    }
  };

  const fieldClass = (field: keyof Errors, extra = '') =>
    `field${extra ? ` ${extra}` : ''}${errors[field] ? ' is-invalid' : ''}`;

  const statusText =
    status.kind === 'sending'
      ? 'Sending…'
      : status.kind === 'sent'
        ? 'Thank you. We will reply within two working days.'
        : status.kind === 'error'
          ? status.message
          : '';

  return (
    <form className="form reveal" ref={formRef} onSubmit={onSubmit} noValidate>
      <div className={fieldClass('name')}>
        <label htmlFor="f-name">Name</label>
        <input
          id="f-name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={set('name')}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'e-name' : undefined}
        />
        {errors.name && (
          <p className="field__error" id="e-name">
            {errors.name}
          </p>
        )}
      </div>

      <div className={fieldClass('email')}>
        <label htmlFor="f-email">Email</label>
        <input
          id="f-email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={set('email')}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'e-email' : undefined}
        />
        {errors.email && (
          <p className="field__error" id="e-email">
            {errors.email}
          </p>
        )}
      </div>

      <div className="field field--full">
        <label htmlFor="f-brand">Brand or company</label>
        <input
          id="f-brand"
          name="brand"
          type="text"
          autoComplete="organization"
          value={values.brand}
          onChange={set('brand')}
        />
      </div>

      <div className="field field--full">
        <label htmlFor="f-service">What do you need?</label>
        <select id="f-service" name="service" value={values.service} onChange={set('service')}>
          <option value="">Not sure yet</option>
          {SERVICE_OPTIONS.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </div>

      <div className={fieldClass('brief', 'field--full')}>
        <label htmlFor="f-brief">Tell us about it</label>
        <textarea
          id="f-brief"
          name="brief"
          rows={5}
          value={values.brief}
          onChange={set('brief')}
          aria-invalid={Boolean(errors.brief)}
          aria-describedby={errors.brief ? 'e-brief' : undefined}
        />
        {errors.brief && (
          <p className="field__error" id="e-brief">
            {errors.brief}
          </p>
        )}
      </div>

      {/* Honeypot — hidden from people, irresistible to bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-company">Company (leave blank)</label>
        <input id="f-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="form__foot">
        <button className="btn btn--solid" type="submit" disabled={status.kind === 'sending'}>
          {status.kind === 'sending' ? 'Sending' : 'Send enquiry'}
        </button>
        <p className="form__note">
          Or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>

      <p className="form__status" role="status" aria-live="polite">
        {statusText}
      </p>
    </form>
  );
}
