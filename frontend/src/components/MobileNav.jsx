import { NavLink } from "react-router-dom";

export default function MobileNav({ items }) {
  return (
    <nav className="fixed bottom-6 inset-x-0 px-6 md:hidden">
      <div className="card-glass rounded-2xl px-4 py-3 flex justify-between">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `text-xs font-semibold uppercase tracking-widest ${
                isActive ? "text-sand-300" : "text-slate-400"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}