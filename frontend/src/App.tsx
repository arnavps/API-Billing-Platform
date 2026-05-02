function App() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass-card max-w-lg w-full p-8 text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to <span className="text-gradient">MeterFlow</span>
        </h1>
        <p className="text-slate-400 text-lg">
          The premium API billing platform for modern businesses.
        </p>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-primary-500/20">
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App
