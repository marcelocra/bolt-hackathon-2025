import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router";
import { LogOut, Settings, HelpCircle, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

/**
 * User profile dropdown component with sign out and other profile actions
 */

export const UserProfile: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Update button position when dropdown opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const getInitials = (email: string): string => {
    return email.charAt(0).toUpperCase();
  };

  if (!user) return null;

  // Calculate dropdown position
  const getDropdownStyle = (): React.CSSProperties => {
    if (!buttonRect) return {};

    const isMobile = window.innerWidth < 640; // sm breakpoint

    if (isMobile) {
      // On mobile, center the dropdown horizontally
      return {
        position: "fixed",
        top: buttonRect.bottom + 8,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 99999,
      };
    } else {
      // On desktop, align to the right edge of the button
      return {
        position: "fixed",
        top: buttonRect.bottom + 8,
        right: window.innerWidth - buttonRect.right,
        zIndex: 99999,
      };
    }
  };

  const dropdownContent =
    isOpen && buttonRect ? (
      <div
        className="bg-slate-800 border border-slate-700/50 rounded-lg shadow-2xl min-w-56 max-w-[calc(100vw-2rem)] sm:max-w-none"
        style={getDropdownStyle()}
      >
        <div className="py-2">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {getInitials(user.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user.email}
                </p>
                <p className="text-slate-400 text-xs">Personal Account</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/settings");
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-3"
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/help");
              }}
              className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-3"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Help & Support</span>
            </button>

            {/* Divider */}
            <div className="my-1 border-t border-slate-700/50"></div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:text-red-300 hover:bg-slate-700/50 transition-colors duration-200 flex items-center space-x-3"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    ) : null;

  return (
    <>
      {/* Profile button */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-white transition-colors duration-200 rounded-lg hover:bg-slate-700/30"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
          {getInitials(user.email)}
        </div>

        {/* Email (hidden on mobile) */}
        <span className="text-sm truncate max-w-32 lg:max-w-none hidden sm:inline">
          {user.email}
        </span>

        {/* Dropdown arrow */}
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Render dropdown using portal to ensure it appears above everything */}
      {dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  );
};

export default UserProfile;
