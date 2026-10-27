import type { ComponentProps, ReactNode } from "react";

/**
 * The Breeze form components of the Laravel app (x-breeze.*), as React components.
 */

export function InputLabel({ className = "", ...props }: ComponentProps<"label">) {
  return <label className={`block font-medium text-sm text-gray-700 ${className}`} {...props} />;
}

const fieldClasses =
  "border border-gray-400 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-xs px-2 py-1";

export function TextInput({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${fieldClasses} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${fieldClasses} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${fieldClasses} ${className}`} {...props} />;
}

export function InputError({ messages, className = "" }: { messages?: string[]; className?: string }) {
  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <ul className={`text-sm text-red-600 space-y-1 ${className}`}>
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

export function PrimaryButton({ className = "", type = "submit", ...props }: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={`inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function DangerButton({ className = "", type = "submit", ...props }: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={`inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-500 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

export function SecondaryButton({ className = "", type = "button", ...props }: ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={`inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-25 transition ease-in-out duration-150 ${className}`}
      {...props}
    />
  );
}

/**
 * The dark "button" look for links (Upload photo, Edit, New ...).
 */
export const darkButtonLinkClasses =
  "inline-flex items-center px-4 py-2 bg-gray-800 rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700";

/**
 * The white header bar with the page title in the logged-in area ($header in app.blade.php).
 */
export function PageHeader({ children }: { children: ReactNode }) {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</div>
    </header>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-semibold text-xl text-gray-800 leading-tight">{children}</h2>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white overflow-hidden shadow-sm sm:rounded-lg p-6 ${className}`}>{children}</div>;
}
