import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-4">Page not found.</p>
      <Link to="/welcome" className="text-orange-500 underline">Go to Welcome</Link>
    </div>
  );
}