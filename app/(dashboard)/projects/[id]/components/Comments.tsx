"use client";

import { useEffect, useState } from "react";
import { getBrowserSupabase } from "@/lib/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Motion } from "@/components/custom/Motion";
import ReactMarkdown from "react-markdown";
import { useT } from "@/lib/i18n/client";
import { formatTodoDate } from "@/lib/i18n/date-format";
import { MoreVertical, Edit2, Trash2, Check, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    name?: string;
    signedAvatarUrl?: string | null;
  };
}

interface CommentsProps {
  messages: Message[];
  projectId: string;
}

export function Comments({ messages: initialMessages, projectId }: CommentsProps) {
  const { t } = useT();
  const { toast } = useToast();
  const supabase = getBrowserSupabase();
  const [messages, setMessages] = useState<Message[]>(initialMessages || []);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);

  // === Fetch signed avatar URLs ===
  async function getAvatarUrl(path: string | null) {
    if (!path) return null;
    const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60);
    return data?.signedUrl || null;
  }

  // === Enrich messages with profile info and avatar URL ===
  async function enrichMessages(rawMessages: Message[]) {
    const userIds = [...new Set(rawMessages.map((m) => m.user_id))];
    const { data: profiles } = await supabase.from("profiles").select("id, name, avatar_url").in("id", userIds);
    const enriched = await Promise.all(
      rawMessages.map(async (m) => {
        const profile = profiles?.find((p) => p.id === m.user_id);
        const signedAvatarUrl = await getAvatarUrl(profile?.avatar_url || null);
        return { ...m, profile: { ...profile, signedAvatarUrl } };
      })
    );
    return enriched;
  }

  // === Get current user ===
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getCurrentUser();
  }, []);

  // === Initialize messages ===
  useEffect(() => {
    enrichMessages(initialMessages).then(setMessages);
  }, []);

  // === Realtime subscription ===
  useEffect(() => {
    const channel = supabase
      .channel(`project-messages-${projectId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "project_messages", filter: `project_id=eq.${projectId}` },
        async (payload) => {
          const newMsg = payload.new as Message;
          const enriched = await enrichMessages([newMsg]);
          setMessages((prev: Message[]) => [enriched[0], ...prev]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "project_messages", filter: `project_id=eq.${projectId}` },
        async (payload) => {
          const updatedMsg = payload.new as Message;
          const enriched = await enrichMessages([updatedMsg]);
          setMessages((prev: Message[]) => 
            prev.map((msg) => msg.id === updatedMsg.id ? enriched[0] : msg)
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "project_messages", filter: `project_id=eq.${projectId}` },
        async (payload) => {
          const deletedMsg = payload.old as Message;
          setMessages((prev: Message[]) => 
            prev.filter((msg) => msg.id !== deletedMsg.id)
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  // === Post new message ===
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setPosting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Optimistic UI
      const optimisticMsg: Message = {
        id: `temp-${Date.now()}`,
        project_id: projectId,
        user_id: user.id,
        content,
        created_at: new Date().toISOString(),
        profile: { name: "Du", signedAvatarUrl: null },
      };
      setMessages((prev: Message[]) => [optimisticMsg, ...prev]);
      setContent("");

      // Send to Supabase
      await supabase.from("project_messages").insert({ project_id: projectId, user_id: user.id, content });
      
      toast({
        title: t("project.message.posted"),
        description: t("project.message.posted.description"),
      });
    } catch (error) {
      console.error("Error posting message:", error);
      toast({
        title: t("project.message.error"),
        description: t("project.message.post.error"),
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  // === Edit message ===
  const handleEdit = async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return;
    
    try {
      const { error } = await supabase
        .from("project_messages")
        .update({ content: newContent })
        .eq("id", messageId);

      if (error) throw error;

      setEditingMessageId(null);
      setEditingContent("");
      
      toast({
        title: t("project.message.updated"),
        description: t("project.message.updated.description"),
      });
    } catch (error) {
      console.error("Error editing message:", error);
      toast({
        title: t("project.message.error"),
        description: t("project.message.edit.error"),
        variant: "destructive",
      });
    }
  };

  // === Delete message ===
  const handleDelete = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from("project_messages")
        .delete()
        .eq("id", messageId);

      if (error) throw error;

      toast({
        title: t("project.message.deleted"),
        description: t("project.message.deleted.description"),
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      toast({
        title: t("project.message.error"),
        description: t("project.message.delete.error"),
        variant: "destructive",
      });
    } finally {
      setDeletingMessageId(null);
    }
  };

  // === Start editing ===
  const startEditing = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
  };

  // === Cancel editing ===
  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingContent("");
  };

  return (
    <Card className="shadow-sm border border-border/50 bg-background/80 backdrop-blur-sm">
      <CardHeader>
        <h2 className="text-xl font-semibold">{t("dashboard.messages")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("project.share.updates")}
        </p>
      </CardHeader>

      <CardContent>
        {/* === Post new message form === */}
        <form onSubmit={handlePost} className="space-y-3 mb-6">
          <Label htmlFor="content">{t("project.message.label")}</Label>
          <Textarea
            id="content"
            name="content"
            rows={4}
            placeholder={t("project.message.placeholder")}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={posting}
            className="resize-none"
          />
          <Button type="submit" disabled={posting} size="sm">
            {posting ? t("project.posting") : t("project.post")}
          </Button>
        </form>

        {/* === Messages List === */}
        <Motion layout className="space-y-3 overflow-y-auto max-h-[60vh] pr-2">
          {messages.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              {t("project.no.messages")}
            </div>
          )}

          <AnimatePresence>
            {messages.map((message: Message, idx: number) => (
              <Motion
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.03 }}
                className="group relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.profile?.signedAvatarUrl ? (
                        <motion.img
                          src={message.profile.signedAvatarUrl}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
                          {message.profile?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {message.profile?.name || t("project.unknown")}
                          </span>
                          <span className="text-xs text-gray-50 dark:text-gray-400 whitespace-nowrap hidden sm:block">
                            {formatTodoDate(message.created_at, "de")}
                          </span>
                        </div>

                        {/* Actions Menu - Only show for message owner */}
                        {currentUserId === message.user_id && (
                          <div className="flex-shrink-0 ml-2">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-32">
                                <DropdownMenuItem onClick={() => startEditing(message)} className="cursor-pointer">
                                  <Edit2 className="mr-2 h-4 w-4" />
                                  {t("project.message.edit")}
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setDeletingMessageId(message.id)} 
                                  className="cursor-pointer text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {t("project.message.delete")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      {editingMessageId === message.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className="min-h-[80px] resize-none"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleEdit(message.id, editingContent)}
                              disabled={!editingContent.trim()}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              {t("project.message.save")}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4 mr-1" />
                              {t("project.message.cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Motion>
            ))}
          </AnimatePresence>
        </Motion>

        {/* Delete Confirmation Dialog */}
        {deletingMessageId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-2">
                {t("project.message.delete.confirm.title")}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {t("project.message.delete.confirm.description")}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingMessageId(null)}
                >
                  {t("project.message.cancel")}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(deletingMessageId)}
                >
                  {t("project.message.delete")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
