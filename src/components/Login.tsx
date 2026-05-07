import React, { useState } from "react";
import { motion } from "motion/react";
import { LogIn, Lock, User, Activity, Moon, Sun } from "lucide-react";
import { SmokeBackground } from "./SmokeBackground";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, darkMode, setDarkMode }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter both username and password");
      return;
    }
    onLogin(username, password);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 relative overflow-hidden ${darkMode ? "bg-[#020617]" : "bg-slate-50"}`}>
      {/* Smoke Animation Background */}
      <SmokeBackground />

      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`p-3 rounded-2xl transition-all shadow-lg backdrop-blur-md ${
            darkMode ? "bg-slate-800/50 text-amber-400 border border-slate-700/50" : "bg-white/50 text-slate-600 border border-slate-200/50"
          }`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl border transition-all duration-500 relative z-10 backdrop-blur-xl ${
          darkMode ? "bg-slate-900/80 border-slate-800/50" : "bg-white/80 border-slate-100/50"
        }`}
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div 
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 bg-[#c0392b] rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-red-900/40 relative"
          >
            <Activity className="w-12 h-12 text-white" />
            <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl animate-pulse" />
          </motion.div>
          <h1 className={`text-3xl font-black tracking-tighter text-center ${darkMode ? "text-white" : "text-slate-900"}`}>
            MAMBUSAO MDRRMO
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2 opacity-80">Patient Care Records System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Username
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-slate-400 group-focus-within:text-[#c0392b] transition-colors" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full pl-11 pr-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all border ${
                  darkMode 
                    ? "bg-slate-800/50 border-slate-700 text-white focus:border-[#c0392b] focus:ring-4 focus:ring-[#c0392b]/10" 
                    : "bg-slate-50/50 border-slate-200 text-slate-900 focus:border-[#c0392b] focus:ring-4 focus:ring-[#c0392b]/10"
                }`}
                placeholder="Enter username"
              />
            </div>
          </div>

          <div>
            <label className={`block text-[10px] font-black uppercase tracking-widest mb-2 ml-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-[#c0392b] transition-colors" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full pl-11 pr-4 py-4 rounded-2xl text-sm font-bold outline-none transition-all border ${
                  darkMode 
                    ? "bg-slate-800/50 border-slate-700 text-white focus:border-[#c0392b] focus:ring-4 focus:ring-[#c0392b]/10" 
                    : "bg-slate-50/50 border-slate-200 text-slate-900 focus:border-[#c0392b] focus:ring-4 focus:ring-[#c0392b]/10"
                }`}
                placeholder="Enter password"
              />
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-bold text-red-500 text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-[#c0392b] hover:bg-[#922b21] text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-red-900/30 flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
            <span className="relative z-10">Sign In to System</span>
          </button>
        </form>

        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] opacity-60">
            Authorized Personnel Only
          </p>
        </div>
      </motion.div>
      
      {/* Decorative elements */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#c0392b]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
    </div>
  );
};
