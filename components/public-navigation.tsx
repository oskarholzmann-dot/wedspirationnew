"use client";

import Link from "next/link";
import { useState } from "react";
import { logout } from "@/app/actions/auth";
import { HamburgerButton, NavLink, ResponsiveNavLink, responsiveNavLinkClasses, useIsActive } from "./nav-links";

export function PublicNavigation({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const isActive = useIsActive();

  const links = [
    { href: "/", label: "Home", active: isActive("/") },
    { href: "/gallery", label: "Gallery", active: isActive("/gallery") },
    ...(isLoggedIn
      ? [{ href: "/dashboard", label: "My folder", active: isActive("/dashboard", ["/dashboard", "/folders", "/photos"]) }]
      : []),
    { href: "/about", label: "About", active: isActive("/about") },
    { href: "/contact", label: "Contact", active: isActive("/contact") },
  ];

  return (
    <nav className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="shrink-0 flex items-center font-serif text-2xl text-stone-900">
              Wedspiration
            </Link>

            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
              {links.map((link) => (
                <NavLink key={link.href} href={link.href} active={link.active}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Login / Register, or Log out when logged in ("My folder" is in the links on the left) */}
          <div className="hidden sm:flex sm:items-center sm:gap-4 text-sm">
            {isLoggedIn ? (
              <form action={logout}>
                <button type="submit" className="text-stone-600 hover:text-stone-900">
                  Log out
                </button>
              </form>
            ) : (
              <>
                <Link href="/login" className="text-stone-600 hover:text-stone-900">
                  Log in
                </Link>
                <Link href="/register" className="rounded-md bg-stone-900 px-4 py-2 text-white hover:bg-stone-700">
                  Register
                </Link>
              </>
            )}
          </div>

          <div className="-me-2 flex items-center sm:hidden">
            <HamburgerButton open={open} onToggle={() => setOpen(!open)} />
          </div>
        </div>
      </div>

      {open && (
        <div className="sm:hidden" onClick={() => setOpen(false)}>
          <div className="pt-2 pb-3 space-y-1">
            {links.map((link) => (
              <ResponsiveNavLink key={link.href} href={link.href} active={link.active}>
                {link.label}
              </ResponsiveNavLink>
            ))}
          </div>

          <div className="pt-4 pb-3 border-t border-stone-200 space-y-1">
            {isLoggedIn ? (
              <form action={logout}>
                <button type="submit" className={responsiveNavLinkClasses()}>
                  Log out
                </button>
              </form>
            ) : (
              <>
                <ResponsiveNavLink href="/login">Log in</ResponsiveNavLink>
                <ResponsiveNavLink href="/register">Register</ResponsiveNavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
