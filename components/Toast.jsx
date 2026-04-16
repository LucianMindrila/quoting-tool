'use client';

export default function Toast({ message }) {
  return (
    <div id="toast" className={message ? 'show' : ''}>
      <span>{message}</span>
    </div>
  );
}
