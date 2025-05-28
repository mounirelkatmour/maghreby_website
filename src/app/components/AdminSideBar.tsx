import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShieldUser,
  Star,
  Briefcase,
  Store,
} from "lucide-react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  {
    href: "/admin/service-provider-requests",
    label: "Service Provider Requests",
    icon: ShieldUser,
  },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/marketplace", label: "Marketplace", icon: Store },
];

export default function AdminSideBar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 pt-24 min-h-screen bg-gray-900 text-white flex flex-col p-6 shadow-lg">
      <nav className="flex flex-col gap-2">
        {adminLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2 rounded transition-colors duration-150 ${
              pathname.startsWith(link.href)
                ? "bg-blue-600 text-white font-semibold"
                : "hover:bg-gray-800 hover:text-blue-300"
            }`}
          >
            {link.icon && <link.icon className="w-5 h-5" />}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
