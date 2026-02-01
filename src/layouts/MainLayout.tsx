import { type ReactElement } from 'react';
import { Outlet } from 'react-router-dom';

export default function MainLayout(): ReactElement {
  return (
    <div className="min-h-screen bg-background" style={{ zoom: '90%' }}>
      <header className="border-b">
        {/* container ve mx-auto kaldırıldı, yerine w-full ve px-6 eklendi */}
        <div className="w-full px-6 py-4">
          <h1 className="text-xl font-semibold">WMS</h1>
        </div>
      </header>
      
      {/* Main içeriği artık ortalanmayacak, tam genişliğe yayılacak */}
      <main className="w-full px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}