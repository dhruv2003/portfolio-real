import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Download, Send, Terminal } from "lucide-react";
import { Link } from "react-router";
import { trackEvent } from "../../utils/analytics";
import { fireConfetti } from "../../utils/confetti";

type TerminalLine = {
  prompt?: string;
  output: string[];
};

const TERMINAL_PROMPT = "visitor@portfolio:~$";

const commands: Record<string, string[]> = {
  help: [
    "Available commands:",
    "whoami        - short intro",
    "skills        - core technical toolkit",
    "projects      - highlighted builds",
    "experience    - professional focus",
    "contact       - ways to reach me",
    "download      - download resume PDF",
    "kubectl pods  - inspect portfolio services",
    "docker ps     - inspect portfolio containers",
    "clear         - clear terminal",
  ],
  whoami: [
    "Dhruv Bhagatkar",
    "Backend + infrastructure focused engineer who likes production debugging, automation, observability, and shipping reliable systems.",
  ],
  skills: [
    "Backend: Java, Python, TypeScript, APIs, integrations",
    "Infra: Kubernetes, Docker, Linux, CI/CD, Bash automation",
    "Systems: Oracle/WebLogic, JNDI, multi-data-source setups, production support",
    "Exploring: AI tooling, Web3, system design, developer productivity",
  ],
  projects: [
    "SSO/SAML authentication app - enterprise auth flows and validation behavior",
    "WebLogic monitoring tooling - operational visibility for server environments",
    "Log pruning + structured logging - reliability and disk/CPU improvements",
    "Data scraper - distributed scraping and backend APIs",
    "FitterCoin - Web3 fitness rewards concept",
  ],
  experience: [
    "Associate Consultant / DevOps Engineer focus:",
    "- Backend and platform integrations",
    "- Production issue debugging",
    "- Deployment and release automation",
    "- Authentication architecture",
    "- Observability and operational tooling",
  ],
  contact: [
    "Email: bhagatkardhruv2003@gmail.com",
    "GitHub: https://github.com/dhruv2003",
    "LinkedIn: https://www.linkedin.com/in/dhruv-bhagatkar-1b267995",
  ],
  "kubectl pods": [
    "NAME                         READY   STATUS      RESTARTS   AGE",
    "portfolio-web-7d9f           1/1     Running     0          99d",
    "resume-service-42x           1/1     Running     0          99d",
    "chat-terminal-api            1/1     Running     1          42d",
    "hire-dhruv-job               0/1     Pending     0          now",
  ],
  "docker ps": [
    "CONTAINER ID   IMAGE                  STATUS",
    "db2003         dhruv/portfolio:latest Up 99 days",
    "c0ffee         dhruv/resume:stable    Up 99 days",
  ],
};

export function TerminalResume() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<TerminalLine[]>([
    {
      output: [
        "DhruvOS terminal resume booted.",
        "Type 'help' to explore experience, skills, projects, and contact info.",
      ],
    },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history]);

  const appendHistory = (raw: string, output: string[]) => {
    setHistory((prev) => [...prev, { prompt: `${TERMINAL_PROMPT} ${raw}`, output }]);
    setInput("");
  };

  const runCommand = () => {
    const raw = input.trim();
    if (!raw) return;
    const command = raw.toLowerCase();

    trackEvent("terminal_resume_command", { command });

    if (command === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    if (command === "download") {
      const a = document.createElement("a");
      a.href = "/Dhruv_Bhagatkar_Resume.pdf";
      a.download = "Dhruv_Bhagatkar_Resume.pdf";
      a.click();
      appendHistory(raw, ["Downloading resume PDF..."]);
      return;
    }

    if (command === "sudo hire dhruv") {
      fireConfetti();
      appendHistory(raw, [
        "Permission granted.",
        "Recruiter pipeline initialized.",
        "Next step: send an email or connect on LinkedIn.",
      ]);
      return;
    }

    const output = commands[command] || [
      `Command not found: ${raw}`,
      "Try 'help', 'whoami', 'skills', 'projects', 'kubectl pods', 'docker ps', or 'download'.",
    ];

    appendHistory(raw, output);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-black font-sans selection:bg-[#FFC900] selection:text-black">
      <header className="sticky top-0 z-50 bg-white border-b-4 border-black px-4 sm:px-6 lg:px-12 py-3 sm:py-4 flex justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" aria-label="Back to home" className="bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="font-black text-sm sm:text-xl uppercase tracking-widest bg-[#FFC900] px-3 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            Terminal Resume //
          </div>
        </div>
        <a href="/Dhruv_Bhagatkar_Resume.pdf" download onClick={() => trackEvent("resume_download", { source: "terminal_resume" })} className="hidden sm:inline-flex items-center gap-2 font-black uppercase bg-[#38BDF8] px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
          <Download className="w-4 h-4" /> Resume
        </a>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-12 py-10 sm:py-16">
        <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="inline-flex items-center gap-2 bg-black text-white border-4 border-black px-4 py-2 font-black uppercase tracking-widest shadow-[6px_6px_0px_0px_rgba(255,201,0,1)] mb-6">
            <Terminal className="w-5 h-5" /> Interactive CLI
          </div>
          <h1 className="text-5xl sm:text-7xl font-black uppercase leading-none tracking-tighter max-w-4xl">
            Explore my resume like a production shell.
          </h1>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-black text-[#7CFF6B] border-4 border-black shadow-[12px_12px_0px_0px_rgba(255,201,0,1)] overflow-hidden">
          <div className="bg-[#FFC900] text-black border-b-4 border-black px-4 py-3 flex items-center justify-between">
            <span className="font-black uppercase tracking-widest">dhruv-os</span>
            <div className="flex gap-2">
              <span className="w-4 h-4 rounded-full bg-[#FF90E8] border-2 border-black" />
              <span className="w-4 h-4 rounded-full bg-[#38BDF8] border-2 border-black" />
              <span className="w-4 h-4 rounded-full bg-white border-2 border-black" />
            </div>
          </div>
          <div className="p-4 sm:p-6 font-mono min-h-[520px] max-h-[65vh] overflow-y-auto" onClick={() => inputRef.current?.focus()}>
            <div role="log" aria-live="polite" aria-relevant="additions text">
            {history.map((entry, idx) => (
              <div key={idx} className="mb-4">
                {entry.prompt && <p className="text-white"><span className="text-[#38BDF8]">{entry.prompt}</span></p>}
                {entry.output.map((line, lineIdx) => <p key={lineIdx} className="leading-relaxed whitespace-pre-wrap">{line}</p>)}
              </div>
            ))}
            </div>
            <div className="flex items-center gap-2 text-white">
              <span className="text-[#38BDF8] shrink-0">{TERMINAL_PROMPT}</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runCommand()}
                autoFocus
                className="bg-transparent outline-none flex-1 text-[#7CFF6B] min-w-0"
                aria-label="Terminal command"
              />
              <button onClick={runCommand} aria-label="Run terminal command" className="sm:hidden bg-[#FFC900] text-black border-2 border-black p-1">
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div ref={bottomRef} />
          </div>
        </motion.section>
      </main>
    </div>
  );
}
