export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">About CyberShare</h1>
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-muted-foreground text-lg mb-4">
            CyberShare is a modern social blogging platform designed to bring writers and readers together.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">Technology Stack</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Frontend:</strong> React 18, Vite, TailwindCSS, Shadcn UI</li>
            <li><strong>Backend:</strong> Spring Boot 3.5, Spring Security, JPA/Hibernate</li>
            <li><strong>Database:</strong> MySQL with Flyway migrations</li>
            <li><strong>Authentication:</strong> JWT + Refresh Token, OAuth2 (Google)</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Features (Planned)</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>User authentication and authorization</li>
            <li>Rich text editor with Markdown support</li>
            <li>Social interactions (likes, comments, bookmarks)</li>
            <li>Follow system and personalized feed</li>
            <li>Real-time notifications</li>
            <li>Content moderation and admin panel</li>
            <li>Search and discovery features</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Development Status</h2>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-semibold text-green-600 dark:text-green-400">✅ Phase 0 - Project Initialization (Complete)</p>
            <p className="text-sm text-muted-foreground mt-2">
              Backend skeleton with Swagger, health check, and database migration is running.
              Frontend is set up with routing and basic components.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
