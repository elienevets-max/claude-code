'use client';

import { useState, useEffect } from 'react';

interface BrandScript {
  id: string;
  hero: string;
  externalProblem: string;
  internalProblem: string;
  philosophicalProblem: string;
  guide: string;
  empathy: string;
  authority: string;
  plan: string[];
  directCta: string;
  transitionalCta: string;
  failure: string;
  success: string;
}

type GeneratorTab = 'homepage' | 'email' | 'ad' | 'landing';

export default function StoryBrandPage() {
  const [brandScript, setBrandScript] = useState<BrandScript | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeGen, setActiveGen] = useState<GeneratorTab>('homepage');
  const [form, setForm] = useState<Partial<BrandScript>>({});
  const [planInput, setPlanInput] = useState('');

  useEffect(() => {
    fetchBrandScript();
  }, []);

  async function fetchBrandScript() {
    try {
      const res = await fetch('/api/storybrand');
      if (res.ok) {
        const data = await res.json();
        setBrandScript(data);
        setForm(data);
        setPlanInput(Array.isArray(data.plan) ? data.plan.join('\n') : '');
      }
    } catch (e) {
      console.error('Failed to fetch brandscript:', e);
    } finally {
      setLoading(false);
    }
  }

  async function saveBrandScript() {
    const payload = {
      ...form,
      plan: planInput.split('\n').filter((s) => s.trim()),
    };
    try {
      const method = brandScript ? 'PUT' : 'POST';
      const res = await fetch('/api/storybrand', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setBrandScript(data);
        setForm(data);
        setEditing(false);
      }
    } catch (e) {
      console.error('Failed to save brandscript:', e);
    }
  }

  function generateHomepage(): string {
    if (!brandScript) return '';
    return `<!-- HERO SECTION -->
<h1>Make Every Celebration Unforgettable</h1>
<p>${brandScript.hero}</p>
<button>${brandScript.directCta}</button>
<a href="#">${brandScript.transitionalCta}</a>

<!-- PROBLEM SECTION -->
<h2>Planning a Show-Stopping Event Shouldn't Be This Hard</h2>
<p><strong>The real challenge:</strong> ${brandScript.externalProblem}</p>
<p><strong>What keeps you up at night:</strong> ${brandScript.internalProblem}</p>
<p><strong>Because:</strong> ${brandScript.philosophicalProblem}</p>

<!-- GUIDE SECTION -->
<h2>You Deserve a Trusted Partner</h2>
<p>${brandScript.guide}</p>
<div class="trust-signals">
  <p><em>"${brandScript.empathy}"</em></p>
  <p>${brandScript.authority}</p>
</div>

<!-- PLAN SECTION -->
<h2>Getting Started Is Easy</h2>
<ol>
${brandScript.plan.map((step, i) => `  <li><strong>Step ${i + 1}:</strong> ${step}</li>`).join('\n')}
</ol>

<!-- CTA SECTION -->
<h2>Ready to Light Up Your Next Event?</h2>
<button>${brandScript.directCta}</button>

<!-- STAKES SECTION -->
<h2>Don't Let Your Event Fall Flat</h2>
<p>${brandScript.failure}</p>

<!-- SUCCESS SECTION -->
<h2>Imagine This Instead...</h2>
<p>${brandScript.success}</p>`;
  }

  function generateEmailSequence(): string {
    if (!brandScript) return '';
    return `=== EMAIL 1: WELCOME (Immediate) ===
Subject: Welcome to King of Sparklers — Here's Your Free Safety Guide
---
Hi [NAME],

${brandScript.empathy}

That's exactly why we created King of Sparklers. ${brandScript.guide}

As promised, here's your free Event Sparkler Safety & Planning Guide.

${brandScript.authority}

${brandScript.directCta} — visit kingofsparklers.com

Best,
King of Sparklers Team


=== EMAIL 2: VALUE (Day 3) ===
Subject: 5 Mistakes That Ruin Sparkler Moments (And How to Avoid Them)
---
Hi [NAME],

${brandScript.internalProblem}

Here are the 5 biggest mistakes event planners make with sparklers:

1. Choosing the wrong size for the venue
2. Not having safety clips for bottle service
3. Ordering too late and missing their event date
4. Using cheap imports that smoke and fizzle
5. Skipping a lighting plan for photos/videos

${brandScript.philosophicalProblem}

That's why every product we sell is event-grade, safety-tested, and backed by our expertise since 2008.

Browse our collection: ${brandScript.directCta}


=== EMAIL 3: SOCIAL PROOF (Day 7) ===
Subject: See How 500+ Venues Light Up with King of Sparklers
---
Hi [NAME],

${brandScript.success}

That's what our customers experience. From Miami nightclubs to Napa Valley weddings, over 500 venues trust King of Sparklers.

${brandScript.authority}

Ready to join them? ${brandScript.directCta}


=== EMAIL 4: URGENCY (Day 14) ===
Subject: Your Next Event Deserves Better Than "Good Enough"
---
Hi [NAME],

${brandScript.failure}

Don't let that happen. Here's how easy it is:

${brandScript.plan.map((step, i) => `${i + 1}. ${step}`).join('\n')}

${brandScript.directCta} — Same-day shipping on orders by 4pm EST.

— King of Sparklers Team`;
  }

  function generateAdCopy(): string {
    if (!brandScript) return '';
    return `=== FACEBOOK/INSTAGRAM AD — AWARENESS ===
Headline: ${brandScript.directCta}
Primary Text: ${brandScript.hero} ${brandScript.empathy} Trusted by 500+ venues since 2008. Same-day shipping. 14-day money-back guarantee.
CTA Button: Shop Now
Link: kingofsparklers.com


=== FACEBOOK/INSTAGRAM AD — RETARGETING ===
Headline: Still Planning Your Event?
Primary Text: ${brandScript.internalProblem} We get it. That's why we offer free safety guides, expert support, and a 14-day money-back guarantee. ${brandScript.plan[0]} — it's that simple.
CTA Button: Shop Now


=== GOOGLE SEARCH AD ===
Headline 1: Premium Event Sparklers | King of Sparklers
Headline 2: Trusted Since 2008 | Same-Day Shipping
Headline 3: ${brandScript.directCta}
Description 1: ${brandScript.guide} VIP bottle sparklers, wedding sparklers, cold spark machines & more.
Description 2: ${brandScript.authority} Free safety guide + 14-day guarantee. Order by 4pm EST for same-day shipping.


=== TIKTOK/REELS AD SCRIPT ===
Hook (0-3s): "This is what a $50,000 bottle presentation looks like..."
Problem (3-8s): "${brandScript.externalProblem}"
Solution (8-15s): "${brandScript.guide}"
Proof (15-22s): "${brandScript.authority}"
CTA (22-30s): "${brandScript.directCta} — link in bio"`;
  }

  function generateLandingPage(): string {
    if (!brandScript) return '';
    return `=== LANDING PAGE: INDOOR-SAFE ALTERNATIVES ===

<!-- HERO -->
<h1>Indoor Celebrations Without the Fire Risk</h1>
<p>LED sparklers, cold spark machines, and zero-flame alternatives for venues that demand safety without sacrificing the wow factor.</p>
<button>${brandScript.directCta}</button>

<!-- PROBLEM AGITATION -->
<h2>The Indoor Sparkler Dilemma</h2>
<p>After the Crans-Montana tragedy, venues worldwide are rethinking indoor pyrotechnics. ${brandScript.internalProblem}</p>
<p>Insurance premiums rising. Guest safety concerns growing. But your customers still expect that VIP bottle service moment.</p>

<!-- SOLUTION -->
<h2>${brandScript.guide}</h2>
<p>We've spent 15+ years in the event sparkler industry. We saw this shift coming — and we built the solution.</p>

<div class="products">
  <div class="product">
    <h3>LED Bottle Sparklers</h3>
    <p>Zero fire. Zero smoke. Same visual impact. Rechargeable and reusable.</p>
  </div>
  <div class="product">
    <h3>Cold Spark Machine 350W</h3>
    <p>Indoor spark fountain, 8-11.5ft gold effect. No heat, no fire risk. Perfect for VIP areas.</p>
  </div>
  <div class="product">
    <h3>LED Bottle Batons (Nite Sparx)</h3>
    <p>Premium LED alternative with multiple light modes. The future of bottle service.</p>
  </div>
</div>

<!-- TRUST -->
<h2>${brandScript.authority}</h2>

<!-- PLAN -->
<h2>Switch to Safe in 3 Steps</h2>
${brandScript.plan.map((step, i) => `<p><strong>${i + 1}.</strong> ${step}</p>`).join('\n')}

<!-- CTA -->
<button>${brandScript.directCta}</button>
<a href="#">${brandScript.transitionalCta}</a>


=== LANDING PAGE: WEDDING SPARKLER EXIT ===

<!-- HERO -->
<h1>Create the Wedding Exit Everyone Remembers</h1>
<p>${brandScript.hero}</p>
<button>Shop Wedding Sparklers</button>

<!-- SOCIAL PROOF -->
<p>${brandScript.success}</p>

<!-- SIZE GUIDE -->
<h2>Choose Your Perfect Sparkler</h2>
<table>
  <tr><td>10" Sparklers</td><td>45 seconds</td><td>Quick photo ops, cake table</td></tr>
  <tr><td>20" Sparklers</td><td>2 minutes</td><td>Sparkler exits, aisle lining</td></tr>
  <tr><td>36" Sparklers</td><td>3-4 minutes</td><td>Grand exits, long photo sessions</td></tr>
</table>

<!-- PLAN -->
${brandScript.plan.map((step, i) => `<p><strong>${i + 1}.</strong> ${step}</p>`).join('\n')}

<button>Shop Wedding Sparklers</button>`;
  }

  const generators: Record<GeneratorTab, { label: string; generate: () => string }> = {
    homepage: { label: 'Homepage Copy', generate: generateHomepage },
    email: { label: 'Email Sequence', generate: generateEmailSequence },
    ad: { label: 'Ad Copy', generate: generateAdCopy },
    landing: { label: 'Landing Pages', generate: generateLandingPage },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading BrandScript...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">StoryBrand Copy Generator</h1>
          <p className="text-gray-400 mt-1">Build your messaging framework and auto-generate marketing copy</p>
        </div>
        <button onClick={() => setEditing(!editing)} className={editing ? 'btn-secondary' : 'btn-primary'}>
          {editing ? 'Cancel Editing' : 'Edit BrandScript'}
        </button>
      </div>

      {/* BrandScript Editor / Viewer */}
      <div className="card">
        <h2 className="card-header flex items-center gap-2">
          <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
          BrandScript Framework
        </h2>

        {editing ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Hero (Your Customer)</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  value={form.hero || ''}
                  onChange={(e) => setForm({ ...form, hero: e.target.value })}
                  placeholder="Who is your customer and what do they want?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Guide (Your Brand)</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  value={form.guide || ''}
                  onChange={(e) => setForm({ ...form, guide: e.target.value })}
                  placeholder="How does your brand position as the guide?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">External Problem</label>
                <textarea
                  className="textarea-field"
                  rows={2}
                  value={form.externalProblem || ''}
                  onChange={(e) => setForm({ ...form, externalProblem: e.target.value })}
                  placeholder="The tangible problem they face"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Internal Problem</label>
                <textarea
                  className="textarea-field"
                  rows={2}
                  value={form.internalProblem || ''}
                  onChange={(e) => setForm({ ...form, internalProblem: e.target.value })}
                  placeholder="How the problem makes them feel"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Philosophical Problem</label>
                <textarea
                  className="textarea-field"
                  rows={2}
                  value={form.philosophicalProblem || ''}
                  onChange={(e) => setForm({ ...form, philosophicalProblem: e.target.value })}
                  placeholder="Why this problem is just plain wrong"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Empathy Statement</label>
                <textarea
                  className="textarea-field"
                  rows={2}
                  value={form.empathy || ''}
                  onChange={(e) => setForm({ ...form, empathy: e.target.value })}
                  placeholder="Show you understand their struggle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Authority Statement</label>
                <textarea
                  className="textarea-field"
                  rows={2}
                  value={form.authority || ''}
                  onChange={(e) => setForm({ ...form, authority: e.target.value })}
                  placeholder="Why they should trust you"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Plan (one step per line)</label>
                <textarea
                  className="textarea-field"
                  rows={4}
                  value={planInput}
                  onChange={(e) => setPlanInput(e.target.value)}
                  placeholder="Step 1: Choose your sparklers&#10;Step 2: Customize your order&#10;Step 3: Celebrate!"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Direct CTA</label>
                <input
                  className="input-field mb-4"
                  value={form.directCta || ''}
                  onChange={(e) => setForm({ ...form, directCta: e.target.value })}
                  placeholder="Shop Sparklers Now"
                />
                <label className="block text-sm font-medium text-gray-300 mb-2">Transitional CTA</label>
                <input
                  className="input-field"
                  value={form.transitionalCta || ''}
                  onChange={(e) => setForm({ ...form, transitionalCta: e.target.value })}
                  placeholder="Download Free Safety Guide"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Failure (What happens if they don&apos;t act)</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  value={form.failure || ''}
                  onChange={(e) => setForm({ ...form, failure: e.target.value })}
                  placeholder="Paint the picture of failure"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Success (The transformation)</label>
                <textarea
                  className="textarea-field"
                  rows={3}
                  value={form.success || ''}
                  onChange={(e) => setForm({ ...form, success: e.target.value })}
                  placeholder="Paint the picture of success"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-navy-700">
              <button onClick={saveBrandScript} className="btn-primary">Save BrandScript</button>
              <button onClick={() => { setEditing(false); setForm(brandScript || {}); }} className="btn-secondary">Cancel</button>
            </div>
          </div>
        ) : brandScript ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: 'Hero', value: brandScript.hero, color: 'text-blue-400' },
              { label: 'External Problem', value: brandScript.externalProblem, color: 'text-red-400' },
              { label: 'Internal Problem', value: brandScript.internalProblem, color: 'text-red-300' },
              { label: 'Philosophical Problem', value: brandScript.philosophicalProblem, color: 'text-red-200' },
              { label: 'Guide', value: brandScript.guide, color: 'text-gold-400' },
              { label: 'Empathy', value: brandScript.empathy, color: 'text-purple-400' },
              { label: 'Authority', value: brandScript.authority, color: 'text-purple-300' },
              { label: 'Plan', value: brandScript.plan.map((s, i) => `${i + 1}. ${s}`).join('\n'), color: 'text-emerald-400' },
              { label: 'Direct CTA', value: brandScript.directCta, color: 'text-gold-400' },
              { label: 'Transitional CTA', value: brandScript.transitionalCta, color: 'text-gold-300' },
              { label: 'Failure', value: brandScript.failure, color: 'text-red-400' },
              { label: 'Success', value: brandScript.success, color: 'text-emerald-400' },
            ].map((item) => (
              <div key={item.label} className="bg-navy-800 rounded-lg p-4">
                <h3 className={`text-sm font-semibold ${item.color} mb-2`}>{item.label}</h3>
                <p className="text-gray-300 text-sm whitespace-pre-line">{item.value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>No BrandScript created yet.</p>
            <button onClick={() => setEditing(true)} className="btn-primary mt-4">Create BrandScript</button>
          </div>
        )}
      </div>

      {/* Copy Generator */}
      {brandScript && (
        <div className="card">
          <h2 className="card-header flex items-center gap-2">
            <svg className="w-5 h-5 text-gold-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
            Auto-Generated Copy
          </h2>

          <div className="flex gap-2 mb-6">
            {(Object.keys(generators) as GeneratorTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveGen(tab)}
                className={activeGen === tab ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
              >
                {generators[tab].label}
              </button>
            ))}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                navigator.clipboard.writeText(generators[activeGen].generate());
              }}
              className="absolute top-3 right-3 btn-secondary text-xs"
            >
              Copy to Clipboard
            </button>
            <pre className="bg-navy-950 border border-navy-700 rounded-lg p-6 text-sm text-gray-300 overflow-x-auto whitespace-pre-wrap max-h-[600px] overflow-y-auto">
              {generators[activeGen].generate()}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
