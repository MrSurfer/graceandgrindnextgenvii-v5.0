"use client";

import { useState } from "react";
import { createTicket, replyToTicket, closeTicket } from "./actions";
import { toast } from "sonner";
import { Loader2, Send, MessageSquare, Plus, Clock, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SupportClient({ initialTickets, userId, userName }: { initialTickets: any[], userId: string, userName: string }) {
  const [tickets, setTickets] = useState(initialTickets);
  const [isCreating, setIsCreating] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!newSubject.trim() || !newMessage.trim()) return;
    setLoading(true);
    const res = await createTicket(newSubject, newMessage);
    if (res.error) {
      toast.error(res.error);
    } else if (res.ticket) {
      toast.success("Ticket created successfully!");
      setTickets([{ ...res.ticket, replies: [] }, ...tickets]);
      setIsCreating(false);
      setNewSubject("");
      setNewMessage("");
    }
    setLoading(false);
  }

  async function handleReply(ticketId: string) {
    if (!replyMessage.trim()) return;
    setReplyLoading(true);
    const res = await replyToTicket(ticketId, replyMessage);
    if (res.error) {
      toast.error(res.error);
    } else if (res.reply) {
      toast.success("Reply sent!");
      const updatedReply = { ...res.reply, sender: { name: userName, role: "USER", image: null } };
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, replies: [...t.replies, updatedReply], updatedAt: new Date() } : t));
      setReplyMessage("");
    }
    setReplyLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-gray-200">Your Tickets ({tickets.length})</h2>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="bg-amber-500 hover:bg-amber-600 text-gray-950 px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2"
        >
          {isCreating ? "Cancel" : <><Plus className="w-4 h-4" /> New Ticket</>}
        </button>
      </div>

      <AnimatePresence>
        {isCreating && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleCreateTicket} 
            className="bg-gray-900 border border-amber-500/30 p-6 rounded-2xl space-y-4 overflow-hidden"
          >
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Subject</label>
              <input 
                type="text" 
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
                placeholder="Brief summary of your issue..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none transition-colors text-gray-200"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-500 mb-2">Message</label>
              <textarea 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-amber-500 focus:outline-none transition-colors min-h-[120px] text-gray-200"
                required
              />
            </div>
            <div className="flex justify-end">
              <button disabled={loading} type="submit" className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 px-6 py-3 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Submit Ticket
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {tickets.map(ticket => (
          <div key={ticket.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <button 
              onClick={() => setActiveTicketId(activeTicketId === ticket.id ? null : ticket.id)}
              className="w-full p-5 flex items-start justify-between hover:bg-gray-800/40 transition-colors text-left"
            >
              <div>
                <h3 className="font-bold text-gray-200 text-lg mb-1">{ticket.subject}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${ticket.status === "OPEN" ? "bg-amber-500/20 text-amber-500" : "bg-gray-800 text-gray-400"}`}>
                    {ticket.status}
                  </span>
                  <span>{ticket.replies.length} replies</span>
                </div>
              </div>
            </button>
            
            <AnimatePresence>
              {activeTicketId === ticket.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-800 bg-gray-900/50 p-5 space-y-6"
                >
                  <div className="bg-gray-800/30 p-4 rounded-xl border border-gray-800">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-widest">Original Message</p>
                    <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{ticket.message}</p>
                  </div>

                  {ticket.replies.length > 0 && (
                    <div className="space-y-4 pl-4 border-l-2 border-gray-800">
                      {ticket.replies.map((reply: any) => (
                        <div key={reply.id} className={`p-4 rounded-xl text-sm ${reply.senderId === userId ? "bg-gray-800/40 border border-gray-800" : "bg-amber-500/10 border border-amber-500/20"}`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-gray-200">{reply.sender?.name || "Support"}</span>
                            <span className="text-[10px] text-gray-500">{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-300 whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {ticket.status === "OPEN" && (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleReply(ticket.id)}
                        placeholder="Type a reply..."
                        className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none transition-colors"
                      />
                      <button 
                        onClick={() => handleReply(ticket.id)}
                        disabled={replyLoading || !replyMessage.trim()}
                        className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-gray-950 px-4 py-2.5 rounded-xl font-bold transition-colors"
                      >
                        {replyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {tickets.length === 0 && !isCreating && (
          <div className="text-center py-16 text-gray-500 bg-gray-900 border border-gray-800 rounded-2xl">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>You have no active support tickets.</p>
          </div>
        )}
      </div>
    </div>
  );
}
