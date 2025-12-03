# Project Hub - Comprehensive Management Application

A full-featured management dashboard for tracking projects, tasks, procurement plans, and analytics with Excel import/export capabilities.

## 🚀 Live Demo

**Deployed on Vercel:** [Coming Soon]

## 📋 Features

### Core Modules
- **Dashboard** - Overview with interactive charts and statistics
- **Projects & Tasks** - Split-screen project and task management
- **Procurement** - Excel import, automated project creation from procurement items
- **Work Timer** - Time tracking with mandatory log updates
- **Analysis** - Insights, trends, and Excel export capabilities

### Additional Modules
- **Focal Points** - Contact and stakeholder management
- **Risks** - Risk identification and tracking
- **Savings** - Cost savings tracking and reporting
- **Unplanned Items** - Ad-hoc task management
- **Completed Items** - Archive and completion tracking
- **Upcoming Projects** - Future planning with email reminders

### System Features
- ✅ **Dark/Light Mode** - Theme toggle with persistent preference
- ✅ **Excel Import/Export** - Bulk data import and detailed reports
- ✅ **PDF Export** - Generate comprehensive work logs
- ✅ **Notifications** - Toast notifications for all actions
- ✅ **Data Persistence** - localStorage for offline capability
- ✅ **Responsive Design** - Mobile-friendly interface
- ✅ **Collapsible Sidebar** - Optimized workspace layout

## 🛠️ Technology Stack

- **Frontend Framework:** React 18.3.1 + TypeScript
- **Build Tool:** Vite 5.3.4
- **Styling:** Tailwind CSS 4.0
- **Charts:** Recharts 2.10.3
- **Excel Processing:** XLSX 0.18.5
- **PDF Generation:** jsPDF 2.5.1 + html2canvas 1.4.1
- **Forms:** React Hook Form 7.55.0
- **Icons:** Lucide React 0.263.1
- **Notifications:** Sonner 2.0.3
- **Date Handling:** date-fns 2.30.0

## 📦 Installation

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Local Development

```bash
# Clone the repository
git clone https://github.com/r4mxae/project-hub.git
cd project-hub

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173
```

### Build for Production

```bash
# Type check (optional)
npm run type-check

# Build
npm run build

# Preview production build
npm run preview

# Open http://localhost:4173
```

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/r4mxae/project-hub)

**Manual Deployment:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import `r4mxae/project-hub`
   - Framework Preset: **Vite** (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy:**
   - Click "Deploy"
   - Wait ~2 minutes
   - Your app is live! 🎉

### Automatic Deployments

- Push to `main` branch → Production deployment
- Push to feature branch → Preview deployment

## 📊 Project Structure

```
project-hub/
├── components/
│   ├── Analysis.tsx          # Analytics and insights
│   ├── Completed.tsx          # Completed items archive
│   ├── Dashboard.tsx          # Main dashboard with charts
│   ├── FocalPoints.tsx        # Contact management
│   ├── Procurement.tsx        # Procurement tracking
│   ├── Projects.tsx           # Project management (legacy)
│   ├── ProjectsAndTasks.tsx   # Combined split-screen view
│   ├── Risks.tsx              # Risk management
│   ├── Savings.tsx            # Savings tracking
│   ├── Settings.tsx           # App settings
│   ├── Sidebar.tsx            # Navigation sidebar
│   ├── Tasks.tsx              # Task management (legacy)
│   ├── Upcoming.tsx           # Upcoming projects
│   └── ui/                    # Reusable UI components
├── utils/
│   └── darkMode.ts            # Dark mode utilities
├── styles/
│   └── globals.css            # Global styles & Tailwind
├── App.tsx                    # Main application component
├── main.tsx                   # React entry point
├── index.html                 # HTML template
├── vite.config.ts             # Vite configuration
├── tsconfig.json              # TypeScript configuration
├── vercel.json                # Vercel deployment config
└── package.json               # Dependencies & scripts
```

## 💾 Data Storage

- **Local Storage:** All data is stored in browser localStorage
- **No Backend:** Pure frontend application
- **Privacy:** Data stays on user's device
- **Backup:** Use Excel export feature for data backup

## 🔧 Configuration

### Build Settings (Vercel)

| Setting | Value |
|---------|-------|
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 18.x |

### Environment Variables

No environment variables required. This is a pure frontend application.

## 📖 Usage Guides

- **[Excel Import Guide](./EXCEL_IMPORT_GUIDE.md)** - How to import procurement data
- **[Quick Start](./QUICK_START.md)** - Getting started guide
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Detailed deployment instructions

## 🎨 Features in Detail

### Dashboard
- Real-time project statistics
- Interactive charts (Recharts)
- Status distribution
- Completion trends
- Quick access cards

### Projects & Tasks
- Split-screen layout
- PR number and negotiation number fields
- Status tracking (Planning, In Progress, On Hold, Completed, Cancelled)
- Priority management (Low, Medium, High, Critical)
- Due date tracking
- Work log integration

### Procurement Planning
- Excel import (XLSX format)
- Automatic project creation from imported items
- Bulk data processing
- Data validation
- Error handling for date formats

### Work Timer System
- Start/stop timer for tasks
- Mandatory log updates
- Time tracking per project/task
- Work log history
- Excel export of logs

### Analysis Module
- Trend analysis
- Performance insights
- Data visualization
- Export capabilities
- Custom date ranges

## 🐛 Known Issues & Fixes

All critical bugs have been resolved:
- ✅ Date validation fixed
- ✅ Excel date format handling improved
- ✅ OKLCH color function errors resolved
- ✅ Build configuration optimized
- ✅ TypeScript strict mode adjusted

See [FIXES_APPLIED.md](./FIXES_APPLIED.md) for details.

## 📄 License

This project is private and proprietary.

## 👤 Author

**GitHub:** [@r4mxae](https://github.com/r4mxae)

**Repository:** [project-hub](https://github.com/r4mxae/project-hub)

## 🤝 Contributing

This is a personal project. For issues or suggestions:

1. Open an issue on GitHub
2. Describe the problem or feature request
3. Include screenshots if applicable

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting guides

## 🚀 Roadmap

Future enhancements:
- [ ] Multi-user support (with authentication)
- [ ] Cloud data sync
- [ ] Advanced analytics
- [ ] Email integration
- [ ] Mobile app version
- [ ] API integration capabilities

## ⚡ Performance

### Build Statistics
- **Bundle Size:** ~1.4 MB raw, ~464 KB gzipped
- **Initial Load:** < 1 second (fast connection)
- **Cached Load:** < 100ms
- **Lighthouse Score:** 90+ performance

### Optimization Techniques
- Code splitting by vendor
- Lazy loading
- Asset optimization
- Tree shaking
- Minification

## 🔒 Security

- Client-side only application
- No external data transmission
- No API keys required
- LocalStorage encryption recommended for sensitive data
- Not recommended for PII or highly sensitive data

## 🎯 Best Practices

### Data Management
- Regular Excel exports for backup
- Clear unused data periodically
- Use meaningful project/task names
- Keep logs updated

### Performance
- Clear browser cache if experiencing issues
- Use modern browsers (Chrome, Firefox, Edge, Safari)
- Limit number of active projects/tasks

### Deployment
- Always test locally before deploying
- Review build logs for warnings
- Monitor Vercel analytics
- Set up custom domain for production

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vercel Documentation](https://vercel.com/docs)

## ✨ Acknowledgments

Built with modern web technologies and best practices.

Special thanks to:
- React team
- Vite team
- Tailwind CSS team
- Vercel team
- Open source community

---

**Made with ❤️ by [@r4mxae](https://github.com/r4mxae)**

**Last Updated:** December 2, 2025
