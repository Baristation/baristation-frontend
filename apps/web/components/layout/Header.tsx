'use client';

import { Button } from '@coffee-service/ui-library';
import { Bookmark, User, LogOut, Home, Coffee, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/use-auth';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const desktopStyles = isHomePage
    ? isScrolled
      ? 'md:border-b md:border-white/10 md:bg-[#1A1614]/85 md:text-white md:shadow-sm md:backdrop-blur-md'
      : 'md:bg-transparent md:text-white'
    : 'md:bg-[#1A1614] md:text-white md:shadow-sm md:border-b md:border-white/10';

  const mobileStyles =
    'fixed bottom-0 z-50 w-full bg-white text-gray-500 border-t border-gray-200 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:top-0 md:bottom-auto md:border-t-0 md:pb-0';

  return (
    <header className={`${mobileStyles} ${desktopStyles} transition-colors duration-300`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-around px-4 sm:px-6 md:justify-between lg:px-8">
        {/* Logo (Desktop Only) */}
        <Link
          href="/"
          className="font-playfair hidden text-2xl font-bold tracking-tighter md:block"
        >
          Baristation
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden space-x-8 text-sm font-medium md:flex">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/beans" className="hover:text-primary transition-colors">
            Bean Info
          </Link>
          <Link href="/classes" className="hover:text-primary transition-colors">
            Classes
          </Link>
        </nav>

        {/* Mobile Navigation (Bottom Tabs) */}
        <div className="flex w-full items-center justify-around md:hidden">
          <Link
            href="/"
            className={`flex flex-col items-center gap-1 ${
              pathname === '/' ? 'text-amber-600' : 'hover:text-gray-900'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <Link
            href="/beans"
            className={`flex flex-col items-center gap-1 ${
              pathname.startsWith('/beans') ? 'text-amber-600' : 'hover:text-gray-900'
            }`}
          >
            <Coffee className="h-5 w-5" />
            <span className="text-[10px] font-medium">Beans</span>
          </Link>
          <Link
            href="/classes"
            className={`flex flex-col items-center gap-1 ${
              pathname.startsWith('/classes') ? 'text-amber-600' : 'hover:text-gray-900'
            }`}
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-[10px] font-medium">Classes</span>
          </Link>
          <Link
            href="/bookmark"
            className={`flex flex-col items-center gap-1 ${
              pathname.startsWith('/bookmark') ? 'text-amber-600' : 'hover:text-gray-900'
            }`}
          >
            <Bookmark className="h-5 w-5" />
            <span className="text-[10px] font-medium">Saved</span>
          </Link>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="flex flex-col items-center gap-1 hover:text-gray-900"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] font-medium">Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              className={`flex flex-col items-center gap-1 ${
                pathname.startsWith('/login') ? 'text-amber-600' : 'hover:text-gray-900'
              }`}
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] font-medium">My</span>
            </Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center space-x-4 md:flex">
          <Button variant="ghost" size="icon" aria-label="저장된 원두 및 클래스 북마크 보기">
            <Bookmark className="h-5 w-5" />
          </Button>

          {isAuthenticated ? (
            <Button variant="ghost" size="icon" onClick={logout} aria-label="로그아웃">
              <LogOut className="h-5 w-5" />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon">
              <Link href="/login" aria-label="로그인 및 내 정보 확인">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
