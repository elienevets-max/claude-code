#!/usr/bin/env bash
#
# skills_lookup.sh — Search the knowledge base from the command line
#
# Usage:
#   ./skills_lookup.sh                    # List all skills (categorized)
#   ./skills_lookup.sh <keyword>          # Search by keyword, tag, or topic
#   ./skills_lookup.sh --tags             # List all available tags
#   ./skills_lookup.sh --frameworks       # List all frameworks
#   ./skills_lookup.sh --situation "..."  # Find skill by situation
#
# Examples:
#   ./skills_lookup.sh marketing
#   ./skills_lookup.sh "side hustle"
#   ./skills_lookup.sh --tags
#   ./skills_lookup.sh --situation "I have a business idea"

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INDEX_FILE="$SCRIPT_DIR/skills_index.md"

# Colors (if terminal supports them)
if [ -t 1 ]; then
    BOLD='\033[1m'
    DIM='\033[2m'
    CYAN='\033[36m'
    GREEN='\033[32m'
    YELLOW='\033[33m'
    RESET='\033[0m'
else
    BOLD='' DIM='' CYAN='' GREEN='' YELLOW='' RESET=''
fi

show_all() {
    echo -e "${BOLD}Knowledge Base — All Skills${RESET}"
    echo ""
    echo -e "${CYAN}Business & Marketing${RESET}"
    echo "  1. Business Fundamentals          business/business-fundamentals.md"
    echo "  2. Marketing Psychology            business/marketing-psychology.md"
    echo "  3. Business Validation             business/business-validation-playbook.md"
    echo "  4. Marketing Learning Resources    business/marketing-learning-resources.md"
    echo ""
    echo -e "${CYAN}Entrepreneurship${RESET}"
    echo "  5. Entrepreneurship Playbook       entrepreneurship/entrepreneurship-playbook.md"
    echo "  6. Scaling, Funding & Exiting      entrepreneurship/scaling-and-exiting.md"
    echo "  7. AI-Era Startup Strategy         entrepreneurship/ai-era-startup-strategy.md"
    echo "  8. Ecommerce Playbook              entrepreneurship/ecommerce-playbook-knowledge.md"
    echo ""
    echo -e "${CYAN}Side Hustles${RESET}"
    echo "  9. Side Hustle Playbook            side-hustles/side-hustle-playbook.md"
    echo ""
    echo -e "${CYAN}Personal Finance${RESET}"
    echo " 10. Personal Finance Blueprint      finance/personal-finance-blueprint.md"
    echo " 11. Money Psychology & Rich Life    finance/money-psychology-and-rich-life.md"
    echo " 12. Psychology of Money             finance/psychology-of-money.md"
    echo ""
    echo -e "${CYAN}TikTok Growth & Marketing${RESET}"
    echo " 13. TikTok Knowledge Base           tiktok/README.md"
    echo "     - TikTok Growth Strategies      tiktok/tiktok-growth-strategies.md"
    echo "     - TikTok Marketing (10 skills)  tiktok/tiktok-marketing/"
    echo "     - Crushing It (10 skills)       tiktok/crushing-it-tiktok/"
    echo "     - Hacks for TikTok (12 skills)  tiktok/hacks-for-tiktok/"
    echo " 16. TikTok Shop Creator Tutorial  tiktok/tiktok-shop-creator-tutorial-knowledge-extraction.md"
    echo ""
    echo -e "${CYAN}Learning${RESET}"
    echo " 14. Rapid Skill Acquisition         learning/rapid-skill-acquisition.md"
    echo " 23. Prompt Engineering Mastery      learning/prompt-engineering-mastery.md"
    echo " 25. Code Reviewer                   learning/code-reviewer.md"
    echo " 30. Thinking, Fast and Slow         learning/thinking-fast-and-slow.md"
    echo " 31. Superforecasting                learning/superforecasting.md"
    echo " 32. Rationality                     learning/rationality.md"
    echo ""
    echo -e "${CYAN}Tools & Applications${RESET}"
    echo " 15. King of Sparklers Dashboard     king-of-sparklers/ (Next.js app)"
    echo ""
    echo -e "${DIM}Total: 32 skills | 138 frameworks | 7 categories${RESET}"
    echo -e "${DIM}Use './skills_lookup.sh <keyword>' to search${RESET}"
}

show_tags() {
    echo -e "${BOLD}All Tags${RESET}"
    echo ""
    echo "20-hours, 90-day-plan, acquisition, AI, algorithm, application, attention,"
    echo "automation, Bayesian-reasoning, Bayesian-updating, beginner,"
    echo "behavioral-psychology, behavioral-science, behavior-change, books, brand,"
    echo "budgeting, business, business-ideas, clear-thinking, code-review,"
    echo "co-founders, cognitive-bias, commission, compound-interest, consistency,"
    echo "conversion, copying-framework, copywriting, correctness, creators, CTA,"
    echo "curriculum, dashboard, debiasing, decision-making, DREAM-framework,"
    echo "ecommerce, efficiency, engagement, entrepreneurship, epistemology,"
    echo "equity, error-handling, exit-strategy, experimentation, falsifiability,"
    echo "fees, finance, founders-triangle, fundamentals, funding, going-live,"
    echo "growth, hiring, hooks, human-drives, identity, investing, investors,"
    echo "iteration, learning, LLM, low-budget, marketing, market-research,"
    echo "mastery, moats, money-scripts, motivated-reasoning, nextjs, operations,"
    echo "performance, persuasion, podcasts, poker, positioning, practice,"
    echo "prediction, prompt-engineering, psychology, purpose, rationality,"
    echo "readability, relationships, retention, rich-life, risk-management,"
    echo "risk-reduction, SAFEs, sales, scaling, security, side-hustle,"
    echo "skill-acquisition, social-media, software-engineering, solo-founder,"
    echo "spending-plan, startup, strategy, structured-data, system-prompts,"
    echo "testing, tiktok, tiktok-shop, tool, tutorial, validation,"
    echo "value-creation, video, volume, wealth-building, zero-to-one"
}

show_frameworks() {
    echo -e "${BOLD}Key Frameworks${RESET}"
    echo ""
    echo -e "${GREEN}Business & Marketing${RESET}"
    echo "  Five Parts of Every Business     — Value Creation, Marketing, Sales, Delivery, Finance"
    echo "  Iron Law of the Market           — No market = nothing else matters"
    echo "  Gall's Law                       — Complex systems evolve from simple ones"
    echo "  Five Core Human Drives           — Acquire, Bond, Learn, Defend, Feel"
    echo "  \"Piss Off the 80%\" Rule          — Polarization beats lukewarm"
    echo ""
    echo -e "${GREEN}Validation & Testing${RESET}"
    echo "  5-Phase Validation               — Discovery > Validation > Design > Test > Decision"
    echo "  Credit Card Test                 — Pre-orders beat compliments"
    echo "  Copying Framework                — Start where competitors are today"
    echo "  Mirage Opportunities             — If nobody's made it work, skip it"
    echo ""
    echo -e "${GREEN}Entrepreneurship${RESET}"
    echo "  Passion-First Principle          — Start with passion, not originality"
    echo "  Three-Step Sales Process         — Listen, Present, Close"
    echo "  Staircase Philosophy             — Build PR one step at a time"
    echo "  6 Funding Methods                — Family, team, angels, VCs, clients, crowdfunding"
    echo "  7-and-8 Firing Rule              — Fire the 7s before you lose the 9s"
    echo "  5 Exit Strategies                — Acquisition, merger, IPO, MBO, liquidation"
    echo ""
    echo -e "${GREEN}AI-Era Strategy${RESET}"
    echo "  Founder's Triangle               — Domain + Craft depth + Distribution"
    echo "  DREAM Framework                  — Demand, Revenue, Engine, Admin, Marketing"
    echo "  Three AI-Proof Moats             — Counterpositioning, sticky habits, proprietary data"
    echo ""
    echo -e "${GREEN}Ecommerce${RESET}"
    echo "  Bullseye Method                  — Test 19 growth channels, focus on top 3"
    echo "  Customer Value Journey           — 8 stages from Awareness to Promotion"
    echo "  Dream 100                        — Target 100 transformative accounts"
    echo "  StoryBrand BrandScript           — Customer = hero, Brand = guide"
    echo ""
    echo -e "${GREEN}TikTok${RESET}"
    echo "  Credibility Flywheel             — Content > Creators > Community > Credibility > Growth"
    echo "  Hook Engineering                 — First-second attention capture"
    echo "  3-Phase Marketing Curriculum     — Foundational > Intermediate > Advanced (34 books)"
    echo "  Three-Criteria Product Selection — Momentum + Inventory Depth + High Commission"
    echo "  Viral Video Formula              — Hook + Information + CTA"
    echo "  CTA Multiplier Effect            — Strong CTA on fewer views > weak CTA on many"
    echo "  Compounding Timeline Model       — 30-60 days before income; 90% quit early"
    echo ""
    echo -e "${GREEN}Finance${RESET}"
    echo "  Conscious Spending Plan          — Fixed 50-60%, Save 5-10%, Invest 5-10%, Free 20-35%"
    echo "  10 Money Rules                   — Ramit's non-negotiable principles"
    echo "  Childhood Money Scripts          — Unconscious beliefs from upbringing"
    echo "  Behavior > Intelligence          — How you act > what you know"
    echo "  Tail Events                      — A few wins drive all returns"
    echo "  \"Enough\" Framework               — Define it or destroy wealth chasing more"
    echo "  Room for Error                   — Plan on your plan not going to plan"
    echo ""
    echo -e "${GREEN}Learning${RESET}"
    echo "  20-Hour Mastery                  — Zero to reasonably good in 20 hours"
    echo "  Key Prompt Structure Template    — Context, Instructions, Output Format, Rules, Example"
    echo "  Monte Carlo Prompt Testing       — Run prompt N times; measure consistency"
    echo "  Spartan Tone Principle           — Direct, minimal, no filler in prompts and output"
    echo "  Information Density Principle    — Every token must carry meaning; shorter = better"
    echo "  One-Shot Goldilocks Zone         — One example often optimal; diminishing returns after"
    echo "  Four-Dimension Review            — Correctness, Readability, Performance, Security"
    echo "  Zero-Context Review Protocol     — Unbiased review with no prior codebase knowledge"
    echo "  Severity Ranking System          — High / Medium / Low finding classification"
    echo ""
    echo -e "${GREEN}Decision-Making (Kahneman)${RESET}"
    echo "  System 1 / System 2              — Fast intuitive vs slow deliberate thinking"
    echo "  Prospect Theory (Four-Fold)      — Risk-averse for gains, risk-seeking for losses"
    echo "  Pre-Mortem                       — Imagine failure, work backward to find risks"
    echo "  Reference Class Forecasting      — Estimate from base rates, not optimistic narratives"
    echo "  WYSIATI                          — You build stories from incomplete data"
    echo "  Anchoring Effect                 — First number biases all estimates"
    echo "  Peak-End Rule                    — Experiences judged by peak + ending, not duration"
    echo "  10-Point Decision Checklist      — Pre-decision bias scan for major decisions"
    echo ""
    echo -e "${GREEN}Rationality & Epistemology (Yudkowsky)${RESET}"
    echo "  Map/Territory Distinction        — Beliefs are a model; update the model, not reality"
    echo "  Motivated Reasoning / Bottom Line— Brain writes conclusions first, then justifications"
    echo "  Making Beliefs Pay Rent          — Every belief must generate testable predictions"
    echo "  Bayesian Framework               — Update proportional to how diagnostic evidence is"
    echo "  Semantic Stopsign Detection      — Words that feel like explanations but stop inquiry"
    echo "  Cached Thought Identification    — Pre-formed opinions retrieved instead of reasoned"
    echo "  Privileging the Hypothesis       — Testing a hypothesis for non-evidential reasons"
    echo "  Rationalist Taboo                — Replace vague terms; if argument collapses, it wasn't one"
    echo "  Litany of Tarski                 — If X is true, I desire to believe X is true"
    echo "  Belief Audit Playbook            — 7-step structured belief audit"
}

search_keyword() {
    local keyword="$1"
    echo -e "${BOLD}Searching for: ${YELLOW}${keyword}${RESET}"
    echo ""

    local found=0

    # Search through all markdown files in subdirectories
    while IFS= read -r file; do
        if grep -qi "$keyword" "$file" 2>/dev/null; then
            local rel_path="${file#$SCRIPT_DIR/}"
            local title
            title=$(head -1 "$file" | sed 's/^# //')
            echo -e "${GREEN}$title${RESET}"
            echo -e "  ${DIM}$rel_path${RESET}"

            # Show matching context lines (first 3 matches)
            grep -n -i --color=never "$keyword" "$file" 2>/dev/null | head -3 | while IFS= read -r line; do
                echo -e "  ${DIM}$line${RESET}"
            done
            echo ""
            found=$((found + 1))
        fi
    done < <(find "$SCRIPT_DIR" -mindepth 2 -name "*.md" -type f | sort)

    # Also search the index
    if grep -qi "$keyword" "$INDEX_FILE" 2>/dev/null; then
        echo -e "${CYAN}Also found in: skills_index.md${RESET}"
        grep -n -i --color=never "$keyword" "$INDEX_FILE" 2>/dev/null | head -5 | while IFS= read -r line; do
            echo -e "  ${DIM}$line${RESET}"
        done
        echo ""
    fi

    if [ $found -eq 0 ]; then
        echo "No matches found for '$keyword'."
        echo "Try: ./skills_lookup.sh --tags  (to see all available tags)"
    else
        echo -e "${DIM}Found in $found file(s)${RESET}"
    fi
}

show_situation() {
    local query="$1"
    echo -e "${BOLD}Situation Lookup${RESET}"
    echo ""
    echo -e "${YELLOW}\"$query\"${RESET}"
    echo ""

    # Search the situation table in the index
    grep -i "$query" "$INDEX_FILE" 2>/dev/null | while IFS= read -r line; do
        echo "  $line"
    done

    if ! grep -qi "$query" "$INDEX_FILE" 2>/dev/null; then
        echo "No exact situation match. Searching all files..."
        echo ""
        search_keyword "$query"
    fi
}

# Main
case "${1:-}" in
    "")
        show_all
        ;;
    --tags)
        show_tags
        ;;
    --frameworks)
        show_frameworks
        ;;
    --situation)
        if [ -z "${2:-}" ]; then
            echo "Usage: ./skills_lookup.sh --situation \"your situation here\""
            exit 1
        fi
        show_situation "$2"
        ;;
    --help|-h)
        echo "Usage:"
        echo "  ./skills_lookup.sh                    List all skills"
        echo "  ./skills_lookup.sh <keyword>          Search by keyword"
        echo "  ./skills_lookup.sh --tags             List all tags"
        echo "  ./skills_lookup.sh --frameworks       List all frameworks"
        echo "  ./skills_lookup.sh --situation \"...\"   Find by situation"
        echo "  ./skills_lookup.sh --help             Show this help"
        ;;
    *)
        search_keyword "$*"
        ;;
esac
