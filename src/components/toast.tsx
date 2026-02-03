"use client";

import { Component, ReactElement, useEffect } from "react";
import Icon from "./Icon";

type ToastVariant = "success" | "info" | "error";

const styles = {
  toast: {
    position: "fixed",
    top: "40px",
    right: "20px",
    width:"max-content",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: "6px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
    zIndex: 9000,
    fontSize: "14px",
  } as CSSStyleValue,
  messageStyle:{
    fontSize: "14px",
    color: "#fff"
  },
  success: {
    background: "#16a34a",
  },
  info: {
    background: "#2563eb",
  },
  error: {
    background: "#dc2626",
  },
  iconBox: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
};

const icons: Record<ToastVariant, ReactElement> = {
  success: <Icon name="bx-check" color="#fff" size="24px"/>,
  info: <Icon name="bx-info" color="#fff" size="24px"/>,
  error: <Icon name="bx-error" color="#fff" size="24px"/>,
};

type ToastProps = {
  message: string;
  show: boolean;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
};

const Toast:React.FC<ToastProps> = ({message,show,variant = "info",onClose,duration = 3000,}: ToastProps) => {
    
    useEffect(() => {
        if (!show) return;

        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [show, duration, onClose]);

    console.log("show",show)

    if (!show) return null;

    return (
        <div style={{ ...styles.toast, ...styles[variant] }}>
            <span style={styles.iconBox}>{icons[variant]}</span>
            <span style={styles.messageStyle}>{message}</span>
        </div>
    );
}

export default Toast

