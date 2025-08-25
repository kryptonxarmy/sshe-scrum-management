import React, { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "../ui/sheet";
import { Button } from "../ui/button";

function getInitials(name) {
  if (!name) return "U";
  const words = name.trim().split(" ");
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function buildCommentTree(comments) {
  const map = {};
  const roots = [];
  comments.forEach((c) => {
    map[c.id] = { ...c, replies: [] };
  });
  comments.forEach((c) => {
    if (c.parentId) {
      if (map[c.parentId]) {
        map[c.parentId].replies.push(map[c.id]);
      }
    } else {
      roots.push(map[c.id]);
    }
  });
  return roots;
}

function CommentItem({ id, name, role, comment, replies, onReply, replyingId, onSubmitReply, replyContent, setReplyContent, user }) {
  const initials = getInitials(name);
  return (
    <div className="border-b mx-4 pb-4 mb-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="flex items-center justify-center rounded-full bg-slate-300 text-slate-700 font-bold" style={{ width: 32, height: 32, fontSize: 14 }}>
          {initials}
        </div>
        <div>
          <div className="font-semibold text-sm">{name}</div>
          <div className="text-xs text-gray-500">{role}</div>
        </div>
      </div>
      <div className="text-sm text-gray-700 mb-2">{comment}</div>
      <div className="flex gap-2 mt-2">
        <Button variant="ghost" className={`p-1`} size="xs" onClick={() => onReply(id)}>
          Reply
        </Button>
      </div>
      {replyingId === id && (
        <form className="flex flex-col gap-2 mt-2" onSubmit={(e) => onSubmitReply(e, id)}>
          <textarea className="border rounded p-2 text-sm" rows={2} placeholder={`Reply to ${name}...`} value={replyContent} onChange={(e) => setReplyContent(e.target.value)} disabled={!user} />
          <div className="flex gap-2">
            <Button type="submit" className={`p-1`} size="xs" disabled={!replyContent.trim()}>
              Kirim Reply
            </Button>
            <Button type="button" className={`p-1`} size="xs" variant="outline" onClick={() => onReply(null)}>
              Batal
            </Button>
          </div>
        </form>
      )}
      {replies && replies.length > 0 && (
        <div className="pl-8 mt-2 border-l">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              id={reply.id}
              name={reply.user?.name || "-"}
              role={reply.role}
              comment={reply.content}
              replies={reply.replies}
              onReply={onReply}
              replyingId={replyingId}
              onSubmitReply={onSubmitReply}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TaskCommentsSheet({ open, onOpenChange, taskId, user, taskName }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [replyingId, setReplyingId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  useEffect(() => {
    if (!taskId || !open) return;
    setLoading(true);
    setError(null);
    fetch(`/api/comments?taskId=${taskId}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(buildCommentTree(data.comments || []));
      })
      .catch((err) => {
        setError("Gagal mengambil komentar");
      })
      .finally(() => setLoading(false));
  }, [taskId, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          userId: user?.id,
          role: user?.role,
          taskId,
        }),
      });
      if (!res.ok) throw new Error("Gagal mengirim komentar");
      setContent("");
      const data = await res.json();
      setComments((prev) => [...prev, data.comment]);
    } catch (err) {
      setError("Gagal mengirim komentar");
    } finally {
      setPosting(false);
    }
  };

  const handleSubmitReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setPosting(true);
    setError(null);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: replyContent,
          userId: user?.id,
          role: user?.role,
          taskId,
          parentId,
        }),
      });
      if (!res.ok) throw new Error("Gagal mengirim reply");
      setReplyContent("");
      setReplyingId(null);
      fetch(`/api/comments?taskId=${taskId}`)
        .then((res) => res.json())
        .then((data) => {
          setComments(buildCommentTree(data.comments || []));
        });
    } catch (err) {
      setError("Gagal mengirim reply");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-lg w-full">
        <SheetHeader>
          <SheetTitle>Komentar Task - {taskName}</SheetTitle>
          <SheetDescription>Diskusi dan update terkait task ini.</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto max-h-[60vh] py-2">
          {loading ? (
            <div className="text-center text-sm text-gray-500 py-8">Loading...</div>
          ) : error ? (
            <div className="text-center text-sm text-red-500 py-8">{error}</div>
          ) : comments.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-8">Belum ada komentar.</div>
          ) : (
            comments.map((c) => (
              <CommentItem
                key={c.id}
                id={c.id}
                name={c.user?.name || "-"}
                role={c.role}
                comment={c.content}
                replies={c.replies}
                onReply={setReplyingId}
                replyingId={replyingId}
                onSubmitReply={handleSubmitReply}
                replyContent={replyContent}
                setReplyContent={setReplyContent}
                user={user}
              />
            ))
          )}
        </div>
        <SheetFooter>
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <textarea className="border rounded p-2 text-sm" rows={2} placeholder="Tulis komentar..." value={content} onChange={(e) => setContent(e.target.value)} disabled={posting} />
            <Button type="submit" size="sm" disabled={posting || !content.trim()}>
              {posting ? "Mengirim..." : "Kirim Komentar"}
            </Button>
          </form>
        </SheetFooter>
        <SheetClose />
      </SheetContent>
    </Sheet>
  );
}
