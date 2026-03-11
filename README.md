# 🏙️ GitHub City

A 3D visualization of GitHub developers as a futuristic city. Each developer is represented as a building, with height based on commits, width based on followers, and glow based on stars.


## ✨ Features

- 🏢 **200+ Buildings** - Each representing a real GitHub developer
- 🎨 **9 Architecture Types** - Skyscrapers, spires, towers, terraces, and more
- 🌃 **Night City Aesthetic** - Glowing windows, neon lights, atmospheric fog
- 🎮 **Two Camera Modes** - Fly mode (WASD) and Orbit mode (drag to rotate)
- 🔍 **User Search** - Find and navigate to any developer's building
- 🏠 **Personal Building** - Log in with your GitHub username to see your own building
- 📊 **Live Stats** - Hover over buildings to see developer statistics

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🌍 Live Demo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/button)

**Live URL:** [github-city.vercel.app](https://github-city.vercel.app)

## 🎮 Controls

### Fly Mode
- `W/A/S/D` - Move around
- `Mouse` - Look around
- `Q/E` - Move up/down
- `ESC` - Release mouse lock

### Orbit Mode
- `Left Click + Drag` - Rotate camera
- `Right Click + Drag` - Pan camera
- `Scroll` - Zoom in/out

## 🏗️ Building Architecture

| Type | Description |
|------|-------------|
| **Skyscraper** | Multi-tiered with setbacks |
| **Spire** | Tall, slender with tapered top |
| **Tower** | Cylindrical with observation deck |
| **Terraced** | Stepped/pyramid style |
| **Campus** | Multiple connected buildings |
| **Complex** | Main tower with side wings |
| **Pyramid** | Ancient Egypt style |
| **Compound** | Central building with corner towers |
| **Monument** | Tall, thin structures |

## 📊 Data Source

Data is loaded from `public/github_data.csv` with the following columns:
- `username` - GitHub username
- `repositories` - Public repo count
- `commits` - Estimated total commits
- `stars` - Total stars received
- `followers` - Follower count
- `primary_language` - Most used language
- `last_updated` - Data timestamp

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **3D Engine:** Three.js + React Three Fiber
- **Styling:** Tailwind CSS
- **Data:** PapaParse for CSV parsing
- **Hosting:** Vercel

## 📝 License

MIT License - feel free to use and modify!

## 🙏 Credits

- Data sourced from GitHub API
- Built with [React Three Fiber](https://docs.pmndrs.react-three-fiber.io/)
- Inspired by [GitHub City](https://github.com/honzaap/GithubCity) concept

---

Made with ❤️ by [Dharmansh Dixit](https://github.com/dixitdharmansh7)
