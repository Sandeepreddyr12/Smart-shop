'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import RecomProducts from './recomProducts';




function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

// Add smooth animations
const tabContentStyles = `
  @keyframes fadeInUp {
    from { 
      opacity: 0; 
      transform: translateY(20px); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0); 
    }
  }
  
  @keyframes fadeOutDown {
    from { 
      opacity: 1; 
      transform: translateY(0); 
    }
    to { 
      opacity: 0; 
      transform: translateY(-20px); 
    }
  }
  
  .tab-content-enter {
    animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  
  .tab-content-exit {
    animation: fadeOutDown 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
`;

function TabSwitcher({
  active,
  onTabChange,
}: {
  active: 'cold-start' | 'user-based';
  onTabChange: (tab: 'cold-start' | 'user-based') => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{
    width: number;
    x: number;
  }>({ width: 0, x: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button[data-tab]')
    );
    const activeIndex = active === 'cold-start' ? 0 : 1;
    const activeBtn = buttons[activeIndex];
    if (!activeBtn) return;
    setIndicatorStyle({
      width: activeBtn.offsetWidth,
      x: activeBtn.offsetLeft,
    });
  }, [active]);

  return (
    <div
      className="mb-8 max-w-md mx-auto bg-gray-200/80 p-1.5 rounded-lg relative flex items-center"
      ref={containerRef}
    >
      <div
        className="absolute top-0 left-0 h-full rounded-lg shadow transition-all duration-400 ease-out"
        style={{
          width: indicatorStyle.width,
          transform: `translateX(${indicatorStyle.x}px)`,
          backgroundImage: 'linear-gradient(to right, #3b82f6, #60a5fa)',
          boxShadow:
            '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        }}
      />
      <nav className="flex-1 flex" aria-label="Tabs">
        <button
          className={classNames(
            'flex-1 text-center whitespace-nowrap py-3 px-4 font-semibold text-sm rounded-md relative z-10 transition-all duration-300 ease-in-out hover:scale-105',
            active === 'cold-start' ? 'text-white' : 'text-gray-600'
          )}
          data-tab="cold-start"
          onClick={() => onTabChange('cold-start')}
        >
          🚀 New Visitor
        </button>
        <button
          className={classNames(
            'flex-1 text-center whitespace-nowrap py-3 px-4 font-semibold text-sm rounded-md relative z-10 transition-all duration-300 ease-in-out hover:scale-105',
            active === 'user-based' ? 'text-white' : 'text-gray-600'
          )}
          data-tab="user-based"
          onClick={() => onTabChange('user-based')}
        >
          👤 Active Shopper
        </button>
      </nav>
    </div>
  );
}

function NewUser() {
 

  return (
    <div>
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">
          Welcome! Starting Your Journey
        </h2>
        <p className="text-gray-600">
          Since you&apos;re new, we start by showing what&apos;s popular and
          trending. This helps you discover great products right away without
          any prior activity.
        </p>
      </div>
        <RecomProducts userId="newUser" />
    </div>
  );
}


function UserBased() {
  const [userId, setUserId] = useState<string>('newUser');
  
  const canFetch = useMemo(() => {
    const idNum = Number(userId);
    return Number.isInteger(idNum) && idNum >= 0 && idNum <= 199;
  }, [userId]);

  

  return (
    <div className=" mx-auto">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-3 text-gray-900">
          Find Recommendations
        </h2>
        <p className="text-gray-600 mb-6">
          Enter a user ID from 0 to 199 to see personalized suggestions based on
          their activity.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <input
          type="number"
          min={0}
          max={199}
          placeholder="Enter User ID (e.g., 42)"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full sm:w-64 px-4 py-3 text-center bg-gray-100 border-2 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
        />
        <button
        //   onClick={fetchRecommendations}
          // disabled={!canFetch || loading}
          className="w-full sm:w-auto bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105"
        >
          {/* {loading ? 'Fetching…' : 'Fetch Results'} */}
          fetch
        </button>
      </div>
      <div className="mt-6 min-h-6 text-center text-sm text-red-500">
        {/* {error} */}
        error
      </div>
     <RecomProducts userId = {userId}  />
    </div>
  );
}

export default function RecommendationPlaygroundPage() {
  const [activeTab, setActiveTab] = useState<'cold-start' | 'user-based'>(
    'cold-start'
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: tabContentStyles }} />
      <div className="container mx-auto  max-w-5xl text-gray-800">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Recommendation Playground
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            See how our system tailors the perfect experience for you.
          </p>
        </header>
        <TabSwitcher active={activeTab} onTabChange={setActiveTab} />
        <main className="bg- w-full  rounded-2xl shadow-lg border border-gray-200/80 min-h-[400px]">
          <div className="relative">
            {/* Cold Start Content */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                activeTab === 'cold-start'
                  ? 'opacity-100 translate-y-0 tab-content-enter'
                  : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
              }`}
            >
              <NewUser />
            </div>

            {/* User Based Content */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                activeTab === 'user-based'
                  ? 'opacity-100 translate-y-0 tab-content-enter'
                  : 'opacity-0 translate-y-4 absolute inset-0 pointer-events-none'
              }`}
            >
              <UserBased />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
