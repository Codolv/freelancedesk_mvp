"use client";

import Link from "next/link";
import { useT } from "@/lib/i18n/client";

export function ClientSidebarNav({ items }: { items: Array<{ href: string; key: string }> }) {
	const { t } = useT();
	return (
		<nav className="grid gap-1">
			{items.map((item) => (
				<Link key={item.href} href={item.href} className="px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
					{t(item.key)}
				</Link>
			))}
		</nav>
	);
}
