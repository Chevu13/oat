"use client";

import { useState, useTransition } from "react";
import { sendInquiry, type InquiryErrors } from "@/app/(shop)/kontakt/actions";
import { ArrowIcon, CheckIcon } from "@/components/ui/icons";
import { INQUIRY_TOPICS, TOPIC_LABEL, type InquiryTopic } from "@/lib/types";

const EMPTY = { name: "", company: "", email: "", phone: "", message: "", website: "" };

export function InquiryForm() {
  const [values, setValues] = useState(EMPTY);
  const [topic, setTopic] = useState<InquiryTopic>("objekat");
  const [errors, setErrors] = useState<InquiryErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, start] = useTransition();

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k as keyof InquiryErrors]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    start(async () => {
      const res = await sendInquiry({ ...values, topic });
      if (res.ok) {
        setSent(true);
        setValues(EMPTY);
        return;
      }
      setFormError(res.error);
      setErrors(res.fields ?? {});
      const first = Object.keys(res.fields ?? {})[0];
      if (first) document.getElementById(`inq-${first}`)?.focus();
    });
  };

  if (sent)
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-[1.5rem] bg-white/70 p-8 ring-1 ring-line">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-ink text-paper">
          <CheckIcon />
        </span>
        <p className="display text-3xl">Hvala na poruci!</p>
        <p className="text-ink-soft">Javićemo ti se u najkraćem roku na telefon ili e-mail koji si ostavio.</p>
        <button type="button" onClick={() => setSent(false)} className="btn btn-line !min-h-11 text-sm">
          Pošalji novi upit
        </button>
      </div>
    );

  const field = (k: keyof InquiryErrors & keyof typeof EMPTY, label: string, props: React.InputHTMLAttributes<HTMLInputElement> & { optional?: boolean }) => {
    const { optional, ...rest } = props;
    return (
      <label>
        <span className="mb-1.5 block text-sm font-semibold">
          {label} {optional ? <span className="font-normal text-ink-soft">(opciono)</span> : <span className="text-berry">*</span>}
        </span>
        <input
          id={`inq-${k}`}
          name={k}
          value={values[k]}
          onChange={set(k)}
          aria-invalid={Boolean(errors[k])}
          aria-describedby={errors[k] ? `inq-${k}-err` : undefined}
          className="field"
          {...rest}
        />
        {errors[k] && (
          <span id={`inq-${k}-err`} className="mt-1.5 block text-sm font-medium text-berry">
            {errors[k]}
          </span>
        )}
      </label>
    );
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <fieldset className="sm:col-span-2">
        <legend className="mb-2 text-sm font-semibold">Tema upita</legend>
        <div className="flex flex-wrap gap-2">
          {INQUIRY_TOPICS.map((t) => (
            <label key={t}>
              <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} className="peer sr-only" />
              <span className="block rounded-full border-[1.5px] border-ink/20 bg-white/60 px-4 py-2.5 text-sm font-bold transition-colors peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink">
                {TOPIC_LABEL[t]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {field("name", "Ime i prezime", { autoComplete: "name", placeholder: "Marko Marković" })}
      {field("company", "Objekat / firma", { autoComplete: "organization", placeholder: "npr. Fit kafe Centar", optional: true })}
      {field("phone", "Telefon", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "06x xxx xxxx" })}
      {field("email", "E-mail", { type: "email", inputMode: "email", autoComplete: "email", placeholder: "ime@primer.rs" })}
      <label className="sm:col-span-2">
        <span className="mb-1.5 block text-sm font-semibold">
          Poruka <span className="text-berry">*</span>
        </span>
        <textarea
          id="inq-message"
          name="message"
          rows={5}
          maxLength={2000}
          value={values.message}
          onChange={set("message")}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "inq-message-err" : undefined}
          placeholder={
            topic === "dogadjaj" ? "Datum događaja, broj gostiju, željeni ukusi…" : topic === "objekat" ? "Vrsta objekta, lokacija, okvirne nedeljne količine…" : "Kako možemo da pomognemo?"
          }
          className="field resize-y"
        />
        {errors.message && (
          <span id="inq-message-err" className="mt-1.5 block text-sm font-medium text-berry">
            {errors.message}
          </span>
        )}
      </label>
      {/* honeypot */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" value={values.website} onChange={set("website")} />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
        <button disabled={pending} className="btn btn-ink">
          {pending ? "Šaljemo…" : "Pošalji upit"} {!pending && <ArrowIcon />}
        </button>
        {formError && (
          <p role="alert" className="text-sm font-semibold text-berry">
            {formError}
          </p>
        )}
      </div>
    </form>
  );
}
