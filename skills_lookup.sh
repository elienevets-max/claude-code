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
    echo ""
    echo -e "${CYAN}Tools & Applications${RESET}"
    echo " 15. King of Sparklers Dashboard     king-of-sparklers/ (Next.js app)"
    echo ""
    echo -e "${DIM}Total: 25 skills | 66 frameworks | 7 categories${RESET}"
    echo -e "${DIM}Use './skills_lookup.sh <keyword>' to search${RESET}"
}

show_tags() {
    echo -e "${BOLD}All Tags${RESET}"
    echo ""
    echo "20-hours, 90-day-plan, acquisition, AI, algorithm, application, attention,"
    echo "automation, beginner, behavioral-psychology, behavioral-science,"
    echo "behavior-change, books, brand, budgeting, business, business-ideas,"
    echo "code-review, co-founders, commission, compound-interest, consistency,"
    echo "conversion, copying-framework, copywriting, correctness, creators, CTA,"
    echo "curriculum, dashboard, decision-making, DREAM-framework, ecommerce,"
    echo "efficiency, engagement, entrepreneurship, equity, error-handling,"
    echo "exit-strategy, experimentation, fees, finance, founders-triangle,"
    echo "fundamentals, funding, going-live, growth, hiring, hooks, human-drives,"
    echo "identity, investing, investors, iteration, learning, LLM, low-budget,"
    echo "marketing, market-research, mastery, moats, money-scripts, nextjs,"
    echo "operations, performance, persuasion, podcasts, positioning, practice,"
    echo "prompt-engineering, psychology, purpose, readability, relationships,"
    echo "retention, rich-life, risk-management, risk-reduction, SAFEs, sales,"
    echo "scaling, security, side-hustle, skill-acquisition, social-media,"
    echo "software-engineering, solo-founder, spending-plan, startup, strategy,"
    echo "structured-data, system-prompts, testing, tiktok, tiktok-shop, tool,"
    echo "tutorial, validation, value-creation, video, volume, wealth-building,"
    echo "zero-to-one"
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
