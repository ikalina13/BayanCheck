"use client";

import { useState } from "react";
import { formatRelative } from "@/lib/utils";

const sampleComments = [
  {
    id: "1",
    author: "Juan M.",
    content: "Important to cross-check with the original Rappler article before sharing.",
    createdAt: "2026-05-15T09:00:00+08:00",
  },
  {
    id: "2",
    author: "Maria C.",
    content: "Thanks for the source link — very helpful for voter research.",
    createdAt: "2026-05-15T10:30:00+08:00",
  },
];

export function ArticleComments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState(sampleComments);
  const [text, setText] = useState("");
  const [name, setName] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !name.trim()) return;
    setComments([
      {
        id: String(Date.now()),
        author: name,
        content: text + " (pending moderation)",
        createdAt: new Date().toISOString(),
      },
      ...comments,
    ]);
    setText("");
  };

  return (
    <section className="mt-12 border-t pt-8" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-xl font-bold mb-4">
        Comments <span className="text-muted text-sm font-normal">(moderated)</span>
      </h2>
      <form onSubmit={submit} className="mb-8 space-y-3">
        <input
          type="text"
          placeholder="Display name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md bg-card text-sm"
          required
        />
        <textarea
          placeholder="Share your thoughts (subject to moderation)..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-md bg-card text-sm"
          required
        />
        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md text-sm">
          Post Comment
        </button>
        <p className="text-xs text-muted">Comments are reviewed before publication per our community guidelines.</p>
      </form>
      <ul className="space-y-4">
        {comments.map((c) => (
          <li key={c.id} className="p-4 bg-surface rounded-lg">
            <p className="font-medium text-sm">{c.author}</p>
            <p className="mt-1 text-sm">{c.content}</p>
            <time className="text-xs text-muted mt-2 block" dateTime={c.createdAt}>
              {formatRelative(c.createdAt)}
            </time>
          </li>
        ))}
      </ul>
      <input type="hidden" name="articleId" value={articleId} />
    </section>
  );
}
