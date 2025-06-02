import Link from 'next/link';
import { usePathname } from "next/navigation";
import {
Briefcase,
CalendarCheck,
} from 'lucide-react';

const ServiceProviderSideBar = () => {
    const pathname = usePathname();
const menuItems = [
    {
        href: '/service-provider/services',
        label: 'My Services',
        icon: <Briefcase className="h-5 w-5" />,
    },
    {
        href: '/service-provider/bookings',
        label: 'Bookings',
        icon: <CalendarCheck className="h-5 w-5" />,
    },
];

return (
    <aside className="w-64 pt-8 min-h-screen bg-gray-900 text-white flex flex-col p-4 shadow-lg">
      <nav className="flex flex-col gap-2">
        {menuItems.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-2 rounded transition-colors duration-150 ${
              pathname.startsWith(link.href)
                ? "bg-blue-600 text-white font-semibold"
                : "hover:bg-gray-800 hover:text-blue-300"
            }`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
);
};

export default ServiceProviderSideBar;