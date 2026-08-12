export default function AdminDebug() {
  return (
    <div className="min-h-screen bg-base flex items-center justify-center p-6">
      <div className="glass rounded-2xl p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold text-white mb-4">Admin Debug</h1>

        <div className="space-y-4 mb-6">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-sm text-green-300">
              ✅ Routing is working! You reached this page.
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-xs text-blue-300 mb-2">
              <strong>Browser Info:</strong>
            </p>
            <ul className="text-xs text-blue-300 space-y-1">
              <li>URL: {window.location.href}</li>
              <li>Pathname: {window.location.pathname}</li>
              <li>Host: {window.location.host}</li>
            </ul>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-xs text-yellow-300 mb-2">
              <strong>Next Steps:</strong>
            </p>
            <ol className="text-xs text-yellow-300 space-y-1 list-decimal list-inside">
              <li>Go back and navigate to /admin/</li>
              <li>If you see a login page → routing works ✅</li>
              <li>If you see this page → there's a route issue</li>
            </ol>
          </div>
        </div>

        <a
          href="/admin/"
          className="block text-center rounded-lg bg-gradient-btn px-4 py-2 text-white font-semibold hover:opacity-90 transition"
        >
          Go to Admin Dashboard
        </a>
      </div>
    </div>
  );
}
