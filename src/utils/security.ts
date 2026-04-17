/**
 * Protects against:
 * - XML/HTML injection attacks
 * - Script injection (XSS)
 * - Markdown exploitation
 * - Malicious input patterns
 */

export interface SecurityCheckResult {
  isSafe: boolean;
  threat?: string;
  sanitized?: string;
  roastResponse?: string;
}

/**
 * Detects and blocks malicious input patterns
 */
export function detectMaliciousInput(input: string): SecurityCheckResult {
  const lowerInput = input.toLowerCase();
  const trimmedInput = input.trim();

  // 1. Check for XML/HTML tags
  const xmlTagRegex = /<\/?[a-z][\s\S]*>/gi;
  if (xmlTagRegex.test(input)) {
    return {
      isSafe: false,
      threat: "xml_injection",
      roastResponse: getXMLInjectionRoast(input),
    };
  }

  // 2. Check for script tags
  const scriptRegex = /<script[\s\S]*?>[\s\S]*?<\/script>/gi;
  if (scriptRegex.test(input)) {
    return {
      isSafe: false,
      threat: "xss_attempt",
      roastResponse: getXSSRoast(),
    };
  }

  // 3. Check for event handlers (onClick, onLoad, etc.)
  const eventHandlerRegex = /on\w+\s*=\s*['"]/gi;
  if (eventHandlerRegex.test(input)) {
    return {
      isSafe: false,
      threat: "event_handler_injection",
      roastResponse: getEventHandlerRoast(),
    };
  }

  // 4. Check for iframe injection
  if (lowerInput.includes('<iframe') || lowerInput.includes('</iframe>')) {
    return {
      isSafe: false,
      threat: "iframe_injection",
      roastResponse: getIframeRoast(),
    };
  }

  // 5. Check for SQL injection patterns
  const sqlPatterns = [
    /union\s+select/gi,
    /drop\s+table/gi,
    /delete\s+from/gi,
    /insert\s+into/gi,
    /'\s*or\s*'1'\s*=\s*'1/gi,
    /--\s*$/gm,
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(input)) {
      return {
        isSafe: false,
        threat: "sql_injection",
        roastResponse: getSQLInjectionRoast(),
      };
    }
  }

  // 6. Check for excessive special characters (potential exploit)
  const specialCharCount = (input.match(/[<>{}[\]\\\/\|`~!@#$%^&*()]/g) || []).length;
  const ratio = specialCharCount / input.length;

  if (ratio > 0.3 && input.length > 10) {
    return {
      isSafe: false,
      threat: "suspicious_pattern",
      roastResponse: getSuspiciousPatternRoast(),
    };
  }

  // 7. Check for markdown exploitation (excessive nesting)
  const asteriskCount = (input.match(/\*/g) || []).length;
  const backtickCount = (input.match(/`/g) || []).length;

  if (asteriskCount > 20 || backtickCount > 10) {
    return {
      isSafe: false,
      threat: "markdown_exploit",
      roastResponse: getMarkdownExploitRoast(),
    };
  }

  // Input is safe
  return {
    isSafe: true,
    sanitized: sanitizeInput(input),
  };
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  // Remove HTML/XML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove potential script content
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Limit length to prevent DOS
  const MAX_LENGTH = 5000;
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }

  return sanitized.trim();
}

/**
 * Escapes HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

// ========== ROAST RESPONSES ==========

function getXMLInjectionRoast(input: string): string {
  const tagCount = (input.match(/<[^>]*>/g) || []).length;

  const roasts = [
    `Whoa there, hackerman! 🕵️ Nice try with those ${tagCount} XML tags. Did you think this was a vulnerable WordPress site from 2008? This is DhruvGPT — we sanitize inputs better than Dhruv sanitizes his Mumbai local train seat.`,

    `LOL, XML injection? Really? 😂 Buddy, I've seen better attack vectors in a "Learn Hacking in 5 Minutes" YouTube video. Meanwhile, Dhruv's been securing APIs while you're copy-pasting Stack Overflow exploits. Try again with actual skills next time!`,

    `Aww, someone learned about <script> tags! 🎓 Gold star for effort, F- for execution. This chat is protected better than Dhruv's coffee stash on a Monday morning. Go back to HackerOne and practice on actual bug bounties, champ.`,

    `Oh no! Anyway... 💅 Your XML injection attempt has been logged, laughed at, and rejected. Dhruv writes better error handlers than you write exploits. Maybe try asking a real question instead of speed-running "How to Get Blocked 101"?`,
  ];

  return roasts[Math.floor(Math.random() * roasts.length)];
}

function getXSSRoast(): string {
  const roasts = [
    `Nice <script> tag, bro! 💻 Did ChatGPT teach you that? Unfortunately, DhruvGPT was built by someone who actually reads OWASP documentation. Your XSS attempt has been sanitized, archived, and will be used in future security training as "what NOT to do."`,

    `XSS in 2025? Bold strategy! 🤡 This is like trying to hack a Tesla with a floppy disk. Dhruv builds CI/CD pipelines that auto-reject code worse than this. Go practice on a localhost server and come back when you're ready for the big leagues.`,

    `Seriously? A script tag? That's your A-game? 😴 Dhruv has seen Jenkins builds with better attack vectors. This chat has CSP headers, input sanitization, and a developer who actually stayed awake during security lectures. Try harder, script kiddie.`,
  ];

  return roasts[Math.floor(Math.random() * roasts.length)];
}

function getEventHandlerRoast(): string {
  return `Event handler injection? onClick="hack()"? 🎭 Bro, this isn't a 90s PHP forum. DhruvGPT strips event handlers faster than Dhruv strips bugs from production code. Maybe stick to clicking buttons the normal way instead of trying to inject malicious JavaScript. Just a thought! 💡`;
}

function getIframeRoast(): string {
  return `Iframe injection detected! 🖼️ Were you planning to embed a phishing site or just Rick Astley? Either way, DhruvGPT's Content Security Policy said "nah, we're good." This chat is more secure than Dhruv's commit history. Nice try though — points for creativity, minus points for success rate (0%). 📉`;
}

function getSQLInjectionRoast(): string {
  const roasts = [
    `SQL injection? In a CHAT APP? 🤦‍♂️ Dude, we don't even use a database here — it's all RAG and vector stores. You're trying to DROP TABLE on something that doesn't exist. That's like trying to hack a paper notebook. Peak comedy right there. Go learn how modern apps work before attempting Bobby Tables jokes.`,

    `' OR '1'='1' — ah, the classic! 🎻 Unfortunately, this isn't a 2003 PHP login page. DhruvGPT uses parameterized queries, input validation, and a developer who knows SQL injection stopped being cool after the first XKCD comic. Better luck next time, Bobby Tables!`,

    `Did you really just try to inject SQL into a client-side React chat? 💀 That's like bringing a spoon to a lightsaber fight. This app doesn't touch SQL — it's all Gemini AI and vector embeddings. Your attack literally has nowhere to go except the hall of fame for "Most Confused Hacker Attempts."`,
  ];

  return roasts[Math.floor(Math.random() * roasts.length)];
}

function getSuspiciousPatternRoast(): string {
  return `Yo, your message has more special characters than a regex tutorial gone wrong! 🤨 ${(Math.random() * 100).toFixed(0)}% suspicious pattern detected. Either you're keyboard-smashing, trying some obscure Unicode exploit, or genuinely having a stroke. Either way, DhruvGPT ain't processing that. Try using actual words like a normal human! 🗣️`;
}

function getMarkdownExploitRoast(): string {
  return `Markdown exploit attempt detected! ********* Really? 🎨 You think spamming asterisks or backticks will crash my renderer? Dhruv built this with React and proper sanitization. Your "attack" just looks like a toddler found the keyboard. Congrats on making DhruvGPT's block list before even asking a real question! 🎉`;
}

/**
 * Validates message length
 */
export function validateMessageLength(message: string): { valid: boolean; error?: string } {
  const MIN_LENGTH = 1;
  const MAX_LENGTH = 5000;

  if (message.length < MIN_LENGTH) {
    return { valid: false, error: "Message too short" };
  }

  if (message.length > MAX_LENGTH) {
    return {
      valid: false,
      error: `Message too long (max ${MAX_LENGTH} characters). Maybe write a blog post instead? 📝`
    };
  }

  return { valid: true };
}

/**
 * Rate limiting helper (client-side basic check)
 */
export class RateLimiter {
  private attempts: number[] = [];
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 10, windowMs: number = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  attempt(): { allowed: boolean; remainingAttempts: number } {
    const now = Date.now();

    // Remove old attempts outside the time window
    this.attempts = this.attempts.filter(time => now - time < this.windowMs);

    // Check if rate limit exceeded
    if (this.attempts.length >= this.maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0
      };
    }

    // Add current attempt
    this.attempts.push(now);

    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - this.attempts.length
    };
  }

  reset(): void {
    this.attempts = [];
  }
}
