# Cellular 2048

A unique fusion of Conway's Game of Life and 2048 mechanics. Swipe to merge cells, watch them evolve through Life ticks, and navigate progressive hazards in this deterministic puzzle game.

## 🎮 How to Play

### Objective
Merge cells to reach higher energy levels while managing Conway's Life mechanics. Survive hazards, build streaks, and achieve the highest score possible.

### Controls
- **Arrow Keys** or **WASD**: Swipe cells in any direction
- **R**: Reset the game
- **G**: Toggle Life preview overlay (shows predicted births/deaths)
- **Mouse/Touch**: Swipe gestures on the game board

### Game Mechanics

#### Swiping & Merging
- Cells slide in the swipe direction until they hit a wall or another cell
- Adjacent cells with the same energy level merge into one cell with energy+1
- Merging cells awards points based on energy level and streak multiplier
- Only one merge per cell per swipe

#### Conway's Life Tick
After every swipe, a Life tick occurs:
- **Birth**: Empty cells with 2-3 alive neighbors become alive (energy = average of neighbors)
- **Death**: Cells with 0-1 or 4+ neighbors die
- **Survival**: Cells with 2-3 neighbors stay alive
- Life ticks can create cascading patterns and unexpected interactions

#### Dormancy System
- Cells that don't merge for multiple turns become **dormant** (gray)
- Dormant cells can't merge but still participate in Life ticks
- Merge or swipe dormant cells to wake them up

#### Scoring
- **Base score**: Energy level of merged cell
- **Streak multiplier**: Increases with consecutive merge turns
- **Colony bonus**: Extra points for large connected groups
- **Life births**: Bonus points when Life creates new cells

#### Hazards (Progressive Difficulty)
- **Blight**: Infectious hazard cells that spread and reduce energy
- **Catalysts**: Random cells that trigger merges or transformations
- **Decay**: Isolated cells lose energy over time

### Winning & Losing
- **Win**: Reach the stabilization energy threshold (typically 25+ total energy)
- **Lose**: Run out of valid moves (board full with no merges possible)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or npm/pnpm/yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/Bbeierle12/Cellular-2048.git
cd Cellular-2048

# Install dependencies
npm install
# or
pnpm install
```

### Development
```bash
# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── engine/           # Core game logic (pure functions)
│   ├── actions/      # Swipe, merge, catalyst actions
│   ├── grid/         # Grid data structures and utilities
│   ├── hazards/      # Blight spawn logic
│   ├── lifecycle/    # Life tick, decay, dormancy
│   ├── rng/          # Seeded random number generation
│   ├── scoring/      # Score calculation and streaks
│   └── telemetry/    # Event tracking
├── state/            # Redux-style state management
│   ├── types.ts      # GameState, actions, configs
│   ├── reducers.ts   # Pure game reducer
│   ├── selectors.ts  # State selectors
│   └── board-serializer.ts
├── ui/               # React components
│   ├── components/   # GridCanvas, ScorePanel, EnergyRing, etc.
│   ├── hooks/        # Custom React hooks
│   ├── styles/       # CSS modules
│   └── App.tsx       # Root component
├── services/         # External integrations
│   ├── analytics.ts  # Analytics buffer & aggregator
│   └── telemetry-client.ts # Telemetry sinks
└── utils/            # Shared utilities

tests/
├── engine/           # Unit tests for engine logic
├── integration/      # End-to-end game flow tests
├── property/         # Property-based invariant tests
└── ui/               # Component tests

docs/
├── DESIGN.md         # Detailed game design doc
├── PLAN.md           # Development roadmap
├── RULEBOOK/         # Rule specifications
└── UX/              # Accessibility & wireframes
```

## 🧪 Testing

The project has comprehensive test coverage:
- **46+ unit tests** for engine logic
- **10 integration tests** for full game flow
- **21 property-based tests** for determinism & invariants
- **Component tests** for UI elements

```bash
# Run all tests
npm test

# Run specific test file
npm test swipe.spec.ts

# Watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
```

## ♿ Accessibility

Cellular 2048 follows WCAG 2.1 Level AA guidelines:
- Full keyboard navigation support
- ARIA labels and live regions for screen readers
- High contrast mode support
- Reduced motion support
- Focus indicators

See [docs/UX/accessibility.md](docs/UX/accessibility.md) for details.

## 📊 Telemetry & Analytics

The game includes optional telemetry for gameplay analysis:
- Turn-by-turn event tracking
- Score progression analytics
- Pattern detection (merges, births, deaths)
- Session management with localStorage persistence

Export telemetry data from browser console:
```javascript
exportTelemetry()  // Downloads JSON report
clearTelemetry()   // Clears stored data
```

## 🎨 Customization

### Difficulty Levels
Three difficulty configurations in `config/difficulty/`:
- **Early** (6×6 grid, no hazards)
- **Mid** (6×6 grid, decay enabled)
- **Late** (6×6 grid, all hazards)

### Feature Flags
Toggle features in `config/feature-flags.ts`:
- Blight hazards
- Catalysts
- Decay
- Telemetry

## 🛠️ Technology Stack

- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 5** - Build tool & dev server
- **Vitest** - Test framework
- **Canvas API** - Grid rendering

## 📖 Documentation

- [Design Document](docs/DESIGN.md) - Comprehensive game design
- [Development Plan](docs/PLAN.md) - Phase-by-phase roadmap
- [Rulebook](docs/RULEBOOK/) - Detailed rule specifications
- [Accessibility Guide](docs/UX/accessibility.md) - A11y features & testing

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Inspired by Conway's Game of Life and 2048
- Built with modern web technologies and accessibility-first design

## 📫 Contact

- GitHub: [@Bbeierle12](https://github.com/Bbeierle12)
- Repository: [Cellular-2048](https://github.com/Bbeierle12/Cellular-2048)

---

**Version**: 0.1.0-phase5  
**Status**: ✅ Phase 5 Complete - Telemetry, QA, & Polish

