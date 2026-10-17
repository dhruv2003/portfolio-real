// `incident`: a tiny on-call text adventure. Find the root cause of a 3am page.
import { accent, err, muted, ok, pre, warn, type Ctx, type LineInput, type Mode } from "./engine";

type Choice = {
  label: string;
  /** Next node, or null to stay put after a wrong move */
  next: NodeId | null;
  minutes: number;
  sleepLost?: number;
  reply?: LineInput[];
};

type NodeId = "page" | "pods" | "grafana" | "logs" | "gitlog";

type Node = { lines: LineInput[]; choices: [Choice, Choice, Choice] };

const NODES: Record<NodeId, Node> = {
  page: {
    lines: [
      err("📟 PAGER — 03:12 AM"),
      err("[SEV-1] checkout-api: 5xx error rate 38% and climbing"),
      "customers can't pay. your phone will not stop buzzing.",
    ],
    choices: [
      { label: "kubectl get pods", next: "pods", minutes: 2 },
      {
        label: "restart everything and go back to bed",
        next: null,
        minutes: 10,
        sleepLost: 1,
        reply: [warn("you restart everything. errors vanish... for 90 seconds. then they're back, angrier.")],
      },
      {
        label: "mute the pager",
        next: null,
        minutes: 5,
        reply: [warn("the pager escalates to your manager. your manager calls you. you are now awake AND in trouble.")],
      },
    ],
  },
  pods: {
    lines: [
      pre(
        [
          "NAME                READY   STATUS    RESTARTS   AGE",
          "checkout-api-7d9f   1/1     Running   7          2d",
          "payments-db-0       1/1     Running   0          41d",
          "frontend-5c2a       1/1     Running   0          2d",
        ].join("\n"),
      ),
      "checkout-api has restarted 7 times. suspicious.",
    ],
    choices: [
      { label: "kubectl logs checkout-api", next: "logs", minutes: 3 },
      { label: "open the grafana dashboard", next: "grafana", minutes: 4 },
      {
        label: "blame the network",
        next: null,
        minutes: 5,
        reply: [warn("it's never the network. (unless it's DNS. it's not DNS.)")],
      },
    ],
  },
  grafana: {
    lines: [
      pre(
        [
          "db connections (checkout-api)",
          " 50 ┤",
          "    │",
          " 25 ┤",
          "  5 ┤━━━━━━━━━━━━━━━━━━━━━━━━━━━  ← flat. since friday 18:47.",
          "  0 ┼───────────────────────────",
        ].join("\n"),
      ),
      "the line is flat at exactly 5. weird number.",
    ],
    choices: [
      { label: "kubectl logs checkout-api", next: "logs", minutes: 2 },
      {
        label: "screenshot it for the postmortem and keep staring",
        next: null,
        minutes: 6,
        reply: [warn("great screenshot. still broken.")],
      },
      {
        label: "add more panels to the dashboard",
        next: null,
        minutes: 8,
        reply: [warn("you now have 14 panels confirming that it is broken.")],
      },
    ],
  },
  logs: {
    lines: [
      err("ERROR SQLException: Cannot get a connection, pool exhausted"),
      err("ERROR   datasource=jdbc/CheckoutDS active=5 max=5 waiting=212"),
      warn("WARN  request timed out after 30000ms"),
      "the connection pool is maxed out at... 5?",
    ],
    choices: [
      { label: "git log the config repo", next: "gitlog", minutes: 3 },
      {
        label: "bump the pool to 500 and pray",
        next: null,
        minutes: 8,
        reply: [warn("the database now has 500 connections and a headache. CPU 100%. you undo it.")],
      },
      {
        label: "restart the database",
        next: null,
        minutes: 10,
        sleepLost: 1,
        reply: [warn("every connection dropped, including the 5 that worked. checkout is now 100% down. you bring it back.")],
      },
    ],
  },
  gitlog: {
    lines: [
      pre(
        [
          "a3f9c1e  chore: tidy datasource config   (Fri 18:47)",
          "         -  maxPoolSize: 50",
          "         +  maxPoolSize: 5",
        ].join("\n"),
      ),
      "found it. someone 'tidied' a zero away on a friday evening.",
    ],
    choices: [
      { label: "roll back the config", next: null, minutes: 4 },
      { label: "hotfix to 50 + add a pool-saturation alert", next: null, minutes: 6 },
      {
        label: "git blame and call them at 3am",
        next: null,
        minutes: 5,
        reply: [warn("git blame says... it was you. you wrote that commit. 🙃")],
      },
    ],
  },
};

const grade = (minutes: number) =>
  minutes <= 14 ? "S — on-call legend" : minutes <= 25 ? "A — solid" : minutes <= 40 ? "B — it's fixed, that's what counts" : "C — it's fine. everything is fine. 🔥";

export function startIncident(ctx: Ctx) {
  let node: NodeId = "page";
  let minutes = 0;
  let sleepLost = 0;

  const show = (id: NodeId, c: Ctx) => {
    const { lines, choices } = NODES[id];
    c.print(...lines, ...choices.map((choice, i) => accent(`  ${i + 1}) ${choice.label}`)), muted("pick 1, 2 or 3 · 'quit' to hand it off"));
  };

  const resolveIncident = (c: Ctx, alert: boolean) => {
    c.setMode(null);
    c.print(
      ok("✓ error rate 38% → 0.1%. checkout is back. customers are paying again."),
      ...(alert ? [ok("✓ and the new alert means this never pages anyone again. chef's kiss.")] : []),
      "",
      `incident resolved in ${minutes} min · sleep lost: ${sleepLost}`,
      accent(`grade: ${grade(minutes)}`),
      "",
      muted("postmortem: datasource maxPoolSize 50 → 5 in a friday config change."),
      muted("action items: config review, pool-saturation alert, no friday merges (lol)."),
      "",
      "you'd make a good SRE. wanna work together? type 'contact' 👋",
    );
  };

  const mode: Mode = {
    prompt: "on-call>",
    onInput(raw, c) {
      const input = raw.trim().toLowerCase();
      if (["quit", "exit", "q"].includes(input)) {
        c.setMode(null);
        c.print(warn("you escalated to someone else. the incident is still open. 🐔"));
        return;
      }
      const choice = NODES[node].choices[Number(input) - 1];
      if (!/^[123]$/.test(input) || !choice) {
        c.print(muted("pick 1, 2 or 3 (or 'quit')"));
        return;
      }
      minutes += choice.minutes;
      sleepLost += choice.sleepLost ?? 0;
      if (choice.reply) c.print(...choice.reply, muted(`(+${choice.minutes} min)`));

      if (node === "gitlog" && !choice.reply) {
        resolveIncident(c, input === "2");
        return;
      }
      if (choice.next) node = choice.next;
      show(node, c);
    },
    onInterrupt(c) {
      mode.onInput("quit", c);
    },
  };

  ctx.setMode(mode);
  ctx.print(muted("you are on call. good luck."), "");
  show(node, ctx);
}
