import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaEnvelope, FaGenderless, FaIdCard, FaCamera, FaEdit, FaCheck, FaTimes, FaUsers, FaArrowLeft } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import BASE_URL from '../../global_url.js';

const avatarColors = ["#dc2626", "#7c3aed", "#0891b2", "#059669", "#d97706", "#db2777"];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', bio: '', gender: 'Male' });
  const [updating, setUpdating] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem('auth_token');
    return { headers: { 'x-api-key': token } };
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/profile`, getHeaders());
      if (res.data.status) {
        setUser(res.data.user);
        setFormData({
          name: res.data.user.name || '',
          bio: res.data.user.bio || '',
          gender: res.data.user.gender || 'Male'
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to fetch profile info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await axios.put(`${BASE_URL}/profile`, formData, getHeaders());
      if (res.data.status) {
        toast.success("Profile updated successfully! ✨");
        setUser(res.data.user);
        // Sync with localStorage
        const storedUser = JSON.parse(localStorage.getItem('loopix_user')) || {};
        const newUser = { ...storedUser, name: res.data.user.name, gender: res.data.user.gender, profileImg: res.data.user.profileImg };
        localStorage.setItem('loopix_user', JSON.stringify(newUser));
        setIsEditing(false);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f9fafb"
      }}>
        <div style={{
          display: "inline-block",
          width: "42px",
          height: "42px",
          border: "4px solid #dc2626",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite"
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const avatarChar = user?.name ? user.name.charAt(0).toUpperCase() : 'U';
  const colorIndex = user?.name ? user.name.charCodeAt(0) % avatarColors.length : 0;
  const avatarBg = avatarColors[colorIndex];

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      background: "#f9fafb",
      padding: "2rem 1rem 6rem",
      fontFamily: "'Inter','Segoe UI',sans-serif",
    }}>
      <div style={{ maxWidth: "600px", margin: "0 auto" }}>
        
        {/* Header navigation back */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.5rem" }}>
          <button 
            onClick={() => window.history.back()}
            style={{
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
              color: "#374151",
              fontSize: "0.85rem",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "#f3f4f6"}
            onMouseOut={(e) => e.currentTarget.style.background = "#ffffff"}
          >
            <FaArrowLeft />
          </button>
          <span style={{ fontSize: "0.9rem", fontWeight: "700", color: "#6b7280" }}>Back</span>
        </div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.03)",
            overflow: "hidden"
          }}
        >
          {/* Banner cover */}
          <div style={{
            height: "120px",
            background: "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
            position: "relative"
          }}>
            <span style={{
              position: "absolute",
              bottom: "10px",
              right: "20px",
              fontSize: "2rem",
              fontWeight: 900,
              color: "rgba(255,255,255,0.08)",
              letterSpacing: "4px"
            }}>LOOPIX</span>
          </div>

          <div style={{ padding: "0 2rem 2.5rem", position: "relative" }}>
            
            {/* Avatar & Edit Actions */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "-50px",
              marginBottom: "1.5rem"
            }}>
              <div style={{ position: "relative" }}>
                <div style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${avatarBg}, ${avatarBg}88)`,
                  border: "5px solid #ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2.2rem",
                  fontWeight: "800",
                  color: "#ffffff",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.08)"
                }}>
                  {avatarChar}
                </div>
              </div>

              {!isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setIsEditing(true)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "0.5rem 1.2rem",
                    borderRadius: "10px",
                    background: "rgba(220, 38, 38, 0.05)",
                    border: "1px solid rgba(220, 38, 38, 0.15)",
                    color: "#dc2626",
                    fontWeight: "700",
                    fontSize: "0.8rem",
                    cursor: "pointer"
                  }}
                >
                  <FaEdit /> Edit Profile
                </motion.button>
              ) : null}
            </div>

            {/* Profile Content */}
            <AnimatePresence mode="wait">
              {!isEditing ? (
                /* Profile View Mode */
                <motion.div
                  key="profile-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
                >
                  <div>
                    <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#111827", margin: 0 }}>{user?.name}</h2>
                    <p style={{ fontSize: "0.85rem", color: "#6b7280", marginTop: "2px" }}>{user?.email}</p>
                  </div>

                  {/* Bio block */}
                  <div style={{
                    background: "#f9fafb",
                    padding: "1rem",
                    borderRadius: "14px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", color: "#9ca3af", margin: "0 0 6px" }}>Bio</h3>
                    <p style={{ fontSize: "0.875rem", color: "#374151", margin: 0, lineHeight: 1.5, fontStyle: user?.bio ? "normal" : "italic" }}>
                      {user?.bio || "No bio added yet. Tell people something about yourself!"}
                    </p>
                  </div>

                  {/* Extra Details Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "0.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0.75rem 1rem", background: "#f3f4f6", borderRadius: "12px" }}>
                      <FaUsers style={{ color: "#dc2626", fontSize: "1rem" }} />
                      <div>
                        <p style={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 700, margin: 0 }}>FRIENDS</p>
                        <p style={{ fontSize: "0.9rem", color: "#111827", fontWeight: 800, margin: 0 }}>{user?.friends?.length || 0}</p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "0.75rem 1rem", background: "#f3f4f6", borderRadius: "12px" }}>
                      <FaGenderless style={{ color: "#7c3aed", fontSize: "1.1rem" }} />
                      <div>
                        <p style={{ fontSize: "0.65rem", color: "#9ca3af", fontWeight: 700, margin: 0 }}>GENDER</p>
                        <p style={{ fontSize: "0.9rem", color: "#111827", fontWeight: 800, margin: 0 }}>{user?.gender || "Not specified"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Joining details */}
                  <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: "1.25rem", display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#9ca3af", fontWeight: 600 }}>
                    <span>Account Verified: {user?.user?.isVerify ? "Yes ✓" : "No"}</span>
                    <span>Joined: {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span>
                  </div>
                </motion.div>
              ) : (
                /* Profile Edit Mode */
                <motion.form
                  key="profile-edit"
                  onSubmit={handleUpdate}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
                >
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#111827", margin: 0 }}>Edit Your Info</h3>
                  
                  {/* Name field */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563" }}>Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{
                        padding: "0.65rem 1rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "10px",
                        fontSize: "0.85rem",
                        color: "#111827",
                        outline: "none"
                      }}
                    />
                  </div>

                  {/* Gender Select */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563" }}>Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      style={{
                        padding: "0.65rem 1rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "10px",
                        fontSize: "0.85rem",
                        color: "#111827",
                        background: "#fff",
                        outline: "none"
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Bio textarea */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#4b5563" }}>Bio</label>
                    <textarea
                      rows={4}
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      style={{
                        padding: "0.65rem 1rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "10px",
                        fontSize: "0.85rem",
                        color: "#111827",
                        outline: "none",
                        resize: "none"
                      }}
                    />
                  </div>

                  {/* Edit buttons */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={updating}
                      style={{
                        flex: 1,
                        padding: "0.7rem 1.5rem",
                        border: "none",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                        color: "#ffffff",
                        fontWeight: "700",
                        fontSize: "0.825rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px",
                        boxShadow: "0 4px 12px rgba(220,38,38,0.2)"
                      }}
                    >
                      {updating ? (
                        <span style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid #fff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                      ) : (
                        <FaCheck />
                      )}
                      Save Changes
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ name: user.name, bio: user.bio, gender: user.gender });
                        setIsEditing(false);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.7rem 1.5rem",
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        background: "#f9fafb",
                        color: "#4b5563",
                        fontWeight: "700",
                        fontSize: "0.825rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "6px"
                      }}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
