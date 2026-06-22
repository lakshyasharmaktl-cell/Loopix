import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiUserPlus, FiUserCheck, FiUserX, FiUsers } from 'react-icons/fi';
import { IoPeopleSharp } from 'react-icons/io5';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../../global_url.js';

const avatarColors = ["#dc2626", "#7c3aed", "#0891b2", "#059669", "#d97706", "#db2777"];

export default function Friends() {
  const [tab, setTab] = useState('friends');
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState([]);

  const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { 'x-api-key': token } };
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  // Debounced search handler
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (search.trim()) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      if (tab === 'friends') {
        const res = await axios.get(`${BASE_URL}/friends`, headers);
        if (res.data.status) {
          setFriends(res.data.friends.map(f => ({
            id: f._id,
            name: f.name,
            email: f.email,
            profileImg: f.profileImg,
            online: f.user?.isOnline || false,
            avatar: f.name ? f.name.charAt(0).toUpperCase() : 'U'
          })));
        }
      } else if (tab === 'requests') {
        const res = await axios.get(`${BASE_URL}/friend-requests`, headers);
        if (res.data.status) {
          setRequests(res.data.requests.map(r => ({
            id: r._id,
            name: r.name,
            email: r.email,
            profileImg: r.profileImg,
            avatar: r.name ? r.name.charAt(0).toUpperCase() : 'U'
          })));
        }
      } else if (tab === 'suggestions') {
        const res = await axios.get(`${BASE_URL}/users/suggestions`, headers);
        if (res.data.status) {
          setSuggestions(res.data.suggestions.map(s => ({
            id: s._id,
            name: s.name,
            email: s.email,
            profileImg: s.profileImg,
            avatar: s.name ? s.name.charAt(0).toUpperCase() : 'U'
          })));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/search?q=${search}`, getHeaders());
      if (res.data.status) {
        setSearchResults(res.data.users);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const acceptRequest = async (id) => {
    try {
      const res = await axios.post(`${BASE_URL}/friend-respond`, { requestId: id, action: 'accept' }, getHeaders());
      if (res.data.success) {
        toast.success("Friend request accepted! 🎉");
        setRequests(prev => prev.filter(r => r.id !== id));
        fetchData();
      } else {
        toast.error(res.data.message || "Failed to accept request");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error accepting request");
    }
  };

  const rejectRequest = async (id) => {
    try {
      const res = await axios.post(`${BASE_URL}/friend-respond`, { requestId: id, action: 'reject' }, getHeaders());
      if (res.data.success) {
        toast.success("Friend request declined.");
        setRequests(prev => prev.filter(r => r.id !== id));
      } else {
        toast.error(res.data.message || "Failed to decline request");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Error declining request");
    }
  };

  const sendRequest = async (id) => {
    try {
      const res = await axios.post(`${BASE_URL}/friend-request/${id}`, {}, getHeaders());
      if (res.data.status) {
        toast.success("Friend request sent! ✉️");
        setSent(prev => [...prev, id]);
        // Update suggestions locally
        setSuggestions(prev => prev.filter(s => s.id !== id));
        if (search.trim()) {
          setSearchResults(prev => prev.map(u => u.id === id ? { ...u, status: 'sent' } : u));
        }
      } else {
        toast.error(res.data.msg || "Failed to send request");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error sending request");
    }
  };

  const cancelRequest = async (id) => {
    try {
      const res = await axios.delete(`${BASE_URL}/friend-request/${id}`, getHeaders());
      if (res.data.status) {
        toast.success("Friend request cancelled.");
        setSent(prev => prev.filter(sentId => sentId !== id));
        fetchData();
        if (search.trim()) {
          setSearchResults(prev => prev.map(u => u.id === id ? { ...u, status: 'none' } : u));
        }
      } else {
        toast.error(res.data.msg || "Failed to cancel request");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error cancelling request");
    }
  };

  const removeFriend = async (id) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;
    try {
      const res = await axios.delete(`${BASE_URL}/friend/${id}`, getHeaders());
      if (res.data.status) {
        toast.success("Friend removed.");
        setFriends(prev => prev.filter(f => f.id !== id));
      } else {
        toast.error(res.data.msg || "Failed to remove friend");
      }
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error removing friend");
    }
  };

  const tabs = [
    { id: 'friends', label: 'Friends', icon: <FiUsers />, count: friends.length },
    { id: 'requests', label: 'Requests', icon: <FiUserPlus />, count: requests.length },
    { id: 'suggestions', label: 'Suggestions', icon: <IoPeopleSharp />, count: null },
  ];

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      background: "#f9fafb",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      padding: "1.5rem 1rem 5rem",
      paddingBottom: "5rem",
    }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ color: "#111827", fontSize: "1.5rem", fontWeight: "900", letterSpacing: "0.5px", marginBottom: "0.25rem" }}>Friends</h1>
          <p style={{ color: "#6b7280", fontSize: "0.825rem" }}>Manage your Loopix connections</p>
        </div>

        {/* Search */}
        <div style={{ position: "relative", marginBottom: "1.25rem" }}>
          <FiSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", fontSize: "0.9rem" }} />
          <input
            type="text" placeholder="Search people by username or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "0.7rem 1rem 0.7rem 2.5rem",
              background: "#ffffff", border: "1px solid #d1d5db",
              borderRadius: "12px", color: "#111827", fontSize: "0.875rem",
              boxSizing: "border-box", outline: "none",
            }}
          />
        </div>

        {/* Tabs */}
        {!search.trim() && (
          <div style={{ display: "flex", gap: "0.375rem", marginBottom: "1.25rem", background: "#f3f4f6", padding: "0.25rem", borderRadius: "12px", border: "1px solid #e5e7eb" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.4rem",
                padding: "0.6rem 0.5rem", borderRadius: "10px", border: "none", cursor: "pointer",
                background: tab === t.id ? "linear-gradient(135deg,#dc2626,#b91c1c)" : "transparent",
                color: tab === t.id ? "#fff" : "#4b5563",
                fontSize: "0.775rem", fontWeight: "700", transition: "all 0.2s ease",
                boxShadow: tab === t.id ? "0 4px 12px rgba(220,38,38,0.15)" : "none",
              }}>
                <span style={{ fontSize: "0.875rem" }}>{t.icon}</span>
                {t.label}
                {t.count != null && t.count > 0 && (
                  <span style={{ background: tab === t.id ? "rgba(255,255,255,0.2)" : "rgba(220,38,38,0.15)", borderRadius: "6px", padding: "0 5px", fontSize: "0.65rem", fontWeight: "800", color: tab === t.id ? "#fff" : "#dc2626" }}>
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Loading spinner */}
        {loading && !search.trim() && (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <div style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid #dc2626", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          </div>
        )}

        {/* Content */}
        <AnimatePresence mode="wait">
          {search.trim() ? (
            /* Search Results View */
            <motion.div key="search-results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <h3 style={{ color: "#374151", fontSize: "0.875rem", fontWeight: "700", marginBottom: "0.5rem" }}>Search Results</h3>
              {searchResults.length === 0 ? (
                <EmptyState icon={<FiSearch />} text="No users found" sub="Try searching for another name or email" />
              ) : searchResults.map((u, i) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                  <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}, ${avatarColors[i % avatarColors.length]}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.9rem" }}>{u.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: "#111827", fontWeight: "700", fontSize: "0.875rem", margin: 0 }}>{u.name}</p>
                    <p style={{ color: "#6b7280", fontSize: "0.725rem", margin: "0.1rem 0 0" }}>{u.email}</p>
                  </div>
                  <div>
                    {u.status === 'friend' && (
                      <span style={{ fontSize: "0.75rem", color: "#16a34a", fontWeight: "700", padding: "0.4rem 0.75rem", background: "#f0fdf4", borderRadius: "8px" }}>✓ Friends</span>
                    )}
                    {u.status === 'sent' && (
                      <button onClick={() => cancelRequest(u.id)} style={{ padding: "0.45rem 0.75rem", background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px", color: "#4b5563", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <FiUserX /> Cancel Request
                      </button>
                    )}
                    {u.status === 'received' && (
                      <button onClick={() => acceptRequest(u.id)} style={{ padding: "0.45rem 0.75rem", background: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer" }}>
                        Accept Request
                      </button>
                    )}
                    {u.status === 'none' && (
                      <button onClick={() => sendRequest(u.id)} style={{ padding: "0.45rem 0.75rem", background: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <FiUserPlus /> Add Friend
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>
          ) : (
            /* Normal Tabs View */
            !loading && (
              <>
                {/* Friends Tab */}
                {tab === 'friends' && (
                  <motion.div key="friends" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {friends.length === 0 ? (
                      <EmptyState icon={<FiUsers />} text="No friends yet" sub="Add some friends from the suggestions tab!" />
                    ) : friends.map((f, i) => (
                      <motion.div key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                        <div style={{ position: "relative", flexShrink: 0 }}>
                          <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}, ${avatarColors[i % avatarColors.length]}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.9rem" }}>{f.avatar}</div>
                          {f.online && <div style={{ position: "absolute", bottom: "1px", right: "1px", width: "11px", height: "11px", background: "#22c55e", border: "2px solid #ffffff", borderRadius: "50%" }} />}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: "#111827", fontWeight: "700", fontSize: "0.875rem", margin: 0 }}>{f.name}</p>
                          <p style={{ color: "#6b7280", fontSize: "0.725rem", margin: "0.1rem 0 0", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <span style={{ color: f.online ? "#16a34a" : "#cbd5e1" }}>●</span>
                            {f.online ? "Online" : "Offline"}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                          <button onClick={() => window.location.href = '/chats'} style={{ padding: "0.4rem 0.75rem", background: "rgba(220,38,38,0.05)", border: "1px solid rgba(220,38,38,0.15)", borderRadius: "8px", color: "#dc2626", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer" }}>
                            Chat
                          </button>
                          <button onClick={() => removeFriend(f.id)} style={{ padding: "0.4rem", background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#9ca3af", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
                            <FiUserX />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Requests Tab */}
                {tab === 'requests' && (
                  <motion.div key="requests" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {requests.length === 0 ? (
                      <EmptyState icon={<FiUserPlus />} text="No pending requests" sub="You're all caught up!" />
                    ) : requests.map((r, i) => (
                      <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                        <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}, ${avatarColors[i % avatarColors.length]}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.9rem", flexShrink: 0 }}>{r.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: "#111827", fontWeight: "700", fontSize: "0.875rem", margin: 0 }}>{r.name}</p>
                          <p style={{ color: "#6b7280", fontSize: "0.725rem", margin: "0.1rem 0 0" }}>{r.email}</p>
                        </div>
                        <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => acceptRequest(r.id)}
                            style={{ padding: "0.45rem 0.75rem", background: "linear-gradient(135deg,#dc2626,#b91c1c)", border: "none", borderRadius: "8px", color: "#fff", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <FiUserCheck style={{ fontSize: "0.85rem" }} /> Accept
                          </motion.button>
                          <button onClick={() => rejectRequest(r.id)}
                            style={{ padding: "0.45rem 0.75rem", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: "8px", color: "#4b5563", fontSize: "0.75rem", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <FiUserX style={{ fontSize: "0.85rem" }} /> Decline
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}

                {/* Suggestions Tab */}
                {tab === 'suggestions' && (
                  <motion.div key="suggestions" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {suggestions.length === 0 ? (
                      <EmptyState icon={<IoPeopleSharp />} text="No suggestions" sub="All caught up!" />
                    ) : suggestions.map((s, i) => (
                      <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                        style={{ display: "flex", alignItems: "center", gap: "0.875rem", padding: "0.875rem 1rem", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "14px", boxShadow: "0 2px 4px rgba(0,0,0,0.01)" }}>
                        <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: `linear-gradient(135deg, ${avatarColors[i % avatarColors.length]}, ${avatarColors[i % avatarColors.length]}88)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "800", fontSize: "0.8rem", flexShrink: 0 }}>{s.avatar}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ color: "#111827", fontWeight: "700", fontSize: "0.875rem", margin: 0 }}>{s.name}</p>
                          <p style={{ color: "#6b7280", fontSize: "0.725rem", margin: "0.1rem 0 0" }}>{s.email}</p>
                        </div>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => sent.includes(s.id) ? cancelRequest(s.id) : sendRequest(s.id)}
                          style={{
                            padding: "0.45rem 0.75rem", border: "none", borderRadius: "8px",
                            background: sent.includes(s.id) ? "#f3f4f6" : "linear-gradient(135deg,#dc2626,#b91c1c)",
                            color: sent.includes(s.id) ? "#4b5563" : "#fff",
                            fontSize: "0.75rem", fontWeight: "700", cursor: "pointer",
                            display: "flex", alignItems: "center", gap: "0.3rem", flexShrink: 0,
                            boxShadow: sent.includes(s.id) ? "none" : "0 4px 12px rgba(220,38,38,0.15)",
                            transition: "all 0.2s ease",
                          }}>
                          {sent.includes(s.id) ? <FiUserX style={{ fontSize: "0.85rem" }} /> : <FiUserPlus style={{ fontSize: "0.85rem" }} />}
                          {sent.includes(s.id) ? "Cancel" : "Add Friend"}
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </>
            )
          )}
        </AnimatePresence>
      </div>

      <style>{`
        input::placeholder { color: #9ca3af !important; }
        input:focus { outline: none !important; border-color: rgba(220,38,38,0.4) !important; }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div style={{ textAlign: "center", padding: "3rem 1rem", color: "#9ca3af" }}>
      <div style={{ fontSize: "3rem", marginBottom: "0.75rem", color: "rgba(220,38,38,0.15)" }}>{icon}</div>
      <p style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4b5563" }}>{text}</p>
      <p style={{ fontSize: "0.775rem", marginTop: "0.25rem" }}>{sub}</p>
    </div>
  );
}
