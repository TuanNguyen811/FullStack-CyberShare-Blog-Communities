import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { healthAPI, actuatorAPI } from '@/lib/api';

export default function HomePage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await healthAPI.check();
      setHealthStatus(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkActuator = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await actuatorAPI.health();
      setHealthStatus(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome to CyberShare
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          A modern social blogging platform built with React, Spring Boot, and love ❤️
        </p>

        <div className="flex justify-center gap-4 mb-12">
          <Button size="lg" onClick={checkHealth} disabled={loading}>
            {loading ? 'Checking...' : 'Check API Health'}
          </Button>
          <Button size="lg" variant="outline" onClick={checkActuator} disabled={loading}>
            {loading ? 'Checking...' : 'Check Actuator'}
          </Button>
        </div>

        {healthStatus && (
          <div className="bg-card border rounded-lg p-6 text-left">
            <h3 className="text-lg font-semibold mb-4">Health Check Response:</h3>
            <pre className="bg-muted p-4 rounded overflow-auto text-sm">
              {JSON.stringify(healthStatus, null, 2)}
            </pre>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">📝 Write & Share</h3>
            <p className="text-muted-foreground">
              Create and publish your stories with our powerful Markdown editor
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">👥 Connect</h3>
            <p className="text-muted-foreground">
              Follow authors, engage with content through likes and comments
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="text-xl font-semibold mb-2">🔍 Discover</h3>
            <p className="text-muted-foreground">
              Explore trending topics and personalized recommendations
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-lg font-semibold mb-2">🚀 Phase 0 Complete!</h3>
          <p className="text-muted-foreground">
            Backend skeleton is running with Swagger, Health Check, and Database Migration.
            Frontend is set up with React Router, TailwindCSS, and Shadcn UI.
          </p>
        </div>
      </div>
    </div>
  );
}
