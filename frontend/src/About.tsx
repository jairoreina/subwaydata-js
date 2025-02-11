import { Header } from './components/Header';

export function About() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 text-white">
        <h1 className="text-3xl font-bold mb-6">About NYC Subway Data Explorer</h1>
        {/* Add your about content here */}
      </main>
    </div>
  );
} 