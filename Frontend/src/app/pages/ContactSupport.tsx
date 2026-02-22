import React from "react";

export function ContactSupport() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">Contact Support</h1>

      <p className="mb-4">If you need help, please reach out to our support team:</p>

      <ul className="list-disc pl-5 mb-4">
        <li>
          <a className="text-text-primary underline" href="mailto:sialampalli2005@gmail.com">
            sialampalli2005@gmail.com
          </a>
        </li>
        <li>
          <a className="text-text-primary underline" href="mailto:bhuvansshetty90@gmail.com">
            bhuvansshetty90@gmail.com
          </a>
        </li>
      </ul>

      <p className="mb-4">Alternatively, you can include details about the issue and we will respond as soon as possible.</p>

      <p className="mt-6 text-sm text-text-muted">Note: this is a client-side contact placeholder. For tickets or attachments, consider connecting a helpdesk integration.</p>
    </div>
  );
}
