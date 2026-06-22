import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiSend, FiMoreVertical, FiPhone, FiVideo, FiSmile, FiPaperclip } from 'react-icons/fi'
import { IoChatbubblesSharp } from 'react-icons/io5'
import { io } from 'socket.io-client'
import axios from 'axios'
import BASE_URL from '../../global_url.js'

const avatarColors = ["#dc2626", "#7c3aed", "#0891b2", "#059669", "#d97706", "#db2777"]

export default function Chats() {
  const [selected, setSelected] = useState(null)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [chatList, setChatList] = useState([])
  const [messages, setMessages] = useState([])
  const [user] = useState(() => JSON.parse(localStorage.getItem('loopix_user')) || null)

  const socketRef = useRef(null)
  const selectedChatRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Keep ref up to date to prevent closure stale states in socket listeners
  useEffect(() => {
    selectedChatRef.current = selected
    if (selected) {
      fetchHistory(selected)
    }
  }, [selected])

  const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { 'x-api-key': token } };
  };

  // Connect socket and fetch chat list on mount
  useEffect(() => {
    fetchChatList();

    socketRef.current = io(BASE_URL);

    if (user && user.id) {
      socketRef.current.emit('join_room', user.id);
    }

    socketRef.current.on('receive_message', (msg) => {
      // If msg belongs to currently active conversation
      const currentActive = selectedChatRef.current;
      if (currentActive && (msg.sender === currentActive || msg.receiver === currentActive)) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Call read endpoint to mark as read
        axios.get(`${BASE_URL}/messages/${currentActive}`, getHeaders()).catch(err => console.error(err));
      }
      // Refresh list to update previews
      fetchChatList();
    });

    socketRef.current.on('user_status', (data) => {
      setChatList(prev => prev.map(chat => {
        if (chat.id === data.userId) {
          return { ...chat, online: data.online };
        }
        return chat;
      }));
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    }
  }, [user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchChatList = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/chat-list`, getHeaders());
      if (res.data.status) {
        setChatList(res.data.chatList);
      }
    } catch (err) {
      console.error("Error fetching chat list:", err);
    }
  };

  const fetchHistory = async (friendId) => {
    try {
      const res = await axios.get(`${BASE_URL}/messages/${friendId}`, getHeaders());
      if (res.data.status) {
        setMessages(res.data.messages);
        setChatList(prev => prev.map(c => c.id === friendId ? { ...c, unread: 0 } : c));
      }
    } catch (err) {
      console.error("Error fetching message history:", err);
    }
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || !selected || !user) return;

    const payload = {
      senderId: user.id,
      receiverId: selected,
      text: message
    };

    socketRef.current.emit('send_message', payload);
    setMessage('');
  };

  const filtered = chatList.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
  const selectedChat = chatList.find(c => c.id === selected)

  // Format date helper
  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      height: "calc(100vh - 60px)",
      display: "flex",
      background: "#f9fafb",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      {/* Sidebar */}
      <div style={{
        width: "360px",
        maxWidth: "360px",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        flexShrink: 0,
      }} className="chats-sidebar">
        {/* Header */}
        <div style={{ padding: "1.25rem 1rem 0.75rem", borderBottom: "1px solid #e5e7eb" }}>
          <h2 style={{ color: "#111827", fontSize: "1.25rem", fontWeight: "800", marginBottom: "0.875rem", letterSpacing: "0.5px" }}>
            Messages
          </h2>
          {/* Search */}
          <div style={{ position: "relative" }}>
            <FiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.875rem" }} />
            <input
              type="text" placeholder="Search chats..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                background: "#f3f4f6", border: "1px solid #e5e7eb",
                borderRadius: "10px", color: "#111827", fontSize: "0.825rem",
                boxSizing: "border-box", outline: "none",
              }}
            />
          </div>
        </div>

        {/* Chat List */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
              <IoChatbubblesSharp style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "rgba(220,38,38,0.1)" }} />
              <p style={{ fontSize: "0.85rem", fontWeight: "600" }}>No conversations found</p>
              <p style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}>Add friends to start chatting!</p>
            </div>
          ) : filtered.map((chat, i) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(chat.id)}
              style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.75rem 0.75rem",
                borderRadius: "12px",
                background: selected === chat.id ? "rgba(220,38,38,0.05)" : "transparent",
                border: selected === chat.id ? "1px solid rgba(220,38,38,0.15)" : "1px solid transparent",
                cursor: "pointer", transition: "all 0.15s ease", marginBottom: "2px",
              }}
              whileHover={{ background: "rgba(0,0,0,0.025)" }}
            >
              {/* Avatar */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{
                  width: "46px", height: "46px", borderRadius: "50%",
                  background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}, ${avatarColors[i % avatarColors.length]}88)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: "800", fontSize: "1rem",
                }}>{chat.avatar}</div>
                {chat.online && (
                  <div style={{
                    position: "absolute", bottom: "1px", right: "1px",
                    width: "11px", height: "11px", background: "#22c55e",
                    border: "2px solid #ffffff", borderRadius: "50%",
                  }} />
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                  <span style={{ color: "#111827", fontWeight: "700", fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.name}</span>
                  <span style={{ color: "#9ca3af", fontSize: "0.7rem", flexShrink: 0, marginLeft: "0.5rem" }}>{chat.time}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "#6b7280", fontSize: "0.775rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: chat.unread > 0 ? "700" : "400" }}>
                    {chat.lastMsg?.startsWith('data:image/') ? "📷 Snap" : chat.lastMsg}
                  </span>
                  {chat.unread > 0 && (
                    <div style={{
                      width: "18px", height: "18px", background: "#dc2626",
                      borderRadius: "50%", color: "#fff", fontSize: "0.6rem",
                      fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: "0.5rem",
                    }}>{chat.unread}</div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      {selected ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "#f3f4f6" }}>
          {/* Chat Header */}
          <div style={{
            padding: "0.875rem 1.25rem", borderBottom: "1px solid #e5e7eb",
            display: "flex", alignItems: "center", gap: "0.75rem",
            background: "#ffffff",
          }}>
            <button onClick={() => setSelected(null)} className="back-btn-chat" style={{ background: "none", border: "none", color: "#4b5563", cursor: "pointer", fontSize: "1.1rem", display: "none", marginRight: "0.25rem" }}>←</button>
            <div style={{ position: "relative" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: `linear-gradient(135deg, ${avatarColors[chatList.findIndex(c=>c.id===selected) % avatarColors.length || 0]}, ${avatarColors[chatList.findIndex(c=>c.id===selected) % avatarColors.length || 0]}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.9rem" }}>
                {selectedChat?.avatar}
              </div>
              {selectedChat?.online && <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "10px", height: "10px", background: "#22c55e", border: "2px solid #ffffff", borderRadius: "50%" }} />}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: "#111827", fontWeight: "700", fontSize: "0.9rem", margin: 0 }}>{selectedChat?.name}</p>
              <p style={{ color: selectedChat?.online ? "#16a34a" : "#9ca3af", fontSize: "0.7rem", margin: 0, fontWeight: "600" }}>
                {selectedChat?.online ? "● Online" : "● Offline"}
              </p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[FiPhone, FiVideo, FiMoreVertical].map((Icon, i) => (
                <button key={i} style={{ background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "0.45rem", color: "#4b5563", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <Icon style={{ fontSize: "0.9rem" }} />
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {messages.map((msg, i) => {
              const isSentByMe = msg.sender === user?.id;
              return (
                <motion.div key={msg._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                  style={{ display: "flex", justifyContent: isSentByMe ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "72%", padding: "0.6rem 0.875rem",
                    background: isSentByMe ? "linear-gradient(135deg, #dc2626, #b91c1c)" : "#ffffff",
                    borderRadius: isSentByMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    color: isSentByMe ? "#ffffff" : "#111827", fontSize: "0.875rem", lineHeight: "1.5",
                    border: isSentByMe ? "none" : "1px solid #e5e7eb",
                    boxShadow: isSentByMe ? "0 4px 12px rgba(220,38,38,0.15)" : "0 2px 6px rgba(0,0,0,0.03)",
                  }}>
                    {msg.text?.startsWith('data:image/') ? (
                      <img src={msg.text} alt="Shared Snap" style={{ maxWidth: "200px", borderRadius: "10px", display: "block", cursor: "pointer", border: isSentByMe ? "2px solid rgba(255,255,255,0.4)" : "1px solid #e5e7eb" }} onClick={() => {
                        const w = window.open();
                        w.document.write(`<iframe src="${msg.text}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
                      }} />
                    ) : (
                      msg.text
                    )}
                    <div style={{ marginTop: "0.2rem", fontSize: "0.6rem", color: isSentByMe ? "rgba(255,255,255,0.6)" : "#9ca3af", textAlign: "right" }}>{formatTime(msg.createdAt)}</div>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} style={{ padding: "0.875rem 1rem", borderTop: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "0.625rem", background: "#ffffff" }}>
            <button type="button" style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center" }}><FiPaperclip /></button>
            <button type="button" style={{ background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: "1.1rem", display: "flex", alignItems: "center" }}><FiSmile /></button>
            <input
              type="text" placeholder="Type a message..." value={message}
              onChange={e => setMessage(e.target.value)}
              style={{
                flex: 1, padding: "0.6rem 0.875rem",
                background: "#f3f4f6", border: "1px solid #e5e7eb",
                borderRadius: "24px", color: "#111827", fontSize: "0.875rem", outline: "none",
              }}
            />
            <motion.button type="submit" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{
                padding: "0.6rem", borderRadius: "50%", border: "none",
                background: message.trim() ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "#f3f4f6",
                color: message.trim() ? "#fff" : "#9ca3af", cursor: message.trim() ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: message.trim() ? "0 4px 12px rgba(220,38,38,0.2)" : "none", transition: "all 0.2s ease",
              }}>
              <FiSend style={{ fontSize: "1rem" }} />
            </motion.button>
          </form>
        </div>
      ) : (
        // Empty state (desktop)
        <div className="chat-window-empty" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
          <IoChatbubblesSharp style={{ fontSize: "4rem", marginBottom: "1rem", color: "rgba(220,38,38,0.1)" }} />
          <p style={{ fontSize: "1rem", fontWeight: "600", color: "#4b5563" }}>Select a chat to start messaging</p>
          <p style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>Your conversations will appear here</p>
        </div>
      )}

      <style>{`
        input::placeholder { color: #9ca3af !important; }
        @media(max-width: 640px) {
          .chats-sidebar { max-width: 100% !important; width: 100% !important; }
          .back-btn-chat { display: flex !important; }
          .chat-window-empty { display: none !important; }
        }
      `}</style>
    </div>
  )
}
