// Every command the /terminal shell understands. Commands with a `summary` show up in `help`
// and in Tab completion; the rest are easter eggs for the curious.
import { fireConfetti } from "../../utils/confetti";
import { activateHackerMode } from "../../utils/hackerMode";
import { accent, err, isThemeName, muted, ok, pre, THEMES, warn, type Command, type Ctx, type LineInput, type Mode } from "./engine";
import { startIncident } from "./incident";

const RESUME_PDF = "/Dhruv_Bhagatkar_Resume.pdf";
const ORACLE_START = new Date(2025, 6, 1);
const CAREER_START = new Date(2025, 0, 1);

const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
const clock = (d = new Date()) => d.toTimeString().slice(0, 8);
const daysSince = (start: Date) => Math.floor((Date.now() - start.getTime()) / 86_400_000);

function durationSince(start: Date) {
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months--;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [years && `${years} year${years > 1 ? "s" : ""}`, rest && `${rest} month${rest > 1 ? "s" : ""}`].filter(Boolean);
  return parts.join(", ") || "less than a month";
}

function downloadResume() {
  const a = document.createElement("a");
  a.href = RESUME_PDF;
  a.download = "Dhruv_Bhagatkar_Resume.pdf";
  a.click();
}

function cowsay(text: string) {
  const words = text.slice(0, 120).split(/\s+/).filter(Boolean);
  const rows: string[] = [];
  for (const word of words) {
    const last = rows[rows.length - 1];
    if (last !== undefined && (last + " " + word).length <= 36) rows[rows.length - 1] = last + " " + word;
    else rows.push(word.slice(0, 36));
  }
  if (!rows.length) rows.push("moo.");
  const width = Math.max(...rows.map((r) => r.length));
  const pad = (r: string) => r.padEnd(width);
  const body =
    rows.length === 1
      ? [`< ${pad(rows[0])} >`]
      : rows.map((r, i) => {
          const [l, rt] = i === 0 ? ["/", "\\"] : i === rows.length - 1 ? ["\\", "/"] : ["|", "|"];
          return `${l} ${pad(r)} ${rt}`;
        });
  return [
    " " + "_".repeat(width + 2),
    ...body,
    " " + "-".repeat(width + 2),
    "        \\   ^__^",
    "         \\  (oo)\\_______",
    "            (__)\\       )\\/\\",
    "                ||----w |",
    "                ||     ||",
  ].join("\n");
}

function describeVisitor() {
  const ua = navigator.userAgent;
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "a mysterious browser";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS X/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "an unknown OS";
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return { browser, os, tz, screen: `${window.screen.width}×${window.screen.height}` };
}

const FORTUNES = [
  "\"It works on my machine.\" — every developer, ever",
  "There's no place like 127.0.0.1",
  "Never deploy on a Friday. (I have deployed on a Friday.)",
  "99 little bugs in the code. Take one down, patch it around. 127 little bugs in the code.",
  "Weeks of coding can save you hours of planning.",
  "The cloud is just someone else's computer. Mine is on fire.",
  "There are 2 hard problems in CS: cache invalidation, naming things, and off-by-one errors.",
  "Logs don't lie. Developers do. — log archaeologist proverb",
  "If it hurts, do it more often. — continuous delivery",
  "A good engineer reads the error message. A great one reads it twice.",
  "rm -rf is not a backup strategy.",
  "It's not DNS. There's no way it's DNS. ... It was DNS.",
];

const LOG_LINES: LineInput[] = [
  "INFO  coffee.service: refilled (level 100%)",
  warn("WARN  coffee.service: level below 20%, consider chai"),
  "INFO  deploy: rolled out portfolio v2.0 to prod (on a friday. brave.)",
  ok("INFO  auth-gateway: SAML assertion validated ✓"),
  muted("DEBUG brain: thinking about system design again"),
  err("ERROR sleep.d: process killed by pager"),
  ok("INFO  logger: JSON logs now 6× smaller than yesterday's me"),
  warn("WARN  calendar: 3 back-to-back meetings, context switch overhead high"),
  "INFO  kubectl: all pods Running (for now)",
  accent("INFO  recruiter-detector: visitor is reading the logs, interest likely"),
  muted("DEBUG side-projects: new idea spawned. ideas finished: 0"),
  err("ERROR works-on-my-machine: machine not found in prod"),
  "INFO  weblogic: server healthy. nobody knows why. nobody touches it.",
  warn("WARN  dns: it's not DNS. there's no way it's DNS."),
  err("ERROR dns: it was DNS."),
  ok("INFO  jenkins: build #1337 passed on the first try (suspicious)"),
];

// Classic `sl` steam locomotive
const TRAIN = [
  "      ====        ________                ___________ ",
  "  _D _|  |_______/        \\__I_I_____===__|_________| ",
  "   |(_)---  |   H\\________/ |   |        =|___ ___|   ",
  "   /     |  |   H  |  |     |   |         ||_| |_||   ",
  "  |      |  |   H  |__--------------------| [___] |   ",
  "  | ________|___H__/__|_____/[][]~\\_______|       |   ",
  "  |/ |   |-----------I_____I [][] []  D   |=======|__ ",
  "__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ",
  " |/-=|___|=    ||    ||    ||    |_____/~\\___/        ",
  "  \\_/      \\O=====O=====O=====O_/      \\_/            ",
];

const NEOFETCH_LOGO = [
  "  ██████╗  ",
  "  ██╔══██╗ ",
  "  ██║  ██║ ",
  "  ██║  ██║ ",
  "  ██████╔╝ ",
  "  ╚═════╝  ",
];

function vimMode(): Mode {
  let attempts = 0;
  const mode: Mode = {
    prompt: "vim>",
    onInput(raw, ctx) {
      const input = raw.trim();
      attempts++;
      if (input === ":q!" || input === ":qa!") {
        ctx.setMode(null);
        ctx.print(ok(`you escaped vim${attempts > 1 ? ` in ${attempts} tries` : " on the first try"}. that puts you ahead of most developers. 🏆`));
        return;
      }
      if (input === ":q" || input === ":qa") ctx.print(err("E37: No write since last change (add ! to override)"));
      else if ([":w", ":wq", ":x", ":wq!", "zz", "ZZ"].includes(input)) ctx.print(err("E212: Can't open file for writing. it's a portfolio, not a text file."));
      else if (["exit", "quit", "q", "help", "esc", "escape"].includes(input.toLowerCase())) ctx.print(warn("that's not how vim works 🙂"));
      else ctx.print(warn(pick(["-- INSERT -- ... no wait, you're not in insert mode.", "beep.", "you typed something. vim ignored it. classic.", "E492: Not an editor command. (it's barely an editor)"])));
      if (attempts >= 3) ctx.print(muted("hint: type :q! and press Enter"));
    },
    onInterrupt(ctx) {
      ctx.print(muted("Type  :qa!  and press <Enter> to abandon all changes and exit Vim"));
    },
  };
  return mode;
}

function openVim(ctx: Ctx) {
  ctx.print(
    pre(["~", "~          VIM - Vi IMproved (DhruvOS edition)", "~", "~          you are now trapped.", "~          there is no escape.", "~"].join("\n"), "muted"),
  );
  ctx.setMode(vimMode());
}

export const commands: Command[] = [
  // ── core ──────────────────────────────────────────────
  {
    name: "help",
    group: "core",
    summary: "list commands",
    run(ctx) {
      const row = (c: Command) => pre(`  ${c.name.padEnd(24)}${c.summary}`);
      ctx.print(
        "Available commands:",
        ...commands.filter((c) => c.group === "core" && c.summary).map(row),
        "",
        accent("Fun stuff:"),
        ...commands.filter((c) => c.group === "fun" && c.summary).map(row),
        "",
        muted("tips: ↑/↓ history · Tab completes · Ctrl+L clears · some commands are hidden 👀"),
      );
    },
  },
  {
    name: "whoami",
    group: "core",
    summary: "short intro",
    run(ctx) {
      ctx.print(
        "Dhruv Bhagatkar",
        "Backend + infrastructure focused engineer who likes production debugging, automation, observability, and shipping reliable systems.",
        muted("(curious who *you* are? try 'who')"),
      );
    },
  },
  {
    name: "skills",
    group: "core",
    summary: "core technical toolkit",
    run(ctx) {
      ctx.print(
        "Backend: Java, Python, TypeScript, APIs, integrations",
        "Infra: Kubernetes, Docker, Linux, CI/CD, Bash automation",
        "Systems: Oracle/WebLogic, JNDI, multi-data-source setups, production support",
        "Exploring: AI tooling, Web3, system design, developer productivity",
      );
    },
  },
  {
    name: "projects",
    group: "core",
    summary: "highlighted builds",
    run(ctx) {
      ctx.print(
        "SSO/SAML authentication app - enterprise auth flows and validation behavior",
        "WebLogic monitoring tooling - operational visibility for server environments",
        "Log pruning + structured logging - reliability and disk/CPU improvements",
        "Data scraper - distributed scraping and backend APIs",
        "FitterCoin - Web3 fitness rewards concept",
      );
    },
  },
  {
    name: "experience",
    group: "core",
    summary: "professional focus",
    run(ctx) {
      ctx.print(
        "Associate Consultant / DevOps Engineer focus:",
        "- Backend and platform integrations",
        "- Production issue debugging",
        "- Deployment and release automation",
        "- Authentication architecture",
        "- Observability and operational tooling",
      );
    },
  },
  {
    name: "contact",
    group: "core",
    summary: "ways to reach me",
    run(ctx) {
      ctx.print(
        "Email: bhagatkardhruv2003@gmail.com",
        "GitHub: https://github.com/dhruv2003",
        "LinkedIn: https://www.linkedin.com/in/dhruv-bhagatkar-1b267995",
      );
    },
  },
  {
    name: "download",
    group: "core",
    summary: "download resume PDF",
    run(ctx) {
      downloadResume();
      ctx.print("Downloading resume PDF...");
    },
  },
  {
    name: "history",
    group: "core",
    summary: "commands you've typed",
    run(ctx) {
      const planted = [
        "git push --force          # on main. it was fine. probably.",
        "rm -rf node_modules && npm install   # again",
        "kubectl delete pod --all  # \"they'll come back\"",
        "sudo !!",
      ];
      const all = [...planted, ...ctx.history];
      ctx.print(pre(all.map((cmd, i) => `${String(i + 1).padStart(5)}  ${cmd}`).join("\n")));
    },
  },
  {
    name: "clear",
    aliases: ["cls"],
    group: "core",
    summary: "clear the screen",
    run(ctx) {
      ctx.clear();
    },
  },

  // ── fun (listed in help) ──────────────────────────────
  {
    name: "neofetch",
    aliases: ["fastfetch", "screenfetch"],
    group: "fun",
    summary: "system info, DhruvOS edition",
    run(ctx) {
      const info = [
        "dhruv@portfolio",
        "---------------",
        "OS: DhruvOS 2.0 (production-hardened)",
        "Host: Oracle Financial Services Software",
        "Kernel: backend-6.x-devops",
        `Uptime: ${durationSince(ORACLE_START)} at Oracle`,
        "Shell: zsh + caffeine",
        "Packages: java, python, kubernetes, docker, bash",
        "Terminal: you're looking at it",
        "CPU: overthinking @ 4.2GHz",
        "Memory: remembers every prod incident",
        `Theme: ${ctx.theme}`,
      ];
      const rows = info.map((line, i) => `${NEOFETCH_LOGO[i] ?? " ".repeat(NEOFETCH_LOGO[0].length)}  ${line}`);
      ctx.print(pre(rows.join("\n")));
    },
  },
  {
    name: "git log",
    group: "fun",
    summary: "my career, as commits",
    run(ctx) {
      ctx.print(
        accent("d4a02ec (HEAD -> main, origin/prod) chore: still learning, still shipping"),
        "a6c0ffe fix(logging): structured JSON logs. BLOB size 6× smaller, CPU -20%",
        "5a4fe11 feat(auth): SSO/SAML authentication app, built from scratch",
        "f00d123 fix: survived another release friday",
        "e7ab0b1 feat: won ETH Global New Delhi with FitterCoin ($3.5K) (Sep 2025)",
        "0bad1ee feat: joined Oracle Financial Services as Associate Consultant (Jul 2025)",
        "9c4d2e1 chore: graduated, B.Tech EXTC @ K. J. Somaiya (2025)",
        "3b9f7a0 feat: IT intern @ Affix Center, cloud migration (Jan 2025)",
        "91e6a7b perf(scraper): +91.67% faster, Redis job queue (Jan 2025)",
        "7d3e0c2 feat: Medicare IoT prototype, custom PCB (Oct 2024)",
        "1a2b3c4 init: started B.Tech (2021)",
        muted("0000001 initial commit: hello, world"),
      );
    },
  },
  {
    name: "tail -f",
    aliases: ["tail"],
    group: "fun",
    summary: "live production logs",
    run(ctx) {
      const lines: LineInput[] = [];
      const live = ctx.live([muted("==> /var/log/dhruv.log <==  (press any key to stop)")], {
        stopOnKey: true,
        onInterrupt: () => ["^C"],
      });
      const emit = () => {
        const next = pick(LOG_LINES);
        const text = typeof next === "string" ? next : next.text;
        const line = typeof next === "string" ? `${clock()} ${text}` : { ...next, text: `${clock()} ${text}` };
        lines.push(line);
        if (lines.length > 14) lines.shift();
        live.set([muted("==> /var/log/dhruv.log <==  (press any key to stop)"), ...lines]);
      };
      emit();
      live.every(700, emit);
    },
  },
  {
    name: "uptime",
    group: "fun",
    summary: "how long I've been running",
    run(ctx) {
      ctx.print(
        `${clock()} up ${daysSince(ORACLE_START)} days (at Oracle), 1 user (you), load average: coffee, coffee, chai`,
        muted(`career uptime: ${durationSince(CAREER_START)} · incidents survived: yes`),
      );
    },
  },
  {
    name: "top",
    aliases: ["htop", "btop"],
    group: "fun",
    summary: "what's eating my CPU",
    run(ctx) {
      ctx.print(
        pre(
          [
            `top - ${clock()} up ${daysSince(ORACLE_START)} days, 1 user, load average: 0.99, 0.98, 1.00 (caffeinated)`,
            "Tasks: 8 total, 1 running, 6 sleeping, 1 zombie",
            "",
            "  PID USER    %CPU  %MEM  COMMAND",
            " 1337 dhruv   98.7  42.0  overthinking.service",
            " 2003 dhruv   45.1  12.3  system-design-daydreams",
            " 4040 dhruv   31.0   8.8  debug-prod-at-3am",
            " 8080 dhruv   12.0   6.6  side-projects (12 threads, 0 finished)",
            " 5432 dhruv    9.9   4.2  oracle-db-connection-pool",
            "  443 dhruv    6.0   2.0  linkedin-lurker",
            " 9999 dhruv    0.1   0.1  work-life-balance",
            "  666 dhruv    0.0   0.0  sleep.d <defunct>",
          ].join("\n"),
        ),
      );
    },
  },
  {
    name: "ping dhruv",
    aliases: ["ping"],
    group: "fun",
    summary: "check if I'm reachable",
    run(ctx) {
      if (ctx.args && !/dhruv/i.test(ctx.args)) {
        ctx.print(err(`ping: ${ctx.args}: Name or service not known`), muted("try 'ping dhruv'"));
        return;
      }
      const hosts = ["linkedin.com/in/dhruv-bhagatkar", "github.com/dhruv2003", "bhagatkardhruv2003@gmail.com", "linkedin.com/in/dhruv-bhagatkar"];
      const out: LineInput[] = ["PING dhruv (thisisdhruv.in): 56 data bytes"];
      const live = ctx.live(out, { onInterrupt: () => ["^C"] });
      let seq = 0;
      live.every(450, () => {
        if (seq < hosts.length) {
          out.push(`64 bytes from ${hosts[seq]}: icmp_seq=${seq + 1} ttl=64 time=${(0.7 + Math.random() * 0.6).toFixed(1)} ms`);
          seq++;
          live.set(out);
          return;
        }
        out.push("", "--- dhruv ping statistics ---", ok("4 packets transmitted, 4 received, 0% packet loss"), muted("rtt: I reply fast. say hi → 'contact'"));
        live.set(out);
        live.end();
      });
    },
  },
  {
    name: "systemctl status dhruv",
    aliases: ["systemctl status", "service dhruv status"],
    group: "fun",
    summary: "is the service healthy?",
    run(ctx) {
      ctx.print(
        pre(
          [
            "● dhruv.service - Backend & DevOps Engineer",
            "     Loaded: loaded (/etc/systemd/system/dhruv.service; enabled; preset: caffeinated)",
            `     Active: active (running) since Jul 2025; ${durationSince(ORACLE_START)} ago`,
            "   Main PID: 1337 (dhruv)",
            "      Tasks: too many (limit: none)",
            "     Memory: every prod incident, ever",
            "     CGroup: /oracle.slice/dhruv.service",
            "             ├─1337 backend --java --python --typescript",
            "             ├─2003 devops --kubernetes --jenkins --bash",
            "             └─4040 auth --sso --saml --ntlm",
            "",
            `${new Date().toDateString().slice(4, 10)} ${clock()} portfolio dhruv[1337]: shipping things. breaking few.`,
          ].join("\n"),
        ),
      );
      ctx.print(ok("● healthy"));
    },
  },
  {
    name: "incident",
    aliases: ["oncall", "on-call", "pagerduty"],
    group: "fun",
    summary: "you're on call. prod is down.",
    run(ctx) {
      startIncident(ctx);
    },
  },
  {
    name: "theme",
    group: "fun",
    summary: "green | amber | dracula | paper",
    run(ctx) {
      const name = ctx.args.toLowerCase();
      if (!name) {
        ctx.print(`current theme: ${ctx.theme}`, muted(`usage: theme ${Object.keys(THEMES).join(" | ")}`));
        return;
      }
      if (!isThemeName(name)) {
        ctx.print(err(`theme: unknown theme '${ctx.args}'`), muted(`try: ${Object.keys(THEMES).join(", ")}`));
        return;
      }
      ctx.setTheme(name);
      ctx.print(ok(`theme set to ${name} ✓`));
    },
  },
  {
    name: "who",
    aliases: ["who am i", "whoami --visitor"],
    group: "fun",
    summary: "who are *you*?",
    run(ctx) {
      const v = describeVisitor();
      ctx.print(
        "you are: a curious human",
        `browser: ${v.browser} on ${v.os}`,
        `screen: ${v.screen} · timezone: ${v.tz} · local time ${clock()}`,
        accent(
          `verdict: ${pick([
            "you look like a recruiter 👀",
            "you look like a fellow engineer reading the source 🧐",
            "you look like someone who'd type 'sudo hire dhruv'",
            "you look like you're procrastinating. respect.",
          ])}`,
        ),
      );
    },
  },
  {
    name: "fortune",
    group: "fun",
    summary: "dev wisdom",
    run(ctx) {
      ctx.print(pick(FORTUNES));
    },
  },
  {
    name: "cowsay",
    group: "fun",
    summary: "cowsay <text>",
    run(ctx) {
      ctx.print(pre(cowsay(ctx.args || "hire dhruv")));
    },
  },
  {
    name: "kubectl pods",
    aliases: ["kubectl get pods"],
    group: "fun",
    summary: "inspect portfolio services",
    run(ctx) {
      ctx.print(
        pre(
          [
            "NAME                         READY   STATUS      RESTARTS   AGE",
            "portfolio-web-7d9f           1/1     Running     0          99d",
            "resume-service-42x           1/1     Running     0          99d",
            "chat-terminal-api            1/1     Running     1          42d",
            "hire-dhruv-job               0/1     Pending     0          now",
          ].join("\n"),
        ),
      );
    },
  },
  {
    name: "docker ps",
    group: "fun",
    summary: "inspect portfolio containers",
    run(ctx) {
      ctx.print(
        pre(
          ["CONTAINER ID   IMAGE                  STATUS", "db2003         dhruv/portfolio:latest Up 99 days", "c0ffee         dhruv/resume:stable    Up 99 days"].join("\n"),
        ),
      );
    },
  },

  // ── hidden ────────────────────────────────────────────
  {
    name: "kubectl logs",
    run(ctx) {
      if (!ctx.args.startsWith("hire-dhruv")) {
        ctx.print(err(`Error from server (NotFound): pods "${ctx.args || "<pod>"}" not found`), muted("try 'kubectl logs hire-dhruv-job'"));
        return;
      }
      ctx.print(
        "[init] scheduling hire-dhruv-job...",
        warn("[warn] 0/1 nodes available: waiting on recruiter approval"),
        ok("[info] candidate ready: backend ✓ devops ✓ auth ✓ coffee ✓"),
        warn("[info] blocked on: you"),
        muted("hint: run 'sudo hire dhruv' to unblock"),
      );
    },
  },
  {
    name: "sudo hire dhruv",
    aliases: ["sudo hire-dhruv"],
    run(ctx) {
      fireConfetti();
      ctx.print(ok("Permission granted."), "Recruiter pipeline initialized.", "Next step: send an email or connect on LinkedIn.");
    },
  },
  {
    name: "sudo rm -rf /",
    aliases: ["sudo rm -rf /*", "sudo rm -rf --no-preserve-root /"],
    run(ctx) {
      const doomed = ["/bin", "/etc", "/usr/lib", "/var/log (finally)", "/home/dhruv/side-projects", "/opt/oracle", "/boot", "/home/dhruv/resume.pdf", "/dev/coffee"];
      const out: LineInput[] = [];
      const live = ctx.live(out, { onInterrupt: () => ["^C", ok("phew. stopped just in time.")] });
      let i = 0;
      live.every(140, () => {
        if (i < doomed.length) {
          out.push(warn(`removing ${doomed[i++]} ...`));
          live.set(out);
          return;
        }
        if (i === doomed.length) {
          i++;
          ctx.glitch(1400);
          out.push(err("Kernel panic - not syncing: Attempted to kill portfolio!"), err("---[ end Kernel panic ]---"));
          live.set(out);
          live.after(1700, () => {
            out.push(muted("rebooting..."));
            live.set(out);
          });
          live.after(2600, () => {
            out.push(ok("jk. I have backups. I'm a DevOps engineer. 😌"));
            live.set(out);
            live.end();
          });
        }
      });
    },
  },
  {
    name: "rm -rf /",
    aliases: ["rm -rf"],
    run(ctx) {
      ctx.print(err("rm: permission denied"), muted("you'd need sudo for that. (please don't.)"));
    },
  },
  {
    name: "vim",
    aliases: ["vi", "nvim"],
    run(ctx) {
      openVim(ctx);
    },
  },
  {
    name: "nano",
    aliases: ["emacs"],
    run(ctx) {
      ctx.print(muted("in this economy? opening vim instead."));
      openVim(ctx);
    },
  },
  {
    name: "sl",
    run(ctx) {
      const width = 56;
      const trainWidth = TRAIN[0].length;
      let offset = width;
      const frame = () =>
        TRAIN.map((row) => (" ".repeat(Math.max(offset, 0)) + row.slice(Math.max(-offset, 0))).slice(0, width)).join("\n");
      const live = ctx.live([pre(frame())], { onInterrupt: () => ["^C", muted("the train stops for no one. except Ctrl+C, apparently.")] });
      live.every(45, () => {
        offset -= 2;
        if (offset < -trainWidth) {
          live.end({ keep: false });
          ctx.print("choo choo 🚂", muted("(you meant 'ls', didn't you?)"));
          return;
        }
        live.set([pre(frame())]);
      });
    },
  },
  {
    name: "ls",
    aliases: ["ls -la", "ls -l", "dir"],
    run(ctx) {
      ctx.print(pre("about.txt   projects/   skills/   resume.pdf   side-projects/ (12, unfinished)   secrets/ (permission denied)"));
    },
  },
  {
    name: "cd",
    run(ctx) {
      if (["", "~", "..", "/", "~/"].includes(ctx.args)) {
        ctx.print(muted("heading home..."));
        ctx.goHome();
        return;
      }
      ctx.print(err(`cd: no such file or directory: ${ctx.args}`), muted("everything worth seeing is right here. ('cd ~' to go home)"));
    },
  },
  {
    name: "exit",
    aliases: ["logout", "quit"],
    run(ctx) {
      ctx.print("There is no exit. Only `cd ~`.");
    },
  },
  {
    name: "matrix",
    aliases: ["hack", "hacker", "cmatrix"],
    run(ctx) {
      activateHackerMode();
      ctx.print(ok("wake up, neo..."), muted("(it wears off in 15s, or press ` to leave early)"));
    },
  },
  {
    name: "make coffee",
    aliases: ["coffee", "brew coffee"],
    run(ctx) {
      ctx.print(err("make: *** No rule to make target 'coffee'.  Stop."), muted("hint: try 'make chai'"));
    },
  },
  {
    name: "make chai",
    aliases: ["chai", "brew chai"],
    run(ctx) {
      ctx.print(
        pre(["    ( (", "     ) )", "  ........", "  |      |]", "  \\      /", "   `----'"].join("\n"), "accent"),
        ok("chai.service started ✓  productivity +200%"),
      );
    },
  },
];
