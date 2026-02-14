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
    echo ""
    echo -e "${CYAN}Entrepreneurship${RESET}"
    echo "  4. Entrepreneurship Playbook       entrepreneurship/entrepreneurship-playbook.md"
    echo "  5. Scaling, Funding & Exiting      entrepreneurship/scaling-and-exiting.md"
    echo "  6. AI-Era Startup Strategy         entrepreneurship/ai-era-startup-strategy.md"
    echo ""
    echo -e "${CYAN}Side Hustles${RESET}"
    echo "  7. Side Hustle Playbook            side-hustles/side-hustle-playbook.md"
    echo ""
    echo -e "${CYAN}Personal Finance${RESET}"
    echo "  8. Personal Finance Blueprint      finance/personal-finance-blueprint.md"
    echo "  9. Money Psychology & Rich Life    finance/money-psychology-and-rich-life.md"
    echo " 10. Psychology of Money             finance/psychology-of-money.md"
    echo ""
    echo -e "${CYAN}Learning${RESET}"
    echo " 11. Rapid Skill Acquisition         learning/rapid-skill-acquisition.md"
    echo ""
    echo -e "${DIM}Total: 11 skills | 26 frameworks | 5 categories${RESET}"
    echo -e "${DIM}Use './skills_lookup.sh <keyword>' to search${RESET}"
}

show_tags() {
    echo -e "${BOLD}All Tags${RESET}"
    echo ""
    echo "AI, attention, automation, behavioral-psychology, behavior-change,"
    echo "brand, budgeting, business, business-ideas, co-founders,"
    echo "compound-interest, copying-framework, decision-making, DREAM-framework,"
    echo "efficiency, entrepreneurship, equity, exit-strategy, experimentation,"
    echo "fees, finance, founders-triangle, fundamentals, funding, hiring,"
    echo "human-drives, identity, investing, investors, learning, low-budget,"
    echo "marketing, market-research, mastery, moats, money-scripts, persuasion,"
    echo "positioning, practice, psychology, purpose, relationships, rich-life,"
    echo "risk-management, risk-reduction, SAFEs, sales, scaling, side-hustle,"
    echo "skill-acquisition, solo-founder, spending-plan, startup, strategy,"
    echo "testing, validation, value-creation, volume, wealth-building,"
    echo "zero-to-one, 20-hours"
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
