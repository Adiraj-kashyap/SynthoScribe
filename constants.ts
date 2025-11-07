import { Article } from './types';

// Admin email - update this with your actual admin email address
// This is used to determine who has admin privileges (can create/edit/delete posts)
export const ADMIN_EMAIL = (process.env.REACT_APP_ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();

// Debug: Log admin email on load (only in development)
if (typeof window !== 'undefined') {
  console.log('Admin Email Configured:', ADMIN_EMAIL || 'NOT SET');
}

export const PILLAR_ARTICLES: Omit<Article, 'id'>[] = [
  {
    title: 'The Unparalleled Power of Headless/Jamstack Architecture',
    author: {
      name: 'Alex Johnson',
      avatarUrl: 'https://i.pravatar.cc/150?u=alexjohnson',
    },
    publishDate: new Date('2023-10-26T10:00:00Z'),
    imageUrl: 'https://picsum.photos/seed/jamstack/1200/800',
    excerpt: 'Discover why decoupling your frontend is the single most critical decision for building a scalable, high-performance, and future-proof web platform.',
    content: `
      <p class="mb-6 text-lg">In the ever-evolving landscape of web development, the choice of architecture is a foundational decision that dictates the future of your project. For projects where speed, SEO performance, and scalability are paramount, the Headless/Jamstack architecture is unparalleled. This approach decouples the frontend (the user-facing experience) from the backend (the content management system), creating an API-driven ecosystem that is both robust and flexible.</p>
      <h3 class="text-2xl font-bold mb-4 text-brand-secondary">Why Go Headless?</h3>
      <p class="mb-4">Traditional monolithic systems like WordPress bundle the content management and content delivery layers together. While convenient for simple sites, this creates a performance bottleneck. Every page request requires server-side processing and database queries, slowing down load times and negatively impacting Core Web Vitals—a critical SEO ranking factor.</p>
      <p class="mb-6">A headless architecture, by contrast, uses a CMS solely for content management. The content is then served via an API to any frontend you choose. This is where the Jamstack (JavaScript, APIs, Markup) shines. Frameworks like Next.js can pre-render pages into static HTML at build time. When a user visits your site, they are served a static file directly from a global CDN, resulting in near-instant load times.</p>
      <div class="my-8"><div class="aspect-w-16 aspect-h-9"><img class="rounded-lg object-cover" src="https://picsum.photos/seed/architecture/800/450" alt="Architectural diagram" /></div></div>
      <h3 class="text-2xl font-bold mb-4 text-brand-secondary">Benefits for Scalability and Integration</h3>
      <p class="mb-4">The API-first nature of this stack makes future integrations seamless. Integrating a complex, Python-based MLOps pipeline for AI content generation (as planned for Phase 2) becomes a matter of connecting to an API endpoint. This is a natural extension of the architecture, not a convoluted hack on a PHP monolith.</p>
      <ul class="list-disc list-inside space-y-2 mb-6 pl-4">
        <li><strong>Unmatched Performance:</strong> Static assets served from a CDN are the fastest possible delivery method.</li>
        <li><strong>Enhanced Security:</strong> The attack surface is dramatically reduced as the frontend is decoupled from the database and backend logic.</li>
        <li><strong>Developer Experience:</strong> Modern frameworks like React/Next.js offer a superior development experience and a vast ecosystem.</li>
        <li><strong>Future-Proof:</strong> Easily swap out your frontend or backend without a complete re-architecture. Your content lives on, accessible via API.</li>
      </ul>
      <p>The selection of a Jamstack architecture in Phase 1, while incurring slightly more initial setup complexity, is the only choice that serves as a correct and scalable foundation for the ambitious goals of this platform. It is an investment in the future, preventing massive technical debt and costly migrations down the line.</p>
    `,
    category: 'Architecture',
    readingTime: 6,
  },
  {
    title: 'The "Human Touch": A Strategic Imperative for AI Content',
    author: {
      name: 'Samantha Carter',
      avatarUrl: 'https://i.pravatar.cc/150?u=samanthacarter',
    },
    publishDate: new Date('2023-10-22T11:00:00Z'),
    imageUrl: 'https://picsum.photos/seed/humanai/1200/800',
    excerpt: 'A simplistic scrape-and-summarize AI pipeline is doomed to fail. We explore the hybrid RAG + LoRA model required for creating truly transformative and defensible content.',
    content: `
      <p class="mb-6 text-lg">In the gold rush of AI-generated content, many are falling into a strategic trap: building simplistic pipelines that scrape, summarize, and republish existing work. This model is not only a clear copyright violation but also a direct violation of Google's "Helpful Content" policies, which are designed to penalize "robotic" and "unoriginal" automated content.</p>
      <h3 class="text-2xl font-bold mb-4 text-brand-secondary">Beyond Summarization: The Goal is Transformation</h3>
      <p class="mb-4">The key to a viable, long-term AI content strategy is not replication, but transformation. The output must not be "substantially similar" to its sources; it must be a new work that synthesizes information and presents it with a unique voice. This is where a sophisticated, two-stage AI process becomes the core intellectual property of the platform.</p>
      <div class="my-8"><div class="aspect-w-16 aspect-h-9"><img class="rounded-lg object-cover" src="https://picsum.photos/seed/brain/800/450" alt="AI Brain concept" /></div></div>
      <h3 class="text-2xl font-bold mb-4 text-brand-secondary">Stage 1: Factual Accuracy via RAG</h3>
      <p class="mb-4">Retrieval-Augmented Generation (RAG) is the solution for factual accuracy. Instead of relying on a model's potentially outdated internal knowledge, RAG grounds the AI in a real-time, external knowledge base. For our platform, this knowledge base is built from the condensed, factual summaries of multiple scraped sources. When generating an article, the RAG system retrieves the most relevant facts and injects them into the LLM's prompt, drastically reducing "hallucinations" and ensuring the content is accurate and up-to-date.</p>
      <h3 class="text-2xl font-bold mb-4 text-brand-secondary">Stage 2: Stylistic Consistency via LoRA</h3>
      <p class="mb-6">The factual draft from the RAG system, while accurate, will sound generic. To infuse it with a unique "human touch," we use Parameter-Efficient Fine-Tuning (PEFT), specifically a technique called LoRA (Low-Rank Adaptation). By training a small LoRA "adapter" on a "gold standard" dataset of manually written articles, we can teach the LLM to rewrite the factual draft in our platform's desired style. This creates content that is both factually sound and stylistically unique.</p>
      <p>This RAG + LoRA hybrid model is the only defensible position, both legally against copyright claims (by being "transformative") and strategically against search engine penalties (by creating truly "helpful," high-quality content).</p>
    `,
    category: 'AI Strategy',
    readingTime: 7,
  },
  {
    title: 'Avoiding the Monetization Single Point of Failure',
    author: {
      name: 'Frank Miller',
      avatarUrl: 'https://i.pravatar.cc/150?u=frankmiller',
    },
    publishDate: new Date('2023-10-15T12:00:00Z'),
    imageUrl: 'https://picsum.photos/seed/money/1200/800',
    excerpt: 'Relying solely on "AdSense for Platforms" is a high-risk strategy. Why a pivot to a platform-agnostic solution like Stripe Connect is essential for a multi-author SaaS model.',
    content: `
      <p class="mb-6 text-lg">For any multi-author platform, the revenue-sharing engine is the heart of the business model. A common, yet perilous, path is to build the entire system around Google's "AdSense for Platforms" (AFP) API. While designed for this use case, it presents a critical single point of failure that can destroy the business before it scales.</p>
      <h3 class="text-2xl font-bold mb-4 text-brand-secondary">The Critical Risk of Manual Review</h3>
      <p class="mb-4">Access to the AFP API is not public. It requires a manual "allowlisting" review by a Google account manager. Given that a platform utilizing automated content generation via scraping operates in a gray area of Google's own spam policies, the risk of rejection is extremely high. A "no" from Google renders the entire monetization plan impossible.</p>
      <div class="my-8"><div class="aspect-w-16 aspect-h-9"><img class="rounded-lg object-cover" src="https://picsum.photos/seed/fail/800/450" alt="A closed door" /></div></div>
      <h3 class="text-2xl font-bold mb-4 text-brand-secondary">The Robust Alternative: Stripe Connect</h3>
      <p class="mb-6">The strategic pivot is to decouple payments from advertising and adopt a platform-agnostic solution. Stripe Connect is the industry standard for marketplaces and platforms. It is designed specifically to onboard users, process payments, and handle complex "split" payouts to multiple parties automatically.</p>
      <ul class="list-disc list-inside space-y-2 mb-6 pl-4">
        <li><strong>Removes Dependency:</strong> Stripe is a neutral payment processor, unconcerned with your content strategy as long as it's legal.</li>
        <li><strong>Greater Flexibility:</strong> This opens up hybrid monetization models. Authors can still use their own AdSense IDs, while the platform can take a percentage of paid subscriptions, a model popularized by platforms like Substack.</li>
        <li><strong>Seamless Onboarding:</strong> Stripe's pre-built flows handle all the complex KYC (Know Your Customer) requirements, reducing development overhead.</li>
        <li><strong>Developer Control:</strong> A full-featured API provides granular control over the entire payment lifecycle.</li>
      </ul>
      <p>By prioritizing Stripe Connect as the primary monetization engine, the platform moves from a risky, ad-arbitrage model to a stable, predictable SaaS or subscription-sharing model. It's the only viable path for robust, long-term growth.</p>
    `,
    category: 'Business Strategy',
    readingTime: 5,
  },
];
