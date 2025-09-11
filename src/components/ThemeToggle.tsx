"use client";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle(){
  const [theme, setTheme] = useState<"light"|"dark">("light");

  useEffect(() => {
    // init dari localStorage atau prefers-color-scheme
    const saved = typeof window !== "undefined" ? localStorage.getItem("theme") as any : null;
    let t: "light"|"dark" = saved === "dark" ? "dark" : "light";
    if (!saved && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) t = "dark";
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
  }, []);

  function toggle(){
    const t = theme === "light" ? "dark" : "light";
    setTheme(t);
    if (typeof window !== "undefined") localStorage.setItem("theme", t);
    document.documentElement.setAttribute("data-theme", t);
  }

  return (
    <button className="theme-toggle" aria-label="Toggle theme" onClick={toggle}>
      {theme === "light" ? <Moon size={18}/> : <Sun size={18}/>}
    </button>
  );
}