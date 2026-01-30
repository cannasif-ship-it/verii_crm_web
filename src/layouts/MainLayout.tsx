import { type ReactElement } from 'react';
import { Outlet } from 'react-router-dom';

export default function MainLayout(): ReactElement {
  return (
    // 👇 BURAYA style={{ zoom: '90%' }} EKLENDİ
    <div className="min-h-screen bg-background" style={{ zoom: '90%' }}>
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold">WMS</h1>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}