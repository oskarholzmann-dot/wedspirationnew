"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";
import { ApplicationLogo } from "./application-logo";
import { HamburgerButton, NavLink, ResponsiveNavLink, responsiveNavLinkClasses, useIsActive } from "./nav-links";

export function AppNavigation({ user }: { user: { name: string; email: string; isAdmin: boolean } }) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdown = useRef<HTMLDivElement>(null);
  const isActive = useIsActive();

  // Close the settings dropdown on a click anywhere else
  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!dropdown.current?.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const links = [
    { href: "/dashboard", label: "My folder", active: isActive("/dashboard") },
    { href: "/photos/create", label: "Upload photo", active: isActive("/photos/create") },
    { href: "/gallery", label: "Gallery", active: isActive("/gallery") },
    ...(user.isAdmin ? [{ href: "/admin", label: "Admin", active: isActive("/admin") }] : []),
  ];

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="shrink-0 flex items-center">
              <Link href="/dashboard" aria-label="My folder">
                <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800" />
              </Link>
            </div>

            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
              {links.map((link) => (
                <NavLink key={link.href} href={link.href} active={link.active}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center sm:ms-6">
            <div className="relative" ref={dropdown}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
              >
                <div>{user.name}</div>
                <div className="ms-1">
                  <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 z-50 mt-2 w-48 rounded-md shadow-lg">
                  <div className="rounded-md ring-1 ring-black/5 py-1 bg-white">
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
                    >
                      Profile
                    </Link>
                    <form action={logout}>
                      <button
                        type="submit"
                        className="block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out"
                      >
                        Log Out
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
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

          <div className="pt-4 pb-1 border-t border-gray-200">
            <div className="px-4">
              <div className="font-medium text-base text-gray-800">{user.name}</div>
              <div className="font-medium text-sm text-gray-500">{user.email}</div>
            </div>

            <div className="mt-3 space-y-1">
              <ResponsiveNavLink href="/profile">Profile</ResponsiveNavLink>
              <form action={logout}>
                <button type="submit" className={responsiveNavLinkClasses()}>
                  Log Out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
