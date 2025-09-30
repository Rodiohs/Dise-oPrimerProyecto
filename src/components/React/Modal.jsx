import React from "react";

/**
 * Simple Modal component.
 * Props:
 * - open (boolean)
 * - onClose (fn)
 * - title (string)
 * - children
 */
export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label={title || "Modal"}>
      <div className="modal-dialog">
        <div className="modal-header">
          <h3 className="text-lg font-medium">{title}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}