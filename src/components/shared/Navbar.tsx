"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  HeartHandshake,
  LogIn,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ShoppingCart,
  Heart,
  ShoppingBag,
  BookOpen,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { UniversalSearchBar } from "./UniversalSearchBar";
import { useLanguageStore } from "@/store/useLanguageStore";
import { useGetMe, useLogout } from "@/hooks/useAuth";
import { useCartStore, useWishlistStore } from "@/store";
import { getDefaultDashboardRoute } from "@/proxy";
import logo from "../../assets/logo/Version 3- Multi transparent.png";
import logoDark from "../../assets/logo/white-version.png";

export function Navbar() {
  const pathname = usePathname();
  const { data: user } = useGetMe();
  const { logout } = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cartItems = useCartStore((s) => s.items);
  const wishlistItems = useWishlistStore((s) => s.items);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  const dashboardRoute = getDefaultDashboardRoute(user?.role);
  const { t } = useLanguageStore();
  const logoTitle = t("nav.logoTitle");
  const logoSubTitle = t("nav.logoSubTitle");
  const borrowTitle = t("common.borrow");

  const navLinks = [
    { label: t("nav.home"), href: "/" },
    { label: t("nav.books"), href: "/books" },
    { label: t("nav.events"), href: "/events" },
    ...(!user ? [{ label: t("nav.trackOrder"), href: "/track-order" }] : []),
    { label: t("nav.about"), href: "/about" },
    { label: t("nav.contact"), href: "/contact" },
    { label: t("nav.gallery"), href: "/gallery" },
    { label: t("nav.publications"), href: "/publications" },
  ];

  return (
    <>
      {/* 2-Tier Sticky/Fixed Navbar with backdrop blur */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full transition-colors bg-white/95 dark:bg-background backdrop-blur-md shadow-md border-b border-border/70">
        {/* Tier 1: Main Header (Logo, Universal Search Bar, Controls, Auth) */}
        <div className="border-b border-border/50 px-4 sm:px-6 lg:px-8 py-2.5">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 sm:gap-6">
            {/* Brand Logo & Title */}
            <Link
              href="/"
              className="flex items-center space-x-2.5 shrink-0 group"
            >
              <div className="flex h-11 w-11 items-center justify-center">
                {/* Light Mode Logo */}
                <Image
                  src={logo}
                  alt="RUIL Logo"
                  priority
                  className="h-10 w-10 object-contain dark:hidden"
                />
                {/* Dark Mode Logo */}
                <Image
                  src={logoDark}
                  alt="RUIL Logo"
                  priority
                  className="hidden h-10 w-10 object-contain dark:block"
                />
              </div>

              <div className="hidden sm:block">
                <span className="text-base sm:text-lg font-black tracking-tight text-[#004F32] dark:text-emerald-400 block leading-tight">
                  {logoTitle}
                </span>
                <span className="text-[10px] font-bold text-[#C78700] dark:text-amber-400 tracking-wider uppercase block">
                  {logoSubTitle}
                </span>
              </div>
            </Link>

            {/* Universal Search Bar (Centered desktop & tablet) */}
            <div className="hidden md:flex flex-1 max-w-xl mx-2 lg:mx-6">
              <UniversalSearchBar />
            </div>

            {/* Right Action Controls: Language, Theme, Wishlist, Cart, Login/Profile */}
            <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
              <div className="hidden sm:block">
                <LanguageSwitcher />
              </div>
              <ThemeToggle />

              {/* Wishlist Link & Badge */}
              <Link
                href="/wishlist"
                aria-label="Wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
                title="Wishlist"
              >
                <Heart className="h-4.5 w-4.5 text-[#004F32] dark:text-emerald-400" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C78700] text-[9px] font-black text-white leading-none shadow-xs">
                    {wishlistCount > 9 ? "9+" : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Link & Badge */}
              <Link
                href="/cart"
                aria-label="Shopping Cart"
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card hover:bg-muted text-foreground transition-colors"
                title="Cart"
              >
                <ShoppingCart className="h-4.5 w-4.5 text-[#004F32] dark:text-emerald-400" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C78700] text-[9px] font-black text-white leading-none shadow-xs">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown or Sign In / Sign Up CTA */}
              {user ? (
                <div className="relative pl-1 sm:pl-2">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 rounded-xl border border-border bg-card hover:bg-muted px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors cursor-pointer"
                  >
                    <div className="h-6 w-6 rounded-full overflow-hidden bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[12px] font-bold text-[#004F32] dark:text-emerald-400 shrink-0 border border-[#004F32] dark:border-emerald-400">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : user.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        "U"
                      )}
                    </div>
                    <span className="max-w-[90px] sm:max-w-[110px] truncate hidden sm:inline">
                      {user.name || "My Account"}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-card border border-border py-2 shadow-2xl z-50 animate-in fade-in-50 text-foreground">
                      <div className="px-4 py-2 border-b border-border text-xs">
                        <p className="font-bold truncate text-foreground">
                          {user.name}
                        </p>
                        <p className="text-muted-foreground text-[10px] truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href={dashboardRoute}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2.5 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>Control Dashboard</span>
                      </Link>
                      <Link
                        href="/cart"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 text-primary" />
                        <span>My Cart ({cartCount})</span>
                      </Link>
                      <Link
                        href="/wishlist"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 text-xs font-medium hover:bg-muted transition-colors"
                      >
                        <Heart className="h-4 w-4 text-rose-500" />
                        <span>My Wishlist ({wishlistCount})</span>
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors border-t border-border mt-1 cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-1.5 pl-1">
                  <Link
                    href="/login"
                    className="flex items-center space-x-1.5 rounded-xl bg-[#004F32] hover:bg-[#003d27] dark:bg-emerald-700 dark:hover:bg-emerald-600 px-3 sm:px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors"
                  >
                    <LogIn className="h-3.5 w-3.5 text-amber-300" />
                    <span>Login</span>
                  </Link>
                </div>
              )}

              {/* Mobile hamburger menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-xl border border-border/80 bg-muted/50 text-foreground lg:hidden hover:bg-muted transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
                ) : (
                  <Menu className="h-5 w-5 text-[#004F32] dark:text-emerald-400" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Row (visible on small screens < md) */}
          <div className="mt-2.5 md:hidden">
            <UniversalSearchBar />
          </div>
        </div>

        {/* Tier 2: Bottom Navigation Bar (All Category Links & Donate CTA) */}
        <div className="hidden lg:block px-4 sm:px-6 lg:px-8 py-1.5 bg-gray-50/80 dark:bg-background">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <nav className="flex items-center space-x-1 xl:space-x-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isActive
                        ? "text-[#004F32] dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/70 font-bold"
                        : "text-muted-foreground hover:text-[#C78700] hover:bg-card"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center space-x-3">
              <Link
                href="/books?type=BORROW_ONLY"
                className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#004F32] dark:text-emerald-400" />
                <span className="text-[#004F32] dark:text-emerald-400">
                  {borrowTitle}
                </span>
              </Link>

              <Link
                href="/donate"
                className="flex items-center space-x-1.5 rounded-full bg-[#004F32] dark:bg-emerald-600 dark:hover:bg-emerald-700 px-3.5 py-1 text-xs font-bold text-white shadow-xs transition-colors"
              >
                <HeartHandshake className="h-3.5 w-3.5 text-amber-300" />
                <span>{t("nav.donate")}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/70 bg-card px-4 py-3 space-y-1 animate-in fade-in-50 text-foreground">
            <div className="pb-2 mb-2 border-b border-border/60 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">
                নেভিগেশন মেন্যু
              </span>
              <LanguageSwitcher />
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
                  pathname === link.href
                    ? "bg-primary text-primary-foreground font-bold"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/donate"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-[#004F32] dark:text-emerald-400 hover:bg-muted rounded-xl"
            >
              <HeartHandshake className="h-4 w-4 text-amber-500" />
              <span>{t("nav.donate")}</span>
            </Link>

            {user ? (
              <>
                <Link
                  href={dashboardRoute}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-foreground hover:bg-muted rounded-xl"
                >
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Dashboard ({user.role})</span>
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left flex items-center space-x-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-xs font-bold text-primary hover:bg-muted rounded-xl"
              >
                <LogIn className="h-4 w-4 text-amber-500" />
                <span>Login / Register</span>
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Spacer so page content begins below the 2-tier fixed header without overlapping */}
      <div className="h-[105px] sm:h-[110px] lg:h-[102px]" aria-hidden="true" />
    </>
  );
}

export default Navbar;
