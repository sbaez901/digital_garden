# 🌱 Digital Garden

A beautiful, functional task management app with Pomodoro timer integration and seasonal puzzle themes.

## ✨ Features

- **Task Management**: Create, edit, and organize tasks with subtasks
- **Data Persistence**: Tasks persist across page refreshes and sessions
- **User Authentication**: Sign up and sign in with secure authentication
- **Cloud Database**: Supabase integration with localStorage fallback
- **Pomodoro Timer**: Focus sessions with work/break cycles
- **Seasonal Themes**: Beautiful garden themes for Spring, Summer, Autumn, Winter
- **Puzzle System**: Unlock puzzle pieces by completing tasks
- **Responsive Design**: Works perfectly on desktop and mobile

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/sbaez901/digital_garden.git
   cd digital_garden
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5175`

## 🗄️ Database Setup

The app uses Supabase for cloud storage with localStorage fallback.

### Supabase Setup (Optional)
1. Create a project at [supabase.com](https://supabase.com)
2. Get your project URL and API key
3. Update `src/supabasePersistence.ts` with your credentials
4. Run the SQL script in `setup-database.sql` in your Supabase dashboard

### Without Supabase
The app works perfectly with localStorage fallback - no setup required!

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL) + localStorage fallback
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## 📱 Usage

1. **Sign Up**: Create a new account with email/password
2. **Add Tasks**: Click the "+" button to create new tasks
3. **Organize**: Drag and drop to reorder tasks
4. **Complete**: Mark tasks as done to unlock puzzle pieces
5. **Focus**: Use the Pomodoro timer for focused work sessions

## 🎨 Themes

- **Spring**: Fresh greens and blooming flowers
- **Summer**: Bright colors and sunny vibes
- **Autumn**: Warm oranges and falling leaves
- **Winter**: Cool blues and snowy scenes

## 🚀 Deployment

The app is ready for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **GitHub Pages**

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## 📄 License

MIT License - feel free to use and modify!

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

**Built with ❤️ for productivity and focus** 🌱✨